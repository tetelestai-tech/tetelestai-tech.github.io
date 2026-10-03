export const INVENTORY_KEY = 'fao-preview-v1';

const MAX_PHOTO_LENGTH = 2000000;
const textLimits = { make: 50, title: 70, trim: 90, price: 35, description: 650 };
const localIdPattern = /^local-[a-zA-Z0-9-]{8,80}$/;

export function normalizeVehicleStatus(value) {
  return value === 'sold' || value === 'reserved' ? value : 'showcase';
}

function invalid() {
  throw new TypeError('Invalid vehicle inventory.');
}

// Accessors and inherited fields are not persisted vehicle data.
function ownValue(input, field, fallback) {
  const descriptor = Object.getOwnPropertyDescriptor(input, field);
  if (!descriptor) return fallback;
  if (!Object.hasOwn(descriptor, 'value')) invalid();
  return descriptor.value;
}

function cloneSeed(seed) {
  return seed.map(car => ({ ...car, photos: [...car.photos] }));
}

function trustedReferences(seed) {
  return {
    cars: new Map(seed.map(car => [car.id, car])),
    photos: new Set(seed.flatMap(car => car.photos)),
  };
}

function validPhoto(value, knownPhotos) {
  if (typeof value !== 'string' || value.length > MAX_PHOTO_LENGTH) return false;
  if (knownPhotos.has(value)) return true;
  const prefix = /^data:image\/(?:png|jpeg|webp);base64,/.exec(value);
  if (!prefix) return false;
  const encoded = value.slice(prefix[0].length);
  if (!encoded.length || encoded.length % 4 !== 0) return false;
  const match = /^[A-Za-z0-9+/]+={0,2}$/.exec(encoded);
  return match !== null && match[0].length === encoded.length;
}

function normalizeRecord(input, references, legacy) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid();
  const id = ownValue(input, 'id');
  if (typeof id !== 'string') invalid();
  const reference = references.cars.get(id);
  if (!reference && (legacy || localIdPattern.exec(id)?.[0] !== id)) invalid();
  const fallback = legacy ? reference : undefined;
  const car = { id };
  for (const [field, limit] of Object.entries(textLimits)) {
    const value = ownValue(input, field, fallback?.[field]);
    if (typeof value !== 'string' || !value.trim() || value.length > limit) invalid();
    car[field] = value;
  }
  const year = ownValue(input, 'year', fallback?.year);
  if (!Number.isInteger(year) || year < 1886 || year > new Date().getFullYear() + 1) invalid();
  car.year = year;
  car.status = normalizeVehicleStatus(ownValue(input, 'status', fallback?.status));
  const photos = ownValue(input, 'photos', fallback?.photos);
  if (!Array.isArray(photos) || !photos.length || photos.length > 8) invalid();
  car.photos = [];
  for (let index = 0; index < photos.length; index++) {
    const photo = ownValue(photos, String(index));
    if (!validPhoto(photo, references.photos)) invalid();
    car.photos.push(photo);
  }
  // A saved source is never trusted, even for an otherwise valid reference ID.
  car.source = reference ? reference.source : null;
  return car;
}

function normalizeList(input, references, legacy = false) {
  if (!Array.isArray(input)) invalid();
  const ids = new Set();
  const cars = [];
  for (let index = 0; index < input.length; index++) {
    const car = normalizeRecord(ownValue(input, String(index)), references, legacy);
    if (ids.has(car.id)) invalid();
    ids.add(car.id);
    cars.push(car);
  }
  return cars;
}

export function readInventory(storage, seed) {
  let raw;
  try {
    raw = storage.getItem(INVENTORY_KEY);
  } catch {
    return { cars: cloneSeed(seed), error: 'unavailable' };
  }
  if (raw === null) return { cars: cloneSeed(seed), error: null };
  try {
    if (typeof raw !== 'string') invalid();
    const saved = JSON.parse(raw);
    const references = trustedReferences(seed);
    if (Array.isArray(saved)) {
      const edits = new Map(normalizeList(saved, references, true).map(car => [car.id, car]));
      return { cars: cloneSeed(seed).map(car => edits.get(car.id) ?? car), error: null };
    }
    if (!saved || typeof saved !== 'object' || saved.version !== 2) invalid();
    return { cars: normalizeList(saved.vehicles, references), error: null };
  } catch {
    return { cars: cloneSeed(seed), error: 'invalid' };
  }
}

export function persistInventory(storage, input, seed, expectedRaw) {
  const checkBaseline = arguments.length >= 4;
  if (checkBaseline && expectedRaw !== null && typeof expectedRaw !== 'string') {
    return { ok: false, error: 'invalid' };
  }
  let cars, serialized;
  try {
    cars = normalizeList(input, trustedReferences(seed));
    serialized = JSON.stringify({ version: 2, vehicles: cars });
  } catch {
    return { ok: false, error: 'invalid' };
  }
  try {
    if (checkBaseline && storage.getItem(INVENTORY_KEY) !== expectedRaw) {
      return { ok: false, error: 'stale' };
    }
    storage.setItem(INVENTORY_KEY, serialized);
    return { ok: true, cars };
  } catch {
    return { ok: false, error: 'unavailable' };
  }
}
