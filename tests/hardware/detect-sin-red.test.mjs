import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const SOURCE = fs.readFileSync('src/lib/browser/detect.ts', 'utf8');

function stripComments(source) {
  let output = '';
  let state = 'code';
  let quote = '';

  for (let index = 0; index < source.length; index += 1) {
    const current = source[index];
    const next = source[index + 1];

    if (state === 'code') {
      if (current === '/' && next === '/') {
        state = 'line';
        index += 1;
      } else if (current === '/' && next === '*') {
        state = 'block';
        index += 1;
      } else if (current === '"' || current === "'" || current === '`') {
        state = 'string';
        quote = current;
        output += current;
      } else {
        output += current;
      }
      continue;
    }

    if (state === 'line') {
      if (current === '\n') {
        state = 'code';
        output += current;
      }
      continue;
    }

    if (state === 'block') {
      if (current === '*' && next === '/') {
        state = 'code';
        index += 1;
      } else if (current === '\n') {
        output += current;
      }
      continue;
    }

    output += current;
    if (current === '\\') {
      output += next ?? '';
      index += 1;
    } else if (current === quote) {
      state = 'code';
    }
  }

  return output;
}

test('la detección de hardware no tiene acceso de red', () => {
  const code = stripComments(SOURCE);
  assert.doesNotMatch(code, /\bfetch\s*\(/);
  assert.doesNotMatch(code, /\bXMLHttpRequest\b/);
  assert.doesNotMatch(code, /\bsendBeacon\b/);
});
