# Formato del informe

El informe se lee para decidir qué tocar antes de replicar un patrón a decenas de
fichas. Todo lo que no ayude a esa decisión sobra.

Usá esta estructura:

```markdown
## 1. Veredicto
[Sí / No / Dudoso] + la razón principal en UNA frase.

## 2. Hallazgos priorizados
Agrupados por P0 / P1 / P2, cada uno con ubicación exacta y por qué es un
problema real.

## 3. Lo que sí funciona
Qué no hay que romper al corregir.

## 4. Escala
Si el patrón sirve para el resto del catálogo o hace falta algo más.
```

---

## El veredicto

Una palabra y una frase. Sin hedging, sin resumen tibio. Si la respuesta es "no",
la frase tiene que nombrar **el** motivo, no cinco.

Si el motivo principal cae fuera de lo que el usuario está evaluando (por
ejemplo, pidió juzgar el contenido y el problema está en el flujo de redirección),
decilo explícitamente y separá los dos planos: "el contenido aguanta; el veredicto
sigue en no por X, que es otra cosa".

---

## Los hallazgos

Prioridades:

- **P0** — bloquea la aprobación por sí solo. Claims engañosos, citas que no
  respaldan su dato, páginas hechas para mostrar anuncios.
- **P1** — un revisor lo marca y baja la confianza general, pero no rechaza solo
  por eso.
- **P2** — degrada calidad; se corrige cuando se toque el archivo.

Cada hallazgo lleva:

1. **Ubicación exacta**: `archivo:línea` o `archivo:campo`, o el nombre de la
   sección renderizada. "El contenido es genérico" no es accionable;
   "`chatgpt.json:10-18`, las tres `limitations` aplican a las 67 fichas" sí.
2. **La evidencia**, no la impresión. Si medible, el número. Si es una cita, el
   texto de la fuente al lado del texto de la ficha para que el contraste se vea
   sin abrir nada.
3. **Por qué es un problema real**, no sólo mejorable. Si no podés completar esa
   frase, probablemente no era un hallazgo.

Presentá contrastes en tabla cuando comparés varias fichas o varios lugares del
mismo problema — se lee de un vistazo y ahorra párrafos.

No infles la lista. Cinco hallazgos ubicados y verificados valen más que quince
genéricos, y la credibilidad del informe se juega en que el usuario pueda
comprobar cada uno.

---

## Lo que sí funciona

Sección obligatoria, y no por cortesía. Una auditoría que sólo lista defectos
lleva a que se rehaga algo que estaba bien.

Sé tan específico acá como en los hallazgos: qué componente, qué decisión de
diseño, qué campo. Si una ficha del catálogo resuelve bien algo que otra resuelve
mal, nombralas a las dos — el ejemplo interno es la mejor guía de corrección que
podés dar.

---

## Escala

Respondé la pregunta que el usuario realmente tiene: ¿esto se replica a las otras
fichas o hay que arreglar algo antes?

Incluí:

- **Qué arreglar antes de replicar**, en orden, con el mínimo viable explícito.
- **Si el patrón alcanza o hace falta otra señal** (más insights, fuentes más
  primarias, otra cosa).
- **Un indicador para monitorear** al escalar, cuando exista uno medible.

Si el retorno del patrón varía según el tipo de ficha, decilo: en este catálogo
el contenido editorial rinde más en las herramientas de cola larga que en las
famosas, y eso cambia dónde conviene invertir el esfuerzo.

---

## Tono

Escribí como un revisor externo: directo, verificable, sin adornos ni
condescendencia. Nada de "podría considerarse que quizás". Si algo está mal,
está mal; si está bien, decilo sin hedging.

Y si en el curso de la auditoría medís algo que contradice una crítica que ya
hiciste, corregila en el informe de forma explícita y seguí. Sostener una
impresión contra un dato propio es la forma más rápida de que el informe deje de
servir.
