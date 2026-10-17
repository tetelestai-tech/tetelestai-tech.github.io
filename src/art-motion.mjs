const TARGETS = [
  '.service-index__heading', '.service-row', '.client-projects__heading',
  '.client-card', '.instagram-contents__heading', '.reel-card',
  '.intro-section__copy', '.method-section__grid > div', '.method-list > li',
  '.about-section .section-intro', '.person-card', '.faq-section__grid > div:first-child',
  '.contact-section__inner > div', '.service-section > .section-shell > h2',
  '.case-screens figure', '.case-delivery__intro', '.project--app',
].join(',');

// The unanimated DOM is always the available fallback; no pending opacity styles.
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
      const delay = node.matches('.method-list > li') ? Math.max(0, siblings.indexOf(node)) * 70 : 0;
      const visual = node.matches('.client-card, .reel-card, .case-screens figure, .project--app');
      const frames = visual ? [
        { opacity: 0, transform: 'translate3d(0, 16px, 0)' },
        { opacity: 1, transform: 'none' },
      ] : [{ opacity: 0.45 }, { opacity: 1 }];
      try {
        const animation = node.animate(frames, {
          duration: visual ? 560 : 420, delay: Math.min(delay, 140),
          fill: 'backwards', easing: 'cubic-bezier(.22, 1, .36, 1)',
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
