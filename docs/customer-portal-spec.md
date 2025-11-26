# Siteflow Customer Portal - Systemspecifikation

## Översikt

Ett komplett kundportal-system där Siteflow kan bjuda in kunder, samla in projektinformation, skapa produktplaner, och låta kunder följa projektutvecklingen i realtid.

## Användarroller

### Kund (Customer)
- Tar emot inbjudan via email
- Skapar konto och fyller i företagsinformation
- Fyller i detaljerat projektformulär
- Godkänner produktplan
- Följer projektutveckling i dashboard
- Skapar support tickets

### Admin (Siteflow)
- Skickar inbjudningar till nya kunder
- Tar emot projektförfrågningar
- Skapar och laddar upp produktplaner
- Uppdaterar projektstatus löpande
- Hanterar support tickets

---

## Kundflöde (Customer Journey)

### Steg 1: Inbjudan
**Email-innehåll:**
```
Ämne: Välkommen till Siteflow - Starta ditt projekt

Hej!

Du har blivit inbjuden av Siteflow att planera ert projekt.
Vi ser fram emot samarbetet!

[Kom igång] (knapp som leder till registrering)

Med vänliga hälsningar,
Siteflow-teamet
```

### Steg 2: Skapa Konto & Företagsinformation
Kunden klickar på länken och kommer till ett registreringsformulär:

**Obligatoriska fält:**
- [ ] Företagsnamn
- [ ] Kontaktperson (för- och efternamn)
- [ ] Email
- [ ] Telefonnummer
- [ ] Organisationsnummer (frivilling)
- [ ] Antal anställda
  - 1-10
  - 11-50
  - 51-200
  - 201+
- [ ] Bransch (dropdown) (med sök)
- [ ] Företagets webbplats (om finns)
- [ ] Lösenord (skapa)

**Valfria fält:**
- Adress
- Faktureringsadress (om skiljer sig)

### Steg 3: Projekttyp (Timeline struktur - Steg 1 av formuläret)

**Vad ska vi bygga åt er?**
- [ ] Hemsida
- [ ] System/Applikation
- [ ] Båda

*(Kunden väljer ETT alternativ och klickar "Nästa")*

---

## Dynamiska Formulär baserat på val

### A. Om "Hemsida" valdes

#### Sektion 1: Grundläggande Information
**1. Har ni en befintlig hemsida idag?**
- [ ] Ja
- [ ] Nej

*Om Ja:*
- Vad är URL:en? _______________
- Vad fungerar bra med nuvarande hemsida?
- Vad fungerar dåligt/vad vill ni förbättra?

**2. Vad är huvudsyftet med hemsidan?**
- [ ] Informera om företaget och tjänster
- [ ] Sälja produkter (e-handel)
- [ ] Generera leads/kontakter
- [ ] Boka tjänster/tider
- [ ] Visa portfolio/projekt
- [ ] Blogg/innehåll
- [ ] Annat: _______________

**3. Vilka är era huvudsakliga målgrupper?**
_(Fritextfält)_

#### Sektion 2: Funktioner & Innehåll

**4. Vilka sidor/sektioner behöver hemsidan?** *(Flera val)*
- [ ] Startsida
- [ ] Om oss
- [ ] Tjänster/Produkter
- [ ] Portfolio/Case studies
- [ ] Blogg
- [ ] Kontakt
- [ ] Team/Medarbetare
- [ ] FAQ
- [ ] Priser
- [ ] Booking-system
- [ ] Kundportal/Login
- [ ] E-handel/Shop
- [ ] Annat: _______________

**5. Vilka funktioner behöver ni?** *(Flera val)*
- [ ] Kontaktformulär
- [ ] Newsletter-anmälan
- [ ] Bokning/Tidsbokning
- [ ] Live chat
- [ ] Sökfunktion
- [ ] Flerspråksstöd (ange språk: _______)
- [ ] Betalningar online
- [ ] CMS (Content Management System) för att uppdatera själva
- [ ] Integration med CRM-system
- [ ] Integration med annat system (ange vilket: _______)
- [ ] Annat: _______________

**6. Hur många sidor ungefär?**
- [ ] 1-5 sidor
- [ ] 6-10 sidor
- [ ] 11-20 sidor
- [ ] 20+ sidor

#### Sektion 3: Design & Varumärke

**7. Ladda upp er logotyp**
_(Filuppladdning: PNG, SVG, AI, PDF - max 10MB)_
- [ ] Primär logotyp
- [ ] Sekundär logotyp (om finns)
- [ ] Logotyp för mörk bakgrund (om finns)

**8. Välj er färgpalett**

