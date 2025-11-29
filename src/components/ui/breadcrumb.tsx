import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  onHomeClick?: () => void;
  separator?: React.ReactNode;
}

const Breadcrumb = ({
  items,
  className = '',
  showHome = true,
  onHomeClick,
  separator,
}: BreadcrumbProps) => {
  const SeparatorComponent = separator || <ChevronRight className="h-4 w-4 text-slate-400" />;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center ${className}`}>
      <ol className="flex items-center space-x-2">
        {showHome && (
          <>
            <li>
              <button
                onClick={onHomeClick}
                className="flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                aria-label="Hem"
              >
                <Home className="h-4 w-4" />
              </button>
            </li>
            {items.length > 0 && (
              <li className="flex items-center">
                {SeparatorComponent}
              </li>
            )}
          </>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <li className="flex items-center">
                {item.onClick || item.href ? (
                  <button
                    onClick={item.onClick}
                    className={`flex items-center gap-1 text-sm ${
                      isLast
                        ? 'font-medium text-slate-900 dark:text-slate-100'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon}
                    <span className={isLast ? '' : 'max-w-[150px] truncate'}>{item.label}</span>
                  </button>
                ) : (
                  <span
                    className={`flex items-center gap-1 text-sm ${
                      isLast
                        ? 'font-medium text-slate-900 dark:text-slate-100'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon}
                    <span className={isLast ? '' : 'max-w-[150px] truncate'}>{item.label}</span>
                  </span>
                )}
              </li>
              {!isLast && (
                <li className="flex items-center">
                  {SeparatorComponent}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export { Breadcrumb };
export type { BreadcrumbItem };
