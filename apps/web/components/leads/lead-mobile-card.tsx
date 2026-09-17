'use client';

import {
  ArrowRight,
  Bot,
  Clock3,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  createPortal,
} from 'react-dom';

import type {
  Lead,
} from '@/components/leads/leads-table';

interface LeadMobileCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export function LeadMobileCard({
  lead,
  onEdit,
  onDelete,
}: LeadMobileCardProps) {
  const value =
    new Intl.NumberFormat(
      'en-IE',
      {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      },
    ).format(
      lead.value,
    );

  return (
    <article
      className="
        rounded-[16px]
        border
        border-[var(--cf-border)]
        bg-[var(--cf-surface)]
        p-4
        shadow-[var(--cf-shadow)]
        transition-colors
        hover:bg-[var(--cf-surface-hover)]
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <div
            className="
              relative
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface-soft)]
              text-[12px]
              font-semibold
              text-[var(--cf-text-secondary)]
            "
          >
            {lead.initials}

            {lead.needsAttention && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  h-2.5
                  w-2.5
                  rounded-full
                  border-2
                  border-[var(--cf-surface)]
                  bg-[var(--cf-primary)]
                "
              />
            )}
          </div>

          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <p
                className="
                  truncate
                  text-[16px]
                  font-semibold
                  text-[var(--cf-text)]
                "
              >
                {lead.firstName}{' '}
                {lead.lastName}
              </p>

              <TemperatureBadge
                temperature={
                  lead.temperature
                }
              />
            </div>

            <p
              className="
                mt-[2px]
                truncate
                text-[13px]
                text-[var(--cf-text-secondary)]
              "
            >
              {lead.company}
            </p>

            <p
              className="
                mt-[2px]
                truncate
                text-[12px]
                text-[var(--cf-text-muted)]
              "
            >
              {lead.email}
            </p>
          </div>
        </div>

        <LeadActionsMenu
          lead={lead}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-2
        "
      >
        <DataBox
          label="Potential value"
          value={value}
        />

        <DataBox
          label="Stage"
          value={lead.stage}
        />

        <DataBox
          label="Qualification"
          value={
            lead.qualification
          }
        />

        <DataBox
          label="Source"
          value={lead.source}
        />
      </div>

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          gap-3
          border-y
          border-[var(--cf-border-soft)]
          py-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-[12px]
            text-[var(--cf-text-secondary)]
          "
        >
          <Clock3
            size={13}
            className="
              text-[var(--cf-text-muted)]
            "
          />

          {lead.lastActivity}
        </div>

        <span
          className="
            rounded-md
            bg-[var(--cf-primary-soft)]
            px-2
            py-1
            text-[10px]
            font-medium
            text-[var(--cf-primary)]
          "
        >
          {lead.signal}
        </span>
      </div>

      <div
        className="
          mt-4
          rounded-xl
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface-soft)]
          p-3.5
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <div
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-[var(--cf-primary-soft)]
                text-[var(--cf-primary)]
              "
            >
              <Bot
                size={13}
              />
            </div>

            <span
              className="
                text-[12px]
                font-semibold
                text-[var(--cf-text)]
              "
            >
              AI insight
            </span>
          </div>

          <span
            className="
              flex
              items-center
              gap-1
              text-[10px]
              font-medium
              text-[var(--cf-primary)]
            "
          >
            <Sparkles
              size={9}
            />

            Preview
          </span>
        </div>

        <p
          className="
            mt-3
            text-[13px]
            leading-5
            text-[var(--cf-text-secondary)]
          "
        >
          {lead.insight}
        </p>
      </div>

      <button
        type="button"
        aria-label={`${lead.actionLabel} for ${lead.company}`}
        data-tooltip={
          lead.actionHint
        }
        data-tooltip-position="top"
        className="
          group
          mt-4
          flex
          min-h-12
          w-full
          items-center
          justify-between
          gap-3
          rounded-xl
          border
          border-[var(--cf-primary)]/20
          bg-[var(--cf-primary-soft)]
          px-4
          text-left
          transition
          hover:border-[var(--cf-primary)]/40
        "
      >
        <div>
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-[var(--cf-primary)]
            "
          >
            Next best action
          </p>

          <p
            className="
              mt-1
              text-[14px]
              font-semibold
              text-[var(--cf-text)]
            "
          >
            {lead.actionLabel}
          </p>
        </div>

        <ArrowRight
          size={15}
          className="
            shrink-0
            text-[var(--cf-primary)]
            transition-transform
            group-hover:translate-x-[2px]
          "
        />
      </button>
    </article>
  );
}

function DataBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-[var(--cf-border-soft)]
        bg-[var(--cf-surface-soft)]
        p-3
      "
    >
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.07em]
          text-[var(--cf-text-muted)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          truncate
          text-[13px]
          font-semibold
          text-[var(--cf-text)]
        "
      >
        {value}
      </p>
    </div>
  );
}

function TemperatureBadge({
  temperature,
}: {
  temperature:
    Lead['temperature'];
}) {
  const styles =
    temperature === 'Hot'
      ? `
        bg-red-500/10
        text-red-500
      `
      : temperature ===
          'Warm'
        ? `
          bg-amber-500/10
          text-amber-500
        `
        : `
          bg-sky-500/10
          text-sky-500
        `;

  return (
    <span
      className={`
        rounded-full
        px-2
        py-[3px]
        text-[10px]
        font-semibold
        ${styles}
      `}
    >
      {temperature}
    </span>
  );
}


/* =========================================================
   LEAD ACTIONS MENU
   - Mobile: bottom action sheet
   - Tablet/Desktop: anchored dropdown
   - Rendered through a portal so it is never clipped by
     table/card overflow containers.
========================================================= */

function LeadActionsMenu({
  lead,
  onEdit,
  onDelete,
}: {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}) {
  const buttonRef =
    useRef<HTMLButtonElement | null>(
      null,
    );

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    isMounted,
    setIsMounted,
  ] = useState(false);

  const [
    isMobile,
    setIsMobile,
  ] = useState(false);

  const [
    position,
    setPosition,
  ] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setIsMounted(true);

    const media =
      window.matchMedia(
        '(max-width: 767px)',
      );

    const syncMobile = () => {
      setIsMobile(
        media.matches,
      );
    };

    syncMobile();

    media.addEventListener(
      'change',
      syncMobile,
    );

    return () => {
      media.removeEventListener(
        'change',
        syncMobile,
      );
    };
  }, []);

  const updatePosition = () => {
    const rect =
      buttonRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const menuWidth = 210;
    const menuHeight = 112;
    const viewportPadding = 12;
    const gap = 8;

    const left =
      Math.min(
        window.innerWidth -
          menuWidth -
          viewportPadding,
        Math.max(
          viewportPadding,
          rect.right -
            menuWidth,
        ),
      );

    const canOpenBelow =
      rect.bottom +
        gap +
        menuHeight +
        viewportPadding <=
      window.innerHeight;

    const top =
      canOpenBelow
        ? rect.bottom + gap
        : Math.max(
            viewportPadding,
            rect.top -
              menuHeight -
              gap,
          );

    setPosition({
      top,
      left,
    });
  };

  const openMenu = () => {
    updatePosition();
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === 'Escape'
      ) {
        closeMenu();
      }
    };

    const handleViewportChange =
      () => {
        if (!isMobile) {
          updatePosition();
        }
      };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    window.addEventListener(
      'resize',
      handleViewportChange,
    );

    window.addEventListener(
      'scroll',
      handleViewportChange,
      true,
    );

    if (isMobile) {
      const previousOverflow =
        document.body.style
          .overflow;

      document.body.style.overflow =
        'hidden';

      return () => {
        document.body.style.overflow =
          previousOverflow;

        window.removeEventListener(
          'keydown',
          handleKeyDown,
        );

        window.removeEventListener(
          'resize',
          handleViewportChange,
        );

        window.removeEventListener(
          'scroll',
          handleViewportChange,
          true,
        );
      };
    }

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );

      window.removeEventListener(
        'resize',
        handleViewportChange,
      );

      window.removeEventListener(
        'scroll',
        handleViewportChange,
        true,
      );
    };
  }, [
    isOpen,
    isMobile,
  ]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`More options for ${lead.company}`}
        onClick={() => {
          if (isOpen) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          text-[var(--cf-text-muted)]
          transition
          hover:bg-[var(--cf-surface-soft)]
          hover:text-[var(--cf-text)]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[var(--cf-primary)]
          focus-visible:ring-offset-2
          active:scale-[0.96]
        "
      >
        <MoreHorizontal
          size={18}
        />
      </button>

      {isMounted &&
        isOpen &&
        createPortal(
          <>
            {/* Outside click layer */}

            <button
              type="button"
              aria-label="Close lead actions"
              onClick={
                closeMenu
              }
              className={`
                fixed
                inset-0
                z-[190]

                ${
                  isMobile
                    ? `
                        bg-slate-950/35
                        backdrop-blur-[2px]
                      `
                    : `
                        bg-transparent
                      `
                }
              `}
            />

            {/* Menu / mobile action sheet */}

            <div
              role="menu"
              aria-label={`Actions for ${lead.firstName} ${lead.lastName}`}
              style={
                isMobile
                  ? undefined
                  : {
                      top:
                        position.top,
                      left:
                        position.left,
                    }
              }
              className={`
                fixed
                z-[200]

                border
                border-[var(--cf-border)]

                bg-[var(--cf-surface)]

                shadow-[0_24px_65px_rgba(15,23,42,.24)]

                ${
                  isMobile
                    ? `
                        bottom-3
                        left-3
                        right-3

                        rounded-[20px]

                        p-3
                      `
                    : `
                        w-[210px]

                        rounded-xl

                        p-1.5
                      `
                }
              `}
            >
              {/* Mobile header */}

              {isMobile && (
                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-between
                    gap-3

                    border-b
                    border-[var(--cf-border-soft)]

                    px-2
                    pb-3
                  "
                >
                  <div
                    className="
                      min-w-0
                    "
                  >
                    <p
                      className="
                        truncate
                        text-[15px]
                        font-semibold
                        text-[var(--cf-text)]
                      "
                    >
                      {lead.firstName}{' '}
                      {lead.lastName}
                    </p>

                    <p
                      className="
                        mt-0.5
                        truncate
                        text-[13px]
                        text-[var(--cf-text-secondary)]
                      "
                    >
                      {lead.company}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeMenu
                    }
                    aria-label="Close"
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[var(--cf-surface-soft)]
                      text-[var(--cf-text-secondary)]
                      transition
                      hover:text-[var(--cf-text)]
                    "
                  >
                    <X
                      size={17}
                    />
                  </button>
                </div>
              )}

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onEdit(lead);
                }}
                className={`
                  flex
                  w-full
                  items-center
                  gap-3

                  rounded-xl

                  text-left
                  font-medium
                  text-[var(--cf-text)]

                  transition

                  hover:bg-[var(--cf-surface-soft)]

                  ${
                    isMobile
                      ? `
                          min-h-12
                          px-3.5
                          py-3
                          text-[16px]
                        `
                      : `
                          px-3
                          py-2.5
                          text-[14px]
                        `
                  }
                `}
              >
                <span
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
                  <Pencil
                    size={15}
                  />
                </span>

                <span>
                  Edit lead
                </span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onDelete(lead);
                }}
                className={`
                  mt-1

                  flex
                  w-full
                  items-center
                  gap-3

                  rounded-xl

                  text-left
                  font-medium
                  text-red-600

                  transition

                  hover:bg-red-500/10

                  ${
                    isMobile
                      ? `
                          min-h-12
                          px-3.5
                          py-3
                          text-[16px]
                        `
                      : `
                          px-3
                          py-2.5
                          text-[14px]
                        `
                  }
                `}
              >
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-red-500/10
                    text-red-600
                  "
                >
                  <Trash2
                    size={15}
                  />
                </span>

                <span>
                  Delete lead
                </span>
              </button>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
