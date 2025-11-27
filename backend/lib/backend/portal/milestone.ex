defmodule Backend.Portal.Milestone do
  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Portal,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "Milestone"
  end

  postgres do
    table "milestones"
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

    attribute :due_date, :date do
      public? true
    end

    attribute :completed_at, :utc_datetime_usec do
      public? true
    end

    attribute :order_index, :integer do
      default 0
      public? true
    end

    attribute :status, :atom do
      constraints one_of: [:pending, :in_progress, :completed]
      default :pending
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
      accept [:title, :description, :due_date, :order_index, :status]
      argument :project_id, :uuid, allow_nil?: false

      change manage_relationship(:project_id, :project, type: :append)
      change relate_actor(:created_by)
    end

    update :update do
      primary? true
      accept [:title, :description, :due_date, :order_index, :status]
    end

    update :mark_completed do
      require_atomic? false
      accept []
      change set_attribute(:status, :completed)
      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :completed_at, DateTime.utc_now())
      end
    end

    update :reopen do
      accept []
      change set_attribute(:status, :in_progress)
      change set_attribute(:completed_at, nil)
    end

    read :by_project do
      argument :project_id, :uuid, allow_nil?: false
      filter expr(project_id == ^arg(:project_id))
    end
  end

  code_interface do
    define :create, args: [:title, :description, :due_date, :order_index, :status, :project_id]
    define :update, args: [:title, :description, :due_date, :order_index, :status]
    define :mark_completed
    define :reopen
    define :by_project, args: [:project_id]
    define :read
    define :destroy
  end

  policies do
    # Siteflow admins and project leaders can do everything
    policy always() do
      authorize_if actor_attribute_equals(:role, :siteflow_admin)
      authorize_if actor_attribute_equals(:role, :siteflow_pl)
    end

    # KAMs can manage milestones for their projects
    policy always() do
      authorize_if actor_attribute_equals(:role, :siteflow_kam)
    end

    # Customers can read milestones for their projects
    policy action(:read) do
      authorize_if actor_attribute_equals(:role, :customer)
    end

    policy action(:by_project) do
      authorize_if actor_attribute_equals(:role, :customer)
    end
  end
end
