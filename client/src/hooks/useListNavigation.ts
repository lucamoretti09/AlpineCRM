import { useState } from 'react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

interface UseListNavigationOptions<T> {
  items: T[];
  getId: (item: T) => string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  enabled?: boolean;
}

export function useListNavigation<T>({
  items,
  getId,
  onEdit,
  onDelete,
  enabled = true,
}: UseListNavigationOptions<T>) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const focusedItem = focusedIndex >= 0 && focusedIndex < items.length
    ? items[focusedIndex]
    : null;

  useKeyboardShortcuts(enabled ? [
    {
      key: 'j',
      action: () => setFocusedIndex(i => Math.min(i + 1, items.length - 1)),
      description: 'Elementul următor',
    },
    {
      key: 'k',
      action: () => setFocusedIndex(i => Math.max(i - 1, 0)),
      description: 'Elementul anterior',
    },
    {
      key: 'e',
      action: () => { if (focusedItem && onEdit) onEdit(focusedItem); },
      description: 'Editează elementul selectat',
      when: () => focusedItem !== null,
    },
    {
      key: 'd',
      action: () => {
        if (focusedItem && onDelete) {
          onDelete(focusedItem);
        }
      },
      description: 'Șterge elementul selectat',
      when: () => focusedItem !== null,
    },
  ] : []);

  return { focusedIndex, focusedItem, setFocusedIndex };
}
