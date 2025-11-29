import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FolderKanban,
  Ticket,
  Clock,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  PieChart,
  Activity,
  Eye,
  FileText
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import { isAdmin, isKAM, isProjectLeader } from '../../utils/roleHelpers';

// UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Progress } from '../../src/components/ui/progress';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../src/components/ui/select';
import { toast } from '../../src/components/ui/toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src/components/ui/tabs';
import { Separator } from '../../src/components/ui/separator';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description: string;
}

interface ProjectMetric {
  id: string;
  name: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'delayed';
  dueDate: string;
  teamSize: number;
}

interface TicketMetric {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

const AnalyticsDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canViewAnalytics = user && (isAdmin(user.role) || isKAM(user.role) || isProjectLeader(user.role));

  // Mock data
  const metrics: MetricCard[] = [
    {
      title: 'Aktiva projekt',
      value: '24',
      change: 12,
      changeType: 'increase',
      trend: 'up',
      icon: <FolderKanban className="w-5 h-5" />,
      description: 'vs förra månaden'
    },
    {
      title: 'Öppna ärenden',
      value: '156',
      change: -8,
      changeType: 'decrease',
      trend: 'down',
      icon: <Ticket className="w-5 h-5" />,
      description: 'vs förra veckan'
    },
    {
      title: 'Aktiva användare',
      value: '1,248',
      change: 23,
      changeType: 'increase',
      trend: 'up',
      icon: <Users className="w-5 h-5" />,
      description: 'vs förra månaden'
    },
    {
      title: 'Genomsn. svarstid',
      value: '2.4h',
      change: -15,
      changeType: 'decrease',
      trend: 'up',
      icon: <Clock className="w-5 h-5" />,
      description: 'Förbättring'
    }
  ];

  const projectMetrics: ProjectMetric[] = [
    { id: '1', name: 'Webbplats Redesign', progress: 75, status: 'on_track', dueDate: '2024-02-15', teamSize: 5 },
    { id: '2', name: 'Mobilapp v2.0', progress: 45, status: 'at_risk', dueDate: '2024-01-30', teamSize: 8 },
    { id: '3', name: 'API Integration', progress: 90, status: 'on_track', dueDate: '2024-01-20', teamSize: 3 },
    { id: '4', name: 'E-handel uppgradering', progress: 20, status: 'delayed', dueDate: '2024-01-25', teamSize: 6 },
    { id: '5', name: 'CRM Implementation', progress: 60, status: 'on_track', dueDate: '2024-03-01', teamSize: 4 }
  ];

  const ticketsByCategory: TicketMetric[] = [
    { category: 'Buggrapporter', count: 45, percentage: 29, color: 'bg-red-500' },
    { category: 'Funktionsförfrågningar', count: 38, percentage: 24, color: 'bg-blue-500' },
    { category: 'Support', count: 52, percentage: 33, color: 'bg-green-500' },
    { category: 'Övrigt', count: 21, percentage: 14, color: 'bg-purple-500' }
  ];

  const ticketTrend = [
    { month: 'Aug', created: 45, resolved: 42 },
    { month: 'Sep', created: 52, resolved: 48 },
    { month: 'Okt', created: 38, resolved: 45 },
    { month: 'Nov', created: 65, resolved: 58 },
    { month: 'Dec', created: 48, resolved: 52 },
    { month: 'Jan', created: 42, resolved: 40 }
  ];

  const topPerformers = [
    { name: 'Anna Andersson', role: 'Developer', tickets: 45, satisfaction: 98 },
    { name: 'Erik Eriksson', role: 'Project Lead', tickets: 38, satisfaction: 96 },
    { name: 'Maria Svensson', role: 'Support', tickets: 62, satisfaction: 94 },
    { name: 'Johan Johansson', role: 'Developer', tickets: 35, satisfaction: 97 }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success('Data uppdaterad');
  };

  const handleExport = () => {
    toast.success('Export påbörjad', { description: 'Rapporten kommer att laddas ner inom kort' });
  };

