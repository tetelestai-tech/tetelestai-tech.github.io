import test from 'node:test';
import assert from 'node:assert/strict';
import { vehicles as seed } from '../src/fao-preview/data.js';
import {
  INVENTORY_KEY, readInventory, persistInventory, normalizeVehicleStatus,
} from '../src/fao-preview/vehicle-store.js';
const key = 'fao-preview-v1';
const png = 'data:image/png;base64,iVBORw0KGgo=';
const blankSpecs = { engine: '', transmission: '', fuel: '', color: '', mileage: '' };
const localCar = {
  id: 'local-12345678-abcd', make: 'Porsche', title: '911 Carrera', trim: '3.2 manual',
  year: 1986, price: 'Consulte', description: 'Veículo cadastrado nesta prévia.',
  status: 'reserved', photos: [png], source: null, ...blankSpecs,
};

function memoryStorage(value = null) {
  const values = new Map([
    ['fao-preview-stamp-v1', '{"src":"sold-custom"}'],
    ['fao-preview-reserved-stamp-v1', '{"src":"reserved-custom"}'],
    ['unrelated', 'preserve'],
  ]);
  if (value !== null) values.set(key, value);
  const reads = [], writes = [];
  return {
    values, reads, writes,
    getItem(name) { reads.push(name); return values.get(name) ?? null; },
    setItem(name, value) { writes.push([name, value]); values.set(name, value); },
  };
}

function assertInvalidList(cars) {
  const storage = memoryStorage(JSON.stringify({ version: 2, vehicles: seed }));
  const before = new Map(storage.values);
  assert.deepEqual(persistInventory(storage, cars, seed), { ok: false, error: 'invalid' });
  assert.deepEqual(storage.values, before);
  assert.deepEqual(storage.writes, []);
}

test('an absent inventory returns independent seed copies without writing', () => {
  const storage = memoryStorage();
  const result = readInventory(storage, seed);
  assert.deepEqual(result, { cars: seed, error: null });
  result.cars[0].photos.push(png);
  result.cars[0].title = 'Only this result';
  assert.equal(seed[0].title, 'Speedster');
  assert.equal(seed[0].photos.length, 3);
  assert.deepEqual(storage.reads, [key]);
  assert.deepEqual(storage.writes, []);
});

test('legacy snapshots preserve edits and status while filling absent seed fields', () => {
  const snapshots = [
    { id: 'speedster', title: 'Speedster editado', price: 'R$ 123', description: 'Texto salvo.', photos: [png], status: 'sold', source: 'javascript:alert(1)' },
    { id: 'gol', make: 'VW', trim: 'Versão salva', year: 1992, status: 'reserved' },
  ];
  const storage = memoryStorage(JSON.stringify(snapshots));
  const before = new Map(storage.values);
  const result = readInventory(storage, seed);
  assert.equal(result.error, null);
  assert.deepEqual(result.cars[0], { ...seed[0], ...blankSpecs, title: 'Speedster editado', price: 'R$ 123', description: 'Texto salvo.', photos: [png], status: 'sold' });
  assert.deepEqual(result.cars[1], { ...seed[1], ...blankSpecs, make: 'VW', trim: 'Versão salva', year: 1992, status: 'reserved' });
  assert.deepEqual(result.cars.slice(2), seed.slice(2));
  assert.deepEqual(storage.values, before);
  assert.deepEqual(storage.writes, []);
});

test('an empty legacy snapshot restores references without acting as a deletion', () => {
  assert.deepEqual(readInventory(memoryStorage('[]'), seed), { cars: seed, error: null });
});

test('new local records persist in the existing key and reload with all editable fields', () => {
  const storage = memoryStorage();
  const result = persistInventory(storage, [...seed, localCar], seed);
  assert.deepEqual(result, { ok: true, cars: [...seed, localCar] });
  assert.equal(INVENTORY_KEY, key);
  assert.deepEqual(JSON.parse(storage.values.get(key)), { version: 2, vehicles: [...seed, localCar] });
  assert.deepEqual(readInventory(storage, seed), { cars: [...seed, localCar], error: null });
  assert.deepEqual(storage.writes.map(([name]) => name), [key]);
  assert.equal(storage.values.get('fao-preview-stamp-v1'), '{"src":"sold-custom"}');
  assert.equal(storage.values.get('fao-preview-reserved-stamp-v1'), '{"src":"reserved-custom"}');
  assert.equal(storage.values.get('unrelated'), 'preserve');
});