*Alternativ 1: Använd befintliga färger*
- Primärfärg (hex): #______
- Sekundärfärg (hex): #______
- Accentfärg (hex): #______

*Alternativ 2: Välj från våra förslag*
_(Visuell färgpalett-väljare med fördefinierade paletter)_

*Alternativ 3: Vi behöver hjälp med färgval*
- [ ] Låt Siteflow föreslå färgpalett

**9. Ladda upp designinspiration** *(Valfritt)*
_(Möjlighet att ladda upp bilder eller länka till hemsidor ni gillar)_
- Länk 1: _______________
- Länk 2: _______________
- Länk 3: _______________

**10. Vilken känsla/stil vill ni förmedla?** *(Flera val)*
- [ ] Modern & minimalistisk
- [ ] Professionell & företagsmässig
- [ ] Kreativ & lekfull
- [ ] Elegant & exklusiv
- [ ] Teknisk & innovativ
- [ ] Varm & personlig
- [ ] Annat: _______________

**11. Har ni en grafisk profil/brandbook?**
- [ ] Ja _(möjlighet att ladda upp PDF)_
- [ ] Nej

#### Sektion 4: Innehåll & Bilder

**12. Vem kommer skriva texterna?**
- [ ] Vi har redan alla texter färdiga
- [ ] Vi skriver texterna, men vill ha hjälp med struktur
- [ ] Vi vill att Siteflow skriver alla texter
- [ ] Kombination/behöver diskutera

**13. Har ni professionella bilder/foton?**
- [ ] Ja, vi har allt vi behöver
- [ ] Vi har en del, men behöver komplettera
- [ ] Nej, vi behöver hjälp med fotografering
- [ ] Vi vill använda stockbilder

**14. Behöver ni hjälp med video?**
- [ ] Ja, vi vill ha video på hemsidan
- [ ] Nej
- [ ] Osäker/vill diskutera

#### Sektion 5: Tekniska Krav

**15. Behöver hemsidan vara mobilanpassad (responsiv)?**
- [ ] Ja *(Standard - alltid rekommenderat)*
- [ ] Nej

**16. Har ni särskilda krav gällande prestanda/hastighet?**
_(Fritextfält)_

**17. Behöver hemsidan vara tillgänglighetsanpassad (WCAG)?**
- [ ] Ja, nivå A
- [ ] Ja, nivå AA
- [ ] Ja, nivå AAA
- [ ] Nej specifika krav

**18. Hosting & Domän**
- [ ] Vi har redan domän (ange: _______)
- [ ] Vi vill att Siteflow registrerar domän
- [ ] Vi har redan hosting
- [ ] Vi vill att Siteflow hanterar hosting

#### Sektion 6: SEO & Marknadsföring

**19. Är SEO (sökmotoroptimering) viktigt för er?**
- [ ] Ja, mycket viktigt
- [ ] Ja, ganska viktigt
- [ ] Nej, inte prioritet just nu

**20. Behöver ni hjälp med:**
- [ ] Google Analytics-uppsättning
- [ ] Google Search Console
- [ ] Cookie-consent/GDPR
- [ ] Social media-integration
- [ ] Email-marknadsföring (MailChimp, etc)

#### Sektion 7: Budget & Timeline

**21. Vad är er budget för projektet?**
- [ ] Under 50 000 kr
- [ ] 50 000 - 100 000 kr
- [ ] 100 000 - 200 000 kr
- [ ] 200 000 - 500 000 kr
- [ ] 500 000+ kr
- [ ] Har ingen fast budget/vill diskutera

**22. När behöver hemsidan vara klar?**
- [ ] Så snart som möjligt
- [ ] Inom 1 månad
- [ ] Inom 2-3 månader
- [ ] Inom 6 månader
- [ ] Inget specifikt datum
- [ ] Specifikt datum: _______________

**23. Finns det några viktiga milstolpar/deadlines?**
_(Fritextfält - t.ex. produktlansering, mässa, etc)_

#### Sektion 8: Övrigt

**24. Något annat vi bör veta om projektet?**
_(Stort fritextfält för övriga önskemål, krav, frågor)_

---

### B. Om "System/Applikation" valdes

#### Sektion 1: Grundläggande Information

**1. Har ni ett befintligt system idag?**
- [ ] Ja
- [ ] Nej

*Om Ja:*
- Beskriv systemet: _______________
- Vilka är de största utmaningarna med nuvarande system?
- Vad fungerar bra som ni vill behålla?
- Behöver det nya systemet integrera med det gamla?

