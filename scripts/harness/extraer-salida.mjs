#!/usr/bin/env node
//
// Extrae y valida la salida estructurada de una pasada de `opencode run
// --format json`.
//
// opencode no tiene equivalente a `claude -p --json-schema`: nada obliga al
// modelo a devolver JSON. La convención que usa este arnés es pedirle en el
// prompt que cierre con un único bloque ```json, y este script es lo que
// reemplaza la garantía que antes daba el flag — sin esto, un modelo que
// devuelve prosa en vez de JSON, o JSON que no cumple el esquema, pasaría
// como si la pasada hubiera funcionado.
//
// Uso: node extraer-salida.mjs <raw.jsonl> <schema-json-inline>
// Salida (stdout): {"total_cost_usd": <numero>, "structured_output": {...}}

import { readFileSync } from "node:fs";
import Ajv from "ajv";

const [, , rawPath, schemaInline] = process.argv;
if (!rawPath || !schemaInline) {
  console.error("uso: extraer-salida.mjs <raw.jsonl> <schema-json-inline>");
  process.exit(1);
}

const eventos = readFileSync(rawPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((linea) => JSON.parse(linea));

// El CLI puede devolver código 0 y avisar el fallo sólo acá adentro, así que
// esto se comprueba antes de mirar si hay texto.
const error = eventos.find((e) => e.type === "error");
if (error) {
  console.error("opencode reportó un error:", JSON.stringify(error.error ?? error));
  process.exit(1);
}

const textos = eventos.filter((e) => e.type === "text" && e.part?.text);
const ultimo = textos.at(-1);
if (!ultimo) {
  console.error("la pasada no dejó ningún mensaje de texto.");
  process.exit(1);
}

// El último bloque, no el primero: si el modelo pensó en voz alta con JSON de
// ejemplo antes de la respuesta final, el bloque que cuenta es el de cierre.
const bloques = [...ultimo.part.text.matchAll(/```json\s*([\s\S]*?)```/g)];
const bloque = bloques.at(-1);
if (!bloque) {
  console.error(
    "el mensaje final no trae un bloque ```json. Texto completo:\n" + ultimo.part.text,
  );
  process.exit(1);
}

let structured_output;
try {
  structured_output = JSON.parse(bloque[1]);
} catch (e) {
  console.error("el bloque ```json no parsea:", e.message);
  process.exit(1);
}

const schema = JSON.parse(schemaInline);
const ajv = new Ajv({ allErrors: true });
const validar = ajv.compile(schema);
if (!validar(structured_output)) {
  console.error("la salida no cumple el esquema:", ajv.errorsText(validar.errors));
  process.exit(1);
}

// Suma de costo por paso; si el modelo/provider no lo reporta, queda en 0 en
// vez de romper — el costo estimado es informativo, no una compuerta.
const costo = eventos
  .filter((e) => e.type === "step_finish")
  .reduce((suma, e) => suma + (e.part?.cost ?? 0), 0);

process.stdout.write(JSON.stringify({ total_cost_usd: costo, structured_output }));
