import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const card = JSON.parse(fs.readFileSync('public/.well-known/agent-card.json', 'utf8'));

const ENDPOINT = 'https://fuenteai.com/a2a';

/**
 * `supportedInterfaces` es OBLIGATORIO en A2A 1.0.0, la version publicada
 * actual: "Ordered list of supported interfaces. The first entry is preferred"
 * (spec §4.4.1, y §8.3.1 "Supported Interfaces Declaration").
 *
 * Este test existe porque una revision anterior lo quito del Agent Card por
 * entenderlo propio de una version futura, y eso dejo la tarjeta sin el unico
 * campo que los clientes A2A 1.0 y el escaner de isitagentready.com exigen.
 */
test('el Agent Card declara supportedInterfaces con la forma de A2A 1.0', () => {
  assert.ok(Array.isArray(card.supportedInterfaces), 'supportedInterfaces es obligatorio en A2A 1.0');
  assert.ok(card.supportedInterfaces.length > 0, 'la lista no puede estar vacia');

  const preferida = card.supportedInterfaces[0];
  assert.equal(preferida.url, ENDPOINT);
  // En 1.0 el campo es `protocolBinding`, no `transport`.
  assert.equal(preferida.protocolBinding, 'JSONRPC');
  assert.ok(preferida.protocolVersion, 'cada interfaz declara la version que habla');
});

/**
 * `url`, `preferredTransport` y `additionalInterfaces` son los campos de la
 * 0.3. Se conservan a proposito: describen el mismo endpoint, la spec pide
 * ignorar los campos no reconocidos (§5.7) y asi la tarjeta sirve tambien a los
 * clientes que aun leen esa version.
 */
test('se conservan los campos de la 0.3 y describen el mismo endpoint', () => {
  assert.equal(card.url, ENDPOINT);
  assert.equal(card.preferredTransport, 'JSONRPC');
  assert.deepEqual(card.additionalInterfaces, [{ url: ENDPOINT, transport: 'JSONRPC' }]);

  // Lo importante: las dos formas no pueden apuntar a sitios distintos.
  assert.equal(card.supportedInterfaces[0].url, card.url);
  assert.equal(card.supportedInterfaces[0].protocolBinding, card.preferredTransport);
});

test('el Agent Card trae los campos obligatorios de descubrimiento', () => {
  for (const field of ['name', 'description', 'version', 'capabilities', 'defaultInputModes', 'defaultOutputModes', 'skills']) {
    assert.ok(card[field], `falta ${field}`);
  }
  assert.ok(card.skills.length > 0);
  for (const skill of card.skills) {
    for (const field of ['id', 'name', 'description']) {
      assert.ok(skill[field], `la skill ${skill.id ?? '?'} no declara ${field}`);
    }
  }
});

/** El agente declara lo que hace: sincrono, sin streaming ni tareas. */
test('las capacidades declaradas coinciden con lo que implementa worker/agents/a2a.ts', () => {
  assert.equal(card.capabilities.streaming, false);
  assert.equal(card.capabilities.pushNotifications, false);
});
