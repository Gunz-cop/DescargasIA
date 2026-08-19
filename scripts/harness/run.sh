#!/usr/bin/env bash
#
# Arnés de creación de fichas: crear -> auditar -> corregir -> auditar, hasta
# MAX_LOOPS vueltas o hasta que la auditoría dé el visto bueno.
#
# Está pensado para correr en CI (.github/workflows/ficha-harness.yml), no en una
# sesión interactiva de Claude Code: cada llamada al modelo es un `claude -p`
# nuevo, sin contexto compartido, y toda la memoria entre pasadas viaja por
# archivos en $OUT.
#
# Variables de entrada (las inyecta el workflow):
#   HERRAMIENTA  qué herramienta fichar (nombre, o nombre + URL oficial)
#   SLUG         opcional; si va vacío lo decide la pasada de creación
#   FICHA_LANG   idioma editorial (es | sv | it)
#   MAX_LOOPS    máximo de ciclos auditar/corregir
#   MODEL        modelo para las tres pasadas
#   EFFORT       nivel de esfuerzo (low | medium | high | xhigh | max)
#   SKIP_CREATE  "true" para auditar/corregir una ficha que ya existe
#
# Salidas: $OUT/resumen.md, $OUT/estado.json y un directorio por iteración.

set -euo pipefail

OUT="${OUT:-harness-out}"
FICHA_LANG="${FICHA_LANG:-es}"
MAX_LOOPS="${MAX_LOOPS:-2}"
# Techo por pasada. Sin esto, una auditoría que se traba abriendo fuentes quema
# cuota hasta que GitHub mata el job — y el arnés muere sin dejar resumen porque
# el proceso no alcanza a correr su trap de salida.
PASS_TIMEOUT="${PASS_TIMEOUT:-600}"
# Cada pasada recarga el repo y la skill. Sonnet es un default más razonable para
# este lazo: Opus sigue disponible como input explícito cuando la ficha lo exige.
MODEL="${MODEL:-claude-sonnet-5}"
EFFORT="${EFFORT:-medium}"
SKIP_CREATE="${SKIP_CREATE:-false}"
# Para fichas de alto riesgo: exige una auditoría escéptica completa después de
# que la verificación diferencial cierre, antes de aprobar. Necesita MAX_LOOPS=3.
FINAL_AUDIT="${FINAL_AUDIT:-false}"
PROMPTS="scripts/harness/prompts"
METRICAS=".claude/skills/descargasia-ficha-auditoria/scripts/metricas.mjs"

# Todo lo que define el examen. Ninguna pasada del modelo puede tocarlo: si el
# examinado puede editar la compuerta, el veredicto no significa nada.
PROTEGIDOS=(.github .claude scripts src/content.config.ts src/pages src/components src/utils src/data package.json)

RESULTADO="incompleto"
VEREDICTO_FINAL="sin veredicto"
ITER_FINAL=0
SNAPSHOT_PROTEGIDOS="$(git status --porcelain -- "${PROTEGIDOS[@]}")"
SNAPSHOT_CONTENIDO=""

mkdir -p "$OUT"

# ---------------------------------------------------------------- utilidades

log() { printf '\n==> %s\n' "$*"; }

# Sustituye los {{PLACEHOLDERS}} de una plantilla de prompt. Se hace con perl y no
# con sed porque los valores traen barras, URLs y saltos de línea.
render() {
  local file="$1"; shift
  local body; body="$(cat "$file")"
  while [ "$#" -gt 0 ]; do
    body="$(KEY="$1" VAL="$2" perl -0777 -pe 's/\Q$ENV{KEY}\E/$ENV{VAL}/g' <<<"$body")"
    shift 2
  done
  printf '%s' "$body"
}

# Comprueba que la pasada que acaba de correr no haya tocado el examen.
#
# Corre después de CADA pasada del modelo, no una vez por vuelta: las tres
# pasadas trabajan con Edit/Write/Bash bajo `--permission-mode acceptEdits`, y
# una comprobación al final del cuerpo del lazo se saltea entera en el camino que
# termina aprobando — que es justo el que produce un PR de aspecto limpio.
#
# Los archivos de infraestructura se revierten. Los de `src/content` NO se
# revierten nunca: ahí vive el trabajo real de la corrida y un `git checkout` lo
# borraría entero. Cuando una pasada de sólo lectura los toca, se aborta y se
# deja el árbol como está para poder mirarlo.
guardia() {
  local modo="${1:-escritura}"
  local ahora
  ahora="$(git status --porcelain -- "${PROTEGIDOS[@]}")"
  # Se compara contra el estado inicial, no contra "limpio": en local el árbol
  # puede arrancar con archivos sin trackear legítimos (`.claude/settings.local.json`)
  # y tratarlos como violación haría que el arnés no corriera nunca fuera de CI.
  if [ "$ahora" != "$SNAPSHOT_PROTEGIDOS" ]; then
    echo "::error::Una pasada modificó archivos protegidos. El arnés se detiene." >&2
    diff <(echo "$SNAPSHOT_PROTEGIDOS") <(echo "$ahora") >&2 || true
    # Revierte lo modificado. Los archivos añadidos no se borran: la corrida
    # aborta igual y conviene poder mirarlos.
    git checkout -- "${PROTEGIDOS[@]}" 2>/dev/null || true
    RESULTADO="abortado-archivos-protegidos"
    return 1
  fi
  if [ "$modo" = "solo-lectura" ] && [ "$(git status --porcelain -- src/content)" != "$SNAPSHOT_CONTENIDO" ]; then
    echo "::error::Una pasada de sólo lectura (auditoría) modificó src/content. El arnés se detiene." >&2
    git status --porcelain -- src/content >&2
    RESULTADO="abortado-auditoria-escribio"
    return 1
  fi
  return 0
}

