'use client';

import {
  ArrowRight,
  Bot,
  Clock3,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react';


/* =========================================================
   TYPES
========================================================= */

export interface Lead {
  id: string;

  firstName: string;
  lastName: string;

  email: string;

  company: string;

  initials: string;

  value: number;

  stage:
    | 'New'
    | 'Qualified'
    | 'Proposal'
    | 'Negotiation';

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
}


/* =========================================================
   TABLE
========================================================= */

export function LeadsTable({
  leads,
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
            min-w-[1340px]

            border-collapse
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

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


          {/* =================================================
              ROWS
          ================================================= */}

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
                />
              ),
            )}
          </tbody>
        </table>
      </div>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-4

          border-t
          border-[var(--cf-border-soft)]

          bg-[var(--cf-surface-soft)]

          px-5
          py-3.5
        "
      >
        <p
          className="
            text-[12px]
            font-medium

            text-[var(--cf-text-secondary)]
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

            text-[11px]
            font-medium

            text-[var(--cf-text-secondary)]
          "
        >
          <Sparkles
            size={12}
            className="
              text-[var(--cf-primary)]
            "
          />

          AI insights are preview data
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
        py-4

        text-left

        text-[11px]
        font-bold
        uppercase
        tracking-[0.08em]

        text-[var(--cf-text-secondary)]

        xl:text-[12px]
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
}: {
  lead: Lead;
  last: boolean;
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
      {/* ===================================================
          LEAD
      =================================================== */}

      <td
        className="
          px-4
          py-5
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
              font-bold

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

                  h-3
                  w-3

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

                  xl:text-[16px]
                "
              >
                {lead.firstName}{' '}
                {lead.lastName}
              </p>


              <TemperatureBadge
                temperature={
                  lead.temperature
                }
                compact
              />
            </div>


            <p
              className="
                mt-1

                truncate

                text-[13px]
                font-medium

                text-[var(--cf-text-secondary)]
              "
            >
              {lead.company}
            </p>


            <p
              className="
                mt-[3px]

                truncate

                text-[12px]

                text-[var(--cf-text-muted)]
              "
            >
              {lead.email}
            </p>
          </div>
        </div>
      </td>


      {/* ===================================================
          STAGE
      =================================================== */}

      <td
        className="
          px-4
          py-5
        "
      >
        <StageBadge
          stage={lead.stage}
        />
      </td>


      {/* ===================================================
          QUALIFICATION
      =================================================== */}

      <td
        className="
          px-4
          py-5
        "
      >
        <div
          className="
            min-w-[120px]
          "
        >
          <QualificationBadge
            qualification={
              lead.qualification
            }
          />


          <div
            className="
              mt-2.5
            "
          >
            <TemperatureBadge
              temperature={
                lead.temperature
              }
            />
          </div>
        </div>
      </td>


      {/* ===================================================
          VALUE
      =================================================== */}

      <td
        className="
          px-4
          py-5
        "
      >
        <span
          className="
            whitespace-nowrap

            text-[15px]
            font-bold

            text-[var(--cf-text)]

            xl:text-[16px]
          "
        >
          {value}
        </span>
      </td>


      {/* ===================================================
          SOURCE
      =================================================== */}

      <td
        className="
          px-4
          py-5
        "
      >
        <span
          className="
            whitespace-nowrap

            text-[13px]
            font-medium

            text-[var(--cf-text-secondary)]

            xl:text-[14px]
          "
        >
          {lead.source}
        </span>
      </td>


      {/* ===================================================
          LAST ACTIVITY
      =================================================== */}

      <td
        className="
          px-4
          py-5
        "
      >
        <div
          className="
            flex
            min-w-[125px]
            items-center
            gap-2

            text-[12px]
            font-medium

            text-[var(--cf-text-secondary)]

            xl:text-[13px]
          "
        >
          <Clock3
            size={14}
            className="
              shrink-0

              text-[var(--cf-text-muted)]
            "
          />

          {lead.lastActivity}
        </div>
      </td>


      {/* ===================================================
          AI INSIGHT
      =================================================== */}

      <td
        className="
          max-w-[300px]

          px-4
          py-5
        "
      >
        <div
          className="
            min-w-[245px]
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
              size={14}
              className="
                text-[var(--cf-primary)]
              "
            />


            <span
              className="
                text-[11px]
                font-bold
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
              mt-2

              line-clamp-2

              text-[13px]
              font-medium
              leading-5

              text-[var(--cf-text-secondary)]

              xl:text-[14px]
              xl:leading-[22px]
            "
          >
            {lead.insight}
          </p>


          <div
            className="
              mt-2.5

              inline-flex

              rounded-md

              border
              border-[var(--cf-primary)]/15

              bg-[var(--cf-primary-soft)]

              px-2.5
              py-1.5

              text-[10px]
              font-semibold

              text-[var(--cf-primary)]

              xl:text-[11px]
            "
          >
            {lead.signal}
          </div>
        </div>
      </td>


      {/* ===================================================
          NEXT BEST ACTION
      =================================================== */}

      <td
        className="
          px-4
          py-5
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
            min-w-[175px]
            items-center
            justify-between
            gap-3

            rounded-lg

            border
            border-[var(--cf-border)]

            bg-[var(--cf-surface)]

            px-3.5
            py-3

            text-left

            shadow-[var(--cf-shadow)]

            transition-all

            hover:border-[var(--cf-primary)]/35
            hover:bg-[var(--cf-primary-soft)]
          "
        >
          <div>
            <span
              className="
                block

                text-[13px]
                font-semibold

                text-[var(--cf-text)]

                xl:text-[14px]
              "
            >
              {lead.actionLabel}
            </span>


            {lead.needsAttention && (
              <span
                className="
                  mt-[3px]
                  block

                  text-[10px]
                  font-semibold

                  text-[var(--cf-primary)]
                "
              >
                Recommended today
              </span>
            )}
          </div>


          <ArrowRight
            size={14}
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


      {/* ===================================================
          MORE
      =================================================== */}

      <td
        className="
          px-3
          py-5
        "
      >
        <button
          type="button"
          aria-label={`More options for ${lead.company}`}
          data-tooltip={`More options for ${lead.company}`}
          data-tooltip-position="left"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center

            rounded-lg

            text-[var(--cf-text-secondary)]

            transition

            hover:bg-[var(--cf-surface-soft)]
            hover:text-[var(--cf-text)]
          "
        >
          <MoreHorizontal
            size={18}
          />
        </button>
      </td>
    </tr>
  );
}


