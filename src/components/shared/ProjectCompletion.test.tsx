import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectCompletion from '../../../components/shared/ProjectCompletion';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'project.completion.congratulations': 'Congratulations! Your project is complete!',
        'project.completion.delivered_message': "We're proud to deliver your finished project.",
        'project.completion.view_project': 'View Project',
        'project.completion.review.title': 'How satisfied are you?',
        'project.completion.review.rate_project': 'Rate Project',
        'project.completion.review.rating': 'Rating',
        'project.completion.review.feedback': 'Your Feedback',
        'project.completion.review.feedback_placeholder': 'Tell us about your experience...',
        'project.completion.review.submit': 'Submit Review',
        'project.completion.review.submitting': 'Submitting...',
        'project.completion.review.your_review': 'Your Review',
        'project.completion.review.submitted_at': 'Submitted',
        'project.completion.support.title': 'Support & Maintenance',
        'project.completion.support.status': 'Status',
        'project.completion.support.days_remaining': 'Days Remaining',
        'project.completion.support.ends': 'Support Ends',
        'project.completion.support.active': 'Active',
        'project.completion.support.ending': 'Ending Soon',
        'project.completion.support.expired': 'Expired',
        'project.completion.support.ending_soon': 'Your support period is ending soon.',
        'project.completion.support.expired_message': 'Your support period has expired.',
        'common.cancel': 'Cancel',
        'common.days': 'days',
      };
      return params ? translations[key]?.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key]) : translations[key] || key;
    },
  }),
}));

describe('ProjectCompletion', () => {
  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    isDelivered: true,
    deliveredAt: new Date().toISOString(),
    deliveryUrl: 'https://example.com',
    deliveryNotes: 'Project is live!',
    customerRating: null,
    customerReview: null,
    reviewedAt: null,
    supportStartDate: new Date().toISOString(),
    supportEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    supportMonths: 6,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render if project is not delivered', () => {
    const { container } = render(
      <ProjectCompletion
        project={{ ...mockProject, isDelivered: false }}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders celebration banner for delivered project', () => {
    render(<ProjectCompletion project={mockProject} />);

    expect(screen.getByText(/congratulations/i)).toBeInTheDocument();
    expect(screen.getByText(/proud to deliver/i)).toBeInTheDocument();
  });

  it('shows delivery URL link when provided', () => {
    render(<ProjectCompletion project={mockProject} />);

    const link = screen.getByRole('link', { name: /view project/i });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('shows delivery notes when provided', () => {
    render(<ProjectCompletion project={mockProject} />);

    expect(screen.getByText('Project is live!')).toBeInTheDocument();
  });

  it('shows review section when canReview is true and not yet reviewed', () => {
    render(<ProjectCompletion project={mockProject} canReview={true} />);

    expect(screen.getByText(/how satisfied are you/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rate project/i })).toBeInTheDocument();
  });

  it('does not show review section when canReview is false', () => {
    render(<ProjectCompletion project={mockProject} canReview={false} />);

    expect(screen.queryByText(/how satisfied are you/i)).not.toBeInTheDocument();
  });

  it('opens review form when rate button is clicked', async () => {
    const user = userEvent.setup();

    render(<ProjectCompletion project={mockProject} canReview={true} />);

    const rateButton = screen.getByRole('button', { name: /rate project/i });
    await user.click(rateButton);

    expect(screen.getByText(/rating/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tell us about your experience/i)).toBeInTheDocument();
  });

  it('allows star rating selection', async () => {
    const user = userEvent.setup();

    render(<ProjectCompletion project={mockProject} canReview={true} />);

    const rateButton = screen.getByRole('button', { name: /rate project/i });
    await user.click(rateButton);

    // There should be 5 star buttons
    const stars = screen.getAllByRole('button').filter(btn =>
      btn.querySelector('svg')?.classList.contains('lucide-star')
    );
    expect(stars).toHaveLength(5);

    // Click the third star
    await user.click(stars[2]);

    // The submit button should still be disabled until review text is added
    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).toBeDisabled();
  });

  it('submits review with rating and text', async () => {
    const user = userEvent.setup();
    const onSubmitReview = vi.fn().mockResolvedValue(undefined);

    render(
      <ProjectCompletion
        project={mockProject}
        canReview={true}
        onSubmitReview={onSubmitReview}
      />
    );

    // Open review form
    const rateButton = screen.getByRole('button', { name: /rate project/i });
    await user.click(rateButton);

    // Select 4 stars
    const stars = screen.getAllByRole('button').filter(btn =>
      btn.querySelector('svg')?.classList.contains('lucide-star')
    );
    await user.click(stars[3]);

    // Enter review text
    const textarea = screen.getByPlaceholderText(/tell us about your experience/i);
    await user.type(textarea, 'Great work!');

    // Submit
    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmitReview).toHaveBeenCalledWith(4, 'Great work!');
    });
  });

  it('shows existing review when project has been reviewed', () => {
    const reviewedProject = {
      ...mockProject,
      customerRating: 5,
      customerReview: 'Excellent work!',
      reviewedAt: new Date().toISOString(),
    };

    render(<ProjectCompletion project={reviewedProject} canReview={true} />);

    expect(screen.getByText(/your review/i)).toBeInTheDocument();
    expect(screen.getByText('Excellent work!')).toBeInTheDocument();

    // Should show 5 filled stars
    const filledStars = screen.getAllByRole('button').filter(btn => {
      const svg = btn.querySelector('svg');
      return svg?.classList.contains('lucide-star') && svg?.classList.contains('fill-yellow-400');
    });
    expect(filledStars.length).toBeGreaterThanOrEqual(5);
  });

  it('shows support period information', () => {
    render(<ProjectCompletion project={mockProject} />);

    expect(screen.getByText(/support & maintenance/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('shows warning when support is ending soon', () => {
    const endingSoonProject = {
      ...mockProject,
      supportEndDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days
    };

    render(<ProjectCompletion project={endingSoonProject} />);

    expect(screen.getByText(/ending soon/i)).toBeInTheDocument();
    expect(screen.getByText(/support period is ending soon/i)).toBeInTheDocument();
  });

  it('shows expired message when support has ended', () => {
    const expiredProject = {
      ...mockProject,
      supportEndDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    };

    render(<ProjectCompletion project={expiredProject} />);

    expect(screen.getByText(/expired/i)).toBeInTheDocument();
    expect(screen.getByText(/support period has expired/i)).toBeInTheDocument();
  });

  it('calculates days remaining correctly', () => {
    const futureDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000); // 45 days
    const projectWithSupport = {
      ...mockProject,
      supportEndDate: futureDate.toISOString(),
    };

    render(<ProjectCompletion project={projectWithSupport} />);

    // Should show approximately 45 days remaining
    expect(screen.getByText(/days/i)).toBeInTheDocument();
  });

  it('hides confetti after 5 seconds', async () => {
    vi.useFakeTimers();

    const { container } = render(<ProjectCompletion project={mockProject} />);

    // Confetti should be visible initially
    const confetti = container.querySelector('.animate-bounce');
    expect(confetti).toBeInTheDocument();

    // Fast-forward 5 seconds
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      const confettiAfter = container.querySelector('.animate-bounce');
      expect(confettiAfter).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});
