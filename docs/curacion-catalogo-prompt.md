# Prompt para la sesión de curación de catálogo

> Guardado también como archivo por si se pierde del portapapeles. Podés borrarlo
> cuando termines de usarlo, o dejarlo como referencia — no forma parte del sitio.

---

## Contexto (leé esto antes de tocar nada)

Trabajás sobre **DescargasIA/FuenteAI**, un catálogo de herramientas de IA construido
con Astro. Cada herramienta tiene:

- `src/content/tools-base/<slug>.json` — datos compartidos entre idiomas (nombre,
  categorías, plataformas, `alternatives`, `officialSources`, `status`).
- `src/content/tools/<lang>/<slug>.json` — contenido editorial por idioma
  (`es`, `sv`, `it`): descripciones, FAQ, `limitations`, `safetyNotes`,
  `editorialSections`, y `communityInsights` (opcional).

El repo tiene dos skills hechas a medida para este trabajo:

- **`descargasia-tool-ficha`** — investiga la herramienta contra canales oficiales
  reales (nunca inventa URLs ni datos) y escribe/actualiza la ficha en
  `tools-base` + `tools/<lang>`.
- **`descargasia-ficha-auditoria`** — audita una ficha ya escrita como lo haría un
  revisor humano de Google AdSense: valor de contenido, thin content, E-E-A-T,
  que cada fuente citada respalde literalmente lo que afirma, coherencia entre
  el JSON y la página renderizada. Corre un script determinístico
  (`.claude/skills/descargasia-ficha-auditoria/scripts/metricas.mjs`) y da un
  veredicto: `APTO`, `APTO CON AVISOS`, o bloqueantes a corregir.

El objetivo de esta sesión es **recorrer todo el catálogo** (el que ya existe y
el que falta) aplicando el mismo ciclo escribir → auditar → corregir → re-auditar
a cada ficha, hasta que el catálogo entero cumpla el estándar E-E-A-T que se
definió en la sesión anterior (autoría de equipo editorial, `communityInsights`
con fuente citada obligatoria u omitidas si no hay fuente real verificable,
flag `status: active|discontinued` cuando corresponde).

## El ciclo, por cada herramienta

```
Creá la ficha de <herramienta> usando la skill descargasia-tool-ficha.
Cuando la tengas escrita, auditala con la skill descargasia-ficha-auditoria,
corregí lo que marque y volvé a auditar hasta que no queden bloqueantes.
El veredicto APTO del script no cierra el ciclo: antes de darla por buena,
abrí cada fuente citada y recorré la checklist de afirmaciones que imprime,
ítem por ítem. Cerrá con --check-urls, y si la ficha existe en más de un
idioma, con --cross-lang.
```

Para fichas que **ya existen** y solo necesitan curación (no creación desde
cero), el mismo ciclo aplica reemplazando el primer paso por "curá la ficha de
`<herramienta>` con la skill descargasia-tool-ficha" — la skill sabe distinguir
crear de actualizar.

## Reglas duras (aprendidas con errores reales, no las repitas)

1. **`APTO` del script significa "sin defectos mecánicos", no "la ficha es
   buena".** El paso manual (abrir cada fuente citada y confirmar que dice
   literalmente lo que la ficha afirma) es el que de verdad decide la calidad.
   No lo saltees aunque el script no marque nada. Ya pasó una vez que el script
   validó una fecha como "consistente" cuando en realidad yo había cargado la
   fecha del hecho en vez de la fecha de publicación del artículo citado — solo
   se detectó abriendo la fuente a mano.
2. **`WebSearch` no alcanza para verificar un dato puntual** (precio, límite,
   cifra, cita textual). Los resúmenes pueden ser genéricos o estar
   desactualizados. Antes de citar un número o una cita, hacé `WebFetch` de la
   URL exacta y confirmá que el dato literal está ahí. Si `WebFetch` da 403
   (pasa seguido con TechRadar, help.openai.com, help.otter.ai, forbes.com,
   g2.com, trustpilot.com), usá el navegador en vivo en vez de descartar la
   fuente.
3. **`communityInsights` requiere fuente real y verificable, con URL propia.**
   Si no encontrás nada citable después de buscar en foros, trackers de
   soporte/GitHub, prensa y reseñas — no inventes ni generalices sin fuente:
   omití la sección entera para esa ficha. Es preferible una ficha sin esa
   sección que una con un insight fabricado.
4. **Las referencias direccionales ("más arriba", "más abajo") tienen que
   coincidir con el orden real de render**, que hoy en `src/pages/[lang]/
   [slug].astro` es: alternativas → plataformas → para qué sirve → qué debes
   saber → qué dice la comunidad → guía completa (secciones editoriales) →
   seguridad → límites → preguntas frecuentes. Antes de escribir "más abajo"
   o "más arriba", releé ese orden — no lo asumas de memoria. (Los idiomas
   equivalentes en sueco/italiano son "längre ner/upp" y "più sotto/sopra";
   más adelante" y "por debajo/under the hood" como modismo no cuentan como
   referencia direccional real.)
5. **Toda fuente invocada en el texto** ("según la documentación oficial...",
   "enligt...", "secondo...") **tiene que estar en `officialSources`**, no solo
   mencionada en prosa.
