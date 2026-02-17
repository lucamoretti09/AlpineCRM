import { useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/layouts/Sidebar';
import Navbar from '@/components/layouts/Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
}

function Breadcrumbs() {
  const path = window.location.pathname;
  const isDashboard = path === '/' || path === '/dashboard';

  if (isDashboard) return null;

  return (
    <nav className="flex items-center gap-1.5 px-4 md:px-6 pt-4 md:pt-5 pb-1 text-[13px] animate-fadeIn">
      <a
        href="/dashboard"
        className="flex items-center gap-1 text-[var(--text-tertiary)] hover:text-primary-500 transition-colors duration-200"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Acasă</span>
      </a>
      <ChevronRight className="h-3 w-3 text-[var(--text-tertiary)]/50" />
      <span className="font-medium text-[var(--text-primary)]">
        {getBreadcrumbLabel(path)}
      </span>
    </nav>
  );
}

function getBreadcrumbLabel(path: string): string {
  const labels: Record<string, string> = {
    '/contacts': 'Contacte',
    '/deals': 'Tranzacții',
    '/tasks': 'Sarcini',
    '/tickets': 'Tichete',
    '/calendar': 'Calendar',
    '/invoices': 'Facturi',
    '/emails': 'Email-uri',
    '/settings': 'Setări',
  };
  return labels[path] || 'Pagină';
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { sidebarCollapsed, mobileMenuOpen, closeMobileMenu } = useThemeStore();

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) closeMobileMenu();
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMobileMenu]);

  return (
    <div className="noise-overlay flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Skip to main content - accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-primary-500 focus:text-white focus:text-[15px] focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        Sari la conținut
      </a>

      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay — enhanced blur + darken */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-md backdrop-saturate-150 md:hidden transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          onClick={closeMobileMenu}
          role="button"
          aria-label="Închide meniul"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeMobileMenu(); }}
        />
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'layout-mesh-bg flex flex-1 flex-col min-w-0',
          'transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          // Mobile: no margin (sidebar is overlay). Desktop: sidebar offset
          'ml-0',
          sidebarCollapsed ? 'md:ml-[90px]' : 'md:ml-[340px]'
        )}
      >
        {/* Top Navbar */}
        <Navbar title={title} />

        {/* Scrollable Content */}
        <main id="main-content" role="main" className="relative z-[1] flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6 animate-fadeIn">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
