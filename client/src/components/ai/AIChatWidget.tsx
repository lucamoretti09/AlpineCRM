import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import AIChatBubble from './AIChatBubble';
import AIChatPanel from './AIChatPanel';

export default function AIChatWidget() {
  const isOpen = useChatStore((s) => s.isOpen);
  const toggleChat = useChatStore((s) => s.toggleChat);

  // Register Alt+A keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        toggleChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleChat]);

  return (
    <>
      {isOpen ? <AIChatPanel /> : <AIChatBubble />}
    </>
  );
}
