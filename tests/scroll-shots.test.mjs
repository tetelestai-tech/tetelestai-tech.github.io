import assert from 'node:assert/strict';
import test from 'node:test';
import { createScrollShots, pickVideo, shotDuration, SHOT_TIMING } from '../src/scroll-shots.mjs';

const tick = () => new Promise(resolve => setImmediate(resolve));

function element(props = {}) {
  const e = {
    dataset: {}, classes: new Set(), listeners: {}, children: [], attrs: {}, props: {},
    style: { setProperty(name, value) { e.props[name] = value; } },
    classList: { add: (...names) => names.forEach(name => e.classes.add(name)), remove: name => e.classes.delete(name), contains: name => e.classes.has(name) },
    addEventListener(type, fn) { (e.listeners[type] ??= []).push(fn); },
    removeEventListener(type, fn) { e.listeners[type] = (e.listeners[type] ?? []).filter(item => item !== fn); },
    fire(type, event = {}) { for (const fn of [...(e.listeners[type] ?? [])]) fn(event); },
    appendChild(child) { e.children.push(child); },
    setAttribute(name, value) { e.attrs[name] = value; },
    removeAttribute(name) { delete e.attrs[name]; },
    contains(other) { return other === e || e.inside?.includes(other); },
    ...props,
  };
  return e;
}

// h264: the browser plays MP4/H.264; vp9: it plays WebM/VP9.
function scenario({ reduced = false, saveData = false, pairs = 1, video = false, h264 = true, vp9 = true } = {}) {
  const zone = element();
  const shots = Array.from({ length: pairs }, (_, index) => {
    const kind = index ? 'mobile' : 'desktop';
    const poster = { naturalWidth: index ? 375 : 1265, naturalHeight: index ? 812 : 889 };
    const shot = element({ closest: () => zone, querySelector: () => poster, clientWidth: 600, clientHeight: 422 });
    shot.dataset.full = `/assets/portfolio/x-${kind}-full.webp`;
    if (video) Object.assign(shot.dataset, { video: `/assets/portfolio/x-${kind}.mp4`, videoWebm: `/assets/portfolio/x-${kind}.webm` });
    return shot;
  });
  const images = [], videos = [];
  let observer;
  const env = element({
    matchMedia: query => ({ matches: query.includes('reduce') ? reduced : false }),
    navigator: { connection: { saveData } },
    document: {
      createElement: tag => {
        if (tag === 'video') {
          const v = element({
            readyState: 0, paused: true,
            canPlayType: type => ((type.includes('mp4') && h264) || (type.includes('webm') && vp9) ? 'probably' : ''),
            play() { v.paused = false; return Promise.resolve(); }, pause() { v.paused = true; },
          });
          videos.push(v); return v;
        }
        const img = element({ offsetHeight: 0, decode: async () => {} }); images.push(img); return img;
      },
    },
    setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: id => clearTimeout(id),
    IntersectionObserver: class {
      constructor(callback, options) { this.callback = callback; this.options = options; this.observed = new Set(); observer = this; }
      observe(target) { this.observed.add(target); }
      disconnect() { this.observed.clear(); }
    },
  });
  const root = { querySelectorAll: () => shots };
  return {
    env, root, zone, shots, images, videos,
    players: () => videos.slice(1), // videos[0] is the capability probe created at start-up
    view(ratio) { observer.callback([{ target: zone, isIntersecting: ratio > 0, intersectionRatio: ratio }]); },
    get observer() { return observer; },
  };
}

async function loadImages(images, sizes) {
  images.forEach((img, index) => Object.assign(img, sizes[index]));
  for (const img of images) await img.onload();
  await tick();
}
async function canPlay(videos) {
  for (const v of videos) { v.readyState = 4; v.fire('canplay'); }
  await tick();
}

test('the still scrolls for a time that grows with the length of the page, within the limits', () => {
  assert.equal(shotDuration(1265, 8361, 889 / 1265), 9.2, 'a page about 8.4 screens long');
  assert.equal(shotDuration(1265, 1676, 889 / 1265), SHOT_TIMING.min, 'a short page still moves calmly');
  assert.equal(shotDuration(375, 11020, 812 / 375), SHOT_TIMING.max, 'a very long page is capped');
  assert.equal(shotDuration(0, 0, 1), SHOT_TIMING.min);
});

test('the recording uses H.264 when available, VP9 otherwise, and none when the browser plays neither', () => {
  const data = { video: 'a.mp4', videoWebm: 'a.webm' };
  assert.equal(pickVideo(data, () => true), 'a.mp4');
  assert.equal(pickVideo(data, type => type.includes('webm')), 'a.webm');
  assert.equal(pickVideo(data, () => false), null);
  assert.equal(pickVideo({}, () => true), null);
});

test('with reduced motion or Save-Data the frames keep their poster', () => {
  for (const options of [{ reduced: true }, { saveData: true }]) {
    const s = scenario({ ...options, video: true });
    createScrollShots(s.root, s.env);
    assert.deepEqual(s.zone.listeners, {});
    assert.equal(s.images.length + s.videos.length, 0);
  }
});

