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
  const [searchFocused, setSearchFocused] = useState(false);
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
    <header className="sticky top-0 z-30 flex h-[80px] items-center justify-between border-b border-[var(--border-color)]/50 bg-[var(--bg-primary)]/70 px-6 backdrop-blur-xl backdrop-saturate-150">
      {/* Left: Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            className={cn(
              'absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300',
              searchFocused ? 'text-primary-500' : 'text-[var(--text-tertiary)]'
            )}
          />
          <input
            type="text"
            placeholder="Căutare..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              'h-12 w-72 rounded-xl border border-[var(--border-color)]',
              'bg-[var(--bg-secondary)]/60 pl-10 pr-4 text-[15px]',
              'text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
              'outline-none transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
              'focus:w-96 focus:border-primary-500/40 focus:bg-[var(--bg-secondary)]',
              'focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1),0_0_20px_rgba(99,102,241,0.06)]'
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[var(--text-tertiary)]">
            <kbd className="hidden lg:flex items-center gap-0.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 px-1.5 py-0.5 text-[10px] font-medium">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </div>
        </div>

        {/* Theme Toggle with rotation + scale bounce */}
        <button
          onClick={handleThemeToggle}
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-xl',
            'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/60 hover:text-[var(--text-primary)]',
            'transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            themeBounce && 'animate-theme-bounce'
          )}
          title={isDark ? 'Comută la modul luminos' : 'Comută la modul întunecat'}
        >
          <Sun
            className={cn(
              'h-5 w-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
              isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
            )}
          />
          <Moon
            className={cn(
              'absolute h-5 w-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
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
              'relative flex h-10 w-10 items-center justify-center rounded-xl',
              'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/60 hover:text-[var(--text-primary)]',
              'transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]'
            )}
          >
            <Bell
              className={cn(
                'h-5 w-5',
                unreadCount > 0 && !notificationsOpen && 'animate-bell-wiggle'
              )}
            />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-[10px] font-bold text-white shadow-md shadow-red-500/30 animate-notification-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div
              className={cn(
                'absolute right-0 top-full mt-2 w-80 rounded-2xl',
                'border border-[var(--border-color)] bg-[var(--bg-card)]',
                'shadow-2xl shadow-black/12 dark:shadow-black/40',
                'animate-dropdown-enter',
                'overflow-hidden'
              )}
            >
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/50 px-4 py-3.5">
                <h3 className="text-[15px] font-bold text-[var(--text-primary)]">
                  Notificări
                </h3>
                <span className="rounded-full bg-primary-500/10 px-2.5 py-0.5 text-[13px] font-semibold text-primary-500">
                  {unreadCount} noi
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--bg-secondary)]/60 transition-all duration-200 ease-out border-l-2 border-primary-500">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-500/10">
                    <Bell className="h-3.5 w-3.5 text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-[var(--text-primary)]">Tranzacție nouă creată</p>
                    <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">acum 2 minute</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--bg-secondary)]/60 transition-all duration-200 ease-out border-l-2 border-emerald-500">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Bell className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-[var(--text-primary)]">Sarcină finalizată</p>
                    <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">acum 15 minute</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--bg-secondary)]/60 transition-all duration-200 ease-out border-l-2 border-transparent">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                    <Bell className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-[var(--text-primary)]">Factură restantă</p>
                    <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">acum 1 oră</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-[var(--border-color)]/50 px-4 py-3">
                <a
                  href="/notifications"
                  className="block text-center text-[12px] font-semibold text-primary-500 hover:text-primary-400 transition-colors duration-200"
                >
                  Vezi toate notificările
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Divider — gradient fade instead of solid line */}
        <div className="mx-1.5 h-6 w-px bg-gradient-to-b from-transparent via-[var(--border-color)] to-transparent" />

        {/* User Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
            }}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-2.5 py-1.5',
              'hover:bg-[var(--bg-tertiary)]/60 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]'
            )}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-[var(--border-color)] transition-all duration-300 hover:ring-primary-500/30"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 text-[13px] font-bold text-white ring-2 ring-[var(--border-color)] transition-all duration-300 hover:ring-primary-500/30">
                {user ? getInitials(user.firstName, user.lastName) : '??'}
              </div>
            )}
            <div className="hidden text-left md:block">
              <p className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
              </p>
              <p className="text-[13px] text-[var(--text-tertiary)] leading-tight">
                {user?.email ?? ''}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'hidden h-3.5 w-3.5 text-[var(--text-tertiary)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:block',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* User Dropdown Menu — with slide down + fade + scale animation */}
          {dropdownOpen && (
            <div
              className={cn(
                'absolute right-0 top-full mt-2 w-56 rounded-2xl',
                'border border-[var(--border-color)] bg-[var(--bg-card)]',
                'shadow-2xl shadow-black/12 dark:shadow-black/40',
                'animate-dropdown-enter',
                'overflow-hidden'
              )}
            >
              <div className="border-b border-[var(--border-color)]/50 px-4 py-3.5">
                <p className="text-[15px] font-bold text-[var(--text-primary)]">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                </p>
                <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
                  {user?.email ?? ''}
                </p>
              </div>

              <div className="py-1.5">
                <a
                  href="/settings/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-[15px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/60 hover:text-[var(--text-primary)] transition-all duration-200 ease-out"
                >
                  <User className="h-4 w-4" />
                  Profil
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-[15px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/60 hover:text-[var(--text-primary)] transition-all duration-200 ease-out"
                >
                  <Settings className="h-4 w-4" />
                  Setări
                </a>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
