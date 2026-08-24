# Base de datos de hardware y modelos

Los cuatro JSON de esta carpeta son la base curada de la app **"¿qué modelos de
IA puedo correr en mi máquina?"** (`docs/app-compatibilidad-ia.md`, fase
`docs/fases/F1.md`). Validan contra `src/lib/hardware/types.ts`, que es el
contrato y no se edita desde aquí.

- `gpus.json` — 369 GPU discretas e integradas de NVIDIA, AMD e Intel.
- `apple-silicon.json` — 17 chips Apple M1→M4 con memoria unificada.
- `models.json` — 49 LLM de texto con su arquitectura y sus tamaños de GGUF.
- `quants.json` — tabla de referencia de cuantizaciones.

**Fecha de revisión: 2026-08-24.** Es la fecha en la que se generaron los cuatro
archivos y en la que se contrastaron contra las fuentes de más abajo.

Esta documentación vive aquí y no dentro de los JSON porque los cuatro son
arrays —así los consumen F2 y F6, y así los comprueban los criterios de
aceptación de F1—, y un array no tiene dónde colgar una nota.

## Cómo se regeneran

```bash
npm run hw:build     # reconstruye los cuatro JSON desde los snapshots commiteados
npm run hw:audit     # valida esquema, ids, alias, memorias y tamaños
```

Ninguno de esos dos toca la red. Los pasos con red son los que refrescan los
snapshots, y solo se corren cuando hay que meter hardware o modelos nuevos:

```bash
# GPUs: baja la GPU Database de TechPowerUp empaquetada en dbgpu (MIT)
curl -sSLO https://files.pythonhosted.org/packages/source/d/dbgpu/dbgpu-2025.12.tar.gz
tar xzf dbgpu-2025.12.tar.gz
python3 scripts/hardware/extract-techpowerup-snapshot.py

# Modelos: config.json, licencias y tamaños reales de los .gguf
node scripts/hardware/fetch-hf-models.mjs
```

Y las dos revisiones que se pasan después de refrescar, cuyo resultado se anota
en el PR:

```bash
curl -sSLO https://raw.githubusercontent.com/voidful/gpu-info-api/main/gpu.json
node scripts/hardware/cross-check-gpus.mjs gpu.json   # contra una segunda fuente
node scripts/hardware/check-nombres-reales.mjs        # nombres tal como se escriben
```

## De dónde sale cada cifra

**Ninguna se inventa.** Cuando un dato no se puede confirmar, la entrada se
quita: una GPU de menos es mejor que una VRAM equivocada, porque el producto
entero se apoya en que estos números sean ciertos.

| Dato | Fuente |
|---|---|
| VRAM y ancho de banda de las GPU discretas | GPU Database de TechPowerUp, vía el paquete `dbgpu` 2025.12 (MIT) |
| Ancho de banda de las integradas | Calculado del máximo de memoria que documenta el fabricante para esa plataforma (ver abajo) |
| Ancho de banda de Apple Silicon | Fichas técnicas y notas de prensa de Apple |
| Arquitectura de los modelos (`numLayers`, `numKvHeads`, `headDim`, `contextMax`) | `config.json` del repo oficial en Hugging Face |
| `paramsB` | Índice de safetensors que publica la API de Hugging Face |
| `fileSizeGb` de cada cuantización | Tamaño real del `.gguf` publicado (bartowski, unsloth, TheBloke, QuantFactory) |
| `bpw` | Medido: `tamaño x 8 / parámetros`. Nunca copiado de una tabla |
| `license` | `cardData` del repo en Hugging Face |
| `ollamaTag` | Verificado contra el registro real de Ollama en cada refresco |

### Contraste con una segunda fuente

Las VRAM de escritorio y workstation se contrastan contra `voidful/gpu-info-api`
(derivado de Wikipedia), que es independiente de TechPowerUp. Última revisión:

- **VRAM: 74 de 74 coinciden.**
- Ancho de banda: 72 de 74 dentro del 5 %. Las dos excepciones son la
  RTX 2000 Ada (256 frente a 224 GB/s) y la RTX 5880 Ada (864 frente a 960).
  Solo afectan a la estimación de tokens por segundo, que la interfaz presenta
  como rango y rotulada como estimación.

Las variantes de portátil no se contrastan así **a propósito**: enfrentar una
"RTX 4090 Laptop GPU" contra la fila de escritorio de Wikipedia daría 16 GB
contra 24, y confundir esas dos es exactamente el error que esta app existe para
no cometer.

## Memoria unificada e integradas