  const getStatusBadge = (status: ProjectMetric['status']) => {
    switch (status) {
      case 'on_track':
        return <Badge variant="success">I tid</Badge>;
      case 'at_risk':
        return <Badge variant="warning">Risk</Badge>;
      case 'delayed':
        return <Badge variant="error">Försenad</Badge>;
    }
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data }: { data: typeof ticketTrend }) => {
    const maxValue = Math.max(...data.flatMap(d => [d.created, d.resolved]));

    return (
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-1 h-40 w-full">
              <div
                className="flex-1 bg-blue-500 rounded-t transition-all"
                style={{ height: `${(item.created / maxValue) * 100}%` }}
                title={`Skapade: ${item.created}`}
              />
              <div
                className="flex-1 bg-green-500 rounded-t transition-all"
                style={{ height: `${(item.resolved / maxValue) * 100}%` }}
                title={`Lösta: ${item.resolved}`}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{item.month}</span>
          </div>
        ))}
      </div>
    );
  };

  if (!canViewAnalytics) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Åtkomst nekad
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Du har inte behörighet att visa analysdashboarden
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Analys & Rapporter
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Översikt över prestanda och trender
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Senaste 7 dagar</SelectItem>
              <SelectItem value="30">Senaste 30 dagar</SelectItem>
              <SelectItem value="90">Senaste 90 dagar</SelectItem>
              <SelectItem value="365">Senaste året</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Uppdatera
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportera
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${
                  metric.trend === 'up' ? 'bg-green-100 dark:bg-green-900/30' :
                  metric.trend === 'down' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-slate-100 dark:bg-slate-800'
                }`}>
                  <div className={
                    metric.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                    metric.trend === 'down' ? 'text-blue-600 dark:text-blue-400' :
                    'text-slate-600 dark:text-slate-400'
                  }>
                    {metric.icon}
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.changeType === 'increase' && metric.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                  metric.changeType === 'decrease' && metric.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                  metric.changeType === 'increase' && metric.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {metric.changeType === 'increase' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {metric.value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {metric.title}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {metric.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Översikt
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FolderKanban className="w-4 h-4 mr-2" />
            Projekt
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <Ticket className="w-4 h-4 mr-2" />
            Ärenden
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="w-4 h-4 mr-2" />
            Team
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Ärendetrender
                </CardTitle>
                <CardDescription>
                  Skapade vs lösta ärenden per månad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={ticketTrend} />
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Skapade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Lösta</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Ärenden per kategori
                </CardTitle>
                <CardDescription>
                  Fördelning av ärenden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticketsByCategory.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {item.category}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full transition-all`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Snabbstatistik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Slutförda projekt</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">18</p>
                    <p className="text-xs text-slate-500">denna månad</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">SLA uppfyllt</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">94%</p>
                    <p className="text-xs text-slate-500">av ärenden</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Sidvisningar</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">12.4k</p>
                    <p className="text-xs text-slate-500">denna vecka</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Nya dokument</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">89</p>
                    <p className="text-xs text-slate-500">denna månad</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Toppresterare
                </CardTitle>
                <CardDescription>
                  Teammedlemmar med bäst resultat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((person, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {person.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{person.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{person.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{person.tickets} ärenden</p>
                        <p className="text-xs text-green-600 dark:text-green-400">{person.satisfaction}% nöjdhet</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projektöversikt</CardTitle>
              <CardDescription>
                Status och progress för aktiva projekt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectMetrics.map((project) => (
                  <div key={project.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          {project.name}
                        </h4>
                        {getStatusBadge(project.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{project.teamSize}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(project.dueDate).toLocaleDateString('sv-SE')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={project.progress}
                        className={`flex-1 ${
                          project.status === 'on_track' ? '' :
                          project.status === 'at_risk' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-12">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resolution Time */}
            <Card>
              <CardHeader>
                <CardTitle>Genomsnittlig lösningstid</CardTitle>
                <CardDescription>Tid från skapande till lösning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Kritiska ärenden</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">1.2 timmar</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Höga ärenden</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">4.5 timmar</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Medel ärenden</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">12.3 timmar</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Låga ärenden</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">24.1 timmar</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SLA Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>SLA-efterlevnad</CardTitle>
                <CardDescription>Ärenden lösta inom SLA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-slate-100 dark:text-slate-800"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={`${94 * 3.52} 352`}
                        className="text-green-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">94%</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                    147 av 156 ärenden inom SLA
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Teamaktivitet</CardTitle>
              <CardDescription>Översikt över teamets prestanda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Teammedlem
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Roll
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Ärenden hanterade
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Genomsn. tid
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Nöjdhet
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((person, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {person.name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {person.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {person.role}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-slate-100">
                          {person.tickets}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                          2.{idx + 1}h
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="success">{person.satisfaction}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboardPage;
