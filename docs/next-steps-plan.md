# Siteflow - Omfattande Plan för Nästa Steg

**Datum:** 2025-11-27
**Baserad på:** implementation-status.md, customer-portal-spec.md, rag-plan.md, state_machine_architecture.md, swedish-requirements-research.md, realtime-collaboration-research.md

---

## Sammanfattning av Nuläge

### Vad som är KLART (Backend ~90%)

| Komponent | Status | Beskrivning |
|-----------|--------|-------------|
| **RAG/AI Phase 2** | ✅ KLART | GeminiClient, EmbeddingService, DocumentGenerator, RAGService, Oban workers |
| **Onboarding Backend** | ✅ KLART | OnboardingService, OnboardingController, Company utökad |
| **ProductPlan System** | ✅ KLART | Full state machine med godkännandeflöde |
| **DynamicProjectForm** | ✅ KLART | 55 frågor (24 hemsida + 31 system), multi-step wizard |
| **FormResponse** | ✅ KLART | Lagrar dynamiska formulärsvar |
| **InternalNote** | ✅ KLART | Interna anteckningar för Siteflow-personal |
| **Alla Dashboards** | ✅ KLART | Admin, Customer, Developer, KAM, ProjectLeader, TimeTracking |
| **AdminFormResponseView** | ✅ KLART | Strukturerad vy av projektförfrågningar |
| **AdminFileBrowser** | ✅ KLART | Google Drive-liknande filhantering |
| **24 Backend-tester** | ✅ KLART | Alla passerar utan varningar |

### Vad som SAKNAS

