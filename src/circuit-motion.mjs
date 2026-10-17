// One finite light sweep; the original image is always present underneath.
export function createCircuitMotion(root, env = window) {
  const noop = { destroy() {} };
  const visual = root?.querySelector('.circuit-visual');
  const signal = visual?.querySelector('.circuit-visual__signal');
  if (!signal || !env.IntersectionObserver || !env.matchMedia || typeof signal.animate !== 'function') return noop;
  const preference = env.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches) return noop;
  let played = false; let disposed = false; let inView = false; let animation;

  const settle = () => {
    const current = animation; animation = undefined;
    current?.cancel();
    if (played) visual.setAttribute('data-circuit-state', 'complete');
  };
  const play = () => {
      if (disposed || !inView || played || preference.matches || env.document?.hidden) return;
      played = true;
      try {
        animation = signal.animate([
          { opacity: 0, maskPosition: '100% 0%', webkitMaskPosition: '100% 0%', offset: 0 },
          { opacity: 1, offset: 0.18 },
          { opacity: 1, offset: 0.82 },
          { opacity: 0, maskPosition: '0% 0%', webkitMaskPosition: '0% 0%', offset: 1 },
        ], { duration: 3200, easing: 'ease-in-out', fill: 'none' });
        visual.setAttribute('data-circuit-state', 'playing');
        const complete = () => {
          animation = undefined;
          visual.setAttribute('data-circuit-state', 'complete');
        };
        animation.onfinish = complete; animation.oncancel = complete;
      } catch { visual.setAttribute('data-circuit-state', 'static'); }
  };
  const observer = new env.IntersectionObserver(entries => {
    if (disposed) return;
    for (const entry of entries) {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.3;
      if (!entry.isIntersecting) settle();
      else play();
    }
  }, { threshold: 0.3 });
  observer.observe(visual);
  const onPreference = () => { if (preference.matches) settle(); };
  const onVisibility = () => { if (env.document.hidden) settle(); else play(); };
  preference.addEventListener?.('change', onPreference);
  env.addEventListener('resize', settle, { passive: true });
  env.document?.addEventListener('visibilitychange', onVisibility);
  return { destroy() {
    disposed = true; observer.disconnect(); settle();
    preference.removeEventListener?.('change', onPreference);
    env.removeEventListener('resize', settle);
    env.document?.removeEventListener('visibilitychange', onVisibility);
  } };
}
