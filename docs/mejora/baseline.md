# Baseline de adquisición y comportamiento

> F0 · 2026-08-26. Este documento conserva la evidencia declarada en
> `docs/plan-mejora-productos-por-idioma.md`. No vuelve a calcularla ni la
> presenta como una consulta nueva a los proveedores.

## Estado de la evidencia

Los exports originales no están versionados en este repositorio. El plan
maestro conserva sus nombres, periodos y resultados resumidos; por tanto, los
campos que no aparecen allí se marcan como **no preservados**. F1 debe pedir o
regenerar el export antes de usar uno de esos campos para una comparación.

Esto evita convertir una cifra documentada sin su filtro original en una
medición aparentemente reproducible.

## Google Search Console

| Campo | Baseline conservada |
|---|---|
| Propiedad | `fuenteai.com` (por el nombre de los exports) |
| Fuente declarada | `fuenteai.com-Performance-on-Search-2026-08-26.zip` y `fuenteai.com-Coverage-2026-08-26.zip` |
| Periodo de rendimiento | 2026-06-19 a 2026-08-24 |
| Tipo de búsqueda | No preservado en el plan; no asumirlo al comparar |
| Filtros de página, consulta, país, dispositivo o apariencia | No preservados en el plan |
| Impresiones y clics del gráfico | 5.584 impresiones y 43 clics |
| CTR ponderado aproximado | 0,77% |
| Últimos 14 días disponibles | 3.561 impresiones y 36 clics |
| Primer día con tres cifras de impresiones | 2026-08-13: 178 |
| Cobertura indexada | 106 URLs el 2026-08-10; 160 el 2026-08-17 |
| Cobertura no indexada | 90 URLs en el último día disponible |

### Definiciones operativas

- **Impresión, clic, CTR y posición:** conservar los valores y definiciones
  del export de Search Console. El CTR del resumen es aproximado y no debe
  sustituir el CTR del corte filtrado que use F1.
- **Cobertura indexada/no indexada:** son los estados que informa el export de
  cobertura; no equivalen por sí solos a tráfico ni a una oportunidad de
  demanda.
- **Evidencia interna:** una consulta o URL de Search Console demuestra cómo
  aparece el sitio en Google, pero no es volumen de mercado confirmado.

Si F1 vuelve a exportar los datos, debe añadir el tipo de búsqueda y cada
filtro aplicado al corte. Si un filtro no existe, debe escribir
`no disponible`, no deducirlo del nombre del archivo.

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
