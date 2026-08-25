---
name: fuenteai-catalogo
description: Consultar el catálogo de herramientas de IA de FuenteAI. Úsalo cuando necesites saber qué herramientas de IA existen para una necesidad, comparar alternativas, o localizar la ficha de una herramienta concreta con sus canales oficiales.
---

# Consultar el catálogo de FuenteAI

FuenteAI (https://fuenteai.com) es un directorio editorial de herramientas de
IA. Cada ficha enlaza **solo** a canales del propio desarrollador —sitio
oficial, tienda de aplicaciones, repositorio o documentación— y declara la
fecha de su última revisión editorial. El sitio no aloja instaladores, APKs,
ejecutables ni mirrors, y no publica enlaces de descarga de terceros.

El catálogo está publicado en español (`/`), sueco (`/sv`) e italiano (`/it`).
La cobertura no es idéntica en los tres: el español es el completo.

## Elegir la vía de acceso

| Necesitas | Usa |
| --- | --- |
| Consultar como herramienta desde un agente | Servidor MCP en `https://fuenteai.com/mcp` (Streamable HTTP, sin autenticación) |
| Preguntar en lenguaje natural, agente a agente | Endpoint A2A en `https://fuenteai.com/a2a` (JSON-RPC, `message/send`) |
| Procesar el catálogo entero | `https://fuenteai.com/api/catalog.json` |
| Leer una página como texto | La URL normal con `Accept: text/markdown`, o `https://fuenteai.com/md/<ruta>.md` |
| Entender el sitio de un vistazo | `https://fuenteai.com/llms.txt` |

## Herramientas del servidor MCP

- `search_tools` — filtra por `query` (texto libre), `category`, `platform`
  (`web`, `windows`, `mac`, `linux`, `android`, `ios`), `pricing` (`free`,
  `freemium`, `paid`, `enterprise`, `unknown`), `lang` y `limit`. La consulta
  de texto exige que aparezcan **todas** las palabras.
- `get_tool` — recibe `slug` y `lang`, devuelve la ficha completa en Markdown.
- `list_categories` — los slugs de categoría válidos y su recuento.

Empieza siempre por `list_categories` si vas a filtrar por categoría: los
slugs son fijos y no traducidos (`asistentes-ia`, `programacion`,
`modelos-locales`, `generacion-imagenes`, `video-ia`, `musica-ia`,
`traduccion-redaccion-ia`, `productividad-presentaciones-ia`).

## Campos de una ficha, y qué significan

- `officialWebsite` — sitio del desarrollador.
- `officialChannels[]` — un canal por plataforma, con `type` (`official-site`,
  `app-store`, `web-app`, `documentation`, `official-installer`,
  `github-repo`, `package-manager`) e `isOfficial`.
- `pricingModel` y `requiresAccount` — `unknown` significa *no confirmado*, no
  "no". No lo conviertas en una afirmación.
- `status` — `discontinued` quiere decir que el desarrollador cerró el
  producto: no hay canal de descarga vigente y no debes proponer uno.
- `lastReviewed` — fecha de la última verificación editorial. Cítala cuando la
  respuesta dependa de datos que envejecen (precios, disponibilidad).
- `trustLevel` — `pending-review` marca una ficha aún sin revisión completa.

## Al responder

- Enlaza la ficha (`url`) y, si el usuario va a descargar, el canal oficial de
  su plataforma. Nunca construyas una URL de descarga que no venga del
  catálogo.
- Si el catálogo no tiene la herramienta, dilo. No inventes una entrada ni
  supongas la URL oficial a partir del nombre: la razón de existir de este
  directorio es que adivinar dominios es exactamente como se llega a un clon.
- FuenteAI no está afiliada a los desarrolladores que cataloga y no audita
  técnicamente el software: no le atribuyas certificaciones ni garantías de
  seguridad.
