// Live preview inside the device frames (requested by Carlos on 2026-10-28).
// Each frame shows the first screen of a client's site (`.shot` poster). On intent it plays the site itself:
// - a recording of the site scrolled from top to bottom, with its own videos and effects (`data-video` MP4,
//   `data-video-webm` VP9 for browsers without H.264), whose first frame is the poster; or, when there is no
//   recording, the whole page as a still (`data-full`), faded in over the identical poster and scrolled in CSS.
// Intent:
// - mouse or pen: while the pointer is over the frame's zone (`data-shot-zone`: the card or the device pair);
//   leaving returns to the first screen;
// - keyboard: while focus is inside the zone (same as hover);
// - touch screens (no hover): once the zone is mostly in view, only after the visitor has scrolled, so nothing
//   competes with the first paint; it holds at the end, returns to the first screen and plays again on the next entry.
// Nothing is downloaded with the page. With reduced motion or Save-Data nothing loads or moves.
export const SHOT_TIMING = { perScreen: 1.1, min: 2.4, max: 10, hold: 1400, view: 0.6, fade: 350, videoWait: 8000 };
const ZONE = "[data-shot-zone]";

// Seconds to scroll the still from the first to the last screen. `frameRatio` is frame height / width
// (889/1265 for the browser, 812/375 for the phone); the image is shown at the frame width.
export function shotDuration(naturalWidth, naturalHeight, frameRatio) {
  if (!naturalWidth || !naturalHeight || !frameRatio) return SHOT_TIMING.min;
  const screens = naturalHeight / (naturalWidth * frameRatio) - 1;
  return Math.min(SHOT_TIMING.max, Math.max(SHOT_TIMING.min, Math.round(screens * SHOT_TIMING.perScreen * 10) / 10));
}

// The recording this browser can play: H.264 first (hardware decoding everywhere), VP9 otherwise.
export function pickVideo(dataset, canPlay) {
  if (dataset.video && canPlay('video/mp4; codecs="avc1.640028"')) return dataset.video;
  if (dataset.videoWebm && canPlay('video/webm; codecs="vp9"')) return dataset.videoWebm;
  return null;
}

