import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock } from 'lucide-react';
import ProjectTimeline from './timeline/ProjectTimeline';
import ProjectMeetings from './meetings/ProjectMeetings';

interface ProjectOverviewProps {
  projectId: string;
  canEdit?: boolean;
  className?: string;
}

type Tab = 'timeline' | 'meetings';

const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  projectId,
  canEdit = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('timeline');

  const tabs = [
    {
      id: 'timeline' as Tab,
      label: t('projectOverview.timeline', 'Tidslinje'),
      icon: Calendar,
    },
    {
      id: 'meetings' as Tab,
      label: t('projectOverview.meetings', 'Möten'),
      icon: Clock,
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary-500 text-primary-700 font-medium'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'timeline' && (
          <ProjectTimeline projectId={projectId} canEdit={canEdit} />
        )}
        {activeTab === 'meetings' && (
          <ProjectMeetings projectId={projectId} canEdit={canEdit} />
        )}
      </div>
    </div>
  );
};

export default ProjectOverview;
