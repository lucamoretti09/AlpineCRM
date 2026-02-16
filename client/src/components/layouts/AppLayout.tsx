import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/layouts/Sidebar';
import Navbar from '@/components/layouts/Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();

  useEffect(() => {
    function handleResize() {
      const isSmall = window.innerWidth < 768;
      if (isSmall && !sidebarCollapsed) {
        toggleSidebar();
      }
    }

    if (window.innerWidth < 768 && !sidebarCollapsed) {
      toggleSidebar();
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="noise-overlay flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300 ease-spring min-w-0',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        )}
      >
        {/* Top Navbar */}
        <Navbar title={title} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-6 py-6 animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
