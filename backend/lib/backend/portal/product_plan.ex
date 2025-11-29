defmodule Backend.Portal.ProductPlan do
  @moduledoc """
  Product plans created by admins and sent to customers for approval.

  Workflow:
  1. Admin creates draft plan (from form responses or manually)
  2. Admin sends plan to customer
  3. Customer views and reviews plan
  4. Customer approves or requests changes
  5. If changes requested, admin revises and re-sends
  6. Approved plan becomes the project specification

  Statuses:
  - draft: Being created/edited by admin
  - sent: Sent to customer, awaiting review
  - viewed: Customer has opened the plan
  - approved: Customer approved the plan
  - changes_requested: Customer wants modifications
  - revised: Admin has revised based on feedback (goes back to sent)
  - archived: Old version or cancelled plan
  """

  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Portal,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshTypescript.Resource, AshStateMachine],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "ProductPlan"
  end

  state_machine do
    initial_states [:draft]
    default_initial_state :draft

    transitions do
      transition :send_to_customer, from: [:draft, :revised], to: :sent
      transition :mark_viewed, from: :sent, to: :viewed
      transition :approve, from: [:sent, :viewed], to: :approved
      transition :request_changes, from: [:sent, :viewed], to: :changes_requested
      transition :revise, from: :changes_requested, to: :revised
      transition :archive, from: [:draft, :sent, :viewed, :approved, :changes_requested, :revised], to: :archived
    end
  end

  postgres do
    table "product_plans"
    repo Backend.Repo
  end

  policies do
    # Siteflow staff can read all product plans
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :siteflow_admin)
      authorize_if expr(
        ^actor(:role) in [:siteflow_kam, :siteflow_pl, :siteflow_dev_frontend,
                          :siteflow_dev_backend, :siteflow_dev_fullstack]
      )
      # Customers can read plans for their projects
      authorize_if expr(project.company_id == ^actor(:company_id))
    end

    # Only admins and KAMs can create/update plans
    policy action_type(:create) do
      authorize_if actor_attribute_equals(:role, :siteflow_admin)
      authorize_if actor_attribute_equals(:role, :siteflow_kam)
    end

    policy action_type(:update) do
      authorize_if actor_attribute_equals(:role, :siteflow_admin)
      authorize_if actor_attribute_equals(:role, :siteflow_kam)
    end

    # Customer actions - approve, request changes, mark viewed
    policy action(:mark_viewed) do
      authorize_if expr(project.company_id == ^actor(:company_id))
    end

    policy action(:approve) do
      authorize_if expr(project.company_id == ^actor(:company_id))
    end

    policy action(:request_changes) do
      authorize_if expr(project.company_id == ^actor(:company_id))
    end

    policy action_type(:destroy) do
      authorize_if actor_attribute_equals(:role, :siteflow_admin)
    end
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      accept [:project_id, :title, :content, :summary, :pdf_url, :metadata]
      change relate_actor(:created_by)
    end

    update :update do
      accept [:title, :content, :summary, :pdf_url, :metadata]
    end

    # Admin sends plan to customer
    update :send_to_customer do
      require_atomic? false
      change set_attribute(:status, :sent)
      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :sent_at, DateTime.utc_now())
      end
    end

    # Customer marks plan as viewed
    update :mark_viewed do
      require_atomic? false
      # Only update if not already viewed
      change fn changeset, _context ->
        if is_nil(Ash.Changeset.get_attribute(changeset, :viewed_at)) do
          changeset
          |> Ash.Changeset.force_change_attribute(:status, :viewed)
          |> Ash.Changeset.force_change_attribute(:viewed_at, DateTime.utc_now())
        else
          changeset
        end
      end
    end

    # Customer approves the plan
    update :approve do
      require_atomic? false
      argument :feedback, :string, allow_nil?: true
      change set_attribute(:status, :approved)
      change fn changeset, context ->
        changeset
        |> Ash.Changeset.force_change_attribute(:approved_at, DateTime.utc_now())
        |> Ash.Changeset.force_change_attribute(:customer_feedback, changeset.arguments[:feedback])
        |> Ash.Changeset.manage_relationship(:approved_by, context.actor, type: :append_and_remove)
      end
    end

    # Customer requests changes
    update :request_changes do
      require_atomic? false
      argument :feedback, :string, allow_nil?: false
      argument :change_requests, :map, allow_nil?: true
      change set_attribute(:status, :changes_requested)
      change fn changeset, _context ->
        changeset
        |> Ash.Changeset.force_change_attribute(:rejected_at, DateTime.utc_now())
        |> Ash.Changeset.force_change_attribute(:customer_feedback, changeset.arguments[:feedback])
        |> Ash.Changeset.force_change_attribute(:change_requests, changeset.arguments[:change_requests] || %{})
      end
    end

    # Admin revises plan based on feedback
    update :revise do
      require_atomic? false
      accept [:title, :content, :summary, :pdf_url]
      change set_attribute(:status, :revised)
      change fn changeset, _context ->
        # Increment version
        current_version = Ash.Changeset.get_attribute(changeset, :version) || 1
        Ash.Changeset.force_change_attribute(changeset, :version, current_version + 1)
      end
      change fn changeset, _context ->
        # Clear previous timestamps for new cycle
        changeset
        |> Ash.Changeset.force_change_attribute(:sent_at, nil)
        |> Ash.Changeset.force_change_attribute(:viewed_at, nil)
        |> Ash.Changeset.force_change_attribute(:approved_at, nil)
        |> Ash.Changeset.force_change_attribute(:rejected_at, nil)
      end
    end

    # Archive old plans
    update :archive do
      change set_attribute(:status, :archived)
    end

    read :by_project do
      argument :project_id, :uuid, allow_nil?: false
      filter expr(project_id == ^arg(:project_id))
      prepare build(sort: [version: :desc])
    end

    read :active_by_project do
      argument :project_id, :uuid, allow_nil?: false
      get? true
      filter expr(project_id == ^arg(:project_id) and status != :archived)
    end

    read :pending_approval do
      description "Plans waiting for customer review"
      filter expr(status in [:sent, :viewed])
    end

    read :needing_revision do
      description "Plans where customer requested changes"
      filter expr(status == :changes_requested)
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :title, :string do
      allow_nil? false
      public? true
    end

    attribute :content, :string do
      allow_nil? false
      public? true
      description "Full plan content in Markdown format"
    end

    attribute :summary, :string do
      public? true
      description "Brief summary for preview/display"
    end

    attribute :pdf_url, :string do
      public? true
      description "URL to uploaded PDF version of the plan"
    end

    attribute :version, :integer do
      allow_nil? false
      default 1
      public? true
    end

    attribute :status, :atom do
      allow_nil? false
      default :draft
      public? true
      constraints one_of: [:draft, :sent, :viewed, :approved, :changes_requested, :revised, :archived]
    end

    attribute :sent_at, :utc_datetime_usec do
      public? true
    end

    attribute :viewed_at, :utc_datetime_usec do
      public? true
    end

    attribute :approved_at, :utc_datetime_usec do
      public? true
    end

    attribute :rejected_at, :utc_datetime_usec do
      public? true
    end

    attribute :customer_feedback, :string do
      public? true
      description "Customer's feedback or approval notes"
    end

    attribute :change_requests, :map do
      default %{}
      public? true
      description "Structured change requests from customer"
    end

    attribute :metadata, :map do
      default %{}
      public? true
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :project, Backend.Portal.Project do
      allow_nil? false
      public? true
    end

    belongs_to :created_by, Backend.Accounts.User do
      allow_nil? true
      public? true
    end

    belongs_to :approved_by, Backend.Accounts.User do
      allow_nil? true
      public? true
    end
  end

  calculations do
    calculate :is_pending_customer_action, :boolean, expr(
      status in [:sent, :viewed]
    ) do
      public? true
    end

    calculate :is_approved, :boolean, expr(status == :approved) do
      public? true
    end

    calculate :needs_admin_action, :boolean, expr(
      status in [:draft, :changes_requested, :revised]
    ) do
      public? true
    end

    calculate :days_since_sent, :integer, expr(
      fragment("EXTRACT(DAY FROM NOW() - ?)", sent_at)
    ) do
      public? true
    end
  end

  identities do
    identity :unique_active_per_project, [:project_id] do
      where expr(status != :archived)
    end
  end
end
