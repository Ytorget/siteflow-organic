defmodule Backend.Portal do
  use Ash.Domain,
    extensions: [AshJsonApi.Domain, AshTypescript.Rpc]

  typescript_rpc do
    resource Backend.Portal.Company do
      rpc_action :company_read, :read
      rpc_action :company_create, :create
      rpc_action :company_update, :update
    end

    resource Backend.Portal.Project do
      rpc_action :project_read, :read
      rpc_action :project_create, :create
      rpc_action :project_update, :update
    end

    resource Backend.Portal.Ticket do
      rpc_action :ticket_read, :read
      rpc_action :ticket_create, :create
      rpc_action :ticket_update, :update
    end

    resource Backend.Portal.Comment do
      rpc_action :comment_read, :read
      rpc_action :comment_create, :create
    end

    resource Backend.Portal.TimeEntry do
      rpc_action :time_entry_read, :read
      rpc_action :time_entry_create, :create
    end

    resource Backend.Portal.Document do
      rpc_action :document_read, :read
      rpc_action :document_create, :create
    end

    resource Backend.Portal.Invitation do
      rpc_action :invitation_read, :read
      rpc_action :invitation_create, :create
      rpc_action :invitation_accept, :accept
    end
  end

  resources do
    resource Backend.Portal.Company
    resource Backend.Portal.Project
    resource Backend.Portal.Ticket
    resource Backend.Portal.Comment
    resource Backend.Portal.TimeEntry
    resource Backend.Portal.Document
    resource Backend.Portal.Invitation
  end
end
