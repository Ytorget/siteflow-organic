defmodule Backend.Repo.Migrations.AddMilestones do
  use Ecto.Migration

  def up do
    create table(:milestones, primary_key: false) do
      add :id, :uuid, primary_key: true, null: false
      add :title, :text, null: false
      add :description, :text
      add :due_date, :date
      add :completed_at, :utc_datetime_usec
      add :order_index, :integer, default: 0
      add :status, :text, default: "pending"
      add :project_id, references(:projects, type: :uuid, on_delete: :delete_all), null: false
      add :created_by_id, references(:users, type: :uuid, on_delete: :nilify_all)

      timestamps(type: :utc_datetime_usec)
    end

    create index(:milestones, [:project_id])
    create index(:milestones, [:created_by_id])
    create index(:milestones, [:status])
    create index(:milestones, [:due_date])
  end

  def down do
    drop table(:milestones)
  end
end