**2. Vad ska systemet göra? (huvudsyfte)**
- [ ] CRM (Customer Relationship Management)
- [ ] ERP (Enterprise Resource Planning)
- [ ] Bokningssystem
- [ ] E-handel/Marketplace
- [ ] Projekthantering
- [ ] Intern verktyg för anställda
- [ ] Kundportal
- [ ] Rapportering/Analytics
- [ ] Automatisering av processer
- [ ] IoT/Datavisualisering
- [ ] Mobil app
- [ ] Annat: _______________

**3. Beskriv systemet med egna ord**
_(Stort fritextfält - så detaljerat som möjligt)_

**4. Vem kommer använda systemet?** *(Flera val)*
- [ ] Anställda internt
- [ ] Kunder/Slutanvändare
- [ ] Partners/Återförsäljare
- [ ] Administratörer
- [ ] Annat: _______________

**5. Hur många användare ungefär?**
- [ ] 1-10
- [ ] 11-50
- [ ] 51-200
- [ ] 201-1000
- [ ] 1000+

#### Sektion 2: Funktioner & Features

**6. Vilka huvudfunktioner behöver systemet?** *(Flera val)*
- [ ] Användarhantering (registrering, login, roller)
- [ ] Dashboard/Översikt
- [ ] Datavisualisering (grafer, diagram)
- [ ] CRUD-operationer (Skapa, Läsa, Uppdatera, Ta bort data)
- [ ] Sökfunktionalitet
- [ ] Filter & Sortering
- [ ] Notifikationer (email, push, SMS)
- [ ] Filuppladdning/Dokumenthantering
- [ ] Kalender/Tidsbokning
- [ ] Betalningar/Fakturering
- [ ] Rapporter/Export (PDF, Excel, etc)
- [ ] API för tredjepartsintegration
- [ ] Real-time uppdateringar
- [ ] Chat/Meddelanden mellan användare
- [ ] Workflow/Automatiseringar
- [ ] Audit log/Historik
- [ ] Annat: _______________

**7. Beskriv era viktigaste user flows/arbetsflöden**
_(Fritextfält - t.ex. "Kund loggar in → Söker produkt → Lägger order → Får bekräftelse")_

**8. Behöver systemet integrera med andra system?** *(Flera val)*
- [ ] Bokföringssystem (ange vilket: _______)
- [ ] CRM (Salesforce, HubSpot, etc)
- [ ] Betalningsleverantör (Stripe, Klarna, Swish, etc)
- [ ] Email (Outlook, Gmail, etc)
- [ ] Kalender (Google Calendar, Outlook)
- [ ] Lagersystem
- [ ] Logistik/Frakt
- [ ] Sociala medier
- [ ] Analytics (Google Analytics, Mixpanel, etc)
- [ ] Annat: _______________

#### Sektion 3: Datahantering

**9. Vilken typ av data kommer systemet hantera?**
- [ ] Kunddata
- [ ] Produktdata
- [ ] Transaktioner/Beställningar
- [ ] Dokument/Filer
- [ ] Användargenererat innehåll
- [ ] Känslig/Personlig data (kräver extra säkerhet)
- [ ] Annat: _______________

**10. Hur viktigt är GDPR-compliance?**
- [ ] Kritiskt viktigt
- [ ] Viktigt
- [ ] Mindre viktigt

**11. Behöver data exporteras/importeras?**
- [ ] Ja, regelbundna exporter
- [ ] Ja, engångsimport av befintlig data
- [ ] Både import och export
- [ ] Nej

#### Sektion 4: Användargränssnitt & Design

**12. Ladda upp er logotyp**
_(Filuppladdning: PNG, SVG, AI, PDF - max 10MB)_

**13. Välj färgpalett för systemet**
- Primärfärg (hex): #______
- Sekundärfärg (hex): #______
- Accentfärg (hex): #______

_(Eller väljare/låt Siteflow föreslå)_

**14. Har ni designpreferenser?** *(Flera val)*
- [ ] Modern & minimalistisk
- [ ] Data-tung (många tabeller/grafer)
- [ ] Mobil-first
- [ ] Desktop-first
- [ ] Följ vår befintliga design/brandbook
- [ ] Inspirerad av: _______ (länk/beskrivning)

**15. Ladda upp wireframes/mockups** *(Valfritt)*
_(Om ni redan har skisser eller designförslag)_

**16. Behöver systemet fungera på mobil/surfplatta?**
- [ ] Ja, responsiv webbapp
- [ ] Ja, vi vill ha native mobilapp (iOS/Android)
- [ ] Endast desktop
- [ ] Osäker/vill diskutera

#### Sektion 5: Tekniska Krav & Säkerhet

