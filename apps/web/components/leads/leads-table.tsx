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

/* =========================================================
   TYPES
========================================================= */

export interface Lead {
  id: string;

  firstName: string;
  lastName: string;

  email: string;
  company: string;

  jobTitle?: string;
  phone?: string;
  website?: string;
  notes?: string;
  nextFollowUpAt?: string | null;

  initials: string;

  value: number;

  stage:
    | 'New'
    | 'Contacted'
    | 'Qualified'
    | 'Proposal'
    | 'Negotiation'
    | 'Won'
    | 'Lost';

  temperature:
    | 'Hot'
    | 'Warm'
    | 'Cold';

  qualification: string;

  source: string;

  lastActivity: string;
  signal: string;

  insight: string;

  actionLabel: string;
  actionHint: string;

  needsAttention: boolean;

  priority: number;
}

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

/* =========================================================
   TABLE
========================================================= */

export function LeadsTable({
  leads,
  onEdit,
  onDelete,
}: LeadsTableProps) {
  return (
    <section
      className="
        overflow-hidden
        rounded-[16px]
        border
        border-[var(--cf-border)]
        bg-[var(--cf-surface)]
        shadow-[var(--cf-shadow)]
      "
    >
      <div
        className="
          overflow-x-auto
        "
      >
        <table
          className="
            w-full
            min-w-[1180px]
            border-collapse
          "
        >
          <thead>
            <tr
              className="
                border-b
                border-[var(--cf-border-soft)]
                bg-[var(--cf-surface-soft)]
              "
            >
              <TableHeading>
                Lead
              </TableHeading>

              <TableHeading>
                Stage
              </TableHeading>

              <TableHeading>
                Qualification
              </TableHeading>

              <TableHeading>
                Value
              </TableHeading>

              <TableHeading>
                Source
              </TableHeading>

              <TableHeading>
                Last activity
              </TableHeading>

              <TableHeading>
                AI insight
              </TableHeading>

              <TableHeading>
                Next best action
              </TableHeading>

              <th
                className="
                  w-[54px]
                  px-3
                "
              />
            </tr>
          </thead>

          <tbody>
            {leads.map(
              (
                lead,
                index,
              ) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  last={
                    index ===
                    leads.length - 1
                  }
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ),
            )}
          </tbody>
        </table>
      </div>

      <div
        className="
          flex
          items-center
          justify-between
          border-t
          border-[var(--cf-border-soft)]
          bg-[var(--cf-surface-soft)]
          px-5
          py-3
        "
      >
        <p
          className="
            text-[11px]
            text-[var(--cf-text-muted)]
          "
        >
          Showing {leads.length}{' '}
          {leads.length === 1
            ? 'lead'
            : 'leads'}
        </p>

        <div
          className="
            flex
            items-center
            gap-1.5
            text-[10px]
            text-[var(--cf-text-muted)]
          "
        >
          <Sparkles
            size={11}
            className="
              text-[var(--cf-primary)]
            "
          />

          AI insights are preview
          data
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TABLE HEADING
========================================================= */

function TableHeading({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th
      className="
        whitespace-nowrap
        px-4
        py-3.5
        text-left
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.1em]
        text-[var(--cf-text-muted)]
      "
    >
      {children}
    </th>
  );
}

/* =========================================================
   LEAD ROW
========================================================= */

