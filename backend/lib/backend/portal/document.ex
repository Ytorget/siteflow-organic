defmodule Backend.Portal.Document do
  use Ash.Resource,
    otp_app: :backend,
    domain: Backend.Portal,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshJsonApi.Resource, AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "Document"
  end

  postgres do
    table "documents"
    repo Backend.Repo
  end

  json_api do
    type "document"
  end

  policies do
    policy action_type(:read) do
      # Siteflow staff can read all documents
      authorize_if expr(^actor(:role) in [:siteflow_admin, :siteflow_kam, :siteflow_pl,
                                           :siteflow_dev_frontend, :siteflow_dev_backend,
                                           :siteflow_dev_fullstack])
      # Customers can read documents for their company's projects
      authorize_if expr(project.company_id == ^actor(:company_id))
    end

    policy action_type(:create) do
      # All authenticated users can upload documents
      authorize_if always()
    end

    policy action(:destroy) do
      # Admins can delete any document
      authorize_if actor_attribute_equals(:role, :siteflow_admin)
      # Uploaders can delete their own documents
      authorize_if expr(uploaded_by_id == ^actor(:id))
    end
  end

  actions do
    defaults [:read]

    create :create do
      accept [:name, :description, :file_path, :file_size, :mime_type, :project_id, :ticket_id, :category, :version, :parent_document_id, :is_latest]
      change relate_actor(:uploaded_by)
    end

    create :create_new_version do
      accept [:name, :description, :file_path, :file_size, :mime_type, :project_id, :ticket_id, :category]
      argument :parent_id, :uuid, allow_nil?: false

      change fn changeset, _context ->
        parent_id = Ash.Changeset.get_argument(changeset, :parent_id)

        # Get parent document to increment version
        case Ash.get(Backend.Portal.Document, parent_id, authorize?: false) do
          {:ok, parent} ->
            # Mark parent as not latest
            Ash.update(parent, %{is_latest: false}, authorize?: false)

            # Set new version number
            changeset
            |> Ash.Changeset.change_attribute(:version, parent.version + 1)
            |> Ash.Changeset.change_attribute(:parent_document_id, parent_id)
            |> Ash.Changeset.change_attribute(:is_latest, true)

          {:error, _} ->
            Ash.Changeset.add_error(changeset, "Parent document not found")
        end
      end

      change relate_actor(:uploaded_by)
    end

    destroy :destroy do
    end

    read :by_project do
      argument :project_id, :uuid, allow_nil?: false
      filter expr(project_id == ^arg(:project_id))
    end

    read :by_ticket do
      argument :ticket_id, :uuid, allow_nil?: false
      filter expr(ticket_id == ^arg(:ticket_id))
    end

    read :by_category do
      argument :category, :atom, allow_nil?: false
      filter expr(category == ^arg(:category))
    end

    read :version_history do
      argument :document_id, :uuid, allow_nil?: false

      filter expr(
        id == ^arg(:document_id) or
        parent_document_id == ^arg(:document_id) or
        exists(parent_document, id == ^arg(:document_id))
      )

      prepare fn query, _context ->
        Ash.Query.sort(query, version: :desc)
      end
    end

    read :latest_only do
      filter expr(is_latest == true)
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :name, :string do
      allow_nil? false
      public? true
    end

    attribute :description, :string do
      public? true
    end

    attribute :file_path, :string do
      allow_nil? false
      public? true
    end

    attribute :file_size, :integer do
      public? true
      description "File size in bytes"
    end

    attribute :mime_type, :string do
      public? true
    end

    attribute :category, :atom do
      constraints one_of: [:contract, :specification, :design, :report, :invoice, :other]
      default :other
      public? true
    end

    attribute :version, :integer do
      default 1
      allow_nil? false
      public? true
      description "Version number of this document"
    end

    attribute :is_latest, :boolean do
      default true
      allow_nil? false
      public? true
      description "Whether this is the latest version"
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :project, Backend.Portal.Project do
      allow_nil? false
      public? true
    end

    belongs_to :ticket, Backend.Portal.Ticket do
      public? true
      description "Optional ticket this document is attached to"
    end

    belongs_to :uploaded_by, Backend.Accounts.User do
      allow_nil? false
      public? true
    end

    belongs_to :parent_document, Backend.Portal.Document do
      public? true
      description "Parent document if this is a new version"
    end

    has_many :versions, Backend.Portal.Document do
      destination_attribute :parent_document_id
      public? true
      description "All versions of this document"
    end
  end
end
