import { vehicles } from './data.js';
import { createStampCustomization } from './stamp-editor.js';
import { INVENTORY_KEY, readInventory, persistInventory, normalizeVehicleStatus } from './vehicle-store.js';
import { formatPrice } from './price.js';
import { createPriceEditor } from './price-editor.js';
import { createShowcaseEditor } from './showcase-editor.js';
import { vehicleDraftSignature } from './vehicle-draft.js';

const $ = id => document.getElementById(id);
const statusLabels = { sold: 'vendido', reserved: 'reservado' };
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize = value => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
let initial, inventoryBaseline = null;
try {
  inventoryBaseline = localStorage.getItem(INVENTORY_KEY);
  initial = readInventory({ getItem: () => inventoryBaseline }, vehicles);
}
catch { initial = { cars: structuredClone(vehicles), error: 'unavailable' }; }
let cars = initial.cars, inventoryError = initial.error;
let editingId = null, draftId = null, draftPhotos = [], draftVersion = 0, draftBusy = false, vehicleBaseline = null;
let activeCar = null, photoIndex = 0, pendingDeleteId = null, toastTimer;
const maxYear = new Date().getFullYear() + 1;
$('edit-year').max = String(maxYear);
const priceEditor = createPriceEditor();

const stampControl = createStampCustomization({
  getPreviewPhoto: () => draftPhotos[0] || vehicles[0].photos[0],
  getPreviewTitle: () => $('edit-title').value.trim() || 'veículo de exemplo',
  onSave: status => {
    render();
    if ($('vehicle-dialog').open && activeCar) {
      const stage = document.querySelector('.photo-stage');
      stage.querySelector('.status-stamp')?.remove();
      stage.insertAdjacentHTML('beforeend', stampControl.markup(activeCar.status));
    }
    $('stamp-manager-status').textContent = `Selo salvo. Aplicado a todos os veículos ${statusLabels[status]}s nesta prévia.`;
  }
});

const showcaseEditor = createShowcaseEditor({
  getCars: () => cars,
  getInventoryError: () => inventoryError,
  verifyInventory,
  openVehicle,
  stampMarkup: status => stampControl.markup(status),
  saveOrder: next => {
    const result = storeCars(next);
    if (result.ok) {
      clearFilters(); render();
      const selected = $('edit-car').value;
      $('edit-car').replaceChildren();
      if (!selected) $('edit-car').add(new Option('Novo veículo', ''));
      for (const car of cars) $('edit-car').add(new Option(`${car.title} · ${car.year}`, car.id));
      $('edit-car').value = selected;
    }
    return result;
  }
});

function verifyInventory() {
  if (inventoryError) return false;
  try {
    if (localStorage.getItem(INVENTORY_KEY) === inventoryBaseline) return true;
    inventoryError = 'stale';
  } catch { inventoryError = 'unavailable'; }
  invalidateUpload();
  return false;
}

