import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  resolveRedirect,
  dispatchFunnelEvent,
  onFunnelEvent,
  validatePayload,
} from '../../src/utils/funnel-events.js';

// ---------------------------------------------------------------------------
// Casos de /r ejercitando la función real del módulo (resolveRedirect).
// La misma función la ejecuta el script bundled de src/pages/r/index.astro,
// asi que estos tests prueban el comportamiento que corre en el navegador.
// ---------------------------------------------------------------------------

const db: Record<string, any> = {
  chatgpt: {
    name: 'ChatGPT',
    officialWebsite: 'https://chatgpt.com/',
    officialWebsiteDisplay: 'https://chatgpt.com/',
    platforms: {
      web: { url: 'https://chatgpt.com/', displayUrl: 'https://chatgpt.com/', isOfficial: true, type: 'web-app' },
      windows: { url: 'https://chatgpt.com/download/', displayUrl: 'https://chatgpt.com/download/', isOfficial: true, type: 'official-installer' },
      // plataforma presente en el registro pero sin verificar como oficial
      linux: { url: 'https://chatgpt.com/linux', displayUrl: 'https://chatgpt.com/linux', isOfficial: false, type: 'official-site' },
    },
  },
  ollama: {
    name: 'Ollama',
    officialWebsite: 'https://ollama.com/',
    officialWebsiteDisplay: 'https://ollama.com/',
    platforms: {
      linux: { url: 'https://ollama.com/download', displayUrl: 'https://ollama.com/download', isOfficial: true, type: 'official-installer' },
    },
  },
};

// Los handlers del módulo son globales y no tienen unsubscribe: se registra
// uno solo para todo el archivo y cada test mira solo lo despachado despues
// de su marca.
const seen: any[] = [];
onFunnelEvent((p) => seen.push(p));

function eventsSince(before: number): any[] {
  return seen.slice(before);
}

test('/r sin p conserva el fallback a officialWebsite (comportamiento previsto)', () => {
  const r = resolveRedirect(new URLSearchParams('t=chatgpt&l=es'), db);
  assert.equal(r.targetUrl, 'https://chatgpt.com/');
  assert.equal(r.displayUrl, 'https://chatgpt.com/');
  assert.equal(r.platformId, null);
  assert.equal(r.errorReason, null);

  const before = seen.length;
  dispatchFunnelEvent({ event: 'redirect_start', lang: r.lang, tool: r.toolId, platform: r.platformId, channel: r.channel, valid: true });
  const events = eventsSince(before);
  const last = events[events.length - 1];
  assert.equal(last.event, 'redirect_start');
  assert.equal(last.valid, true);
  assert.equal(validatePayload(last), true);
});

test('/r con p válida resuelve al canal oficial y emite la secuencia normal', () => {
  const r = resolveRedirect(new URLSearchParams('t=chatgpt&p=windows&l=es'), db);
  assert.equal(r.targetUrl, 'https://chatgpt.com/download/');
  assert.equal(r.platformId, 'windows');
  assert.equal(r.channel, 'official-installer');
  assert.equal(r.errorReason, null);

  const before = seen.length;
  dispatchFunnelEvent({ event: 'redirect_start', lang: r.lang, tool: r.toolId, platform: r.platformId, channel: r.channel, valid: true });
  dispatchFunnelEvent({ event: 'redirect_result', lang: r.lang, tool: r.toolId, platform: r.platformId, channel: r.channel, valid: true });
  const events = eventsSince(before);
  assert.equal(events.length, 2);
  assert.equal(events[0].event, 'redirect_start');
  assert.equal(events[1].event, 'redirect_result');
  assert.equal(events[0].platform, 'windows');
  assert.equal(events[0].channel, 'official-installer');
  assert.equal(validatePayload(events[0]), true);
  assert.equal(validatePayload(events[1]), true);
});

