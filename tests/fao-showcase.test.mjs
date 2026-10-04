import test from 'node:test';
import assert from 'node:assert/strict';

const showcase = await import('../src/fao-preview/showcase-settings.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND' && error.url?.endsWith('/showcase-settings.js')) return {};
  throw error;
});

function api(name) {
  assert.equal(typeof showcase[name], 'function', `Missing showcase behavior: ${name}`);
  return showcase[name];
}

const version2Defaults = { mode: 'carousel', featuredId: null, participants: 'all', selectedIds: [], includeUnavailable: false, intervalSeconds: 6, autoplay: true };
const defaults = { ...version2Defaults, showHistory: false, showConsignment: false, promoPlacement: 'after' };
const manual = { ...defaults, mode: 'manual' };
const automatic = { ...defaults, mode: 'automatic' };
const cars = [
  { id: 'alpha', status: 'showcase', title: 'Alpha', photos: ['alpha.jpg'] },
  { id: 'bravo', status: 'showcase', title: 'Bravo', photos: ['bravo.jpg'] },
  { id: 'charlie', status: 'showcase', title: 'Charlie', photos: ['charlie.jpg'] },
  { id: 'reserved-car', status: 'reserved', title: 'Reserved', photos: ['reserved.jpg'] },
  { id: 'sold_car', status: 'sold', title: 'Sold', photos: ['sold.jpg'] },
];
const emptyRotation = { seenIds: [], lastId: null };
const envelope = settings => JSON.stringify({ version: 3, settings });

function memoryStorage(entries = []) {
  const values = new Map(entries);
  const writes = [];
  return {
    values, writes,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { writes.push(key); values.set(key, String(value)); },
  };
}

test('missing showcase preferences start an independent six-second autoplay carousel without writing', () => {
  const storage = memoryStorage();
  const result = api('readShowcaseSettings')(storage);
  assert.deepEqual(result, { settings: defaults, error: null, raw: null });
  result.settings.selectedIds.push('alpha');
  assert.deepEqual(api('getDefaultShowcaseSettings')(), defaults);
  assert.equal(storage.values.size, 0);
});

test('showcase settings round-trip and preserve every unrelated storage key', () => {
  const storage = memoryStorage([
    ['fao-preview-v1', 'vehicle inventory'],
    ['fao-preview-stamp-v1', 'sold artwork'],
    ['fao-preview-reserved-stamp-v1', 'reserved artwork'],
    ['fao-preview-rotation-v1', 'rotation history'],
  ]);
  const before = new Map(storage.values);
  const settings = { ...defaults, participants: 'selected', selectedIds: ['alpha', 'deleted-id'], featuredId: 'sold_car', intervalSeconds: 10, autoplay: false,
    showHistory: true, showConsignment: true, promoPlacement: 'interleaved' };
  const result = api('persistShowcaseSettings')(storage, settings, null);
  assert.deepEqual(result, { ok: true, settings, raw: envelope(settings) });
  assert.deepEqual(api('readShowcaseSettings')(storage), { settings, error: null, raw: envelope(settings) });
  assert.equal(storage.getItem('fao-preview-showcase-v1'), envelope(settings));
  for (const [key, value] of before) assert.equal(storage.getItem(key), value);
  assert.equal(storage.values.size, before.size + 1);
  result.settings.selectedIds.push('bravo');
  assert.deepEqual(settings.selectedIds, ['alpha', 'deleted-id']);
});

for (const mode of ['manual', 'automatic']) {
  test(`version-1 ${mode} settings retain their choice and migrate only on explicit saving`, () => {
    const legacy = { mode, featuredId: 'charlie', participants: 'selected', selectedIds: ['bravo', 'alpha'], includeUnavailable: true };
    const raw = JSON.stringify({ version: 1, settings: legacy });
    const storage = memoryStorage([['fao-preview-showcase-v1', raw], ['fao-preview-rotation-v1', 'existing history']]);
    const migrated = { ...legacy, intervalSeconds: 6, autoplay: true, showHistory: false, showConsignment: false, promoPlacement: 'after' };
    assert.deepEqual(api('readShowcaseSettings')(storage), { settings: migrated, error: null, raw });
    assert.deepEqual(storage.writes, []);
    assert.equal(storage.getItem('fao-preview-showcase-v1'), raw);
    assert.deepEqual(api('persistShowcaseSettings')(storage, migrated, raw), { ok: true, settings: migrated, raw: envelope(migrated) });
    assert.equal(storage.getItem('fao-preview-showcase-v1'), envelope(migrated));
    assert.equal(storage.getItem('fao-preview-rotation-v1'), 'existing history');
  });
}

