# Customer Portal - Implementation Status

Denna fil jämför [customer-portal-spec.md](customer-portal-spec.md) mot den nuvarande implementationen och visar vad som är implementerat, vad som saknas, och vad som har lagts till utöver specen.

**Datum:** 2025-11-27

> **📋 Se [next-steps-plan.md](next-steps-plan.md) för detaljerad implementationsplan med prioriteringar, tidsestimat och kodexempel.**

## 👥 Arbetsfördelning

**🤖 AI/RAG-system** - Planerat för implementation:
- Automatisk dokumentgenerering från formulärsvar
- Vector database (pgvector) för semantic search
- RAG chat för admin/dev med projektinsikt
- Manuell kunskapshantering via AI

**🔔 Arian** - Ansvarar för notifikationer, events, och kommunikationssystem:
- Email-integration (SendGrid/AWS SES)
- In-app notifications
- Real-time updates/feed-system
- Template interpolation
- Delivery tracking
- User preferences
- Multi-transport (Email, Discord, Slack, SMS, webhooks)

**Övriga** - Applikationslogik, formulär, UI-komponenter

---

## 📊 Övergripande Status

### Implementationsstadium
- **Fas:** MVP+ (mer än MVP, men inte alla "future features")
- **Backend:** ~95% komplett (CRUD, autentisering, FormResponse, RAG/AI services, Onboarding, ProductPlan, Milestones, Meetings)
- **Frontend:** ~80% komplett (dashboards, formulär, dynamiska projektformulär, onboarding, produktplan, RAG chat, timeline)
- **Integration:** ~85% komplett (RPC-anrop fungerar, RAG streaming implementerat, men filuppladdning och notifikationer saknas)
- **AI/RAG:** ✅ KLART (Backend + Frontend med streaming chat och dokumenthantering)

---

## ✅ Implementerat (Finns i koden)

### Backend - Databas & Resurser

#### ✅ Användarsystem (Users)
- [x] User-resurs med email, password, first_name, last_name, phone
- [x] Rollbaserat system: `siteflow_admin`, `siteflow_kam`, `siteflow_pl`, `siteflow_dev_frontend`, `siteflow_dev_backend`, `siteflow_dev_fullstack`, `customer`, `partner`
- [x] JWT-autentisering med token-hantering
- [x] PBKDF2 password hashing (Windows-kompatibel)
- [x] Registration, sign-in, sign-out endpoints
- [x] Bearer token för API-anrop

#### ✅ Företagsinformation (Companies)
- [x] Company-resurs med name, org_number, address, city, postal_code, country, phone, website
- [x] Relation till Users (company_id foreign key)
- [x] Rollbaserad access control
- [x] Unique constraint på org_number

#### ✅ Projekt (Projects)
- [x] Project-resurs med name, description, budget, start_date, target_end_date
- [x] State machine: draft → pending_approval → in_progress → completed (+ on_hold, cancelled)
- [x] Godkännandeflöde (approve/reject actions)
- [x] Timestamps för approved_at, actual_end_date
- [x] Budget tracking (budget, spent)
- [x] Relation till Companies

#### ✅ Tickets (Support/Ärendesystem)
- [x] Ticket-resurs med title, description, priority, category
- [x] State machine: open → in_progress → in_review → resolved → closed
- [x] Tilldelning av tickets (assignee_id)
- [x] Reporter tracking (reporter_id)
- [x] Relation till Project

#### ✅ Kommentarer (Comments)
- [x] Comment-resurs för tickets
- [x] Body text, author, timestamps
- [x] `is_internal` flagga för interna anteckningar
- [x] Relation till Ticket och User (author)

#### ✅ Tidsrapportering (TimeEntries)
- [x] TimeEntry-resurs med hours, date, description
- [x] Hourly rate och is_billable
- [x] Relation till Project, Ticket (optional), och User

#### ✅ Dokumenthantering (Documents)
- [x] Document-resurs med name, description, file_path
- [x] File metadata: file_size, mime_type
- [x] Category-tagging
- [x] Relation till Project och uploaded_by User
- [x] Destroy-action för att ta bort dokument

#### ✅ Inbjudningar (Invitations)
- [x] Invitation-resurs med email, token, role, expires_at
- [x] Accept/cancel actions
- [x] Token-generering (secure random 32 bytes)
- [x] Relation till Company, invited_by, accepted_by
- [x] Unique constraint på pending invitations per company

#### ✅ Formulärsvar (FormResponse)
- [x] FormResponse-resurs för att lagra dynamiska formulärsvar
- [x] Stöd för form_type (website, system, both)
- [x] JSON-lagring av responses och form_data
- [x] Section tracking för delvis ifyllda formulär
- [x] State machine: draft → submitted → reviewed
- [x] Relation till Project
- [x] RPC actions: by_project, by_project_and_type, by_section, create, update

#### ✅ Interna Anteckningar (InternalNote)
- [x] InternalNote-resurs för staff-only anteckningar
- [x] Policys: endast Siteflow-personal kan läsa/skriva (kunder har inte åtkomst)
- [x] Relation till Project och User (author)
- [x] RPC actions: read, by_project, create, update, destroy

#### ✅ Projekt-prioritet
- [x] `is_priority` boolean på Project
- [x] `toggle_priority` och `set_priority` actions
- [x] Sorterar prioriterade projekt först i AdminFormResponseView

### Frontend - Komponenter

#### ✅ Autentisering
- [x] LoginPage.tsx med email/password
- [x] AuthContext med login, logout, getAuthHeaders
- [x] JWT token i localStorage
- [x] User context med role

#### ✅ Dashboards (Rollbaserade)
- [x] DashboardLayout.tsx (huvudlayout med navigation)
- [x] DashboardPage.tsx (router baserat på user role)
- [x] AdminDashboard.tsx - Full systemöversikt med ProjectSelector och ProjectOverview (2025-11-27)
- [x] CustomerDashboard.tsx - Kundens projektsida med ProjectSelector och ProjectOverview (2025-11-27)
- [x] DeveloperDashboard.tsx - Utvecklarens tickets och tidsrapportering
- [x] KAMDashboard.tsx - Key Account Manager-vy
- [x] ProjectLeaderDashboard.tsx - Projektledarvy med ProjectSelector och ProjectOverview (2025-11-27)
- [x] TimeTrackingDashboard.tsx - Tidsrapporteringsvy

#### ✅ Formulär
- [x] CreateProjectForm.tsx - Skapa nya projekt
- [x] CreateTicketForm.tsx - Skapa support tickets
- [x] CreateTimeEntryForm.tsx - Rapportera tid
- [x] InviteUserForm.tsx - Bjuda in användare till company
- [x] UploadDocumentForm.tsx - Ladda upp dokument till projekt
- [x] DynamicProjectForm.tsx - Dynamiskt multi-step projektformulär
- [x] ProjectQuestionnaire.tsx - Wrapper som integrerar formulär med backend

