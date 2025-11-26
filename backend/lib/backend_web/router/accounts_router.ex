defmodule BackendWeb.AccountsRouter do
  use AshJsonApi.Router,
    domains: [Backend.Accounts],
    json_schema: "/json_schema",
    open_api: "/open_api"
end
