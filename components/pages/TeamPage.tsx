import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  Mail,
  Phone,
  Shield,
  Crown,
  Code,
  Briefcase,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  UserCheck,
  Building2,
  FolderKanban,
  Star,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import { useProjects } from '../../src/hooks/useApi';
import ProjectSelector from '../shared/ProjectSelector';
import ProjectTeam from '../shared/ProjectTeam';
import InviteUserForm from '../forms/InviteUserForm';
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
import { Badge } from '../../src/components/ui/badge';
import { Skeleton, SkeletonCard } from '../../src/components/ui/skeleton';
import { EmptyState, EmptyStateUsers } from '../../src/components/ui/empty-state';
import { Alert } from '../../src/components/ui/alert';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../../src/components/ui/modal';
import { Tooltip } from '../../src/components/ui/tooltip';
import { toast } from '../../src/components/ui/toast';
import { Label } from '../../src/components/ui/label';
import { Input } from '../../src/components/ui/input';
import { Avatar } from '../../src/components/ui/avatar';
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

// Role badge component
const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-orange-400 text-white border-0">
          <Crown className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      );
    case 'kam':
      return (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-400 text-white border-0">
          <Star className="w-3 h-3 mr-1" />
          KAM
        </Badge>
      );
    case 'projectLeader':
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0">
          <Shield className="w-3 h-3 mr-1" />
          Projektledare
        </Badge>
      );
    case 'developer':
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-400 text-white border-0">
          <Code className="w-3 h-3 mr-1" />
          Utvecklare
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <Briefcase className="w-3 h-3 mr-1" />
          Kund
        </Badge>
      );
  }
};

// Mock team data for demonstration
const mockTeamMembers = [
  { id: '1', name: 'Anna Lindström', email: 'anna@siteflow.se', role: 'admin', status: 'active', lastActive: new Date().toISOString(), projectCount: 12 },
  { id: '2', name: 'Erik Svensson', email: 'erik@siteflow.se', role: 'kam', status: 'active', lastActive: new Date(Date.now() - 3600000).toISOString(), projectCount: 8 },
  { id: '3', name: 'Maria Karlsson', email: 'maria@siteflow.se', role: 'projectLeader', status: 'active', lastActive: new Date(Date.now() - 7200000).toISOString(), projectCount: 5 },
  { id: '4', name: 'Johan Andersson', email: 'johan@siteflow.se', role: 'developer', status: 'active', lastActive: new Date(Date.now() - 86400000).toISOString(), projectCount: 3 },
  { id: '5', name: 'Sofia Berg', email: 'sofia@siteflow.se', role: 'developer', status: 'inactive', lastActive: new Date(Date.now() - 604800000).toISOString(), projectCount: 2 },
];

const TeamPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Determine if user can invite team members
  const canInvite = user && (isAdmin(user.role) || isKAM(user.role) || isProjectLeader(user.role));
  const canManage = user && (isAdmin(user.role) || isKAM(user.role));

  // Fetch projects based on role
  const { data: projects = [], isLoading, error, refetch } = useProjects(
    user?.companyId && !isAdmin(user.role) && !isKAM(user.role) && !isProjectLeader(user.role)
      ? { companyId: user.companyId }
      : undefined
  );

  // Use mock data for demonstration (in production, this would come from API)
  const teamMembers = canManage ? mockTeamMembers : (user ? [{ ...user, status: 'active', lastActive: new Date().toISOString(), projectCount: 1 }] : []);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalMembers: teamMembers.length,
      activeMembers: teamMembers.filter((m: any) => m.status === 'active').length,
      admins: teamMembers.filter((m: any) => m.role === 'admin').length,
      developers: teamMembers.filter((m: any) => m.role === 'developer').length
    };
  }, [teamMembers]);

  // Filter team members
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member: any) => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teamMembers, searchQuery, roleFilter, statusFilter]);

  const handleInviteSuccess = () => {
    setIsInviteModalOpen(false);
    toast.success('Inbjudan skickad', { description: 'Användaren har bjudits in till projektet.' });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data uppdaterad');
  };

  // Format last active time
  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 5) return 'Just nu';
    if (diffInMinutes < 60) return `${diffInMinutes} min sedan`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} tim sedan`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} dagar sedan`;
    return date.toLocaleDateString('sv-SE');
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
        <SkeletonCard className="h-64" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('pages.team.title', 'Team')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('pages.team.subtitle', 'Hantera teammedlemmar och roller')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Uppdatera">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </Tooltip>
          {canInvite && (
            <Button onClick={() => setIsInviteModalOpen(true)} className="shadow-sm">
              <UserPlus className="w-4 h-4 mr-2" />
              {t('pages.team.invite', 'Bjud in medlem')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Totala medlemmar"
          value={stats.totalMembers}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Aktiva nu"
          value={stats.activeMembers}
          icon={<Activity className="w-6 h-6" />}
          trend={{ value: 5, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Administratörer"
          value={stats.admins}
          icon={<Shield className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="Utvecklare"
          value={stats.developers}
          icon={<Code className="w-6 h-6" />}
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
                  placeholder="Sök medlemmar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <Shield className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Alla roller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla roller</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="kam">KAM</SelectItem>
                  <SelectItem value="projectLeader">Projektledare</SelectItem>
                  <SelectItem value="developer">Utvecklare</SelectItem>
                  <SelectItem value="customer">Kund</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Activity className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Alla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla</SelectItem>
                  <SelectItem value="active">Aktiva</SelectItem>
                  <SelectItem value="inactive">Inaktiva</SelectItem>
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
          {(roleFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Aktiva filter:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Sök: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
                {roleFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Roll: {roleFilter}
                    <button onClick={() => setRoleFilter('all')} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setStatusFilter('all');
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
          Visar <span className="font-medium text-slate-700 dark:text-slate-200">{filteredMembers.length}</span> av{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">{teamMembers.length}</span> medlemmar
        </p>
      </div>

      {/* Team Members */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyStateUsers
              title={searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Inga medlemmar matchar filtret'
                : 'Inga teammedlemmar än'}
              description={canInvite && !searchQuery && roleFilter === 'all' && statusFilter === 'all'
                ? 'Bjud in din första teammedlem'
                : undefined}
              action={canInvite && !searchQuery && roleFilter === 'all' && statusFilter === 'all' ? {
                label: 'Bjud in medlem',
                onClick: () => setIsInviteModalOpen(true)
              } : undefined}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member: any) => {
            const isSelected = selectedMemberId === member.id;

            return (
              <Card
                key={member.id}
                className={`group cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg'
                    : 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                onClick={() => setSelectedMemberId(isSelected ? null : member.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar
                          name={member.name}
                          size="lg"
                          className="bg-gradient-to-br from-blue-500 to-purple-500"
                        />
                        {member.status === 'active' && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{member.email}</p>
                        <div className="mt-2">
                          {getRoleBadge(member.role)}
                        </div>
                      </div>
                    </div>
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Visa profil
                          </DropdownMenuItem>
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
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <FolderKanban className="w-4 h-4 text-blue-500" />
                      <span>{member.projectCount || 0} projekt</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatLastActive(member.lastActive)}</span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <a href={`mailto:${member.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {member.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">Senast aktiv: {formatLastActive(member.lastActive)}</span>
                        </div>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            Profil
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <FolderKanban className="w-4 h-4 mr-2" />
                            Projekt
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
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
              {filteredMembers.map((member: any) => {
                const isSelected = selectedMemberId === member.id;

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMemberId(isSelected ? null : member.id)}
                    className={`group cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-900/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <Avatar
                            name={member.name}
                            size="md"
                            className="bg-gradient-to-br from-blue-500 to-purple-500"
                          />
                          {member.status === 'active' && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</h3>
                            {getRoleBadge(member.role)}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <span>{member.email}</span>
                            <span>{member.projectCount || 0} projekt</span>
                            <span>{formatLastActive(member.lastActive)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
                          {canManage && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visa profil
                                </DropdownMenuItem>
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
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-blue-500" />
                              <a href={`mailto:${member.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                {member.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <FolderKanban className="w-4 h-4 text-purple-500" />
                              <span className="text-slate-700 dark:text-slate-300">{member.projectCount} projekt</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700 dark:text-slate-300">{formatLastActive(member.lastActive)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {member.status === 'active' ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-green-600 dark:text-green-400">Aktiv</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-500">Inaktiv</span>
                                </>
                              )}
                            </div>
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

      {/* Invite Modal */}
      <Modal open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              {t('pages.team.inviteTitle', 'Bjud in teammedlem')}
            </ModalTitle>
          </ModalHeader>
          <InviteUserForm
            onSuccess={handleInviteSuccess}
            onCancel={() => setIsInviteModalOpen(false)}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TeamPage;
