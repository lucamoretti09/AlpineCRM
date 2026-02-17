import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';
import { AlertCircle, X } from 'lucide-react';
import AIChatHeader from './AIChatHeader';
import AIChatMessages from './AIChatMessages';
import AIChatInput from './AIChatInput';

export default function AIChatPanel() {
  const isExpanded = useChatStore((s) => s.isExpanded);
  const error = useChatStore((s) => s.error);
  const dismissError = useChatStore((s) => s.dismissError);

  return (
    <div
      className={cn(
        'fixed bottom-20 right-6 z-[90]',
        'flex flex-col overflow-hidden rounded-2xl',
        'bg-white/70 dark:bg-white/[0.025]',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-[var(--border-color)]',
        'shadow-2xl shadow-black/20',
        'animate-chatSlideUp',
        'transition-[width,height] duration-300 ease-out',
        isExpanded ? 'w-[560px] h-[680px]' : 'w-[400px] h-[560px]',
      )}
    >
      {/* Top accent gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 opacity-80" />

      {/* Header */}
      <AIChatHeader />

      {/* Error banner */}
      {error && (
        <div className="mx-3 mt-2 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <p className="flex-1 text-[12.5px] text-red-400">{error}</p>
          <button
            onClick={dismissError}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Messages */}
      <AIChatMessages />

      {/* Input */}
      <AIChatInput />
    </div>
  );
}
