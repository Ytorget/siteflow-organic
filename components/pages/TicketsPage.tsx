import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  MessageSquare,
  RefreshCw,
  Eye,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Timer,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Bug,
  Lightbulb,
  HelpCircle,
  Settings,
  ChevronRight,
  Calendar,
  Tag,
  Folder,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import { useTickets, useProjects } from '../../src/hooks/useApi';
import CreateTicketForm from '../forms/CreateTicketForm';
import { isAdmin, isKAM, isProjectLeader, isDeveloper } from '../../utils/roleHelpers';

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
import { EmptyState, EmptyStateInbox } from '../../src/components/ui/empty-state';
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

// Ticket type icons
const getTicketTypeIcon = (type?: string) => {
  switch (type) {
    case 'bug':
      return <Bug className="w-4 h-4 text-red-500" />;
    case 'feature':
      return <Lightbulb className="w-4 h-4 text-amber-500" />;
    case 'question':
      return <HelpCircle className="w-4 h-4 text-blue-500" />;
    case 'task':
      return <Settings className="w-4 h-4 text-slate-500" />;
    default:
      return <Ticket className="w-4 h-4 text-slate-400" />;
  }
};

// Priority indicator
const getPriorityIndicator = (priority: string) => {
  switch (priority) {
    case 'critical':
      return (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Kritisk</span>
        </div>
      );
    case 'high':
      return (
        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
          <ArrowUp className="w-4 h-4" />
          <span className="text-xs font-medium">Hög</span>
        </div>
      );
    case 'medium':
      return (
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <Activity className="w-4 h-4" />
          <span className="text-xs font-medium">Medium</span>
        </div>
      );
    case 'low':
      return (
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <ArrowDown className="w-4 h-4" />
          <span className="text-xs font-medium">Låg</span>
        </div>
      );
    default:
      return null;
  }
};

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
                <span>{trend.isPositive ? '+' : ''}{trend.value}% från förra veckan</span>
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

const TicketsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list');

  // Fetch data
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError, refetch } = useTickets();
  const { data: projects = [], isLoading: projectsLoading } = useProjects(
    user?.companyId && !isAdmin(user.role) && !isKAM(user.role) && !isProjectLeader(user.role)
      ? { companyId: user.companyId }
      : undefined
  );

  const isLoading = ticketsLoading || projectsLoading;

  // Filter tickets based on user role and company
  const projectIds = projects.map((p: any) => p.id);
  const filteredByRole = isAdmin(user?.role) || isKAM(user?.role) || isProjectLeader(user?.role)
    ? tickets
    : tickets.filter((t: any) => projectIds.includes(t.projectId));

  // Apply search and filters
  const filteredTickets = filteredByRole.filter((ticket: any) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = stateFilter === 'all' || ticket.state === stateFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || ticket.projectId === projectFilter;
    return matchesSearch && matchesState && matchesPriority && matchesProject;
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const allTickets = filteredByRole;
    return {
      total: allTickets.length,
      open: allTickets.filter((t: any) => t.state === 'open').length,
      inProgress: allTickets.filter((t: any) => t.state === 'in_progress').length,
      resolved: allTickets.filter((t: any) => t.state === 'resolved' || t.state === 'closed').length,
      critical: allTickets.filter((t: any) => t.priority === 'critical').length
    };
  }, [filteredByRole]);

  const selectedTicket = tickets.find((t: any) => t.id === selectedTicketId);

  const getProjectName = (projectId: string) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project?.name || t('ticket.unknownProject', 'Okänt projekt');
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
    toast.success('Ärende skapat', { description: 'Ärendet har skapats framgångsrikt.' });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data uppdaterad');
  };

  // Format date with relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Idag';
    if (diffInDays === 1) return 'Igår';
    if (diffInDays < 7) return `${diffInDays} dagar sedan`;
    return date.toLocaleDateString('sv-SE');
  };

  // Get status icon and color
  const getStatusConfig = (state: string) => {
    switch (state) {
      case 'open':
        return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
      case 'in_progress':
        return { icon: <Timer className="w-4 h-4" />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
      case 'in_review':
        return { icon: <Eye className="w-4 h-4" />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' };
      case 'resolved':
        return { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
      case 'closed':
        return { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/30' };
      default:
        return { icon: <Ticket className="w-4 h-4" />, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/30' };
    }
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
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  if (ticketsError) {
    return (
      <Alert variant="error" title="Fel vid hämtning av data" dismissible>
        {ticketsError instanceof Error ? ticketsError.message : t('errors.loadFailed', 'Kunde inte ladda data')}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('pages.tickets.title', 'Ärenden')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('pages.tickets.subtitle', 'Hantera supportärenden och buggar')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Uppdatera">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('pages.tickets.create', 'Nytt ärende')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Totala ärenden"
          value={stats.total}
          icon={<Ticket className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Öppna"
          value={stats.open}
          icon={<AlertCircle className="w-6 h-6" />}
          trend={{ value: 12, isPositive: false }}
          color="amber"
        />
        <StatsCard
          title="Pågående"
          value={stats.inProgress}
          icon={<Timer className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="Lösta"
          value={stats.resolved}
          icon={<CheckCircle2 className="w-6 h-6" />}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
      </div>

      {/* Critical tickets warning */}
      {stats.critical > 0 && (
        <Alert variant="warning" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              {stats.critical} kritisk{stats.critical > 1 ? 'a' : 't'} ärende{stats.critical > 1 ? 'n' : ''} kräver omedelbar uppmärksamhet
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Granska och prioritera dessa ärenden så snart som möjligt.
            </p>
          </div>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder={t('pages.tickets.searchPlaceholder', 'Sök ärenden...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 hidden sm:block" />

              {/* Project Filter */}
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[160px]">
                  <Folder className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder={t('pages.tickets.allProjects', 'Alla projekt')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pages.tickets.allProjects', 'Alla projekt')}</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* State Filter */}
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[150px]">
                  <Activity className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder={t('pages.tickets.allStates', 'Alla statusar')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pages.tickets.allStates', 'Alla statusar')}</SelectItem>
                  <SelectItem value="open">{t('ticket.states.open', 'Öppen')}</SelectItem>
                  <SelectItem value="in_progress">{t('ticket.states.in_progress', 'Pågående')}</SelectItem>
                  <SelectItem value="in_review">{t('ticket.states.in_review', 'Granskning')}</SelectItem>
                  <SelectItem value="resolved">{t('ticket.states.resolved', 'Löst')}</SelectItem>
                  <SelectItem value="closed">{t('ticket.states.closed', 'Stängd')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <Tag className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder={t('pages.tickets.allPriorities', 'Alla prioriteter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pages.tickets.allPriorities', 'Alla prioriteter')}</SelectItem>
                  <SelectItem value="critical">{t('ticket.priority.critical', 'Kritisk')}</SelectItem>
                  <SelectItem value="high">{t('ticket.priority.high', 'Hög')}</SelectItem>
                  <SelectItem value="medium">{t('ticket.priority.medium', 'Medium')}</SelectItem>
                  <SelectItem value="low">{t('ticket.priority.low', 'Låg')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters */}
          {(stateFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || searchQuery) && (
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
                {priorityFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Prioritet: {priorityFilter}
                    <button onClick={() => setPriorityFilter('all')} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
                {projectFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Projekt: {getProjectName(projectFilter)}
                    <button onClick={() => setProjectFilter('all')} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStateFilter('all');
                  setPriorityFilter('all');
                  setProjectFilter('all');
                }}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Rensa alla
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visar <span className="font-medium text-slate-700 dark:text-slate-200">{filteredTickets.length}</span> av{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">{filteredByRole.length}</span> ärenden
        </p>
      </div>

      {/* Tickets List */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {filteredTickets.length === 0 ? (
            <div className="p-12">
              <EmptyStateInbox
                title={searchQuery || stateFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'
                  ? t('pages.tickets.noResults', 'Inga ärenden matchar filtret')
                  : t('pages.tickets.noTickets', 'Inga ärenden än')}
                description={!searchQuery && stateFilter === 'all' ? 'Skapa ditt första ärende för att komma igång' : undefined}
                action={!searchQuery && stateFilter === 'all' ? {
                  label: t('pages.tickets.createFirst', 'Skapa ditt första ärende'),
                  onClick: () => setIsCreateModalOpen(true)
                } : undefined}
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredTickets.map((ticket: any) => {
                const statusConfig = getStatusConfig(ticket.state);
                const isSelected = selectedTicketId === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(isSelected ? null : ticket.id)}
                    className={`group cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-900/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        {/* Status indicator */}
                        <div className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-xl ${statusConfig.bg} ${statusConfig.color} flex-shrink-0`}>
                          {statusConfig.icon}
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Title row */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {ticket.title}
                                </h3>
                                {ticket.priority && (
                                  <PriorityBadge priority={ticket.priority} />
                                )}
                              </div>

                              {/* Description */}
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mt-1">
                                {ticket.description || 'Ingen beskrivning'}
                              </p>

                              {/* Meta row */}
                              <div className="flex items-center gap-3 sm:gap-4 mt-3 flex-wrap">
                                {/* Project */}
                                <div className="flex items-center gap-1.5">
                                  <Folder className="w-3.5 h-3.5 text-blue-500" />
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {getProjectName(ticket.projectId)}
                                  </span>
                                </div>

                                {/* Status badge */}
                                <StatusBadge status={ticket.state} />

                                {/* Date */}
                                {ticket.createdAt && (
                                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="text-xs">{formatDate(ticket.createdAt)}</span>
                                  </div>
                                )}

                                {/* Assignee */}
                                {ticket.assigneeId && (
                                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <User className="w-3.5 h-3.5" />
                                    <span className="text-xs">Tilldelad</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
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
                                    <User className="w-4 h-4 mr-2" />
                                    Tilldela
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Stäng ärende
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Description */}
                            <div className="lg:col-span-2">
                              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                {t('pages.tickets.description', 'Beskrivning')}
                              </h4>
                              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                  {ticket.description || t('pages.tickets.noDescription', 'Ingen beskrivning tillgänglig för detta ärende.')}
                                </p>
                              </div>
                            </div>

                            {/* Details sidebar */}
                            <div className="space-y-4">
                              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Detaljer</h4>

                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Status</span>
                                    <StatusBadge status={ticket.state} />
                                  </div>

                                  {ticket.priority && (
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-slate-500 dark:text-slate-400">Prioritet</span>
                                      {getPriorityIndicator(ticket.priority)}
                                    </div>
                                  )}

                                  {ticket.assigneeId && (
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-slate-500 dark:text-slate-400">Tilldelad</span>
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                          <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300">Team</span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Skapad</span>
                                    <span className="text-slate-700 dark:text-slate-300">
                                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('sv-SE') : '-'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <Button variant="outline" className="w-full">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Lägg till kommentar
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Modal */}
      <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <ModalContent className="sm:max-w-lg">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              {t('pages.tickets.createTitle', 'Skapa nytt ärende')}
            </ModalTitle>
          </ModalHeader>
          <CreateTicketForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TicketsPage;
