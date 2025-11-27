import React, { useState } from 'react';
import { Calendar, CheckCircle, Circle, Clock, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import {
  useMilestonesByProject,
  useCreateMilestone,
  useUpdateMilestone,
  useMarkMilestoneCompleted,
  useReopenMilestone,
  useDeleteMilestone,
} from '../../src/hooks/useApi';

interface ProjectTimelineProps {
  projectId: string;
  canEdit?: boolean;
}

interface MilestoneFormData {
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId, canEdit = false }) => {
  const { data: milestones, isLoading, error } = useMilestonesByProject(projectId);
  const createMutation = useCreateMilestone();
  const updateMutation = useUpdateMilestone();
  const markCompletedMutation = useMarkMilestoneCompleted();
  const reopenMutation = useReopenMilestone();
  const deleteMutation = useDeleteMilestone();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any | null>(null);
  const [formData, setFormData] = useState<MilestoneFormData>({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending',
  });

  const handleCreate = async () => {
    if (!formData.title) {
      alert('Titel är obligatorisk');
      return;
    }

    try {
      await createMutation.mutateAsync({
        projectId,
        title: formData.title,
        description: formData.description || undefined,
        dueDate: formData.dueDate || undefined,
        status: formData.status,
        orderIndex: (milestones?.length || 0),
      });
      setShowCreateModal(false);
      setFormData({ title: '', description: '', dueDate: '', status: 'pending' });
    } catch (err) {
      console.error('Failed to create milestone:', err);
      alert('Misslyckades att skapa milstolpe');
    }
  };

  const handleUpdate = async () => {
    if (!editingMilestone || !formData.title) {
      alert('Titel är obligatorisk');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingMilestone.id,
        projectId,
        title: formData.title,
        description: formData.description || undefined,
        dueDate: formData.dueDate || undefined,
        status: formData.status,
      });
      setEditingMilestone(null);
      setFormData({ title: '', description: '', dueDate: '', status: 'pending' });
    } catch (err) {
      console.error('Failed to update milestone:', err);
      alert('Misslyckades att uppdatera milstolpe');
    }
  };

  const handleToggleComplete = async (milestone: any) => {
    try {
      if (milestone.status === 'completed') {
        await reopenMutation.mutateAsync({
          id: milestone.id,
          projectId,
        });
      } else {
        await markCompletedMutation.mutateAsync({
          id: milestone.id,
          projectId,
        });
      }
    } catch (err) {
      console.error('Failed to toggle milestone status:', err);
      alert('Misslyckades att ändra status');
    }
  };

  const handleDelete = async (milestoneId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna milstolpe?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({
        id: milestoneId,
        projectId,
      });
    } catch (err) {
      console.error('Failed to delete milestone:', err);
      alert('Misslyckades att ta bort milstolpe');
    }
  };

  const startEdit = (milestone: any) => {
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description || '',
      dueDate: milestone.dueDate || '',
      status: milestone.status,
    });
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { label: 'Väntande', icon: Circle, color: 'text-slate-500', bg: 'bg-slate-100' },
      in_progress: { label: 'Pågående', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
      completed: { label: 'Klar', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getProgressPercentage = () => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter((m: any) => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error.message || 'Ett fel uppstod vid laddning av milstolpar'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  const sortedMilestones = milestones ? [...milestones].sort((a: any, b: any) => a.orderIndex - b.orderIndex) : [];
  const progress = getProgressPercentage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif text-slate-900 mb-2">Projektmilstolpar</h3>
          <p className="text-slate-600">Följ projektutvecklingen och viktiga milstolpar</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ny milstolpe</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {sortedMilestones.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Projektframsteg</span>
            <span className="text-sm font-semibold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Timeline */}
      {sortedMilestones.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Inga milstolpar skapade än</p>
          {canEdit && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Skapa första milstolpen
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedMilestones.map((milestone: any, index: number) => {
            const statusInfo = getStatusInfo(milestone.status);
            const StatusIcon = statusInfo.icon;
            const isOverdue =
              milestone.dueDate &&
              !milestone.completedAt &&
              new Date(milestone.dueDate) < new Date();

            return (
              <div
                key={milestone.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className={`${statusInfo.bg} p-3 rounded-full`}>
                      <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                    </div>
                    {index < sortedMilestones.length - 1 && (
                      <div className="w-0.5 h-12 bg-slate-200 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-1">{milestone.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <span className={`px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color} text-xs font-medium`}>
                            {statusInfo.label}
                          </span>
                          {milestone.dueDate && (
                            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              Deadline: {new Date(milestone.dueDate).toLocaleDateString('sv-SE')}
                            </span>
                          )}
                          {milestone.completedAt && (
                            <span className="text-green-600">
                              Klar: {new Date(milestone.completedAt).toLocaleDateString('sv-SE')}
                            </span>
                          )}
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleComplete(milestone)}
                            disabled={markCompletedMutation.isPending || reopenMutation.isPending}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title={milestone.status === 'completed' ? 'Återöppna' : 'Markera som klar'}
                          >
                            {milestone.status === 'completed' ? <RefreshCw className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => startEdit(milestone)}
                            className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Redigera"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(milestone.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Ta bort"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {milestone.description && (
                      <p className="text-slate-600 text-sm mt-2">{milestone.description}</p>
                    )}

                    {isOverdue && (
                      <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        Försenad milstolpe
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingMilestone) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-serif text-slate-900">
                {editingMilestone ? 'Redigera milstolpe' : 'Skapa ny milstolpe'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Titel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="t.ex. Design godkänd"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Beskrivning</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Valfri beskrivning av milstolpen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'pending' | 'in_progress' | 'completed' })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="pending">Väntande</option>
                  <option value="in_progress">Pågående</option>
                  <option value="completed">Klar</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingMilestone(null);
                  setFormData({ title: '', description: '', dueDate: '', status: 'pending' });
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={editingMilestone ? handleUpdate : handleCreate}
                disabled={createMutation.isPending || updateMutation.isPending || !formData.title}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Sparar...'
                  : editingMilestone
                  ? 'Uppdatera'
                  : 'Skapa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTimeline;
