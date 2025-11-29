import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Ticket,
  Clock,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Building,
  MessageSquare,
  Brain,
  Sparkles,
  FileCheck,
  ClipboardList,
  FolderOpen,
  Search,
  Home,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  Puzzle,
  Key,
  History,
  BarChart3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Page } from '../types';
import { User, UserRole, isSiteflowStaff, canLogTime, canViewAllCustomers, canManageCompanies, getRoleDisplayName } from '../utils/roleHelpers';
import { ThemeToggle } from '../src/components/ui/theme-toggle';
import { NotificationCenter, useNotifications } from '../src/components/ui/notification-center';
import { CommandPalette, useCommandPalette, CommandItem } from '../src/components/ui/command-palette';
import { Tooltip } from '../src/components/ui/tooltip';
import { Avatar } from '../src/components/ui/avatar';
import { Badge } from '../src/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../src/components/ui/dropdown-menu';
import { Breadcrumb, BreadcrumbItem } from '../src/components/ui/breadcrumb';
import { cn } from '../src/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface NavItemType {
  id: string;
  label: string;
  icon: React.ReactNode;
  page?: Page;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentPage,
  onNavigate,
  onLogout
}) => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const { isOpen: commandPaletteOpen, setIsOpen: setCommandPaletteOpen } = useCommandPalette();
  const { addNotification } = useNotifications();

  // Save sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;
  const userRole: UserRole = user?.role || 'customer';

  // Define all possible navigation items
  const allNavItems: NavItemType[] = [
    { id: 'dashboard', label: t('dashboard.nav.overview'), icon: <LayoutDashboard className="w-5 h-5" />, page: 'dashboard' },
    { id: 'projects', label: t('dashboard.nav.projects'), icon: <FolderKanban className="w-5 h-5" />, page: 'dashboardProjects' },
    { id: 'tickets', label: t('dashboard.nav.tickets'), icon: <Ticket className="w-5 h-5" />, page: 'dashboardTickets' },
    { id: 'timeEntries', label: t('dashboard.nav.timeEntries'), icon: <Clock className="w-5 h-5" />, page: 'dashboardTimeEntries' },
    { id: 'documents', label: t('dashboard.nav.documents'), icon: <FileText className="w-5 h-5" />, page: 'dashboardDocuments' },
    { id: 'team', label: t('dashboard.nav.team'), icon: <Users className="w-5 h-5" />, page: 'dashboardTeam' },
    { id: 'companies', label: t('dashboard.nav.companies'), icon: <Building className="w-5 h-5" />, page: 'dashboardCompanies' },
    { id: 'aiChat', label: t('dashboard.nav.aiChat'), icon: <MessageSquare className="w-5 h-5" />, page: 'dashboardAIChat' },
    { id: 'knowledge', label: t('dashboard.nav.knowledge'), icon: <Brain className="w-5 h-5" />, page: 'dashboardKnowledge' },
    { id: 'aiDocs', label: t('dashboard.nav.aiDocs'), icon: <Sparkles className="w-5 h-5" />, page: 'dashboardAIDocs' },
    { id: 'productPlans', label: t('dashboard.nav.productPlans'), icon: <FileCheck className="w-5 h-5" />, page: 'dashboardProductPlans' },
    { id: 'formResponses', label: t('dashboard.nav.formResponses'), icon: <ClipboardList className="w-5 h-5" />, page: 'dashboardFormResponses' },
    { id: 'fileBrowser', label: t('dashboard.nav.fileBrowser'), icon: <FolderOpen className="w-5 h-5" />, page: 'dashboardFileBrowser' },
    { id: 'analytics', label: t('dashboard.nav.analytics', 'Analys'), icon: <BarChart3 className="w-5 h-5" />, page: 'dashboardAnalytics' },
    { id: 'integrations', label: t('dashboard.nav.integrations', 'Integrationer'), icon: <Puzzle className="w-5 h-5" />, page: 'dashboardIntegrations' },
    { id: 'apiPortal', label: t('dashboard.nav.apiPortal', 'API & Utvecklare'), icon: <Key className="w-5 h-5" />, page: 'dashboardApiPortal' },
    { id: 'auditLog', label: t('dashboard.nav.auditLog', 'Granskningslogg'), icon: <History className="w-5 h-5" />, page: 'dashboardAuditLog' },
    { id: 'settings', label: t('dashboard.nav.settings', 'Inställningar'), icon: <Settings className="w-5 h-5" />, page: 'dashboardSettings' },
  ];

  // Filter navigation items based on user role
  const navItems: NavItemType[] = allNavItems.filter((item) => {
    // Everyone sees overview, projects, tickets, and documents
    if (['dashboard', 'projects', 'tickets', 'documents'].includes(item.id)) {
      return true;
    }

    // Time entries only for Siteflow staff (developers, PLs, KAMs, admins)
    if (item.id === 'timeEntries') {
      return canLogTime(userRole);
    }

    // Team management for admins, KAMs (to see their customers), and PLs
    if (item.id === 'team') {
      return isSiteflowStaff(userRole);
    }

    // Companies only for admins
    if (item.id === 'companies') {
      return canManageCompanies(userRole);
    }

    // AI Chat available for everyone (project context)
    if (item.id === 'aiChat') {
      return true;
    }

    // Knowledge management for Siteflow staff
    if (item.id === 'knowledge') {
      return isSiteflowStaff(userRole);
    }

    // AI Generated Docs for Siteflow staff
    if (item.id === 'aiDocs') {
      return isSiteflowStaff(userRole);
    }

    // Product Plans - everyone can see their plans
    if (item.id === 'productPlans') {
      return true;
    }

    // Form Responses - admin only
    if (item.id === 'formResponses') {
      return canManageCompanies(userRole);
    }

    // File Browser - admin only
    if (item.id === 'fileBrowser') {
      return canManageCompanies(userRole);
    }

    // Analytics - for admins, KAMs, and PLs
    if (item.id === 'analytics') {
      return isSiteflowStaff(userRole);
    }

    // Integrations - for admins and KAMs
    if (item.id === 'integrations') {
      return canManageCompanies(userRole) || userRole === 'kam';
    }

    // API Portal - for admins and KAMs
    if (item.id === 'apiPortal') {
      return canManageCompanies(userRole) || userRole === 'kam';
    }

    // Audit Log - admin only
    if (item.id === 'auditLog') {
      return canManageCompanies(userRole);
    }

    // Settings - everyone can access their own settings
    if (item.id === 'settings') {
      return true;
    }

    return false;
  });

  const handleNavClick = (item: NavItemType) => {
    if (item.page) {
      onNavigate(item.page);
    }
    setSidebarOpen(false);
  };

  // Command palette items
  const commandItems: CommandItem[] = [
    ...navItems.map(item => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      onSelect: () => item.page && onNavigate(item.page),
      keywords: [item.id, item.label.toLowerCase()],
    })),
    {
      id: 'home',
      label: 'Gå till startsidan',
      icon: <Home className="w-4 h-4" />,
      onSelect: () => onNavigate('home'),
      keywords: ['hem', 'start', 'home'],
    },
    {
      id: 'logout',
      label: 'Logga ut',
      icon: <LogOut className="w-4 h-4" />,
      onSelect: onLogout,
      keywords: ['logout', 'logga ut', 'avsluta'],
    },
  ];

  // Breadcrumb items based on current page
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '#', onClick: () => onNavigate('dashboard') }
    ];

    const currentNav = navItems.find(item => item.page === currentPage);
    if (currentNav && currentPage !== 'dashboard') {
      breadcrumbs.push({ label: currentNav.label });
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Command Palette */}
      <CommandPalette
        items={commandItems}
        isOpen={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        placeholder="Sök efter sidor, kommandon..."
      />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-slate-900 dark:bg-slate-950 transform transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-16" : "w-64",
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        "lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 group focus:outline-none overflow-hidden"
          >
            <img
              src="/logos/siteflow-logo/site flow.svg"
              alt="Siteflow logo"
              width="32"
              height="32"
              className="h-8 w-auto flex-shrink-0"
            />
            {!sidebarCollapsed && (
              <span className="text-xl font-serif font-semibold text-white whitespace-nowrap">
                Siteflow
              </span>
            )}
          </button>
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn("p-2 space-y-1", sidebarCollapsed && "px-2")}>
          {navItems.map((item) => (
            <Tooltip key={item.id} content={sidebarCollapsed ? item.label : ''} side="right">
              <button
                onClick={() => handleNavClick(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  sidebarCollapsed && "justify-center px-2",
                  currentPage === item.page
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            </Tooltip>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-slate-800 space-y-1">
          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            {sidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            {!sidebarCollapsed && <span>Minimera</span>}
          </button>
          <Tooltip content={sidebarCollapsed ? t('dashboard.nav.settings', 'Inställningar') : ''} side="right">
            <button
              onClick={() => onNavigate('dashboardSettings')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                currentPage === 'dashboardSettings'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              <Settings className="w-5 h-5" />
              {!sidebarCollapsed && <span>{t('dashboard.nav.settings', 'Inställningar')}</span>}
            </button>
          </Tooltip>
          <Tooltip content={sidebarCollapsed ? t('dashboard.nav.logout') : ''} side="right">
            <button
              onClick={onLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-colors",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span>{t('dashboard.nav.logout')}</span>}
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-16" : "lg:pl-64")}>
        {/* Top header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs - hidden on mobile */}
            <div className="hidden lg:block">
              <Breadcrumb items={getBreadcrumbs()} />
            </div>
          </div>

          {/* Center - Search/Command Palette trigger */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Sök...</span>
              <kbd className="ml-auto text-xs bg-white dark:bg-slate-600 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-500">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notification Center */}
            <NotificationCenter />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Avatar
                    src={user?.avatar}
                    name={`${user?.first_name || ''} ${user?.last_name || ''}`}
                    size="sm"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.role ? getRoleDisplayName(user.role) : ''}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="w-4 h-4 mr-2" />
                  {t('dashboard.nav.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  {t('dashboard.nav.settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('dashboard.nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