test('repeated edits retain identity and never duplicate a local car', () => {
  const storage = memoryStorage();
  assert.equal(persistInventory(storage, [...seed, localCar], seed).ok, true);
  for (const title of ['Primeira edição', 'Segunda edição']) {
    const { cars } = readInventory(storage, seed);
    const next = cars.map(car => car.id === localCar.id ? { ...car, title, status: 'sold' } : car);
    assert.equal(persistInventory(storage, next, seed).ok, true);
  }
  const result = readInventory(storage, seed);
  assert.equal(result.cars.length, 6);
  assert.deepEqual(result.cars[5], { ...localCar, title: 'Segunda edição', status: 'sold' });
});

test('reference and local deletions remain deleted after reload, including an empty inventory', () => {
  const storage = memoryStorage();
  for (const next of [[...seed.slice(1), localCar], seed.slice(1), []]) {
    assert.equal(persistInventory(storage, next, seed).ok, true);
    assert.deepEqual(readInventory(storage, seed), { cars: next, error: null });
  }
  assert.equal(storage.values.get(key), '{"version":2,"vehicles":[]}');
});

test('source links come only from the matching trusted reference and locals never inherit them', () => {
  const input = [
    { ...seed[0], source: 'https://untrusted.invalid/car', extra: 'discard' },
    { ...localCar, source: seed[0].source },
  ];
  const expected = [seed[0], localCar];
  const storage = memoryStorage(JSON.stringify({ version: 2, vehicles: input }));
  assert.deepEqual(readInventory(storage, seed), { cars: expected, error: null });
  assert.deepEqual(persistInventory(storage, input, seed), { ok: true, cars: expected });
  assert.deepEqual(JSON.parse(storage.values.get(key)).vehicles, expected);
});

test('normalization only recognizes the exact sold and reserved statuses', () => {
  for (const [input, expected] of [['sold', 'sold'], ['reserved', 'reserved'], ['showcase', 'showcase']]) {
    assert.equal(normalizeVehicleStatus(input), expected);
  }
  for (const value of ['SOLD', 'available', '', null, undefined, 1, {}, ['sold'], '__proto__']) {
    assert.equal(normalizeVehicleStatus(value), 'showcase');
  }
  assert.deepEqual(persistInventory(memoryStorage(), [{ ...localCar, status: 'SOLD' }], seed), {
    ok: true, cars: [{ ...localCar, status: 'showcase' }],
  });
});

test('only known reference assets and bounded raster data URLs can be vehicle photos', () => {
  for (const photo of [...seed.flatMap(car => car.photos), png, 'data:image/jpeg;base64,AAAA', 'data:image/webp;base64,AAAA']) {
    assert.equal(persistInventory(memoryStorage(), [{ ...localCar, photos: [photo] }], seed).ok, true);
  }
  for (const photo of [
    'javascript:alert(1)', 'https://example.com/car.jpg', '//example.com/car.jpg',
    './assets/unknown.webp', './assets/sold-stamp.png', './assets/../car.webp',
    'data:image/svg+xml;base64,PHN2Zz4=', 'data:text/html;base64,AAAA',
    'data:image/png,hello', 'data:image/png;base64,', 'data:image/png;base64,AAA',
    'data:image/png;base64,A===', 'data:image/png;base64,AA=A',
    'data:image/png;base64,AA A', 'data:image/png;base64,AAAA\n',
    'data:image/png;base64,' + 'A'.repeat(2000000), 42, null, {},
  ]) assertInvalidList([{ ...localCar, photos: [photo] }]);
  for (const photos of [null, '', [], Array(9).fill(png), [png, null]]) {
    assertInvalidList([{ ...localCar, photos }]);
  }
  assert.equal(persistInventory(memoryStorage(), [{ ...localCar, photos: Array(8).fill(png) }], seed).ok, true);
});

