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

Los recursos estáticos (`/api/*`, `/llms*.txt`, `/md/*`, `/.well-known/*`)
responden con `Access-Control-Allow-Origin: *`.

`/mcp` y `/a2a` **no**. Ahí se valida `Origin` como exige la spec de MCP
Streamable HTTP para prevenir DNS rebinding: se acepta la petición sin
`Origin` —el caso normal de un cliente que no es un navegador— y la que venga
del propio sitio; cualquier otro `Origin` recibe 403 y ninguna cabecera CORS.
Si tu cliente no es un navegador, no te afecta: no mandes `Origin`.

## Endpoints de registro y aprovisionamiento

**Ninguno, y es deliberado.** No existe `register_uri`, ni endpoint de
aprovisionamiento, ni emisión de credenciales, ni servidor de autorización
OAuth asociado a este dominio.

Por eso este dominio **no** publica
`/.well-known/oauth-authorization-server`,
`/.well-known/openid-configuration` ni
`/.well-known/oauth-protected-resource`: no hay tal servidor de autorización, y
publicar esos documentos apuntando a uno inexistente rompería a cualquier
cliente que intentase seguirlos.

## Métodos soportados

Uno solo: **acceso anónimo por HTTPS**. No hay negociación, ni fallback, ni un
segundo método para clientes registrados.

```json
{
  "identity_types_supported": ["anonymous"],
  "anonymous": {
    "credential_types_supported": []
  },
  "registration_endpoints": [],
  "bearer_methods_supported": []
}
```

`credential_types_supported` está vacío y no hay `claim_uri` porque **no se
emite ninguna credencial que reclamar**. El formato Auth.md contempla un
`claim_uri` para el flujo anónimo cuando el servicio entrega un identificador
efímero; aquí no se entrega nada, así que declararlo sería apuntar a un
endpoint que no existe. Un validador estricto puede avisar de su ausencia: el
aviso es correcto, y la respuesta es que no hay nada que reclamar.

## Uso de credenciales

No se envía ninguna credencial, porque no hay ninguna que enviar.

Si tu cliente añade una cabecera `Authorization`, se ignora: no se lee, no se
valida y no cambia la respuesta. Tampoco se requiere ni se lee ninguna cookie.
No hay sesión: cada petición es independiente y no deja estado en el servidor.

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
