import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const readRepoFile = (file) => readFile(join(repoRoot, file), 'utf8');

test('las políticas localizadas describen las integraciones publicitarias observables', async () => {
  const [privacy, cookies] = await Promise.all([
    readRepoFile('src/pages/[lang]/privacidad.astro'),
    readRepoFile('src/pages/[lang]/cookies.astro')
  ]);

  for (const source of [privacy, cookies]) {
    assert.match(source, /www\.highperformanceformat\.com/);
    assert.match(source, /pl30788864\.effectivecpmnetwork\.com/);
    assert.match(source, /static\.cloudflareinsights\.com/);
  }
  assert.match(cookies, /CMP/);
});

test('las políticas no vuelven a afirmar que sólo hay cookies técnicas o que no hay rastreo', async () => {
  const source = await readRepoFile('src/pages/[lang]/cookies.astro');
  const forbidden = [
    /100%\s+an[oó]nima/i,
    /samlar inte in några personliga identifierbara/i,
    /non raccoglie dati personali identificabili/i,
    /utiliza exclusivamente cookies técnicas necesarias/i,
    /använder endast nödvändiga tekniska cookies/i,
    /utilizziamo esclusivamente cookie tecnici essenziali/i,
    /no realizamos rastreo invasivo/i,
    /vi spårar dig inte/i,
    /non tracciamo gli utenti/i
  ];

  for (const pattern of forbidden) assert.doesNotMatch(source, pattern);
});

test('la integración publicitaria y sus dos momentos de carga siguen conectados', async () => {
  const [adSlot, directory, toolPage, redirect] = await Promise.all([
    readRepoFile('src/components/AdSlot.astro'),
    readRepoFile('src/components/Directory.astro'),
    readRepoFile('src/pages/[lang]/[slug].astro'),
    readRepoFile('src/pages/r/index.astro')
  ]);

  assert.match(adSlot, /highperformanceformat\.com/);
  assert.match(adSlot, /effectivecpmnetwork\.com/);
  assert.match(adSlot, /IntersectionObserver/);
  assert.match(adSlot, /rootMargin: '300px'/);
  assert.match(directory, /network="banner-320x50" eager/);
  assert.match(toolPage, /ad-tool-top-\$\{tool\.slug\}.*network="banner-320x50" eager/s);
  assert.match(toolPage, /ad-tool-mid-\$\{tool\.slug\}.*network="banner-300x250"/s);
  assert.match(redirect, /network="native-banner" eager/);
});
