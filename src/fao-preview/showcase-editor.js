import { SHOWCASE_KEY, getDefaultShowcaseSettings, readShowcaseSettings, persistShowcaseSettings, getEligibleCars, getCarouselSlides, selectFeatured, readRotation, persistRotation, reorderVehicles } from './showcase-settings.js';
import { attachOrderDrag } from './order-drag.js';
import { createHeroCarousel } from './hero-carousel.js';

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const situation = { showcase: 'Disponível', reserved: 'Reservado', sold: 'Vendido' };
const promotions = {
  history: { title: 'Conheça a nossa história', category: 'A FAO', href: './historia/', image: './assets/carousel-history-v2.webp' },
  consignment: { title: 'Apresentar meu veículo', category: 'Consignação', href: './consignacao/', image: './assets/carousel-consignment.webp' },
};

export function createShowcaseEditor({ getCars, getInventoryError, verifyInventory, saveOrder, openVehicle, stampMarkup }) {
  const $ = id => document.getElementById(id);
  const dialog = $('showcase-editor');
  let initial;
  try { initial = readShowcaseSettings(localStorage); }
  catch { initial = { settings: getDefaultShowcaseSettings(), raw: null, error: 'unavailable' }; }
  let settings = initial.settings, baseline = initial.raw, settingsError = initial.error;
  let featuredId = null, chosen = false, draft = null, orderIds = [], draggedId = null;
  let featuredBaseline = null;
  let slides = [];
  let renderedId = null, transition = null;
  const preloadedImages = new Map();
  const hero = $('hero-featured');
  const reducedMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const carousel = createHeroCarousel({
    onChange(id) {
      if (settings.mode !== 'carousel') return;
      featuredId = id;
      renderHero();
    },
    onStateChange: renderCarouselControls,
  });

  function featuredSnapshot(value) {
    return JSON.stringify(value.mode === 'manual'
      ? [value.mode, value.includeUnavailable, value.featuredId]
      : [value.mode, value.includeUnavailable, value.participants,
        value.participants === 'selected' ? [...value.selectedIds].sort() : [],
        ...(value.mode === 'carousel' ? [value.intervalSeconds, value.autoplay, value.showHistory, value.showConsignment,
          ...(value.showHistory || value.showConsignment ? [value.promoPlacement] : [])] : [])]);
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

  function featuredContent(id = featuredId) {
    const slide = settings.mode === 'carousel' ? slides.find(item => item.id === id) : { kind: 'vehicle', carId: id };
    return {
      car: slide?.kind === 'vehicle' ? getCars().find(item => item.id === slide.carId) : null,
      promotion: slide && Object.hasOwn(promotions, slide.kind) ? promotions[slide.kind] : null,
    };
  }
  function syncHeroInteraction() {
    const { car } = featuredContent();
    $('hero-open').disabled = !car || Boolean(transition);
    $('hero-promo-link').inert = Boolean(transition);
    if (transition) $('hero-promo-link').setAttribute('aria-disabled', 'true');
    else $('hero-promo-link').removeAttribute('aria-disabled');
  }
  function clearTransition() {
    const previous = transition;
    transition = null;
    if (previous) {
      previous.image?.removeEventListener('load', previous.onLoad);
      previous.image?.removeEventListener('error', previous.onError);
      previous.animation?.cancel();
      previous.layer.remove();
    }
    syncHeroInteraction();
  }
  function prepareTransition(nextId) {
    if (nextId === renderedId) return null;
    clearTransition();
    if (!renderedId || !nextId || reducedMotion || settings.mode !== 'carousel') return null;
    const promotion = !$('hero-promo-link').hidden;
    const source = promotion ? $('hero-promo-image') : $('hero-stage');
    const image = promotion ? source : $('hero-image');
    const media = hero.querySelector('.hero-media');
    if (!media || !source.cloneNode || !image.complete || !image.naturalWidth) return null;
    const layer = document.createElement('div');
    if (typeof layer.animate !== 'function') return null;
    layer.className = `hero-transition${promotion ? ' hero-transition--promo' : ''}`;
    layer.setAttribute('aria-hidden', 'true');
    layer.inert = true;
    const snapshot = source.cloneNode(true);
    snapshot.removeAttribute('id');
    snapshot.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    const snapshotImage = promotion ? snapshot : snapshot.querySelector('img');
    if (snapshotImage?.style && window.getComputedStyle) {
      const style = window.getComputedStyle(image);
      snapshotImage.style.objectFit = style.objectFit;
      snapshotImage.style.objectPosition = style.objectPosition;
    }
    layer.append(snapshot);
    media.append(layer);
    transition = { layer, animation: null, image: null, onLoad: null, onError: null };
    return transition;
  }
  function finishTransitionWhenReady(current, image) {
    if (!current) return;
    current.image = image;
    current.onLoad = () => {
      if (transition !== current) return;
      image.removeEventListener('load', current.onLoad);
      image.removeEventListener('error', current.onError);
      current.animation = current.layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out', fill: 'forwards' });
      current.animation.onfinish = () => { if (transition === current) clearTransition(); };
    };
    current.onError = () => { if (transition === current) clearTransition(); };
    if (image.complete) {
      if (image.naturalWidth) current.onLoad();
      else current.onError();
    } else {
      image.addEventListener('load', current.onLoad, { once: true });
      image.addEventListener('error', current.onError, { once: true });
    }
  }
  function renderHero() {
    const { car, promotion } = featuredContent();
    const nextId = car ? `vehicle:${car.id}` : promotion ? featuredId : null;
    const nextTransition = prepareTransition(nextId);
    hero.hidden = !car && !promotion;
    $('inicio').classList.toggle('hero--empty', !car && !promotion);
    $('hero-open').hidden = !car;
    $('hero-open').disabled = !car;
    $('hero-promo-link').hidden = !promotion;
    $('hero-stage').querySelector('.status-stamp')?.remove();
    if (promotion) {
      $('hero-promo-link').href = promotion.href;
      $('hero-promo-link').setAttribute('aria-label', promotion.title);
      $('hero-promo-image').src = promotion.image;
      $('hero-promo-image').alt = promotion.title;
      $('hero-name').textContent = promotion.title;
      $('hero-year').textContent = promotion.category;
    }
    if (car) {
      $('hero-image').src = car.photos[0];
      $('hero-image').alt = `${car.make} ${car.title} ${car.year} — veículo em destaque`;
      $('hero-name').textContent = `${car.make} ${car.title}`.toUpperCase();
      $('hero-year').textContent = car.year;
      $('hero-open').setAttribute('aria-label', `Conhecer ${car.title} ${car.year}${car.status === 'showcase' ? '' : ' — '+situation[car.status].toLowerCase()}`);
      $('hero-stage').insertAdjacentHTML('beforeend', stampMarkup(car.status));
    }
    renderedId = nextId;
    syncHeroInteraction();
    finishTransitionWhenReady(nextTransition, promotion ? $('hero-promo-image') : $('hero-image'));
  }
  function renderCarouselControls(state = carousel.getState()) {
    const multiple = settings.mode === 'carousel' && state.ids.length > 1;
    $('hero-carousel-controls').hidden = !multiple;
    $('hero-previous').disabled = !multiple;
    $('hero-next').disabled = !multiple;
    $('hero-toggle').disabled = !multiple;
    $('hero-previous').setAttribute('aria-label', 'Destaque anterior');
    $('hero-next').setAttribute('aria-label', 'Próximo destaque');
    $('hero-toggle').textContent = state.paused ? 'Reproduzir' : 'Pausar';
    $('hero-toggle').setAttribute('aria-label', state.paused ? 'Reproduzir carrossel' : 'Pausar carrossel');
    $('hero-count').textContent = multiple ? `${state.index + 1} / ${state.ids.length}` : '';
    if (multiple) {
      hero.setAttribute('role', 'region');
      hero.setAttribute('aria-roledescription', 'carrossel');
      hero.setAttribute('aria-label', 'Destaques da página inicial');
    } else {
      hero.removeAttribute?.('role');
      hero.removeAttribute?.('aria-roledescription');
      hero.removeAttribute?.('aria-label');
    }
    const announcement = $('hero-announcement');
    announcement.setAttribute('aria-live', state.running ? 'off' : 'polite');
    const { car, promotion } = featuredContent(state.id);
    const description = promotion?.title || (car ? `${car.make} ${car.title}, ${car.year}` : '');
    announcement.textContent = multiple && description ? `Destaque ${state.index + 1} de ${state.ids.length}: ${description}.` : '';
    if (multiple && typeof Image === 'function') {
      const next = featuredContent(state.ids[(state.index + 1) % state.ids.length]);
      const src = next.promotion?.image || next.car?.photos[0];
      if (src && !preloadedImages.has(src)) {
        const preload = new Image();
        preload.decoding = 'async';
        preloadedImages.set(src, preload);
        preload.src = src;
      }
    }
  }
  function refresh(force = false) {
    const eligible = getEligibleCars(getCars(), settings);
    if (settings.mode === 'carousel') {
      slides = getCarouselSlides(getCars(), settings);
      const state = carousel.configure({
        ids: slides.map(slide => slide.id), initialId: slides[0]?.id,
        intervalMs: settings.intervalSeconds * 1000, autoplay: settings.autoplay && !reducedMotion, reset: force,
      });
      featuredId = state.id;
      chosen = true;
    } else {
      slides = [];
      carousel.configure({ ids: [], autoplay: false });
      if (settings.mode === 'manual' || force || !chosen || !eligible.some(car => car.id === featuredId)) choose();
    }
    renderHero();
    renderCarouselControls();
    if (dialog.open) sync();
  }
  $('hero-open').onclick = () => {
    const { car } = featuredContent();
    if (car && !transition) openVehicle(car.id);
  };
  $('hero-previous').onclick = () => carousel.previous();
  $('hero-next').onclick = () => carousel.next();
  $('hero-toggle').onclick = () => {
    if (carousel.getState().paused) carousel.setBlocked('focus', false);
    carousel.togglePause();
  };
  hero.onmouseenter = () => carousel.setBlocked('hover', true);
  hero.onmouseleave = () => carousel.setBlocked('hover', false);
  const updateFocus = target => carousel.setBlocked('focus', Boolean(target && hero.contains?.(target)));
  hero.addEventListener('focusin', event => updateFocus(event.target));
  hero.addEventListener('focusout', event => updateFocus(event.relatedTarget));
  const syncDialogs = () => carousel.setBlocked('dialog', Boolean(document.querySelectorAll?.('dialog[open]')?.length || dialog.open));
  const syncVisibility = () => carousel.setBlocked('hidden', Boolean(document.hidden));
  document.addEventListener?.('visibilitychange', syncVisibility);
  if (typeof MutationObserver === 'function' && document.body) {
    new MutationObserver(syncDialogs).observe(document.body, { attributes: true, attributeFilter: ['open'], childList: true, subtree: true });
  }
  if (typeof IntersectionObserver === 'function') {
    carousel.setBlocked('viewport', true);
    new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1];
      if (entry) carousel.setBlocked('viewport', !entry.isIntersecting);
    }).observe(hero);
  }
  syncDialogs();
  syncVisibility();

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
    $('featured-interval').value = String(draft.intervalSeconds);
    $('featured-autoplay').checked = draft.autoplay;
    $('featured-show-history').checked = draft.showHistory;
    $('featured-show-consignment').checked = draft.showConsignment;
    $('featured-promo-placement').value = draft.promoPlacement;
    $('featured-promo-placement-field').hidden = !draft.showHistory && !draft.showConsignment;
    $('featured-manual-field').hidden = draft.mode !== 'manual';
    $('featured-automatic-fields').hidden = draft.mode === 'manual';
    $('featured-carousel-fields').hidden = draft.mode !== 'carousel';
    $('featured-pool-help').textContent = draft.mode === 'carousel'
      ? 'O carrossel segue a Ordem da coleção. Escolha quais veículos participam.'
      : 'O modo automático sorteia um veículo apenas ao abrir a página. Escolha quais veículos participam.';
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
    renderOrder(); dialog.showModal(); syncDialogs();
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
  dialog.addEventListener('close', () => { draft = null; featuredBaseline = null; orderIds = []; draggedId = null; syncDialogs(); });
  $('featured-mode').onchange = () => { draft.mode = $('featured-mode').value; featuredChanged(true); };
  $('featured-car').onchange = () => { draft.featuredId = $('featured-car').value || null; featuredChanged(); };
  $('featured-participants').onchange = () => { draft.participants = $('featured-participants').value; featuredChanged(true); };
  $('featured-include-unavailable').onchange = () => { draft.includeUnavailable = $('featured-include-unavailable').checked; featuredChanged(true); };
  $('featured-interval').onchange = () => { draft.intervalSeconds = Number($('featured-interval').value); featuredChanged(); };
  $('featured-autoplay').onchange = () => { draft.autoplay = $('featured-autoplay').checked; featuredChanged(); };
  $('featured-show-history').onchange = () => { draft.showHistory = $('featured-show-history').checked; featuredChanged(true); };
  $('featured-show-consignment').onchange = () => { draft.showConsignment = $('featured-show-consignment').checked; featuredChanged(true); };
  $('featured-promo-placement').onchange = () => { draft.promoPlacement = $('featured-promo-placement').value; featuredChanged(); };
  $('featured-options').onchange = () => {
    draft.selectedIds = [...$('featured-options').querySelectorAll('input:checked')].map(input => input.value);
    featuredChanged();
  };
  $('featured-form').onsubmit = event => {
    event.preventDefault();
    if (!hasFeaturedChanges() || settingsError || getInventoryError() || !verifyInventory()) { sync(); return; }
    if (draft.mode !== 'manual' && draft.participants === 'selected') {
      const available = draft.mode === 'carousel' ? getCarouselSlides(getCars(), draft) : getEligibleCars(getCars(), draft);
      if (!available.length) {
        $('featured-status').textContent = 'Selecione pelo menos um veículo elegível para os destaques.'; return;
      }
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
    $('featured-status').textContent = featuredId ? 'Destaques salvos apenas neste navegador.' : 'Configuração salva. Sem veículos elegíveis, a imagem de destaque fica oculta.';
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
    $('order-status').textContent = result.ok ? 'Ordem salva. Aplicada à coleção e à sequência do carrossel.' : message(result.error);
    sync();
  };
  window.addEventListener('storage', event => {
    if ((event.key === SHOWCASE_KEY || event.key === null) && event.newValue !== baseline) {
      settingsError = 'stale'; if (dialog.open) sync();
    }
  });
  return { refresh, sync };
}
