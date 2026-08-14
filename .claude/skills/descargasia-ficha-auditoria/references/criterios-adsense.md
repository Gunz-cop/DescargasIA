# Criterios de las Publisher Policies aplicados a este sitio

Ejes reales de las políticas de contenido de Google AdSense / Google Publisher
Policies, traducidos a qué mirar concretamente en una ficha de DescargasIA. Cada
eje incluye ejemplos ya encontrados en el catálogo, porque un ejemplo concreto
enseña el criterio mejor que la formulación abstracta.

Este sitio tiene un perfil de riesgo particular: es un directorio que redirige a
descargas y no aloja archivos. Eso lo pone cerca de dos categorías que Google
mira con lupa — páginas de enlaces con poco contenido propio, y ofertas de
descarga engañosas. La defensa del sitio es la verificación editorial, así que
todo lo que debilite esa verificación pesa el doble.

---

## 1. Valor y originalidad

La pregunta operativa: **¿esta página le da al lector algo que no consigue igual
de rápido buscando el nombre de la herramienta en Google?**

Lo que sí califica como valor propio en este catálogo:

- La tabla de canales por plataforma con tipo declarado y fecha de revisión.
  Google te da el sitio oficial; no te dice "para Windows el instalador sale de
  este dominio, para Android el canal es la tienda, ambos revisados tal fecha".
- Heurísticas accionables para reconocer una copia (qué formatos de archivo
  nunca vienen del fabricante, qué promesas delatan un clon).
- Un insight de comunidad con fuente que explique un comportamiento observable
  que la documentación oficial no explica.
- Alternativas con dominio oficial verificado — una comparación que al lector le
  costaría varias búsquedas.

Lo que **no** suma valor aunque ocupe espacio: prosa general sobre para qué sirve
una herramienta famosa. Un lector que ya usó ChatGPT no aprende nada ahí.

El valor del contenido editorial es **inverso a la fama de la herramienta**. Para
una herramienta saturada, exigí que el valor esté en la verificación y el insight.
Para una de cola larga, 1.000 palabras originales en español pueden ser lo mejor
que existe sobre el tema y eso ya justifica la página.

---

## 2. Thin content

En este sitio el thin content no aparece como páginas cortas ni como texto
duplicado entre fichas — eso está medido y es sano. Aparece como **un hecho
estirado por muchos campos**.

Caso real: la historia del feed Discover de Meta AI aparece en `limitations[0]`,
`safetyNotes[0]`, `editorialSections[1]`, el `communityInsight` y el FAQ. Cinco
apariciones, dos de ellas casi palabra por palabra. El conteo de palabras sube,
la información no, y el lector se choca lo mismo cinco veces bajando la página.

Cómo detectarlo: la métrica de duplicación interna, más una lectura completa de
arriba a abajo preguntándote "¿esto ya me lo dijo?".

El otro sabor de thin content es la **baja densidad** en los campos que deberían
ser los más específicos. Test: si la línea sigue siendo verdadera cambiándole el
nombre a la herramienta, no se ganó su lugar.

---

## 3. E-E-A-T real vs. declarado

Declarar autoría no es tener autoridad. Lo que distingue una declaración creíble
de una vacía:

- **La metodología es falsable.** Describe un procedimiento concreto y, sobre
  todo, dice **qué se hace cuando no se puede confirmar un dato**. Admitir
  límites es lo que la hace creíble; "somos expertos" no dice nada.
- **La autoría es una `Organization`, no una persona física inventada.** Un
  autor-persona ficticio con foto es peor que un equipo editorial honesto.
- **La promesa declarada se cumple en la página.** Este es el punto que más
  falla. Si la metodología dice "si no encontramos una fuente verificable, no
  incluimos esa afirmación", entonces cada cita que no respalde su dato es un
  incumplimiento de la propia promesa auditable del sitio — y es el único lugar
  donde un revisor puede comprobar si el sitio hace lo que dice.

Sobre la sección de comunidad: verificá que **haya comunidad**. Un artículo de
prensa reportando sobre una reacción es tercera mano. Un hilo de foro donde un
usuario cuenta qué le pasó es experiencia de primera mano y vale mucho más bajo
un título que promete "qué dice la comunidad".

Y verificá que el insight **cambie una decisión**. Trivia que no altera lo que el
lector va a hacer no es E-E-A-T, es relleno con nota al pie.

---

## 4. Claims engañosos

El eje más duro, porque no admite el atenuante de "se puede mejorar": o el sitio
dice la verdad o no.

Qué revisar:

- **Que el botón lleve a donde dice.** Seguí el flujo hasta el destino final y
  compará con el dominio que la página anuncia. Si el panel promete un dominio y
  el usuario aterriza en otro, eso invierte toda la propuesta del sitio en el
  único momento que le importa al lector.
- **Que la plantilla no prometa lo que la ficha niega.** `<title>`, meta
  description, título del panel y label del CTA se generan sin mirar el tipo de
  plataforma. Una ficha de producto discontinuado puede terminar con
  "sitio oficial" en el título de Google y un botón "Descargar", mientras su
  primera sección se titula "por qué esta ficha no tiene un botón de descarga
  real". La página contradiciéndose a sí misma es el peor hallazgo posible.
- **Que los badges de confianza sean verificables.** "Revisado cada semana" es
  una afirmación de proceso: comprobala contra la distribución real de
  `lastReviewed`. "Sin patrocinios" es una afirmación de monetización:
  comprobala contra cómo se monetiza realmente el clic saliente.
- **Que las advertencias tengan sentido en el caso concreto.** "Cualquier otro
  sitio que ofrezca este programa es un espejo no autorizado" implica que existe
  un sitio legítimo que lo ofrece. En una ficha de producto muerto, es falso.

---

## 5. Ads-to-content y experiencia de página

- Contá los `AdSlot` del template y medí la posición del primero contra el
  primer bloque de contenido sustantivo. Si sólo hay un título y una frase antes
  del anuncio, es "anuncios por encima del contenido" con independencia de lo
  larga que sea la página después.
- Una página cuyo contenido propio es mínimo y cuyo elemento principal es un
  anuncio con temporizador entra en "páginas hechas para mostrar anuncios". El
  `noindex` no la protege: la política aplica donde corre el código
  publicitario, no donde indexa el buscador.
- Un temporizador cuya única justificación era registrar una impresión pierde su
  razón de ser si se saca el anuncio; lo que queda es fricción pura.

Si el usuario ya decidió no tocar algo de este eje, registralo como decisión
tomada y no lo vuelvas a litigar en cada informe.

---

## 6. Señales de contenido generado sin revisión humana

Ninguna de estas es prueba por sí sola; juntas dibujan un patrón.

- Registro inconsistente (voseo/tuteo) entre fichas o dentro de una misma ficha.
- El mismo hecho contado en varios campos con distinto fraseo.
- Referencias internas que no se corresponden con la página ("las alternativas
  de abajo" cuando están arriba; herramientas nombradas que no están enlazadas).
- Afirmaciones en presente sostenidas por evidencia de hace años.
- Hedges donde la fuente citada era concreta ("consultá el aviso oficial" cuando
  el aviso da una URL y una fecha límite).
- Nombres de funciones o productos que ninguna fuente citada respalda.
- Formatos inconsistentes en campos estructurados (fechas `YYYY-MM` junto a
  `YYYY-MM-DD`).
