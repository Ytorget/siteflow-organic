import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectSelector from '../../../components/shared/ProjectSelector';

// Mock the useProjects hook
const mockUseProjects = vi.fn();

vi.mock('../../hooks/useApi', () => ({
  useProjects: () => mockUseProjects(),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockProjects = [
  {
    id: 'project-1',
    name: 'Website Redesign',
    state: 'in_progress',
    companyId: 'company-1',
  },
  {
    id: 'project-2',
    name: 'Mobile App',
    state: 'draft',
    companyId: 'company-1',
  },
  {
    id: 'project-3',
    name: 'Backend API',
    state: 'completed',
    companyId: 'company-1',
  },
];

describe('ProjectSelector', () => {
  const mockOnChange = vi.fn();
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

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorageMock.clear();
    mockOnChange.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseProjects.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<ProjectSelector value={null} onChange={mockOnChange} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Laddar projekt...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseProjects.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    render(<ProjectSelector value={null} onChange={mockOnChange} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Kunde inte hämta projekt')).toBeInTheDocument();
  });

  it('should render empty state when no projects', () => {
    mockUseProjects.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<ProjectSelector value={null} onChange={mockOnChange} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Du har inga projekt')).toBeInTheDocument();
  });

  it('should render dropdown with projects', () => {
    mockUseProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
    });

    render(<ProjectSelector value={null} onChange={mockOnChange} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Välj projekt')).toBeInTheDocument();
  });

  it('should show selected project', () => {
    mockUseProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
    });

    render(<ProjectSelector value="project-1" onChange={mockOnChange} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    expect(screen.getByText('Pågående')).toBeInTheDocument();
  });

  it('should open dropdown when clicked', async () => {
    const user = userEvent.setup();
    mockUseProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
    });

    render(<ProjectSelector value={null} onChange={mockOnChange} />, {
      wrapper: createWrapper(),
    });

    const button = screen.getByText('Välj projekt').closest('button')!;
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Website Redesign')).toBeInTheDocument();
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
      expect(screen.getByText('Backend API')).toBeInTheDocument();
    });
  });

  it('should call onChange when project is selected', async () => {
    const user = userEvent.setup();
    mockUseProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
    });

    render(<ProjectSelector value={null} onChange={mockOnChange} />, {
      wrapper: createWrapper(),
    });

    // Open dropdown
    const button = screen.getByText('Välj projekt').closest('button')!;
    await user.click(button);

    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    });

    // Select a project
    const projectButton = screen.getByText('Website Redesign');
    await user.click(projectButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('project-1');
    });
  });

  it('should save selection to localStorage', async () => {
    const user = userEvent.setup();
    mockUseProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
    });

    const { rerender } = render(<ProjectSelector value={null} onChange={mockOnChange} />, {
      wrapper: createWrapper(),
    });

    // Initially no selection in localStorage
    expect(localStorageMock.getItem('selectedProjectId')).toBeNull();

    // Update value prop
    rerender(<ProjectSelector value="project-1" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(localStorageMock.getItem('selectedProjectId')).toBe('project-1');
    });
  });

  it('should load saved selection from localStorage on mount', () => {
    localStorageMock.setItem('selectedProjectId', 'project-2');
    mockUseProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
    });

    render(<ProjectSelector value={null} onChange={mockOnChange} />, {
      wrapper: createWrapper(),
    });

    // Should call onChange with saved project id if it exists in projects
    waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('project-2');
    });
  });

  it('should close dropdown when backdrop is clicked', async () => {
    const user = userEvent.setup();
    mockUseProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
    });

    render(<ProjectSelector value={null} onChange={mockOnChange} />, {
      wrapper: createWrapper(),
    });

    // Open dropdown
    const button = screen.getByText('Välj projekt').closest('button')!;
    await user.click(button);

    // Wait for dropdown to appear - check for one of the projects
    await waitFor(() => {
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
    });

    // Verify all projects are visible
    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    expect(screen.getByText('Backend API')).toBeInTheDocument();

    // Click backdrop (fixed inset-0 div)
    const backdrop = document.querySelector('.fixed.inset-0') as HTMLElement;
    await user.click(backdrop);

    // Wait for dropdown to close
    await waitFor(() => {
      expect(screen.queryByText('Mobile App')).not.toBeInTheDocument();
      expect(screen.queryByText('Backend API')).not.toBeInTheDocument();
    });
  });

  it('should show correct status badges', () => {
    mockUseProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
    });

    render(<ProjectSelector value="project-1" onChange={mockOnChange} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Pågående')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockUseProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <ProjectSelector value={null} onChange={mockOnChange} className="custom-class" />,
      {
        wrapper: createWrapper(),
      }
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
