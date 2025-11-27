import React, { useState } from 'react';
import { FileText, Plus, Send, Eye, CheckCircle, XCircle, Clock, Archive } from 'lucide-react';
import {
  useProductPlansByProject,
  useCreateProductPlan,
  useSendProductPlanToCustomer,
  useReviseProductPlan,
  useArchiveProductPlan,
} from '../../src/hooks/useApi';

interface ProductPlanManagementProps {
  projectId: string;
}

const ProductPlanManagement: React.FC<ProductPlanManagementProps> = ({ projectId }) => {
  const { data: productPlans, isLoading } = useProductPlansByProject(projectId);
  const createMutation = useCreateProductPlan();
  const sendMutation = useSendProductPlanToCustomer();
  const reviseMutation = useReviseProductPlan();
  const archiveMutation = useArchiveProductPlan();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        projectId,
        title,
        content: content || undefined,
        pdfUrl: pdfUrl || undefined,
      });
      setShowCreateModal(false);
      setTitle('');
      setContent('');
      setPdfUrl('');
    } catch (err) {
      console.error('Failed to create product plan:', err);
    }
  };

  const handleSend = async (planId: string) => {
    if (confirm('Skicka produktplan till kund?')) {
      try {
        await sendMutation.mutateAsync({ id: planId, projectId });
      } catch (err) {
        console.error('Failed to send product plan:', err);
      }
    }
  };

  const handleRevise = async (planId: string) => {
    try {
      await reviseMutation.mutateAsync({
        id: planId,
        projectId,
        content: editingPlan?.content,
        pdfUrl: editingPlan?.pdfUrl,
      });
      setEditingPlan(null);
    } catch (err) {
      console.error('Failed to revise product plan:', err);
    }
  };

  const handleArchive = async (planId: string) => {
    if (confirm('Arkivera produktplan?')) {
      try {
        await archiveMutation.mutateAsync({ id: planId, projectId });
      } catch (err) {
        console.error('Failed to archive product plan:', err);
      }
    }
  };

  const getStateInfo = (state: string) => {
    const states: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
      draft: { label: 'Utkast', icon: <FileText className="w-4 h-4" />, color: 'text-slate-600' },
      sent: { label: 'Skickad', icon: <Send className="w-4 h-4" />, color: 'text-blue-600' },
      viewed: { label: 'Sedd', icon: <Eye className="w-4 h-4" />, color: 'text-cyan-600' },
      approved: { label: 'Godkänd', icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600' },
      changes_requested: { label: 'Ändringar begärda', icon: <XCircle className="w-4 h-4" />, color: 'text-orange-600' },
      revised: { label: 'Reviderad', icon: <Clock className="w-4 h-4" />, color: 'text-purple-600' },
      archived: { label: 'Arkiverad', icon: <Archive className="w-4 h-4" />, color: 'text-slate-400' },
    };
    return states[state] || states.draft;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-slate-600">Laddar produktplaner...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-slate-900">Produktplaner</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Skapa ny produktplan</span>
        </button>
      </div>

      {!productPlans || productPlans.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Inga produktplaner skapade än</p>
        </div>
      ) : (
        <div className="space-y-4">
          {productPlans.map((plan) => {
            const stateInfo = getStateInfo(plan.state as string);
            return (
              <div key={plan.id} className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{plan.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className={`flex items-center gap-1 ${stateInfo.color}`}>
                        {stateInfo.icon}
                        <span>{stateInfo.label}</span>
                      </div>
                      <span>Version {plan.version}</span>
                      {plan.sentAt && <span>Skickad: {new Date(plan.sentAt as string).toLocaleDateString('sv-SE')}</span>}
                      {plan.approvedAt && <span>Godkänd: {new Date(plan.approvedAt as string).toLocaleDateString('sv-SE')}</span>}
                    </div>
                  </div>
                </div>

                {plan.content && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{plan.content as string}</pre>
                  </div>
                )}

                {plan.pdfUrl && (
                  <div className="mb-4">
                    <a
                      href={plan.pdfUrl as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline text-sm"
                    >
                      Öppna PDF
                    </a>
                  </div>
                )}

                {(plan.changeRequests && Object.keys(plan.changeRequests as Record<string, unknown>).length > 0) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-orange-800 mb-2">Begärda ändringar:</p>
                    <pre className="text-sm text-orange-700">{JSON.stringify(plan.changeRequests, null, 2)}</pre>
                  </div>
                )}

                {plan.customerFeedback && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-green-800 mb-2">Kundfeedback:</p>
                    <p className="text-sm text-green-700">{plan.customerFeedback as string}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {plan.state === 'draft' && (
                    <button
                      onClick={() => handleSend(plan.id as string)}
                      disabled={sendMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Skicka till kund</span>
                    </button>
                  )}

                  {plan.state === 'changes_requested' && (
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Revidera</span>
                    </button>
                  )}

                  {!['archived', 'approved'].includes(plan.state as string) && (
                    <button
                      onClick={() => handleArchive(plan.id as string)}
                      disabled={archiveMutation.isPending}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Arkivera</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-serif text-slate-900">Skapa ny produktplan</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Titel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="t.ex. Produktplan för hemsideprojekt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Innehåll (Markdown)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                  placeholder="# Produktplan&#10;&#10;## Översikt&#10;...&#10;&#10;## Funktioner&#10;..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">PDF URL (valfritt)</label>
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setTitle('');
                  setContent('');
                  setPdfUrl('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleCreate}
                disabled={!title || createMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Skapar...' : 'Skapa produktplan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-serif text-slate-900">Revidera produktplan</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Innehåll (Markdown)</label>
                <textarea
                  value={editingPlan.content || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">PDF URL (valfritt)</label>
                <input
                  type="url"
                  value={editingPlan.pdfUrl || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, pdfUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={() => handleRevise(editingPlan.id)}
                disabled={reviseMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {reviseMutation.isPending ? 'Reviderar...' : 'Spara revision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPlanManagement;
