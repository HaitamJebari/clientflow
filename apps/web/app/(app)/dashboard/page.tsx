'use client';

import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquareText,
  MoreHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
} from 'lucide-react';

import type { ElementType } from 'react';

import { useAuth } from '@/components/providers/auth-provider';


/* =========================================================
   MOCK DASHBOARD DATA
========================================================= */

const attentionItems = [
  {
    company: 'Acme Studio',
    initials: 'AS',
    value: '€8,500',
    title: 'Follow up on proposal',
    description:
      'Proposal opened 3 times. No reply for 4 days.',
    reasons: [
      'High-value opportunity',
      'Recent proposal engagement',
      'No response for 4 days',
    ],
    action: 'Review follow-up',
    accent: 'warning',
    icon: Clock3,
  },

  {
    company: 'TechCorp',
    initials: 'TC',
    value: '€6,000',
    title: 'Proposal is ready to send',
    description:
      'Scope and timeline are confirmed.',
    reasons: [
      'Budget confirmed',
      'Project scope complete',
    ],
    action: 'Create proposal',
    accent: 'primary',
    icon: FileText,
  },

  {
    company: 'StartupX',
    initials: 'SX',
    value: '€5,000',
    title: 'Client asked about timeline',
    description:
      'A response could move this deal forward today.',
    reasons: [
      'Active conversation',
      'Timeline question unanswered',
    ],
    action: 'Open conversation',
    accent: 'info',
    icon: MessageSquareText,
  },
];


const pipelineStages = [
  {
    label: 'New',
    value: '€4.5k',
    count: 5,
    width: '18%',
  },

  {
    label: 'Qualified',
    value: '€8k',
    count: 4,
    width: '33%',
  },

  {
    label: 'Proposal',
    value: '€7k',
    count: 3,
    width: '29%',
  },

  {
    label: 'Negotiation',
    value: '€5k',
    count: 2,
    width: '20%',
  },
];


/* =========================================================
   DASHBOARD PAGE
========================================================= */

