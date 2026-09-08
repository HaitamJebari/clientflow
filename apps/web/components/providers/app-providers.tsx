'use client';

import {
  Toaster,
} from 'sonner';

import {
  AuthProvider,
} from '@/components/providers/auth-provider';

import {
  GlobalTooltip,
} from '@/components/ui/global-tooltip';


export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}

      {/* ===================================================
          GLOBAL PORTAL TOOLTIPS

          Rendered directly into document.body so cards,
          tables, overflow containers and the topbar can
          never cover or clip them.
      =================================================== */}

      <GlobalTooltip />


      <Toaster
        position="top-right"
        closeButton
        richColors
      />
    </AuthProvider>
  );
}