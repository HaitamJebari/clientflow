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

export default function DashboardPage() {
  const { user } = useAuth();

  const firstName =
    user?.firstName || 'there';

  return (
    <div
      className="
        cf-dashboard-enter
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
        <div>
          <div
            className="
              mb-3
              flex
              items-center
              gap-2

              text-[12px]
              font-semibold
              uppercase
              tracking-[0.15em]

              text-[var(--cf-text-secondary)]
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-[var(--cf-success)]
              "
            />

            Workspace overview
          </div>

          <h1
            className="
              text-[42px]
              font-semibold
              tracking-[-1.5px]

              text-[var(--cf-text)]

              sm:text-[48px]
            "
          >
            Good afternoon, {firstName}
          </h1>

          <p
            className="
              mt-3

              text-[16px]
              leading-7

              text-[var(--cf-text-secondary)]
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
            h-12
            items-center
            justify-center
            gap-2

            self-start

            rounded-xl

            bg-[var(--cf-primary)]

            px-5

            text-[15px]
            font-semibold
            text-white

            shadow-[0_6px_18px_rgba(91,91,247,.2)]

            transition

            hover:-translate-y-[1px]
            hover:bg-[var(--cf-primary-hover)]
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
          mt-8

          grid
          grid-cols-1
          gap-4

          md:grid-cols-2
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
          mt-7

          overflow-hidden

          rounded-[16px]

          border
          border-[var(--cf-border)]

          bg-[var(--cf-surface)]

          shadow-[var(--cf-shadow)]

          transition-colors
          duration-200
        "
      >
        <div
          className="
            flex
            flex-col
            justify-between
            gap-4

            border-b
            border-[var(--cf-border-soft)]

            px-6
            py-6

            sm:flex-row
            sm:items-center
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
                flex
                h-10
                w-10
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

            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <h2
                  className="
                    text-[24px]
                    font-semibold
                    tracking-[-0.3px]

                    text-[var(--cf-text)]
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

                    text-[11px]
                    font-semibold

                    text-[var(--cf-primary)]
                  "
                >
                  3
                </span>
              </div>

              <p
                className="
                  mt-[4px]

                  text-[14px]

                  text-[var(--cf-text-secondary)]
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

              text-[12px]

              text-[var(--cf-text-secondary)]
            "
          >
            <Sparkles
              size={12}
              className="
                text-[var(--cf-primary)]
              "
            />

            AI-assisted prioritization
          </div>
        </div>

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
          mt-7

          grid
          gap-5

          xl:grid-cols-[1.4fr_.8fr]
        "
      >
        {/* =================================================
            PIPELINE
        ================================================= */}

        <section
          className="
            rounded-[16px]

            border
            border-[var(--cf-border)]

            bg-[var(--cf-surface)]

            p-6

            shadow-[var(--cf-shadow)]

            transition-colors
            duration-200
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  text-[22px]
                  font-semibold
                  tracking-[-0.2px]

                  text-[var(--cf-text)]
                "
              >
                Pipeline
              </h2>

              <p
                className="
                  mt-2

                  text-[14px]

                  text-[var(--cf-text-secondary)]
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
                items-center
                gap-1

                text-[13px]
                font-semibold

                text-[var(--cf-primary)]

                transition

                hover:opacity-80
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
              mt-8
              space-y-6
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
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          text-[14px]
                          font-medium

                          text-[var(--cf-text)]
                        "
                      >
                        {stage.label}
                      </span>

                      <span
                        className="
                          text-[12px]

                          text-[var(--cf-text-secondary)]
                        "
                      >
                        {stage.count} deals
                      </span>
                    </div>

                    <strong
                      className="
                        text-[14px]
                        font-semibold

                        text-[var(--cf-text)]
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
                        width: stage.width,
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

            overflow-hidden

            rounded-[16px]

            border
            border-[var(--cf-border)]

            bg-[var(--cf-surface)]

            p-6

            text-[var(--cf-text)]

            shadow-[var(--cf-shadow)]

            transition-colors
            duration-200
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
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
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

                  text-[11px]

                  text-[var(--cf-text-secondary)]
                "
              >
                Revenue brief
              </span>
            </div>

            <h3
              className="
                mt-6

                text-[28px]
                font-semibold
                leading-9
                tracking-[-0.6px]

                text-[var(--cf-text)]
              "
            >
              €19,500 could move forward
              with three actions today.
            </h3>

            <p
              className="
                mt-4

                text-[15px]
                leading-7

                text-[var(--cf-text-secondary)]
              "
            >
              Acme has recent proposal
              engagement, TechCorp is ready
              for a proposal and StartupX
              is waiting for your answer.
            </p>

            <div
              className="
                mt-6
                space-y-3
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
                mt-7

                flex
                h-11
                items-center
                gap-2

                rounded-lg

                bg-[var(--cf-text)]

                px-4

                text-[14px]
                font-semibold

                text-[var(--cf-surface)]

                transition

                hover:opacity-90
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

        p-5

        shadow-[var(--cf-shadow)]

        transition-all
        duration-200

        hover:-translate-y-[1px]
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
        <div>
          <p
            className="
              text-[12px]
              font-semibold
              uppercase
              tracking-[0.08em]

              text-[var(--cf-text-secondary)]
            "
          >
            {label}
          </p>

          <p
            className="
              mt-3

              text-[24px]
              font-semibold
              tracking-[-1px]

              text-[var(--cf-text)]
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
          mt-4
          text-[13px]

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

        px-6
        py-6

        transition-colors

        hover:bg-[var(--cf-surface-hover)]

        lg:grid-cols-[minmax(0,1fr)_auto]
        lg:items-center

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
      <div
        className="
          flex
          min-w-0
          gap-4
        "
      >
        <div
          className="
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

            text-[13px]
            font-semibold

            text-[var(--cf-text-secondary)]
          "
        >
          {initials}
        </div>

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

              gap-x-3
              gap-y-1
            "
          >
            <span
              className="
                text-[16px]
                font-semibold

                text-[var(--cf-text)]
              "
            >
              {company}
            </span>

            <span
              className="
                text-[15px]
                font-semibold

                text-[var(--cf-primary)]
              "
            >
              {value}
            </span>
          </div>

          <div
            className="
              mt-1.5

              text-[20px]
              font-semibold

              text-[var(--cf-text)]
            "
          >
            {title}
          </div>

          <p
            className="
              mt-2

              text-[14px]
              leading-6

              text-[var(--cf-text-secondary)]
            "
          >
            {description}
          </p>

          <div
            className="
              mt-4

              flex
              flex-wrap
              gap-2
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

                    px-3
                    py-1.5

                    text-[11px]

                    text-[var(--cf-text-secondary)]
                  "
                >
                  {reason}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <div
        className="
          flex
          items-center
          gap-2

          pl-[64px]

          lg:pl-0
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
            items-center
            gap-2

            rounded-lg

            border
            border-[var(--cf-border)]

            bg-[var(--cf-surface)]

            px-4

            text-[15px]
            font-medium

            text-[var(--cf-text-secondary)]

            shadow-[var(--cf-shadow)]

            transition

            hover:bg-[var(--cf-surface-soft)]
            hover:text-[var(--cf-text)]
          "
        >
          <span
            className={`
              flex
              h-6
              w-6
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

          {action}

          <ArrowRight
            size={12}
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

        px-4
        py-3

        transition

        hover:bg-[var(--cf-surface-hover)]
      "
    >
      <span
        className="
          text-[11px]
          font-semibold

          text-[var(--cf-primary)]
        "
      >
        {number}
      </span>

      <span
        className="
          text-[14px]

          text-[var(--cf-text-secondary)]
        "
      >
        {text}
      </span>
    </div>
  );
}