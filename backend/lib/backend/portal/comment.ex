defmodule Backend.Portal.Comment do
  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Portal,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshJsonApi.Resource, AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "Comment"
  end

  postgres do
    table "comments"
    repo Backend.Repo
  end

  json_api do
    type "comment"
  end

  policies do
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(ticket.project.company_id == ^actor(:company_id))
    end

    policy action_type(:create) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(^actor(:role) in [:manager, :user])
    end

    policy action(:update) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(author_id == ^actor(:id))
    end

    policy action(:destroy) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(author_id == ^actor(:id))
    end
  end

  actions do
    defaults [:read]

    create :create do
      accept [:body, :ticket_id, :is_internal]
      change relate_actor(:author)
    end

    update :update do
      accept [:body]
    end

    destroy :destroy do
    end

    read :by_ticket do
      argument :ticket_id, :uuid, allow_nil?: false
      filter expr(ticket_id == ^arg(:ticket_id))
    end

    read :public_comments do
      filter expr(is_internal == false)
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :body, :string do
      allow_nil? false
      public? true
    end

    attribute :is_internal, :boolean do
      default false
      public? true
      description "Internal comments are only visible to staff"
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :ticket, Backend.Portal.Ticket do
      allow_nil? false
      public? true
    end

    belongs_to :author, Backend.Accounts.User do
      allow_nil? false
      public? true
    end
  end
end
