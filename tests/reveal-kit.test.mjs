import assert from 'node:assert/strict';
import test from 'node:test';
import { createReveal, REVEAL_FROM } from '../src/reveal-kit.mjs';

function node(reveal = '', group = null) {
  return {
    dataset: { reveal }, classes: new Set(), animations: [],
    classList: { add(name) { this.owner.classes.add(name); }, remove(name) { this.owner.classes.delete(name); } },
    closest(selector) { return selector === '[data-reveal-group]' ? group : null; },
    animate(frames, options) { this.animations.push({ frames, options }); return {}; },
  };
}

function scenario({ reduced = false, supported = true, items = [] } = {}) {
  for (const item of items) item.classList.owner = item;
  const htmlClasses = new Set(['js']);
  let observer;
  const env = {
    matchMedia: () => ({ matches: reduced }),
    document: { documentElement: { animate: supported ? () => ({}) : undefined, classList: { remove(name) { htmlClasses.delete(name); } } } },
    IntersectionObserver: supported ? class {
      constructor(callback, options) { this.callback = callback; this.options = options; this.observed = new Set(); observer = this; }
      observe(item) { this.observed.add(item); }
      unobserve(item) { this.observed.delete(item); }
      disconnect() { this.observed.clear(); }
    } : undefined,
  };
  return {
    env, htmlClasses, root: { querySelectorAll: () => items },
    enter(...targets) { observer.callback(targets.map(target => ({ target, isIntersecting: true }))); },
    get observer() { return observer; },
  };
}

test('items are revealed once with the kit timing, and the page reports that the mechanism ran', () => {
  const item = node('esquerda');
  const s = scenario({ items: [item] });
  createReveal(s.root, s.env);
  assert.equal(s.env.__reveal, true);
  assert.deepEqual(s.observer.options, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
  s.enter(item);
  assert.ok(item.classes.has('is-in'));
  assert.equal(item.animations.length, 1);
  const [{ frames, options }] = item.animations;
  assert.deepEqual(frames, [{ opacity: 0, transform: REVEAL_FROM.esquerda }, { opacity: 1, transform: 'none' }]);
  assert.deepEqual(options, { duration: 600, easing: 'cubic-bezier(.2,.7,.2,1)', delay: 0, fill: 'backwards' });
  assert.ok(!s.observer.observed.has(item), 'a revealed item is no longer observed');
});

test('a group that enters together is staggered by 80 ms; an item entering alone does not wait', () => {
  const group = {};
  const items = [node('', group), node('', group), node('', group), node('', group)];
  const s = scenario({ items });
  createReveal(s.root, s.env);
  s.enter(items[0], items[1], items[2]);
  assert.deepEqual(items.slice(0, 3).map(item => item.animations[0].options.delay), [0, 80, 160]);
  assert.equal(items[0].animations[0].frames[0].transform, REVEAL_FROM.sobe, 'empty value means sobe');
  s.enter(items[3]);
  assert.equal(items[3].animations[0].options.delay, 0);
});

test('reduced motion reveals without animating', () => {
  const item = node('zoom');
  const s = scenario({ reduced: true, items: [item] });
  createReveal(s.root, s.env);
  s.enter(item);
  assert.ok(item.classes.has('is-in'));
  assert.equal(item.animations.length, 0);
});

test('without IntersectionObserver or WAAPI nothing stays hidden', () => {
  const item = node('');
  const s = scenario({ supported: false, items: [item] });
  createReveal(s.root, s.env);
  assert.ok(!s.htmlClasses.has('js'), 'the hiding class is removed');
  assert.ok(item.classes.has('is-in'));
  assert.equal(s.env.__reveal, undefined);
});
