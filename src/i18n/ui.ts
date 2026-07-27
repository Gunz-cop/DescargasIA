export const languages = {
  es: 'Español',
  sv: 'Svenska',
  it: 'Italiano'
};

export const defaultLang = 'es';

export const ui = {
  es: {
    // Hero & Search
    'hero.title': 'Canales oficiales para herramientas de IA',
    'hero.subtitle': 'Accede directamente a descargas y aplicaciones oficiales seguras. Sin mirrors, sin instaladores modificados ni descargas sospechosas.',
    'search.placeholder': 'Buscar herramientas de IA...',
    'search.no-results': 'No se encontraron herramientas con esos criterios.',

    // Stats & Meta
    'stats.verified': 'Dominios Oficiales',
    'stats.links': 'Enlaces Seguros',
    'stats.directory': 'Directorio Completo',

    // Tool card labels
    'card.review-date': 'Revisado',
    'card.cta': 'Ver fuentes oficiales',

    // Sidebar / Tool info labels
    'info.trust.official': 'Canal oficial',
    'info.trust.verified': 'Enlace verificado',
    'info.trust.pending-review': 'Bajo revisión',

    'info.pricing.free': 'Gratis',
    'info.pricing.freemium': 'Freemium',
    'info.pricing.paid': 'De pago',
    'info.pricing.enterprise': 'Enterprise',
    'info.pricing.unknown': 'Precio no confirmado',

    'info.account.required': 'Requiere cuenta',
    'info.account.optional': 'Sin cuenta obligatoria',
    'info.account.unknown': 'Cuenta no confirmada',

    'info.spanish.yes': 'Español disponible',
    'info.spanish.partial': 'Español parcial',
    'info.spanish.no': 'Solo inglés',
    'info.spanish.unknown': 'Idioma no verificado',

    'info.swedish.yes': 'Sueco disponible',
    'info.swedish.partial': 'Sueco parcial',
    'info.swedish.no': 'Solo inglés',
    'info.swedish.unknown': 'Idioma no verificado',

    'info.italian.yes': 'Italiano disponible',
    'info.italian.partial': 'Italiano parcial',
    'info.italian.no': 'Solo inglés',
    'info.italian.unknown': 'Idioma no verificado',

    'info.reviewed-on': 'Última revisión técnica',
    'info.official-sources': 'Fuentes oficiales contrastadas',

    // Platforms dynamic labels
    'platform.web': 'Versión Web',
    'platform.windows': 'Desktop para Windows',
    'platform.mac': 'Desktop para macOS',
    'platform.linux': 'Desktop para Linux',
    'platform.android': 'App para Android',
    'platform.ios': 'App para iOS/iPad',

    'platform.type.official-site': 'Sitio oficial de la marca',
    'platform.type.app-store': 'Tienda de aplicaciones oficial',
    'platform.type.web-app': 'Aplicación Web oficial',
    'platform.type.documentation': 'Documentación oficial de API/Dev',
    'platform.type.official-installer': 'Instalador oficial directo',
    'platform.type.github-repo': 'Repositorio de código oficial',
    'platform.type.package-manager': 'Instalación por gestor de paquetes',

    'platform.btn.official-site': 'Usar versión web oficial',
    'platform.btn.app-store': 'Ver app en tienda oficial',
    'platform.btn.web-app': 'Iniciar aplicación web',
    'platform.btn.documentation': 'Ver documentación técnica',
    'platform.btn.official-installer': 'Descargar instalador oficial',
    'platform.btn.github-repo': 'Ver código en GitHub oficial',
    'platform.btn.package-manager': 'Ver comando de instalación',

    // Sections headings
    'section.best-for': 'Para qué sirve mejor',
    'section.limitations': 'Límites y precauciones',
    'section.safety': 'Seguridad y Descarga',
    'section.alternatives': 'Alternativas recomendadas',
    'section.faq': 'Preguntas frecuentes sobre la descarga',
    'section.editorial-summary': 'Criterio editorial de verificación',

    // Category specific
    'category.title': 'Herramientas de IA para',
    'category.back': 'Volver al directorio principal',

    // Footer & Legal
    'footer.disclaimer': 'FuenteAI es un índice editorial independiente. No alojamos instaladores ni APKs. Enlazamos exclusivamente a los canales oficiales y tiendas de distribución legítimas de los creadores de software para garantizar la máxima seguridad técnica del usuario.',
    'footer.about': 'Acerca de',
    'footer.cookies': 'Cookies',
    'footer.privacy': 'Privacidad',
    'footer.legal': 'Aviso Legal',

    // --- Navegación y chrome ---
    'a11y.skip': 'Saltar al contenido principal',
    'nav.directory': 'Directorio',
    'nav.categories': 'Categorías',
    'nav.about': 'Metodología',
    'nav.menu': 'Menú',
    'nav.open-menu': 'Abrir menú de navegación',
    'nav.close-menu': 'Cerrar menú de navegación',
    'nav.home': 'Inicio',
    'nav.sections': 'Secciones',
    'nav.legal': 'Legal',
    'theme.toggle': 'Cambiar entre tema claro y oscuro',
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'lang.change': 'Cambiar idioma',
    'lang.soon': 'próximamente',

    // --- Home ---
    'home.eyebrow': 'Índice de fuentes oficiales',
    'home.h1': 'El canal oficial de cada herramienta de IA, verificado y a la vista.',
    'home.lede': 'Un índice editorial independiente: para cada herramienta publicamos el dominio oficial, el tipo de canal por plataforma y la fecha de la última revisión. No alojamos archivos.',
    'home.cta.browse': 'Explorar el directorio',
    'home.cta.method': 'Cómo lo verificamos',
    'home.stat.tools': 'Fichas publicadas',
    'home.stat.domains': 'Dominios oficiales',
    'home.stat.links': 'Enlaces revisados',
    'home.stat.hosted': 'Archivos alojados',
    'home.categories.eyebrow': 'Índice',
    'home.categories.title': 'Explora por categoría',
    'home.method.eyebrow': 'Metodología',
    'home.method.title': 'Qué significa "verificado" aquí',
    'home.method.1.title': 'Sólo dominios de origen',
    'home.method.1.body': 'Cada enlace apunta al dominio del propio fabricante, a su tienda oficial o a su repositorio. Nunca a mirrors, acortadores de terceros ni agregadores.',
    'home.method.2.title': 'Canal declarado por plataforma',
    'home.method.2.body': 'Indicamos si el destino es una web app, una tienda oficial, un instalador directo, documentación o un gestor de paquetes. Sabes a dónde vas antes de pulsar.',
    'home.method.3.title': 'Fecha de revisión visible',
    'home.method.3.body': 'Cada ficha muestra cuándo se comprobó por última vez. Si algo cambia, se corrige la ficha; no dejamos enlaces sin fecha.',
    'home.method.note': 'No alojamos instaladores, APKs ni ejecutables. No estamos afiliados a las marcas listadas.',

    // --- Directorio y filtros ---
    'directory.eyebrow': 'Directorio',
    'directory.title': 'Elige una herramienta',
    'directory.count.one': 'herramienta',
    'directory.count.other': 'herramientas',
    'directory.showing': 'Mostrando',
    'directory.of': 'de',
    'search.label': 'Buscar herramienta por nombre',
    'search.hint': 'Escribe para filtrar el directorio al instante.',
    'search.clear': 'Limpiar búsqueda',
    'filters.toggle': 'Filtros',
    'filters.category': 'Categoría',
    'filters.platform': 'Plataforma',
    'filters.all': 'Todas',
    'filters.any': 'Cualquiera',
    'filters.reset': 'Quitar filtros',
    'filters.active': 'Filtros activos',
    'badge.new-for-you': 'Nueva para ti',
    'badge.known': 'Ya la conocías',
    'trust.no-clones': 'Cero clones',
    'trust.no-clones.body': 'Cada enlace lo revisa una persona contra el dominio y el repositorio del creador.',
    'trust.weekly': 'Revisado cada semana',
    'trust.weekly.body': 'Si un proyecto cambia de dominio o se abandona, lo verás marcado aquí primero.',
    'trust.no-sponsors': 'Sin patrocinios',
    'trust.no-sponsors.body': 'El orden no se compra. Nadie paga por aparecer arriba.',
    'official.title': 'Fuente oficial verificada',
    'official.download': 'Descargar',
    'official.repo': 'Código',
    'official.mirrors': 'Cualquier otro sitio que ofrezca este programa es un espejo no autorizado.',
    'official.reviewed': 'Revisado el',
    'alt.title': 'Si te sirve {name}, también existen',
    'alt.count': 'alternativas reales',
    'alt.all-official': 'Todas con fuente oficial',
    'count.most-know': 'La mayoría de la gente conoce 2 — te faltan',
    'count.for': 'herramientas oficiales para',
    'home.question': '¿Qué quieres hacer?',
    'home.answer': 'Dinos el resultado que buscas. Te mostramos todas las herramientas que sirven y el enlace oficial de cada una, sin clones.',
    'home.verified-sources': 'fuentes verificadas',
    'home.more-needs': 'necesidades',
    'view.label': 'Vista del directorio',
    'view.list': 'Registro',
    'view.grid': 'Fichas',

    // --- Tarjeta ---
    'card.official-channel': 'Ir al canal oficial',
    'card.sheet': 'Ver ficha',
    'card.platforms': 'Plataformas',
    'card.verified-domain': 'Dominio oficial verificado',

    // --- Ficha de herramienta ---
    'tool.platforms.eyebrow': 'Canales oficiales',
    'tool.platforms.title': 'Elige tu plataforma',
    'tool.platforms.note': 'No alojamos instaladores ni mirrors.',
    'tool.quickfacts': 'Ficha rápida',
    'tool.official-sources': 'Fuentes oficiales',
    'tool.price': 'Precio',
    'tool.account': 'Cuenta',
    'tool.language': 'Idioma',
    'tool.trust': 'Confianza',
    'tool.platforms.count': 'Plataformas',
    'tool.cta.primary': 'Ir a la descarga oficial',
    'tool.cta.secondary': 'Ver plataformas',
    'tool.verified-origin': 'Origen verificado',
    'tool.yes': 'Sí',
    'tool.no': 'No',
    'tool.unconfirmed': 'Por confirmar',

    // --- Estados ---
    'empty.title': 'Sin resultados',
    'empty.body': 'Prueba con otro nombre o restablece categoría y plataforma.',
    'category.empty.title': 'Próximamente más herramientas',
    'category.empty.body': 'Estamos verificando y redactando fichas de descarga seguras para esta categoría.'
  },
  sv: {
    // Hero & Search
    'hero.title': 'Officiella länkar till AI-verktyg',
    'hero.subtitle': 'Få direkt tillgång till säkra och officiella nedladdningar och applikationer. Inga spegelsajter, inga modifierade installerare eller misstänkta filer.',
    'search.placeholder': 'Sök efter AI-verktyg...',
    'search.no-results': 'Hittade inga verktyg med de kriterierna.',

    // Stats & Meta
    'stats.verified': 'Verifierade Domäner',
    'stats.links': 'Säkra Länkar',
    'stats.directory': 'Hela Katalogen',

    // Tool card labels
    'card.review-date': 'Granskad',
    'card.cta': 'Visa officiella källor',

    // Sidebar / Tool info labels
    'info.trust.official': 'Officiell kanal',
    'info.trust.verified': 'Verifierad länk',
    'info.trust.pending-review': 'Under granskning',

    'info.pricing.free': 'Gratis',
    'info.pricing.freemium': 'Freemium',
    'info.pricing.paid': 'Betald',
    'info.pricing.enterprise': 'Enterprise',
    'info.pricing.unknown': 'Pris ej bekräftat',

    'info.account.required': 'Konto krävs',
    'info.account.optional': 'Inget konto krävs',
    'info.account.unknown': 'Konto ej bekräftat',

    'info.spanish.yes': 'Spanska tillgänglig',
    'info.spanish.partial': 'Delvis på spanska',
    'info.spanish.no': 'Endast engelska',
    'info.spanish.unknown': 'Språk ej verifierat',

    'info.swedish.yes': 'Svenska tillgänglig',
    'info.swedish.partial': 'Delvis på svenska',
    'info.swedish.no': 'Endast engelska',
    'info.swedish.unknown': 'Språk ej verifierat',

    'info.italian.yes': 'Italienska tillgänglig',
    'info.italian.partial': 'Delvis på italienska',
    'info.italian.no': 'Endast engelska',
    'info.italian.unknown': 'Språk ej verifierat',

    'info.reviewed-on': 'Senaste tekniska granskning',
    'info.official-sources': 'Bekräftade officiella källor',

    // Platforms dynamic labels
    'platform.web': 'Webbversion',
    'platform.windows': 'Desktop för Windows',
    'platform.mac': 'Desktop för macOS',
    'platform.linux': 'Desktop för Linux',
    'platform.android': 'App för Android',
    'platform.ios': 'App för iOS/iPad',

    'platform.type.official-site': 'Officiell webbplats',
    'platform.type.app-store': 'Officiell appbutik',
    'platform.type.web-app': 'Officiell webbapp',
    'platform.type.documentation': 'Officiell API/Dev-dokumentation',
    'platform.type.official-installer': 'Direkt officiell installerare',
    'platform.type.github-repo': 'Officiellt kodarkiv',
    'platform.type.package-manager': 'Installation via pakethanterare',

    'platform.btn.official-site': 'Använd officiell webbversion',
    'platform.btn.app-store': 'Visa app i officiell butik',
    'platform.btn.web-app': 'Starta webbapp',
    'platform.btn.documentation': 'Visa teknisk dokumentation',
    'platform.btn.official-installer': 'Ladda ner officiell installerare',
    'platform.btn.github-repo': 'Visa kod på officiell GitHub',
    'platform.btn.package-manager': 'Visa installationskommando',

    // Sections headings
    'section.best-for': 'Bäst lämpad för',
    'section.limitations': 'Begränsningar och varningar',
    'section.safety': 'Säkerhet och Nedladdning',
    'section.alternatives': 'Rekommenderade alternativ',
    'section.faq': 'Vanliga frågor om nedladdning',
    'section.editorial-summary': 'Redaktionella granskningskriterier',

    // Category specific
    'category.title': 'AI-verktyg för',
    'category.back': 'Tillbaka till katalogen',

    // Footer & Legal
    'footer.disclaimer': 'FuenteAI är ett oberoende redaktionellt index. Vi tillhandahåller inga filer eller APK-filer för nedladdning. Vi länkar uteslutande till officiella kanaler och legitima appbutiker från programvarans skapare för att garantera maximal teknisk säkerhet för användaren.',
    'footer.about': 'Om oss',
    'footer.cookies': 'Cookies',
    'footer.privacy': 'Integritetspolicy',
    'footer.legal': 'Användarvillkor',

    // --- Navigation och chrome ---
    'a11y.skip': 'Hoppa till huvudinnehållet',
    'nav.directory': 'Katalog',
    'nav.categories': 'Kategorier',
    'nav.about': 'Metod',
    'nav.menu': 'Meny',
    'nav.open-menu': 'Öppna navigeringsmenyn',
    'nav.close-menu': 'Stäng navigeringsmenyn',
    'nav.home': 'Hem',
    'nav.sections': 'Sektioner',
    'nav.legal': 'Juridik',
    'theme.toggle': 'Växla mellan ljust och mörkt tema',
    'theme.light': 'Ljust',
    'theme.dark': 'Mörkt',
    'lang.change': 'Byt språk',
    'lang.soon': 'kommer snart',

    // --- Home ---
    'home.eyebrow': 'Index över officiella källor',
    'home.h1': 'Den officiella kanalen för varje AI-verktyg, verifierad och synlig.',
    'home.lede': 'Ett oberoende redaktionellt index: för varje verktyg publicerar vi den officiella domänen, typen av kanal per plattform och datumet för senaste granskning. Vi lagrar inga filer.',
    'home.cta.browse': 'Utforska katalogen',
    'home.cta.method': 'Så granskar vi',
    'home.stat.tools': 'Publicerade verktyg',
    'home.stat.domains': 'Officiella domäner',
    'home.stat.links': 'Granskade länkar',
    'home.stat.hosted': 'Lagrade filer',
    'home.categories.eyebrow': 'Index',
    'home.categories.title': 'Utforska efter kategori',
    'home.method.eyebrow': 'Metod',
    'home.method.title': 'Vad "verifierad" betyder här',
    'home.method.1.title': 'Endast ursprungsdomäner',
    'home.method.1.body': 'Varje länk pekar på tillverkarens egen domän, officiella butik eller kodarkiv. Aldrig till spegelsajter, tredjeparts länkförkortare eller aggregatorer.',
    'home.method.2.title': 'Deklarerad kanal per plattform',
    'home.method.2.body': 'Vi anger om målet är en webbapp, en officiell butik, en direkt installerare, dokumentation eller en pakethanterare. Du vet vart du går innan du klickar.',
    'home.method.3.title': 'Synligt granskningsdatum',
    'home.method.3.body': 'Varje sida visar när den senast kontrollerades. Ändras något rättas sidan; vi lämnar inga länkar utan datum.',
    'home.method.note': 'Vi tillhandahåller inga installerare, APK-filer eller körbara filer. Vi är inte anslutna till de listade varumärkena.',

    // --- Katalog och filter ---
    'directory.eyebrow': 'Katalog',
    'directory.title': 'Välj ett verktyg',
    'directory.count.one': 'verktyg',
    'directory.count.other': 'verktyg',
    'directory.showing': 'Visar',
    'directory.of': 'av',
    'search.label': 'Sök verktyg efter namn',
    'search.hint': 'Skriv för att filtrera katalogen direkt.',
    'search.clear': 'Rensa sökning',
    'filters.toggle': 'Filter',
    'filters.category': 'Kategori',
    'filters.platform': 'Plattform',
    'filters.all': 'Alla',
    'filters.any': 'Vilken som helst',
    'filters.reset': 'Rensa filter',
    'filters.active': 'Aktiva filter',
    'badge.new-for-you': 'Ny för dig',
    'badge.known': 'Den kände du',
    'trust.no-clones': 'Noll kloner',
    'trust.no-clones.body': 'Varje länk granskas av en person mot skaparens domän och kodarkiv.',
    'trust.weekly': 'Granskas varje vecka',
    'trust.weekly.body': 'Om ett projekt byter domän eller läggs ned ser du det markerat här först.',
    'trust.no-sponsors': 'Inga sponsringar',
    'trust.no-sponsors.body': 'Ordningen går inte att köpa. Ingen betalar för att synas högst upp.',
    'official.title': 'Verifierad officiell källa',
    'official.download': 'Ladda ner',
    'official.repo': 'Källkod',
    'official.mirrors': 'Varje annan sida som erbjuder programmet är en obehörig spegel.',
    'official.reviewed': 'Granskad den',
    'alt.title': 'Om {name} passar dig finns också',
    'alt.count': 'riktiga alternativ',
    'alt.all-official': 'Alla med officiell källa',
    'count.most-know': 'De flesta känner till 2 — du saknar',
    'count.for': 'officiella verktyg för',
    'home.question': 'Vad vill du göra?',
    'home.answer': 'Berätta vilket resultat du vill ha. Vi visar alla verktyg som duger och den officiella länken till vart och ett, utan kloner.',
    'home.verified-sources': 'verifierade källor',
    'home.more-needs': 'behov',
    'view.label': 'Katalogvy',
    'view.list': 'Register',
    'view.grid': 'Kort',

    // --- Kort ---
    'card.official-channel': 'Till officiell kanal',
    'card.sheet': 'Visa sida',
    'card.platforms': 'Plattformar',
    'card.verified-domain': 'Verifierad officiell domän',

    // --- Verktygssida ---
    'tool.platforms.eyebrow': 'Officiella kanaler',
    'tool.platforms.title': 'Välj din plattform',
    'tool.platforms.note': 'Vi tillhandahåller inga egna installationsfiler.',
    'tool.quickfacts': 'Snabbfakta',
    'tool.official-sources': 'Officiella källor',
    'tool.price': 'Pris',
    'tool.account': 'Konto',
    'tool.language': 'Språk',
    'tool.trust': 'Tillit',
    'tool.platforms.count': 'Plattformar',
    'tool.cta.primary': 'Gå till officiell nedladdning',
    'tool.cta.secondary': 'Se plattformar',
    'tool.verified-origin': 'Verifierat ursprung',
    'tool.yes': 'Ja',
    'tool.no': 'Nej',
    'tool.unconfirmed': 'Ej bekräftat',

    // --- Tillstånd ---
    'empty.title': 'Inga resultat',
    'empty.body': 'Testa ett annat namn eller återställ kategori och plattform.',
    'category.empty.title': 'Fler verktyg kommer snart',
    'category.empty.body': 'Vi granskar och skriver för närvarande fler säkra sidor för denna kategori.'
  },
  it: {
    // Hero & Search
    'hero.title': 'Fonti ufficiali per strumenti IA',
    'hero.subtitle': 'Accedi direttamente ad applicazioni e download ufficiali e sicuri. Niente siti mirror, installer modificati o file sospetti.',
    'search.placeholder': 'Cerca strumenti IA...',
    'search.no-results': 'Nessun risultato trovato con questi criteri.',

    // Stats & Meta
    'stats.verified': 'Domini Verificati',
    'stats.links': 'Collegamenti Sicuri',
    'stats.directory': 'Tutto il Catalogo',

    // Tool card labels
    'card.review-date': 'Revisionato',
    'card.cta': 'Mostra fonti ufficiali',

    // Sidebar / Tool info labels
    'info.trust.official': 'Canale ufficiale',
    'info.trust.verified': 'Link verificato',
    'info.trust.pending-review': 'In revisione',

    'info.pricing.free': 'Gratuito',
    'info.pricing.freemium': 'Freemium',
    'info.pricing.paid': 'A pagamento',
    'info.pricing.enterprise': 'Enterprise',
    'info.pricing.unknown': 'Prezzo non confermato',

    'info.account.required': 'Account richiesto',
    'info.account.optional': 'Nessun account richiesto',
    'info.account.unknown': 'Account non confermato',

    'info.spanish.yes': 'Spagnolo disponibile',
    'info.spanish.partial': 'Parzialmente in spagnolo',
    'info.spanish.no': 'Solo inglese',
    'info.spanish.unknown': 'Lingua non verificata',

    'info.swedish.yes': 'Svedese disponibile',
    'info.swedish.partial': 'Parzialmente in svedese',
    'info.swedish.no': 'Solo inglese',
    'info.swedish.unknown': 'Lingua non verificata',

    'info.italian.yes': 'Italiano disponibile',
    'info.italian.partial': 'Parzialmente in italiano',
    'info.italian.no': 'Solo inglese',
    'info.italian.unknown': 'Lingua non verificata',

    'info.reviewed-on': 'Ultima revisione tecnica',
    'info.official-sources': 'Fonti ufficiali confermate',

    // Platforms dynamic labels
    'platform.web': 'Versione Web',
    'platform.windows': 'Desktop per Windows',
    'platform.mac': 'Desktop per macOS',
    'platform.linux': 'Desktop per Linux',
    'platform.android': 'App per Android',
    'platform.ios': 'App per iOS/iPad',

    'platform.type.official-site': 'Sito ufficiale del brand',
    'platform.type.app-store': 'Store di applicazioni ufficiale',
    'platform.type.web-app': 'Applicazione Web ufficiale',
    'platform.type.documentation': 'Documentazione ufficiale API/Dev',
    'platform.type.official-installer': 'Installer ufficiale diretto',
    'platform.type.github-repo': 'Repository ufficiale di codice',
    'platform.type.package-manager': 'Installazione tramite package manager',

    'platform.btn.official-site': 'Usa la versione web ufficiale',
    'platform.btn.app-store': 'Vedi l\'app nello store ufficiale',
    'platform.btn.web-app': 'Avvia applicazione web',
    'platform.btn.documentation': 'Vedi la documentazione tecnica',
    'platform.btn.official-installer': 'Scarica installer ufficiale',
    'platform.btn.github-repo': 'Vedi il codice su GitHub ufficiale',
    'platform.btn.package-manager': 'Vedi il comando di installazione',

    // Sections headings
    'section.best-for': 'Ideale per',
    'section.limitations': 'Limitazioni e avvertenze',
    'section.safety': 'Sicurezza e Download',
    'section.alternatives': 'Alternative consigliate',
    'section.faq': 'Domande frequenti sul download',
    'section.editorial-summary': 'Criterio editoriale di verifica',

    // Category specific
    'category.title': 'Strumenti IA per',
    'category.back': 'Torna al catalogo principale',

    // Footer & Legal
    'footer.disclaimer': 'FuenteAI è un indice editoriale indipendente. Non ospitiamo file o APK da scaricare. Incolliamo esclusivamente link ai canali ufficiali e agli store di applicazioni legittimi degli sviluppatori per garantire la massima sicurezza tecnica per l\'utente.',
    'footer.about': 'Chi siamo',
    'footer.cookies': 'Cookies',
    'footer.privacy': 'Informativa sulla privacy',
    'footer.legal': 'Note legali',

    // --- Navigazione ---
    'a11y.skip': 'Vai al contenuto principale',
    'nav.directory': 'Catalogo',
    'nav.categories': 'Categorie',
    'nav.about': 'Metodologia',
    'nav.menu': 'Menu',
    'nav.open-menu': 'Apri il menu di navigazione',
    'nav.close-menu': 'Chiudi il menu di navigazione',
    'nav.home': 'Home',
    'nav.sections': 'Sezioni',
    'nav.legal': 'Legale',
    'theme.toggle': 'Alterna tema chiaro e scuro',
    'theme.light': 'Chiaro',
    'theme.dark': 'Scuro',
    'lang.change': 'Cambia lingua',
    'lang.soon': 'prossimamente',

    // --- Home ---
    'home.eyebrow': 'Indice di fonti ufficiali',
    'home.h1': 'Il canale ufficiale di ogni strumento IA, verificato e in chiaro.',
    'home.lede': 'Un indice editoriale indipendente: per ogni strumento pubblichiamo il dominio ufficiale, il tipo di canale per piattaforma e la data dell\'ultima revisione. Non ospitiamo file.',
    'home.cta.browse': 'Esplora il catalogo',
    'home.cta.method': 'Come verifichiamo',
    'home.stat.tools': 'Schede pubblicate',
    'home.stat.domains': 'Domini ufficiali',
    'home.stat.links': 'Link revisionati',
    'home.stat.hosted': 'File ospitati',
    'home.categories.eyebrow': 'Indice',
    'home.categories.title': 'Esplora per categoria',
    'home.method.eyebrow': 'Metodologia',
    'home.method.title': 'Cosa significa "verificato" qui',
    'home.method.1.title': 'Solo domini di origine',
    'home.method.1.body': 'Ogni link punta al dominio del produttore, al suo store ufficiale o al suo repository. Mai a mirror, accorciatori di terze parti o aggregatori.',
    'home.method.2.title': 'Canale dichiarato per piattaforma',
    'home.method.2.body': 'Indichiamo se la destinazione è una web app, uno store ufficiale, un installer diretto, la documentazione o un package manager. Sai dove stai andando prima di cliccare.',
    'home.method.3.title': 'Data di revisione visibile',
    'home.method.3.body': 'Ogni scheda mostra quando è stata controllata l\'ultima volta. Se qualcosa cambia, la scheda viene corretta; non lasciamo link senza data.',
    'home.method.note': 'Non ospitiamo installer, APK o eseguibili. Non siamo affiliati ai marchi elencati.',

    // --- Catalogo e filtri ---
    'directory.eyebrow': 'Catalogo',
    'directory.title': 'Scegli uno strumento',
    'directory.count.one': 'strumento',
    'directory.count.other': 'strumenti',
    'directory.showing': 'Risultati',
    'directory.of': 'di',
    'search.label': 'Cerca uno strumento per nome',
    'search.hint': 'Scrivi per filtrare il catalogo all\'istante.',
    'search.clear': 'Cancella ricerca',
    'filters.toggle': 'Filtri',
    'filters.category': 'Categoria',
    'filters.platform': 'Piattaforma',
    'filters.all': 'Tutte',
    'filters.any': 'Qualsiasi',
    'filters.reset': 'Rimuovi filtri',
    'filters.active': 'Filtri attivi',
    'badge.new-for-you': 'Nuova per te',
    'badge.known': 'La conoscevi gia',
    'trust.no-clones': 'Zero cloni',
    'trust.no-clones.body': 'Ogni link viene verificato da una persona contro il dominio e il repository del creatore.',
    'trust.weekly': 'Revisionato ogni settimana',
    'trust.weekly.body': 'Se un progetto cambia dominio o viene abbandonato, lo vedrai segnalato qui per primo.',
    'trust.no-sponsors': 'Nessuna sponsorizzazione',
    'trust.no-sponsors.body': "L'ordine non si compra. Nessuno paga per apparire in alto.",
    'official.title': 'Fonte ufficiale verificata',
    'official.download': 'Scarica',
    'official.repo': 'Codice',
    'official.mirrors': 'Qualsiasi altro sito che offra questo programma è uno specchio non autorizzato.',
    'official.reviewed': 'Revisionato il',
    'alt.title': 'Se ti serve {name}, esistono anche',
    'alt.count': 'alternative reali',
    'alt.all-official': 'Tutte con fonte ufficiale',
    'count.most-know': 'La maggior parte ne conosce 2 — te ne mancano',
    'count.for': 'strumenti ufficiali per',
    'home.question': 'Cosa vuoi fare?',
    'home.answer': 'Dicci il risultato che cerchi. Ti mostriamo tutti gli strumenti che servono e il link ufficiale di ciascuno, senza cloni.',
    'home.verified-sources': 'fonti verificate',
    'home.more-needs': 'necessità',
    'view.label': 'Vista del catalogo',
    'view.list': 'Registro',
    'view.grid': 'Schede',

    // --- Scheda ---
    'card.official-channel': 'Vai al canale ufficiale',
    'card.sheet': 'Vedi scheda',
    'card.platforms': 'Piattaforme',
    'card.verified-domain': 'Dominio ufficiale verificato',

    // --- Pagina strumento ---
    'tool.platforms.eyebrow': 'Canali ufficiali',
    'tool.platforms.title': 'Scegli la tua piattaforma',
    'tool.platforms.note': 'Non ospitiamo installer né mirror.',
    'tool.quickfacts': 'Scheda rapida',
    'tool.official-sources': 'Fonti ufficiali',
    'tool.price': 'Prezzo',
    'tool.account': 'Account',
    'tool.language': 'Lingua',
    'tool.trust': 'Fiducia',
    'tool.platforms.count': 'Piattaforme',
    'tool.cta.primary': 'Vai al download ufficiale',
    'tool.cta.secondary': 'Vedi piattaforme',
    'tool.verified-origin': 'Origine verificata',
    'tool.yes': 'Sì',
    'tool.no': 'No',
    'tool.unconfirmed': 'Da confermare',

    // --- Stati ---
    'empty.title': 'Nessun risultato',
    'empty.body': 'Prova con un altro nome o reimposta categoria e piattaforma.',
    'category.empty.title': 'Altri strumenti in arrivo',
    'category.empty.body': 'Stiamo verificando e redigendo nuove schede sicure per questa categoria.'
  }
} as const;

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}
