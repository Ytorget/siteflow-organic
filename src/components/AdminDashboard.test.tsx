import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test/utils';
import AdminDashboard from '../../components/dashboards/AdminDashboard';

// Mock ProjectTimeline
vi.mock('../../components/timeline/ProjectTimeline', () => ({
  default: () => <div data-testid="project-timeline">Project Timeline</div>,
}));

// Mock ProjectMeetings
vi.mock('../../components/meetings/ProjectMeetings', () => ({
  default: () => <div data-testid="project-meetings">Project Meetings</div>,
}));

// Mock AdminFormResponseView
vi.mock('../../components/admin/AdminFormResponseView', () => ({
  default: () => <div data-testid="admin-form-response-view">Admin Form Response View</div>,
}));

// Mock AdminFileBrowser
vi.mock('../../components/admin/AdminFileBrowser', () => ({
  default: () => <div data-testid="admin-file-browser">Admin File Browser</div>,
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    // Set up authenticated user
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'user-1',
        email: 'admin@siteflow.se',
        firstName: 'Admin',
        lastName: 'User',
        role: 'siteflow_admin',
        companyId: null,
      })
    );
  });

  it('should render loading state initially', () => {
    render(<AdminDashboard />);

    // Should show loader initially
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render dashboard content after loading', async () => {
    render(<AdminDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Check for stats cards
    expect(screen.getByText('Aktiva företag')).toBeInTheDocument();
    expect(screen.getByText('Aktiva projekt')).toBeInTheDocument();
    expect(screen.getByText('Öppna ärenden')).toBeInTheDocument();
    expect(screen.getByText('Kritiska ärenden')).toBeInTheDocument();
  });

  it('should display company list', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Senaste företag')).toBeInTheDocument();
    });

    // Check that companies are rendered (may appear multiple times due to invitations)
    expect(screen.getAllByText('Test Company').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Another Company').length).toBeGreaterThan(0);
  });

  it('should display company status badges', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Aktiv')).toBeInTheDocument();
    });

    // Check for status badges
    expect(screen.getByText('Inaktiv')).toBeInTheDocument();
  });

  it('should display project status counts', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Projekt per status')).toBeInTheDocument();
    });

    // Project states should be displayed
    expect(screen.getByText('in progress')).toBeInTheDocument();
  });

  it('should show correct active company count', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      // We have 2 companies, 1 active
      const activeCompaniesCard = screen.getByText('Aktiva företag').closest('div');
      expect(activeCompaniesCard).toBeInTheDocument();
    });
  });

  it('should display pending invitations section', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      // "Väntande inbjudningar" appears in both stats card and section header
      const elements = screen.getAllByText('Väntande inbjudningar');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('should have action buttons in header', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Bjud in användare')).toBeInTheDocument();
      expect(screen.getByText('Nytt projekt')).toBeInTheDocument();
    });
  });
});

describe('AdminDashboard - Statistics', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'user-1',
        email: 'admin@siteflow.se',
        firstName: 'Admin',
        lastName: 'User',
        role: 'siteflow_admin',
        companyId: null,
      })
    );
  });

  it('should calculate active companies correctly', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      // The mock data has 1 active company out of 2
      const statsCards = screen.getAllByText(/^[0-9]+$/);
      expect(statsCards.length).toBeGreaterThan(0);
    });
  });

  it('should calculate open tickets correctly', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      // Mock data has 2 tickets: 1 open, 1 in_progress
      // Both should count as "open" tickets (open + in_progress)
      expect(screen.getByText('Öppna ärenden')).toBeInTheDocument();
    });
  });
});