test('saving a version-1 shape directly is rejected instead of silently choosing new fields', () => {
  const legacy = { mode: 'manual', featuredId: 'alpha', participants: 'all', selectedIds: [], includeUnavailable: false };
  const raw = JSON.stringify({ version: 1, settings: legacy });
  const storage = memoryStorage([['fao-preview-showcase-v1', raw]]);
  assert.deepEqual(api('persistShowcaseSettings')(storage, legacy, raw), { ok: false, error: 'invalid' });
  assert.deepEqual(storage.writes, []);
  assert.equal(storage.getItem('fao-preview-showcase-v1'), raw);
});

for (const mode of ['manual', 'automatic', 'carousel']) {
  test(`version-2 ${mode} preserves every preference and keeps both promotions disabled without writes`, () => {
    const oldSettings = { ...version2Defaults, mode, featuredId: 'bravo', participants: 'selected', selectedIds: ['charlie', 'alpha'],
      includeUnavailable: true, intervalSeconds: 15, autoplay: false };
    const raw = JSON.stringify({ version: 2, settings: oldSettings });
    const storage = memoryStorage([['fao-preview-showcase-v1', raw]]);
    const expected = { ...oldSettings, showHistory: false, showConsignment: false, promoPlacement: 'after' };
    assert.deepEqual(api('readShowcaseSettings')(storage), { settings: expected, error: null, raw });
    assert.deepEqual(storage.writes, []);
    assert.equal(storage.getItem('fao-preview-showcase-v1'), raw);
    assert.deepEqual(api('persistShowcaseSettings')(storage, oldSettings, raw), { ok: false, error: 'invalid' });
    assert.deepEqual(storage.writes, []);
    assert.deepEqual(api('persistShowcaseSettings')(storage, expected, raw), { ok: true, settings: expected, raw: envelope(expected) });
  });
}

test('version-2 migration retains its raw baseline and cannot overwrite a newer save', () => {
  const raw = JSON.stringify({ version: 2, settings: version2Defaults });
  const storage = memoryStorage([['fao-preview-showcase-v1', raw]]);
  const original = api('readShowcaseSettings')(storage);
  const newer = envelope({ ...defaults, showHistory: true });
  storage.values.set('fao-preview-showcase-v1', newer);
  assert.deepEqual(api('persistShowcaseSettings')(storage, original.settings, original.raw), { ok: false, error: 'stale' });
  assert.deepEqual(storage.writes, []);
  assert.equal(storage.getItem('fao-preview-showcase-v1'), newer);
});

test('version-3 promotional controls require booleans and an exact placement value', () => {
  const invalidSettings = [
    ...['false', 0, 1, null, undefined].map(showHistory => ({ ...defaults, showHistory })),
    ...['true', 0, 1, null, undefined].map(showConsignment => ({ ...defaults, showConsignment })),
    ...['before', 'Interleaved', '', false, null, undefined].map(promoPlacement => ({ ...defaults, promoPlacement })),
    { ...defaults, historyImage: 'https://example.test/art.jpg' },
  ];
  for (const settings of invalidSettings) {
    const storage = memoryStorage();
    assert.deepEqual(api('persistShowcaseSettings')(storage, settings, null), { ok: false, error: 'invalid' });
    const raw = envelope(settings);
    storage.values.set('fao-preview-showcase-v1', raw);
    assert.deepEqual(api('readShowcaseSettings')(storage), { settings: defaults, error: 'invalid', raw });
    assert.deepEqual(storage.writes, []);
    assert.equal(storage.getItem('fao-preview-showcase-v1'), raw);
  }
});

test('version-3 rejects missing fields and older envelopes reject premature promotional fields', () => {
  const invalidSaved = [{ version: 3, settings: version2Defaults }];
  for (const field of ['showHistory', 'showConsignment', 'promoPlacement']) {
    const missing = { ...defaults };
    delete missing[field];
    invalidSaved.push({ version: 3, settings: missing });
    invalidSaved.push({ version: 2, settings: { ...version2Defaults, [field]: defaults[field] } });
  }
  for (const saved of invalidSaved) {
    const raw = JSON.stringify(saved);
    const storage = memoryStorage([['fao-preview-showcase-v1', raw]]);
    assert.deepEqual(api('readShowcaseSettings')(storage), { settings: defaults, error: 'invalid', raw });
    assert.deepEqual(storage.writes, []);
  }
});

