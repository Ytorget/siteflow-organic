import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import ProjectSelector from '../shared/ProjectSelector';
import GeneratedDocuments from '../rag/GeneratedDocuments';

// UI Components
import {
  Card,
  CardContent
} from '../../src/components/ui/card';
import { EmptyState } from '../../src/components/ui/empty-state';

const AIDocsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.nav.aiDocs')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-genererade dokument för projektet
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
        <GeneratedDocuments projectId={selectedProjectId} />
      ) : (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={<Sparkles className="w-12 h-12" />}
              title="Välj ett projekt"
              description="Välj ett projekt ovan för att se AI-genererade dokument"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIDocsPage;
