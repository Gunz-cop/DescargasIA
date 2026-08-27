# Plan maestro de mejora de FuenteAI por producto lingüístico

**Estado:** contrato operativo versionado; ejecución coordinada mediante issues y PRs
**Fecha:** 2026-08-26
**Metodología:** SDD (Spec-Driven Development)
**Responsable de arquitectura y revisión:** Codex
**Implementación:** sesiones humanas o AIs ejecutoras, coordinadas mediante GitHub

## 1. Decisión de producto

FuenteAI se tratará como tres productos independientes:

| Producto | Rutas | Mercado inicial | Regla |
|---|---|---|---|
| Español | `/` y `/es/*` | Se definirá en cada research brief | No hereda automáticamente herramientas, consultas, copy ni prioridades de otro idioma |
| Sueco | `/sv/*` | Suecia, salvo decisión explícita | Producto separado, con investigación sueca nativa |
| Italiano | `/it/*` | Italia, salvo decisión explícita | Producto separado, con investigación italiana nativa |

La infraestructura compartida puede reutilizarse cuando sea realmente común: esquema de datos, componentes, validadores, instrumentación y reglas de seguridad. La demanda, selección de herramientas, vocabulario, FAQ, títulos, alternativas y decisiones editoriales pertenecen al producto lingüístico correspondiente.

Una ficha existente en otro idioma no es una prueba de demanda ni un backlog de traducción. Antes de crear o modificar una ficha localizada se debe ejecutar la skill `descargasia-tool-ficha` con un brief de mercado explícito.

## 2. Objetivo

Mejorar, para cada producto lingüístico, cuatro resultados medibles:

1. más impresiones cualificadas en Google;
2. mejor CTR en páginas que ya aparecen en posiciones útiles;
3. más visitas de calidad a las fichas;
4. más salidas hacia el canal oficial correcto de cada herramienta y plataforma.

El proyecto no busca aumentar páginas por volumen. Busca que cada página responda mejor a una intención real y conduzca al usuario a una fuente oficial verificable.

## 3. Evidencia de partida

### 3.1 Google Search Console

Fuente: `fuenteai.com-Performance-on-Search-2026-08-26.zip` y `fuenteai.com-Coverage-2026-08-26.zip`.

- Periodo de rendimiento: 2026-06-19 a 2026-08-24.
- 5.584 impresiones y 43 clics en el gráfico de rendimiento.
- CTR ponderado aproximado: 0,77%.
- Últimos 14 días: 3.561 impresiones y 36 clics.
- El primer día con tres cifras de impresiones fue 2026-08-13: 178.
- La cobertura pasó de 106 URLs indexadas el 2026-08-10 a 160 el 2026-08-17.
- En el último día disponible de cobertura había 160 URLs indexadas y 90 no indexadas.

La lectura actual es de expansión de cobertura y descubrimiento. El promedio de posición todavía es demasiado bajo para convertir todo ese alcance en clics, por lo que la primera palanca será relevancia editorial y CTR, no una expansión masiva del catálogo.

### 3.2 Cloudflare Web Analytics

Fuente: `Analytics _ Análisis web _ G1721m@icloud.com's Account _ Cloudflare.pdf`.

- Periodo: 2026-07-27 a 2026-08-26 19:10, zona horaria UTC-06:00.
- 370 visitas, con bots excluidos.
- 50 visitas identificadas desde Google.
- 320 visitas sin referente; no se interpretan automáticamente como tráfico directo.
- 150 visitas registradas en `/r`; el valor es una señal de funnel, no una conversión confirmada.
- Desktop y móvil están equilibrados: 190 y 180 visitas.
- Sistemas visibles: Windows, iOS, Linux y Android, con macOS en menor volumen.
- Hubo un pico aproximado de 100 visitas el 25 de agosto que requiere diagnóstico por ruta, referente, agente y parámetros.

Cloudflare se usará para comportamiento y conversión. No se usará su mezcla de países para decidir demanda SEO o traducciones, porque el volumen sin referente y las capas de privacidad pueden distorsionar la atribución.

## 4. Principios no negociables

