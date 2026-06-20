# DescargasIA Agent Notes

Antes de modificar UX, contenido o estructura editorial, lee estas guias:

- `docs/ux-home-cards.md`: reglas para las tarjetas de herramientas en la home.
- `docs/ux-tool-pages.md`: estructura recomendada para fichas individuales de herramientas.
- `docs/tool-ficha-authoring.md`: como usar la skill `descargasia-tool-ficha` para crear fichas nuevas.
- `skills/descargasia-tool-ficha/`: copia versionada de la skill local para revisar y ajustar el flujo de creacion de fichas.

Principios del proyecto:

- DescargasIA no aloja instaladores, APKs, ejecutables ni mirrors.
- Los enlaces deben apuntar solo a dominios oficiales, tiendas oficiales, repositorios oficiales o documentacion oficial.
- La UI debe transmitir confianza, rapidez y claridad para usuarios hispanohablantes que buscan descargar herramientas de IA sin caer en clones.
- No inventar claims de seguridad, auditorias tecnicas, afiliaciones ni endorsements de marcas.
- Mantener Astro + Tailwind, rendimiento alto y mobile-first.
- Antes de publicar cambios de UI o contenido, ejecutar `npm run build`.

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

