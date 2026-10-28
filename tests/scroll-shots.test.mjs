import assert from 'node:assert/strict';
import test from 'node:test';
import { createScrollShots, shotDuration, SHOT_TIMING } from '../src/scroll-shots.mjs';

const tick = () => new Promise(resolve => setImmediate(resolve));

function element(props = {}) {
  const e = {
    dataset: {}, classes: new Set(), listeners: {}, children: [], attrs: {}, props: {},
    style: { setProperty(name, value) { e.props[name] = value; } },
    classList: { add: name => e.classes.add(name), remove: name => e.classes.delete(name), contains: name => e.classes.has(name) },
    addEventListener(type, fn) { (e.listeners[type] ??= []).push(fn); },
    removeEventListener(type, fn) { e.listeners[type] = (e.listeners[type] ?? []).filter(item => item !== fn); },
    fire(type, event = {}) { for (const fn of [...(e.listeners[type] ?? [])]) fn(event); },
    appendChild(child) { e.children.push(child); },
    setAttribute(name, value) { e.attrs[name] = value; },
    contains(other) { return other === e || e.inside?.includes(other); },
    ...props,
  };
  return e;
}

function scenario({ fine = true, reduced = false, saveData = false, pairs = 1 } = {}) {
  const zone = element();
  const shots = Array.from({ length: pairs }, (_, index) => {
    const poster = { naturalWidth: index ? 375 : 1265, naturalHeight: index ? 812 : 889 };
    const shot = element({ closest: () => zone, querySelector: () => poster, clientWidth: 600, clientHeight: 422 });
    shot.dataset.full = index ? '/assets/portfolio/x-mobile-full.webp' : '/assets/portfolio/x-desktop-full.webp';
    return shot;
  });
  const images = [];
  let observer;
  const env = element({
    matchMedia: query => ({ matches: query.includes('reduce') ? reduced : query.includes('hover') ? fine : false }),
    navigator: { connection: { saveData } },
    document: { createElement: () => { const img = element({ offsetHeight: 0, decode: async () => {} }); images.push(img); return img; } },
    setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: id => clearTimeout(id),
    requestAnimationFrame: fn => fn(),
    IntersectionObserver: class {
      constructor(callback, options) { this.callback = callback; this.options = options; this.observed = new Set(); observer = this; }
      observe(target) { this.observed.add(target); }
      disconnect() { this.observed.clear(); }
    },
  });
  const root = { querySelectorAll: selector => (selector === '.shot[data-full]' ? shots : []) };
  return { env, root, zone, shots, images, get observer() { return observer; } };
}

async function loadAll(images, sizes) {
  images.forEach((img, index) => Object.assign(img, sizes[index]));
  for (const img of images) await img.onload();
  await tick();
}

test('the duration grows with the length of the page, within the limits', () => {
  assert.equal(shotDuration(1265, 8361, 889 / 1265), 9.2, 'Feijuca desktop: about 8.4 screens');
  assert.equal(shotDuration(1265, 1676, 889 / 1265), SHOT_TIMING.min, 'a short page still moves calmly');
  assert.equal(shotDuration(375, 11020, 812 / 375), SHOT_TIMING.max, 'a very long page is capped');
  assert.equal(shotDuration(0, 0, 1), SHOT_TIMING.min);
});

test('with reduced motion or Save-Data nothing is downloaded or listened to', () => {
  for (const options of [{ reduced: true }, { saveData: true }]) {
    const s = scenario(options);
    createScrollShots(s.root, s.env);
    assert.deepEqual(s.zone.listeners, {});
    assert.equal(s.images.length, 0);
  }
});

test('mouse: the full page loads only on hover, scrolls, and returns to the top on leave', async () => {
  const s = scenario({ pairs: 2 });
  createScrollShots(s.root, s.env);
  assert.equal(s.images.length, 0, 'nothing extra downloads with the page');
  s.zone.fire('pointerenter', { pointerType: 'touch' });
  assert.equal(s.images.length, 0, 'a touch does not count as hover');
  s.zone.fire('pointerenter', { pointerType: 'mouse' });
  assert.deepEqual(s.images.map(img => img.src), ['/assets/portfolio/x-desktop-full.webp', '/assets/portfolio/x-mobile-full.webp']);
  assert.equal(s.images[0].attrs['aria-hidden'], 'true');
  await loadAll(s.images, [{ naturalWidth: 1265, naturalHeight: 8361 }, { naturalWidth: 375, naturalHeight: 4682 }]);
  const [desktop, phone] = s.shots;
  assert.ok(desktop.classes.has('is-ready') && desktop.classes.has('is-scrolling'));
  assert.ok(phone.classes.has('is-scrolling'), 'browser and phone of the same pair scroll together');
  assert.equal(desktop.props['--shot-dur'], '9.2s');
  assert.equal(phone.props['--shot-dur'], `${shotDuration(375, 4682, 812 / 375)}s`);
  s.zone.fire('pointerleave', { pointerType: 'mouse' });
  assert.ok(!desktop.classes.has('is-scrolling') && desktop.classes.has('is-ready'), 'back to the top, the image stays loaded');
  s.zone.fire('pointerenter', { pointerType: 'mouse' });
  await tick();
  assert.equal(s.images.length, 2, 'a second hover reuses the image');
  assert.ok(desktop.classes.has('is-scrolling'));
});

test('keyboard focus inside the card behaves like hover', async () => {
  const s = scenario();
  const link = {};
  s.zone.inside = [link];
  createScrollShots(s.root, s.env);
  s.zone.fire('focusin');
  await loadAll(s.images, [{ naturalWidth: 1265, naturalHeight: 4000 }]);
  assert.ok(s.shots[0].classes.has('is-scrolling'));
  s.zone.fire('focusout', { relatedTarget: link });
  assert.ok(s.shots[0].classes.has('is-scrolling'), 'moving focus within the card keeps it going');
  s.zone.fire('focusout', { relatedTarget: null });
  assert.ok(!s.shots[0].classes.has('is-scrolling'));
});

test('touch: plays when the card is in view, only after the visitor scrolls, and resets when it leaves', async () => {
  const s = scenario({ fine: false });
  createScrollShots(s.root, s.env);
  assert.equal(s.observer.observed.size, 0, 'nothing is armed before the first scroll');
  s.env.fire('scroll');
  assert.ok(s.observer.observed.has(s.zone));
  s.observer.callback([{ target: s.zone, isIntersecting: true, intersectionRatio: 0.3 }]);
  assert.equal(s.images.length, 0, 'a card barely in view does not start');
  s.observer.callback([{ target: s.zone, isIntersecting: true, intersectionRatio: 0.7 }]);
  await loadAll(s.images, [{ naturalWidth: 1265, naturalHeight: 4000 }]);
  assert.ok(s.shots[0].classes.has('is-scrolling'));
  s.observer.callback([{ target: s.zone, isIntersecting: false, intersectionRatio: 0 }]);
  assert.ok(!s.shots[0].classes.has('is-scrolling'));
});

test('destroy removes every listener and stops the movement', async () => {
  const s = scenario();
  const shots = createScrollShots(s.root, s.env);
  s.zone.fire('pointerenter', { pointerType: 'mouse' });
  await loadAll(s.images, [{ naturalWidth: 1265, naturalHeight: 4000 }]);
  shots.destroy();
  assert.ok(!s.shots[0].classes.has('is-scrolling'));
  assert.ok(Object.values(s.zone.listeners).every(list => list.length === 0));
});