# Una pasada de modelo. $1=prompt, $2=turnos máximos, $3=esquema JSON,
# $4=archivo donde dejar la respuesta cruda, $5=modo para la guardia.
# Imprime el structured_output por stdout.
#
# `claude -p` puede salir con código 0 aunque la corrida haya fallado por dentro,
# así que el error también se detecta por la ausencia de structured_output.
claude_run() {
  local prompt="$1" turns="$2" schema="$3" raw="$4" modo="${5:-escritura}"
  local code=0
  SNAPSHOT_CONTENIDO="$(git status --porcelain -- src/content)"
  # Task/TodoWrite no aportan al contrato de una pasada y permitirían abrir
  # trabajo paralelo que dispara el consumo y vuelve impredecible el tiempo.
  timeout --signal=TERM --kill-after=30 "$PASS_TIMEOUT" \
  claude -p "$prompt" \
    --model "$MODEL" \
    --effort "$EFFORT" \
    --max-turns "$turns" \
    --permission-mode acceptEdits \
    --allowedTools "Bash,Read,Edit,Write,Glob,Grep,WebFetch,WebSearch" \
    --output-format json \
    --json-schema "$schema" \
    >"$raw" 2>"${raw%.json}.stderr" || code=$?
  if [ "$code" -eq 124 ] || [ "$code" -eq 137 ] || [ "$code" -eq 143 ]; then
    echo "::error::la pasada excedió PASS_TIMEOUT ($PASS_TIMEOUT s) y se cortó." >&2
    tail -n 20 "${raw%.json}.stderr" >&2
    RESULTADO="abortado-timeout-de-pasada"
    return 1
  fi
  if [ "$code" -ne 0 ]; then
    echo "::error::claude terminó con código $code. stderr:" >&2
    tail -n 30 "${raw%.json}.stderr" >&2
    RESULTADO="abortado-pasada-fallida"
    return 1
  fi
  local cost
  cost="$(jq -r '.total_cost_usd // 0' "$raw" 2>/dev/null || echo 0)"
  echo "$cost" >>"$OUT/costos.txt"
  if ! jq -e '.structured_output' "$raw" >/dev/null 2>&1; then
    echo "::error::la pasada no devolvió salida estructurada. Resultado crudo:" >&2
    jq -r '.result // .' "$raw" | tail -n 40 >&2
    RESULTADO="abortado-sin-salida-estructurada"
    return 1
  fi
  # La guardia va antes de entregar el resultado: si la pasada tocó el examen, el
  # llamador no llega a usar lo que devolvió.
  guardia "$modo" || return 1
  jq '.structured_output' "$raw"
}

# Aborta si la herramienta pedida ya está en el catálogo.
#
# Existe porque la primera corrida real del arnés se pidió sobre `kling-ai`, que
# ya estaba fichada: en vez de crear, se puso a reescribir tres archivos en dos
# idiomas, y la comparación de originalidad y `--cross-lang` corrieron contra
# material maduro. Es la forma más cara que puede tomar una corrida, y la más
# fácil de pedir por error. Este chequeo cuesta milisegundos y cero cuota.
#
# Crear y actualizar son operaciones distintas: para actualizar una ficha que ya
# existe está `skip_create: true`, que saltea la creación y va derecho al lazo.
verificar_duplicado() {
  local candidatos=() dominio
  # 1. El slug que saldría del nombre pedido, y el que pasó el usuario.
  candidatos+=("$(sed 's/(.*//' <<<"$HERRAMIENTA" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9]\+/-/g; s/^-//; s/-$//')")
  [ -n "${SLUG:-}" ] && candidatos+=("$SLUG")

  local encontrados=()
  local c
  for c in "${candidatos[@]}"; do
    [ -n "$c" ] && [ -f "src/content/tools-base/$c.json" ] && encontrados+=("$c")
  done

  # 2. El dominio oficial, si el pedido trae una URL. Atrapa los cambios de
  #    marca: "Kling AI" y "kling.ai" no dan el mismo slug, pero sí la misma ficha.
  dominio="$(grep -oiE 'https?://[^ )]+' <<<"$HERRAMIENTA" | head -1 \
    | sed 's|https\?://||; s|^www\.||; s|/.*||' || true)"
  if [ -n "$dominio" ]; then
    local hit
    while IFS= read -r hit; do
      [ -n "$hit" ] && encontrados+=("$(basename "$hit" .json)")
    done < <(grep -rlF "$dominio" src/content/tools-base/ 2>/dev/null || true)
  fi

  if [ "${#encontrados[@]}" -gt 0 ]; then
    local unicos
    unicos="$(printf '%s\n' "${encontrados[@]}" | sort -u | tr '\n' ' ')"
    echo "::error::\"$HERRAMIENTA\" ya está en el catálogo: $unicos" >&2
    echo "::error::Crear encima de una ficha existente la reescribe entera y mide originalidad contra sí misma." >&2
    echo "::error::Si querés actualizarla, volvé a disparar el workflow con skip_create=true y slug=<el de arriba>." >&2
    RESULTADO="abortado-ficha-duplicada"
    return 1
  fi
  return 0
}

