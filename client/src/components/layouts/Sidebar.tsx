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
  LogOut,
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
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Contacts', icon: Users, path: '/contacts' },
  { label: 'Deals', icon: HandCoins, path: '/deals' },
  { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { label: 'Tickets', icon: Ticket, path: '/tickets' },
  { label: 'Calendar', icon: Calendar, path: '/calendar' },
  { label: 'Invoices', icon: FileText, path: '/invoices' },
  { label: 'Emails', icon: Mail, path: '/emails' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();
  const { user, logout } = useAuthStore();
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
        'border-r border-[var(--border-color)]',
        'transition-all duration-300 ease-spring',
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          'flex h-[68px] items-center border-b border-[var(--border-color)]',
          'px-4 shrink-0',
          sidebarCollapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20">
            <Mountain className="h-5 w-5 text-white" />
          </div>
        </div>
        <div
          className={cn(
            'transition-all duration-300 overflow-hidden whitespace-nowrap',
            sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Alpine<span className="text-primary-500">CRM</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <ul className="flex flex-col gap-0.5">
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
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5',
                    'transition-all duration-200 ease-spring',
                    'text-[13.5px] font-medium',
                    sidebarCollapsed && 'justify-center px-0',
                    active
                      ? 'bg-primary-500/[0.08] text-primary-500 dark:bg-primary-500/[0.12]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/60 hover:text-[var(--text-primary)]'
                  )}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary-400 to-primary-600 shadow-sm shadow-primary-500/30 transition-all duration-300" />
                  )}

                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 transition-all duration-200',
                      active && 'drop-shadow-sm',
                      (active || hovered) && 'scale-105'
                    )}
                  />

                  <span
                    className={cn(
                      'truncate transition-all duration-300 overflow-hidden whitespace-nowrap',
                      sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <span
                      className={cn(
                        'pointer-events-none absolute left-full z-50 ml-3',
                        'rounded-lg bg-[var(--bg-card)] px-3 py-2',
                        'text-xs font-medium text-[var(--text-primary)]',
                        'border border-[var(--border-color)]',
                        'shadow-xl opacity-0 transition-all duration-200 scale-95',
                        'group-hover:opacity-100 group-hover:scale-100 whitespace-nowrap'
                      )}
                    >
                      {item.label}
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
            'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]/60 hover:text-[var(--text-secondary)]',
            'transition-all duration-200 ease-spring text-[13px]',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <>
              <ChevronsLeft className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User Section */}
      <div
        className={cn(
          'border-t border-[var(--border-color)] p-3 shrink-0',
          sidebarCollapsed ? 'flex justify-center' : ''
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl p-2',
            'transition-all duration-200',
            sidebarCollapsed ? 'justify-center' : ''
          )}
        >
          {/* Avatar */}
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-9 w-9 shrink-0 rounded-xl object-cover ring-2 ring-primary-500/15"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 text-[11px] font-bold text-white ring-2 ring-primary-500/15 shadow-sm shadow-indigo-500/20">
              {user ? getInitials(user.firstName, user.lastName) : '??'}
            </div>
          )}

          {/* User info + logout */}
          {!sidebarCollapsed && (
            <div className="flex flex-1 items-center justify-between overflow-hidden">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                </p>
                <p className="truncate text-[11px] text-[var(--text-tertiary)] capitalize">
                  {user?.role ?? 'Unknown'}
                </p>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="ml-2 shrink-0 rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
