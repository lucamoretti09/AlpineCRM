import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmă',
  cancelLabel = 'Anulează',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus trap + Escape
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);

    // Auto-focus cancel for safety
    setTimeout(() => confirmRef.current?.focus(), 50);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div
        className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-7 w-full max-w-sm mx-4 animate-fadeInScale shadow-2xl dark:shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all duration-200"
          aria-label="Închide"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl',
              isDanger ? 'bg-red-500/10' : 'bg-amber-500/10',
            )}
          >
            {isDanger ? (
              <Trash2 className="h-7 w-7 text-red-500" />
            ) : (
              <AlertTriangle className="h-7 w-7 text-amber-500" />
            )}
          </div>

          <div>
            <h3 id="confirm-title" className="text-[17px] font-bold text-[var(--text-primary)]">
              {title}
            </h3>
            <p id="confirm-desc" className="text-[14px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-[15px] font-semibold hover:bg-[var(--bg-tertiary)]/60 transition-all duration-200"
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmRef}
              onClick={onConfirm}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-[15px] font-semibold text-white transition-all duration-200',
                isDanger
                  ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-md shadow-red-500/20'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-md shadow-amber-500/20',
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
