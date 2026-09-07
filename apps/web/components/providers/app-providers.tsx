'use client';

import {
  Toaster,
} from 'sonner';

import {
  AuthProvider,
} from './auth-provider';

export function AppProviders({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}

      <Toaster
        position="top-right"
        closeButton
        richColors
      />
    </AuthProvider>
  );
}