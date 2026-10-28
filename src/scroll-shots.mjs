// Live preview inside the device frames (requested by Carlos on 2026-10-28; behaviour inverted the same day).
// Each frame shows the first screen of a client's site (`.shot` poster). When the frame is in view it plays the
// site itself, in a loop:
// - a recording of the site scrolled from top to bottom, with its own videos and effects (`data-video` MP4,
//   `data-video-webm` VP9 for browsers without H.264), whose first frame is the poster; or, when there is no
//   recording, the whole page as a still (`data-full`), faded in over the identical poster and scrolled down and
//   back up in CSS.
// Hovering the frame's zone (`data-shot-zone`: the card or the device pair) pauses it on the current frame, and so
// does keyboard focus inside the zone; leaving resumes. Out of view it pauses too.
// It starts only after the visitor's first interaction (scroll, mouse, touch or key), so nothing extra downloads or
// moves during the first paint, and nothing is downloaded with the page. With reduced motion or Save-Data the
// frames keep their poster.
export const SHOT_TIMING = { perScreen: 1.1, min: 2.4, max: 10, view: 0.5, hide: 0.2, fade: 350, videoWait: 8000 };
const ZONE = "[data-shot-zone]";
const ARM_EVENTS = ["scroll", "pointermove", "pointerdown", "touchstart", "keydown", "wheel"];

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
    if (!zones.has(zone)) zones.set(zone, { shots: [], visible: false, hover: false, focus: false });
    zones.get(zone).shots.push(shot);
  }
  const players = new Map();
  const timers = new Set();
  const cleanups = [];
  let armed = false;
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };
  const later = (fn, ms) => { const id = env.setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const probe = doc.createElement("video");
  const canPlay = type => Boolean(probe.canPlayType?.(type));

  // Recording, in a loop; pausing keeps the current frame on screen.
  function videoPlayer(shot, src) {
    return new Promise(resolve => {
      const video = doc.createElement("video");
      video.className = "shot__video";
      video.muted = true; video.defaultMuted = true; video.playsInline = true; video.loop = true; video.preload = "auto";
      video.disablePictureInPicture = true; video.tabIndex = -1;
      for (const name of ["muted", "playsinline", "loop", "aria-hidden"]) video.setAttribute(name, name === "aria-hidden" ? "true" : "");
      let settled = false;
      const done = ok => { if (settled) return; settled = true; resolve(ok ? player : null); };
      const player = {
        play() { video.play()?.catch?.(() => {}); shot.classList.add("is-playing"); },
        pause() { video.pause(); },
      };
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

  // Still: the whole page fades in over the identical poster and scrolls down and back up (CSS animation).
  function stillPlayer(shot) {
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
        // The animation holds at each end for 8% of its length; the scroll itself keeps the computed time.
        shot.style.setProperty("--shot-dur", `${Math.round(shotDuration(img.naturalWidth, img.naturalHeight, ratio) / 0.84 * 10) / 10}s`);
        shot.classList.add("is-paused");
        shot.appendChild(img);
        void img.offsetHeight;
        shot.classList.add("is-ready", "is-scrolling");
        resolve({ play: () => shot.classList.remove("is-paused"), pause: () => shot.classList.add("is-paused") });
      };
      img.src = shot.dataset.full;
    });
  }

  function load(shot) {
    if (!players.has(shot)) {
      const src = pickVideo(shot.dataset, canPlay);
      const still = () => (shot.dataset.full ? stillPlayer(shot) : Promise.resolve(null));
      players.set(shot, src ? videoPlayer(shot, src).then(player => player ?? still()) : still());
    }
    return players.get(shot);
  }

  const playing = state => armed && state.visible && !state.hover && !state.focus;
  function update(state) {
    for (const shot of state.shots) {
      if (!players.has(shot) && !playing(state)) continue; // load only when it is about to play
      load(shot).then(player => { if (player) (playing(state) ? player.play() : player.pause()); });
    }
  }

  for (const [zone, state] of zones) {
    listen(zone, "pointerenter", event => { if (event.pointerType !== "touch") { state.hover = true; update(state); } });
    listen(zone, "pointerleave", event => { if (event.pointerType !== "touch") { state.hover = false; update(state); } });
    listen(zone, "focusin", () => { state.focus = true; update(state); });
    listen(zone, "focusout", event => { if (!zone.contains(event.relatedTarget)) { state.focus = false; update(state); } });
  }

  let observer = null;
  if (env.IntersectionObserver) {
    observer = new env.IntersectionObserver(entries => {
      for (const entry of entries) {
        const state = zones.get(entry.target);
        if (entry.isIntersecting && entry.intersectionRatio >= SHOT_TIMING.view) state.visible = true;
        else if (!entry.isIntersecting || entry.intersectionRatio < SHOT_TIMING.hide) state.visible = false;
        else continue;
        update(state);
      }
    }, { threshold: [0, SHOT_TIMING.hide, SHOT_TIMING.view] });
    for (const zone of zones.keys()) observer.observe(zone);
  }
  const arm = () => {
    if (armed) return;
    armed = true;
    zones.forEach(update);
  };
  for (const type of ARM_EVENTS) listen(env, type, arm, { once: true, passive: true });

  return {
    destroy() {
      cleanups.forEach(fn => fn());
      timers.forEach(id => env.clearTimeout(id));
      observer?.disconnect();
      for (const state of zones.values()) { state.visible = false; update(state); }
    },
  };
}
