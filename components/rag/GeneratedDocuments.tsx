import React, { useState } from 'react';
import { FileText, RefreshCw, Download, Eye, Sparkles } from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';

interface GeneratedDocument {
  id: string;
  type: 'project_spec' | 'technical_requirements' | 'design_brief' | 'budget_timeline';
  title: string;
  content: string;
  version: number;
  generatedAt: string;
}

interface GeneratedDocumentsProps {
  projectId: string;
}

const GeneratedDocuments: React.FC<GeneratedDocumentsProps> = ({ projectId }) => {
  const { getAuthHeaders } = useAuth();
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDocument | null>(null);

  const documentTypes = [
    { type: 'project_spec', title: 'Projektspecifikation', icon: '📋', description: 'Övergripande beskrivning av projektet' },
    { type: 'technical_requirements', title: 'Tekniska krav', icon: '⚙️', description: 'Detaljerade tekniska specifikationer' },
    { type: 'design_brief', title: 'Designbrief', icon: '🎨', description: 'Designriktlinjer och önskemål' },
    { type: 'budget_timeline', title: 'Budget & Tidslinje', icon: '💰', description: 'Kostnad och tidsplan' },
  ];

  const generateAllDocuments = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/rag/projects/${projectId}/generate-documents`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate documents');
      }

      const result = await response.json();
      console.log('Document generation started:', result);

      // Poll for documents after generation
      setTimeout(() => fetchDocuments(), 5000);
    } catch (error) {
      console.error('Error generating documents:', error);
      alert('Misslyckades att generera dokument');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateDocument = async (docType: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/rag/projects/${projectId}/documents/dummy/regenerate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ type: docType }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to regenerate document');
      }

      console.log('Document regeneration started');
      setTimeout(() => fetchDocuments(), 5000);
    } catch (error) {
      console.error('Error regenerating document:', error);
      alert('Misslyckades att regenerera dokument');
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/rag/projects/${projectId}/documents`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const result = await response.json();
      setDocuments(result.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif text-slate-900 mb-2">AI-Genererade Dokument</h3>
          <p className="text-slate-600">
            AI skapar automatiskt strukturerade dokument baserat på projektinformationen
          </p>
        </div>
        <button
          onClick={generateAllDocuments}
          disabled={isGenerating}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Genererar...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generera dokument</span>
            </>
          )}
        </button>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Laddar dokument...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentTypes.map((docType) => (
            <div
              key={docType.type}
              className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-purple-400 transition-colors"
            >
              <div className="text-4xl mb-3">{docType.icon}</div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">{docType.title}</h4>
              <p className="text-sm text-slate-600 mb-4">{docType.description}</p>
              <p className="text-xs text-slate-500">Inte genererat än</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const docTypeInfo = documentTypes.find((dt) => dt.type === doc.type);
            return (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{docTypeInfo?.icon}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visa dokument"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => regenerateDocument(doc.type)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Regenerera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">{doc.title}</h4>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Version {doc.version}</span>
                  <span>{new Date(doc.generatedAt).toLocaleDateString('sv-SE')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-serif text-slate-900">{selectedDoc.title}</h3>
                <p className="text-sm text-slate-600">Version {selectedDoc.version}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-slate max-w-none">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedDoc.content}
                </pre>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Stäng
              </button>
              <button
                onClick={() => regenerateDocument(selectedDoc.type)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Regenerera</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex gap-3">
          <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Hur fungerar det?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• AI analyserar alla formulärsvar och projektinformation</li>
              <li>• Strukturerar informationen i professionella dokument</li>
              <li>• Du kan regenerera enskilda dokument om du vill ha nya versioner</li>
              <li>• Alla dokument lagras och versionshanteras automatiskt</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedDocuments;
