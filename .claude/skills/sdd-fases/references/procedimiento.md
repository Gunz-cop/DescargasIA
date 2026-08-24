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
- **No escribas criterios que cuenten apariciones de una cadena.** «`grep X` devuelve al menos 3 líneas» premia la duplicación y castiga el buen diseño: una función compartida que reciba lo que varía como argumento cumple el objetivo con una sola aparición. Comprobá el efecto, no la forma.
- **Un placeholder con forma de dato real es peor que un hueco visible.** Un id de credencial inventado (`0a1b2c3d4e5f…`) pasa desapercibido a la lectura y muchas veces también a la validación —un `--dry-run` no resuelve un namespace contra la cuenta—, así que el criterio pasa y el fallo aparece en producción. Cuando una fase necesite un identificador que solo existe tras crear el recurso, la spec debe decir explícitamente que se deje fuera antes que inventarlo.
- **Una compuerta que prohíbe algo debe cubrir solo el código que puede cumplirla.** Si una fase posterior mete bajo esa regla un archivo que por naturaleza necesita lo prohibido, el autor queda entre romper el test o esquivarlo —y lo normal es que lo esquive: partir `document` en `['doc','ument'].join('')` deja el test verde mintiendo. Al ampliar el alcance de una regla, comprobá que todo lo que caerá dentro puede cumplirla; si no, separá los directorios.
- **Ningún archivo que la fase deba escribir puede caer dentro de un `PROTEGIDOS`.** Es la contradicción más cara que se puede meter en una spec: la fase queda sin salida legal, y lo que hace un ejecutor acorralado no es reportarlo —es buscar la rendija. En este proyecto costó tres iteraciones y terminó en código ofuscado para esquivar un test que la fase tenía prohibido modificar.
  **Cada fase posee sus propios tests.** `PROTEGIDOS` lista los tests *de las otras fases*, uno por uno; nunca el directorio entero. `audit-specs.mjs` ya rechaza el solape.
- **Cuidado con los criterios de ausencia.** Un criterio como «`grep -r "window" src/lib/` no devuelve ninguna línea» **no puede pasar nunca**: el propio código documenta la regla en un comentario y el grep la matchea. Si además el archivo que lo dispara está en `PROTEGIDOS`, la sesión ejecutora queda bloqueada sin salida. Comprobá las ausencias sobre el código **con los comentarios quitados**, en un test o en un `node -e`. `audit-specs.mjs` ya rechaza este patrón.

## 5 bis. Poné los criterios en CI antes de repartir el trabajo

Un criterio que corre a mano no es una compuerta: **quien lo declara cumplido es la misma sesión que escribió el código**. Eso funciona mientras el ejecutor sea bueno, y falla en silencio en cuanto no lo es. En este proyecto, antes de existir el CI, pasaron un validador que no podía fallar, un test esquivado partiendo `document` en dos trozos, un id de credencial inventado y dos errores de tipos que llegaron a la rama de integración.

Un workflow de `pull_request` con un paso por criterio cuesta media hora y convierte cada uno en un check visible que el examinado no controla. **Es el requisito para delegar en un ejecutor que no conocés**: sin él, cada PR flojo se paga en tiempo de revisión en vez de ahorrarlo.

Incluí siempre el typecheck. Es el criterio que más se olvida y el que atrapa los errores de integración entre fases, que por definición ninguna fase ve sola.

## 6. Validar las specs

```bash
node .claude/skills/sdd-fases/scripts/audit-specs.mjs
```

Verifica que cada `docs/fases/F*.md` tenga las secciones obligatorias y que sus criterios de aceptación parezcan comandos, no prosa.

## 7. Abrir los issues

Uno por fase, con `templates/issue.md`. El cuerpo **apunta** a la spec, no la copia.

Labels: `fase:F<n>`, `area:<dominio>`, `<proyecto>` (paraguas), y uno de `estado:lista-para-tomar` / `estado:tomada` / `estado:en-revision` / `estado:hecha` / `estado:bloqueada`. Las fases con dependencias abiertas nacen `estado:bloqueada` y con "Bloqueada por #N" en el cuerpo.

### El estado vive en un solo sitio

**La tabla del documento de producto NO lleva columna de estado.** Describe estructura y dependencias —hechos estables y versionados— y nada más. El estado es volátil y vive únicamente en las etiquetas `estado:*` de los issues.

Mantenerlo en los dos sitios obliga a cada sesión a actualizar dos sistemas, y dos representaciones del mismo hecho derivan siempre: en este proyecto la cabecera del documento ya decía "F0 pendiente de arranque" con F0 cerrada, a las pocas horas.

La vista legible se genera bajo demanda con un script que lee los issues (ver `scripts/estado-fases.mjs`). **Ese script nunca se encadena en `npm run build`**: necesita red, y una compuerta de build no puede depender de una API externa.

## 8. Entregar

Al usuario le das: el orden de lanzamiento, qué está desbloqueado ahora, y el prompt copiable de `templates/prompt-sesion.md` con el número de issue ya sustituido.

## El ciclo de revisión (después, en cada PR)

**Antes de nada, `git fetch` y comprobá que revisás el head actual.** Pasó en este proyecto: revisé un PR sobre un commit de hacía cinco horas sin verificar, y reporté como bloqueantes cosas que la sesión ya había corregido. Un comentario de revisión sobre un commit obsoleto hace perder tiempo a quien lo lee y resta credibilidad al resto de los hallazgos. Empezá siempre imprimiendo el sha que estás revisando, y citalo en el comentario.


1. Correr los criterios de aceptación de la spec.
2. `/code-review` sobre el diff.
3. Verificar que `PROTEGIDOS` esté intacto: `git diff --name-only origin/<base>...HEAD`.
4. Hallazgos → **comentarios en el PR**. Lo que no queda escrito en GitHub, no existe.
5. Si el fallo fue de la spec y no de la ejecución → corregir `docs/fases/F<n>.md` en un commit aparte y anotarlo en la bitácora de la spec de producto.
6. Verde → merge a la rama de integración, cerrar el issue, quitar `estado:bloqueada` a los que dependían de él.
