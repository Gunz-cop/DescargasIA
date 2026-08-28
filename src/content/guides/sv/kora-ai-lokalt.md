---
title: "Köra AI lokalt: app, modell, runtime och internet"
seoTitle: "Köra AI lokalt – så skiljer du på app, modell och offlinebruk"
metaDescription: "Förstå vad lokal AI betyder i praktiken: appar, modeller, runtime, hårdvara, första nedladdningen och vad offline inte garanterar."
category: "guias"
tags: ["lokal-ai", "offline", "modeller", "hårdvara"]
datePublished: "2026-08-28"
lastUpdated: "2026-08-28"
author: "Redaktionen på DescargasIA"
---

Att köra AI lokalt betyder inte en enda sak. Du behöver skilja på programmet du installerar, modellen du hämtar, runtime-miljön som kör modellen och en eventuell lokal server eller klient. Dessutom kan den första hämtningen och uppdateringar kräva internet även om en senare körning sker på den egna datorn.

Den här guiden hjälper dig att välja väg utan ett påhittat RAM- eller VRAM-krav och utan att lova en viss hastighet. [Se kategorin för lokala modeller](/sv/categoria/modelos-locales) och jämför [LM Studio](/sv/lm-studio), [Ollama](/sv/ollama) och [Jan](/sv/jan) efter hur du vill arbeta.

## Fyra delar som ofta blandas ihop

- **Appen** ger dig ett gränssnitt eller kommandon för att arbeta med AI.
- **Modellen** är filen eller modellpaketet som svarar på dina frågor.
- **Runtime** laddar modellen och använder datorns resurser för att köra den.
- **Servern eller klienten** kan ge ett lokalt API, en webbyta eller en annan app åtkomst till runtime-miljön.

En app kan vara lokal utan att varje funktion är det. En lokal modell kan behöva hämtas från internet först. En dokumentationssida kan beskriva installation utan att vara en installerare. Dessa skillnader är viktiga när du väljer en officiell väg.

## Verifierade officiella vägar

F4-evidensen från 2026-08-28 verifierar följande kanaler:

- [LM Studio på den officiella webbplatsen](/r?t=lm-studio&p=web&l=sv). Webbplatsen är den verifierade ingången för Windows, macOS och Linux.
- [Ollama för Windows](/r?t=ollama&p=windows&l=sv) och [Ollama för macOS](/r?t=ollama&p=mac&l=sv) har verifierade officiella installerare.
- [Ollama för Linux](/r?t=ollama&p=linux&l=sv) leder till officiell dokumentation och installationsinstruktioner.
- [Jan på den officiella webbplatsen](/r?t=jan&p=web&l=sv) är den verifierade ingången för desktopkanalerna Windows, macOS och Linux.
- Open WebUI har verifierad dokumentationsledd installation för Windows, macOS och Linux. Dokumentationen är en installationsväg, inte en fristående katalogfil.

Microsoft Learn är verifierad som kontext om Windows AI och Foundry Local, men är inte en katalogkanal eller en extra ficha i detta arbete. [Läs Microsofts officiella kontext](https://learn.microsoft.com/en-us/windows/ai/).

## När är användningen faktiskt offline?

Ställ tre separata frågor:

1. Kräver appen internet för att hämtas eller uppdateras?
2. Kräver modellen internet för att laddas ner eller bytas?
3. Skickas någon funktion, inloggning, sökning eller molnkoppling utanför datorn under användningen?

Evidensen ger inte ett generellt svar som gäller alla appar, modeller och inställningar. Därför ska ”lokal” inte behandlas som en integritetscertifiering. Kontrollera aktuell dokumentation och den valda modellens källa och licens innan du arbetar med känsligt material.

## Välj efter arbetssätt

LM Studio är en verifierad officiell väg för en grafisk desktopapp. Ollama är verifierat med webbplats, Windows- och macOS-installerare samt Linux-dokumentation. Jan har en verifierad officiell webbplats för desktopplattformar. Open WebUI är verifierat genom dokumentation för installation på desktopplattformar.

Det här är skillnader i kanal och arbetsform, inte en ranking. Fråga dig själv:

- Vill du arbeta i ett grafiskt gränssnitt eller i terminalen?
- Behöver du ett lokalt API eller bara ett gränssnitt för chatt?
- Vill du hantera modeller i samma app eller själv sätta ihop flera delar?
- Är datorns operativsystem och tillgängliga minne dokumenterade för den modell du vill använda?

Det finns inget enda hårdvarutal som avgör om en lokal modell blir användbar. Modellstorlek, kvantisering, kontext och dator påverkar valet, så börja med den konkreta modellens krav i stället för ett generellt löfte om prestanda.

## Hårdvara, modeller och uppdateringar

En lokal AI-installation består inte bara av programfilen. Du behöver också planera för modellfiler, lagringsutrymme, uppdateringar och eventuella beroenden. En större modell är inte automatiskt bättre för din dator eller din uppgift, och denna guide anger inget universellt RAM- eller VRAM-krav.

Använd officiella produkt- och dokumentationskanaler. Ladda inte ner ompaketerade program, modellpaket från okända sidor eller filer som lovar en upplåst version. Kontrollera också licensvillkoren för modellen; appens officiella kanal säger inte automatiskt något om varje modellfil.

## Vanliga frågor

### Kan jag köra AI utan internet?

En senare lokal körning kan vara möjlig, men appen eller modellen kan behöva internet för den första hämtningen och uppdateringar. Molnfunktioner eller andra kopplingar kan fortfarande kräva anslutning.

### Är lokal AI automatiskt privat?

Nej. ”Lokal” är inte en juridisk eller teknisk integritetsgaranti. Kontrollera appens funktioner, modellens källa och om någon del av arbetsflödet använder molnet.

### Behöver jag ett visst antal GB RAM eller VRAM?

Det finns inget enda tröskelvärde som gäller alla modeller. Kraven påverkas av modell, kvantisering, kontext och hur mycket som kan köras på din dator. Kontrollera den konkreta modellen och dokumentationen.

### Är Open WebUI en modell?

Nej. I den här jämförelsen är Open WebUI en dokumentationsledd väg till ett gränssnitt/installationsflöde. Modellen och den runtime-miljö som gränssnittet använder är separata delar.

### Var hittar jag officiella vägar?

Använd [LM Studio](/r?t=lm-studio&p=web&l=sv), [Ollama för Windows](/r?t=ollama&p=windows&l=sv), [Jan](/r?t=jan&p=web&l=sv) eller Open WebUIs [officiella installationsdokumentation](https://docs.openwebui.com/getting-started/). Undvik installerare och modellfiler från okända källor.

## Officiella källor

Kanaluppgifterna kontrollerades i det kanoniska registret 2026-08-28. De primära källorna är [LM Studio](https://lmstudio.ai), [Ollama](https://ollama.com), [Ollamas nedladdningssida](https://ollama.com/download), [Jan](https://jan.ai), [Open WebUI-dokumentationen](https://docs.openwebui.com/getting-started/) och [Microsoft Learn om Windows AI](https://learn.microsoft.com/en-us/windows/ai/).
