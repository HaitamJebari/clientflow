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
        aria-label="Close sidebar"
        onClick={onMobileClose}
        className={`
          fixed
          inset-0
          z-40

          bg-black/40
          backdrop-blur-[2px]

          transition-all
          duration-300

          lg:hidden

          ${
            mobileOpen
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
          SIDEBAR CONTAINER
      =================================================== */}

      <aside
        className={`
          fixed
          z-50

          inset-y-0
          left-0

          w-[272px]

          transition-[width,transform]
          duration-300
          ease-[cubic-bezier(.22,1,.36,1)]

          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }

          lg:bottom-3
          lg:left-3
          lg:top-3

          lg:h-[calc(100vh-24px)]

          lg:translate-x-0

          ${
            collapsed
              ? 'lg:w-[70px]'
              : 'lg:w-[248px]'
          }
        `}
      >
        <div
          className="
            flex
            h-full
            min-h-0
            flex-col

            overflow-hidden

            rounded-[18px]

            border
            border-[var(--cf-sidebar-border)]

            bg-[var(--cf-sidebar)]

            text-[var(--cf-sidebar-text)]

            shadow-[var(--cf-shadow)]
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className={`
              flex
              h-[70px]
              shrink-0
              items-center

              px-4

              ${
                collapsed
                  ? 'lg:justify-center'
                  : 'lg:justify-between'
              }
            `}
          >
            {/* ===============================================
                COLLAPSED LOGO
                Hover = expand icon + tooltip
            ================================================ */}

            {collapsed ? (
              <SidebarTooltip
                text="Expand sidebar"
                enabled
                align="right"
                wrapperClassName="
                  hidden
                  justify-center
                  lg:flex
                "
              >
                <button
                  type="button"
                  onClick={
                    onToggleCollapsed
                  }
                  aria-label="Expand sidebar"
                  className="
                    group
                    relative

                    flex
                    h-10
                    w-10
                    items-center
                    justify-center

                    rounded-xl

                    transition

                    hover:bg-[var(--cf-sidebar-hover)]
                  "
                >
                  {/* ClientFlow logo */}

                  <div
                    className="
                      absolute

                      flex
                      h-9
                      w-9
                      items-center
                      justify-center

                      rounded-xl

                      bg-[#5b5bf7]

                      text-sm
                      font-semibold
                      text-white

                      shadow-[0_7px_18px_rgba(91,91,247,.25)]

                      transition-all
                      duration-150

                      group-hover:scale-90
                      group-hover:opacity-0
                    "
                  >
                    ↗
                  </div>

                  {/* Expand icon */}

                  <PanelLeftOpen
                    size={19}
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
                {/* ===========================================
                    BRAND
                ============================================ */}

                <Link
                  href="/dashboard"
                  onClick={
                    onMobileClose
                  }
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center

                      rounded-xl

                      bg-[#5b5bf7]

                      text-sm
                      font-semibold
                      text-white

                      shadow-[0_7px_18px_rgba(91,91,247,.25)]
                    "
                  >
                    ↗
                  </div>

                  <div
                    className="
                      min-w-0
                    "
                  >
                    <div
                      className="
                        text-[18px]
                        font-semibold
                        tracking-[-0.45px]
                      "
                    >
                      ClientFlow
                    </div>

                    <div
                      className="
                        mt-[2px]

                        text-[10px]

                        text-[var(--cf-sidebar-muted)]
                      "
                    >
                      Client acquisition OS
                    </div>
                  </div>
                </Link>


                {/* ===========================================
                    COLLAPSE BUTTON
                ============================================ */}

                <button
                  type="button"
                  onClick={
                    onToggleCollapsed
                  }
                  aria-label="Collapse sidebar"
                  data-tooltip="Collapse sidebar"
                  data-tooltip-position="bottom"
                  className="
                    hidden

                    h-9
                    w-9

                    items-center
                    justify-center

                    rounded-lg

                    text-[var(--cf-sidebar-muted)]

                    transition

                    hover:bg-[var(--cf-sidebar-hover)]
                    hover:text-[var(--cf-sidebar-text)]

                    lg:flex
                  "
                >
                  <PanelLeftClose
                    size={18}
                    strokeWidth={1.7}
                  />
                </button>
              </>
            )}


            {/* ===============================================
                MOBILE BRAND
            ================================================ */}

            <Link
              href="/dashboard"
              onClick={
                onMobileClose
              }
              className="
                flex
                min-w-0
                items-center
                gap-3

                lg:hidden
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center

                  rounded-xl

                  bg-[#5b5bf7]

                  text-sm
                  font-semibold
                  text-white
                "
              >
                ↗
              </div>

              <div>
                <div
                  className="
                    text-[18px]
                    font-semibold
                  "
                >
                  ClientFlow
                </div>

                <div
                  className="
                    text-[10px]

                    text-[var(--cf-sidebar-muted)]
                  "
                >
                  Client acquisition OS
                </div>
              </div>
            </Link>


            {/* ===============================================
                MOBILE CLOSE
            ================================================ */}

            <button
              type="button"
              onClick={
                onMobileClose
              }
              aria-label="Close sidebar"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-lg

                text-[var(--cf-sidebar-muted)]

                transition

                hover:bg-[var(--cf-sidebar-hover)]
                hover:text-[var(--cf-sidebar-text)]

                lg:hidden
              "
            >
              <X size={18} />
            </button>
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

              transition-all

              ${
                collapsed
                  ? `
                    lg:mx-2
                    lg:p-1
                  `
                  : `
                    p-2
                  `
              }
            `}
          >
            <SidebarTooltip
              text={
                organization?.name ??
                'Workspace'
              }
              enabled={collapsed}
              align="right"
              wrapperClassName="w-full"
            >
              <button
                type="button"
                aria-label={
                  organization?.name ??
                  'Workspace'
                }
                className={`
                  group
                  relative

                  flex
                  w-full
                  items-center

                  rounded-lg

                  transition

                  hover:bg-[var(--cf-sidebar-hover)]

                  ${
                    collapsed
                      ? `
                        lg:h-11
                        lg:justify-center
                      `
                      : `
                        gap-3
                        px-2
                        py-2.5
                      `
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
                  {organizationInitials}
                </div>

                <div
                  className={`
                    min-w-0
                    flex-1
                    text-left

                    ${
                      collapsed
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
                    text-[var(--cf-sidebar-muted)]

                    ${
                      collapsed
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

              pb-3

              ${
                collapsed
                  ? 'lg:px-2'
                  : 'px-3'
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
                  className={
                    index > 0
                      ? collapsed
                        ? 'mt-2'
                        : 'mt-5'
                      : ''
                  }
                >
                  {/* =========================================
                      SECTION LABEL
                  ========================================== */}

                  {group.label &&
                    !collapsed && (
                      <p
                        className="
                          mb-2
                          px-2.5

                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.16em]

                          text-[var(--cf-sidebar-muted)]
                        "
                      >
                        {
                          group.label
                        }
                      </p>
                    )}


                  {/* =========================================
                      COLLAPSED DIVIDER
                  ========================================== */}

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


                  {/* =========================================
                      NAV ITEMS
                  ========================================== */}

                  <div
                    className="
                      space-y-[4px]
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
                            align="right"
                            wrapperClassName="w-full"
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
                                h-[44px]
                                items-center

                                rounded-xl

                                text-[14px]
                                font-medium

                                transition

                                ${
                                  collapsed
                                    ? `
                                      lg:justify-center
                                      lg:px-0
                                    `
                                    : `
                                      gap-3
                                      px-3
                                    `
                                }

                                ${
                                  active
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
                              {/* Active indicator */}

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

                              {/* Icon */}

                              <Icon
                                size={18}
                                strokeWidth={
                                  active
                                    ? 2
                                    : 1.8
                                }
                                className={
                                  active
                                    ? 'text-[var(--cf-primary)]'
                                    : ''
                                }
                              />

                              {/* Label */}

                              <span
                                className={`
                                  flex-1

                                  ${
                                    collapsed
                                      ? 'lg:hidden'
                                      : ''
                                  }
                                `}
                              >
                                {
                                  item.label
                                }
                              </span>


                              {/* Badge */}

                              {'badge' in
                                item &&
                                item.badge && (
                                  <span
                                    className={`
                                      flex
                                      min-w-5
                                      items-center
                                      justify-center

                                      rounded-full

                                      bg-[var(--cf-primary)]

                                      px-1.5
                                      py-[2px]

                                      text-[9px]
                                      font-semibold
                                      text-white

                                      ${
                                        collapsed
                                          ? `
                                            lg:absolute
                                            lg:right-[4px]
                                            lg:top-[4px]

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

              ${
                collapsed
                  ? 'lg:p-2'
                  : 'p-3'
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
            />


            <div
              className="
                my-2
                h-px

                bg-[var(--cf-sidebar-border)]
              "
            />


            {/* ===============================================
                ACCOUNT
            ================================================ */}

            <SidebarTooltip
              text="Account & profile"
              enabled={collapsed}
              align="right"
              wrapperClassName="w-full"
            >
              <div
                className={`
                  group
                  relative

                  flex
                  min-h-11
                  items-center

                  rounded-xl

                  transition

                  hover:bg-[var(--cf-sidebar-hover)]

                  ${
                    collapsed
                      ? `
                        lg:justify-center
                      `
                      : `
                        gap-2.5
                        px-2
                      `
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

                    ${
                      collapsed
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
                    "
                  >
                    {user?.firstName ||
                    user?.lastName
                      ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
                      : user?.email}
                  </p>

                  <p
                    className="
                      truncate

                      text-[10px]

                      text-[var(--cf-sidebar-muted)]
                    "
                  >
                    {user?.email}
                  </p>
                </div>


                {/* ===========================================
                    SIGN OUT
                ============================================ */}

                {!collapsed && (
                  <button
                    type="button"
                    onClick={() =>
                      void handleLogout()
                    }
                    aria-label="Sign out"
                    data-tooltip="Sign out"
                    data-tooltip-position="top"
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center

                      rounded-lg

                      text-[var(--cf-sidebar-muted)]

                      transition

                      hover:bg-red-400/10
                      hover:text-red-400
                    "
                  >
                    <LogOut
                      size={15}
                    />
                  </button>
                )}
              </div>
            </SidebarTooltip>
          </div>
        </div>
      </aside>
    </>
  );
}


/* =========================================================
   SIDEBAR FOOTER ACTION
========================================================= */

function SidebarFooterAction({
  collapsed,
  label,
  icon,
  href,
}: {
  collapsed: boolean;
  label: string;
  icon: ReactNode;
  href?: string;
}) {
  const classes = `
    group
    relative

    flex
    h-10
    w-full
    items-center

    rounded-lg

    text-[13px]

    text-[var(--cf-sidebar-text)]/80

    transition

    hover:bg-[var(--cf-sidebar-hover)]
    hover:text-[var(--cf-sidebar-text)]

    ${
      collapsed
        ? `
          lg:justify-center
        `
        : `
          gap-3
          px-2.5
        `
    }
  `;

  const content = (
    <>
      {icon}

      <span
        className={
          collapsed
            ? 'lg:hidden'
            : ''
        }
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
        align="right"
        wrapperClassName="w-full"
      >
        <Link
          href={href}
          aria-label={label}
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
      align="right"
      wrapperClassName="w-full"
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
   PORTAL TOOLTIP

   This is intentionally rendered into document.body.

   Why?
   The sidebar navigation scrolls vertically.
   Normal absolute tooltips can get clipped by:
   overflow-y-auto / overflow-hidden.

   Portal rendering prevents that.
========================================================= */

function SidebarTooltip({
  text,
  enabled,
  children,
  align = 'right',
  wrapperClassName = '',
}: {
  text: string;
  enabled: boolean;
  children: ReactNode;

  align?:
    | 'right'
    | 'left';

  wrapperClassName?: string;
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

    const rect =
      anchorRef.current.getBoundingClientRect();

    const gap = 12;

    setPosition({
      top:
        rect.top +
        rect.height / 2,

      left:
        align === 'right'
          ? rect.right + gap
          : rect.left - gap,
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

      onFocusCapture={
        showTooltip
      }

      onBlurCapture={
        hideTooltip
      }

      className={`
        relative
        ${wrapperClassName}
      `}
    >
      {children}

      {enabled &&
  position &&
  createPortal(
    <div
      role="tooltip"
      style={{
        top: position.top,
        left: position.left,
      }}
      className={`
        pointer-events-none
        fixed
        z-[9999]

        -translate-y-1/2

        ${
          align === 'left'
            ? '-translate-x-full'
            : ''
        }
      `}
    >
      <div
        className={`
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

          ${
            align === 'left'
              ? 'cf-sidebar-tooltip-content-left'
              : ''
          }
        `}
      >
        {text}
      </div>
    </div>,

    document.body,
  )}
    </div>
  );
}