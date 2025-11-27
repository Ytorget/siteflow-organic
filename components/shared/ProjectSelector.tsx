import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Folder, Loader2 } from 'lucide-react';
import { useProjects } from '../../src/hooks/useApi';

interface ProjectSelectorProps {
  value: string | null;
  onChange: (projectId: string | null) => void;
  className?: string;
}

const PROJECT_STORAGE_KEY = 'selectedProjectId';

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ value, onChange, className = '' }) => {
  const { t } = useTranslation();
  const { data: projects, isLoading, error } = useProjects();
  const [isOpen, setIsOpen] = useState(false);

  // Load saved project on mount
  useEffect(() => {
    const savedProjectId = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (savedProjectId && !value) {
      // Verify the saved project exists in the current user's projects
      if (projects && projects.some((p: any) => p.id === savedProjectId)) {
        onChange(savedProjectId);
      }
    }
  }, [projects, value, onChange]);

  // Save selected project to localStorage
  useEffect(() => {
    if (value) {
      localStorage.setItem(PROJECT_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(PROJECT_STORAGE_KEY);
    }
  }, [value]);

  const selectedProject = projects && value
    ? projects.find((p: any) => p.id === value)
    : null;

  const getStatusBadge = (state: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      draft: { label: 'Utkast', color: 'bg-slate-100 text-slate-700' },
      pending_approval: { label: 'Väntar godkännande', color: 'bg-yellow-100 text-yellow-700' },
      in_progress: { label: 'Pågående', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Slutförd', color: 'bg-green-100 text-green-700' },
      on_hold: { label: 'Pausad', color: 'bg-orange-100 text-orange-700' },
      cancelled: { label: 'Avbruten', color: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[state] || { label: state, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        {t('projectSelector.error', 'Kunde inte hämta projekt')}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-slate-600 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{t('projectSelector.loading', 'Laddar projekt...')}</span>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className={`text-slate-500 text-sm ${className}`}>
        {t('projectSelector.noProjects', 'Du har inga projekt')}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-300 rounded-lg hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Folder className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {selectedProject ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="font-medium text-slate-900 truncate">
                {selectedProject.name}
              </span>
              {getStatusBadge(selectedProject.state)}
            </div>
          ) : (
            <span className="text-slate-500">
              {t('projectSelector.placeholder', 'Välj projekt')}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
            {projects.map((project: any) => (
              <button
                key={project.id}
                onClick={() => {
                  onChange(project.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${
                  value === project.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Folder className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className={`truncate ${value === project.id ? 'font-medium text-primary-700' : 'text-slate-700'}`}>
                    {project.name}
                  </span>
                </div>
                {getStatusBadge(project.state)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectSelector;
