import React, { useState } from 'react';
import {
  Users,
  Building,
  FolderKanban,
  Ticket,
  Clock,
  AlertCircle,
  TrendingUp,
  Loader2,
  UserPlus,
  Mail,
  FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatsCard from './StatsCard';
import { useCompanies, useProjects, useTickets, useInvitations, useAllFormResponses } from '../../src/hooks/useApi';
import Modal from '../shared/Modal';
import CreateProjectForm from '../forms/CreateProjectForm';
import InviteUserForm from '../forms/InviteUserForm';
import AdminFormResponseView from '../admin/AdminFormResponseView';
import AdminFileBrowser from '../admin/AdminFileBrowser';
import ProjectSelector from '../shared/ProjectSelector';
import ProjectOverview from '../ProjectOverview';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Use RPC hooks for data fetching
  const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useCompanies();
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError } = useTickets();
  const { data: invitations = [], isLoading: invitationsLoading, error: invitationsError } = useInvitations();

  const loading = companiesLoading || projectsLoading || ticketsLoading || invitationsLoading;
  const error = companiesError || projectsError || ticketsError || invitationsError;

  const activeCompanies = companies.filter((c: any) => c.isActive).length;
  const activeProjects = projects.filter((p: any) => p.state === 'in_progress').length;
  const openTickets = tickets.filter((t: any) => t.state === 'open' || t.state === 'in_progress').length;
  const criticalTickets = tickets.filter((t: any) => t.priority === 'critical' || t.priority === 'high').length;
  const pendingInvitations = invitations.filter((i: any) => !i.acceptedAt && !i.cancelledAt).length;

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
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-slate-300 mt-1">System overview och administration</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsInviteUserModalOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Bjud in användare
            </button>
            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <FolderKanban className="w-4 h-4" />
              Nytt projekt
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Aktiva företag"
          value={activeCompanies}
          icon={<Building className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Aktiva projekt"
          value={activeProjects}
          icon={<FolderKanban className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="Öppna ärenden"
          value={openTickets}
          icon={<Ticket className="w-5 h-5" />}
          color="amber"
        />
        <StatsCard
          title="Kritiska ärenden"
          value={criticalTickets}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
        <StatsCard
          title="Väntande inbjudningar"
          value={pendingInvitations}
          icon={<Mail className="w-5 h-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Senaste företag</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Visa alla
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {companies.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Building className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Inga företag ännu</p>
              </div>
            ) : (
              companies.slice(0, 5).map((company) => (
                <div key={company.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
                        {company.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{company.name}</p>
                        <p className="text-sm text-slate-500">{company.orgNumber}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      company.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {company.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Invitations */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Väntande inbjudningar</h3>
            <button
              onClick={() => setIsInviteUserModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Bjud in ny
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {invitations.filter(i => !i.acceptedAt && !i.cancelledAt).length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Inga väntande inbjudningar</p>
              </div>
            ) : (
              invitations
                .filter(i => !i.acceptedAt && !i.cancelledAt)
                .slice(0, 5)
                .map((invitation) => {
                  const company = companies.find(c => c.id === invitation.companyId);
                  const expiresAt = new Date(invitation.expiresAt);
                  const isExpired = expiresAt < new Date();

                  return (
                    <div key={invitation.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{invitation.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-slate-500">
                              {company?.name || 'Okänt företag'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className={`text-xs ${
                              isExpired ? 'text-red-600' : 'text-slate-500'
                            }`}>
                              {isExpired ? 'Utgången' : `Utgår ${expiresAt.toLocaleDateString('sv-SE')}`}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isExpired ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          Väntande
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Projects by Status */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Projekt per status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {['draft', 'pending_approval', 'in_progress', 'on_hold', 'completed', 'cancelled'].map((state) => (
              <div key={state} className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">
                  {projects.filter(p => p.state === state).length}
                </p>
                <p className="text-xs text-slate-500 mt-1 capitalize">{state.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Responses - Admin view */}
      <AdminFormResponseView />

      {/* File Browser - Admin view */}
      <AdminFileBrowser />

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

      {/* Invite User Modal */}
      <Modal
        isOpen={isInviteUserModalOpen}
        onClose={() => setIsInviteUserModalOpen(false)}
        title="Bjud in användare"
        size="md"
      >
        <InviteUserForm
          onSuccess={() => setIsInviteUserModalOpen(false)}
          onCancel={() => setIsInviteUserModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;
