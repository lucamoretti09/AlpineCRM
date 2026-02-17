import { useMemo } from 'react';
import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '@/stores/chatStore';
import { cn, formatRelativeTime } from '@/lib/utils';

interface AIChatMessageProps {
  message: ChatMessage;
}

/**
 * Simple inline markdown renderer.
 * Supports: **bold**, *italic*, `code`, - list items, and newlines.
 */
function renderSimpleMarkdown(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];

  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={`ul-${nodes.length}`} className="my-1.5 ml-4 list-disc space-y-0.5 text-[13px]">
          {listItems}
        </ul>,
      );
      listItems = [];
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trimStart();

    // List item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.slice(2);
      listItems.push(<li key={`li-${lineIdx}`}>{renderInline(itemText)}</li>);
      return;
    }

    // Not a list item -- flush any pending list
    flushList();

    if (line.trim() === '') {
      nodes.push(<br key={`br-${lineIdx}`} />);
    } else {
      nodes.push(
        <span key={`line-${lineIdx}`}>
          {renderInline(line)}
          {lineIdx < lines.length - 1 && <br />}
        </span>,
      );
    }
  });

  flushList();
  return nodes;
}

/**
 * Renders inline markdown tokens: **bold**, *italic*, `code`.
 */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Regex matches **bold**, *italic*, or `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined) {
      // **bold**
      parts.push(<strong key={`b-${match.index}`} className="font-semibold">{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      // *italic*
      parts.push(<em key={`i-${match.index}`}>{match[3]}</em>);
    } else if (match[4] !== undefined) {
      // `code`
      parts.push(
        <code
          key={`c-${match.index}`}
          className="rounded-md bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-[12px] font-mono text-indigo-400"
        >
          {match[4]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function AIChatMessage({ message }: AIChatMessageProps) {
  const isUser = message.role === 'user';

  const renderedContent = useMemo(
    () => renderSimpleMarkdown(message.content),
    [message.content],
  );

  return (
    <div
      className={cn(
        'flex gap-2.5 px-4 py-2',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-violet-500'
            : 'bg-white/60 dark:bg-white/[0.06] border border-[var(--border-color)]',
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-white" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-indigo-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2.5',
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-tr-sm'
            : 'bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-sm',
        )}
      >
        <div
          className={cn(
            'text-[13.5px] leading-relaxed',
            isUser ? 'text-white/95' : 'text-[var(--text-primary)]',
          )}
        >
          {renderedContent}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-[var(--border-color)] pt-2">
            {message.sources.map((source) => (
              <span
                key={source.id}
                className="inline-flex items-center rounded-md bg-indigo-500/[0.08] px-2 py-0.5 text-[11px] font-medium text-indigo-400"
              >
                {source.label}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p
          className={cn(
            'mt-1 text-[11px]',
            isUser ? 'text-white/50 text-right' : 'text-[var(--text-tertiary)]',
          )}
        >
          {formatRelativeTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
