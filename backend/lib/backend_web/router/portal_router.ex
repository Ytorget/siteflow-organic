defmodule BackendWeb.PortalRouter do
  use AshJsonApi.Router,
    domains: [Backend.Portal],
    json_schema: "/json_schema",
    open_api: "/open_api"
end
