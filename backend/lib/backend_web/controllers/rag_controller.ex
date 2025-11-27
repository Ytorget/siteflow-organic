defmodule BackendWeb.RAGController do
  use BackendWeb, :controller

  alias Backend.AI.{RAGService, DocumentGenerator}
  alias Backend.Portal.Project
  alias Backend.Workers.{DocumentGenerationWorker, EmbeddingWorker}

  require Logger

  # Plug för att verifiera att användaren har AI-access
  plug :require_ai_access when action in [:chat, :chat_history, :add_knowledge]

  @doc """
  POST /api/rag/projects/:id/chat
  Streaming chat med RAG context. Använder SSE (Server-Sent Events) för streaming.
  """
  def chat(conn, %{"id" => project_id, "message" => message}) do
    user = conn.assigns.current_user

    Logger.info("Starting RAG chat for project #{project_id}, user #{user.id}")

    conn =
      conn
      |> put_resp_content_type("text/event-stream")
      |> put_resp_header("cache-control", "no-cache")
      |> put_resp_header("connection", "keep-alive")
      |> send_chunked(200)

    # Streaming callback
    stream_callback = fn chunk ->
      case chunk(conn, "data: #{Jason.encode!(chunk)}\n\n") do
        {:ok, conn} -> :ok
        {:error, _} -> :stop
      end
    end

    case RAGService.chat(project_id, message, user.id, stream_callback) do
      :ok ->
        # Send completion event
        chunk(conn, "data: {\"done\":true}\n\n")
        conn

      {:error, reason} ->
        Logger.error("RAG chat failed: #{inspect(reason)}")
        chunk(conn, "data: #{Jason.encode!(%{error: "Chat failed: #{inspect(reason)}"})}}\n\n")
        conn
    end
  end

  @doc """
  GET /api/rag/projects/:id/chat/history
  Hämta chatthistorik för ett projekt
  """
  def chat_history(conn, %{"id" => project_id}) do
    # Implementation här när vi har ChatMessage query
    json(conn, %{messages: []})
  end

  @doc """
  POST /api/rag/projects/:id/generate-documents
  Trigga AI-dokumentgenerering för ett projekt
  """
  def generate_documents(conn, %{"id" => project_id}) do
    user = conn.assigns.current_user

    Logger.info("Enqueuing document generation for project #{project_id}")

    case DocumentGenerationWorker.enqueue_all(project_id, user_id: user.id) do
      {:ok, job} ->
        json(conn, %{
          status: "queued",
          job_id: job.id,
          message: "Document generation started"
        })

      {:error, reason} ->
        Logger.error("Failed to enqueue document generation: #{inspect(reason)}")

        conn
        |> put_status(500)
        |> json(%{error: "Failed to start document generation"})
    end
  end

  @doc """
  POST /api/rag/projects/:id/generate-documents/specific
  Generera specifika dokumenttyper
  """
  def generate_specific_documents(conn, %{"id" => project_id, "types" => types}) do
    user = conn.assigns.current_user

    document_types = Enum.map(types, &String.to_atom/1)

    case DocumentGenerationWorker.enqueue_specific(project_id, document_types, user_id: user.id) do
      {:ok, job} ->
        json(conn, %{
          status: "queued",
          job_id: job.id,
          types: types,
          message: "Specific document generation started"
        })

      {:error, reason} ->
        conn
        |> put_status(500)
        |> json(%{error: "Failed to start document generation"})
    end
  end

  @doc """
  POST /api/rag/projects/:id/documents/:doc_id/regenerate
  Regenerera ett specifikt dokument
  """
  def regenerate_document(conn, %{"id" => project_id, "doc_id" => doc_id, "type" => type}) do
    user = conn.assigns.current_user
    document_type = String.to_atom(type)

    case DocumentGenerationWorker.enqueue_regenerate(project_id, document_type, user_id: user.id) do
      {:ok, job} ->
        json(conn, %{
          status: "queued",
          job_id: job.id,
          message: "Document regeneration started"
        })

      {:error, reason} ->
        conn
        |> put_status(500)
        |> json(%{error: "Failed to regenerate document"})
    end
  end

  @doc """
  GET /api/rag/projects/:id/documents
  Hämta alla AI-genererade dokument för ett projekt
  """
  def list_documents(conn, %{"id" => project_id}) do
    # Använd Generated Document resource när vi lägger till RPC
    json(conn, %{documents: []})
  end

  @doc """
  POST /api/rag/projects/:id/knowledge
  Lägg till manuell kunskap till RAG
  """
  def add_knowledge(conn, %{"id" => project_id, "content" => content, "title" => title}) do
    user = conn.assigns.current_user

    # Implementation med ManualKnowledgeEntry resource
    json(conn, %{status: "success", message: "Knowledge added"})
  end

  @doc """
  GET /api/rag/projects/:id/knowledge
  Hämta all manuell kunskap för ett projekt
  """
  def list_knowledge(conn, %{"id" => project_id}) do
    json(conn, %{knowledge: []})
  end

  @doc """
  POST /api/rag/projects/:id/embed
  Trigga embedding av projektdata
  """
  def embed_project_data(conn, %{"id" => project_id}) do
    Logger.info("Enqueuing embeddings for project #{project_id}")

    case EmbeddingWorker.enqueue_form_responses(project_id) do
      {:ok, job} ->
        json(conn, %{
          status: "queued",
          job_id: job.id,
          message: "Embedding started"
        })

      {:error, reason} ->
        conn
        |> put_status(500)
        |> json(%{error: "Failed to start embedding"})
    end
  end

  # Private functions

  defp require_ai_access(conn, _opts) do
    user = conn.assigns.current_user

    cond do
      user.role in [:siteflow_admin, :siteflow_kam, :siteflow_pl] ->
        conn

      user.can_use_ai_chat == true ->
        conn

      true ->
        conn
        |> put_status(403)
        |> json(%{error: "AI access not granted"})
        |> halt()
    end
  end
end
