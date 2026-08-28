/**
 * Contrato del descubrimiento de guías desde las fichas (F5.1, #85).
 *
 * Lo que se protege aquí es que la relación guía -> ficha se DERIVE del
 * Markdown publicado y de nada más. Un fallo en cualquiera de estos casos
 * significa que la ficha enlazaría una guía que nadie escribió, o una ruta
 * que no existe. Ver `src/utils/guide-links.ts` y `docs/enlazado-interno.md` §7.
 *
 * Es un test puro: no necesita `dist/` ni `astro:content`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  extractLinkTargets,
  extractToolSlugs,
  toolSlugFromTarget,
  indexGuidesByTool,
  getGuidesForTool,
  type GuideSource
} from '../src/utils/guide-links.ts';

const ROOT = process.cwd();
const GUIDES = path.join(ROOT, 'src', 'content', 'guides');
const LANGS = ['es', 'sv', 'it'] as const;

function guide(partial: Partial<GuideSource> & Pick<GuideSource, 'lang' | 'body'>): GuideSource {
  return { slug: 'una-guia', title: 'Una guía', ...partial };
}

// --- Relación válida -------------------------------------------------------

test('una guía que enlaza la ficha en su idioma declara esa relación', () => {
  const source = guide({
    lang: 'sv',
    body: 'Jämför [LM Studio](/sv/lm-studio) och [Ollama](/sv/ollama).'
  });

  assert.deepEqual(extractToolSlugs(source, ['lm-studio', 'ollama', 'jan']), [
    'lm-studio',
    'ollama'
  ]);
});

test('el botón /r declara la herramienta igual que el enlace a la ficha', () => {
  const source = guide({
    lang: 'es',
    body: '[Descargar ChatGPT para Windows](/r?t=chatgpt&p=windows&l=es)'
  });

  assert.deepEqual(extractToolSlugs(source, ['chatgpt']), ['chatgpt']);
});

// --- Idioma sin guía correspondiente / sin cruce de idiomas ---------------

test('un destino de otro idioma no produce relación', () => {
  assert.equal(toolSlugFromTarget('/es/claude', 'sv'), null);
  assert.equal(toolSlugFromTarget('/r?t=chatgpt&p=web&l=es', 'sv'), null);
});

test('el índice deja vacío el idioma que no tiene guías', () => {
  const index = indexGuidesByTool(
    [guide({ lang: 'sv', slug: 'kora-ai-lokalt', body: '[Ollama](/sv/ollama)' })],
    { es: ['ollama'], sv: ['ollama'], it: ['ollama'] }
  );

  assert.deepEqual(getGuidesForTool(index, 'sv', 'ollama').map((g) => g.slug), ['kora-ai-lokalt']);
  assert.deepEqual(getGuidesForTool(index, 'es', 'ollama'), []);
  assert.deepEqual(getGuidesForTool(index, 'it', 'ollama'), []);
});

// --- Slug inexistente ------------------------------------------------------

test('un slug que no está en el catálogo del idioma se descarta', () => {
  const source = guide({
    lang: 'es',
    body: 'Lee [algo](/es/herramienta-que-no-existe) y [Acerca de](/es/acerca-de).'
  });

  assert.deepEqual(extractToolSlugs(source, ['chatgpt', 'claude']), []);
});

test('una ficha sin traducir en ese idioma no recibe la guía', () => {
  const index = indexGuidesByTool(
    [guide({ lang: 'sv', slug: 'kora-ai-lokalt', body: '[Jan](/sv/jan)' })],
    { sv: ['ollama'] } // `jan` no está traducida al sueco en este escenario
  );

  assert.deepEqual(getGuidesForTool(index, 'sv', 'jan'), []);
});

// --- Guía sin enlaces a fichas --------------------------------------------

test('una guía que solo enlaza categorías, guías o dominios externos no relaciona nada', () => {
  const source = guide({
    lang: 'sv',
    body: [
      '[Kategori](/sv/categoria/modelos-locales)',
      '[En annan guide](/sv/guias/ai-skriva-text-svenska)',
      '[Microsoft](https://learn.microsoft.com/en-us/windows/ai/)',
      '[Startsidan](/sv)'
    ].join('\n\n')
  });

  assert.deepEqual(extractToolSlugs(source, ['ollama', 'lm-studio', 'jan']), []);
});

// --- Ausencia del bloque cuando no hay resultados --------------------------

test('sin relaciones el índice devuelve lista vacía, no un bloque vacío', () => {
  const index = indexGuidesByTool([], { es: ['chatgpt'], sv: [], it: [] });
  assert.deepEqual(getGuidesForTool(index, 'es', 'chatgpt'), []);
  assert.equal(getGuidesForTool(index, 'es', 'chatgpt').length, 0);
});

// --- Sin enlaces duplicados ------------------------------------------------

test('la misma ficha citada varias veces en una guía aparece una sola vez', () => {
  const source = guide({
    lang: 'sv',
    body: '[Ollama](/sv/ollama) ... [Windows](/r?t=ollama&p=windows&l=sv) ... [macOS](/r?t=ollama&p=mac&l=sv)'
  });

  assert.deepEqual(extractToolSlugs(source, ['ollama']), ['ollama']);
});

test('una guía no puede aparecer dos veces bajo la misma ficha', () => {
  const index = indexGuidesByTool(
    [guide({ lang: 'sv', slug: 'kora-ai-lokalt', body: '[Ollama](/sv/ollama) [igen](/sv/ollama)' })],
    { sv: ['ollama'] }
  );

  assert.equal(getGuidesForTool(index, 'sv', 'ollama').length, 1);
});

// --- Extracción de destinos ------------------------------------------------

test('se leen enlaces en línea, definiciones de referencia y href de HTML', () => {
  const body = [
    '[En línea](/sv/ollama "título")',
    '[Referencia][ref]',
    '',
    '[ref]: /sv/jan',
    '<a href="/sv/lm-studio">HTML</a>'
  ].join('\n');

  const targets = extractLinkTargets(body);
  assert.ok(targets.includes('/sv/ollama'));
  assert.ok(targets.includes('/sv/jan'));
  assert.ok(targets.includes('/sv/lm-studio'));
});

test('no se relaciona nada por título, tags ni texto libre', () => {
  const source = guide({
    lang: 'sv',
    title: 'Köra Ollama lokalt',
    body: 'Ollama, LM Studio och Jan nämns här utan att någon länk finns.'
  });

  assert.deepEqual(extractToolSlugs(source, ['ollama', 'lm-studio', 'jan']), []);
});

// --- Las guías reales del repositorio -------------------------------------

/** Las guías publicadas, leídas del disco igual que hace el loader glob. */
function guiasEnDisco(): GuideSource[] {
  if (!fs.existsSync(GUIDES)) return [];
  const found: GuideSource[] = [];

  for (const lang of LANGS) {
    const dir = path.join(GUIDES, lang);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      const frontmatter = match?.[1] ?? '';
      const body = match?.[2] ?? raw;
      const title = frontmatter.match(/^title:\s*["']?(.*?)["']?\s*$/m)?.[1] ?? file;
      found.push({ lang, slug: file.replace(/\.md$/, ''), title, body });
    }
  }

  return found;
}

/** Slugs de ficha traducidos por idioma, leídos de `src/content/tools/<lang>/`. */
function catalogoPorIdioma(): Partial<Record<(typeof LANGS)[number], string[]>> {
  const base = path.join(ROOT, 'src', 'content', 'tools');
  const out: Partial<Record<(typeof LANGS)[number], string[]>> = {};
  for (const lang of LANGS) {
    const dir = path.join(base, lang);
    if (!fs.existsSync(dir)) continue;
    out[lang] = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''));
  }
  return out;
}

