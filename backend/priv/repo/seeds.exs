# Script for populating the database with seed data
# Run with: mix run priv/repo/seeds.exs

alias Backend.Portal.Company
alias Backend.Accounts.User

# Create Siteflow company (org_number must be 10 digits)
import Ash.Query

siteflow_company =
  case Company
       |> filter(org_number == "0000000001")
       |> Ash.read_one(authorize?: false) do
    {:ok, nil} ->
      IO.puts("Creating Siteflow company...")
      {:ok, company} =
        Company
        |> Ash.Changeset.for_create(:create, %{
          name: "Siteflow",
          org_number: "0000000001",
          address: "Digitalgatan 1",
          city: "Stockholm",
          postal_code: "11122",
          country: "Sweden",
          phone: "+46 8 123 456 78",
          website: "https://siteflow.se"
        })
        |> Ash.create(authorize?: false)
      IO.puts("Siteflow company created with ID: #{company.id}")
      company

    {:ok, existing} ->
      IO.puts("Siteflow company already exists with ID: #{existing.id}")
      existing
  end

# Create admin user if it doesn't exist
case User
     |> filter(email == "admin@siteflow.se")
     |> Ash.read_one(authorize?: false) do
  {:ok, nil} ->
    IO.puts("Creating admin user...")

    # Use AshAuthentication's password strategy to create user with proper password hashing
    {:ok, admin} =
      User
      |> Ash.Changeset.for_create(:register_with_password, %{
        email: "admin@siteflow.se",
        password: "AdminPassword123!",
        first_name: "Admin",
        last_name: "Siteflow",
        company_id: siteflow_company.id
      })
      |> Ash.create(authorize?: false)

    # Update role to admin
    {:ok, _} =
      admin
      |> Ash.Changeset.for_update(:assign_role, %{role: :siteflow_admin})
      |> Ash.update(authorize?: false)

    IO.puts("Admin user created: admin@siteflow.se")

  {:ok, existing} ->
    IO.puts("Admin user already exists: #{existing.email}")
end

# Create demo customer if it doesn't exist
case User
     |> filter(email == "demo@siteflow.se")
     |> Ash.read_one(authorize?: false) do
  {:ok, nil} ->
    IO.puts("Creating demo customer user...")

    {:ok, _demo} =
      User
      |> Ash.Changeset.for_create(:register_with_password, %{
        email: "demo@siteflow.se",
        password: "Password123",
        first_name: "Demo",
        last_name: "Kund",
        company_id: siteflow_company.id
      })
      |> Ash.create(authorize?: false)

    IO.puts("Demo customer created: demo@siteflow.se")

  {:ok, existing} ->
    IO.puts("Demo customer already exists: #{existing.email}")
end

# Create test projects
alias Backend.Portal.Project

# Project 1: Draft project
case Project
     |> filter(name == "Website Redesign")
     |> Ash.read_one(authorize?: false) do
  {:ok, nil} ->
    IO.puts("Creating test project: Website Redesign...")
    {:ok, _project} =
      Project
      |> Ash.Changeset.for_create(:create, %{
        name: "Website Redesign",
        description: "Complete redesign of company website with modern UI/UX",
        company_id: siteflow_company.id,
        budget: Decimal.new("250000"),
        start_date: ~D[2025-01-15],
        target_end_date: ~D[2025-04-30]
      })
      |> Ash.create(authorize?: false)
    IO.puts("Project created: Website Redesign")

  {:ok, existing} ->
    IO.puts("Project already exists: #{existing.name}")
end

# Project 2: In-progress project
case Project
     |> filter(name == "E-commerce Platform")
     |> Ash.read_one(authorize?: false) do
  {:ok, nil} ->
    IO.puts("Creating test project: E-commerce Platform...")
    {:ok, project} =
      Project
      |> Ash.Changeset.for_create(:create, %{
        name: "E-commerce Platform",
        description: "Custom e-commerce solution with inventory management",
        company_id: siteflow_company.id,
        budget: Decimal.new("500000"),
        start_date: ~D[2024-11-01],
        target_end_date: ~D[2025-06-30]
      })
      |> Ash.create(authorize?: false)

    # Transition to in_progress state
    {:ok, _} =
      project
      |> Ash.Changeset.for_update(:submit)
      |> Ash.update(authorize?: false)

    project_reloaded = Ash.get!(Project, project.id, authorize?: false)
    {:ok, _} =
      project_reloaded
      |> Ash.Changeset.for_update(:approve)
      |> Ash.update(authorize?: false)

    IO.puts("Project created: E-commerce Platform (in_progress)")

  {:ok, existing} ->
    IO.puts("Project already exists: #{existing.name}")
end

# Project 3: Small maintenance project
case Project
     |> filter(name == "Mobile App Maintenance")
     |> Ash.read_one(authorize?: false) do
  {:ok, nil} ->
    IO.puts("Creating test project: Mobile App Maintenance...")
    {:ok, _project} =
      Project
      |> Ash.Changeset.for_create(:create, %{
        name: "Mobile App Maintenance",
        description: "Monthly maintenance and bug fixes for iOS and Android apps",
        company_id: siteflow_company.id,
        budget: Decimal.new("50000"),
        start_date: ~D[2025-01-01],
        target_end_date: ~D[2025-12-31]
      })
      |> Ash.create(authorize?: false)
    IO.puts("Project created: Mobile App Maintenance")

  {:ok, existing} ->
    IO.puts("Project already exists: #{existing.name}")
end

IO.puts("\nSeeding complete!")
