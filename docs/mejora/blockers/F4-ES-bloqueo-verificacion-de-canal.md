# Blocker F4-ES — la verificación de canal no se puede ejecutar en esta sesión

**Issue:** [#44](https://github.com/Gunz-cop/DescargasIA/issues/44) (SDD F4-ES)
**Fase:** F4-ES · producto `es`
**Rama base:** `main` (`docs/mejora/decisiones.md`, registro 2026-08-27)
**Rama de este diagnóstico:** `codex/issue-44-f4-es-bloqueo-verificacion-canal`
**Fecha de la comprobación:** 2026-08-27
**Estado de la fase:** **bloqueada antes de escribir**. No se ha modificado
ninguna ficha del catálogo.

> Este documento no es una spec ni sustituye a ninguna. Es el diagnóstico que
> el «Protocolo universal de inicio y entrega» del issue #44 exige subir a la
> rama cuando una sesión no puede resolver algo con evidencia suficiente.

---

## Resumen

F3-ES (#40, fusionada) convierte a la regla común 3 de
`docs/mejora/specs/es.md` en **condición de arranque** de F4-ES: antes de
escribir una sola frase sobre canales hay que abrir cada URL de `platforms`
del slug y comprobar que sigue siendo el canal oficial del editor y que el
`type` declarado coincide con lo que hay al otro lado.

En esta sesión **ninguna** de las 22 URL de canal de los seis slugs del alcance
es alcanzable: la política de egress de la red devuelve `403` en el `CONNECT`
para todos los dominios implicados. La regla común 3 no se puede cumplir para
ninguna fila, ni siquiera parcialmente, así que **no hay ninguna fila que
pueda ejecutarse** y la fase se detiene sin escribir.

## Qué exige exactamente la spec, y por qué esto la bloquea entera

| Fuente | Texto que bloquea |
|---|---|
| `docs/mejora/specs/es.md`, regla común 3 | «Antes de escribir una sola frase sobre canales, la sesión de F4-ES: 1. abre cada URL de `platforms` del slug que va a tocar; 2. comprueba que sigue siendo el canal oficial del editor y que el `type` declarado coincide con lo que hay al otro lado» |
| `docs/mejora/specs/es.md`, «Instrucciones» §4 | «Antes de escribir, aplica la regla común 3 (verificación de canal). **Sin ella, el lote no puede empezar.**» |
| Lote 1, fila 2 (`perplexity`) | «El research marca el estado del escritorio como **no verificado**. […] **Sin esa comprobación, la fila 2 no se ejecuta.**» |
| Lote 2, fila 4 (`cursor`) | «Comprobar qué hay hoy en el dominio antiguo `cursor.sh` y anotarlo. El copy solo puede decir lo observado» |
| Lote 3, fila 11 (`mistral-vibe`) | «Comprobar con qué nombre aparece hoy la app en cada tienda y anotarlo» |
| Lote 1 y 2, criterios `[manual]` | «Registro de verificación de canal: 1. abre cada URL de `platforms` […]; 3. resultado esperado: el PR incluye esa tabla y ninguna afirmación del copy va más allá de lo anotado» |

No es un criterio cosmético que se pueda dejar sin marcar: es la puerta de
entrada. El `lastChecked` de `tools-base` (2026-08-12, y 2026-08-15 en las tres
plataformas de escritorio de Cursor) **autoriza a priorizar, no a afirmar**
(research §6, citado por la spec madre). Escribir copy de canal apoyándose solo
en ese sello sería exactamente lo que la spec prohíbe.

## Evidencia — las 22 URL de canal, comprobadas una por una

Comando aplicado a cada URL (seguimiento de redirecciones incluido):

```
curl -sS -o /dev/null -w '%{http_code}|%{url_effective}' --max-time 25 -L "<url>"
```

Resultado en todas: el túnel `CONNECT` es rechazado por el proxy de egress
antes de que exista una respuesta del servidor de destino.

```
* Establish HTTP proxy tunnel to character.ai:443
> CONNECT character.ai:443 HTTP/1.1
< HTTP/1.1 403 Forbidden
* CONNECT tunnel failed, response 403
curl: (56) CONNECT tunnel failed, response 403
```

| Slug | Plataforma | `type` declarado | URL | Resultado 2026-08-27 |
|---|---|---|---|---|
| `character-ai` | web | `web-app` | `https://character.ai` | Bloqueado — `CONNECT` 403 |
| `character-ai` | android | `app-store` | `https://play.google.com/store/apps/details?id=ai.character.app` | Bloqueado — `CONNECT` 403 |
| `character-ai` | ios | `app-store` | `https://apps.apple.com/us/app/character-ai-chat-talk-text/id1671705818` | Bloqueado — `CONNECT` 403 |
| `perplexity` | web | `web-app` | `https://www.perplexity.ai` | Bloqueado — `CONNECT` 403 |
| `perplexity` | windows | `app-store` | `https://apps.microsoft.com/detail/xp8jnqfbqh6pvf` | Bloqueado — `CONNECT` 403 |
| `perplexity` | android | `app-store` | `https://play.google.com/store/apps/details?id=ai.perplexity.app.android` | Bloqueado — `CONNECT` 403 |
| `perplexity` | ios | `app-store` | `https://apps.apple.com/us/app/perplexity-ai-search-chat/id1668000334` | Bloqueado — `CONNECT` 403 |
| `ollama` | web | `official-site` | `https://ollama.com` | Bloqueado — `CONNECT` 403 |
| `ollama` | windows | `official-installer` | `https://ollama.com/download/OllamaSetup.exe` | Bloqueado — `CONNECT` 403 |
| `ollama` | mac | `official-installer` | `https://ollama.com/download/Ollama-darwin.zip` | Bloqueado — `CONNECT` 403 |
| `ollama` | linux | `documentation` | `https://ollama.com/download/linux` | Bloqueado — `CONNECT` 403 |
| `cursor` | web | `official-site` | `https://cursor.com` | Bloqueado — `CONNECT` 403 |
| `cursor` | windows | `official-installer` | `https://cursor.com/downloads` | Bloqueado — `CONNECT` 403 |
| `cursor` | mac | `official-installer` | `https://cursor.com/downloads` | Bloqueado — `CONNECT` 403 |
| `cursor` | linux | `official-installer` | `https://cursor.com/downloads` | Bloqueado — `CONNECT` 403 |
| `stable-diffusion` | web | `github-repo` | `https://github.com/AUTOMATIC1111/stable-diffusion-webui` | Bloqueado — HTTP 403 |
| `stable-diffusion` | windows | `github-repo` | `https://github.com/LykosAI/StabilityMatrix` | Bloqueado — HTTP 403 |
| `stable-diffusion` | mac | `github-repo` | `https://github.com/comfy-org/ComfyUI` | Bloqueado — HTTP 403 |
| `stable-diffusion` | linux | `github-repo` | `https://github.com/comfy-org/ComfyUI` | Bloqueado — HTTP 403 |
| `mistral-vibe` | web | `web-app` | `https://chat.mistral.ai` | Bloqueado — `CONNECT` 403 |
| `mistral-vibe` | android | `app-store` | `https://play.google.com/store/apps/details?id=ai.mistral.chat` | Bloqueado — `CONNECT` 403 |
| `mistral-vibe` | ios | `app-store` | `https://apps.apple.com/us/app/vibe-by-mistral-ex-le-chat/id6740410176` | Bloqueado — `CONNECT` 403 |

Verificación adicional de que no es un fallo puntual de un dominio, sino la
política de egress de la sesión: `example.com` y `www.google.com` devuelven el
mismo `CONNECT` 403. Lo único alcanzable es la API de GitHub del repositorio
autorizado (`api.github.com`, HTTP 200) y los registros de paquetes. Los
repositorios de `stable-diffusion` están en `github.com`, pero fuera del
alcance concedido a la sesión, y devuelven 403 igualmente.

El proxy documenta este caso explícitamente: «403 / 407 from the proxy — the
destination host is not allowed by your organization's egress policy for this
session. **Do not retry or route around it — report the blocked host.**»
No se ha intentado ningún rodeo.

## Qué se intentó antes de bloquear

1. `WebFetch` sobre las URL oficiales → `EGRESS_BLOCKED` por dominio.
2. `curl` directo con el proxy configurado → `CONNECT tunnel failed, response 403`.
3. Consulta del estado del proxy (`/__agentproxy/status`) → política activa,
   sin fallos de confianza TLS ni de configuración; el bloqueo es de política,
   no un problema de certificados que se pueda corregir desde aquí.
4. Comprobación de si el bloqueo es selectivo → no lo es: alcanza a cualquier
   dominio que no sea GitHub o un registro de paquetes.
5. Búsqueda web (`WebSearch`), que sí funciona → **descartada como evidencia
   válida**. Devuelve resúmenes y páginas de terceros, no la URL oficial
   abierta. La regla común 3 pide abrir la URL de `platforms` y comprobar el
   `type` al otro lado; un resumen de un tercero no es eso, y aceptarlo sería
   dar por satisfecha una dependencia que no lo está.

Ese último punto no es teórico. Al probar `WebSearch` con Perplexity para
Windows, los resultados incluían afirmaciones **contradictorias entre sí** sobre
si el canal de Windows es la ficha de Microsoft Store o un instalador
descargable de la página del editor. Si el segundo caso fuera el vigente,
`platforms.windows` (`type: app-store`) estaría desactualizado y esto sería una
decisión de catálogo de Codex, no un arreglo de copy. **Esta sesión no lo
afirma en ninguna dirección**: no ha podido abrir ninguna de las dos páginas.
Queda anotado como lo que es, una señal sin verificar que la sesión que
desbloquee la fila 2 debe resolver primero.

## Qué NO se ha hecho, deliberadamente

- No se ha modificado ninguna ficha de `src/content/tools/es/`.
- No se ha modificado `src/content/tools-base/` (prohibido a F4-ES en cualquier
  caso: es decisión de catálogo).
- No se ha escrito copy de canal apoyado en el `lastChecked` de `tools-base`,
  en la memoria del modelo ni en resultados de búsqueda de terceros.
- No se ha dado por verificada ninguna fila, ni se ha marcado ningún criterio
  `[manual]` de verificación de canal.
- No se ha copiado nada de la rama de F1 (#36), que sigue sin fusionar.

## Dependencias declaradas, con su estado real

| Dependencia | Estado | Efecto |
|---|---|---|
| #40 (F3-ES) | **Fusionada** en `main` (`4174bde`) | Entrada disponible: las cuatro specs hijas existen |
| #36 (F1, funnel) | **No fusionada** — PR #52 abierto | Los eventos que las specs citan no existen en `main`. Métrica primaria no evidenciable |
| #50 (export de Search Console) | **Abierto** | Métrica secundaria no evidenciable |
| Egress a canales oficiales | **Bloqueado** (este documento) | Regla común 3 incumplible → F4-ES no puede empezar |

Las tres primeras ya estaban previstas por F3-ES y solo impiden *declarar éxito
medido*. La cuarta es nueva e impide *entregar*.

## Pregunta concreta para desbloquear

**¿Por qué vía se ejecuta la verificación de canal de la regla común 3, dado
que la sesión ejecutora no tiene acceso de red a ningún dominio oficial?**

Tres salidas posibles, ninguna de las cuales puede decidir esta sesión:

1. **Habilitar el egress** a los dominios de `platforms` de los seis slugs para
   las sesiones que ejecuten F4. Es la única que deja la regla común 3 tal cual
   está escrita.
2. **Mover la verificación a un runner de GitHub Actions**, que sí tiene salida
   a internet. El repositorio ya tiene la pieza: `ficha-harness.yml` y
   `docs/ficha-harness.md`, con `skip_create` para auditar y corregir slugs que
   ya existen. Haría falta decidir si el registro de verificación que produce
   el runner es evidencia aceptable para los criterios `[manual]` de las specs
   hijas, y quién lo firma.
3. **Que la verificación la aporte Codex o el propietario** como tabla fechada
   (URL, editor observado, `type` observado) adjunta a cada lote, y que la
   sesión ejecutora escriba únicamente contra esa tabla. Exigiría una anotación
   explícita en `docs/mejora/decisiones.md`, porque cambia quién responde de la
   regla común 3.

Mientras no se cierre esa decisión, cualquier sesión de F4-ES que abra las
fichas se va a encontrar con el mismo muro. El mismo bloqueo alcanza, por
simetría, a **F4-SV (#43) y F4-IT (#46)**: sus specs heredan la misma exigencia
de verificar el canal oficial antes de escribir.

## Qué queda listo para la sesión que desbloquee

El trabajo de lectura y encuadre ya está hecho y no hay que repetirlo:

- Alcance real de F4-ES: **tres lotes ejecutables**, seis fichas, y el lote 4
  entregado bloqueado por F3-ES (no hay ruta pública para `src/content/guides/`).
- Cada spec hija exige que el diff de su rama toque **exclusivamente** sus dos
  ficheros, así que F4-ES son **tres ramas y tres PR**, no uno. Si se prefiere
  un PR acumulado, hay que relajar antes ese criterio en las tres specs; no se
  esquiva desde la sesión.
- Corrección pendiente ya identificada en el lote 1: `src/content/tools/es/character-ai.json`
  afirma hoy en absoluto que no existe instalador de escritorio
  («Character.AI no distribuye instaladores de escritorio», «no hay versión de
  escritorio»). La regla común 4 y el criterio `[manual]` de afirmación acotada
  obligan a reescribir eso como ausencia en el catálogo, salvo verificación
  explícita en la fuente oficial registrada con URL y fecha. Es parte del lote,
  no ampliación de alcance.
- Señal sin verificar sobre `perplexity`/Windows, anotada más arriba, que la
  fila 2 debe resolver antes de escribir.
