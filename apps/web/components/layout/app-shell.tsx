'use client';

import {
  Loader2,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useCallback,
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
  const router =
    useRouter();

  const {
    status,
    request,
  } = useAuth();

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] =
    useState(false);

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] =
    useState(false);

  /* =========================================================
     RESTORE SIDEBAR STATE
  ========================================================= */

  useEffect(() => {
    const saved =
      localStorage.getItem(
        'clientflow-sidebar-collapsed',
      );

    if (
      saved === 'true'
    ) {
      setSidebarCollapsed(
        true,
      );
    }
  }, []);

  /* =========================================================
     AUTH GUARD
  ========================================================= */

  useEffect(() => {
    if (
      status ===
      'unauthenticated'
    ) {
      router.replace(
        '/login',
      );
    }
  }, [
    router,
    status,
  ]);

  /* =========================================================
     WARM THE MOST COMMON DATA IN THE BACKGROUND
  ========================================================= */

  useEffect(() => {
    if (
      status !==
      'authenticated'
    ) {
      return;
    }

    /*
     * Wait until the first visible page has had time to render.
     * apiRequest performs request de-duplication, so if the current
     * page already requested one of these URLs this costs no duplicate
     * network request.
     *
     * The data is stored only in a short-lived in-memory cache.
     */
    const timer =
      window.setTimeout(
        () => {
          if (
            document.visibilityState !==
            'visible'
          ) {
            return;
          }

          void Promise.allSettled([
            request(
              '/leads/summary/overview',
            ),

            request(
              '/leads?page=1&pageSize=20&filter=all&sort=priority',
            ),

            request(
              '/leads/pipeline/board?limitPerStage=20',
            ),
          ]);
        },
        700,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    request,
    status,
  ]);

  /* =========================================================
     MOBILE BODY LOCK
  ========================================================= */

  useEffect(() => {
    if (
      !mobileSidebarOpen
    ) {
      return;
    }

    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, [
    mobileSidebarOpen,
  ]);

  /* =========================================================
     ESCAPE CLOSES MOBILE SIDEBAR
  ========================================================= */

  useEffect(() => {
    if (
      !mobileSidebarOpen
    ) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        setMobileSidebarOpen(
          false,
        );
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    mobileSidebarOpen,
  ]);

  /* =========================================================
     STABLE SHELL CALLBACKS
  ========================================================= */

  const openMobileSidebar =
    useCallback(() => {
      setMobileSidebarOpen(
        true,
      );
    }, []);

  const closeMobileSidebar =
    useCallback(() => {
      setMobileSidebarOpen(
        false,
      );
    }, []);

  const toggleSidebar =
    useCallback(() => {
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
    }, []);

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    status ===
    'loading'
  ) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center

          bg-[var(--cf-page)]

          px-4

          text-[var(--cf-text)]
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
              h-11
              w-11
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

              text-[13px]

              text-[var(--cf-text-secondary)]
            "
          >
            <Loader2
              size={15}
              className="
                animate-spin
              "
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

        overflow-x-clip

        bg-[var(--cf-page)]

        text-[var(--cf-text)]

        transition-colors
        duration-200
      "
    >
      <Topbar
        sidebarCollapsed={
          sidebarCollapsed
        }
        onOpenMobileSidebar={
          openMobileSidebar
        }
      />

      <div
        className="
          h-[64px]
          shrink-0

          sm:h-[68px]

          lg:hidden
        "
      />

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
        onMobileClose={
          closeMobileSidebar
        }
      />

      <div
        className={`
          min-h-0
          min-w-0

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
        <main
          className="
            min-w-0

            px-4
            pb-8
            pt-5

            sm:px-5
            sm:pb-10
            sm:pt-6

            md:px-6

            lg:px-8
            lg:pt-8

            xl:px-10
          "
        >
          <div
            className="
              mx-auto

              min-w-0
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