export default function DashboardPage() {
  const { user } = useAuth();

  const firstName =
    user?.firstName || 'there';


  return (
    <div
      className="
        cf-dashboard-enter

        min-w-0

        text-[var(--cf-text)]
      "
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          flex
          flex-col
          justify-between
          gap-5

          lg:flex-row
          lg:items-end
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              mb-3

              flex
              items-center
              gap-2

              text-[11px]
              font-semibold
              uppercase
              tracking-[0.15em]

              text-[var(--cf-text-secondary)]

              sm:text-[12px]
            "
          >
            <span
              className="
                h-2
                w-2

                shrink-0

                rounded-full

                bg-[var(--cf-success)]
              "
            />

            Workspace overview
          </div>


          <h1
            className="
              text-[30px]
              font-semibold
              leading-[1.1]
              tracking-[-1px]

              text-[var(--cf-text)]

              sm:text-[38px]

              lg:text-[48px]
              lg:tracking-[-1.5px]
            "
          >
            Good afternoon, {firstName}
          </h1>


          <p
            className="
              mt-3

              max-w-[720px]

              text-[14px]
              leading-6

              text-[var(--cf-text-secondary)]

              sm:text-[16px]
              sm:leading-7
            "
          >
            Here&apos;s what needs your
            attention to keep revenue moving.
          </p>
        </div>


        <button
          type="button"
          aria-label="Add opportunity"
          data-tooltip="Create a new sales opportunity"
          data-tooltip-position="bottom"
          className="
            flex
            h-11
            items-center
            justify-center
            gap-2

            self-start

            rounded-xl

            bg-[var(--cf-primary)]

            px-4

            text-[14px]
            font-semibold
            text-white

            shadow-[0_6px_18px_rgba(91,91,247,.2)]

            transition-all

            active:scale-[0.98]

            hover:-translate-y-[1px]
            hover:bg-[var(--cf-primary-hover)]

            sm:h-12
            sm:px-5
            sm:text-[15px]
          "
        >
          Add opportunity

          <ArrowUpRight
            size={15}
          />
        </button>
      </div>


      {/* ===================================================
          METRICS
      =================================================== */}

      <div
        className="
          mt-7

          grid
          grid-cols-1
          gap-3

          sm:grid-cols-2
          sm:gap-4

          xl:mt-8
          xl:grid-cols-4
        "
      >
        <MetricCard
          label="Open pipeline"
          value="€24,500"
          helper="+12% this month"
          icon={TrendingUp}
          positive
        />

        <MetricCard
          label="Active leads"
          value="18"
          helper="6 high intent"
          icon={UsersRound}
        />

        <MetricCard
          label="Conversion"
          value="22%"
          helper="+3.2% vs last month"
          icon={Target}
          positive
        />

        <MetricCard
          label="Deals won"
          value="7"
          helper="€31,800 revenue"
          icon={CheckCircle2}
        />
      </div>


      {/* ===================================================
          NEEDS ATTENTION
      =================================================== */}

      <section
        className="
          mt-6

          overflow-hidden

          rounded-[16px]

          border
          border-[var(--cf-border)]

          bg-[var(--cf-surface)]

          shadow-[var(--cf-shadow)]

          transition-colors
          duration-200

          sm:mt-7
        "
      >
        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            justify-between
            gap-4

            border-b
            border-[var(--cf-border-soft)]

            px-4
            py-5

            sm:px-5
            sm:py-6

            md:flex-row
            md:items-center

            lg:px-6
          "
        >
          <div
            className="
              flex
              min-w-0
              items-start
              gap-3

              sm:items-center
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

                bg-[var(--cf-primary-soft)]

                text-[var(--cf-primary)]
              "
            >
              <Sparkles
                size={16}
              />
            </div>


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
                <h2
                  className="
                    text-[20px]
                    font-semibold
                    tracking-[-0.3px]

                    text-[var(--cf-text)]

                    sm:text-[24px]
                  "
                >
                  Needs attention
                </h2>


                <span
                  className="
                    rounded-full

                    bg-[var(--cf-primary-soft)]

                    px-2.5
                    py-[4px]

                    text-[10px]
                    font-semibold

                    text-[var(--cf-primary)]

                    sm:text-[11px]
                  "
                >
                  3
                </span>
              </div>


              <p
                className="
                  mt-1

                  text-[12px]
                  leading-5

                  text-[var(--cf-text-secondary)]

                  sm:text-[14px]
                "
              >
                Ranked by urgency, value and
                engagement.
              </p>
            </div>
          </div>


          <div
            className="
              flex
              items-center
              gap-2

              text-[11px]

              text-[var(--cf-text-secondary)]

              sm:text-[12px]
            "
          >
            <Sparkles
              size={12}
              className="
                shrink-0

                text-[var(--cf-primary)]
              "
            />

            AI-assisted prioritization
          </div>
        </div>


        {/* =================================================
            ATTENTION ITEMS
        ================================================= */}

        <div>
          {attentionItems.map(
            (item, index) => (
              <AttentionItem
                key={item.company}
                {...item}
                last={
                  index ===
                  attentionItems.length - 1
                }
              />
            ),
          )}
        </div>
      </section>


      {/* ===================================================
          LOWER GRID
      =================================================== */}

      <div
        className="
          mt-6

          grid
          gap-4

          sm:mt-7
          sm:gap-5

          xl:grid-cols-[1.4fr_.8fr]
        "
      >
        {/* =================================================
            PIPELINE
        ================================================= */}

        <section
          className="
            min-w-0

            rounded-[16px]

            border
            border-[var(--cf-border)]

            bg-[var(--cf-surface)]

            p-4

            shadow-[var(--cf-shadow)]

            transition-colors
            duration-200

            sm:p-6
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-4

              sm:items-center
            "
          >
            <div
              className="
                min-w-0
              "
            >
              <h2
                className="
                  text-[20px]
                  font-semibold
                  tracking-[-0.2px]

                  text-[var(--cf-text)]

                  sm:text-[22px]
                "
              >
                Pipeline
              </h2>


              <p
                className="
                  mt-1.5

                  text-[12px]
                  leading-5

                  text-[var(--cf-text-secondary)]

                  sm:mt-2
                  sm:text-[14px]
                "
              >
                €24,500 across 14 open
                opportunities
              </p>
            </div>


            <button
              type="button"
              aria-label="View pipeline"
              data-tooltip="View every opportunity in your pipeline"
              data-tooltip-position="top"
              className="
                flex
                shrink-0
                items-center
                gap-1

                text-[12px]
                font-semibold

                text-[var(--cf-primary)]

                transition

                hover:opacity-80

                sm:text-[13px]
              "
            >
              View pipeline

              <ArrowRight
                size={13}
              />
            </button>
          </div>


          <div
            className="
              mt-7
              space-y-5

              sm:mt-8
              sm:space-y-6
            "
          >
            {pipelineStages.map(
              (stage) => (
                <div
                  key={stage.label}
                >
                  <div
                    className="
                      mb-3

                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          text-[13px]
                          font-medium

                          text-[var(--cf-text)]

                          sm:text-[14px]
                        "
                      >
                        {stage.label}
                      </span>


                      <span
                        className="
                          text-[11px]

                          text-[var(--cf-text-secondary)]

                          sm:text-[12px]
                        "
                      >
                        {stage.count} deals
                      </span>
                    </div>


                    <strong
                      className="
                        shrink-0

                        text-[13px]
                        font-semibold

                        text-[var(--cf-text)]

                        sm:text-[14px]
                      "
                    >
                      {stage.value}
                    </strong>
                  </div>


                  <div
                    className="
                      h-[8px]

                      overflow-hidden

                      rounded-full

                      bg-[var(--cf-surface-soft)]
                    "
                  >
                    <div
                      style={{
                        width:
                          stage.width,
                      }}
                      className="
                        h-full

                        rounded-full

                        bg-[var(--cf-primary)]

                        transition-all
                        duration-700
                      "
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </section>


        {/* =================================================
            REVENUE BRIEF
        ================================================= */}

        <section
          className="
            relative

            min-w-0
            overflow-hidden

            rounded-[16px]

            border
            border-[var(--cf-border)]

            bg-[var(--cf-surface)]

            p-4

            text-[var(--cf-text)]

            shadow-[var(--cf-shadow)]

            transition-colors
            duration-200

            sm:p-6
          "
        >
          <div
            className="
              pointer-events-none

              absolute
              -right-20
              -top-20

              h-52
              w-52

              rounded-full

              bg-[var(--cf-primary-soft)]

              blur-[70px]
            "
          />


          <div
            className="
              relative
              z-10
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
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center

                  rounded-xl

                  bg-[var(--cf-primary-soft)]

                  text-[var(--cf-primary)]
                "
              >
                <Sparkles
                  size={15}
                />
              </div>


              <span
                className="
                  rounded-full

                  border
                  border-[var(--cf-border)]

                  bg-[var(--cf-surface-soft)]

                  px-3
                  py-1.5

                  text-[10px]

                  text-[var(--cf-text-secondary)]

                  sm:text-[11px]
                "
              >
                Revenue brief
              </span>
            </div>


            <h3
              className="
                mt-5

                text-[23px]
                font-semibold
                leading-[1.28]
                tracking-[-0.5px]

                text-[var(--cf-text)]

                sm:mt-6
                sm:text-[28px]
                sm:leading-9
                sm:tracking-[-0.6px]
              "
            >
              €19,500 could move forward
              with three actions today.
            </h3>


            <p
              className="
                mt-3

                text-[13px]
                leading-6

                text-[var(--cf-text-secondary)]

                sm:mt-4
                sm:text-[15px]
                sm:leading-7
              "
            >
              Acme has recent proposal
              engagement, TechCorp is ready
              for a proposal and StartupX
              is waiting for your answer.
            </p>


            <div
              className="
                mt-5
                space-y-2.5

                sm:mt-6
                sm:space-y-3
              "
            >
              <BriefRow
                number="01"
                text="Follow up with Acme"
              />

              <BriefRow
                number="02"
                text="Send TechCorp proposal"
              />

              <BriefRow
                number="03"
                text="Answer StartupX"
              />
            </div>


            <button
              type="button"
              aria-label="Review priorities"
              data-tooltip="Review today's highest-priority opportunities"
              data-tooltip-position="top"
              className="
                mt-6

                flex
                h-11
                items-center
                gap-2

                rounded-lg

                bg-[var(--cf-text)]

                px-4

                text-[13px]
                font-semibold

                text-[var(--cf-surface)]

                transition

                hover:opacity-90

                sm:mt-7
                sm:text-[14px]
              "
            >
              Review priorities

              <ArrowRight
                size={12}
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}


/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  positive,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ElementType;
  positive?: boolean;
}) {
  return (
    <div
      className="
        rounded-[14px]

        border
        border-[var(--cf-border)]

        bg-[var(--cf-surface)]

        p-4

        shadow-[var(--cf-shadow)]

        transition-all
        duration-200

        hover:-translate-y-[1px]

        sm:p-5
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
            min-w-0
          "
        >
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.08em]

              text-[var(--cf-text-secondary)]

              sm:text-[12px]
            "
          >
            {label}
          </p>


          <p
            className="
              mt-2.5

              text-[23px]
              font-semibold
              tracking-[-1px]

              text-[var(--cf-text)]

              sm:mt-3
              sm:text-[24px]
            "
          >
            {value}
          </p>
        </div>


        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-xl

            bg-[var(--cf-primary-soft)]

            text-[var(--cf-primary)]
          "
        >
          <Icon
            size={16}
          />
        </div>
      </div>


      <p
        className={`
          mt-3

          text-[12px]

          sm:mt-4
          sm:text-[13px]

          ${
            positive
              ? 'text-[var(--cf-success)]'
              : 'text-[var(--cf-text-secondary)]'
          }
        `}
      >
        {helper}
      </p>
    </div>
  );
}


/* =========================================================
   ATTENTION ITEM
========================================================= */

function AttentionItem({
  company,
  initials,
  value,
  title,
  description,
  reasons,
  action,
  icon: Icon,
  accent,
  last,
}: {
  company: string;
  initials: string;
  value: string;
  title: string;
  description: string;
  reasons: string[];
  action: string;
  icon: ElementType;
  accent: string;
  last: boolean;
}) {
  const accentClasses =
    accent === 'warning'
      ? `
        bg-[var(--cf-warning-soft)]
        text-[var(--cf-warning)]
      `
      : accent === 'info'
        ? `
          bg-[var(--cf-info-soft)]
          text-[var(--cf-info)]
        `
        : `
          bg-[var(--cf-primary-soft)]
          text-[var(--cf-primary)]
        `;


  return (
    <div
      className={`
        group

        grid
        gap-4

        px-4
        py-5

        transition-colors

        hover:bg-[var(--cf-surface-hover)]

        sm:px-5
        sm:py-6

        lg:grid-cols-[minmax(0,1fr)_auto]
        lg:items-center
        lg:gap-4
        lg:px-6

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
          LEAD CONTENT
      =================================================== */}

      <div
        className="
          flex
          min-w-0
          gap-3

          sm:gap-4
        "
      >
        {/* Avatar */}

        <div
          className="
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

            sm:h-12
            sm:w-12
            sm:text-[13px]
          "
        >
          {initials}
        </div>


        {/* Content */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center

              gap-x-2.5
              gap-y-1
            "
          >
            <span
              className="
                text-[14px]
                font-semibold

                text-[var(--cf-text)]

                sm:text-[16px]
              "
            >
              {company}
            </span>


            <span
              className="
                text-[13px]
                font-semibold

                text-[var(--cf-primary)]

                sm:text-[15px]
              "
            >
              {value}
            </span>
          </div>


          <div
            className="
              mt-1.5

              text-[17px]
              font-semibold
              leading-6

              text-[var(--cf-text)]

              sm:text-[20px]
            "
          >
            {title}
          </div>


          <p
            className="
              mt-1.5

              text-[13px]
              leading-5

              text-[var(--cf-text-secondary)]

              sm:mt-2
              sm:text-[14px]
              sm:leading-6
            "
          >
            {description}
          </p>


          {/* Reason tags */}

          <div
            className="
              mt-3

              flex
              flex-wrap
              gap-1.5

              sm:mt-4
              sm:gap-2
            "
          >
            {reasons.map(
              (reason) => (
                <span
                  key={reason}
                  className="
                    rounded-md

                    border
                    border-[var(--cf-border)]

                    bg-[var(--cf-surface-soft)]

                    px-2.5
                    py-1.5

                    text-[10px]
                    leading-4

                    text-[var(--cf-text-secondary)]

                    sm:px-3
                    sm:text-[11px]
                  "
                >
                  {reason}
                </span>
              ),
            )}
          </div>
        </div>
      </div>


      {/* ===================================================
          ACTIONS

          SAME DESIGN:
          MOBILE / TABLET / DESKTOP
      =================================================== */}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2

          sm:flex-nowrap
        "
      >
        {/* Main action */}

        <button
          type="button"
          aria-label={`${action} for ${company}`}
          data-tooltip={`${action} for ${company}`}
          data-tooltip-position="top"
          className="
            flex
            h-11
            min-w-0
            items-center
            gap-2

            rounded-lg

            border
            border-[var(--cf-border)]

            bg-[var(--cf-surface)]

            px-4

            text-[14px]
            font-medium

            text-[var(--cf-text-secondary)]

            shadow-[var(--cf-shadow)]

            transition-all

            hover:bg-[var(--cf-surface-soft)]
            hover:text-[var(--cf-text)]

            active:scale-[0.98]
          "
        >
          <span
            className={`
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center

              rounded-md

              ${accentClasses}
            `}
          >
            <Icon
              size={12}
            />
          </span>


          <span
            className="
              whitespace-nowrap
            "
          >
            {action}
          </span>


          <ArrowRight
            size={12}
            className="
              shrink-0
            "
          />
        </button>


        {/* More */}

        <button
          type="button"
          aria-label={`More options for ${company}`}
          data-tooltip={`More options for ${company}`}
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

            transition-all

            hover:bg-[var(--cf-surface-soft)]
            hover:text-[var(--cf-text)]

            active:scale-[0.96]
          "
        >
          <MoreHorizontal
            size={17}
          />
        </button>
      </div>
    </div>
  );
}


/* =========================================================
   REVENUE BRIEF ROW
========================================================= */

function BriefRow({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3

        rounded-lg

        border
        border-[var(--cf-border)]

        bg-[var(--cf-surface-soft)]

        px-3.5
        py-3

        transition

        hover:bg-[var(--cf-surface-hover)]

        sm:px-4
      "
    >
      <span
        className="
          shrink-0

          text-[10px]
          font-semibold

          text-[var(--cf-primary)]

          sm:text-[11px]
        "
      >
        {number}
      </span>


      <span
        className="
          min-w-0

          text-[13px]

          text-[var(--cf-text-secondary)]

          sm:text-[14px]
        "
      >
        {text}
      </span>
    </div>
  );
}