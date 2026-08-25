import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const card = JSON.parse(fs.readFileSync('public/.well-known/agent-card.json', 'utf8'));

test('el Agent Card declara una interfaz A2A 0.3 coherente', () => {
  assert.equal(card.protocolVersion, '0.3.0');
  assert.equal(card.preferredTransport, 'JSONRPC');
  assert.match(card.url, /^https:\/\//);
  assert.ok(Array.isArray(card.additionalInterfaces));
  assert.deepEqual(card.additionalInterfaces[0], { url: card.url, transport: card.preferredTransport });
  assert.equal(card.supportedInterfaces, undefined, 'supportedInterfaces pertenece al Agent Card 1.0');
});

test('el Agent Card trae los campos obligatorios de descubrimiento', () => {
  for (const field of ['name', 'description', 'version', 'capabilities', 'defaultInputModes', 'defaultOutputModes', 'skills']) {
    assert.ok(card[field], `falta ${field}`);
  }
  assert.ok(card.skills.length > 0);
});