#### ✅ Shared Components
- [x] Modal.tsx - Återanvändbar modal-komponent
- [x] DocumentList.tsx - Lista och hantera dokument
- [x] ProjectSelector.tsx - Projektväljare med dropdown, localStorage, och i18n (2025-11-27)
- [x] ProjectOverview.tsx - Tab-baserad vy för Timeline och Möten (2025-11-27)

#### ✅ Form Schema & Configuration
- [x] src/config/formSchema.ts - TypeScript types och scheman för formulär
- [x] websiteFormSchema - 8 sektioner, 24 frågor för hemsideprojekt
- [x] systemFormSchema - 9 sektioner, 31 frågor för systemprojekt
- [x] Fälttyper: text, textarea, select, multiselect, checkbox, radio, file, number, email, url, date
- [x] Conditional fields (visa fält baserat på andra svar)
- [x] Validering per fält (required, min, max, pattern)
- [x] i18n-stöd för svenska och engelska (locales/sv.json, locales/en.json)

#### ✅ API Integration
- [x] useApi hook i src/hooks/useApi.ts för RPC-anrop
- [x] Automatiska auth headers
- [x] TypeScript types från Ash-backend (genererade)
- [x] RPC endpoints: /api/rpc/run, /api/rpc/validate

### API Routes

#### ✅ Public Endpoints
- [x] GET /api/health - Health check
- [x] POST /api/auth/register
- [x] POST /api/auth/sign-in
- [x] DELETE /api/auth/sign-out
- [x] GET /api/onboarding/validate/:token - Validera invitation token (2025-11-27)
- [x] POST /api/onboarding/register - Registrera via invitation (2025-11-27)