**17. Finns det särskilda tekniska krav?**
- [ ] Specifik programmeringsspråk (ange: _______)
- [ ] Specifik databas (PostgreSQL, MongoDB, etc)
- [ ] Molnleverantör (AWS, Azure, Google Cloud)
- [ ] On-premise hosting
- [ ] Inga specifika krav

**18. Säkerhetskrav** *(Flera val)*
- [ ] Two-factor authentication (2FA)
- [ ] Single Sign-On (SSO)
- [ ] Rollbaserad åtkomstkontroll
- [ ] Kryptering av känslig data
- [ ] IP-whitelist
- [ ] Audit logging
- [ ] Penetrationstester
- [ ] ISO/SOC-certifiering
- [ ] Annat: _______________

**19. Prestanda & Skalning**
- Hur många samtidiga användare förväntas? _______
- Kritisk responstid? (t.ex. "under 200ms") _______
- Förväntad datatillväxt per år? _______

**20. Backup & Disaster Recovery**
- [ ] Dagliga backups
- [ ] Veckovisa backups
- [ ] Kontinuerlig backup
- [ ] Redundant infrastructure
- [ ] Disaster recovery plan

#### Sektion 6: Admin & Underhåll

**21. Vem ska kunna administrera systemet?**
- [ ] Vi behöver ett admin-gränssnitt
- [ ] Endast Siteflow-support
- [ ] Både oss och Siteflow

**22. Behöver ni utbildning för administratörer?**
- [ ] Ja, on-site
- [ ] Ja, remote/video
- [ ] Ja, dokumentation räcker
- [ ] Nej

**23. Dokumentation**
- [ ] Användardokumentation
- [ ] Teknisk dokumentation
- [ ] API-dokumentation
- [ ] Video-tutorials
- [ ] Allt ovanstående

#### Sektion 7: Budget & Timeline

**24. Vad är er budget för projektet?**
- [ ] Under 100 000 kr
- [ ] 100 000 - 250 000 kr
- [ ] 250 000 - 500 000 kr
- [ ] 500 000 - 1 000 000 kr
- [ ] 1 000 000+ kr
- [ ] Har ingen fast budget/vill diskutera

**25. När behöver systemet vara klart?**
- [ ] Så snart som möjligt
- [ ] Inom 2 månader
- [ ] Inom 3-6 månader
- [ ] Inom 6-12 månader
- [ ] 12+ månader
- [ ] Inget specifikt datum
- [ ] Specifikt datum: _______________

**26. Är detta ett MVP (Minimum Viable Product) eller full version?**
- [ ] MVP - vi vill lansera snabbt med grundfunktioner
- [ ] Full version från start
- [ ] Osäker/vill diskutera

#### Sektion 8: Support & Underhåll efter lansering

**27. Vilken nivå av support behöver ni efter lansering?**
- [ ] Grundsupport (bug fixes)
- [ ] Standard support (5x8, svarstid 24h)
- [ ] Premium support (24/7, svarstid 2h)
- [ ] Vi sköter underhållet själva
- [ ] Osäker/vill diskutera

**28. Planerar ni vidareutveckling efter lansering?**
- [ ] Ja, kontinuerlig utveckling
- [ ] Ja, men mer sporadiskt
- [ ] Nej, bara underhåll
- [ ] Osäker

#### Sektion 9: Övrigt

**29. Nuvarande utmaningar & problem**
*Beskriv i detalj vilka problem/utmaningar ni har idag som systemet ska lösa:*
_(Stort fritextfält)_

**30. Success metrics**
*Hur mäter ni att projektet är lyckat?*
_(t.ex. "50% minskning i manuellt arbete", "500 aktiva användare första månaden")_

**31. Något annat vi bör veta?**
_(Stort fritextfält)_

---

### C. Om "Båda" valdes

Kunden får först genomgå **Hemsida-formuläret**, följt av **System-formuläret**.

_(Alternativt: Kombinerat formulär med de mest relevanta frågorna från båda)_

---

## Efter Formuläret - Sammanfattning & Granska

**Steg 4: Granska din information**

Kunden får se en sammanfattning av allt de fyllt i, uppdelat i sektioner.

- [ ] Möjlighet att redigera varje sektion
- [ ] "Skicka in" knapp

När kunden klickar "Skicka in":
- Bekräftelsemeddelande visas
- Email skickas till kunden: "Vi har tagit emot din förfrågan!"
- Notifikation till Admin

---

## Admin-gränssnitt

### Dashboard - Nya förfrågningar

Admin ser alla inkomna projektförfrågningar:

**Förfrågningskort visar:**
- Företagsnamn
- Kontaktperson
- Projekttyp (Hemsida/System/Båda)
- Datum mottaget
- Status:
  - 🟡 Ny (väntar på produktplan)
  - 🔵 Produktplan skapad (väntar på godkännande)
  - 🟢 Godkänd (projekt aktivt)
  - 🔴 Avböjd/Avbruten

