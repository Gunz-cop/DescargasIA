#!/usr/bin/env bash
#
# Test de humo de `escribir_resumen` (scripts/harness/run.sh).
#
# Existe porque esas expresiones de jq son el único tramo del arnés que no corre
# hasta el final de una corrida real: si una tiene un error de sintaxis, se
# descubre después de haber pagado las tres pasadas del modelo. Corre en segundos
# y sin cuota, así que el workflow lo ejecuta antes de arrancar el arnés.
#
# Arma un harness-out/ de fixture que cubre los casos raros —una fuente
# confirmada y otra no, una con `observacion` y otra sin ella, una iteración con
# el array vacío— y comprueba que el resumen los renderice.

set -euo pipefail

cd "$(dirname "$0")/../.."

command -v jq >/dev/null || { echo "Falta jq: este test lo necesita."; exit 1; }

OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

# Sólo la función bajo prueba, sin ejecutar el arnés. Termina en `}` a nivel cero,
# así que el rango de sed la aísla entera.
eval "$(sed -n '/^escribir_resumen() {/,/^}/p' scripts/harness/run.sh)"

SLUG="ficha-de-prueba"
FICHA_LANG="es"
RESULTADO="aprobado"
VEREDICTO_FINAL="APTO_CON_AVISOS"
ITER_FINAL=2
MAX_LOOPS=5
MODEL="claude-opus-5"
EFFORT="medium"

printf '0.42\n1.13\n' >"$OUT/costos.txt"

# Iteración 1: no aprueba, con fuentes verificadas de los dos signos y una sola
# con `observacion` (el otro caso deja el campo ausente, que es el que rompería
# una interpolación descuidada).
mkdir -p "$OUT/iter-1"
cat >"$OUT/iter-1/veredicto.json" <<'JSON'
{
  "veredicto": "NO_APTO",
  "resumen": "Una cita no sobrevive abrir la fuente.",
  "fuentes_verificadas": [
    {
      "url": "https://ejemplo.test/articulo",
      "afirmacion": "3.000 mensajes semanales",
      "confirmada": false,
      "observacion": "el articulo dice que la cifra no se precisó"
    },
    {
      "url": "https://ejemplo.test/changelog",
      "afirmacion": "el plan gratuito perdió la exportación en marzo",
      "confirmada": true
    }
  ],
  "bloqueantes": [
    {
      "prioridad": "P0",
      "ubicacion": "tools/es/ficha-de-prueba.json:communityInsights[0]",
      "problema": "La fuente no contiene la cifra que se le atribuye.",
      "como_corregir": "Buscar una fuente que la respalde o borrar la afirmación."
    }
  ]
}
JSON
cat >"$OUT/iter-1/correccion.json" <<'JSON'
{
  "correcciones": ["Se borró la cifra sin respaldo del insight 1."],
  "no_corregidos": ["El P2 de registro: quedaría para una pasada editorial."],
  "notas": ""
}
JSON

# Iteración 2: el caso que ahora bloquea la aprobación, array vacío.
mkdir -p "$OUT/iter-2"
cat >"$OUT/iter-2/veredicto.json" <<'JSON'
{
  "veredicto": "APTO",
  "resumen": "Sin defectos mecánicos.",
  "fuentes_verificadas": [],
  "bloqueantes": []
}
JSON

escribir_resumen

fallas=0
comprobar() {
  # El `--` no es adorno: varios patrones empiezan con guion y grep los tomaría
  # como opciones.
  if grep -qF -- "$2" "$OUT/resumen.md"; then
    echo "  ok   $1"
  else
    echo "  FALLA $1 — no aparece: $2"
    fallas=$((fallas + 1))
  fi
}

echo "estado.json:"
jq -e '.slug == "ficha-de-prueba" and .costo_estimado_usd == 1.55' "$OUT/estado.json" >/dev/null \
  && echo "  ok   parsea y suma los costos" \
  || { echo "  FALLA estado.json"; fallas=$((fallas + 1)); }

echo "resumen.md:"
comprobar "encabezado con el slug"            'ficha-de-prueba'
comprobar "fila de resultado"                 'aprobado'
comprobar "modelo y esfuerzo"                 '`claude-opus-5` (effort `medium`)'
comprobar "bloqueante con prioridad y ruta"   '**P0** `tools/es/ficha-de-prueba.json:communityInsights[0]`'
comprobar "fuente no confirmada"              'NO https://ejemplo.test/articulo'
comprobar "observacion entre parentesis"      '(el articulo dice que la cifra no se precisó)'
comprobar "fuente confirmada"                 'OK https://ejemplo.test/changelog'
comprobar "sin observacion no deja 'null'"    'el plan gratuito perdió la exportación en marzo'
comprobar "correccion aplicada"               '- Se borró la cifra sin respaldo'
comprobar "correccion no aplicada"            '(sin corregir)'
comprobar "aviso de array vacio"              'no reportó ninguna fuente verificada'

if grep -qF 'null' "$OUT/resumen.md"; then
  echo "  FALLA se filtró un 'null' al resumen"
  fallas=$((fallas + 1))
fi

if [ "$fallas" -gt 0 ]; then
  echo
  echo "$fallas comprobación(es) fallaron. Resumen generado:"
  cat "$OUT/resumen.md"
  exit 1
fi

echo
echo "El resumen se renderiza bien."
