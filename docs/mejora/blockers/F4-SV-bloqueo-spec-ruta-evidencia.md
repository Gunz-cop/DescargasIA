# Blocker F4-SV — spec obsoleta, slugs no aprobados y evidencia sueca insuficiente

**Issue bloqueado:** #43 — SDD F4-SV
**Blocker:** #79
**Fase:** F4-SV · producto `sv`
**Rama base:** `main`
**Rama de diagnóstico:** `codex/issue-43-sv-guides`
**Commit base comprobado:** `434a678857b76c5f663f51b4044388c39087d977`
**Fecha de comprobación:** 2026-08-27
**Estado:** bloqueado antes de escribir contenido.

## Resumen

La sesión no puede implementar las cuatro guías porque la spec sueca mantiene una contradicción explícita con el estado integrado de la ruta pública, no aprueba slugs de archivo concretos y la evidencia fechada de canales no contiene filas verificadas para varios candidatos suecos necesarios. No se creó ningún archivo bajo `src/content/guides/sv/` y no se escribió ningún claim de canal, disponibilidad o plataforma.

## Puerta 1 — contradicción explícita en la spec

En `docs/mejora/specs/sv.md` aparecen literalmente estas líneas:

- Líneas 11–14: “Documento de especificación. **No publica contenido ni crea rutas.** Convierte las oportunidades en contratos para una fase posterior. Las cuatro guías quedan bloqueadas hasta que exista una decisión global que autorice la ruta pública de guías y la publicación de contenido nuevo.”
- Líneas 49–56: “### Bloqueo global vigente”; “Las cuatro oportunidades son **BLOQUEADAS**”; “la ruta de guías no existe”; “esta fase no crea un Markdown de guía, no crea una ruta, no cambia el sitemap, canonical, hreflang, navegación ni enlazado entrante”.
- Líneas 67–69: “Si Codex desbloquea la ruta pública, deberá abrir una fase/issue previo para ruta, SEO, enlazado y sitemap. Solo después podrá F4-SV redactar las guías con un alcance aprobado.”

Esto contradice el estado comprobado en GitHub: PR #78 (“feat(#75): ruta pública para guías localizadas”) está fusionado contra `main`, y el commit base de esta rama contiene `src/pages/[lang]/guias/index.astro`, `src/pages/[lang]/guias/[slug].astro` y la lógica de sitemap/enlazado de la ruta.

La sesión no puede corregir silenciosamente `docs/mejora/specs/sv.md`, `docs/mejora/decisiones.md` ni `docs/enlazado-interno.md`, porque son documentos de arquitectura/especificación protegidos por el encargo y su resolución pertenece a Codex.

## Puerta 2 — evidencia de canales suecos necesaria ausente

`docs/mejora/evidencia-canales-F4-2026-08-27.md` declara en la línea 7 que su alcance es `character-ai, perplexity, ollama, cursor, stable-diffusion, mistral-vibe (F4-ES), lm-studio, grok y notebooklm (F4-IT)`. La tabla tiene 30 filas verificadas (líneas 17–21), y la línea 132 autoriza usar filas verificadas para F4-SV solo sin afirmar más de lo observado.

No hay filas registradas para los candidatos suecos necesarios de:

- transcripción: Klang y ElevenLabs;
- escritura: DeepL Write y LanguageTool;
- presentaciones: Gamma y Canva;
- comparación local de la spec: Jan y Open WebUI;
- contexto de Windows/local: Microsoft Learn como canal/fuente específica que deba declararse.

Por la regla de esta sesión, no se usa el research, memoria, snippets ni fuentes de terceros para rellenar esas filas. En consecuencia no se redactan claims de canal, disponibilidad o plataforma.

## Puerta 3 — no existe slug de archivo explícitamente aprobado

La spec solo nombra las oportunidades como consultas:

- `ai transkribering svenska`;
- `ai skriva text svenska`;
- `köra ai lokalt`;
- `ai presentation svenska`.

La búsqueda exacta de `slug`, `.md` y rutas de archivo en `docs/mejora/specs/sv.md` no encuentra un slug aprobado para ninguna guía. `docs/mejora/research/sv.md` describe títulos/consultas editoriales, pero tampoco aprueba nombres de archivo. Por tanto esta sesión no inventa `ai-transkribering-svenska.md`, `ai-skriva-text-svenska.md`, `kora-ai-lokalt.md` ni `ai-presentation-svenska.md`.

## Dependencias comprobadas

- PR #64 / F3-SV #39: fusionado contra `main`.
- PR #52 / F1 #36: fusionado contra `main`.
- PR #78 / ruta pública de guías #75: fusionado contra `main`.

## Qué se hizo

1. Se sincronizó `origin` y se creó el worktree aislado desde `origin/main`.
2. Se leyó `AGENTS.md`, el plan, el issue #43, la spec, el research, decisiones, enlazado, evidencia fechada y la skill `descargasia-tool-ficha`.
3. Se publicó el preflight en #43 antes de editar: https://github.com/Gunz-cop/DescargasIA/issues/43#issuecomment-5447453976
4. Se creó el blocker #79: https://github.com/Gunz-cop/DescargasIA/issues/79
5. Se detuvo la implementación antes de crear guías o modificar archivos protegidos.

## Pregunta concreta para Codex

¿Puede Codex actualizar y aprobar explícitamente la spec/decisión de ruta, registrar los cuatro slugs exactos permitidos y aportar o autorizar una tabla fechada con las filas verificadas de los canales suecos necesarios? Hasta que esas tres decisiones estén cerradas, F4-SV debe permanecer bloqueada.

## Validación ejecutada

Se ejecutaron las comprobaciones del issue sobre el baseline, sin contenido sueco nuevo:

| Comando | Resultado real |
|---|---|
| `npm ci` | código 0; 285 paquetes añadidos, 286 auditados, 0 vulnerabilidades |
| `npm run catalog:audit` | código 0; “Catálogo íntegro”; avisos informativos existentes: 38 relaciones, 24 fichas y 10 categorías |
| `npm run hw:audit` | código 0; “Base de hardware íntegra” |
| `npm test` | código 0; 121 tests Node aprobados y 4 omitidos; 61 tests TypeScript aprobados y 4 omitidos |
| `npm run build` | código 0; 198 páginas construidas; `test:build`: 9 aprobados; `links:audit`: sin errores |
| `npm run links:audit` | código 0; 197 páginas en `dist`, 196 indexables; 2 avisos preexistentes (`/it/adobe-podcast`, `/it/opencode`) y 0 errores |
| `git diff --check` | código 0 |

Comprobaciones específicas del bloqueo:

- `dist/` tiene 0 rutas bajo `/sv/guias/` y 0 rutas con `undefined`.
- `tests/guias-rutas.test.mjs` y `test:build` validaron que las guías existentes no dejan Markdown crudo ni URLs con `undefined`.
- `git status` muestra únicamente este diagnóstico; no cambiaron archivos protegidos ni archivos bajo `src/`.
- La revisión visual móvil y desktop de las cuatro guías no se ejecutó: ninguna de esas cuatro páginas fue generada debido al bloqueo previo a la escritura.
