import test from 'node:test';
import assert from 'node:assert/strict';
import { createShowcaseEditor } from '../src/fao-preview/showcase-editor.js';

const showcaseKey = 'fao-preview-showcase-v1';
const inventoryKey = 'test-inventory-order';

// Only the DOM and browser storage boundaries are supplied here. Selection,
// draft changes, drag gestures and showcase serialization use production code.
class Field extends EventTarget {
  value = '';
  checked = false;
  disabled = false;
  hidden = false;
  open = false;
  textContent = '';
  options = [];
  children = [];
  dataset = {};
  attributes = new Map();
  classes = new Set();
  classList = {
    toggle: (name, enabled) => enabled ? this.classes.add(name) : this.classes.delete(name),
    add: (...names) => names.forEach(name => this.classes.add(name)),
    remove: (...names) => names.forEach(name => this.classes.delete(name)),
  };
  constructor(id = '', ownerDocument) { super(); this.id = id; this.ownerDocument = ownerDocument; }
  add(option) { this.options.push(option); }
  replaceChildren(...options) { this.options = options; }
  append(...children) { this.children.push(...children); }
  set innerHTML(html) {
    this.html = html;
    if (this.id === 'featured-options') {
      this.children = [...html.matchAll(/<input type="checkbox" value="([^"]+)"\s*(checked)?/g)].map(([, value, checked]) => {
        const input = new Field();
        input.value = value; input.checked = Boolean(checked);
        return input;
      });
    }
    if (this.id === 'order-list') {
      this.children = [...html.matchAll(/data-order-id="([^"]+)"/g)].map(([, id]) => {
        const row = new Field();
        row.dataset.orderId = id;
        row.parent = this;
        row.handle = new Field();
        row.handle.classes.add('order-handle'); row.handle.parent = row;
        row.children = ['up', 'down'].map(direction => {
          const button = new Field();
          button.dataset.direction = direction; button.parent = row;
          return button;
        });
        return row;
      });
    }
  }
  get innerHTML() { return this.html || ''; }
  querySelectorAll(selector) {
    if (selector.includes('#featured-form')) return this.ownerDocument.featuredControls();
    if (selector === '.order-item') return this.children;
    if (selector === 'input:checked') return this.children.filter(input => input.checked);
    return [];
  }
  querySelector(selector) {
    if (selector === 'button:not(:disabled)') return this.children.find(button => !button.disabled);
    const direction = /data-direction="(up|down)"/.exec(selector)?.[1];
    return direction ? this.children.find(button => button.dataset.direction === direction) : null;
  }
  closest(selector) {
    if (selector === '[data-order-id]' && this.dataset.orderId) return this;
    if (selector === '[data-direction]' && this.dataset.direction) return this;
    if (selector === '.order-handle' && this.classes.has('order-handle')) return this;
    return this.parent?.closest(selector) ?? null;
  }
  contains(node) { return node === this || Boolean(node?.parent && this.contains(node.parent)); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  insertAdjacentHTML(_where, html) { this.html = html; }
  focus() {}
  showModal() { this.open = true; this.ownerDocument?.notifyDialogs(); }
  close() { this.open = false; this.dispatchEvent(new Event('close')); this.ownerDocument?.notifyDialogs(); }
  setPointerCapture(id) { this.pointer = id; }
  hasPointerCapture(id) { return this.pointer === id; }
  releasePointerCapture() { this.pointer = null; }
}

