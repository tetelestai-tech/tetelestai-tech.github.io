import test from 'node:test';
import assert from 'node:assert/strict';

const module = await import('../src/fao-preview/hero-carousel.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND' && error.url?.endsWith('/hero-carousel.js')) return {};
  throw error;
});

function fakeClock() {
  let now = 0, nextId = 0;
  const timers = new Map();
  return {
    setTimeoutFn(callback, delay) {
      assert.ok(Number.isFinite(delay) && delay > 0, 'a carousel timer needs a positive finite delay');
      const id = nextId++;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeoutFn(id) { timers.delete(id); },
    advance(milliseconds) {
      const end = now + milliseconds;
      for (;;) {
        const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > end) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].callback();
      }
      now = end;
    },
    get count() { return timers.size; },
    get callback() { return [...timers.values()][0]?.callback; },
  };
}

function fixture(options = {}) {
  assert.equal(typeof module.createHeroCarousel, 'function', 'the hero carousel controller must be implemented');
  const clock = fakeClock(), changes = [], states = [];
  const carousel = module.createHeroCarousel({ ...clock, ...options, onChange: id => changes.push(id), onStateChange: state => states.push(state) });
  return { carousel, clock, changes, states };
}

test('an empty carousel cannot schedule or navigate to a nonexistent item', () => {
  const { carousel, clock, changes, states } = fixture();
  carousel.configure({ ids: [], autoplay: true });
  carousel.next(); carousel.previous(); clock.advance(60000);
  assert.deepEqual(carousel.getState(), { ids: [], index: -1, id: null, paused: false, running: false });
  assert.equal(clock.count, 0);
  assert.deepEqual(changes, []);
  assert.deepEqual(states, []);
});

test('a single item remains visible without a timer or duplicate change callbacks', () => {
  const { carousel, clock, changes } = fixture();
  carousel.configure({ ids: ['alpha'], initialId: 'missing' });
  carousel.next(); carousel.previous(); clock.advance(60000);
  assert.deepEqual(carousel.getState(), { ids: ['alpha'], index: 0, id: 'alpha', paused: false, running: false });
  assert.equal(clock.count, 0);
  assert.deepEqual(changes, ['alpha']);
});

test('automatic navigation starts at the selected item and wraps with one pending timer', () => {
  const { carousel, clock, changes } = fixture();
  carousel.configure({ ids: ['alpha', 'bravo', 'charlie'], initialId: 'bravo' });
  assert.equal(carousel.getState().running, true);
  assert.equal(clock.count, 1);
  clock.advance(5999);
  assert.equal(carousel.getState().id, 'bravo');
  clock.advance(1);
  assert.equal(carousel.getState().id, 'charlie');
  clock.advance(6000);
  assert.equal(carousel.getState().id, 'alpha');
  assert.equal(clock.count, 1);
  assert.deepEqual(changes, ['bravo', 'charlie', 'alpha']);
});

test('manual navigation wraps in both directions and restarts the full interval', () => {
  const { carousel, clock } = fixture();
  carousel.configure({ ids: ['alpha', 'bravo', 'charlie'] });
  clock.advance(4000);
  carousel.previous();
  assert.equal(carousel.getState().id, 'charlie');
  clock.advance(5999);
  assert.equal(carousel.getState().id, 'charlie');
  clock.advance(1);
  assert.equal(carousel.getState().id, 'alpha');
  carousel.next();
  assert.equal(carousel.getState().id, 'bravo');
  assert.equal(clock.count, 1);
});

test('equivalent configure refreshes preserve the active item and elapsed interval', () => {
  const { carousel, clock, changes, states } = fixture();
  carousel.configure({ ids: ['alpha', 'bravo'], initialId: 'alpha', autoplay: true });
  clock.advance(4000);
  const stateCount = states.length;
  carousel.configure({ ids: ['alpha', 'bravo'], initialId: 'bravo', autoplay: true });
  assert.equal(states.length, stateCount);
  clock.advance(2000);
  assert.deepEqual(changes, ['alpha', 'bravo']);
  assert.equal(clock.count, 1);
});

