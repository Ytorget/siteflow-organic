import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Plus,
  FolderKanban,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronRight,
  Timer,
  Target,
  Play,
  Pause,
  CalendarDays,
  BarChart3,
  User,
  CheckCircle2,
  Download
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTimeEntries, useProjects } from '../../src/hooks/useApi';
import CreateTimeEntryForm from '../forms/CreateTimeEntryForm';

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Skeleton, SkeletonCard } from '../../src/components/ui/skeleton';
import { EmptyState } from '../../src/components/ui/empty-state';
import { Alert } from '../../src/components/ui/alert';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../../src/components/ui/modal';
import { Input } from '../../src/components/ui/input';
import { Tooltip } from '../../src/components/ui/tooltip';
import { toast } from '../../src/components/ui/toast';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../src/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../../src/components/ui/dropdown-menu';

type ViewMode = 'week' | 'month';

// Stats card component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
  color: 'blue' | 'amber' | 'green' | 'red' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, subtitle, color }) => {
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
            {trend ? (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{trend.isPositive ? '+' : ''}{trend.value}% från förra perioden</span>
              </div>
            ) : subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>
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

// Progress bar for weekly goal
const WeeklyGoalProgress: React.FC<{ current: number; goal: number }> = ({ current, goal }) => {
  const percentage = Math.min(100, (current / goal) * 100);
  const isOvertime = current > goal;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400">Veckans mål</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {current.toFixed(1)}h / {goal}h
        </span>
      </div>
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isOvertime ? 'bg-amber-500' : percentage >= 80 ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isOvertime && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          +{(current - goal).toFixed(1)}h övertid
        </p>
      )}
    </div>
  );
};

const TimeTrackingDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [isCreateTimeEntryModalOpen, setIsCreateTimeEntryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Fetch time entries and projects
  const { data: timeEntries = [], isLoading: entriesLoading, error: entriesError, refetch } = useTimeEntries();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  const loading = entriesLoading || projectsLoading;
  const error = entriesError;

  // Weekly goal (configurable)
  const weeklyGoal = 40;

  // Helper functions for date calculations
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const isToday = (date: string) => {
    const today = new Date();
    const entryDate = new Date(date);
    return (
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    );
  };

  const isThisWeek = (date: string) => {
    const entryDate = new Date(date);
    const startOfWeek = getStartOfWeek(new Date());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return entryDate >= startOfWeek && entryDate <= endOfWeek;
  };

  const isThisMonth = (date: string) => {
    const entryDate = new Date(date);
    const today = new Date();
    return (
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    );
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const todayHours = timeEntries
      .filter((entry: any) => isToday(entry.date))
      .reduce((sum: number, entry: any) => sum + parseFloat(entry.hours), 0);

    const weekHours = timeEntries
      .filter((entry: any) => isThisWeek(entry.date))
      .reduce((sum: number, entry: any) => sum + parseFloat(entry.hours), 0);

    const monthHours = timeEntries
      .filter((entry: any) => isThisMonth(entry.date))
      .reduce((sum: number, entry: any) => sum + parseFloat(entry.hours), 0);

    const uniqueProjects = new Set(
      timeEntries
        .filter((entry: any) => viewMode === 'week' ? isThisWeek(entry.date) : isThisMonth(entry.date))
        .map((entry: any) => entry.projectId)
    ).size;

    return { todayHours, weekHours, monthHours, uniqueProjects };
  }, [timeEntries, viewMode]);

  // Filter time entries based on view mode and filters
  const filteredEntries = useMemo(() => {
    let filtered = timeEntries.filter((entry: any) => {
      const matchesTime = viewMode === 'week' ? isThisWeek(entry.date) : isThisMonth(entry.date);
      const matchesProject = projectFilter === 'all' || entry.projectId === projectFilter;
      const matchesSearch = !searchQuery ||
        entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getProjectName(entry.projectId).toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTime && matchesProject && matchesSearch;
    });

    return filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timeEntries, viewMode, projectFilter, searchQuery]);

  // Group entries by project
  const entriesByProject = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredEntries.forEach((entry: any) => {
      const projectId = entry.projectId;
      if (!grouped[projectId]) {
        grouped[projectId] = [];
      }
      grouped[projectId].push(entry);
    });
    return grouped;
  }, [filteredEntries]);

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project?.name || 'Okänt projekt';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Idag';
    if (diffInDays === 1) return 'Igår';
    if (diffInDays < 7) return date.toLocaleDateString('sv-SE', { weekday: 'short' });
    return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data uppdaterad');
  };

  const handleCreateSuccess = () => {
    setIsCreateTimeEntryModalOpen(false);
    refetch();
    toast.success('Tidpost skapad', { description: 'Din tid har registrerats.' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Fel vid hämtning av data" dismissible>
        {error instanceof Error ? error.message : 'Kunde inte ladda tidsposter'}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Tidrapportering
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Hantera och översikt över din arbetad tid
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Uppdatera">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Exportera">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Button onClick={() => setIsCreateTimeEntryModalOpen(true)} className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Lägg till tid
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Idag"
          value={`${stats.todayHours.toFixed(1)}h`}
          icon={<Clock className="w-6 h-6" />}
          subtitle="Registrerad tid idag"
          color="blue"
        />
        <StatsCard
          title="Denna vecka"
          value={`${stats.weekHours.toFixed(1)}h`}
          icon={<Calendar className="w-6 h-6" />}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Denna månad"
          value={`${stats.monthHours.toFixed(1)}h`}
          icon={<BarChart3 className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
          color="purple"
        />
        <StatsCard
          title="Aktiva projekt"
          value={stats.uniqueProjects.toString()}
          icon={<FolderKanban className="w-6 h-6" />}
          subtitle="Med registrerad tid"
          color="amber"
        />
      </div>

      {/* Weekly Goal Progress */}
      <Card>
        <CardContent className="p-4">
          <WeeklyGoalProgress current={stats.weekHours} goal={weeklyGoal} />
        </CardContent>
      </Card>

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
                  placeholder="Sök tidsposter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Project Filter */}
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <FolderKanban className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Alla projekt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla projekt</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
              <Button
                variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="px-4"
              >
                Vecka
              </Button>
              <Button
                variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="px-4"
              >
                Månad
              </Button>
            </div>
          </div>

          {/* Active filters */}
          {(projectFilter !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Aktiva filter:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Sök: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
                {projectFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Projekt: {getProjectName(projectFilter)}
                    <button onClick={() => setProjectFilter('all')} className="ml-1 hover:text-red-500">×</button>
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
          <span className="font-medium text-slate-700 dark:text-slate-200">{filteredEntries.length}</span> tidsposter i{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">{Object.keys(entriesByProject).length}</span> projekt
        </p>
      </div>

      {/* Time Entries by Project */}
      {Object.keys(entriesByProject).length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={<Clock className="w-12 h-12" />}
              title={searchQuery || projectFilter !== 'all'
                ? 'Inga tidsposter matchar filtret'
                : 'Inga tidsposter ännu'}
              description={!searchQuery && projectFilter === 'all'
                ? 'Börja logga din tid för att se översikt här'
                : undefined}
              action={!searchQuery && projectFilter === 'all' ? {
                label: 'Lägg till första tidposten',
                onClick: () => setIsCreateTimeEntryModalOpen(true)
              } : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(entriesByProject).map(([projectId, entries]) => {
            const projectHours = entries.reduce(
              (sum, entry: any) => sum + parseFloat(entry.hours),
              0
            );
            const isExpanded = expandedProjectId === projectId;

            return (
              <Card key={projectId} className="overflow-hidden">
                {/* Project Header */}
                <div
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setExpandedProjectId(isExpanded ? null : projectId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm">
                        <FolderKanban className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{getProjectName(projectId)}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {entries.length} {entries.length === 1 ? 'tidpost' : 'tidsposter'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projectHours.toFixed(1)}h</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Totalt</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Time Entries */}
                {isExpanded && (
                  <CardContent className="p-0 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {entries.map((entry: any) => (
                        <div key={entry.id} className="group p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <Timer className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <Badge variant="secondary" className="text-xs">
                                    <CalendarDays className="w-3 h-3 mr-1" />
                                    {formatDate(entry.date)}
                                  </Badge>
                                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                    {parseFloat(entry.hours).toFixed(1)}h
                                  </span>
                                </div>
                                {entry.description ? (
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{entry.description}</p>
                                ) : (
                                  <p className="text-sm text-slate-400 dark:text-slate-500 italic">Ingen beskrivning</p>
                                )}
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                  {formatFullDate(entry.date)}
                                </p>
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
                                  <Edit className="w-4 h-4 mr-2" />
                                  Redigera
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Ta bort
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Time Entry Modal */}
      <Modal open={isCreateTimeEntryModalOpen} onOpenChange={setIsCreateTimeEntryModalOpen}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Lägg till tidpost
            </ModalTitle>
          </ModalHeader>
          <CreateTimeEntryForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateTimeEntryModalOpen(false)}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TimeTrackingDashboard;
