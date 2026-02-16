import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  LayoutDashboard,
  Users,
  HandCoins,
  CheckSquare,
  Ticket,
  Calendar,
  FileText,
  Mail,
  Settings,
  Plus,
  Moon,
  Sun,
  Command,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: 'navigation' | 'actions' | 'settings';
  keywords?: string[];
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setIsOpen(false);
  }, []);

  const commands: CommandItem[] = [
    // Navigare
    { id: 'nav-dashboard', label: 'Navighează la Panou Principal', icon: LayoutDashboard, action: () => navigate('/dashboard'), category: 'navigation', keywords: ['home', 'acasă', 'prezentare'] },
    { id: 'nav-contacts', label: 'Navighează la Contacte', icon: Users, action: () => navigate('/contacts'), category: 'navigation', keywords: ['persoane', 'clienți'] },
    { id: 'nav-deals', label: 'Navighează la Tranzacții', icon: HandCoins, action: () => navigate('/deals'), category: 'navigation', keywords: ['pipeline', 'vânzări', 'kanban'] },
    { id: 'nav-tasks', label: 'Navighează la Sarcini', icon: CheckSquare, action: () => navigate('/tasks'), category: 'navigation', keywords: ['todo', 'muncă'] },
    { id: 'nav-tickets', label: 'Navighează la Tichete', icon: Ticket, action: () => navigate('/tickets'), category: 'navigation', keywords: ['suport', 'probleme'] },
    { id: 'nav-calendar', label: 'Navighează la Calendar', icon: Calendar, action: () => navigate('/calendar'), category: 'navigation', keywords: ['programări', 'program'] },
    { id: 'nav-invoices', label: 'Navighează la Facturi', icon: FileText, action: () => navigate('/invoices'), category: 'navigation', keywords: ['facturare', 'plăți'] },
    { id: 'nav-emails', label: 'Navighează la Emailuri', icon: Mail, action: () => navigate('/emails'), category: 'navigation', keywords: ['mesaje'] },
    { id: 'nav-settings', label: 'Navighează la Setări', icon: Settings, action: () => navigate('/settings'), category: 'navigation', keywords: ['preferințe', 'configurare'] },
    // Acțiuni
    { id: 'act-new-contact', label: 'Creează Contact', description: 'Adaugă un contact nou în CRM', icon: Plus, action: () => navigate('/contacts'), category: 'actions', keywords: ['adaugă', 'persoană'] },
    { id: 'act-new-deal', label: 'Creează Tranzacție', description: 'Începe o tranzacție nouă de vânzare', icon: Plus, action: () => navigate('/deals'), category: 'actions', keywords: ['adaugă', 'vânzare'] },
    { id: 'act-new-task', label: 'Creează Sarcină', description: 'Adaugă o sarcină în lista ta', icon: Plus, action: () => navigate('/tasks'), category: 'actions', keywords: ['adaugă', 'todo'] },
    // Setări
    { id: 'set-theme', label: isDark ? 'Comută la Modul Luminos' : 'Comută la Modul Întunecat', icon: isDark ? Sun : Moon, action: () => { toggleTheme(); setIsOpen(false); }, category: 'settings', keywords: ['temă', 'întunecat', 'luminos', 'aspect'] },
  ];

  const filtered = query
    ? commands.filter((cmd) => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.some((k) => k.includes(q))
        );
      })
    : commands;

  const grouped = {
    navigation: filtered.filter((c) => c.category === 'navigation'),
    actions: filtered.filter((c) => c.category === 'actions'),
    settings: filtered.filter((c) => c.category === 'settings'),
  };

  const flatFiltered = [...grouped.navigation, ...grouped.actions, ...grouped.settings];

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatFiltered[selectedIndex]) {
        flatFiltered[selectedIndex].action();
      }
    }
  };

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatIndex = -1;

  const renderGroup = (label: string, items: CommandItem[]) => {
    if (items.length === 0) return null;
    return (
      <div key={label}>
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Hash className="w-3 h-3 text-[var(--text-tertiary)] opacity-50" />
          <span className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            {label}
          </span>
        </div>
        {items.map((cmd) => {
          flatIndex++;
          const idx = flatIndex;
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.id}
              data-selected={idx === selectedIndex}
              onClick={cmd.action}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left rounded-xl mx-1 transition-all duration-150',
                idx === selectedIndex
                  ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/60'
              )}
              style={{ width: 'calc(100% - 8px)' }}
            >
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-150',
                idx === selectedIndex
                  ? 'bg-indigo-500/15'
                  : 'bg-[var(--bg-secondary)]/60'
              )}>
                <Icon className="h-4 w-4 shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium truncate">{cmd.label}</p>
                {cmd.description && (
                  <p className="text-[13px] text-[var(--text-tertiary)] truncate mt-0.5">{cmd.description}</p>
                )}
              </div>
              {idx === selectedIndex && (
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500/50 flex-shrink-0 animate-fadeIn" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-xl mx-4 bg-white/70 dark:bg-[var(--bg-card)] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl shadow-2xl shadow-black/20 overflow-hidden animate-fadeInScale">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-40" />

        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-color)]">
          <Search className="h-5 w-5 text-[var(--text-tertiary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Căutare..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-[16px] outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-secondary)]/60 border border-[var(--border-color)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[340px] overflow-y-auto py-2 px-1.5">
          {flatFiltered.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 mx-auto mb-3 text-[var(--text-tertiary)] opacity-30" />
              <p className="text-[15px] text-[var(--text-tertiary)]">
                Niciun rezultat găsit pentru „<span className="text-[var(--text-secondary)]">{query}</span>"
              </p>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                Încearcă un alt termen de căutare
              </p>
            </div>
          ) : (
            <>
              {renderGroup('Navigare', grouped.navigation)}
              {renderGroup('Acțiuni Rapide', grouped.actions)}
              {renderGroup('Setări', grouped.settings)}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)]">
              <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[12px] font-semibold">&uarr;&darr;</kbd>
              Navighează
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)]">
              <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[12px] font-semibold">&crarr;</kbd>
              Selectează
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)]">
            <Command className="h-3 w-3" />K pentru comutare
          </span>
        </div>
      </div>
    </div>
  );
}
