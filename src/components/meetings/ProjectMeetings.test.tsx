import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectMeetings from '../../../components/meetings/ProjectMeetings';

// Mock hooks
const mockUseMeetingsByProject = vi.fn();
const mockUseCreateMeeting = vi.fn();
const mockUseUpdateMeeting = vi.fn();
const mockUseStartMeeting = vi.fn();
const mockUseCompleteMeeting = vi.fn();
const mockUseCancelMeeting = vi.fn();
const mockUseDeleteMeeting = vi.fn();

vi.mock('../../hooks/useApi', () => ({
  useMeetingsByProject: () => mockUseMeetingsByProject(),
  useCreateMeeting: () => mockUseCreateMeeting(),
  useUpdateMeeting: () => mockUseUpdateMeeting(),
  useStartMeeting: () => mockUseStartMeeting(),
  useCompleteMeeting: () => mockUseCompleteMeeting(),
  useCancelMeeting: () => mockUseCancelMeeting(),
  useDeleteMeeting: () => mockUseDeleteMeeting(),
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

describe('ProjectMeetings', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseMeetingsByProject.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    mockUseCreateMeeting.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'meeting-new' }),
      isPending: false,
    });

    mockUseUpdateMeeting.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'meeting-1' }),
      isPending: false,
    });

    mockUseStartMeeting.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'meeting-1', status: 'in_progress' }),
      isPending: false,
    });

    mockUseCompleteMeeting.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'meeting-1', status: 'completed' }),
      isPending: false,
    });

    mockUseCancelMeeting.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'meeting-1', status: 'cancelled' }),
      isPending: false,
    });

    mockUseDeleteMeeting.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(null),
      isPending: false,
    });
  });

  describe('Loading and Error States', () => {
    it('should render loading state', () => {
      mockUseMeetingsByProject.mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      const { container } = render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should render error state with message', async () => {
      const error = new Error('Failed to load meetings');
      mockUseMeetingsByProject.mockReturnValue({
        data: [],
        isLoading: false,
        error,
      });

      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to load meetings')).toBeInTheDocument();
        expect(screen.getByText('Försök igen')).toBeInTheDocument();
      });
    });

    it('should render error state with default message when error has no message', async () => {
      mockUseMeetingsByProject.mockReturnValue({
        data: [],
        isLoading: false,
        error: {},
      });

      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Ett fel uppstod vid laddning av möten')).toBeInTheDocument();
      });
    });
  });

  describe('Calendar Rendering', () => {
    it('should render calendar with header', async () => {
      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Möten')).toBeInTheDocument();
        expect(screen.getByText('Schemalägg och hantera projektmöten')).toBeInTheDocument();
      });
    });

    it('should render weekday headers', async () => {
      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Sön')).toBeInTheDocument();
        expect(screen.getByText('Mån')).toBeInTheDocument();
        expect(screen.getByText('Tis')).toBeInTheDocument();
        expect(screen.getByText('Ons')).toBeInTheDocument();
        expect(screen.getByText('Tor')).toBeInTheDocument();
        expect(screen.getByText('Fre')).toBeInTheDocument();
        expect(screen.getByText('Lör')).toBeInTheDocument();
      });
    });

    it('should render calendar grid with 42 days', async () => {
      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const calendarCells = document.querySelectorAll('.min-h-24');
        // Should have 42 days (6 weeks)
        expect(calendarCells.length).toBe(42);
      });
    });

    it('should show navigation buttons', async () => {
      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Idag')).toBeInTheDocument();
      });
    });

    it('should show current month and year', async () => {
      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        // Should show month and year (case insensitive)
        const currentDate = new Date();
        const monthNames = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
        const expectedMonth = monthNames[currentDate.getMonth()];
        const expectedYear = currentDate.getFullYear().toString();

        expect(screen.getByText(new RegExp(expectedMonth, 'i'))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(expectedYear))).toBeInTheDocument();
      });
    });
  });

  describe('Meeting Display', () => {
    it('should display meetings when data is loaded', async () => {
      // Use today's date to ensure the meeting appears in the calendar
      const today = new Date();
      today.setHours(10, 0, 0, 0);

      const mockMeetings = [
        {
          id: 'meeting-1',
          title: 'Kickoff Meeting',
          description: 'Project kickoff',
          meetingType: 'kickoff',
          scheduledAt: today.toISOString(),
          durationMinutes: 60,
          location: 'Conference Room A',
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          notes: 'Discussed project scope',
          actionItems: { items: ['Review specs', 'Assign tasks'] },
          attendees: ['John Doe', 'Jane Smith'],
          status: 'scheduled',
          projectId: 'project-1',
          createdById: 'user-1',
        },
      ];

      mockUseMeetingsByProject.mockReturnValue({
        data: mockMeetings,
        isLoading: false,
        error: null,
      });

      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText(/Kickoff Meeting/)).toBeInTheDocument();
      });
    });

    it('should display meeting type badges with correct styling', async () => {
      const today = new Date();
      today.setHours(10, 0, 0, 0);

      const mockMeetings = [
        {
          id: 'meeting-1',
          title: 'Kickoff',
          meetingType: 'kickoff',
          scheduledAt: today.toISOString(),
          status: 'scheduled',
          projectId: 'project-1',
          durationMinutes: 60,
        },
      ];

      mockUseMeetingsByProject.mockReturnValue({
        data: mockMeetings,
        isLoading: false,
        error: null,
      });

      const { container } = render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        // Check that the meeting renders with proper styling classes (kickoff has bg-purple-100)
        expect(container.querySelector('.bg-purple-100')).toBeInTheDocument();
      });
    });

    it('should display multiple meetings on the same day', async () => {
      const today = new Date();
      const morning = new Date(today);
      morning.setHours(9, 0, 0, 0);
      const afternoon = new Date(today);
      afternoon.setHours(14, 0, 0, 0);

      const mockMeetings = [
        {
          id: 'meeting-1',
          title: 'Morning Meeting',
          meetingType: 'status_update',
          scheduledAt: morning.toISOString(),
          status: 'scheduled',
          projectId: 'project-1',
          durationMinutes: 30,
        },
        {
          id: 'meeting-2',
          title: 'Afternoon Meeting',
          meetingType: 'review',
          scheduledAt: afternoon.toISOString(),
          status: 'scheduled',
          projectId: 'project-1',
          durationMinutes: 60,
        },
      ];

      mockUseMeetingsByProject.mockReturnValue({
        data: mockMeetings,
        isLoading: false,
        error: null,
      });

      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText(/Morning Meeting/)).toBeInTheDocument();
        expect(screen.getByText(/Afternoon Meeting/)).toBeInTheDocument();
      });
    });

    it('should show "+X fler" indicator when more than 2 meetings on same day', async () => {
      const today = new Date();
      today.setHours(10, 0, 0, 0);

      const mockMeetings = [
        {
          id: 'meeting-1',
          title: 'Meeting 1',
          meetingType: 'status_update',
          scheduledAt: today.toISOString(),
          status: 'scheduled',
          projectId: 'project-1',
          durationMinutes: 30,
        },
        {
          id: 'meeting-2',
          title: 'Meeting 2',
          meetingType: 'review',
          scheduledAt: today.toISOString(),
          status: 'scheduled',
          projectId: 'project-1',
          durationMinutes: 30,
        },
        {
          id: 'meeting-3',
          title: 'Meeting 3',
          meetingType: 'planning',
          scheduledAt: today.toISOString(),
          status: 'scheduled',
          projectId: 'project-1',
          durationMinutes: 30,
        },
      ];

      mockUseMeetingsByProject.mockReturnValue({
        data: mockMeetings,
        isLoading: false,
        error: null,
      });

      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText(/\+1 fler/)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Permissions', () => {
    it('should show "Nytt möte" button when canEdit=true', async () => {
      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Nytt möte')).toBeInTheDocument();
      });
    });

    it('should not show "Nytt möte" button when canEdit=false', async () => {
      render(<ProjectMeetings projectId="project-1" canEdit={false} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.queryByText('Nytt möte')).not.toBeInTheDocument();
      });
    });

    it('should render with canEdit=false', () => {
      render(<ProjectMeetings projectId="project-1" canEdit={false} />, {
        wrapper: createWrapper(),
      });

      // Component should still render without errors
      expect(screen.getByText('Möten')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should handle empty meeting list', async () => {
      mockUseMeetingsByProject.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Möten')).toBeInTheDocument();
        // Should still show calendar even with no meetings
        expect(screen.getByText('Idag')).toBeInTheDocument();
      });
    });
  });

  describe('Meeting Types', () => {
    const meetingTypes = [
      { type: 'kickoff', colorClass: 'bg-purple-100' },
      { type: 'status_update', colorClass: 'bg-blue-100' },
      { type: 'review', colorClass: 'bg-green-100' },
      { type: 'planning', colorClass: 'bg-orange-100' },
      { type: 'retrospective', colorClass: 'bg-pink-100' },
      { type: 'other', colorClass: 'bg-slate-100' },
    ];

    meetingTypes.forEach(({ type, colorClass }) => {
      it(`should display ${type} meeting type with correct color`, async () => {
        const today = new Date();
        today.setHours(10, 0, 0, 0);

        const mockMeetings = [
          {
            id: 'meeting-1',
            title: `${type} Meeting`,
            meetingType: type,
            scheduledAt: today.toISOString(),
            status: 'scheduled',
            projectId: 'project-1',
            durationMinutes: 60,
          },
        ];

        mockUseMeetingsByProject.mockReturnValue({
          data: mockMeetings,
          isLoading: false,
          error: null,
        });

        const { container } = render(<ProjectMeetings projectId="project-1" canEdit={true} />, {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(container.querySelector(`.${colorClass}`)).toBeInTheDocument();
        });
      });
    });
  });
});
