import { dispatchFunnelEvent } from '../utils/funnel-events';

const dataEl = document.getElementById('funnel-ficha-data');
if (dataEl) {
  const lang = dataEl.dataset.lang || 'es';
  const toolSlug = dataEl.dataset.tool || '';
  const primaryPlatformId = dataEl.dataset.platform || null;
  const platformVal = primaryPlatformId ? primaryPlatformId : null;
  const primaryChannel = dataEl.dataset.channel || 'web-app';

  dispatchFunnelEvent({
    event: 'ficha_view',
    lang,
    tool: toolSlug,
    platform: platformVal,
    channel: primaryChannel,
  });

  document.querySelectorAll('#compatibilidad a[href*="/r?"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      try {
        const href = new URL((btn as HTMLAnchorElement).href);
        const p = href.searchParams.get('p');
        dispatchFunnelEvent({
          event: 'platform_select',
          lang,
          tool: toolSlug,
          platform: p,
          channel: (btn as HTMLElement).dataset.channel || 'web-app',
        });
      } catch {}
    });
  });
}