- Cada idioma se investiga y decide como producto independiente.
- La skill de fichas debe producir un market brief, matriz de oportunidades, evidencia, confianza y motivos de descarte antes de seleccionar contenido.
- Las sugerencias o consultas observadas no se presentan como volumen confirmado.
- No se crean páginas para cada error ortográfico.
- No se crean fichas o guías delgadas sólo para capturar una keyword.
- Sólo se publican destinos oficiales, tiendas oficiales, repositorios oficiales o documentación oficial.
- No se inventan plataformas, precios, disponibilidad regional, soporte, privacidad, seguridad ni endorsements.
- `/r` sigue siendo un interstitial de salida noindex; su mejora debe centrarse en claridad, fiabilidad y medición, no en indexarlo.
- Ninguna ruta interna se escribe manualmente fuera de los helpers de `src/utils/links.ts`.
- Toda modificación editorial o de UX debe respetar `docs/BRIEF-IMPLEMENTACION.md`, `docs/design-system.md`, `docs/ux-home-cards.md`, `docs/ux-tool-pages.md` y `docs/enlazado-interno.md`.
- Toda ficha o guía modificada debe pasar `npm run build` antes de publicarse.

## 5. Resultado arquitectónico esperado

El sistema debe sostener este recorrido:

```text
investigación por mercado
        ↓
matriz de oportunidad y decisión de página
        ↓
spec SDD con contrato y criterios verificables
        ↓
implementación aislada por sesión o AI
        ↓
CI + build + revisión editorial + revisión visual
        ↓
medición de Google y Cloudflare
        ↓
decisión de iteración, ampliación o descarte
```

La arquitectura compartida debe permitir que la investigación, la copia y el estado de cada producto se mantengan separados aunque el render y el catálogo base sean comunes.

## 6. Fases SDD

### F0 — Gobierno, baseline y contratos

**Objetivo:** fijar el estado inicial y el modo de trabajo antes de repartir ejecución.

**Salidas:**

- este documento aprobado;
- registro de decisiones arquitectónicas;
- baseline de Google y Cloudflare conservado con periodo, filtros y fuentes;
- definición de eventos de funnel y nombres de dimensiones;
- matriz de propietarios y archivos protegidos por fase;
- plantilla de issue SDD para GitHub.

**Criterios:**

- una sesión nueva puede entender el alcance sin leer conversaciones anteriores;
- queda claro qué pertenece a `es`, `sv`, `it` o a la infraestructura común;
- cada criterio de aceptación tiene una salida legal y puede fallar si el dato es incorrecto;
- las specs no protegen los archivos que la propia fase debe modificar.

**Contrato operativo obligatorio para toda sesión ejecutora:** el trabajo se realiza
siempre en un checkout local del repositorio. La sesión debe sincronizarse con el
remoto al comenzar, crear una rama de trabajo aislada, ejecutar allí el issue
asignado y subir al remoto el resultado al terminar, tanto si termina correctamente
como si queda bloqueada. No se considera entregada una sesión cuyo trabajo exista
solo en el equipo local.

Si el checkout local no existe, la sesión debe localizarlo o clonar
`https://github.com/Gunz-cop/DescargasIA.git` en el workspace autorizado. Si no puede
acceder al repositorio, autenticarse o subir la rama, debe detenerse y reportar el
bloqueo; no debe fingir que publicó cambios ni inventar una URL de rama o PR.

### F1 — Medición de comportamiento y funnel oficial

**Objetivo:** distinguir adquisición, lectura de ficha y salida al canal oficial.

**Trabajo previsto:**

- definir eventos para ficha, plataforma, `/r`, destino, idioma y herramienta;
- registrar el mínimo necesario, sin PII;
- investigar el pico del 25 de agosto;
- validar errores o destinos fallidos del interstitial;
- documentar cómo comparar Google Search Console con Cloudflare sin mezclar definiciones.

**Fuera de alcance:** decisiones de copy, nuevas fichas y cambios de indexación.

**Criterios:**

- cada evento tiene nombre, parámetros permitidos y ejemplo;
- se puede identificar la herramienta y plataforma sin guardar texto libre del usuario;
- el recorrido `/r` puede auditarse sin convertirlo en una URL indexable;
- la revisión de privacidad no depende sólo de un comentario o una convención.

### F2 — Research independiente por producto

