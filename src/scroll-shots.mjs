// Scroll preview inside the device frames (requested by Carlos on 2026-10-28).
// Each frame shows the first screen of a client's site (`.shot` poster). On intent the whole page
// (`data-full`) downloads, fades in over the identical poster and scrolls to the end inside the frame:
// - mouse or pen: while the pointer is over the frame's zone (`data-shot-zone`: the card or the device pair);
//   leaving returns to the top;
// - keyboard: while focus is inside the zone (same behaviour as hover);
// - touch screens (no hover): once the zone is mostly in view, only after the visitor has scrolled, so the
//   full image never competes with the first paint; it holds at the end, returns to the top and plays
//   again the next time the zone comes into view.
// The full capture is never downloaded with the page. With reduced motion or Save-Data nothing loads or moves.
// The movement itself is CSS (`.shot.is-scrolling .shot__full`, src/site.css); this module only sets
// classes and the duration, which grows with the length of the page.
export const SHOT_TIMING = { perScreen: 1.1, min: 2.4, max: 10, hold: 1400, view: 0.6 };
const ZONE = "[data-shot-zone]";

// Seconds to scroll from the first to the last screen. `frameRatio` is frame height / width
// (889/1265 for the browser, 812/375 for the phone); the image is shown at the frame width.
export function shotDuration(naturalWidth, naturalHeight, frameRatio) {
  if (!naturalWidth || !naturalHeight || !frameRatio) return SHOT_TIMING.min;
  const screens = naturalHeight / (naturalWidth * frameRatio) - 1;
  return Math.min(SHOT_TIMING.max, Math.max(SHOT_TIMING.min, Math.round(screens * SHOT_TIMING.perScreen * 10) / 10));
}

export function createScrollShots(root, env = window) {
  const shots = root ? [...root.querySelectorAll(".shot[data-full]")] : [];
  const media = query => Boolean(env.matchMedia?.(query).matches);
  if (!shots.length || media("(prefers-reduced-motion: reduce)") || env.navigator?.connection?.saveData) return { destroy() {} };

  const zones = new Map();
  for (const shot of shots) {
    const zone = shot.closest(ZONE) ?? shot;
    if (!zones.has(zone)) zones.set(zone, { shots: [], on: false, played: false });
    zones.get(zone).shots.push(shot);
  }
  const loads = new Map();
  const timers = new Set();
  const cleanups = [];
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };
  const later = (fn, ms) => { const id = env.setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };
  const frame = fn => (env.requestAnimationFrame ? env.requestAnimationFrame(fn) : later(fn, 16));

  function load(shot) {
    if (!loads.has(shot)) {
      loads.set(shot, new Promise(resolve => {
        const img = env.document.createElement("img");
        img.className = "shot__full";
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        img.decoding = "async";
        img.onerror = () => resolve(false);
        img.onload = async () => {
          try { await img.decode?.(); } catch { /* the image is loaded; decoding again is optional */ }
          const poster = shot.querySelector(".shot__poster");
          const ratio = poster?.naturalWidth ? poster.naturalHeight / poster.naturalWidth : shot.clientHeight / shot.clientWidth;
          shot.style.setProperty("--shot-dur", `${shotDuration(img.naturalWidth, img.naturalHeight, ratio)}s`);
          shot.appendChild(img);
          void img.offsetHeight; // starts the fade and the movement from the top
          shot.classList.add("is-ready");
          resolve(true);
        };
        img.src = shot.dataset.full;
      }));
    }
    return loads.get(shot);
  }

  function start(zone) {
    const state = zones.get(zone);
    if (state.on) return;
    state.on = true;
    for (const shot of state.shots) {
      load(shot).then(ok => frame(() => { if (ok && state.on) shot.classList.add("is-scrolling"); }));
    }
  }
  function stop(zone) {
    const state = zones.get(zone);
    state.on = false;
    state.shots.forEach(shot => shot.classList.remove("is-scrolling"));
  }

  for (const zone of zones.keys()) {
    listen(zone, "pointerenter", event => { if (event.pointerType !== "touch") start(zone); });
    listen(zone, "pointerleave", event => { if (event.pointerType !== "touch") stop(zone); });
    listen(zone, "focusin", () => start(zone));
    listen(zone, "focusout", event => { if (!zone.contains(event.relatedTarget)) stop(zone); });
  }

  let observer = null;
  if (!media("(hover: hover) and (pointer: fine)") && env.IntersectionObserver) {
    // Touch screens: play when the zone is in view; hold at the end, then go back to the top.
    for (const [zone, state] of zones) {
      for (const shot of state.shots) {
        listen(shot, "transitionend", event => {
          if (event.propertyName !== "transform" || !shot.classList.contains("is-scrolling")) return;
          if (state.shots.some(other => other !== shot && other.classList.contains("is-scrolling") && !other.dataset.ended)) { shot.dataset.ended = "1"; return; }
          state.shots.forEach(other => delete other.dataset.ended);
          later(() => { state.played = true; stop(zone); }, SHOT_TIMING.hold);
        });
      }
    }
    observer = new env.IntersectionObserver(entries => {
      for (const entry of entries) {
        const state = zones.get(entry.target);
        if (entry.isIntersecting && entry.intersectionRatio >= SHOT_TIMING.view) {
          if (!state.played) start(entry.target);
        } else if (!entry.isIntersecting || entry.intersectionRatio < 0.1) {
          state.played = false;
          stop(entry.target);
        }
      }
    }, { threshold: [0, 0.1, SHOT_TIMING.view] });
    const arm = () => { for (const zone of zones.keys()) observer.observe(zone); };
    // Only after the visitor scrolls: nothing extra downloads or moves during the first paint.
    listen(env, "scroll", arm, { once: true, passive: true });
  }

  return {
    destroy() {
      cleanups.forEach(fn => fn());
      timers.forEach(id => env.clearTimeout(id));
      observer?.disconnect();
      for (const zone of zones.keys()) stop(zone);
    },
  };
}
