'use client';

import {
  Bell,
  Bot,
  ChevronDown,
  CircleHelp,
  ContactRound,
  FileText,
  Gauge,
  GitBranch,
  Inbox,
  LogOut,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserRoundSearch,
  UsersRound,
  X,
} from 'lucide-react';

import Link from 'next/link';
import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  createPortal,
} from 'react-dom';

import {
  useRef,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

import { useAuth } from '@/components/providers/auth-provider';
import { clientFlowSwal } from '@/lib/swal';


/* =========================================================
   TYPES
========================================================= */

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;

  collapsed: boolean;
  onToggleCollapsed: () => void;
}


/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
  {
    label: null,

    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: Gauge,
      },
    ],
  },

  {
    label: 'Sales',

    items: [
      {
        label: 'Leads',
        href: '/leads',
        icon: UserRoundSearch,
      },

      {
        label: 'Pipeline',
        href: '/pipeline',
        icon: GitBranch,
      },

      {
        label: 'Contacts',
        href: '/contacts',
        icon: ContactRound,
      },
    ],
  },

  {
    label: 'Engage',

    items: [
      {
        label: 'Conversations',
        href: '/conversations',
        icon: MessageSquareText,
      },

      {
        label: 'Proposals',
        href: '/proposals',
        icon: FileText,
      },

      {
        label: 'Follow-ups',
        href: '/follow-ups',
        icon: Inbox,
        badge: 3,
      },
    ],
  },

  {
    label: 'Intelligence',

    items: [
      {
        label: 'AI Insights',
        href: '/insights',
        icon: Bot,
      },
    ],
  },

  {
    label: 'Workspace',

    items: [
      {
        label: 'Notifications',
        href: '/notifications',
        icon: Bell,
      },

      {
        label: 'Members',
        href: '/members',
        icon: UsersRound,
      },
    ],
  },
];


/* =========================================================
   SIDEBAR
========================================================= */

