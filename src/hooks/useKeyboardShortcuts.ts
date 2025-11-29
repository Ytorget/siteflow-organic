import { useEffect, useCallback, useRef } from 'react';

type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta';
type KeyCombo = string; // e.g., "ctrl+k", "meta+shift+p"

interface ShortcutHandler {
  key: string;
  modifiers?: ModifierKey[];
  handler: (event: KeyboardEvent) => void;
  description?: string;
  enabled?: boolean;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  ignoreInputFields?: boolean;
}

const parseKeyCombo = (combo: string): { key: string; modifiers: ModifierKey[] } => {
  const parts = combo.toLowerCase().split('+');
  const key = parts.pop() || '';
  const modifiers = parts as ModifierKey[];
  return { key, modifiers };
};

const checkModifiers = (event: KeyboardEvent, modifiers: ModifierKey[]): boolean => {
  const hasCtrl = modifiers.includes('ctrl');
  const hasAlt = modifiers.includes('alt');
  const hasShift = modifiers.includes('shift');
  const hasMeta = modifiers.includes('meta');

  return (
    event.ctrlKey === hasCtrl &&
    event.altKey === hasAlt &&
    event.shiftKey === hasShift &&
    event.metaKey === hasMeta
  );
};

export function useKeyboardShortcuts(
  shortcuts: ShortcutHandler[] | Record<KeyCombo, (event: KeyboardEvent) => void>,
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, ignoreInputFields = true } = options;
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if focus is in an input field
      if (ignoreInputFields) {
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      const currentShortcuts = shortcutsRef.current;

      // Handle array format
      if (Array.isArray(currentShortcuts)) {
        for (const shortcut of currentShortcuts) {
          if (shortcut.enabled === false) continue;

          const keyMatches =
            event.key.toLowerCase() === shortcut.key.toLowerCase() ||
            event.code.toLowerCase() === shortcut.key.toLowerCase();

          if (keyMatches && checkModifiers(event, shortcut.modifiers || [])) {
            if (shortcut.preventDefault !== false) {
              event.preventDefault();
            }
            shortcut.handler(event);
            return;
          }
        }
      } else {
        // Handle object format (e.g., { "ctrl+k": handler })
        for (const [combo, handler] of Object.entries(currentShortcuts)) {
          const { key, modifiers } = parseKeyCombo(combo);

          const keyMatches =
            event.key.toLowerCase() === key ||
            event.code.toLowerCase() === key;

          if (keyMatches && checkModifiers(event, modifiers)) {
            event.preventDefault();
            handler(event);
            return;
          }
        }
      }
    },
    [enabled, ignoreInputFields]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Hook for single keyboard shortcut
export function useKeyboardShortcut(
  keyCombo: KeyCombo,
  handler: (event: KeyboardEvent) => void,
  options: UseKeyboardShortcutsOptions = {}
) {
  const { key, modifiers } = parseKeyCombo(keyCombo);

  useKeyboardShortcuts(
    [{ key, modifiers, handler }],
    options
  );
}

// Utility hook to show keyboard shortcuts to users
export function useKeyboardShortcutHelp(shortcuts: ShortcutHandler[]) {
  const formatShortcut = (shortcut: ShortcutHandler): string => {
    const parts: string[] = [];

    if (shortcut.modifiers?.includes('meta')) {
      parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Win');
    }
    if (shortcut.modifiers?.includes('ctrl')) {
      parts.push('Ctrl');
    }
    if (shortcut.modifiers?.includes('alt')) {
      parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
    }
    if (shortcut.modifiers?.includes('shift')) {
      parts.push('⇧');
    }

    parts.push(shortcut.key.toUpperCase());

    return parts.join('+');
  };

  return shortcuts.map((shortcut) => ({
    ...shortcut,
    formattedKey: formatShortcut(shortcut),
  }));
}
