import React, { useState } from 'react';
import {
  Code,
  FolderKanban,
  Ticket,
  Clock,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  Play,
  Plus,
  ArrowUpRight,
  Eye,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/context/AuthContext';
import {
  useProjects,
  useTickets,
  useTimeEntries,
  useStartWorkOnTicket,
  useSubmitTicketForReview
} from '../../src/hooks/useApi';
import CreateTicketForm from '../forms/CreateTicketForm';

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
import { EmptyState, EmptyStateInbox, EmptyStateFolder } from '../../src/components/ui/empty-state';
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

const DeveloperDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);

  // Use RPC hooks for data fetching
  const { data: projects = [], isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError, refetch: refetchTickets } = useTickets();
  const { data: timeEntries = [], isLoading: timeEntriesLoading, error: timeEntriesError, refetch: refetchTimeEntries } = useTimeEntries();

  // Use mutation hooks for state transitions
  const startWorkOnTicket = useStartWorkOnTicket();
  const submitTicketForReview = useSubmitTicketForReview();

  const loading = projectsLoading || ticketsLoading || timeEntriesLoading;
  const error = projectsError || ticketsError || timeEntriesError;

  // Filter tickets assigned to current user
  const myTickets = tickets.filter((t: any) => t.assigneeId === currentUser?.id);
  const inProgressTickets = myTickets.filter((t: any) => t.state === 'in_progress').length;
  const inReviewTickets = myTickets.filter((t: any) => t.state === 'in_review').length;

  // Calculate hours this week
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const hoursThisWeek = timeEntries
    .filter((te: any) => new Date(te.date) >= weekStart)
    .reduce((sum: number, te: any) => sum + (te.hours || 0), 0);

  const handleRefresh = () => {
    refetchProjects();
    refetchTickets();
    refetchTimeEntries();
    toast.success('Data uppdaterad');
  };

  const handleStartWork = async (ticketId: string) => {
    try {
      await startWorkOnTicket.mutateAsync(ticketId);
      toast.success('Arbete påbörjat', { description: 'Ärendet är nu under arbete.' });
    } catch (err) {
      toast.error('Kunde inte starta arbete');
    }
  };

  const handleSubmitForReview = async (ticketId: string) => {
    try {
      await submitTicketForReview.mutateAsync(ticketId);
      toast.success('Skickat för granskning', { description: 'Ärendet väntar nu på granskning.' });
    } catch (err) {
      toast.error('Kunde inte skicka för granskning');
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
      {/* Developer Header */}
      <Card className="bg-gradient-to-r from-violet-600 to-purple-500 dark:from-violet-700 dark:to-purple-600 border-none text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">Developer Dashboard</h2>
              <p className="text-violet-100 mt-1">
                {currentUser?.specialization || 'Fullstack Development'}
              </p>
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
                onClick={() => toast.info('Tidrapportering kommer snart')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Clock className="w-4 h-4 mr-2" />
                Logga tid
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mina ärenden"
          value={myTickets.length}
          icon={<Ticket className="w-5 h-5" />}
          change="Totalt tilldelade"
          changeType="neutral"
        />
        <StatCard
          title="Pågående"
          value={inProgressTickets}
          icon={<Play className="w-5 h-5" />}
          change={inProgressTickets > 0 ? 'Under arbete' : 'Inga pågående'}
          changeType={inProgressTickets > 0 ? 'neutral' : 'increase'}
        />
        <StatCard
          title="Under granskning"
          value={inReviewTickets}
          icon={<GitBranch className="w-5 h-5" />}
          change={inReviewTickets > 0 ? 'Väntar på review' : 'Inga väntande'}
          changeType="neutral"
        />
        <StatCard
          title="Timmar denna vecka"
          value={`${hoursThisWeek.toFixed(1)}h`}
          icon={<Clock className="w-5 h-5" />}
          change="Loggad tid"
          changeType="increase"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Active Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Mina aktiva ärenden</CardTitle>
            <Button variant="link" size="sm" className="text-violet-600 dark:text-violet-400">
              Visa alla
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {myTickets.filter(t => t.state !== 'resolved' && t.state !== 'closed').length === 0 ? (
                <div className="py-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">Inga aktiva ärenden!</p>
                </div>
              ) : (
                myTickets
                  .filter(t => t.state !== 'resolved' && t.state !== 'closed')
                  .slice(0, 5)
                  .map((ticket) => (
                    <div key={ticket.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-4 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{ticket.title}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <StatusBadge status={ticket.state} />
                            {ticket.priority && (
                              <PriorityBadge priority={ticket.priority} />
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          {ticket.state === 'open' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartWork(ticket.id)}
                              disabled={startWorkOnTicket.isPending}
                              className="text-violet-600 border-violet-200 hover:bg-violet-50 dark:text-violet-400 dark:border-violet-800 dark:hover:bg-violet-900/20"
                            >
                              {startWorkOnTicket.isPending ? 'Startar...' : 'Starta'}
                            </Button>
                          )}
                          {ticket.state === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSubmitForReview(ticket.id)}
                              disabled={submitTicketForReview.isPending}
                              className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                            >
                              {submitTicketForReview.isPending ? 'Skickar...' : 'Till granskning'}
                            </Button>
                          )}
                          {ticket.state === 'in_review' && (
                            <Badge variant="secondary">Under granskning</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Aktiva projekt</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {projects.filter(p => p.state === 'in_progress').length === 0 ? (
                <EmptyStateFolder
                  title="Inga aktiva projekt"
                  description="Det finns inga pågående projekt just nu"
                />
              ) : (
                projects
                  .filter(p => p.state === 'in_progress')
                  .slice(0, 5)
                  .map((project) => (
                    <div key={project.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-4 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={project.name}
                            size="md"
                            className="bg-gradient-to-br from-violet-500 to-purple-400"
                          />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{project.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {myTickets.filter((t: any) => t.projectId === project.id).length} ärenden tilldelade
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Visa projekt
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Ticket className="w-4 h-4 mr-2" />
                              Visa ärenden
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Senaste tidrapporter</CardTitle>
          <Button
            onClick={() => toast.info('Tidrapportering kommer snart')}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ny tidrapport
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {timeEntries.length === 0 ? (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                  <Clock className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">Inga tidrapporter ännu</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Börja logga tid för dina ärenden</p>
              </div>
            ) : (
              timeEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {entry.description || 'Ingen beskrivning'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{entry.date}</p>
                    </div>
                    <span className="text-lg font-semibold text-violet-600 dark:text-violet-400">
                      {entry.hours}h
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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

export default DeveloperDashboard;
