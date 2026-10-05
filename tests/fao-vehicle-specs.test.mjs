import test from 'node:test';
import assert from 'node:assert/strict';

const module = await import('../src/fao-preview/vehicle-specs.js').catch(() => ({}));
const normalize = input => {
  assert.equal(typeof module.normalizeVehicleSpecs, 'function');
  return module.normalizeVehicleSpecs(input);
};
const display = input => {
  assert.equal(typeof module.getVehicleSpecs, 'function');
  return module.getVehicleSpecs(input);
};
const blank = { engine: '', transmission: '', fuel: '', color: '', mileage: '' };

test('absent and blank optional specs normalize to empty strings without changing the input', () => {
  assert.deepEqual(normalize({}), blank);
  const input = { engine: '  ', transmission: '', fuel: '\n', color: '\t', mileage: ' ' };
  const before = { ...input };
  assert.deepEqual(normalize(input), blank);
  assert.deepEqual(input, before);
  assert.deepEqual(display(input), []);
});

test('filled specs are trimmed and displayed in a consistent labeled order', () => {
  const input = { mileage: ' 51.200 km ', color: ' Azul ', fuel: ' Gasolina ', transmission: ' Manual ', engine: ' 1.8 ' };
  assert.deepEqual(normalize(input), { engine: '1.8', transmission: 'Manual', fuel: 'Gasolina', color: 'Azul', mileage: '51.200 km' });
  assert.deepEqual(display(input), [
    { label: 'Motor', value: '1.8' },
    { label: 'Câmbio', value: 'Manual' },
    { label: 'Combustível', value: 'Gasolina' },
    { label: 'Cor', value: 'Azul' },
    { label: 'Quilometragem', value: '51.200 km' },
  ]);
  assert.deepEqual(display({ fuel: 'Gasolina', mileage: '  ' }), [{ label: 'Combustível', value: 'Gasolina' }]);
});

test('optional specs reject non-string own values and oversize text without truncation', () => {
  for (const [key, maxLength] of [['engine', 80], ['transmission', 40], ['fuel', 40], ['color', 50], ['mileage', 40]]) {
    for (const value of [undefined, null, 42, false, {}, [], 'a'.repeat(maxLength + 1)]) {
      assert.throws(() => normalize({ [key]: value }), TypeError, key);
    }
    assert.equal(normalize({ [key]: 'a'.repeat(maxLength) })[key], 'a'.repeat(maxLength));
    const field = module.SPEC_FIELDS.find(field => field.key === key);
    assert.equal(field.maxLength, maxLength);
    assert.equal(typeof field.label, 'string');
  }
  for (const input of [null, undefined, 'text', 1, []]) assert.throws(() => normalize(input), TypeError);
});

test('normalization rejects own accessors without invoking them and never inherits specs', () => {
  let reads = 0;
  const input = {};
  Object.defineProperty(input, 'engine', { get() { reads++; return 'V8'; } });
  assert.throws(() => normalize(input), TypeError);
  assert.equal(reads, 0);
  assert.deepEqual(normalize(Object.create(input)), blank);
  assert.equal(reads, 0);
  assert.deepEqual(normalize(Object.create({ color: 'Vermelho' })), blank);
});
