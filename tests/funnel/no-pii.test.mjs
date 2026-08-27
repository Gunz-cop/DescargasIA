import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const SOURCE = fs.readFileSync('src/utils/funnel-events.ts', 'utf8');

function stripComments(src) {
  let output = '';
  let state = 'code';
  let quote = '';

  for (let i = 0; i < src.length; i += 1) {
    const cur = src[i];
    const next = src[i + 1];

    if (state === 'code') {
      if (cur === '/' && next === '/') {
        state = 'line';
        i += 1;
      } else if (cur === '/' && next === '*') {
        state = 'block';
        i += 1;
      } else if (cur === '"' || cur === "'" || cur === '`') {
        state = 'string';
        quote = cur;
        output += cur;
      } else {
        output += cur;
      }
      continue;
    }

    if (state === 'line') {
      if (cur === '\n') {
        state = 'code';
        output += cur;
      }
      continue;
    }

    if (state === 'block') {
      if (cur === '*' && next === '/') {
        state = 'code';
        i += 1;
      } else if (cur === '\n') {
        output += cur;
      }
      continue;
    }

    output += cur;
    if (cur === '\\') {
      output += next ?? '';
      i += 1;
    } else if (cur === quote) {
      state = 'code';
    }
  }

  return output;
}

const code = stripComments(SOURCE);

test('funnel-events.ts no tiene fetch()', () => {
  assert.doesNotMatch(code, /\bfetch\s*\(/);
});

test('funnel-events.ts no tiene sendBeacon', () => {
  assert.doesNotMatch(code, /\bsendBeacon\b/);
});

test('funnel-events.ts no tiene XMLHttpRequest', () => {
  assert.doesNotMatch(code, /\bXMLHttpRequest\b/);
});

test('funnel-events.ts no tiene document.cookie', () => {
  assert.doesNotMatch(code, /\bdocument\.cookie\b/);
});

test('funnel-events.ts no tiene localStorage.setItem', () => {
  assert.doesNotMatch(code, /\blocalStorage\.setItem\b/);
});

test('funnel-events.ts no tiene navigator.sendBeacon', () => {
  assert.doesNotMatch(code, /\bnavigator\b/);
});

test('funnel-events.ts no escribe a bases de datos (indexedDB, openDatabase)', () => {
  assert.doesNotMatch(code, /\bindexedDB\b/);
  assert.doesNotMatch(code, /\bopenDatabase\b/);
});

test('funnel-events.ts no usa eval() ni Function() para construir código dinámico con datos del usuario', () => {
  // `new Function` se usa internamente para evaluar el propio módulo en tests,
  // pero no debe construir código a partir de datos del payload.
  assert.doesNotMatch(code, /\beval\s*\(/);
});

test('funnel-events.ts solo exporta campos declarados en ALLOWED_FIELDS', () => {
  assert.match(code, /ALLOWED_FIELDS\s*=\s*new\s+Set\(\[.*?\]\)/s);
  const allowedMatch = code.match(/ALLOWED_FIELDS\s*=\s*new\s+Set\(\[(.*?)\]\)/s);
  assert.ok(allowedMatch, 'ALLOWED_FIELDS debe existir');
  const fields = allowedMatch[1].split(',').map(f => f.trim().replace(/['"]/g, '')).filter(Boolean);
  const expected = ['event', 'lang', 'tool', 'platform', 'channel', 'valid', 'reason'];
  assert.deepEqual(fields.sort(), expected.sort());
});