test('in view the recording plays by itself, in a loop, after the first interaction', async () => {
  const s = scenario({ pairs: 2, video: true });
  createScrollShots(s.root, s.env);
  s.view(0.8);
  assert.equal(s.players().length, 0, 'nothing downloads or moves before the visitor interacts');
  s.env.fire('pointermove');
  const [desktop, phone] = s.players();
  assert.deepEqual([desktop.src, phone.src], ['/assets/portfolio/x-desktop.mp4', '/assets/portfolio/x-mobile.mp4']);
  assert.ok(desktop.muted && desktop.loop && desktop.playsInline && desktop.attrs['aria-hidden'] === 'true');
  await canPlay([desktop, phone]);
  assert.ok(!desktop.paused && !phone.paused, 'browser and phone of the same pair play together');
  assert.ok(s.shots[0].classes.has('is-playing'));
  assert.equal(s.images.length, 0, 'the still is not downloaded when the recording plays');
});

test('hover pauses on the current frame and leaving resumes; out of view it pauses', async () => {
  const s = scenario({ video: true });
  createScrollShots(s.root, s.env);
  s.env.fire('scroll');
  s.view(0.7);
  const [video] = s.players();
  await canPlay([video]);
  s.zone.fire('pointerenter', { pointerType: 'mouse' });
  await tick();
  assert.ok(video.paused && s.shots[0].classes.has('is-playing'), 'paused, still showing the frame');
  s.zone.fire('pointerleave', { pointerType: 'mouse' });
  await tick();
  assert.ok(!video.paused);
  s.zone.fire('pointerenter', { pointerType: 'touch' });
  await tick();
  assert.ok(!video.paused, 'a touch is not a hover');
  s.view(0.35);
  await tick();
  assert.ok(!video.paused, 'between the thresholds nothing changes');
  s.view(0);
  await tick();
  assert.ok(video.paused, 'out of view it pauses');
  s.view(0.6);
  await tick();
  assert.ok(!video.paused, 'back in view it resumes');
  assert.equal(s.players().length, 1, 'the recording is reused');
});

test('a frame that never comes into view downloads nothing', () => {
  const s = scenario({ video: true });
  createScrollShots(s.root, s.env);
  s.env.fire('scroll');
  s.view(0.1);
  assert.equal(s.players().length + s.images.length, 0);
});

test('without a playable recording the still scrolls in a loop and pauses on hover', async () => {
  const s = scenario({ pairs: 2, video: true, h264: false, vp9: false });
  createScrollShots(s.root, s.env);
  s.env.fire('keydown');
  s.view(1);
  assert.equal(s.players().length, 0);
  assert.deepEqual(s.images.map(img => img.src), ['/assets/portfolio/x-desktop-full.webp', '/assets/portfolio/x-mobile-full.webp']);
  assert.equal(s.images[0].attrs['aria-hidden'], 'true');
  await loadImages(s.images, [{ naturalWidth: 1265, naturalHeight: 8361 }, { naturalWidth: 375, naturalHeight: 4682 }]);
  const shot = s.shots[0];
  assert.ok(shot.classes.has('is-ready') && shot.classes.has('is-scrolling') && !shot.classes.has('is-paused'));
  assert.equal(shot.props['--shot-dur'], '11s', '9.2 s of scrolling plus the holds at each end');
  s.zone.fire('pointerenter', { pointerType: 'mouse' });
  await tick();
  assert.ok(shot.classes.has('is-paused'));
  s.zone.fire('pointerleave', { pointerType: 'mouse' });
  await tick();
  assert.ok(!shot.classes.has('is-paused'));
});

test('a recording that fails falls back to the still', async () => {
  const s = scenario({ video: true });
  createScrollShots(s.root, s.env);
  s.env.fire('scroll');
  s.view(0.9);
  s.players()[0].fire('error');
  await tick();
  assert.equal(s.images.length, 1);
});

test('keyboard focus inside the card pauses it like hover', async () => {
  const s = scenario({ video: true });
  const link = {};
  s.zone.inside = [link];
  createScrollShots(s.root, s.env);
  s.env.fire('keydown');
  s.view(0.9);
  const [video] = s.players();
  await canPlay([video]);
  s.zone.fire('focusin');
  await tick();
  assert.ok(video.paused);
  s.zone.fire('focusout', { relatedTarget: link });
  await tick();
  assert.ok(video.paused, 'moving focus within the card keeps it paused');
  s.zone.fire('focusout', { relatedTarget: null });
  await tick();
  assert.ok(!video.paused);
});

test('destroy removes every listener and pauses', async () => {
  const s = scenario({ video: true });
  const shots = createScrollShots(s.root, s.env);
  s.env.fire('scroll');
  s.view(0.9);
  const [video] = s.players();
  await canPlay([video]);
  shots.destroy();
  await tick();
  assert.ok(video.paused);
  assert.ok(Object.values(s.zone.listeners).every(list => list.length === 0));
  assert.ok(Object.values(s.env.listeners).every(list => list.length === 0));
});
