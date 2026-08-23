# Procedimiento completo

## 1. Explorar antes de proponer

Nunca escribas un plan sin haber leído el repo. Buscá específicamente:

- qué helpers, componentes y patrones ya existen y se pueden reutilizar;
- qué auditorías y compuertas van a evaluar el trabajo;
- si algo parecido ya se resolvió antes (este repo tiene precedentes fuertes: `Directory.astro` para interactividad, `ficha-harness.yml` para orquestación, `audit-catalog.mjs` para validación de datos).

Un agente `Explore` con un encargo amplio suele bastar y es más barato que leer archivo por archivo.

## 2. Cerrar decisiones con el usuario

Usá `AskUserQuestion` con opciones concretas, cada una con su consecuencia, y marcá la recomendada primero. No preguntes lo que podés decidir con un default sensato; sí preguntá lo que cambia materialmente el trabajo.

Las que casi siempre hay que cerrar en este repo:

| Decisión | Por qué importa |
|---|---|
| Backend / runtime | El sitio es estático. Cualquier cosa dinámica obliga a elegir entre Worker+assets, adapter híbrido o puro cliente. |
| Rol de la IA | Si la IA decide o solo asiste. Cambia la testabilidad de todo el proyecto. |
| Alcance de la v1 | Sin un corte explícito, el plan crece hasta ser inejecutable. |
| Idiomas | El audit exige hreflang recíproco: lanzar en un idioma y traducir después no es gratis. |

Registrá cada decisión **con su motivo** en la spec de producto. Sin el motivo, la fase siguiente la reabre.

## 3. Escribir la spec de producto

`docs/<proyecto>.md`, con la plantilla `templates/spec-producto.md`. Es el documento que responde *por qué* y *qué*, no *cómo* en detalle.

## 4. Descomponer en fases

Reglas de corte:

- **Propiedad de archivos disjunta.** Si dos fases editan el mismo archivo, o las secuenciás o las fusionás.
- **Cada fase termina en algo verificable**, no en "la mitad de un componente".
- **Las fases de datos y de motor van primero** y pueden ir en paralelo: son las de más criterio y las que después sirven de compuerta para el resto.
- **La fase que crea una página debe incluir su enlazado**, o el audit la marca huérfana.
- **Entre 6 y 10 fases.** Menos, y cada una no cabe en una sesión; más, y el coste de coordinación se come la ganancia.

Dibujá el grafo de dependencias y decí explícitamente qué puede ir en paralelo.

## 5. Escribir una spec por fase

`docs/fases/F<n>.md`, con la plantilla `templates/spec-fase.md`. **Es el entregable más importante de toda la planificación.**

La prueba de fuego: *leer esa spec sin ningún otro contexto debe bastar para saber qué construir y cómo se verifica.* Si para entenderla hace falta el chat donde se diseñó, está mal escrita.

Sobre los criterios de aceptación:

- Cada uno es un comando con su salida esperada. `npm test`, `node scripts/audit-x.mjs`, `npm run build`, `git diff --name-only | grep -c protegido` → 0.
- Si un criterio es inevitablemente visual o manual (accesibilidad con lector de pantalla, recorrido en móvil), escribilo como **pasos numerados reproducibles** con el resultado esperado en cada uno, y marcalo `[manual]`. No lo dejes como adjetivo.
- Si una fase no tiene ningún criterio ejecutable, la fase está mal cortada.

## 6. Validar las specs

```bash
node .claude/skills/sdd-fases/scripts/audit-specs.mjs
```

Verifica que cada `docs/fases/F*.md` tenga las secciones obligatorias y que sus criterios de aceptación parezcan comandos, no prosa.

## 7. Abrir los issues

Uno por fase, con `templates/issue.md`. El cuerpo **apunta** a la spec, no la copia.

Labels: `fase:F<n>`, `<proyecto>` (paraguas), y uno de `estado:lista-para-tomar` / `estado:tomada` / `estado:en-revision` / `estado:bloqueada`. Las fases con dependencias abiertas nacen `estado:bloqueada` y con "Bloqueada por #N" en el cuerpo.

## 8. Entregar

Al usuario le das: el orden de lanzamiento, qué está desbloqueado ahora, y el prompt copiable de `templates/prompt-sesion.md` con el número de issue ya sustituido.

## El ciclo de revisión (después, en cada PR)

1. Correr los criterios de aceptación de la spec.
2. `/code-review` sobre el diff.
3. Verificar que `PROTEGIDOS` esté intacto: `git diff --name-only origin/<base>...HEAD`.
4. Hallazgos → **comentarios en el PR**. Lo que no queda escrito en GitHub, no existe.
5. Si el fallo fue de la spec y no de la ejecución → corregir `docs/fases/F<n>.md` en un commit aparte y anotarlo en la bitácora de la spec de producto.
6. Verde → merge a la rama de integración, cerrar el issue, quitar `estado:bloqueada` a los que dependían de él.
