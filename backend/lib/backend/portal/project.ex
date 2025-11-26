defmodule Backend.Portal.Project do
  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Portal,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshJsonApi.Resource, AshStateMachine, AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "Project"
  end

  postgres do
    table "projects"
    repo Backend.Repo
  end

  json_api do
    type "project"
  end

  state_machine do
    initial_states [:draft]
    default_initial_state :draft

    transitions do
      transition :submit, from: :draft, to: :pending_approval
      transition :approve, from: :pending_approval, to: :in_progress
      transition :reject, from: :pending_approval, to: :draft
      transition :pause, from: :in_progress, to: :on_hold
      transition :resume, from: :on_hold, to: :in_progress
      transition :complete, from: :in_progress, to: :completed
      transition :cancel, from: [:draft, :pending_approval, :in_progress, :on_hold], to: :cancelled
    end
  end

  policies do
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(company_id == ^actor(:company_id))
    end

    policy action_type(:create) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(^actor(:role) in [:manager])
    end

    policy action_type(:update) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(company_id == ^actor(:company_id) and ^actor(:role) in [:manager])
    end
  end

  actions do
    defaults [:read]

    create :create do
      accept [:name, :description, :company_id, :budget, :start_date, :target_end_date]
    end

    update :update do
      accept [:name, :description, :budget, :target_end_date]
    end

    update :submit do
      change transition_state(:pending_approval)
    end

    update :approve do
      change transition_state(:in_progress)
      change set_attribute(:approved_at, &DateTime.utc_now/0)
    end

    update :reject do
      accept [:rejection_reason]
      change transition_state(:draft)
    end

    update :pause do
      change transition_state(:on_hold)
    end

    update :resume do
      change transition_state(:in_progress)
    end

    update :complete do
      change transition_state(:completed)
      change set_attribute(:actual_end_date, &DateTime.utc_now/0)
    end

    update :cancel do
      accept [:cancellation_reason]
      change transition_state(:cancelled)
    end

    read :by_company do
      argument :company_id, :uuid, allow_nil?: false
      filter expr(company_id == ^arg(:company_id))
    end

    read :active do
      filter expr(state in [:in_progress, :on_hold])
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :name, :string do
      allow_nil? false
      public? true
    end

    attribute :description, :string do
      public? true
    end

    attribute :state, :atom do
      constraints one_of: [:draft, :pending_approval, :in_progress, :on_hold, :completed, :cancelled]
      default :draft
      allow_nil? false
      public? true
    end

    attribute :budget, :decimal do
      public? true
      description "Project budget in SEK"
    end

    attribute :spent, :decimal do
      default 0
      public? true
      description "Amount spent so far in SEK"
    end

    attribute :start_date, :date do
      public? true
    end

    attribute :target_end_date, :date do
      public? true
    end

    attribute :actual_end_date, :utc_datetime do
      public? true
    end

    attribute :approved_at, :utc_datetime do
      public? true
    end

    attribute :rejection_reason, :string do
      public? true
    end

    attribute :cancellation_reason, :string do
      public? true
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :company, Backend.Portal.Company do
      allow_nil? false
      public? true
    end

    has_many :tickets, Backend.Portal.Ticket
    has_many :time_entries, Backend.Portal.TimeEntry
    has_many :documents, Backend.Portal.Document
  end
end
