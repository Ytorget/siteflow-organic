import React from 'react';
import { FileQuestion, Inbox, Search, Users, FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ActionObject {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode | ActionObject;
  variant?: 'default' | 'search' | 'inbox' | 'users' | 'folder' | 'error' | 'success';
  className?: string;
}

// Helper to check if action is an object with label/onClick
const isActionObject = (action: any): action is ActionObject => {
  return action && typeof action === 'object' && 'label' in action && 'onClick' in action;
};

const iconMap = {
  default: FileQuestion,
  search: Search,
  inbox: Inbox,
  users: Users,
  folder: FolderOpen,
  error: AlertCircle,
  success: CheckCircle2,
};

const EmptyState = ({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = '',
}: EmptyStateProps) => {
  const IconComponent = iconMap[variant];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
        {icon || <IconComponent className="h-8 w-8 text-slate-400 dark:text-slate-500" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && (
        <div>
          {isActionObject(action) ? (
            <button
              onClick={action.onClick}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {action.label}
            </button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
};

const EmptyStateSearch = ({ query, onClear }: { query?: string; onClear?: () => void }) => (
  <EmptyState
    variant="search"
    title="Inga resultat hittades"
    description={query ? `Vi kunde inte hitta några resultat för "${query}". Prova att söka efter något annat.` : 'Prova att söka efter något annat.'}
    action={
      onClear && (
        <button
          onClick={onClear}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Rensa sökning
        </button>
      )
    }
  />
);

interface EmptyStateInboxProps {
  title?: string;
  description?: string;
  action?: React.ReactNode | ActionObject;
}

const EmptyStateInbox = ({
  title = "Inget här ännu",
  description = "Det finns inget innehåll att visa just nu.",
  action
}: EmptyStateInboxProps) => (
  <EmptyState
    variant="inbox"
    title={title}
    description={description}
    action={action}
  />
);

interface EmptyStateUsersProps {
  title?: string;
  description?: string;
  action?: React.ReactNode | ActionObject;
}

const EmptyStateUsers = ({
  title = "Inga användare",
  description = "Det finns inga användare att visa. Bjud in ditt team för att komma igång.",
  action
}: EmptyStateUsersProps) => (
  <EmptyState
    variant="users"
    title={title}
    description={description}
    action={action}
  />
);

interface EmptyStateFolderProps {
  title?: string;
  description?: string;
  action?: React.ReactNode | ActionObject;
}

const EmptyStateFolder = ({
  title = "Mappen är tom",
  description = "Det finns inga filer i denna mapp.",
  action
}: EmptyStateFolderProps) => (
  <EmptyState
    variant="folder"
    title={title}
    description={description}
    action={action}
  />
);

const EmptyStateError = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    variant="error"
    title="Något gick fel"
    description="Vi kunde inte ladda innehållet. Försök igen."
    action={
      onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Försök igen
        </button>
      )
    }
  />
);

export { EmptyState, EmptyStateSearch, EmptyStateInbox, EmptyStateUsers, EmptyStateFolder, EmptyStateError };
