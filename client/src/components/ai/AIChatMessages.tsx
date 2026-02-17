import { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import AIChatMessage from './AIChatMessage';
import AIChatTypingIndicator from './AIChatTypingIndicator';
import AIChatWelcome from './AIChatWelcome';

export default function AIChatMessages() {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Show welcome screen when there is only the initial welcome message
  const showWelcome = messages.length <= 1;

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      {showWelcome ? (
        <AIChatWelcome />
      ) : (
        <div className="py-3">
          {messages.map((message) =>
            message.isLoading ? null : (
              <AIChatMessage key={message.id} message={message} />
            ),
          )}
          {isLoading && <AIChatTypingIndicator />}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
