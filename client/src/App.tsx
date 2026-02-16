import { lazy, Suspense, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { useThemeStore } from '@/stores/themeStore';
import AppLayout from '@/components/layouts/AppLayout';
import { useRealtime } from '@/hooks/useRealtime';

// Lazy-load all feature pages for code-splitting
const Dashboard = lazy(() => import('@/features/dashboard/components/Dashboard'));
const ContactsPage = lazy(() => import('@/features/contacts/components/ContactsPage').then(m => ({ default: m.ContactsPage })));
const DealsPage = lazy(() => import('@/features/deals/components/DealsPage').then(m => ({ default: m.DealsPage })));
const TasksPage = lazy(() => import('@/features/tasks/components/TasksPage').then(m => ({ default: m.TasksPage })));
const TicketsPage = lazy(() => import('@/features/tickets/components/TicketsPage').then(m => ({ default: m.TicketsPage })));
const CalendarPage = lazy(() => import('@/features/calendar/components/CalendarPage').then(m => ({ default: m.CalendarPage })));
const InvoicesPage = lazy(() => import('@/features/invoices/components/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
const EmailsPage = lazy(() => import('@/features/emails/components/EmailsPage').then(m => ({ default: m.EmailsPage })));
const SettingsPage = lazy(() => import('@/features/settings/components/SettingsPage').then(m => ({ default: m.SettingsPage })));
const CommandPalette = lazy(() => import('@/components/common/CommandPalette'));

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
    '/': 'Panou Principal',
    '/dashboard': 'Panou Principal',
    '/contacts': 'Contacte',
    '/deals': 'Tranzacții',
    '/tasks': 'Sarcini',
    '/tickets': 'Tichete',
    '/calendar': 'Calendar',
    '/invoices': 'Facturi',
    '/emails': 'Email-uri',
    '/settings': 'Setări',
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
      <AppLayout title={pageTitles[path] || 'Panou Principal'}>
        <Suspense
          fallback={
            <div className="flex h-[60vh] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500" />
                <p className="text-[15px] font-medium text-[var(--text-tertiary)] animate-pulse">Se încarcă...</p>
              </div>
            </div>
          }
        >
          {getPage()}
        </Suspense>
      </AppLayout>
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
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
            fontSize: '15px',
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
