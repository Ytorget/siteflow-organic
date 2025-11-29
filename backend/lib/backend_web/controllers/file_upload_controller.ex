defmodule BackendWeb.FileUploadController do
  use BackendWeb, :controller

  alias Backend.Portal.Document
  alias Backend.Services.FileUploadService

  # Maximum file size: 100 MB
  @max_file_size 100 * 1024 * 1024

  # Allowed MIME types
  @allowed_mime_types [
    # Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/json",
    # Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    # Archives
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/gzip",
    # Code/Text
    "text/html",
    "text/css",
    "text/javascript",
    "application/javascript",
    "application/xml",
    "text/xml"
  ]

  @doc """
  Uploads a file to S3 and creates a Document record.

  Expected multipart/form-data parameters:
  - file: The file upload
  - project_id: UUID of the project
  - category: Category atom (contract, specification, design, report, invoice, other)
  - name: (optional) Display name for the document
  - description: (optional) Description

  Returns:
  - 201 Created with document JSON
  - 400 Bad Request for validation errors
  - 401 Unauthorized if not authenticated
  - 500 Internal Server Error for upload failures
  """
  def upload(conn, params) do
    # Extract user from conn assigns (set by auth plug)
    user = conn.assigns[:current_user]

    unless user do
      conn
      |> put_status(:unauthorized)
      |> json(%{error: "Authentication required"})
      |> halt()
    end

    # Extract params
    upload = params["file"]
    project_id = params["project_id"]
    category = params["category"] || "other"
    name = params["name"]
    description = params["description"]

    # Validate required params
    cond do
      is_nil(upload) ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "File is required"})

      is_nil(project_id) ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "project_id is required"})

      true ->
        # Process upload
        process_upload(conn, user, upload, project_id, category, name, description)
    end
  end

  defp process_upload(conn, user, upload, project_id, category, name, description) do
    # Get file info
    file_path = upload.path
    original_filename = upload.filename
    content_type = upload.content_type

    # Validate file size
    case File.stat(file_path) do
      {:ok, %{size: size}} when size > @max_file_size ->
        max_mb = div(@max_file_size, 1024 * 1024)
        actual_mb = Float.round(size / (1024 * 1024), 2)

        conn
        |> put_status(:bad_request)
        |> json(%{
          error: "File too large",
          message: "File size #{actual_mb} MB exceeds maximum allowed size of #{max_mb} MB"
        })

      {:ok, _} ->
        # Validate file type
        case validate_file_type(content_type, original_filename) do
          :ok ->
            # Use original filename as name if not provided
            document_name = name || Path.basename(original_filename, Path.extname(original_filename))

            # Validate category
            category_atom = parse_category(category)

            case category_atom do
              {:error, _} ->
                conn
                |> put_status(:bad_request)
                |> json(%{error: "Invalid category. Must be one of: contract, specification, design, report, invoice, other"})

              {:ok, cat} ->
                # Upload to S3
                case FileUploadService.upload_file(file_path, original_filename, content_type, project_id, Atom.to_string(cat)) do
                  {:ok, upload_result} ->
                    # Create Document record
                    create_document(conn, user, document_name, description, upload_result, project_id, cat)

                  {:error, reason} ->
                    conn
                    |> put_status(:internal_server_error)
                    |> json(%{error: "Upload failed", details: inspect(reason)})
                end
            end

          {:error, reason} ->
            conn
            |> put_status(:bad_request)
            |> json(%{error: "Invalid file type", message: reason})
        end

      {:error, _} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Failed to read file"})
    end
  end

  defp validate_file_type(content_type, filename) do
    # Check MIME type
    if content_type in @allowed_mime_types do
      :ok
    else
      # Also check file extension as fallback
      extension = Path.extname(filename) |> String.downcase()

      allowed_extensions = [
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
        ".txt", ".csv", ".json", ".jpg", ".jpeg", ".png", ".gif",
        ".webp", ".svg", ".zip", ".rar", ".7z", ".gz",
        ".html", ".css", ".js", ".xml"
      ]

      if extension in allowed_extensions do
        :ok
      else
        {:error, "File type '#{content_type}' with extension '#{extension}' is not allowed. Allowed types: PDF, Office documents, images, archives, and text files."}
      end
    end
  end

  defp create_document(conn, user, name, description, upload_result, project_id, category) do
    # Build document attributes
    attrs = %{
      name: name,
      description: description,
      file_path: upload_result.file_path,
      file_size: upload_result.file_size,
      mime_type: upload_result.mime_type,
      project_id: project_id,
      category: category
    }

    # Create document via Ash
    case Ash.create(Document, attrs, actor: user) do
      {:ok, document} ->
        # Generate presigned download URL
        {:ok, download_url} = FileUploadService.generate_download_url(document.file_path)

        conn
        |> put_status(:created)
        |> json(%{
          data: %{
            id: document.id,
            name: document.name,
            description: document.description,
            file_path: document.file_path,
            file_size: document.file_size,
            mime_type: document.mime_type,
            category: document.category,
            project_id: document.project_id,
            uploaded_by_id: document.uploaded_by_id,
            download_url: download_url,
            inserted_at: document.inserted_at,
            updated_at: document.updated_at
          }
        })

      {:error, changeset} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Failed to create document", details: inspect(changeset.errors)})
    end
  end

  defp parse_category(category) when is_binary(category) do
    # Convert string to atom and validate
    try do
      cat = String.to_existing_atom(category)
      if cat in [:contract, :specification, :design, :report, :invoice, :other] do
        {:ok, cat}
      else
        {:error, :invalid_category}
      end
    rescue
      ArgumentError -> {:error, :invalid_category}
    end
  end

  defp parse_category(category) when is_atom(category) do
    if category in [:contract, :specification, :design, :report, :invoice, :other] do
      {:ok, category}
    else
      {:error, :invalid_category}
    end
  end

  defp parse_category(_), do: {:error, :invalid_category}

  @doc """
  Generates a presigned download URL for a document.

  GET /api/documents/:id/download

  Returns:
  - 200 OK with {download_url: url}
  - 404 Not Found if document doesn't exist
  - 401 Unauthorized if not authenticated
  - 403 Forbidden if user doesn't have access
  """
  def download(conn, %{"id" => document_id}) do
    user = conn.assigns[:current_user]

    unless user do
      conn
      |> put_status(:unauthorized)
      |> json(%{error: "Authentication required"})
      |> halt()
    end

    # Load document
    case Ash.get(Document, document_id, actor: user) do
      {:ok, document} ->
        # Generate presigned URL
        {:ok, download_url} = FileUploadService.generate_download_url(document.file_path)

        conn
        |> json(%{download_url: download_url})

      {:error, %Ash.Error.Query.NotFound{}} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Document not found"})

      {:error, %Ash.Error.Forbidden{}} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Access denied"})

      {:error, _} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Failed to retrieve document"})
    end
  end

  @doc """
  Deletes a document and its file from S3.

  DELETE /api/documents/:id

  Returns:
  - 204 No Content on success
  - 404 Not Found if document doesn't exist
  - 401 Unauthorized if not authenticated
  - 403 Forbidden if user doesn't have permission
  """
  def delete(conn, %{"id" => document_id}) do
    user = conn.assigns[:current_user]

    unless user do
      conn
      |> put_status(:unauthorized)
      |> json(%{error: "Authentication required"})
      |> halt()
    end

    # Load document
    case Ash.get(Document, document_id, actor: user) do
      {:ok, document} ->
        # Delete from S3 first
        FileUploadService.delete_file(document.file_path)

        # Delete document record
        case Ash.destroy(document, actor: user) do
          :ok ->
            conn
            |> send_resp(:no_content, "")

          {:error, %Ash.Error.Forbidden{}} ->
            conn
            |> put_status(:forbidden)
            |> json(%{error: "You don't have permission to delete this document"})

          {:error, _} ->
            conn
            |> put_status(:internal_server_error)
            |> json(%{error: "Failed to delete document"})
        end

      {:error, %Ash.Error.Query.NotFound{}} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Document not found"})

      {:error, %Ash.Error.Forbidden{}} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Access denied"})

      {:error, _} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Failed to retrieve document"})
    end
  end
end
