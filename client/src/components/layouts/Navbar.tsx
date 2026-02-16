import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { cn, getInitials } from '@/lib/utils';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
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

  const unreadCount = 3; // Placeholder for real notification count

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-6 backdrop-blur-md">
      {/* Left: Page Title */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              'h-9 w-64 rounded-lg border border-[var(--border-color)]',
              'bg-[var(--bg-secondary)] pl-9 pr-4 text-sm',
              'text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
              'outline-none transition-all duration-200',
              'focus:w-80 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
            )}
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-lg',
            'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
            'transition-all duration-200 ease-in-out'
          )}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Sun
            className={cn(
              'h-[18px] w-[18px] transition-all duration-300',
              isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
            )}
          />
          <Moon
            className={cn(
              'absolute h-[18px] w-[18px] transition-all duration-300',
              isDark ? '-rotate-90 scale-0' : 'rotate-0 scale-100'
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
              'relative flex h-9 w-9 items-center justify-center rounded-lg',
              'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
              'transition-all duration-200 ease-in-out'
            )}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div
              className={cn(
                'absolute right-0 top-full mt-2 w-80 rounded-xl',
                'border border-[var(--border-color)] bg-[var(--bg-card)]',
                'shadow-xl shadow-black/10 animate-fadeIn',
                'overflow-hidden'
              )}
            >
              <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Notifications
                </h3>
                <span className="rounded-full bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-500">
                  {unreadCount} new
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {/* Placeholder notifications */}
                <div className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors duration-150 border-l-2 border-primary-500">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500/10">
                    <Bell className="h-4 w-4 text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">New deal created</p>
                    <p className="text-xs text-[var(--text-tertiary)]">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors duration-150 border-l-2 border-primary-500">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                    <Bell className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">Task completed</p>
                    <p className="text-xs text-[var(--text-tertiary)]">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors duration-150 border-l-2 border-transparent">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/10">
                    <Bell className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">Invoice overdue</p>
                    <p className="text-xs text-[var(--text-tertiary)]">1 hour ago</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-[var(--border-color)] px-4 py-2.5">
                <a
                  href="/notifications"
                  className="block text-center text-xs font-medium text-primary-500 hover:text-primary-400 transition-colors duration-150"
                >
                  View all notifications
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-[var(--border-color)]" />

        {/* User Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
            }}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-2 py-1.5',
              'hover:bg-[var(--bg-tertiary)] transition-all duration-200'
            )}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--border-color)]"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-semibold text-white ring-2 ring-[var(--border-color)]">
                {user ? getInitials(user.firstName, user.lastName) : '??'}
              </div>
            )}
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] leading-tight">
                {user?.email ?? ''}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'hidden h-4 w-4 text-[var(--text-tertiary)] transition-transform duration-200 md:block',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div
              className={cn(
                'absolute right-0 top-full mt-2 w-56 rounded-xl',
                'border border-[var(--border-color)] bg-[var(--bg-card)]',
                'shadow-xl shadow-black/10 animate-fadeIn',
                'overflow-hidden'
              )}
            >
              {/* User header */}
              <div className="border-b border-[var(--border-color)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {user?.email ?? ''}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <a
                  href="/settings/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
                >
                  <User className="h-4 w-4" />
                  Profile
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </a>
              </div>

              {/* Logout */}
              <div className="border-t border-[var(--border-color)] py-1.5">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors duration-150"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
