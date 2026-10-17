import assert from 'node:assert/strict';
import test from 'node:test';

const api = await import('../src/art-motion.mjs').catch(() => ({}));

function scenario({ reduced = false, supported = true } = {}) {
  const events = new Map();
  const preferenceEvents = new Map();
  const animations = [];
  const nodes = Array.from({ length: 3 }, () => ({
    attributes: {}, style: {}, parentElement: null,
    matches() { return false; },
    setAttribute(name, value) { this.attributes[name] = value; },
    animate(frames, options) {
      const animation = {
        node: this, frames, options, cancelled: false,
        cancel() { this.cancelled = true; this.oncancel?.(); },
      };
      animations.push(animation);
      return animation;
    },
  }));
  let observer;
  const preference = {
    matches: reduced,
    addEventListener(type, callback) { preferenceEvents.set(type, callback); },
    removeEventListener(type) { preferenceEvents.delete(type); },
  };
  const env = {
    matchMedia: () => preference,
    document: { hidden: false, addEventListener(type, cb) { events.set(type, cb); }, removeEventListener(type) { events.delete(type); } },
    addEventListener(type, callback) { events.set(type, callback); },
    removeEventListener(type) { events.delete(type); },
    IntersectionObserver: supported ? class {
      constructor(callback) { this.callback = callback; this.observed = new Set(); observer = this; }
      observe(node) { this.observed.add(node); }
      unobserve(node) { this.observed.delete(node); }
      disconnect() { this.observed.clear(); this.disconnected = true; }
    } : undefined,
  };
  return { nodes, animations, env, preference, events, preferenceEvents,
    root: { querySelectorAll: () => nodes },
    enter(node) { observer?.callback([{ target: node, isIntersecting: true }]); },
    get observer() { return observer; },
  };
}

function start(s) {
  assert.equal(typeof api.createArtMotion, 'function', 'createArtMotion must implement the requested motion lifecycle');
  return api.createArtMotion(s.root, s.env);
}

test('content stays in its base state until a visible item starts a one-time reveal', () => {
  const s = scenario(); const control = start(s);
  assert.equal(s.animations.length, 0);
  assert.ok(s.nodes.every(node => Object.keys(node.style).length === 0));
  s.enter(s.nodes[0]); s.enter(s.nodes[0]);
  assert.equal(s.animations.length, 1, 're-entry must not replay the reveal');
  s.animations[0].onfinish();
  assert.equal(s.nodes[0].attributes['data-motion-state'], 'complete');
  assert.ok(s.animations[0].options.duration <= 700);
  control.destroy();
});

test('reduced motion and missing observer keep every item static and available', () => {
  for (const options of [{ reduced: true }, { supported: false }]) {
    const s = scenario(options); const control = start(s);
    s.enter(s.nodes[0]);
    assert.equal(s.animations.length, 0);
    assert.ok(s.nodes.every(node => Object.keys(node.style).length === 0));
    control.destroy();
  }
});

test('changing preference or layout cancels animation without leaving invisible inline styles', () => {
  for (const reason of ['reduced', 'resize', 'hidden']) {
    const s = scenario(); const control = start(s); s.enter(s.nodes[0]);
    if (reason === 'reduced') { s.preference.matches = true; s.preferenceEvents.get('change')(); }
    if (reason === 'resize') s.events.get('resize')();
    if (reason === 'hidden') { s.env.document.hidden = true; s.events.get('visibilitychange')(); }
    assert.equal(s.animations[0].cancelled, true);
    assert.equal(s.nodes[0].attributes['data-motion-state'], 'complete');
    assert.deepEqual(s.nodes[0].style, {});
    control.destroy();
  }
});

test('a failed animation and a disposed controller cannot hide content or keep observers active', () => {
  const s = scenario(); s.nodes[0].animate = () => { throw new Error('animation unavailable'); };
  const control = start(s);
  assert.doesNotThrow(() => s.enter(s.nodes[0]));
  assert.deepEqual(s.nodes[0].style, {});
  control.destroy();
  assert.equal(s.observer.disconnected, true);
  assert.equal(s.events.size, 0);
  assert.equal(s.preferenceEvents.size, 0);
  s.enter(s.nodes[1]);
  assert.equal(s.animations.length, 0);
});