test('migrated settings cannot overwrite a newer version-3 save using the old version-1 baseline', () => {
  const legacy = { mode: 'automatic', featuredId: null, participants: 'all', selectedIds: [], includeUnavailable: false };
  const raw = JSON.stringify({ version: 1, settings: legacy });
  const storage = memoryStorage([['fao-preview-showcase-v1', raw]]);
  const firstRead = api('readShowcaseSettings')(storage);
  const newer = envelope({ ...defaults, intervalSeconds: 15, autoplay: false });
  storage.values.set('fao-preview-showcase-v1', newer);
  assert.deepEqual(api('persistShowcaseSettings')(storage, firstRead.settings, firstRead.raw), { ok: false, error: 'stale' });
  assert.deepEqual(storage.writes, []);
  assert.equal(storage.getItem('fao-preview-showcase-v1'), newer);
});

test('each supported carousel interval and autoplay setting survives saving and reloading', () => {
  for (const intervalSeconds of [4, 6, 8, 10, 15]) {
    for (const autoplay of [true, false]) {
      const storage = memoryStorage();
      const settings = { ...defaults, intervalSeconds, autoplay };
      assert.equal(api('persistShowcaseSettings')(storage, settings, null).ok, true);
      assert.deepEqual(api('readShowcaseSettings')(storage), { settings, error: null, raw: envelope(settings) });
    }
  }
});

test('unsupported intervals and non-boolean autoplay fail closed on saving and version-3 reading', () => {
  const invalidSettings = [
    ...['6', false, null, undefined, 0, -1, 5, 12, 6.5, Infinity, NaN].map(intervalSeconds => ({ ...defaults, intervalSeconds })),
    ...['true', 'false', 0, 1, null, undefined].map(autoplay => ({ ...defaults, autoplay })),
  ];
  for (const settings of invalidSettings) {
    const storage = memoryStorage();
    assert.deepEqual(api('persistShowcaseSettings')(storage, settings, null), { ok: false, error: 'invalid' });
    assert.deepEqual(storage.writes, []);
    const raw = envelope(settings);
    storage.values.set('fao-preview-showcase-v1', raw);
    assert.deepEqual(api('readShowcaseSettings')(storage), { settings: defaults, error: 'invalid', raw });
    assert.deepEqual(storage.writes, []);
    assert.equal(storage.getItem('fao-preview-showcase-v1'), raw);
  }
});

test('legacy formats accept only their exact fields and mode contracts', () => {
  const legacy = { mode: 'manual', featuredId: null, participants: 'all', selectedIds: [], includeUnavailable: false };
  const invalidSaved = [
    { version: 1, settings: { ...legacy, mode: 'carousel' } },
    { version: 1, settings: { ...legacy, intervalSeconds: 6 } },
    { version: 1, settings: { ...legacy, autoplay: true } },
    { version: 2, settings: legacy },
    { version: 2, settings: { ...legacy, intervalSeconds: 6 } },
    { version: 2, settings: { ...legacy, autoplay: true } },
    { version: 2, settings: { ...defaults, extra: true } },
    { version: '2', settings: defaults },
  ];
  for (const saved of invalidSaved) {
    const raw = JSON.stringify(saved);
    const storage = memoryStorage([['fao-preview-showcase-v1', raw]]);
    assert.deepEqual(api('readShowcaseSettings')(storage), { settings: defaults, error: 'invalid', raw });
    assert.deepEqual(storage.writes, []);
    assert.equal(storage.getItem('fao-preview-showcase-v1'), raw);
  }
});

test('malformed settings are rejected before they can overwrite saved preferences', () => {
  const storage = memoryStorage([['fao-preview-showcase-v1', envelope(defaults)]]);
  const inherited = Object.create(defaults);
  const accessor = { ...defaults };
  Object.defineProperty(accessor, 'mode', { get() { throw new Error('Accessor must not run'); } });
  const invalid = [
    undefined, null, false, [], {}, inherited, accessor,
    { ...defaults, mode: 'random' }, { ...defaults, participants: 'some' },
    { ...defaults, includeUnavailable: 'false' }, { ...defaults, extra: true },
    { ...defaults, featuredId: '' }, { ...defaults, featuredId: 'unsafe<script>' },
    { ...defaults, featuredId: 'x'.repeat(91) }, { ...defaults, featuredId: 'alpha\n' },
    { ...defaults, selectedIds: ['alpha', 'alpha'] }, { ...defaults, selectedIds: [null] },
    { ...defaults, selectedIds: ['bad id'] }, { ...defaults, selectedIds: 'alpha' },
    { ...defaults, selectedIds: Array(1) },
  ];
  for (const settings of invalid) {
    assert.deepEqual(api('persistShowcaseSettings')(storage, settings, envelope(defaults)), { ok: false, error: 'invalid' });
    assert.equal(storage.getItem('fao-preview-showcase-v1'), envelope(defaults));
  }
});

