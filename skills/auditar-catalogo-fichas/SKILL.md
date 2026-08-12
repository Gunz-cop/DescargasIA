---
name: auditar-catalogo-fichas
description: Revisa y mantiene el catálogo de fichas de DescargasIA. Úsala para verificar fuentes y rutas oficiales, actualizar lastReviewed y lastChecked, corregir únicamente hechos confirmados, detectar enlaces no oficiales o caídos y validar el build antes de publicar.
---

# Auditoría de catálogo de fichas

Mantén fichas de IA verificadas sin introducir cambios editoriales innecesarios. Trabaja sobre `src/content/tools-base/*.json`; el contenido localizado está en `src/content/tools/<lang>/*.json`.

## Preparación

1. Lee `AGENTS.md`, `docs/ux-tool-pages.md` y `docs/tool-ficha-authoring.md`.
2. Lee `../descargasia-tool-ficha/references/schema-contract.md`, `source-policy.md` y `validation.md`.
3. Define el alcance: todo el catálogo o los slugs indicados, idiomas presentes y fecha de revisión ISO.
4. Conserva el contrato JSON y no modifiques arquitectura, categorías ni copy localizado salvo que una fuente primaria confirme que ese texto ha quedado desactualizado.

## Procedimiento

1. Haz inventario de `src/content/tools-base/*.json` y comprueba que cada uno tenga `lastReviewed` y que cada plataforma tenga `lastChecked`.
2. Para cada ficha, verifica desde fuentes primarias:
   - `officialWebsite` y `officialSources`;
   - URL, tipo y editor/propietario de cada plataforma;
   - plataformas, modelo de precios, cuenta requerida y disponibilidad solo cuando el contenido lo afirme.
3. Acepta únicamente dominios oficiales, documentación oficial, tiendas oficiales, repositorios upstream oficiales y marketplaces oficiales. Nunca sustituyas una fuente por mirrors, APKs, reempaquetados ni agregadores.
4. Si toda la información permanece vigente, cambia únicamente `lastReviewed` y los `lastChecked` correspondientes a la fecha de revisión.
5. Si un hecho cambió, aplica el ajuste mínimo en los datos base y, solo si es necesario para que no contradiga el dato, corrige las fichas localizadas afectadas. Declara explícitamente rutas web, documentación o repositorio cuando no haya instalador convencional.
6. Si una fuente no puede verificarse por bloqueo anti-bot, no la marques como caída: contrástala con documentación, tienda o repositorio primario. Si la evidencia sigue siendo insuficiente, no renueves la fecha de esa ficha y repórtala como pendiente.
7. Verifica que las alternativas sigan apuntando a slugs existentes y que las fechas de todos los datos renovados sean coherentes.

## Validación y entrega

1. Ejecuta `npm run build` después de cualquier cambio.
2. Revisa una página localizada modificada y su destino oficial generado.
3. Informa: número de fichas revisadas, fecha usada, cambios factuales, fichas que solo recibieron fecha, enlaces pendientes y resultado del build.
4. Trata un fallo de un acortador externo que no rompa Astro como riesgo operativo; no lo ocultes ni confundas con un enlace oficial inválido.

## Límites

- No inventes disponibilidad regional, privacidad, seguridad, precio ni afiliaciones.
- No actualices fechas por rutina si la fuente oficial no se revisó realmente.
- No cambies texto, títulos o FAQ por estilo durante una auditoría; este flujo prioriza cambios mínimos y trazables.
