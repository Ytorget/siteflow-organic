# Ash Framework 3.0+ Research for Siteflow Backend

**Research Date:** 2025-11-15
**Target:** Building a B2B SaaS backend with 20 domain entities, complex workflows, multi-tenancy, and RBAC

---

## Table of Contents
1. [Ash Resource Patterns](#1-ash-resource-patterns)
2. [State Machine Implementation (AshStateMachine)](#2-state-machine-implementation-ashstatemachine)
3. [Multi-Tenant RBAC Strategy](#3-multi-tenant-rbac-strategy)
4. [Relationships & Polymorphic Associations](#4-relationships--polymorphic-associations)
5. [JSONB & Embedded Resources](#5-jsonb--embedded-resources)
6. [Custom Actions & Complex Workflows](#6-custom-actions--complex-workflows)
7. [Calculations & Aggregates](#7-calculations--aggregates)
8. [Authentication & JWT (AshAuthentication)](#8-authentication--jwt-ashauthentication)
9. [Background Jobs (AshOban)](#9-background-jobs-ashoban)
10. [Real-Time Features (PubSub Integration)](#10-real-time-features-pubsub-integration)
11. [Testing Patterns](#11-testing-patterns)
12. [Performance & Indexing](#12-performance--indexing)
13. [Complete Resource Examples for Siteflow](#13-complete-resource-examples-for-siteflow)

---

## 1. Ash Resource Patterns

### Basic Resource Structure

Every Ash resource follows this declarative pattern:

```elixir
defmodule Siteflow.Requests.Request do
  use Ash.Resource,
    domain: Siteflow.Requests,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshStateMachine, AshOban],
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "requests"
    repo Siteflow.Repo

    # Custom indexes (prefer identities for simple unique constraints)
    custom_indexes do
      index ["company_id", "inserted_at"]
      index ["status", "created_at"]
    end
  end

  attributes do
    uuid_primary_key :id

    # Basic attributes
    attribute :project_type, :atom do
      allow_nil? false
      constraints [one_of: [:website, :system, :other]]
    end

    attribute :email, :string do
      allow_nil? false
      constraints [
        match: ~r/^[^\s]+@[^\s]+\.[^\s]+$/,
        max_length: 255
      ]
    end

    attribute :phone, :string do
      allow_nil? true
      constraints [max_length: 20]
    end

    attribute :budget_range, :string
    attribute :timeline, :string
    attribute :description, :string

    # JSONB field for form responses (23-31 questions)
    attribute :form_response, :map do
      allow_nil? true
    end

    # Timestamps
    create_timestamp :created_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :company, Siteflow.Companies.Company do
      allow_nil? true
    end

    has_many :attachments, Siteflow.Attachments.Attachment
  end

  actions do
    defaults [:read, :destroy]
    default_accept [:project_type, :email, :phone, :budget_range, :timeline, :description, :form_response]

    create :create do
      primary? true
      accept [:project_type, :email, :phone, :budget_range, :timeline, :description, :form_response, :company_id]

      # Set initial state
      change transition_state(:ny)
    end

    update :update do
      primary? true
      accept [:project_type, :email, :phone, :budget_range, :timeline, :description, :form_response]
    end
  end

  # Code interface for easier function calls
  code_interface do
    define :create, args: [:project_type, :email]
    define :get_by_id, action: :read, get_by: :id
    define :list_all, action: :read
  end

  # Identities (auto-generate unique constraints)
  identities do
    identity :unique_email_per_company, [:email, :company_id]
  end
end
```

### Key Principles

1. **Declarative Design**: All behavior driven by static declarations
2. **Resources as Configuration**: Resources are configuration files that drive all APIs
3. **Action-First**: Actions (`:create_user`, `:publish_post`) are the primary abstraction
4. **Extensibility**: Extensions (AshStateMachine, AshOban, AshAuthentication) operate on the same resource abstraction

---

## 2. State Machine Implementation (AshStateMachine)

### Request Status Workflow

**Siteflow Request States**: `NY → GRANSKAS → PLANERAS → VÄNTAR_GODKÄNNANDE → GODKÄND`

```elixir
defmodule Siteflow.Requests.Request do
  use Ash.Resource,
    extensions: [AshStateMachine]

  state_machine do
    initial_states [:ny]
    default_initial_state :ny

    transitions do
      # NY → GRANSKAS (Admin reviews new request)
      transition :granska, from: :ny, to: :granskas

      # GRANSKAS → PLANERAS (Admin starts planning)
      transition :planera, from: :granskas, to: :planeras

      # PLANERAS → VÄNTAR_GODKÄNNANDE (Admin submits for approval)
      transition :skicka_for_godkannande, from: :planeras, to: :vantar_godkannande

      # VÄNTAR_GODKÄNNANDE → GODKÄND (Customer approves)
      transition :godkann, from: :vantar_godkannande, to: :godkand

      # VÄNTAR_GODKÄNNANDE → PLANERAS (Customer requests changes)
      transition :begara_andringar, from: :vantar_godkannande, to: :planeras

      # Error handling: Any state → AVBRUTEN
      transition :avbryt, from: [:ny, :granskas, :planeras, :vantar_godkannande], to: :avbruten
    end
  end

  attributes do
    # State machine requires a state attribute (auto-created by default)
    attribute :status, :atom do
      allow_nil? false
      default :ny
      constraints [one_of: [:ny, :granskas, :planeras, :vantar_godkannande, :godkand, :avbruten]]
    end

    attribute :rejection_reason, :string
  end

  actions do
    # Static state transition
    update :granska do
      accept []
      change transition_state(:granskas)
      change set_attribute(:reviewed_at, &DateTime.utc_now/0)
    end

    # Dynamic state transition with conditional logic
    update :godkann_eller_neka do
      argument :approved, :boolean, allow_nil?: false
      argument :rejection_reason, :string

      change GodkannEllerNeka
    end
  end
end

# Dynamic transition change module
defmodule Siteflow.Requests.Changes.GodkannEllerNeka do
  use Ash.Resource.Change

  def change(changeset, _opts, _context) do
    approved = Ash.Changeset.get_argument(changeset, :approved)

    if approved do
      AshStateMachine.transition_state(changeset, :godkand)
    else
      rejection_reason = Ash.Changeset.get_argument(changeset, :rejection_reason)

      changeset
      |> AshStateMachine.transition_state(:planeras)
      |> Ash.Changeset.change_attribute(:rejection_reason, rejection_reason)
    end
  end
end
```

### Contract Status Example

```elixir
defmodule Siteflow.Contracts.Contract do
  use Ash.Resource,
    extensions: [AshStateMachine]

  state_machine do
    initial_states [:draft]
    default_initial_state :draft

    transitions do
      transition :send_for_signing, from: :draft, to: :pending_signature
      transition :sign, from: :pending_signature, to: :signed
      transition :activate, from: :signed, to: :active
      transition :complete, from: :active, to: :completed
      transition :cancel, from: [:draft, :pending_signature, :signed, :active], to: :cancelled
    end
  end

  attributes do
    attribute :status, :atom
    attribute :signed_at, :utc_datetime
    attribute :signed_by, :string
  end

  actions do
    update :sign do
      argument :signature_data, :string, allow_nil?: false

      change transition_state(:signed)
      change set_attribute(:signed_at, &DateTime.utc_now/0)
      change set_attribute(:signed_by, arg(:signature_data))
    end
  end
end
```

---

## 3. Multi-Tenant RBAC Strategy

### Multi-Tenancy Configuration

```elixir
defmodule Siteflow.Projects.Project do
  use Ash.Resource,
    authorizers: [Ash.Policy.Authorizer]

  # Attribute-based multi-tenancy
  multitenancy do
    strategy :attribute
    attribute :company_id
    global? true  # Allow queries without tenant specification (with policies)
  end

  attributes do
    uuid_primary_key :id
    attribute :name, :string, allow_nil?: false
    attribute :description, :string
    attribute :status, :atom
  end

  relationships do
    belongs_to :company, Siteflow.Companies.Company do
      allow_nil? false
    end
  end

  # Tenant-scoped identities
  identities do
    # Scoped to tenant by default
    identity :unique_name_per_company, [:name]

    # Global identity across all tenants
    identity :global_project_code, [:project_code], all_tenants?: true
  end

  policies do
    # Admins can see all projects across all companies
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
    end

    # Customers can only see their company's projects
    policy action_type(:read) do
      authorize_if ActorBelongsToTenant
    end

    # Only admins can create/update/delete
    policy action_type([:create, :update, :destroy]) do
      authorize_if actor_attribute_equals(:role, :admin)
    end
  end
end

# Custom check: Actor belongs to the same company
defmodule Siteflow.Policies.Checks.ActorBelongsToTenant do
  use Ash.Policy.SimpleCheck

  def describe(_opts), do: "actor belongs to the same company"

  def match?(actor, %{query: query} = _context, _opts) do
    company_id = Ash.Query.get_tenant(query)
    actor.company_id == company_id
  end

  def match?(actor, %{changeset: changeset} = _context, _opts) do
    company_id = Ash.Changeset.get_tenant(changeset)
    actor.company_id == company_id
  end
end
```

### Comprehensive Policy Examples

```elixir
defmodule Siteflow.Tickets.Ticket do
  use Ash.Resource,
    authorizers: [Ash.Policy.Authorizer]

  attributes do
    uuid_primary_key :id
    attribute :title, :string, allow_nil?: false
    attribute :description, :string
    attribute :status, :atom
    attribute :priority, :atom
    attribute :internal_notes, :string  # Admin-only field
  end

  relationships do
    belongs_to :company, Siteflow.Companies.Company
    belongs_to :project, Siteflow.Projects.Project
    belongs_to :created_by, Siteflow.Accounts.User
    belongs_to :assigned_to, Siteflow.Accounts.User
    has_many :messages, Siteflow.Tickets.TicketMessage
  end

  policies do
    # Bypass all policies for super admins
    bypass actor_attribute_equals(:super_admin, true) do
      authorize_if always()
    end

    # Admins can read all tickets
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
    end

    # Customers can only read tickets from their company
    policy action_type(:read) do
      authorize_if expr(company_id == ^actor(:company_id))
    end

    # Admins can create tickets for any company
    policy action(:create) do
      authorize_if actor_attribute_equals(:role, :admin)
    end

    # Customers can create tickets for their own company
    policy action(:create) do
      authorize_if expr(company_id == ^actor(:company_id))
    end

    # Only ticket creator or assigned admin can update
    policy action_type(:update) do
      authorize_if expr(created_by_id == ^actor(:id))
      authorize_if expr(assigned_to_id == ^actor(:id))
    end

    # Forbid customers from closing tickets (admins only)
    policy action(:close) do
      forbid_unless actor_attribute_equals(:role, :admin)
    end
  end

  # Field-level policies
  field_policies do
    # Only admins can see/edit internal notes
    field_policy :internal_notes do
      authorize_if actor_attribute_equals(:role, :admin)
    end

    # Only admins can change priority
    field_policy :priority, [type: :update] do
      authorize_if actor_attribute_equals(:role, :admin)
    end
  end
end
```

### User Resource with Roles

```elixir
defmodule Siteflow.Accounts.User do
  use Ash.Resource,
    extensions: [AshAuthentication],
    authorizers: [Ash.Policy.Authorizer]

  attributes do
    uuid_primary_key :id
    attribute :email, :ci_string, allow_nil?: false
    attribute :name, :string, allow_nil?: false
    attribute :role, :atom do
      allow_nil? false
      default :customer
      constraints [one_of: [:admin, :customer]]
    end
    attribute :hashed_password, :string, allow_nil?: false, sensitive?: true
  end

  relationships do
    belongs_to :company, Siteflow.Companies.Company
  end

  authentication do
    strategies do
      password :password do
        identity_field :email
        hashed_password_field :hashed_password
      end
    end

    tokens do
      enabled? true
      token_lifetime {1, :hours}
      signing_secret fn _, _ ->
        Application.fetch_env(:siteflow, :token_signing_secret)
      end
    end
  end

  policies do
    # Users can read their own profile
    policy action_type(:read) do
      authorize_if expr(id == ^actor(:id))
    end

    # Admins can read all users
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
    end

    # Users can update their own profile (but not role)
    policy action(:update_profile) do
      authorize_if expr(id == ^actor(:id))
    end

    # Only admins can change user roles
    policy action(:change_role) do
      authorize_if actor_attribute_equals(:role, :admin)
    end
  end

  identities do
    identity :unique_email, [:email]
  end
end
```

---

## 4. Relationships & Polymorphic Associations

### Standard Relationships

```elixir
# Company has many Projects
defmodule Siteflow.Companies.Company do
  relationships do
    has_many :projects, Siteflow.Projects.Project
    has_many :users, Siteflow.Accounts.User
    has_many :tickets, Siteflow.Tickets.Ticket
  end
end

# Project belongs to Company
defmodule Siteflow.Projects.Project do
  relationships do
    belongs_to :company, Siteflow.Companies.Company do
      allow_nil? false
    end

    has_many :tasks, Siteflow.Tasks.Task
    has_many :checklists, Siteflow.Checklists.Checklist
    has_many :contracts, Siteflow.Contracts.Contract
    has_one :product_plan, Siteflow.ProductPlans.ProductPlan
  end
end

# Ticket belongs to Project
defmodule Siteflow.Tickets.Ticket do
  relationships do
    belongs_to :project, Siteflow.Projects.Project do
      allow_nil? false
    end

    has_many :messages, Siteflow.Tickets.TicketMessage
    has_many :attachments, Siteflow.Attachments.Attachment
  end
end
```

### Many-to-Many with Join Table (Team Members)

```elixir
# Team resource
defmodule Siteflow.Teams.Team do
  use Ash.Resource

  attributes do
    uuid_primary_key :id
    attribute :name, :string, allow_nil?: false
    attribute :description, :string
  end

  relationships do
    belongs_to :project, Siteflow.Projects.Project

    # Many-to-many through join table
    many_to_many :members, Siteflow.Accounts.User do
      through Siteflow.Teams.TeamMember
      source_attribute_on_join_resource :team_id
      destination_attribute_on_join_resource :user_id
    end
  end
end

# Join table resource
defmodule Siteflow.Teams.TeamMember do
  use Ash.Resource

  postgres do
    table "team_members"
    repo Siteflow.Repo
  end

  attributes do
    attribute :role, :atom do
      constraints [one_of: [:lead, :member, :observer]]
      default :member
    end

    create_timestamp :joined_at
  end

  relationships do
    belongs_to :team, Siteflow.Teams.Team do
      primary_key? true
      allow_nil? false
    end

    belongs_to :user, Siteflow.Accounts.User do
      primary_key? true
      allow_nil? false
    end
  end

  actions do
    defaults [:read, :destroy, create: :*, update: :*]
  end

  identities do
    identity :unique_team_user, [:team_id, :user_id]
  end
end

# User resource
defmodule Siteflow.Accounts.User do
  relationships do
    many_to_many :teams, Siteflow.Teams.Team do
      through Siteflow.Teams.TeamMember
      source_attribute_on_join_resource :user_id
      destination_attribute_on_join_resource :team_id
    end
  end
end
```

### Polymorphic Relationships (Attachments)

Ash doesn't support direct polymorphic relationships. Instead, use **Union types** or **multiple belongs_to relationships**.

**Approach 1: Multiple belongs_to (Recommended for Siteflow)**

```elixir
defmodule Siteflow.Attachments.Attachment do
  use Ash.Resource

  attributes do
    uuid_primary_key :id
    attribute :filename, :string, allow_nil?: false
    attribute :file_url, :string, allow_nil?: false
    attribute :content_type, :string
    attribute :file_size, :integer

    # Polymorphic type indicator
    attribute :attachable_type, :atom do
      allow_nil? false
      constraints [one_of: [:ticket, :project, :document]]
    end
  end

  relationships do
    # Multiple belongs_to for polymorphism
    belongs_to :ticket, Siteflow.Tickets.Ticket do
      define_attribute? false
      attribute_type :uuid
    end

    belongs_to :project, Siteflow.Projects.Project do
      define_attribute? false
      attribute_type :uuid
    end

    belongs_to :document, Siteflow.Documents.PlanDocument do
      define_attribute? false
      attribute_type :uuid
    end
  end

  # Custom attribute for the foreign key
  attributes do
    attribute :attachable_id, :uuid, allow_nil?: false
  end

  # Validation to ensure only one parent is set
  validations do
    validate fn changeset, _context ->
      attachable_type = Ash.Changeset.get_attribute(changeset, :attachable_type)
      attachable_id = Ash.Changeset.get_attribute(changeset, :attachable_id)

      # Ensure attachable_type and attachable_id are consistent
      case attachable_type do
        :ticket -> validate_parent_exists(changeset, :ticket, attachable_id)
        :project -> validate_parent_exists(changeset, :project, attachable_id)
        :document -> validate_parent_exists(changeset, :document, attachable_id)
        _ -> {:error, "Invalid attachable_type"}
      end
    end
  end
end
```

**Approach 2: Custom "Through" Relationship**

```elixir
# Ticket has attachments
defmodule Siteflow.Tickets.Ticket do
  relationships do
    has_many :attachments, Siteflow.Attachments.Attachment do
      no_attributes? true
      filter expr(attachable_type == :ticket and attachable_id == parent(id))
    end
  end
end

# Project has attachments
defmodule Siteflow.Projects.Project do
  relationships do
    has_many :attachments, Siteflow.Attachments.Attachment do
      no_attributes? true
      filter expr(attachable_type == :project and attachable_id == parent(id))
    end
  end
end
```

---

## 5. JSONB & Embedded Resources

### Embedded Resource for Form Responses

```elixir
# Embedded resource definition
defmodule Siteflow.Requests.FormResponse do
  use Ash.Resource,
    data_layer: :embedded

  attributes do
    # Website project questions
    attribute :website_type, :string
    attribute :design_preference, :string
    attribute :content_ready, :boolean
    attribute :features_needed, {:array, :string}

    # System project questions
    attribute :system_type, :string
    attribute :user_count, :integer
    attribute :integration_requirements, {:array, :string}

    # Common questions
    attribute :business_goals, :string
    attribute :target_audience, :string
    attribute :competitors, {:array, :string}
    attribute :additional_notes, :string
  end

  actions do
    defaults [:create, :read, :update]
  end
end

# Parent resource using embedded type
defmodule Siteflow.Requests.Request do
  attributes do
    uuid_primary_key :id

    # Embedded resource as attribute type
    attribute :form_response, Siteflow.Requests.FormResponse do
      allow_nil? true
    end
  end

  actions do
    create :create do
      accept [:project_type, :email, :form_response]
    end
  end
end
```

### Querying JSONB/Embedded Fields

```elixir
# Filter by embedded field
Siteflow.Requests.Request
|> Ash.Query.filter(Ash.Expr.expr(get_path(form_response, [:website_type]) == "ecommerce"))
|> Ash.read!()

# Filter by array contains
Siteflow.Requests.Request
|> Ash.Query.filter(Ash.Expr.expr(contains(get_path(form_response, [:features_needed]), "payment")))
|> Ash.read!()
```

### Invoice with JSONB Items Array

```elixir
defmodule Siteflow.Invoices.InvoiceItem do
  use Ash.Resource,
    data_layer: :embedded

  attributes do
    attribute :description, :string, allow_nil?: false
    attribute :quantity, :decimal, allow_nil?: false
    attribute :unit_price, :decimal, allow_nil?: false
    attribute :tax_rate, :decimal, default: Decimal.new("0.25")  # 25% Swedish VAT
    attribute :total, :decimal
  end

  calculations do
    calculate :calculated_total, :decimal, expr(quantity * unit_price * (1 + tax_rate))
  end
end

defmodule Siteflow.Invoices.Invoice do
  attributes do
    uuid_primary_key :id

    attribute :invoice_number, :string, allow_nil?: false
    attribute :items, {:array, Siteflow.Invoices.InvoiceItem}, default: []
    attribute :subtotal, :decimal
    attribute :tax_amount, :decimal
    attribute :total_amount, :decimal
  end

  calculations do
    # Calculate total from items
    calculate :calculated_total, :decimal do
      calculation fn records, _context ->
        Enum.map(records, fn record ->
          Enum.reduce(record.items, Decimal.new(0), fn item, acc ->
            Decimal.add(acc, item.calculated_total)
          end)
        end)
      end
    end
  end
end
```

---

## 6. Custom Actions & Complex Workflows

### Request → Customer + Project Conversion

```elixir
defmodule Siteflow.Requests.Request do
  actions do
    # Custom action to convert request to customer + project
    update :convert_to_project do
      argument :project_name, :string, allow_nil?: false
      argument :project_description, :string

      # Use transaction hooks
      change ConvertToProject

      # Transition state
      change transition_state(:godkand)
    end
  end
end

# Complex workflow change module
defmodule Siteflow.Requests.Changes.ConvertToProject do
  use Ash.Resource.Change

  def change(changeset, _opts, context) do
    changeset
    |> Ash.Changeset.before_transaction(&validate_conversion/1)
    |> Ash.Changeset.after_action(&create_customer_and_project/2)
    |> Ash.Changeset.after_transaction(&send_notification/2)
  end

  defp validate_conversion(changeset) do
    # Validate that request hasn't already been converted
    request = changeset.data

    if request.company_id do
      Ash.Changeset.add_error(changeset, "Request already converted to customer")
    else
      changeset
    end
  end

  defp create_customer_and_project(changeset, request) do
    # Extract arguments
    project_name = Ash.Changeset.get_argument(changeset, :project_name)
    project_description = Ash.Changeset.get_argument(changeset, :project_description)

    # Step 1: Create Company (Customer)
    {:ok, company} =
      Siteflow.Companies.Company
      |> Ash.Changeset.for_create(:create, %{
        name: "#{request.email} Company",  # Or extract from form
        email: request.email,
        phone: request.phone
      })
      |> Ash.create()

    # Step 2: Create Project for that Company
    {:ok, project} =
      Siteflow.Projects.Project
      |> Ash.Changeset.for_create(:create, %{
        company_id: company.id,
        name: project_name,
        description: project_description || request.description,
        project_type: request.project_type,
        status: :planning
      })
      |> Ash.create()

    # Step 3: Update Request with company_id
    updated_request =
      request
      |> Ash.Changeset.for_update(:update, %{company_id: company.id})
      |> Ash.update!()

    {:ok, updated_request}
  end

  defp send_notification({:ok, request}, _changeset) do
    # Send email notification to customer
    Siteflow.Mailer.send_project_created_email(request)
    {:ok, request}
  end

  defp send_notification(error, _changeset), do: error
end
```

### Multi-Step Action with Transaction Hooks

```elixir
defmodule Siteflow.Tickets.Ticket do
  actions do
    update :assign_and_notify do
      argument :assigned_to_id, :uuid, allow_nil?: false
      argument :send_email, :boolean, default: true

      # Hook sequence
      change AssignTicket
    end
  end
end

defmodule Siteflow.Tickets.Changes.AssignTicket do
  use Ash.Resource.Change

  def change(changeset, _opts, context) do
    changeset
    |> Ash.Changeset.before_transaction(&check_agent_availability/1)
    |> Ash.Changeset.before_action(&assign_agent/1)
    |> Ash.Changeset.after_action(&send_assignment_notification/2)
    |> Ash.Changeset.after_transaction(&log_assignment/2)
  end

  defp check_agent_availability(changeset) do
    # Check external service or database
    assigned_to_id = Ash.Changeset.get_argument(changeset, :assigned_to_id)

    case Siteflow.Accounts.User.get_by_id(assigned_to_id) do
      {:ok, user} when user.role == :admin -> changeset
      {:ok, _user} -> Ash.Changeset.add_error(changeset, "User is not an admin")
      {:error, _} -> Ash.Changeset.add_error(changeset, "User not found")
    end
  end

  defp assign_agent(changeset) do
    assigned_to_id = Ash.Changeset.get_argument(changeset, :assigned_to_id)

    changeset
    |> Ash.Changeset.change_attribute(:assigned_to_id, assigned_to_id)
    |> Ash.Changeset.change_attribute(:status, :assigned)
    |> Ash.Changeset.change_attribute(:assigned_at, DateTime.utc_now())
  end

  defp send_assignment_notification(changeset, ticket) do
    send_email = Ash.Changeset.get_argument(changeset, :send_email)

    if send_email do
      Siteflow.Mailer.send_ticket_assigned_email(ticket)
    end

    {:ok, ticket}
  end

  defp log_assignment({:ok, ticket}, _changeset) do
    # Log to audit trail
    Siteflow.ActivityLog.log_ticket_assignment(ticket)
    {:ok, ticket}
  end

  defp log_assignment(error, _changeset), do: error
end
```

---

## 7. Calculations & Aggregates

### Project Progress Calculation from Checklists

```elixir
defmodule Siteflow.Projects.Project do
  use Ash.Resource

  attributes do
    uuid_primary_key :id
    attribute :name, :string
    attribute :status, :atom
  end

  relationships do
    has_many :checklists, Siteflow.Checklists.Checklist
  end

  # Aggregates
  aggregates do
    # Count total checklist items
    count :total_checklist_items, [:checklists, :items]

    # Count completed checklist items
    count :completed_checklist_items, [:checklists, :items] do
      filter expr(items.completed == true)
    end
  end

  # Calculations
  calculations do
    # Simple expression calculation
    calculate :progress_percentage, :decimal do
      expr(
        if total_checklist_items > 0 do
          (completed_checklist_items / total_checklist_items) * 100
        else
          0
        end
      )
    end

    # Custom calculation module for complex logic
    calculate :estimated_completion_date, :date, EstimatedCompletion
  end
end

# Custom calculation module
defmodule Siteflow.Projects.Calculations.EstimatedCompletion do
  use Ash.Resource.Calculation

  @impl true
  def load(_query, _opts, _context) do
    [:created_at, :progress_percentage, :estimated_duration_days]
  end

  @impl true
  def calculate(records, _opts, _context) do
    Enum.map(records, fn project ->
      if project.progress_percentage >= 100 do
        Date.utc_today()
      else
        remaining_percentage = 100 - project.progress_percentage
        days_elapsed = Date.diff(Date.utc_today(), project.created_at)
        estimated_total_days = days_elapsed / (project.progress_percentage / 100)
        estimated_remaining_days = round(estimated_total_days * (remaining_percentage / 100))

        Date.add(Date.utc_today(), estimated_remaining_days)
      end
    end)
  end
end
```

### Invoice Totals with Aggregates

```elixir
defmodule Siteflow.Invoices.Invoice do
  aggregates do
    # Sum of all item totals
    sum :calculated_subtotal, :items, :total

    # Count of line items
    count :item_count, :items
  end

  calculations do
    # Tax amount (25% Swedish VAT)
    calculate :tax_amount, :decimal do
      expr(calculated_subtotal * 0.25)
    end

    # Total with tax
    calculate :total_with_tax, :decimal do
      expr(calculated_subtotal * 1.25)
    end
  end
end
```

### User Statistics

```elixir
defmodule Siteflow.Accounts.User do
  aggregates do
    # Count tickets created by user
    count :tickets_created_count, :created_tickets

    # Count tickets assigned to user (admins only)
    count :tickets_assigned_count, :assigned_tickets

    # Count open tickets
    count :open_tickets_count, :assigned_tickets do
      filter expr(status in [:open, :in_progress])
    end
  end

  calculations do
    # Full name from first + last
    calculate :full_name, :string, expr(first_name <> " " <> last_name)

    # Is admin check
    calculate :is_admin, :boolean, expr(role == :admin)
  end
end
```

---

## 8. Authentication & JWT (AshAuthentication)

### Basic Password Authentication

```elixir
defmodule Siteflow.Accounts.User do
  use Ash.Resource,
    extensions: [AshAuthentication],
    domain: Siteflow.Accounts,
    data_layer: AshPostgres.DataLayer

  authentication do
    strategies do
      password :password do
        identity_field :email
        hashed_password_field :hashed_password

        # Sign-in action
        sign_in_action_name :sign_in_with_password

        # Registration action
        register_action_name :register_with_password

        # Confirmation required
        confirmation_required? false
      end
    end

    tokens do
      enabled? true
      token_lifetime {1, :hours}

      signing_secret fn _resource, _opts ->
        Application.fetch_env(:siteflow, :token_signing_secret)
      end
    end
  end

  attributes do
    uuid_primary_key :id
    attribute :email, :ci_string, allow_nil?: false
    attribute :name, :string, allow_nil?: false
    attribute :hashed_password, :string, allow_nil?: false, sensitive?: true
    attribute :role, :atom, default: :customer
  end

  identities do
    identity :unique_email, [:email]
  end
end
```

### Refresh Token Implementation

```elixir
defmodule Siteflow.Accounts.User do
  authentication do
    strategies do
      password :password do
        identity_field :email
        hashed_password_field :hashed_password
      end
    end

    tokens do
      enabled? true
      token_lifetime {1, :hours}  # Short-lived access token

      signing_secret fn _, _ ->
        Application.fetch_env(:siteflow, :token_signing_secret)
      end
    end
  end

  actions do
    # Override sign-in to include refresh token
    read :sign_in_with_password do
      get? true
      argument :email, :ci_string, allow_nil?: false
      argument :password, :string, allow_nil?: false, sensitive?: true

      prepare AshAuthentication.Strategy.Password.SignInPreparation
      prepare Siteflow.Accounts.Preparations.GenerateRefreshToken

      metadata :token, :string, allow_nil?: false
      metadata :refresh_token, :string, allow_nil?: false
    end

    # Exchange refresh token for new access token
    read :exchange_refresh_token do
      get? true
      argument :refresh_token, :string, allow_nil?: false, sensitive?: true

      metadata :token, :string, allow_nil?: false
      metadata :refresh_token, :string, allow_nil?: false

      prepare set_context(%{strategy_name: :password})
      prepare Siteflow.Accounts.Preparations.ExchangeRefreshToken
    end
  end
end

# Generate 30-day refresh token
defmodule Siteflow.Accounts.Preparations.GenerateRefreshToken do
  use Ash.Resource.Preparation

  def prepare(query, _opts, _context) do
    query
    |> Ash.Query.after_action(&generate_refresh_token/2)
  end

  defp generate_refresh_token(query, [user]) do
    case Ash.Resource.get_metadata(user, :token) do
      token when not is_nil(token) ->
        opts = [token_lifetime: {30, :days}]
        {:ok, refresh_token, _claims} =
          AshAuthentication.Jwt.token_for_user(user, %{"purpose" => "refresh_token"}, opts)

        user = Ash.Resource.put_metadata(user, :refresh_token, refresh_token)
        {:ok, [user]}

      _ ->
        {:error, "Unable to retrieve token"}
    end
  end
end

# Exchange refresh token preparation
defmodule Siteflow.Accounts.Preparations.ExchangeRefreshToken do
  use Ash.Resource.Preparation

  def prepare(query, _opts, context) do
    {:ok, strategy} = AshAuthentication.Info.strategy(query.resource, :password)

    query
    |> Ash.Query.before_action(&verify_token(&1, strategy, context))
    |> Ash.Query.after_action(&revoke_refresh_token(&1, &2, strategy, context))
    |> Ash.Query.after_action(&generate_new_tokens(&1, &2, strategy, context))
  end

  defp verify_token(query, strategy, context) do
    token = Ash.Query.get_argument(query, :refresh_token)

    with {:ok, claims, _} <- AshAuthentication.Jwt.verify(token, strategy.resource, context),
         :ok <- verify_token_purpose(claims),
         {:ok, primary_keys} <- primary_keys_from_subject(claims, strategy.resource) do
      Ash.Query.filter(query, ^primary_keys)
    else
      {:error, reason} -> Ash.Query.add_error(query, [:refresh_token], reason)
    end
  end

  defp verify_token_purpose(%{"purpose" => "refresh_token"}), do: :ok
  defp verify_token_purpose(_), do: {:error, "Invalid token purpose"}

  defp revoke_refresh_token(query, [user], strategy, _context) do
    token_resource = AshAuthentication.Info.authentication_tokens_token_resource!(strategy.resource)
    token = Ash.Query.get_argument(query, :refresh_token)

    case AshAuthentication.TokenResource.revoke(token_resource, token, []) do
      :ok -> {:ok, [user]}
      {:error, reason} -> {:error, reason}
    end
  end

  defp generate_new_tokens(_query, [user], _strategy, _context) do
    # Generate new refresh token (30 days)
    {:ok, refresh_token, _} =
      AshAuthentication.Jwt.token_for_user(
        user,
        %{"purpose" => "refresh_token"},
        [token_lifetime: {30, :days}]
      )

    # Generate new access token (1 hour)
    {:ok, token, _} =
      AshAuthentication.Jwt.token_for_user(user, %{"purpose" => "user"}, [])

    user = user
           |> Ash.Resource.put_metadata(:refresh_token, refresh_token)
           |> Ash.Resource.put_metadata(:token, token)

    {:ok, [user]}
  end
end
```

### Multi-Tenant Authentication

```elixir
defmodule Siteflow.Accounts.User do
  multitenancy do
    strategy :attribute
    attribute :company_id
  end

  relationships do
    belongs_to :company, Siteflow.Companies.Company do
      allow_nil? false
    end
  end

  # Include company_id in JWT claims
  authentication do
    tokens do
      enabled? true

      # Add custom claims
      extra_claims fn user, _context ->
        {:ok, %{
          "company_id" => user.company_id,
          "role" => user.role
        }}
      end
    end
  end
end
```

---

## 9. Background Jobs (AshOban)

### Setup AshOban

```elixir
# mix.exs
def deps do
  [
    {:ash_oban, "~> 0.6.0"},
    {:oban, "~> 2.17"}
  ]
end

# config/config.exs
config :siteflow, Oban,
  repo: Siteflow.Repo,
  queues: [
    default: 10,
    mailers: 20,
    notifications: 5,
    invoices_process: 3
  ]

# application.ex
children = [
  {Oban, AshOban.config([Siteflow.Requests, Siteflow.Invoices], oban_config)}
]
```

### Trigger: Process Overdue Invoices

```elixir
defmodule Siteflow.Invoices.Invoice do
  use Ash.Resource,
    extensions: [AshOban]

  oban do
    triggers do
      trigger :send_overdue_reminders do
        action :send_reminder

        # Run every day at 9 AM
        scheduler_cron "0 9 * * *"

        # Only process unpaid invoices past due date
        where expr(status == :unpaid and due_date < ^Date.utc_today())

        # Queue name
        queue :invoices_process

        # Error handling action
        on_error :mark_reminder_failed
      end
    end
  end

  actions do
    update :send_reminder do
      accept []

      change fn changeset, _context ->
        invoice = changeset.data

        # Send email reminder
        Siteflow.Mailer.send_invoice_reminder(invoice)

        # Update last_reminder_sent_at
        Ash.Changeset.change_attribute(changeset, :last_reminder_sent_at, DateTime.utc_now())
      end
    end

    update :mark_reminder_failed do
      argument :error, :map
      accept []

      change fn changeset, _context ->
        error = Ash.Changeset.get_argument(changeset, :error)

        # Log error
        Logger.error("Failed to send invoice reminder: #{inspect(error)}")

        changeset
      end
    end
  end
end
```

### Trigger: Notify Team on New Ticket

```elixir
defmodule Siteflow.Tickets.Ticket do
  use Ash.Resource,
    extensions: [AshOban]

  oban do
    triggers do
      trigger :notify_on_create do
        action :send_creation_notification

        # Run once in background after creation
        on [:create]

        queue :notifications

        # Run immediately
        max_attempts 3
      end
    end
  end

  actions do
    update :send_creation_notification do
      accept []

      change fn changeset, _context ->
        ticket = changeset.data |> Ash.load!([:project, :created_by])

        # Send notification to project team
        Siteflow.Notifications.notify_team_of_new_ticket(ticket)

        changeset
      end
    end
  end
end
```

### Scheduled Actions

```elixir
defmodule Siteflow.Reports.WeeklyReport do
  use Ash.Resource,
    extensions: [AshOban]

  oban do
    scheduled_actions do
      # Run every Monday at 8 AM
      schedule :generate_weekly_report do
        action :generate
        cron "0 8 * * 1"
        queue :default
      end
    end
  end

  actions do
    create :generate do
      accept []

      change fn changeset, _context ->
        # Generate report for last week
        start_date = Date.add(Date.utc_today(), -7)
        end_date = Date.utc_today()

        report_data = Siteflow.Analytics.generate_weekly_report(start_date, end_date)

        changeset
        |> Ash.Changeset.change_attribute(:start_date, start_date)
        |> Ash.Changeset.change_attribute(:end_date, end_date)
        |> Ash.Changeset.change_attribute(:data, report_data)
      end
    end
  end
end
```

---

## 10. Real-Time Features (PubSub Integration)

### Phoenix PubSub + Ash Notifications

```elixir
# Define a notifier
defmodule Siteflow.Notifiers.PubSubNotifier do
  use Ash.Notifier

  def notify(%Ash.Notifier.Notification{
        resource: resource,
        action: %{type: type},
        data: data
      }) do
    topic = build_topic(resource, data)
    event = build_event(type, data)

    Phoenix.PubSub.broadcast(
      Siteflow.PubSub,
      topic,
      {event, data}
    )

    :ok
  end

  defp build_topic(Siteflow.Tickets.Ticket, ticket) do
    "project:#{ticket.project_id}:tickets"
  end

  defp build_topic(Siteflow.ChatMessages.ChatMessage, message) do
    "project:#{message.project_id}:chat"
  end

  defp build_topic(resource, _data) do
    resource
    |> Module.split()
    |> List.last()
    |> Macro.underscore()
    |> String.downcase()
  end

  defp build_event(:create, _), do: :created
  defp build_event(:update, _), do: :updated
  defp build_event(:destroy, _), do: :deleted
end

# Add notifier to resource
defmodule Siteflow.Tickets.Ticket do
  use Ash.Resource,
    notifiers: [Siteflow.Notifiers.PubSubNotifier]

  # Configure which actions trigger notifications
  actions do
    create :create do
      notify? true  # Will trigger PubSub broadcast
    end

    update :update do
      notify? true
    end
  end
end
```

### LiveView Subscription

```elixir
defmodule SiteflowWeb.ProjectLive.TicketsLive do
  use SiteflowWeb, :live_view

  @impl true
  def mount(%{"project_id" => project_id}, _session, socket) do
    # Subscribe to ticket updates for this project
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Siteflow.PubSub, "project:#{project_id}:tickets")
    end

    tickets = load_tickets(project_id)

    {:ok, assign(socket, project_id: project_id, tickets: tickets)}
  end

  @impl true
  def handle_info({:created, ticket}, socket) do
    # Add new ticket to list
    tickets = [ticket | socket.assigns.tickets]
    {:noreply, assign(socket, tickets: tickets)}
  end

  @impl true
  def handle_info({:updated, updated_ticket}, socket) do
    # Update ticket in list
    tickets =
      Enum.map(socket.assigns.tickets, fn ticket ->
        if ticket.id == updated_ticket.id, do: updated_ticket, else: ticket
      end)

    {:noreply, assign(socket, tickets: tickets)}
  end

  @impl true
  def handle_info({:deleted, deleted_ticket}, socket) do
    # Remove ticket from list
    tickets = Enum.reject(socket.assigns.tickets, &(&1.id == deleted_ticket.id))
    {:noreply, assign(socket, tickets: tickets)}
  end

  defp load_tickets(project_id) do
    Siteflow.Tickets.Ticket
    |> Ash.Query.filter(project_id == ^project_id)
    |> Ash.Query.load([:created_by, :assigned_to])
    |> Ash.read!()
  end
end
```

### Real-Time Chat Messages

```elixir
defmodule Siteflow.ChatMessages.ChatMessage do
  use Ash.Resource,
    notifiers: [Siteflow.Notifiers.PubSubNotifier]

  attributes do
    uuid_primary_key :id
    attribute :content, :string, allow_nil?: false
    attribute :read, :boolean, default: false
    create_timestamp :inserted_at
  end

  relationships do
    belongs_to :project, Siteflow.Projects.Project
    belongs_to :sender, Siteflow.Accounts.User
  end

  actions do
    create :create do
      accept [:content, :project_id, :sender_id]
      notify? true

      # Broadcast immediately after creation
      change fn changeset, _context ->
        changeset
      end
    end
  end
end
```

---

## 11. Testing Patterns

### Basic Resource Action Testing

```elixir
defmodule Siteflow.ProjectsTest do
  use Siteflow.DataCase
  alias Siteflow.Projects.Project

  describe "create project" do
    test "creates project with valid attributes" do
      company = create_company()

      attrs = %{
        name: "New Website",
        description: "E-commerce website",
        project_type: :website,
        company_id: company.id
      }

      assert {:ok, project} =
        Project
        |> Ash.Changeset.for_create(:create, attrs)
        |> Ash.create()

      assert project.name == "New Website"
      assert project.project_type == :website
    end

    test "fails with invalid attributes" do
      attrs = %{
        name: "A",  # Too short (min 3 chars)
        project_type: :website
      }

      assert {:error, %Ash.Error.Invalid{}} =
        Project
        |> Ash.Changeset.for_create(:create, attrs)
        |> Ash.create()
    end
  end
end
```

### Property-Based Testing with Generators

```elixir
defmodule Siteflow.Generators do
  use Ash.Generator

  def company(opts \\ []) do
    changeset_generator(Siteflow.Companies.Company, :create, overrides: opts)
  end

  def user(opts \\ []) do
    changeset_generator(Siteflow.Accounts.User, :register_with_password, overrides: opts)
  end

  def project(opts \\ []) do
    changeset_generator(Siteflow.Projects.Project, :create, overrides: opts)
  end
end

defmodule Siteflow.ProjectPropertyTest do
  use ExUnit.Case
  use ExUnitProperties
  import Siteflow.Generators

  property "all valid project inputs are accepted" do
    check all(input <- Ash.Generator.action_input(Siteflow.Projects.Project, :create)) do
      company = generate(company())
      input = Map.put(input, :company_id, company.id)

      changeset =
        Siteflow.Projects.Project
        |> Ash.Changeset.for_create(:create, input, actor: nil, authorize?: false)

      assert changeset.valid?
    end
  end
end
```

### Testing Validations

```elixir
defmodule Siteflow.RequestsTest do
  use Siteflow.DataCase

  describe "request validations" do
    test "validates Swedish organization number format" do
      attrs = %{
        project_type: :website,
        email: "test@example.com",
        org_number: "556194-7986"  # Valid Swedish org number
      }

      assert {:ok, request} =
        Siteflow.Requests.Request
        |> Ash.Changeset.for_create(:create, attrs)
        |> Ash.create()
    end

    test "rejects invalid organization number" do
      attrs = %{
        project_type: :website,
        email: "test@example.com",
        org_number: "123456-7890"  # Invalid
      }

      assert {:error, %Ash.Error.Invalid{errors: errors}} =
        Siteflow.Requests.Request
        |> Ash.Changeset.for_create(:create, attrs)
        |> Ash.create()

      clean_errors = Enum.map(errors, &Ash.Error.clear_stacktraces/1)

      assert Enum.any?(clean_errors, fn error ->
        error.field == :org_number
      end)
    end
  end
end
```

### Testing Policies

```elixir
defmodule Siteflow.TicketPolicyTest do
  use Siteflow.DataCase

  describe "ticket read policies" do
    test "admin can read all tickets" do
      admin = create_user(role: :admin, company_id: company1.id)
      ticket = create_ticket(company_id: company2.id)

      assert Ash.can?(
        {Siteflow.Tickets.Ticket, :read},
        admin,
        tenant: company2.id
      )
    end

    test "customer can only read their company's tickets" do
      customer = create_user(role: :customer, company_id: company1.id)
      ticket = create_ticket(company_id: company2.id)

      refute Ash.can?(
        {Siteflow.Tickets.Ticket, :read},
        customer,
        tenant: company2.id
      )
    end
  end
end
```

### Testing State Machines

```elixir
defmodule Siteflow.RequestStateMachineTest do
  use Siteflow.DataCase

  describe "request state transitions" do
    test "can transition from NY to GRANSKAS" do
      request = create_request(status: :ny)

      assert {:ok, updated_request} =
        request
        |> Ash.Changeset.for_update(:granska)
        |> Ash.update()

      assert updated_request.status == :granskas
    end

    test "cannot transition from NY to GODKÄND directly" do
      request = create_request(status: :ny)

      assert {:error, %Ash.Error.Invalid{}} =
        request
        |> Ash.Changeset.for_update(:godkann)
        |> Ash.update()
    end
  end
end
```

---

## 12. Performance & Indexing

### Database Indexes

```elixir
defmodule Siteflow.Projects.Project do
  postgres do
    table "projects"
    repo Siteflow.Repo

    # Custom composite indexes
    custom_indexes do
      # For filtering by company and status
      index ["company_id", "status"]

      # For date range queries
      index ["created_at"]
      index ["updated_at"]

      # For search queries (using GIN for full-text)
      index ["name"], using: "GIN", to_tsvector: "english"
    end
  end

  # Identities auto-create unique indexes
  identities do
    identity :unique_name_per_company, [:company_id, :name]
    identity :unique_project_code, [:project_code]
  end
end
```

### Eager Loading to Prevent N+1 Queries

```elixir
# BAD: N+1 queries
projects = Siteflow.Projects.Project |> Ash.read!()

Enum.each(projects, fn project ->
  # This triggers a separate query for each project!
  company = project.company
end)

# GOOD: Eager load with `load`
projects =
  Siteflow.Projects.Project
  |> Ash.Query.load([:company, :checklists])
  |> Ash.read!()

# GOOD: Nested loading
projects =
  Siteflow.Projects.Project
  |> Ash.Query.load([
    :company,
    checklists: [:items],
    tasks: [:assigned_to]
  ])
  |> Ash.read!()

# GOOD: Load in action with prepare build
actions do
  read :read do
    primary? true
    prepare build(load: [:company, :team])
  end
end
```

### Pagination for Large Datasets

```elixir
# Offset pagination
projects =
  Siteflow.Projects.Project
  |> Ash.Query.offset(20)
  |> Ash.Query.limit(10)
  |> Ash.read!()

# Keyset pagination (more efficient for large datasets)
projects =
  Siteflow.Projects.Project
  |> Ash.Query.page(keyset: page_token, limit: 50)
  |> Ash.read!()
```

### Filtering and Sorting Performance

```elixir
# Use indexed columns for filtering
Siteflow.Projects.Project
|> Ash.Query.filter(company_id == ^company_id and status in [:active, :planning])
|> Ash.Query.sort(created_at: :desc)
|> Ash.read!()

# Aggregates are optimized by data layer
Siteflow.Projects.Project
|> Ash.Query.load(:progress_percentage)
|> Ash.Query.filter(progress_percentage > 50)
|> Ash.read!()
```

---

## 13. Complete Resource Examples for Siteflow

### 1. Request Resource (Full Example)

```elixir
defmodule Siteflow.Requests.Request do
  use Ash.Resource,
    domain: Siteflow.Requests,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshStateMachine],
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "requests"
    repo Siteflow.Repo

    custom_indexes do
      index ["company_id", "status"]
      index ["created_at"]
    end
  end

  state_machine do
    initial_states [:ny]
    default_initial_state :ny

    transitions do
      transition :granska, from: :ny, to: :granskas
      transition :planera, from: :granskas, to: :planeras
      transition :skicka_for_godkannande, from: :planeras, to: :vantar_godkannande
      transition :godkann, from: :vantar_godkannande, to: :godkand
      transition :begara_andringar, from: :vantar_godkannande, to: :planeras
      transition :avbryt, from: [:ny, :granskas, :planeras, :vantar_godkannande], to: :avbruten
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :status, :atom do
      allow_nil? false
      default :ny
      constraints [one_of: [:ny, :granskas, :planeras, :vantar_godkannande, :godkand, :avbruten]]
    end

    attribute :project_type, :atom do
      allow_nil? false
      constraints [one_of: [:website, :system, :other]]
    end

    attribute :email, :string do
      allow_nil? false
      constraints [
        match: ~r/^[^\s]+@[^\s]+\.[^\s]+$/,
        max_length: 255
      ]
    end

    attribute :phone, :string
    attribute :company_name, :string
    attribute :org_number, :string
    attribute :budget_range, :string
    attribute :timeline, :string
    attribute :description, :string
    attribute :form_response, :map
    attribute :rejection_reason, :string

    create_timestamp :created_at
    update_timestamp :updated_at
    attribute :reviewed_at, :utc_datetime
  end

  relationships do
    belongs_to :company, Siteflow.Companies.Company
    has_many :attachments, Siteflow.Attachments.Attachment
  end

  actions do
    defaults [:read, :destroy]
    default_accept [:project_type, :email, :phone, :company_name, :org_number, :budget_range, :timeline, :description, :form_response]

    create :create do
      primary? true
      accept [:project_type, :email, :phone, :company_name, :org_number, :budget_range, :timeline, :description, :form_response]
      change transition_state(:ny)
    end

    update :update do
      primary? true
    end

    update :granska do
      accept []
      change transition_state(:granskas)
      change set_attribute(:reviewed_at, &DateTime.utc_now/0)
    end

    update :convert_to_project do
      argument :project_name, :string, allow_nil?: false
      argument :project_description, :string
      change Siteflow.Requests.Changes.ConvertToProject
      change transition_state(:godkand)
    end
  end

  policies do
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
    end

    policy action_type(:create) do
      authorize_if always()
    end

    policy action_type([:update, :destroy]) do
      authorize_if actor_attribute_equals(:role, :admin)
    end
  end

  code_interface do
    define :create, args: [:project_type, :email]
    define :get_by_id, action: :read, get_by: :id
    define :list_all, action: :read
  end
end
```

### 2. Project Resource (Full Example)

```elixir
defmodule Siteflow.Projects.Project do
  use Ash.Resource,
    domain: Siteflow.Projects,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "projects"
    repo Siteflow.Repo

    custom_indexes do
      index ["company_id", "status"]
      index ["created_at"]
    end
  end

  multitenancy do
    strategy :attribute
    attribute :company_id
    global? true
  end

  attributes do
    uuid_primary_key :id

    attribute :name, :string do
      allow_nil? false
      constraints [min_length: 3, max_length: 100]
    end

    attribute :description, :string

    attribute :project_type, :atom do
      allow_nil? false
      constraints [one_of: [:website, :system, :other]]
    end

    attribute :status, :atom do
      allow_nil? false
      default :planning
      constraints [one_of: [:planning, :in_progress, :review, :completed, :on_hold, :cancelled]]
    end

    attribute :start_date, :date
    attribute :end_date, :date
    attribute :estimated_hours, :integer
    attribute :actual_hours, :integer

    create_timestamp :created_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :company, Siteflow.Companies.Company do
      allow_nil? false
    end

    has_many :tasks, Siteflow.Tasks.Task
    has_many :checklists, Siteflow.Checklists.Checklist
    has_many :tickets, Siteflow.Tickets.Ticket
    has_many :contracts, Siteflow.Contracts.Contract
    has_many :invoices, Siteflow.Invoices.Invoice
    has_one :product_plan, Siteflow.ProductPlans.ProductPlan
    has_one :team, Siteflow.Teams.Team
  end

  aggregates do
    count :total_checklist_items, [:checklists, :items]
    count :completed_checklist_items, [:checklists, :items] do
      filter expr(items.completed == true)
    end
    count :total_tasks, :tasks
    count :completed_tasks, :tasks do
      filter expr(status == :completed)
    end
  end

  calculations do
    calculate :progress_percentage, :decimal do
      expr(
        if total_checklist_items > 0 do
          (completed_checklist_items / total_checklist_items) * 100
        else
          0
        end
      )
    end

    calculate :is_overdue, :boolean do
      expr(end_date != nil and end_date < ^Date.utc_today() and status not in [:completed, :cancelled])
    end
  end

  actions do
    defaults [:read, :destroy]
    default_accept [:name, :description, :project_type, :status, :start_date, :end_date, :estimated_hours, :actual_hours]

    create :create do
      primary? true
      accept [:name, :description, :project_type, :company_id, :start_date, :end_date, :estimated_hours]
    end

    update :update do
      primary? true
    end

    read :read do
      primary? true
      prepare build(load: [:company, :progress_percentage])
    end
  end

  policies do
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
    end

    policy action_type(:read) do
      authorize_if expr(company_id == ^actor(:company_id))
    end

    policy action_type([:create, :update, :destroy]) do
      authorize_if actor_attribute_equals(:role, :admin)
    end
  end

  identities do
    identity :unique_name_per_company, [:company_id, :name]
  end

  code_interface do
    define :create, args: [:name, :company_id]
    define :get_by_id, action: :read, get_by: :id
    define :list_for_company, action: :read, args: [:company_id]
  end
end
```

### 3. Contract Resource (Full Example)

```elixir
defmodule Siteflow.Contracts.Contract do
  use Ash.Resource,
    domain: Siteflow.Contracts,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshStateMachine],
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "contracts"
    repo Siteflow.Repo
  end

  state_machine do
    initial_states [:draft]
    default_initial_state :draft

    transitions do
      transition :send_for_signing, from: :draft, to: :pending_signature
      transition :sign, from: :pending_signature, to: :signed
      transition :activate, from: :signed, to: :active
      transition :complete, from: :active, to: :completed
      transition :cancel, from: [:draft, :pending_signature, :signed, :active], to: :cancelled
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :status, :atom do
      allow_nil? false
      default :draft
    end

    attribute :contract_type, :atom do
      allow_nil? false
      constraints [one_of: [:fixed_price, :time_and_materials, :retainer]]
    end

    attribute :title, :string, allow_nil?: false
    attribute :description, :string
    attribute :terms, :string
    attribute :total_amount, :decimal
    attribute :currency, :string, default: "SEK"

    attribute :start_date, :date
    attribute :end_date, :date

    attribute :signed_at, :utc_datetime
    attribute :signed_by, :string
    attribute :signature_data, :string, sensitive?: true

    create_timestamp :created_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :project, Siteflow.Projects.Project do
      allow_nil? false
    end

    belongs_to :company, Siteflow.Companies.Company do
      allow_nil? false
    end

    has_many :invoices, Siteflow.Invoices.Invoice
  end

  actions do
    defaults [:read, :destroy]
    default_accept [:contract_type, :title, :description, :terms, :total_amount, :currency, :start_date, :end_date]

    create :create do
      primary? true
      accept [:project_id, :company_id, :contract_type, :title, :description, :terms, :total_amount, :start_date, :end_date]
      change transition_state(:draft)
    end

    update :update do
      primary? true
    end

    update :send_for_signing do
      accept []
      change transition_state(:pending_signature)
    end

    update :sign do
      argument :signature_data, :string, allow_nil?: false
      argument :signed_by, :string, allow_nil?: false

      change transition_state(:signed)
      change set_attribute(:signed_at, &DateTime.utc_now/0)
      change set_attribute(:signed_by, arg(:signed_by))
      change set_attribute(:signature_data, arg(:signature_data))
    end

    update :activate do
      accept []
      change transition_state(:active)
    end
  end

  policies do
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
    end

    policy action_type(:read) do
      authorize_if expr(company_id == ^actor(:company_id))
    end

    policy action_type([:create, :update]) do
      authorize_if actor_attribute_equals(:role, :admin)
    end

    policy action(:sign) do
      authorize_if expr(company_id == ^actor(:company_id))
    end
  end

  code_interface do
    define :create, args: [:project_id, :title]
    define :get_by_id, action: :read, get_by: :id
  end
end
```

### 4. Invoice Resource (Full Example)

```elixir
defmodule Siteflow.Invoices.Invoice do
  use Ash.Resource,
    domain: Siteflow.Invoices,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshOban],
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "invoices"
    repo Siteflow.Repo
  end

  oban do
    triggers do
      trigger :send_overdue_reminders do
        action :send_reminder
        scheduler_cron "0 9 * * *"
        where expr(status == :unpaid and due_date < ^Date.utc_today())
        queue :invoices_process
        on_error :mark_reminder_failed
      end
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :invoice_number, :string do
      allow_nil? false
    end

    attribute :status, :atom do
      allow_nil? false
      default :draft
      constraints [one_of: [:draft, :sent, :paid, :unpaid, :overdue, :cancelled]]
    end

    attribute :items, {:array, Siteflow.Invoices.InvoiceItem}, default: []

    attribute :subtotal, :decimal
    attribute :tax_amount, :decimal
    attribute :total_amount, :decimal
    attribute :currency, :string, default: "SEK"

    attribute :issue_date, :date
    attribute :due_date, :date
    attribute :paid_date, :date

    attribute :notes, :string
    attribute :payment_terms, :string

    attribute :last_reminder_sent_at, :utc_datetime

    create_timestamp :created_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :project, Siteflow.Projects.Project
    belongs_to :company, Siteflow.Companies.Company do
      allow_nil? false
    end
    belongs_to :contract, Siteflow.Contracts.Contract
  end

  aggregates do
    count :item_count, :items
  end

  calculations do
    calculate :calculated_subtotal, :decimal do
      calculation fn records, _context ->
        Enum.map(records, fn invoice ->
          Enum.reduce(invoice.items, Decimal.new(0), fn item, acc ->
            item_total = Decimal.mult(item.quantity, item.unit_price)
            Decimal.add(acc, item_total)
          end)
        end)
      end
    end

    calculate :calculated_tax, :decimal do
      expr(calculated_subtotal * 0.25)
    end

    calculate :calculated_total, :decimal do
      expr(calculated_subtotal * 1.25)
    end

    calculate :is_overdue, :boolean do
      expr(status == :unpaid and due_date < ^Date.utc_today())
    end
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      primary? true
      accept [:project_id, :company_id, :contract_id, :invoice_number, :items, :issue_date, :due_date, :notes, :payment_terms]

      change fn changeset, _context ->
        # Auto-calculate totals
        items = Ash.Changeset.get_attribute(changeset, :items) || []

        subtotal = calculate_subtotal(items)
        tax = Decimal.mult(subtotal, Decimal.new("0.25"))
        total = Decimal.add(subtotal, tax)

        changeset
        |> Ash.Changeset.change_attribute(:subtotal, subtotal)
        |> Ash.Changeset.change_attribute(:tax_amount, tax)
        |> Ash.Changeset.change_attribute(:total_amount, total)
      end
    end

    update :mark_as_paid do
      accept []

      change fn changeset, _context ->
        changeset
        |> Ash.Changeset.change_attribute(:status, :paid)
        |> Ash.Changeset.change_attribute(:paid_date, Date.utc_today())
      end
    end

    update :send_reminder do
      accept []

      change fn changeset, _context ->
        invoice = changeset.data
        Siteflow.Mailer.send_invoice_reminder(invoice)
        Ash.Changeset.change_attribute(changeset, :last_reminder_sent_at, DateTime.utc_now())
      end
    end

    update :mark_reminder_failed do
      argument :error, :map
      accept []
    end
  end

  policies do
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
    end

    policy action_type(:read) do
      authorize_if expr(company_id == ^actor(:company_id))
    end

    policy action_type([:create, :update, :destroy]) do
      authorize_if actor_attribute_equals(:role, :admin)
    end
  end

  identities do
    identity :unique_invoice_number, [:invoice_number]
  end

  code_interface do
    define :create, args: [:company_id, :invoice_number]
    define :get_by_id, action: :read, get_by: :id
  end

  defp calculate_subtotal(items) do
    Enum.reduce(items, Decimal.new(0), fn item, acc ->
      item_total = Decimal.mult(item.quantity, item.unit_price)
      Decimal.add(acc, item_total)
    end)
  end
end
```

---

## Swedish Validation Patterns

### Organization Number Validation

```elixir
defmodule Siteflow.Validations.SwedishOrgNumber do
  use Ash.Resource.Validation

  def validate(changeset, _opts, _context) do
    org_number = Ash.Changeset.get_attribute(changeset, :org_number)

    if org_number && !valid_org_number?(org_number) do
      {:error, field: :org_number, message: "Invalid Swedish organization number"}
    else
      :ok
    end
  end

  defp valid_org_number?(org_number) do
    # Remove dashes
    digits = String.replace(org_number, "-", "")

    # Should be 10 digits
    if String.length(digits) != 10 do
      false
    else
      # Validate using Luhn algorithm (modulo 10)
      luhn_check(digits)
    end
  end

  defp luhn_check(digits) do
    digits
    |> String.graphemes()
    |> Enum.map(&String.to_integer/1)
    |> Enum.reverse()
    |> Enum.with_index()
    |> Enum.map(fn {digit, index} ->
      if rem(index, 2) == 1 do
        doubled = digit * 2
        if doubled > 9, do: doubled - 9, else: doubled
      else
        digit
      end
    end)
    |> Enum.sum()
    |> rem(10) == 0
  end
end

# Usage in resource
defmodule Siteflow.Companies.Company do
  attributes do
    attribute :org_number, :string
  end

  validations do
    validate Siteflow.Validations.SwedishOrgNumber, on: [:create, :update]
  end
end
```

---

## Summary: Key Takeaways for Siteflow Backend

### 1. **Resource-First Architecture**
- Define domain entities as Ash Resources with declarative DSL
- Each resource includes attributes, relationships, actions, policies, and calculations
- Resources drive all APIs (JSON:API, GraphQL, LiveView forms)

### 2. **State Machines for Workflows**
- Use AshStateMachine for Request status flows (NY → GRANSKAS → PLANERAS → VÄNTAR_GODKÄNNANDE → GODKÄND)
- Define transitions with guards and dynamic logic using Change modules
- State machines prevent invalid transitions and enforce business rules

### 3. **Multi-Tenant RBAC**
- Attribute-based multi-tenancy with `company_id`
- Policy Authorizer for role-based access (Admin sees all, Customer sees only their company)
- Field-level policies for sensitive data (e.g., `internal_notes`)
- Custom policy checks (e.g., `ActorBelongsToTenant`)

### 4. **Complex Relationships**
- Standard: `belongs_to`, `has_many`, `has_one`
- Many-to-many: Join tables with composite primary keys (TeamMember)
- Polymorphic: Multiple `belongs_to` with type indicator (Attachments)
- Custom "through" relationships using `no_attributes?` and `filter`

### 5. **JSONB for Flexible Data**
- Embedded resources for form responses (23-31 questions)
- Arrays of embedded types (Invoice items)
- Query JSONB fields with `get_path` expressions

### 6. **Custom Actions & Workflows**
- Transaction hooks: `before_transaction`, `before_action`, `after_action`, `after_transaction`
- Complex workflows: Convert Request → Customer + Project in single transaction
- Change modules for reusable business logic

### 7. **Calculations & Aggregates**
- Expression-based calculations (progress_percentage)
- Custom calculation modules for complex logic
- Aggregates prevent N+1 queries (count, sum, avg, max, min)

### 8. **Authentication**
- AshAuthentication with password strategy
- JWT tokens with refresh token implementation (1 hour access, 30 day refresh)
- Multi-tenant tokens with custom claims (`company_id`, `role`)

### 9. **Background Jobs**
- AshOban for scheduled actions and triggers
- Cron-based triggers (daily invoice reminders)
- Event-based triggers (notify on ticket creation)

### 10. **Real-Time**
- Phoenix PubSub integration via Ash Notifiers
- LiveView subscriptions for real-time updates
- Per-project topic subscriptions (tickets, chat messages)

### 11. **Testing**
- Property-based testing with Ash Generators
- Policy testing with `Ash.can?`
- State machine transition testing
- Validation testing with error matching

### 12. **Performance**
- Custom indexes for filtered queries
- Eager loading with `load` to prevent N+1
- Pagination (offset and keyset)
- Identities auto-generate unique indexes

---

## Next Steps for Implementation

1. **Set up project structure**:
   ```bash
   mix igniter.new siteflow --install ash,ash_postgres,ash_authentication,ash_json_api
   ```

2. **Define core domains**:
   - `Siteflow.Accounts` (User, Company)
   - `Siteflow.Requests` (Request)
   - `Siteflow.Projects` (Project, Team, TeamMember)
   - `Siteflow.Tickets` (Ticket, TicketMessage)
   - `Siteflow.Contracts` (Contract)
   - `Siteflow.Invoices` (Invoice)
   - `Siteflow.Documents` (PlanDocument)
   - `Siteflow.Tasks` (Task)
   - `Siteflow.Checklists` (Checklist, ChecklistItem)

3. **Generate migrations**:
   ```bash
   mix ash_postgres.generate_migrations
   mix ash.migrate
   ```

4. **Implement authentication**:
   - User resource with AshAuthentication
   - JWT token generation
   - Refresh token flow

5. **Build API layer**:
   - AshJsonApi for REST API
   - Or AshGraphql for GraphQL API

6. **Add real-time features**:
   - PubSub notifier
   - LiveView subscriptions

7. **Configure background jobs**:
   - AshOban triggers for reminders
   - Scheduled actions for reports

This research provides a comprehensive foundation for building the Siteflow backend with Ash Framework 3.0+.
