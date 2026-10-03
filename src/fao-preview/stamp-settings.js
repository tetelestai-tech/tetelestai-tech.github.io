export const STAMP_STORAGE_KEY = 'fao-preview-stamp-v1';
export const RESERVED_STAMP_STORAGE_KEY = 'fao-preview-reserved-stamp-v1';
export const MAX_STAMP_DATA_LENGTH = 1800000;
export const DEFAULT_STAMP_SETTINGS = Object.freeze({
  src: './assets/sold-stamp-soft-white.png',
  position: 'top-left',
  size: 'medium',
  width: 1536,
  height: 1024,
});

const reservedStampSettings = Object.freeze({
  src: './assets/reserved-stamp-soft-white.png',
  position: 'top-left',
  size: 'medium',
  width: 1536,
  height: 1024,
});
const stampConfigurations = {
  sold: { storageKey: STAMP_STORAGE_KEY, defaults: DEFAULT_STAMP_SETTINGS },
  reserved: { storageKey: RESERVED_STAMP_STORAGE_KEY, defaults: reservedStampSettings },
};

function getStampConfiguration(status) {
  if (status !== 'sold' && status !== 'reserved') {
    throw new RangeError('Stamp status must be sold or reserved.');
  }
  return stampConfigurations[status];
}

// Unsupported statuses throw RangeError in defaults, normalization and reads.
// Persistence catches that error and reports ok: false without accessing storage.
export function getDefaultStampSettings(status = 'sold') {
  return { ...getStampConfiguration(status).defaults };
}

const positions = new Set(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
const sizes = new Set(['small', 'medium', 'large']);
const isImageDimension = value => Number.isInteger(value) && value >= 1 && value <= 900;

function isEmbeddedRaster(src) {
  if (typeof src !== 'string' || src.length > MAX_STAMP_DATA_LENGTH) return false;
  const prefix = /^data:image\/(?:png|jpeg|webp);base64,/.exec(src);
  if (!prefix) return false;
  const data = src.slice(prefix[0].length);
  if (!data.length || data.length % 4 !== 0) return false;
  const match = /^[A-Za-z0-9+/]+={0,2}$/.exec(data);
  return match !== null && match[0].length === data.length;
}

export function normalizeStampSettings(input, status = 'sold') {
  const settings = getDefaultStampSettings(status);
  if (!input || typeof input !== 'object' || Array.isArray(input)) return settings;
  try {
    // Read only own data properties; inherited fields and accessors are not settings.
    const own = field => Object.getOwnPropertyDescriptor(input, field)?.value;
    const position = own('position');
    const size = own('size');
    if (positions.has(position)) settings.position = position;
    if (sizes.has(size)) settings.size = size;
    const src = own('src');
    const width = own('width');
    const height = own('height');
    if (isImageDimension(width) && isImageDimension(height) && isEmbeddedRaster(src)) {
      settings.src = src;
      settings.width = width;
      settings.height = height;
    }
  } catch {
    return getDefaultStampSettings(status);
  }
  return settings;
}

export function readStampSettings(storage, status = 'sold') {
  const { storageKey, defaults } = getStampConfiguration(status);
  try {
    return normalizeStampSettings(JSON.parse(storage.getItem(storageKey)), status);
  } catch {
    return { ...defaults };
  }
}

export function persistStampSettings(storage, input, status = 'sold') {
  try {
    const { storageKey } = getStampConfiguration(status);
    const settings = normalizeStampSettings(input, status);
    storage.setItem(storageKey, JSON.stringify(settings));
    return { ok: true, settings };
  } catch {
    return { ok: false };
  }
}

export function fitStampDimensions(width, height, maxEdge = 900) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || !isImageDimension(maxEdge)) {
    throw new RangeError('Image dimensions must be positive finite numbers and the limit an integer from 1 to 900.');
  }
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.min(maxEdge, Math.round(width * scale))),
    height: Math.max(1, Math.min(maxEdge, Math.round(height * scale))),
  };
}
