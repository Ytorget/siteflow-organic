import React, { useState } from 'react';
import {
  Users,
  FolderKanban,
  Ticket,
  Building,
  AlertCircle,
  TrendingUp,
  UserPlus,
  Phone,
  Mail,
  ArrowUpRight,
  CheckCircle2,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCompanies, useProjects, useTickets } from '../../src/hooks/useApi';

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
import { EmptyState, EmptyStateUsers, EmptyStateFolder } from '../../src/components/ui/empty-state';
import { StatCard } from '../../src/components/ui/charts';
import { Avatar } from '../../src/components/ui/avatar';
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

const KAMDashboard: React.FC = () => {
  const { t } = useTranslation();

  // Use RPC hooks for data fetching
  const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useCompanies();
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError } = useTickets();

  const loading = companiesLoading || projectsLoading || ticketsLoading;
  const error = companiesError || projectsError || ticketsError;

  const activeProjects = projects.filter((p: any) => p.state === 'in_progress').length;
  const pendingApproval = projects.filter((p: any) => p.state === 'pending_approval').length;
  const openTickets = tickets.filter((t: any) => t.state === 'open' || t.state === 'in_progress').length;
  const criticalTickets = tickets.filter((t: any) => t.priority === 'critical' || t.priority === 'high').length;

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
        {error instanceof Error ? error.message : 'Kunde inte ladda KAM-data'}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* KAM Header */}
      <Card className="bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-700 dark:to-cyan-600 border-none text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">Key Account Manager Dashboard</h2>
              <p className="text-teal-100 mt-1">Hantera dina kunder och deras projekt</p>
            </div>
            <Button
              variant="outline"
              onClick={() => toast.info('Funktionen kommer snart')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Bjud in kund
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mina kunder"
          value={companies.length}
          icon={<Building className="w-5 h-5" />}
          change="Totalt antal"
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
          title="Väntar på godkännande"
          value={pendingApproval}
          icon={<AlertCircle className="w-5 h-5" />}
          change={pendingApproval > 0 ? 'Behöver åtgärd' : 'Inga väntande'}
          changeType={pendingApproval > 0 ? 'decrease' : 'increase'}
        />
        <StatCard
          title="Kritiska ärenden"
          value={criticalTickets}
          icon={<Ticket className="w-5 h-5" />}
          change={criticalTickets > 0 ? 'Kräver uppmärksamhet' : 'Allt lugnt'}
          changeType={criticalTickets > 0 ? 'decrease' : 'increase'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Mina kunder</CardTitle>
            <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400">
              Visa alla
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {companies.length === 0 ? (
                <EmptyStateUsers
                  title="Inga kunder tilldelade"
                  description="Du har inga kunder tilldelade ännu"
                />
              ) : (
                companies.slice(0, 5).map((company: any) => (
                  <div key={company.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-4 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={company.name}
                          size="md"
                          className="bg-gradient-to-br from-teal-500 to-cyan-400"
                        />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{company.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {projects.filter((p: any) => p.companyId === company.id).length} projekt
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tooltip content="Ring">
                          <Button variant="ghost" size="sm">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Skicka e-post">
                          <Button variant="ghost" size="sm">
                            <Mail className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects Needing Attention */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Projekt som behöver uppmärksamhet</CardTitle>
            <CardDescription>Projekt som väntar på godkännande eller har kritiska ärenden</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {pendingApproval === 0 && criticalTickets === 0 ? (
                <div className="py-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-3">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">Alla projekt ser bra ut!</p>
                </div>
              ) : (
                <>
                  {projects.filter((p: any) => p.state === 'pending_approval').slice(0, 5).map((project: any) => (
                    <div key={project.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-4 px-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{project.name}</p>
                          <Badge variant="warning" className="mt-1">Väntar på godkännande</Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          Granska
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Senaste ärendena</CardTitle>
          <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400">
            Visa alla ärenden
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {tickets.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                <Ticket className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p>Inga ärenden ännu</p>
              </div>
            ) : (
              tickets.slice(0, 5).map((ticket: any) => (
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
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KAMDashboard;
