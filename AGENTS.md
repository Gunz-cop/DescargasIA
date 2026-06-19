# DescargasIA Agent Notes

Antes de modificar UX, contenido o estructura editorial, lee estas guias:

- `docs/ux-home-cards.md`: reglas para las tarjetas de herramientas en la home.
- `docs/ux-tool-pages.md`: estructura recomendada para fichas individuales de herramientas.
- `docs/tool-ficha-authoring.md`: como usar la skill `descargasia-tool-ficha` para crear fichas nuevas.
- `skills/descargasia-tool-ficha/`: copia versionada de la skill local para revisar y ajustar el flujo de creacion de fichas.

Principios del proyecto:

- DescargasIA no aloja instaladores, APKs, ejecutables ni mirrors.
- Los enlaces deben apuntar solo a dominios oficiales, tiendas oficiales, repositorios oficiales o documentacion oficial.
- La UI debe transmitir confianza, rapidez y claridad para usuarios hispanohablantes que buscan descargar herramientas de IA sin caer en clones.
- No inventar claims de seguridad, auditorias tecnicas, afiliaciones ni endorsements de marcas.
- Mantener Astro + Tailwind, rendimiento alto y mobile-first.
- Antes de publicar cambios de UI o contenido, ejecutar `npm run build`.
