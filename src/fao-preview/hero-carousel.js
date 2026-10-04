const DEFAULT_INTERVAL = 6000;
const validInterval = value => typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 2147483647;
const sameIds = (left, right) => left.length === right.length && left.every((id, index) => id === right[index]);

export function createHeroCarousel({ onChange = () => {}, onStateChange = () => {}, setTimeoutFn = setTimeout, clearTimeoutFn = clearTimeout, intervalMs = DEFAULT_INTERVAL } = {}) {
  let ids = [], index = -1, paused = false, autoplay = true, destroyed = false;
  let delay = validInterval(intervalMs) ? intervalMs : DEFAULT_INTERVAL;
  let timer = null, timerVersion = 0, stateVersion = 0;
  const blockers = new Set();

  function canRun() { return !destroyed && ids.length > 1 && !paused && blockers.size === 0; }
  function getState() { return { ids: [...ids], index, id: ids[index] ?? null, paused, running: canRun() }; }
  function stopTimer() {
    timerVersion++;
    if (timer !== null) clearTimeoutFn(timer);
    timer = null;
  }
  function sync(before, restart = false) {
    if (restart || !canRun()) stopTimer();
    if (canRun() && timer === null) {
      const version = timerVersion;
      timer = setTimeoutFn(() => {
        if (version !== timerVersion || !canRun()) return;
        timer = null;
        move(1);
      }, delay);
    }
    const state = getState();
    const changed = state.index !== before.index || state.paused !== before.paused || state.running !== before.running || !sameIds(state.ids, before.ids);
    const version = changed ? ++stateVersion : stateVersion;
    if (state.id !== before.id) onChange(state.id);
    // A callback can pause, block or destroy the controller before this notification.
    if (changed && version === stateVersion) onStateChange(state);
    return getState();
  }
  function configure(options = {}) {
    if (destroyed || !options || typeof options !== 'object') return getState();
    const before = getState();
    const nextIds = options.ids === undefined ? ids : Array.isArray(options.ids)
      ? [...new Set(options.ids.filter(id => typeof id === 'string' && id.trim()))] : [];
    const nextAutoplay = typeof options.autoplay === 'boolean' ? options.autoplay : autoplay;
    const nextDelay = validInterval(options.intervalMs) ? options.intervalMs : delay;
    const reset = Boolean(options.reset);
    const restart = reset || !sameIds(nextIds, ids) || nextDelay !== delay || nextAutoplay !== autoplay;
    if (reset || nextAutoplay !== autoplay) paused = !nextAutoplay;
    autoplay = nextAutoplay;
    delay = nextDelay;
    ids = [...nextIds];
    const selected = !reset && ids.includes(before.id) ? before.id : options.initialId;
    index = ids.length ? Math.max(0, ids.indexOf(selected)) : -1;
    return sync(before, restart);
  }
  function move(direction) {
    if (destroyed || ids.length < 2) return getState();
    const before = getState();
    index = (index + direction + ids.length) % ids.length;
    return sync(before, true);
  }
  function togglePause() {
    if (destroyed) return getState();
    const before = getState();
    paused = !paused;
    return sync(before);
  }
  function setBlocked(reason, blocked) {
    if (destroyed || typeof reason !== 'string' || !reason.trim()) return getState();
    const before = getState();
    if (blocked) blockers.add(reason);
    else blockers.delete(reason);
    return sync(before);
  }
  function destroy() {
    if (destroyed) return getState();
    const before = getState();
    destroyed = true;
    blockers.clear();
    return sync(before);
  }

  return { configure, next: () => move(1), previous: () => move(-1), togglePause, setBlocked, getState, destroy };
}
