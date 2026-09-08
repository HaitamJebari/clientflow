'use client';

import {
  ArrowRight,
  Bot,
  Clock3,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react';

import {
  QualificationBadge,
  StageBadge,
  TemperatureBadge,
} from '@/components/leads/leads-table';

import type {
  Lead,
} from '@/components/leads/leads-table';


interface LeadMobileCardProps {
  lead: Lead;
}


/* =========================================================
   COMPONENT
========================================================= */

export function LeadMobileCard({
  lead,
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

        sm:p-5
      "
    >
      {/* ===================================================
          HEADER
      =================================================== */}

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
          {/* Avatar */}

          <div
            className="
              relative

              flex
              h-12
              w-12
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


          {/* Lead identity */}

          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                flex
                flex-wrap
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

                  sm:text-[17px]
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
                mt-1

                truncate

                text-[13px]
                font-medium

                text-[var(--cf-text-secondary)]

                sm:text-[14px]
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


        {/* More */}

        <button
          type="button"
          aria-label={`More options for ${lead.company}`}
          data-tooltip={`More options for ${lead.company}`}
          data-tooltip-position="left"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-lg

            text-[var(--cf-text-secondary)]

            transition

            hover:bg-[var(--cf-surface-soft)]
            hover:text-[var(--cf-text)]

            active:scale-[0.96]
          "
        >
          <MoreHorizontal
            size={18}
          />
        </button>
      </div>


      {/* ===================================================
          VALUE / STAGE / QUALIFICATION / SOURCE
      =================================================== */}

      <div
        className="
          mt-5

          grid
          grid-cols-2
          gap-2.5
        "
      >
        <DataBox
          label="Potential value"
        >
          <span
            className="
              text-[15px]
              font-bold

              text-[var(--cf-text)]

              sm:text-[16px]
            "
          >
            {value}
          </span>
        </DataBox>


        <DataBox
          label="Stage"
        >
          <StageBadge
            stage={lead.stage}
          />
        </DataBox>


        <DataBox
          label="Qualification"
        >
          <QualificationBadge
            qualification={
              lead.qualification
            }
          />
        </DataBox>


        <DataBox
          label="Source"
        >
          <span
            className="
              text-[14px]
              font-semibold

              text-[var(--cf-text)]
            "
          >
            {lead.source}
          </span>
        </DataBox>
      </div>


      {/* ===================================================
          LAST ACTIVITY
      =================================================== */}

      <div
        className="
          mt-5

          flex
          flex-wrap
          items-center
          justify-between
          gap-3

          border-y
          border-[var(--cf-border-soft)]

          py-3.5
        "
      >
        <div
          className="
            flex
            items-center
            gap-2

            text-[13px]
            font-medium

            text-[var(--cf-text-secondary)]
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


        <span
          className="
            rounded-md

            border
            border-[var(--cf-primary)]/15

            bg-[var(--cf-primary-soft)]

            px-2.5
            py-1.5

            text-[10px]
            font-semibold

            text-[var(--cf-primary)]

            sm:text-[11px]
          "
        >
          {lead.signal}
        </span>
      </div>


      {/* ===================================================
          AI PREVIEW
      =================================================== */}

      <div
        className="
          mt-5

          rounded-xl

          border
          border-[var(--cf-border)]

          bg-[var(--cf-surface-soft)]

          p-4
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
                h-8
                w-8
                items-center
                justify-center

                rounded-lg

                bg-[var(--cf-primary-soft)]

                text-[var(--cf-primary)]
              "
            >
              <Bot
                size={14}
              />
            </div>


            <span
              className="
                text-[13px]
                font-bold

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
              font-bold
              uppercase
              tracking-[0.06em]

              text-[var(--cf-primary)]
            "
          >
            <Sparkles
              size={10}
            />

            Preview
          </span>
        </div>


        <p
          className="
            mt-3

            text-[14px]
            font-medium
            leading-6

            text-[var(--cf-text-secondary)]

            sm:text-[15px]
          "
        >
          {lead.insight}
        </p>
      </div>


      {/* ===================================================
          NEXT BEST ACTION

          Same visual family as desktop.
      =================================================== */}

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
          border-[var(--cf-border)]

          bg-[var(--cf-surface)]

          px-4
          py-3

          text-left

          shadow-[var(--cf-shadow)]

          transition-all

          hover:border-[var(--cf-primary)]/35
          hover:bg-[var(--cf-primary-soft)]

          active:scale-[0.99]
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              text-[10px]
              font-bold
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

              sm:text-[15px]
            "
          >
            {lead.actionLabel}
          </p>


          {lead.needsAttention && (
            <p
              className="
                mt-[3px]

                text-[10px]
                font-semibold

                text-[var(--cf-primary)]
              "
            >
              Recommended today
            </p>
          )}
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


/* =========================================================
   DATA BOX
========================================================= */

function DataBox({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {
  return (
    <div
      className="
        min-w-0

        rounded-xl

        border
        border-[var(--cf-border-soft)]

        bg-[var(--cf-surface-soft)]

        p-3.5
      "
    >
      <p
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.07em]

          text-[var(--cf-text-muted)]

          sm:text-[11px]
        "
      >
        {label}
      </p>


      <div
        className="
          mt-2

          min-w-0
        "
      >
        {children}
      </div>
    </div>
  );
}