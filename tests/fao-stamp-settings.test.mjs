import test from 'node:test';
import assert from 'node:assert/strict';
import * as stampSettings from '../src/fao-preview/stamp-settings.js';
import {
  DEFAULT_STAMP_SETTINGS,
  MAX_STAMP_DATA_LENGTH,
  normalizeStampSettings,
  readStampSettings,
  persistStampSettings,
  fitStampDimensions,
} from '../src/fao-preview/stamp-settings.js';

const defaults = { src: './assets/sold-stamp-soft-white.png', position: 'top-left', size: 'medium', width: 1536, height: 1024 };
const png = 'data:image/png;base64,iVBORw0KGgo=';
const custom = { src: png, position: 'bottom-right', size: 'large', width: 600, height: 200 };
const reservedDefaults = { src: './assets/reserved-stamp-soft-white.png', position: 'top-left', size: 'medium', width: 1536, height: 1024 };
const reservedCustom = { src: 'data:image/webp;base64,AAAA', position: 'top-right', size: 'small', width: 500, height: 200 };

test('each status exposes independent defaults without changing the legacy sold contract', () => {
  assert.equal(typeof stampSettings.getDefaultStampSettings, 'function');
  assert.deepEqual(stampSettings.getDefaultStampSettings(), defaults);
  assert.deepEqual(stampSettings.getDefaultStampSettings('sold'), defaults);
  const reserved = stampSettings.getDefaultStampSettings('reserved');
  assert.deepEqual(reserved, reservedDefaults);
  reserved.src = png;
  reserved.position = 'bottom-left';
  assert.deepEqual(stampSettings.getDefaultStampSettings('reserved'), reservedDefaults);
  assert.deepEqual(DEFAULT_STAMP_SETTINGS, defaults);
});

test('reserved normalization uses its own artwork and accepts custom raster images', () => {
  for (const input of [undefined, null, false, 1, 'reserved', [], {}]) {
    assert.deepEqual(normalizeStampSettings(input, 'reserved'), reservedDefaults);
  }
  assert.deepEqual(normalizeStampSettings(reservedCustom, 'reserved'), reservedCustom);
  assert.deepEqual(normalizeStampSettings({ position: 'bottom-left', size: 'large' }, 'reserved'), {
    ...reservedDefaults, position: 'bottom-left', size: 'large',
  });
});

test('default assets cannot cross from one status into the other', () => {
  assert.deepEqual(normalizeStampSettings({ ...reservedDefaults, src: defaults.src }, 'reserved'), reservedDefaults);
  assert.deepEqual(normalizeStampSettings(reservedDefaults, 'sold'), defaults);
});

test('corrupt reserved storage falls back to reserved without writing or reading the sold key', () => {
  for (const value of [null, '', '{broken', 'null', '22', '"string"', '[]']) {
    const reads = [];
    const writes = [];
    const storage = {
      getItem(key) { reads.push(key); return value; },
      setItem(...args) { writes.push(args); },
    };
    assert.deepEqual(readStampSettings(storage, 'reserved'), reservedDefaults);
    assert.deepEqual(reads, ['fao-preview-reserved-stamp-v1']);
    assert.deepEqual(writes, []);
  }
  assert.deepEqual(readStampSettings({ getItem() { throw new Error('SecurityError'); } }, 'reserved'), reservedDefaults);
  assert.deepEqual(readStampSettings(undefined, 'reserved'), reservedDefaults);
});

test('old sold uploads remain readable without migration or reserved writes', () => {
  const uploaded = JSON.stringify(custom);
  const values = new Map([['fao-preview-stamp-v1', uploaded]]);
  const writes = [];
  const storage = { getItem: key => values.get(key) ?? null, setItem: (...args) => writes.push(args) };
  assert.deepEqual(readStampSettings(storage), custom);
  assert.deepEqual(readStampSettings(storage, 'sold'), custom);
  assert.deepEqual(readStampSettings(storage, 'reserved'), reservedDefaults);
  assert.deepEqual([...values], [['fao-preview-stamp-v1', uploaded]]);
  assert.deepEqual(writes, []);
});