export function Sidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    user,
    organization,
    logout,
  } = useAuth();


  const initials = (
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}` ||
    user?.email?.[0] ||
    'U'
  ).toUpperCase();


  const organizationInitials =
    organization?.name
      ?.slice(0, 2)
      .toUpperCase() ??
    'CF';


  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    const result =
      await clientFlowSwal.fire({
        title: 'Sign out?',

        text:
          'You will need to sign in again to access your ClientFlow workspace.',

        showCancelButton: true,

        confirmButtonText:
          'Sign out',

        cancelButtonText:
          'Stay signed in',

        reverseButtons: true,
      });


    if (
      !result.isConfirmed
    ) {
      return;
    }


    await logout();

    router.replace('/login');

    router.refresh();
  }


  return (
    <>
      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      <button
        type="button"
        aria-label="Close navigation"
        onClick={onMobileClose}
        className={`
          fixed
          inset-0
          z-40

          bg-black/45

          backdrop-blur-[3px]

          transition-all
          duration-300

          lg:hidden

          ${mobileOpen
            ? `
                pointer-events-auto
                opacity-100
              `
            : `
                pointer-events-none
                opacity-0
              `
          }
        `}
      />


      {/* ===================================================
          SIDEBAR OUTER
      =================================================== */}

      <aside
        aria-label="Main navigation"
        className={`
          fixed
          z-50

          left-3
          top-3
          bottom-3

          h-[calc(100dvh-24px)]

          w-[min(320px,calc(100vw-24px))]

          transition-[width,transform]
          duration-300
          ease-[cubic-bezier(.22,1,.36,1)]

          ${mobileOpen
            ? 'translate-x-0'
            : '-translate-x-[110%]'
          }

          lg:h-[calc(100vh-24px)]
          lg:translate-x-0

          ${collapsed
            ? 'lg:w-[70px]'
            : 'lg:w-[248px]'
          }
        `}
      >
        {/* =================================================
            SIDEBAR SURFACE
        ================================================= */}

        <div
          className="
            flex
            h-full
            min-h-0
            flex-col

            overflow-hidden

            rounded-[20px]

            border
            border-[var(--cf-sidebar-border)]

            bg-[var(--cf-sidebar)]

            text-[var(--cf-sidebar-text)]

            shadow-[0_24px_70px_rgba(0,0,0,.18)]
          "
        >
          {/* =================================================
              MOBILE HEADER
          ================================================= */}

          <div
            className="
              flex
              h-[72px]
              shrink-0
              items-center
              justify-between

              px-4

              lg:hidden
            "
          >
            <Link
              href="/dashboard"
              onClick={onMobileClose}
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >
              <ClientFlowLogo />

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    truncate

                    text-[18px]
                    font-semibold
                    tracking-[-0.45px]
                  "
                >
                  ClientFlow
                </p>

                <p
                  className="
                    mt-[1px]

                    truncate

                    text-[10px]

                    text-[var(--cf-sidebar-muted)]
                  "
                >
                  Client acquisition OS
                </p>
              </div>
            </Link>


            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close sidebar"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-xl

                text-[var(--cf-sidebar-muted)]

                transition

                hover:bg-[var(--cf-sidebar-hover)]
                hover:text-[var(--cf-sidebar-text)]

                active:scale-95
              "
            >
              <X
                size={19}
                strokeWidth={1.8}
              />
            </button>
          </div>


          {/* =================================================
              DESKTOP HEADER
          ================================================= */}

          <div
            className={`
              hidden
              h-[70px]
              shrink-0
              items-center

              lg:flex

              ${collapsed
                ? `
                    justify-center
                    px-2
                  `
                : `
                    justify-between
                    px-4
                  `
              }
            `}
          >
            {collapsed ? (
              <SidebarTooltip
                text="Expand sidebar"
                enabled
              >
                <button
                  type="button"
                  onClick={onToggleCollapsed}
                  aria-label="Expand sidebar"
                  className="
        group

        relative

        flex
        h-11
        w-full
        items-center
        justify-center

        rounded-xl

        transition-all
        duration-150

        hover:bg-[var(--cf-sidebar-hover)]

        active:scale-[0.985]
      "
                >
                  {/* ===============================================
          DEFAULT: CLIENTFLOW PURPLE LOGO
      =============================================== */}

                  <span
                    className="
          absolute

          flex
          h-8
          w-8
          items-center
          justify-center

          rounded-lg

          bg-[var(--cf-primary)]

          text-[12px]
          font-semibold
          text-white

          shadow-[0_5px_14px_rgba(91,91,247,.22)]

          transition-all
          duration-150

          group-hover:scale-90
          group-hover:opacity-0
        "
                  >
                    ↗
                  </span>


                  {/* ===============================================
          HOVER: EXPAND SIDEBAR ICON
      =============================================== */}

                  <PanelLeftOpen
                    size={18}
                    strokeWidth={1.8}
                    className="
          absolute

          scale-90

          text-[var(--cf-sidebar-text)]

          opacity-0

          transition-all
          duration-150

          group-hover:scale-100
          group-hover:opacity-100
        "
                  />
                </button>
              </SidebarTooltip>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                  "
                >
                  <ClientFlowLogo />

                  <div
                    className="
                      min-w-0
                    "
                  >
                    <p
                      className="
                        truncate

                        text-[18px]
                        font-semibold
                        tracking-[-0.45px]
                      "
                    >
                      ClientFlow
                    </p>

                    <p
                      className="
                        mt-[1px]

                        truncate

                        text-[10px]

                        text-[var(--cf-sidebar-muted)]
                      "
                    >
                      Client acquisition OS
                    </p>
                  </div>
                </Link>


                <button
                  type="button"
                  onClick={
                    onToggleCollapsed
                  }
                  aria-label="Collapse sidebar"
                  data-tooltip="Collapse sidebar"
                  data-tooltip-position="bottom"
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    text-[var(--cf-sidebar-muted)]

                    transition

                    hover:bg-[var(--cf-sidebar-hover)]
                    hover:text-[var(--cf-sidebar-text)]
                  "
                >
                  <PanelLeftClose
                    size={18}
                    strokeWidth={1.7}
                  />
                </button>
              </>
            )}
          </div>


          {/* =================================================
              WORKSPACE
          ================================================= */}

          <div
            className={`
              mx-3
              mb-3

              rounded-xl

              border
              border-[var(--cf-sidebar-border)]

              bg-[var(--cf-sidebar-elevated)]

              p-2

              transition-all

              ${collapsed
                ? `
                    lg:mx-2
                    lg:p-1
                  `
                : ''
              }
            `}
          >
            <SidebarTooltip
              text={
                organization?.name ??
                'Workspace'
              }
              enabled={collapsed}
            >
              <button
                type="button"
                aria-label={
                  organization?.name ??
                  'Workspace'
                }
                className={`
                  group

                  flex
                  w-full
                  items-center

                  gap-3

                  rounded-lg

                  px-2
                  py-2.5

                  transition

                  hover:bg-[var(--cf-sidebar-hover)]

                  ${collapsed
                    ? `
                        lg:h-11
                        lg:justify-center
                        lg:gap-0
                        lg:px-0
                        lg:py-0
                      `
                    : ''
                  }
                `}
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center

                    rounded-lg

                    bg-[var(--cf-primary-soft)]

                    text-[11px]
                    font-semibold

                    text-[var(--cf-primary)]
                  "
                >
                  {
                    organizationInitials
                  }
                </div>


                <div
                  className={`
                    min-w-0
                    flex-1
                    text-left

                    ${collapsed
                      ? 'lg:hidden'
                      : ''
                    }
                  `}
                >
                  <p
                    className="
                      truncate

                      text-[13px]
                      font-semibold

                      text-[var(--cf-sidebar-text)]
                    "
                  >
                    {organization?.name ??
                      'Workspace'}
                  </p>

                  <p
                    className="
                      mt-[2px]

                      text-[10px]

                      text-[var(--cf-sidebar-muted)]
                    "
                  >
                    Current workspace
                  </p>
                </div>


                <ChevronDown
                  size={14}
                  className={`
                    shrink-0

                    text-[var(--cf-sidebar-muted)]

                    ${collapsed
                      ? 'lg:hidden'
                      : ''
                    }
                  `}
                />
              </button>
            </SidebarTooltip>
          </div>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav
            className={`
              cf-sidebar-scroll

              min-h-0
              flex-1

              overflow-y-auto
              overflow-x-hidden

              px-3
              pb-4

              ${collapsed
                ? 'lg:px-2'
                : ''
              }
            `}
          >
            {navigation.map(
              (
                group,
                index,
              ) => (
                <div
                  key={
                    group.label ??
                    `main-${index}`
                  }
                  className={`
                    ${index > 0
                      ? 'mt-5'
                      : ''
                    }

                    ${collapsed &&
                      index > 0
                      ? 'lg:mt-2'
                      : ''
                    }
                  `}
                >
                  {/* SECTION LABEL */}

                  {group.label && (
                    <p
                      className={`
                        mb-2
                        px-2.5

                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]

                        text-[var(--cf-sidebar-muted)]

                        ${collapsed
                          ? 'lg:hidden'
                          : ''
                        }
                      `}
                    >
                      {
                        group.label
                      }
                    </p>
                  )}


                  {/* COLLAPSED DESKTOP DIVIDER */}

                  {group.label &&
                    collapsed && (
                      <div
                        className="
                          mx-2
                          mb-2

                          hidden
                          h-px

                          bg-[var(--cf-sidebar-border)]

                          lg:block
                        "
                      />
                    )}


                  <div
                    className="
                      space-y-1
                    "
                  >
                    {group.items.map(
                      (item) => {
                        const Icon =
                          item.icon;

                        const active =
                          pathname ===
                          item.href ||
                          pathname.startsWith(
                            `${item.href}/`,
                          );


                        return (
                          <SidebarTooltip
                            key={
                              item.href
                            }
                            text={
                              item.label
                            }
                            enabled={
                              collapsed
                            }
                          >
                            <Link
                              href={
                                item.href
                              }
                              onClick={
                                onMobileClose
                              }
                              aria-label={
                                item.label
                              }
                              className={`
                                group

                                relative

                                flex
                                min-h-[44px]
                                w-full
                                items-center

                                gap-3

                                rounded-xl

                                px-3

                                text-[14px]
                                font-medium

                                transition-all
                                duration-150

                                active:scale-[0.985]

                                ${collapsed
                                  ? `
                                      lg:justify-center
                                      lg:gap-0
                                      lg:px-0
                                    `
                                  : ''
                                }

                                ${active
                                  ? `
                                      bg-[var(--cf-sidebar-active)]

                                      text-[var(--cf-sidebar-text)]
                                    `
                                  : `
                                      text-[var(--cf-sidebar-text)]/80

                                      hover:bg-[var(--cf-sidebar-hover)]
                                      hover:text-[var(--cf-sidebar-text)]
                                    `
                                }
                              `}
                            >
                              {active && (
                                <span
                                  className="
                                    absolute
                                    left-0

                                    h-6
                                    w-[2px]

                                    rounded-r-full

                                    bg-[var(--cf-primary)]
                                  "
                                />
                              )}


                              <Icon
                                size={18}
                                strokeWidth={
                                  active
                                    ? 2
                                    : 1.8
                                }
                                className={`
                                  shrink-0

                                  ${active
                                    ? 'text-[var(--cf-primary)]'
                                    : ''
                                  }
                                `}
                              />


                              <span
                                className={`
                                  min-w-0
                                  flex-1
                                  truncate

                                  ${collapsed
                                    ? 'lg:hidden'
                                    : ''
                                  }
                                `}
                              >
                                {
                                  item.label
                                }
                              </span>


                              {'badge' in
                                item &&
                                item.badge && (
                                  <span
                                    className={`
                                      flex
                                      min-w-5
                                      shrink-0
                                      items-center
                                      justify-center

                                      rounded-full

                                      bg-[var(--cf-primary)]

                                      px-1.5
                                      py-[2px]

                                      text-[9px]
                                      font-semibold
                                      text-white

                                      ${collapsed
                                        ? `
                                            lg:absolute
                                            lg:right-[3px]
                                            lg:top-[3px]

                                            lg:h-[14px]
                                            lg:min-w-[14px]

                                            lg:px-[3px]

                                            lg:text-[7px]
                                          `
                                        : ''
                                      }
                                    `}
                                  >
                                    {
                                      item.badge
                                    }
                                  </span>
                                )}
                            </Link>
                          </SidebarTooltip>
                        );
                      },
                    )}
                  </div>
                </div>
              ),
            )}
          </nav>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className={`
              shrink-0

              border-t
              border-[var(--cf-sidebar-border)]

              p-3

              ${collapsed
                ? 'lg:p-2'
                : ''
              }
            `}
          >
            <SidebarFooterAction
              collapsed={
                collapsed
              }
              label="Settings"
              href="/settings"
              icon={
                <Settings
                  size={17}
                />
              }
              onMobileClose={
                onMobileClose
              }
            />


            <SidebarFooterAction
              collapsed={
                collapsed
              }
              label="Help & support"
              icon={
                <CircleHelp
                  size={17}
                />
              }
              onMobileClose={
                onMobileClose
              }
            />


            <div
              className="
                my-2
                h-px

                bg-[var(--cf-sidebar-border)]
              "
            />


            {/* ===============================================
                USER
            ================================================ */}

            <SidebarTooltip
              text="Account & profile"
              enabled={collapsed}
            >
              <div
                className={`
                  group

                  flex
                  min-h-[48px]
                  w-full
                  items-center

                  gap-2.5

                  rounded-xl

                  px-2

                  transition

                  hover:bg-[var(--cf-sidebar-hover)]

                  ${collapsed
                    ? `
                        lg:justify-center
                        lg:gap-0
                        lg:px-0
                      `
                    : ''
                  }
                `}
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center

                    rounded-full

                    bg-[#5b5bf7]

                    text-[10px]
                    font-semibold
                    text-white
                  "
                >
                  {initials}
                </div>


                <div
                  className={`
                    min-w-0
                    flex-1

                    ${collapsed
                      ? 'lg:hidden'
                      : ''
                    }
                  `}
                >
                  <p
                    className="
                      truncate

                      text-[12px]
                      font-semibold

                      text-[var(--cf-sidebar-text)]
                    "
                  >
                    {user?.firstName ||
                      user?.lastName
                      ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
                      : user?.email}
                  </p>

                  <p
                    className="
                      mt-[1px]

                      truncate

                      text-[10px]

                      text-[var(--cf-sidebar-muted)]
                    "
                  >
                    {user?.email}
                  </p>
                </div>


                {/* Always visible on mobile.
                    Hidden only on collapsed desktop. */}

                <button
                  type="button"
                  onClick={() =>
                    void handleLogout()
                  }
                  aria-label="Sign out"
                  data-tooltip="Sign out"
                  data-tooltip-position="top"
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center

                    rounded-lg

                    text-[var(--cf-sidebar-muted)]

                    transition

                    hover:bg-red-400/10
                    hover:text-red-400

                    ${collapsed
                      ? 'lg:hidden'
                      : ''
                    }
                  `}
                >
                  <LogOut
                    size={15}
                  />
                </button>
              </div>
            </SidebarTooltip>
          </div>
        </div>
      </aside>
    </>
  );
}


