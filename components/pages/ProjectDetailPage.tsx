import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Settings,
  MoreHorizontal,
  Calendar,
  Users,
  FileText,
  Ticket,
  Activity,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  ExternalLink,
  Edit,
  Trash2,
  Share2,
  Star,
  GitBranch,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import {
  useMilestonesByProject,
  useTickets,
  useMeetingsByProject
} from '../../src/hooks/useApi';
import { isAdmin, isKAM, isProjectLeader } from '../../utils/roleHelpers';

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
import { Avatar, AvatarGroup } from '../../src/components/ui/avatar';
import { Alert } from '../../src/components/ui/alert';
import { Progress } from '../../src/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src/components/ui/tabs';
import { Tooltip } from '../../src/components/ui/tooltip';
import { toast } from '../../src/components/ui/toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../../src/components/ui/dropdown-menu';

// Sub-components
import ProjectOverview from '../ProjectOverview';
import ProjectStatus from '../shared/ProjectStatus';

interface ProjectDetailPageProps {
  projectId: string;
  project: any; // Project data passed from parent
  onBack: () => void;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId, project, onBack }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Permission checks
  const canEdit = user && (isAdmin(user.role) || isKAM(user.role) || isProjectLeader(user.role));

  // Fetch additional project data
  const { data: milestones = [], isLoading: milestonesLoading, refetch: refetchMilestones } = useMilestonesByProject(projectId);
  const { data: allTickets = [] } = useTickets();
  const { data: meetings = [], refetch: refetchMeetings } = useMeetingsByProject(projectId);

  // Project members - placeholder until API is available
  const members: any[] = [];

  // Filter tickets for this project
  const projectTickets = allTickets.filter((t: any) => t.projectId === projectId);
  const openTickets = projectTickets.filter((t: any) => t.state === 'open' || t.state === 'in_progress');
  const completedTickets = projectTickets.filter((t: any) => t.state === 'resolved' || t.state === 'closed');

  // Calculate progress
  const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const handleRefresh = () => {
    refetchMilestones();
    refetchMeetings();
    toast.success('Data uppdaterad');
  };

  // Show error state only if project is missing
  if (!project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka
        </Button>
        <Alert variant="error" title="Projekt hittades inte">
          Projektet kunde inte laddas. Det kan ha tagits bort eller så saknar du behörighet.
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar
              name={project.name}
              size="lg"
              className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {project.name}
                </h1>
                <StatusBadge status={project.state} />
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                {project.description || 'Ingen beskrivning'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content="Uppdatera">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Dela">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </Tooltip>
          {canEdit && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Redigera
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Projektinställningar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star className="w-4 h-4 mr-2" />
                    Markera som favorit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 dark:text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Arkivera projekt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Framsteg</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{progressPercentage}%</p>
              </div>
            </div>
            <Progress value={progressPercentage} className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Ticket className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Öppna ärenden</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{openTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Milstolpar</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{completedMilestones}/{totalMilestones}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Teammedlemmar</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{members.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Översikt
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-2">
            <Ticket className="w-4 h-4" />
            Ärenden
            {openTickets.length > 0 && (
              <Badge variant="secondary" size="sm">{openTickets.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="w-4 h-4" />
            Dokument
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="w-4 h-4" />
            Kalender
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="w-4 h-4" />
            Aktivitet
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <ProjectStatus project={project} milestones={milestones} />
          <ProjectOverview projectId={projectId} canEdit={canEdit} />
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ärenden</CardTitle>
                <CardDescription>Alla ärenden kopplade till detta projekt</CardDescription>
              </div>
              {canEdit && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nytt ärende
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {projectTickets.length === 0 ? (
                <EmptyStateInbox
                  title="Inga ärenden"
                  description="Det finns inga ärenden för detta projekt ännu"
                  action={canEdit ? {
                    label: 'Skapa ärende',
                    onClick: () => toast.info('Skapa ärende-funktionen kommer snart')
                  } : undefined}
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {projectTickets.map((ticket: any) => (
                    <div key={ticket.id} className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-4 px-4 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {ticket.title}
                          </h4>
                          {ticket.priority && <PriorityBadge priority={ticket.priority} />}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                          <StatusBadge status={ticket.state} />
                          {ticket.createdAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(ticket.createdAt).toLocaleDateString('sv-SE')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dokument</CardTitle>
                <CardDescription>Projektdokumentation och filer</CardDescription>
              </div>
              {canEdit && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ladda upp
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <EmptyStateFolder
                title="Inga dokument"
                description="Ladda upp dokument för att komma igång"
                action={canEdit ? {
                  label: 'Ladda upp dokument',
                  onClick: () => toast.info('Dokumentuppladdning kommer snart')
                } : undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Teammedlemmar</CardTitle>
                <CardDescription>Personer som arbetar med detta projekt</CardDescription>
              </div>
              {canEdit && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Bjud in
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <EmptyState
                  icon={<Users className="w-12 h-12" />}
                  title="Inga teammedlemmar"
                  description="Bjud in medlemmar för att samarbeta"
                  action={canEdit ? {
                    label: 'Bjud in medlemmar',
                    onClick: () => toast.info('Bjud in-funktionen kommer snart')
                  } : undefined}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <Avatar name={`${member.firstName || ''} ${member.lastName || ''}`} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {member.role || 'Medlem'}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Skicka meddelande
                          </DropdownMenuItem>
                          {canEdit && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Ta bort från projekt
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Kalender & Möten</CardTitle>
                <CardDescription>Kommande och tidigare möten</CardDescription>
              </div>
              {canEdit && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Boka möte
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {meetings.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="w-12 h-12" />}
                  title="Inga möten"
                  description="Boka ett möte för att komma igång"
                  action={canEdit ? {
                    label: 'Boka möte',
                    onClick: () => toast.info('Mötesbokning kommer snart')
                  } : undefined}
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {meetings.map((meeting: any) => {
                    const meetingDate = meeting.scheduledAt ? new Date(meeting.scheduledAt) : null;
                    return (
                      <div key={meeting.id} className="py-3 flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {meetingDate ? (
                            <>
                              <span className="text-xs font-medium">
                                {meetingDate.toLocaleDateString('sv-SE', { month: 'short' })}
                              </span>
                              <span className="text-lg font-bold">
                                {meetingDate.getDate()}
                              </span>
                            </>
                          ) : (
                            <Calendar className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {meeting.title}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {meetingDate && meetingDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                            {meeting.durationMinutes && ` • ${meeting.durationMinutes} min`}
                            {meeting.location && ` • ${meeting.location}`}
                          </p>
                        </div>
                        {meeting.meetingUrl && (
                          <Button variant="outline" size="sm" onClick={() => window.open(meeting.meetingUrl, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Gå med
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitetsflöde</CardTitle>
              <CardDescription>Senaste aktivitet i projektet</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Activity className="w-12 h-12" />}
                title="Ingen aktivitet"
                description="Aktivitet kommer att visas här när saker händer"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailPage;
