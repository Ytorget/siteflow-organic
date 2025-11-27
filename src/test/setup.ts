import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch globally
global.fetch = vi.fn();

// MSW server setup for API mocking
export const handlers = [
  // Auth endpoints
  http.post('http://localhost:3000/api/auth/sign-in', async ({ request }) => {
    const body = await request.json() as any;
    if (body.user?.email === 'admin@siteflow.se' && body.user?.password === 'AdminPassword123!') {
      return HttpResponse.json({
        user: {
          id: 'user-1',
          email: 'admin@siteflow.se',
          firstName: 'Admin',
          lastName: 'User',
          role: 'siteflow_admin',
          companyId: null,
        },
        token: 'mock-jwt-token',
      });
    }
    return HttpResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }),

  // RPC endpoint
  http.post('http://localhost:3000/api/rpc/run', async ({ request }) => {
    const body = await request.json() as any;

    // Company read
    if (body.action === 'company_read') {
      return HttpResponse.json({
        success: true,
        data: [
          { id: 'company-1', name: 'Test Company', orgNumber: '123456-7890', city: 'Stockholm', isActive: true },
          { id: 'company-2', name: 'Another Company', orgNumber: '098765-4321', city: 'Göteborg', isActive: false },
        ],
      });
    }

    // Project read
    if (body.action === 'project_read') {
      return HttpResponse.json({
        success: true,
        data: [
          { id: 'project-1', name: 'Website Redesign', state: 'in_progress', companyId: 'company-1', isPriority: true },
          { id: 'project-2', name: 'Mobile App', state: 'pending_approval', companyId: 'company-1', isPriority: false },
        ],
      });
    }

    // Ticket read
    if (body.action === 'ticket_read') {
      return HttpResponse.json({
        success: true,
        data: [
          { id: 'ticket-1', title: 'Fix login bug', state: 'open', priority: 'high', projectId: 'project-1' },
          { id: 'ticket-2', title: 'Add dark mode', state: 'in_progress', priority: 'medium', projectId: 'project-1' },
        ],
      });
    }

    // Time entry read
    if (body.action === 'time_entry_read') {
      return HttpResponse.json({
        success: true,
        data: [
          { id: 'time-1', hours: 8, date: new Date().toISOString().split('T')[0], description: 'Development work', projectId: 'project-1', userId: 'user-1' },
        ],
      });
    }

    // Time entry create
    if (body.action === 'time_entry_create') {
      return HttpResponse.json({
        success: true,
        data: {
          id: 'time-entry-new',
          hours: body.input.hours,
          date: body.input.date,
          description: body.input.description,
          projectId: body.input.projectId,
          ticketId: body.input.ticketId,
          userId: 'user-1',
        },
      });
    }

    // Document read
    if (body.action === 'document_read') {
      const allDocs = [
        {
          id: 'doc-1',
          name: 'Project_Specification.pdf',
          description: 'Technical specification document',
          filePath: '/uploads/1234567_Project_Specification.pdf',
          fileSize: 524288, // 512KB
          mimeType: 'application/pdf',
          category: 'specification',
          projectId: 'project-1',
        },
        {
          id: 'doc-2',
          name: 'Contract.pdf',
          description: 'Signed contract',
          filePath: '/uploads/1234568_Contract.pdf',
          fileSize: 1048576, // 1MB
          mimeType: 'application/pdf',
          category: 'contract',
          projectId: 'project-1',
        },
      ];

      // Filter by projectId if provided
      let filteredDocs = allDocs;
      if (body.filter?.projectId) {
        filteredDocs = allDocs.filter(doc => doc.projectId === body.filter.projectId);
      }

      return HttpResponse.json({
        success: true,
        data: filteredDocs,
      });
    }

    // Document create
    if (body.action === 'document_create') {
      return HttpResponse.json({
        success: true,
        data: {
          id: 'doc-new',
          name: body.input.name,
          filePath: body.input.filePath,
          category: body.input.category || 'other',
        },
      });
    }

    // Project create
    if (body.action === 'project_create') {
      return HttpResponse.json({
        success: true,
        data: {
          id: 'project-new',
          name: body.input.name,
          state: 'draft',
          companyId: body.input.companyId,
          description: body.input.description,
          budget: body.input.budget,
          startDate: body.input.startDate,
          targetEndDate: body.input.targetEndDate,
        },
      });
    }

    // Ticket create
    if (body.action === 'ticket_create') {
      return HttpResponse.json({
        success: true,
        data: {
          id: 'ticket-new',
          title: body.input.title,
          state: 'open',
          projectId: body.input.projectId,
          description: body.input.description,
          priority: body.input.priority,
          category: body.input.category,
        },
      });
    }

    // Project approve
    if (body.action === 'project_approve') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          state: 'in_progress',
          approvedAt: new Date().toISOString(),
        },
      });
    }

    // Project reject
    if (body.action === 'project_reject') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          state: 'draft',
          rejectionReason: body.input?.rejectionReason || null,
        },
      });
    }

    // Ticket start work
    if (body.action === 'ticket_start_work') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          state: 'in_progress',
        },
      });
    }

    // Ticket submit for review
    if (body.action === 'ticket_submit_for_review') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          state: 'in_review',
        },
      });
    }

    // Ticket approve
    if (body.action === 'ticket_approve') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          state: 'resolved',
          resolvedAt: new Date().toISOString(),
        },
      });
    }

    // Ticket request changes
    if (body.action === 'ticket_request_changes') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          state: 'in_progress',
          reviewNotes: body.input?.reviewNotes || null,
        },
      });
    }

    // Invitation read
    if (body.action === 'invitation_read') {
      return HttpResponse.json({
        success: true,
        data: [
          {
            id: 'invitation-1',
            email: 'pending@test.com',
            companyId: 'company-1',
            role: 'customer',
            expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
            acceptedAt: null,
            cancelledAt: null,
            invitedById: 'user-1',
          },
          {
            id: 'invitation-2',
            email: 'accepted@test.com',
            companyId: 'company-1',
            role: 'customer',
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            acceptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            cancelledAt: null,
            invitedById: 'user-1',
          },
          {
            id: 'invitation-3',
            email: 'expired@test.com',
            companyId: 'company-2',
            role: 'customer',
            expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            acceptedAt: null,
            cancelledAt: null,
            invitedById: 'user-2',
          },
        ],
      });
    }

    // Invitation create
    if (body.action === 'invitation_create') {
      return HttpResponse.json({
        success: true,
        data: {
          id: 'invitation-new',
          email: body.input.email,
          companyId: body.input.companyId,
          role: body.input.role || 'customer',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          acceptedAt: null,
          cancelledAt: null,
          invitedById: 'user-1',
        },
      });
    }

    // Invitation accept
    if (body.action === 'invitation_accept') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          acceptedAt: new Date().toISOString(),
          acceptedById: body.input?.userId || 'user-new',
        },
      });
    }

    // Form Response read (all)
    if (body.action === 'form_response_read') {
      return HttpResponse.json({
        success: true,
        data: [
          {
            id: 'response-1',
            projectId: 'project-1',
            formType: 'website',
            section: 'basic_info',
            questionKey: 'company_name',
            answerValue: { value: 'Test Company AB' },
            answerMetadata: null,
            insertedAt: '2025-11-26T10:00:00Z',
            updatedAt: '2025-11-26T10:00:00Z',
          },
          {
            id: 'response-2',
            projectId: 'project-1',
            formType: 'website',
            section: 'basic_info',
            questionKey: 'contact_email',
            answerValue: { value: 'contact@test.com' },
            answerMetadata: null,
            insertedAt: '2025-11-26T10:00:00Z',
            updatedAt: '2025-11-26T10:30:00Z',
          },
          {
            id: 'response-3',
            projectId: 'project-1',
            formType: 'website',
            section: 'goals',
            questionKey: 'primary_goal',
            answerValue: { value: 'lead_generation' },
            answerMetadata: null,
            insertedAt: '2025-11-26T11:00:00Z',
            updatedAt: '2025-11-26T11:00:00Z',
          },
          {
            id: 'response-4',
            projectId: 'project-2',
            formType: 'system',
            section: 'overview',
            questionKey: 'system_type',
            answerValue: { value: 'customer_portal' },
            answerMetadata: null,
            insertedAt: '2025-11-26T09:00:00Z',
            updatedAt: '2025-11-26T09:00:00Z',
          },
        ],
      });
    }

    // Form Response by project
    if (body.action === 'form_response_by_project') {
      const projectId = body.args?.projectId;
      const mockResponses = [
        {
          id: 'response-1',
          projectId: 'project-1',
          formType: 'website',
          section: 'basic_info',
          questionKey: 'company_name',
          answerValue: { value: 'Test Company AB' },
          answerMetadata: null,
        },
        {
          id: 'response-2',
          projectId: 'project-1',
          formType: 'website',
          section: 'basic_info',
          questionKey: 'contact_email',
          answerValue: { value: 'contact@test.com' },
          answerMetadata: null,
        },
        {
          id: 'response-3',
          projectId: 'project-1',
          formType: 'website',
          section: 'goals',
          questionKey: 'primary_goal',
          answerValue: { value: 'lead_generation' },
          answerMetadata: null,
        },
      ];

      return HttpResponse.json({
        success: true,
        data: projectId === 'project-1' ? mockResponses : [],
      });
    }

    // Form Response by project and type
    if (body.action === 'form_response_by_project_and_type') {
      const { projectId, formType } = body.args || {};
      const mockResponses = [
        {
          id: 'response-1',
          projectId: 'project-1',
          formType: 'website',
          section: 'basic_info',
          questionKey: 'company_name',
          answerValue: { value: 'Test Company AB' },
          answerMetadata: null,
        },
      ];

      return HttpResponse.json({
        success: true,
        data: projectId === 'project-1' && formType === 'website' ? mockResponses : [],
      });
    }

    // Form Response create
    if (body.action === 'form_response_create') {
      return HttpResponse.json({
        success: true,
        data: {
          id: 'response-new',
          projectId: body.input.projectId,
          formType: body.input.formType,
          section: body.input.section,
          questionKey: body.input.questionKey,
          answerValue: body.input.answerValue,
          answerMetadata: body.input.answerMetadata || null,
        },
      });
    }

    // Form Response update
    if (body.action === 'form_response_update') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          answerValue: body.input.answerValue,
        },
      });
    }

    // Form Response destroy
    if (body.action === 'form_response_destroy') {
      return HttpResponse.json({
        success: true,
        data: null,
      });
    }

    // Project submit
    if (body.action === 'project_submit') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          state: 'pending_approval',
        },
      });
    }

    // Project toggle priority
    if (body.action === 'project_toggle_priority') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          isPriority: true, // Toggle to true for test
        },
      });
    }

    // Project set priority
    if (body.action === 'project_set_priority') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          isPriority: body.input?.isPriority ?? false,
        },
      });
    }

    // Internal note read
    if (body.action === 'internal_note_read') {
      return HttpResponse.json({
        success: true,
        data: [
          {
            id: 'note-1',
            content: 'This is a test internal note',
            projectId: 'project-1',
            authorId: 'user-1',
            insertedAt: '2025-11-26T10:00:00Z',
            updatedAt: '2025-11-26T10:00:00Z',
          },
        ],
      });
    }

    // Internal note by project
    if (body.action === 'internal_note_by_project') {
      return HttpResponse.json({
        success: true,
        data: [
          {
            id: 'note-1',
            content: 'This is a test internal note',
            projectId: body.args?.projectId || 'project-1',
            authorId: 'user-1',
            insertedAt: '2025-11-26T10:00:00Z',
            updatedAt: '2025-11-26T10:00:00Z',
          },
        ],
      });
    }

    // Internal note create
    if (body.action === 'internal_note_create') {
      return HttpResponse.json({
        success: true,
        data: {
          id: 'note-new',
          content: body.input.content,
          projectId: body.input.projectId,
          authorId: 'user-1',
          insertedAt: new Date().toISOString(),
        },
      });
    }

    // Internal note update
    if (body.action === 'internal_note_update') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          content: body.input.content,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // Internal note destroy
    if (body.action === 'internal_note_destroy') {
      return HttpResponse.json({
        success: true,
        data: null,
      });
    }

    // Meeting read
    if (body.action === 'meeting_read') {
      return HttpResponse.json({
        success: true,
        data: [
          {
            id: 'meeting-1',
            title: 'Kickoff Meeting',
            description: 'Project kickoff',
            meetingType: 'kickoff',
            scheduledAt: new Date('2025-11-27T10:00:00Z').toISOString(),
            durationMinutes: 60,
            location: 'Conference Room A',
            meetingUrl: 'https://meet.google.com/abc-defg-hij',
            notes: 'Discussed project scope',
            actionItems: { items: ['Review specs', 'Assign tasks'] },
            attendees: ['John Doe', 'Jane Smith'],
            status: 'scheduled',
            projectId: 'project-1',
          },
        ],
      });
    }

    // Meeting by project
    if (body.action === 'meeting_by_project') {
      const projectId = body.args?.projectId;
      return HttpResponse.json({
        success: true,
        data: projectId === 'project-1' ? [
          {
            id: 'meeting-1',
            title: 'Kickoff Meeting',
            description: 'Project kickoff',
            meetingType: 'kickoff',
            scheduledAt: new Date('2025-11-27T10:00:00Z').toISOString(),
            durationMinutes: 60,
            location: 'Conference Room A',
            meetingUrl: 'https://meet.google.com/abc-defg-hij',
            notes: 'Discussed project scope',
            actionItems: { items: ['Review specs', 'Assign tasks'] },
            attendees: ['John Doe', 'Jane Smith'],
            status: 'scheduled',
            projectId: 'project-1',
          },
        ] : [],
      });
    }

    // Meeting upcoming by project
    if (body.action === 'meeting_upcoming_by_project') {
      const projectId = body.args?.projectId;
      return HttpResponse.json({
        success: true,
        data: projectId === 'project-1' ? [
          {
            id: 'meeting-1',
            title: 'Kickoff Meeting',
            status: 'scheduled',
            projectId: 'project-1',
          },
        ] : [],
      });
    }

    // Meeting create
    if (body.action === 'meeting_create') {
      return HttpResponse.json({
        success: true,
        data: {
          id: 'meeting-new',
          title: body.input.title,
          description: body.input.description,
          meetingType: body.input.meetingType || 'other',
          scheduledAt: body.input.scheduledAt,
          durationMinutes: body.input.durationMinutes || 60,
          location: body.input.location,
          meetingUrl: body.input.meetingUrl,
          notes: body.input.notes,
          actionItems: body.input.actionItems,
          attendees: body.input.attendees,
          status: body.input.status || 'scheduled',
          projectId: body.input.projectId,
        },
      });
    }

    // Meeting update
    if (body.action === 'meeting_update') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          ...body.input,
        },
      });
    }

    // Meeting start
    if (body.action === 'meeting_start') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          status: 'in_progress',
        },
      });
    }

    // Meeting complete
    if (body.action === 'meeting_complete') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          status: 'completed',
          notes: body.input?.notes,
          actionItems: body.input?.actionItems,
        },
      });
    }

    // Meeting cancel
    if (body.action === 'meeting_cancel') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          status: 'cancelled',
        },
      });
    }

    // Meeting destroy
    if (body.action === 'meeting_destroy') {
      return HttpResponse.json({
        success: true,
        data: null,
      });
    }

    // Milestone read
    if (body.action === 'milestone_read') {
      return HttpResponse.json({
        success: true,
        data: [
          {
            id: 'milestone-1',
            title: 'Project Kickoff',
            description: 'Initial project setup',
            dueDate: new Date('2025-11-20T00:00:00Z').toISOString(),
            orderIndex: 0,
            status: 'completed',
            completedAt: new Date('2025-11-19T00:00:00Z').toISOString(),
            projectId: 'project-1',
          },
        ],
      });
    }

    // Milestone by project
    if (body.action === 'milestone_by_project') {
      const projectId = body.args?.projectId;
      return HttpResponse.json({
        success: true,
        data: projectId === 'project-1' ? [
          {
            id: 'milestone-1',
            title: 'Project Kickoff',
            description: 'Initial project setup',
            dueDate: new Date('2025-11-20T00:00:00Z').toISOString(),
            orderIndex: 0,
            status: 'completed',
            completedAt: new Date('2025-11-19T00:00:00Z').toISOString(),
            projectId: 'project-1',
          },
        ] : [],
      });
    }

    // Milestone create
    if (body.action === 'milestone_create') {
      return HttpResponse.json({
        success: true,
        data: {
          id: 'milestone-new',
          title: body.input.title,
          description: body.input.description,
          dueDate: body.input.dueDate,
          orderIndex: body.input.orderIndex || 0,
          status: body.input.status || 'pending',
          completedAt: null,
          projectId: body.input.projectId,
        },
      });
    }

    // Milestone update
    if (body.action === 'milestone_update') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          ...body.input,
        },
      });
    }

    // Milestone mark completed
    if (body.action === 'milestone_mark_completed') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      });
    }

    // Milestone reopen
    if (body.action === 'milestone_reopen') {
      return HttpResponse.json({
        success: true,
        data: {
          id: body.primaryKey,
          status: 'in_progress',
          completedAt: null,
        },
      });
    }

    // Milestone destroy
    if (body.action === 'milestone_destroy') {
      return HttpResponse.json({
        success: true,
        data: null,
      });
    }

    return HttpResponse.json({ success: false, errors: [{ message: 'Unknown action' }] }, { status: 400 });
  }),
];

export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorageMock.clear();
});

// Close server after all tests
afterAll(() => server.close());

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'sv',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));