| Komponent | Prioritet | Ansvarig | Beskrivning |
|-----------|-----------|----------|-------------|
| **Frontend: Onboarding UI** | 🔴 P0 | Claude/Dev | Registreringsformulär via invitation token |
| **Frontend: ProductPlan UI** | 🔴 P0 | Claude/Dev | Admin skapar, kund godkänner |
| **Frontend: RAG Chat UI** | 🟡 P1 | Claude/Dev | Streaming chat med projektinsikt |
| **Backend: RAG API endpoints** | 🟡 P1 | Claude/Dev | /api/rag/* endpoints |
| **Email Integration** | 🔴 P0 | ARIAN | SendGrid/AWS SES |
| **Notification System** | 🔴 P0 | ARIAN | In-app + email notifications |
| **Updates/Feed System** | 🟡 P1 | ARIAN | Phoenix Channels real-time |
| **File Storage** | 🟡 P1 | Claude/Dev | AWS S3 eller liknande |
| **Timeline/Milestones** | 🟢 P2 | Claude/Dev | Visuell tidslinje |
| **Meetings Resource** | 🟢 P2 | Claude/Dev | Mötesbokning |

---

## Prioriterad Implementation

### Fas 1: MVP Completion (Kritiskt)

#### 1.1 Frontend: Onboarding UI
**Mål:** Kunder kan registrera sig via inbjudningslänk

**Filer att skapa:**
```
components/OnboardingPage.tsx
components/onboarding/
├── TokenValidation.tsx      # Validerar token, visar företagsinfo
├── RegistrationForm.tsx     # Formulär för användare + företag
├── CompanyInfoStep.tsx      # Steg 1: Företagsinformation
├── UserInfoStep.tsx         # Steg 2: Användaruppgifter
└── ConfirmationStep.tsx     # Steg 3: Bekräftelse
```

**API-anrop:**
- `GET /api/onboarding/validate/:token` - Validera token
- `POST /api/onboarding/register` - Registrera användare

**Fält att samla in:**
- Företagsnamn (obligatoriskt)
- Organisationsnummer (valfritt)
- Antal anställda
- Bransch
- Webbplats
- Faktureringsadress
- Förnamn, efternamn, email, telefon, lösenord

**Tidsestimering:** 2-3 dagar

---

#### 1.2 Frontend: ProductPlan UI
**Mål:** Admin kan skapa produktplaner, kunder kan godkänna

**Filer att skapa:**
```
components/productplan/
├── AdminProductPlanView.tsx      # Admin: Lista/hantera produktplaner
├── CreateProductPlanModal.tsx    # Admin: Skapa ny produktplan
├── ProductPlanEditor.tsx         # Admin: Redigera markdown/PDF
├── ProductPlanActions.tsx        # Admin: Skicka, arkivera, etc.
├── CustomerProductPlanView.tsx   # Kund: Visa produktplan
├── ProductPlanApproval.tsx       # Kund: Godkänn/begär ändringar
└── ProductPlanHistory.tsx        # Versionshistorik
```

**RPC-anrop (redan implementerade):**
- `product_plan_by_project` - Hämta alla för projekt
- `product_plan_create` - Skapa ny
- `product_plan_send_to_customer` - Skicka till kund
- `product_plan_approve` - Kund godkänner
- `product_plan_request_changes` - Kund begär ändringar
- `product_plan_revise` - Admin reviderar

**State Machine UI:**
```
draft → [Skicka till kund] → sent → [Kund öppnar] → viewed
                                                        ↓
                      [Godkänn] → approved          [Begär ändringar]
                                                        ↓
                                              changes_requested
                                                        ↓
                                    [Admin reviderar] → revised → sent
```

**Tidsestimering:** 3-4 dagar

---

#### 1.3 Email Integration (ARIAN)
**Mål:** Skicka transaktionella emails

**Prioriterade emails:**
1. Inbjudan till kundportal
2. Produktplan klar för granskning
3. Produktplan godkänd (bekräftelse)
4. Ticket-svar
5. Påminnelse 24h innan möte

**Tech stack:**
- Swoosh (Elixir email library)
- SendGrid eller AWS SES
- Mjml för email-templates

**Filer att skapa:**
```
backend/lib/backend/
├── mailer/
│   ├── mailer.ex              # Swoosh config
│   ├── templates/
│   │   ├── invitation.mjml    # Inbjudan
│   │   ├── product_plan.mjml  # Produktplan
│   │   ├── ticket_reply.mjml  # Ticket-svar
│   │   └── reminder.mjml      # Påminnelse
│   └── emails.ex              # Email composition functions
└── portal/notification.ex     # Notification resource
```

**Tidsestimering:** 3-4 dagar

---

### Fas 2: Enhanced UX (Högt Prioriterat)

#### 2.1 Frontend: RAG Chat UI
**Mål:** Admin/dev kan chatta med AI om projektdata

**Filer att skapa:**
```
components/rag/
├── RAGChatPage.tsx           # Full-page chat
├── ProjectRAGChat.tsx        # Chat component
├── ChatMessage.tsx           # Enskild meddelande
├── ChatInput.tsx             # Input med streaming
├── GeneratedDocuments.tsx    # Visa AI-genererade dokument
└── DocumentViewer.tsx        # Markdown/PDF viewer

src/hooks/
├── useRAGChat.ts             # Chat hook med streaming
└── useGeneratedDocuments.ts  # Dokument hook
```

**Backend API endpoints att skapa:**
```elixir
# router.ex
scope "/api/rag", BackendWeb do
  pipe_through [:api, :require_auth, :require_ai_access]

  post "/projects/:id/chat", RAGController, :chat           # SSE streaming
  get "/projects/:id/chat/history", RAGController, :history
  post "/projects/:id/generate-documents", RAGController, :generate
  get "/projects/:id/documents", RAGController, :documents
  post "/projects/:id/knowledge", RAGController, :add_knowledge
end
```

**Controller att skapa:**
```
backend/lib/backend_web/controllers/rag_controller.ex
```

**Tidsestimering:** 4-5 dagar

---

#### 2.2 Backend: RAG API Controller
**Mål:** Exponera RAG-funktionalitet via API

```elixir
defmodule BackendWeb.RAGController do
  use BackendWeb, :controller

  alias Backend.AI.{RAGService, DocumentGenerator}

  # POST /api/rag/projects/:id/chat
  # SSE streaming response
  def chat(conn, %{"id" => project_id, "message" => message}) do
    conn = conn
    |> put_resp_content_type("text/event-stream")
    |> send_chunked(200)

    RAGService.chat(project_id, message, conn.assigns.current_user.id, fn chunk ->
      chunk(conn, "data: #{Jason.encode!(chunk)}\n\n")
    end)
  end

  # POST /api/rag/projects/:id/generate-documents
  def generate(conn, %{"id" => project_id}) do
    case DocumentGenerator.generate_all_documents(project_id, conn.assigns.current_user.id) do
      {:ok, documents} -> json(conn, %{documents: documents})
      {:error, reason} -> json(conn, %{error: reason}) |> put_status(400)
    end
  end

  # ... etc
end
```

**Tidsestimering:** 2 dagar

---

#### 2.3 Notification System (ARIAN)
**Mål:** In-app notifications med real-time counter

**Backend:**
```elixir
# Notification Ash resource
defmodule Backend.Portal.Notification do
  use Ash.Resource, ...

  attributes do
    uuid_primary_key :id
    attribute :type, :atom  # :product_plan, :ticket, :update, etc.
    attribute :title, :string
    attribute :message, :string
    attribute :link, :string
    attribute :read, :boolean, default: false
    attribute :read_at, :utc_datetime
    timestamps()
  end

  relationships do
    belongs_to :user, Backend.Accounts.User
    belongs_to :project, Backend.Portal.Project
  end
end
```

**Frontend:**
```
components/notifications/
├── NotificationBell.tsx       # Header-bell med counter
├── NotificationDropdown.tsx   # Dropdown med lista
├── NotificationItem.tsx       # Enskild notification
└── NotificationSettings.tsx   # Användarinställningar
```

**Tidsestimering:** 3-4 dagar

---

#### 2.4 Updates/Feed System (ARIAN)
**Mål:** Admin postar uppdateringar, kunder ser feed

**Backend:**
```elixir
defmodule Backend.Portal.Update do
  use Ash.Resource, ...

  attributes do
    uuid_primary_key :id
    attribute :type, :atom  # :status, :milestone, :file, :meeting, :demo
    attribute :title, :string
    attribute :message, :string  # Rich text/markdown
    attribute :link, :string
    timestamps()
  end

  relationships do
    belongs_to :project, Backend.Portal.Project
    belongs_to :author, Backend.Accounts.User
    has_many :comments, Backend.Portal.UpdateComment
  end
end
```

**Frontend:**
```
components/updates/
├── UpdatesFeed.tsx            # Feed-lista
├── UpdateCard.tsx             # Enskild uppdatering
├── CreateUpdateForm.tsx       # Admin: Skapa uppdatering
├── UpdateComments.tsx         # Kommentarer
└── UpdateFilters.tsx          # Filtrera per typ
```

**Phoenix Channels för real-time:**
```elixir
defmodule BackendWeb.ProjectChannel do
  use Phoenix.Channel

  def join("project:" <> project_id, _params, socket) do
    if authorized?(socket, project_id) do
      {:ok, assign(socket, :project_id, project_id)}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("new_update", payload, socket) do
    broadcast!(socket, "update:new", payload)
    {:noreply, socket}
  end
end
```

**Tidsestimering:** 4-5 dagar

---

### Fas 3: Polish & Nice-to-Have (Medium Prioritet)

#### 3.1 File Storage (AWS S3)
**Mål:** Faktisk filuppladdning istället för enbart metadata

**Backend changes:**
- Add `ex_aws` och `ex_aws_s3` dependencies
- Skapa `FileStorageService` module
- Uppdatera `UploadDocumentForm` att faktiskt ladda upp

**Tidsestimering:** 2-3 dagar

---

#### 3.2 Timeline/Milestones Resource
**Mål:** Visuell tidslinje för projekt

**Backend:**
```elixir
defmodule Backend.Portal.Milestone do
  use Ash.Resource, ...

  attributes do
    uuid_primary_key :id
    attribute :title, :string
    attribute :description, :string
    attribute :due_date, :date
    attribute :completed_at, :utc_datetime
    attribute :order_index, :integer
    attribute :status, :atom  # :pending, :in_progress, :completed
  end

  relationships do
    belongs_to :project, Backend.Portal.Project
  end
end
```

**Frontend:**
```
components/timeline/
├── ProjectTimeline.tsx        # Visuell tidslinje
├── MilestoneItem.tsx          # Enskild milstolpe
├── TimelineEditor.tsx         # Admin: Redigera milstolpar
└── ProgressIndicator.tsx      # Progress bar
```

**Tidsestimering:** 3-4 dagar

---

#### 3.3 Meetings Resource
**Mål:** Schemalägg möten med kunder

**Backend:**
```elixir
defmodule Backend.Portal.Meeting do
  use Ash.Resource, ...

  attributes do
    uuid_primary_key :id
    attribute :title, :string
    attribute :description, :string
    attribute :scheduled_at, :utc_datetime
    attribute :duration_minutes, :integer, default: 60
    attribute :meeting_link, :string  # Zoom/Google Meet
    attribute :status, :atom  # :scheduled, :completed, :cancelled
  end

  relationships do
    belongs_to :project, Backend.Portal.Project
    belongs_to :created_by, Backend.Accounts.User
    many_to_many :attendees, Backend.Accounts.User, through: Backend.Portal.MeetingAttendee
  end
end
```

**Tidsestimering:** 2-3 dagar

---

### Fas 4: Swedish Market Compliance (Future)

#### 4.1 Swedish Invoice Format
- Peppol BIS Billing 3.0 compliance
- VAT calculations (25%)
- OCR-nummer generation
- Bankgiro integration

#### 4.2 BankID Integration
- Contract signing with BankID
- Customer verification
- Scrive integration as alternative

#### 4.3 Payment Integration
- Bankgiro för B2B
- Swish via Stripe
- Autogiro för recurring

---

### Fas 5: Real-time Collaboration (Future)

Baserat på `realtime-collaboration-research.md`:

#### 5.1 Phoenix Channels Setup
- WebSocket connection
- Presence tracking
- Document locking

#### 5.2 Planning Documents
- 9 planerningsdokument per projekt
- Edit locking (pessimistic concurrency)
- Auto-save
- Progress tracking

---

## Implementation Order - Konkret Handlingsplan

### Sprint 1 (Vecka 1-2): MVP Kritiskt
| Dag | Uppgift | Ansvarig |
|-----|---------|----------|
| 1-2 | Onboarding Frontend UI | Claude/Dev |
| 3-5 | ProductPlan Frontend UI | Claude/Dev |
| 1-5 | Email Integration Setup | ARIAN |

### Sprint 2 (Vecka 3-4): Enhanced UX
| Dag | Uppgift | Ansvarig |
|-----|---------|----------|
| 1-2 | RAG API Controller | Claude/Dev |
| 3-5 | RAG Chat Frontend | Claude/Dev |
| 1-4 | Notification System | ARIAN |

### Sprint 3 (Vecka 5-6): Polish
| Dag | Uppgift | Ansvarig |
|-----|---------|----------|
| 1-3 | Updates/Feed System | ARIAN |
| 3-5 | File Storage (S3) | Claude/Dev |
| 5-6 | Testing & Bug Fixes | Alla |

### Sprint 4 (Vecka 7-8): Nice-to-Have
| Dag | Uppgift | Ansvarig |
|-----|---------|----------|
| 1-3 | Timeline/Milestones | Claude/Dev |
| 4-5 | Meetings Resource | Claude/Dev |
| 6-8 | Real-time Phoenix Channels | ARIAN |

---

## Tekniska Detaljer per Komponent

### Onboarding Frontend
```tsx
// OnboardingPage.tsx
const OnboardingPage: React.FC = () => {
  const { token } = useParams();
  const [step, setStep] = useState<'validate' | 'register' | 'confirm'>('validate');
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);

  // Validate token on mount
  useEffect(() => {
    validateToken(token).then(setInvitation);
  }, [token]);

  if (!invitation) return <TokenValidation token={token} />;

  return (
    <div className="onboarding-wizard">
      <ProgressBar steps={['Företag', 'Användare', 'Bekräfta']} current={step} />
      {step === 'register' && <RegistrationForm invitation={invitation} />}
      {step === 'confirm' && <ConfirmationStep />}
    </div>
  );
};
```

### RAG Chat Frontend
```tsx
// RAGChatPage.tsx
const RAGChatPage: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (text: string) => {
    setIsStreaming(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    // Stream AI response
    const response = await fetch(`/api/rag/projects/${projectId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ message: text })
    });

    const reader = response.body.getReader();
    let aiMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      aiMessage += parseSSEData(chunk);

      // Update streaming message
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: aiMessage, isStreaming: true }
      ]);
    }

    setIsStreaming(false);
  };

  return (
    <div className="rag-chat">
      <ChatHistory messages={messages} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
};
```

---

## Filstruktur efter Implementation

```
components/
├── onboarding/
│   ├── OnboardingPage.tsx
│   ├── TokenValidation.tsx
│   ├── RegistrationForm.tsx
│   └── ConfirmationStep.tsx
├── productplan/
│   ├── AdminProductPlanView.tsx
│   ├── CreateProductPlanModal.tsx
│   ├── ProductPlanEditor.tsx
│   ├── CustomerProductPlanView.tsx
│   └── ProductPlanApproval.tsx
├── rag/
│   ├── RAGChatPage.tsx
│   ├── ProjectRAGChat.tsx
│   ├── GeneratedDocuments.tsx
│   └── DocumentViewer.tsx
├── notifications/
│   ├── NotificationBell.tsx
│   ├── NotificationDropdown.tsx
│   └── NotificationItem.tsx
├── updates/
│   ├── UpdatesFeed.tsx
│   ├── UpdateCard.tsx
│   └── CreateUpdateForm.tsx
└── timeline/
    ├── ProjectTimeline.tsx
    ├── MilestoneItem.tsx
    └── TimelineEditor.tsx

backend/lib/backend/
├── ai/
│   ├── gemini_client.ex         ✅ KLART
│   ├── embedding_service.ex     ✅ KLART
│   ├── document_generator.ex    ✅ KLART
│   └── rag_service.ex           ✅ KLART
├── portal/
│   ├── notification.ex          ❌ SAKNAS (ARIAN)
│   ├── update.ex                ❌ SAKNAS (ARIAN)
│   ├── milestone.ex             ❌ SAKNAS
│   └── meeting.ex               ❌ SAKNAS
├── workers/
│   ├── document_generation_worker.ex  ✅ KLART
│   └── embedding_worker.ex            ✅ KLART
└── mailer/                      ❌ SAKNAS (ARIAN)
    ├── mailer.ex
    └── emails.ex

backend/lib/backend_web/controllers/
├── onboarding_controller.ex     ✅ KLART
├── rag_controller.ex            ❌ SAKNAS
└── notification_controller.ex   ❌ SAKNAS (ARIAN)
```

---

## Nästa Konkreta Steg

1. **OMEDELBART:** Skapa frontend för Onboarding (2-3 dagar)
2. **DÄREFTER:** Skapa frontend för ProductPlan (3-4 dagar)
3. **ARIAN:** Börja med email integration parallellt
4. **SEDAN:** RAG API endpoints + frontend (4-5 dagar)

**Total tidsestimering till MVP:** ~3-4 veckor med fokuserat arbete

---

## Riskanalys

| Risk | Sannolikhet | Konsekvens | Mitigation |
|------|-------------|------------|------------|
| Gemini API rate limits | Medium | Hög | Implementera retry/backoff, cache embeddings |
| File storage complexity | Låg | Medium | Börja med lokal storage, migrera till S3 senare |
| Phoenix Channels learning curve | Medium | Medium | Börja utan real-time, lägg till senare |
| Email deliverability | Låg | Hög | Använd etablerad provider (SendGrid) |

---

## Success Metrics

- [ ] Kund kan registrera sig via invitation (0 buggar)
- [ ] Admin kan skapa och skicka produktplan (< 5 min)
- [ ] Kund kan godkänna produktplan (2 klick)
- [ ] RAG chat ger relevant svar (> 80% användarnöjdhet)
- [ ] Email deliverability > 95%
- [ ] Frontend tester passerar (222+ tester)
- [ ] Backend tester passerar (24+ tester)