test('/r con p=banana emite redirect_error (platform_not_found) y NO cae en officialWebsite', () => {
  const r = resolveRedirect(new URLSearchParams('t=chatgpt&p=banana&l=es'), db);
  assert.equal(r.targetUrl, '');
  assert.notEqual(r.targetUrl, db.chatgpt.officialWebsite);
  assert.equal(r.platformId, null);
  assert.equal(r.errorReason, 'platform_not_found');

  const before = seen.length;
  dispatchFunnelEvent({ event: 'redirect_error', lang: r.lang, tool: r.toolId, platform: r.platformId, channel: r.channel, valid: false, reason: r.errorReason });
  const events = eventsSince(before);
  const last = events[events.length - 1];
  assert.equal(last.event, 'redirect_error');
  assert.equal(last.reason, 'platform_not_found');
  assert.equal(last.platform, null);
  assert.equal(last.valid, false);
  assert.equal(validatePayload(last), true);
});

test('/r sin t emite redirect_error (missing_params)', () => {
  const r = resolveRedirect(new URLSearchParams('l=es'), db);
  assert.equal(r.targetUrl, '');
  assert.equal(r.toolId, '');
  assert.equal(r.errorReason, 'missing_params');
});

test('/r con t ausente del catálogo emite redirect_error (tool_not_found)', () => {
  const r = resolveRedirect(new URLSearchParams('t=banana&p=web&l=es'), db);
  assert.equal(r.targetUrl, '');
  assert.equal(r.toolId, 'banana');
  assert.equal(r.errorReason, 'tool_not_found');
});

test('/r con p que no existe en la herramienta emite redirect_error (platform_not_found)', () => {
  const r = resolveRedirect(new URLSearchParams('t=chatgpt&p=mac&l=es'), db);
  assert.equal(r.targetUrl, '');
  assert.equal(r.platformId, 'mac');
  assert.equal(r.errorReason, 'platform_not_found');
});

test('/r con p presente pero no oficial emite redirect_error (not_official)', () => {
  const r = resolveRedirect(new URLSearchParams('t=chatgpt&p=linux&l=es'), db);
  assert.equal(r.targetUrl, '');
  assert.equal(r.platformId, 'linux');
  assert.equal(r.errorReason, 'not_official');
});

test('/r con l inválido sanea a es sin romper la resolución', () => {
  const r = resolveRedirect(new URLSearchParams('t=ollama&p=linux&l=fr'), db);
  assert.equal(r.lang, 'es');
  assert.equal(r.targetUrl, 'https://ollama.com/download');
  assert.equal(r.channel, 'official-installer');
});

// ---------------------------------------------------------------------------
// Auditoría de call sites: la página importa el módulo real y no mantiene
// lógicas ni dispatchers duplicados.
// ---------------------------------------------------------------------------

