import { useState } from 'react';
import {
  Mountain,
  LayoutDashboard,
  Users,
  HandCoins,
  CheckSquare,
  Ticket,
  Calendar,
  FileText,
  Mail,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { cn, getInitials } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Panou Principal', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Contacte', icon: Users, path: '/contacts' },
  { label: 'Tranzacții', icon: HandCoins, path: '/deals' },
  { label: 'Sarcini', icon: CheckSquare, path: '/tasks' },
  { label: 'Tichete', icon: Ticket, path: '/tickets' },
  { label: 'Calendar', icon: Calendar, path: '/calendar' },
  { label: 'Facturi', icon: FileText, path: '/invoices' },
  { label: 'Email-uri', icon: Mail, path: '/emails' },
  { label: 'Setări', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();
  const { user } = useAuthStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const currentPath = window.location.pathname;

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'sidebar-glow fixed left-0 top-0 z-40 flex h-screen flex-col',
        'bg-[var(--bg-sidebar)]',
        'border-r border-[var(--border-color)]/50',
        'transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        sidebarCollapsed ? 'w-[90px]' : 'w-[340px]'
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          'flex h-[90px] items-center border-b border-[var(--border-color)]/50',
          'px-4 shrink-0',
          sidebarCollapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="relative group cursor-pointer">
          {/* Outer glow that pulses on hover */}
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out" />
          {/* Logo icon with richer gradient + hover pulse-glow */}
          <div
            className={cn(
              'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
              'bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-700',
              'shadow-lg shadow-indigo-500/25',
              'transition-all duration-500 ease-out',
              'group-hover:shadow-indigo-500/40 group-hover:shadow-xl',
              'group-hover:scale-[1.04]'
            )}
            style={{
              animation: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.animation = 'logo-pulse-glow 2s ease-in-out infinite';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = 'none';
            }}
          >
            <Mountain className="h-7 w-7 text-white drop-shadow-sm" />
          </div>
        </div>
        <div
          className={cn(
            'transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden whitespace-nowrap',
            sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Alpine<span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">CRM</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Navigare principală" className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <ul className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hovered = hoveredItem === item.path;

            return (
              <li key={item.path}>
                <a
                  href={item.path}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    'group relative flex items-center gap-4 rounded-2xl px-4 py-4',
                    'transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                    'text-[18px] font-medium',
                    sidebarCollapsed && 'justify-center px-0',
                    active
                      ? 'bg-primary-500/[0.08] text-primary-500 dark:bg-primary-500/[0.12]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {/* Hover background fill that slides in from left */}
                  {!active && (
                    <span
                      className={cn(
                        'absolute inset-0 rounded-xl bg-[var(--bg-tertiary)]/50',
                        'origin-left transition-all duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                        hovered
                          ? 'scale-x-100 opacity-100'
                          : 'scale-x-0 opacity-0'
                      )}
                    />
                  )}

                  {/* Active indicator bar with animated glow */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 h-9 w-[4px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary-400 via-primary-500 to-primary-600"
                      style={{
                        animation: 'active-bar-glow 2.5s ease-in-out infinite',
                      }}
                    />
                  )}

                  <Icon
                    className={cn(
                      'relative h-6 w-6 shrink-0 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                      active && 'drop-shadow-sm',
                      hovered && !active && 'scale-110',
                      active && 'scale-105'
                    )}
                  />

                  <span
                    className={cn(
                      'relative truncate transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden whitespace-nowrap',
                      sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Tooltip for collapsed state with arrow indicator */}
                  {sidebarCollapsed && (
                    <span
                      className={cn(
                        'pointer-events-none absolute left-full z-50 ml-3',
                        'rounded-lg bg-[var(--bg-card)] px-3 py-2',
                        'text-xs font-medium text-[var(--text-primary)]',
                        'border border-[var(--border-color)]',
                        'shadow-xl shadow-black/8 dark:shadow-black/25',
                        'opacity-0 scale-95',
                        'group-hover:animate-tooltip-enter',
                        'whitespace-nowrap'
                      )}
                    >
                      {/* Arrow indicator */}
                      <span className="absolute -left-[5px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rotate-45 border-l border-b border-[var(--border-color)] bg-[var(--bg-card)]" />
                      <span className="relative">{item.label}</span>
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-2">
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2',
            'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-secondary)]',
            'transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-[14px]',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-6 w-6 shrink-0 transition-transform duration-300" />
          ) : (
            <>
              <ChevronsLeft className="h-6 w-6 shrink-0 transition-transform duration-300" />
              <span className="truncate">Restrânge</span>
            </>
          )}
        </button>
      </div>

      {/* User Section — with gradient fade separator */}
      <div
        className={cn(
          'relative p-3 shrink-0',
          sidebarCollapsed ? 'flex justify-center' : ''
        )}
      >
        {/* Gradient fade separator replacing hard border */}
        <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent" />

        <div
          className={cn(
            'flex items-center gap-3 rounded-xl p-2',
            'transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            'hover:bg-[var(--bg-tertiary)]/30',
            sidebarCollapsed ? 'justify-center' : ''
          )}
        >
          {/* Avatar */}
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-primary-500/15 transition-all duration-300 hover:ring-primary-500/30"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 text-[15px] font-bold text-white ring-2 ring-primary-500/15 shadow-md shadow-indigo-500/20 transition-all duration-300 hover:ring-primary-500/30 hover:shadow-lg hover:shadow-indigo-500/25">
              {user ? getInitials(user.firstName, user.lastName) : '??'}
            </div>
          )}

          {!sidebarCollapsed && (
            <div className="flex flex-1 items-center overflow-hidden">
              <div className="min-w-0">
                <p className="truncate text-[17px] font-semibold text-[var(--text-primary)]">
                  {user ? `${user.firstName} ${user.lastName}` : 'Vizitator'}
                </p>
                <p className="truncate text-[15px] text-[var(--text-tertiary)] capitalize">
                  {user?.role === 'admin' ? 'Administrator' : user?.role === 'manager' ? 'Manager' : user?.role ?? 'Necunoscut'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
