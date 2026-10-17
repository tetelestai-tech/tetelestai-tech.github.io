import assert from 'node:assert/strict';
import test from 'node:test';

const api = await import('../src/circuit-motion.mjs').catch(() => ({}));

function scenario({ reduced = false, supported = true } = {}) {
  const events = new Map(); const preferenceEvents = new Map();
  const animations = []; let observer;
  const visual = { attributes: {}, setAttribute(k, v) { this.attributes[k] = v; } };
  const signal = {
    style: {}, animate(frames, options) {
      const animation = { frames, options, cancelled: false,
        cancel() { this.cancelled = true; this.oncancel?.(); } };
      animations.push(animation); return animation;
    },
  };
  visual.querySelector = () => signal;
  const preference = { matches: reduced,
    addEventListener(t, cb) { preferenceEvents.set(t, cb); },
    removeEventListener(t) { preferenceEvents.delete(t); } };
  const env = { matchMedia: () => preference,
    document: { hidden: false, addEventListener(t, cb) { events.set(t, cb); }, removeEventListener(t) { events.delete(t); } },
    addEventListener(t, cb) { events.set(t, cb); }, removeEventListener(t) { events.delete(t); },
    IntersectionObserver: supported ? class {
      constructor(cb) { this.cb = cb; observer = this; }
      observe() {} disconnect() { this.disconnected = true; }
    } : undefined,
  };
  return { visual, signal, env, preference, preferenceEvents, events, animations,
    root: { querySelector: () => visual },
    intersect(visible, ratio = visible ? 1 : 0) { observer?.cb([{ target: visual, isIntersecting: visible, intersectionRatio: ratio }]); },
    get observer() { return observer; } };
}

function start(s) {
  assert.equal(typeof api.createCircuitMotion, 'function');
  return api.createCircuitMotion(s.root, s.env);
}

test('circuit starts only in view, ends within five seconds and never replays on re-entry', () => {
  const s = scenario(); const c = start(s);
  assert.equal(s.animations.length, 0);
  s.intersect(true); s.intersect(true);
  assert.equal(s.animations.length, 1);
  assert.ok(s.animations[0].options.duration <= 5000);
  assert.equal(s.animations[0].options.iterations ?? 1, 1);
  assert.equal(s.animations[0].frames.at(-1).opacity, 0);
  s.animations[0].onfinish(); s.intersect(false); s.intersect(true);
  assert.equal(s.animations.length, 1);
  assert.equal(s.visual.attributes['data-circuit-state'], 'complete');
  assert.deepEqual(s.signal.style, {}); c.destroy();
});

test('circuit falls back to original static image with reduced motion or missing observer', () => {
  for (const options of [{ reduced: true }, { supported: false }]) {
    const s = scenario(options); const c = start(s); s.intersect(true);
    assert.equal(s.animations.length, 0); assert.deepEqual(s.signal.style, {}); c.destroy();
  }
});

test('circuit cancels on leaving the viewport, resize, hidden tab and preference change', () => {
  for (const reason of ['exit', 'resize', 'hidden', 'reduced']) {
    const s = scenario(); const c = start(s); s.intersect(true);
    if (reason === 'exit') s.intersect(false);
    if (reason === 'resize') s.events.get('resize')();
    if (reason === 'hidden') { s.env.document.hidden = true; s.events.get('visibilitychange')(); }
    if (reason === 'reduced') { s.preference.matches = true; s.preferenceEvents.get('change')(); }
    assert.equal(s.animations[0].cancelled, true, reason);
    assert.equal(s.visual.attributes['data-circuit-state'], 'complete');
    s.intersect(true); assert.equal(s.animations.length, 1); c.destroy();
  }
});

test('circuit waits for meaningful visibility and starts when an initially hidden tab returns', () => {
  const s = scenario(); s.env.document.hidden = true; const c = start(s);
  s.intersect(true); assert.equal(s.animations.length, 0);
  s.env.document.hidden = false;
  s.events.get('visibilitychange')();
  assert.equal(s.animations.length, 1); c.destroy();
  const shallow = scenario(); const other = start(shallow);
  shallow.intersect(true, 0.1); assert.equal(shallow.animations.length, 0);
  shallow.intersect(true, 0.3); assert.equal(shallow.animations.length, 1); other.destroy();
});

test('a failed animation keeps the decorative layer static', () => {
  const s = scenario(); const c = start(s);
  s.signal.animate = () => { throw new Error('unsupported animation'); };
  assert.doesNotThrow(() => s.intersect(true));
  assert.equal(s.visual.attributes['data-circuit-state'], 'static'); c.destroy();
});

test('disposing the circuit removes observers and listeners and cancels active decoration', () => {
  const s = scenario(); const c = start(s); s.intersect(true); c.destroy();
  assert.equal(s.animations[0].cancelled, true);
  assert.equal(s.observer.disconnected, true);
  assert.equal(s.events.size, 0); assert.equal(s.preferenceEvents.size, 0);
  s.intersect(true); assert.equal(s.animations.length, 1);
});
