/**
 * Contrato mínimo que los endpoints de agentes necesitan del entorno del
 * Worker: solo el binding de assets estáticos.
 *
 * Se declara aparte y al mínimo a propósito. El Worker de la app de hardware
 * (`worker/index.ts` en la rama de integración) tiene un `Env` mucho más
 * grande —`AI`, `HW_CACHE`, `AI_ENABLED`—; al pedir solo `ASSETS`, cualquier
 * `Env` que lo incluya encaja aquí sin cambios y los dos módulos conviven sin
 * tocarse. Ver `docs/agent-readiness.md`.
 */
export interface AgentEnv {
  ASSETS: { fetch: (request: Request | string) => Promise<Response> };
}