**Objetivo:** convertir las señales actuales en oportunidades nativas y verificables.

Debe ejecutarse una vez por producto, con un market brief propio:

- idioma y países;
- variante lingüística;
- plataformas predominantes;
- registro editorial;
- fecha de investigación;
- consultas nativas agrupadas por acceso, instalación, uso, alternativas, privacidad, uso local y tipo de canal.

**Fuentes de evidencia:**

- Google Search Console del producto o de sus rutas, como evidencia interna de consultas y tendencia;
- Cloudflare, sólo como evidencia de comportamiento;
- herramientas de tendencias o volumen, etiquetadas correctamente;
- auditoría de resultados de búsqueda y fuentes oficiales.

**Salida obligatoria:** matriz con consulta principal, variantes nativas, mercado, evidencia, tendencia, competencia observable, debilidad de resultados, intención, página recomendada, confianza y fuentes. Las oportunidades importantes rechazadas deben llevar motivo.

**Regla:** una herramienta que funciona en español no se selecciona automáticamente para sueco o italiano. Una consulta traducida literalmente no es evidencia de demanda nativa.

### F3 — Specs editoriales y de UX

**Objetivo:** convertir cada oportunidad aprobada en una especificación ejecutable.

Cada spec debe decidir:

- ficha, guía o descarte;
- intención primaria y secundarias;
- respuesta que debe aparecer above the fold;
- plataformas y canales oficiales que deben mostrarse;
- secciones editoriales únicas;
- FAQ y advertencias justificadas;
- enlaces internos esperados;
- eventos de funnel;
- criterios de éxito y ventana de medición.

Las fichas mantendrán separados los datos técnicos de `src/content/tools-base/` y el copy nativo de `src/content/tools/<lang>/`.

### F4 — Implementación por lote aislado

**Objetivo:** ejecutar las specs sin mezclar productos ni sobrescribir trabajo de otra sesión.

Los lotes se dividirán por producto y, cuando sea necesario, por tipo de archivo:

- lote de contenido español;
- lote de contenido sueco;
- lote de contenido italiano;
- lote de componentes o infraestructura común;
- lote de instrumentación.

Cada lote tendrá archivos que posee y archivos protegidos. No se permite que dos issues concurrentes editen el mismo JSON o plantilla.

**Criterios:**

- copy nativo, no traducción mecánica;
- hechos oficiales revisados con fecha;
- alternativas con slugs existentes;
- no-installer explícito cuando corresponda;
- sin cambio de contrato de fichas salvo autorización específica;
- build y audits en verde.

### F5 — Enlazado, descubrimiento y categorías

**Objetivo:** distribuir autoridad y ayudar a la persona a seguir una decisión relevante.

**Trabajo previsto:**

- añadir relaciones editoriales explícitas donde la matriz las justifique;
- reforzar los grupos de herramientas locales cuando la evidencia lo respalde;
- revisar categorías con poca cobertura por producto;
- corregir fichas que sólo dependen del relleno rotatorio;
- comprobar que no se crean huérfanas, canonical duplicadas ni alternates incorrectas.

El audit actual no presenta errores duros de enlazado. Sus avisos son backlog editorial, no permiso para reescribir la arquitectura de URLs.

### F6 — Validación y revisión de calidad

**Objetivo:** verificar intención, hechos, render y comportamiento antes de mergear.

**Automático:**

- `npm run catalog:audit`;
- `npm run hw:audit` cuando aplique;
- `npm run agents:skills` cuando se modifiquen skills;
- `npm test`;
- `npm run build`;
- `npm run links:audit`;
- tests específicos de eventos o contratos.

**Manual:**

- página en móvil de 360 px;
- CTA y dominio oficial visibles;
- plataforma y tipo de canal correctos;
- FAQ y fuentes oficiales renderizadas;
- alternativas útiles y no arbitrarias;
- recorrido de `/r` hasta el destino oficial;
- texto natural para el mercado correspondiente.

La aprobación se basa en reproducir el criterio y observar que falla cuando se sabotea el dato, no sólo en verlo pasar una vez.

### F7 — Medición postpublicación e iteración

**Objetivo:** decidir con datos si una mejora se conserva, se ajusta o se descarta.

