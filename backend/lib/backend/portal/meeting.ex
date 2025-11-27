defmodule Backend.Portal.Meeting do
  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Portal,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "Meeting"
  end

  postgres do
    table "meetings"
    repo Backend.Repo

    references do
      reference :project, on_delete: :delete
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

    attribute :meeting_type, :atom do
      constraints one_of: [:kickoff, :status_update, :review, :planning, :retrospective, :other]
      default :other
      public? true
    end

    attribute :scheduled_at, :utc_datetime_usec do
      public? true
    end

    attribute :duration_minutes, :integer do
      default 60
      public? true
    end

    attribute :location, :string do
      public? true
    end

    attribute :meeting_url, :string do
      public? true
    end

    attribute :notes, :string do
      public? true
    end

    attribute :action_items, :map do
      public? true
    end

    attribute :attendees, {:array, :string} do
      public? true
    end

    attribute :status, :atom do
      constraints one_of: [:scheduled, :in_progress, :completed, :cancelled]
      default :scheduled
      public? true
    end

    create_timestamp :created_at
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
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      primary? true
      accept [:title, :description, :meeting_type, :scheduled_at, :duration_minutes,
              :location, :meeting_url, :notes, :action_items, :attendees, :status]
      argument :project_id, :uuid, allow_nil?: false

      change manage_relationship(:project_id, :project, type: :append)
      change relate_actor(:created_by)
    end

    update :update do
      primary? true
      accept [:title, :description, :meeting_type, :scheduled_at, :duration_minutes,
              :location, :meeting_url, :notes, :action_items, :attendees, :status]
    end

    update :start_meeting do
      accept []
      change set_attribute(:status, :in_progress)
    end

    update :complete_meeting do
      require_atomic? false
      accept [:notes, :action_items]
      change set_attribute(:status, :completed)
    end

    update :cancel_meeting do
      accept []
      change set_attribute(:status, :cancelled)
    end

    read :by_project do
      argument :project_id, :uuid, allow_nil?: false
      filter expr(project_id == ^arg(:project_id))
    end

    read :upcoming_by_project do
      argument :project_id, :uuid, allow_nil?: false
      filter expr(project_id == ^arg(:project_id) and status in [:scheduled, :in_progress])
    end
  end

  code_interface do
    define :create, args: [:title, :description, :meeting_type, :scheduled_at, :duration_minutes,
                           :location, :meeting_url, :notes, :action_items, :attendees, :status, :project_id]
    define :update, args: [:title, :description, :meeting_type, :scheduled_at, :duration_minutes,
                           :location, :meeting_url, :notes, :action_items, :attendees, :status]
    define :start_meeting
    define :complete_meeting, args: [:notes, :action_items]
    define :cancel_meeting
    define :by_project, args: [:project_id]
    define :upcoming_by_project, args: [:project_id]
    define :read
    define :destroy
  end

  policies do
    # Siteflow admins and project leaders can do everything
    policy always() do
      authorize_if actor_attribute_equals(:role, :siteflow_admin)
      authorize_if actor_attribute_equals(:role, :siteflow_pl)
    end

    # KAMs can manage meetings for their projects
    policy always() do
      authorize_if actor_attribute_equals(:role, :siteflow_kam)
    end

    # Customers can read and update meetings for their projects (add notes, etc.)
    policy action(:read) do
      authorize_if actor_attribute_equals(:role, :customer)
    end

    policy action(:by_project) do
      authorize_if actor_attribute_equals(:role, :customer)
    end

    policy action(:upcoming_by_project) do
      authorize_if actor_attribute_equals(:role, :customer)
    end

    policy action(:update) do
      authorize_if actor_attribute_equals(:role, :customer)
    end

    policy action(:complete_meeting) do
      authorize_if actor_attribute_equals(:role, :customer)
    end
  end
end
