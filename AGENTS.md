# DescargasIA Agent Notes

Antes de modificar UX, contenido o estructura editorial, lee estas guias:

- `docs/BRIEF-IMPLEMENTACION.md`: brief de la direccion visual vigente ("Senal nocturna").
- `docs/design-system.md`: como se implementa ese brief sobre el stack actual (tokens, tipografia, movimiento, componentes).
- `docs/fuenteai-referencia-visual.html`: referencia visual. Opciones 1a (home + ficha) y 2a (busqueda, movil, movimiento); 1b y 1c estan descartadas.
- `docs/ux-home-cards.md`: reglas para las tarjetas de herramientas en la home.
- `docs/ux-tool-pages.md`: estructura recomendada para fichas individuales de herramientas.
- `docs/enlazado-interno.md`: **mapa de URLs, grafo de enlaces internos, reglas de hreflang/canonical y auditoria automatica.** Leelo antes de tocar rutas, navegacion, hreflang o cualquier bloque de enlaces.
- `docs/lecciones-sdd.md`: **lecciones del primer proyecto hecho con la metodologia SDD por fases.**
  Documento vivo. Si vas a planificar o ejecutar un proyecto grande en este repo, leelo antes:
  recoge los cinco fallos que mas caro salieron y como se evitan.
- `docs/app-compatibilidad-ia.md`: **plan y tablero de ejecucion de la app "que modelos de IA puedo correr".**
  Si vas a trabajar en esa app, ese documento manda: lee las reglas de coordinacion y actualiza el tablero antes y despues de tu fase.
- `docs/tool-ficha-authoring.md`: como usar la skill `descargasia-tool-ficha` para crear fichas nuevas.
- `docs/ficha-harness.md`: **arnes de GitHub Actions que encadena crear -> auditar -> corregir hasta 5 veces.** Es la via para generar fichas sin gastar cuota de una sesion interactiva.
- `skills/descargasia-tool-ficha/`: copia versionada de la skill local para revisar y ajustar el flujo de creacion de fichas.

Principios del proyecto:

- DescargasIA no aloja instaladores, APKs, ejecutables ni mirrors.
- Los enlaces deben apuntar solo a dominios oficiales, tiendas oficiales, repositorios oficiales o documentacion oficial.
- La UI debe transmitir confianza, rapidez y claridad para usuarios hispanohablantes que buscan descargar herramientas de IA sin caer en clones.
- No inventar claims de seguridad, auditorias tecnicas, afiliaciones ni endorsements de marcas.
- Mantener Astro + Tailwind, rendimiento alto y mobile-first.
- Antes de publicar cambios de UI o contenido, ejecutar `npm run build`. Encadena `catalog:audit` (integridad del contenido: fichas sin traducir, slugs de `alternatives` inexistentes, categorias fantasma) y `links:audit` (grafo de enlaces, canonical y hreflang). Cualquiera de las dos falla el build, y con el, el deploy.
- Ninguna ruta interna se escribe a mano: todo enlace interno sale de los helpers de `src/utils/links.ts`.

## Colaboración y Creación de Contenido

Para acelerar el desarrollo, Antigravity puede proponer y redactar contenido editorial o fichas iniciales con la siguiente separación de responsabilidades:

* **Flujo de Contenido:**
  * Antigravity produce contenido → Codex revisa estilo/editorial.
  * Codex produce contenido → Antigravity valida estructura/build.
* **Reglas Operativas:**
  * No editar en paralelo el mismo archivo que Codex.
  * No tocar la arquitectura de la aplicación mientras se trabaje en tareas de redacción editorial.
  * Al crear fichas, respetar la estructura:
    * `src/content/tools-base/` para datos técnicos.
    * `src/content/tools/[lang]/` para contenido editorial localizado.
  * Mantener la regla de oro: sin mirrors, sin APKs de terceros, sin instaladores modificados, solo fuentes oficiales.
  * Si hay alguna duda sobre la legitimidad de una fuente oficial, marcarla explícitamente y no inventar información.
  * Codex debe revisar la naturalidad, el tono y la consistencia editorial antes de cerrar el lote.

