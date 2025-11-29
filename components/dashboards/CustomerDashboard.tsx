import React, { useState } from 'react';
import {
  FolderKanban,
  Ticket,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/context/AuthContext';
import { useProjects, useTickets, useMilestonesByProject } from '../../src/hooks/useApi';
import CreateTicketForm from '../forms/CreateTicketForm';
import ProjectSelector from '../shared/ProjectSelector';
import ProjectOverview from '../ProjectOverview';
import ProjectStatus from '../shared/ProjectStatus';
import ProjectTeam from '../shared/ProjectTeam';

// New UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge, StatusBadge, PriorityBadge } from '../../src/components/ui/badge';
import { Skeleton, SkeletonCard } from '../../src/components/ui/skeleton';
import { Progress, CircularProgress } from '../../src/components/ui/progress';
import { EmptyState, EmptyStateFolder, EmptyStateInbox } from '../../src/components/ui/empty-state';
import { StatCard } from '../../src/components/ui/charts';
import { Avatar, AvatarGroup } from '../../src/components/ui/avatar';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../../src/components/ui/modal';
import { Alert } from '../../src/components/ui/alert';
import { Tooltip } from '../../src/components/ui/tooltip';
import { toast } from '../../src/components/ui/toast';

const CustomerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Use RPC hooks for data fetching - filter by company
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects(
    user?.companyId ? { companyId: user.companyId } : undefined
  );
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError } = useTickets();

  // Fetch milestones for selected project
  const { data: milestones = [] } = useMilestonesByProject(
    selectedProjectId || ''
  );

  // Get selected project details
  const selectedProject = projects.find((p: any) => p.id === selectedProjectId);

  // TODO: Fetch team members for selected project
  // For now, we'll show the current user as a team member
  const teamMembers = selectedProjectId && user ? [user] : [];

  const loading = projectsLoading || ticketsLoading;
  const error = projectsError || ticketsError;

  // Filter tickets to only show those from company's projects
  const projectIds = projects.map((p: any) => p.id);
  const companyTickets = tickets.filter((t: any) => projectIds.includes(t.projectId));

  const activeProjects = projects.filter((p: any) => p.state === 'in_progress').length;
  const openTickets = companyTickets.filter((t: any) => t.state === 'open' || t.state === 'in_progress').length;
  const criticalTickets = companyTickets.filter((t: any) => t.priority === 'critical' || t.priority === 'high').length;
  const recentTickets = companyTickets.slice(0, 5);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-amber-100 text-amber-700';
      case 'in_review': return 'bg-purple-100 text-purple-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-amber-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-slate-500';
      default: return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome skeleton */}
        <Skeleton className="h-32 w-full rounded-xl" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard className="h-80" />
          <SkeletonCard className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Fel vid hämtning av data">
        {error instanceof Error ? error.message : 'Kunde inte ladda dashboard-data'}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <Card className="bg-gradient-to-r from-blue-600 to-cyan-500 border-none text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">{t('dashboard.welcome')}, {user?.first_name}!</h2>
              <p className="text-blue-100 mt-1">{t('dashboard.welcomeSubtitle')}</p>
            </div>
            <Button
              onClick={() => {
                setIsCreateTicketModalOpen(true);
                toast.info('Skapa ett nytt ärende');
              }}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nytt ärende
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.stats.activeProjects')}
          value={activeProjects}
          icon={<FolderKanban className="w-5 h-5" />}
          change={activeProjects > 0 ? '+1 denna månad' : undefined}
          changeType="increase"
        />
        <StatCard
          title={t('dashboard.stats.openTickets')}
          value={openTickets}
          icon={<Ticket className="w-5 h-5" />}
          change={openTickets > 0 ? `${openTickets} behöver åtgärd` : undefined}
          changeType={openTickets > 5 ? 'decrease' : 'neutral'}
        />
        <StatCard
          title={t('dashboard.stats.criticalIssues')}
          value={criticalTickets}
          icon={<AlertCircle className="w-5 h-5" />}
          change={criticalTickets > 0 ? 'Kräver uppmärksamhet' : 'Allt ser bra ut!'}
          changeType={criticalTickets > 0 ? 'decrease' : 'increase'}
        />
        <StatCard
          title={t('dashboard.stats.thisMonth')}
          value="0h"
          icon={<Clock className="w-5 h-5" />}
          change="Loggad tid"
          changeType="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">{t('dashboard.recentTickets')}</CardTitle>
            <Button variant="link" size="sm" className="text-blue-600">
              {t('dashboard.viewAll')}
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentTickets.length === 0 ? (
                <EmptyStateInbox
                  title={t('dashboard.noTickets')}
                  description="Inga ärenden har skapats ännu"
                  action={{
                    label: 'Skapa ärende',
                    onClick: () => setIsCreateTicketModalOpen(true)
                  }}
                />
              ) : (
                recentTickets.map((ticket) => (
                  <div key={ticket.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-4 px-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{ticket.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <StatusBadge status={ticket.state as any} />
                          {ticket.priority && (
                            <PriorityBadge priority={ticket.priority as any} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">{t('dashboard.projectsOverview')}</CardTitle>
            <Button variant="link" size="sm" className="text-blue-600">
              {t('dashboard.viewAll')}
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {projects.length === 0 ? (
                <EmptyStateFolder
                  title={t('dashboard.noProjects')}
                  description="Inga projekt har skapats ännu"
                />
              ) : (
                projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-4 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={project.name}
                          size="md"
                          className="bg-gradient-to-br from-blue-500 to-cyan-400"
                        />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{project.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{project.state.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.state === 'in_progress' ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('dashboard.active')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="capitalize">
                            {project.state.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Selector and Overview */}
      {projects.length > 0 ? (
        <div className="space-y-4">
          {/* Project Selector */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              {t('projectOverview.title', 'Projektöversikt')}
            </h3>
            <ProjectSelector
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              className="max-w-md"
            />
          </div>

          {/* Project Details */}
          {selectedProjectId && selectedProject ? (
            <div className="space-y-6">
              {/* Project Status Overview */}
              <ProjectStatus
                project={selectedProject}
                milestones={milestones}
              />

              {/* Project Team */}
              <ProjectTeam teamMembers={teamMembers} />

              {/* Project Overview with Timeline and Meetings */}
              <ProjectOverview
                projectId={selectedProjectId}
                canEdit={false}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
              <FolderKanban className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>{t('projectOverview.noSelection', 'Välj ett projekt för att se detaljer')}</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Create Ticket Modal */}
      <Modal open={isCreateTicketModalOpen} onOpenChange={setIsCreateTicketModalOpen}>
        <ModalContent className="sm:max-w-lg">
          <ModalHeader>
            <ModalTitle>Skapa nytt ärende</ModalTitle>
          </ModalHeader>
          <CreateTicketForm
            onSuccess={() => {
              setIsCreateTicketModalOpen(false);
              toast.success('Ärende skapat', {
                description: 'Ditt ärende har skapats framgångsrikt.'
              });
            }}
            onCancel={() => setIsCreateTicketModalOpen(false)}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CustomerDashboard;