# Corre metricas.mjs sobre la ficha. $1=archivo de salida, resto=banderas extra.
# --cross-lang sólo cuando la ficha existe en más de un idioma: compara las
# versiones entre sí, y con una sola versión no tiene nada que comparar.
metricas() {
  local salida="$1"; shift
  local extra=()
  local versiones
  versiones="$( (ls src/content/tools/*/"$SLUG".json 2>/dev/null || true) | wc -l )"
  if [ "$versiones" -gt 1 ]; then extra+=(--cross-lang); fi
  # Incluye el chequeo de URLs: metricas.mjs hace una petición con timeout por
  # fuente, pero una ficha con muchas fuentes también necesita un techo global.
  timeout --signal=TERM --kill-after=15 120 \
    node "$METRICAS" "$SLUG" --lang "$FICHA_LANG" "${extra[@]}" "$@" --strict >"$salida" 2>&1
}

# ------------------------------------------------------------------ esquemas

SCHEMA_CREAR='{"type":"object","properties":{
  "slug":{"type":"string"},
  "nombre":{"type":"string"},
  "categoria":{"type":"string"},
  "archivos":{"type":"array","items":{"type":"string"}},
  "notas":{"type":"string"}
},"required":["slug","nombre","archivos","notas"]}'

# `fuentes_verificadas` es obligatorio a propósito. La aprobación depende de un
# veredicto que el modelo se auto-reporta, y sin este campo no hay forma de
# distinguir una pasada que abrió cada fuente de una que las dio por buenas: el
# array vacío deja la omisión a la vista en el resumen y en el PR.
SCHEMA_AUDITAR='{"type":"object","properties":{
  "veredicto":{"type":"string","enum":["APTO","APTO_CON_AVISOS","NO_APTO"]},
  "resumen":{"type":"string"},
  "fuentes_verificadas":{"type":"array","items":{"type":"object","properties":{
    "url":{"type":"string"},
    "afirmacion":{"type":"string"},
    "confirmada":{"type":"boolean"},
    "observacion":{"type":"string"}
  },"required":["url","afirmacion","confirmada"]}},
  "bloqueantes":{"type":"array","items":{"type":"object","properties":{
    "prioridad":{"type":"string","enum":["P0","P1","P2"]},
    "ubicacion":{"type":"string"},
    "problema":{"type":"string"},
    "como_corregir":{"type":"string"}
  },"required":["prioridad","ubicacion","problema","como_corregir"]}}
},"required":["veredicto","resumen","fuentes_verificadas","bloqueantes"]}'

SCHEMA_CORREGIR='{"type":"object","properties":{
  "correcciones":{"type":"array","items":{"type":"string"}},
  "no_corregidos":{"type":"array","items":{"type":"string"}},
  "notas":{"type":"string"}
},"required":["correcciones","no_corregidos","notas"]}'

# La verificación diferencial: acotada a los hallazgos de la única auditoría, al
# diff de la corrección y a lo que el script de alcance detectó como agregado.
# No busca hallazgos nuevos — ver scripts/harness/prompts/04-verificar.md.
SCHEMA_VERIFICAR='{"type":"object","properties":{
  "verificaciones":{"type":"array","items":{"type":"object","properties":{
    "ubicacion":{"type":"string"},
    "prioridad":{"type":"string","enum":["P0","P1","P2"]},
    "corregido":{"type":"boolean"},
    "evidencia":{"type":"string"}
  },"required":["ubicacion","prioridad","corregido","evidencia"]}},
  "fuentes_nuevas":{"type":"array","items":{"type":"object","properties":{
    "url":{"type":"string"},
    "afirmacion":{"type":"string"},
    "respalda":{"type":"boolean"}
  },"required":["url","afirmacion","respalda"]}},
  "entradas_nuevas":{"type":"array","items":{"type":"object","properties":{
    "campo":{"type":"string"},
    "responde_a_hallazgo":{"type":"boolean"},
    "detalle":{"type":"string"}
  },"required":["campo","responde_a_hallazgo","detalle"]}},
  "regresiones":{"type":"array","items":{"type":"string"}},
  "cierra":{"type":"boolean"},
  "resumen":{"type":"string"}
},"required":["verificaciones","fuentes_nuevas","entradas_nuevas","regresiones","cierra","resumen"]}'