function fixture(t, settingsOverrides = {}, { openEditor = true, reducedMotion = false } = {}) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const fields = new Map();
  const mutationObservers = [], intersectionObservers = [];
  const document = Object.assign(new EventTarget(), {
    body: {}, hidden: false, activeElement: null,
    getElementById(id) {
      if (!fields.has(id)) fields.set(id, new Field(id, document));
      return fields.get(id);
    },
    createElement: () => new Field(),
    featuredControls: () => [
      'featured-mode', 'featured-car', 'featured-participants', 'featured-include-unavailable', 'featured-interval', 'featured-autoplay', 'save-featured',
    ].map(id => document.getElementById(id)).concat(fields.get('featured-options')?.children || []),
    elementFromPoint: (_x, y) => fields.get('order-list').children[Math.floor(y / 100)],
    querySelectorAll: selector => selector === 'dialog[open]' ? [...fields.values()].filter(field => field.open) : [],
    notifyDialogs: () => mutationObservers.forEach(callback => callback([])),
  });
  for (const id of ['hero-carousel-controls', 'hero-previous', 'hero-next', 'hero-toggle', 'hero-count', 'hero-announcement', 'featured-carousel-fields', 'featured-interval', 'featured-autoplay', 'featured-pool-help']) document.getElementById(id);
  fields.get('hero-carousel-controls').hidden = true;
  for (const id of ['hero-open', 'hero-previous', 'hero-next', 'hero-toggle']) document.getElementById(id).parent = document.getElementById('hero-featured');
  const settings = {
    mode: 'manual', featuredId: 'available', participants: 'all', selectedIds: [], includeUnavailable: true,
    intervalSeconds: 6, autoplay: true, ...settingsOverrides,
  };
  const values = new Map([[showcaseKey, JSON.stringify({ version: 2, settings })]]);
  const writes = [], opened = [];
  let storageFailure = false, orderFailure = false, inventoryError = null;
  const globals = {
    document,
    window: Object.assign(new EventTarget(), { matchMedia: () => ({ matches: reducedMotion }) }),
    MutationObserver: class {
      constructor(callback) { mutationObservers.push(callback); }
      observe() {}
      disconnect() {}
    },
    IntersectionObserver: class {
      constructor(callback) { intersectionObservers.push(callback); }
      observe(target) { this.target = target; }
      disconnect() {}
    },
    Option: class { constructor(text, value) { this.text = text; this.value = value; } },
    localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem(key, value) {
        if (storageFailure) throw new Error('Storage unavailable');
        writes.push(key); values.set(key, String(value));
      },
    },
  };
  const previous = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  t.after(() => {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  let cars = [
    { id: 'available', make: 'Ford', title: 'Available', year: 1970, photos: ['available.jpg'], status: 'showcase' },
    { id: 'sold', make: 'Ford', title: 'Sold', year: 1971, photos: ['sold.jpg'], status: 'sold' },
  ];
  const editor = createShowcaseEditor({
    getCars: () => cars,
    getInventoryError: () => inventoryError,
    verifyInventory: () => !inventoryError,
    saveOrder: next => {
      if (orderFailure) return { ok: false, error: 'unavailable' };
      globals.localStorage.setItem(inventoryKey, JSON.stringify(next.map(car => car.id)));
      cars = next;
      editor.refresh();
      return { ok: true };
    },
    openVehicle: id => opened.push(id),
    stampMarkup: status => status === 'showcase' ? '' : `<span class="status-stamp">${status}</span>`,
  });
  for (const callback of intersectionObservers) callback([{ isIntersecting: true }]);
  editor.refresh();
  if (openEditor) fields.get('open-showcase-editor').onclick();
  writes.length = 0;
  const row = id => fields.get('order-list').children.find(item => item.dataset.orderId === id);
  return {
    fields, values, writes, editor, opened,
    change(id, value) {
      const field = fields.get(id);
      if (typeof value === 'boolean') field.checked = value;
      else field.value = value;
      field.onchange?.();
    },
    select(ids) {
      for (const input of fields.get('featured-options').children) input.checked = ids.includes(input.value);
      fields.get('featured-options').onchange();
    },
    save() {
      fields.get('featured-form').onsubmit({ preventDefault() {} });
      return JSON.parse(values.get(showcaseKey)).settings;
    },
    saveOrder() { fields.get('save-order').onclick(); },
    move(method, from, to) {
      const list = fields.get('order-list');
      if (method === 'button') {
        const direction = list.children.indexOf(row(from)) < list.children.indexOf(row(to)) ? 'down' : 'up';
        list.onclick({ target: row(from).querySelector(`[data-direction="${direction}"]`) });
      } else if (method === 'native') {
        list.ondragstart({ target: row(from), dataTransfer: { setData() {} }, preventDefault() {} });
        list.ondrop({ target: row(to), preventDefault() {} });
        list.ondragend();
      } else {
        const target = row(from).handle;
        for (const [type, id] of [['pointerdown', from], ['pointerup', to]]) {
          const event = new Event(type, { cancelable: true });
          Object.defineProperty(event, 'target', { value: target });
          Object.assign(event, { pointerId: 1, button: 0, isPrimary: true,
            clientX: 10, clientY: list.children.indexOf(row(id)) * 100 + 20 });
          list.dispatchEvent(event);
        }
      }
    },
    setStorageFailure(value) { storageFailure = value; },
    setOrderFailure(value) { orderFailure = value; },
    setInventoryError(value) { inventoryError = value; editor.sync(); },
    changePersistedOrder() { cars = [...cars].reverse(); editor.sync(); },
    tick(ms) { t.mock.timers.tick(ms); },
    setCars(next) { cars = next; editor.refresh(); },
    currentCars() { return cars.map(car => ({ ...car, photos: [...car.photos] })); },
    visible(value) {
      document.hidden = !value;
      document.dispatchEvent(new Event('visibilitychange'));
    },
    inViewport(value) { intersectionObservers.forEach(callback => callback([{ isIntersecting: value }])); },
    focus(id) {
      const target = id ? fields.get(id) : null, previous = document.activeElement;
      document.activeElement = target;
      const hero = fields.get('hero-featured');
      const dispatch = (type, from, relatedTarget) => {
        const event = new Event(type, { bubbles: true });
        Object.defineProperties(event, { target: { value: from }, relatedTarget: { value: relatedTarget } });
        hero.dispatchEvent(event);
      };
      if (previous) dispatch('focusout', previous, target);
      if (target) dispatch('focusin', target, previous);
    },
    dialog(id, open) { const element = document.getElementById(id); open ? element.showModal() : element.close(); },
  };
}

test('excluding an unavailable manual choice saves the fallback shown by the selector', t => {
  const { fields, change, save } = fixture(t, { featuredId: 'sold' });
  assert.equal(fields.get('featured-car').value, 'sold');
  change('featured-include-unavailable', false);
  assert.equal(fields.get('featured-car').value, '');
  const saved = save();
  assert.equal(saved.featuredId, null, 'the hidden sold ID must not remain the saved manual choice');
  assert.equal(saved.includeUnavailable, false);
});

test('excluding unavailable vehicles preserves a manual choice that is still eligible', t => {
  const { fields, change, save } = fixture(t);
  change('featured-include-unavailable', false);
  assert.equal(fields.get('featured-car').value, 'available');
  assert.equal(save().featuredId, 'available');
});

test('opening the editor leaves both native save buttons disabled', t => {
  const { fields } = fixture(t);
  assert.equal(fields.get('save-featured').disabled, true);
  assert.equal(fields.get('save-order').disabled, true);
});

test('no-op handlers cannot write storage or reroll the automatic hero', t => {
  const { fields, writes, values, save, saveOrder } = fixture(t, { mode: 'automatic' });
  const before = [...values];
  const photo = fields.get('hero-image').src;
  save(); saveOrder();
  assert.deepEqual(writes, []);
  assert.deepEqual([...values], before);
  assert.equal(fields.get('hero-image').src, photo);
});

test('manual edits enable only featured saving and reverting disables it again', t => {
  const { fields, change, writes, save } = fixture(t);
  change('featured-car', 'sold');
  assert.equal(fields.get('save-featured').disabled, false);
  assert.equal(fields.get('save-order').disabled, true);
  change('featured-car', 'available');
  assert.equal(fields.get('save-featured').disabled, true);
  save();
  assert.deepEqual(writes, []);
});

for (const settings of [{ featuredId: 'deleted' }, { featuredId: 'sold', includeUnavailable: false }]) {
  test(`normalizing the initial unavailable choice ${settings.featuredId} does not create a pending edit`, t => {
    const { fields, writes, save } = fixture(t, settings);
    assert.equal(fields.get('featured-car').value, '');
    assert.equal(fields.get('save-featured').disabled, true);
    save();
    assert.deepEqual(writes, []);
  });
}

test('manual automatic manual round trips ignore fields irrelevant to the final mode', t => {
  const { fields, change, select, writes, save } = fixture(t);
  change('featured-mode', 'automatic');
  change('featured-participants', 'selected');
  select(['sold']);
  change('featured-mode', 'manual');
  assert.equal(fields.get('save-featured').disabled, true);
  save();
  assert.deepEqual(writes, []);
});

test('automatic selections compare as sets and reverting participant mode removes pending changes', t => {
  const { fields, change, select, save, writes } = fixture(t, {
    mode: 'automatic', participants: 'selected', selectedIds: ['sold', 'available'],
  });
  select(['available']);
  assert.equal(fields.get('save-featured').disabled, false);
  select(['available', 'sold']);
  assert.equal(fields.get('save-featured').disabled, true);
  change('featured-participants', 'all');
  assert.equal(fields.get('save-featured').disabled, false);
  change('featured-participants', 'selected');
  assert.equal(fields.get('save-featured').disabled, true);
  save();
  assert.deepEqual(writes, []);
});

test('successful featured saving establishes the next baseline without clearing a pending order', t => {
  const { fields, change, move, save, writes } = fixture(t);
  move('button', 'available', 'sold');
  change('featured-car', 'sold');
  assert.equal(save().featuredId, 'sold');
  assert.equal(fields.get('save-featured').disabled, true);
  assert.equal(fields.get('save-order').disabled, false);
  const savedCount = writes.length;
  save();
  assert.equal(writes.length, savedCount);
  change('featured-car', 'available');
  assert.equal(fields.get('save-featured').disabled, false);
  assert.equal(fields.get('featured-status').textContent, '');
  change('featured-car', 'sold');
  assert.equal(fields.get('save-featured').disabled, true);
});

test('failed featured saving leaves the changed draft available for retry', t => {
  const { fields, change, save, setStorageFailure } = fixture(t);
  change('featured-car', 'sold');
  setStorageFailure(true);
  assert.equal(save().featuredId, 'available');
  assert.equal(fields.get('save-featured').disabled, false);
  assert.match(fields.get('featured-status').textContent, /Não foi possível/);
  setStorageFailure(false);
  assert.equal(save().featuredId, 'sold');
  assert.equal(fields.get('save-featured').disabled, true);
});

test('an empty selected participant draft cannot be saved or become clean', t => {
  const { fields, change, writes, save } = fixture(t);
  change('featured-mode', 'automatic');
  change('featured-participants', 'selected');
  save();
  assert.deepEqual(writes, []);
  assert.match(fields.get('featured-status').textContent, /Selecione pelo menos um/);
  assert.equal(fields.get('save-featured').disabled, false);
});

for (const method of ['button', 'native', 'pointer']) {
  test(`${method} reordering enables save, reverting disables it, and saving establishes a new baseline`, t => {
    const { fields, move, saveOrder, values, writes } = fixture(t);
    move(method, 'available', 'sold');
    assert.equal(fields.get('save-order').disabled, false);
    assert.equal(fields.get('save-featured').disabled, true);
    move(method, 'available', 'sold');
    assert.equal(fields.get('save-order').disabled, true);
    assert.equal(fields.get('order-status').textContent, '');
    saveOrder();
    assert.deepEqual(writes, []);
    move(method, 'available', 'sold');
    saveOrder();
    assert.deepEqual(JSON.parse(values.get(inventoryKey)), ['sold', 'available']);
    assert.equal(fields.get('save-order').disabled, true);
    const savedCount = writes.length;
    saveOrder();
    assert.equal(writes.length, savedCount);
    move(method, 'available', 'sold');
    assert.equal(fields.get('save-order').disabled, false);
    assert.doesNotMatch(fields.get('order-status').textContent, /salva/i);
  });
}

test('successful order saving does not clear pending featured changes', t => {
  const { fields, move, saveOrder, change } = fixture(t);
  change('featured-car', 'sold');
  move('button', 'available', 'sold');
  saveOrder();
  assert.equal(fields.get('save-order').disabled, true);
  assert.equal(fields.get('save-featured').disabled, false);
});

test('order saving compares against the current persisted inventory order', t => {
  const { fields, move, changePersistedOrder, saveOrder, writes } = fixture(t);
  move('button', 'available', 'sold');
  changePersistedOrder();
  assert.equal(fields.get('save-order').disabled, true);
  saveOrder();
  assert.deepEqual(writes, []);
});

test('failed order saving leaves its draft available for retry', t => {
  const { fields, move, saveOrder, setOrderFailure, values } = fixture(t);
  move('button', 'available', 'sold');
  setOrderFailure(true);
  saveOrder();
  assert.equal(values.has(inventoryKey), false);
  assert.equal(fields.get('save-order').disabled, false);
  assert.match(fields.get('order-status').textContent, /Não foi possível/);
  setOrderFailure(false);
  saveOrder();
  assert.deepEqual(JSON.parse(values.get(inventoryKey)), ['sold', 'available']);
  assert.equal(fields.get('save-order').disabled, true);
});

for (const error of ['stale', 'invalid', 'unavailable']) {
  test(`${error} inventory protection overrides both pending save buttons`, t => {
    const { fields, change, move, setInventoryError, save, saveOrder, writes } = fixture(t);
    change('featured-car', 'sold');
    move('button', 'available', 'sold');
    setInventoryError(error);
    assert.equal(fields.get('save-featured').disabled, true);
    assert.equal(fields.get('save-order').disabled, true);
    save(); saveOrder();
    assert.deepEqual(writes, []);
  });
}

test('stale showcase storage blocks the changed featured draft while order remains independent', t => {
  const { fields, change, move, values, save, writes } = fixture(t);
  change('featured-car', 'sold');
  move('button', 'available', 'sold');
  const external = JSON.stringify({ version: 1, settings: {
    mode: 'automatic', featuredId: null, participants: 'all', selectedIds: [], includeUnavailable: false,
  } });
  values.set(showcaseKey, external);
  save();
  assert.equal(values.get(showcaseKey), external);
  assert.deepEqual(writes, []);
  assert.equal(fields.get('save-featured').disabled, true);
  assert.equal(fields.get('save-order').disabled, false);
});

test('carousel navigation updates the current photo, description, stamp and vehicle link without writes', t => {
  const f = fixture(t, { mode: 'carousel' }, { openEditor: false });
  assert.equal(f.fields.get('hero-carousel-controls').hidden, false);
  assert.equal(f.fields.get('hero-count').textContent, '1 / 2');
  assert.equal(f.fields.get('hero-featured').attributes.get('aria-roledescription'), 'carrossel');
  f.fields.get('hero-next').onclick?.();
  assert.equal(f.fields.get('hero-image').src, 'sold.jpg');
  assert.equal(f.fields.get('hero-image').alt, 'Ford Sold 1971 — veículo em destaque');
  assert.equal(f.fields.get('hero-name').textContent, 'FORD SOLD');
  assert.equal(f.fields.get('hero-year').textContent, 1971);
  assert.match(f.fields.get('hero-stage').innerHTML, /sold/);
  assert.equal(f.fields.get('hero-count').textContent, '2 / 2');
  f.fields.get('hero-open').onclick();
  assert.deepEqual(f.opened, ['sold']);
  f.fields.get('hero-previous').onclick?.();
  assert.equal(f.fields.get('hero-image').src, 'available.jpg');
  assert.deepEqual(f.writes, []);
});

test('carousel refreshes preserve the current timer deadline instead of restarting it', t => {
  const f = fixture(t, { mode: 'carousel' }, { openEditor: false });
  f.tick(5000);
  f.editor.refresh();
  f.tick(1000);
  assert.equal(f.fields.get('hero-image').src, 'sold.jpg');
  assert.equal(f.fields.get('hero-announcement').attributes.get('aria-live'), 'off');
  assert.deepEqual(f.writes, []);
});

test('visitor pause survives refresh and can be resumed without saving preferences', t => {
  const f = fixture(t, { mode: 'carousel' }, { openEditor: false });
  f.fields.get('hero-toggle').onclick?.();
  assert.equal(f.fields.get('hero-toggle').textContent, 'Reproduzir');
  f.editor.refresh();
  f.tick(12000);
  assert.equal(f.fields.get('hero-image').src, 'available.jpg');
  f.fields.get('hero-toggle').onclick?.();
  f.tick(6000);
  assert.equal(f.fields.get('hero-image').src, 'sold.jpg');
  assert.deepEqual(f.writes, []);
});

test('carousel follows saved collection order and refreshes edits without retaining deleted slides', t => {
  const f = fixture(t, { mode: 'carousel', autoplay: false }, { openEditor: false });
  const [available, sold] = f.currentCars();
  const reserved = { id: 'reserved', make: 'VW', title: 'Reserved', year: 1972, photos: ['reserved.jpg'], status: 'reserved' };
  f.setCars([available, reserved, sold]);
  f.fields.get('hero-next').onclick?.();
  assert.equal(f.fields.get('hero-image').src, 'reserved.jpg');
  f.setCars([sold, { ...reserved, title: 'Edited', photos: ['edited.jpg'] }, available]);
  assert.equal(f.fields.get('hero-image').src, 'edited.jpg');
  assert.equal(f.fields.get('hero-name').textContent, 'VW EDITED');
  f.fields.get('hero-next').onclick?.();
  assert.equal(f.fields.get('hero-image').src, 'available.jpg');
  f.setCars([sold]);
  assert.equal(f.fields.get('hero-image').src, 'sold.jpg');
  assert.equal(f.fields.get('hero-carousel-controls').hidden, true);
  f.setCars([]);
  assert.equal(f.fields.get('hero-featured').hidden, true);
  assert.equal(f.fields.get('hero-open').disabled, true);
  f.tick(12000);
  assert.deepEqual(f.writes, []);
});

test('selected carousel participants use eligible collection order and hide controls for a single car', t => {
  const f = fixture(t, { mode: 'carousel', participants: 'selected', selectedIds: ['sold', 'available'], includeUnavailable: false }, { openEditor: false });
  assert.equal(f.fields.get('hero-carousel-controls').hidden, true);
  assert.equal(f.fields.get('hero-image').src, 'available.jpg');
  f.tick(12000);
  assert.equal(f.fields.get('hero-image').src, 'available.jpg');
  assert.deepEqual(f.writes, []);
});

for (const blocker of ['hover', 'focus', 'dialog', 'visibility', 'viewport']) {
  test(`${blocker} pauses carousel timing until that interruption ends`, t => {
    const f = fixture(t, { mode: 'carousel' }, { openEditor: false });
    const block = value => {
      if (blocker === 'hover') f.fields.get('hero-featured')[value ? 'onmouseenter' : 'onmouseleave']?.();
      if (blocker === 'focus') f.focus(value ? 'hero-next' : null);
      if (blocker === 'dialog') f.dialog('vehicle-dialog', value);
      if (blocker === 'visibility') f.visible(!value);
      if (blocker === 'viewport') f.inViewport(!value);
    };
    block(true);
    f.tick(6000);
    assert.equal(f.fields.get('hero-image').src, 'available.jpg');
    block(false);
    f.tick(6000);
    assert.equal(f.fields.get('hero-image').src, 'sold.jpg');
  });
}

test('keyboard focus on the Pause control suspends autoplay until focus leaves', t => {
  const f = fixture(t, { mode: 'carousel' }, { openEditor: false });
  f.focus('hero-toggle');
  f.tick(6000);
  assert.equal(f.fields.get('hero-image').src, 'available.jpg');
  f.focus(null);
  f.tick(6000);
  assert.equal(f.fields.get('hero-image').src, 'sold.jpg');
});

test('reduced motion starts paused but explicit Play works with its button focused and survives refresh', t => {
  const f = fixture(t, { mode: 'carousel' }, { openEditor: false, reducedMotion: true });
  f.tick(12000);
  assert.equal(f.fields.get('hero-toggle').textContent, 'Reproduzir');
  assert.equal(f.fields.get('hero-image').src, 'available.jpg');
  f.focus('hero-toggle');
  f.fields.get('hero-toggle').onclick?.();
  f.editor.refresh();
  f.tick(6000);
  assert.equal(f.fields.get('hero-image').src, 'sold.jpg');
  assert.deepEqual(f.writes, []);
});

test('carousel interval and autoplay participate in dirty saving and reverting restores the baseline', t => {
  const f = fixture(t, { mode: 'carousel' });
  assert.equal(f.fields.get('featured-automatic-fields').hidden, false);
  assert.equal(f.fields.get('featured-carousel-fields').hidden, false);
  assert.equal(f.fields.get('featured-interval').value, '6');
  assert.equal(f.fields.get('featured-autoplay').checked, true);
  f.change('featured-interval', '10');
  assert.equal(f.fields.get('save-featured').disabled, false);
  f.change('featured-interval', '6');
  assert.equal(f.fields.get('save-featured').disabled, true);
  f.change('featured-autoplay', false);
  assert.equal(f.fields.get('save-featured').disabled, false);
  f.change('featured-autoplay', true);
  assert.equal(f.fields.get('save-featured').disabled, true);
  f.save();
  assert.deepEqual(f.writes, []);
  f.change('featured-interval', '4');
  f.change('featured-autoplay', false);
  const saved = f.save();
  assert.equal(saved.intervalSeconds, 4);
  assert.equal(saved.autoplay, false);
  assert.equal(f.fields.get('save-featured').disabled, true);
  f.fields.get('close-showcase').onclick();
  f.tick(8000);
  assert.equal(f.fields.get('hero-image').src, 'available.jpg');
  f.fields.get('hero-toggle').onclick?.();
  f.tick(4000);
  assert.equal(f.fields.get('hero-image').src, 'sold.jpg');
  assert.deepEqual(f.writes, [showcaseKey]);
});

test('carousel settings changed in an abandoned mode do not dirty manual or automatic preferences', t => {
  const f = fixture(t, { mode: 'automatic' });
  f.change('featured-mode', 'carousel');
  f.change('featured-interval', '15');
  f.change('featured-autoplay', false);
  f.change('featured-mode', 'automatic');
  assert.equal(f.fields.get('save-featured').disabled, true);
  assert.equal(f.fields.get('featured-carousel-fields').hidden, true);
  assert.match(f.fields.get('featured-pool-help').textContent, /abrir/);
  f.save();
  assert.deepEqual(f.writes, []);
});

test('an empty selected carousel cannot overwrite saved preferences', t => {
  const f = fixture(t, { mode: 'carousel' });
  f.change('featured-participants', 'selected');
  f.save();
  assert.deepEqual(f.writes, []);
  assert.match(f.fields.get('featured-status').textContent, /Selecione pelo menos um/);
  assert.equal(f.fields.get('save-featured').disabled, false);
});

test('cancel discards carousel draft controls and manual mode removes carousel semantics', t => {
  const f = fixture(t, { mode: 'manual' });
  f.change('featured-mode', 'carousel');
  f.change('featured-interval', '15');
  f.fields.get('close-showcase').onclick();
  f.fields.get('open-showcase-editor').onclick();
  assert.equal(f.fields.get('featured-mode').value, 'manual');
  assert.equal(f.fields.get('featured-interval').value, '6');
  assert.equal(f.fields.get('save-featured').disabled, true);
  assert.equal(f.fields.get('hero-carousel-controls').hidden, true);
  assert.equal(f.fields.get('hero-featured').attributes.has('aria-roledescription'), false);
  assert.deepEqual(f.writes, []);
});
