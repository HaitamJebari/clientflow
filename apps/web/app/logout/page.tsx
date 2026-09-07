'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useAuth } from '@/components/providers/auth-provider';

export default function LogoutPage() {
  const router = useRouter();

  const {
    logout,
    status,
  } = useAuth();

  const started = useRef(false);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (started.current) {
      return;
    }

    started.current = true;

    async function handleLogout() {
      try {
        if (status === 'authenticated') {
          await logout();
        }
      } finally {
        router.replace('/login');
        router.refresh();
      }
    }

    void handleLogout();
  }, [
    logout,
    router,
    status,
  ]);

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[var(--cf-page)]
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
            bg-[#5b5bf7]
            text-lg
            font-semibold
            text-white
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
            size={16}
            className="animate-spin"
          />

          Signing you out...
        </div>
      </div>
    </main>
  );
}