# ------------------------------------------------------------------- resumen

# Se escribe desde un trap de EXIT para que una corrida que aborta a mitad deje
# igual su rastro: una pasada que falló en la vuelta 3 es información, y sin esto
# se perdía entera.
escribir_resumen() {
  local costo
  costo="$(awk '{s+=$1} END {printf "%.2f", s+0}' "$OUT/costos.txt" 2>/dev/null || echo 0)"

  jq -n \
    --arg slug "${SLUG:-desconocido}" \
    --arg lang "$FICHA_LANG" \
    --arg resultado "$RESULTADO" \
    --arg veredicto "$VEREDICTO_FINAL" \
    --arg iteraciones "$ITER_FINAL" \
    --arg costo "$costo" \
    '{slug:$slug, lang:$lang, resultado:$resultado, veredicto:$veredicto,
      iteraciones:($iteraciones|tonumber), costo_estimado_usd:($costo|tonumber)}' \
    >"$OUT/estado.json" 2>/dev/null || true

  {
    echo "## Arnés de ficha — \`${SLUG:-desconocido}\` ($FICHA_LANG)"
    echo
    echo "| | |"
    echo "|---|---|"
    echo "| Resultado | **$RESULTADO** |"
    echo "| Veredicto final | $VEREDICTO_FINAL |"
    echo "| Iteraciones usadas | $ITER_FINAL de $MAX_LOOPS |"
    echo "| Modelo | \`$MODEL\` (effort \`$EFFORT\`) |"
    echo "| Costo estimado | US\$ $costo |"
    echo
    local d n
    for d in "$OUT"/iter-*; do
      [ -d "$d" ] || continue
      echo "### $(basename "$d")"
      if [ -f "$d/veredicto.json" ]; then
        echo
        echo "**$(jq -r '.veredicto' "$d/veredicto.json")** — $(jq -r '.resumen' "$d/veredicto.json")"
        echo
        jq -r '.bloqueantes[]? | "- **\(.prioridad)** `\(.ubicacion)` — \(.problema)"' "$d/veredicto.json"
        echo
        n="$(jq '.fuentes_verificadas | length' "$d/veredicto.json")"
        if [ "$n" -eq 0 ]; then
          echo "> **La auditoría no reportó ninguna fuente verificada.** O la ficha no cita ninguna, o la pasada se salteó el paso 3. Revisalo a mano antes de mergear."
        else
          echo "<details><summary>Fuentes verificadas contra la afirmación exacta ($n)</summary>"
          echo
          jq -r '.fuentes_verificadas[] | "- \(if .confirmada then "OK" else "NO" end) \(.url) — \(.afirmacion)\(if .observacion then " (\(.observacion))" else "" end)"' "$d/veredicto.json"
          echo
          echo "</details>"
        fi
      elif [ -f "$d/verificacion.json" ]; then
        # Vuelta de verificación diferencial: no re-audita, comprueba que lo que
        # la auditoría listó haya quedado corregido.
        echo
        echo "**Verificación diferencial** — $(jq -r '.resumen' "$d/verificacion.json")"
        echo
        jq -r '.verificaciones[]? | "- \(if .corregido then "corregido" else "**SIN CORREGIR**" end) — \(.prioridad) `\(.ubicacion)`"' "$d/verificacion.json"
        jq -r '.regresiones[]? | "- **regresión** — \(.)"' "$d/verificacion.json"
        jq -r '.fuentes_nuevas[]? | select(.respalda == false) | "- **fuente agregada sin respaldo** — \(.url)"' "$d/verificacion.json"
        jq -r '.entradas_nuevas[]? | select(.responde_a_hallazgo == false) | "- **contenido fuera de alcance** — `\(.campo)`: \(.detalle)"' "$d/verificacion.json"
      else
        echo
        echo "La compuerta determinista falló; no hubo auditoría del modelo."
      fi
      if [ -f "$d/correccion.json" ]; then
        echo
        echo "Correcciones aplicadas:"
        jq -r '.correcciones[]? | "- \(.)"' "$d/correccion.json"
        jq -r '.no_corregidos[]? | "- (sin corregir) \(.)"' "$d/correccion.json"
      fi
      echo
    done
  } >"$OUT/resumen.md" 2>/dev/null || true
}
trap escribir_resumen EXIT

if ! [[ "$MAX_LOOPS" =~ ^[1-3]$ ]]; then
  echo "::error::MAX_LOOPS debe ser 1, 2 o 3 (3 sólo tiene sentido con FINAL_AUDIT=true)." >&2
  RESULTADO="abortado-max-loops-invalido"
  exit 1
fi

# ------------------------------------------------------------------- 1. crear

