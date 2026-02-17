import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex h-[60vh] items-center justify-center animate-fadeIn">
          <div className="flex flex-col items-center gap-5 text-center max-w-md px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="h-10 w-10 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Ceva nu a funcționat
              </h2>
              <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                A apărut o eroare neașteptată. Încearcă să reîmprospătezi pagina sau să te întorci la pagina principală.
              </p>
            </div>
            {this.state.error && (
              <details className="w-full text-left">
                <summary className="cursor-pointer text-[13px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
                  Detalii eroare
                </summary>
                <pre className="mt-2 p-3 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)] overflow-auto max-h-32 font-mono">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 rounded-xl text-[15px] font-semibold',
                  'bg-[var(--bg-secondary)]/60 border border-[var(--border-color)]',
                  'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/60',
                  'transition-all duration-200',
                )}
              >
                <RefreshCw className="h-4.5 w-4.5" />
                Încearcă din nou
              </button>
              <a
                href="/dashboard"
                className={cn(
                  'flex items-center gap-2 px-5 py-3 rounded-xl text-[15px] font-semibold text-white',
                  'bg-gradient-to-r from-indigo-600 to-indigo-500',
                  'shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30',
                  'transition-all duration-300',
                )}
              >
                Acasă
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
