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
  output_file: "../src/generated/ash-rpc.ts",
  generate_zod_schemas: false,
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

# Oban configuration for background jobs (RAG/AI system)
config :backend, Oban,
  repo: Backend.Repo,
  queues: [
    default: 10,
    embeddings: 5,       # Vector embedding generation
    documents: 3,        # AI document generation
    ai_chat: 5           # RAG chat processing
  ],
  plugins: [
    {Oban.Plugins.Pruner, max_age: 60 * 60 * 24 * 7}  # Keep jobs for 7 days
  ]

# Gemini AI configuration
config :backend, :gemini,
  api_key: System.get_env("GEMINI_API_KEY"),
  embedding_model: "text-embedding-004",
  generation_model: "gemini-2.0-flash-exp",
  embedding_dimensions: 768

# Hammer rate limiting configuration
config :hammer,
  backend: {Hammer.Backend.ETS, [expiry_ms: 60_000 * 60 * 2, cleanup_interval_ms: 60_000 * 10]}

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
