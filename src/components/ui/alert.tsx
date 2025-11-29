import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

const variantStyles: Record<AlertVariant, { container: string; icon: typeof Info }> = {
  default: {
    container: 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200',
    icon: Info,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    icon: Info,
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    icon: CheckCircle,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    icon: AlertTriangle,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    icon: AlertCircle,
  },
};

const Alert = ({
  variant = 'default',
  title,
  children,
  className = '',
  dismissible = false,
  onDismiss,
  icon,
}: AlertProps) => {
  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  return (
    <div
      className={`relative flex gap-3 rounded-lg border p-4 ${styles.container} ${className}`}
      role="alert"
    >
      <div className="shrink-0">
        {icon || <IconComponent className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        {title && <h5 className="mb-1 font-medium">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100"
          aria-label="Stäng"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Inline alert (smaller, for use within forms etc.)
interface InlineAlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const InlineAlert = ({ variant = 'default', children, className = '' }: InlineAlertProps) => {
  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <IconComponent className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
};

export { Alert, InlineAlert };