if [ "$SKIP_CREATE" != "true" ]; then
  verificar_duplicado || exit 3
  # Se guarda la lista previa para volver a chequear después: la pasada de
  # creación elige el slug final, y puede aterrizar en uno existente aunque el
  # nombre pedido no lo sugiriera.
  SLUGS_PREVIOS="$(ls src/content/tools-base/*.json 2>/dev/null | xargs -n1 basename 2>/dev/null | sed 's/\.json$//' || true)"

  log "Creando la ficha de: $HERRAMIENTA"
  mkdir -p "$OUT/crear"
  prompt="$(render "$PROMPTS/01-crear.md" \
    '{{HERRAMIENTA}}' "$HERRAMIENTA" \
    '{{LANG}}' "$FICHA_LANG" \
    '{{SLUG}}' "${SLUG:-}")"
  claude_run "$prompt" 45 "$SCHEMA_CREAR" "$OUT/crear/raw.json" >"$OUT/crear/salida.json"
  SLUG="$(jq -r '.slug' "$OUT/crear/salida.json")"
  if grep -qxF "$SLUG" <<<"$SLUGS_PREVIOS"; then
    echo "::error::La pasada de creación aterrizó en '$SLUG', que ya existía antes de esta corrida." >&2
    echo "::error::Revisá el diff: reescribió una ficha del catálogo en vez de crear una nueva." >&2
    RESULTADO="abortado-ficha-duplicada"
    exit 3
  fi
  log "Ficha creada con slug: $SLUG"
  jq -r '.notas' "$OUT/crear/salida.json"
fi

if [ -z "${SLUG:-}" ]; then
  echo "::error::No hay slug: pasá uno como input o dejá que corra la pasada de creación." >&2
  RESULTADO="abortado-sin-slug"
  exit 1
fi
echo "$SLUG" >"$OUT/slug.txt"

# --------------------------------------------------- 2. lazo auditar/corregir

RESULTADO="agotado"
VEREDICTO_FINAL="NO_APTO"
# Aviso que una vuelta le deja a la auditoría de la siguiente, cuando el problema
# está en cómo auditó y no en la ficha. Se consume y se limpia al usarlo.
NOTA_AUDITORIA=""
SALTEAR_CORRECCION=false
AUDITORIA_FINAL_HECHA=false
# La auditoría escéptica completa corre una vez; a partir de ahí el lazo verifica
# la corrección contra los hallazgos de esa auditoría en vez de re-auditar.
MODO="auditoria"
HALLAZGOS_ORIGEN=""
CORRECCION_ORIGEN=""
DIFF_ORIGEN=""
ALCANCE_ORIGEN=""