/* =========================================================
   LOGO
========================================================= */

function ClientFlowLogo({
  size = 'normal',
}: {
  size?:
  | 'normal'
  | 'small';
}) {
  return (
    <div
      className={`
        flex
        shrink-0
        items-center
        justify-center

        rounded-xl

        bg-[#5b5bf7]

        font-semibold
        text-white

        shadow-[0_7px_18px_rgba(91,91,247,.25)]

        ${size === 'small'
          ? `
              h-9
              w-9
              text-sm
            `
          : `
              h-10
              w-10
              text-sm
            `
        }
      `}
    >
      ↗
    </div>
  );
}


/* =========================================================
   FOOTER ACTION
========================================================= */

function SidebarFooterAction({
  collapsed,
  label,
  icon,
  href,
  onMobileClose,
}: {
  collapsed: boolean;
  label: string;
  icon: ReactNode;
  href?: string;
  onMobileClose: () => void;
}) {
  const classes = `
    group

    flex
    h-10
    w-full
    items-center

    gap-3

    rounded-lg

    px-2.5

    text-[13px]
    font-medium

    text-[var(--cf-sidebar-text)]/80

    transition

    hover:bg-[var(--cf-sidebar-hover)]
    hover:text-[var(--cf-sidebar-text)]

    ${collapsed
      ? `
          lg:justify-center
          lg:gap-0
          lg:px-0
        `
      : ''
    }
  `;


  const content = (
    <>
      <span
        className="
          shrink-0
        "
      >
        {icon}
      </span>

      <span
        className={`
          min-w-0
          flex-1
          truncate

          ${collapsed
            ? 'lg:hidden'
            : ''
          }
        `}
      >
        {label}
      </span>
    </>
  );


  if (href) {
    return (
      <SidebarTooltip
        text={label}
        enabled={collapsed}
      >
        <Link
          href={href}
          aria-label={label}
          onClick={
            onMobileClose
          }
          className={classes}
        >
          {content}
        </Link>
      </SidebarTooltip>
    );
  }


  return (
    <SidebarTooltip
      text={label}
      enabled={collapsed}
    >
      <button
        type="button"
        aria-label={label}
        className={classes}
      >
        {content}
      </button>
    </SidebarTooltip>
  );
}


