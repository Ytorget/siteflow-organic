import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  History,
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  FileText,
  Settings,
  Key,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Calendar,
  Users,
  FolderKanban,
  Ticket,
  Building
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import { isAdmin } from '../../utils/roleHelpers';

// UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Badge } from '../../src/components/ui/badge';
import { Avatar } from '../../src/components/ui/avatar';
import { Separator } from '../../src/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../src/components/ui/select';
import { toast } from '../../src/components/ui/toast';
import { EmptyState } from '../../src/components/ui/empty-state';
import { Skeleton, SkeletonCard } from '../../src/components/ui/skeleton';

interface AuditEvent {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  category: 'auth' | 'user' | 'project' | 'ticket' | 'document' | 'settings' | 'api' | 'company';
  resourceType: string;
  resourceId: string;
  resourceName: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: '1',
    timestamp: '2024-01-15T14:32:15',
    user: { id: '1', name: 'Anna Andersson', email: 'anna@siteflow.se' },
    action: 'user.login',
    category: 'auth',
    resourceType: 'session',
    resourceId: 'sess_abc123',
    resourceName: 'Web Session',
    details: { method: 'password', mfa: false },
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome/120.0.0.0',
    status: 'success'
  },
  {
    id: '2',
    timestamp: '2024-01-15T14:28:42',
    user: { id: '2', name: 'Erik Eriksson', email: 'erik@siteflow.se' },
    action: 'project.create',
    category: 'project',
    resourceType: 'project',
    resourceId: 'proj_xyz789',
    resourceName: 'Webbplats Redesign',
    details: { companyId: 'comp_123', budget: 150000 },
    ipAddress: '192.168.1.101',
    userAgent: 'Firefox/121.0',
    status: 'success'
  },
  {
    id: '3',
    timestamp: '2024-01-15T14:15:30',
    user: { id: '1', name: 'Anna Andersson', email: 'anna@siteflow.se' },
    action: 'api_key.create',
    category: 'api',
    resourceType: 'api_key',
    resourceId: 'key_def456',
    resourceName: 'Production API Key',
    details: { scopes: ['projects:read', 'tickets:write'], expiresAt: null },
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome/120.0.0.0',
    status: 'success'
  },
  {
    id: '4',
    timestamp: '2024-01-15T13:45:00',
    user: { id: '3', name: 'Maria Svensson', email: 'maria@company.se' },
    action: 'user.login_failed',
    category: 'auth',
    resourceType: 'session',
    resourceId: '',
    resourceName: 'Login Attempt',
    details: { reason: 'invalid_password', attempts: 3 },
    ipAddress: '203.0.113.50',
    userAgent: 'Safari/17.2',
    status: 'failure'
  },
  {
    id: '5',
    timestamp: '2024-01-15T13:30:22',
    user: { id: '2', name: 'Erik Eriksson', email: 'erik@siteflow.se' },
    action: 'ticket.update',
    category: 'ticket',
    resourceType: 'ticket',
    resourceId: 'tick_ghi012',
    resourceName: 'Bugg: Login fungerar inte',
    details: { field: 'status', oldValue: 'open', newValue: 'in_progress' },
    ipAddress: '192.168.1.101',
    userAgent: 'Firefox/121.0',
    status: 'success'
  },
  {
    id: '6',
    timestamp: '2024-01-15T12:20:10',
    user: { id: '1', name: 'Anna Andersson', email: 'anna@siteflow.se' },
    action: 'document.delete',
    category: 'document',
    resourceType: 'document',
    resourceId: 'doc_jkl345',
    resourceName: 'gamla_specifikationer.pdf',
    details: { size: 2456000, type: 'application/pdf' },
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome/120.0.0.0',
    status: 'success'
  },
  {
    id: '7',
    timestamp: '2024-01-15T11:45:33',
    user: { id: '4', name: 'System', email: 'system@siteflow.se' },
    action: 'api_key.expired',
    category: 'api',
    resourceType: 'api_key',
    resourceId: 'key_old123',
    resourceName: 'Legacy Integration Key',
    details: { expired_at: '2024-01-15T00:00:00' },
    ipAddress: 'system',
    userAgent: 'Siteflow/1.0',
    status: 'warning'
  },
  {
    id: '8',
    timestamp: '2024-01-15T10:30:00',
    user: { id: '1', name: 'Anna Andersson', email: 'anna@siteflow.se' },
    action: 'user.invite',
    category: 'user',
    resourceType: 'user',
    resourceId: 'user_new789',
    resourceName: 'johan@company.se',
    details: { role: 'customer', companyId: 'comp_123' },
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome/120.0.0.0',
    status: 'success'
  },
  {
    id: '9',
    timestamp: '2024-01-15T09:15:45',
    user: { id: '2', name: 'Erik Eriksson', email: 'erik@siteflow.se' },
    action: 'settings.update',
    category: 'settings',
    resourceType: 'settings',
    resourceId: 'org_settings',
    resourceName: 'Organisationsinställningar',
    details: { field: 'notifications.email', oldValue: true, newValue: false },
    ipAddress: '192.168.1.101',
    userAgent: 'Firefox/121.0',
    status: 'success'
  },
  {
    id: '10',
    timestamp: '2024-01-14T16:20:00',
    user: { id: '1', name: 'Anna Andersson', email: 'anna@siteflow.se' },
    action: 'company.create',
    category: 'company',
    resourceType: 'company',
    resourceId: 'comp_456',
    resourceName: 'Nya Företaget AB',
    details: { industry: 'tech', employees: 50 },
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome/120.0.0.0',
    status: 'success'
  }
];

