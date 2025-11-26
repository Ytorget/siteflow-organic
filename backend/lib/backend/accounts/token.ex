defmodule Backend.Accounts.Token do
  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Accounts,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshAuthentication.TokenResource]

  postgres do
    table "tokens"
    repo Backend.Repo
  end

  actions do
    defaults [:read, :destroy]
  end
end
