'use client';

import {
  Bell,
  Command,
  Menu,
  Search,
  Sparkles,
} from 'lucide-react';

import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useAuth } from '@/components/providers/auth-provider';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export function Topbar({
  onOpenMobileSidebar,
}: TopbarProps) {
  const { user } = useAuth();

  const initials = (
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}` ||
    user?.email?.[0] ||
    'U'
  ).toUpperCase();

  return (
    <header
      className="
        sticky
        top-0
        z-30

        h-[72px]

        border-b
        border-[var(--cf-border-soft)]

        bg-[var(--cf-topbar)]

        backdrop-blur-xl

        transition-colors
        duration-200
      "
    >
      <div
        className="
          mx-auto

          flex
          h-full
          w-full
          max-w-[1480px]

          items-center
          justify-between
          gap-4

          px-4

          sm:px-6
          lg:px-8
          xl:px-10
        "
      >
        {/* LEFT */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Open navigation"
            data-tooltip="Open navigation"
            className="
              flex
              h-10
              w-10
              shrink-0

              items-center
              justify-center

              rounded-lg

              border
              border-[var(--cf-border)]

              bg-[var(--cf-surface)]

              text-[var(--cf-text-secondary)]

              shadow-[var(--cf-shadow)]

              transition

              hover:bg-[var(--cf-surface-soft)]
              hover:text-[var(--cf-text)]

              lg:hidden
            "
          >
            <Menu size={18} />
          </button>

          <div
            className="
              hidden
              min-w-0
              items-center
              gap-3

              lg:flex
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                shrink-0

                items-center
                justify-center

                rounded-lg

                bg-[var(--cf-primary-soft)]

                text-[var(--cf-primary)]
              "
            >
              <Sparkles
                size={14}
              />
            </div>

            <div>
              <p
                className="
                  text-[12px]
                  font-semibold

                  text-[var(--cf-text)]
                "
              >
                Client acquisition
              </p>

              <p
                className="
                  mt-[2px]

                  text-[10px]

                  text-[var(--cf-text-secondary)]
                "
              >
                AI-assisted workspace
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          {/* Search */}

          <button
            type="button"
            aria-label="Search ClientFlow"
            data-tooltip="Search across ClientFlow"
            className="
              group

              hidden
              h-10
              w-[280px]

              items-center
              gap-2.5

              rounded-[10px]

              border
              border-[var(--cf-border)]

              bg-[var(--cf-surface)]

              px-3

              text-left

              shadow-[var(--cf-shadow)]

              transition-all
              duration-200

              hover:bg-[var(--cf-surface-soft)]

              md:flex
              xl:w-[330px]
            "
          >
            <Search
              size={15}
              strokeWidth={1.9}
              className="
                shrink-0

                text-[var(--cf-text-secondary)]

                transition

                group-hover:text-[var(--cf-primary)]
              "
            />

            <span
              className="
                min-w-0
                flex-1
                truncate

                text-[13px]

                text-[var(--cf-text-secondary)]
              "
            >
              Search leads, contacts,
              proposals...
            </span>

            <span
              className="
                flex
                shrink-0

                items-center
                gap-[4px]

                rounded-[6px]

                border
                border-[var(--cf-border-soft)]

                bg-[var(--cf-surface-soft)]

                px-2
                py-[4px]

                text-[9px]
                font-medium

                text-[var(--cf-text-muted)]
              "
            >
              <Command size={9} />
              K
            </span>
          </button>

          {/* Mobile search */}

          <button
            type="button"
            aria-label="Search"
            data-tooltip="Search"
            className="
              flex
              h-10
              w-10

              items-center
              justify-center

              rounded-lg

              border
              border-[var(--cf-border)]

              bg-[var(--cf-surface)]

              text-[var(--cf-text-secondary)]

              transition

              hover:bg-[var(--cf-surface-soft)]
              hover:text-[var(--cf-primary)]

              md:hidden
            "
          >
            <Search size={16} />
          </button>

          <ThemeToggle />

          {/* Notifications */}

          <button
            type="button"
            aria-label="Notifications"
            data-tooltip="Notifications"
            className="
              relative

              flex
              h-10
              w-10

              items-center
              justify-center

              rounded-lg

              border
              border-[var(--cf-border)]

              bg-[var(--cf-surface)]

              text-[var(--cf-text-secondary)]

              transition

              hover:bg-[var(--cf-surface-soft)]
              hover:text-[var(--cf-text)]
            "
          >
            <Bell size={16} />

            <span
              className="
                absolute
                right-[8px]
                top-[8px]

                h-[7px]
                w-[7px]

                rounded-full

                border
                border-[var(--cf-surface)]

                bg-[var(--cf-primary)]
              "
            />
          </button>

          <div
            className="
              mx-1
              hidden
              h-6
              w-px

              bg-[var(--cf-border-soft)]

              sm:block
            "
          />

          {/* User */}

          <button
            type="button"
            aria-label="Open account menu"
            data-tooltip="Account & profile"
            className="
              flex
              h-11
              w-11

              items-center
              justify-center

              rounded-full

              border
              border-[var(--cf-border)]

              bg-[var(--cf-text)]

              text-[11px]
              font-semibold

              text-[var(--cf-surface)]

              shadow-[var(--cf-shadow)]

              transition

              hover:scale-[1.03]
            "
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  );
}