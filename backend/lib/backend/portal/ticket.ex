defmodule Backend.Portal.Ticket do
  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Portal,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshJsonApi.Resource, AshStateMachine, AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "Ticket"
  end

  postgres do
    table "tickets"
    repo Backend.Repo
  end

  json_api do
    type "ticket"
  end

  state_machine do
    initial_states [:open]
    default_initial_state :open

    transitions do
      transition :assign, from: :open, to: :in_progress
      transition :start_work, from: :open, to: :in_progress
      transition :submit_for_review, from: :in_progress, to: :in_review
      transition :request_changes, from: :in_review, to: :in_progress
      transition :approve, from: :in_review, to: :resolved
      transition :reopen, from: :resolved, to: :open
      transition :close, from: [:open, :resolved], to: :closed
    end
  end

  policies do
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(project.company_id == ^actor(:company_id))
    end

    policy action_type(:create) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(^actor(:role) in [:manager, :user])
    end

    policy action_type(:update) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(project.company_id == ^actor(:company_id) and ^actor(:role) in [:manager, :user])
    end
  end

  actions do
    defaults [:read]

    create :create do
      accept [:title, :description, :project_id, :priority, :category]
      change relate_actor(:reporter)
    end

    update :update do
      accept [:title, :description, :priority, :category]
    end

    update :assign do
      require_atomic? false
      argument :assignee_id, :uuid, allow_nil?: false
      change manage_relationship(:assignee_id, :assignee, type: :append_and_remove)
      change transition_state(:in_progress)
    end

    update :start_work do
      change transition_state(:in_progress)
    end

    update :submit_for_review do
      change transition_state(:in_review)
    end

    update :request_changes do
      accept [:review_notes]
      change transition_state(:in_progress)
    end

    update :approve do
      change transition_state(:resolved)
      change set_attribute(:resolved_at, &DateTime.utc_now/0)
    end

    update :reopen do
      change transition_state(:open)
      change set_attribute(:resolved_at, nil)
    end

    update :close do
      change transition_state(:closed)
    end

    read :by_project do
      argument :project_id, :uuid, allow_nil?: false
      filter expr(project_id == ^arg(:project_id))
    end

    read :open_tickets do
      filter expr(state in [:open, :in_progress, :in_review])
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :title, :string do
      allow_nil? false
      public? true
    end

    attribute :description, :string do
      public? true
    end

    attribute :state, :atom do
      constraints one_of: [:open, :in_progress, :in_review, :resolved, :closed]
      default :open
      allow_nil? false
      public? true
    end

    attribute :priority, :atom do
      constraints one_of: [:low, :medium, :high, :critical]
      default :medium
      public? true
    end

    attribute :category, :atom do
      constraints one_of: [:bug, :feature, :support, :question, :task]
      default :task
      public? true
    end

    attribute :review_notes, :string do
      public? true
    end

    attribute :resolved_at, :utc_datetime do
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

    belongs_to :reporter, Backend.Accounts.User do
      public? true
    end

    belongs_to :assignee, Backend.Accounts.User do
      public? true
    end

    has_many :comments, Backend.Portal.Comment
    has_many :time_entries, Backend.Portal.TimeEntry
  end
end
