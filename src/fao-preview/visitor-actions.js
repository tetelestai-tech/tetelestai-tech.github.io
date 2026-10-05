const WHATSAPP_PHONE = '5561998631878';
const CONTACT_LABELS = {
  showcase: 'Conversar sobre este clássico',
  reserved: 'Consultar disponibilidade',
  sold: 'Procuro um semelhante',
};
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/;
const CONTROLS_EXCEPT_NEWLINES = /[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f-\u009f]/;

function whatsappUrl(message) {
  const query = new URLSearchParams({ phone: WHATSAPP_PHONE, text: message });
  return `https://api.whatsapp.com/send?${query}`;
}

export function getVehicleContact(car) {
  const vehicle = `${car.make} ${car.title} ${car.year}`;
  let message;
  if (car.status === 'sold') {
    message = `Olá! Vi o ${vehicle} na prévia da FAO, apresentado como vendido. Vocês podem me ajudar a encontrar um clássico semelhante?`;
  } else if (car.status === 'reserved') {
    message = `Olá! Vi o ${vehicle} na prévia da FAO, com indicação de reservado. Gostaria de consultar a disponibilidade e as condições.`;
  } else {
    message = `Olá! Vi o ${vehicle} na prévia da FAO. Gostaria de conversar sobre este clássico e confirmar disponibilidade e condições.`;
  }
  return { label: CONTACT_LABELS[car.status] || CONTACT_LABELS.reserved, message, url: whatsappUrl(message) };
}

function knownPublicId(id, seed) {
  return typeof id === 'string' && id.length > 0 && !id.startsWith('local-')
    && Array.isArray(seed) && seed.some(car => car?.id === id);
}

function httpUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch { return null; }
}

export function getVehicleShareUrl(car, seed, baseUrl) {
  if (!knownPublicId(car?.id, seed)) return null;
  const base = httpUrl(baseUrl);
  if (!base) return null;
  const url = new URL(base.origin + base.pathname);
  url.searchParams.set('veiculo', car.id);
  return url.href;
}

export function getRequestedVehicleId(href, seed) {
  const url = httpUrl(href);
  if (!url) return null;
  const ids = url.searchParams.getAll('veiculo');
  return ids.length === 1 && knownPublicId(ids[0], seed) ? ids[0] : null;
}

function normalizeSearch(value) {
  return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function filterVehicles(cars, { search = '', brand = '', status = '', sort = 'default' } = {}) {
  if (!Array.isArray(cars) || typeof search !== 'string' || typeof brand !== 'string'
    || !['', 'showcase', 'reserved', 'sold'].includes(status)) return [];
  const query = normalizeSearch(search.trim());
  const result = cars.filter(car => (!brand || car.make === brand)
    && (!status || car.status === status)
    && normalizeSearch(`${car.make} ${car.title} ${car.year} ${car.trim}`).includes(query));
  if (sort === 'oldest') result.sort((a, b) => a.year - b.year);
  if (sort === 'newest') result.sort((a, b) => b.year - a.year);
  return result;
}

export function buildInquiryContact(input = {}) {
  const model = input?.model;
  const details = input?.details === undefined ? '' : input.details;
  if (typeof model !== 'string' || CONTROL_CHARACTERS.test(model) || !model.trim() || model.trim().length > 100) {
    return { ok: false, error: 'Revise o modelo desejado e use até 100 caracteres.' };
  }
  if (typeof details !== 'string' || CONTROLS_EXCEPT_NEWLINES.test(details) || details.trim().length > 400) {
    return { ok: false, error: 'Revise suas preferências e use até 400 caracteres.' };
  }
  const description = details.trim();
  const message = `Olá! Conheci a prévia da FAO. Vocês podem me ajudar a encontrar este clássico: ${model.trim()}?${description ? `\nDetalhes: ${description}` : ''}`;
  return { ok: true, message, url: whatsappUrl(message) };
}
