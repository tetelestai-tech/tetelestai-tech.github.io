import test from 'node:test';
import assert from 'node:assert/strict';
import { validateConsignment, validatePhotoSelection } from '../src/fao-preview/consignment.js';

const valid = {
  'contact-name': '  Carlos  ', 'contact-phone': '(61) 99863-1878',
  'contact-email': ' carlos@example.com ', 'car-make': ' Ford ',
  'car-model': ' F-100 ', 'car-year': '1975', 'car-mileage': '', 'car-notes': ' Original. ',
};

test('review trims customer input and keeps an omitted mileage distinct from zero', () => {
  const result = validateConsignment(valid, 2026);
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.values, {
    'contact-name': 'Carlos', 'contact-phone': '(61) 99863-1878',
    'contact-email': 'carlos@example.com', 'car-make': 'Ford', 'car-model': 'F-100',
    'car-year': '1975', 'car-mileage': '', 'car-notes': 'Original.',
  });
  assert.equal(validateConsignment({ ...valid, 'car-mileage': '0' }, 2026).values['car-mileage'], '0');
});

test('review rejects blank required fields even when they contain spaces', () => {
  for (const field of ['contact-name', 'contact-phone', 'contact-email', 'car-make', 'car-model', 'car-year']) {
    assert.ok(validateConsignment({ ...valid, [field]: '   ' }, 2026).errors[field], field);
  }
});

test('contact review accepts local phone formatting but rejects malformed phone or email', () => {
  for (const phone of ['(61) 3261-1234', '61998631878']) {
    assert.equal(validateConsignment({ ...valid, 'contact-phone': phone }, 2026).errors['contact-phone'], undefined);
  }
  for (const phone of ['12345', '619986318789', 'abc61998631878', '+55 61 99863-1878']) {
    assert.ok(validateConsignment({ ...valid, 'contact-phone': phone }, 2026).errors['contact-phone'], phone);
  }
  for (const email of ['sem-arroba', 'nome@', 'nome exemplo@site.com']) {
    assert.ok(validateConsignment({ ...valid, 'contact-email': email }, 2026).errors['contact-email'], email);
  }
});

test('review rejects implausible years and noninteger mileage instead of silently changing values', () => {
  for (const year of ['1885', '2028', '1975.5', '1e3', '-1975']) {
    assert.ok(validateConsignment({ ...valid, 'car-year': year }, 2026).errors['car-year'], year);
  }
  for (const year of ['1886', '2027']) {
    assert.equal(validateConsignment({ ...valid, 'car-year': year }, 2026).errors['car-year'], undefined);
  }
  for (const mileage of ['-1', '12.5', '1e5', 'abc', '9007199254740992']) {
    assert.ok(validateConsignment({ ...valid, 'car-mileage': mileage }, 2026).errors['car-mileage'], mileage);
  }
});

test('review blocks overlong fields while preserving notes as literal text', () => {
  for (const [field, length] of Object.entries({ 'contact-name': 81, 'contact-email': 255, 'car-make': 51, 'car-model': 71, 'car-notes': 651 })) {
    assert.ok(validateConsignment({ ...valid, [field]: 'x'.repeat(length) }, 2026).errors[field], field);
  }
  const literal = '<img src=x onerror=alert(1)>';
  assert.equal(validateConsignment({ ...valid, 'car-notes': literal }, 2026).values['car-notes'], literal);
});

test('photo selection preserves remaining slots and rejects oversized or unsupported inputs', () => {
  const photo = { name: 'f100.jpg', type: 'image/jpeg', size: 5000000 };
  assert.equal(validatePhotoSelection([photo, photo], 2), '');
  assert.ok(validatePhotoSelection([photo, photo], 3));
  assert.ok(validatePhotoSelection([{ ...photo, size: 5000001 }], 0));
  assert.ok(validatePhotoSelection([{ ...photo, size: 0 }], 0));
  assert.ok(validatePhotoSelection([{ ...photo, type: 'image/svg+xml' }], 0));
  assert.equal(validatePhotoSelection([{ ...photo, type: 'image/png' }, { ...photo, type: 'image/webp' }], 0), '');
});
