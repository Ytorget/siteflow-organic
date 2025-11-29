defmodule Backend.Repo.Migrations.AddDocumentVersioning do
  use Ecto.Migration

  def change do
    alter table(:documents) do
      add :version, :integer, default: 1, null: false
      add :parent_document_id, references(:documents, type: :uuid, on_delete: :nilify_all)
      add :is_latest, :boolean, default: true, null: false
    end

    create index(:documents, [:parent_document_id])
    create index(:documents, [:is_latest])
  end
end
