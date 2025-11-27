import React, { useState } from 'react';
import {
  FolderKanban,
  Ticket,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatsCard from './StatsCard';
import {
  useProjects,
  useTickets,
  useTimeEntries,
  useApproveProject,
  useRejectProject,
  useApproveTicket,
  useRequestChangesTicket
} from '../../src/hooks/useApi';
import Modal from '../shared/Modal';
import CreateProjectForm from '../forms/CreateProjectForm';
import CreateTicketForm from '../forms/CreateTicketForm';
import ProjectSelector from '../shared/ProjectSelector';
import ProjectOverview from '../ProjectOverview';

const ProjectLeaderDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Use RPC hooks for data fetching
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError } = useTickets();
  const { data: timeEntries = [], isLoading: timeEntriesLoading, error: timeEntriesError } = useTimeEntries();

  // Use mutation hooks for state transitions
  const approveProject = useApproveProject();
  const rejectProject = useRejectProject();
  const approveTicket = useApproveTicket();
  const requestChangesTicket = useRequestChangesTicket();

  const loading = projectsLoading || ticketsLoading || timeEntriesLoading;
  const error = projectsError || ticketsError || timeEntriesError;

  const activeProjects = projects.filter((p: any) => p.state === 'in_progress').length;
  const pendingApproval = projects.filter((p: any) => p.state === 'pending_approval').length;
  const openTickets = tickets.filter((t: any) => t.state === 'open' || t.state === 'in_progress').length;
  const inReviewTickets = tickets.filter((t: any) => t.state === 'in_review').length;

  // Calculate total hours this month
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const hoursThisMonth = timeEntries
    .filter((te: any) => new Date(te.date) >= monthStart)
    .reduce((sum: number, te: any) => sum + (te.hours || 0), 0);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'pending_approval': return 'bg-amber-100 text-amber-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'on_hold': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
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
      {/* PL Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Project Leader Dashboard</h2>
            <p className="text-indigo-100 mt-1">Överblick av alla projekt och team</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreateTicketModalOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Ticket className="w-4 h-4" />
              Nytt ärende
            </button>
            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <FolderKanban className="w-4 h-4" />
              Nytt projekt
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Aktiva projekt"
          value={activeProjects}
          icon={<FolderKanban className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Väntar på godkännande"
          value={pendingApproval}
          icon={<AlertCircle className="w-5 h-5" />}
          color="amber"
        />
        <StatsCard
          title="Ärenden för granskning"
          value={inReviewTickets}
          icon={<Ticket className="w-5 h-5" />}
          color="purple"
        />
        <StatsCard
          title="Teamtimmar denna månad"
          value={`${hoursThisMonth.toFixed(0)}h`}
          icon={<Clock className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* Projects needing approval */}
      {pendingApproval > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-800 mb-3">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">{pendingApproval} projekt väntar på godkännande</span>
          </div>
          <div className="space-y-2">
            {projects.filter(p => p.state === 'pending_approval').map((project) => (
              <div key={project.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <span className="font-medium text-slate-900">{project.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => rejectProject.mutate({ primaryKey: project.id })}
                    disabled={rejectProject.isPending}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {rejectProject.isPending ? 'Avvisar...' : 'Avvisa'}
                  </button>
                  <button
                    onClick={() => approveProject.mutate(project.id)}
                    disabled={approveProject.isPending}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    {approveProject.isPending ? 'Godkänner...' : 'Godkänn'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Projects */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Alla projekt</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Visa alla
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {projects.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <FolderKanban className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Inga projekt</p>
              </div>
            ) : (
              projects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center text-white font-medium">
                        {project.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{project.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStateColor(project.state)}`}>
                            {project.state.replace('_', ' ')}
                          </span>
                          {project.targetEndDate && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(project.targetEndDate).toLocaleDateString('sv-SE')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {project.budget && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {((project.spent || 0) / project.budget * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-slate-500">av budget</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tickets for Review */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Ärenden för granskning</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {tickets.filter(t => t.state === 'in_review').length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p>Inga ärenden väntar på granskning</p>
              </div>
            ) : (
              tickets
                .filter(t => t.state === 'in_review')
                .slice(0, 5)
                .map((ticket) => (
                  <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{ticket.title}</p>
                        {ticket.priority && (
                          <span className={`text-xs font-medium ${
                            ticket.priority === 'critical' ? 'text-red-600' :
                            ticket.priority === 'high' ? 'text-amber-600' :
                            'text-slate-500'
                          }`}>
                            {ticket.priority}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => requestChangesTicket.mutate({ primaryKey: ticket.id })}
                          disabled={requestChangesTicket.isPending}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          {requestChangesTicket.isPending ? 'Begär...' : 'Ändringar'}
                        </button>
                        <button
                          onClick={() => approveTicket.mutate(ticket.id)}
                          disabled={approveTicket.isPending}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          {approveTicket.isPending ? 'Godkänner...' : 'Godkänn'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Team Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {tickets.filter(t => t.state === 'resolved').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Lösta ärenden</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {projects.filter(p => p.state === 'completed').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Avslutade projekt</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{openTickets}</p>
              <p className="text-xs text-slate-500 mt-1">Öppna ärenden</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{hoursThisMonth.toFixed(0)}h</p>
              <p className="text-xs text-slate-500 mt-1">Timmar loggade</p>
            </div>
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
              canEdit={true}
            />
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
              <FolderKanban className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>{t('projectOverview.noSelection', 'Välj ett projekt för att se tidslinje och möten')}</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        title="Skapa nytt projekt"
        size="lg"
      >
        <CreateProjectForm
          onSuccess={() => setIsCreateProjectModalOpen(false)}
          onCancel={() => setIsCreateProjectModalOpen(false)}
        />
      </Modal>

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

export default ProjectLeaderDashboard;