6. **Si una herramienta está descontinuada o cambió de forma incompatible**,
   usá el flag `status: 'discontinued'` en `tools-base` en vez de escribir
   alrededor del problema — el template ya sabe ajustar título, meta, CTA y el
   aviso de espejos cuando ves ese flag. No dejes contenido que se contradiga
   a sí mismo (ej. un botón de descarga activo para algo que el propio texto
   dice que ya no existe).
7. **Registro consistente.** El estándar en español es tú-neutro, no voseo.
   Este es el error que más se repitió en la sesión anterior — dale una
   pasada de `grep` a formas acentuada de voseo (tenés, podés, sabés, etc.)
   antes de cerrar cualquier ficha en español.
8. **Si al investigar para el idioma B encontrás algo que la ficha del idioma
   A no sabe** (un dato desactualizado, un idioma soportado nuevo, un cambio
   de precio), **propagalo de vuelta a la ficha A**, no lo dejes solo en la
   que estás escribiendo. Ya pasó una vez que esto no se hizo.
9. **No toques nada fuera del contenido de ficha.** El flujo `/r` de
   redirección/acortador, los badges de monetización ("Sin patrocinios",
   "Revisado cada semana"), y la colocación de anuncios están fuera de
   alcance — aunque los veas, no son parte de este trabajo. La única
   excepción es cuando una decisión de contenido de ficha (como marcar
   `status: discontinued`) requiere un ajuste de template para no
   autocontradecirse — eso sí es parte del trabajo porque es consecuencia
   directa del contenido, no del negocio.
10. **La skill de auditoría se corre como proceso separado, nunca invocada
    desde dentro de la skill de creación.** Escribís, cerrás esa herramienta,
    y recién ahí corrés la auditoría como paso independiente.

## Plan de trabajo

### Fase 1 — Cerrar lo que ya está escrito pero sin auditar (cola inicial)

Estos 20 archivos ya existen en el repo, sin commitear, escritos en una
curación previa pero **nunca pasados por el ciclo de auditoría nuevo**. Son el
punto de partida más barato: no hay que investigar desde cero, hay que
auditar, corregir lo que marque, y cerrar.

**Italiano** (`src/content/tools/it/`):
canva, chatgpt, claude, deepseek, gemini, grammarly, midjourney, notion,
perplexity

**Sueco** (`src/content/tools/sv/`):
character-ai, deepseek, devin-desktop, flux, grammarly, grok, hailuo-ai,
kling-ai, notebooklm, notion, replit

Para cada uno: auditá primero con `--check-urls` para saber dónde estás
parado, corregí lo que marque, y si la misma herramienta ya tiene ficha en
otro idioma, cerrá con `--cross-lang` para pescar inconsistencias entre
versiones (fechas, cifras, alcance de soporte de idioma, etc. — este es
justo el tipo de gap que se encontró y corrigió a mano la sesión pasada
entre `es/otter-ai.json` e `it/otter-ai.json`).

Commiteá en tandas razonables (por idioma, o cada 5-6 fichas) en vez de un
commit gigante al final — más fácil de revisar y de revertir si algo sale mal.

### Fase 2 — Recorrer el resto del catálogo existente

El resto de `src/content/tools-base/` (hoy 74 herramientas) tiene versión en
español casi siempre, y cobertura parcial en sueco/italiano. Para saber qué
falta o qué es candidato a curar:

```bash
# herramientas sin ficha en un idioma dado
comm -23 <(ls src/content/tools-base/ | sed 's/.json$//' | sort) \
         <(ls src/content/tools/es/ | sed 's/.json$//' | sort)
```

(cambiando `es` por `sv`/`it` según corresponda).

De las que **sí** tienen ficha en español, priorizá para curación (no
creación) las que:
- No tienen `communityInsights` todavía (están desde antes del estándar nuevo).
- Son fichas cortas (menos de ~500 palabras en el bloque editorial) — señal de
  contenido delgado.
- Aparecen viejas en `lastReviewed`/`lastChecked` de `tools-base`.

Armá una lista de trabajo (un checklist en un archivo, o las tareas propias de
tu herramienta si tenés algo tipo TODO-list) y andá tachando. No hace falta
resolver las 74 en una sola sesión — cerrá en tandas, commiteá cada tanda, y
dejá anotado dónde quedaste para la próxima.

### Fase 3 — Herramientas nuevas que faltan en el catálogo

Una vez que lo existente esté al día, usá la skill `descargasia-tool-ficha` en
su modo de investigación de tendencias (Hugging Face trending, lanzamientos
recientes) para detectar herramientas relevantes que todavía no están en el
catálogo, y aplicales el mismo ciclo completo desde cero.

## Verificación antes de cerrar cada tanda

```bash
npm run build:no-shorten
```

Tiene que terminar sin errores de Zod ni de build. Si agregaste una ficha
nueva, confirmá que aparece en el conteo de páginas generadas.

## Sobre pushear

Commiteá con mensajes que digan qué se curó y por qué (no solo "update
fichas"). **No pushees a `main` sin decírselo antes al usuario** — dejá los
commits locales y avisá cuando tengas una tanda lista, igual que se hizo en la
sesión anterior.
