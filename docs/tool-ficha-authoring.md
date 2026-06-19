# Tool Ficha Authoring

Este proyecto tiene una skill dedicada para crear y mantener fichas editoriales de herramientas IA:

- Skill activa local: `C:\Users\grcx1\.codex\skills\descargasia-tool-ficha`
- Copia versionada para revision: `skills/descargasia-tool-ficha`

Usala cuando el trabajo sea:

- crear nuevas fichas en `src/content/tools`;
- buscar herramientas que faltan en el indice;
- verificar enlaces oficiales por plataforma;
- redactar contenido editorial SEO/E-E-A-T;
- generar FAQ estructurada;
- aclarar herramientas que no tienen instalador real;
- evitar mirrors, APKs, clones y paquetes modificados.

Ejemplo de prompt:

```text
Usa $descargasia-tool-ficha para buscar 10 herramientas nuevas de video IA, crear las fichas completas y validar el build.
```

Reglas principales:

- Priorizar fuentes oficiales y documentacion primaria.
- No inventar plataformas, precios, claims de seguridad ni afiliaciones.
- Mantener CTA y plataformas arriba; texto editorial largo debajo.
- Usar monogramas o colores inspirados, no logos oficiales sin permiso.
- Ejecutar `npm run build`.
- Revisar que `alternatives` apunte a slugs existentes.

Si se modifica el contrato de fichas, actualizar en conjunto:

- `docs/ux-tool-pages.md`
- `docs/tool-ficha-authoring.md`
- `skills/descargasia-tool-ficha/SKILL.md`
- `skills/descargasia-tool-ficha/references/*`
- la skill activa en `C:\Users\grcx1\.codex\skills\descargasia-tool-ficha`
