import React, { useState } from 'react';
import {
  Users,
  Building,
  FolderKanban,
  Ticket,
  Clock,
  AlertCircle,
  TrendingUp,
  UserPlus,
  Mail,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCompanies, useProjects, useTickets, useInvitations } from '../../src/hooks/useApi';
import CreateProjectForm from '../forms/CreateProjectForm';
import InviteUserForm from '../forms/InviteUserForm';
import AdminFormResponseView from '../admin/AdminFormResponseView';
import AdminFileBrowser from '../admin/AdminFileBrowser';
import ProjectSelector from '../shared/ProjectSelector';
import ProjectOverview from '../ProjectOverview';

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge, StatusBadge } from '../../src/components/ui/badge';
import { Skeleton, SkeletonCard } from '../../src/components/ui/skeleton';
import { Progress } from '../../src/components/ui/progress';
import { EmptyState, EmptyStateFolder, EmptyStateInbox, EmptyStateUsers } from '../../src/components/ui/empty-state';
import { StatCard } from '../../src/components/ui/charts';
import { Avatar, AvatarGroup } from '../../src/components/ui/avatar';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '../../src/components/ui/modal';
import { Alert } from '../../src/components/ui/alert';
import { Tooltip } from '../../src/components/ui/tooltip';
import { toast } from '../../src/components/ui/toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../../src/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src/components/ui/tabs';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Use RPC hooks for data fetching
  const { data: companies = [], isLoading: companiesLoading, error: companiesError, refetch: refetchCompanies } = useCompanies();
  const { data: projects = [], isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError } = useTickets();
  const { data: invitations = [], isLoading: invitationsLoading, error: invitationsError } = useInvitations();

  const loading = companiesLoading || projectsLoading || ticketsLoading || invitationsLoading;
  const error = companiesError || projectsError || ticketsError || invitationsError;

  const activeCompanies = companies.filter((c: any) => c.isActive).length;
  const activeProjects = projects.filter((p: any) => p.state === 'in_progress').length;
  const openTickets = tickets.filter((t: any) => t.state === 'open' || t.state === 'in_progress').length;
  const criticalTickets = tickets.filter((t: any) => t.priority === 'critical' || t.priority === 'high').length;
  const pendingInvitations = invitations.filter((i: any) => !i.acceptedAt && !i.cancelledAt).length;

  // Project status distribution
  const projectStatuses = ['draft', 'pending_approval', 'in_progress', 'on_hold', 'completed', 'cancelled'];
  const projectStatusCounts = projectStatuses.map(status => ({
    status,
    count: projects.filter((p: any) => p.state === status).length,
    label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  const handleRefresh = () => {
    refetchCompanies();
    refetchProjects();
    toast.success('Data uppdaterad');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
        {error instanceof Error ? error.message : 'Kunde inte ladda admin-data'}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border-none text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">Admin Dashboard</h2>
              <p className="text-slate-300 mt-1">Systemöversikt och administration</p>
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
                onClick={() => setIsInviteUserModalOpen(true)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Bjud in användare
              </Button>
              <Button
                onClick={() => {
                  setIsCreateProjectModalOpen(true);
                  toast.info('Skapa ett nytt projekt');
                }}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <FolderKanban className="w-4 h-4 mr-2" />
                Nytt projekt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Aktiva företag"
          value={activeCompanies}
          icon={<Building className="w-5 h-5" />}
          change={`${companies.length} totalt`}
          changeType="neutral"
        />
        <StatCard
          title="Aktiva projekt"
          value={activeProjects}
          icon={<FolderKanban className="w-5 h-5" />}
          change={`${projects.length} totalt`}
          changeType="increase"
        />
        <StatCard
          title="Öppna ärenden"
          value={openTickets}
          icon={<Ticket className="w-5 h-5" />}
          change={openTickets > 10 ? 'Behöver uppmärksamhet' : 'Under kontroll'}
          changeType={openTickets > 10 ? 'decrease' : 'increase'}
        />
        <StatCard
          title="Kritiska ärenden"
          value={criticalTickets}
          icon={<AlertCircle className="w-5 h-5" />}
          change={criticalTickets > 0 ? 'Kräver åtgärd' : 'Inga kritiska'}
          changeType={criticalTickets > 0 ? 'decrease' : 'increase'}
        />
        <StatCard
          title="Väntande inbjudningar"
          value={pendingInvitations}
          icon={<Mail className="w-5 h-5" />}
          change={`${invitations.length} totalt skickade`}
          changeType="neutral"
        />
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="projects">Projekt</TabsTrigger>
          <TabsTrigger value="forms">Formulärsvar</TabsTrigger>
          <TabsTrigger value="files">Filer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Companies */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Senaste företag</CardTitle>
                <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400">
                  Visa alla
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {companies.length === 0 ? (
                    <EmptyStateUsers
                      title="Inga företag ännu"
                      description="Lägg till ditt första företag för att komma igång"
                      action={{
                        label: 'Lägg till företag',
                        onClick: () => toast.info('Funktion kommer snart')
                      }}
                    />
                  ) : (
                    companies.slice(0, 5).map((company: any) => (
                      <div key={company.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-4 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar name={company.name} size="md" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{company.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{company.orgNumber}</p>
                            </div>
                          </div>
                          <Badge variant={company.isActive ? 'success' : 'secondary'}>
                            {company.isActive ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Invitations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Väntande inbjudningar</CardTitle>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsInviteUserModalOpen(true)}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Bjud in ny
                  <UserPlus className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {invitations.filter((i: any) => !i.acceptedAt && !i.cancelledAt).length === 0 ? (
                    <EmptyStateInbox
                      title="Inga väntande inbjudningar"
                      description="Bjud in nya användare för att ge dem tillgång"
                      action={{
                        label: 'Bjud in användare',
                        onClick: () => setIsInviteUserModalOpen(true)
                      }}
                    />
                  ) : (
                    invitations
                      .filter((i: any) => !i.acceptedAt && !i.cancelledAt)
                      .slice(0, 5)
                      .map((invitation: any) => {
                        const company = companies.find((c: any) => c.id === invitation.companyId);
                        const expiresAt = new Date(invitation.expiresAt);
                        const isExpired = expiresAt < new Date();

                        return (
                          <div key={invitation.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-4 px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{invitation.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {company?.name || 'Okänt företag'}
                                  </span>
                                  <span className="text-slate-300 dark:text-slate-600">•</span>
                                  <span className={`text-xs ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {isExpired ? 'Utgången' : `Utgår ${expiresAt.toLocaleDateString('sv-SE')}`}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={isExpired ? 'error' : 'warning'}>
                                  {isExpired ? 'Utgången' : 'Väntande'}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => toast.info('Skickar påminnelse...')}>
                                      <Mail className="w-4 h-4 mr-2" />
                                      Skicka påminnelse
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Avbryt inbjudan
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Projekt per status</CardTitle>
              <CardDescription>Fördelning av projekt över olika statusar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {projectStatusCounts.map(({ status, count, label }) => (
                  <div
                    key={status}
                    className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
                  >
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{count}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              {projects.length > 0 && (
                <div className="mt-4">
                  <Progress
                    value={(activeProjects / projects.length) * 100}
                    className="h-2"
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {Math.round((activeProjects / projects.length) * 100)}% av projekten är aktiva
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 mt-6">
          {/* Project Selector and Overview */}
          {projects.length > 0 ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('projectOverview.title', 'Projektöversikt')}</CardTitle>
                  <CardDescription>Välj ett projekt för att se detaljer, tidslinje och möten</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectSelector
                    value={selectedProjectId}
                    onChange={setSelectedProjectId}
                    className="max-w-md"
                  />
                </CardContent>
              </Card>

              {selectedProjectId ? (
                <ProjectOverview projectId={selectedProjectId} canEdit={true} />
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <EmptyStateFolder
                      title={t('projectOverview.noSelection', 'Välj ett projekt')}
                      description="Välj ett projekt ovan för att se tidslinje och möten"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <EmptyStateFolder
                  title="Inga projekt"
                  description="Skapa ditt första projekt för att komma igång"
                  action={{
                    label: 'Skapa projekt',
                    onClick: () => setIsCreateProjectModalOpen(true)
                  }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="forms" className="mt-6">
          <AdminFormResponseView />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <AdminFileBrowser />
        </TabsContent>
      </Tabs>

      {/* Create Project Modal */}
      <Modal open={isCreateProjectModalOpen} onOpenChange={setIsCreateProjectModalOpen}>
        <ModalContent className="sm:max-w-lg">
          <ModalHeader>
            <ModalTitle>Skapa nytt projekt</ModalTitle>
            <ModalDescription>Fyll i projektinformation nedan</ModalDescription>
          </ModalHeader>
          <CreateProjectForm
            onSuccess={() => {
              setIsCreateProjectModalOpen(false);
              toast.success('Projekt skapat', {
                description: 'Projektet har skapats framgångsrikt.'
              });
              refetchProjects();
            }}
            onCancel={() => setIsCreateProjectModalOpen(false)}
          />
        </ModalContent>
      </Modal>

      {/* Invite User Modal */}
      <Modal open={isInviteUserModalOpen} onOpenChange={setIsInviteUserModalOpen}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle>Bjud in användare</ModalTitle>
            <ModalDescription>Skicka en inbjudan via e-post</ModalDescription>
          </ModalHeader>
          <InviteUserForm
            onSuccess={() => {
              setIsInviteUserModalOpen(false);
              toast.success('Inbjudan skickad', {
                description: 'Användaren har fått en inbjudan via e-post.'
              });
            }}
            onCancel={() => setIsInviteUserModalOpen(false)}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
