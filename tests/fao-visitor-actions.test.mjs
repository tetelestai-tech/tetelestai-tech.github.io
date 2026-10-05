import test from 'node:test';
import assert from 'node:assert/strict';

let actions = {};
try { actions = await import('../src/fao-preview/visitor-actions.js'); }
catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND' || error.url !== new URL('../src/fao-preview/visitor-actions.js', import.meta.url).href) throw error;
}

function call(name, ...args) {
  assert.equal(typeof actions[name], 'function', `${name} must be implemented`);
  return actions[name](...args);
}

const seed = Object.freeze([
  Object.freeze({ id: 'opala', make: 'Chevrolet', title: 'Opala SS', year: 1976, trim: '4.1 · 6 cilindros', status: 'reserved' }),
  Object.freeze({ id: 'f100', make: 'Ford', title: 'F-100', year: 1975, trim: 'V8 · automático', status: 'sold' }),
  Object.freeze({ id: 'mustang', make: 'Ford', title: 'Mustang', year: 1995, trim: '3.8 V6 · manual', status: 'showcase' }),
  Object.freeze({ id: 'speedster', make: 'Chamonix', title: 'Speedster', year: 2023, trim: '1.6 · réplica', status: 'showcase' }),
]);
const base = 'https://tetelestai.tech/sites/faoclassicos/';

test('vehicle contacts distinguish sold, reserved and showcase without asserting live stock', () => {
  for (const [status, label, intent] of [
    ['showcase', 'Conversar sobre este clássico', /disponibilidade/i],
    ['reserved', 'Consultar disponibilidade', /disponibilidade/i],
    ['sold', 'Procuro um semelhante', /semelhante/i],
  ]) {
    const contact = call('getVehicleContact', { ...seed[0], status });
    assert.equal(contact.label, label);
    assert.match(contact.message, /prévia/i);
    assert.match(contact.message, /Chevrolet Opala SS 1976/);
    assert.match(contact.message, intent);
  }
});

