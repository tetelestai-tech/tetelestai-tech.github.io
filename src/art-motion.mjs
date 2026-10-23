// Scroll reveals for blocks marked with data-reveal.
// The unanimated DOM is always the available fallback; no pending opacity styles.
const TARGETS = '[data-reveal]';
const GROUPED = '.grid > *, .steps > li, .compare > *, .reels > *';
const VISUAL = '.case, .case-row, .app, .device-pair, .reel, .hero__media--center';
// The price note rests slightly tilted; its reveal must end on that resting transform.
const RECEIPT_REST = 'rotate(-1.5deg)';

export function createArtMotion(root, env = window) {
  const noop = { destroy() {} };
  if (!root || !env.IntersectionObserver || !env.matchMedia) return noop;
  const preference = env.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches) return noop;
  const seen = new WeakSet();
  const active = new Map();
  let disposed = false;

  const settle = () => {
    for (const [node, animation] of [...active]) {
      active.delete(node);
      animation.cancel();
      node.setAttribute('data-motion-state', 'complete');
    }
  };

  const observer = new env.IntersectionObserver(entries => {
    if (disposed || preference.matches || env.document?.hidden) return;
    for (const entry of entries) {
      const node = entry.target;
      if (!entry.isIntersecting || seen.has(node)) continue;
      seen.add(node);
      observer.unobserve(node);
      if (typeof node.animate !== 'function') continue;
      const siblings = node.parentElement ? [...node.parentElement.children] : [];
      const grouped = node.matches(GROUPED);
      const delay = grouped ? Math.max(0, siblings.indexOf(node)) * 70 : 0;
      const visual = node.matches(VISUAL);
      const receipt = node.matches('[data-reveal="receipt"]');
      const compact = env.matchMedia('(max-width: 640px)').matches;
      const distance = compact ? 10 : visual ? 28 : receipt ? 48 : 18;
      const frames = receipt
        ? [{ opacity: 0.3, transform: `translate3d(0, ${distance}px, 0) rotate(5deg)` }, { opacity: 1, transform: RECEIPT_REST }]
        : [{ opacity: visual ? 0.2 : 0.4, transform: `translate3d(0, ${distance}px, 0)` }, { opacity: 1, transform: 'none' }];
      try {
        const animation = node.animate(frames, {
          duration: receipt ? 700 : visual ? 640 : 540, delay: Math.min(delay, 140),
          fill: 'backwards', easing: receipt ? 'cubic-bezier(.2, 1.3, .4, 1)' : 'cubic-bezier(.22, 1, .36, 1)',
        });
        active.set(node, animation);
        node.setAttribute('data-motion-state', 'playing');
        const complete = () => {
          active.delete(node);
          node.setAttribute('data-motion-state', 'complete');
        };
        animation.onfinish = complete;
        animation.oncancel = complete;
      } catch {
        node.setAttribute('data-motion-state', 'static');
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  for (const node of root.querySelectorAll(TARGETS)) observer.observe(node);
  const onPreference = () => { if (preference.matches) settle(); };
  const onVisibility = () => { if (env.document.hidden) settle(); };
  preference.addEventListener?.('change', onPreference);
  env.addEventListener('resize', settle, { passive: true });
  env.document?.addEventListener('visibilitychange', onVisibility);
  return {
    destroy() {
      disposed = true;
      observer.disconnect();
      settle();
      preference.removeEventListener?.('change', onPreference);
      env.removeEventListener('resize', settle);
      env.document?.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
