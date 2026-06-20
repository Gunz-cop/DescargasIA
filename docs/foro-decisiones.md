# Foro de Decisiones y Estrategia Multilingüe

Este documento actúa como la bitácora canónica de discusión, estrategia y toma de decisiones para el proyecto de expansión multilingüe del directorio. Aquí participan el **Propietario (USER)**, **Antigravity** (desarrollador local en el entorno local de desarrollo) y **Codex** (arquitecto de estrategia y contenido), con aportes consultivos externos de otros modelos (Claude, ChatGPT).

---

## 📌 Estado de Decisiones

* **Última Decisión Tomada:** Migración de redirecciones `/ir/` estáticas a un enrutamiento único dinámico y seguro en `/r/` con query params (Opción A).
* **Fecha de Última Actualización:** 2026-06-19

---

## 🗃️ Decisiones Tomadas

1. **Arquitectura de un Solo Dominio:** Se utilizará un solo dominio canónico (`https://fuenteai.com`) con subcarpetas de idioma (`/es/`, `/sv/`, `/it/`).
2. **Redirecciones de Dominio:** Se descarta el dominio `descargasia.com` al no estar adquirido. El dominio canónico es `fuenteai.com`. Las redirecciones de `www.fuenteai.com` a `fuenteai.com` se manejan en el DNS y reglas de redirección de Cloudflare.
3. **Selector de Idioma con Banderas (FuenteAI):** Se aprueba el uso de emojis de banderas como apoyo visual combinadas con el nombre nativo del idioma (ej. "🇪🇸 Español", "🇸🇪 Svenska", "🇮🇹 Italiano").
   * La bandera es un apoyo visual, nunca reemplazo del texto.
   * El nombre del idioma debe estar visible y en su forma nativa.
   * Se muestra "Italiano (próximamente)" en el selector para denotar soporte futuro sin enlazar ni indexar páginas vacías.
   * Se prioriza la accesibilidad (`aria-label`) y compatibilidad móvil sin añadir dependencias externas.
4. **Redirección Dinámica Segura (`/r/`):** Reemplazar las rutas estáticas `/[lang]/ir/` por un endpoint unificado `/r/index.html` estático en el cliente que lee parámetros (`t` para tool, `p` para plataforma, `l` para idioma), valida contra `tools-base` local, inyecta `noindex` y previene el *Open Redirect* (no acepta URLs externas).
5. **Decisión de raíz canónica para FuenteAI:**
   * **Decisión aprobada:** `https://fuenteai.com/` será la home española principal (servida directamente en la raíz).
   * **Motivo:**
     * FuenteAI es una marca en español.
     * La raíz debe mostrar contenido real, no una pantalla técnica de redirección.
     * La experiencia inicial debe ser limpia y confiable.
     * Se evita la autodetección agresiva por IP o `Accept-Language`.
     * Las versiones por idioma siguen existiendo en rutas separadas.
   * **Arquitectura resultante:**
     * `/` -> home española principal.
     * `/sv/` -> home sueca.
     * `/it/` -> preparada en código, pero sin publicar/indexar contenido vacío.
     * `/r/` -> redirección segura técnica (noindex, fuera del sitemap).
   * **Decisión técnica sobre `/es/`:**
     * Se prefiere una redirección 301 limpia de `/es/` hacia `/`.
     * Como alternativa aceptable (si la estructura actual de i18n lo complica), `/es/` renderizará el mismo contenido español, pero con canonical apuntando a `/`.
     * Bajo ningún concepto se dejarán `/` y `/es/` como dos canónicas indexables independientes.
   * **Detalles del selector de idioma:**
     * Mostrará bandera + nombre nativo (ej. "🇪🇸 Español", "🇸🇪 Svenska", "🇮🇹 Italiano").
     * Siempre bandera + texto (nunca bandera sola).
     * Italiano aparecerá como "Próximamente" sin enlace activo a `/it/` mientras no haya contenido real.
     * Mantener accesibilidad y compatibilidad móvil sin dependencias extras.

---

## 📋 Decisiones Pendientes

* **[Tema de discusión serio traído por ChatGPT]**: Pendiente de ser introducido por el Propietario para debate inter-agentes.

---

## 🧭 Pautas de Calidad Vigentes

* `npm run build` debe compilar de forma limpia.
* Cada página debe tener `html lang`, canonical y metadata correctos.
* `hreflang` solo debe apuntar a páginas existentes con contenido editorial real.
* El sitemap debe excluir rutas técnicas (`/r/`, `/ir/`) y lenguajes sin contenido real (`/it/`).

---

## 💬 Hilo de Discusión Activa

### 1. Entrada de ChatGPT (Tema por Definir)
*(Esperando el mensaje introductorio de ChatGPT por parte del Propietario)*

### 2. Opinión de Antigravity (Desarrollador)
*(Pendiente de redacción una vez se exponga el tema)*

### 3. Opinión de Codex (Contenido y Estrategia)
*(Pendiente de redacción una vez se exponga el tema)*
