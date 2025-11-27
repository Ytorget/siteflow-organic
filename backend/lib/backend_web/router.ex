defmodule BackendWeb.Router do
  use BackendWeb, :router
  use AshAuthentication.Phoenix.Router

  pipeline :api do
    plug :accepts, ["json"]
    plug :load_user_from_bearer
  end

  pipeline :authenticated do
    plug :require_authenticated_user
    plug :set_ash_actor
  end

  # Public API routes
  scope "/api" do
    pipe_through :api

    # Public health check
    get "/health", BackendWeb.HealthController, :index

    # Manual auth routes since auth_routes macro has issues
    post "/auth/register", BackendWeb.AuthController, :register
    post "/auth/sign-in", BackendWeb.AuthController, :sign_in
    delete "/auth/sign-out", BackendWeb.AuthController, :sign_out

    # Onboarding routes (public - for invitation-based registration)
    get "/onboarding/validate/:token", BackendWeb.OnboardingController, :validate_token
    post "/onboarding/register", BackendWeb.OnboardingController, :register
  end

  # Protected API routes - Ash RPC
  scope "/api" do
    pipe_through [:api, :authenticated]

    # Ash RPC endpoints
    post "/rpc/run", BackendWeb.AshTypescriptRpcController, :run
    post "/rpc/validate", BackendWeb.AshTypescriptRpcController, :validate
  end

  # Protected API routes - RAG/AI System
  scope "/api/rag" do
    pipe_through [:api, :authenticated]

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
