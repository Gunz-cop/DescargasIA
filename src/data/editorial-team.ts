/**
 * Identidad y metodología del equipo editorial de FuenteAI/DescargasIA.
 *
 * Entidad única y global (no una colección por ficha): se referencia desde
 * el JSON-LD y el byline de cada ficha (`author`/`publisher` como
 * `Organization`, nunca como `Person`) y desde la sección de metodología en
 * `acerca-de.astro`. El texto describe el proceso real que ya sigue la skill
 * `descargasia-tool-ficha` — no relleno genérico.
 */

export type Lang = 'es' | 'sv' | 'it';
type Trilingual = Record<Lang, string>;

export interface MethodologyPoint {
  heading: Trilingual;
  body: Trilingual;
}

export const EDITORIAL_TEAM = {
  name: {
    es: 'Redacción FuenteAI',
    sv: 'FuenteAI-redaktionen',
    it: 'Redazione FuenteAI'
  } as Trilingual,

  role: {
    es: 'Equipo editorial de verificación de FuenteAI',
    sv: 'FuenteAIs redaktionella verifieringsteam',
    it: 'Team editoriale di verifica di FuenteAI'
  } as Trilingual,

  summary: {
    es: 'Verificamos cada canal oficial antes de publicarlo y actualizamos la ficha cuando una herramienta cambia de nombre, dominio o disponibilidad.',
    sv: 'Vi verifierar varje officiell kanal innan den publiceras och uppdaterar sidan när ett verktyg byter namn, domän eller tillgänglighet.',
    it: 'Verifichiamo ogni canale ufficiale prima di pubblicarlo e aggiorniamo la scheda quando uno strumento cambia nome, dominio o disponibilità.'
  } as Trilingual,

  methodology: [
    {
      heading: {
        es: 'Cómo verificamos cada ficha',
        sv: 'Hur vi verifierar varje sida',
        it: 'Come verifichiamo ogni scheda'
      },
      body: {
        es: 'Para cada herramienta confirmamos el dominio oficial de la marca y, plataforma por plataforma (web, Windows, macOS, Linux, Android, iOS), si existe un canal real y de qué tipo es: instalador oficial, tienda de aplicaciones, app web, repositorio o documentación. Registramos la fecha de esa revisión en cada ficha.',
        sv: 'För varje verktyg bekräftar vi varumärkets officiella domän och, plattform för plattform (webb, Windows, macOS, Linux, Android, iOS), om det finns en verklig kanal och vilken typ: officiellt installationsprogram, appbutik, webbapp, kodförråd eller dokumentation. Vi registrerar datumet för den granskningen på varje sida.',
        it: 'Per ogni strumento confermiamo il dominio ufficiale del marchio e, piattaforma per piattaforma (web, Windows, macOS, Linux, Android, iOS), se esiste un canale reale e di che tipo: installer ufficiale, store di app, web app, repository o documentazione. Registriamo la data di questa verifica in ogni scheda.'
      }
    },
    {
      heading: {
        es: 'Qué hacemos cuando la información no es clara',
        sv: 'Vad vi gör när informationen är oklar',
        it: 'Cosa facciamo quando le informazioni non sono chiare'
      },
      body: {
        es: 'Si no podemos confirmar un dato con una fuente que lo mencione de forma explícita y consistente (por ejemplo, el identificador exacto de una app en una tienda), no lo inventamos: usamos la página oficial de descargas de la marca como destino, u omitimos esa plataforma. Cuando una herramienta cambió de nombre recientemente, usamos el nombre y dominio vigentes y mencionamos el anterior, porque es como la gente todavía la busca.',
        sv: 'Om vi inte kan bekräfta en uppgift med en källa som uttryckligen och konsekvent nämner den (till exempel en apps exakta identifierare i en butik), hittar vi inte på den: vi använder varumärkets officiella nedladdningssida som mål, eller utelämnar den plattformen. När ett verktyg nyligen har bytt namn använder vi det aktuella namnet och den aktuella domänen och nämner det tidigare namnet, eftersom det är så folk fortfarande söker efter det.',
        it: 'Se non possiamo confermare un dato con una fonte che lo menzioni in modo esplicito e coerente (ad esempio l\'identificativo esatto di un\'app in uno store), non lo inventiamo: usiamo la pagina ufficiale di download del marchio come destinazione, oppure omettiamo quella piattaforma. Quando uno strumento ha cambiato nome di recente, usiamo il nome e il dominio attuali e citiamo quello precedente, perché è così che le persone lo cercano ancora.'
      }
    },
    {
      heading: {
        es: 'Qué no hacemos',
        sv: 'Vad vi inte gör',
        it: 'Cosa non facciamo'
      },
      body: {
        es: 'No alojamos instaladores, APKs ni ejecutables. No copiamos texto de fichas de modelo, README de terceros ni marketing de la marca: cada resumen editorial se redacta desde cero. No enlazamos mirrors ni versiones modificadas. Cuando citamos algo reportado por la comunidad (un límite, un bug, un truco de uso), incluimos el enlace real a la fuente; si no encontramos una fuente verificable, no incluimos esa afirmación.',
        sv: 'Vi lagrar inte installationsprogram, APK-filer eller körbara filer. Vi kopierar inte text från modellkort, tredje parts README-filer eller varumärkets marknadsföring: varje redaktionell sammanfattning skrivs från grunden. Vi länkar inte till speglade eller modifierade versioner. När vi citerar något som rapporterats av communityn (en begränsning, en bugg, ett användningstips) inkluderar vi den verkliga länken till källan; om vi inte hittar en verifierbar källa inkluderar vi inte det påståendet.',
        it: 'Non ospitiamo installer, APK o eseguibili. Non copiamo testo da model card, README di terze parti o materiale di marketing del brand: ogni sintesi editoriale viene scritta da zero. Non colleghiamo mirror o versioni modificate. Quando citiamo qualcosa segnalato dalla community (un limite, un bug, un trucco d\'uso), includiamo il link reale alla fonte; se non troviamo una fonte verificabile, non includiamo quell\'affermazione.'
      }
    }
  ] as MethodologyPoint[],

  lastUpdated: '2026-08-13'
};
