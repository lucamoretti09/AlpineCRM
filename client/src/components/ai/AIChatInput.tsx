import { useRef, useState, useCallback } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';

export default function AIChatInput() {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = useChatStore((s) => s.isLoading);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    // Max 4 rows (~80px based on line-height)
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;

    useChatStore.getState().sendMessage(trimmed);
    setValue('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="border-t border-[var(--border-color)] px-3 py-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Scrie un mesaj..."
          disabled={isLoading}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-xl px-3.5 py-2.5',
            'bg-white/50 dark:bg-white/[0.03]',
            'border border-[var(--border-color)]',
            'text-[13.5px] text-[var(--text-primary)]',
            'placeholder-[var(--text-tertiary)]',
            'outline-none',
            'transition-colors duration-200',
            'focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          style={{ maxHeight: '96px' }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            'transition-all duration-200',
            canSend
              ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95'
              : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] cursor-not-allowed',
          )}
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1.5 text-center text-[11px] text-[var(--text-tertiary)]">
        Shift+Enter pentru linie nouă
      </p>
    </div>
  );
}