for ITER in $(seq 1 "$MAX_LOOPS"); do
  ITER_FINAL="$ITER"
  DIR="$OUT/iter-$ITER"
  mkdir -p "$DIR"
  log "Iteración $ITER/$MAX_LOOPS — compuerta determinista"

  # La compuerta barata va primero: build + integridad + métricas. Si esto falla
  # no se gasta una pasada de auditoría del modelo, porque los hallazgos ya están
  # servidos y son más precisos que cualquier lectura.
  #
  # Sin --check-urls: esa bandera hace una petición de red por cada fuente citada
  # y la skill la reserva para el cierre. Corre una sola vez, en la verificación
  # de cierre de más abajo, cuando la ficha está por aprobar.
  GATE_OK=true
  {
    echo "# Compuerta determinista — iteración $ITER"
    echo
    echo '## npm run build:no-shorten'
    echo '```'
  } >"$DIR/gate.md"
  if timeout --signal=TERM --kill-after=15 180 npm run build:no-shorten >>"$DIR/gate.md" 2>&1; then
    echo '```' >>"$DIR/gate.md"
  else
    echo '```' >>"$DIR/gate.md"
    echo 'El build falló. Es bloqueante: hasta que no compile, nada más importa.' >>"$DIR/gate.md"
    GATE_OK=false
  fi

  {
    echo
    echo '## metricas.mjs --strict'
    echo '```'
  } >>"$DIR/gate.md"
  METRICAS_OK=true
  : >"$DIR/metricas.txt"
  if ! metricas "$DIR/metricas.txt"; then
    METRICAS_OK=false
  fi
  cat "$DIR/metricas.txt" >>"$DIR/gate.md"
  echo '```' >>"$DIR/gate.md"
  if [ "$METRICAS_OK" = false ]; then
    GATE_OK=false
    echo 'Las métricas devolvieron bloqueantes (`--strict` salió con código 1).' >>"$DIR/gate.md"
  fi

  if [ "$GATE_OK" = true ] && [ "$MODO" = "verificacion" ]; then
    # ------------------------------------------------- verificación diferencial
    #
    # La auditoría escéptica completa corre UNA sola vez. Repetirla después de
    # cada corrección es lo que impedía converger: un auditor instruido para
    # buscar motivos de rechazo siempre encuentra algo nuevo, así que "el auditor
    # no tiene nada que decir" no es un estado alcanzable. Medido en una corrida
    # real: la segunda auditoría costó casi lo mismo que la primera ($1.00 contra
    # $1.10) y lo único que el lazo necesitaba de ella era saber si las tres
    # correcciones habían entrado.
    log "Iteración $ITER/$MAX_LOOPS — verificación diferencial"

    prompt="$(render "$PROMPTS/04-verificar.md" \
      '{{SLUG}}' "$SLUG" \
      '{{LANG}}' "$FICHA_LANG" \
      '{{ITER}}' "$ITER" \
      '{{MAX_LOOPS}}' "$MAX_LOOPS" \
      '{{HALLAZGOS_FILE}}' "$HALLAZGOS_ORIGEN" \
      '{{CORRECCION_FILE}}' "$CORRECCION_ORIGEN" \
      '{{DIFF_FILE}}' "$DIFF_ORIGEN" \
      '{{ALCANCE_FILE}}' "$ALCANCE_ORIGEN")"
    claude_run "$prompt" 25 "$SCHEMA_VERIFICAR" "$DIR/verificacion-raw.json" solo-lectura \
      >"$DIR/verificacion.json"

    PEND="$(jq '[.verificaciones[] | select(.prioridad != "P2") | select(.corregido == false)] | length' "$DIR/verificacion.json")"
    FUENTES_MAL="$(jq '[.fuentes_nuevas[] | select(.respalda == false)] | length' "$DIR/verificacion.json")"
    ENTRADAS_MAL="$(jq '[.entradas_nuevas[] | select(.responde_a_hallazgo == false)] | length' "$DIR/verificacion.json")"
    REGRESIONES="$(jq '.regresiones | length' "$DIR/verificacion.json")"
    CIERRA="$(jq -r '.cierra' "$DIR/verificacion.json")"
    log "Verificación: pendientes=$PEND fuentes_sin_respaldo=$FUENTES_MAL entradas_fuera_de_alcance=$ENTRADAS_MAL regresiones=$REGRESIONES cierra=$CIERRA"

    # Las cuatro condiciones se comprueban acá y no se delegan en `cierra`: el
    # verificador podría decir que cierra habiendo dejado un P1 sin corregir.
    if [ "$CIERRA" = "true" ] && [ "$PEND" -eq 0 ] && [ "$FUENTES_MAL" -eq 0 ] \
       && [ "$ENTRADAS_MAL" -eq 0 ] && [ "$REGRESIONES" -eq 0 ] \
       && [ "$FINAL_AUDIT" = "true" ] && [ "$AUDITORIA_FINAL_HECHA" = "false" ]; then
      # La verificación diferencial es acotada por diseño: comprueba lo que la
      # auditoría listó, no busca lo que no listó. Para fichas donde eso no
      # alcanza, FINAL_AUDIT paga una auditoría escéptica más antes de aprobar.
      log "Cierre alcanzado — FINAL_AUDIT exige una auditoría completa antes de aprobar"
      VEREDICTO_FINAL="CERRADO — pendiente auditoría final"
      AUDITORIA_FINAL_HECHA=true
      MODO="auditoria"
      SALTEAR_CORRECCION=true
      cp "$DIR/hallazgos.md" "$DIR/hallazgos.md" 2>/dev/null || true
    elif [ "$CIERRA" = "true" ] && [ "$PEND" -eq 0 ] && [ "$FUENTES_MAL" -eq 0 ] \
       && [ "$ENTRADAS_MAL" -eq 0 ] && [ "$REGRESIONES" -eq 0 ]; then
      VEREDICTO_FINAL="CERRADO (verificación diferencial)"
      log "Verificación de cierre — metricas.mjs --check-urls"
      : >"$DIR/cierre.txt"
      if metricas "$DIR/cierre.txt" --check-urls; then
        RESULTADO="aprobado"
        break
      fi
      log "El cierre por red encontró bloqueantes; sigue el lazo"
      VEREDICTO_FINAL="NO_APTO (verificación de cierre)"
      {
        echo '# Verificación de cierre de fuentes'
        echo
        echo 'La verificación diferencial cerró, pero `metricas.mjs --check-urls`'
        echo 'encontró bloqueantes al comprobar por red cada fuente citada.'
        echo
        echo '```'
        cat "$DIR/cierre.txt"
        echo '```'
      } >"$DIR/hallazgos.md"
    else
      VEREDICTO_FINAL="NO_APTO ($PEND pendiente(s), $REGRESIONES regresión(es))"
      {
        echo '# Lo que quedó pendiente de la corrección anterior'
        echo
        jq -r '.resumen' "$DIR/verificacion.json"
        echo
        echo '## Hallazgos todavía sin corregir'
        echo
        jq -r '.verificaciones[] | select(.corregido == false) | "### \(.prioridad) — \(.ubicacion)\n\n\(.evidencia)\n"' "$DIR/verificacion.json"
        echo '## Fuentes agregadas que no respaldan su afirmación'
        echo
        jq -r '.fuentes_nuevas[]? | select(.respalda == false) | "- \(.url) — no respalda: \(.afirmacion)"' "$DIR/verificacion.json"
        echo
        echo '## Contenido agregado fuera del alcance de los hallazgos'
        echo
        jq -r '.entradas_nuevas[]? | select(.responde_a_hallazgo == false) | "- `\(.campo)` — \(.detalle)"' "$DIR/verificacion.json"
        echo
        echo '## Regresiones introducidas por la corrección'
        echo
        jq -r '.regresiones[]? | "- \(.)"' "$DIR/verificacion.json"
      } >"$DIR/hallazgos.md"
    fi
  elif [ "$GATE_OK" = true ]; then
    log "Iteración $ITER/$MAX_LOOPS — auditoría"
    # El historial evita que la auditoría redescubra lo mismo cada vuelta y, sobre
    # todo, sirve para detectar que una corrección anterior rompió algo que ya
    # estaba bien.
    HISTORIAL=""
    if [ "$ITER" -gt 1 ]; then
      PREV=$((ITER - 1))
      HISTORIAL="## Qué pasó en la vuelta anterior