test('los call sites importan funnel-events y /r usa resolveRedirect con window.location.search', () => {
  const rSource = fs.readFileSync('src/pages/r/index.astro', 'utf8');
  assert.match(rSource, /import\s*{[^}]*resolveRedirect[^}]*}\s*from\s*['"]\.\.\/\.\.\/utils\/funnel-events['"]/);
  assert.match(rSource, /import\s*{[^}]*dispatchFunnelEvent[^}]*}\s*from\s*['"]\.\.\/\.\.\/utils\/funnel-events['"]/);
  assert.match(rSource, /window\.location\.search/);
  assert.doesNotMatch(rSource, /Astro\.url\.searchParams/);
  // Sin dispatcher duplicado ni esquema duplicado fuera del módulo
  assert.doesNotMatch(rSource, /new CustomEvent\(/);
  assert.doesNotMatch(rSource, /ALLOWED_FIELDS/);
  // El destino se decide en runtime con la función del módulo
  assert.match(rSource, /resolveRedirect\(/);

  const fichaSource = fs.readFileSync('src/pages/[lang]/[slug].astro', 'utf8');
  assert.match(fichaSource, /from\s*['"]\.\.\/\.\.\/utils\/funnel-events['"]/);
  assert.doesNotMatch(fichaSource, /new CustomEvent\(/);
  assert.doesNotMatch(fichaSource, /ALLOWED_FIELDS/);
  // No se oculta la dependencia con is:inline + define:vars
  assert.doesNotMatch(fichaSource, /<script[^>]*is:inline[^>]*define:vars/);
  assert.doesNotMatch(rSource, /<script[^>]*is:inline[^>]*define:vars[^>]*sanit/);
});

// ---------------------------------------------------------------------------
// Resultado compilado: el /r construido trae el dispatcher del módulo real y
// resuelve los casos críticos contra el catálogo real del build.
// ---------------------------------------------------------------------------

function distFile(rel: string): string {
  return fs.readFileSync(path.join('dist', rel.replace(/^\//, '')), 'utf8');
}

/** Lee dist/r/index.html y devuelve la HTML + el catálogo + el JS del script
 *  de la página siguiendo sus imports relativos (chunk compartido del módulo). */
function readDistRedirectPage(): { html: string; toolsDb: Record<string, any>; scriptGraph: string } | null {
  const p = path.join('dist', 'r', 'index.html');
  if (!fs.existsSync(p)) return null;
  const html = fs.readFileSync(p, 'utf8');
  const m = html.match(/<script id="redirect-data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(m, 'dist/r/index.html debe incluir el bloque redirect-data');
  const toolsDb = JSON.parse(m[1]).toolsDb;

  let scriptGraph = '';
  const seenFiles = new Set<string>();
  const moduleScripts = [...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)].map((x) => x[1]);
  for (const src of moduleScripts) {
    const file = src.replace(/^\//, '');
    if (seenFiles.has(file)) continue;
    seenFiles.add(file);
    const js = distFile(file);
    scriptGraph += js + '\n';
    for (const imp of [...js.matchAll(/from\s*["'](\.[^"']+)["']/g)].map((x) => x[1])) {
      const impFile = path.posix.normalize(path.posix.dirname(file) + '/' + imp).replace(/^\//, '');
      if (seenFiles.has(impFile)) continue;
      seenFiles.add(impFile);
      scriptGraph += distFile(impFile) + '\n';
    }
  }
  return { html, toolsDb, scriptGraph };
}

test('build: /r?t=chatgpt&p=banana resuelve redirect_error contra el catálogo real', { skip: !fs.existsSync(path.join('dist', 'r', 'index.html')) }, () => {
  const built = readDistRedirectPage();
  assert.ok(built);
  assert.ok(built.toolsDb.chatgpt, 'el catálogo construido debe incluir chatgpt');
  const r = resolveRedirect(new URLSearchParams('t=chatgpt&p=banana&l=es'), built.toolsDb);
  assert.equal(r.targetUrl, '');
  assert.equal(r.errorReason, 'platform_not_found');
});

test('build: /r?t=chatgpt (sin p) cae en officialWebsite del catálogo real', { skip: !fs.existsSync(path.join('dist', 'r', 'index.html')) }, () => {
  const built = readDistRedirectPage();
  assert.ok(built);
  const r = resolveRedirect(new URLSearchParams('t=chatgpt&l=es'), built.toolsDb);
  assert.equal(r.targetUrl, built.toolsDb.chatgpt.officialWebsite);
  assert.equal(r.errorReason, null);
});

test('build: /r?t=chatgpt&p=windows resuelve al canal oficial del catálogo real', { skip: !fs.existsSync(path.join('dist', 'r', 'index.html')) }, () => {
  const built = readDistRedirectPage();
  assert.ok(built);
  const r = resolveRedirect(new URLSearchParams('t=chatgpt&p=windows&l=es'), built.toolsDb);
  assert.ok(r.targetUrl.length > 0);
  assert.equal(r.errorReason, null);
  assert.equal(r.channel, built.toolsDb.chatgpt.platforms.windows.type);
});

test('build: la página /r compilada despacha los eventos del módulo y no usa Astro.url', { skip: !fs.existsSync(path.join('dist', 'r', 'index.html')) }, () => {
  const built = readDistRedirectPage();
  assert.ok(built);
  // El dispatcher del módulo (nombre de CustomEvent) está bundeado en el
  // grafo de scripts de la página (chunk compartido funnel-events)
  assert.match(built.scriptGraph, /fuenteai:funnel/);
  // La navegación se decide en runtime con window.location.search
  assert.match(built.scriptGraph, /window\.location\.search/);
  assert.doesNotMatch(built.scriptGraph, /Astro\.url\.searchParams/);
});
