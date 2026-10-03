import { SHOWCASE_KEY, getDefaultShowcaseSettings, readShowcaseSettings, persistShowcaseSettings, getEligibleCars, selectFeatured, readRotation, persistRotation, reorderVehicles } from './showcase-settings.js';
import { attachOrderDrag } from './order-drag.js';

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const situation = { showcase: 'Disponível', reserved: 'Reservado', sold: 'Vendido' };

export function createShowcaseEditor({ getCars, getInventoryError, verifyInventory, saveOrder, openVehicle, stampMarkup }) {
  const $ = id => document.getElementById(id);
  const dialog = $('showcase-editor');
  let initial;
  try { initial = readShowcaseSettings(localStorage); }
  catch { initial = { settings: getDefaultShowcaseSettings(), raw: null, error: 'unavailable' }; }
  let settings = initial.settings, baseline = initial.raw, settingsError = initial.error;
  let featuredId = null, chosen = false, draft = null, orderIds = [], draggedId = null;
  let featuredBaseline = null;

  function featuredSnapshot(value) {
    return JSON.stringify(value.mode === 'manual'
      ? [value.mode, value.includeUnavailable, value.featuredId]
      : [value.mode, value.includeUnavailable, value.participants,
        value.participants === 'selected' ? [...value.selectedIds].sort() : []]);
  }
  function hasFeaturedChanges() {
    return Boolean(draft && featuredBaseline !== null && featuredSnapshot(draft) !== featuredBaseline);
  }
  function hasOrderChanges() {
    const cars = getCars();
    return Boolean(draft && (orderIds.length !== cars.length || orderIds.some((id, index) => id !== cars[index].id)));
  }

  function choose() {
    let rotation;
    try { rotation = readRotation(localStorage); } catch { rotation = { seenIds: [], lastId: null }; }
    const selected = selectFeatured(getCars(), settings, rotation);
    featuredId = selected.car?.id || null;
    chosen = true;
    if (settings.mode === 'automatic' && !settingsError && !getInventoryError()) {
      try { persistRotation(localStorage, selected.rotation); } catch { /* A blocked history must not erase the catalogue. */ }
    }
  }

  function refresh(force = false) {
    const eligible = getEligibleCars(getCars(), settings);
    if (settings.mode === 'manual' || force || !chosen || !eligible.some(car => car.id === featuredId)) choose();
    const car = getCars().find(item => item.id === featuredId);
    $('hero-featured').hidden = !car;
    $('inicio').classList.toggle('hero--empty', !car);
    $('hero-open').disabled = !car;
    if (car) {
      $('hero-image').src = car.photos[0];
      $('hero-image').alt = `${car.make} ${car.title} ${car.year} — veículo em destaque`;
      $('hero-name').textContent = `${car.make} ${car.title}`.toUpperCase();
      $('hero-year').textContent = car.year;
      $('hero-open').setAttribute('aria-label', `Conhecer ${car.title} ${car.year}${car.status === 'showcase' ? '' : ' — '+situation[car.status].toLowerCase()}`);
      $('hero-stage').querySelector('.status-stamp')?.remove();
      $('hero-stage').insertAdjacentHTML('beforeend', stampMarkup(car.status));
    }
    if (dialog.open) sync();
  }
  $('hero-open').onclick = () => { if (featuredId) openVehicle(featuredId); };

  function message(error) {
    return error === 'stale' ? 'A vitrine mudou em outra aba. Recarregue a prévia antes de salvar.' : 'Não foi possível ler ou guardar a configuração da vitrine. Nenhuma alteração foi aplicada. Confira o armazenamento do navegador.';
  }
  function sync() {
    const inventoryError = getInventoryError(), locked = Boolean(inventoryError || settingsError);
    $('showcase-storage-warning').hidden = !locked;
    $('showcase-storage-warning').textContent = locked ? message(inventoryError || settingsError) : '';
    if (inventoryError === 'stale' || settingsError === 'stale') {
      const reload = document.createElement('button');
      reload.type = 'button'; reload.className = 'reset-link'; reload.textContent = 'Recarregar prévia';
      reload.onclick = () => window.location.reload();
      $('showcase-storage-warning').append(document.createElement('br'), reload);
    }
    dialog.querySelectorAll('#featured-form input, #featured-form select, #save-featured').forEach(control => control.disabled = locked);
    $('save-featured').disabled = locked || !hasFeaturedChanges();
    $('save-order').disabled = Boolean(inventoryError) || orderIds.length < 2 || !hasOrderChanges();
    for (const [index, row] of [...$('order-list').querySelectorAll('.order-item')].entries()) {
      row.draggable = !inventoryError;
      row.querySelector('[data-direction="up"]').disabled = Boolean(inventoryError) || index === 0;
      row.querySelector('[data-direction="down"]').disabled = Boolean(inventoryError) || index === orderIds.length-1;
    }
  }

  function renderFeatured() {
    if (!draft) return;
    $('featured-mode').value = draft.mode;
    $('featured-participants').value = draft.participants;
    $('featured-include-unavailable').checked = draft.includeUnavailable;
    $('featured-manual-field').hidden = draft.mode !== 'manual';
    $('featured-automatic-fields').hidden = draft.mode !== 'automatic';
    $('featured-options').hidden = draft.participants !== 'selected';
    const available = getCars().filter(car => draft.includeUnavailable || car.status === 'showcase');
    $('featured-car').replaceChildren(new Option('Primeiro disponível na vitrine', ''));
    for (const car of available) $('featured-car').add(new Option(`${car.title} · ${car.year} — ${situation[car.status]}`, car.id));
    if (!available.some(car => car.id === draft.featuredId)) draft.featuredId = null;
    $('featured-car').value = draft.featuredId || '';
    $('featured-options').innerHTML = available.length ? available.map(car => `<label class="featured-option"><input type="checkbox" value="${esc(car.id)}" ${draft.selectedIds.includes(car.id) ? 'checked' : ''}><span>${esc(car.title)} · ${car.year}<small>${situation[car.status]}</small></span></label>`).join('') : '<p class="field-help">Nenhum veículo disponível para participar. Cadastre um veículo ou inclua reservados e vendidos.</p>';
    sync();
  }
  function renderOrder(focusId, direction) {
    const cars = new Map(getCars().map(car => [car.id, car]));
    $('order-list').innerHTML = orderIds.map((id,index) => {
      const car = cars.get(id);
      return `<li class="order-item" draggable="true" data-order-id="${esc(id)}"><span class="order-handle" aria-hidden="true">⠿</span><span class="order-number">${index+1}</span><img class="order-thumb" src="${esc(car.photos[0])}" alt=""><div class="order-meta"><strong>${esc(car.title)}</strong><small>${car.year} · ${situation[car.status]}</small></div><div class="order-actions"><button type="button" data-direction="up" aria-label="Subir ${esc(car.title)}">↑</button><button type="button" data-direction="down" aria-label="Descer ${esc(car.title)}">↓</button></div></li>`;
    }).join('');
    if (!orderIds.length) $('order-list').innerHTML = '<li class="field-help">A vitrine está vazia. Cadastre um veículo para organizar os anúncios.</li>';
    sync();
    if (focusId) {
      const row = [...$('order-list').children].find(item => item.dataset.orderId === focusId);
      const button = row?.querySelector(`[data-direction="${direction}"]`);
      if (button && !button.disabled) button.focus({preventScroll:true});
      else row?.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
    }
  }
  function open() {
    draft = { ...settings, selectedIds: [...settings.selectedIds] };
    featuredBaseline = null;
    orderIds = getCars().map(car => car.id);
    $('featured-status').textContent = '';
    $('order-status').textContent = '';
    renderFeatured();
    featuredBaseline = featuredSnapshot(draft);
    renderOrder(); dialog.showModal();
  }
  function featuredChanged(render = false) {
    $('featured-status').textContent = '';
    if (render) renderFeatured();
    else sync();
  }
  function orderChanged(focusId, direction) {
    renderOrder(focusId, direction);
    $('order-status').textContent = hasOrderChanges() ? 'Ordem alterada na prévia. Salve para aplicar à vitrine.' : '';
  }
  $('open-showcase-editor').onclick = open;
  $('close-showcase').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { draft = null; featuredBaseline = null; orderIds = []; draggedId = null; });
  $('featured-mode').onchange = () => { draft.mode = $('featured-mode').value; featuredChanged(true); };
  $('featured-car').onchange = () => { draft.featuredId = $('featured-car').value || null; featuredChanged(); };
  $('featured-participants').onchange = () => { draft.participants = $('featured-participants').value; featuredChanged(true); };
  $('featured-include-unavailable').onchange = () => { draft.includeUnavailable = $('featured-include-unavailable').checked; featuredChanged(true); };
  $('featured-options').onchange = () => {
    draft.selectedIds = [...$('featured-options').querySelectorAll('input:checked')].map(input => input.value);
    featuredChanged();
  };
  $('featured-form').onsubmit = event => {
    event.preventDefault();
    if (!hasFeaturedChanges() || settingsError || getInventoryError() || !verifyInventory()) { sync(); return; }
    if (draft.mode === 'automatic' && draft.participants === 'selected' && !getEligibleCars(getCars(), draft).length) {
      $('featured-status').textContent = 'Selecione pelo menos um veículo elegível para o destaque automático.'; return;
    }
    let result;
    try { result = persistShowcaseSettings(localStorage, draft, baseline); }
    catch { result = { ok: false, error: 'unavailable' }; }
    if (!result.ok) {
      if (result.error === 'stale') settingsError = 'stale';
      $('featured-status').textContent = message(result.error); sync(); return;
    }
    settings = result.settings; baseline = result.raw;
    featuredBaseline = featuredSnapshot(draft);
    refresh(true);
    $('featured-status').textContent = featuredId ? 'Destaque salvo apenas neste navegador.' : 'Configuração salva. Sem veículos elegíveis, a imagem de destaque fica oculta.';
  };
  $('order-list').onclick = event => {
    const button = event.target.closest('[data-direction]');
    if (!button || button.disabled || getInventoryError()) return;
    const id = button.closest('[data-order-id]').dataset.orderId, index = orderIds.indexOf(id);
    const next = index + (button.dataset.direction === 'up' ? -1 : 1);
    if (index < 0 || next < 0 || next >= orderIds.length) return;
    [orderIds[index], orderIds[next]] = [orderIds[next], orderIds[index]];
    orderChanged(id, button.dataset.direction);
  };
  $('order-list').ondragstart = event => {
    const row = event.target.closest('[data-order-id]');
    if (!row || getInventoryError()) { event.preventDefault(); return; }
    draggedId = row.dataset.orderId;
    event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', draggedId);
    row.classList.add('is-dragging');
  };
  $('order-list').ondragover = event => {
    if (!draggedId || getInventoryError()) return;
    event.preventDefault(); event.dataTransfer.dropEffect = 'move';
    dialog.querySelectorAll('.drop-target').forEach(row => row.classList.remove('drop-target'));
    event.target.closest('[data-order-id]')?.classList.add('drop-target');
  };
  $('order-list').ondrop = event => {
    event.preventDefault();
    const target = event.target.closest('[data-order-id]')?.dataset.orderId;
    const from = orderIds.indexOf(draggedId), to = orderIds.indexOf(target);
    if (getInventoryError() || from < 0 || to < 0 || from === to) return;
    orderIds.splice(from, 1); orderIds.splice(to, 0, draggedId);
    draggedId = null; orderChanged();
  };
  $('order-list').ondragend = () => { draggedId = null; dialog.querySelectorAll('.is-dragging,.drop-target').forEach(row => row.classList.remove('is-dragging','drop-target')); };
  attachOrderDrag($('order-list'), {
    isLocked: () => Boolean(getInventoryError()) || !dialog.open,
    getIds: () => orderIds,
    onMove: (fromId, toId) => {
      const from = orderIds.indexOf(fromId), to = orderIds.indexOf(toId);
      if (from < 0 || to < 0 || from === to) return;
      orderIds.splice(from, 1); orderIds.splice(to, 0, fromId);
      orderChanged();
    }
  });
  $('save-order').onclick = () => {
    if (!hasOrderChanges() || getInventoryError() || !verifyInventory()) { sync(); return; }
    let result;
    try { result = saveOrder(reorderVehicles(getCars(), orderIds)); }
    catch { result = { ok: false, error: 'invalid' }; }
    $('order-status').textContent = result.ok ? 'Ordem salva. A vitrine está em “Nossa seleção”.' : message(result.error);
    sync();
  };
  window.addEventListener('storage', event => {
    if ((event.key === SHOWCASE_KEY || event.key === null) && event.newValue !== baseline) {
      settingsError = 'stale'; if (dialog.open) sync();
    }
  });
  return { refresh, sync };
}