`vramGb` está ausente en toda GPU que no tiene memoria propia. En su lugar llevan
`unifiedMemory: true` y una fracción de la RAM del sistema que sí puede usar:

- **Apple Silicon: `unifiedUsableFraction: 0.75`.** macOS reserva el resto para
  el sistema. El límite se puede subir en caliente con
  `sudo sysctl iogpu.wired_limit_mb=<megabytes>` (en macOS 14 y anteriores,
  `debug.iogpu.wired_limit_mb`), que es justo lo que hace falta para cargar un
  modelo grande en un Mac con mucha RAM. F4 lo enseña como consejo. El cambio no
  sobrevive a un reinicio.
- **iGPU de AMD e Intel: `unifiedUsableFraction: 0.5`.** Windows expone como
  "memoria de GPU compartida" la mitad de la RAM instalada, y ese es el techo con
  el que se topa quien carga un modelo en una integrada.

El ancho de banda de una integrada no es una propiedad del chip gráfico sino de
la RAM que lleve montada el equipo, así que TechPowerUp lo deja vacío. Lo que se
guarda aquí es el **pico teórico de la plataforma**: la memoria más rápida que el
fabricante documenta como soportada, por el ancho del bus.

```
GB/s = MT/s x bits_de_bus / 8 / 1000
```

Es un techo, no una medida: un portátil con un solo módulo de RAM (64 bits) va a
la mitad. La tabla por plataforma, con la memoria que asume cada una, está en
`scripts/hardware/build-gpus.mjs`.

## Nombres y alias

Ningún alias puede pertenecer a dos GPU distintas; el audit lo comprueba. Los
alias van normalizados —minúsculas, sin acentos— y cubren cómo se escribe de
verdad: `"rtx 3060 ti"`, `"3060ti"`, `"RTX3060Ti"`, `"nvidia geforce rtx 3060
ti"`, y para las de portátil también `"laptop"`, `"mobile"` y `"portatil"`.

Las variantes de portátil llevan el nombre comercial de NVIDIA —"GeForce RTX
4060 **Laptop GPU**"—, que es además la cadena que aparece dentro de lo que
devuelve `WEBGL_debug_renderer_info` y que F5 le pasará al resolver:

```
ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU (0x000028E0) Direct3D11 vs_5_0 ps_5_0, D3D11)
```

Los alias guardan la parte del dispositivo, no la envoltura entera: quitar el
`ANGLE (…)` y el id PCI es trabajo del normalizador del resolver (F2).

### Formas cortas ambiguas

La **forma corta** es el nombre sin sus dos desambiguadores: la capacidad y el
sufijo de portátil. `GeForce RTX 3060 12 GB` y `GeForce RTX 4090 Laptop GPU` se
reducen las dos a lo que la gente teclea de verdad.

**Cuando una forma corta la comparten dos GPUs con distinta memoria, no se le
adjudica a ninguna.** Sin alias que decida, el matcher de F2 puntúa la cadena
contra los nombres completos, empata, y cae en la vía de "¿quisiste decir…?" con
las candidatas — que es lo que el producto quiere que pase. La auditoría lo
comprueba: son 32 formas en esa situación.

Aplica en los dos ejes, y el segundo es el que importa:

| Forma corta | Escritorio | Portátil |
|---|---|---|
| `rtx 4090` | 24 GB | 16 GB |
| `rtx 4080` | 16 GB | 12 GB |
| `rtx 4070` | 12 GB | 8 GB |
| `rtx 5090` | 32 GB | 24 GB |
| `rtx a4000` | 16 GB | 8 GB |

Dejar que la forma corta se la quede la de escritorio —que es lo que pasa si uno
no lo piensa, porque su nombre **es** la forma corta— reintroduce en silencio el
sesgo que esta app existe para corregir, y en la dirección peligrosa: prometerle
memoria de más a quien tiene menos.

Lo que decide el empate es la **memoria**, no el formato. Cuando escritorio y
portátil coinciden en VRAM (la RTX 4060 son 8 GB en los dos), el veredicto sale
igual por cualquiera de las dos y la forma corta se la queda la de escritorio, de
quien es el nombre. Lo único que difiere ahí es el ancho de banda, que solo mueve
una estimación de tok/s ya presentada como rango.

Una tarjeta cuyo nombre es exactamente la forma corta no se queda muda: recibe
alias con señal explícita —`rtx 4090 desktop`, `rtx 4090 sobremesa`,
`rx 9070 gre 12gb`, y las dos señales juntas cuando ninguna basta por separado
(`rtx 2060 6gb desktop`)—, que es la señal que F2 busca en el texto. Son 21
tarjetas.