Esta ficha ya se auditó y se corrigió al menos una vez. El informe anterior está
en \`$OUT/iter-$PREV/informe.md\` y lo que la pasada de corrección dice haber
hecho está en \`$OUT/iter-$PREV/correccion.json\`. Leé los dos y comprobá dos
cosas: que cada corrección declarada esté realmente hecha (no alcanza con que la
declaren), y que no haya roto nada que el informe anterior listaba como \"lo que
sí funciona\"."
    fi
    if [ -n "$NOTA_AUDITORIA" ]; then
      HISTORIAL="$NOTA_AUDITORIA${HISTORIAL:+

$HISTORIAL}"
      NOTA_AUDITORIA=""
    fi

    prompt="$(render "$PROMPTS/02-auditar.md" \
      '{{SLUG}}' "$SLUG" \
      '{{LANG}}' "$FICHA_LANG" \
      '{{ITER}}' "$ITER" \
      '{{MAX_LOOPS}}' "$MAX_LOOPS" \
      '{{METRICAS_FILE}}' "$DIR/metricas.txt" \
      '{{INFORME_FILE}}' "$DIR/informe.md" \
      '{{HISTORIAL}}' "$HISTORIAL")"
    claude_run "$prompt" 35 "$SCHEMA_AUDITAR" "$DIR/auditoria-raw.json" solo-lectura \
      >"$DIR/veredicto.json"

    VEREDICTO="$(jq -r '.veredicto' "$DIR/veredicto.json")"
    P0="$(jq '[.bloqueantes[] | select(.prioridad == "P0")] | length' "$DIR/veredicto.json")"
    FUENTES="$(jq '.fuentes_verificadas | length' "$DIR/veredicto.json")"
    VEREDICTO_FINAL="$VEREDICTO"
    log "Veredicto iteración $ITER: $VEREDICTO (P0: $P0, fuentes verificadas: $FUENTES)"

    # Aprueba con APTO, o con APTO_CON_AVISOS siempre que no quede ningún P0: un
    # P0 es, por definición de la skill, motivo de rechazo por sí solo.
    #
    # Y con al menos una fuente declarada. Una ficha sin `communityInsights` es
    # bloqueante en metricas.mjs, así que toda ficha que llega a aprobar tiene al
    # menos una fuente que verificar: aprobar declarando cero fuentes es una
    # contradicción interna, y sólo puede significar que el paso 3 no se hizo.
    if [ "$VEREDICTO" != "NO_APTO" ] && [ "$P0" -eq 0 ] && [ "$FUENTES" -eq 0 ]; then
      log "La auditoría aprobó sin declarar ninguna fuente verificada; no cuenta"
      VEREDICTO_FINAL="NO_APTO (sin fuentes verificadas)"
      # Lo que falta acá no es una corrección de la ficha sino la verificación que
      # la auditoría se salteó, así que el aviso va a la auditoría siguiente y la
      # pasada de corrección se saltea entera: no tiene nada accionable que hacer
      # y cuesta lo mismo que cualquier otra.
      SALTEAR_CORRECCION=true
      NOTA_AUDITORIA="## Atención: la vuelta anterior aprobó sin verificar nada

Tu pasada anterior devolvió un veredicto aprobatorio con \`fuentes_verificadas\`
vacío. Esta ficha cita fuentes —si no citara ninguna, \`metricas.mjs\` la habría
bloqueado antes de llegar a vos—, así que ese array vacío significa que el paso 3
no se hizo. El arnés no acepta esa combinación y por eso estás viendo esta vuelta.

Empezá por ahí: abrí con WebFetch cada fuente citada en \`communityInsights\` y
\`officialSources\`, comprobá que respalde la afirmación exacta que la ficha le
atribuye, y devolvé \`fuentes_verificadas\` con una entrada por cada una."
      cp "$DIR/gate.md" "$DIR/hallazgos.md"
    elif [ "$VEREDICTO" != "NO_APTO" ] && [ "$P0" -eq 0 ]; then
      log "Verificación de cierre — metricas.mjs --check-urls"
      : >"$DIR/cierre.txt"
      if metricas "$DIR/cierre.txt" --check-urls; then
        RESULTADO="aprobado"
        break
      fi
      # Las URLs se comprueban recién acá, así que pueden desmentir una
      # aprobación: una fuente que no existe, o una fecha declarada que no
      # coincide con la que publica la página. Vuelve al lazo como cualquier
      # otro hallazgo.
      log "El cierre encontró bloqueantes que la auditoría no vio; sigue el lazo"
      VEREDICTO_FINAL="NO_APTO (verificación de cierre)"
      {
        echo '# Verificación de cierre de fuentes'
        echo
        echo 'La auditoría aprobó, pero `metricas.mjs --check-urls` encontró bloqueantes'
        echo 'al comprobar por red cada fuente citada. Corregilos.'
        echo
        echo '```'
        cat "$DIR/cierre.txt"
        echo '```'
      } >"$DIR/hallazgos.md"
      HALLAZGOS_ORIGEN="$DIR/hallazgos.md"
      MODO="verificacion"
    else
      # Hallazgos para la pasada de corrección: el informe completo, más la lista
      # estructurada por si el informe quedó difuso.
      {
        cat "$DIR/informe.md" 2>/dev/null || echo "(el auditor no dejó informe en disco)"
        echo
        echo '## Hallazgos estructurados'
        echo
        jq -r '.bloqueantes[] | "### \(.prioridad) — \(.ubicacion)\n\n\(.problema)\n\n**Cómo corregir:** \(.como_corregir)\n"' "$DIR/veredicto.json"
      } >"$DIR/hallazgos.md"
      # A partir de acá el lazo verifica contra ESTOS hallazgos en vez de volver a
      # auditar. Es la única auditoría escéptica de la corrida.
      HALLAZGOS_ORIGEN="$DIR/hallazgos.md"
      MODO="verificacion"
    fi
  else
    log "Iteración $ITER/$MAX_LOOPS — falló la compuerta determinista, se saltea la auditoría"
    VEREDICTO_FINAL="NO_APTO (compuerta determinista)"
    cp "$DIR/gate.md" "$DIR/hallazgos.md"
  fi

  if [ "$ITER" -eq "$MAX_LOOPS" ]; then
    log "Se agotaron las $MAX_LOOPS iteraciones sin aprobar"
    RESULTADO="agotado"
    break
  fi

  if [ "$SALTEAR_CORRECCION" = true ]; then
    log "Iteración $ITER/$MAX_LOOPS — sin corrección: el pendiente es de la auditoría"
    SALTEAR_CORRECCION=false
    continue
  fi

  log "Iteración $ITER/$MAX_LOOPS — corrección"

  # Copia de la ficha antes de tocarla. Es lo que después permite medir con un
  # script qué agregó la corrección, sin preguntárselo al modelo que la hizo.
  BASE_JSON="src/content/tools-base/$SLUG.json"
  EDIT_JSON="src/content/tools/$FICHA_LANG/$SLUG.json"
  mkdir -p "$DIR/antes" "$DIR/despues"
  cp "$BASE_JSON" "$DIR/antes/base.json" 2>/dev/null || true
  cp "$EDIT_JSON" "$DIR/antes/editorial.json" 2>/dev/null || true

  prompt="$(render "$PROMPTS/03-corregir.md" \
    '{{SLUG}}' "$SLUG" \
    '{{LANG}}' "$FICHA_LANG" \
    '{{ITER}}' "$ITER" \
    '{{MAX_LOOPS}}' "$MAX_LOOPS" \
    '{{HALLAZGOS_FILE}}' "$DIR/hallazgos.md")"
  claude_run "$prompt" 35 "$SCHEMA_CORREGIR" "$DIR/correccion-raw.json" >"$DIR/correccion.json"

  cp "$BASE_JSON" "$DIR/despues/base.json" 2>/dev/null || true
  cp "$EDIT_JSON" "$DIR/despues/editorial.json" 2>/dev/null || true

  # El diff se saca de las copias y no de git: durante la corrida no hay commits,
  # así que `git diff` mezclaría la creación con la corrección y el verificador
  # terminaría revisando la ficha entera en vez del cambio.
  { diff -u "$DIR/antes/base.json" "$DIR/despues/base.json" || true
    diff -u "$DIR/antes/editorial.json" "$DIR/despues/editorial.json" || true
  } >"$DIR/correccion.diff"
  node scripts/harness/alcance.mjs "$DIR/antes" "$DIR/despues" >"$DIR/alcance.json" 2>&1 \
    || echo '{"urls_nuevas":[],"entradas_nuevas":[],"hay_afirmaciones_nuevas":false}' >"$DIR/alcance.json"

  CORRECCION_ORIGEN="$DIR/correccion.json"
  DIFF_ORIGEN="$DIR/correccion.diff"
  ALCANCE_ORIGEN="$DIR/alcance.json"
  log "Alcance de la corrección: $(jq -c '{urls_nuevas:(.urls_nuevas|length), entradas_nuevas:(.entradas_nuevas|length)}' "$DIR/alcance.json")"
done

log "Resultado: $RESULTADO"
[ "$RESULTADO" = "aprobado" ] || exit 2