### Visa förfrågan

Admin klickar på en förfrågan och ser:
1. All företagsinformation
2. Alla formulärsvar (strukturerat och lättläst)
3. Uppladdade filer (logotyp, dokument, etc)

**Admin-åtgärder:**
- [ ] Skapa produktplan
- [ ] Kontakta kunden (skicka meddelande/email direkt)
- [ ] Markera som prioritet
- [ ] Lägg till interna anteckningar

### Skapa Produktplan

Admin fyller i:

**Produktplan-mall:**

```markdown
# Produktplan - [Företagsnamn]

## Projektöversikt
**Projekttyp:** [Hemsida/System/Båda]
**Estimerad tid:** [X veckor]
**Budget:** [XXX XXX kr]

## Scope - Vad ingår

### Faser
1. **Fas 1: Discovery & Design** (vecka 1-2)
   - Kick-off möte
   - Wireframes
   - Designförslag

2. **Fas 2: Utveckling** (vecka 3-6)
   - Frontend-utveckling
   - Backend-utveckling
   - Integrationer

3. **Fas 3: Test & Lansering** (vecka 7-8)
   - Användartest
   - Bug fixes
   - Produktionssättning

### Funktioner som ingår
- [X] Funktion 1
- [X] Funktion 2
- [X] Funktion 3

### Vad som INTE ingår (out of scope)
- [ ] Feature X (kan läggas till senare)
- [ ] Feature Y

## Teknisk stack
- Frontend: [React, Vue, etc]
- Backend: [Node.js, Python, etc]
- Databas: [PostgreSQL, MongoDB, etc]
- Hosting: [AWS, Azure, etc]

## Timeline
**Startdatum:** [YYYY-MM-DD]
**Leveransdatum:** [YYYY-MM-DD]

**Milstolpar:**
- Vecka 2: Design klar
- Vecka 4: MVP demo
- Vecka 6: Beta-version
- Vecka 8: Lansering

## Team
- Projektledare: [Namn]
- Designer: [Namn]
- Utvecklare: [Namn(n)]
- QA: [Namn]

## Prissättning
**Total kostnad:** XXX XXX kr
**Betalningsplan:**
- 30% vid signering
- 40% vid halvvägs
- 30% vid lansering

## Villkor
- Support ingår i 3 månader efter lansering
- Source code ägs av kunden
- Ändringar utanför scope debiteras separat

---

**Godkänn produktplan:**
Genom att godkänna denna plan accepterar ni omfattning, pris och timeline.

[Godkänn] [Vill diskutera/ändra]
```

**Admin laddar upp produktplanen som PDF eller strukturerad data**

### Efter uppladdning

Kunden får notifikation:
- Email: "Din produktplan är klar att granskas"
- Notifikation i kundportalen

---

## Kundportal - Efter godkännande

### Kund-dashboard

När kunden loggar in ser de:

#### 1. Projektstatus-översikt

**Progress bar:**
```
[████████████░░░░░░░░] 60% klart
```

**Aktuell fas:** Fas 2 - Utveckling (vecka 4 av 8)

**Nästa milstolpe:** Beta-version (om 2 veckor)

#### 2. Timeline-vy

Visuell tidslinje som visar:
- ✅ Avklarade milstolpar (grön bock)
- 🔵 Pågående aktivitet (pulserar)
- ⚪ Kommande milstolpar (grå)

Exempel:
```
✅ Kick-off möte (2024-01-15)
✅ Wireframes godkända (2024-01-22)
✅ Design godkänd (2024-01-29)
🔵 Frontend-utveckling (pågår...)
⚪ Backend-utveckling
⚪ Integrationer
⚪ Test & QA
⚪ Lansering
```

#### 3. Senaste uppdateringar (Feed)

**Admin lägger till uppdateringar:**

```
[2024-02-10 14:30]
📝 Status-uppdatering av Anna (Projektledare)
"Vi har nu slutfört hemsidans header och navigation.
Kolla på förhandsvisningen här: [länk]"
👍 Kommentera

[2024-02-08 09:15]
🎨 Design-fil uppladdad av Erik (Designer)
"Färdiga mockups för alla sidor"
[Ladda ner PDF]
👍 Kommentera

[2024-02-05 16:00]
✅ Milstolpe nådd: Wireframes godkända
```

Kunden kan:
- Se alla uppdateringar
- Kommentera
- Gilla/reagera
- Få email-notifikationer

#### 4. Filer & Dokument

