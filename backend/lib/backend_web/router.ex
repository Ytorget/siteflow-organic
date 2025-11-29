defmodule BackendWeb.Router do
  use BackendWeb, :router
  use AshAuthentication.Phoenix.Router

  pipeline :api do
    plug :accepts, ["json"]
    plug :load_user_from_bearer
    plug BackendWeb.Plugs.RateLimit, limit: 60, period: 60_000, scope: "api"
  end

  pipeline :authenticated do
    plug :require_authenticated_user
    plug :set_ash_actor
  end

  pipeline :auth_rate_limit do
    plug BackendWeb.Plugs.RateLimit, limit: 10, period: 60_000, scope: "auth"
  end

  pipeline :upload_rate_limit do
    plug BackendWeb.Plugs.RateLimit, limit: 20, period: 60_000, scope: "upload"
  end

  pipeline :rag_rate_limit do
    plug BackendWeb.Plugs.RateLimit, limit: 30, period: 60_000, scope: "rag"
  end

  # Public API routes
  scope "/api" do
    pipe_through [:api, :auth_rate_limit]

    # Manual auth routes since auth_routes macro has issues (stricter rate limit)
    post "/auth/register", BackendWeb.AuthController, :register
    post "/auth/sign-in", BackendWeb.AuthController, :sign_in
    delete "/auth/sign-out", BackendWeb.AuthController, :sign_out

    # Onboarding routes (public - for invitation-based registration)
    get "/onboarding/validate/:token", BackendWeb.OnboardingController, :validate_token
    post "/onboarding/register", BackendWeb.OnboardingController, :register
  end

  # Health check (no rate limit)
  scope "/api" do
    get "/health", BackendWeb.HealthController, :index
  end

  # Protected API routes - Ash RPC
  scope "/api" do
    pipe_through [:api, :authenticated]

    # Ash RPC endpoints
    post "/rpc/run", BackendWeb.AshTypescriptRpcController, :run
    post "/rpc/validate", BackendWeb.AshTypescriptRpcController, :validate
  end

  # Protected API routes - File Uploads
  scope "/api/documents" do
    pipe_through [:api, :authenticated, :upload_rate_limit]

    # File upload (multipart/form-data)
    post "/upload", BackendWeb.FileUploadController, :upload

    # Get presigned download URL
    get "/:id/download", BackendWeb.FileUploadController, :download

    # Delete document and file
    delete "/:id", BackendWeb.FileUploadController, :delete
  end

  # Protected API routes - RAG/AI System
  scope "/api/rag" do
    pipe_through [:api, :authenticated, :rag_rate_limit]

    # Chat endpoints
    post "/projects/:id/chat", BackendWeb.RAGController, :chat
    get "/projects/:id/chat/history", BackendWeb.RAGController, :chat_history

    # Document generation
    post "/projects/:id/generate-documents", BackendWeb.RAGController, :generate_documents
    post "/projects/:id/generate-documents/specific", BackendWeb.RAGController, :generate_specific_documents
    post "/projects/:id/documents/:doc_id/regenerate", BackendWeb.RAGController, :regenerate_document
    get "/projects/:id/documents", BackendWeb.RAGController, :list_documents

    # Manual knowledge management
    post "/projects/:id/knowledge", BackendWeb.RAGController, :add_knowledge
    get "/projects/:id/knowledge", BackendWeb.RAGController, :list_knowledge
    get "/projects/:id/knowledge/stats", BackendWeb.RAGController, :knowledge_stats
    delete "/projects/:id/knowledge/:knowledge_id", BackendWeb.RAGController, :delete_knowledge

    # Embedding
    post "/projects/:id/embed", BackendWeb.RAGController, :embed_project_data
  end

  # Protected API routes - Ash JSON API
  scope "/api" do
    pipe_through [:api, :authenticated]

    # Accounts domain routes
    forward "/accounts", BackendWeb.AccountsRouter

    # Portal domain routes
    forward "/portal", BackendWeb.PortalRouter
  end

  # Enable LiveDashboard in development
  if Application.compile_env(:backend, :dev_routes) do
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: BackendWeb.Telemetry
    end
  end

  defp load_user_from_bearer(conn, _) do
    AshAuthentication.Phoenix.Plug.load_from_bearer(conn, otp_app: :backend)
  end

  defp require_authenticated_user(conn, _) do
    if conn.assigns[:current_user] do
      conn
    else
      conn
      |> put_status(:unauthorized)
      |> Phoenix.Controller.put_view(BackendWeb.ErrorJSON)
      |> Phoenix.Controller.render("401.json")
      |> halt()
    end
  end

  defp set_ash_actor(conn, _) do
    if conn.assigns[:current_user] do
      Ash.PlugHelpers.set_actor(conn, conn.assigns[:current_user])
    else
      conn
    end
  end
end