test('required text fields and year enforce their type and boundaries without truncation', () => {
  for (const [field, max] of [['make', 50], ['title', 70], ['trim', 90], ['price', 35], ['description', 650]]) {
    for (const value of [undefined, null, 0, {}, [], '', '  ', 'a'.repeat(max + 1)]) {
      assertInvalidList([{ ...localCar, [field]: value }]);
    }
    assert.equal(persistInventory(memoryStorage(), [{ ...localCar, [field]: 'a'.repeat(max) }], seed).ok, true);
  }
  for (const year of [undefined, null, '1986', 1885, new Date().getFullYear() + 2, 1986.5, NaN, Infinity]) {
    assertInvalidList([{ ...localCar, year }]);
  }
  for (const year of [1886, new Date().getFullYear() + 1]) {
    assert.equal(persistInventory(memoryStorage(), [{ ...localCar, year }], seed).ok, true);
  }
});

test('a malformed record, duplicate identity or invalid ID rejects the whole write', () => {
  for (const cars of [null, {}, 'cars', [null], [1], [[]], [localCar, localCar], [seed[0], seed[0]]]) assertInvalidList(cars);
  for (const id of [null, 1, '', 'unknown', 'local-1234567', 'local-' + 'a'.repeat(81), 'local-12345678/../', 'local-12345678"']) {
    assertInvalidList([{ ...localCar, id }]);
  }
  assertInvalidList([seed[0], { ...localCar, title: '' }]);
  assertInvalidList([Object.create(localCar)]);
  const accessorCar = { ...localCar };
  Object.defineProperty(accessorCar, 'title', { get() { throw new Error('Accessors must not run'); } });
  assertInvalidList([accessorCar]);
});

test('corrupt and unknown storage formats fail closed with seed copies and preserve the original value', () => {
  for (const raw of [
    '', '{broken', 'null', '42', '"cars"', '{}', '{"version":1,"vehicles":[]}',
    '{"version":3,"vehicles":[]}', '{"version":2,"vehicles":null}',
    JSON.stringify({ version: 2, vehicles: [seed[0], { ...localCar, title: '' }] }),
    JSON.stringify({ version: 2, vehicles: [localCar, localCar] }),
    JSON.stringify({ version: 2, vehicles: [{ ...localCar, photos: ['https://example.com/car.png'] }] }),
    '[null]', '[false]', '[{}]', '[{"id":"unknown"}]',
    '[{"id":"gol","title":42}]', '[{"id":"gol","photos":[]}]',
    '[{"id":"gol"},{"id":"gol"}]',
  ]) {
    const storage = memoryStorage(raw);
    const result = readInventory(storage, seed);
    assert.deepEqual(result, { cars: seed, error: 'invalid' }, raw);
    assert.notEqual(result.cars, seed);
    assert.notEqual(result.cars[0].photos, seed[0].photos);
    assert.equal(storage.values.get(key), raw);
    assert.deepEqual(storage.writes, []);
  }
});

test('an unavailable storage read is distinct from an invalid inventory', () => {
  for (const storage of [undefined, null, { getItem() { throw new Error('SecurityError'); } }]) {
    assert.deepEqual(readInventory(storage, seed), { cars: seed, error: 'unavailable' });
  }
});

test('quota failure reports no success and leaves the previous inventory and stamp settings intact', () => {
  const storage = memoryStorage(JSON.stringify({ version: 2, vehicles: seed }));
  const before = new Map(storage.values);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  const input = structuredClone([...seed, localCar]);
  assert.deepEqual(persistInventory(storage, input, seed), { ok: false, error: 'unavailable' });
  assert.deepEqual(storage.values, before);
  assert.deepEqual(input, [...seed, localCar]);
  assert.deepEqual(persistInventory(undefined, [localCar], seed), { ok: false, error: 'unavailable' });
});