**Delad mapp där kunden ser:**
- Designfiler
- Wireframes
- Teknisk dokumentation
- Meeting notes
- Färdig produktplan (PDF)
- Kontrakt
- Fakturaunderlag

**Kunden kan:**
- Ladda ner filer
- Ladda upp egna filer (nya logotyper, innehåll, etc)
- Se versionshistorik

#### 5. Preview/Staging-länk

**När utveckling påbörjats:**
- "Se förhandsvisning" knapp
- Länk till staging-miljö där kunden kan testa

**Kunden kan:**
- Klicka runt och testa
- Rapportera buggar direkt därifrån

#### 6. Möten & Kalender

**Schemalagda möten:**
- Kick-off: 2024-01-15 10:00 (✅ Genomförd)
- Design review: 2024-01-29 14:00 (✅ Genomförd)
- Demo: 2024-02-15 10:00 (🔵 Kommande) [Anslut via Zoom]

#### 7. Team-information

**Ditt team:**
- **Anna Svensson** - Projektledare
  📧 anna@siteflow.se | 📞 070-123 45 67

- **Erik Johansson** - Designer
  📧 erik@siteflow.se

- **Sofia Andersson** - Lead Developer
  📧 sofia@siteflow.se

---

## Ticket-system (Support)

### Kund skapar ticket

**Knapp: "Behöver du hjälp? Skapa ett ärende"**

**Formulär:**
- Ämne: _______________
- Kategori:
  - [ ] Fråga
  - [ ] Bugg
  - [ ] Feature request
  - [ ] Annat
- Prioritet:
  - [ ] Låg
  - [ ] Medium
  - [ ] Hög
  - [ ] Kritisk
- Beskrivning: _(Fritextfält med rich text editor)_
- Bifoga filer/screenshots

