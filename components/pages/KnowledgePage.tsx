import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain } from 'lucide-react';
import ProjectSelector from '../shared/ProjectSelector';
import KnowledgeManager from '../rag/KnowledgeManager';

// UI Components
import {
  Card,
  CardContent
} from '../../src/components/ui/card';
import { EmptyState } from '../../src/components/ui/empty-state';

const KnowledgePage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.nav.knowledge')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Hantera kunskapsbas för AI-assistenten
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
        <KnowledgeManager projectId={selectedProjectId} />
      ) : (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={<Brain className="w-12 h-12" />}
              title="Välj ett projekt"
              description="Välj ett projekt ovan för att hantera kunskapsbasen"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KnowledgePage;
