import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  RefreshCw,
  Eye,
  MoreHorizontal,
  Users,
  Ticket,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Pause,
  Play,
  AlertCircle,
  Target,
  ChevronRight,
  LayoutGrid,
  List,
  Building2,
  Timer,
  FileText,
  Percent
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import { useProjects, useTickets } from '../../src/hooks/useApi';
import CreateProjectForm from '../forms/CreateProjectForm';
import ProjectDetailPage from './ProjectDetailPage';
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
import { Badge, StatusBadge } from '../../src/components/ui/badge';
import { Skeleton, SkeletonCard } from '../../src/components/ui/skeleton';
import { EmptyState, EmptyStateFolder } from '../../src/components/ui/empty-state';
import { Avatar } from '../../src/components/ui/avatar';
import { Alert } from '../../src/components/ui/alert';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../../src/components/ui/modal';
import { Input } from '../../src/components/ui/input';
import { Tooltip } from '../../src/components/ui/tooltip';
import { toast } from '../../src/components/ui/toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../../src/components/ui/dropdown-menu';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../src/components/ui/select';

// Stats card component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: 'blue' | 'amber' | 'green' | 'red' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{trend.isPositive ? '+' : ''}{trend.value}% från förra månaden</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Progress bar component
const ProgressBar: React.FC<{ value: number; color?: string }> = ({ value, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full ${colors[color as keyof typeof colors] || colors.blue} transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

// Get status icon
const getStatusIcon = (state: string) => {
  switch (state) {
    case 'planning':
      return <Target className="w-4 h-4 text-blue-500" />;
    case 'in_progress':
      return <Play className="w-4 h-4 text-green-500" />;
    case 'on_hold':
      return <Pause className="w-4 h-4 text-amber-500" />;
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'cancelled':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <FolderKanban className="w-4 h-4 text-slate-400" />;
  }
};

// Get progress color based on percentage
const getProgressColor = (progress: number, daysRemaining?: number) => {
  if (daysRemaining !== undefined && daysRemaining < 7 && progress < 80) return 'red';
  if (progress >= 80) return 'green';
  if (progress >= 50) return 'blue';
  if (progress >= 25) return 'amber';
  return 'blue';
};

const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Determine if user can create projects
  const canCreateProject = user && (isAdmin(user.role) || isKAM(user.role) || isProjectLeader(user.role));
  const canEdit = user && (isAdmin(user.role) || isKAM(user.role) || isProjectLeader(user.role));

  // Fetch data
  const { data: projects = [], isLoading, error, refetch } = useProjects(
    user?.companyId && !isAdmin(user.role) && !isKAM(user.role) && !isProjectLeader(user.role)
      ? { companyId: user.companyId }
      : undefined
  );

  const { data: tickets = [] } = useTickets();

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p: any) => p.state === 'in_progress').length,
      completedProjects: projects.filter((p: any) => p.state === 'completed').length,
      onHoldProjects: projects.filter((p: any) => p.state === 'on_hold').length
    };
  }, [projects]);

  // Get ticket count for a project
  const getProjectTicketCount = (projectId: string) => {
    return tickets.filter((t: any) => t.projectId === projectId).length;
  };

  // Calculate mock progress (in production, this would come from API)
  const getProjectProgress = (project: any) => {
    const projectTickets = tickets.filter((t: any) => t.projectId === project.id);
    if (projectTickets.length === 0) return 0;
    const completedTickets = projectTickets.filter((t: any) => t.state === 'resolved' || t.state === 'closed').length;
    return Math.round((completedTickets / projectTickets.length) * 100);
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return undefined;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Filter projects
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = stateFilter === 'all' || project.state === stateFilter;
    return matchesSearch && matchesState;
  });

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
    toast.success('Projekt skapat', { description: 'Projektet har skapats framgångsrikt.' });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data uppdaterad');
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
        <SkeletonCard className="h-20" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Fel vid hämtning av data" dismissible>
        {error instanceof Error ? error.message : t('errors.loadFailed', 'Kunde inte ladda data')}
      </Alert>
    );
  }

  // Show project detail page when a project is selected
  if (selectedProjectId) {
    const selectedProject = projects.find((p: any) => p.id === selectedProjectId);
    return (
      <ProjectDetailPage
        projectId={selectedProjectId}
        project={selectedProject}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('pages.projects.title', 'Projekt')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('pages.projects.subtitle', 'Hantera och följ upp dina projekt')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Uppdatera">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </Tooltip>
          {canCreateProject && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              {t('pages.projects.create', 'Nytt projekt')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Totala projekt"
          value={stats.totalProjects}
          icon={<FolderKanban className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Pågående"
          value={stats.activeProjects}
          icon={<Activity className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Slutförda"
          value={stats.completedProjects}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="Pausade"
          value={stats.onHoldProjects}
          icon={<Pause className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <Input
                  type="text"
                  placeholder={t('pages.projects.searchPlaceholder', 'Sök projekt...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* State Filter */}
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder={t('pages.projects.allStates', 'Alla statusar')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pages.projects.allStates', 'Alla statusar')}</SelectItem>
                  <SelectItem value="planning">{t('project.states.planning', 'Planering')}</SelectItem>
                  <SelectItem value="in_progress">{t('project.states.in_progress', 'Pågående')}</SelectItem>
                  <SelectItem value="on_hold">{t('project.states.on_hold', 'Pausad')}</SelectItem>
                  <SelectItem value="completed">{t('project.states.completed', 'Slutförd')}</SelectItem>
                  <SelectItem value="cancelled">{t('project.states.cancelled', 'Avbruten')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active filters */}
          {(stateFilter !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Aktiva filter:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Sök: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
                {stateFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {stateFilter}
                    <button onClick={() => setStateFilter('all')} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visar <span className="font-medium text-slate-700 dark:text-slate-200">{filteredProjects.length}</span> av{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">{projects.length}</span> projekt
        </p>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyStateFolder
              title={searchQuery || stateFilter !== 'all'
                ? t('pages.projects.noResults', 'Inga projekt matchar filtret')
                : t('pages.projects.noProjects', 'Inga projekt än')}
              description={canCreateProject && !searchQuery && stateFilter === 'all'
                ? 'Skapa ditt första projekt för att komma igång'
                : undefined}
              action={canCreateProject && !searchQuery && stateFilter === 'all' ? {
                label: t('pages.projects.createFirst', 'Skapa ditt första projekt'),
                onClick: () => setIsCreateModalOpen(true)
              } : undefined}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProjects.map((project: any) => {
            const progress = getProjectProgress(project);
            const daysRemaining = getDaysRemaining(project.estimatedEndDate);
            const ticketCount = getProjectTicketCount(project.id);
            const isExpanded = expandedProjectId === project.id;

            return (
              <Card
                key={project.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
                onClick={() => setSelectedProjectId(project.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar
                          name={project.name}
                          size="lg"
                          className="bg-gradient-to-br from-blue-500 to-cyan-400"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                          {getStatusIcon(project.state)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{project.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={project.state} />
                          {project.state === 'in_progress' && daysRemaining !== undefined && (
                            <span className={`text-xs ${daysRemaining < 7 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                              {daysRemaining > 0 ? `${daysRemaining} dagar kvar` : daysRemaining === 0 ? 'Idag!' : 'Försenat!'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          Generera rapport
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {project.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Progress */}
                  {project.state === 'in_progress' && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Framsteg</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
                      </div>
                      <ProgressBar value={progress} color={getProgressColor(progress, daysRemaining)} />
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-blue-500" />
                      <span>{ticketCount} ärenden</span>
                    </div>
                    {project.startDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{formatDate(project.startDate)}</span>
                      </div>
                    )}
                    {project.estimatedEndDate && (
                      <div className="flex items-center gap-1.5">
                        <Timer className="w-4 h-4 text-slate-400" />
                        <span>{formatDate(project.estimatedEndDate)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredProjects.map((project: any) => {
                const progress = getProjectProgress(project);
                const daysRemaining = getDaysRemaining(project.estimatedEndDate);
                const ticketCount = getProjectTicketCount(project.id);
                const isExpanded = expandedProjectId === project.id;

                return (
                  <div
                    key={project.id}
                    className={`group cursor-pointer transition-all duration-200 ${
                      isExpanded
                        ? 'bg-blue-50/80 dark:bg-blue-900/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div
                      className="p-4 sm:p-5"
                      onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <Avatar
                            name={project.name}
                            size="md"
                            className="bg-gradient-to-br from-blue-500 to-cyan-400"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
                            {getStatusIcon(project.state)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{project.name}</h3>
                            <StatusBadge status={project.state} />
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <span>{ticketCount} ärenden</span>
                            {project.startDate && <span>Start: {formatDate(project.startDate)}</span>}
                            {project.state === 'in_progress' && (
                              <span className="flex items-center gap-1">
                                <Percent className="w-3 h-3" />
                                {progress}% klart
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {project.state === 'in_progress' && (
                            <div className="hidden sm:block w-24">
                              <ProgressBar value={progress} color={getProgressColor(progress, daysRemaining)} />
                            </div>
                          )}
                          <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedProjectId(project.id)}>
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

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                              <StatusBadge status={project.state} />
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ärenden</p>
                              <div className="flex items-center gap-1.5">
                                <Ticket className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-slate-700 dark:text-slate-300">{ticketCount}</span>
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Startdatum</p>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(project.startDate)}</span>
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Slutdatum</p>
                              <div className="flex items-center gap-1.5">
                                <Timer className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(project.estimatedEndDate)}</span>
                              </div>
                            </div>
                          </div>

                          {project.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                              {project.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-4">
                            <Button variant="default" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedProjectId(project.id); }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Öppna projekt
                            </Button>
                            <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                              <Ticket className="w-4 h-4 mr-2" />
                              Visa ärenden
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Project Modal */}
      <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <ModalContent className="sm:max-w-lg">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              {t('pages.projects.createTitle', 'Skapa nytt projekt')}
            </ModalTitle>
          </ModalHeader>
          <CreateProjectForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
