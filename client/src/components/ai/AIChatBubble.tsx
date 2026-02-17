import { Bot } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';

export default function AIChatBubble() {
  const toggleChat = useChatStore((s) => s.toggleChat);

  return (
    <button
      onClick={toggleChat}
      className={cn(
        'fixed bottom-6 right-6 z-[90]',
        'flex h-14 w-14 items-center justify-center rounded-full',
        'bg-gradient-to-br from-indigo-500 to-violet-500',
        'text-white',
        'shadow-lg shadow-indigo-500/30',
        'animate-chatFabPulse',
        'transition-all duration-300 ease-out',
        'hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/40',
        'active:scale-95',
      )}
      title="Deschide Asistentul AI (Alt+A)"
    >
      <Bot className="h-6 w-6" />
    </button>
  );
}
