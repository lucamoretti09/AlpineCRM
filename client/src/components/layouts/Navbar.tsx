import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  User,
  Settings,
  Command,
  LogOut,
  X,
  Menu,
} from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { cn, getInitials } from '@/lib/utils';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [themeBounce, setThemeBounce] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = 3;

  const handleThemeToggle = () => {
    setThemeBounce(true);
    toggleTheme();
    setTimeout(() => setThemeBounce(false), 400);
  };

  return (
    <header role="banner" aria-label="Bară de navigare" className="sticky top-0 z-30 flex h-[70px] md:h-[90px] items-center justify-between border-b border-[var(--border-color)]/50 bg-[var(--bg-primary)]/70 px-3 md:px-8 backdrop-blur-xl backdrop-saturate-150 gap-2 md:gap-3 max-w-full">
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => useThemeStore.getState().toggleMobileMenu()}
          className="flex md:hidden h-11 w-11 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/60 hover:text-[var(--text-primary)] transition-all shrink-0"
          aria-label="Deschide meniul"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        {/* Search - triggers Command Palette */}
        <button
          onClick={() => {
            // Dispatch Ctrl+K to open command palette
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
          }}
          className={cn(
            'hidden lg:flex items-center gap-3 h-12 w-72 rounded-xl border border-[var(--border-color)]',
            'bg-[var(--bg-secondary)]/60 px-4 text-[15px]',
            'text-[var(--text-tertiary)]',
            'outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'hover:border-primary-500/30 hover:bg-[var(--bg-secondary)]',
            'hover:shadow-[0_0_0_3px_rgba(99,102,241,0.06)]',
          )}
        >
          <Search className="h-4.5 w-4.5 shrink-0" />
          <span className="flex-1 text-left">Căutare...</span>
          <kbd className="hidden lg:flex items-center gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 px-1.5 py-0.5 text-[12px] font-medium">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        {/* Theme Toggle with rotation + scale bounce */}
        <button
          onClick={handleThemeToggle}
          className={cn(
            'relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl',
            'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/60 hover:text-[var(--text-primary)]',
            'transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            themeBounce && 'animate-theme-bounce'
          )}
          title={isDark ? 'Comută la modul luminos' : 'Comută la modul întunecat'}
        >
          <Sun
            className={cn(
              'h-6 w-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
              isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
            )}
          />
          <Moon
            className={cn(
              'absolute h-6 w-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
              isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
            )}
          />
        </button>

        {/* Notifications */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
            className={cn(
              'relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl',
              'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/60 hover:text-[var(--text-primary)]',
              'transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]'
            )}
          >
            <Bell
              className={cn(
                'h-6 w-6',
                unreadCount > 0 && !notificationsOpen && 'animate-bell-wiggle'
              )}
            />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1.5 text-[12px] font-bold text-white shadow-md shadow-red-500/30 animate-notification-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div
              className={cn(
                'absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] md:w-96 max-w-96 rounded-2xl',
                'border border-[var(--border-color)] bg-[var(--bg-card)]',
                'shadow-2xl shadow-black/12 dark:shadow-black/40',
                'animate-dropdown-enter',
                'overflow-hidden'
              )}
            >
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/50 px-4 py-3.5">
                <h3 className="text-[17px] font-bold text-[var(--text-primary)]">
                  Notificări
                </h3>
                <span className="rounded-full bg-primary-500/10 px-3 py-1 text-[15px] font-semibold text-primary-500">
                  {unreadCount} noi
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--bg-secondary)]/60 transition-all duration-200 ease-out border-l-2 border-primary-500">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10">
                    <Bell className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[17px] font-medium text-[var(--text-primary)]">Tranzacție nouă creată</p>
                    <p className="text-[15px] text-[var(--text-tertiary)] mt-0.5">acum 2 minute</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--bg-secondary)]/60 transition-all duration-200 ease-out border-l-2 border-emerald-500">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Bell className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[17px] font-medium text-[var(--text-primary)]">Sarcină finalizată</p>
                    <p className="text-[15px] text-[var(--text-tertiary)] mt-0.5">acum 15 minute</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--bg-secondary)]/60 transition-all duration-200 ease-out border-l-2 border-transparent">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                    <Bell className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[17px] font-medium text-[var(--text-primary)]">Factură restantă</p>
                    <p className="text-[15px] text-[var(--text-tertiary)] mt-0.5">acum 1 oră</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-[var(--border-color)]/50 px-4 py-3">
                <a
                  href="/notifications"
                  className="block text-center text-[15px] font-semibold text-primary-500 hover:text-primary-400 transition-colors duration-200"
                >
                  Vezi toate notificările
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Divider — gradient fade instead of solid line */}
        <div className="hidden lg:block mx-2 h-8 w-px bg-gradient-to-b from-transparent via-[var(--border-color)] to-transparent" />

        {/* User Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
            }}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-1 md:px-2.5 py-1.5',
              'hover:bg-[var(--bg-tertiary)]/60 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]'
            )}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl object-cover ring-2 ring-[var(--border-color)] transition-all duration-300 hover:ring-primary-500/30"
              />
            ) : (
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 text-[13px] md:text-[15px] font-bold text-white ring-2 ring-[var(--border-color)] transition-all duration-300 hover:ring-primary-500/30">
                {user ? getInitials(user.firstName, user.lastName) : '??'}
              </div>
            )}
            <div className="hidden text-left lg:block">
              <p className="text-[17px] font-semibold text-[var(--text-primary)] leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : 'Vizitator'}
              </p>
              <p className="text-[15px] text-[var(--text-tertiary)] leading-tight">
                {user?.email ?? ''}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'hidden h-3.5 w-3.5 text-[var(--text-tertiary)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:block',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* User Dropdown Menu — with slide down + fade + scale animation */}
          {dropdownOpen && (
            <div
              className={cn(
                'absolute right-0 top-full mt-2 w-72 rounded-2xl',
                'border border-[var(--border-color)] bg-[var(--bg-card)]',
                'shadow-2xl shadow-black/12 dark:shadow-black/40',
                'animate-dropdown-enter',
                'overflow-hidden'
              )}
            >
              <div className="border-b border-[var(--border-color)]/50 px-4 py-3.5">
                <p className="text-[17px] font-bold text-[var(--text-primary)]">
                  {user ? `${user.firstName} ${user.lastName}` : 'Vizitator'}
                </p>
                <p className="text-[15px] text-[var(--text-tertiary)] mt-0.5">
                  {user?.email ?? ''}
                </p>
              </div>

              <div className="py-1.5">
                <a
                  href="/settings/profile"
                  className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/60 hover:text-[var(--text-primary)] transition-all duration-200 ease-out"
                >
                  <User className="h-4.5 w-4.5" />
                  Profil
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/60 hover:text-[var(--text-primary)] transition-all duration-200 ease-out"
                >
                  <Settings className="h-4.5 w-4.5" />
                  Setări
                </a>
              </div>

              <div className="border-t border-[var(--border-color)]/50 py-1.5">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-[15px] font-medium text-red-500 hover:bg-red-500/[0.06] transition-all duration-200 ease-out"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  Deconectare
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
