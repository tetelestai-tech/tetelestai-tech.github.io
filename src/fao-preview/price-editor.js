import { parsePrice, formatPrice } from './price.js';

const digitInput = /^\d{0,12}$/;
const fixedHelp = 'Digite somente números, em reais inteiros. Exemplo: 5000000 vira R$ 5.000.000 ao sair do campo.';
const invalidMessage = 'Informe um valor inteiro maior que zero, com até 12 dígitos, ou escolha Sob consulta.';
const rejectedMessage = 'Entrada não aceita. Digite somente números, sem sinais, pontos ou centavos, e confira o valor antes de salvar.';

export function createPriceEditor() {
  const mode = document.getElementById('edit-price-mode');
  const input = document.getElementById('edit-price');
  const help = document.getElementById('price-help');
  const error = document.getElementById('price-error');
  let digits = '', locked = false, rejected = false, legacy = '';

  function showError(message = '') {
    error.textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
  }
  function syncDisabled(value = locked) {
    locked = Boolean(value);
    mode.disabled = locked;
    input.disabled = locked || mode.value !== 'fixed';
    input.required = mode.value === 'fixed';
  }
  function showHelp() {
    help.textContent = mode.value === 'consultation'
      ? 'O anúncio exibirá Sob consulta.'
      : legacy ? `Valor anterior: “${legacy}”. Informe um valor em reais ou escolha Sob consulta.` : fixedHelp;
  }
  function load(value) {
    const parsed = parsePrice(value);
    mode.value = parsed?.mode || 'fixed';
    digits = parsed?.digits || '';
    legacy = parsed ? '' : formatPrice(value);
    rejected = false;
    input.value = parsed?.mode === 'fixed' ? parsed.formatted : '';
    showError(legacy ? 'O preço anterior precisa de uma escolha explícita antes de salvar.' : '');
    showHelp();
    syncDisabled();
  }
  function read() {
    if (locked) return { ok: false };
    if (mode.value === 'consultation') return { ok: true, price: 'Sob consulta' };
    const parsed = parsePrice(input.value);
    if (mode.value !== 'fixed' || rejected || legacy || parsed?.mode !== 'fixed') {
      showError(rejected ? rejectedMessage : invalidMessage);
      return { ok: false };
    }
    showError();
    return { ok: true, price: parsed.formatted };
  }
  function reject(event) {
    event?.preventDefault();
    rejected = true;
    showError(rejectedMessage);
  }
  function validInsertion(text) {
    if (!/^\d+$/.test(text) || text.length > 12) return false;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    return digitInput.test(input.value.slice(0, start) + text + input.value.slice(end));
  }

  mode.addEventListener('change', () => {
    if (locked) return;
    rejected = false;
    if (mode.value === 'consultation') legacy = '';
    showError();
    showHelp();
    syncDisabled();
  });
  input.addEventListener('focus', () => {
    if (!input.disabled) input.value = digits;
  });
  input.addEventListener('beforeinput', event => {
    if (locked || mode.value !== 'fixed') { event.preventDefault(); return; }
    if (event.inputType?.startsWith('insert') && typeof event.data === 'string' && !validInsertion(event.data)) reject(event);
  });
  input.addEventListener('paste', event => {
    if (locked || mode.value !== 'fixed') { event.preventDefault(); return; }
    const text = event.clipboardData?.getData('text');
    if (typeof text !== 'string' || !validInsertion(text)) reject(event);
  });
  input.addEventListener('input', () => {
    if (locked || mode.value !== 'fixed') return;
    if (!digitInput.test(input.value)) {
      input.value = digits;
      reject();
      return;
    }
    digits = input.value;
    rejected = false;
    legacy = '';
    showError();
    showHelp();
  });
  input.addEventListener('blur', () => {
    if (locked || mode.value !== 'fixed' || rejected || legacy) return;
    const parsed = parsePrice(input.value);
    if (parsed?.mode === 'fixed') {
      digits = parsed.digits;
      input.value = parsed.formatted;
      showError();
    } else showError(invalidMessage);
  });

  return { load, read, syncDisabled };
}
