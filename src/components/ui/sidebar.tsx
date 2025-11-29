import React, { useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggleCollapse = useCallback(() => setIsCollapsed((prev) => !prev), []);

  return (
    <SidebarContext.Provider
      value={{ isOpen, isCollapsed, toggle, open, close, toggleCollapse }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

// Sidebar trigger button
interface SidebarTriggerProps {
  className?: string;
}

export const SidebarTrigger = ({ className = '' }: SidebarTriggerProps) => {
  const { toggle, isOpen } = useSidebar();

  return (
    <button
      onClick={toggle}
      className={`rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300 lg:hidden ${className}`}
      aria-label={isOpen ? 'Stäng meny' : 'Öppna meny'}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
};

// Sidebar collapse toggle
interface SidebarCollapseToggleProps {
  className?: string;
}

export const SidebarCollapseToggle = ({ className = '' }: SidebarCollapseToggleProps) => {
  const { toggleCollapse, isCollapsed } = useSidebar();

  return (
    <button
      onClick={toggleCollapse}
      className={`hidden rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300 lg:block ${className}`}
      aria-label={isCollapsed ? 'Expandera sidofält' : 'Minimera sidofält'}
    >
      {isCollapsed ? (
        <ChevronRight className="h-5 w-5" />
      ) : (
        <ChevronLeft className="h-5 w-5" />
      )}
    </button>
  );
};

// Main sidebar component
interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export const Sidebar = ({ children, className = '' }: SidebarProps) => {
  const { isOpen, isCollapsed } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => {
            const context = useContext(SidebarContext);
            context?.close();
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-700 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} w-64 ${className}`}
      >
        {children}
      </aside>
    </>
  );
};

// Sidebar header
interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

export const SidebarHeader = ({ children, className = '' }: SidebarHeaderProps) => {
  return (
    <div
      className={`flex h-16 shrink-0 items-center border-b border-slate-200 px-4 dark:border-slate-700 ${className}`}
    >
      {children}
    </div>
  );
};

// Sidebar content
interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

export const SidebarContent = ({ children, className = '' }: SidebarContentProps) => {
  return (
    <div className={`flex-1 overflow-y-auto py-4 ${className}`}>{children}</div>
  );
};

// Sidebar footer
interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

export const SidebarFooter = ({ children, className = '' }: SidebarFooterProps) => {
  return (
    <div
      className={`shrink-0 border-t border-slate-200 p-4 dark:border-slate-700 ${className}`}
    >
      {children}
    </div>
  );
};

// Sidebar group
interface SidebarGroupProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

export const SidebarGroup = ({ children, label, className = '' }: SidebarGroupProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className={`px-3 ${className}`}>
      {label && !isCollapsed && (
        <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </h3>
      )}
      <nav className="space-y-1">{children}</nav>
    </div>
  );
};

// Sidebar item
interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export const SidebarItem = ({
  icon,
  label,
  active = false,
  badge,
  onClick,
  className = '',
}: SidebarItemProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
      } ${isCollapsed ? 'justify-center' : ''} ${className}`}
      title={isCollapsed ? label : undefined}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!isCollapsed && <span className="flex-1 truncate text-left">{label}</span>}
      {!isCollapsed && badge !== undefined && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            active
              ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

// Main content wrapper that accounts for sidebar
interface SidebarInsetProps {
  children: ReactNode;
  className?: string;
}

export const SidebarInset = ({ children, className = '' }: SidebarInsetProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={`transition-all duration-300 lg:ml-64 ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } ${className}`}
    >
      {children}
    </div>
  );
};
