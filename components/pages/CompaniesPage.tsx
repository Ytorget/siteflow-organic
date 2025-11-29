import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Plus,
  Search,
  FolderKanban,
  Mail,
  Phone,
  Globe,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  ExternalLink,
  ChevronRight,
  Shield,
  CreditCard,
  Star,
  Activity,
  Filter,
  LayoutGrid,
  List,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import { useCompanies, useProjects } from '../../src/hooks/useApi';
import { isAdmin, isKAM } from '../../utils/roleHelpers';

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

// Company tier badge
const getTierBadge = (projectCount: number) => {
  if (projectCount >= 5) {
    return (
      <Badge className="bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 border-0">
        <Star className="w-3 h-3 mr-1" />
        Enterprise
      </Badge>
    );
  }
  if (projectCount >= 2) {
    return (
      <Badge className="bg-gradient-to-r from-blue-400 to-cyan-300 text-blue-900 border-0">
        <Shield className="w-3 h-3 mr-1" />
        Professional
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <Briefcase className="w-3 h-3 mr-1" />
      Starter
    </Badge>
  );
};

const CompaniesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Check permissions
  const canCreate = user && (isAdmin(user.role) || isKAM(user.role));

  // Fetch data
  const { data: companies = [], isLoading, error: companiesError, refetch } = useCompanies();
  const { data: projects = [] } = useProjects();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p: any) => p.state === 'in_progress').length;
    const companiesWithActiveProjects = new Set(
      projects.filter((p: any) => p.state === 'in_progress').map((p: any) => p.companyId)
    ).size;

    return {
      totalCompanies: companies.length,
      activeClients: companiesWithActiveProjects,
      totalProjects,
      activeProjects
    };
  }, [companies, projects]);

  // Filter companies
  const filteredCompanies = companies.filter((company: any) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.orgNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;

    const companyProjects = projects.filter((p: any) => p.companyId === company.id);
    const hasActiveProjects = companyProjects.some((p: any) => p.state === 'in_progress');

    if (statusFilter === 'active') return matchesSearch && hasActiveProjects;
    if (statusFilter === 'inactive') return matchesSearch && !hasActiveProjects;

    return matchesSearch;
  });

  const selectedCompany = companies.find((c: any) => c.id === selectedCompanyId);

  // Get stats for a company
  const getCompanyStats = (companyId: string) => {
    const companyProjects = projects.filter((p: any) => p.companyId === companyId);
    const activeProjects = companyProjects.filter((p: any) => p.state === 'in_progress').length;
    const completedProjects = companyProjects.filter((p: any) => p.state === 'completed').length;

    return {
      totalProjects: companyProjects.length,
      activeProjects,
      completedProjects
    };
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
          {[...Array(4)].map((i) => (
            <SkeletonCard key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (companiesError) {
    return (
      <Alert variant="error" title="Fel vid hämtning av data" dismissible>
        {companiesError instanceof Error ? companiesError.message : t('errors.loadFailed', 'Kunde inte ladda data')}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('pages.companies.title', 'Företag')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('pages.companies.subtitle', 'Hantera kundföretag och relationer')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Uppdatera">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </Tooltip>
          {canCreate && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              {t('pages.companies.create', 'Nytt företag')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Totala företag"
          value={stats.totalCompanies}
          icon={<Building2 className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Aktiva kunder"
          value={stats.activeClients}
          icon={<Activity className="w-6 h-6" />}
          trend={{ value: 15, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Totala projekt"
          value={stats.totalProjects}
          icon={<FolderKanban className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="Pågående projekt"
          value={stats.activeProjects}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: 8, isPositive: true }}
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
                  placeholder={t('pages.companies.searchPlaceholder', 'Sök företag...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Alla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla företag</SelectItem>
                  <SelectItem value="active">Aktiva kunder</SelectItem>
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
          {(statusFilter !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Aktiva filter:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Sök: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {statusFilter === 'active' ? 'Aktiva kunder' : 'Inaktiva'}
                    <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-red-500">×</button>
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
          Visar <span className="font-medium text-slate-700 dark:text-slate-200">{filteredCompanies.length}</span> av{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">{companies.length}</span> företag
        </p>
      </div>

      {/* Companies Grid/List */}
      {filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={<Building2 className="w-12 h-12" />}
              title={searchQuery || statusFilter !== 'all'
                ? t('pages.companies.noResults', 'Inga företag matchar filtret')
                : t('pages.companies.noCompanies', 'Inga företag än')}
              description={canCreate && !searchQuery && statusFilter === 'all' ? 'Lägg till ditt första kundföretag' : undefined}
              action={canCreate && !searchQuery && statusFilter === 'all' ? {
                label: t('pages.companies.createFirst', 'Lägg till första företaget'),
                onClick: () => setIsCreateModalOpen(true)
              } : undefined}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCompanies.map((company: any) => {
            const stats = getCompanyStats(company.id);
            const isSelected = selectedCompanyId === company.id;

            return (
              <Card
                key={company.id}
                className={`group cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg'
                    : 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                onClick={() => setSelectedCompanyId(isSelected ? null : company.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar
                          name={company.name}
                          size="lg"
                          className="bg-gradient-to-br from-blue-500 to-purple-500"
                        />
                        {stats.activeProjects > 0 && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{company.name}</h3>
                          {getTierBadge(stats.totalProjects)}
                        </div>
                        {company.orgNumber && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Org.nr: {company.orgNumber}
                          </p>
                        )}
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
                          <FolderKanban className="w-4 h-4 mr-2" />
                          Visa projekt
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="w-4 h-4 mr-2" />
                          Hantera användare
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          Generera rapport
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-sm">
                      <FolderKanban className="w-4 h-4 text-blue-500" />
                      <span className="text-slate-600 dark:text-slate-400">{stats.totalProjects} projekt</span>
                    </div>
                    {stats.activeProjects > 0 && (
                      <Badge variant="success" className="gap-1">
                        <Activity className="w-3 h-3" />
                        {stats.activeProjects} aktiva
                      </Badge>
                    )}
                    {stats.completedProjects > 0 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {stats.completedProjects} avslutade
                      </span>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {company.contactEmail && (
                          <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                            <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <a href={`mailto:${company.contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                              {company.contactEmail}
                            </a>
                          </div>
                        )}
                        {company.contactPhone && (
                          <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                            <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <a href={`tel:${company.contactPhone}`} className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                              {company.contactPhone}
                            </a>
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                            <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate flex items-center gap-1">
                              {company.website.replace(/^https?:\/\//, '')}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {company.address && (
                          <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                            <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300 truncate">{company.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <FolderKanban className="w-4 h-4 mr-2" />
                          Visa projekt
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Users className="w-4 h-4 mr-2" />
                          Team
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="w-4 h-4 mr-2" />
                          Rapport
                        </Button>
                      </div>
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
              {filteredCompanies.map((company: any) => {
                const stats = getCompanyStats(company.id);
                const isSelected = selectedCompanyId === company.id;

                return (
                  <div
                    key={company.id}
                    onClick={() => setSelectedCompanyId(isSelected ? null : company.id)}
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
                            name={company.name}
                            size="md"
                            className="bg-gradient-to-br from-blue-500 to-purple-500"
                          />
                          {stats.activeProjects > 0 && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{company.name}</h3>
                            {getTierBadge(stats.totalProjects)}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {company.orgNumber && <span>Org.nr: {company.orgNumber}</span>}
                            <span>{stats.totalProjects} projekt</span>
                            {stats.activeProjects > 0 && (
                              <span className="text-green-600 dark:text-green-400">{stats.activeProjects} aktiva</span>
                            )}
                          </div>
                        </div>

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
                                <FolderKanban className="w-4 h-4 mr-2" />
                                Visa projekt
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="w-4 h-4 mr-2" />
                                Hantera användare
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {company.contactEmail && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <a href={`mailto:${company.contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                                  {company.contactEmail}
                                </a>
                              </div>
                            )}
                            {company.contactPhone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-green-500" />
                                <span className="text-slate-700 dark:text-slate-300">{company.contactPhone}</span>
                              </div>
                            )}
                            {company.website && (
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-purple-500" />
                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                  Webbplats
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700 dark:text-slate-300">Skapad: {formatDate(company.createdAt)}</span>
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

      {/* Create Company Modal */}
      <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              {t('pages.companies.createTitle', 'Lägg till nytt företag')}
            </ModalTitle>
          </ModalHeader>
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 mb-4">
              <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Skapa nytt företag
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {t('pages.companies.createFormPlaceholder', 'Formulär för att skapa företag kommer snart.')}
            </p>
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              {t('common.close', 'Stäng')}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CompaniesPage;