test('duplicate and empty IDs are removed without allowing callers to mutate carousel state', () => {
  const { carousel, changes, states } = fixture();
  const ids = ['alpha', '', 'alpha', null, ' ', 'bravo', 17];
  carousel.configure({ ids, initialId: 'bravo' });
  ids.push('charlie');
  const state = carousel.getState();
  state.ids.push('delta'); state.index = 99;
  states[0].ids.length = 0;
  assert.deepEqual(carousel.getState(), { ids: ['alpha', 'bravo'], index: 1, id: 'bravo', paused: false, running: true });
  assert.deepEqual(changes, ['bravo']);
});

test('list changes preserve an eligible item, then fall back safely after its deletion', () => {
  const { carousel, clock, changes } = fixture();
  carousel.configure({ ids: ['alpha', 'bravo', 'charlie'], initialId: 'bravo' });
  carousel.configure({ ids: ['charlie', 'alpha', 'bravo'] });
  assert.equal(carousel.getState().index, 2);
  assert.deepEqual(changes, ['bravo']);
  carousel.configure({ ids: ['charlie', 'delta'], initialId: 'missing' });
  assert.equal(carousel.getState().id, 'charlie');
  carousel.configure({ ids: ['echo', 'foxtrot'], initialId: 'foxtrot' });
  assert.equal(carousel.getState().id, 'foxtrot');
  carousel.configure({ ids: [] });
  assert.deepEqual(carousel.getState(), { ids: [], index: -1, id: null, paused: false, running: false });
  assert.equal(clock.count, 0);
  assert.deepEqual(changes, ['bravo', 'charlie', 'foxtrot', null]);
});

test('reset reapplies the initial selection and configured autoplay state', () => {
  const { carousel, clock } = fixture();
  carousel.configure({ ids: ['alpha', 'bravo'], autoplay: true });
  carousel.togglePause();
  carousel.configure({ initialId: 'bravo', reset: true });
  assert.deepEqual(carousel.getState(), { ids: ['alpha', 'bravo'], index: 1, id: 'bravo', paused: false, running: true });
  assert.equal(clock.count, 1);
  carousel.configure({ initialId: 'missing', autoplay: false, reset: true });
  assert.equal(carousel.getState().id, 'alpha');
  assert.equal(carousel.getState().paused, true);
  assert.equal(clock.count, 0);
});

test('an interval change cancels the old deadline and invalid updates retain the last valid interval', () => {
  const { carousel, clock } = fixture({ intervalMs: 8000 });
  carousel.configure({ ids: ['alpha', 'bravo'] });
  clock.advance(3000);
  carousel.configure({ intervalMs: 1000 });
  clock.advance(999);
  assert.equal(carousel.getState().id, 'alpha');
  clock.advance(1);
  assert.equal(carousel.getState().id, 'bravo');
  for (const intervalMs of [0, -1, NaN, Infinity, '1000', 2147483648]) carousel.configure({ intervalMs });
  clock.advance(1000);
  assert.equal(carousel.getState().id, 'alpha');
  assert.equal(clock.count, 1);
});

test('independent blockers stop rotation until every reason is released', () => {
  const { carousel, clock } = fixture();
  carousel.configure({ ids: ['alpha', 'bravo', 'charlie'] });
  carousel.setBlocked('hover', true);
  carousel.setBlocked('hidden', true);
  assert.equal(carousel.getState().paused, false);
  assert.equal(carousel.getState().running, false);
  assert.equal(clock.count, 0);
  carousel.next();
  assert.equal(carousel.getState().id, 'bravo');
  carousel.setBlocked('hover', false);
  clock.advance(60000);
  assert.equal(carousel.getState().id, 'bravo');
  carousel.setBlocked('hidden', false);
  clock.advance(5999);
  assert.equal(carousel.getState().id, 'bravo');
  clock.advance(1);
  assert.equal(carousel.getState().id, 'charlie');
  assert.equal(clock.count, 1);
});

test('visitor pause survives refreshes, manual navigation and temporary blockers', () => {
  const { carousel, clock } = fixture();
  carousel.configure({ ids: ['alpha', 'bravo'], autoplay: true });
  carousel.togglePause();
  carousel.configure({ ids: ['alpha', 'bravo'], autoplay: true });
  carousel.setBlocked('focus', true);
  carousel.next();
  carousel.setBlocked('focus', false);
  carousel.configure({ ids: ['bravo', 'alpha'], autoplay: true });
  clock.advance(60000);
  assert.equal(carousel.getState().paused, true);
  assert.equal(carousel.getState().id, 'bravo');
  assert.equal(clock.count, 0);
  carousel.togglePause();
  clock.advance(6000);
  assert.equal(carousel.getState().id, 'alpha');
});

