// Scroll reveal from the art-direction motion kit (direcao-arte-sites, annex A).
// The CSS only hides `[data-reveal]` while <html> has the `js` class, which the inline
// head script adds and removes again after 3 s unless this module sets `window.__reveal`.
// Each item is revealed once; items of a `data-reveal-group` that enter together are
// staggered by 80 ms. With reduced motion, items are marked as revealed without animating.
export const REVEAL_FROM = {
  nenhum: 'none',
  sobe: 'translate3d(0,24px,0)',
  esquerda: 'translate3d(-32px,0,0)',
  direita: 'translate3d(32px,0,0)',
  zoom: 'scale(.96)',
};
export const REVEAL_TIMING = { duration: 600, easing: 'cubic-bezier(.2,.7,.2,1)', stagger: 80, maxStagger: 5 };

export function createReveal(root, env = window) {
  const html = env.document?.documentElement;
  const items = root ? [...root.querySelectorAll('[data-reveal]')] : [];
  const supported = Boolean(env.IntersectionObserver) && typeof html?.animate === 'function';
  if (!supported) {
    // Without the mechanism nothing may stay hidden.
    html?.classList.remove('js');
    items.forEach(item => item.classList.add('is-in'));
    return { destroy() {} };
  }
  const reduced = Boolean(env.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const observer = new env.IntersectionObserver(entries => {
    const started = new Map();
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const item = entry.target;
      observer.unobserve(item);
      item.classList.add('is-in');
      if (reduced) continue;
      const group = item.closest?.('[data-reveal-group]') ?? null;
      const order = group ? started.get(group) ?? 0 : 0;
      if (group) started.set(group, order + 1);
      item.animate(
        [{ opacity: 0, transform: REVEAL_FROM[item.dataset.reveal] ?? REVEAL_FROM.sobe }, { opacity: 1, transform: 'none' }],
        { duration: REVEAL_TIMING.duration, easing: REVEAL_TIMING.easing, delay: Math.min(order, REVEAL_TIMING.maxStagger) * REVEAL_TIMING.stagger, fill: 'backwards' },
      );
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
  items.forEach(item => observer.observe(item));
  env.__reveal = true;
  return { destroy() { observer.disconnect(); } };
}
