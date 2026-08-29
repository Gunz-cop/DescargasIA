/**
 * Contrato de cabeceras defensivas (#88).
 *
 * Estas pruebas leen `public/_headers` como contrato: fijan lo que DEBE estar
 * y, sobre todo, lo que NO puede aparecer sin cerrar antes el blocker
 * `docs/mejora/blockers/F6-security-headers-csp.md`. La deriva peligrosa aquí
 * no es olvidar una cabecera: es que alguien añada una CSP, un endpoint de
 * reportes inexistente o HSTS sin haber verificado producción, y apague los
 * anuncios o deje el dominio clavado en HTTPS sin vuelta atrás.
 *
 * No sustituyen la comprobación HTTP real con `wrangler dev`; la evidencia de
 * esa comprobación está en `docs/mejora/evidencia-cabeceras-2026-08-28.md`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const readRepoFile = (file) => readFile(join(repoRoot, file), 'utf8');

/** Líneas efectivas: sin comentarios ni vacías. Lo demás es justificación. */
async function headerDirectives() {
  const source = await readRepoFile('public/_headers');
  return source
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

test('el contrato mínimo de #88 está en public/_headers', async () => {
  const directives = await headerDirectives();

  const expected = [
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Permissions-Policy: geolocation=(), microphone=(), camera=()',
    'X-Frame-Options: SAMEORIGIN'
  ];

  for (const header of expected) {
    assert.ok(
      directives.includes(header),
      `falta la cabecera del contrato de #88: ${header}`
    );
  }
});

test('la cabecera Link de descubrimiento para agentes sigue intacta', async () => {
  const source = await readRepoFile('public/_headers');
  assert.match(source, /rel="api-catalog"/);
  assert.match(source, /rel="service-desc"/);
  assert.match(source, /rel="describedby"/);
  assert.match(source, /rel="service-doc"/);
});

test('la CSP no se declara en public/_headers', async () => {
  const directives = await headerDirectives();
  const joined = directives.join('\n');

  assert.doesNotMatch(
    joined,
    /^content-security-policy/im,
    'la CSP report-only se emite desde el Worker para limitarla a HTML. Ver docs/mejora/blockers/F6-security-headers-csp.md'
  );
  assert.doesNotMatch(
    joined,
    /^content-security-policy-report-only/im,
    'la CSP report-only no pertenece al contrato global de assets. Ver el blocker de #88'
  );
  assert.doesNotMatch(
    joined,
    /report-to|report-uri|reporting-endpoints/i,
    'el receptor CSP se implementa en el Worker, no en public/_headers'
  );
});

test('no se ha activado HSTS sin verificar producción', async () => {
  const directives = await headerDirectives();
  assert.doesNotMatch(
    directives.join('\n'),
    /strict-transport-security/i,
    'HSTS no es verificable desde local ni preview y su max-age no se revierte fácil. Ver docs/mejora/blockers/F6-security-headers-csp.md'
  );
});

test('Referrer-Policy no recorta el origen que necesitan el funnel y los anuncios', async () => {
  const directives = await headerDirectives();
  const referrer = directives.filter((line) => /^referrer-policy:/i.test(line));

  assert.ok(referrer.length > 0, 'falta Referrer-Policy en public/_headers');

  // Los dos únicos valores que dejan a un destino cross-origin sin ningún
  // referrer. `strict-origin-when-cross-origin` y `strict-origin` sí envían el
  // origen, así que no rompen la atribución del funnel ni la de los anuncios.
  const stripsOrigin = new Set(['no-referrer', 'same-origin']);

  for (const line of referrer) {
    const value = line.slice(line.indexOf(':') + 1).trim().toLowerCase();
    assert.ok(
      !stripsOrigin.has(value),
      `Referrer-Policy: ${value} retiraría el origen que hoy acompaña a las salidas de /r y a las peticiones de anuncios; es una decisión de monetización, no de hardening`
    );
  }
});

test('Permissions-Policy no toca capacidades de monetización ni la app de hardware', async () => {
  const directives = await headerDirectives();
  const policies = directives.filter((line) => /^permissions-policy:/i.test(line));

  assert.ok(policies.length > 0, 'falta Permissions-Policy en public/_headers');
  for (const line of policies) {
    for (const feature of ['attribution-reporting', 'browsing-topics', 'interest-cohort', 'webgpu']) {
      assert.doesNotMatch(
        line,
        new RegExp(feature, 'i'),
        `${feature} no puede restringirse aquí: afecta a los anuncios o a src/lib/browser/detect.ts`
      );
    }
  }
});

test('worker/security.ts sigue cubriendo /api/hw/* por su cuenta', async () => {
  // `public/_headers` sólo alcanza a las respuestas de assets. Las de
  // /api/hw/* las genera el Worker y no pasan por ese archivo: si alguien
  // borrara esto dando por hecho que _headers ya lo cubre, la API se quedaría
  // sin cabeceras.
  const source = await readRepoFile('worker/security.ts');
  assert.match(source, /x-content-type-options/);
  assert.match(source, /x-frame-options/);
  assert.match(source, /referrer-policy/);
  assert.match(source, /permissions-policy/);
});
