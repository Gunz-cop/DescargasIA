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
        es: 'Cómo se revisa el texto antes de publicarse',
        sv: 'Hur texten granskas innan publicering',
        it: 'Come viene revisato il testo prima della pubblicazione'
      },
      body: {
        es: 'Cada ficha se revisa con el criterio de un lector externo y escéptico, no con el de quien la escribió. Esa revisión mide cuánto se parece el texto al del resto del catálogo y a sí mismo, para que ninguna ficha sea una plantilla rellenada, y comprueba una por una que las fuentes citadas digan lo que la ficha les atribuye y que la fecha declarada coincida con la que publica la página citada. Una afirmación cuya fuente no la respalde se corrige o se elimina.',
        sv: 'Varje sida granskas med en utomstående och skeptisk läsares måttstock, inte med skribentens. Granskningen mäter hur lik texten är resten av katalogen och sig själv, så att ingen sida blir en ifylld mall, och kontrollerar en i taget att de citerade källorna säger det som sidan tillskriver dem och att det angivna datumet stämmer med det som den citerade sidan publicerar. Ett påstående vars källa inte stödjer det rättas eller tas bort.',
        it: 'Ogni scheda viene revisionata con il metro di un lettore esterno e scettico, non con quello di chi l\'ha scritta. La revisione misura quanto il testo somigli al resto del catalogo e a sé stesso, perché nessuna scheda sia un modello riempito, e verifica una per una che le fonti citate dicano ciò che la scheda attribuisce loro e che la data dichiarata coincida con quella pubblicata dalla pagina citata. Un\'affermazione che la sua fonte non sostiene viene corretta o rimossa.'
      }
    },
    {
      heading: {
        es: 'Qué se comprueba en cada publicación',
        sv: 'Vad som kontrolleras vid varje publicering',
        it: 'Cosa viene controllato a ogni pubblicazione'
      },
      body: {
        es: 'Ningún cambio llega al sitio sin pasar una batería de comprobaciones automáticas que lo bloquean si algo falla: fichas sin traducir o sin datos base, referencias a herramientas que no existen en el catálogo, enlaces internos rotos o que apuntan a una redirección, páginas que se quedan sin enlaces entrantes, y la coherencia de las etiquetas canonical y hreflang entre los tres idiomas. Si una sola de esas comprobaciones falla, la publicación se detiene.',
        sv: 'Ingen ändring når webbplatsen utan att passera en uppsättning automatiska kontroller som stoppar den om något fallerar: sidor utan översättning eller utan grunddata, hänvisningar till verktyg som inte finns i katalogen, brutna interna länkar eller länkar som pekar på en omdirigering, sidor som blir utan inkommande länkar, och samstämmigheten mellan canonical- och hreflang-taggarna på de tre språken. Om en enda av dessa kontroller fallerar stoppas publiceringen.',
        it: 'Nessuna modifica raggiunge il sito senza superare una serie di controlli automatici che la bloccano se qualcosa non torna: schede senza traduzione o senza dati di base, riferimenti a strumenti che non esistono nel catalogo, link interni rotti o che puntano a un reindirizzamento, pagine che restano senza link in entrata, e la coerenza dei tag canonical e hreflang fra le tre lingue. Se anche uno solo di questi controlli fallisce, la pubblicazione si ferma.'
      }
    },
    {
      heading: {
        es: 'Quién firma las fichas',
        sv: 'Vem som står bakom sidorna',
        it: 'Chi firma le schede'
      },
      body: {
        es: 'Las fichas se firman como Redacción FuenteAI, no con nombres de autor individuales. No creamos perfiles de personas ni credenciales que no existan: lo que respalda una ficha es el proceso descrito en esta página, la fecha de revisión que lleva y las fuentes que cita, no una biografía.',
        sv: 'Sidorna signeras av FuenteAI-redaktionen, inte med enskilda författarnamn. Vi skapar inga personprofiler eller meriter som inte finns: det som står bakom en sida är processen som beskrivs på den här sidan, granskningsdatumet den bär och källorna den citerar, inte en biografi.',
        it: 'Le schede sono firmate dalla Redazione FuenteAI, non da nomi di autori individuali. Non creiamo profili di persone né credenziali inesistenti: ciò che sostiene una scheda è il processo descritto in questa pagina, la data di revisione che riporta e le fonti che cita, non una biografia.'
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

  lastUpdated: '2026-08-28'
};