test('valid deleted IDs and safe IDs up to 90 characters remain persistable', () => {
  const storage = memoryStorage();
  const settings = { ...defaults, featuredId: 'x'.repeat(90), selectedIds: ['gone-car', 'local-ABC_123', '__proto__'] };
  assert.equal(api('persistShowcaseSettings')(storage, settings, null).ok, true);
  assert.deepEqual(api('readShowcaseSettings')(storage).settings, settings);
});

test('corrupt or unsupported saved envelopes report the original raw value without writing', () => {
  for (const raw of ['', '{broken', 'null', '[]', '{}', envelope({ ...defaults, mode: 'bad' }),
    JSON.stringify({ version: 4, settings: defaults }), JSON.stringify({ version: 3, settings: defaults, extra: true })]) {
    const storage = memoryStorage([['fao-preview-showcase-v1', raw]]);
    assert.deepEqual(api('readShowcaseSettings')(storage), { settings: defaults, error: 'invalid', raw });
    assert.equal(storage.getItem('fao-preview-showcase-v1'), raw);
  }
});

test('stale showcase writes cannot replace changes from another tab or deleted preferences', () => {
  const storage = memoryStorage();
  const first = api('persistShowcaseSettings')(storage, defaults, null);
  const changed = { ...automatic, selectedIds: ['bravo'] };
  const newer = api('persistShowcaseSettings')(storage, changed, first.raw);
  assert.equal(newer.ok, true);
  assert.deepEqual(api('persistShowcaseSettings')(storage, defaults, first.raw), { ok: false, error: 'stale' });
  assert.equal(storage.getItem('fao-preview-showcase-v1'), newer.raw);
  storage.values.delete('fao-preview-showcase-v1');
  assert.deepEqual(api('persistShowcaseSettings')(storage, defaults, newer.raw), { ok: false, error: 'stale' });
  assert.equal(storage.values.size, 0);
});

test('saving preferences requires an explicit valid read baseline', () => {
  const storage = memoryStorage();
  for (const raw of [undefined, false, 2, {}, []]) {
    assert.deepEqual(api('persistShowcaseSettings')(storage, defaults, raw), { ok: false, error: 'invalid' });
  }
  assert.deepEqual(api('persistShowcaseSettings')(storage, defaults), { ok: false, error: 'invalid' });
  assert.equal(storage.values.size, 0);
});

test('unavailable reads and quota failures cannot report saved preferences', () => {
  const denied = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('Unexpected write'); } };
  assert.deepEqual(api('readShowcaseSettings')(denied), { settings: defaults, error: 'unavailable', raw: null });
  assert.deepEqual(api('readShowcaseSettings')(undefined), { settings: defaults, error: 'unavailable', raw: null });
  assert.deepEqual(api('persistShowcaseSettings')(denied, defaults, null), { ok: false, error: 'unavailable' });
  const quota = { getItem() { return null; }, setItem() { throw new Error('QuotaExceededError'); } };
  assert.deepEqual(api('persistShowcaseSettings')(quota, defaults, null), { ok: false, error: 'unavailable' });
});

test('the default eligible pool excludes both sold and reserved vehicles', () => {
  assert.deepEqual(api('getEligibleCars')(cars, defaults).map(car => car.id), ['alpha', 'bravo', 'charlie']);
  assert.deepEqual(api('getEligibleCars')(cars, { ...defaults, includeUnavailable: true }).map(car => car.id),
    ['alpha', 'bravo', 'charlie', 'reserved-car', 'sold_car']);
  assert.deepEqual(api('getEligibleCars')([{ id: 'unknown', status: 'unknown' }], { ...defaults, includeUnavailable: true }), []);
});

