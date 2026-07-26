# Sistema de Diseno — "Registro Editorial"

Direccion de diseno vigente de FuenteAI. Leer antes de tocar estilos.

## Concepto

FuenteAI no es una landing de producto de IA: es un **registro de verificacion**.
La referencia mental es un indice publico o un archivo de consulta, no una web
de marketing. La confianza se comunica con **datos visibles** (dominio, tipo de
canal, fecha de revision), no con efectos visuales.

Consecuencias directas:

- Nada de blobs difuminados, glassmorphism, degradados decorativos ni animaciones
  de maquina de escribir. Se eliminaron todos.
- La profundidad viene de filetes de 1px, escalones de tono y espacio en blanco.
- El dato es el heroe: dominios, fechas e identificadores van en monoespaciada.

## Color

Definido en `src/styles/global.css`. Tema claro ("Papel") por defecto, tema
oscuro ("Tinta") disponible; el tema se aplica con `data-theme` en `<html>`
**antes del primer pintado** mediante un script inline en `<head>`.

- `--brand-primary`: tinta ambar/sello. Unico color de marca. Se usa para
  acciones e identidad.
- `--brand-success`: verde. **Reservado exclusivamente para "verificado"**
  (dominios oficiales, nivel de confianza). No usarlo como color decorativo.
- `--brand-warning-*` / `--brand-danger-*`: solo semantica.
- `--brand-on-primary`: color de texto sobre el boton primario. Cambia por tema
  (blanco en claro, tinta en oscuro) para mantener contraste AA en ambos.

Todos los pares de texto/fondo del sistema superan 4.5:1 en ambos temas.
Al anadir tokens, verificar el contraste antes de publicar.

## Tipografia

Tres voces, cada una con un papel. El contraste entre ellas **es** la identidad
del sitio; no son intercambiables.

| Voz | Familia | Para que |
|---|---|---|
| `--font-display` | Instrument Serif | Titulares. La voz de la publicacion. |
| `--font-sans` | Pila del sistema (0 bytes) | Interfaz y texto corrido. |
| `--font-mono` | JetBrains Mono | Capa de datos: dominios, fechas, numeros de registro, rotulos. |

Solo se descargan dos familias y tres cortes. El texto de interfaz, que es el
grueso del sitio, no cuesta ni un byte.

Utilidades:

- `.display` — titulares en serif, peso 400. Sustituye al antiguo `font-['Outfit']`.
  Un `<em>` dentro de un `.display` sale en cursiva ambar: es el recurso de
  enfasis de los titulares (ver el H1 de la home, partido por la ultima coma).
- `.eyebrow` — rotulo de seccion en monoespaciada, mayusculas, 11px.
- `.data-tag` — dominios, fechas e identificadores en monoespaciada, 12px.
- `.record-num` — numero de registro (`№ 007`) en mono ambar.

Evitar `font-black` y las escalas de 10px: la jerarquia se construye con tamano,
contraste de voz y espacio, nunca con grosor extremo. Los titulares deben ser
**grandes**: una serif de peso 400 a 20px no es un titular, es texto corrido.

## Recursos con firma

Son los elementos que hacen que el sitio no sea intercambiable con cualquier
otro directorio. Usarlos con intencion y no multiplicarlos.

- **Mancheta** (home): filete superior + rotulo de seccion + edicion del indice
  (la revision mas reciente de todo el catalogo) e idiomas, en monoespaciada.
- **Papel pautado** (`.registry-grid`): renglones horizontales tenues detras de
  la cabecera, con mascara de desvanecido. Es un libro de registro, no una
  reticula de puntos.
- **Filete doble** (`.rule-double`): regla gruesa/fina de las publicaciones
  impresas, para abrir el directorio.
- **Numeros de registro**: cada ficha del indice lleva su `№` correlativo.
- **Sello** (`.stamp`, ficha de herramienta): doble borde ambar, ligeramente
  girado, con dominio y fecha de revision. Declara **lo que comprobamos
  nosotros**; nunca debe redactarse como un aval de la marca listada.

## Dos vistas, un solo DOM

El directorio de la home ofrece vista **Registro** (por defecto) y vista
**Fichas**. No hay marcado duplicado: el contenedor `.tools` cambia de
`data-view` y el CSS reordena la misma estructura. La preferencia se guarda en
`localStorage`. Si se anaden piezas a `ToolCard`, comprobar las dos vistas.

## Componentes

- `src/utils/brand.ts` — fuente unica de verdad: categorias (slug, tono,
  etiquetas por idioma), tonos por herramienta, orden de plataformas y utilidades
  de dominio/fecha/iniciales.
- `src/components/Monogram.astro` — identificador editorial. Recibe `tone`; el
  CSS deriva el resto con `color-mix()`.
- `src/components/ToolCard.astro` — registro de herramienta (ver `ux-home-cards.md`).
- `src/components/CategoryNav.astro` — indice de categorias.
- `src/components/Directory.astro` — buscador + filtros + rejilla + estado vacio.
  El estado se refleja en la URL (`?q=`, `?cat=`, `?plat=`), los chips usan
  `aria-pressed` real y hay una region `aria-live` con el recuento.

## Reglas de accesibilidad que no se negocian

- Un unico `<h1>` por pagina, con texto real en el HTML (nunca inyectado por JS).
- Enlace "saltar al contenido" como primer elemento enfocable.
- Los paneles ocultos usan el atributo `hidden` (no `max-height: 0`), para que no
  queden controles enfocables invisibles.
- Objetivos tactiles de al menos 44px de alto.
- `prefers-reduced-motion` anula transiciones y animaciones.

## Antes de publicar

```bash
npm run build
```
