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
        'fixed left-0 top-0 z-40 flex h-screen flex-col',
        'bg-[var(--bg-sidebar)] border-r border-[var(--border-color)]',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-[var(--border-color)]',
          'px-4 shrink-0',
          sidebarCollapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/25">
          <Mountain className="h-5 w-5 text-white" />
        </div>
        <span
          className={cn(
            'text-lg font-bold tracking-tight text-[var(--text-primary)]',
            'transition-all duration-300 overflow-hidden whitespace-nowrap',
            sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          Alpine<span className="text-primary-500">CRM</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <ul className="flex flex-col gap-1">
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
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5',
                    'transition-all duration-200 ease-in-out',
                    'text-sm font-medium',
                    sidebarCollapsed && 'justify-center px-0',
                    active
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-500 transition-all duration-200" />
                  )}

                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-transform duration-200',
                      (active || hovered) && 'scale-110'
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
                        'rounded-md bg-[var(--bg-tertiary)] px-2.5 py-1.5',
                        'text-xs font-medium text-[var(--text-primary)]',
                        'border border-[var(--border-color)]',
                        'shadow-lg opacity-0 transition-opacity duration-150',
                        'group-hover:opacity-100 whitespace-nowrap'
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
            'flex w-full items-center gap-3 rounded-lg px-3 py-2',
            'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)]',
            'transition-all duration-200 ease-in-out text-sm',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-5 w-5 shrink-0" />
          ) : (
            <>
              <ChevronsLeft className="h-5 w-5 shrink-0" />
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
            'flex items-center gap-3 rounded-lg p-2',
            'transition-all duration-200',
            sidebarCollapsed ? 'justify-center' : ''
          )}
        >
          {/* Avatar */}
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-primary-500/20"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-semibold text-white ring-2 ring-primary-500/20">
              {user ? getInitials(user.firstName, user.lastName) : '??'}
            </div>
          )}

          {/* User info + logout */}
          {!sidebarCollapsed && (
            <div className="flex flex-1 items-center justify-between overflow-hidden">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                </p>
                <p className="truncate text-xs text-[var(--text-tertiary)]">
                  {user?.role ?? 'Unknown'}
                </p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="ml-2 shrink-0 rounded-md p-1.5 text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200"
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
