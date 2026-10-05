export const SPEC_FIELDS = Object.freeze([
  { key: 'engine', label: 'Motor', maxLength: 80 },
  { key: 'transmission', label: 'Câmbio', maxLength: 40 },
  { key: 'fuel', label: 'Combustível', maxLength: 40 },
  { key: 'color', label: 'Cor', maxLength: 50 },
  { key: 'mileage', label: 'Quilometragem', maxLength: 40 },
].map(Object.freeze));

export function normalizeVehicleSpecs(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Invalid vehicle specifications.');
  }
  const specs = {};
  for (const { key, maxLength } of SPEC_FIELDS) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor) {
      specs[key] = '';
      continue;
    }
    if (!Object.hasOwn(descriptor, 'value') || typeof descriptor.value !== 'string' || descriptor.value.length > maxLength) {
      throw new TypeError('Invalid vehicle specifications.');
    }
    specs[key] = descriptor.value.trim();
  }
  return specs;
}

export function getVehicleSpecs(car) {
  const specs = normalizeVehicleSpecs(car);
  return SPEC_FIELDS.flatMap(({ key, label }) => specs[key] ? [{ label, value: specs[key] }] : []);
}