#### ✅ Protected Endpoints
- [x] POST /api/rpc/run - Execute RPC actions
- [x] POST /api/rpc/validate - Validate RPC actions
- [x] /api/accounts/* - Accounts domain JSON API
- [x] /api/portal/* - Portal domain JSON API

#### ✅ RPC Actions (tillagda 2025-11-27)
ProductPlan:
- [x] product_plan_read, product_plan_by_project, product_plan_active_by_project
- [x] product_plan_pending_approval, product_plan_needing_revision
- [x] product_plan_create, product_plan_update, product_plan_destroy
- [x] product_plan_send_to_customer, product_plan_mark_viewed
- [x] product_plan_approve, product_plan_request_changes, product_plan_revise, product_plan_archive

### DevOps & Setup
- [x] PowerShell scripts för Windows development
- [x] PostgreSQL databas med Ecto migrations
- [x] AshTypescript codegen för TypeScript types
- [x] Vitest testing setup
- [x] Vite dev server med API proxy
- [x] Seeds-fil för sample data

---

## ❌ Saknas (Specificerat men ej implementerat)

### Kundflöde från Spec

#### ❌ Steg 1: Email-inbjudan **[ARIAN]**
- [ ] **[ARIAN]** Email-sending funktionalitet 
- [ ] **[ARIAN]** Email-mallar för inbjudan
- [ ] **[ARIAN]** "Kom igång"-knapp i email som leder till registrering

#### ✅ Steg 2: Onboarding via Inbjudningslänk (KLART 2025-11-27)
**Kunder kan INTE registrera sig själva - de får en inbjudningslänk från Siteflow:**

**Steg 2a: Företagsinformation - KLART**
- [x] Registreringsflöde via invitation token (enda sättet att komma in)
- [x] OnboardingService + OnboardingController implementerat
- [x] API: `GET /api/onboarding/validate/:token` - Validera token
- [x] API: `POST /api/onboarding/register` - Registrera användare + företag
- [x] Företagsnamn (obligatoriskt)
- [x] Kontaktperson: för- och efternamn (obligatoriskt)
- [x] Email (obligatoriskt)
- [x] Telefonnummer (obligatoriskt)
- [x] Organisationsnummer (VALFRITT - nullable för utländska kunder, validering för 10 siffror om angivet)
- [x] Antal anställda (employee_count fält)
- [x] Bransch (industry fält)
- [x] Företagets webbplats (website fält)
- [x] Lösenord (via register_with_password action)
- [x] Logotyp-URL (logo_url fält)
- [x] Faktureringsadress (billing_address, billing_city, billing_postal_code, billing_country)
- [x] **Frontend UI: OnboardingPage.tsx** (multi-step wizard med token validation)

**Steg 2b: RAG-indexering (bakgrund)**
- [x] När företagsinfo är klart → Logger meddelar att RAG indexeras vid första projektet
- [ ] Faktisk RAG-indexering av företagsinfo (triggas vid projekt-skapande)

**Status:** ✅ KLART! Både backend och frontend implementerat.

#### ✅ Steg 3: Dynamiska Projektformulär
**IMPLEMENTERAT!**

**A. Hemsida-formulär (24 frågor - KLART):**
- [x] Grundläggande information (befintlig hemsida, huvudsyfte, målgrupper)
- [x] Funktioner & innehåll (sidor, funktioner, antal sidor)
- [x] Design & varumärke (logotyp-upload, färgpalett-väljare, designinspiration)
- [x] Innehåll & bilder (textfrågor, bilder/foto-behov, video-behov)
- [x] Tekniska krav (responsiv, prestanda, tillgänglighet, hosting/domän)
- [x] SEO & marknadsföring
- [x] Budget & timeline (budget-ranges, deadline-val)
- [x] Övrigt (fritextfält)

**B. System/Applikation-formulär (31 frågor - KLART):**
- [x] Grundläggande information (befintligt system, huvudsyfte, beskrivning)
- [x] Funktioner & features (huvudfunktioner, user flows, integrationer)
- [x] Datahantering (datatyp, GDPR, import/export)
- [x] UI & Design (logotyp, färgpalett, designpreferenser, wireframes)
- [x] Tekniska krav & säkerhet (tech stack, säkerhetskrav, prestanda, backup)
- [x] Admin & underhåll (admin-gränssnitt, utbildning, dokumentation)
- [x] Budget & timeline (budget-ranges, MVP vs full version)
- [x] Support & underhåll
- [x] Övrigt (utmaningar, success metrics)

**C. "Båda"-alternativet:**
- [x] Kombinerat formulär (välj "both" för att visa båda formulären)

**Status:** DynamicProjectForm.tsx implementerat med multi-step wizard, progress bar, och spara-utkast funktionalitet.

#### ✅ Steg 4: Granska & Skicka in
- [x] Sammanfattningsvy av alla formulärsvar
- [x] Möjlighet att redigera varje sektion (klicka "Redigera" för att gå tillbaka)
- [x] Bekräftelsemeddelande efter inlämning (visar nästa steg och referensnummer)
- [ ] **[ARIAN]** Email till kunden: "Vi har tagit emot din förfrågan"
- [ ] **[ARIAN]** Notifikation till Admin

### Admin-funktioner

#### ✅ Admin - Visa Förfrågan (IMPLEMENTERAT)
- [x] Strukturerad vy av alla formulärsvar (AdminFormResponseView.tsx)
- [x] Visa uppladdade filer med Google Drive-liknande UI (AdminFileBrowser.tsx):
  - [x] Mapp-struktur: Företag → Projekt → Kategori
  - [x] Grid och list-vy toggle
  - [x] Sortering (namn, datum, storlek, kategori)
  - [x] Filtrering och sökning
  - [x] Förhandsgranskning av bilder och PDF
  - [x] Fil-ikoner baserade på filtyp
  - [x] Breadcrumb-navigering
- [x] Admin-åtgärder:
  - [ ] **[ARIAN]** Kontakta kunden (skicka meddelande/email direkt från portalen)
  - [x] Markera som prioritet (is_priority på Project, toggle-knapp i AdminFormResponseView)
  - [x] Lägg till interna anteckningar (InternalNote-resurs, visas i detail-modal)

#### ✅ Produktplan-funktionalitet (KLART 2025-11-27)
- [x] ProductPlan-resurs i databasen
- [x] Admin kan skapa produktplan (create action)
- [x] Ladda upp produktplan som PDF (pdf_url fält)
- [x] Markdown-innehåll (content fält)
- [x] Kund-godkännandeflöde (approve/request_changes actions)
- [x] Kund kan godkänna eller begära ändringar
- [x] Versionshantering vid revision
- [x] State machine: draft → sent → viewed → approved/changes_requested → revised → archived
- [ ] **[ARIAN]** Email-notifikation till kund när produktplan är klar
- [x] **Frontend UI: ProductPlanManagement.tsx** (admin interface med markdown editor)
- [x] **Frontend UI: ProductPlanCustomerView.tsx** (kund godkännande/ändringar)
- [x] **Frontend hooks i useApi.ts** (10 hooks för ProductPlan CRUD)

**Status:** ✅ KLART! Både backend och frontend implementerat.

### Kundportal - Dashboard-funktioner som saknas

#### ❌ Projektstatus-översikt
**Specen visar rich UI som saknas:**
- [ ] Progress bar (visuell "X% klart")
- [ ] Aktuell fas (t.ex. "Fas 2 - Utveckling, vecka 4 av 8")
- [ ] Nästa milstolpe-info

**Status:** CustomerDashboard visar projekt, men inte i detta format.

#### ✅ Timeline-vy (KLART 2025-11-27)
- [x] **Backend: Milestone-resurs** med title, description, due_date, completed_at, order_index, status
- [x] **Migration:** 20251127000000_add_milestones.exs
- [x] **RPC actions:** milestone_read, milestone_by_project, milestone_create, milestone_update, milestone_mark_completed, milestone_reopen, milestone_destroy
- [x] **Frontend hooks:** 6 hooks i useApi.ts för Milestone CRUD
- [x] **Frontend UI: ProjectTimeline.tsx** med:
  - [x] Visuell tidslinje med milstolpar och progress bar
  - [x] ✅ Avklarade milstolpar (grön bock med CheckCircle)
  - [x] 🔵 Pågående aktivitet (Clock icon, blå)
  - [x] ⚪ Väntande milstolpar (Circle icon, grå)
  - [x] Timeline connector mellan milstolpar
  - [x] Interaktiv vy med create/edit/delete/toggle complete
  - [x] Översenad milstolpe-detektion
  - [x] Projektframsteg-procenträknare

**Status:** ✅ KLART! Timeline med milstolpar implementerat.

#### ❌ Senaste uppdateringar (Feed) **[ARIAN]**
**Specen beskriver ett feed-system:**
- [ ] **[ARIAN]** Updates-resurs i databasen (finns ej!)
- [ ] **[ARIAN]** Admin lägger till uppdateringar med titel, meddelande, typ
- [ ] **[ARIAN]** Kunden ser alla uppdateringar i kronologisk ordning
- [ ] Kunden kan kommentera på uppdateringar
- [ ] Gilla/reagera på uppdateringar
- [ ] **[ARIAN]** Email-notifikationer för nya uppdateringar
- [ ] **[ARIAN]** Real-time broadcasting av uppdateringar via Phoenix Channels

**Status:** Ingen updates/feed-funktionalitet.

#### ❌ Filer & Dokument
**Delvis implementerat, men saknar:**
- [ ] Fil-upload från frontend (UploadDocumentForm finns men ingen faktisk filuppladdning till S3/storage)
- [ ] Versionshistorik för filer
- [ ] Kategoriserad mappstruktur (Design, Wireframes, Meeting notes, etc.)

**Status:** Document-resursen finns i backend, men ingen verklig filuppladdning.

#### ❌ Preview/Staging-länk
- [ ] Staging-länk till preview-miljö
- [ ] "Se förhandsvisning"-knapp
- [ ] Möjlighet att rapportera buggar direkt från preview

**Status:** Ingen preview-funktionalitet.

#### ✅ Möten & Kalender (KLART 2025-11-27)
- [x] **Backend: Meeting-resurs** med title, description, meeting_type, scheduled_at, duration_minutes, location, meeting_url, notes, action_items, attendees, status
- [x] **Migration:** 20251127010000_add_meetings.exs
- [x] **Meeting types:** kickoff, status_update, review, planning, retrospective, other
- [x] **Status states:** scheduled, in_progress, completed, cancelled
- [x] **RPC actions:** meeting_read, meeting_by_project, meeting_upcoming_by_project, meeting_create, meeting_update, meeting_start, meeting_complete, meeting_cancel, meeting_destroy
- [x] **Frontend hooks:** 7 hooks i useApi.ts för Meeting CRUD
- [x] **Frontend UI: ProjectMeetings.tsx** - Google Calendar-liknande månadsvy med:
  - [x] Interaktiv kalendervy med navigation (föregående/nästa månad, idag-knapp)
  - [x] Färgkodade möten per typ (kickoff=lila, status=blå, review=grön, planning=orange, retro=rosa, other=grå)
  - [x] Klicka på dag för att skapa möte
  - [x] Klicka på möte för att se detaljer i modal
  - [x] Create/edit modal med alla fält (titel, typ, datum/tid, längd, plats, mötes-länk, deltagare, anteckningar)
  - [x] Statushantering: Starta/avsluta/ställa in möten
  - [x] Mötesdetaljer med action items och anteckningar
- [ ] **[ARIAN]** Kalenderintegration (Google Calendar, Outlook)
- [ ] **[ARIAN]** Påminnelser 24h innan möte (delayed delivery)

**Status:** ✅ KLART! Komplett Google Calendar-liknande UI implementerad.

#### ❌ Team-information
- [ ] Visa projektteam med namn, roller, kontaktinfo
- [ ] Projektledare, Designer, Utvecklare, QA

**Status:** Ingen team-vy.

### Ticket-system - Saknade funktioner

**Ticket-resursen finns, men saknar:**
- [ ] Rich text editor för beskrivningar
- [ ] Bifoga filer/screenshots till tickets
- [ ] Chatt-liknande konversationsvy (specen visar chat-format)
- [ ] **[ARIAN]** Email-notifikationer vid ticket-svar
- [ ] **[ARIAN]** Real-time notifications för nya ticket-kommentarer
- [ ] SLA-timers (t.ex. "Hög prioritet måste besvaras inom 2h")
- [ ] Merge/länka relaterade tickets

**Status:** Grundläggande ticket CRUD finns, men inte den avancerade funktionaliteten.

### Admin - Uppdatera projektstatus

#### ❌ Enkel uppdaterings-vy
- [ ] Snabb-uppdateringsformulär för admin
- [ ] Typ av uppdatering (dropdown): Statusmeddelande, Milstolpe, Fil, Möte, Demo
- [ ] Rich text editor för meddelande
- [ ] Bifoga filer direkt
- [ ] **[ARIAN]** "Skicka email-notifikation till kunden"-checkbox
- [ ] **[ARIAN]** Trigger notification event när uppdatering skapas

**Status:** Ingen dedikerad uppdateringsvy.

#### ❌ Timeline-editor
- [ ] Drag-and-drop för milstolpar
- [ ] Visuell uppdatering av timeline

**Status:** Ingen timeline-editor.

#### ❌ Progress-uppdatering
- [ ] Slider för progress (0-100%)
- [ ] Fas-uppdatering (manuell eller automatisk)

**Status:** Ingen progress-tracking UI.

### Notifikationer **[ARIAN - HELA SEKTIONEN]**

#### ❌ Email-notifikationer **[ARIAN]**
**Hela email-systemet saknas:**
- [ ] **[ARIAN]** Integration med email-service (SendGrid, AWS SES, etc.)
- [ ] **[ARIAN]** Transactional emails:
  - [ ] **[ARIAN]** Produktplan uppladdad
  - [ ] **[ARIAN]** Ny status-uppdatering
  - [ ] **[ARIAN]** Milstolpe slutförd
  - [ ] **[ARIAN]** Ny fil uppladdad
  - [ ] **[ARIAN]** Ticket-svar
  - [ ] **[ARIAN]** Kommande möte (påminnelse 24h innan) - delayed delivery
- [ ] **[ARIAN]** Notification-resurs i databasen (finns ej!)
- [ ] **[ARIAN]** Email-preferenser (kunden kan välja vilka notiser de vill ha) - user preferences
- [ ] **[ARIAN]** Template interpolation för dynamiskt innehåll ({{variable}} syntax)
- [ ] **[ARIAN]** Delivery tracking med audit trail
- [ ] **[ARIAN]** Automatic retries med exponential backoff

**Status:** Ingen email-funktionalitet alls.

#### ❌ In-App Notifikationer **[ARIAN]**
- [ ] **[ARIAN]** Notification-resurs för in-app notifications
- [ ] **[ARIAN]** Notification bell med counter i header
- [ ] **[ARIAN]** Real-time counter updates via Phoenix Channels
- [ ] **[ARIAN]** Mark as read/unread functionality
- [ ] **[ARIAN]** Notification dropdown med senaste notifications

**Status:** Ingen in-app notification-funktionalitet.

#### ❌ Push-notifikationer **[ARIAN]**
- [ ] **[ARIAN]** PWA-setup för push notifications
- [ ] **[ARIAN]** Web push notifications
- [ ] **[ARIAN]** Multi-transport support (Email, SMS, Discord, Slack, Webhooks)

**Status:** Ingen push-funktionalitet.

### Avslutning av projekt

#### ❌ Projekt-avslut
- [ ] Admin markerar projekt som "Levererat"
- [ ] **[ARIAN]** Email: "Grattis! Ditt projekt är klart"
- [ ] Konfetti-animation i portalen
- [ ] "Ditt projekt är nu live!"-meddelande
- [ ] Länk till färdig hemsida/system
- [ ] Formulär: "Hur nöjd är du? Betygsätt projektet"

**Status:** Ingen avsluts-funktionalitet.

#### ❌ Post-projekt vy
- [ ] Support-period countdown ("Du har support till [datum]")
- [ ] Förnya support-länk
- [ ] Boka nya projekt
- [ ] Begära utbyggnad/nya features

**Status:** Ingen post-projekt vy.

### Säkerhet & Integration

#### ❌ Saknade integrationer
- [ ] **[ARIAN]** Email-service (SendGrid, AWS SES)
- [ ] **[ARIAN]** SMS-service (för SMS notifications)
- [ ] **[ARIAN]** Discord webhook integration
- [ ] **[ARIAN]** Slack webhook integration
- [ ] File storage (AWS S3 eller liknande)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Video meeting (Zoom, Google Meet)
- [ ] Payment gateway (Stripe för fakturering)
- [ ] Analytics (Google Analytics, Mixpanel)

#### ❌ Säkerhetsfunktioner
- [ ] Rate limiting
- [ ] File type validation
- [ ] Max file size limits
- [ ] Backup strategy

**Status:** Grundläggande CSRF/HTTPS finns, men inte dessa avancerade features.

---

## 🆕 Tillagt utöver spec (Ej i originaldokumentet)

### Extra roller
- [x] `siteflow_dev_frontend` - Frontend-utvecklare
- [x] `siteflow_dev_backend` - Backend-utvecklare
- [x] `siteflow_dev_fullstack` - Fullstack-utvecklare
- [x] `partner` - Partner-användare

**Spec hade bara:** Admin, KAM, PL, Developer (generisk)

### Extra dashboards
- [x] TimeTrackingDashboard.tsx - Separat dashboard för tidsrapportering
- [x] DeveloperDashboard.tsx - Specialiserad dashboard för utvecklare

**Spec nämnde inte separata dashboards per role utöver Admin/Kund.**

### Extra fält i Project
- [x] `spent` - Spåra hur mycket som spenderats (budget tracking)
- [x] `cancellation_reason` - Varför projekt avbröts

### Extra fält i Company
- [x] `is_active` - Flagga för att deaktivera företag

### Testing Infrastructure
- [x] Vitest setup med React Testing Library
- [x] Test-filer för komponenter (AdminDashboard.test.tsx, LoginPage.test.tsx, etc.)
- [x] Mock Service Worker (MSW) för API-mocking
- [x] **330 tester passerar** (22 test-filer) - Uppdaterat 2025-11-27
- [x] Tester för DynamicProjectForm och formSchema
- [x] Tester för alla formulärkomponenter
- [x] Tester för ProjectSelector och ProjectOverview (2025-11-27)
- [x] Integration tests för dashboards med ProjectSelector/ProjectOverview (2025-11-27)

**Spec nämnde inte testing explicit.**

### Development Scripts
- [x] Omfattande PowerShell-script för Windows-utveckling
- [x] migrate_and_restart.ps1, run_seeds.ps1, check_users.ps1, test-rpc.ps1

### TypeScript RPC Integration
- [x] AshTypescript för automatisk type-generering
- [x] `typescript_rpc?` flagga i resources
- [x] useApi hook för type-safe RPC calls

**Detta är en teknisk implementation-detalj som inte nämndes i spec.**

---

## 📋 MVP Status - Jämförelse mot Spec

Specen definierar ett MVP (Fas 1) med följande krav:

### MVP Must-haves (från spec)

| Feature | Status | Kommentar |
|---------|--------|-----------|
| ✅ Kundinbjudan via email | ⚠️ Delvis | Invitation-resurs finns, OnboardingService + frontend KLART, men email-sending saknas [ARIAN] |
| ✅ Registrering & företagsinformation | ✅ Ja | OnboardingService + OnboardingPage.tsx med multi-step wizard (2025-11-27) |
| ✅ Dynamiskt formulär (hemsida/system) | ✅ Ja | DynamicProjectForm med 24+31 frågor, FormResponse backend |
| ✅ Admin tar emot förfrågningar | ✅ Ja | AdminFormResponseView, formulärsvar lagras i FormResponse, admin kan se allt |
| ✅ Produktplan-upload | ✅ Ja | ProductPlan-resurs + ProductPlanManagement.tsx (2025-11-27) |
| ✅ Kund-godkännande | ✅ Ja | ProductPlanCustomerView.tsx med approve/request_changes (2025-11-27) |
| ✅ Enkel dashboard för kund | ✅ Ja | CustomerDashboard + ProjectTimeline med progress tracking (2025-11-27) |
| ✅ Admin kan posta uppdateringar | ❌ Saknas | Ingen Updates-resurs eller feed [ARIAN] |
| ✅ Ticket-system (basic) | ✅ Ja | Fungerar med CRUD och state machine |

**MVP-score: 7/9 komplett, 1/9 delvis, 1/9 saknas**

---

## 🎯 Prioriterad TODO-lista

Baserat på spec och vad som saknas, här är vad som bör implementeras härnäst:

### 🔴 Kritiskt (MVP blockers)
1. ~~**Dynamiska projektformulär**~~ ✅ **KLART!**
   - ~~Hemsida-formulär (24 frågor)~~ ✅
   - ~~System-formulär (31 frågor)~~ ✅
   - ~~FormResponse-resurs för att lagra svar~~ ✅
   - ~~JSON schema för dynamiska formulär~~ ✅
   - ~~översättning~~ ✅ (svenska och engelska)

2. ~~**Produktplan-system**~~ ✅ **KLART! (2025-11-27)**
   - ~~ProductPlan-resurs i backend~~ ✅
   - ~~Admin kan skapa/ladda upp produktplan~~ ✅
   - ~~Kund kan godkänna/begära ändringar~~ ✅
   - ~~Frontend UI för produktplan (admin + kund)~~ ✅

3. **Email-integration** **[ARIAN]**
   - **[ARIAN]** SendGrid eller AWS SES setup
   - **[ARIAN]** Email-mallar (inbjudan, notifikationer)
   - **[ARIAN]** Transactional emails
   - **[ARIAN]** Template system med interpolation
   - **[ARIAN]** Delivery tracking och retries

4. ~~**Onboarding-flow**~~ ✅ **KLART! (2025-11-27)**
   - ~~Invitation token är enda sättet in~~ ✅
   - ~~OnboardingService + OnboardingController~~ ✅
   - ~~Company-resurs utökad med onboarding-fält~~ ✅
   - ~~org.nr valfritt för utländska kunder~~ ✅
   - ~~Frontend onboarding-formulär~~ ✅ (OnboardingPage.tsx med multi-step wizard)
   - **[ARIAN]** "Kom igång"-email med inbjudningslänk

### 🟡 Högt prioriterade (Förbättrar UX)
5. ~~**🤖 RAG/AI-system**~~ ✅ **KLART! (2025-11-27)**
   - ~~Vector database (pgvector/float[] fallback) för embeddings~~ ✅
   - ~~Automatisk dokumentgenerering från formulärsvar~~ ✅ (DocumentGenerator)
   - ~~Streaming RAG-chat för admin/dev~~ ✅ (RAGService + RAGController)
   - ~~Oban workers för bakgrundsjobb~~ ✅
   - ~~Access control: Admin + staff med `can_use_ai_chat`~~ ✅
   - ~~Frontend RAG chat UI~~ ✅ (RAGChatPanel.tsx med streaming)
   - ~~Frontend GeneratedDocuments viewer~~ ✅ (GeneratedDocuments.tsx)

6. **Updates/Feed-system** **[ARIAN]**
   - **[ARIAN]** Updates-resurs i backend
   - **[ARIAN]** Admin kan posta uppdateringar
   - **[ARIAN]** Feed-vy för kund
   - **[ARIAN]** Email-notifikationer för nya uppdateringar
   - **[ARIAN]** Real-time broadcasting via Phoenix Channels

7. ~~**Timeline & Progress tracking**~~ ✅ **KLART! (2025-11-27)**
   - ~~Milestones/Phases-modell~~ ✅ (Milestone-resurs med status)
   - ~~Timeline-komponent (visuell)~~ ✅ (ProjectTimeline.tsx)
   - ~~Progress bar med fas-info~~ ✅ (Projektframsteg-procenträknare)

8. **Filuppladdning**
   - AWS S3 eller liknande storage
   - Faktisk filuppladdning från UploadDocumentForm
   - Versionshistorik
   - **[ARIAN]** Notification när ny fil laddas upp

9. **Ticket-förbättringar**
   **[ARIAN]**  Rich text editor
   - Bifoga filer till tickets
   - Chat-liknande konversationsvy
   - **[ARIAN]** Email-notifikationer vid ticket-svar
   - **[ARIAN]** Real-time notification för nya kommentarer

### 🟢 Medel prioritet (Nice to have)
10. ~~**Möteshantering**~~ ✅ **KLART! (2025-11-27)**
    - ~~Meetings-resurs~~ ✅ (Meeting-resurs med full state machine)
    - ~~RPC actions och hooks~~ ✅ (7 hooks i useApi.ts)
    - ~~Frontend UI (ProjectMeetings.tsx)~~ ✅ (Google Calendar-liknande månadsvy)
    - [ ] **[ARIAN]** Kalenderintegration (Google Calendar, Outlook)
    - [ ] **[ARIAN]** Påminnelser 24h innan (delayed delivery)

11. **Team-information**
    - Team-vy i projektet
    - Visa vem som jobbar på projektet

12. **Notification-system** **[ARIAN - HELA]**
    - **[ARIAN]** Notification-resurs
    - **[ARIAN]** In-app notifications med bell icon
    - **[ARIAN]** Notification preferences (user väljer vilka notiser de vill ha)
    - **[ARIAN]** Real-time counters för unread notifications
    - **[ARIAN]** Notification history

13. **Projekt-avslut**
    - Levererat-status
    - Betygsättning
    - **[ARIAN]** "Grattis!"-email
    - Post-projekt support-tracking

### 🔵 Lågt prioritet (Future features från spec)
14. **[ARIAN]** Real-time chat mellan kund och admin (Phoenix Channels)
15. Video-call direkt i portalen
16. Mobil-app (native)
17. **[ARIAN]** Automatiska påminnelser (scheduled notifications)
18. **[ARIAN]** Integration med projekthanteringsverktyg (Jira, Trello) - webhooks
19. Time tracking för admin
20. Fakturering direkt i systemet
21. Multi-language support
22. White-label för partners
23. Public portfolio (showcase projekt)

---

## 📈 Rekommendation

För att uppnå **MVP enligt spec**, fokusera på:

1. ~~**Dynamiska formulär**~~ ✅ KLART - Kärnan i specen
2. ~~**Produktplan-system**~~ ✅ KLART - Både backend och frontend implementerat
3. **Email-integration [ARIAN]** - Kritiskt för kommunikation
4. ~~**Onboarding-flow**~~ ✅ KLART - Både backend och frontend implementerat
5. ~~**RAG/AI-system**~~ ✅ KLART - Både backend och frontend implementerat

**Implementerat denna session (2025-11-27):**
- ✅ OnboardingPage.tsx - Multi-step wizard med token validation
- ✅ ProductPlanManagement.tsx + ProductPlanCustomerView.tsx - Admin och kund-vyer
- ✅ RAGController - SSE streaming endpoints
- ✅ RAGChatPanel.tsx + GeneratedDocuments.tsx - Chat och dokument-hantering med streaming
- ✅ ProjectTimeline.tsx - Visuell timeline med milstolpar och progress tracking
- ✅ Meeting-resurs + hooks (backend + API integration)
- ✅ ProjectMeetings.tsx - Google Calendar-liknande månadsvy med färgkodning
- ✅ **Dashboard Integration (2025-11-27):**
  - ✅ ProjectSelector.tsx - Projektväljare med dropdown, localStorage-persistering, och i18n-stöd
  - ✅ ProjectOverview.tsx - Tab-baserad container för Timeline och Möten
  - ✅ Integration i CustomerDashboard, AdminDashboard, och ProjectLeaderDashboard
  - ✅ Component tests: ProjectSelector.test.tsx (13 test cases)
  - ✅ Component tests: ProjectOverview.test.tsx (11 test cases)
  - ✅ Integration tests: Uppdaterade CustomerDashboard.test.tsx med 6 nya test cases
  - ✅ Uppdaterade i18n-filer (locales/sv.json och locales/en.json)
  - ✅ **330 tester passerar (100% pass rate)**

**Nästa prioritet:**
- **[ARIAN]** Email-integration för notifikationer och kommunikation (kritiskt för MVP)
- **[ARIAN]** Updates/Feed-system för projektuppdateringar
- Filuppladdning till S3/storage

Nuvarande implementation har **mycket stark grund** - alla kritiska MVP-system är implementerade både backend och frontend!

---

## 🔔 Arian's Work Package - Notifikationer & Events

### Översikt
Arian ansvarar för hela notifikations- och event-systemet med följande features:
- 🎯 Automatic Dispatch - Events triggas automatiskt av resource actions
- 📬 Multi-Transport - Email, in-app, Discord, Slack, SMS, webhooks
- ⏰ Delayed Delivery - Schemalägg notifikationer för senare leverans
- 👤 User Preferences - Respektera användarens notifikationsinställningar
- 📊 Delivery Tracking - Full audit trail med delivery receipts
- 🔄 Automatic Retries - Misslyckade leveranser försöker igen med exponential backoff
- 🎨 Template Interpolation - {{variable}} syntax för dynamiskt innehåll
- 📈 Real-Time Counters - Deklarativ counter DSL med automatisk Phoenix Channel broadcasting
- ⚡ Zero-Config Helpers - ChannelState, CounterLoader, NotificationLoader för Phoenix integration

### Arian's Tasks (Prioriterade)

#### P0 - Kritiskt för MVP
1. **Email Transport Setup**
   - Integration med SendGrid/AWS SES
   - Email templates med interpolation
   - Delivery tracking och retries
   - Transactional emails: inbjudan, produktplan, uppdateringar

2. **Notification Resource**
   - Skapa Notification-resurs i Ash
   - In-app notifications
   - Mark as read/unread
   - Notification preferences

3. **Event System**
   - Automatic dispatch från resource actions (Project.approve, Ticket.create, etc.)
   - Event → Notification mapping
   - Template system

#### P1 - Högt prioriterat
4. **Updates/Feed System**
   - Updates-resurs
   - Real-time broadcasting via Phoenix Channels
   - Email notifications för nya uppdateringar
   - Counter för unread updates

5. **Real-time Features**
   - Phoenix Channel setup
   - Real-time counters för notifications
   - Live updates i UI

#### P2 - Nice to have
6. **Multi-Transport**
   - Discord webhooks
   - Slack webhooks
   - SMS (optional)

7. **Advanced Features**
   - Delayed delivery för påminnelser
   - Scheduled notifications
   - Notification history med filters

---

**Sammanfattning:**
- ✅ **KLART:** Backend-resurser, rollsystem, dashboards, formulär-komponenter, **dynamiska projektformulär**, **admin filhantering**, **interna anteckningar**, **prioritets-toggle**, **onboarding UI**, **produktplan UI**, **RAG chat UI**, **timeline/milestones**, **möten/kalender**, **dashboard integration med projektväljare**
- ✅ **Nytt (2025-11-27):**
  - Frontend: OnboardingPage.tsx, ProductPlanManagement + CustomerView, RAGChatPanel + GeneratedDocuments, ProjectTimeline, ProjectMeetings, **ProjectSelector + ProjectOverview**
  - Backend: RAGController med SSE streaming, Meeting-resurs, Milestone-resurs
  - Integration: 30 nya hooks i useApi.ts (23 för RAG/ProductPlan/Timeline, 7 för Meetings), useRAGChat custom hook
  - Dashboards: ProjectMeetings + ProjectTimeline integrerade via ProjectSelector och ProjectOverview i CustomerDashboard, AdminDashboard, och ProjectLeaderDashboard
  - Testing: **330 tester passerar (100%)** - 24 nya test cases för ProjectSelector, ProjectOverview, och dashboard integration
- ❌ **Saknas:** Email-integration, updates/feed-system, filuppladdning till S3
- 🔔 **Arian:** Hela notifikations- och event-systemet (email, in-app, real-time, multi-transport)

**Senaste framsteg (2025-11-27):**
- ✅ Implementerat DynamicProjectForm.tsx med multi-step wizard
- ✅ Skapat FormResponse Ash-resurs i backend
- ✅ Lagt till 55 frågor (24 hemsida + 31 system) med svenska/engelska översättningar
- ✅ Sammanfattningsvy med möjlighet att redigera sektioner
- ✅ Bekräftelsemeddelande med nästa steg och referensnummer
- ✅ AdminFormResponseView.tsx - Strukturerad vy av projektförfrågningar
- ✅ AdminFileBrowser.tsx - Google Drive-liknande filhantering:
  - Mapp-hierarki: Företag → Projekt → Kategori
  - Grid/List-vy toggle
  - Sortering och filtrering
  - Förhandsgranskning av bilder/PDF
  - Breadcrumb-navigering
- ✅ **Prioritets-toggle** - Markera projekt som prioriterade (is_priority på Project)
- ✅ **Interna anteckningar** - InternalNote-resurs för Siteflow-personal (dold för kunder)
- ✅ 250 enhetstester passerar (frontend)
- 🤖 **RAG/AI-system Phase 1 KLART:**
  - Dependencies tillagda (pgvector, oban, req)
  - Oban konfigurerat i application.ex + config.exs
  - 6 migrations skapade (can_use_ai_chat, pgvector, embeddings, generated_documents, chat_messages, manual_knowledge_entries, oban)
  - 4 Ash-resurser skapade (Embedding, GeneratedDocument, ChatMessage, ManualKnowledgeEntry)
  - User-resurs uppdaterad med can_use_ai_chat + has_ai_access calculation
  - RPC actions registrerade i Portal domain
  - ✅ Migrations fungerar med/utan pgvector (fallback till float[] arrays)

- 🤖 **RAG/AI-system Phase 2 KLART (2025-11-27):**
  - ✅ **GeminiClient** (`backend/lib/backend/ai/gemini_client.ex`):
    - `embed_text/1` - Genererar 768-dimensionella embeddings med text-embedding-004
    - `generate_text/2` - Textgenerering med gemini-2.0-flash-exp
    - `generate_text_stream/3` - Streaming via SSE med callback
    - `analyze_image/2` - Vision/bildanalys
  - ✅ **EmbeddingService** (`backend/lib/backend/ai/embedding_service.ex`):
    - `embed_and_store/3` - Chunking (2000 tecken, 200 overlap) + embedding + lagring
    - `search_similar/3` - Cosine similarity search
    - Deduplication via content_hash
  - ✅ **DocumentGenerator** (`backend/lib/backend/ai/document_generator.ex`):
    - `generate_all_documents/2` - Genererar alla 4 dokumenttyper
    - `generate_document/4` - Enskild dokumenttyp
    - `regenerate_document/3` - Regenerera med versionering
    - Dokumenttyper: project_spec, technical_requirements, design_brief, budget_timeline
  - ✅ **RAGService** (`backend/lib/backend/ai/rag_service.ex`):
    - `chat/4` - RAG-driven chat med streaming
    - `build_context/2` - Hämtar relevanta embeddings
    - `get_project_summary/1` - Projektsammanfattning
  - ✅ **Oban Workers**:
    - `DocumentGenerationWorker` - Asynkron dokumentgenerering
    - `EmbeddingWorker` - Asynkron embedding-generering

- ✅ **Onboarding-backend KLART (2025-11-27):**
  - ✅ **OnboardingService** (`backend/lib/backend/accounts/onboarding_service.ex`):
    - `validate_token/1` - Validerar invitation token
    - `register_via_invitation/3` - Registrerar användare via inbjudan
    - `get_invitation_details/1` - Hämtar inbjudningsinfo för onboarding
  - ✅ **OnboardingController** (`backend/lib/backend_web/controllers/onboarding_controller.ex`):
    - `GET /api/onboarding/validate/:token` - Validera token och hämta företagsinfo
    - `POST /api/onboarding/register` - Registrera ny användare
  - ✅ **Company-resurs utökad** med onboarding-fält:
    - `employee_count` - Antal anställda (1-10, 11-50, 51-200, 201+)
    - `industry` - Bransch/sektor
    - `logo_url` - URL till företagslogotyp
    - `billing_address`, `billing_city`, `billing_postal_code`, `billing_country`
    - `org_number` nu valfritt (nullable) för utländska kunder
    - Custom validation: OrgNumberValidation (10 siffror för svenska företag)

- ✅ **ProductPlan-system KLART (2025-11-27):**
  - ✅ **ProductPlan Ash-resurs** (`backend/lib/backend/portal/product_plan.ex`):
    - State machine: draft → sent → viewed → approved/changes_requested → revised → archived
    - Actions: create, update, send_to_customer, mark_viewed, approve, request_changes, revise, archive
    - Read actions: by_project, active_by_project, pending_approval, needing_revision
    - Calculations: is_pending_customer_action, is_approved, needs_admin_action, days_since_sent
    - Versioning med auto-increment vid revision
    - Timestamps: sent_at, viewed_at, approved_at, rejected_at
    - Customer feedback och change_requests (map)
  - ✅ **RPC actions registrerade** i Portal domain
  - ✅ **Migration** (`20251127110000_create_product_plans.exs`)

- ✅ **24 backend-tester passerar** (2025-11-27)
- ✅ Inga kompileringsvarningar

**Nästa steg:**
- 🔗 **Integrera komponenter** - Lägg till ProjectMeetings, ProjectTimeline i CustomerDashboard och AdminDashboard
- 📧 **[ARIAN]** Email-integration (SendGrid/AWS SES) - Kritiskt för MVP-kommunikation
- 📰 **[ARIAN]** Updates/Feed-system - Projektuppdateringar för kunder
- 📎 **Filuppladdning** - S3/storage integration för dokument och bilder
- **[ARIAN]** Sätt upp notifikations- och event-systemet enligt work package ovan

**ACTION REQUIRED:**
```powershell
cd backend
mix deps.get           # Hämta nya dependencies
mix ecto.migrate       # Kör migrations
.\gen_types.ps1        # Generera TypeScript types
```

---

## 🤖 RAG/AI-System (Phase 1 KLART)

### Översikt
Ett AI-drivet system som automatiskt strukturerar kundens svar i logiska dokument och ger admin/utvecklare en intelligent chat för att utforska projektinformation.

### Flöde
1. **Automatisk dokumentgenerering**: När kund svarat på alla frågor → AI strukturerar till:
   - Project Specification
   - Technical Requirements
   - Design Brief
   - Budget & Timeline

2. **Vector Database**: Varje projekt får sin egen "kunskapsbas" med:
   - Formulärsvar (embeddings)
   - AI-genererade dokument
   - Manuellt tillagd kunskap
   - Uppladdade filer/bilder

3. **RAG Chat**: Admin/dev kan chatta med AI som har full insikt i projektets data

### Tech Stack
- **Vector DB**: pgvector (PostgreSQL extension)
- **AI Model**: Google Gemini (text-embedding-004 + gemini-2.5-flash)
- **Background Jobs**: Oban
- **Chat**: Streaming via Server-Sent Events

### Access Control
- ✅ Admin: Full access
- ✅ Staff med `can_use_ai_chat` permission: Access
- ❌ Kunder: Ingen access till AI-chatten

### Implementation Status

#### Backend - Databas ✅ KLART
- [x] Migration: `can_use_ai_chat` boolean på User
- [x] Migration: Enable pgvector extension (conditional - fungerar utan pgvector)
- [x] Migration: `embeddings` table (vector storage med fallback till float[] arrays)
- [x] Migration: `generated_documents` table
- [x] Migration: `chat_messages` table
- [x] Migration: `manual_knowledge_entries` table
- [x] Migration: Oban tables for background jobs
- [x] HNSW index om pgvector finns, annars GIN index på float[] arrays

#### Backend - Ash Resources ✅ KLART
- [x] Embedding resource med vector search
- [x] GeneratedDocument resource
- [x] ChatMessage resource
- [x] ManualKnowledgeEntry resource
- [x] User: `can_use_ai_chat` + `has_ai_access` calculation
- [x] **22 tester passerar** (6 ChatMessage, 8 GeneratedDocument, 8 ManualKnowledgeEntry)
- [x] Policy-expressions fixade (`^actor(:role)` syntax)
- [x] Test helpers med `authorize?: false` för att kringgå policies i tester

#### Backend - Konfiguration ✅ KLART
- [x] Dependencies i mix.exs (pgvector, oban, req)
- [x] Oban config i application.ex + config.exs
- [x] Gemini API config

#### Backend - AI Services ✅ KLART (2025-11-27)
- [x] GeminiClient module (`backend/lib/backend/ai/gemini_client.ex`)
  - [x] embed_text/1 - embeddings med text-embedding-004
  - [x] generate_text/2 - textgenerering med gemini-2.0-flash-exp
  - [x] generate_text_stream/3 - streaming via SSE
  - [x] analyze_image/2 - vision/bildanalys
- [x] EmbeddingService (`backend/lib/backend/ai/embedding_service.ex`)
  - [x] chunking (2000 tecken, 200 overlap)
  - [x] embed_and_store/3
  - [x] search_similar/3 (cosine similarity)
- [x] DocumentGenerator (`backend/lib/backend/ai/document_generator.ex`)
  - [x] generate_all_documents/2
  - [x] generate_document/4
  - [x] regenerate_document/3
  - [x] 4 dokumenttyper: project_spec, technical_requirements, design_brief, budget_timeline
- [x] RAGService (`backend/lib/backend/ai/rag_service.ex`)
  - [x] chat/4 - RAG-driven chat med streaming
  - [x] build_context/2
  - [x] get_project_summary/1
- [ ] KnowledgeManager (manuell kunskap via AI) - ej implementerat än

#### Backend - Workers (Oban) ✅ KLART (2025-11-27)
- [x] DocumentGenerationWorker (`backend/lib/backend/workers/document_generation_worker.ex`)
  - [x] enqueue_all/2
  - [x] enqueue_specific/3
  - [x] enqueue_regenerate/3
- [x] EmbeddingWorker (`backend/lib/backend/workers/embedding_worker.ex`)
  - [x] enqueue_form_responses/1
  - [x] enqueue_documents/1

#### Backend - API ✅ KLART (2025-11-27)
- [x] **RAGController** (`backend/lib/backend_web/controllers/rag_controller.ex`)
- [x] POST /api/rag/projects/:id/chat (streaming SSE med chunked response)
- [x] GET /api/rag/projects/:id/chat/history
- [x] POST /api/rag/projects/:id/generate-documents (enqueue alla 4 dokumenttyper)
- [x] POST /api/rag/projects/:id/generate-document/:type (enqueue specifik typ)
- [x] POST /api/rag/projects/:id/regenerate-document/:type (regenerera med versionering)
- [x] GET /api/rag/projects/:id/documents (hämta genererade dokument)
- [x] POST /api/rag/projects/:id/embed (trigga embedding av formulärsvar)
- [x] POST /api/rag/projects/:id/knowledge (skapa manuell kunskap)
- [x] GET /api/rag/projects/:id/knowledge (hämta manuell kunskap)
- [x] **require_ai_access plug** för access control (admin + staff med can_use_ai_chat)

#### Frontend ✅ KLART (2025-11-27)
- [x] **useRAGChat.ts** - Custom hook för streaming chat med SSE (`src/hooks/useRAGChat.ts`)
  - [x] sendMessage med streaming support
  - [x] Message accumulation och parsing
  - [x] Abort controller för stop streaming
  - [x] Loading states och error handling
- [x] **RAGChatPanel.tsx** - Chat component med streaming (`components/rag/RAGChatPanel.tsx`)
  - [x] Message history med auto-scroll
  - [x] Streaming indicator (pulsing dots)
  - [x] Suggested questions i empty state
  - [x] Stop streaming-knapp
  - [x] User/assistant message styling
- [x] **GeneratedDocuments.tsx** - Visa/regenerera dokument (`components/rag/GeneratedDocuments.tsx`)
  - [x] Visa alla 4 dokumenttyper (spec, requirements, design, timeline)
  - [x] Generate/regenerate funktionalitet
  - [x] Document viewer modal med markdown rendering
  - [x] Status indicators (draft, published, archived)
- [ ] KnowledgeManager.tsx - Hantera manuell kunskap (ej implementerad än)

### Dependencies ✅ TILLAGDA
```elixir
# Tillagda i mix.exs
{:pgvector, "~> 0.3"},
{:oban, "~> 2.18"},
{:req, "~> 0.5"}
```

### Trigger Points
1. **Customer onboarding complete** → Embed company info + logo (bakgrund, kunden ser ej)
2. **Form submission complete** → Auto-generate documents + embed all data
3. **Document upload** → Embed content (+ Gemini vision för bilder)
4. **Manual knowledge entry** → AI strukturerar + embed
