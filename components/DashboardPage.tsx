import React from 'react';
import DashboardLayout from './DashboardLayout';
import { Page } from '../types';
import { UserRole, isAdmin, isKAM, isProjectLeader, isDeveloper } from '../utils/roleHelpers';
import { useAuth } from '../src/context/AuthContext';
import {
  CustomerDashboard,
  AdminDashboard,
  KAMDashboard,
  DeveloperDashboard,
  ProjectLeaderDashboard
} from './dashboards';
import TimeTrackingDashboard from './dashboards/TimeTrackingDashboard';
import {
  ProjectsPage,
  TicketsPage,
  DocumentsPage,
  TeamPage,
  CompaniesPage,
  AIChatPage,
  KnowledgePage,
  AIDocsPage,
  ProductPlansPage
} from './pages';
// Admin components
import AdminFormResponseView from './admin/AdminFormResponseView';
import AdminFileBrowser from './admin/AdminFileBrowser';
// New enterprise pages
import SettingsPage from './pages/SettingsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import APIPortalPage from './pages/APIPortalPage';
import AuditLogPage from './pages/AuditLogPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';

interface DashboardPageProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentPage, onNavigate, onLogout }) => {
  const { user } = useAuth();
  const userRole: UserRole = user?.role || 'customer';

  // Render the appropriate dashboard based on user role (for overview page)
  const renderOverviewDashboard = () => {
    if (isAdmin(userRole)) {
      return <AdminDashboard />;
    }
    if (isKAM(userRole)) {
      return <KAMDashboard />;
    }
    if (isProjectLeader(userRole)) {
      return <ProjectLeaderDashboard />;
    }
    if (isDeveloper(userRole)) {
      return <DeveloperDashboard />;
    }
    // Default to customer dashboard
    return <CustomerDashboard />;
  };

  // Render content based on current page
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderOverviewDashboard();
      case 'dashboardProjects':
        return <ProjectsPage />;
      case 'dashboardTickets':
        return <TicketsPage />;
      case 'dashboardTimeEntries':
        return <TimeTrackingDashboard />;
      case 'dashboardDocuments':
        return <DocumentsPage />;
      case 'dashboardTeam':
        return <TeamPage />;
      case 'dashboardCompanies':
        return <CompaniesPage />;
      case 'dashboardAIChat':
        return <AIChatPage />;
      case 'dashboardKnowledge':
        return <KnowledgePage />;
      case 'dashboardAIDocs':
        return <AIDocsPage />;
      case 'dashboardProductPlans':
        return <ProductPlansPage />;
      case 'dashboardFormResponses':
        return <AdminFormResponseView />;
      case 'dashboardFileBrowser':
        return <AdminFileBrowser />;
      case 'dashboardSettings':
        return <SettingsPage />;
      case 'dashboardIntegrations':
        return <IntegrationsPage />;
      case 'dashboardApiPortal':
        return <APIPortalPage />;
      case 'dashboardAuditLog':
        return <AuditLogPage />;
      case 'dashboardAnalytics':
        return <AnalyticsDashboardPage />;
      default:
        return renderOverviewDashboard();
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default DashboardPage;
