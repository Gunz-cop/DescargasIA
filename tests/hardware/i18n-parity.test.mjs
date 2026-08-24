/**
 * Paridad de claves entre es, sv e it. F2 — docs/fases/F2.md.
 *
 * `useTranslations` cae al español cuando falta una clave, así que una clave
 * sueca olvidada no rompe el build ni el render: sale texto en español en
 * medio de una página sueca y nadie se entera hasta que lo ve un usuario.
 * Esta es la única red que hay contra esa deriva.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { ui, languages, defaultLang } from '../../src/i18n/ui.ts';

const IDIOMAS = Object.keys(languages);
const base = Object.keys(ui[defaultLang]);

test('los idiomas declarados y los traducidos son los mismos', () => {
  assert.deepEqual(Object.keys(ui).sort(), IDIOMAS.sort());
});

test('sv e it tienen exactamente el mismo conjunto de claves que es', () => {
  for (const lang of IDIOMAS) {
    if (lang === defaultLang) continue;
    const claves = Object.keys(ui[lang]);
    const faltan = base.filter((k) => !claves.includes(k));
    const sobran = claves.filter((k) => !base.includes(k));
    assert.deepEqual(faltan, [], `faltan claves en "${lang}"`);
    assert.deepEqual(sobran, [], `sobran claves en "${lang}" que no existen en "${defaultLang}"`);
  }
});

test('ninguna traducción está vacía', () => {
  const vacias = [];
  for (const lang of IDIOMAS) {
    for (const [clave, valor] of Object.entries(ui[lang])) {
      if (typeof valor !== 'string' || valor.trim() === '') vacias.push(`${lang}:${clave}`);
    }
  }
  assert.deepEqual(vacias, []);
});

test('el bloque hw.* de la app existe en los tres idiomas', () => {
  const hw = base.filter((k) => k.startsWith('hw.'));
  assert.ok(hw.length > 0, 'F0 dejó el esqueleto de claves hw.*; no debería haber desaparecido');
  for (const lang of IDIOMAS) {
    const suyas = Object.keys(ui[lang]).filter((k) => k.startsWith('hw.'));
    assert.deepEqual(suyas.sort(), [...hw].sort(), `el bloque hw.* difiere en "${lang}"`);
  }
});

test('las claves no están duplicadas dentro de un idioma', () => {
  // Un objeto literal con la misma clave dos veces se queda con la última en
  // silencio. Se detecta contando en el fuente, no en el objeto ya evaluado.
  const fuente = fs.readFileSync('src/i18n/ui.ts', 'utf8');
  for (const lang of IDIOMAS) {
    for (const clave of Object.keys(ui[lang])) {
      const veces = fuente.split(`'${clave}':`).length - 1;
      assert.ok(veces <= IDIOMAS.length, `la clave ${clave} aparece ${veces} veces en el fuente`);
    }
  }
});
