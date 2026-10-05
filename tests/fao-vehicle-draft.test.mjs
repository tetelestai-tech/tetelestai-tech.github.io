import test from 'node:test';
import assert from 'node:assert/strict';
const module = await import('../src/fao-preview/vehicle-draft.js').catch(() => ({}));
const signature = value => { assert.equal(typeof module.vehicleDraftSignature, 'function'); return module.vehicleDraftSignature(value); };
const car = { make: 'Volkswagen', title: 'Gol GL', trim: '1.8 GL', description: 'Descrição original.', year: '1991', status: 'showcase', priceMode: 'fixed', price: 'R$ 245.000', photos: ['front.webp', 'side.webp'] };

test('formatting a fixed price or focusing it does not create an unsaved change', () => {
  assert.equal(signature({...car, price: '245000'}), signature(car));
  assert.equal(signature({...car, price: 'R$ 245.000,00'}), signature(car));
  assert.notEqual(signature({...car, price: '245001'}), signature(car));
});
test('consultation ignores a disabled numeric field but changing its mode is a real edit', () => {
  const consultation = {...car, priceMode: 'consultation', price: ''};
  assert.equal(signature({...consultation, price: '245000'}), signature(consultation));
  assert.notEqual(signature(consultation), signature(car));
});
test('each editable vehicle detail can make the draft dirty and reverting restores equality', () => {
  for (const [field, value] of Object.entries({make:'Ford', title:'Gol GT', trim:'2.0', description:'Outra descrição', year:'1992', status:'reserved'})) {
    const changed = {...car, [field]:value};
    assert.notEqual(signature(changed), signature(car), field);
    changed[field] = car[field];
    assert.equal(signature(changed), signature(car), field);
  }
});
test('photo cover, order, addition and removal count as edits while restoring them is clean', () => {
  for (const photos of [['side.webp','front.webp'], ['front.webp'], [...car.photos,'interior.webp']]) {
    assert.notEqual(signature({...car, photos}), signature(car));
  }
  assert.equal(signature({...car, photos:[...car.photos]}), signature(car));
});
test('normalization matches saved text trimming without mutating the draft or counting metadata', () => {
  const draft = {...car, title:'  Gol GL  ', year:1991, id:'local-new', source:'unchanged', photos:[...car.photos]};
  const before = structuredClone(draft);
  assert.equal(signature(draft), signature(car));
  assert.deepEqual(draft, before);
});
test('invalid price text is never conflated with a different valid numeric amount', () => {
  assert.notEqual(signature({...car,price:'1e5'}), signature({...car,price:'15'}));
  assert.notEqual(signature({...car,price:'-245000'}), signature(car));
});

test('each optional spec marks the draft dirty while absent, blank and reverted values stay clean', () => {
  for (const [field, value] of Object.entries({ engine: '1.8', transmission: 'Manual', fuel: 'Gasolina', color: 'Azul', mileage: '51.200 km' })) {
    const draft = { ...car, [field]: value };
    assert.notEqual(signature(draft), signature(car), field);
    assert.equal(signature({ ...draft, [field]: ` ${value} ` }), signature(draft), field);
    draft[field] = '';
    assert.equal(signature(draft), signature(car), field);
    draft[field] = '  ';
    assert.equal(signature(draft), signature(car), field);
  }
});
