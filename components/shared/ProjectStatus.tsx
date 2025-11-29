import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import type { Milestone, Project } from '../../src/generated/ash-rpc';

interface ProjectStatusProps {
  project: Project;
  milestones: Milestone[];
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ project, milestones }) => {
  const { t } = useTranslation();

  // Calculate progress based on completed milestones
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Find next upcoming milestone
  const upcomingMilestones = milestones
    .filter(m => m.status === 'pending' && m.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  const nextMilestone = upcomingMilestones[0];

  // Calculate days until next milestone
  const daysUntilNext = nextMilestone?.due_date
    ? Math.ceil((new Date(nextMilestone.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Calculate project duration and current phase
  const startDate = project.start_date ? new Date(project.start_date) : null;
  const endDate = project.target_end_date ? new Date(project.target_end_date) : null;
  const now = new Date();

  let weeksPassed = 0;
  let totalWeeks = 0;
  let currentPhase = 1;
  let totalPhases = 1;

  if (startDate && endDate) {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    totalWeeks = Math.ceil(totalDays / 7);
    weeksPassed = Math.min(totalWeeks, Math.ceil(daysPassed / 7));

    // Estimate phases based on milestones
    totalPhases = Math.max(1, totalMilestones);
    currentPhase = Math.min(totalPhases, completedMilestones + 1);
  }

  // Determine progress bar color
  const getProgressColor = () => {
    if (progressPercentage >= 75) return 'bg-green-500';
    if (progressPercentage >= 50) return 'bg-blue-500';
    if (progressPercentage >= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // Determine state display
  const getStateDisplay = () => {
    const stateMap: Record<string, { label: string; color: string }> = {
      draft: { label: t('project.state.draft'), color: 'text-slate-500' },
      pending_approval: { label: t('project.state.pending_approval'), color: 'text-yellow-600' },
      in_progress: { label: t('project.state.in_progress'), color: 'text-blue-600' },
      paused: { label: t('project.state.paused'), color: 'text-orange-600' },
      completed: { label: t('project.state.completed'), color: 'text-green-600' },
      cancelled: { label: t('project.state.cancelled'), color: 'text-red-600' },
    };

    return stateMap[project.state as string] || { label: project.state, color: 'text-slate-600' };
  };

  const stateDisplay = getStateDisplay();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{t('project.status.title')}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${stateDisplay.color} bg-slate-100`}>
          {stateDisplay.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">{t('project.status.progress')}</span>
          <span className="text-2xl font-bold text-slate-900">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500 ease-out rounded-full flex items-center justify-end pr-2`}
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 10 && (
              <CheckCircle className="w-3 h-3 text-white" />
            )}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>{completedMilestones} {t('project.status.of')} {totalMilestones} {t('project.status.milestones_completed')}</span>
        </div>
      </div>

      {/* Phase and Timeline Info */}
      {startDate && endDate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Phase */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">{t('project.status.current_phase')}</p>
              <p className="text-lg font-bold text-blue-700">
                {t('project.status.phase_format', { current: currentPhase, total: totalPhases })}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <Clock className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">{t('project.status.timeline')}</p>
              <p className="text-lg font-bold text-slate-900">
                {t('project.status.week_format', { current: weeksPassed, total: totalWeeks })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3">{t('project.status.next_milestone')}</h4>
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <Calendar className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{nextMilestone.title}</p>
              {nextMilestone.description && (
                <p className="text-sm text-slate-600 mt-1">{nextMilestone.description}</p>
              )}
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  {t('project.status.due')}: {new Date(nextMilestone.due_date!).toLocaleDateString('sv-SE')}
                </span>
                {daysUntilNext !== null && (
                  <span className={`text-sm font-medium ${
                    daysUntilNext < 0
                      ? 'text-red-600'
                      : daysUntilNext <= 7
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}>
                    {daysUntilNext < 0
                      ? t('project.status.overdue_by', { days: Math.abs(daysUntilNext) })
                      : daysUntilNext === 0
                      ? t('project.status.due_today')
                      : t('project.status.days_left', { days: daysUntilNext })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Milestones Message */}
      {totalMilestones === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t('project.status.no_milestones')}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectStatus;