Ventana inicial: 14 días para detectar errores y 28 días para evaluar tendencia, salvo que el volumen no permita una lectura estable.

**Métricas por producto:**

- impresiones y clics de Google;
- CTR y posición por página y consulta;
- visitas de ficha;
- clics a `/r`;
- salidas al canal oficial por herramienta y plataforma;
- consultas nuevas que aparezcan después del cambio;
- errores de destino o rutas no previstas.

No se declara éxito por aumentar impresiones si bajan la relevancia, el CTR o la salida correcta al canal oficial.

## 7. Prioridades operativas

Estas prioridades siguen vigentes. El orden SDD añade primero los contratos y la medición necesaria para ejecutarlas con seguridad; no las reemplaza. Las páginas y herramientas son hipótesis de trabajo para el producto correspondiente y deben pasar por research antes de modificar contenido.

### Producto español — Google

**P1 — Optimizar las páginas que ya están cerca.** Mejorar CTR, título, description, primer bloque, FAQ y claridad del canal oficial en:

- `character-ai`;
- `mistral-vibe`;
- `stable-diffusion`;
- `open-webui`;
- `hugging-face`.

**P2 — Atacar las mayores bolsas de demanda.** Mejorar relevancia, profundidad e intención de búsqueda en:

- `cursor`;
- `gamma-app`;
- `ollama`;
- `lm-studio`;
- `grok`;
- `perplexity`.

**P3 — Mejorar el enlazado editorial.** Añadir relaciones explícitas y justificadas entre fichas relacionadas, especialmente en programación, presentaciones, asistentes, búsqueda y herramientas de IA local. No crear enlaces arbitrarios ni páginas para errores ortográficos.

**P4 — Concentrarse en español antes de ampliar.** Consolidar las fichas españolas con señales reales. Sueco e italiano mantienen research y backlog propios; no se traducen ni se priorizan usando las consultas españolas.

**P5 — Medir el resultado real.** Medir por producto, herramienta y plataforma:

- impresiones, clics, CTR y posición en Google;
- visitas de ficha;
- entrada a `/r`;
- salida a la fuente oficial;
- errores de destino;
- consultas nuevas después del cambio.

### Secuencia práctica

1. F0/F1: cerrar contratos e instrumentación.
2. F2-ES: validar las oportunidades con investigación nativa.
3. F3-ES: convertir P1 y P2 en specs editoriales y UX.
4. F4-ES: implementar primero P1 y después P2.
5. F5: aplicar P3 sin romper la independencia de los productos.
6. F6: validar build, contenido, UX, SEO y seguridad.
7. F7: comparar resultados a 14 y 28 días y decidir la siguiente iteración.

### Productos sueco e italiano

1. Repetir research nativo para cada mercado.
2. No inferir prioridades desde el volumen español.
3. Validar primero las fichas existentes y las consultas locales antes de ampliar el catálogo.
4. No convertir la baja visibilidad actual en motivo automático para borrar fichas.

### Infraestructura común

1. Instrumentación de funnel sin PII.
2. Validación de redirecciones y destinos oficiales.
3. Componentes que hagan visible plataforma, canal y revisión sin alterar el significado de cada producto.

## 8. Issues de GitHub

El plan fue aprobado el 2026-08-26 y sus requisitos ejecutables quedaron creados en `Gunz-cop/DescargasIA`:

