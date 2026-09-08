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
  sidebarCollapsed: boolean;
}


export function Topbar({
  onOpenMobileSidebar,
  sidebarCollapsed,
}: TopbarProps) {
  const {
    user,
  } = useAuth();


  const initials = (
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}` ||
    user?.email?.[0] ||
    'U'
  ).toUpperCase();


  return (
    <header
      className="
        fixed
        inset-x-0
        top-0
        z-30

        h-[64px]
        w-full

        border-b
        border-[var(--cf-border-soft)]

        bg-[var(--cf-topbar)]

        backdrop-blur-xl

        transition-colors
        duration-200

        sm:h-[68px]

        lg:sticky
        lg:top-0
        lg:h-[72px]
      "
    >
      {/* ===================================================
          SIDEBAR OFFSET

          The HEADER background stays full-width.
          Only its CONTENT moves past the sidebar.
      =================================================== */}

      <div
        className={`
          h-full

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
        <div
          className="
            mx-auto

            flex
            h-full
            w-full
            max-w-[1480px]

            items-center
            justify-between
            gap-3

            px-4

            sm:px-5
            md:px-6
            lg:px-8
            xl:px-10
          "
        >
          {/* =================================================
              LEFT
          ================================================= */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            {/* Mobile menu */}

            <button
              type="button"
              onClick={
                onOpenMobileSidebar
              }
              aria-label="Open navigation"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-xl

                border
                border-[var(--cf-border)]

                bg-[var(--cf-surface)]

                text-[var(--cf-text-secondary)]

                shadow-[var(--cf-shadow)]

                transition

                hover:bg-[var(--cf-surface-soft)]
                hover:text-[var(--cf-text)]

                active:scale-95

                lg:hidden
              "
            >
              <Menu
                size={18}
              />
            </button>


            {/* Desktop context */}

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


              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    truncate

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

                    truncate

                    text-[10px]

                    text-[var(--cf-text-secondary)]
                  "
                >
                  AI-assisted workspace
                </p>
              </div>
            </div>
          </div>


          {/* =================================================
              RIGHT
          ================================================= */}

          <div
            className="
              flex
              min-w-0
              items-center
              justify-end
              gap-1.5

              sm:gap-2
            "
          >
            {/* Desktop search */}

            <button
              type="button"
              aria-label="Search ClientFlow"
              data-tooltip="Search across ClientFlow"
              className="
                group

                hidden
                h-10

                min-w-0
                items-center
                gap-2.5

                rounded-[10px]

                border
                border-[var(--cf-border)]

                bg-[var(--cf-surface)]

                px-3

                text-left

                shadow-[var(--cf-shadow)]

                transition

                hover:bg-[var(--cf-surface-soft)]

                md:flex
                md:w-[210px]

                lg:w-[240px]

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

                  text-[12px]

                  text-[var(--cf-text-secondary)]

                  xl:text-[13px]
                "
              >
                Search leads, contacts,
                proposals...
              </span>


              <span
                className="
                  hidden
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

                  xl:flex
                "
              >
                <Command
                  size={9}
                />

                K
              </span>
            </button>


            {/* Mobile search */}

            <button
              type="button"
              aria-label="Search"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-xl

                border
                border-[var(--cf-border)]

                bg-[var(--cf-surface)]

                text-[var(--cf-text-secondary)]

                transition

                hover:bg-[var(--cf-surface-soft)]
                hover:text-[var(--cf-primary)]

                active:scale-95

                md:hidden
              "
            >
              <Search
                size={16}
              />
            </button>


            {/* Theme */}

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
                shrink-0
                items-center
                justify-center

                rounded-xl

                border
                border-[var(--cf-border)]

                bg-[var(--cf-surface)]

                text-[var(--cf-text-secondary)]

                transition

                hover:bg-[var(--cf-surface-soft)]
                hover:text-[var(--cf-text)]

                active:scale-95
              "
            >
              <Bell
                size={16}
              />

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


            {/* Divider */}

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


            {/* Account */}

            <button
              type="button"
              aria-label="Open account menu"
              data-tooltip="Account & profile"
              className="
                hidden
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-full

                border
                border-[var(--cf-border)]

                bg-[var(--cf-text)]

                text-[10px]
                font-semibold

                text-[var(--cf-surface)]

                shadow-[var(--cf-shadow)]

                transition

                hover:scale-[1.03]

                sm:flex

                lg:h-11
                lg:w-11
                lg:text-[11px]
              "
            >
              {initials}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}