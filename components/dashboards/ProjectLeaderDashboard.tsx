import React, { useState } from 'react';
import {
  FolderKanban,
  Ticket,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Plus,
  ArrowUpRight,
  Eye,
  MoreHorizontal,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useProjects,
  useTickets,
  useTimeEntries,
  useApproveProject,
  useRejectProject,
  useApproveTicket,
  useRequestChangesTicket
} from '../../src/hooks/useApi';
import CreateProjectForm from '../forms/CreateProjectForm';
import CreateTicketForm from '../forms/CreateTicketForm';
import ProjectSelector from '../shared/ProjectSelector';
import ProjectOverview from '../ProjectOverview';

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge, StatusBadge, PriorityBadge } from '../../src/components/ui/badge';
import { Skeleton, SkeletonCard } from '../../src/components/ui/skeleton';
import { EmptyState, EmptyStateFolder, EmptyStateInbox } from '../../src/components/ui/empty-state';
import { StatCard } from '../../src/components/ui/charts';
import { Avatar } from '../../src/components/ui/avatar';
import { Alert } from '../../src/components/ui/alert';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../../src/components/ui/modal';
import { Tooltip } from '../../src/components/ui/tooltip';
import { toast } from '../../src/components/ui/toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../../src/components/ui/dropdown-menu';
import { Progress } from '../../src/components/ui/progress';

const ProjectLeaderDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Use RPC hooks for data fetching
  const { data: projects = [], isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError, refetch: refetchTickets } = useTickets();
  const { data: timeEntries = [], isLoading: timeEntriesLoading, error: timeEntriesError, refetch: refetchTimeEntries } = useTimeEntries();

  // Use mutation hooks for state transitions
  const approveProject = useApproveProject();
  const rejectProject = useRejectProject();
  const approveTicket = useApproveTicket();
  const requestChangesTicket = useRequestChangesTicket();

  const loading = projectsLoading || ticketsLoading || timeEntriesLoading;
  const error = projectsError || ticketsError || timeEntriesError;

  const activeProjects = projects.filter((p: any) => p.state === 'in_progress').length;
  const pendingApproval = projects.filter((p: any) => p.state === 'pending_approval').length;
  const openTickets = tickets.filter((t: any) => t.state === 'open' || t.state === 'in_progress').length;
  const inReviewTickets = tickets.filter((t: any) => t.state === 'in_review').length;

  // Calculate total hours this month
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const hoursThisMonth = timeEntries
    .filter((te: any) => new Date(te.date) >= monthStart)
    .reduce((sum: number, te: any) => sum + (te.hours || 0), 0);

  const handleRefresh = () => {
    refetchProjects();
    refetchTickets();
    refetchTimeEntries();
    toast.success('Data uppdaterad');
  };

  const handleApproveProject = async (projectId: string) => {
    try {
      await approveProject.mutateAsync(projectId);
      toast.success('Projekt godkänt', { description: 'Projektet har aktiverats.' });
    } catch (err) {
      toast.error('Kunde inte godkänna projekt');
    }
  };

  const handleRejectProject = async (projectId: string) => {
    try {
      await rejectProject.mutateAsync({ primaryKey: projectId });
      toast.success('Projekt avvisat', { description: 'Projektet har avvisats.' });
    } catch (err) {
      toast.error('Kunde inte avvisa projekt');
    }
  };

  const handleApproveTicket = async (ticketId: string) => {
    try {
      await approveTicket.mutateAsync(ticketId);
      toast.success('Ärende godkänt', { description: 'Ärendet har markerats som löst.' });
    } catch (err) {
      toast.error('Kunde inte godkänna ärende');
    }
  };

  const handleRequestChanges = async (ticketId: string) => {
    try {
      await requestChangesTicket.mutateAsync({ primaryKey: ticketId });
      toast.success('Ändringar begärda', { description: 'Ärendet har skickats tillbaka för ändringar.' });
    } catch (err) {
      toast.error('Kunde inte begära ändringar');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard className="h-80" />
          <SkeletonCard className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Fel vid hämtning av data" dismissible>
        {error instanceof Error ? error.message : 'Kunde inte ladda dashboard-data'}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* PL Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-700 dark:to-blue-600 border-none text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">Project Leader Dashboard</h2>
              <p className="text-indigo-100 mt-1">Överblick av alla projekt och team</p>
            </div>
            <div className="flex gap-2">
              <Tooltip content="Uppdatera data">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Button
                variant="outline"
                onClick={() => setIsCreateTicketModalOpen(true)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Nytt ärende
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <FolderKanban className="w-4 h-4 mr-2" />
                Nytt projekt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Aktiva projekt"
          value={activeProjects}
          icon={<FolderKanban className="w-5 h-5" />}
          change={`${projects.length} totalt`}
          changeType="increase"
        />
        <StatCard
          title="Väntar på godkännande"
          value={pendingApproval}
          icon={<AlertCircle className="w-5 h-5" />}
          change={pendingApproval > 0 ? 'Behöver åtgärd' : 'Inga väntande'}
          changeType={pendingApproval > 0 ? 'decrease' : 'increase'}
        />
        <StatCard
          title="Ärenden för granskning"
          value={inReviewTickets}
          icon={<Ticket className="w-5 h-5" />}
          change={inReviewTickets > 0 ? 'Väntar på review' : 'Inga väntande'}
          changeType="neutral"
        />
        <StatCard
          title="Teamtimmar denna månad"
          value={`${hoursThisMonth.toFixed(0)}h`}
          icon={<Clock className="w-5 h-5" />}
          change="Loggad tid"
          changeType="increase"
        />
      </div>

      {/* Projects needing approval */}
      {pendingApproval > 0 && (
        <Alert variant="warning" title={`${pendingApproval} projekt väntar på godkännande`}>
          <div className="mt-3 space-y-2">
            {projects.filter(p => p.state === 'pending_approval').map((project) => (
              <div key={project.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <span className="font-medium text-slate-900 dark:text-slate-100">{project.name}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectProject(project.id)}
                    disabled={rejectProject.isPending}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {rejectProject.isPending ? 'Avvisar...' : 'Avvisa'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApproveProject(project.id)}
                    disabled={approveProject.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {approveProject.isPending ? 'Godkänner...' : 'Godkänn'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Alla projekt</CardTitle>
            <Button variant="link" size="sm" className="text-indigo-600 dark:text-indigo-400">
              Visa alla
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {projects.length === 0 ? (
                <EmptyStateFolder
                  title="Inga projekt"
                  description="Skapa ditt första projekt för att komma igång"
                  action={{
                    label: 'Skapa projekt',
                    onClick: () => setIsCreateProjectModalOpen(true)
                  }}
                />
              ) : (
                projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-4 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={project.name}
                          size="md"
                          className="bg-gradient-to-br from-indigo-500 to-blue-400"
                        />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{project.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={project.state} />
                            {project.targetEndDate && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(project.targetEndDate).toLocaleDateString('sv-SE')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.budget && (
                          <div className="text-right mr-2">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {((project.spent || 0) / project.budget * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">av budget</p>
                          </div>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Visa detaljer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Ticket className="w-4 h-4 mr-2" />
                              Visa ärenden
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="w-4 h-4 mr-2" />
                              Hantera team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tickets for Review */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Ärenden för granskning</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {tickets.filter(t => t.state === 'in_review').length === 0 ? (
                <div className="py-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">Inga ärenden väntar på granskning</p>
                </div>
              ) : (
                tickets
                  .filter(t => t.state === 'in_review')
                  .slice(0, 5)
                  .map((ticket) => (
                    <div key={ticket.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-4 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{ticket.title}</p>
                          {ticket.priority && (
                            <PriorityBadge priority={ticket.priority} />
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestChanges(ticket.id)}
                            disabled={requestChangesTicket.isPending}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                          >
                            {requestChangesTicket.isPending ? 'Begär...' : 'Ändringar'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveTicket(ticket.id)}
                            disabled={approveTicket.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {approveTicket.isPending ? 'Godkänner...' : 'Godkänn'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Team Performance</CardTitle>
          <CardDescription>Översikt över teamets arbete denna månad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tickets.filter(t => t.state === 'resolved').length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lösta ärenden</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {projects.filter(p => p.state === 'completed').length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Avslutade projekt</p>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{openTickets}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Öppna ärenden</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-900/30">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{hoursThisMonth.toFixed(0)}h</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Timmar loggade</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Selector and Overview */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('projectOverview.title', 'Projektöversikt')}</CardTitle>
              <CardDescription>Välj ett projekt för att se detaljerad information</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectSelector
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                className="max-w-md"
              />
            </CardContent>
          </Card>

          {/* Project Overview with Timeline and Meetings */}
          {selectedProjectId ? (
            <ProjectOverview
              projectId={selectedProjectId}
              canEdit={true}
            />
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <FolderKanban className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    {t('projectOverview.noSelection', 'Välj ett projekt för att se tidslinje och möten')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal open={isCreateProjectModalOpen} onOpenChange={setIsCreateProjectModalOpen}>
        <ModalContent className="sm:max-w-lg">
          <ModalHeader>
            <ModalTitle>Skapa nytt projekt</ModalTitle>
          </ModalHeader>
          <CreateProjectForm
            onSuccess={() => {
              setIsCreateProjectModalOpen(false);
              toast.success('Projekt skapat', {
                description: 'Projektet har skapats framgångsrikt.'
              });
            }}
            onCancel={() => setIsCreateProjectModalOpen(false)}
          />
        </ModalContent>
      </Modal>

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
                description: 'Ärendet har skapats framgångsrikt.'
              });
            }}
            onCancel={() => setIsCreateTicketModalOpen(false)}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProjectLeaderDashboard;
