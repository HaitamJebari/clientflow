'use client';

import {
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  MessageSquareText,
  MoreHorizontal,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
} from 'lucide-react';

import Link from 'next/link';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  ElementType,
} from 'react';

import { useAuth } from '@/components/providers/auth-provider';


/* =========================================================
   DASHBOARD DATA
========================================================= */

type ApiLeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION';

type ApiLeadTemperature =
  | 'HOT'
  | 'WARM'
  | 'COLD';

interface DashboardAttentionLead {
  id: string;

  firstName: string;
  lastName?: string | null;

  company?: string | null;

  stage: ApiLeadStage;

  temperature?:
    | ApiLeadTemperature
    | null;

  valueCents: number;
  currency: string;

  nextFollowUpAt?:
    | string
    | null;

  lastActivityAt?:
    | string
    | null;

  updatedAt: string;

  aiNextBestAction?:
    | string
    | null;
}

interface DashboardStage {
  stage: ApiLeadStage;
  count: number;
  totalValueCents: number;
}

interface DashboardOverview {
  metrics: {
    openPipelineValueCents:
      number;

    activeLeadCount:
      number;

    hotActiveLeadCount:
      number;

    conversionRate:
      number | null;

    closedCount:
      number;

    wonCount:
      number;

    wonRevenueCents:
      number;

    currency:
      string;
  };

  pipelineStages:
    DashboardStage[];

  attention:
    DashboardAttentionLead[];

  generatedAt:
    string;
}

interface AttentionPresentation {
  id: string;
  company: string;
  initials: string;
  value: string;
  title: string;
  description: string;
  reasons: string[];
  action: string;
  accent: string;
  icon: ElementType;
}

const stageLabels:
  Record<
    ApiLeadStage,
    string
  > = {
    NEW: 'New',
    CONTACTED:
      'Contacted',
    QUALIFIED:
      'Qualified',
    PROPOSAL:
      'Proposal',
    NEGOTIATION:
      'Negotiation',
  };

function formatMoney(
  valueCents: number,
  currency = 'EUR',
) {
  return new Intl.NumberFormat(
    'en-IE',
    {
      style:
        'currency',

      currency,

      maximumFractionDigits:
        0,
    },
  ).format(
    valueCents / 100,
  );
}

function initialsForLead(
  lead:
    DashboardAttentionLead,
) {
  const first =
    lead.firstName
      ?.trim()?.[0] ??
    '';

  const last =
    lead.lastName
      ?.trim()?.[0] ??
    '';

  return (
    `${first}${last}`
      .toUpperCase() ||
    lead.company
      ?.slice(0, 2)
      .toUpperCase() ||
    'OP'
  );
}

function leadDisplayName(
  lead:
    DashboardAttentionLead,
) {
  return (
    lead.company?.trim() ||
    [
      lead.firstName,
      lead.lastName,
    ]
      .filter(Boolean)
      .join(' ') ||
    'Opportunity'
  );
}

function isFollowUpDue(
  value?:
    | string
    | null,
) {
  if (!value) {
    return false;
  }

  const date =
    new Date(value);

  return (
    !Number.isNaN(
      date.getTime(),
    ) &&
    date.getTime() <=
      Date.now()
  );
}

function stageAction(
  stage:
    ApiLeadStage,
) {
  switch (stage) {
    case 'NEW':
      return 'Qualify lead';

    case 'CONTACTED':
      return 'Review conversation';

    case 'QUALIFIED':
      return 'Prepare next step';

    case 'PROPOSAL':
      return 'Review proposal';

    case 'NEGOTIATION':
      return 'Review negotiation';

    default:
      return 'Review opportunity';
  }
}

function attentionPresentation(
  lead:
    DashboardAttentionLead,
): AttentionPresentation {
  const followUpDue =
    isFollowUpDue(
      lead.nextFollowUpAt,
    );

  const hot =
    lead.temperature ===
    'HOT';

  const reasons:
    string[] = [];

  if (followUpDue) {
    reasons.push(
      'Follow-up due',
    );
  }

  if (hot) {
    reasons.push(
      'Hot opportunity',
    );
  }

  if (
    lead.valueCents >=
    500_000
  ) {
    reasons.push(
      'High-value opportunity',
    );
  }

  if (
    lead.stage ===
      'PROPOSAL' ||
    lead.stage ===
      'NEGOTIATION'
  ) {
    reasons.push(
      `${stageLabels[
        lead.stage
      ]} stage`,
    );
  }

  if (
    reasons.length === 0
  ) {
    reasons.push(
      'Priority review',
    );
  }

  const company =
    leadDisplayName(
      lead,
    );

  const title =
    followUpDue
      ? 'Follow-up is due'
      : hot
        ? 'High-intent opportunity needs review'
        : 'Opportunity needs review';

  const description =
    followUpDue
      ? `${company} has a scheduled follow-up that is due now.`
      : `${company} is marked hot and is still in the ${stageLabels[
          lead.stage
        ].toLowerCase()} stage.`;

  return {
    id:
      lead.id,

    company,

    initials:
      initialsForLead(
        lead,
      ),

    value:
      formatMoney(
        lead.valueCents,
        lead.currency,
      ),

    title,
    description,
    reasons,

    action:
      lead.aiNextBestAction?.trim() ||
      (
        followUpDue
          ? 'Review follow-up'
          : stageAction(
              lead.stage,
            )
      ),

    accent:
      followUpDue
        ? 'warning'
        : hot
          ? 'primary'
          : 'info',

    icon:
      followUpDue
        ? Clock3
        : hot
          ? Target
          : FileText,
  };
}