- [Issue maestro #33](https://github.com/Gunz-cop/DescargasIA/issues/33)
- [F0 — gobierno, baseline y contratos #35](https://github.com/Gunz-cop/DescargasIA/issues/35)
- [F1 — medición del funnel oficial #36](https://github.com/Gunz-cop/DescargasIA/issues/36)
- [F2-ES — research español #38](https://github.com/Gunz-cop/DescargasIA/issues/38)
- [F2-SV — research sueco #34](https://github.com/Gunz-cop/DescargasIA/issues/34)
- [F2-IT — research italiano #37](https://github.com/Gunz-cop/DescargasIA/issues/37)
- [F3-ES — specs español #40](https://github.com/Gunz-cop/DescargasIA/issues/40)
- [F3-SV — specs sueco #39](https://github.com/Gunz-cop/DescargasIA/issues/39)
- [F3-IT — specs italiano #41](https://github.com/Gunz-cop/DescargasIA/issues/41)
- [F4-ES — implementación español #44](https://github.com/Gunz-cop/DescargasIA/issues/44)
- [F4-SV — implementación sueco #43](https://github.com/Gunz-cop/DescargasIA/issues/43)
- [F4-IT — implementación italiano #46](https://github.com/Gunz-cop/DescargasIA/issues/46)
- [F5 — enlazado y descubrimiento #42](https://github.com/Gunz-cop/DescargasIA/issues/42)
- [F6 — validación integral #45](https://github.com/Gunz-cop/DescargasIA/issues/45)
- [F7 — medición postpublicación #47](https://github.com/Gunz-cop/DescargasIA/issues/47)

Los números no son secuenciales por idioma porque GitHub asignó los issues en paralelo. Las dependencias se expresan por título dentro de cada issue.

Cada issue debe contener:

- objetivo en una frase;
- producto afectado: `es`, `sv`, `it` o `común`;
- dependencia explícita;
- contrato de entrada;
- contrato de salida;
- archivos que posee;
- archivos protegidos;
- instrucciones de implementación suficientes para una sesión sin contexto;
- criterios de aceptación automáticos y manuales;
- comandos de validación;
- fuera de alcance;
- riesgos y preguntas abiertas;
- evidencia y fecha cuando el issue sea editorial o de investigación.

Las etiquetas de GitHub serán la fuente de estado. No se mantendrá una segunda tabla manual de estados que pueda quedar desactualizada.

Los issues no deben contener criterios imposibles, tautológicos o basados en contar cadenas. Cada criterio importante debe probarse con un caso válido y otro deliberadamente inválido.

## 9. Modelo de colaboración

Codex será dueño de:

- decisiones de arquitectura;
- separación entre productos lingüísticos;
- contratos entre fases;
- revisión de specs;
- revisión de PRs y de criterios de aceptación;
- resolución de conflictos de alcance;
- aceptación o rechazo de resultados.

Las sesiones ejecutoras o AIs trabajarán exclusivamente en el checkout local y serán
responsables de implementar sólo el issue asignado, reportar bloqueos reales y no
ampliar el alcance por iniciativa propia. El flujo mínimo de cada sesión será:

1. localizar el checkout local y comprobar que pertenece a este repositorio;
2. consultar el estado de Git y conservar los cambios preexistentes que no sean de
   su issue;
3. sincronizar la rama base sin borrar ni sobrescribir trabajo ajeno;
4. crear una rama propia con formato `codex/issue-<numero>-<slug>`;
5. leer `AGENTS.md`, el plan, el issue completo y sus referencias antes de editar;
6. publicar un preflight con alcance, archivos propios, archivos protegidos,
   dependencias, riesgos y validaciones;
7. implementar, validar y documentar el resultado en la rama local;
8. hacer commit con un mensaje que incluya el número del issue;
9. subir la rama al repositorio remoto y abrir o actualizar el Pull Request
   correspondiente, enlazando el issue;
10. reportar la URL real de la rama o PR y el resultado de las validaciones.

No se permite trabajar directamente sobre `main`, hacer force-push, borrar cambios
ajenos, cerrar un issue con criterios pendientes ni dejar cambios sin subir.

Si una spec no permite una salida correcta, o la sesión no puede resolver un
problema con evidencia suficiente, debe detenerse. Debe crear un issue `bug` o
`blocker` con el problema, evidencia, archivos afectados, intentos realizados y
decisión pendiente; después debe formular una pregunta concreta. Nunca debe
inventar datos, URLs, fuentes, requisitos, resultados, APIs, pruebas o soluciones.
Si no tiene permisos para crear el issue, debe dejar el texto listo para publicarlo,
sin inventar su número o URL, y subir igualmente a su rama el diagnóstico y el
estado de la sesión.

En esta etapa Codex no implementará las mejoras del sitio. Primero cerrará el plan, derivará los requisitos verificables y revisará las implementaciones que lleguen por sesiones o PRs.


## Prompt inicial obligatorio para cualquier sesión ejecutora

Copia este bloque al iniciar la sesión y sustituye `<numero>` por el issue asignado:

> Actúa como sesión ejecutora del issue #<numero> de `Gunz-cop/DescargasIA`.
>
> **Rol y límites:** Codex es dueño de la arquitectura, el alcance, las decisiones y la revisión. Tú implementas únicamente el issue asignado. No amplíes el alcance, no cambies otro producto lingüístico y no modifiques archivos fuera de los que el issue posee.
>
> **1. Trabaja siempre en local y en el repositorio.** Localiza o clona `https://github.com/Gunz-cop/DescargasIA.git` dentro del workspace autorizado. Verifica `git remote -v`, `git status` y la rama actual. Si ya hay cambios ajenos, consérvalos: no uses `reset --hard`, `checkout --`, `clean`, borrados masivos ni sobrescrituras para “limpiar” el árbol.
>
> **2. Lee el contexto antes de editar.** Lee `AGENTS.md`, este plan, el issue completo, sus dependencias y todas las referencias que el issue declare. Comprueba en `docs/mejora/decisiones.md` cuál es la rama de integración vigente. Actualmente es `main`, salvo una decisión posterior explícita de Codex; no inventes otra.
>
> **3. Resuelve las dependencias.** Si el issue depende de otro que aún no está fusionado, decláralo en el preflight. Puedes preparar trabajo sólo si el issue lo permite, pero no declares la dependencia satisfecha ni fusiones contra una base que no contiene el contrato requerido. No copies silenciosamente archivos desde otra rama para simular que la dependencia está integrada.
>
> **4. Preflight obligatorio.** Antes de cambiar archivos reporta: issue, objetivo, producto (`es`, `sv`, `it` o `común`), rama base, rama nueva, archivos propios, archivos protegidos, dependencias, riesgos, comandos y criterios que deberán verificarse.
>
> **5. Rama y cambios.** Crea una rama aislada `codex/issue-<numero>-<slug>` desde la base vigente. Nunca trabajes directamente sobre `main`, nunca hagas force-push y nunca edites en paralelo un archivo que otra sesión posee. Si hay conflicto de propiedad, detente y pregunta.
>
> **6. Regla anti-alucinación.** No inventes datos, fuentes, URLs, precios, disponibilidad, requisitos, APIs, resultados de tests, estados de GitHub ni soluciones. Si no puedes resolver algo con evidencia suficiente, detente: crea un bug/blocker con evidencia, archivos afectados, intentos y pregunta concreta. Si no tienes permisos para crearlo, deja el texto listo sin inventar número o URL y súbelo a tu rama.
>
> **7. Validación.** Ejecuta los comandos exigidos por el issue y los audits del repositorio. Documenta la salida real. Marca un criterio sólo si es reproducible y tiene evidencia; una afirmación en el resumen no sustituye la prueba.
>
> **8. Entrega obligatoria, incluso con bloqueo.** Al terminar, haz commit de la implementación o del diagnóstico en tu rama y súbela al remoto. Abre o actualiza un PR contra la rama de integración, enlaza el issue y reporta la URL real de la rama/PR, el commit y las validaciones. Si la autenticación o el push fallan, detente y reporta el fallo; no finjas que publicaste cambios ni inventes enlaces.
>
> **9. Estado del issue.** No cierres manualmente un issue con criterios pendientes. `Closes #<numero>` sólo debe cerrarlo cuando el PR se fusione. Si la sesión termina bloqueada, deja el issue abierto y enlaza el blocker.

La respuesta final de la sesión debe incluir el preflight, los archivos tocados, el commit, la URL real, las validaciones, los criterios evidenciados y cualquier limitación.

## 10. Decisiones pendientes para las fases siguientes

- confirmar el alcance geográfico inicial de cada producto lingüístico;
- decidir qué proveedor o formato se usará para los eventos de funnel;
- confirmar si las guías de intención se desbloquean creando primero su ruta pública;
- revisar la política de despliegue y permisos de GitHub Actions para los nuevos issues;
- convertir F0-F7 en issues con dependencias y archivos protegidos concretos.

Hasta cerrar estas decisiones, el documento es el contrato de planificación y no debe interpretarse como autorización para crear contenido, activar idiomas, cambiar indexación o modificar rutas.