/* =========================================================
   SIDEBAR PORTAL TOOLTIP
========================================================= */

function SidebarTooltip({
  text,
  enabled,
  children,
}: {
  text: string;
  enabled: boolean;
  children: ReactNode;
}) {
  const anchorRef =
    useRef<HTMLDivElement>(
      null,
    );


  const [
    position,
    setPosition,
  ] = useState<{
    top: number;
    left: number;
  } | null>(null);


  function showTooltip() {
    if (
      !enabled ||
      !anchorRef.current
    ) {
      return;
    }


    const canHover =
      window.matchMedia(
        '(hover: hover) and (pointer: fine)',
      ).matches;


    if (!canHover) {
      return;
    }


    const rect =
      anchorRef.current.getBoundingClientRect();


    setPosition({
      top:
        rect.top +
        rect.height / 2,

      left:
        rect.right + 12,
    });
  }


  function hideTooltip() {
    setPosition(null);
  }


  return (
    <div
      ref={anchorRef}
      onMouseEnter={
        showTooltip
      }
      onMouseLeave={
        hideTooltip
      }
      onPointerDown={
        hideTooltip
      }
      className="
        relative
        w-full
      "
    >
      {children}


      {enabled &&
        position &&
        createPortal(
          <div
            role="tooltip"
            style={{
              top:
                position.top,

              left:
                position.left,
            }}
            className="
              pointer-events-none

              fixed
              z-[9999]

              -translate-y-1/2
            "
          >
            <div
              className="
                cf-sidebar-tooltip-content

                whitespace-nowrap

                rounded-lg

                border
                border-[var(--cf-border)]

                bg-[var(--cf-text)]

                px-2.5
                py-1.5

                text-[11px]
                font-medium

                text-[var(--cf-surface)]

                shadow-[0_8px_30px_rgba(0,0,0,.16)]
              "
            >
              {text}
            </div>
          </div>,

          document.body,
        )}
    </div>
  );
}