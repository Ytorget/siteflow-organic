import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketConversation from '../../../components/shared/TicketConversation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../context/AuthContext';
import * as useApiHooks from '../../hooks/useApi';

// Mock the useApi hooks
vi.mock('../../hooks/useApi', () => ({
  useCommentsByTicket: vi.fn(),
  useCreateComment: vi.fn(),
}));

// Mock the AuthContext
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: { id: 'user-1', email: 'test@example.com', role: 'customer' },
      isAuthenticated: true,
      getAuthHeaders: () => ({ Authorization: 'Bearer test-token' }),
    })),
  };
});

describe('TicketConversation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  const renderComponent = (ticketId: string, canAddInternal = false) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TicketConversation ticketId={ticketId} canAddInternal={canAddInternal} />
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it('renders loading state', () => {
    vi.mocked(useApiHooks.useCommentsByTicket).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    renderComponent('ticket-1');
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  it('renders empty state when no comments', () => {
    vi.mocked(useApiHooks.useCommentsByTicket).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    renderComponent('ticket-1');
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('renders comments in chat format', () => {
    const mockComments = [
      {
        id: 'comment-1',
        body: 'Test comment 1',
        isInternal: false,
        ticketId: 'ticket-1',
        authorId: 'user-1',
        insertedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'comment-2',
        body: 'Test comment 2',
        isInternal: true,
        ticketId: 'ticket-1',
        authorId: 'user-2',
        insertedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    vi.mocked(useApiHooks.useCommentsByTicket).mockReturnValue({
      data: mockComments,
      isLoading: false,
    } as any);

    renderComponent('ticket-1');
    expect(screen.getByText('Test comment 1')).toBeInTheDocument();
    expect(screen.getByText('Test comment 2')).toBeInTheDocument();
  });

  it('allows creating new comment', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn().mockResolvedValue({});

    vi.mocked(useApiHooks.useCommentsByTicket).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    vi.mocked(useApiHooks.useCreateComment).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    renderComponent('ticket-1');

    const textarea = screen.getByPlaceholderText(/write your message/i);
    await user.type(textarea, 'New test comment');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        ticketId: 'ticket-1',
        body: 'New test comment',
        isInternal: false,
      });
    });
  });

  it('shows internal comment toggle when allowed', () => {
    vi.mocked(useApiHooks.useCommentsByTicket).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    renderComponent('ticket-1', true);
    expect(screen.getByText(/mark as internal/i)).toBeInTheDocument();
  });

  it('hides internal comment toggle when not allowed', () => {
    vi.mocked(useApiHooks.useCommentsByTicket).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    renderComponent('ticket-1', false);
    expect(screen.queryByText(/mark as internal/i)).not.toBeInTheDocument();
  });
});
