defmodule Backend.Services.FileUploadService do
  @moduledoc """
  Service for uploading files to AWS S3.

  Handles file validation, unique filename generation, and S3 upload.
  """

  alias ExAws.S3

  @doc """
  Uploads a file to S3 with validation.

  ## Parameters
    - file_path: Path to the temporary uploaded file
    - original_filename: Original filename from the user
    - content_type: MIME type of the file
    - project_id: ID of the project (for organizing files)
    - category: Category for organization (e.g., "design", "documents")

  ## Returns
    - {:ok, %{file_path: s3_path, file_size: size, mime_type: type}}
    - {:error, reason}

  ## Examples
      iex> upload_file("/tmp/upload.pdf", "document.pdf", "application/pdf", "123", "documents")
      {:ok, %{file_path: "projects/123/documents/uuid-document.pdf", file_size: 1024, mime_type: "application/pdf"}}
  """
  def upload_file(file_path, original_filename, content_type, project_id, category \\ "general") do
    with :ok <- validate_file(file_path, content_type),
         {:ok, file_size} <- get_file_size(file_path),
         {:ok, s3_path} <- generate_s3_path(project_id, category, original_filename),
         {:ok, _} <- upload_to_s3(file_path, s3_path, content_type) do
      {:ok, %{
        file_path: s3_path,
        file_size: file_size,
        mime_type: content_type
      }}
    else
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Deletes a file from S3.

  ## Parameters
    - s3_path: The S3 path of the file to delete

  ## Returns
    - :ok
    - {:error, reason}
  """
  def delete_file(s3_path) do
    bucket = get_bucket()

    case S3.delete_object(bucket, s3_path) |> ExAws.request() do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Generates a presigned URL for downloading a file from S3.

  ## Parameters
    - s3_path: The S3 path of the file
    - expires_in: Time in seconds until the URL expires (default: 3600 = 1 hour)

  ## Returns
    - {:ok, presigned_url}
    - {:error, reason}
  """
  def generate_download_url(s3_path, expires_in \\ 3600) do
    bucket = get_bucket()
    config = ExAws.Config.new(:s3)

    {:ok, S3.presigned_url(config, :get, bucket, s3_path, expires_in: expires_in)}
  end

  # Private functions

  defp validate_file(file_path, content_type) do
    with :ok <- validate_file_exists(file_path),
         :ok <- validate_mime_type(content_type),
         :ok <- validate_file_size(file_path) do
      :ok
    end
  end

  defp validate_file_exists(file_path) do
    if File.exists?(file_path) do
      :ok
    else
      {:error, "File does not exist"}
    end
  end

  defp validate_mime_type(content_type) do
    allowed_types = Application.get_env(:backend, :file_upload)[:allowed_mime_types]

    if content_type in allowed_types do
      :ok
    else
      {:error, "File type not allowed: #{content_type}"}
    end
  end

  defp validate_file_size(file_path) do
    max_size = Application.get_env(:backend, :file_upload)[:max_file_size]

    case File.stat(file_path) do
      {:ok, %{size: size}} when size <= max_size ->
        :ok
      {:ok, %{size: size}} ->
        {:error, "File too large: #{size} bytes (max: #{max_size} bytes)"}
      {:error, reason} ->
        {:error, "Could not read file: #{inspect(reason)}"}
    end
  end

  defp get_file_size(file_path) do
    case File.stat(file_path) do
      {:ok, %{size: size}} -> {:ok, size}
      {:error, reason} -> {:error, "Could not read file: #{inspect(reason)}"}
    end
  end

  defp generate_s3_path(project_id, category, original_filename) do
    # Generate UUID for unique filename
    uuid = Ecto.UUID.generate()

    # Sanitize filename (remove special characters, keep extension)
    sanitized_name = sanitize_filename(original_filename)

    # Create S3 path: projects/{project_id}/{category}/{uuid}-{filename}
    path = "projects/#{project_id}/#{category}/#{uuid}-#{sanitized_name}"

    {:ok, path}
  end

  defp sanitize_filename(filename) do
    # Get file extension
    ext = Path.extname(filename)

    # Remove extension, sanitize basename, add extension back
    basename = Path.basename(filename, ext)

    sanitized_basename =
      basename
      |> String.downcase()
      |> String.replace(~r/[^a-z0-9_-]/, "-")
      |> String.replace(~r/-+/, "-")
      |> String.trim("-")

    # Limit filename length (without extension) to 50 chars
    sanitized_basename = String.slice(sanitized_basename, 0, 50)

    sanitized_basename <> ext
  end

  defp upload_to_s3(file_path, s3_path, content_type) do
    bucket = get_bucket()

    # Read file content
    case File.read(file_path) do
      {:ok, file_content} ->
        # Upload to S3
        S3.put_object(bucket, s3_path, file_content, [
          content_type: content_type,
          acl: :private
        ])
        |> ExAws.request()

      {:error, reason} ->
        {:error, "Could not read file: #{inspect(reason)}"}
    end
  end

  defp get_bucket do
    Application.get_env(:backend, :s3_bucket)
  end
end