test('a changed autoplay preference is applied while an unchanged preference preserves visitor play', () => {
  const { carousel, clock } = fixture();
  carousel.configure({ ids: ['alpha', 'bravo'], autoplay: false });
  assert.equal(carousel.getState().paused, true);
  carousel.togglePause();
  carousel.configure({ autoplay: false });
  assert.equal(carousel.getState().running, true);
  carousel.configure({ autoplay: true });
  carousel.togglePause();
  carousel.configure({ autoplay: false });
  assert.equal(carousel.getState().paused, true);
  carousel.configure({ autoplay: true });
  assert.equal(carousel.getState().paused, false);
  assert.equal(clock.count, 1);
});

test('callbacks report only actual item or public state changes', () => {
  const { carousel, changes, states } = fixture();
  carousel.configure({ ids: ['alpha', 'bravo'] });
  carousel.configure({ intervalMs: 1000 });
  carousel.setBlocked('hover', true);
  carousel.setBlocked('hover', true);
  carousel.setBlocked('hidden', true);
  carousel.setBlocked('hover', false);
  assert.equal(states.length, 2);
  assert.deepEqual(changes, ['alpha']);
  carousel.setBlocked('hidden', false);
  assert.equal(states.length, 3);
  carousel.next();
  assert.equal(states.length, 4);
  assert.deepEqual(changes, ['alpha', 'bravo']);
});

test('a callback from an already canceled deadline cannot advance or add a second timer', () => {
  const { carousel, clock } = fixture();
  carousel.configure({ ids: ['alpha', 'bravo', 'charlie'] });
  const expiredCallback = clock.callback;
  carousel.next();
  expiredCallback();
  assert.equal(carousel.getState().id, 'bravo');
  assert.equal(clock.count, 1);
  clock.advance(6000);
  assert.equal(carousel.getState().id, 'charlie');
});

test('destroy cancels rotation and makes later controls and queued callbacks inert', () => {
  const { carousel, clock, changes, states } = fixture();
  carousel.configure({ ids: ['alpha', 'bravo'] });
  const queuedCallback = clock.callback;
  carousel.destroy();
  const finalState = carousel.getState(), finalCount = states.length;
  carousel.configure({ ids: ['charlie', 'delta'], reset: true });
  carousel.next(); carousel.previous(); carousel.togglePause();
  carousel.setBlocked('hover', false); carousel.destroy(); queuedCallback();
  clock.advance(60000);
  assert.deepEqual(carousel.getState(), finalState);
  assert.equal(finalState.running, false);
  assert.equal(clock.count, 0);
  assert.deepEqual(changes, ['alpha']);
  assert.equal(states.length, finalCount);
});

for (const [action, change] of [
  ['pause', carousel => carousel.togglePause()],
  ['block', carousel => carousel.setBlocked('image-loading', true)],
  ['destroy', carousel => carousel.destroy()],
]) {
  test(`an onChange callback that requests ${action} cannot publish or return an obsolete running state`, () => {
    const clock = fakeClock(), states = [];
    let carousel;
    carousel = module.createHeroCarousel({
      ...clock,
      onChange(id) { if (id === 'bravo') change(carousel); },
      onStateChange(state) { states.push(state); },
    });
    carousel.configure({ ids: ['alpha', 'bravo'] });
    const returned = carousel.next();
    assert.equal(carousel.getState().running, false);
    assert.deepEqual(states.at(-1), carousel.getState());
    assert.deepEqual(returned, carousel.getState());
    assert.equal(states.filter(state => state.id === 'bravo').length, 1);
    assert.equal(clock.count, 0);
  });
}

test('a reentrant no-op does not suppress the pending item state notification', () => {
  const clock = fakeClock(), states = [];
  let carousel;
  carousel = module.createHeroCarousel({
    ...clock,
    onChange() { carousel.setBlocked('unused', false); },
    onStateChange(state) { states.push(state); },
  });
  carousel.configure({ ids: ['alpha', 'bravo'] });
  carousel.next();
  assert.deepEqual(states.map(state => state.id), ['alpha', 'bravo']);
  assert.deepEqual(states.at(-1), carousel.getState());
  assert.equal(clock.count, 1);
});
