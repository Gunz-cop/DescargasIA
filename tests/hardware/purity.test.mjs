/**
 * El motor tiene que ser TypeScript puro. F2 — docs/fases/F2.md.
 *
 * Lo importan por igual el script de cliente, el Worker de Cloudflare y este
 * mismo `node --test`. Basta una referencia al DOM o a `import.meta.env` para
 * que el Worker deje de arrancar, y el fallo aparecería en F6, lejos de aquí.
 *
 * Esto no puede ser un `grep`: `types.ts` documenta esta misma regla en un
 * comentario, así que un grep sobre el directorio encuentra su propia
 * documentación y no puede pasar nunca. Hay que quitar los comentarios antes.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'src/lib/hardware';

/** Identificadores que no pueden aparecer en el código, solo en comentarios. */
const PROHIBIDOS = [
  { nombre: 'document', patron: /\bdocument\b/ },
  { nombre: 'window', patron: /\bwindow\b/ },
  { nombre: 'localStorage', patron: /\blocalStorage\b/ },
  { nombre: 'import.meta.env', patron: /\bimport\s*\.\s*meta\s*\.\s*env\b/ }
];

/** Operaciones de red prohibidas en todo el motor, incluida la detección. */
const RED_PROHIBIDA = [
  { nombre: 'fetch', patron: /\bfetch\s*\(/ },
  { nombre: 'XMLHttpRequest', patron: /\bXMLHttpRequest\b/ },
  { nombre: 'sendBeacon', patron: /\bsendBeacon\b/ }
];

/**
 * Quita comentarios de línea y de bloque sin tocar lo que va dentro de una
 * cadena o de una expresión regular. Un `.replace(/\/\/.*$/)` ingenuo se come
 * media línea en cuanto aparece una URL entre comillas.
 */
export function stripComments(source) {
  let out = '';
  let i = 0;
  let state = 'code';
  let quote = '';

  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];

    if (state === 'code') {
      if (c === '/' && next === '/') {
        state = 'line';
        i += 2;
        continue;
      }
      if (c === '/' && next === '*') {
        state = 'block';
        i += 2;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') {
        state = 'string';
        quote = c;
        out += c;
        i += 1;
        continue;
      }
      if (c === '/' && /[=(,:[!&|?{};+\-*%\n]\s*$/.test(out)) {
        state = 'regex';
        out += c;
        i += 1;
        continue;
      }
      out += c;
      i += 1;
      continue;
    }

    if (state === 'line') {
      if (c === '\n') {
        state = 'code';
        out += c;
      }
      i += 1;
      continue;
    }

    if (state === 'block') {
      if (c === '*' && next === '/') {
        state = 'code';
        i += 2;
        continue;
      }
      if (c === '\n') out += c;
      i += 1;
      continue;
    }

    // string y regex: se copian tal cual, respetando el escapado
    out += c;
    if (c === '\\') {
      out += source[i + 1] ?? '';
      i += 2;
      continue;
    }
    if (state === 'string' && c === quote) state = 'code';
    if (state === 'regex' && c === '/') state = 'code';
    i += 1;
  }

  return out;
}

const fuentes = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => ({ file: path.join(DIR, f), source: fs.readFileSync(path.join(DIR, f), 'utf8') }));

test('hay fuentes que auditar', () => {
  assert.ok(fuentes.length >= 5, `solo se encontraron ${fuentes.length} archivos en ${DIR}`);
  assert.ok(fuentes.some(({ file }) => file.endsWith('detect.ts')), 'detect.ts tiene que estar en el directorio');
});

test('el código del motor no usa DOM, almacenamiento ni variables de entorno', () => {
  const hallazgos = [];
  for (const { file, source } of fuentes) {
    const codigo = stripComments(source);
    // detect.ts es el adaptador opt-in del navegador; el resto del motor sí
    // debe conservar la garantía de ser TypeScript puro y ejecutable en Worker.
    if (file.endsWith('detect.ts')) continue;
    for (const { nombre, patron } of PROHIBIDOS) {
      if (patron.test(codigo)) hallazgos.push(`${file} usa ${nombre}`);
    }
  }
  assert.deepEqual(hallazgos, []);
});

test('el motor y la detección no hacen peticiones de red', () => {
  const hallazgos = [];
  for (const { file, source } of fuentes) {
    const codigo = stripComments(source);
    for (const { nombre, patron } of RED_PROHIBIDA) {
      if (patron.test(codigo)) hallazgos.push(`${file} usa ${nombre}`);
    }
  }
  assert.deepEqual(hallazgos, []);
});

test('la comprobación mira el código y no su documentación', () => {
  // Sin quitar comentarios, `types.ts` se delata a sí mismo: documenta la
  // regla usando las palabras que la regla prohíbe. Este test existe para que
  // nadie "simplifique" el anterior a un grep.
  const types = fuentes.find((f) => f.file.endsWith('types.ts'));
  assert.ok(types, 'types.ts tiene que estar en el directorio');
  assert.match(types.source, /import\.meta\.env/, 'el comentario de types.ts menciona la regla');
  assert.doesNotMatch(stripComments(types.source), /import\s*\.\s*meta\s*\.\s*env/);
});

test('el limpiador de comentarios no se come el código', () => {
  assert.equal(stripComments('const a = 1; // nota\nconst b = 2;'), 'const a = 1; \nconst b = 2;');
  assert.equal(stripComments('/* window */ const a = 1;'), ' const a = 1;');
  assert.equal(stripComments("const url = 'https://ejemplo.test/a';"), "const url = 'https://ejemplo.test/a';");
  assert.equal(stripComments('const re = /a\\/\\/b/; const c = 1;'), 'const re = /a\\/\\/b/; const c = 1;');
  assert.equal(stripComments('const s = "no // es comentario";'), 'const s = "no // es comentario";');
});

test('el motor tampoco importa nada de Astro ni del navegador', () => {
  for (const { file, source } of fuentes) {
    const codigo = stripComments(source);
    assert.doesNotMatch(codigo, /from\s+['"]astro[:/]/, `${file} importa de Astro`);
    assert.doesNotMatch(codigo, /from\s+['"]node:/, `${file} importa de Node`);
  }
});
