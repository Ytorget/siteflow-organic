import React, { useState } from 'react';
import {
  FolderKanban,
  Ticket,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatsCard from './StatsCard';
import { useAuth } from '../../src/context/AuthContext';
import { useProjects, useTickets } from '../../src/hooks/useApi';
import Modal from '../shared/Modal';
import CreateTicketForm from '../forms/CreateTicketForm';
import ProjectSelector from '../shared/ProjectSelector';
import ProjectOverview from '../ProjectOverview';

const CustomerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Use RPC hooks for data fetching - filter by company
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects(
    user?.companyId ? { companyId: user.companyId } : undefined
  );
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError } = useTickets();

  const loading = projectsLoading || ticketsLoading;
  const error = projectsError || ticketsError;

  // Filter tickets to only show those from company's projects
  const projectIds = projects.map((p: any) => p.id);
  const companyTickets = tickets.filter((t: any) => projectIds.includes(t.projectId));

  const activeProjects = projects.filter((p: any) => p.state === 'in_progress').length;
  const openTickets = companyTickets.filter((t: any) => t.state === 'open' || t.state === 'in_progress').length;
  const criticalTickets = companyTickets.filter((t: any) => t.priority === 'critical' || t.priority === 'high').length;
  const recentTickets = companyTickets.slice(0, 5);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-amber-100 text-amber-700';
      case 'in_review': return 'bg-purple-100 text-purple-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-amber-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-slate-500';
      default: return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error instanceof Error ? error.message : 'Failed to load dashboard data'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t('dashboard.welcome')}</h2>
            <p className="text-blue-100 mt-1">{t('dashboard.welcomeSubtitle')}</p>
          </div>
          <button
            onClick={() => setIsCreateTicketModalOpen(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nytt ärende
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('dashboard.stats.activeProjects')}
          value={activeProjects}
          icon={<FolderKanban className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title={t('dashboard.stats.openTickets')}
          value={openTickets}
          icon={<Ticket className="w-5 h-5" />}
          color="amber"
        />
        <StatsCard
          title={t('dashboard.stats.criticalIssues')}
          value={criticalTickets}
          icon={<AlertCircle className="w-5 h-5" />}
          color="purple"
        />
        <StatsCard
          title={t('dashboard.stats.thisMonth')}
          value="0h"
          icon={<Clock className="w-5 h-5" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">{t('dashboard.recentTickets')}</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t('dashboard.viewAll')}
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTickets.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Ticket className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>{t('dashboard.noTickets')}</p>
              </div>
            ) : (
              recentTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{ticket.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStateColor(ticket.state)}`}>
                          {ticket.state.replace('_', ' ')}
                        </span>
                        {ticket.priority && (
                          <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Projects Overview */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">{t('dashboard.projectsOverview')}</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t('dashboard.viewAll')}
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {projects.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <FolderKanban className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>{t('dashboard.noProjects')}</p>
              </div>
            ) : (
              projects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-medium">
                        {project.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{project.name}</p>
                        <p className="text-sm text-slate-500 capitalize">{project.state.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.state === 'in_progress' ? (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          {t('dashboard.active')}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400 capitalize">{project.state.replace('_', ' ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Project Selector and Overview */}
      {projects.length > 0 ? (
        <div className="space-y-4">
          {/* Project Selector */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              {t('projectOverview.title', 'Projektöversikt')}
            </h3>
            <ProjectSelector
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              className="max-w-md"
            />
          </div>

          {/* Project Overview with Timeline and Meetings */}
          {selectedProjectId ? (
            <ProjectOverview
              projectId={selectedProjectId}
              canEdit={false}
            />
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
              <FolderKanban className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>{t('projectOverview.noSelection', 'Välj ett projekt för att se tidslinje och möten')}</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        title="Skapa nytt ärende"
        size="lg"
      >
        <CreateTicketForm
          onSuccess={() => setIsCreateTicketModalOpen(false)}
          onCancel={() => setIsCreateTicketModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default CustomerDashboard;
