import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Ticket, Upload, X, File } from 'lucide-react';
import { useCreateTicket, useProjects } from '../../src/hooks/useApi';
import { useAuth } from '../../src/context/AuthContext';
import RichTextEditor from '../shared/RichTextEditor';

interface CreateTicketFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultProjectId?: string;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onSuccess, onCancel, defaultProjectId }) => {
  const { t } = useTranslation();
  const createTicket = useCreateTicket();
  const { data: projects = [] } = useProjects();
  const { getAuthHeaders } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: defaultProjectId || '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: 'task' as 'bug' | 'feature' | 'support' | 'question' | 'task',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Ärendetitel krävs');
      return;
    }

    if (!formData.projectId) {
      setError('Projekt måste väljas');
      return;
    }

    try {
      // Create ticket first
      const ticket = await createTicket.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        projectId: formData.projectId,
        priority: formData.priority,
        category: formData.category,
      });

      // Upload files if any
      if (selectedFiles.length > 0 && ticket.id) {
        setIsUploading(true);

        for (const file of selectedFiles) {
          const uploadData = new FormData();
          uploadData.append('file', file);
          uploadData.append('project_id', formData.projectId);
          uploadData.append('ticket_id', ticket.id);
          uploadData.append('category', 'other');
          uploadData.append('name', file.name);

          await fetch('/api/documents/upload', {
            method: 'POST',
            headers: {
              ...getAuthHeaders(),
            },
            body: uploadData,
          });
        }

        setIsUploading(false);
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte skapa ärende');
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check file size (max 50MB per file)
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        setError(`Filen "${file.name}" är för stor. Max storlek är 50MB.`);
        return;
      }
    }

    setSelectedFiles((prev) => [...prev, ...files]);
    setError(null);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const priorityOptions = [
    { value: 'low', label: 'Låg', color: 'text-slate-600' },
    { value: 'medium', label: 'Medel', color: 'text-blue-600' },
    { value: 'high', label: 'Hög', color: 'text-amber-600' },
    { value: 'critical', label: 'Kritisk', color: 'text-red-600' },
  ];

  const categoryOptions = [
    { value: 'task', label: 'Uppgift', icon: '📋' },
    { value: 'bug', label: 'Bugg', icon: '🐛' },
    { value: 'feature', label: 'Funktion', icon: '✨' },
    { value: 'support', label: 'Support', icon: '💬' },
    { value: 'question', label: 'Fråga', icon: '❓' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Ticket Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
          Titel <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="T.ex. Fixa login-bugg"
          required
        />
      </div>

      {/* Project Selection */}
      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-slate-700 mb-2">
          Projekt <span className="text-red-500">*</span>
        </label>
        <select
          id="projectId"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Välj projekt</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Beskrivning
        </label>
        <RichTextEditor
          content={formData.description}
          onChange={(content) => setFormData((prev) => ({ ...prev, description: content }))}
          placeholder="Beskriv ärendet i detalj..."
          disabled={createTicket.isPending || isUploading}
        />
      </div>

      {/* Priority and Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-2">
            Prioritet
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
            Kategori
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* File Attachments */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Bifoga filer (screenshots, dokument)
        </label>

        {/* File Input */}
        <label className="block cursor-pointer">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
            disabled={createTicket.isPending || isUploading}
          />
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm text-slate-600">Klicka för att välja filer</p>
            <p className="text-xs text-slate-500 mt-1">Max 50MB per fil</p>
          </div>
        </label>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700 truncate">{file.name}</span>
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                  disabled={createTicket.isPending || isUploading}
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            disabled={createTicket.isPending}
          >
            Avbryt
          </button>
        )}
        <button
          type="submit"
          disabled={createTicket.isPending}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createTicket.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Skapar...
            </>
          ) : (
            <>
              <Ticket className="w-4 h-4" />
              Skapa ärende
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateTicketForm;
