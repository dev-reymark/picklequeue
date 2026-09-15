import { useEffect } from 'react';

interface ShortcutHandlers {
  onAddPlayer?: () => void;
  onOpenHelp?: () => void;
  onEscape?: () => void;
  onToggleWaitingPool?: () => void;
}

export function useKeyboardShortcuts({
  onAddPlayer,
  onOpenHelp,
  onEscape,
  onToggleWaitingPool,
}: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Avoid firing shortcuts when user is typing inside an input or textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Escape') {
          onEscape?.();
        }
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onAddPlayer?.();
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        onToggleWaitingPool?.();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        onOpenHelp?.();
      } else if (e.key === 'Escape') {
        onEscape?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAddPlayer, onOpenHelp, onEscape, onToggleWaitingPool]);
}