test('successful saves return independent records and photos instead of retaining mutable input', () => {
  const input = structuredClone([localCar]);
  const storage = memoryStorage();
  const result = persistInventory(storage, input, seed);
  assert.equal(result.ok, true);
  result.cars[0].photos.push(seed[0].photos[0]);
  result.cars[0].title = 'Changed later';
  assert.deepEqual(input, [localCar]);
  assert.deepEqual(readInventory(storage, seed), { cars: [localCar], error: null });
});

test('a stale tab edit cannot resurrect a reference deleted by another tab', () => {
  const storage = memoryStorage(JSON.stringify({ version: 2, vehicles: seed }));
  const baseline = storage.getItem(key);
  const staleCars = readInventory(storage, seed).cars;
  assert.equal(persistInventory(storage, seed.slice(1), seed, baseline).ok, true);
  const afterDelete = new Map(storage.values);
  const writeCount = storage.writes.length;
  const staleEdit = staleCars.map(car => car.id === 'gol' ? { ...car, title: 'Gol editado em outra aba' } : car);
  assert.deepEqual(persistInventory(storage, staleEdit, seed, baseline), { ok: false, error: 'stale' });
  assert.deepEqual(storage.values, afterDelete);
  assert.equal(storage.writes.length, writeCount);
  assert.deepEqual(readInventory(storage, seed), { cars: seed.slice(1), error: null });
});

test('a stale tab deletion cannot drop a vehicle created by another tab', () => {
  const storage = memoryStorage(JSON.stringify({ version: 2, vehicles: seed }));
  const baseline = storage.getItem(key);
  const staleCars = readInventory(storage, seed).cars;
  assert.equal(persistInventory(storage, [...seed, localCar], seed, baseline).ok, true);
  const afterCreate = new Map(storage.values);
  const writeCount = storage.writes.length;
  assert.deepEqual(persistInventory(storage, staleCars.slice(1), seed, baseline), { ok: false, error: 'stale' });
  assert.deepEqual(storage.values, afterCreate);
  assert.equal(storage.writes.length, writeCount);
  assert.deepEqual(readInventory(storage, seed), { cars: [...seed, localCar], error: null });
});

test('a refreshed raw baseline allows later saves and an obsolete null baseline is rejected', () => {
  const storage = memoryStorage();
  const first = persistInventory(storage, [localCar], seed, null);
  assert.deepEqual(first, { ok: true, cars: [localCar] });
  const baseline = JSON.stringify({ version: 2, vehicles: first.cars });
  const edited = { ...localCar, title: 'Cadastro atualizado', status: 'sold' };
  const second = persistInventory(storage, [edited], seed, baseline);
  assert.deepEqual(second, { ok: true, cars: [edited] });
  const afterSave = new Map(storage.values);
  assert.deepEqual(persistInventory(storage, [], seed, null), { ok: false, error: 'stale' });
  assert.deepEqual(storage.values, afterSave);
  const refreshed = JSON.stringify({ version: 2, vehicles: second.cars });
  assert.deepEqual(persistInventory(storage, [], seed, refreshed), { ok: true, cars: [] });
  assert.deepEqual(readInventory(storage, seed), { cars: [], error: null });
});

test('an explicitly invalid baseline fails before reading or writing storage', () => {
  for (const baseline of [undefined, false, 42, {}, []]) {
    const storage = memoryStorage();
    const before = new Map(storage.values);
    assert.deepEqual(persistInventory(storage, [localCar], seed, baseline), { ok: false, error: 'invalid' });
    assert.deepEqual(storage.values, before);
    assert.deepEqual(storage.reads, []);
    assert.deepEqual(storage.writes, []);
  }
});

test('an unavailable baseline read prevents the write and preserves inventory and stamps', () => {
  const storage = memoryStorage(JSON.stringify({ version: 2, vehicles: seed }));
  const before = new Map(storage.values);
  storage.getItem = () => { throw new Error('SecurityError'); };
  assert.deepEqual(persistInventory(storage, [localCar], seed, null), { ok: false, error: 'unavailable' });
  assert.deepEqual(storage.values, before);
  assert.deepEqual(storage.writes, []);
});

