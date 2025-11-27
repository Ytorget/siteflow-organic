defmodule Backend.Repo.Migrations.AddMeetings do
  use Ecto.Migration

  def up do
    create table(:meetings, primary_key: false) do
      add :id, :uuid, primary_key: true, null: false
      add :title, :text, null: false
      add :description, :text
      add :meeting_type, :text, default: "other"
      add :scheduled_at, :utc_datetime_usec
      add :duration_minutes, :integer, default: 60
      add :location, :text
      add :meeting_url, :text
      add :notes, :text
      add :action_items, :map
      add :attendees, {:array, :text}
      add :status, :text, default: "scheduled"
      add :project_id, references(:projects, type: :uuid, on_delete: :delete_all), null: false
      add :created_by_id, references(:users, type: :uuid, on_delete: :nilify_all)

      timestamps(type: :utc_datetime_usec)
    end

    create index(:meetings, [:project_id])
    create index(:meetings, [:created_by_id])
    create index(:meetings, [:status])
    create index(:meetings, [:scheduled_at])
    create index(:meetings, [:meeting_type])
  end

  def down do
    drop table(:meetings)
  end
end
