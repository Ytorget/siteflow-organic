defmodule Backend.Portal.Invitation do
  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Portal,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshJsonApi.Resource, AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "Invitation"
  end

  postgres do
    table "invitations"
    repo Backend.Repo

    identity_wheres_to_sql unique_pending_email_company: "accepted_at IS NULL AND cancelled_at IS NULL"
  end

  json_api do
    type "invitation"
  end

  policies do
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(company_id == ^actor(:company_id) and ^actor(:role) == :manager)
    end

    policy action_type(:create) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(^actor(:role) == :manager)
    end

    policy action(:accept) do
      # Anyone with the token can accept
      authorize_if always()
    end

    policy action(:cancel) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if expr(invited_by_id == ^actor(:id))
    end
  end

  actions do
    defaults [:read]

    create :create do
      accept [:email, :company_id, :role]
      change relate_actor(:invited_by)
      change fn changeset, _context ->
        token = :crypto.strong_rand_bytes(32) |> Base.url_encode64()
        expires_at = DateTime.utc_now() |> DateTime.add(7, :day)

        changeset
        |> Ash.Changeset.force_change_attribute(:token, token)
        |> Ash.Changeset.force_change_attribute(:expires_at, expires_at)
      end
    end

    update :accept do
      require_atomic? false
      argument :user_id, :uuid, allow_nil?: false
      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :accepted_at, DateTime.utc_now())
      end
      change manage_relationship(:user_id, :accepted_by, type: :append_and_remove)
    end

    update :cancel do
      require_atomic? false
      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :cancelled_at, DateTime.utc_now())
      end
    end

    read :by_token do
      get? true
      argument :token, :string, allow_nil?: false
      filter expr(token == ^arg(:token) and is_nil(accepted_at) and is_nil(cancelled_at) and expires_at > ^DateTime.utc_now())
    end

    read :pending do
      filter expr(is_nil(accepted_at) and is_nil(cancelled_at) and expires_at > ^DateTime.utc_now())
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :email, :ci_string do
      allow_nil? false
      public? true
    end

    attribute :token, :string do
      allow_nil? false
      sensitive? true
    end

    attribute :role, :atom do
      constraints one_of: [:manager, :user, :viewer]
      default :user
      public? true
    end

    attribute :expires_at, :utc_datetime do
      allow_nil? false
      public? true
    end

    attribute :accepted_at, :utc_datetime do
      public? true
    end

    attribute :cancelled_at, :utc_datetime do
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

    belongs_to :invited_by, Backend.Accounts.User do
      allow_nil? false
      public? true
    end

    belongs_to :accepted_by, Backend.Accounts.User do
      public? true
    end
  end

  identities do
    identity :unique_pending_email_company, [:email, :company_id] do
      where expr(is_nil(accepted_at) and is_nil(cancelled_at))
    end
  end
end
