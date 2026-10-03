import { getDefaultStampSettings, MAX_STAMP_DATA_LENGTH, readStampSettings, persistStampSettings, fitStampDimensions } from './stamp-settings.js';

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function createStampCustomization({ getPreviewPhoto, getPreviewTitle, onSave }) {
  const $ = id => document.getElementById(id);
  const dialog = $('stamp-editor');
  const labels = { sold: 'vendido', reserved: 'reservado' };
  const settings = {};
  for (const status of Object.keys(labels)) {
    settings[status] = getDefaultStampSettings(status);
    try { settings[status] = readStampSettings(localStorage, status); } catch { /* Storage may be unavailable. */ }
  }
  let editingStatus = 'sold', draft = null, uploadVersion = 0, busy = false;

  function markup(status = 'sold', value = settings[status]) {
    if (!Object.hasOwn(labels, status)) return '';
    const standard = value.src === getDefaultStampSettings(status).src;
    return `<span class="status-stamp${standard ? ' status-stamp--default' : ''}" data-status="${status}" data-position="${esc(value.position)}" data-size="${esc(value.size)}" role="img" aria-label="Veículo ${labels[status]} nesta demonstração"><img src="${esc(value.src)}" width="${value.width}" height="${value.height}" alt="" aria-hidden="true" decoding="async"></span>`;
  }
  function hasChanges() {
    return !!draft && ['src', 'position', 'size', 'width', 'height'].some(key => draft[key] !== settings[editingStatus][key]);
  }
  function updateSaveState() {
    $('save-stamp').disabled = busy || !hasChanges();
  }
  function setBusy(value) {
    busy = value;
    updateSaveState();
    $('choose-stamp').disabled = value;
    $('stamp-editor-form').setAttribute('aria-busy', String(value));
  }
  function preview() {
    if (!draft) return;
    $('stamp-preview-overlay').innerHTML = markup(editingStatus, draft);
    $('stamp-size').value = draft.size;
    dialog.querySelectorAll('[name="stamp-position"]').forEach(input => input.checked = input.value === draft.position);
    $('stamp-file-label').textContent = draft.src === getDefaultStampSettings(editingStatus).src ? `Selo padrão de ${labels[editingStatus]}` : `Imagem personalizada de ${labels[editingStatus]}`;
    updateSaveState();
  }
  function open(status) {
    if (!Object.hasOwn(labels, status)) return;
    editingStatus = status;
    uploadVersion++;
    draft = { ...settings[status] };
    setBusy(false);
    $('stamp-upload').value = '';
    $('stamp-status').textContent = '';
    $('stamp-editor-title').textContent = `Personalizar selo de ${labels[status]}`;
    $('stamp-editor-description').textContent = `Escolha a imagem e como ela aparece sobre as fotos. A configuração vale para todos os veículos ${labels[status]}s, apenas neste navegador.`;
    $('stamp-preview-note').textContent = `A imagem original é preservada. Este selo só aparece nos carros marcados como ${labels[status]}s.`;
    $('stamp-preview-photo').src = getPreviewPhoto();
    $('stamp-preview-photo').alt = 'Foto de ' + getPreviewTitle() + ' para testar o selo';
    $('stamp-preview-caption').textContent = 'Exemplo com ' + getPreviewTitle() + '. A situação deste carro não será alterada.';
    preview();
    dialog.showModal();
  }
  $('open-stamp-editor').onclick = () => open('sold');
  $('open-reserved-stamp-editor').onclick = () => open('reserved');
  $('cancel-stamp').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { uploadVersion++; draft = null; setBusy(false); $('stamp-upload').value = ''; });
  dialog.querySelectorAll('[name="stamp-position"]').forEach(input => input.addEventListener('change', () => {
    if (draft && input.checked) { draft.position = input.value; preview(); }
  }));
  $('stamp-size').onchange = () => { if (draft) { draft.size = $('stamp-size').value; preview(); } };
  $('restore-stamp').onclick = () => {
    uploadVersion++;
    draft = getDefaultStampSettings(editingStatus);
    setBusy(false);
    $('stamp-upload').value = '';
    preview();
    $('stamp-status').textContent = 'Padrão restaurado na prévia. Salve para aplicar.';
  };
  $('choose-stamp').onclick = () => $('stamp-upload').click();
  $('stamp-upload').onchange = async event => {
    const input = event.target, file = input.files[0];
    input.value = '';
    if (!file || !draft) return;
    if (!['image/png', 'image/webp', 'image/jpeg'].includes(file.type) || file.size > 4 * 1024 * 1024) {
      $('stamp-status').textContent = 'Escolha uma imagem PNG, WebP ou JPEG de até 4 MB.';
      return;
    }
    const version = ++uploadVersion;
    setBusy(true);
    $('stamp-status').textContent = 'Preparando o selo…';
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
      if (version !== uploadVersion || !dialog.open || !draft) return;
      const { width, height } = fitStampDimensions(bitmap.width, bitmap.height);
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
      const src = canvas.toDataURL('image/webp', .92);
      if (src.length > MAX_STAMP_DATA_LENGTH) throw new Error('Image is too large for local storage');
      draft = { ...draft, src, width, height };
      preview();
      $('stamp-status').textContent = 'Imagem pronta. Escolha posição e tamanho e salve para aplicar.';
    } catch {
      if (version === uploadVersion && dialog.open) $('stamp-status').textContent = 'Não foi possível preparar esta imagem. Tente outro arquivo menor.';
    } finally {
      if (bitmap) bitmap.close();
      if (version === uploadVersion) setBusy(false);
    }
  };
  $('stamp-editor-form').onsubmit = event => {
    event.preventDefault();
    if (busy || !hasChanges()) return;
    let result;
    try { result = persistStampSettings(localStorage, draft, editingStatus); } catch { result = { ok: false }; }
    if (!result.ok) {
      $('stamp-status').textContent = 'O navegador não conseguiu guardar o selo. Tente uma imagem menor ou permita o armazenamento local.';
      return;
    }
    settings[editingStatus] = result.settings;
    updateSaveState();
    onSave(editingStatus);
    dialog.close();
  };
  document.addEventListener('error', event => {
    const image = event.target;
    if (image.matches?.('.status-stamp img')) {
      const stamp = image.closest('.status-stamp');
      if (!Object.hasOwn(labels, stamp.dataset.status)) return;
      const defaults = getDefaultStampSettings(stamp.dataset.status);
      if (image.getAttribute('src') === defaults.src) return;
      image.src = defaults.src;
      image.width = defaults.width;
      image.height = defaults.height;
      stamp.classList.add('status-stamp--default');
    }
  }, true);
  updateSaveState();
  return { markup };
}
