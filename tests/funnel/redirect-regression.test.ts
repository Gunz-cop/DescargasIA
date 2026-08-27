import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  sanitizeLang,
  sanitizeTool,
  sanitizePlatform,
  dispatchFunnelEvent,
  onFunnelEvent,
  validatePayload,
} from '../../src/utils/funnel-events.js';

// Simula la lógica de /r que debe distinguir p ausente de p inválido.
// Esta es la misma lógica que ejecutará el script bundled en el navegador.
function resolveRedirect(params: URLSearchParams, toolsDb: Record<string, any>) {
  const rawT = params.get('t') ?? '';
  const rawP = params.get('p');
  const hasP = params.has('p');
  const rawL = params.get('l') ?? 'es';
  const lang = sanitizeLang(rawL);
  const toolId = sanitizeTool(rawT);
  const platformId = sanitizePlatform(rawP);
  const tool = toolId ? toolsDb[toolId] : null;
  let targetUrl = '';
  let displayUrl = '';
  let name = '';
  let channelFromCatalog = 'web-app';
  if (tool) {
    name = tool.name;
    if (hasP) {
      if (platformId === null) {
        // p presente pero inválido -> error
      } else {
        const plat = tool.platforms[platformId];
        if (plat && plat.isOfficial) {
          targetUrl = plat.url;
          displayUrl = plat.displayUrl || plat.url;
          channelFromCatalog = plat.type;
        } else if (plat) {
          channelFromCatalog = plat.type;
        }
      }
    } else {
      targetUrl = tool.officialWebsite;
      displayUrl = tool.officialWebsiteDisplay || tool.officialWebsite;
    }
  }
  let errorReason = 'missing_params';
  if (!rawT) {
    errorReason = 'missing_params';
  } else if (!toolId || !tool) {
    errorReason = 'tool_not_found';
  } else if (hasP && platformId === null) {
    errorReason = 'platform_not_found';
  } else if (hasP && platformId && (!tool.platforms[platformId] || !tool.platforms[platformId].isOfficial)) {
    errorReason = tool.platforms[platformId] ? 'not_official' : 'platform_not_found';
  }
  return { toolId, platformId, lang, channelFromCatalog, targetUrl, displayUrl, name, tool, hasP, rawT, errorReason };
}

const mockDb: Record<string, any> = {
  chatgpt: {
    name: 'ChatGPT',
    officialWebsite: 'https://chatgpt.com/',
    officialWebsiteDisplay: 'https://chatgpt.com/',
    platforms: {
      web: { url: 'https://chatgpt.com/', displayUrl: 'https://chatgpt.com/', isOfficial: true, type: 'web-app' },
      windows: { url: 'https://chatgpt.com/windows', displayUrl: 'https://chatgpt.com/windows', isOfficial: true, type: 'official-site' },
    },
  },
  ollama: {
    name: 'Ollama',
    officialWebsite: 'https://ollama.com/',
    officialWebsiteDisplay: 'https://ollama.com/',
    platforms: {
      linux: { url: 'https://ollama.com/linux', displayUrl: 'https://ollama.com/linux', isOfficial: true, type: 'official-installer' },
    },
  },
};

// p ausente debe caer en officialWebsite y emitir redirect_start válido
test('/r sin p debe hacer fallback a officialWebsite', () => {
  const params = new URLSearchParams('t=chatgpt&l=es');
  const r = resolveRedirect(params, mockDb);
  assert.equal(r.targetUrl, 'https://chatgpt.com/');
  assert.equal(r.platformId, null);
  assert.equal(r.hasP, false);
  // dispatch debe ser redirect_start válido
  const received: any[] = [];
  onFunnelEvent((p) => received.push(p));
  const before = received.length;
  dispatchFunnelEvent({ event: 'redirect_start', lang: r.lang, tool: r.toolId, platform: r.platformId, channel: r.channelFromCatalog, valid: true });
  assert.equal(received.length, before + 1);
  assert.equal(received[received.length - 1].event, 'redirect_start');
  assert.equal(validatePayload(received[received.length - 1]), true);
});

test('/r con p válida debe resolver al URL de la plataforma', () => {
  const params = new URLSearchParams('t=chatgpt&p=windows&l=es');
  const r = resolveRedirect(params, mockDb);
  assert.equal(r.targetUrl, 'https://chatgpt.com/windows');
  assert.equal(r.platformId, 'windows');
  assert.equal(r.channelFromCatalog, 'official-site');
  const received: any[] = [];
  onFunnelEvent((p) => received.push(p));
  dispatchFunnelEvent({ event: 'redirect_start', lang: r.lang, tool: r.toolId, platform: r.platformId, channel: r.channelFromCatalog, valid: true });
  const last = received[received.length - 1];
  assert.equal(last.platform, 'windows');
  assert.equal(last.channel, 'official-site');
});

test('/r con p=banana debe emitir redirect_error y no caer en officialWebsite', () => {
  const params = new URLSearchParams('t=chatgpt&p=banana&l=es');
  const r = resolveRedirect(params, mockDb);
  assert.equal(r.targetUrl, '');
  assert.equal(r.platformId, null);
  assert.equal(r.hasP, true);
  assert.equal(r.errorReason, 'platform_not_found');
  // sanitizePlatform('banana') debe ser null
  assert.equal(sanitizePlatform('banana'), null);
  // dispatch redirect_error debe ser válido y contener platform_not_found
  const received: any[] = [];
  onFunnelEvent((p) => received.push(p));
  dispatchFunnelEvent({ event: 'redirect_error', lang: r.lang, tool: r.toolId, platform: r.platformId, channel: r.channelFromCatalog, valid: false, reason: r.errorReason });
  const last = received[received.length - 1];
  assert.equal(last.event, 'redirect_error');
  assert.equal(last.reason, 'platform_not_found');
  assert.equal(last.platform, null);
  assert.equal(validatePayload(last), true);
});

test('/r con t inválido debe ser tool_not_found', () => {
  const params = new URLSearchParams('t=banana&p=web&l=es');
  // sanitizeTool('banana') is valid slug, but not in db -> tool_not_found
  const r = resolveRedirect(params, mockDb);
  assert.equal(r.tool, undefined);
  assert.equal(r.errorReason, 'tool_not_found');
});

test('call sites deben importar funnel-events y usar window.location.search', () => {
  const rSource = fs.readFileSync('src/pages/r/index.astro', 'utf8');
  assert.match(rSource, /from ['"]\.\.\/\.\.\/utils\/funnel-events['"]/);
  assert.match(rSource, /window\.location\.search/);
  assert.doesNotMatch(rSource, /Astro\.url\.searchParams\.get\('p'\)/);
  // No debe haber dispatcher duplicado
  assert.doesNotMatch(rSource, /new CustomEvent\('fuenteai:funnel'/);
  assert.doesNotMatch(rSource, /ALLOWED_FIELDS/);

  const fichaSource = fs.readFileSync('src/pages/[lang]/[slug].astro', 'utf8');
  assert.match(fichaSource, /from ['"]\.\.\/\.\.\/utils\/funnel-events['"]/);
  assert.doesNotMatch(fichaSource, /new CustomEvent\('fuenteai:funnel'/);
  assert.doesNotMatch(fichaSource, /ALLOWED_FIELDS/);
  // No debe usar is:inline para ocultar dependencia
  assert.doesNotMatch(fichaSource, /<script is:inline[^>]*define:vars/);
  assert.doesNotMatch(rSource, /<script is:inline[^>]*define:vars[^>]*sanit/);
});
