# Evidencia de canales oficiales para F4

**Fecha de comprobación:** 2026-08-27  
**Responsable:** Codex  
**Rama de origen del catálogo:** main  
**Fuente del catálogo:** `src/content/tools-base/*.json`  
**Alcance:** character-ai, perplexity, ollama, cursor, stable-diffusion, mistral-vibe (F4-ES), lm-studio, grok y notebooklm (F4-IT).

## Método y límite

Cada URL se abrió directamente con navegación web, no mediante un resumen de buscador. Se registró la URL declarada, la redirección visible cuando existió, el título o contenido observable, el editor o proyecto que aparecía y el tipo de canal resultante.

Esta tabla demuestra el canal observado en la fecha indicada. No demuestra seguridad, disponibilidad en todos los países ni vigencia posterior. Las filas con discrepancia no autorizan a escribir copy ni a editar el catálogo desde F4.

## Resumen

| Resultado | Filas |
|---|---|---:|
| Verificado | 30 |
| Discrepancia de catálogo | 0 |
| Total de filas | 30 |

Nota histórica: durante F4-IT se resolvió la discrepancia de Ollama/mac (blocker #60): el catálogo actualizó su URL de `Ollama-darwin.zip` a `Ollama.dmg`. El estado canónico vigente en esta fecha aparece en la fila Ollama/mac de este documento.

«Verificado» significa que la URL abrió o fue enlazada directamente desde la fuente oficial y que el canal observado coincide con el tipo del catálogo. En stable-diffusion, significa que el repositorio fuente del proyecto o implementación indicado existe y coincide con el tipo github-repo; no afirma que esos repositorios pertenezcan a Stability AI.

## Registro por fila

### character-ai

| Plataforma | URL declarada | Tipo declarado | Observación directa | Editor o proyecto observado | Resultado |
|---|---|---|---|---|---|
| web | https://character.ai | web-app | La página abre con el título «AI Chat, Reimagined–Your Words. Your World.» en character.ai. | Character.AI | Verificado: web-app |
| android | https://play.google.com/store/apps/details?id=ai.character.app | app-store | Google Play muestra «Character AI: Chat, Talk, Text» y el editor «Character.AI». | Character.AI | Verificado: app-store |
| ios | https://apps.apple.com/us/app/character-ai-chat-talk-text/id1671705818 | app-store | App Store muestra «Character AI: Chat, Talk, Text» y el desarrollador «Character.AI». | Character.AI | Verificado: app-store |

Fuentes observadas: https://character.ai, https://play.google.com/store/apps/details?id=ai.character.app, https://apps.apple.com/us/app/character-ai-chat-talk-text/id1671705818.

### perplexity

| Plataforma | URL declarada | Tipo declarado | Observación directa | Editor o proyecto observado | Resultado |
|---|---|---|---|---|---|
| web | https://www.perplexity.ai | web-app | La página abre con el título «Perplexity» en el dominio del producto. | Perplexity | Verificado: web-app |
| windows | https://apps.microsoft.com/detail/xp8jnqfbqh6pvf | app-store | Microsoft Store muestra «Perplexity AI - Download and install on Windows». | Perplexity AI | Verificado: app-store |
| android | https://play.google.com/store/apps/details?id=ai.perplexity.app.android | app-store | Google Play muestra «Perplexity - Ask Anything»; la ficha identifica a PerplexityAI y el soporte/editor como Perplexity Ai, Inc. | Perplexity AI, Inc. | Verificado: app-store |
| ios | https://apps.apple.com/us/app/perplexity-ai-search-chat/id1668000334 | app-store | App Store muestra «Perplexity - AI Search & Chat» y desarrollador «Perplexity AI, Inc.». | Perplexity AI, Inc. | Verificado: app-store |

Fuentes observadas: https://www.perplexity.ai, https://apps.microsoft.com/detail/xp8jnqfbqh6pvf, https://play.google.com/store/apps/details?id=ai.perplexity.app.android, https://apps.apple.com/us/app/perplexity-ai-search-chat/id1668000334.

### ollama

| Plataforma | URL declarada | Tipo declarado | Observación directa | Editor o proyecto observado | Resultado |
|---|---|---|---|---|---|
| web | https://ollama.com | official-site | La página abre como «Ollama» y enlaza a Download dentro del dominio oficial. | Ollama Inc. | Verificado: official-site |
| windows | https://ollama.com/download/OllamaSetup.exe | official-installer | La página oficial Download Ollama muestra «Download for Windows» y enlaza exactamente a OllamaSetup.exe. La apertura del binario redirige a un asset de release con ese nombre; el binario no se descarga en la evidencia. | Ollama | Verificado: official-installer |
| mac | https://ollama.com/download/Ollama.dmg | official-installer | La página oficial actual Download Ollama / macOS enlaza a https://ollama.com/download/Ollama.dmg; la petición a esa URL devuelve el binario del instalador. | Ollama | Verificado: official-installer |
| linux | https://ollama.com/download/linux | documentation | La página abre como «Download Ollama», muestra el comando de instalación Linux y enlaza a instrucciones manuales y documentación. | Ollama | Verificado: documentation |

Fuentes observadas: https://ollama.com, https://ollama.com/download, https://ollama.com/download/mac, https://ollama.com/download/linux.

**Nota histórica:** la URL anterior declarada en `tools-base` para macOS era `Ollama-darwin.zip` y no coincidía con la descarga oficial vigente (`Ollama.dmg`). Este cambio quedó registrado en el blocker #60 y se resolvió dentro de la entrega de F4-IT.

### cursor

| Plataforma | URL declarada | Tipo declarado | Observación directa | Editor o proyecto observado | Resultado |
|---|---|---|---|---|---|
| web | https://cursor.com | official-site | La página abre con «Cursor is your coding agent for building ambitious software» y ofrece el enlace oficial de descarga. | Cursor / Anysphere, Inc. | Verificado: official-site |
| windows | https://cursor.com/downloads | official-installer | La URL redirige a https://cursor.com/download; la página lista instaladores Windows x64 y ARM64, System/User. | Cursor | Verificado: official-installer |
| mac | https://cursor.com/downloads | official-installer | La URL redirige a https://cursor.com/download; la página lista instaladores macOS ARM64, x64 y Universal. | Cursor | Verificado: official-installer |
| linux | https://cursor.com/downloads | official-installer | La URL redirige a https://cursor.com/download; la página lista paquetes Linux .deb, RPM y AppImage. | Cursor | Verificado: official-installer |

Fuentes observadas: https://cursor.com, https://cursor.com/downloads. Comprobación adicional del dominio histórico exigido por F3: https://cursor.sh redirige a https://cursor.com/.

### stable-diffusion

| Plataforma | URL declarada | Tipo declarado | Observación directa | Editor o proyecto observado | Resultado |
|---|---|---|---|---|---|
| web | https://github.com/AUTOMATIC1111/stable-diffusion-webui | github-repo | El repositorio se titula «Stable Diffusion web UI» y contiene instrucciones de instalación y ejecución. | AUTOMATIC1111 / Stable Diffusion WebUI | Verificado con alcance: repositorio del proyecto |
| windows | https://github.com/LykosAI/StabilityMatrix | github-repo | El repositorio se titula «Stability Matrix» y se describe como gestor multiplataforma para paquetes de Stable Diffusion; menciona Automatic1111 y ComfyUI. | LykosAI / Stability Matrix | Verificado con alcance: repositorio del proyecto |
| mac | https://github.com/comfy-org/ComfyUI | github-repo | El README declara disponibilidad en Windows, Linux y macOS y enlaza la aplicación de escritorio, instalación portable e instalación manual. | Comfy-Org / ComfyUI | Verificado con alcance: repositorio del proyecto |
| linux | https://github.com/comfy-org/ComfyUI | github-repo | El mismo README declara instalación manual para todos los sistemas y GPU, incluido Linux. | Comfy-Org / ComfyUI | Verificado con alcance: repositorio del proyecto |

Fuentes observadas: https://github.com/AUTOMATIC1111/stable-diffusion-webui, https://github.com/LykosAI/StabilityMatrix, https://github.com/comfy-org/ComfyUI.

Alcance editorial: estos repositorios son fuentes de los proyectos o implementaciones enlazados por el catálogo. Esta tabla no afirma que sean repositorios oficiales de Stability AI ni que Stable Diffusion sea propiedad de esas organizaciones.

### mistral-vibe

| Plataforma | URL declarada | Tipo declarado | Observación directa | Editor o proyecto observado | Resultado |
|---|---|---|---|---|---|
| web | https://chat.mistral.ai | web-app | La URL redirige a https://chat.mistral.ai/chat y muestra el acceso de Vibe bajo el dominio Mistral. | Mistral AI / Vibe | Verificado: web-app |
| android | https://play.google.com/store/apps/details?id=ai.mistral.chat | app-store | Google Play muestra «Vibe by Mistral (ex-Le Chat)» y el editor «Mistral AI». | Mistral AI | Verificado: app-store |
| ios | https://apps.apple.com/us/app/vibe-by-mistral-ex-le-chat/id6740410176 | app-store | App Store muestra «Vibe by Mistral (ex-Le Chat)» y desarrollador «Mistral AI». | Mistral AI | Verificado: app-store |

Fuentes observadas: https://chat.mistral.ai, https://play.google.com/store/apps/details?id=ai.mistral.chat, https://apps.apple.com/us/app/vibe-by-mistral-ex-le-chat/id6740410176.

### lm-studio

| Plataforma | URL declarada | Tipo declarado | Observación directa | Editor o proyecto observado | Resultado |
|---|---|---|---|---|---|
| web | https://lmstudio.ai | official-site | La página abre como «LM Studio Bionic - Agent for Work and Code», ofrece descarga del producto y enlaces a documentación. | Element Labs, Inc. / LM Studio | Verificado: official-site |
| windows | https://lmstudio.ai | official-site | La página principal enlaza a descarga y documentación; se considera punto de entrada verificado. | Element Labs, Inc. / LM Studio | Verificado: official-site |
| mac | https://lmstudio.ai | official-site | La página principal enlaza a descarga y documentación; se considera punto de entrada verificado. | Element Labs, Inc. / LM Studio | Verificado: official-site |
| linux | https://lmstudio.ai | official-site | La página principal enlaza a descarga y documentación; se considera punto de entrada verificado. | Element Labs, Inc. / LM Studio | Verificado: official-site |

Fuentes observadas: https://lmstudio.ai.

### grok

| Plataforma | URL declarada | Tipo declarado | Observación directa | Editor o proyecto observado | Resultado |
|---|---|---|---|---|---|
| web | https://grok.com | web-app | La página abre como «Grok» y muestra el acceso al servicio dentro del dominio oficial de xAI. | xAI / Grok | Verificado: web-app |
| android | https://play.google.com/store/apps/details?id=ai.x.grok | app-store | Google Play muestra «Grok AI» y el editor «xAI». | xAI | Verificado: app-store |
| ios | https://apps.apple.com/us/app/grok/id6670324846 | app-store | App Store muestra «Grok AI» y el desarrollador «X Corp.». | X Corp. / xAI | Verificado: app-store |

Fuentes observadas: https://grok.com, https://play.google.com/store/apps/details?id=ai.x.grok, https://apps.apple.com/us/app/grok/id6670324846.

Nota: `x.com/i/grok` es la integración de Grok dentro de X y también representa un punto de acceso oficial; se incluye en `officialSources` de `tools-base/grok.json` como ruta alternativa verificable.

### notebooklm

| Plataforma | URL declarada | Tipo declarado | Observación directa | Editor o proyecto observado | Resultado |
|---|---|---|---|---|---|
| web | https://notebooklm.google.com | web-app | El punto de entrada `notebooklm.google.com` resuelve a una página de inicio de sesión de Google Accounts, perteneciente al servicio NotebookLM. | Google LLC | Verificado: web-app |

Fuentes observadas: https://notebooklm.google.com.

Nota: el dominio `notebooklm.google.com` redirige funcionalmente hacia `notebook.google.com`/flujos de inicio de sesión. Ambos dominios pertenecen a Google.

## Decisiones derivadas

1. Las filas verificadas pueden usarse como evidencia de canal para la redacción de F4-ES, F4-SV y F4-IT, siempre que la ficha no afirme más de lo observado y conserve la fecha.
2. La fila Ollama/mac se encuentra en estado canónico verificado con `Ollama.dmg`; el cambio histórico desde `Ollama-darwin.zip` queda consignado en la nota histórica del blocker #60.
3. La evidencia de stable-diffusion se limita a repositorios de implementaciones o proyectos; no debe transformarse en una afirmación de afiliación con Stability AI.
4. F4 no modifica `src/content/tools-base/` como parte de la redacción. Los cambios de catálogo requieren una decisión o issue propio.
5. La verificación es fechada y debe repetirse si la implementación se retrasa o si se observa un cambio de destino.

## Consumo por F4

F4-ES (#44), F4-SV (#43) y F4-IT (#46) pueden usar las filas marcadas «Verificado» como entrada de canal, sin repetir la prueba de red en la sesión ejecutora. No pueden ejecutar una ficha cuya fila de canal esté «NO COINCIDE» o «NO VERIFICABLE». Cada PR de F4 debe citar esta tabla y conservar la URL y fecha observadas en su evidencia.
