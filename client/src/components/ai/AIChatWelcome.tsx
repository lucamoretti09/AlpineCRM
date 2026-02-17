import { Bot, Sparkles } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';

const SUGGESTED_PROMPTS = [
  'Care sunt tranzacțiile active?',
  'Rezumat contacte principale',
  'Sarcini restante',
  'Statistici venituri',
] as const;

export default function AIChatWelcome() {
  const handlePromptClick = (text: string) => {
    useChatStore.getState().sendMessage(text);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
      {/* Icon */}
      <div className="relative mb-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25">
          <Bot className="h-7 w-7 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-sm">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
        Asistent AI AlpineCRM
      </h3>
      <p className="mt-1.5 text-center text-[13px] leading-relaxed text-[var(--text-tertiary)]">
        Întreabă-mă orice despre contactele, tranzacțiile, sarcinile sau datele tale din CRM.
      </p>

      {/* Suggested prompts */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handlePromptClick(prompt)}
            className={cn(
              'rounded-full px-3.5 py-1.5',
              'text-[12.5px] font-medium',
              'text-[var(--text-secondary)]',
              'bg-white/60 dark:bg-white/[0.04]',
              'border border-[var(--border-color)]',
              'backdrop-blur-sm',
              'transition-all duration-200',
              'hover:border-indigo-400/40 hover:bg-indigo-500/[0.06] hover:text-indigo-500 dark:hover:text-indigo-400',
              'active:scale-95',
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
