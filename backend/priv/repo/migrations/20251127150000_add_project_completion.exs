defmodule Backend.Repo.Migrations.AddProjectCompletion do
  use Ecto.Migration

  def change do
    alter table(:projects) do
      # Delivery tracking
      add :is_delivered, :boolean, default: false, null: false, comment: "Whether the project has been delivered to the customer"
      add :delivered_at, :utc_datetime, comment: "When the project was delivered"
      add :delivery_url, :string, comment: "URL to the live/delivered project"
      add :delivery_notes, :text, comment: "Notes about the delivery for the customer"

      # Customer feedback
      add :customer_rating, :integer, comment: "Customer rating 1-5 stars"
      add :customer_review, :text, comment: "Customer's written review/feedback"
      add :reviewed_at, :utc_datetime, comment: "When the customer submitted their review"

      # Support period
      add :support_start_date, :date, comment: "When the support period starts (usually delivery date)"
      add :support_end_date, :date, comment: "When the support period ends"
      add :support_months, :integer, default: 6, comment: "Number of months of support included (default 6)"
    end

    # Indexes for queries
    create index(:projects, [:is_delivered])
    create index(:projects, [:delivered_at])
    create index(:projects, [:support_end_date])
    create index(:projects, [:customer_rating])

    # Constraint: rating must be between 1 and 5
    create constraint(:projects, :customer_rating_range, check: "customer_rating >= 1 AND customer_rating <= 5")
  end
end
