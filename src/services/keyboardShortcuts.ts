import { useEffect } from 'react';

export interface ShortcutHandlers {
  onOpenSearch?: () => void;
  onGoStaff?: () => void;
  onGoPatient?: () => void;
  onGoHome?: () => void;
  onLockTerminal?: () => void;
  onToggleHelp?: () => void;
  onEscape?: () => void;
}

export const useGlobalKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea or contenteditable unless it's Escape or Ctrl+K
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === 'Escape') {
        handlers.onEscape?.();
        return;
      }

      // Ctrl+K or Cmd+K: Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlers.onOpenSearch?.();
        return;
      }

      if (isInput) return;

      // Ctrl+Shift+S: Staff Workspace
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handlers.onGoStaff?.();
        return;
      }

      // Ctrl+Shift+P: Patient Portal
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlers.onGoPatient?.();
        return;
      }

      // Ctrl+Shift+H: Home
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handlers.onGoHome?.();
        return;
      }

      // Ctrl+Shift+L: Lock Terminal
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handlers.onLockTerminal?.();
        return;
      }

      // ? for Help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        handlers.onToggleHelp?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};
