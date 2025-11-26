defmodule Backend.Accounts.User do
  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Accounts,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshAuthentication, AshJsonApi.Resource, AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "User"
  end

  postgres do
    table "users"
    repo Backend.Repo
  end

  json_api do
    type "user"
  end

  authentication do
    tokens do
      enabled? true
      token_resource Backend.Accounts.Token
      require_token_presence_for_authentication? true
      signing_secret fn _, _ ->
        Application.fetch_env(:backend, :token_signing_secret)
      end
    end

    strategies do
      password :password do
        identity_field :email
        hashed_password_field :hashed_password
        hash_provider Backend.HashProvider
        confirmation_required? false

        register_action_accept [:first_name, :last_name, :company_id]
      end
    end
  end

  policies do
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end

    policy action_type(:read) do
      authorize_if always()
    end
  end

  actions do
    defaults [:read]

    read :get_by_email do
      description "Look up a user by email"
      get? true
      argument :email, :ci_string, allow_nil?: false
      filter expr(email == ^arg(:email))
    end

    update :update_profile do
      accept [:first_name, :last_name, :phone]
    end

    update :assign_role do
      accept [:role]
      argument :role, :atom, allow_nil?: false, constraints: [one_of: [:admin, :manager, :user, :viewer]]
      change set_attribute(:role, arg(:role))
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :email, :ci_string do
      allow_nil? false
      public? true
    end

    attribute :hashed_password, :string do
      allow_nil? false
      sensitive? true
    end

    attribute :first_name, :string do
      allow_nil? false
      public? true
    end

    attribute :last_name, :string do
      allow_nil? false
      public? true
    end

    attribute :phone, :string do
      public? true
    end

    attribute :role, :atom do
      constraints one_of: [:admin, :manager, :user, :viewer]
      default :user
      public? true
    end

    attribute :is_active, :boolean do
      default true
      public? true
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :company, Backend.Portal.Company do
      allow_nil? true
      public? true
    end
  end

  identities do
    identity :unique_email, [:email]
  end
end
