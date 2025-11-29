defmodule Backend.Repo.Migrations.AddSlaToTickets do
  use Ecto.Migration

  def change do
    alter table(:tickets) do
      # SLA configuration (in hours)
      add :sla_response_hours, :integer, comment: "Hours until first response is due"
      add :sla_resolution_hours, :integer, comment: "Hours until resolution is due"

      # SLA tracking timestamps
      add :first_response_at, :utc_datetime, comment: "When the first response was made"
      add :sla_response_due_at, :utc_datetime, comment: "Calculated deadline for first response"
      add :sla_resolution_due_at, :utc_datetime, comment: "Calculated deadline for resolution"

      # SLA breach flags
      add :sla_response_breached, :boolean, default: false, null: false
      add :sla_resolution_breached, :boolean, default: false, null: false
    end

    # Indexes for querying breached SLAs
    create index(:tickets, [:sla_response_breached])
    create index(:tickets, [:sla_resolution_breached])
    create index(:tickets, [:sla_response_due_at])
    create index(:tickets, [:sla_resolution_due_at])
  end
end
