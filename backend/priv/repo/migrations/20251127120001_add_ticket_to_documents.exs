defmodule Backend.Repo.Migrations.AddTicketToDocuments do
  use Ecto.Migration

  def change do
    alter table(:documents) do
      add :ticket_id, references(:tickets, type: :uuid, on_delete: :nilify_all)
    end

    create index(:documents, [:ticket_id])
  end
end
