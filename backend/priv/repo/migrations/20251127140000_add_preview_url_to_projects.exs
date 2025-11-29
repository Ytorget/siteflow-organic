defmodule Backend.Repo.Migrations.AddPreviewUrlToProjects do
  use Ecto.Migration

  def change do
    alter table(:projects) do
      add :preview_url, :string, comment: "URL for customer to preview work in staging/development environment"
      add :preview_notes, :text, comment: "Notes or instructions for accessing the preview"
      add :preview_updated_at, :utc_datetime, comment: "When the preview was last updated"
    end

    create index(:projects, [:preview_url])
  end
end
