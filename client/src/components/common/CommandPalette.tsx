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
    // Navigation
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard'), category: 'navigation', keywords: ['home', 'overview'] },
    { id: 'nav-contacts', label: 'Go to Contacts', icon: Users, action: () => navigate('/contacts'), category: 'navigation', keywords: ['people', 'clients'] },
    { id: 'nav-deals', label: 'Go to Deals', icon: HandCoins, action: () => navigate('/deals'), category: 'navigation', keywords: ['pipeline', 'sales', 'kanban'] },
    { id: 'nav-tasks', label: 'Go to Tasks', icon: CheckSquare, action: () => navigate('/tasks'), category: 'navigation', keywords: ['todo', 'work'] },
    { id: 'nav-tickets', label: 'Go to Tickets', icon: Ticket, action: () => navigate('/tickets'), category: 'navigation', keywords: ['support', 'issues'] },
    { id: 'nav-calendar', label: 'Go to Calendar', icon: Calendar, action: () => navigate('/calendar'), category: 'navigation', keywords: ['appointments', 'schedule'] },
    { id: 'nav-invoices', label: 'Go to Invoices', icon: FileText, action: () => navigate('/invoices'), category: 'navigation', keywords: ['billing', 'payments'] },
    { id: 'nav-emails', label: 'Go to Emails', icon: Mail, action: () => navigate('/emails'), category: 'navigation', keywords: ['messages'] },
    { id: 'nav-settings', label: 'Go to Settings', icon: Settings, action: () => navigate('/settings'), category: 'navigation', keywords: ['preferences', 'config'] },
    // Actions
    { id: 'act-new-contact', label: 'Create New Contact', description: 'Add a new contact to the CRM', icon: Plus, action: () => navigate('/contacts'), category: 'actions', keywords: ['add', 'person'] },
    { id: 'act-new-deal', label: 'Create New Deal', description: 'Start a new sales deal', icon: Plus, action: () => navigate('/deals'), category: 'actions', keywords: ['add', 'sale'] },
    { id: 'act-new-task', label: 'Create New Task', description: 'Add a task to your list', icon: Plus, action: () => navigate('/tasks'), category: 'actions', keywords: ['add', 'todo'] },
    // Settings
    { id: 'set-theme', label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode', icon: isDark ? Sun : Moon, action: () => { toggleTheme(); setIsOpen(false); }, category: 'settings', keywords: ['theme', 'dark', 'light', 'appearance'] },
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
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
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
                <p className="text-[13px] font-medium truncate">{cmd.label}</p>
                {cmd.description && (
                  <p className="text-[11px] text-[var(--text-tertiary)] truncate mt-0.5">{cmd.description}</p>
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
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-[14px] outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-secondary)]/60 border border-[var(--border-color)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[340px] overflow-y-auto py-2 px-1.5">
          {flatFiltered.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 mx-auto mb-3 text-[var(--text-tertiary)] opacity-30" />
              <p className="text-[13px] text-[var(--text-tertiary)]">
                No results found for "<span className="text-[var(--text-secondary)]">{query}</span>"
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <>
              {renderGroup('Navigation', grouped.navigation)}
              {renderGroup('Actions', grouped.actions)}
              {renderGroup('Settings', grouped.settings)}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
              <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[10px] font-semibold">&uarr;&darr;</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
              <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[10px] font-semibold">&crarr;</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
            <Command className="h-3 w-3" />K to toggle
          </span>
        </div>
      </div>
    </div>
  );
}