test('selected participants constrain automatic mode while preserving inventory order', () => {
  const settings = { ...automatic, participants: 'selected', selectedIds: ['sold_car', 'bravo', 'alpha', 'deleted-id'] };
  assert.deepEqual(api('getEligibleCars')(cars, settings).map(car => car.id), ['alpha', 'bravo']);
  assert.deepEqual(api('getEligibleCars')(cars, { ...settings, includeUnavailable: true }).map(car => car.id), ['alpha', 'bravo', 'sold_car']);
  assert.deepEqual(api('getEligibleCars')(cars, { ...settings, selectedIds: [] }), []);
});

test('carousel participants follow inventory order and include unavailable vehicles only by opt-in', () => {
  const settings = { ...defaults, participants: 'selected', selectedIds: ['sold_car', 'reserved-car', 'bravo', 'alpha', 'deleted-id'] };
  assert.deepEqual(api('getEligibleCars')(cars, settings).map(car => car.id), ['alpha', 'bravo']);
  assert.deepEqual(api('getEligibleCars')(cars, { ...settings, includeUnavailable: true }).map(car => car.id),
    ['alpha', 'bravo', 'reserved-car', 'sold_car']);
  assert.deepEqual(api('getEligibleCars')(cars, { ...settings, selectedIds: [] }), []);
});

test('default carousel slides contain only eligible vehicles and no promotional art', () => {
  assert.deepEqual(api('getCarouselSlides')(cars, defaults), [
    { id: 'vehicle:alpha', kind: 'vehicle', carId: 'alpha' },
    { id: 'vehicle:bravo', kind: 'vehicle', carId: 'bravo' },
    { id: 'vehicle:charlie', kind: 'vehicle', carId: 'charlie' },
  ]);
});

test('after placement appends history then consignment and keeps original vehicle order', () => {
  assert.deepEqual(api('getCarouselSlides')(cars, { ...defaults, showHistory: true, showConsignment: true }), [
    { id: 'vehicle:alpha', kind: 'vehicle', carId: 'alpha' },
    { id: 'vehicle:bravo', kind: 'vehicle', carId: 'bravo' },
    { id: 'vehicle:charlie', kind: 'vehicle', carId: 'charlie' },
    { id: 'promo:history', kind: 'history' },
    { id: 'promo:consignment', kind: 'consignment' },
  ]);
});

for (const [count, expected] of [
  [0, ['promo:history', 'promo:consignment']],
  [1, ['vehicle:alpha', 'promo:history', 'promo:consignment']],
  [2, ['vehicle:alpha', 'promo:history', 'vehicle:bravo', 'promo:consignment']],
  [3, ['vehicle:alpha', 'promo:history', 'vehicle:bravo', 'promo:consignment', 'vehicle:charlie']],
  [5, ['vehicle:alpha', 'vehicle:bravo', 'promo:history', 'vehicle:charlie', 'vehicle:reserved-car', 'promo:consignment', 'vehicle:sold_car']],
]) {
  test(`interleaving two promotions among ${count} vehicles preserves both orders`, () => {
    const settings = { ...defaults, includeUnavailable: true, showHistory: true, showConsignment: true, promoPlacement: 'interleaved' };
    assert.deepEqual(api('getCarouselSlides')(cars.slice(0, count), settings).map(slide => slide.id), expected);
  });
}

for (const [flag, id] of [['showHistory', 'promo:history'], ['showConsignment', 'promo:consignment']]) {
  test(`only ${flag} adds one promotion using the chosen placement`, () => {
    assert.deepEqual(api('getCarouselSlides')(cars, { ...defaults, [flag]: true }).map(slide => slide.id),
      ['vehicle:alpha', 'vehicle:bravo', 'vehicle:charlie', id]);
    assert.deepEqual(api('getCarouselSlides')(cars, { ...defaults, [flag]: true, promoPlacement: 'interleaved' }).map(slide => slide.id),
      ['vehicle:alpha', 'vehicle:bravo', id, 'vehicle:charlie']);
    assert.deepEqual(api('getCarouselSlides')([], { ...defaults, [flag]: true }).map(slide => slide.id), [id]);
  });
}

test('promotions remain available when selected participants yield no vehicles', () => {
  const settings = { ...defaults, participants: 'selected', selectedIds: ['missing'], showHistory: true, showConsignment: true };
  assert.deepEqual(api('getCarouselSlides')(cars, settings), [
    { id: 'promo:history', kind: 'history' }, { id: 'promo:consignment', kind: 'consignment' },
  ]);
  assert.deepEqual(api('getEligibleCars')(cars, settings), []);
  assert.equal(api('selectFeatured')(cars, settings).car, null);
});

