defmodule Backend.Portal.Document do
  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Portal,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshJsonApi.Resource, AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "Document"
  end

  postgres do
    table "documents"
    repo Backend.Repo
  end

  json_api do
    type "document"
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

    policy action(:destroy) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(uploaded_by_id == ^actor(:id))
    end
  end

  actions do
    defaults [:read]

    create :create do
      accept [:name, :description, :file_path, :file_size, :mime_type, :project_id, :category]
      change relate_actor(:uploaded_by)
    end

    destroy :destroy do
    end

    read :by_project do
      argument :project_id, :uuid, allow_nil?: false
      filter expr(project_id == ^arg(:project_id))
    end

    read :by_category do
      argument :category, :atom, allow_nil?: false
      filter expr(category == ^arg(:category))
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

    attribute :file_path, :string do
      allow_nil? false
      public? true
    end

    attribute :file_size, :integer do
      public? true
      description "File size in bytes"
    end

    attribute :mime_type, :string do
      public? true
    end

    attribute :category, :atom do
      constraints one_of: [:contract, :specification, :design, :report, :invoice, :other]
      default :other
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

    belongs_to :uploaded_by, Backend.Accounts.User do
      allow_nil? false
      public? true
    end
  end
end
