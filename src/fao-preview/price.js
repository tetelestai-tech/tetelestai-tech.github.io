const MAX_DIGITS = 12;

export function parsePrice(value) {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value <= 0) return null;
    value = String(value);
  }
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (/^(?:consulte|sob consulta)$/i.test(text)) {
    return { mode: 'consultation', digits: '', formatted: 'Sob consulta' };
  }
  // Legacy BRL punctuation has meaning: validate it before removing it.
  const amount = text.replace(/^R\$[ \u00a0\u202f]*/, '');
  const match = /^(\d+|\d{1,3}(?:\.\d{3})+)(?:,00)?$/.exec(amount);
  if (!match || match[0].length !== amount.length) return null;
  const rawDigits = match[1].replaceAll('.', '');
  if (rawDigits.length > MAX_DIGITS) return null;
  const digits = rawDigits.replace(/^0+/, '');
  if (!digits) return null;
  return { mode: 'fixed', digits, formatted: 'R$ ' + digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') };
}

export function formatPrice(value) {
  const parsed = parsePrice(value);
  if (parsed) return parsed.formatted;
  if (typeof value === 'string') return value;
  return typeof value === 'number' ? String(value) : '';
}