export function createScrollShots(root, env = window) {
  const shots = root ? [...root.querySelectorAll(".shot[data-full], .shot[data-video]")] : [];
  const media = query => Boolean(env.matchMedia?.(query).matches);
  if (!shots.length || media("(prefers-reduced-motion: reduce)") || env.navigator?.connection?.saveData) return { destroy() {} };

  const doc = env.document;
  const zones = new Map();
  for (const shot of shots) {
    const zone = shot.closest(ZONE) ?? shot;
    if (!zones.has(zone)) zones.set(zone, { shots: [], on: false, played: false, ended: new Set() });
    zones.get(zone).shots.push(shot);
  }
  const players = new Map();
  const timers = new Set();
  const cleanups = [];
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };
  const later = (fn, ms) => { const id = env.setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const frame = fn => (env.requestAnimationFrame ? env.requestAnimationFrame(fn) : later(fn, 16));
  const probe = doc.createElement("video");
  const canPlay = type => Boolean(probe.canPlayType?.(type));

  // Recording: plays from the start; at the end it stays on the last screen until the zone stops.
  function videoPlayer(shot, src, onEnd) {
    return new Promise(resolve => {
      const video = doc.createElement("video");
      video.className = "shot__video";
      video.muted = true; video.defaultMuted = true; video.playsInline = true; video.preload = "auto";
      video.disablePictureInPicture = true; video.tabIndex = -1;
      for (const name of ["muted", "playsinline", "aria-hidden"]) video.setAttribute(name, name === "aria-hidden" ? "true" : "");
      let settled = false, reset = 0;
      const done = ok => { if (settled) return; settled = true; resolve(ok ? player : null); };
      const player = {
        start() {
          env.clearTimeout(reset);
          try { video.currentTime = 0; } catch { /* not seekable yet: it is at the start anyway */ }
          video.play()?.catch?.(() => {});
          shot.classList.add("is-playing");
        },
        stop() {
          video.pause();
          shot.classList.remove("is-playing");
          reset = later(() => { try { video.currentTime = 0; } catch { /* ignore */ } }, SHOT_TIMING.fade);
        },
      };
      video.addEventListener("ended", () => onEnd(shot));
      video.addEventListener("error", () => { video.remove?.(); done(false); });
      video.addEventListener("canplay", () => done(true), { once: true });
      later(() => {
        if (settled) return;
        if (video.readyState >= 3) return done(true);
        video.removeAttribute("src"); video.load?.(); video.remove?.(); // too slow: fall back to the still
        done(false);
      }, SHOT_TIMING.videoWait);
      video.src = src;
      shot.appendChild(video);
    });
  }

  // Still: the whole page fades in over the identical poster and scrolls in CSS.
  function stillPlayer(shot, onEnd) {
    return new Promise(resolve => {
      const img = doc.createElement("img");
      img.className = "shot__full";
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.decoding = "async";
      img.onerror = () => resolve(null);
      img.onload = async () => {
        try { await img.decode?.(); } catch { /* loaded; decoding again is optional */ }
        const poster = shot.querySelector(".shot__poster");
        const ratio = poster?.naturalWidth ? poster.naturalHeight / poster.naturalWidth : shot.clientHeight / shot.clientWidth;
        shot.style.setProperty("--shot-dur", `${shotDuration(img.naturalWidth, img.naturalHeight, ratio)}s`);
        shot.appendChild(img);
        void img.offsetHeight; // starts the fade and the movement from the top
        shot.classList.add("is-ready");
        img.addEventListener("transitionend", event => {
          if (event.propertyName === "transform" && shot.classList.contains("is-scrolling")) onEnd(shot);
        });
        resolve({ start: () => shot.classList.add("is-scrolling"), stop: () => shot.classList.remove("is-scrolling") });
      };
      img.src = shot.dataset.full;
    });
  }

  function load(shot, state) {
    if (!players.has(shot)) {
      const onEnd = ended => ended && state.on && finished(state, ended);
      const src = pickVideo(shot.dataset, canPlay);
      const still = () => (shot.dataset.full ? stillPlayer(shot, onEnd) : Promise.resolve(null));
      players.set(shot, src ? videoPlayer(shot, src, onEnd).then(player => player ?? still()) : still());
    }
    return players.get(shot);
  }

  // Touch screens: once every frame of the zone reached the end, hold, then go back to the first screen.
  let touch = false;
  function finished(state, shot) {
    if (!touch) return;
    state.ended.add(shot);
    if (state.ended.size < state.shots.length) return;
    later(() => { state.played = true; stopZone(state); }, SHOT_TIMING.hold);
  }

  function startZone(state) {
    if (state.on) return;
    state.on = true;
    state.ended.clear();
    for (const shot of state.shots) {
      load(shot, state).then(player => frame(() => {
        if (!player) return state.ended.add(shot);
        if (state.on) player.start();
      }));
    }
  }
  function stopZone(state) {
    state.on = false;
    for (const shot of state.shots) players.get(shot)?.then(player => { if (!state.on) player?.stop(); });
  }

  for (const [zone, state] of zones) {
    listen(zone, "pointerenter", event => { if (event.pointerType !== "touch") startZone(state); });
    listen(zone, "pointerleave", event => { if (event.pointerType !== "touch") stopZone(state); });
    listen(zone, "focusin", () => startZone(state));
    listen(zone, "focusout", event => { if (!zone.contains(event.relatedTarget)) stopZone(state); });
  }

  let observer = null;
  if (!media("(hover: hover) and (pointer: fine)") && env.IntersectionObserver) {
    touch = true;
    observer = new env.IntersectionObserver(entries => {
      for (const entry of entries) {
        const state = zones.get(entry.target);
        if (entry.isIntersecting && entry.intersectionRatio >= SHOT_TIMING.view) {
          if (!state.played) startZone(state);
        } else if (!entry.isIntersecting || entry.intersectionRatio < 0.1) {
          state.played = false;
          stopZone(state);
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
      for (const state of zones.values()) stopZone(state);
    },
  };
}
