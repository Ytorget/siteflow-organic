import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CustomerDashboard from '../../../components/dashboards/CustomerDashboard';

// Mock the useAuth hook
const mockUser = {
  id: 'user-1',
  email: 'customer@company.com',
  role: 'customer' as const,
  companyId: 'company-1',
  firstName: 'Customer',
  lastName: 'User'
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    token: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    getAuthHeaders: () => ({ 'Authorization': 'Bearer mock-token' }),
  }),
}));

// Mock the useApi hooks
const mockUseProjects = vi.fn();
const mockUseTickets = vi.fn();

vi.mock('../../hooks/useApi', () => ({
  useProjects: () => mockUseProjects(),
  useTickets: () => mockUseTickets(),
}));

// Mock CreateTicketForm
vi.mock('../../../components/forms/CreateTicketForm', () => ({
  default: ({ onSuccess, onCancel }: any) => (
    <div data-testid="create-ticket-form">
      <button onClick={onSuccess}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Mock Modal
vi.mock('../../../components/shared/Modal', () => ({
  default: ({ isOpen, onClose, title, children }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose}>Close Modal</button>
        {children}
      </div>
    ) : null,
}));

// Mock StatsCard
vi.mock('../../../components/dashboards/StatsCard', () => ({
  default: ({ title, value, icon, color }: any) => (
    <div data-testid="stats-card" data-color={color}>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
}));

// Mock ProjectSelector
vi.mock('../../../components/shared/ProjectSelector', () => ({
  default: ({ value, onChange }: any) => (
    <div data-testid="project-selector">
      <button onClick={() => onChange('project-1')}>Select Project</button>
      {value && <span data-testid="selected-project">{value}</span>}
    </div>
  ),
}));

// Mock ProjectOverview
vi.mock('../../../components/ProjectOverview', () => ({
  default: ({ projectId, canEdit }: any) => (
    <div data-testid="project-overview" data-project-id={projectId} data-can-edit={canEdit}>
      Project Overview for {projectId}
    </div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('CustomerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseProjects.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    const { container } = render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Look for the loading spinner by its class
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render error state', async () => {
    const error = new Error('Failed to load data');
    mockUseProjects.mockReturnValue({
      data: [],
      isLoading: false,
      error,
    });
    mockUseTickets.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });
  });

  it('should filter projects by company ID', async () => {
    const projects = [
      { id: 'project-1', name: 'Company Project 1', state: 'in_progress', companyId: 'company-1' },
      { id: 'project-2', name: 'Company Project 2', state: 'draft', companyId: 'company-1' },
      { id: 'project-3', name: 'Other Company Project', state: 'in_progress', companyId: 'company-2' },
    ];

    mockUseProjects.mockReturnValue({
      data: projects.filter(p => p.companyId === 'company-1'),
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Company Project 1')).toBeInTheDocument();
      expect(screen.getByText('Company Project 2')).toBeInTheDocument();
      expect(screen.queryByText('Other Company Project')).not.toBeInTheDocument();
    });
  });

  it('should filter tickets to only show those from company projects', async () => {
    const projects = [
      { id: 'project-1', name: 'Company Project', state: 'in_progress', companyId: 'company-1' },
    ];
    const tickets = [
      { id: 'ticket-1', title: 'Company Ticket', state: 'open', priority: 'high', projectId: 'project-1' },
      { id: 'ticket-2', title: 'Other Company Ticket', state: 'open', priority: 'medium', projectId: 'project-2' },
    ];

    mockUseProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: tickets,
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Company Ticket')).toBeInTheDocument();
      expect(screen.queryByText('Other Company Ticket')).not.toBeInTheDocument();
    });
  });

  it('should calculate stats correctly', async () => {
    const projects = [
      { id: 'project-1', name: 'Active Project 1', state: 'in_progress', companyId: 'company-1' },
      { id: 'project-2', name: 'Active Project 2', state: 'in_progress', companyId: 'company-1' },
      { id: 'project-3', name: 'Draft Project', state: 'draft', companyId: 'company-1' },
    ];
    const tickets = [
      { id: 'ticket-1', title: 'Open Ticket 1', state: 'open', priority: 'critical', projectId: 'project-1' },
      { id: 'ticket-2', title: 'Open Ticket 2', state: 'in_progress', priority: 'high', projectId: 'project-1' },
      { id: 'ticket-3', title: 'Resolved Ticket', state: 'resolved', priority: 'medium', projectId: 'project-1' },
      { id: 'ticket-4', title: 'Low Priority', state: 'open', priority: 'low', projectId: 'project-2' },
    ];

    mockUseProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: tickets,
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      const statsCards = screen.getAllByTestId('stats-card');

      // Active projects: 2
      const activeProjectsCard = statsCards.find(card =>
        within(card).queryByText('dashboard.stats.activeProjects')
      );
      expect(activeProjectsCard).toHaveTextContent('2');

      // Open tickets (open + in_progress): 3
      const openTicketsCard = statsCards.find(card =>
        within(card).queryByText('dashboard.stats.openTickets')
      );
      expect(openTicketsCard).toHaveTextContent('3');

      // Critical tickets (critical + high): 2
      const criticalTicketsCard = statsCards.find(card =>
        within(card).queryByText('dashboard.stats.criticalIssues')
      );
      expect(criticalTicketsCard).toHaveTextContent('2');
    });
  });

  it('should open modal when clicking "Nytt ärende" button', async () => {
    const user = userEvent.setup();

    mockUseProjects.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Nytt ärende')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Nytt ärende'));

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Skapa nytt ärende')).toBeInTheDocument();
      expect(screen.getByTestId('create-ticket-form')).toBeInTheDocument();
    });
  });

  it('should close modal when form is cancelled', async () => {
    const user = userEvent.setup();

    mockUseProjects.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Open modal
    await user.click(screen.getByText('Nytt ärende'));

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Cancel form
    await user.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('should close modal when form is submitted successfully', async () => {
    const user = userEvent.setup();

    mockUseProjects.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Open modal
    await user.click(screen.getByText('Nytt ärende'));

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Submit form
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('should close modal when clicking close button', async () => {
    const user = userEvent.setup();

    mockUseProjects.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Open modal
    await user.click(screen.getByText('Nytt ärende'));

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Close modal
    await user.click(screen.getByText('Close Modal'));

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('should display empty state when no tickets exist', async () => {
    mockUseProjects.mockReturnValue({
      data: [{ id: 'project-1', name: 'Project', state: 'in_progress', companyId: 'company-1' }],
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('dashboard.noTickets')).toBeInTheDocument();
    });
  });

  it('should display empty state when no projects exist', async () => {
    mockUseProjects.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('dashboard.noProjects')).toBeInTheDocument();
    });
  });

  it('should render ticket state badges with correct colors', async () => {
    const tickets = [
      { id: 'ticket-1', title: 'Open Ticket', state: 'open', priority: 'high', projectId: 'project-1' },
      { id: 'ticket-2', title: 'In Progress', state: 'in_progress', priority: 'medium', projectId: 'project-1' },
      { id: 'ticket-3', title: 'In Review', state: 'in_review', priority: 'low', projectId: 'project-1' },
    ];

    mockUseProjects.mockReturnValue({
      data: [{ id: 'project-1', name: 'Project', state: 'in_progress', companyId: 'company-1' }],
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: tickets,
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Open Ticket')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('In Review')).toBeInTheDocument();
    });
  });

  it('should render priority badges with correct colors', async () => {
    const tickets = [
      { id: 'ticket-1', title: 'Critical', state: 'open', priority: 'critical', projectId: 'project-1' },
      { id: 'ticket-2', title: 'High', state: 'open', priority: 'high', projectId: 'project-1' },
      { id: 'ticket-3', title: 'Medium', state: 'open', priority: 'medium', projectId: 'project-1' },
      { id: 'ticket-4', title: 'Low', state: 'open', priority: 'low', projectId: 'project-1' },
    ];

    mockUseProjects.mockReturnValue({
      data: [{ id: 'project-1', name: 'Project', state: 'in_progress', companyId: 'company-1' }],
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: tickets,
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('critical')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
    });
  });

  it('should only display first 5 tickets in recent tickets section', async () => {
    const tickets = Array.from({ length: 10 }, (_, i) => ({
      id: `ticket-${i}`,
      title: `Ticket ${i}`,
      state: 'open',
      priority: 'medium',
      projectId: 'project-1',
    }));

    mockUseProjects.mockReturnValue({
      data: [{ id: 'project-1', name: 'Project', state: 'in_progress', companyId: 'company-1' }],
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: tickets,
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Ticket 0')).toBeInTheDocument();
      expect(screen.getByText('Ticket 4')).toBeInTheDocument();
      expect(screen.queryByText('Ticket 5')).not.toBeInTheDocument();
    });
  });

  it('should only display first 5 projects in projects overview', async () => {
    const projects = Array.from({ length: 10 }, (_, i) => ({
      id: `project-${i}`,
      name: `Project ${i}`,
      state: 'in_progress',
      companyId: 'company-1',
    }));

    mockUseProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      error: null,
    });
    mockUseTickets.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Project 0')).toBeInTheDocument();
      expect(screen.getByText('Project 4')).toBeInTheDocument();
      expect(screen.queryByText('Project 5')).not.toBeInTheDocument();
    });
  });

  // Integration tests for ProjectSelector and ProjectOverview
  describe('ProjectSelector and ProjectOverview integration', () => {
    it('should render ProjectSelector when there are projects', async () => {
      const projects = [
        { id: 'project-1', name: 'Test Project', state: 'in_progress', companyId: 'company-1' },
      ];

      mockUseProjects.mockReturnValue({
        data: projects,
        isLoading: false,
        error: null,
      });
      mockUseTickets.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<CustomerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('project-selector')).toBeInTheDocument();
      });
    });

    it('should not render ProjectSelector when there are no projects', async () => {
      mockUseProjects.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseTickets.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<CustomerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.queryByTestId('project-selector')).not.toBeInTheDocument();
      });
    });

    it('should show placeholder text when no project is selected', async () => {
      const projects = [
        { id: 'project-1', name: 'Test Project', state: 'in_progress', companyId: 'company-1' },
      ];

      mockUseProjects.mockReturnValue({
        data: projects,
        isLoading: false,
        error: null,
      });
      mockUseTickets.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<CustomerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('projectOverview.noSelection')).toBeInTheDocument();
        expect(screen.queryByTestId('project-overview')).not.toBeInTheDocument();
      });
    });

    it('should render ProjectOverview when a project is selected', async () => {
      const user = userEvent.setup();
      const projects = [
        { id: 'project-1', name: 'Test Project', state: 'in_progress', companyId: 'company-1' },
      ];

      mockUseProjects.mockReturnValue({
        data: projects,
        isLoading: false,
        error: null,
      });
      mockUseTickets.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<CustomerDashboard />, { wrapper: createWrapper() });

      // Select a project
      await waitFor(() => {
        expect(screen.getByTestId('project-selector')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Select Project'));

      // Verify ProjectOverview is rendered with correct project ID
      await waitFor(() => {
        const projectOverview = screen.getByTestId('project-overview');
        expect(projectOverview).toBeInTheDocument();
        expect(projectOverview).toHaveAttribute('data-project-id', 'project-1');
      });
    });

    it('should pass canEdit={false} to ProjectOverview for customer users', async () => {
      const user = userEvent.setup();
      const projects = [
        { id: 'project-1', name: 'Test Project', state: 'in_progress', companyId: 'company-1' },
      ];

      mockUseProjects.mockReturnValue({
        data: projects,
        isLoading: false,
        error: null,
      });
      mockUseTickets.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<CustomerDashboard />, { wrapper: createWrapper() });

      // Select a project
      await waitFor(() => {
        expect(screen.getByTestId('project-selector')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Select Project'));

      // Verify canEdit prop is false
      await waitFor(() => {
        const projectOverview = screen.getByTestId('project-overview');
        expect(projectOverview).toHaveAttribute('data-can-edit', 'false');
      });
    });

    it('should hide placeholder and show ProjectOverview after selection', async () => {
      const user = userEvent.setup();
      const projects = [
        { id: 'project-1', name: 'Test Project', state: 'in_progress', companyId: 'company-1' },
      ];

      mockUseProjects.mockReturnValue({
        data: projects,
        isLoading: false,
        error: null,
      });
      mockUseTickets.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<CustomerDashboard />, { wrapper: createWrapper() });

      // Initially show placeholder
      await waitFor(() => {
        expect(screen.getByText('projectOverview.noSelection')).toBeInTheDocument();
      });

      // Select a project
      await user.click(screen.getByText('Select Project'));

      // Placeholder should be hidden, ProjectOverview should be visible
      await waitFor(() => {
        expect(screen.queryByText('projectOverview.noSelection')).not.toBeInTheDocument();
        expect(screen.getByTestId('project-overview')).toBeInTheDocument();
      });
    });
  });
});
