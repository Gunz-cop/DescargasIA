import { dispatchFunnelEvent, resolveRedirect } from '../utils/funnel-events';
import type { RedirectToolEntry } from '../utils/funnel-events';

document.addEventListener('DOMContentLoaded', () => {
  const dataEl = document.getElementById('redirect-data');
  let toolsDb: Record<string, RedirectToolEntry | undefined> = {};
  let REDIRECT_DELAY_SECONDS = 5;
  try {
    const parsed = JSON.parse(dataEl?.textContent || '{}');
    toolsDb = (parsed.toolsDb || {}) as Record<string, RedirectToolEntry | undefined>;
    REDIRECT_DELAY_SECONDS = parsed.delay ?? 5;
  } catch {
    // El bloque de datos lo genera Astro; una carga corrupta cae en validación.
  }

  const params = new URLSearchParams(window.location.search);
  const r = resolveRedirect(params, toolsDb);
  const { lang, toolId, platformId, channel, targetUrl, displayUrl, name, errorReason } = r;
  document.documentElement.lang = lang;

  const translations: Record<string, Record<string, string>> = {
    es: {
      title: 'Redirigiendo a la web oficial de {name} | FuenteAI', heading: 'Redirección segura en curso',
      connecting: 'Te estamos conectando de forma transparente con la web oficial de ', destination: 'Destino verificado:',
      countdown: 'Redirigiendo en', fallback: 'Si la redirección no se completa automáticamente, haz clic en el botón inferior.',
      btn: 'Continuar a', errorTitle: 'Enlace no verificado',
      errorDesc: 'La combinación de herramienta y plataforma solicitada no existe o no es un canal oficial verificado.', errorBtn: 'Volver al Directorio'
    },
    sv: {
      title: 'Omdirigerar till officiella webbplatsen för {name} | FuenteAI', heading: 'Säker omdirigering pågår',
      connecting: 'Vi ansluter dig nu till den officiella webbplatsen för ', destination: 'Verifierad destination:',
      countdown: 'Omdirigerar om', fallback: 'Klicka på knappen nedan om du inte omdirigeras automatiskt.',
      btn: 'Fortsätt till', errorTitle: 'Länk ej verifierad',
      errorDesc: 'Den begärda kombinationen av verktyg och plattform finns inte eller är inte en verifierad officiell kanal.', errorBtn: 'Tillbaka till hem'
    },
    it: {
      title: 'Reindirizzamento al sito ufficiale di {name} | FuenteAI', heading: 'Reindirizzamento sicuro in corso',
      connecting: 'Ti stiamo connettendo in modo trasparente con il sito ufficiale di ', destination: 'Destinazione verificata:',
      countdown: 'Reindirizzamento tra', fallback: 'Se il reindirizzamento non avviene automaticamente, fai clic sul pulsante in basso.',
      btn: 'Continua su', errorTitle: 'Link non verificato',
      errorDesc: 'La combinazione di strumento e piattaforma richiesta non esiste o non è un canale ufficiale verificato.', errorBtn: 'Torna alla home'
    }
  };

  const t = translations[lang] || translations.es;
  const spinner = document.getElementById('redirect-spinner');
  const content = document.getElementById('redirect-content');
  const errorBox = document.getElementById('error-box');
  const heading = document.getElementById('redirect-heading');
  const connecting = document.getElementById('redirect-connecting');
  const destination = document.getElementById('redirect-destination');
  const countdownText = document.getElementById('redirect-countdown-text');
  const countdownEl = document.getElementById('redirect-countdown');
  const fallback = document.getElementById('redirect-fallback');
  const btn = document.getElementById('redirect-btn') as HTMLAnchorElement | null;
  const errTitle = document.getElementById('error-title');
  const errDesc = document.getElementById('error-desc');
  const errBtn = document.getElementById('error-btn') as HTMLAnchorElement | null;

  if (targetUrl) {
    document.title = t.title.replace('{name}', name);
    if (heading) heading.textContent = t.heading;
    if (connecting) connecting.innerHTML = `${t.connecting}<strong class="text-brand-text font-bold">${name}</strong>.`;

    let hostname = '';
    try {
      hostname = new URL(displayUrl).hostname.replace(/^www\./, '');
    } catch {
      hostname = displayUrl;
    }
    if (destination) destination.textContent = `${t.destination} ${hostname}`;
    if (countdownText) countdownText.textContent = t.countdown;
    if (fallback) fallback.textContent = t.fallback;
    if (btn) {
      btn.textContent = `${t.btn} ${hostname}`;
      btn.href = targetUrl;
    }
    if (content) content.hidden = false;
    if (errorBox) errorBox.hidden = true;
    dispatchFunnelEvent({ event: 'redirect_start', lang, tool: toolId, platform: platformId, channel, valid: true });

    let remaining = REDIRECT_DELAY_SECONDS;
    const tick = setInterval(() => {
      remaining -= 1;
      if (countdownEl) countdownEl.textContent = String(Math.max(remaining, 0));
      if (remaining <= 0) clearInterval(tick);
    }, 1000);
    setTimeout(() => {
      dispatchFunnelEvent({ event: 'redirect_result', lang, tool: toolId, platform: platformId, channel, valid: true });
      window.location.replace(targetUrl);
    }, REDIRECT_DELAY_SECONDS * 1000);
  } else {
    dispatchFunnelEvent({ event: 'redirect_error', lang, tool: toolId, platform: platformId, channel, valid: false, reason: errorReason ?? 'unknown' });
    document.title = t.errorTitle + ' | FuenteAI';
    if (errTitle) errTitle.textContent = t.errorTitle;
    if (errDesc) errDesc.textContent = t.errorDesc;
    if (errBtn) {
      errBtn.textContent = t.errorBtn;
      errBtn.href = `/${lang}`;
    }
    if (spinner) spinner.hidden = true;
    if (content) content.hidden = true;
    if (errorBox) errorBox.hidden = false;
  }
});
