import { Mountain, ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 animate-fadeIn">
      {/* Decorative background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.15) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      {/* 404 Number */}
      <div className="relative mb-6">
        <span className="text-[160px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary-300 via-primary-500 to-violet-600 select-none opacity-20">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-700 shadow-xl shadow-indigo-500/25">
            <Mountain className="h-12 w-12 text-white" />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
        Pagină Negăsită
      </h1>
      <p className="text-[16px] text-[var(--text-secondary)] max-w-md mb-8 leading-relaxed">
        Pagina pe care o cauți nu există sau a fost mutată.
        Verifică adresa URL sau întoarce-te la pagina principală.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className={cn(
            'flex items-center gap-2.5 px-6 py-3 rounded-xl text-[15px] font-semibold',
            'bg-[var(--bg-secondary)]/60 border border-[var(--border-color)]',
            'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/60',
            'transition-all duration-200',
          )}
        >
          <ArrowLeft className="h-5 w-5" />
          Înapoi
        </button>
        <a
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 px-6 py-3 rounded-xl text-[15px] font-semibold text-white',
            'bg-gradient-to-r from-indigo-600 to-indigo-500',
            'shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30',
            'hover:-translate-y-0.5 transition-all duration-300',
          )}
        >
          <Home className="h-5 w-5" />
          Acasă
        </a>
      </div>
    </div>
  );
}