test('carousel slide eligibility honors selected IDs and reserved/sold opt-in without changing promotion flags', () => {
  const settings = { ...defaults, participants: 'selected', selectedIds: ['sold_car', 'reserved-car', 'bravo'], showHistory: true };
  assert.deepEqual(api('getCarouselSlides')(cars, settings).map(slide => slide.id), ['vehicle:bravo', 'promo:history']);
  assert.deepEqual(api('getCarouselSlides')(cars, { ...settings, includeUnavailable: true }).map(slide => slide.id),
    ['vehicle:bravo', 'vehicle:reserved-car', 'vehicle:sold_car', 'promo:history']);
});

test('vehicle IDs named after promotional kinds keep distinct slide identifiers', () => {
  const namedCars = [{ id: 'history', status: 'showcase' }, { id: 'consignment', status: 'showcase' }];
  assert.deepEqual(api('getCarouselSlides')(namedCars, { ...defaults, showHistory: true, showConsignment: true }), [
    { id: 'vehicle:history', kind: 'vehicle', carId: 'history' },
    { id: 'vehicle:consignment', kind: 'vehicle', carId: 'consignment' },
    { id: 'promo:history', kind: 'history' },
    { id: 'promo:consignment', kind: 'consignment' },
  ]);
});

test('manual and automatic modes do not produce carousel slides or choose promotional art', () => {
  for (const mode of ['manual', 'automatic']) {
    const settings = { ...defaults, mode, featuredId: 'bravo', showHistory: true, showConsignment: true };
    assert.deepEqual(api('getCarouselSlides')(cars, settings), []);
    assert.deepEqual(api('getEligibleCars')(cars, settings).map(car => car.id), ['alpha', 'bravo', 'charlie']);
    assert.equal(api('selectFeatured')(cars, settings, emptyRotation, () => 0).car.id, mode === 'manual' ? 'bravo' : 'alpha');
  }
});

test('slide assembly is pure and returns independent descriptors without accessing browser storage', t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Slide assembly must not access storage'); } });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  });
  const inputCars = Object.freeze(cars.map(car => Object.freeze({ ...car, photos: Object.freeze([...car.photos]) })));
  const settings = Object.freeze({ ...defaults, showHistory: true, selectedIds: Object.freeze([]) });
  const slides = api('getCarouselSlides')(inputCars, settings);
  slides[0].carId = 'changed';
  slides.pop();
  assert.equal(inputCars[0].id, 'alpha');
  assert.deepEqual(settings.selectedIds, []);
  assert.deepEqual(api('getCarouselSlides')(inputCars, settings), [
    { id: 'vehicle:alpha', kind: 'vehicle', carId: 'alpha' },
    { id: 'vehicle:bravo', kind: 'vehicle', carId: 'bravo' },
    { id: 'vehicle:charlie', kind: 'vehicle', carId: 'charlie' },
    { id: 'promo:history', kind: 'history' },
  ]);
});

test('slide assembly rejects malformed settings before producing any content', () => {
  const slides = api('getCarouselSlides');
  for (const settings of [undefined, version2Defaults, { ...defaults, showHistory: 'true' }, { ...defaults, promoPlacement: 'before' }]) {
    assert.throws(() => slides(cars, settings), TypeError);
  }
});

test('carousel starts at the first eligible vehicle without drawing or consuming automatic history', () => {
  const history = Object.freeze({ seenIds: Object.freeze(['bravo', 'alpha']), lastId: 'alpha' });
  const settings = { ...defaults, featuredId: 'charlie', participants: 'selected', selectedIds: ['charlie', 'bravo'] };
  const result = api('selectFeatured')(cars, settings, history, () => { throw new Error('Carousel must not draw'); });
  assert.equal(result.car, cars[1]);
  assert.deepEqual(result.rotation, { seenIds: ['bravo', 'alpha'], lastId: 'alpha' });
  assert.notEqual(result.rotation.seenIds, history.seenIds);
  const next = api('selectFeatured')(cars, automatic, result.rotation, () => 0);
  assert.equal(next.car, cars[2]);
});

