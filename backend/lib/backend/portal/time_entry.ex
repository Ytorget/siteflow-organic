defmodule Backend.Portal.TimeEntry do
  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Portal,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshJsonApi.Resource, AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "TimeEntry"
  end

  postgres do
    table "time_entries"
    repo Backend.Repo
  end

  json_api do
    type "time_entry"
  end

  policies do
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(project.company_id == ^actor(:company_id))
    end

    policy action_type(:create) do
      authorize_if actor_attribute_equals(:role, :admin)
    end

    policy action(:update) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(user_id == ^actor(:id))
    end
  end

  actions do
    defaults [:read]

    create :create do
      accept [:description, :hours, :date, :project_id, :ticket_id, :hourly_rate, :is_billable]
      change relate_actor(:user)
    end

    update :update do
      accept [:description, :hours, :is_billable]
    end

    read :by_project do
      argument :project_id, :uuid, allow_nil?: false
      filter expr(project_id == ^arg(:project_id))
    end

    read :by_ticket do
      argument :ticket_id, :uuid, allow_nil?: false
      filter expr(ticket_id == ^arg(:ticket_id))
    end

    read :billable do
      filter expr(is_billable == true)
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :description, :string do
      public? true
    end

    attribute :hours, :decimal do
      allow_nil? false
      public? true
      constraints min: 0, max: 24
    end

    attribute :date, :date do
      allow_nil? false
      public? true
    end

    attribute :hourly_rate, :decimal do
      public? true
      description "Hourly rate in SEK"
    end

    attribute :is_billable, :boolean do
      default true
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

    belongs_to :ticket, Backend.Portal.Ticket do
      public? true
    end

    belongs_to :user, Backend.Accounts.User do
      allow_nil? false
      public? true
    end
  end

  calculations do
    calculate :total_amount, :decimal, expr(hours * hourly_rate)
  end
end
