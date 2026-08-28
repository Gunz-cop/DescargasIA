# Baseline de adquisición y comportamiento

> F0 · 2026-08-26, con la sección de Search Console actualizada el 2026-08-28
> a partir de los exports entregados en el issue #50. El resto del documento
> conserva la evidencia declarada en
> `docs/plan-mejora-productos-por-idioma.md`: no vuelve a calcularla ni la
> presenta como una consulta nueva a los proveedores.

## Estado de la evidencia

**Actualizado el 2026-08-28 (issue #50).** El propietario entregó los exports
de Search Console y una versión derivada está versionada en
`docs/mejora/evidencia/gsc-2026-08-28/`. Los campos de Search Console que este
documento marcaba como «no preservados» ya no lo están: se leen del export y se
citan abajo con su filtro real.

Sigue vigente para **Cloudflare**: su export original no está versionado, el
plan maestro solo conserva agregados y sus campos ausentes siguen marcados como
**no preservados**. F1 debe pedir o regenerar ese export antes de usar uno de
esos campos para una comparación.

Esto evita convertir una cifra documentada sin su filtro original en una
medición aparentemente reproducible.

## Google Search Console

> Corte del **2026-08-28**, ingerido en #50. Evidencia derivada versionada en
> `docs/mejora/evidencia/gsc-2026-08-28/`, con procedencia, SHA-256 y límites.
> Todos los valores de esta tabla salen de sumar esos CSV.

| Campo | Baseline conservada |
|---|---|
| Propiedad | `fuenteai.com` (por las URLs del export; no expone identificador de cuenta) |
| Fuente declarada | `fuenteai.com-Performance-on-Search-2026-08-28.zip`, `fuenteai.com-Coverage-2026-08-28.zip`, `fuenteai.com-Coverage-Valid-2026-08-28.zip` y `fuenteai.com-Latest.links-2026-08-28.csv` |
| Periodo de rendimiento | 2026-06-19 a 2026-08-26 (69 días) |
| Tipo de búsqueda | **`Web`** (leído de `Filtros.csv`) |
| Etiqueta de fecha del export | `Últimos 3 meses` |
| Filtro de página, consulta, país, dispositivo o apariencia | **Ninguno aplicado.** El corte es de propiedad completa; no es un corte de `/es/*` |
| Impresiones y clics del gráfico | **6.531 impresiones y 47 clics** |
| CTR ponderado aproximado | 0,72% |
| Últimos 14 días (2026-08-13 a 2026-08-26) | 4.346 impresiones y 36 clics |
| 14 días previos (2026-07-30 a 2026-08-12) | 915 impresiones y 9 clics |
| Impresiones por prefijo de ruta (tabla de páginas) | `/es/*` 6.097 · `/sv/*` 290 · `/it/*` 58 · raíz 168 |
| Clics por prefijo de ruta (tabla de páginas) | `/es/*` 41 · `/sv/*` 2 · `/it/*` 0 · raíz 4 |
| Tabla de consultas | 920 filas, 3.618 impresiones y 13 clics — **cobertura parcial**: falta el 44,6% de las impresiones de la propiedad |
| Tabla de páginas | 135 URLs, de las cuales 86 son `/es/*` |
| Tabla de países | 87 países; España encabeza con 1.879 impresiones y 15 clics, **sin cruzar con ruta ni idioma** |
| Dispositivos | Ordenador 4.809 impresiones / 26 clics · Móviles 1.678 / 20 · Tablet 44 / 1 |
| Apariencia en búsquedas | Export **vacío**: sin filas |
| Cobertura indexada | 160 URLs el 2026-08-20 (`es` 81 · `sv` 43 · `it` 34 · raíz 2) |
| Cobertura no indexada | 90 URLs el 2026-08-20; motivo dominante `noindex` (52) |
| Enlaces externos | `Latest links` **vacío**: cero filas registradas |

El corte anterior de esta baseline (2026-06-19 a 2026-08-24: 5.584 impresiones
y 43 clics, con tipo de búsqueda y filtros no preservados) queda sustituido por
el de arriba. Los dos son compatibles en magnitud, pero **no se comparan como
serie**: el anterior no conserva su tipo de búsqueda ni sus filtros, así que no
se sabe si medía lo mismo.

### Definiciones operativas

- **Impresión, clic, CTR y posición:** conservar los valores y definiciones
  del export de Search Console. El CTR del resumen es aproximado y no debe
  sustituir el CTR del corte filtrado que use F1.
- **Cobertura indexada/no indexada:** son los estados que informa el export de
  cobertura; no equivalen por sí solos a tráfico ni a una oportunidad de
  demanda.
- **Evidencia interna:** una consulta o URL de Search Console demuestra cómo
  aparece el sitio en Google, pero no es volumen de mercado confirmado.

### Qué sigue sin poder afirmarse con este export

El export trae agregados por dimensión, no un cubo cruzado. Por tanto:

1. **Ninguna consulta puede atribuirse a una ruta `/es/*`.** No existe el cruce
   consulta × página. Que el 92,6% de las impresiones de la tabla de páginas
   sean `/es/*` no convierte una consulta de la tabla en volumen de una ficha
   concreta.
2. **Ninguna página tiene tendencia propia.** La serie diaria es de propiedad;
   no está desglosada por URL.
3. **Ningún país puede atribuirse a un producto lingüístico.** La tabla de
   países mezcla `es`, `sv` e `it`.
4. **La tabla de consultas no es el universo de consultas.** Está truncada y
   anonimizada por Search Console.

Un corte futuro que necesite cualquiera de esas cuatro cosas debe exportarse
**con el filtro aplicado en Search Console** (por ejemplo, filtro de página
`/es/`) y versionarse como una evidencia nueva, con su fecha y sus filtros. No
se deduce del nombre del archivo ni de este documento.

## Cloudflare Web Analytics

| Campo | Baseline conservada |
|---|---|
| Fuente declarada | `Analytics _ Análisis web _ G1721m@icloud.com's Account _ Cloudflare.pdf` |
| Periodo | 2026-07-27 a 2026-08-26 19:10 |
| Zona horaria | UTC-06:00 |
| Filtro de bots | Bots excluidos |
| Filtros de hostname, ruta, referente, agente o parámetros | No preservados en el plan |
| Visitas | 370 |
| Visitas identificadas desde Google | 50 |
| Visitas sin referente | 320 |
| Visitas registradas en `/r` | 150 |
| Desktop / móvil | 190 / 180 |
| Sistemas visibles | Windows, iOS, Linux y Android; macOS en menor volumen |
| Incidencia observada | Pico aproximado de 100 visitas el 2026-08-25 |

### Definiciones operativas

- **Visita:** la métrica de visita del informe de Cloudflare, con bots
  excluidos según el filtro documentado.
- **Sin referente:** no se interpreta automáticamente como tráfico directo.
- **Visita en `/r`:** señal de entrada al interstitial; no es una conversión
  confirmada ni prueba de que el destino oficial se haya abierto.
- **Pico del 2026-08-25:** hipótesis de diagnóstico para F1. La baseline no
  contiene el desglose por ruta, referente, agente ni parámetros necesario
  para atribuirlo.

Cloudflare sirve para comportamiento y conversión. Su mezcla de países, si
aparece en una consulta posterior, no decide demanda SEO ni traducciones.

## Comparabilidad y límites

Los dos sistemas tienen periodos y unidades diferentes. No se suman visitas,
impresiones o clics entre ellos. Una comparación posterior debe conservar por
separado:

1. producto lingüístico (`es`, `sv`, `it` o común), si el filtro existe;
2. herramienta, ruta y plataforma, si están disponibles;
3. periodo, zona horaria y filtros exactos;
4. evidencia observada frente a interpretación.

La medición de eventos, sus nombres y sus parámetros pertenece a F1. Este
baseline no autoriza instalar un proveedor de analítica ni cambiar la ruta
`/r`.
