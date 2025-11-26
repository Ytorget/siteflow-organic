# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :backend,
  ecto_repos: [Backend.Repo],
  generators: [timestamp_type: :utc_datetime],
  ash_domains: [Backend.Accounts, Backend.Portal]

# Token signing secret for authentication
config :backend, :token_signing_secret, "change_me_in_production_this_is_a_secret_key_123"

# Ash Framework configuration
config :ash,
  include_embedded_source_by_default?: false,
  default_page_type: :keyset,
  policies: [no_filter_static_forbidden_reads?: false]

# AshTypescript configuration
config :ash_typescript,
  domains: [Backend.Accounts, Backend.Portal],
  output_file: "../siteflow-public/src/generated/ash-rpc.ts",
  generate_zod_schemas: true,
  zod_import_path: "zod",
  run_endpoint: "/api/rpc/run",
  validate_endpoint: "/api/rpc/validate",
  output_field_formatter: :camel_case,
  input_field_formatter: :camel_case

# Configures the endpoint
config :backend, BackendWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: BackendWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Backend.PubSub,
  live_view: [signing_salt: "odu30Ea5"]

# Configures Elixir's Logger
config :logger, :default_formatter,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
