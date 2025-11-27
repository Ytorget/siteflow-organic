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
      # State machine transitions
      rpc_action :project_submit, :submit
      rpc_action :project_approve, :approve
      rpc_action :project_reject, :reject
      rpc_action :project_pause, :pause
      rpc_action :project_resume, :resume
      rpc_action :project_complete, :complete
      rpc_action :project_cancel, :cancel
      # Priority management
      rpc_action :project_set_priority, :set_priority
      rpc_action :project_toggle_priority, :toggle_priority
    end

    resource Backend.Portal.Ticket do
      rpc_action :ticket_read, :read
      rpc_action :ticket_create, :create
      rpc_action :ticket_update, :update
      # State machine transitions
      rpc_action :ticket_assign, :assign
      rpc_action :ticket_start_work, :start_work
      rpc_action :ticket_submit_for_review, :submit_for_review
      rpc_action :ticket_request_changes, :request_changes
      rpc_action :ticket_approve, :approve
      rpc_action :ticket_reopen, :reopen
      rpc_action :ticket_close, :close
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
      rpc_action :invitation_by_token, :by_token
      rpc_action :invitation_pending, :pending
      rpc_action :invitation_create, :create
      rpc_action :invitation_accept, :accept
      rpc_action :invitation_cancel, :cancel
    end

    resource Backend.Portal.FormResponse do
      rpc_action :form_response_read, :read
      rpc_action :form_response_by_project, :by_project
      rpc_action :form_response_by_project_and_type, :by_project_and_type
      rpc_action :form_response_by_section, :by_section
      rpc_action :form_response_create, :create
      rpc_action :form_response_update, :update
      rpc_action :form_response_destroy, :destroy
    end

    resource Backend.Portal.InternalNote do
      rpc_action :internal_note_read, :read
      rpc_action :internal_note_by_project, :by_project
      rpc_action :internal_note_create, :create
      rpc_action :internal_note_update, :update
      rpc_action :internal_note_destroy, :destroy
    end

    # RAG/AI System Resources
    resource Backend.Portal.GeneratedDocument do
      rpc_action :generated_document_read, :read
      rpc_action :generated_document_by_project, :by_project
      rpc_action :generated_document_by_project_and_type, :by_project_and_type
      rpc_action :generated_document_create, :create
      rpc_action :generated_document_update, :update
      rpc_action :generated_document_publish, :publish
      rpc_action :generated_document_archive, :archive
      rpc_action :generated_document_regenerate, :regenerate
    end

    resource Backend.Portal.ChatMessage do
      rpc_action :chat_message_read, :read
      rpc_action :chat_message_by_project, :by_project
      rpc_action :chat_message_project_history, :project_history
      rpc_action :chat_message_create, :create
      rpc_action :chat_message_clear_project_history, :clear_project_history
    end

    resource Backend.Portal.ManualKnowledgeEntry do
      rpc_action :manual_knowledge_entry_read, :read
      rpc_action :manual_knowledge_entry_by_project, :by_project
      rpc_action :manual_knowledge_entry_by_category, :by_category
      rpc_action :manual_knowledge_entry_create, :create
      rpc_action :manual_knowledge_entry_update, :update
      rpc_action :manual_knowledge_entry_destroy, :destroy
    end

    # Product Plan System
    resource Backend.Portal.ProductPlan do
      rpc_action :product_plan_read, :read
      rpc_action :product_plan_by_project, :by_project
      rpc_action :product_plan_active_by_project, :active_by_project
      rpc_action :product_plan_pending_approval, :pending_approval
      rpc_action :product_plan_needing_revision, :needing_revision
      rpc_action :product_plan_create, :create
      rpc_action :product_plan_update, :update
      rpc_action :product_plan_send_to_customer, :send_to_customer
      rpc_action :product_plan_mark_viewed, :mark_viewed
      rpc_action :product_plan_approve, :approve
      rpc_action :product_plan_request_changes, :request_changes
      rpc_action :product_plan_revise, :revise
      rpc_action :product_plan_archive, :archive
      rpc_action :product_plan_destroy, :destroy
    end

    # Timeline/Milestones System
    resource Backend.Portal.Milestone do
      rpc_action :milestone_read, :read
      rpc_action :milestone_by_project, :by_project
      rpc_action :milestone_create, :create
      rpc_action :milestone_update, :update
      rpc_action :milestone_mark_completed, :mark_completed
      rpc_action :milestone_reopen, :reopen
      rpc_action :milestone_destroy, :destroy
    end

    # Meetings System
    resource Backend.Portal.Meeting do
      rpc_action :meeting_read, :read
      rpc_action :meeting_by_project, :by_project
      rpc_action :meeting_upcoming_by_project, :upcoming_by_project
      rpc_action :meeting_create, :create
      rpc_action :meeting_update, :update
      rpc_action :meeting_start, :start_meeting
      rpc_action :meeting_complete, :complete_meeting
      rpc_action :meeting_cancel, :cancel_meeting
      rpc_action :meeting_destroy, :destroy
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
    resource Backend.Portal.FormResponse
    resource Backend.Portal.InternalNote
    # RAG/AI System
    resource Backend.Portal.Embedding
    resource Backend.Portal.GeneratedDocument
    resource Backend.Portal.ChatMessage
    resource Backend.Portal.ManualKnowledgeEntry
    # Product Plan System
    resource Backend.Portal.ProductPlan
    # Timeline/Milestones System
    resource Backend.Portal.Milestone
    # Meetings System
    resource Backend.Portal.Meeting
  end
end
