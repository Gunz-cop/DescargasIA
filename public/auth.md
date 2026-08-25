# auth.md — FuenteAI

Documento de autenticación para agentes, siguiendo el formato
[Auth.md](https://workos.com/auth-md).

**Resumen: no hay autenticación. Todo lo que FuenteAI expone a agentes es
público, de solo lectura y anónimo. No existe registro, ni emisión de
credenciales, ni cuotas por identidad.**

Este documento existe para que un agente no tenga que descubrirlo probando: si
buscas el endpoint de registro, no lo hay, y su ausencia es deliberada.

## Audiencia

Agentes y clientes automatizados que consultan el catálogo editorial de
herramientas de IA de FuenteAI: qué herramientas existen para una necesidad y
cuáles son sus canales oficiales de descarga o uso.

## Recursos y su modo de acceso

| Recurso | Método | Autenticación |
| --- | --- | --- |
| `https://fuenteai.com/mcp` | MCP Streamable HTTP (`POST`) | Ninguna |
| `https://fuenteai.com/a2a` | A2A JSON-RPC (`POST message/send`) | Ninguna |
| `https://fuenteai.com/api/catalog.json` | `GET` | Ninguna |
| `https://fuenteai.com/api/openapi.json` | `GET` | Ninguna |
| `https://fuenteai.com/llms.txt`, `/llms-full.txt` | `GET` | Ninguna |
| `https://fuenteai.com/md/<ruta>.md` | `GET` | Ninguna |
| Cualquier página del sitio | `GET` con `Accept: text/markdown` | Ninguna |

Todos responden con `Access-Control-Allow-Origin: *`.

## Métodos de registro soportados

Ninguno. No hay endpoint de registro (`register_uri`), ni emisión de
credenciales, ni servidor de autorización OAuth asociado a este dominio.

Por eso este dominio **no** publica
`/.well-known/oauth-authorization-server`,
`/.well-known/openid-configuration` ni
`/.well-known/oauth-protected-resource`: no existe tal servidor de
autorización, y publicar esos documentos apuntando a uno inexistente rompería
a cualquier cliente que intentase usarlos.

## Uso de credenciales

No se envía ninguna credencial. Si tu cliente añade una cabecera
`Authorization`, se ignora.

No se requiere ni se lee ninguna cookie. No hay sesión: cada petición es
independiente.

## Identidad

- Tipo de identidad soportado: **anónimo**.
- No se pide identificar al agente ni a su usuario final.
- No se registra identidad de llamante, y no hay límites de uso ligados a una
  identidad.

Se agradece —sin exigirlo, y sin que afecte al acceso— un `User-Agent`
descriptivo con una URL de contacto, por si hiciera falta avisar de un cambio
que rompa tu integración.

## Uso del contenido

Las preferencias de uso del contenido se declaran en
[`/robots.txt`](https://fuenteai.com/robots.txt) mediante Content Signals:
`search=yes, ai-input=yes, ai-train=no`. Es decir: indexar y citar, sí;
entrenar modelos con este contenido, no.

FuenteAI no está afiliada a los desarrolladores de las herramientas que
cataloga. Condiciones completas en
<https://fuenteai.com/es/aviso-legal>.