test('saving either stamp isolates both keys and preserves vehicle and unrelated data', () => {
  const vehicleEdits = '[{"id":"gol","title":"Gol GL Teste","status":"reserved"}]';
  const values = new Map([['fao-preview-v1', vehicleEdits], ['unrelated', 'keep']]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.deepEqual(persistStampSettings(storage, custom), { ok: true, settings: custom });
  const savedSold = values.get('fao-preview-stamp-v1');
  assert.deepEqual(persistStampSettings(storage, reservedCustom, 'reserved'), { ok: true, settings: reservedCustom });
  assert.equal(values.get('fao-preview-stamp-v1'), savedSold);
  assert.deepEqual(JSON.parse(values.get('fao-preview-reserved-stamp-v1')), reservedCustom);
  assert.deepEqual(readStampSettings(storage), custom);
  assert.deepEqual(readStampSettings(storage, 'reserved'), reservedCustom);
  const savedReserved = values.get('fao-preview-reserved-stamp-v1');
  assert.deepEqual(persistStampSettings(storage, { ...custom, size: 'small' }, 'sold'), {
    ok: true, settings: { ...custom, size: 'small' },
  });
  assert.equal(values.get('fao-preview-reserved-stamp-v1'), savedReserved);
  assert.equal(values.get('fao-preview-v1'), vehicleEdits);
  assert.equal(values.get('unrelated'), 'keep');
  assert.equal(values.size, 4);
  assert.equal(stampSettings.STAMP_STORAGE_KEY, 'fao-preview-stamp-v1');
  assert.equal(stampSettings.RESERVED_STAMP_STORAGE_KEY, 'fao-preview-reserved-stamp-v1');
});

test('restoring the reserved default changes only its draft until saved and preserves sold artwork', () => {
  assert.equal(typeof stampSettings.getDefaultStampSettings, 'function');
  const values = new Map([
    ['fao-preview-stamp-v1', JSON.stringify(custom)],
    ['fao-preview-reserved-stamp-v1', JSON.stringify(reservedCustom)],
    ['fao-preview-v1', '[{"id":"gol","status":"reserved"}]'],
  ]);
  const before = new Map(values);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const draft = stampSettings.getDefaultStampSettings('reserved');
  assert.deepEqual(values, before);
  assert.deepEqual(persistStampSettings(storage, draft, 'reserved'), { ok: true, settings: reservedDefaults });
  assert.equal(values.get('fao-preview-stamp-v1'), before.get('fao-preview-stamp-v1'));
  assert.equal(values.get('fao-preview-v1'), before.get('fao-preview-v1'));
  assert.deepEqual(readStampSettings(storage, 'reserved'), reservedDefaults);
});

test('unsupported statuses fail closed before storage access', () => {
  const accesses = [];
  const storage = {
    getItem(key) { accesses.push(['read', key]); return JSON.stringify(custom); },
    setItem(...args) { accesses.push(['write', ...args]); },
  };
  for (const status of ['available', '', 'SOLD', '__proto__', 'constructor', null, false, 0, {}, ['sold'], Symbol('sold')]) {
    assert.throws(() => normalizeStampSettings(custom, status), RangeError);
    assert.throws(() => readStampSettings(storage, status), RangeError);
    assert.throws(() => stampSettings.getDefaultStampSettings(status), RangeError);
    assert.deepEqual(persistStampSettings(storage, custom, status), { ok: false });
  }
  assert.deepEqual(accesses, []);
});

test('malformed settings fall back without mutating the defaults', () => {
  for (const input of [undefined, null, false, 1, 'sold', [], ['top-right']]) {
    const result = normalizeStampSettings(input);
    assert.deepEqual(result, defaults);
    assert.notEqual(result, DEFAULT_STAMP_SETTINGS);
  }
  assert.equal(Object.isFrozen(DEFAULT_STAMP_SETTINGS), true);
  const result = normalizeStampSettings({});
  result.position = 'bottom-left';
  assert.deepEqual(normalizeStampSettings({}), defaults);
});

test('only own allowed fields survive normalization', () => {
  const polluted = Object.create(custom);
  assert.deepEqual(normalizeStampSettings(polluted), defaults);
  const input = JSON.parse('{"__proto__":{"position":"bottom-right"},"position":"top-right","size":"small","extra":"ignored"}');
  const result = normalizeStampSettings(input);
  assert.deepEqual(result, { ...defaults, position: 'top-right', size: 'small' });
  assert.equal(Object.getPrototypeOf(result), Object.prototype);
  assert.deepEqual(Object.keys(result).sort(), ['height', 'position', 'size', 'src', 'width']);
});

test('valid corners and sizes persist, while invalid ones revert independently', () => {
  for (const position of ['top-left', 'top-right', 'bottom-left', 'bottom-right']) {
    for (const size of ['small', 'medium', 'large']) {
      assert.deepEqual(normalizeStampSettings({ position, size }), { ...defaults, position, size });
    }
  }
  assert.deepEqual(normalizeStampSettings({ position: 'center', size: 'small' }), { ...defaults, size: 'small' });
  assert.deepEqual(normalizeStampSettings({ position: 'bottom-left', size: 'huge' }), { ...defaults, position: 'bottom-left' });
});

test('custom raster data URLs require valid dimensions and discard unrelated fields', () => {
  for (const type of ['png', 'jpeg', 'webp']) {
    const src = `data:image/${type};base64,AAAA`;
    assert.deepEqual(normalizeStampSettings({ ...custom, src, extra: true }), { ...custom, src });
  }
  assert.deepEqual(normalizeStampSettings(custom), custom);
  assert.deepEqual(normalizeStampSettings({ ...custom, src: defaults.src, width: 1, height: 1 }), { ...defaults, position: 'bottom-right', size: 'large' });
  for (const dimension of [undefined, null, 0, -1, 901, 1.2, NaN, Infinity, '300']) {
    for (const axis of ['width', 'height']) {
      assert.deepEqual(normalizeStampSettings({ ...custom, [axis]: dimension }), { ...defaults, position: 'bottom-right', size: 'large' });
    }
  }
  assert.equal(normalizeStampSettings({ ...custom, width: 1, height: 900 }).src, png);
});

test('external, executable, unsupported and malformed image sources cannot be persisted', () => {
  const invalid = [
    'javascript:alert(1)', 'https://example.com/stamp.png', '//example.com/stamp.png',
    './other.png', 'data:image/svg+xml;base64,PHN2Zz4=', 'data:text/html;base64,AAAA',
    'data:image/png,hello', 'data:image/png;base64,', 'data:image/png;base64,AAA',
    'data:image/png;base64,A===', 'data:image/png;base64,AA=A',
    'data:image/png;base64,AA A', 'data:image/png;base64,AAAA\n', 22, {},
  ];
  for (const src of invalid) {
    assert.deepEqual(normalizeStampSettings({ ...custom, src }), { ...defaults, position: 'bottom-right', size: 'large' });
  }
});

test('large embedded images are rejected at the storage boundary', () => {
  const header = 'data:image/png;base64,';
  const accepted = header + 'A'.repeat(Math.floor((MAX_STAMP_DATA_LENGTH - header.length) / 4) * 4);
  assert.equal(normalizeStampSettings({ ...custom, src: accepted }).src, accepted);
  assert.equal(normalizeStampSettings({ ...custom, src: accepted + 'AAAA' }).src, defaults.src);
});

test('missing, corrupt or inaccessible storage returns an independent default', () => {
  for (const value of [null, '', '{broken', 'null', '22', '"string"', '[]']) {
    assert.deepEqual(readStampSettings({ getItem: () => value }), defaults);
  }
  assert.deepEqual(readStampSettings({ getItem() { throw new Error('SecurityError'); } }), defaults);
  assert.deepEqual(readStampSettings(undefined), defaults);
  assert.deepEqual(readStampSettings({ getItem: () => JSON.stringify(custom) }), custom);
});

test('saving a stamp preserves vehicle edits and replaces only the stamp key', () => {
  const vehicleEdits = '[{"id":"gol","title":"Gol GL Teste","status":"sold"}]';
  const values = new Map([['fao-preview-v1', vehicleEdits], ['unrelated', 'keep']]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.deepEqual(persistStampSettings(storage, { ...custom, extra: 1 }), { ok: true, settings: custom });
  assert.equal(values.get('fao-preview-v1'), vehicleEdits);
  assert.equal(values.get('unrelated'), 'keep');
  assert.deepEqual(JSON.parse(values.get('fao-preview-stamp-v1')), custom);
  assert.equal(values.size, 3);
  assert.deepEqual(readStampSettings(storage), custom);
});

test('quota or unavailable storage failures do not report a successful save', () => {
  const input = { ...custom };
  assert.deepEqual(persistStampSettings({ setItem() { throw new Error('QuotaExceededError'); } }, input), { ok: false });
  assert.deepEqual(persistStampSettings(undefined, input), { ok: false });
  assert.deepEqual(input, custom);
});

test('image dimensions preserve aspect ratio within a bounded integer canvas', () => {
  for (const [width, height, maxEdge, expected] of [
    [1800, 600, 900, { width: 900, height: 300 }],
    [600, 1800, 900, { width: 300, height: 900 }],
    [300, 100, 900, { width: 300, height: 100 }],
    [900, 900, 900, { width: 900, height: 900 }],
    [600, 400, 300, { width: 300, height: 200 }],
    [100000, 1, 900, { width: 900, height: 1 }],
  ]) assert.deepEqual(fitStampDimensions(width, height, maxEdge), expected);
  assert.deepEqual(fitStampDimensions(1800, 600), { width: 900, height: 300 });
});

test('invalid image dimensions and unsafe limits fail explicitly', () => {
  for (const value of [0, -1, NaN, Infinity, '100', null, undefined]) {
    assert.throws(() => fitStampDimensions(value, 100), RangeError);
    assert.throws(() => fitStampDimensions(100, value), RangeError);
  }
  for (const limit of [0, -1, 901, 1.5, NaN, Infinity, '900']) {
    assert.throws(() => fitStampDimensions(100, 100, limit), RangeError);
  }
});

test('legacy built-in stamps adopt current defaults without rewriting preferences', () => {
  for (const [status, key, oldSrc, expected] of [
    ['sold', 'fao-preview-stamp-v1', './assets/sold-stamp.png', defaults],
    ['reserved', 'fao-preview-reserved-stamp-v1', './assets/reserved-stamp.svg', reservedDefaults],
  ]) {
    const saved = JSON.stringify({ src: oldSrc, width: 900, height: 300, position: 'bottom-right', size: 'large' });
    const reads = [], writes = [];
    const storage = {
      getItem(key) { reads.push(key); return saved; },
      setItem(...args) { writes.push(args); },
    };
    assert.deepEqual(readStampSettings(storage, status), { ...expected, position: 'bottom-right', size: 'large' });
    assert.deepEqual(reads, [key]);
    assert.deepEqual(writes, []);
  }
});