test('vehicle names with URL delimiters remain inside the WhatsApp message', () => {
  const contact = call('getVehicleContact', { ...seed[0], make: 'A & B', title: 'Modelo? #1' });
  const url = new URL(contact.url);
  assert.equal(url.origin + url.pathname, 'https://api.whatsapp.com/send');
  assert.equal(url.searchParams.get('phone'), '5561998631878');
  assert.equal(url.searchParams.get('text'), contact.message);
  assert.deepEqual([...url.searchParams.keys()], ['phone', 'text']);
  assert.equal(url.hash, '');
  assert.match(contact.message, /A & B Modelo\? #1 1976/);
});

test('share URLs keep only the base origin and path plus the known vehicle ID', () => {
  assert.equal(call('getVehicleShareUrl', seed[0], seed, `${base}?old=1&veiculo=mustang#selecao`), `${base}?veiculo=opala`);
  assert.equal(call('getVehicleShareUrl', seed[1], seed, 'http://localhost:5173/demo/?old=1#top'), 'http://localhost:5173/demo/?veiculo=f100');
});

test('local and unknown vehicles never acquire a public share URL', () => {
  for (const car of [{ id: 'unknown' }, { id: 'local-12345678' }, { id: '' }, {}, null]) {
    assert.equal(call('getVehicleShareUrl', car, seed, base), null);
  }
  const local = { id: 'local-12345678' };
  assert.equal(call('getVehicleShareUrl', local, [...seed, local], base), null);
  for (const url of ['not a URL', '/relative/', 'javascript:alert(1)', 'file:///tmp/demo']) {
    assert.equal(call('getVehicleShareUrl', seed[0], seed, url), null);
  }
});

test('requested vehicle IDs resolve only one exact known query parameter', () => {
  assert.equal(call('getRequestedVehicleId', `${base}?veiculo=opala#selecao`, seed), 'opala');
  assert.equal(call('getRequestedVehicleId', `${base}?other=x&veiculo=mustang`, seed), 'mustang');
  for (const suffix of ['', '?veiculo=', '?veiculo=unknown', '?veiculo=local-12345678', '?veiculo=opala&veiculo=opala', '?veiculo=opala&%76eiculo=f100', '?veiculo=%20opala', '?veiculo=OPALA', '#veiculo=opala']) {
    assert.equal(call('getRequestedVehicleId', base + suffix, seed), null, suffix);
  }
  for (const href of ['not a URL', 'javascript:alert(1)?veiculo=opala', null]) {
    assert.equal(call('getRequestedVehicleId', href, seed), null);
  }
  assert.equal(call('getRequestedVehicleId', `${base}?veiculo=local-12345678`, [...seed, { id: 'local-12345678' }]), null);
});

test('default filtering returns a new array without reordering the catalogue', () => {
  const result = call('filterVehicles', seed);
  assert.notEqual(result, seed);
  assert.deepEqual(result.map(car => car.id), ['opala', 'f100', 'mustang', 'speedster']);
  assert.equal(result[0], seed[0]);
});

test('search finds normalized make, title, year and trim independently', () => {
  for (const [search, ids] of [
    [' cheVROLET ', ['opala']], ['Mustang', ['mustang']], ['1975', ['f100']],
    ['AUTOMATICO', ['f100']], ['replica', ['speedster']], ['não existe', []],
  ]) assert.deepEqual(call('filterVehicles', seed, { search }).map(car => car.id), ids, search);
});

test('brand and availability filters combine with search using AND', () => {
  assert.deepEqual(call('filterVehicles', seed, { search: 'V', brand: 'Ford', status: 'showcase' }).map(car => car.id), ['mustang']);
  assert.deepEqual(call('filterVehicles', seed, { brand: 'Ford', status: 'reserved' }), []);
  assert.deepEqual(call('filterVehicles', seed, { status: 'reserved' }).map(car => car.id), ['opala']);
  assert.deepEqual(call('filterVehicles', seed, { status: 'sold' }).map(car => car.id), ['f100']);
  for (const status of ['unknown', 'all', null, 1]) assert.deepEqual(call('filterVehicles', seed, { status }), []);
});

test('year sorting never mutates the saved catalogue order', () => {
  assert.deepEqual(call('filterVehicles', seed, { sort: 'oldest' }).map(car => car.id), ['f100', 'opala', 'mustang', 'speedster']);
  assert.deepEqual(call('filterVehicles', seed, { sort: 'newest' }).map(car => car.id), ['speedster', 'mustang', 'opala', 'f100']);
  assert.deepEqual(seed.map(car => car.id), ['opala', 'f100', 'mustang', 'speedster']);
  assert.deepEqual(call('filterVehicles', seed, { brand: 'Ford', sort: 'newest' }).map(car => car.id), ['mustang', 'f100']);
});

test('inquiry builds an encoded question and preserves meaningful detail line breaks', () => {
  const result = call('buildInquiryContact', { model: ' Opala & Caravan? #1 ', details: '  Até 1980\nCor: azul & branco.  ' });
  assert.equal(result.ok, true);
  assert.match(result.message, /FAO.*ajudar.*encontrar/i);
  assert.match(result.message, /Opala & Caravan\? #1/);
  assert.match(result.message, /Até 1980\nCor: azul & branco\./);
  assert.match(result.message, /\?/);
  const url = new URL(result.url);
  assert.equal(url.origin + url.pathname, 'https://api.whatsapp.com/send');
  assert.equal(url.searchParams.get('phone'), '5561998631878');
  assert.equal(url.searchParams.get('text'), result.message);
  assert.deepEqual([...url.searchParams.keys()], ['phone', 'text']);
  assert.equal(url.hash, '');
});

test('inquiry requires a trimmed model while details remain optional', () => {
  for (const input of [{ model: '  Opala  ' }, { model: 'Opala', details: '' }, { model: 'Opala', details: '   ' }]) {
    const result = call('buildInquiryContact', input);
    assert.equal(result.ok, true);
    assert.doesNotMatch(result.message, /undefined|null/);
  }
  const throwing = { toString() { throw new Error('Objects must not be coerced'); } };
  for (const input of [{}, { model: '' }, { model: '   ' }, { model: null }, { model: 1976 }, { model: throwing }, { model: 'Opala', details: null }, { model: 'Opala', details: throwing }]) {
    const result = call('buildInquiryContact', input);
    assert.equal(result.ok, false);
    assert.ok(result.error);
    assert.equal(result.url, undefined);
  }
});

test('inquiry enforces model and detail limits after trimming', () => {
  assert.equal(call('buildInquiryContact', { model: ` ${'a'.repeat(100)} `, details: ` ${'b'.repeat(400)} ` }).ok, true);
  for (const input of [{ model: 'a'.repeat(101) }, { model: 'Opala', details: 'b'.repeat(401) }]) {
    const result = call('buildInquiryContact', input);
    assert.equal(result.ok, false);
    assert.ok(result.error);
  }
});

test('inquiry rejects control characters instead of silently stripping them', () => {
  for (const char of ['\0', '\t', '\x0b', '\x1f', '\x7f', '\x85']) {
    assert.equal(call('buildInquiryContact', { model: `${char}Opala` }).ok, false);
    assert.equal(call('buildInquiryContact', { model: 'Opala', details: `Detalhe${char}` }).ok, false);
  }
  for (const char of ['\n', '\r']) assert.equal(call('buildInquiryContact', { model: `Opala${char}` }).ok, false);
  assert.equal(call('buildInquiryContact', { model: 'Opala', details: 'Azul\r\nManual' }).ok, true);
});
