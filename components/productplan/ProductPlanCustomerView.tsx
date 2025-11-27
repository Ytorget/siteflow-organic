import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, MessageSquare, Eye, Send } from 'lucide-react';
import {
  useActiveProductPlan,
  useMarkProductPlanViewed,
  useApproveProductPlan,
  useRequestProductPlanChanges,
} from '../../src/hooks/useApi';

interface ProductPlanCustomerViewProps {
  projectId: string;
}

const ProductPlanCustomerView: React.FC<ProductPlanCustomerViewProps> = ({ projectId }) => {
  const { data: productPlan, isLoading } = useActiveProductPlan(projectId);
  const markViewedMutation = useMarkProductPlanViewed();
  const approveMutation = useApproveProductPlan();
  const requestChangesMutation = useRequestProductPlanChanges();

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [changeRequests, setChangeRequests] = useState('');

  // Mark as viewed when opened
  useEffect(() => {
    if (productPlan && productPlan.state === 'sent' && !productPlan.viewedAt) {
      markViewedMutation.mutate({
        id: productPlan.id as string,
        projectId,
      });
    }
  }, [productPlan]);

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        id: productPlan!.id as string,
        projectId,
        customerFeedback: feedback || undefined,
      });
      setShowApprovalModal(false);
      setFeedback('');
    } catch (err) {
      console.error('Failed to approve product plan:', err);
    }
  };

  const handleRequestChanges = async () => {
    if (!changeRequests.trim()) {
      alert('Vänligen beskriv vilka ändringar du önskar');
      return;
    }

    try {
      await requestChangesMutation.mutateAsync({
        id: productPlan!.id as string,
        projectId,
        changeRequests: { description: changeRequests },
      });
      setShowChangesModal(false);
      setChangeRequests('');
    } catch (err) {
      console.error('Failed to request changes:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!productPlan) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Ingen produktplan tillgänglig än</h3>
        <p className="text-slate-600">Vi arbetar på att ta fram din produktplan. Du kommer få en notifiering när den är klar.</p>
      </div>
    );
  }

  const state = productPlan.state as string;
  const canInteract = ['sent', 'viewed', 'revised'].includes(state);
  const isApproved = state === 'approved';
  const hasRequestedChanges = state === 'changes_requested';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-serif text-slate-900 mb-2">{productPlan.title}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>Version {productPlan.version}</span>
              </div>
              {productPlan.sentAt && (
                <div className="flex items-center gap-1">
                  <Send className="w-4 h-4" />
                  <span>Skickad: {new Date(productPlan.sentAt as string).toLocaleDateString('sv-SE')}</span>
                </div>
              )}
              {productPlan.viewedAt && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>Öppnad: {new Date(productPlan.viewedAt as string).toLocaleDateString('sv-SE')}</span>
                </div>
              )}
            </div>
          </div>

          {isApproved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Godkänd</span>
            </div>
          )}

          {hasRequestedChanges && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Ändringar begärda</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {productPlan.content && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Innehåll</h3>
          <div className="prose prose-slate max-w-none">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
              {productPlan.content as string}
            </pre>
          </div>
        </div>
      )}

      {/* PDF */}
      {productPlan.pdfUrl && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">PDF-dokument</h3>
          <a
            href={productPlan.pdfUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Öppna PDF</span>
          </a>
        </div>
      )}

      {/* Actions */}
      {canInteract && !isApproved && !hasRequestedChanges && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Vad tycker du?</h3>
          <p className="text-slate-600 mb-6">
            Granska produktplanen noggrant. Du kan godkänna den som den är eller begära ändringar.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowApprovalModal(true)}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Godkänn produktplan</span>
            </button>
            <button
              onClick={() => setShowChangesModal(true)}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Begär ändringar</span>
            </button>
          </div>
        </div>
      )}

      {/* Approval confirmation */}
      {isApproved && productPlan.approvedAt && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Produktplan godkänd</h3>
          </div>
          <p className="text-green-700 mb-2">
            Du godkände produktplanen den {new Date(productPlan.approvedAt as string).toLocaleDateString('sv-SE')}
          </p>
          {productPlan.customerFeedback && (
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">Din feedback:</p>
              <p className="text-sm text-green-700">{productPlan.customerFeedback as string}</p>
            </div>
          )}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-serif text-slate-900">Godkänn produktplan</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600">
                Genom att godkänna produktplanen bekräftar du att den uppfyller dina förväntningar och vi kan gå vidare med projektet.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Feedback eller kommentarer (valfritt)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="T.ex. 'Ser bra ut! Ser fram emot nästa steg.'"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setFeedback('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {approveMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Godkänner...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Godkänn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Changes Modal */}
      {showChangesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-serif text-slate-900">Begär ändringar</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600">
                Beskriv vilka ändringar du önskar så reviderar vi produktplanen och skickar tillbaka den till dig.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Beskriv ändringar <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={changeRequests}
                  onChange={(e) => setChangeRequests(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="T.ex. 'Jag skulle vilja ha mer detaljer om...' eller 'Kan vi lägga till funktionen för...'"
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowChangesModal(false);
                  setChangeRequests('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={!changeRequests.trim() || requestChangesMutation.isPending}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {requestChangesMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Skickar...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Skicka begäran</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPlanCustomerView;
