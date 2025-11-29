import React from 'react';
import { X } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  removable?: boolean;
  onRemove?: () => void;
  dot?: boolean;
  icon?: React.ReactNode;
}

const variantClasses = {
  default: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
  secondary: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  outline: 'border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300',
};

const dotColors = {
  default: 'bg-white dark:bg-slate-900',
  secondary: 'bg-slate-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  outline: 'bg-slate-500',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  removable = false,
  onRemove,
  dot = false,
  icon,
}: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 -mr-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

// Status badge with predefined styles
interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  // General statuses
  active: { label: 'Aktiv', variant: 'success' },
  inactive: { label: 'Inaktiv', variant: 'secondary' },
  pending: { label: 'Väntande', variant: 'warning' },
  completed: { label: 'Slutförd', variant: 'success' },
  cancelled: { label: 'Avbruten', variant: 'error' },
  draft: { label: 'Utkast', variant: 'secondary' },
  // Project statuses
  planning: { label: 'Planering', variant: 'info' },
  in_progress: { label: 'Pågående', variant: 'warning' },
  on_hold: { label: 'Pausad', variant: 'secondary' },
  // Ticket statuses
  open: { label: 'Öppen', variant: 'info' },
  in_review: { label: 'Granskning', variant: 'warning' },
  resolved: { label: 'Löst', variant: 'success' },
  closed: { label: 'Stängd', variant: 'secondary' },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  // Guard against undefined/null status
  if (!status) {
    return (
      <Badge variant="secondary" dot className={className}>
        Okänd
      </Badge>
    );
  }
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
};

// Priority badge
interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  low: { label: 'Låg', variant: 'secondary' },
  medium: { label: 'Medium', variant: 'info' },
  high: { label: 'Hög', variant: 'warning' },
  critical: { label: 'Kritisk', variant: 'error' },
  urgent: { label: 'Brådskande', variant: 'error' },
};

const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  // Guard against undefined/null priority
  if (!priority) {
    return (
      <Badge variant="secondary" className={className}>
        -
      </Badge>
    );
  }
  const config = priorityConfig[priority] || { label: priority, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export { Badge, StatusBadge, PriorityBadge };
