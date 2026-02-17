import { Bot, Maximize2, Minimize2, Trash2, X } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';

export default function AIChatHeader() {
  const isExpanded = useChatStore((s) => s.isExpanded);
  const toggleExpanded = useChatStore((s) => s.toggleExpanded);
  const clearHistory = useChatStore((s) => s.clearHistory);
  const closeChat = useChatStore((s) => s.closeChat);

  return (
    <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
      {/* Title area */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm shadow-indigo-500/20">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Asistent AI
          </h3>
          <p className="text-[11px] text-[var(--text-tertiary)] leading-none mt-0.5">
            AlpineCRM
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={toggleExpanded}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg',
            'text-[var(--text-tertiary)]',
            'transition-all duration-200',
            'hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)]',
          )}
          title={isExpanded ? 'Micșorează' : 'Mărește'}
        >
          {isExpanded ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          onClick={clearHistory}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg',
            'text-[var(--text-tertiary)]',
            'transition-all duration-200',
            'hover:bg-red-500/10 hover:text-red-400',
          )}
          title="Șterge istoricul"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={closeChat}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg',
            'text-[var(--text-tertiary)]',
            'transition-all duration-200',
            'hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)]',
          )}
          title="Închide"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
