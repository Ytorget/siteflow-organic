defmodule Backend.AI.KnowledgeManager do
  @moduledoc """
  Manages manual knowledge entries with AI-assisted structuring.

  Takes raw user input and uses Gemini to:
  1. Structure the content for better retrieval
  2. Suggest appropriate category
  3. Extract key metadata (people mentioned, dates, decisions, etc.)
  4. Generate title if not provided

  This makes manually added knowledge more searchable and useful in RAG.
  """

  alias Backend.AI.GeminiClient
  alias Backend.Portal.ManualKnowledgeEntry
  alias Backend.Workers.EmbeddingWorker

  require Logger

  @doc """
  Process raw user input with AI to create a structured knowledge entry.

  ## Parameters
    - project_id: UUID of the project
    - raw_input: The user's raw text input
    - user_id: ID of the user creating the entry
    - opts: Optional parameters
      - :title - Explicit title (if not provided, AI generates one)
      - :category - Force a specific category (otherwise AI suggests)
      - :skip_ai - Skip AI processing and use raw input as-is

  ## Returns
    - {:ok, %ManualKnowledgeEntry{}} on success
    - {:error, reason} on failure

  ## Examples

      iex> KnowledgeManager.add_knowledge(project_id, "Had a meeting with customer. They want dark mode. Deadline is next Friday.", user_id)
      {:ok, %ManualKnowledgeEntry{
        title: "Customer meeting: Dark mode request",
        content: "Customer requested dark mode feature with deadline on [date]...",
        category: :meeting_notes,
        metadata: %{
          "people" => ["customer"],
          "deadline" => "2025-12-01",
          "features" => ["dark mode"]
        }
      }}
  """
  def add_knowledge(project_id, raw_input, user_id, opts \\ []) do
    Logger.info("Processing knowledge entry for project #{project_id}")

    # Skip AI processing if requested
    if Keyword.get(opts, :skip_ai, false) do
      create_entry_directly(project_id, raw_input, user_id, opts)
    else
      process_with_ai(project_id, raw_input, user_id, opts)
    end
  end

  defp process_with_ai(project_id, raw_input, user_id, opts) do
    # Build prompt for Gemini
    prompt = build_structuring_prompt(raw_input, opts)

    case GeminiClient.chat(prompt) do
      {:ok, structured_response} ->
        # Parse AI response (expecting JSON)
        case Jason.decode(structured_response) do
          {:ok, parsed} ->
            create_entry_from_ai_response(project_id, raw_input, user_id, parsed, opts)

          {:error, _} ->
            # Fallback: Use raw input if JSON parsing fails
            Logger.warning("Failed to parse AI response, using raw input")
            create_entry_directly(project_id, raw_input, user_id, opts)
        end

      {:error, reason} ->
        Logger.error("AI structuring failed: #{inspect(reason)}, using raw input")
        create_entry_directly(project_id, raw_input, user_id, opts)
    end
  end

  defp build_structuring_prompt(raw_input, opts) do
    """
    You are a knowledge management assistant. Structure the following input for better searchability and organization.

    User input:
    #{raw_input}

    Please respond with JSON (no markdown, just raw JSON) containing:
    {
      "title": "A concise, descriptive title (max 100 chars)",
      "content": "Structured, clear content with proper formatting and context",
      "category": "One of: meeting_notes, decision, clarification, feedback, technical, design, other",
      "metadata": {
        "people": ["list of people mentioned"],
        "dates": ["any dates or deadlines mentioned"],
        "decisions": ["key decisions made"],
        "action_items": ["action items or TODOs"],
        "features": ["features or requirements mentioned"],
        "tags": ["relevant tags for searchability"]
      }
    }

    #{if Keyword.has_key?(opts, :title), do: "Note: User provided title '#{opts[:title]}', but you should still suggest improvements or use it."}
    #{if Keyword.has_key?(opts, :category), do: "Note: User suggested category '#{opts[:category]}', but validate if it's appropriate."}

    Keep the essence of the information but make it more structured and searchable.
    Extract key information into metadata fields.
    Dates should be in YYYY-MM-DD format if possible.
    """
  end

  defp create_entry_from_ai_response(project_id, raw_input, user_id, parsed, opts) do
    title = Keyword.get(opts, :title) || Map.get(parsed, "title", "Untitled")
    content = Map.get(parsed, "content", raw_input)
    category = parse_category(Keyword.get(opts, :category) || Map.get(parsed, "category", "other"))
    metadata = Map.get(parsed, "metadata", %{})

    attrs = %{
      project_id: project_id,
      title: title,
      content: content,
      raw_input: raw_input,
      category: category,
      metadata: metadata
    }

    case Ash.create(ManualKnowledgeEntry, attrs, actor: %{id: user_id, role: :siteflow_admin}) do
      {:ok, entry} ->
        # Trigger embedding for this new knowledge
        Logger.info("Created knowledge entry #{entry.id}, triggering embedding")
        EmbeddingWorker.enqueue_knowledge_entry(entry.id)

        {:ok, entry}

      {:error, changeset} ->
        Logger.error("Failed to create knowledge entry: #{inspect(changeset.errors)}")
        {:error, changeset}
    end
  end

  defp create_entry_directly(project_id, raw_input, user_id, opts) do
    title = Keyword.get(opts, :title, "Untitled")
    category = parse_category(Keyword.get(opts, :category, "other"))

    attrs = %{
      project_id: project_id,
      title: title,
      content: raw_input,
      raw_input: raw_input,
      category: category,
      metadata: %{}
    }

    case Ash.create(ManualKnowledgeEntry, attrs, actor: %{id: user_id, role: :siteflow_admin}) do
      {:ok, entry} ->
        EmbeddingWorker.enqueue_knowledge_entry(entry.id)
        {:ok, entry}

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  defp parse_category(category) when is_binary(category) do
    try do
      atom = String.to_existing_atom(category)
      if atom in [:meeting_notes, :decision, :clarification, :feedback, :technical, :design, :other] do
        atom
      else
        :other
      end
    rescue
      ArgumentError -> :other
    end
  end

  defp parse_category(category) when is_atom(category), do: category
  defp parse_category(_), do: :other

  @doc """
  List all knowledge entries for a project, optionally filtered by category.
  """
  def list_knowledge(project_id, opts \\ []) do
    case Keyword.get(opts, :category) do
      nil ->
        ManualKnowledgeEntry
        |> Ash.Query.for_read(:by_project, %{project_id: project_id})
        |> Ash.read()

      category ->
        ManualKnowledgeEntry
        |> Ash.Query.for_read(:by_category, %{project_id: project_id, category: to_string(category)})
        |> Ash.read()
    end
  end

  @doc """
  Update a knowledge entry.
  """
  def update_knowledge(entry_id, updates, actor) do
    case Ash.get(ManualKnowledgeEntry, entry_id, actor: actor) do
      {:ok, entry} ->
        Ash.update(entry, updates, actor: actor)

      {:error, _} = error ->
        error
    end
  end

  @doc """
  Delete a knowledge entry.
  """
  def delete_knowledge(entry_id, actor) do
    case Ash.get(ManualKnowledgeEntry, entry_id, actor: actor) do
      {:ok, entry} ->
        Ash.destroy(entry, actor: actor)

      {:error, _} = error ->
        error
    end
  end

  @doc """
  Get statistics about knowledge entries for a project.
  """
  def get_stats(project_id) do
    case list_knowledge(project_id) do
      {:ok, entries} ->
        stats = %{
          total: length(entries),
          by_category: Enum.frequencies_by(entries, & &1.category),
          recent_count: Enum.count(entries, fn entry ->
            DateTime.diff(DateTime.utc_now(), entry.inserted_at, :day) <= 7
          end)
        }

        {:ok, stats}

      {:error, _} = error ->
        error
    end
  end
end
