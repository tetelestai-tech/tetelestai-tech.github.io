export const SHOWCASE_KEY = 'fao-preview-showcase-v1';
export const ROTATION_KEY = 'fao-preview-rotation-v1';

const legacySettingsFields = ['mode', 'featuredId', 'participants', 'selectedIds', 'includeUnavailable'];
const version2SettingsFields = [...legacySettingsFields, 'intervalSeconds', 'autoplay'];
const settingsFields = [...version2SettingsFields, 'showHistory', 'showConsignment', 'promoPlacement'];
const rotationFields = ['seenIds', 'lastId'];
const idPattern = /^[A-Za-z0-9_-]{1,90}$/;
const validId = value => typeof value === 'string' && idPattern.exec(value)?.[0] === value;
const emptyRotation = () => ({ seenIds: [], lastId: null });

function invalid() {
  throw new TypeError('Invalid showcase data.');
}

function ownValue(input, key) {
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  if (!descriptor || !Object.hasOwn(descriptor, 'value')) invalid();
  return descriptor.value;
}

function readFields(input, fields) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid();
  if (Reflect.ownKeys(input).length !== fields.length) invalid();
  return Object.fromEntries(fields.map(field => [field, ownValue(input, field)]));
}

function copyIds(input) {
  if (!Array.isArray(input)) invalid();
  const ids = [];
  const seen = new Set();
  for (let index = 0; index < input.length; index++) {
    const id = ownValue(input, String(index));
    if (!validId(id) || seen.has(id)) invalid();
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

export function getDefaultShowcaseSettings() {
  return { mode: 'carousel', featuredId: null, participants: 'all', selectedIds: [], includeUnavailable: false, intervalSeconds: 4, autoplay: true,
    showHistory: true, showConsignment: true, promoPlacement: 'interleaved' };
}

function validateSettings(input) {
  const settings = readFields(input, settingsFields);
  if (settings.mode !== 'manual' && settings.mode !== 'automatic' && settings.mode !== 'carousel') invalid();
  if (settings.featuredId !== null && !validId(settings.featuredId)) invalid();
  if (settings.participants !== 'all' && settings.participants !== 'selected') invalid();
  if (typeof settings.includeUnavailable !== 'boolean') invalid();
  if (![4, 6, 8, 10, 15].includes(settings.intervalSeconds)) invalid();
  if (typeof settings.autoplay !== 'boolean') invalid();
  if (typeof settings.showHistory !== 'boolean' || typeof settings.showConsignment !== 'boolean') invalid();
  if (settings.promoPlacement !== 'after' && settings.promoPlacement !== 'interleaved') invalid();
  settings.selectedIds = copyIds(settings.selectedIds);
  return settings;
}

function validateRotation(input) {
  const rotation = readFields(input, rotationFields);
  if (rotation.lastId !== null && !validId(rotation.lastId)) invalid();
  rotation.seenIds = copyIds(rotation.seenIds);
  return rotation;
}

export function readShowcaseSettings(storage) {
  let raw;
  try {
    raw = storage.getItem(SHOWCASE_KEY);
  } catch {
    return { settings: getDefaultShowcaseSettings(), error: 'unavailable', raw: null };
  }
  if (raw === null) return { settings: getDefaultShowcaseSettings(), error: null, raw };
  try {
    if (typeof raw !== 'string') invalid();
    const saved = readFields(JSON.parse(raw), ['version', 'settings']);
    if (saved.version === 1) {
      const legacy = readFields(saved.settings, legacySettingsFields);
      if (legacy.mode !== 'manual' && legacy.mode !== 'automatic') invalid();
      return { settings: validateSettings({ ...legacy, intervalSeconds: 6, autoplay: true,
        showHistory: false, showConsignment: false, promoPlacement: 'after' }), error: null, raw };
    }
    if (saved.version === 2) {
      const previous = readFields(saved.settings, version2SettingsFields);
      return { settings: validateSettings({ ...previous, showHistory: false, showConsignment: false, promoPlacement: 'after' }), error: null, raw };
    }
    if (saved.version !== 3) invalid();
    return { settings: validateSettings(saved.settings), error: null, raw };
  } catch {
    return { settings: getDefaultShowcaseSettings(), error: 'invalid', raw: typeof raw === 'string' ? raw : null };
  }
}

export function persistShowcaseSettings(storage, input, expectedRaw) {
  if (expectedRaw !== null && typeof expectedRaw !== 'string') return { ok: false, error: 'invalid' };
  let settings, raw;
  try {
    settings = validateSettings(input);
    raw = JSON.stringify({ version: 3, settings });
  } catch {
    return { ok: false, error: 'invalid' };
  }
  try {
    if (storage.getItem(SHOWCASE_KEY) !== expectedRaw) return { ok: false, error: 'stale' };
    storage.setItem(SHOWCASE_KEY, raw);
    return { ok: true, settings, raw };
  } catch {
    return { ok: false, error: 'unavailable' };
  }
}

export function getEligibleCars(cars, input) {
  const settings = validateSettings(input);
  const selected = new Set(settings.selectedIds);
  return cars.filter(car => {
    const statusEligible = car.status === 'showcase'
      || (settings.includeUnavailable && (car.status === 'sold' || car.status === 'reserved'));
    return statusEligible && (settings.mode === 'manual' || settings.participants === 'all' || selected.has(car.id));
  });
}

export function getCarouselSlides(cars, input) {
  const settings = validateSettings(input);
  if (settings.mode !== 'carousel') return [];
  const vehicles = getEligibleCars(cars, settings).map(car => ({ id: `vehicle:${car.id}`, kind: 'vehicle', carId: car.id }));
  const promotions = [];
  if (settings.showHistory) promotions.push({ id: 'promo:history', kind: 'history' });
  if (settings.showConsignment) promotions.push({ id: 'promo:consignment', kind: 'consignment' });
  if (settings.promoPlacement === 'after' || !vehicles.length) return [...vehicles, ...promotions];
  const slides = [];
  let from = 0;
  for (const [index, promotion] of promotions.entries()) {
    const to = Math.ceil((index + 1) * vehicles.length / (promotions.length + 1));
    slides.push(...vehicles.slice(from, to), promotion);
    from = to;
  }
  return [...slides, ...vehicles.slice(from)];
}

export function selectFeatured(cars, settings, rotation = emptyRotation(), random = Math.random) {
  const eligible = getEligibleCars(cars, settings);
  if (!eligible.length && settings.mode !== 'carousel') return { car: null, rotation: emptyRotation() };
  let history;
  try {
    history = validateRotation(rotation);
  } catch {
    history = emptyRotation();
  }
  if (settings.mode === 'carousel') return { car: eligible[0] ?? null, rotation: history };
  if (settings.mode === 'manual') {
    return { car: eligible.find(car => car.id === settings.featuredId) ?? eligible[0], rotation: history };
  }
  const eligibleIds = new Set(eligible.map(car => car.id));
  let seenIds = history.seenIds.filter(id => eligibleIds.has(id));
  const seen = new Set(seenIds);
  let candidates = eligible.filter(car => !seen.has(car.id));
  if (!candidates.length) {
    seenIds = [];
    candidates = eligible.length > 1 ? eligible.filter(car => car.id !== history.lastId) : eligible;
  }
  const car = candidates[Math.floor(random() * candidates.length)];
  return { car, rotation: { seenIds: [...seenIds, car.id], lastId: car.id } };
}

export function readRotation(storage) {
  try {
    const raw = storage.getItem(ROTATION_KEY);
    if (typeof raw !== 'string') return emptyRotation();
    const saved = readFields(JSON.parse(raw), ['version', ...rotationFields]);
    if (saved.version !== 1) return emptyRotation();
    return validateRotation({ seenIds: saved.seenIds, lastId: saved.lastId });
  } catch {
    return emptyRotation();
  }
}

export function persistRotation(storage, input) {
  try {
    const rotation = validateRotation(input);
    storage.setItem(ROTATION_KEY, JSON.stringify({ version: 1, ...rotation }));
    return true;
  } catch {
    return false;
  }
}

export function reorderVehicles(cars, ids) {
  if (!Array.isArray(cars) || !Array.isArray(ids) || cars.length !== ids.length) invalid();
  const order = copyIds(ids);
  const byId = new Map();
  for (const car of cars) {
    if (!car || typeof car !== 'object') invalid();
    const id = ownValue(car, 'id');
    if (!validId(id) || byId.has(id)) invalid();
    byId.set(id, car);
  }
  return order.map(id => {
    if (!byId.has(id)) invalid();
    return byId.get(id);
  });
}