**Efter skapande:**
- Ticket får ett ID (#T-001)
- Admin notifieras
- Kunden får bekräftelse via email

### Ticket-vy för kund

Kunden ser alla sina tickets:

```
#T-003 | Bugg: Broken link på kontaktsidan | 🟡 Öppen
Skapad: 2024-02-12 | Senast uppdaterad: 2024-02-12

#T-002 | Fråga: Kan vi ändra färg på header? | ✅ Löst
Skapad: 2024-02-10 | Stängd: 2024-02-10

#T-001 | Feature: Lägg till Instagram-feed | 🔵 Pågår
Skapad: 2024-02-08 | Senast uppdaterad: 2024-02-11
```

**När kunden klickar på en ticket:**

Chatt-liknande konversation:
```
[Kund - 2024-02-12 14:30]
Länken till kontaktformuläret är trasig på "Om oss"-sidan.

[Admin (Sofia) - 2024-02-12 15:45]
Tack för att du rapporterade! Jag tittar på det nu.

[Admin (Sofia) - 2024-02-12 16:10]
Fixat! Kan du testa igen?
Status ändrad: Öppen → Väntar på svar

[Kund - 2024-02-12 16:30]
Perfekt, fungerar nu! Tack!

[Admin (Sofia) - 2024-02-12 16:35]
Toppen! Stänger ärendet.
Status ändrad: Väntar på svar → Löst
```

### Admin ticket-hantering

Admin ser alla tickets i prioritetsordning:
- Dashboard för alla öppna tickets
- Kan tilldela tickets till teammedlemmar
- SLA-timers (t.ex. "Hög prioritet måste besvaras inom 2h")
- Kan merga/länka relaterade tickets
- Kan skapa interna anteckningar som kunden inte ser
- Kan stänga/återöppna tickets

---

## Admin - Uppdatera projektstatus

### Enkel uppdaterings-vy för Admin

**Snabb-uppdatering:**
```
Projekt: [Dropdown välj projekt]

Typ av uppdatering:
- [ ] Statusmeddelande
- [ ] Milstolpe slutförd
- [ ] Fil uppladdad
- [ ] Mötesanteckningar
- [ ] Demo/Preview-länk

Rubrik: _______________
Meddelande: _(Rich text editor)_
Bifoga filer: [Välj filer]
Länk: _______________

[X] Skicka email-notifikation till kunden
[Publicera uppdatering]
```

**Timeline-editor:**
Admin kan dra och släppa milstolpar, uppdatera status visuellt.

**Progress-uppdatering:**
- Slider: 0% ─────────●─── 100% (60%)
- Eller manuellt: Fas 2 av 3 (eller vecka 4 av 8)

---

## Notifikationer

### Email-notifikationer till kund

Kunden får email vid:
- ✉️ Produktplan uppladdad
- ✉️ Ny status-uppdatering
- ✉️ Milstolpe slutförd
- ✉️ Ny fil uppladdad
- ✉️ Ticket-svar
- ✉️ Kommande möte (påminnelse 24h innan)

**Inställningar:** Kunden kan välja vilka notifikationer de vill ha.

### Push-notifikationer (om mobil-app/PWA)

Samma som email, men som push-meddelanden.

---

## Avslutning av projekt

När projektet är klart:

### Admin markerar projektet som "Levererat"

**Kunden får:**
1. Email: "Grattis! Ditt projekt är klart"
2. I kundportalen:
   - Konfetti-animation 🎉
   - "Ditt projekt är nu live!"
   - Länk till den färdiga hemsidan/systemet
3. Formulär: "Hur nöjd är du? Betygsätt projektet"

### Post-projekt vy

**Kunden ser nu:**
- ✅ Projektet slutfört (datum)
- Alla filer/dokumentation
- Support-period: "Du har support till [datum]"
- "Behöver du hjälp med något? Skapa ett ticket"

**Efter support-perioden:**
- Kunden kan förnya support (länk till förnyelse)
- Kan boka nya projekt
- Kan begära utbyggnad/nya features

---

## Tekniska krav för systemet

### Frontend
- **React** eller **Vue.js**
- Responsiv design (desktop, tablet, mobil)
- Real-time uppdateringar (WebSockets eller SSE)
- Drag-and-drop för filuppladdning
- Rich text editor för kommentarer
- Färgväljare-komponent
- Timeline-komponent
- Progress bars/indicators

### Backend
- **Node.js** (Express) eller **Python** (FastAPI/Django)
- RESTful API
- Real-time notifications
- File storage (AWS S3 eller liknande)
- Email-service (SendGrid, AWS SES)
- Databas: **PostgreSQL**
- Authentication: JWT + Refresh tokens
- Role-based access control (Customer, Admin, Super Admin)

### Databas-schema (förenklad)

**Users**
- id
- email
- password (hashed)
- role (customer, admin)
- created_at

**Companies**
- id
- user_id (foreign key)
- company_name
- contact_person
- phone
- org_number
- employees_count
- industry
- website
- address

**Projects**
- id
- company_id
- project_type (website, system, both)
- status (new, plan_created, approved, in_progress, delivered, cancelled)
- budget_range
- timeline_weeks
- deadline_date
- created_at
- started_at
- completed_at

**FormResponses**
- id
- project_id
- question_key
- answer_value (JSON for complex answers)

**ProductPlans**
- id
- project_id
- content (markdown/HTML)
- pdf_url
- created_by (admin_id)
- approved (boolean)
- approved_at

**Updates**
- id
- project_id
- admin_id
- title
- message
- type (status, milestone, file, meeting, demo)
- created_at

**Files**
- id
- project_id / update_id
- filename
- file_url
- uploaded_by (user_id)
- file_type
- size
- created_at

**Tickets**
- id
- project_id
- customer_id
- title
- category
- priority
- status (open, in_progress, waiting, resolved, closed)
- created_at
- closed_at

**TicketMessages**
- id
- ticket_id
- user_id
- message
- is_internal (boolean - for admin notes)
- created_at

**Meetings**
- id
- project_id
- title
- scheduled_at
- meeting_link (Zoom, Google Meet, etc)
- status (scheduled, completed, cancelled)

**Notifications**
- id
- user_id
- type
- title
- message
- link
- read (boolean)
- created_at

### Säkerhet
- HTTPS
- CSRF protection
- Rate limiting
- Input sanitization
- File type validation
- Max file size limits
- Backup strategy

### Integration
- Email service (transactional emails)
- Calendar integration (Google Calendar, Outlook)
- Video meeting (Zoom, Google Meet)
- Payment gateway (Stripe för fakturering)
- Analytics (Google Analytics, Mixpanel)

---

## MVP vs Full Version

### MVP (Minimum Viable Product) - Fas 1

**Must-have för lansering:**
- ✅ Kundinbjudan via email
- ✅ Registrering & företagsinformation
- ✅ Dynamiskt formulär (hemsida/system)
- ✅ Admin tar emot förfrågningar
- ✅ Produktplan-upload
- ✅ Kund-godkännande
- ✅ Enkel dashboard för kund (se progress)
- ✅ Admin kan posta uppdateringar
- ✅ Ticket-system (basic)

### Future Features - Fas 2+

**Nice-to-have (lägg till senare):**
- Real-time chat mellan kund och admin
- Video-call direkt i portalen
- Mobil-app (native)
- AI-assisterad formulär (hjälpa kunden fylla i)
- Automatiska påminnelser
- Integration med projekthanteringsverktyg (Jira, Trello)
- Time tracking för admin
- Fakturering direkt i systemet
- Multi-language support
- White-label för partners
- Public portfolio (showcase projekten)

---

## User Stories

### Som Kund vill jag:
1. Få en enkel inbjudan och förstå nästa steg
2. Kunna fylla i mina behov i mitt tempo (spara och fortsätta senare)
3. Se tydligt vad som händer med mitt projekt
4. Kunna ställa frågor och få snabb support
5. Följa utvecklingen utan att behöva fråga
6. Se förhandsvisningar av arbetet
7. Ha tillgång till alla filer och dokument på ett ställe

### Som Admin vill jag:
8. Snabbt få översikt över nya förfrågningar
9. Enkelt skapa produktplaner
10. Uppdatera kunder med minimal friktion
11. Hantera tickets effektivt
12. Se all kundhistorik på ett ställe
13. Kunna tilldela uppgifter till teammedlemmar
14. Mäta kundnöjdhet

---

## Success Metrics

**KPIs att mäta:**
- Time to first response (admin → kund)
- Customer satisfaction score (efter projektslut)
- Antal tickets per projekt
- Genomsnittlig projekttid
- Andel projekt som levereras i tid
- Andel godkända produktplaner utan revideringar
- Kundretention (nya projekt från samma kund)

---

## Wireframes & Mockups (beskrivning)

### Kundportal Dashboard
```
┌─────────────────────────────────────────────┐
│  [Logo]           Mitt Projekt    [Profil]  │
├─────────────────────────────────────────────┤
│                                              │
│  Projektstatus: 60% klart                    │
│  [████████████░░░░░░░░░░░]                  │
│  Fas 2: Utveckling | Vecka 4 av 8           │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │ Timeline                            │    │
│  │ ✅ Kick-off (2024-01-15)           │    │
│  │ ✅ Design godkänd                   │    │
│  │ 🔵 Frontend (pågår)                │    │
│  │ ⚪ Backend                          │    │
│  │ ⚪ Test & QA                       │    │
│  │ ⚪ Lansering (2024-03-15)          │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │ Senaste uppdateringar               │    │
│  │                                      │    │
│  │ 📝 Header och nav färdigt           │    │
│  │    [Se förhandsvisning] 2h sedan    │    │
│  │                                      │    │
│  │ 🎨 Design-filer uppladdade          │    │
│  │    [Ladda ner PDF] 2 dagar sedan    │    │
│  │                                      │    │
│  │ [Visa alla uppdateringar]           │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  [Behöver hjälp? Skapa ett ärende]          │
│                                              │
└─────────────────────────────────────────────┘
```

### Admin Dashboard
```
┌─────────────────────────────────────────────┐
│  [Logo] Siteflow Admin           [Profil]   │
├─────────────────────────────────────────────┤
│  Nya förfrågningar (3)                       │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 🟡 Acme AB | Hemsida                │   │
│  │    Kontakt: Anna Andersson           │   │
│  │    Mottaget: 2024-02-12              │   │
│  │    [Visa detaljer] [Skapa plan]     │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 🔵 Tech Solutions | System           │   │
│  │    Väntar på godkännande             │   │
│  │    [Visa plan]                       │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Pågående projekt (5)                        │
│  Avslutade projekt (12)                      │
│  Öppna tickets (8)                           │
│                                              │
└─────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Fas 1: MVP (8-10 veckor)
**Vecka 1-2: Setup & Infrastructure**
- Projektstruktur
- Databas-setup
- Authentication system
- Basic UI framework

**Vecka 3-4: Onboarding Flow**
- Email-inbjudan system
- Registreringsformulär
- Företagsinformation
- Projekttyp-val

**Vecka 5-6: Dynamiska Formulär**
- Form builder
- Hemsida-formulär
- System-formulär
- Filuppladdning (logotyp, etc)
- Färgväljare

**Vecka 7-8: Admin-funktioner**
- Admin dashboard
- Se förfrågningar
- Produktplan-mall & upload
- Godkännandeflöde

**Vecka 9-10: Kund-dashboard & Tickets**
- Basic kundportal
- Projektstatus-vy
- Timeline
- Simple ticket-system
- Testing & bug fixes

### Fas 2: Förbättringar (4-6 veckor)
- Real-time uppdateringar
- Fildelning
- Möteskalender
- Förbättrad notifikationssystem
- Preview/staging-länkar
- Kommentarer på uppdateringar

### Fas 3: Avancerade Features (4-6 veckor)
- Real-time chat
- Video-integration
- Analytics & rapportering
- Fakturering
- Mobile-optimering
- Performance-optimeringar

---

Detta är den kompletta specifikationen för Siteflow Customer Portal! 🚀
