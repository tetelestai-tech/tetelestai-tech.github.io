import { parsePrice } from './price.js';
import { normalizeVehicleSpecs } from './vehicle-specs.js';

// Compare the values that would be saved, not the presentation of each input.
export function vehicleDraftSignature(draft) {
  const value = {};
  for (const field of ['make','title','trim','description']) value[field] = String(draft[field] ?? '').trim();
  Object.assign(value, normalizeVehicleSpecs(draft));
  const year = String(draft.year ?? '').trim();
  value.year = year && Number.isFinite(Number(year)) ? Number(year) : year;
  value.status = draft.status;
  value.priceMode = draft.priceMode;
  const price = parsePrice(draft.price);
  value.price = draft.priceMode === 'consultation' ? '' : price?.mode === 'fixed' ? price.digits : String(draft.price ?? '').trim();
  value.photos = draft.photos;
  return JSON.stringify(value);
}
