/** Cargador de anuncios; los slots solo declaran datos, nunca JS inline. */

export {};

type AdElement = HTMLElement & { dataset: DOMStringMap };

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: string;
      width: number;
      height: number;
      params: Record<string, never>;
    };
  }
}

function load(el: AdElement): void {
  if (el.dataset.adLoaded === 'true') return;
  const src = el.dataset.adSrc;
  if (!src) return;
  el.dataset.adLoaded = 'true';

  if (el.dataset.adKind === 'banner') {
    window.atOptions = {
      key: el.dataset.adKey || '',
      format: 'iframe',
      width: Number(el.dataset.adWidth),
      height: Number(el.dataset.adHeight),
      params: {}
    };
  }

  const script = document.createElement('script');
  script.src = src;
  if (el.dataset.adKind === 'native-banner') {
    script.async = true;
    script.dataset.cfasync = 'false';
  }
  el.appendChild(script);
}

document.querySelectorAll<AdElement>('[data-ad-src]').forEach((el) => {
  if (el.dataset.adEager === 'true') {
    load(el);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      load(el);
    }
  }, { rootMargin: '300px' });
  observer.observe(el);
});
