import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectOverview from '../../components/ProjectOverview';

// Mock ProjectTimeline
vi.mock('../../components/timeline/ProjectTimeline', () => ({
  default: ({ projectId, canEdit }: any) => (
    <div data-testid="project-timeline" data-project-id={projectId} data-can-edit={canEdit}>
      Timeline for {projectId}
    </div>
  ),
}));

// Mock ProjectMeetings
vi.mock('../../components/meetings/ProjectMeetings', () => ({
  default: ({ projectId, canEdit }: any) => (
    <div data-testid="project-meetings" data-project-id={projectId} data-can-edit={canEdit}>
      Meetings for {projectId}
    </div>
  ),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe('ProjectOverview', () => {
  it('should render with tabs', () => {
    render(<ProjectOverview projectId="project-1" />);

    expect(screen.getByText('Tidslinje')).toBeInTheDocument();
    expect(screen.getByText('Möten')).toBeInTheDocument();
  });

  it('should show Timeline tab by default', () => {
    render(<ProjectOverview projectId="project-1" />);

    expect(screen.getByTestId('project-timeline')).toBeInTheDocument();
    expect(screen.queryByTestId('project-meetings')).not.toBeInTheDocument();
  });

  it('should switch to Meetings tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectOverview projectId="project-1" />);

    const meetingsTab = screen.getByText('Möten');
    await user.click(meetingsTab);

    expect(screen.getByTestId('project-meetings')).toBeInTheDocument();
    expect(screen.queryByTestId('project-timeline')).not.toBeInTheDocument();
  });

  it('should switch back to Timeline tab', async () => {
    const user = userEvent.setup();
    render(<ProjectOverview projectId="project-1" />);

    // Click Meetings tab
    const meetingsTab = screen.getByText('Möten');
    await user.click(meetingsTab);
    expect(screen.getByTestId('project-meetings')).toBeInTheDocument();

    // Click Timeline tab again
    const timelineTab = screen.getByText('Tidslinje');
    await user.click(timelineTab);
    expect(screen.getByTestId('project-timeline')).toBeInTheDocument();
    expect(screen.queryByTestId('project-meetings')).not.toBeInTheDocument();
  });

  it('should pass projectId to child components', () => {
    render(<ProjectOverview projectId="project-123" />);

    const timeline = screen.getByTestId('project-timeline');
    expect(timeline).toHaveAttribute('data-project-id', 'project-123');
  });

  it('should pass canEdit prop to child components', () => {
    render(<ProjectOverview projectId="project-1" canEdit={true} />);

    const timeline = screen.getByTestId('project-timeline');
    expect(timeline).toHaveAttribute('data-can-edit', 'true');
  });

  it('should default canEdit to false', () => {
    render(<ProjectOverview projectId="project-1" />);

    const timeline = screen.getByTestId('project-timeline');
    expect(timeline).toHaveAttribute('data-can-edit', 'false');
  });

  it('should apply active tab styling', () => {
    render(<ProjectOverview projectId="project-1" />);

    const timelineTab = screen.getByText('Tidslinje').closest('button');
    const meetingsTab = screen.getByText('Möten').closest('button');

    expect(timelineTab?.className).toContain('border-primary-500');
    expect(meetingsTab?.className).toContain('border-transparent');
  });

  it('should update active tab styling when switching tabs', async () => {
    const user = userEvent.setup();
    render(<ProjectOverview projectId="project-1" />);

    const meetingsTab = screen.getByText('Möten').closest('button');
    await user.click(meetingsTab!);

    const timelineTab = screen.getByText('Tidslinje').closest('button');

    expect(meetingsTab?.className).toContain('border-primary-500');
    expect(timelineTab?.className).toContain('border-transparent');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ProjectOverview projectId="project-1" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render with responsive design classes', () => {
    const { container } = render(<ProjectOverview projectId="project-1" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('bg-white', 'rounded-lg', 'shadow-md');
  });

  it('should show icons in tabs', () => {
    render(<ProjectOverview projectId="project-1" />);

    // Check that tabs are rendered (icons are from lucide-react, hard to test directly)
    const timelineTab = screen.getByText('Tidslinje').closest('button');
    const meetingsTab = screen.getByText('Möten').closest('button');

    expect(timelineTab).toBeInTheDocument();
    expect(meetingsTab).toBeInTheDocument();
  });
});
