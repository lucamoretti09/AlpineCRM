import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { useThemeStore } from '@/stores/themeStore';
import AppLayout from '@/components/layouts/AppLayout';
import Dashboard from '@/features/dashboard/components/Dashboard';
import { ContactsPage } from '@/features/contacts/components/ContactsPage';
import { DealsPage } from '@/features/deals/components/DealsPage';
import { TasksPage } from '@/features/tasks/components/TasksPage';
import { TicketsPage } from '@/features/tickets/components/TicketsPage';
import { CalendarPage } from '@/features/calendar/components/CalendarPage';
import { InvoicesPage } from '@/features/invoices/components/InvoicesPage';
import { EmailsPage } from '@/features/emails/components/EmailsPage';
import { SettingsPage } from '@/features/settings/components/SettingsPage';
import CommandPalette from '@/components/common/CommandPalette';
import { useRealtime } from '@/hooks/useRealtime';

function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNav = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleNav);
    return () => window.removeEventListener('popstate', handleNav);
  }, []);

  // Simple client-side navigation helper
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href && anchor.origin === window.location.origin && !anchor.hasAttribute('target')) {
        e.preventDefault();
        const newPath = anchor.pathname;
        if (newPath !== window.location.pathname) {
          window.history.pushState({}, '', newPath);
          setPath(newPath);
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Initialize realtime
  useRealtime();

  // Page title map
  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/contacts': 'Contacts',
    '/deals': 'Deals',
    '/tasks': 'Tasks',
    '/tickets': 'Tickets',
    '/calendar': 'Calendar',
    '/invoices': 'Invoices',
    '/emails': 'Emails',
    '/settings': 'Settings',
  };

  const getPage = () => {
    switch (path) {
      case '/':
      case '/dashboard':
        return <Dashboard />;
      case '/contacts':
        return <ContactsPage />;
      case '/deals':
        return <DealsPage />;
      case '/tasks':
        return <TasksPage />;
      case '/tickets':
        return <TicketsPage />;
      case '/calendar':
        return <CalendarPage />;
      case '/invoices':
        return <InvoicesPage />;
      case '/emails':
        return <EmailsPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <AppLayout title={pageTitles[path] || 'Dashboard'}>
        {getPage()}
      </AppLayout>
      <CommandPalette />
    </>
  );
}

export default function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#0d1025' : '#ffffff',
            color: isDark ? '#eef0fa' : '#0f0d23',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e0e4ef'}`,
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: isDark
              ? '0 8px 30px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)'
              : '0 8px 30px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
    </QueryClientProvider>
  );
}
