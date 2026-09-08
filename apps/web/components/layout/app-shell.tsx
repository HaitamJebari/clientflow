'use client';

import {
  Loader2,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

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
  const router =
    useRouter();

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
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
          'Escape' &&
        mobileSidebarOpen
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
     COLLAPSE
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
     LOADING
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
      {/* =====================================================
          TOPBAR

          Full viewport width.
          Sidebar sits ABOVE it because:
          Topbar  = z-30
          Sidebar = z-50
      ====================================================== */}

      <Topbar
        sidebarCollapsed={
          sidebarCollapsed
        }
        onOpenMobileSidebar={() =>
          setMobileSidebarOpen(
            true,
          )
        }
      />
      {/* Mobile topbar spacer */}
      <div
        className="
          h-[64px]
          shrink-0

          sm:h-[68px]

          lg:hidden
        "
      />

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
          PAGE CONTENT

          Only PAGE CONTENT is offset.

          Topbar itself is NOT inside this container anymore.
      ====================================================== */}

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