test('cada guía publicada relaciona al menos una ficha de su propio idioma', () => {
  const guias = guiasEnDisco();
  if (guias.length === 0) return;

  const catalogo = catalogoPorIdioma();

  for (const g of guias) {
    const slugs = extractToolSlugs(g, catalogo[g.lang] ?? []);
    assert.ok(
      slugs.length > 0,
      `${g.lang}/${g.slug} no enlaza ninguna ficha traducida a ${g.lang}: quedaría sin enlace entrante desde una ficha (#83)`
    );
  }
});

test('ninguna relación derivada apunta a una ficha inexistente', () => {
  const guias = guiasEnDisco();
  if (guias.length === 0) return;

  const catalogo = catalogoPorIdioma();
  const index = indexGuidesByTool(guias, catalogo);

  for (const lang of LANGS) {
    const conocidos = new Set(catalogo[lang] ?? []);
    for (const [toolSlug, refs] of index.get(lang) ?? []) {
      assert.ok(conocidos.has(toolSlug), `relación hacia una ficha inexistente: /${lang}/${toolSlug}`);
      const guiasDelIdioma = new Set(
        guias.filter((g) => g.lang === lang).map((g) => g.slug)
      );
      for (const ref of refs) {
        assert.ok(
          guiasDelIdioma.has(ref.slug),
          `relación hacia una guía inexistente: /${lang}/guias/${ref.slug}`
        );
      }
    }
  }
});