const categories = [
  { id: 'all', label: 'Alla', icon: <History className="w-4 h-4" /> },
  { id: 'auth', label: 'Autentisering', icon: <LogIn className="w-4 h-4" /> },
  { id: 'user', label: 'Användare', icon: <User className="w-4 h-4" /> },
  { id: 'project', label: 'Projekt', icon: <FolderKanban className="w-4 h-4" /> },
  { id: 'ticket', label: 'Ärenden', icon: <Ticket className="w-4 h-4" /> },
  { id: 'document', label: 'Dokument', icon: <FileText className="w-4 h-4" /> },
  { id: 'settings', label: 'Inställningar', icon: <Settings className="w-4 h-4" /> },
  { id: 'api', label: 'API', icon: <Key className="w-4 h-4" /> },
  { id: 'company', label: 'Företag', icon: <Building className="w-4 h-4" /> }
];

const AuditLogPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>(mockAuditEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const canViewAuditLog = user && isAdmin(user.role);

  if (!canViewAuditLog) {
    return (
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon={<Shield className="w-12 h-12 text-slate-300 dark:text-slate-600" />}
            title="Åtkomst nekad"
            description="Du har inte behörighet att visa granskningsloggen"
          />
        </CardContent>
      </Card>
    );
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.resourceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success('Data uppdaterad');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Simulate CSV export
      const csvContent = filteredEvents.map(e =>
        `${e.timestamp},${e.user.email},${e.action},${e.resourceName},${e.status}`
      ).join('\n');

      const blob = new Blob([`Timestamp,User,Action,Resource,Status\n${csvContent}`], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      toast.success('Export klar', { description: 'Granskningsloggen har exporterats till CSV' });
    } catch {
      toast.error('Export misslyckades');
    } finally {
      setIsExporting(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <LogIn className="w-4 h-4" />;
    if (action.includes('logout')) return <LogOut className="w-4 h-4" />;
    if (action.includes('create')) return <Plus className="w-4 h-4" />;
    if (action.includes('update')) return <Edit className="w-4 h-4" />;
    if (action.includes('delete')) return <Trash2 className="w-4 h-4" />;
    if (action.includes('view')) return <Eye className="w-4 h-4" />;
    if (action.includes('invite')) return <Users className="w-4 h-4" />;
    if (action.includes('expired')) return <AlertTriangle className="w-4 h-4" />;
    return <History className="w-4 h-4" />;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'user.login': 'Loggade in',
      'user.logout': 'Loggade ut',
      'user.login_failed': 'Misslyckad inloggning',
      'user.invite': 'Bjöd in användare',
      'project.create': 'Skapade projekt',
      'project.update': 'Uppdaterade projekt',
      'project.delete': 'Raderade projekt',
      'ticket.create': 'Skapade ärende',
      'ticket.update': 'Uppdaterade ärende',
      'ticket.delete': 'Raderade ärende',
      'document.upload': 'Laddade upp dokument',
      'document.delete': 'Raderade dokument',
      'api_key.create': 'Skapade API-nyckel',
      'api_key.revoke': 'Återkallade API-nyckel',
      'api_key.expired': 'API-nyckel utgången',
      'settings.update': 'Uppdaterade inställningar',
      'company.create': 'Skapade företag',
      'company.update': 'Uppdaterade företag'
    };
    return labels[action] || action;
  };

  const getStatusBadge = (status: AuditEvent['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Lyckades
          </Badge>
        );
      case 'failure':
        return (
          <Badge variant="error" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            Misslyckades
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            Varning
          </Badge>
        );
    }
  };

  const getCategoryIcon = (category: AuditEvent['category']) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || <History className="w-4 h-4" />;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('sv-SE'),
      time: date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just nu';
    if (minutes < 60) return `${minutes} min sedan`;
    if (hours < 24) return `${hours} tim sedan`;
    if (days < 7) return `${days} dag${days > 1 ? 'ar' : ''} sedan`;
    return date.toLocaleDateString('sv-SE');
  };

  // Stats
  const todayEvents = events.filter(e =>
    new Date(e.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const failedEvents = events.filter(e => e.status === 'failure').length;
  const apiEvents = events.filter(e => e.category === 'api').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Granskningslogg
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Spåra och granska alla aktiviteter i systemet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Uppdatera
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporterar...' : 'Exportera'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{events.length}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Totala händelser</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{todayEvents}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Idag</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{failedEvents}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Misslyckade</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{apiEvents}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">API-händelser</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Sök användare, åtgärd, resurs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      {cat.icon}
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla statusar</SelectItem>
                <SelectItem value="success">Lyckades</SelectItem>
                <SelectItem value="failure">Misslyckades</SelectItem>
                <SelectItem value="warning">Varning</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Senaste 24h</SelectItem>
                <SelectItem value="7">Senaste 7 dagar</SelectItem>
                <SelectItem value="30">Senaste 30 dagar</SelectItem>
                <SelectItem value="90">Senaste 90 dagar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} className="h-20" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Inga händelser hittades
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Prova att ändra dina filter
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredEvents.map((event) => {
                const { date, time, relative } = formatTimestamp(event.timestamp);
                const isExpanded = expandedEvent === event.id;

                return (
                  <div
                    key={event.id}
                    className={`transition-colors ${
                      event.status === 'failure'
                        ? 'bg-red-50/50 dark:bg-red-900/10'
                        : event.status === 'warning'
                        ? 'bg-yellow-50/50 dark:bg-yellow-900/10'
                        : ''
                    }`}
                  >
                    <button
                      onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${
                          event.status === 'failure'
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : event.status === 'warning'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          {getActionIcon(event.action)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {getActionLabel(event.action)}
                            </span>
                            {getStatusBadge(event.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Avatar
                              name={event.user.name}
                              size="xs"
                              className="w-5 h-5"
                            />
                            <span>{event.user.name}</span>
                            <span className="text-slate-400 dark:text-slate-500">•</span>
                            <span>{event.resourceName}</span>
                          </div>
                        </div>

                        {/* Timestamp & Expand */}
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {relative}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {date} {time}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="ml-14 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500 dark:text-slate-400">Användare</p>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {event.user.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 dark:text-slate-400">IP-adress</p>
                              <p className="font-medium text-slate-900 dark:text-slate-100 font-mono">
                                {event.ipAddress}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 dark:text-slate-400">Webbläsare</p>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {event.userAgent}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 dark:text-slate-400">Resurs-ID</p>
                              <p className="font-medium text-slate-900 dark:text-slate-100 font-mono text-xs">
                                {event.resourceId || '-'}
                              </p>
                            </div>
                          </div>

                          {Object.keys(event.details).length > 0 && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Detaljer</p>
                                <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded overflow-x-auto font-mono">
                                  {JSON.stringify(event.details, null, 2)}
                                </pre>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        {filteredEvents.length > 0 && (
          <CardFooter className="border-t border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Visar {filteredEvents.length} av {events.length} händelser
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default AuditLogPage;