test('existing v2 and legacy records never inherit newly added seed specifications', () => {
  const reference = { ...seed[0], engine: '1.6', transmission: 'Manual', fuel: 'Gasolina', color: 'Preto', mileage: '' };
  const existing = { ...seed[0], title: 'Exemplar editado', description: 'Características alteradas.', photos: [png] };
  for (const field of Object.keys(blankSpecs)) delete existing[field];
  for (const raw of [JSON.stringify([existing]), JSON.stringify({ version: 2, vehicles: [existing] })]) {
    const storage = memoryStorage(raw);
    assert.deepEqual(readInventory(storage, [reference]), { cars: [{ ...existing, ...blankSpecs }], error: null });
    assert.equal(storage.values.get(key), raw);
    assert.deepEqual(storage.writes, []);
  }
});

test('optional specs round trip and can be cleared without changing other vehicle fields or storage keys', () => {
  const storage = memoryStorage();
  const filled = { ...localCar, engine: ' 3.2 ', transmission: 'Manual', fuel: 'Gasolina', color: 'Prata', mileage: '51.200 km' };
  const saved = { ...filled, engine: '3.2' };
  assert.deepEqual(persistInventory(storage, [filled], seed, null), { ok: true, cars: [saved] });
  assert.deepEqual(readInventory(storage, seed), { cars: [saved], error: null });
  assert.equal(filled.engine, ' 3.2 ');
  const baseline = storage.values.get(key);
  assert.deepEqual(persistInventory(storage, [localCar], seed, baseline), { ok: true, cars: [localCar] });
  assert.deepEqual(JSON.parse(storage.values.get(key)), { version: 2, vehicles: [localCar] });
  assert.deepEqual(storage.writes.map(([name]) => name), [key, key]);
  assert.equal(storage.values.get('fao-preview-stamp-v1'), '{"src":"sold-custom"}');
  assert.equal(storage.values.get('fao-preview-reserved-stamp-v1'), '{"src":"reserved-custom"}');
});

test('invalid optional specifications fail before storage access and do not invoke accessors', () => {
  let accessorReads = 0;
  for (const [field, maxLength] of [['engine', 80], ['transmission', 40], ['fuel', 40], ['color', 50], ['mileage', 40]]) {
    for (const value of [undefined, null, 0, [], {}, 'x'.repeat(maxLength + 1)]) {
      const storage = memoryStorage();
      assert.deepEqual(persistInventory(storage, [{ ...localCar, [field]: value }], seed, null), { ok: false, error: 'invalid' });
      assert.deepEqual(storage.reads, []);
      assert.deepEqual(storage.writes, []);
    }
    const accessorCar = { ...localCar };
    Object.defineProperty(accessorCar, field, { get() { accessorReads++; return ''; } });
    assertInvalidList([accessorCar]);
  }
  assert.equal(accessorReads, 0);
});

test('malformed saved optional specs reject the inventory without overwriting the saved value', () => {
  for (const raw of [
    JSON.stringify([{ id: seed[0].id, engine: 123 }]),
    JSON.stringify({ version: 2, vehicles: [{ ...localCar, color: null }] }),
    JSON.stringify({ version: 2, vehicles: [{ ...localCar, mileage: 'x'.repeat(41) }] }),
  ]) {
    const storage = memoryStorage(raw);
    assert.deepEqual(readInventory(storage, seed), { cars: seed, error: 'invalid' });
    assert.equal(storage.values.get(key), raw);
    assert.deepEqual(storage.writes, []);
  }
});

test('a stale specification edit cannot overwrite a newer specification save', () => {
  const storage = memoryStorage(JSON.stringify({ version: 2, vehicles: [localCar] }));
  const baseline = storage.values.get(key);
  const current = { ...localCar, engine: '3.2', mileage: '51.200 km' };
  assert.equal(persistInventory(storage, [current], seed, baseline).ok, true);
  const afterSave = new Map(storage.values);
  const writeCount = storage.writes.length;
  assert.deepEqual(persistInventory(storage, [{ ...localCar, color: 'Azul' }], seed, baseline), { ok: false, error: 'stale' });
  assert.deepEqual(storage.values, afterSave);
  assert.equal(storage.writes.length, writeCount);
  assert.deepEqual(readInventory(storage, seed), { cars: [current], error: null });
});
