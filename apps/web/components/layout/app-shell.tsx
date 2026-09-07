'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useState,
} from 'react';

import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useAuth } from '@/components/providers/auth-provider';

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    status,
  } = useAuth();

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  /* =========================================================
     RESTORE SIDEBAR STATE
  ========================================================= */

  useEffect(() => {
    const saved =
      localStorage.getItem(
        'clientflow-sidebar-collapsed',
      );

    if (saved === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  /* =========================================================
     PROTECT AUTHENTICATED ROUTES
  ========================================================= */

  useEffect(() => {
    if (
      status ===
      'unauthenticated'
    ) {
      router.replace('/login');
    }
  }, [
    router,
    status,
  ]);

  /* =========================================================
     COLLAPSE / EXPAND SIDEBAR
  ========================================================= */

  function toggleSidebar() {
    setSidebarCollapsed(
      (current) => {
        const next =
          !current;

        localStorage.setItem(
          'clientflow-sidebar-collapsed',
          String(next),
        );

        return next;
      },
    );
  }

  /* =========================================================
     AUTH LOADING
  ========================================================= */

  if (
    status === 'loading'
  ) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center

          bg-[var(--cf-page)]
          text-[var(--cf-text)]

          transition-colors
          duration-200
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-4
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-xl

              bg-[var(--cf-primary)]

              font-semibold
              text-white

              shadow-[0_8px_24px_rgba(91,91,247,.22)]
            "
          >
            ↗
          </div>

          <div
            className="
              flex
              items-center
              gap-2

              text-sm

              text-[var(--cf-text-secondary)]
            "
          >
            <Loader2
              size={15}
              className="animate-spin"
            />

            Loading ClientFlow
          </div>
        </div>
      </div>
    );
  }

  if (
    status !==
    'authenticated'
  ) {
    return null;
  }

  /* =========================================================
     APPLICATION
  ========================================================= */

  return (
    <div
      className="
        min-h-screen

        bg-[var(--cf-page)]
        text-[var(--cf-text)]

        transition-colors
        duration-200
      "
    >
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        collapsed={
          sidebarCollapsed
        }
        onToggleCollapsed={
          toggleSidebar
        }
        mobileOpen={
          mobileSidebarOpen
        }
        onMobileClose={() =>
          setMobileSidebarOpen(
            false,
          )
        }
      />

      {/* =====================================================
          MAIN APPLICATION AREA
      ====================================================== */}

      <div
        className={`
          min-h-screen

          transition-[padding]
          duration-300
          ease-[cubic-bezier(.22,1,.36,1)]

          ${
            sidebarCollapsed
              ? 'lg:pl-[92px]'
              : 'lg:pl-[272px]'
          }
        `}
      >
        {/* ===================================================
            TOPBAR
        ==================================================== */}

        <Topbar
          onOpenMobileSidebar={() =>
            setMobileSidebarOpen(
              true,
            )
          }
        />

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <main
          className="
            px-4
            pb-10
            pt-6

            sm:px-6

            lg:px-8
            lg:pt-8

            xl:px-10
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1480px]
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}