function rebuildBrands() {
  const previous = $('brand-filter').value;
  const makes = [...new Set(cars.map(car => car.make))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
  $('brand-filter').replaceChildren(new Option('Todas as marcas', ''));
  for (const make of makes) $('brand-filter').add(new Option(make, make));
  if (makes.includes(previous)) $('brand-filter').value = previous;
}
function render() {
  showcaseEditor.refresh();
  rebuildBrands();
  const list = cars.filter(car => (!$('brand-filter').value || car.make === $('brand-filter').value) && normalize(`${car.make} ${car.title} ${car.year} ${car.trim}`).includes(normalize($('search').value.trim())));
  if ($('sort').value === 'oldest') list.sort((a,b) => a.year - b.year);
  if ($('sort').value === 'newest') list.sort((a,b) => b.year - a.year);
  $('result-count').textContent = `${list.length} ${list.length === 1 ? 'clássico nesta seleção' : 'clássicos nesta seleção'}`;
  $('selection-summary').textContent = 'Referências da FAO e cadastros para experimentar nesta prévia.';
  $('empty').hidden = list.length !== 0;
  $('empty-title').textContent = cars.length ? 'Nenhum veículo encontrado.' : 'Sua vitrine está vazia.';
  $('empty-description').textContent = cars.length ? 'Experimente outra busca ou remova os filtros.' : 'Cadastre um veículo para experimentar a apresentação na vitrine.';
  $('clear-filters').hidden = cars.length === 0;
  $('empty-new-car').hidden = cars.length !== 0;
  $('empty-new-car').disabled = Boolean(inventoryError);
  $('cars').innerHTML = list.map(car => `<article class="car-card"><button data-car="${car.id}" aria-label="Ver ${esc(car.title)} ${car.year}${statusLabels[car.status] ? ' — '+statusLabels[car.status]+' na prévia' : ''}"><div class="car-image"><img src="${esc(car.photos[0])}" alt="${esc(car.title)} ${car.year} — foto do veículo" loading="lazy" width="900" height="600"><span class="year-label">${car.year}</span>${stampControl.markup(car.status)}</div><div class="car-info"><p class="car-make">${esc(car.make.toUpperCase())}</p><h3>${esc(car.title)}</h3><p class="car-trim">${esc(car.trim)}</p><div class="car-bottom"><span>${esc(formatPrice(car.price))}</span><span>Conhecer o carro</span></div></div></button></article>`).join('');
}
function clearFilters() { $('search').value = ''; $('brand-filter').value = ''; $('sort').value = 'default'; }
['search','brand-filter','sort'].forEach(id => $(id).addEventListener(id === 'search' ? 'input' : 'change', render));
$('clear-filters').onclick = () => { clearFilters(); render(); };
$('cars').onclick = event => { const button = event.target.closest('[data-car]'); if (button) openVehicle(button.dataset.car); };

function gallery() {
  if (!activeCar) return;
  $('main-photo').src = activeCar.photos[photoIndex];
  $('main-photo').alt = `${activeCar.title} — foto ${photoIndex+1} de ${activeCar.photos.length}`;
  $('photo-count').textContent = `${photoIndex+1} / ${activeCar.photos.length}`;
  $('thumbnails').innerHTML = activeCar.photos.map((src,index) => `<button data-photo="${index}" aria-label="Ver foto ${index+1}" aria-pressed="${index === photoIndex}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('');
}
function openVehicle(id) {
  activeCar = cars.find(car => car.id === id);
  if (!activeCar) return;
  photoIndex = 0;
  const car = activeCar;
  const situation = car.status === 'sold' ? 'Vendido (simulação)' : car.status === 'reserved' ? 'Reservado (simulação)' : 'Na seleção';
  const note = car.source ? 'Fotos e dados de referência do anúncio original, com possíveis edições nesta demonstração. Confirme preço, estado e disponibilidade com a FAO.' : 'Veículo cadastrado nesta demonstração. Dados e fotos salvos apenas neste navegador, sem publicação no site da FAO.';
  $('vehicle-content').innerHTML = `<div class="vehicle-layout"><div class="vehicle-gallery"><div class="photo-stage"><img id="main-photo" class="main-photo" alt="">${stampControl.markup(car.status)}</div><div class="gallery-controls"><button id="prev-photo" aria-label="Foto anterior">‹</button><span id="photo-count"></span><button id="next-photo" aria-label="Próxima foto">›</button></div><div class="thumbnails" id="thumbnails"></div></div><div class="vehicle-details"><p class="eyebrow">${esc(car.make.toUpperCase())} · ${car.year}</p><h2 id="vehicle-name">${esc(car.title)}</h2><p class="detail-price">${esc(formatPrice(car.price))}</p><dl class="specs"><div><dt>Ano</dt><dd>${car.year}</dd></div><div><dt>Versão</dt><dd>${esc(car.trim)}</dd></div><div><dt>Marca</dt><dd>${esc(car.make)}</dd></div><div><dt>Situação na prévia</dt><dd>${situation}</dd></div></dl><p class="detail-description">${esc(car.description)}</p><p class="detail-note">${note}</p>${car.source ? `<a class="button button-primary" href="${esc(car.source)}" target="_blank" rel="noopener">Consultar anúncio original</a>` : ''}</div></div>`;
  gallery();
  $('prev-photo').onclick = () => { photoIndex = (photoIndex-1+car.photos.length) % car.photos.length; gallery(); };
  $('next-photo').onclick = () => { photoIndex = (photoIndex+1) % car.photos.length; gallery(); };
  $('thumbnails').onclick = event => { const button = event.target.closest('[data-photo]'); if (button) { photoIndex = Number(button.dataset.photo); gallery(); } };
  $('vehicle-dialog').showModal();
}

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); });
});
function currentVehicleSignature() {
  return vehicleDraftSignature({
    make: $('edit-make').value, title: $('edit-title').value, trim: $('edit-trim').value,
    description: $('edit-description').value, year: $('edit-year').value,
    status: $('edit-status').value, priceMode: $('edit-price-mode').value,
    price: $('edit-price').value, photos: draftPhotos,
  });
}
function vehicleChanged() { return vehicleBaseline !== null && currentVehicleSignature() !== vehicleBaseline; }
function syncVehicleSave() { $('save-vehicle').disabled = Boolean(inventoryError) || draftBusy || !vehicleChanged(); }
function syncManagerControls() {
  const locked = Boolean(inventoryError);
  $('manager-storage-warning').hidden = !locked;
  $('manager-storage-warning').textContent = inventoryError === 'stale' ? 'O catálogo mudou em outra aba. Recarregue a prévia para continuar; rascunhos não salvos serão descartados.' : locked ? 'Os dados salvos não puderam ser lidos. Cadastro e exclusão estão bloqueados para preservar suas alterações. Use “Restaurar esta demonstração” somente se quiser descartar os dados locais e voltar aos veículos de referência.' : '';
  if (inventoryError === 'stale') {
    const reload = document.createElement('button');
    reload.type = 'button'; reload.className = 'reset-link'; reload.textContent = 'Recarregar prévia';
    reload.onclick = () => window.location.reload();
    $('manager-storage-warning').append(document.createElement('br'), reload);
  }
  document.querySelectorAll('#edit-form input, #edit-form select, #edit-form textarea').forEach(input => input.disabled = locked);
  priceEditor.syncDisabled(locked);
  showcaseEditor.sync();
  syncVehicleSave();
  $('add-photo').disabled = locked || draftBusy;
  $('new-car').disabled = locked;
  $('delete-car').disabled = locked || draftBusy;
  $('confirm-delete').disabled = locked;
  $('reset-demo').disabled = inventoryError === 'stale';
}
function invalidateUpload() { draftVersion++; draftBusy = false; $('photo-upload').value = ''; syncManagerControls(); }
function loadDraft(id) {
  invalidateUpload();
  const car = cars.find(item => item.id === id);
  editingId = car?.id || null;
  draftId = editingId || `local-${crypto.randomUUID()}`;
  $('edit-form-title').textContent = car ? 'Editar veículo' : 'Cadastrar veículo';
  $('edit-title').value = car?.title || '';
  $('edit-make').value = car?.make || '';
  $('edit-year').value = car?.year || '';
  $('edit-trim').value = car?.trim || '';
  priceEditor.load(car?.price || 'Sob consulta');
  $('edit-description').value = car?.description || '';
  $('edit-status').value = normalizeVehicleStatus(car?.status);
  $('delete-car').hidden = !car;
  $('save-vehicle').textContent = car ? 'Salvar e ver na vitrine' : 'Cadastrar e ver na vitrine';
  $('save-status').textContent = '';
  draftPhotos = car ? [...car.photos] : [];
  vehicleBaseline = currentVehicleSignature();
  renderEditPhotos();
}
function populateManager(preferred = editingId, create = false) {
  $('edit-car').replaceChildren();
  if (create || !cars.length) $('edit-car').add(new Option(cars.length ? 'Novo veículo' : 'Nenhum veículo cadastrado', ''));
  for (const car of cars) $('edit-car').add(new Option(`${car.title} · ${car.year}`, car.id));
  $('edit-car').disabled = !cars.length;
  $('edit-car').value = create ? '' : cars.some(car => car.id === preferred) ? preferred : cars[0]?.id || '';
  loadDraft($('edit-car').value);
}
function openManager(create = false) {
  $('stamp-manager-status').textContent = '';
  populateManager(editingId, create);
  $('manager').showModal();
}
function startNew() { if (inventoryError) return; populateManager(null, true); $('edit-form-title').scrollIntoView({block:'start'}); $('edit-make').focus({preventScroll:true}); }
$('open-manager').onclick = () => openManager();
$('empty-new-car').onclick = () => openManager(true);
$('new-car').onclick = startNew;
$('edit-car').onchange = () => loadDraft($('edit-car').value);
$('cancel-edit').onclick = () => $('manager').close();
$('manager').addEventListener('close', invalidateUpload);
for (const eventName of ['input','change']) $('edit-form').addEventListener(eventName, event => {
  if (event.target.id === 'photo-upload') return;
  syncVehicleSave();
  $('save-status').textContent = vehicleChanged() ? 'Alterações não salvas.' : '';
});
window.addEventListener('storage', event => {
  if ((event.key === INVENTORY_KEY || event.key === null) && event.newValue !== inventoryBaseline) {
    inventoryError = 'stale'; invalidateUpload();
    $('empty-new-car').disabled = true;
    if ($('delete-vehicle-dialog').open) $('delete-vehicle-status').textContent = storageMessage('stale');
  }
});

function renderEditPhotos() {
  $('edit-photos').innerHTML = draftPhotos.length ? draftPhotos.map((src,index) => `<div class="edit-photo"><img src="${esc(src)}" alt="Foto ${index+1} do anúncio em edição">${index === 0 ? '<span>Capa</span>' : ''}<div class="edit-photo-actions"><button type="button" data-move="${index}" ${index === 0 ? 'disabled' : ''} aria-label="Mover foto ${index+1} para a esquerda">‹</button><button type="button" data-cover="${index}" ${index === 0 ? 'disabled' : ''}>Usar capa</button><button type="button" data-remove="${index}" aria-label="Remover foto ${index+1}">×</button></div></div>`).join('') : '<p class="edit-photos-empty">Adicione pelo menos uma foto. A primeira será a capa do anúncio.</p>';
  syncVehicleSave();
}
$('edit-photos').onclick = event => {
  const button = event.target.closest('button');
  if (!button || button.disabled || inventoryError) return;
  if (button.dataset.cover !== undefined) draftPhotos.unshift(...draftPhotos.splice(Number(button.dataset.cover), 1));
  else if (button.dataset.move !== undefined) { const index = Number(button.dataset.move); [draftPhotos[index-1], draftPhotos[index]] = [draftPhotos[index], draftPhotos[index-1]]; }
  else if (button.dataset.remove !== undefined) draftPhotos.splice(Number(button.dataset.remove), 1);
  renderEditPhotos();
  $('save-status').textContent = vehicleChanged() ? 'Alterações não salvas.' : '';
};
$('add-photo').onclick = () => $('photo-upload').click();
$('photo-upload').onchange = async event => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file || inventoryError || draftBusy) return;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8*1024*1024) { $('save-status').textContent = 'Escolha JPEG, PNG ou WebP de até 8 MB.'; return; }
  if (draftPhotos.length >= 8) { $('save-status').textContent = 'Esta demonstração permite até 8 fotos. Remova uma antes de adicionar.'; return; }
  const version = ++draftVersion;
  draftBusy = true; syncManagerControls(); $('save-status').textContent = 'Preparando a foto…';
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    if (version !== draftVersion || !$('manager').open) return;
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1000/Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width*scale)); canvas.height = Math.max(1, Math.round(bitmap.height*scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL('image/webp', .78);
    if (photo.length > 2000000) throw new Error('Photo exceeds local storage limit');
    draftPhotos.push(photo); renderEditPhotos(); $('save-status').textContent = 'Foto adicionada à edição. Salve para aplicar.';
  } catch { if (version === draftVersion && $('manager').open) $('save-status').textContent = 'Não foi possível abrir essa imagem. Tente outro arquivo menor.'; }
  finally { bitmap?.close(); if (version === draftVersion) { draftBusy = false; syncManagerControls(); } }
};
function storeCars(next) {
  if (inventoryError) return { ok: false, error: inventoryError };
  let result;
  try { result = persistInventory(localStorage, next, vehicles, inventoryBaseline); }
  catch { result = { ok: false, error: 'unavailable' }; }
  if (result.ok) {
    cars = result.cars;
    inventoryBaseline = JSON.stringify({ version: 2, vehicles: cars });
  } else if (result.error === 'stale') { inventoryError = 'stale'; invalidateUpload(); }
  return result;
}
function storageMessage(error) {
  if (error === 'stale') return 'O catálogo mudou em outra aba. Recarregue a prévia antes de salvar ou excluir.';
  return error === 'invalid' ? 'Confira os campos e as fotos. Não foi possível validar esse cadastro.' : 'O navegador não conseguiu guardar a alteração. Tente fotos menores ou permita o armazenamento local. Nenhum veículo foi alterado.';
}
function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 5000); }
$('edit-form').onsubmit = event => {
  event.preventDefault();
  if (draftBusy || inventoryError || !vehicleChanged()) return;
  const priceResult = priceEditor.read();
  if (!priceResult.ok) { $('save-status').textContent = 'Confira o preço antes de salvar.'; return; }
  const title = $('edit-title').value.trim(), make = $('edit-make').value.trim(), trim = $('edit-trim').value.trim(), price = priceResult.price, description = $('edit-description').value.trim(), year = Number($('edit-year').value);
  if (!title || !make || !trim || !description) { $('save-status').textContent = 'Preencha marca, modelo, versão e apresentação.'; return; }
  if (!Number.isInteger(year) || year < 1886 || year > maxYear) { $('save-status').textContent = `Informe um ano entre 1886 e ${maxYear}.`; return; }
  if (!draftPhotos.length) { $('save-status').textContent = 'Adicione pelo menos uma foto para cadastrar o veículo.'; return; }
  const creating = !editingId;
  const car = { id: draftId, make, title, trim, year, price, description, status: normalizeVehicleStatus($('edit-status').value), photos: [...draftPhotos] };
  const next = creating ? [car, ...cars] : cars.map(item => item.id === editingId ? car : item);
  const result = storeCars(next);
  if (!result.ok) { $('save-status').textContent = storageMessage(result.error); return; }
  editingId = car.id;
  vehicleBaseline = currentVehicleSignature();
  clearFilters(); render(); $('manager').close();
  document.querySelector(`[data-car="${car.id}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});
  toast(creating ? 'Veículo cadastrado apenas neste navegador.' : 'Veículo atualizado apenas neste navegador.');
};
$('delete-car').onclick = () => {
  if (inventoryError || draftBusy) return;
  const car = cars.find(item => item.id === editingId);
  if (!car) return;
  pendingDeleteId = car.id;
  $('delete-vehicle-description').textContent = `Excluir “${car.title}” (${car.year}) desta prévia?`;
  $('delete-vehicle-status').textContent = '';
  $('delete-vehicle-dialog').showModal(); $('cancel-delete').focus();
};
$('cancel-delete').onclick = () => $('delete-vehicle-dialog').close();
$('delete-vehicle-dialog').addEventListener('close', () => { pendingDeleteId = null; });
$('confirm-delete').onclick = () => {
  if (!pendingDeleteId || inventoryError) return;
  const id = pendingDeleteId;
  if (!cars.some(car => car.id === id)) return;
  const result = storeCars(cars.filter(car => car.id !== id));
  if (!result.ok) { $('delete-vehicle-status').textContent = storageMessage(result.error); return; }
  invalidateUpload(); $('delete-vehicle-dialog').close();
  if (activeCar?.id === id) { activeCar = null; $('vehicle-dialog').close(); }
  render(); populateManager(null); $('save-status').textContent = 'Veículo excluído desta prévia. O site da FAO permanece igual.';
};
$('reset-demo').onclick = () => {
  if (inventoryError === 'stale') return;
  if (!window.confirm('Descartar os cadastros, fotos e alterações locais e restaurar os cinco veículos de referência? Os selos personalizados serão mantidos.')) return;
  try {
    if (localStorage.getItem(INVENTORY_KEY) !== inventoryBaseline) { inventoryError = 'stale'; invalidateUpload(); $('save-status').textContent = storageMessage('stale'); return; }
    localStorage.removeItem(INVENTORY_KEY);
    inventoryBaseline = null;
  }
  catch { $('save-status').textContent = 'Não foi possível restaurar os dados deste navegador.'; return; }
  invalidateUpload(); cars = structuredClone(vehicles); inventoryError = null; editingId = null; activeCar = null;
  clearFilters(); render(); populateManager(); $('save-status').textContent = 'Os cinco veículos de referência foram restaurados. Seus selos foram mantidos.';
};
render();
