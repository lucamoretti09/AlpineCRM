import { useEffect, useRef } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  when?: () => boolean;
  preventDefault?: boolean;
}

const shortcutRegistry = new Map<string, ShortcutConfig>();

function getShortcutKey(config: ShortcutConfig): string {
  const parts: string[] = [];
  if (config.ctrl) parts.push('ctrl');
  if (config.shift) parts.push('shift');
  if (config.alt) parts.push('alt');
  parts.push(config.key.toLowerCase());
  return parts.join('+');
}

export function getRegisteredShortcuts(): ShortcutConfig[] {
  return Array.from(shortcutRegistry.values());
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    for (const s of shortcuts) {
      shortcutRegistry.set(getShortcutKey(s), s);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
        || target.contentEditable === 'true';

      for (const shortcut of shortcutsRef.current) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          if (!shortcut.ctrl && !shortcut.shift && !shortcut.alt && isInputFocused) {
            continue;
          }
          if (shortcut.when && !shortcut.when()) continue;
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
            e.stopPropagation();
          }
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      for (const s of shortcuts) {
        shortcutRegistry.delete(getShortcutKey(s));
      }
    };
  }, []);
}
