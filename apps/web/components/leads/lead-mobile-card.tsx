'use client';

import {
  ArrowRight,
  Bot,
  Clock3,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

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
              text-[11px]
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
                  text-[15px]
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
                text-[12px]
                text-[var(--cf-text-secondary)]
              "
            >
              {lead.company}
            </p>

            <p
              className="
                mt-[2px]
                truncate
                text-[11px]
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
            text-[11px]
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
            text-[9px]
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
                text-[11px]
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
              text-[9px]
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
            text-[12px]
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
              text-[10px]
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
              text-[13px]
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
          text-[9px]
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
          text-[12px]
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
        text-[9px]
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

  const menuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    position,
    setPosition,
  ] = useState({
    top: 0,
    left: 0,
  });

  const openMenu = () => {
    const rect =
      buttonRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const width = 190;
    const estimatedHeight = 112;

    const left = Math.min(
      window.innerWidth - width - 12,
      Math.max(
        12,
        rect.right - width,
      ),
    );

    const shouldOpenAbove =
      rect.bottom +
        estimatedHeight +
        12 >
      window.innerHeight;

    const top = shouldOpenAbove
      ? Math.max(
          12,
          rect.top -
            estimatedHeight -
            8,
        )
      : rect.bottom + 8;

    setPosition({
      top,
      left,
    });

    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as Node;

      if (
        menuRef.current?.contains(
          target,
        ) ||
        buttonRef.current?.contains(
          target,
        )
      ) {
        return;
      }

      setIsOpen(false);
    };

    const closeMenu = () => {
      setIsOpen(false);
    };

    document.addEventListener(
      'mousedown',
      handlePointerDown,
    );

    window.addEventListener(
      'resize',
      closeMenu,
    );

    window.addEventListener(
      'scroll',
      closeMenu,
      true,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown,
      );

      window.removeEventListener(
        'resize',
        closeMenu,
      );

      window.removeEventListener(
        'scroll',
        closeMenu,
        true,
      );
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`More options for ${lead.company}`}
        aria-expanded={isOpen}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            openMenu();
          }
        }}
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          text-[var(--cf-text-muted)]
          transition
          hover:bg-[var(--cf-surface-soft)]
          hover:text-[var(--cf-text)]
        "
      >
        <MoreHorizontal
          size={17}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          style={{
            top: position.top,
            left: position.left,
          }}
          className="
            fixed
            z-[180]
            w-[190px]
            overflow-hidden
            rounded-xl
            border
            border-[var(--cf-border)]
            bg-[var(--cf-surface)]
            p-1.5
            shadow-[0_18px_45px_rgba(15,23,42,.20)]
          "
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onEdit(lead);
            }}
            className="
              flex
              w-full
              items-center
              gap-2.5
              rounded-lg
              px-3
              py-2.5
              text-left
              text-[13px]
              font-medium
              text-[var(--cf-text)]
              transition
              hover:bg-[var(--cf-surface-soft)]
            "
          >
            <Pencil
              size={15}
              className="
                text-[var(--cf-text-secondary)]
              "
            />

            Edit lead
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onDelete(lead);
            }}
            className="
              mt-1
              flex
              w-full
              items-center
              gap-2.5
              rounded-lg
              px-3
              py-2.5
              text-left
              text-[13px]
              font-medium
              text-red-600
              transition
              hover:bg-red-500/10
            "
          >
            <Trash2
              size={15}
            />

            Delete lead
          </button>
        </div>
      )}
    </>
  );
}
