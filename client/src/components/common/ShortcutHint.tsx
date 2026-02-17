import { cn } from '@/lib/utils';

interface ShortcutHintProps {
  keys: string[];
  className?: string;
}

export default function ShortcutHint({ keys, className }: ShortcutHintProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 ml-auto', className)}>
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] text-[11px] font-semibold text-[var(--text-tertiary)] leading-tight"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