test('zero and one eligible carousel vehicles preserve automatic history without generating a rotation', () => {
  const history = { seenIds: ['bravo'], lastId: 'bravo' };
  const forbiddenDraw = () => { throw new Error('Carousel must not draw'); };
  for (const pool of [[], [cars[4]]]) {
    assert.deepEqual(api('selectFeatured')(pool, defaults, history, forbiddenDraw), { car: null, rotation: history });
  }
  assert.deepEqual(api('selectFeatured')([cars[0]], defaults, history, forbiddenDraw), { car: cars[0], rotation: history });
  assert.deepEqual(api('selectFeatured')([cars[4]], { ...defaults, includeUnavailable: true }, history, forbiddenDraw),
    { car: cars[4], rotation: history });
  assert.deepEqual(api('selectFeatured')(cars, { ...defaults, participants: 'selected', selectedIds: ['deleted-id'] }, history, forbiddenDraw),
    { car: null, rotation: history });
});

test('manual mode uses the chosen eligible vehicle and ignores the automatic participant subset', () => {
  const settings = { ...manual, featuredId: 'charlie', participants: 'selected', selectedIds: ['alpha'] };
  const history = { seenIds: ['alpha'], lastId: 'alpha' };
  const result = api('selectFeatured')(cars, settings, history, () => { throw new Error('Manual mode must not draw'); });
  assert.equal(result.car, cars[2]);
  assert.deepEqual(result.rotation, history);
  assert.notEqual(result.rotation.seenIds, history.seenIds);
});

test('manual deletion or ineligible status falls back to the first eligible vehicle', () => {
  for (const featuredId of [null, 'deleted-id', 'sold_car', 'reserved-car']) {
    assert.equal(api('selectFeatured')(cars, { ...manual, featuredId }).car, cars[0]);
  }
  assert.equal(api('selectFeatured')(cars, { ...manual, featuredId: 'sold_car', includeUnavailable: true }).car, cars[4]);
});

test('automatic rotation covers its pool once before repeating and avoids the previous car at a cycle boundary', () => {
  const select = api('selectFeatured');
  let rotation = emptyRotation;
  const choices = [];
  for (const randomValue of [0.999, 0, 0, 0.5, 0, 0]) {
    const result = select(cars, automatic, rotation, () => randomValue);
    choices.push(result.car.id);
    rotation = result.rotation;
  }
  assert.deepEqual(choices, ['charlie', 'alpha', 'bravo', 'charlie', 'alpha', 'bravo']);
  assert.deepEqual(rotation, { seenIds: ['charlie', 'alpha', 'bravo'], lastId: 'bravo' });
  const boundary = select(cars, automatic, { seenIds: ['alpha', 'bravo', 'charlie'], lastId: 'alpha' }, () => 0);
  assert.equal(boundary.car.id, 'bravo');
  assert.deepEqual(boundary.rotation, { seenIds: ['bravo'], lastId: 'bravo' });
});

test('automatic rotation prunes deleted and ineligible history while retaining unseen choices after pool changes', () => {
  const history = { seenIds: ['gone', 'alpha', 'sold_car'], lastId: 'sold_car' };
  const result = api('selectFeatured')(cars, automatic, history, () => 0);
  assert.equal(result.car.id, 'bravo');
  assert.deepEqual(result.rotation, { seenIds: ['alpha', 'bravo'], lastId: 'bravo' });
  const narrowed = { ...automatic, participants: 'selected', selectedIds: ['charlie', 'alpha'] };
  const next = api('selectFeatured')(cars, narrowed, result.rotation, () => 0);
  assert.equal(next.car.id, 'charlie');
  assert.deepEqual(next.rotation, { seenIds: ['alpha', 'charlie'], lastId: 'charlie' });
  const expanded = api('selectFeatured')(cars, automatic, next.rotation, () => 0);
  assert.equal(expanded.car.id, 'bravo');
});

test('empty and one-car pools produce a hidden hero or the sole eligible car', () => {
  const select = api('selectFeatured');
  assert.deepEqual(select([], defaults), { car: null, rotation: emptyRotation });
  assert.deepEqual(select(cars, { ...automatic, participants: 'selected', selectedIds: ['deleted-id'] }, { seenIds: ['alpha'], lastId: 'alpha' }),
    { car: null, rotation: emptyRotation });
  assert.deepEqual(select([cars[4]], defaults), { car: null, rotation: emptyRotation });
  const result = select([cars[0]], automatic, { seenIds: ['alpha'], lastId: 'alpha' }, () => 0);
  assert.equal(result.car, cars[0]);
  assert.deepEqual(result.rotation, { seenIds: ['alpha'], lastId: 'alpha' });
});