function dashboardErrorMessage(
  error: unknown,
) {
  if (
    error instanceof
    Error
  ) {
    return error.message;
  }

  return 'Unable to load the dashboard.';
}

/* =========================================================
   DASHBOARD PAGE
========================================================= */

export default function DashboardPage() {
  const {
    user,
    request,
  } = useAuth();

  const firstName =
    user?.firstName ||
    'there';

  const [
    overview,
    setOverview,
  ] =
    useState<
      DashboardOverview | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const loadDashboard =
    useCallback(
      async (
        showLoading =
          true,
      ) => {
        if (showLoading) {
          setLoading(
            true,
          );
        }

        setError(
          null,
        );

        try {
          const response =
            await request<
              DashboardOverview
            >(
              '/dashboard/overview',
            );

          setOverview(
            response,
          );
        } catch (
          loadError
        ) {
          setError(
            dashboardErrorMessage(
              loadError,
            ),
          );
        } finally {
          if (showLoading) {
            setLoading(
              false,
            );
          }
        }
      },
      [request],
    );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const attentionItems =
    useMemo(
      () =>
        (
          overview?.attention ??
          []
        ).map(
          attentionPresentation,
        ),
      [overview],
    );

  const pipelineStages =
    useMemo(
      () => {
        const stages =
          overview?.pipelineStages ??
          [];

        const openValue =
          overview?.metrics
            .openPipelineValueCents ??
          0;

        return stages.map(
          (stage) => {
            const width =
              openValue > 0
                ? Math.max(
                    stage.totalValueCents >
                      0
                      ? 6
                      : 0,

                    Math.round(
                      (
                        stage.totalValueCents /
                        openValue
                      ) * 100,
                    ),
                  )
                : stage.count >
                    0
                  ? 12
                  : 0;

            return {
              label:
                stageLabels[
                  stage.stage
                ],

              value:
                formatMoney(
                  stage.totalValueCents,
                  overview?.metrics
                    .currency ??
                    'EUR',
                ),

              count:
                stage.count,

              width:
                `${Math.min(
                  width,
                  100,
                )}%`,
            };
          },
        );
      },
      [overview],
    );

  const priorityValueCents =
    (
      overview?.attention ??
      []
    ).reduce(
      (
        total,
        lead,
      ) =>
        total +
        lead.valueCents,
      0,
    );

  const priorityNames =
    attentionItems.map(
      (item) =>
        item.company,
    );

  if (
    loading &&
    !overview
  ) {
    return (
      <DashboardLoading
        firstName={
          firstName
        }
      />
    );
  }

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

        <Link
          href="/leads"
          aria-label="Add opportunity"
          data-tooltip="Open leads and create a new sales opportunity"
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
        </Link>
      </div>

      {error && (
        <div
          className="
            mt-5
            flex
            flex-col
            gap-3

            rounded-xl
            border
            border-red-500/20
            bg-red-500/5

            px-4
            py-3

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div
            className="
              flex
              items-start
              gap-2.5
            "
          >
            <AlertCircle
              size={17}
              className="
                mt-0.5
                shrink-0
                text-red-500
              "
            />

            <p
              className="
                text-[13px]
                leading-5
                text-red-600
              "
            >
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadDashboard()
            }
            className="
              inline-flex
              h-9
              items-center
              justify-center
              gap-2
              self-start

              rounded-lg
              border
              border-red-500/20

              px-3

              text-[12px]
              font-semibold
              text-red-600

              transition
              hover:bg-red-500/10

              sm:self-auto
            "
          >
            <RefreshCw
              size={13}
            />

            Retry
          </button>
        </div>
      )}

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
          value={formatMoney(
            overview?.metrics
              .openPipelineValueCents ??
              0,

            overview?.metrics
              .currency ??
              'EUR',
          )}
          helper={`${overview?.metrics.activeLeadCount ?? 0} open opportunities`}
          icon={TrendingUp}
        />

        <MetricCard
          label="Active leads"
          value={String(
            overview?.metrics
              .activeLeadCount ??
              0,
          )}
          helper={`${overview?.metrics.hotActiveLeadCount ?? 0} hot right now`}
          icon={UsersRound}
        />

        <MetricCard
          label="Conversion"
          value={
            overview?.metrics
              .conversionRate ===
            null ||
            overview?.metrics
              .conversionRate ===
              undefined
              ? '—'
              : `${overview.metrics.conversionRate}%`
          }
          helper={
            (
              overview?.metrics
                .closedCount ??
              0
            ) > 0
              ? 'Won ÷ closed opportunities'
              : 'No closed opportunities yet'
          }
          icon={Target}
        />

        <MetricCard
          label="Deals won"
          value={String(
            overview?.metrics
              .wonCount ??
              0,
          )}
          helper={`${formatMoney(
            overview?.metrics
              .wonRevenueCents ??
              0,

            overview?.metrics
              .currency ??
              'EUR',
          )} won revenue`}
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
                  {attentionItems.length}
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
                Ranked using due follow-ups,
                temperature and opportunity value.
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
            <Target
              size={12}
              className="
                shrink-0

                text-[var(--cf-primary)]
              "
            />

            Priority signals
          </div>
        </div>

        <div>
          {attentionItems.length >
          0 ? (
            attentionItems.map(
              (
                item,
                index,
              ) => (
                <AttentionItem
                  key={
                    item.id
                  }
                  {...item}
                  last={
                    index ===
                    attentionItems.length -
                      1
                  }
                />
              ),
            )
          ) : (
            <div
              className="
                flex
                min-h-[170px]
                flex-col
                items-center
                justify-center

                px-5
                py-8

                text-center
              "
            >
              <CheckCircle2
                size={24}
                className="
                  text-[var(--cf-success)]
                "
              />

              <p
                className="
                  mt-3
                  text-[15px]
                  font-semibold
                  text-[var(--cf-text)]
                "
              >
                No urgent opportunities
              </p>

              <p
                className="
                  mt-1
                  max-w-[460px]
                  text-[13px]
                  leading-6
                  text-[var(--cf-text-secondary)]
                "
              >
                Nothing is currently overdue or marked hot.
                Your pipeline still remains available below.
              </p>
            </div>
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
                {formatMoney(
                  overview?.metrics
                    .openPipelineValueCents ??
                    0,

                  overview?.metrics
                    .currency ??
                    'EUR',
                )}{' '}
                across{' '}
                {overview?.metrics
                  .activeLeadCount ??
                  0}{' '}
                open opportunities
              </p>
            </div>

            <Link
              href="/pipeline"
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
            </Link>
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
                  key={
                    stage.label
                  }
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
                        {stage.count}{' '}
                        {stage.count ===
                        1
                          ? 'deal'
                          : 'deals'}
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
              {attentionItems.length >
              0 ? (
                <>
                  {formatMoney(
                    priorityValueCents,
                    overview?.metrics
                      .currency ??
                      'EUR',
                  )}{' '}
                  is tied to{' '}
                  {attentionItems.length}{' '}
                  priority{' '}
                  {attentionItems.length ===
                  1
                    ? 'action'
                    : 'actions'}{' '}
                  right now.
                </>
              ) : (
                <>
                  Your urgent queue is clear.
                </>
              )}
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
              {attentionItems.length >
              0
                ? `${priorityNames.join(
                    ', ',
                  )} ${
                    attentionItems.length ===
                    1
                      ? 'needs'
                      : 'need'
                  } attention based on current ClientFlow signals.`
                : 'No follow-up is overdue and no open opportunity is currently marked hot.'}
            </p>

            <div
              className="
                mt-5
                space-y-2.5

                sm:mt-6
                sm:space-y-3
              "
            >
              {attentionItems.length >
              0 ? (
                attentionItems.map(
                  (
                    item,
                    index,
                  ) => (
                    <BriefRow
                      key={
                        item.id
                      }
                      number={String(
                        index + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                      text={`${item.action} — ${item.company}`}
                    />
                  ),
                )
              ) : (
                <BriefRow
                  number="✓"
                  text="Keep reviewing new opportunities as they arrive"
                />
              )}
            </div>

            <Link
              href="/leads"
              aria-label="Review priorities"
              data-tooltip="Review today's highest-priority opportunities"
              data-tooltip-position="top"
              className="
                mt-6

                flex
                h-11
                w-fit
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
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardLoading({
  firstName,
}: {
  firstName: string;
}) {
  return (
    <div
      className="
        cf-dashboard-enter
        min-w-0
        text-[var(--cf-text)]
      "
    >
      <div
        className="
          flex
          min-h-[420px]
          flex-col
          items-center
          justify-center

          rounded-[18px]
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface)]

          px-5
          text-center

          shadow-[var(--cf-shadow)]
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center

            rounded-xl
            bg-[var(--cf-primary-soft)]

            text-[var(--cf-primary)]
          "
        >
          <LoaderCircle
            size={19}
            className="
              animate-spin
            "
          />
        </div>

        <h1
          className="
            mt-4
            text-[20px]
            font-semibold
            tracking-[-0.3px]
          "
        >
          Loading your workspace, {firstName}
        </h1>

        <p
          className="
            mt-2
            max-w-[420px]
            text-[13px]
            leading-6
            text-[var(--cf-text-secondary)]
          "
        >
          ClientFlow is calculating your live pipeline,
          priorities and revenue signals.
        </p>
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
  id,
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
  id: string;
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

        <Link
          href={`/leads/${id}`}
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
        </Link>


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