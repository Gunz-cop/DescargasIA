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
  /**
   * La firma acepta solo `Request`, no `Request | string`, aunque el runtime
   * admita ambas: asi es como la declara el `Env` del Worker de hardware, y
   * ensancharla aqui hacia que su `Env` dejara de encajar en este. La capa de
   * agentes construye el `Request` cuando solo tiene una URL.
   */
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}