function LeadRow({
  lead,
  last,
  onEdit,
  onDelete,
}: {
  lead: Lead;
  last: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}) {
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
    <tr
      className={`
        group
        transition-colors
        hover:bg-[var(--cf-surface-hover)]
        ${
          !last
            ? `
              border-b
              border-[var(--cf-border-soft)]
            `
            : ''
        }
      `}
    >
      <td
        className="
          px-4
          py-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
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
                  text-[13px]
                  font-semibold
                  text-[var(--cf-text)]
                "
              >
                {lead.firstName}{' '}
                {lead.lastName}
              </p>

              <TemperatureDot
                temperature={
                  lead.temperature
                }
              />
            </div>

            <p
              className="
                mt-1
                truncate
                text-[11px]
                text-[var(--cf-text-secondary)]
              "
            >
              {lead.company}
            </p>

            <p
              className="
                mt-[2px]
                truncate
                text-[10px]
                text-[var(--cf-text-muted)]
              "
            >
              {lead.email}
            </p>
          </div>
        </div>
      </td>

      <td
        className="
          px-4
          py-4
        "
      >
        <StageBadge
          stage={lead.stage}
        />
      </td>

      <td
        className="
          px-4
          py-4
        "
      >
        <div
          className="
            min-w-[105px]
          "
        >
          <p
            className="
              text-[12px]
              font-medium
              text-[var(--cf-text)]
            "
          >
            {lead.qualification}
          </p>

          <div
            className="
              mt-2
              flex
              items-center
              gap-1.5
            "
          >
            <TemperatureDot
              temperature={
                lead.temperature
              }
              showLabel
            />
          </div>
        </div>
      </td>

      <td
        className="
          px-4
          py-4
        "
      >
        <span
          className="
            whitespace-nowrap
            text-[14px]
            font-semibold
            text-[var(--cf-text)]
          "
        >
          {value}
        </span>
      </td>

      <td
        className="
          px-4
          py-4
        "
      >
        <span
          className="
            whitespace-nowrap
            text-[12px]
            text-[var(--cf-text-secondary)]
          "
        >
          {lead.source}
        </span>
      </td>

      <td
        className="
          px-4
          py-4
        "
      >
        <div
          className="
            flex
            min-w-[110px]
            items-center
            gap-2
            text-[11px]
            text-[var(--cf-text-secondary)]
          "
        >
          <Clock3
            size={13}
            className="
              shrink-0
              text-[var(--cf-text-muted)]
            "
          />

          {lead.lastActivity}
        </div>
      </td>

      <td
        className="
          max-w-[260px]
          px-4
          py-4
        "
      >
        <div
          className="
            min-w-[210px]
          "
        >
          <div
            className="
              flex
              items-center
              gap-1.5
            "
          >
            <Bot
              size={13}
              className="
                text-[var(--cf-primary)]
              "
            />

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.08em]
                text-[var(--cf-primary)]
              "
            >
              AI preview
            </span>
          </div>

          <p
            className="
              mt-1.5
              line-clamp-2
              text-[11px]
              leading-[18px]
              text-[var(--cf-text-secondary)]
            "
          >
            {lead.insight}
          </p>

          <div
            className="
              mt-2
              inline-flex
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
          </div>
        </div>
      </td>

      <td
        className="
          px-4
          py-4
        "
      >
        <button
          type="button"
          aria-label={`${lead.actionLabel} for ${lead.company}`}
          data-tooltip={
            lead.actionHint
          }
          data-tooltip-position="top"
          className="
            group/action
            flex
            min-w-[150px]
            items-center
            justify-between
            gap-2
            rounded-lg
            border
            border-[var(--cf-border)]
            bg-[var(--cf-surface)]
            px-3
            py-2.5
            text-left
            transition
            hover:border-[var(--cf-primary)]/30
            hover:bg-[var(--cf-primary-soft)]
          "
        >
          <div>
            <span
              className="
                block
                text-[11px]
                font-semibold
                text-[var(--cf-text)]
              "
            >
              {lead.actionLabel}
            </span>

            {lead.needsAttention && (
              <span
                className="
                  mt-[2px]
                  block
                  text-[9px]
                  text-[var(--cf-primary)]
                "
              >
                Recommended today
              </span>
            )}
          </div>

          <ArrowRight
            size={13}
            className="
              shrink-0
              text-[var(--cf-text-muted)]
              transition-transform
              group-hover/action:translate-x-[2px]
              group-hover/action:text-[var(--cf-primary)]
            "
          />
        </button>
      </td>

      <td
        className="
          px-3
          py-4
        "
      >
        <LeadActionsMenu
          lead={lead}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

/* =========================================================
   TEMPERATURE
========================================================= */

function TemperatureDot({
  temperature,
  showLabel = false,
}: {
  temperature:
    | 'Hot'
    | 'Warm'
    | 'Cold';

  showLabel?: boolean;
}) {
  const styles =
    temperature === 'Hot'
      ? `
        bg-red-500
      `
      : temperature ===
          'Warm'
        ? `
          bg-amber-500
        `
        : `
          bg-sky-500
        `;

  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
      "
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${styles}
        `}
      />

      {showLabel && (
        <span
          className="
            text-[10px]
            text-[var(--cf-text-muted)]
          "
        >
          {temperature}
        </span>
      )}
    </span>
  );
}

/* =========================================================
   STAGE
========================================================= */

function StageBadge({
  stage,
}: {
  stage:
    Lead['stage'];
}) {
  const styles =
    stage === 'Proposal'
      ? `
        bg-[var(--cf-primary-soft)]
        text-[var(--cf-primary)]
      `
      : stage ===
          'Negotiation'
        ? `
          bg-[var(--cf-warning-soft)]
          text-[var(--cf-warning)]
        `
        : stage ===
            'Qualified'
          ? `
            bg-[var(--cf-success-soft)]
            text-[var(--cf-success)]
          `
          : stage === 'Won'
            ? `
              bg-emerald-500/10
              text-emerald-600
            `
            : stage === 'Lost'
              ? `
                bg-red-500/10
                text-red-600
              `
              : `
                bg-[var(--cf-surface-soft)]
                text-[var(--cf-text-secondary)]
              `;

  return (
    <span
      className={`
        inline-flex
        whitespace-nowrap
        rounded-full
        px-2.5
        py-1.5
        text-[10px]
        font-semibold
        ${styles}
      `}
    >
      {stage}
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