test('selection does not mutate inventory, preferences or rotation history', () => {
  const frozenCars = Object.freeze(cars.map(car => Object.freeze({ ...car, photos: Object.freeze([...car.photos]) })));
  const settings = Object.freeze({ ...automatic, selectedIds: Object.freeze([]) });
  const rotation = Object.freeze({ seenIds: Object.freeze(['alpha']), lastId: 'alpha' });
  const result = api('selectFeatured')(frozenCars, settings, rotation, () => 0);
  assert.equal(result.car, frozenCars[1]);
  assert.deepEqual(rotation, { seenIds: ['alpha'], lastId: 'alpha' });
});

test('rotation history survives storage without touching showcase, inventory or stamps', () => {
  const storage = memoryStorage([
    ['fao-preview-showcase-v1', envelope(automatic)], ['fao-preview-v1', 'inventory'],
    ['fao-preview-stamp-v1', 'sold'], ['fao-preview-reserved-stamp-v1', 'reserved'],
  ]);
  const before = new Map(storage.values);
  const rotation = { seenIds: ['alpha', 'bravo'], lastId: 'bravo' };
  assert.equal(api('persistRotation')(storage, rotation), true);
  assert.deepEqual(api('readRotation')(storage), rotation);
  assert.deepEqual(JSON.parse(storage.getItem('fao-preview-rotation-v1')), { version: 1, ...rotation });
  for (const [key, value] of before) assert.equal(storage.getItem(key), value);
  assert.equal(storage.values.size, before.size + 1);
});

test('unreadable or malformed rotation falls back to an independent empty history', () => {
  for (const raw of [null, '', '{bad', 'null', '[]', '{}', JSON.stringify({ version: 2, ...emptyRotation }),
    JSON.stringify({ version: 1, seenIds: ['alpha', 'alpha'], lastId: 'alpha' }),
    JSON.stringify({ version: 1, seenIds: ['bad id'], lastId: null }),
    JSON.stringify({ version: 1, seenIds: [], lastId: 7 })]) {
    const storage = memoryStorage(raw === null ? [] : [['fao-preview-rotation-v1', raw]]);
    const result = api('readRotation')(storage);
    assert.deepEqual(result, emptyRotation);
    result.seenIds.push('alpha');
    assert.deepEqual(api('readRotation')(storage), emptyRotation);
  }
  assert.deepEqual(api('readRotation')({ getItem() { throw new Error('SecurityError'); } }), emptyRotation);
});

test('rotation persistence rejects invalid history and reports unavailable storage', () => {
  const storage = memoryStorage();
  for (const rotation of [undefined, {}, { seenIds: ['alpha', 'alpha'], lastId: 'alpha' }, { seenIds: [], lastId: 'bad id' }]) {
    assert.equal(api('persistRotation')(storage, rotation), false);
  }
  assert.equal(storage.values.size, 0);
  assert.equal(api('persistRotation')({ setItem() { throw new Error('QuotaExceededError'); } }, emptyRotation), false);
});

test('manual reordering creates a new array preserving each vehicle and its complete data', () => {
  const before = structuredClone(cars);
  const reordered = api('reorderVehicles')(cars, ['sold_car', 'alpha', 'reserved-car', 'charlie', 'bravo']);
  assert.deepEqual(reordered.map(car => car.id), ['sold_car', 'alpha', 'reserved-car', 'charlie', 'bravo']);
  assert.equal(reordered[0], cars[4]);
  assert.equal(reordered[1], cars[0]);
  assert.equal(reordered[2], cars[3]);
  assert.equal(reordered[3], cars[2]);
  assert.equal(reordered[4], cars[1]);
  assert.notEqual(reordered, cars);
  assert.deepEqual(cars, before);
  assert.deepEqual(api('reorderVehicles')([], []), []);
});

test('reordering rejects missing, duplicate, foreign and malformed IDs without data loss', () => {
  const reorder = api('reorderVehicles');
  for (const ids of [[], ['alpha'], ['alpha', 'bravo', 'charlie', 'reserved-car', 'missing'],
    ['alpha', 'alpha', 'charlie', 'reserved-car', 'sold_car'],
    ['alpha', 'bravo', 'charlie', 'reserved-car', 'sold_car', 'extra'], null, 'alpha', Array(5)]) {
    assert.throws(() => reorder(cars, ids), TypeError);
  }
  assert.throws(() => reorder([cars[0], cars[0]], ['alpha', 'alpha']), TypeError);
  assert.throws(() => reorder(null, []), TypeError);
  assert.deepEqual(cars.map(car => car.id), ['alpha', 'bravo', 'charlie', 'reserved-car', 'sold_car']);
});