/* =========================================================
   TEMPERATURE BADGE
========================================================= */

export function TemperatureBadge({
  temperature,
  compact = false,
}: {
  temperature:
    Lead['temperature'];

  compact?: boolean;
}) {
  const styles =
    temperature === 'Hot'
      ? `
        border-red-500/30
        bg-red-500/12
        text-red-600

        dark:border-red-400/30
        dark:bg-red-400/10
        dark:text-red-300
      `
      : temperature ===
          'Warm'
        ? `
          border-amber-500/30
          bg-amber-500/14
          text-amber-700

          dark:border-amber-400/30
          dark:bg-amber-400/10
          dark:text-amber-300
        `
        : `
          border-sky-500/30
          bg-sky-500/12
          text-sky-700

          dark:border-sky-400/30
          dark:bg-sky-400/10
          dark:text-sky-300
        `;


  const dot =
    temperature === 'Hot'
      ? 'bg-red-500'
      : temperature ===
          'Warm'
        ? 'bg-amber-500'
        : 'bg-sky-500';


  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5

        whitespace-nowrap

        rounded-full

        border

        font-bold

        ${styles}

        ${
          compact
            ? `
              px-2
              py-1

              text-[10px]
            `
            : `
              px-2.5
              py-1.5

              text-[11px]
            `
        }
      `}
    >
      <span
        className={`
          h-2
          w-2

          shrink-0

          rounded-full

          ${dot}
        `}
      />

      {temperature}
    </span>
  );
}


/* =========================================================
   STAGE BADGE
========================================================= */

export function StageBadge({
  stage,
}: {
  stage:
    Lead['stage'];
}) {
  const styles =
    stage === 'Proposal'
      ? `
        border-blue-500/25
        bg-blue-500/12
        text-blue-700

        dark:border-blue-400/25
        dark:bg-blue-400/10
        dark:text-blue-300
      `
      : stage ===
          'Negotiation'
        ? `
          border-violet-500/25
          bg-violet-500/12
          text-violet-700

          dark:border-violet-400/25
          dark:bg-violet-400/10
          dark:text-violet-300
        `
        : stage ===
            'Qualified'
          ? `
            border-emerald-500/25
            bg-emerald-500/12
            text-emerald-700

            dark:border-emerald-400/25
            dark:bg-emerald-400/10
            dark:text-emerald-300
          `
          : `
            border-[var(--cf-border)]

            bg-[var(--cf-surface-soft)]

            text-[var(--cf-text-secondary)]
          `;


  return (
    <span
      className={`
        inline-flex
        items-center

        whitespace-nowrap

        rounded-full

        border

        px-2.5
        py-1.5

        text-[11px]
        font-bold

        ${styles}
      `}
    >
      {stage}
    </span>
  );
}


/* =========================================================
   QUALIFICATION BADGE
========================================================= */

export function QualificationBadge({
  qualification,
}: {
  qualification: string;
}) {
  const normalized =
    qualification.toLowerCase();


  const styles =
    normalized.includes(
      'strong',
    )
      ? `
        border-emerald-500/25
        bg-emerald-500/10
        text-emerald-700

        dark:text-emerald-300
      `
      : normalized.includes(
            'good',
          )
        ? `
          border-blue-500/25
          bg-blue-500/10
          text-blue-700

          dark:text-blue-300
        `
        : `
          border-amber-500/25
          bg-amber-500/10
          text-amber-700

          dark:text-amber-300
        `;


  return (
    <span
      className={`
        inline-flex
        items-center

        whitespace-nowrap

        rounded-lg

        border

        px-2.5
        py-1.5

        text-[11px]
        font-bold

        ${styles}
      `}
    >
      {qualification}
    </span>
  );
}