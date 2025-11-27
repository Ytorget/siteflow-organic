import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectTimeline from '../../../components/timeline/ProjectTimeline';

// Mock hooks
const mockUseMilestonesByProject = vi.fn();
const mockUseCreateMilestone = vi.fn();
const mockUseUpdateMilestone = vi.fn();
const mockUseMarkMilestoneCompleted = vi.fn();
const mockUseReopenMilestone = vi.fn();
const mockUseDeleteMilestone = vi.fn();

vi.mock('../../hooks/useApi', () => ({
  useMilestonesByProject: () => mockUseMilestonesByProject(),
  useCreateMilestone: () => mockUseCreateMilestone(),
  useUpdateMilestone: () => mockUseUpdateMilestone(),
  useMarkMilestoneCompleted: () => mockUseMarkMilestoneCompleted(),
  useReopenMilestone: () => mockUseReopenMilestone(),
  useDeleteMilestone: () => mockUseDeleteMilestone(),
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

describe('ProjectTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseMilestonesByProject.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    mockUseCreateMilestone.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'milestone-new' }),
      isPending: false,
    });

    mockUseUpdateMilestone.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'milestone-1' }),
      isPending: false,
    });

    mockUseMarkMilestoneCompleted.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'milestone-1', status: 'completed' }),
      isPending: false,
    });

    mockUseReopenMilestone.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'milestone-1', status: 'in_progress' }),
      isPending: false,
    });

    mockUseDeleteMilestone.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(null),
      isPending: false,
    });
  });

  describe('Loading and Error States', () => {
    it('should render loading state', () => {
      mockUseMilestonesByProject.mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      const { container } = render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should render error state with message', async () => {
      const error = new Error('Failed to load milestones');
      mockUseMilestonesByProject.mockReturnValue({
        data: [],
        isLoading: false,
        error,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to load milestones')).toBeInTheDocument();
        expect(screen.getByText('Försök igen')).toBeInTheDocument();
      });
    });

    it('should render error state with default message when error has no message', async () => {
      mockUseMilestonesByProject.mockReturnValue({
        data: [],
        isLoading: false,
        error: {},
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Ett fel uppstod vid laddning av milstolpar')).toBeInTheDocument();
      });
    });
  });

  describe('Header and Navigation', () => {
    it('should render header with title and description', async () => {
      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Projektmilstolpar')).toBeInTheDocument();
        expect(screen.getByText('Följ projektutvecklingen och viktiga milstolpar')).toBeInTheDocument();
      });
    });

    it('should show "Ny milstolpe" button when canEdit=true', async () => {
      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Ny milstolpe')).toBeInTheDocument();
      });
    });

    it('should not show "Ny milstolpe" button when canEdit=false', async () => {
      render(<ProjectTimeline projectId="project-1" canEdit={false} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.queryByText('Ny milstolpe')).not.toBeInTheDocument();
      });
    });

    it('should render with canEdit=false', () => {
      render(<ProjectTimeline projectId="project-1" canEdit={false} />, {
        wrapper: createWrapper(),
      });

      // Component should still render without errors
      expect(screen.getByText('Projektmilstolpar')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no milestones exist', async () => {
      mockUseMilestonesByProject.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Inga milstolpar skapade än')).toBeInTheDocument();
      });
    });

    it('should show "Skapa första milstolpen" button in empty state when canEdit=true', async () => {
      mockUseMilestonesByProject.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Skapa första milstolpen')).toBeInTheDocument();
      });
    });

    it('should not show "Skapa första milstolpen" button when canEdit=false', async () => {
      mockUseMilestonesByProject.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={false} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Inga milstolpar skapade än')).toBeInTheDocument();
        expect(screen.queryByText('Skapa första milstolpen')).not.toBeInTheDocument();
      });
    });
  });

  describe('Progress Bar', () => {
    it('should display progress bar when milestones exist', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Design Phase',
          status: 'completed',
          orderIndex: 0,
          projectId: 'project-1',
        },
        {
          id: 'milestone-2',
          title: 'Development Phase',
          status: 'in_progress',
          orderIndex: 1,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Projektframsteg')).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });

    it('should calculate progress correctly with all completed', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Milestone 1',
          status: 'completed',
          orderIndex: 0,
          projectId: 'project-1',
        },
        {
          id: 'milestone-2',
          title: 'Milestone 2',
          status: 'completed',
          orderIndex: 1,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    it('should calculate progress correctly with none completed', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Milestone 1',
          status: 'pending',
          orderIndex: 0,
          projectId: 'project-1',
        },
        {
          id: 'milestone-2',
          title: 'Milestone 2',
          status: 'pending',
          orderIndex: 1,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument();
      });
    });

    it('should not show progress bar when no milestones', async () => {
      mockUseMilestonesByProject.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.queryByText('Projektframsteg')).not.toBeInTheDocument();
      });
    });
  });

  describe('Milestone Display', () => {
    it('should display milestones when data is loaded', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Design Phase',
          description: 'Complete the design mockups',
          status: 'completed',
          dueDate: '2025-12-31',
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Design Phase')).toBeInTheDocument();
        expect(screen.getByText('Complete the design mockups')).toBeInTheDocument();
      });
    });

    it('should sort milestones by orderIndex', async () => {
      const mockMilestones = [
        {
          id: 'milestone-2',
          title: 'Second Milestone',
          status: 'pending',
          orderIndex: 1,
          projectId: 'project-1',
        },
        {
          id: 'milestone-1',
          title: 'First Milestone',
          status: 'pending',
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const milestones = screen.getAllByRole('heading', { level: 4 });
        expect(milestones[0]).toHaveTextContent('First Milestone');
        expect(milestones[1]).toHaveTextContent('Second Milestone');
      });
    });

    it('should display status badge with correct text', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Pending Milestone',
          status: 'pending',
          orderIndex: 0,
          projectId: 'project-1',
        },
        {
          id: 'milestone-2',
          title: 'In Progress Milestone',
          status: 'in_progress',
          orderIndex: 1,
          projectId: 'project-1',
        },
        {
          id: 'milestone-3',
          title: 'Completed Milestone',
          status: 'completed',
          orderIndex: 2,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Väntande')).toBeInTheDocument();
        expect(screen.getByText('Pågående')).toBeInTheDocument();
        expect(screen.getByText('Klar')).toBeInTheDocument();
      });
    });

    it('should display deadline when present', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Design Phase',
          status: 'pending',
          dueDate: '2025-12-31',
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText(/Deadline:/)).toBeInTheDocument();
        expect(screen.getByText(/2025-12-31/)).toBeInTheDocument();
      });
    });

    it('should display completed date when milestone is completed', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Design Phase',
          status: 'completed',
          completedAt: '2025-11-15T10:00:00Z',
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText(/Klar:/)).toBeInTheDocument();
      });
    });

    it('should show overdue indicator for overdue milestones', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Overdue Milestone',
          status: 'pending',
          dueDate: pastDate.toISOString().split('T')[0],
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Försenad milstolpe')).toBeInTheDocument();
      });
    });

    it('should not show overdue indicator for completed milestones even if past due date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Completed on time',
          status: 'completed',
          dueDate: pastDate.toISOString().split('T')[0],
          completedAt: new Date(pastDate.getTime() - 86400000).toISOString(), // completed before due date
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.queryByText('Försenad milstolpe')).not.toBeInTheDocument();
      });
    });
  });

  describe('Status Styling', () => {
    it('should display pending status with correct styling', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Pending Milestone',
          status: 'pending',
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      const { container } = render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(container.querySelector('.bg-slate-100')).toBeInTheDocument();
      });
    });

    it('should display in_progress status with correct styling', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'In Progress Milestone',
          status: 'in_progress',
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      const { container } = render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(container.querySelector('.bg-blue-100')).toBeInTheDocument();
      });
    });

    it('should display completed status with correct styling', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Completed Milestone',
          status: 'completed',
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      const { container } = render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
      });
    });
  });

  describe('Timeline Connectors', () => {
    it('should show timeline connector between milestones', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'First Milestone',
          status: 'completed',
          orderIndex: 0,
          projectId: 'project-1',
        },
        {
          id: 'milestone-2',
          title: 'Second Milestone',
          status: 'pending',
          orderIndex: 1,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      const { container } = render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        // Timeline connector has h-12 class
        expect(container.querySelector('.h-12')).toBeInTheDocument();
      });
    });

    it('should not show connector after last milestone', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Only Milestone',
          status: 'pending',
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      const { container } = render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        // Should not have h-12 connector when only one milestone
        expect(container.querySelector('.h-12')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit Actions', () => {
    it('should show action buttons when canEdit=true', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Milestone',
          status: 'pending',
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      const { container } = render(<ProjectTimeline projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        // Check for edit, delete, and toggle complete buttons
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(1); // Should have multiple action buttons
      });
    });

    it('should not show action buttons when canEdit=false', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          title: 'Milestone',
          status: 'pending',
          orderIndex: 0,
          projectId: 'project-1',
        },
      ];

      mockUseMilestonesByProject.mockReturnValue({
        data: mockMilestones,
        isLoading: false,
        error: null,
      });

      const { container } = render(<ProjectTimeline projectId="project-1" canEdit={false} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        // Should not have edit/delete buttons in the milestone card
        const milestoneCard = container.querySelector('.rounded-xl');
        expect(milestoneCard).toBeInTheDocument();
        // Count buttons - should only have header button if any
        const actionButtons = container.querySelectorAll('.p-2');
        expect(actionButtons.length).toBe(0);
      });
    });
  });
});
