const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- §3.2 Entrada en cascada -------------------------------------------
// opacity 0→1 y translateY 12px→0 en 260 ms con cubic-bezier(.22,1,.36,1);
// retraso min(index*40ms, 480ms). Se dispara al 15 % de visibilidad, una vez.
const risers = document.querySelectorAll<HTMLElement>('.fai-rise');

if (risers.length > 0) {
  if (reduced || !('IntersectionObserver' in window)) {
    risers.forEach((el) => el.classList.add('is-in'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const index = Number(el.dataset.riseIndex ?? 0);
          el.style.setProperty('--fai-delay', `${Math.min(index * 40, 480)}ms`);
          el.classList.add('is-in');
          observer.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );
    risers.forEach((el) => observer.observe(el));
  }
}

// --- §3.3 Contador que sube --------------------------------------------
// De 2 al total en 600 ms con easeOutExpo. El DOM ya trae el número final,
// así que sin JS (o con movimiento reducido) simplemente no se anima.
const counters = document.querySelectorAll<HTMLElement>('[data-count-to]');

if (counters.length > 0 && !reduced && 'IntersectionObserver' in window) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        countObserver.unobserve(el);

        const to = Number(el.dataset.countTo ?? 0);
        const from = Number(el.dataset.countFrom ?? 2);
        if (!Number.isFinite(to) || to <= from) return;

        const duration = 600;
        const start = performance.now();

        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          el.textContent = String(Math.round(from + (to - from) * eased));
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = String(to);
        };

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => countObserver.observe(el));
}

export {};
