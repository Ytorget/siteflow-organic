import React, { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { Search, FileText, Settings, Users, Home, LogOut, LayoutDashboard, FolderOpen, MessageSquare, Clock, HelpCircle } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  group?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
}

const defaultItems: CommandItem[] = [
  { id: 'home', label: 'Gå till startsidan', icon: <Home className="h-4 w-4" />, group: 'Navigation', onSelect: () => {} },
  { id: 'dashboard', label: 'Öppna dashboard', icon: <LayoutDashboard className="h-4 w-4" />, shortcut: '⌘D', group: 'Navigation', onSelect: () => {} },
  { id: 'projects', label: 'Visa projekt', icon: <FolderOpen className="h-4 w-4" />, group: 'Navigation', onSelect: () => {} },
  { id: 'team', label: 'Hantera team', icon: <Users className="h-4 w-4" />, group: 'Navigation', onSelect: () => {} },
  { id: 'tickets', label: 'Öppna ärenden', icon: <MessageSquare className="h-4 w-4" />, group: 'Navigation', onSelect: () => {} },
  { id: 'time', label: 'Tidrapportering', icon: <Clock className="h-4 w-4" />, group: 'Navigation', onSelect: () => {} },
  { id: 'settings', label: 'Inställningar', icon: <Settings className="h-4 w-4" />, shortcut: '⌘,', group: 'Åtgärder', onSelect: () => {} },
  { id: 'help', label: 'Hjälp & Support', icon: <HelpCircle className="h-4 w-4" />, shortcut: '⌘?', group: 'Åtgärder', onSelect: () => {} },
  { id: 'logout', label: 'Logga ut', icon: <LogOut className="h-4 w-4" />, group: 'Åtgärder', onSelect: () => {} },
];

const CommandPalette = ({
  open,
  onOpenChange,
  items = defaultItems,
  placeholder = 'Sök efter kommandon...',
}: CommandPaletteProps) => {
  const [search, setSearch] = useState('');

  // Group items by group
  const groupedItems = items.reduce((acc, item) => {
    const group = item.group || 'Övrigt';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const handleSelect = useCallback((item: CommandItem) => {
    item.onSelect();
    onOpenChange(false);
    setSearch('');
  }, [onOpenChange]);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Kommandopalett"
      className="fixed inset-0 z-50"
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center border-b border-slate-200 px-4 dark:border-slate-700">
          <Search className="h-5 w-5 text-slate-400" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={placeholder}
            className="flex-1 bg-transparent py-4 pl-3 text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100"
          />
          <kbd className="hidden rounded bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline">
            ESC
          </kbd>
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Inga resultat hittades.
          </Command.Empty>
          {Object.entries(groupedItems).map(([group, groupItems]) => (
            <Command.Group
              key={group}
              heading={group}
              className="mb-2"
            >
              <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {group}
              </div>
              {groupItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.label}
                  onSelect={() => handleSelect(item)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-900 aria-selected:bg-slate-100 dark:text-slate-100 dark:aria-selected:bg-slate-800"
                >
                  {item.icon && (
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {item.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </div>
    </Command.Dialog>
  );
};

// Hook for keyboard shortcut to open command palette
const useCommandPalette = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { open, setOpen };
};

export { CommandPalette, useCommandPalette };
export type { CommandItem };
