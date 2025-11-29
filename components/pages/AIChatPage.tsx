import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import ProjectSelector from '../shared/ProjectSelector';
import RAGChatPanel from '../rag/RAGChatPanel';
import { useProjects } from '../../src/hooks/useApi';

// UI Components
import {
  Card,
  CardContent
} from '../../src/components/ui/card';
import { EmptyState } from '../../src/components/ui/empty-state';

const AIChatPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { data: projects } = useProjects();

  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.nav.aiChat')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Ställ frågor om ditt projekt och få hjälp av vår AI-assistent
          </p>
        </div>
        <div className="w-full sm:w-64">
          <ProjectSelector
            value={selectedProjectId}
            onChange={setSelectedProjectId}
          />
        </div>
      </div>

      {selectedProjectId ? (
        <Card className="h-[600px] overflow-hidden">
          <RAGChatPanel
            projectId={selectedProjectId}
            projectName={selectedProject?.name}
          />
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={<MessageSquare className="w-12 h-12" />}
              title="Välj ett projekt"
              description="Välj ett projekt ovan för att börja chatta med AI-assistenten"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIChatPage;
