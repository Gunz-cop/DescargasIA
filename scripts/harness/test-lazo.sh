#!/usr/bin/env bash
#
# Ejercita el lazo completo del arnés con un `claude` falso: cero cuota, cero red
# hacia el modelo. Comprueba que el flujo nuevo —auditoría completa una vez,
# después verificación diferencial— llegue a aprobar cuando debe y a NO aprobar
# cuando no debe.
#
# Existe porque las dos primeras corridas reales fallaron por defectos de flujo
# (crear sobre una ficha existente, y un criterio de terminación que no podía
# converger), y cada una costó cuota y media hora para descubrirlo. Un lazo se
# puede probar sin modelo; sólo hace falta un stub que devuelva salidas
# estructuradas válidas.
#
# Corre el build y las métricas de verdad, así que tarda ~1 minuto.

set -euo pipefail

cd "$(dirname "$0")/../.."

command -v jq >/dev/null || { echo "Falta jq: este test lo necesita."; exit 1; }

# Un slug que ya existe en el catálogo: el lazo corre con SKIP_CREATE=true, así
# que necesita una ficha real contra la cual pasar la compuerta determinista.
SLUG_FIJO="chatgpt"
[ -f "src/content/tools-base/$SLUG_FIJO.json" ] || {
  echo "Este test asume que existe la ficha '$SLUG_FIJO'. Cambiá SLUG_FIJO si ya no está."
  exit 1
}

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin"

# El stub decide qué pasada le toca mirando el esquema JSON que recibe, que es lo
# único que distingue una llamada de otra desde afuera.
escribir_stub() {
  local cierra="$1" corregido="$2"
  cat >"$TMP/bin/claude" <<STUB
#!/usr/bin/env bash
schema=""; next=false
for a in "\$@"; do
  if [ "\$next" = true ]; then schema="\$a"; next=false; fi
  [ "\$a" = "--json-schema" ] && next=true
done
emitir() { printf '{"total_cost_usd":0.01,"result":"ok","structured_output":%s}\n' "\$1"; }
case "\$schema" in
  *bloqueantes*) emitir '{"veredicto":"NO_APTO","resumen":"r","fuentes_verificadas":[{"url":"https://ejemplo.test/a","afirmacion":"x","confirmada":true}],"bloqueantes":[{"prioridad":"P1","ubicacion":"tools/es/$SLUG_FIJO.json:limitations[0]","problema":"p","como_corregir":"c"}]}' ;;
  *correcciones*) emitir '{"correcciones":["Corregido."],"no_corregidos":[],"notas":""}' ;;
  *verificaciones*) emitir '{"verificaciones":[{"ubicacion":"tools/es/$SLUG_FIJO.json:limitations[0]","prioridad":"P1","corregido":$corregido,"evidencia":"e"}],"fuentes_nuevas":[],"entradas_nuevas":[],"regresiones":[],"cierra":$cierra,"resumen":"r"}' ;;
  *) emitir '{"slug":"$SLUG_FIJO","nombre":"x","archivos":[],"notas":""}' ;;
esac
STUB
  chmod +x "$TMP/bin/claude"
}

correr() {
  local out="$TMP/$1"
  rm -rf "$out"
  PATH="$TMP/bin:$PATH" \
  SKIP_CREATE=true SLUG="$SLUG_FIJO" HERRAMIENTA="stub" FICHA_LANG=es \
  MAX_LOOPS=2 OUT="$out" PASS_TIMEOUT=300 \
    bash scripts/harness/run.sh >"$TMP/$1.log" 2>&1 || true
  jq -r '.resultado' "$out/estado.json" 2>/dev/null || echo "SIN-ESTADO"
}

fallas=0
esperar() {
  if [ "$2" = "$3" ]; then
    echo "  ok   $1 (resultado: $3)"
  else
    echo "  FALLA $1 — esperaba '$2', obtuvo '$3'"
    fallas=$((fallas + 1))
  fi
}

echo "1. La verificación diferencial cierra -> el arnés aprueba"
escribir_stub true true
esperar "aprueba cuando lo listado quedó corregido" "aprobado" "$(correr ok)"
if ! grep -q 'verificación diferencial' "$TMP/ok.log"; then
  echo "  FALLA no corrió la verificación diferencial (¿volvió a auditar?)"
  fallas=$((fallas + 1))
else
  echo "  ok   la vuelta 2 fue verificación, no una auditoría nueva"
fi

echo
echo "2. Queda un hallazgo sin corregir -> el arnés NO aprueba"
escribir_stub false false
esperar "no aprueba con un P1 pendiente" "agotado" "$(correr fail)"
if grep -q 'Hallazgos todavía sin corregir' "$TMP/fail/iter-2/hallazgos.md" 2>/dev/null; then
  echo "  ok   dejó los pendientes servidos para la corrección siguiente"
else
  echo "  FALLA no armó el archivo de hallazgos pendientes"
  fallas=$((fallas + 1))
fi

echo
if [ "$fallas" -gt 0 ]; then
  echo "$fallas comprobación(es) fallaron."
  exit 1
fi
echo "El lazo se comporta como se espera."
