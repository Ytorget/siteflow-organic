import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Loader2,
  BookOpen,
  MessageSquare,
  Lightbulb,
  FileText,
  Code2,
  Palette,
  MoreHorizontal,
  Trash2,
  Calendar,
  User,
} from 'lucide-react';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  raw_input: string;
  category:
    | 'meeting_notes'
    | 'decision'
    | 'clarification'
    | 'feedback'
    | 'technical'
    | 'design'
    | 'other';
  metadata: {
    people?: string[];
    dates?: string[];
    decisions?: string[];
    action_items?: string[];
    features?: string[];
    tags?: string[];
  };
  created_by_id: string;
  inserted_at: string;
  updated_at: string;
}

interface KnowledgeManagerProps {
  projectId: string;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  meeting_notes: MessageSquare,
  decision: Lightbulb,
  clarification: BookOpen,
  feedback: MessageSquare,
  technical: Code2,
  design: Palette,
  other: FileText,
};

const CATEGORY_COLORS: Record<string, string> = {
  meeting_notes: 'bg-blue-100 text-blue-700',
  decision: 'bg-yellow-100 text-yellow-700',
  clarification: 'bg-purple-100 text-purple-700',
  feedback: 'bg-green-100 text-green-700',
  technical: 'bg-slate-100 text-slate-700',
  design: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
};

const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({ projectId }) => {
  const { t } = useTranslation();
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [skipAI, setSkipAI] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load knowledge on mount
  React.useEffect(() => {
    loadKnowledge();
  }, [projectId, selectedCategory]);

  const loadKnowledge = async () => {
    setIsLoading(true);
    try {
      const url = selectedCategory
        ? `/api/rag/projects/${projectId}/knowledge?category=${selectedCategory}`
        : `/api/rag/projects/${projectId}/knowledge`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKnowledge(data.knowledge || []);
      }
    } catch (error) {
      console.error('Failed to load knowledge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKnowledge = async () => {
    if (!content.trim()) return;

    setIsAdding(true);
    try {
      const payload: any = { content };
      if (title.trim()) payload.title = title;
      if (category) payload.category = category;
      if (skipAI) payload.skip_ai = true;

      const response = await fetch(`/api/rag/projects/${projectId}/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setKnowledge((prev) => [data.entry, ...prev]);
        // Reset form
        setTitle('');
        setContent('');
        setCategory('other');
        setSkipAI(false);
        setShowAddForm(false);
      } else {
        alert('Failed to add knowledge');
      }
    } catch (error) {
      console.error('Failed to add knowledge:', error);
      alert('Failed to add knowledge');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm(t('rag.knowledge.confirmDelete'))) return;

    try {
      const response = await fetch(
        `/api/rag/projects/${projectId}/knowledge/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        setKnowledge((prev) => prev.filter((k) => k.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete knowledge:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const Icon = CATEGORY_ICONS[category] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {t('rag.knowledge.title')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('rag.knowledge.description')}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('rag.knowledge.addNew')}
        </button>
      </div>

      {/* Add Knowledge Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {t('rag.knowledge.addNewEntry')}
          </h3>

          <div className="space-y-4">
            {/* Title (optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('rag.knowledge.titleOptional')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('rag.knowledge.titlePlaceholder')}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('rag.knowledge.content')} *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('rag.knowledge.contentPlaceholder')}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('rag.knowledge.category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="meeting_notes">
                  {t('rag.knowledge.categories.meeting_notes')}
                </option>
                <option value="decision">
                  {t('rag.knowledge.categories.decision')}
                </option>
                <option value="clarification">
                  {t('rag.knowledge.categories.clarification')}
                </option>
                <option value="feedback">
                  {t('rag.knowledge.categories.feedback')}
                </option>
                <option value="technical">
                  {t('rag.knowledge.categories.technical')}
                </option>
                <option value="design">
                  {t('rag.knowledge.categories.design')}
                </option>
                <option value="other">{t('rag.knowledge.categories.other')}</option>
              </select>
            </div>

            {/* Skip AI checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="skip-ai"
                checked={skipAI}
                onChange={(e) => setSkipAI(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="skip-ai" className="text-sm text-slate-700">
                {t('rag.knowledge.skipAI')}
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddKnowledge}
                disabled={!content.trim() || isAdding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('rag.knowledge.adding')}
                  </>
                ) : (
                  t('rag.knowledge.add')
                )}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {t('rag.knowledge.allCategories')}
        </button>
        {Object.keys(CATEGORY_ICONS).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              selectedCategory === cat
                ? getCategoryColor(cat)
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {getCategoryIcon(cat)}
            {t(`rag.knowledge.categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* Knowledge List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : knowledge.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-2">{t('rag.knowledge.noEntries')}</p>
          <p className="text-sm text-slate-400">
            {t('rag.knowledge.noEntriesHint')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {knowledge.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${getCategoryColor(entry.category)}`}
                  >
                    {getCategoryIcon(entry.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {entry.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.inserted_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {entry.created_by_id.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteKnowledge(entry.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('common.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none text-slate-700 mb-3">
                <p className="whitespace-pre-wrap">{entry.content}</p>
              </div>

              {/* Metadata */}
              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {entry.metadata.people && entry.metadata.people.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-slate-600">People:</span>{' '}
                        {entry.metadata.people.join(', ')}
                      </div>
                    )}
                    {entry.metadata.features &&
                      entry.metadata.features.length > 0 && (
                        <div className="text-xs">
                          <span className="font-medium text-slate-600">
                            Features:
                          </span>{' '}
                          {entry.metadata.features.join(', ')}
                        </div>
                      )}
                    {entry.metadata.tags && entry.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.metadata.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeManager;
