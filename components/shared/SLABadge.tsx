import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SLABadgeProps {
  type: 'response' | 'resolution';
  dueAt?: string | null;
  breached?: boolean;
  completedAt?: string | null; // first_response_at or resolved_at
  className?: string;
}

const SLABadge: React.FC<SLABadgeProps> = ({
  type,
  dueAt,
  breached = false,
  completedAt,
  className = '',
}) => {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [urgency, setUrgency] = useState<'safe' | 'warning' | 'critical' | 'breached'>('safe');

  useEffect(() => {
    if (!dueAt) return;
    if (completedAt) return; // SLA already met

    const calculateTimeRemaining = () => {
      const now = new Date();
      const deadline = new Date(dueAt);
      const diff = deadline.getTime() - now.getTime();

      if (diff < 0) {
        setUrgency('breached');
        const absDiff = Math.abs(diff);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(
          hours > 0
            ? `${hours}h ${minutes}m ${t('sla.overdue')}`
            : `${minutes}m ${t('sla.overdue')}`
        );
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const totalHours = diff / (1000 * 60 * 60);

      // Set urgency based on remaining time
      if (totalHours <= 1) {
        setUrgency('critical'); // Less than 1 hour
      } else if (totalHours <= 4) {
        setUrgency('warning'); // Less than 4 hours
      } else {
        setUrgency('safe');
      }

      setTimeRemaining(
        hours > 0 ? `${hours}h ${minutes}m ${t('sla.left')}` : `${minutes}m ${t('sla.left')}`
      );
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dueAt, completedAt, t]);

  // If SLA not configured or already met
  if (!dueAt) return null;
  if (completedAt) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 ${className}`}
      >
        <CheckCircle className="w-3 h-3" />
        {t('sla.met')}
      </div>
    );
  }

  // Visual styling based on urgency
  const getStyles = () => {
    switch (urgency) {
      case 'safe':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical':
        return 'bg-orange-100 text-orange-800 border-orange-300 animate-pulse';
      case 'breached':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getIcon = () => {
    switch (urgency) {
      case 'breached':
        return <XCircle className="w-3 h-3" />;
      case 'critical':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStyles()} ${className}`}
      title={`${t(`sla.${type}`)} ${urgency === 'breached' ? t('sla.breached') : t('sla.deadline')}: ${new Date(dueAt).toLocaleString('sv-SE')}`}
    >
      {getIcon()}
      <span>
        {t(`sla.${type}_short`)}: {timeRemaining}
      </span>
    </div>
  );
};

export default SLABadge;
