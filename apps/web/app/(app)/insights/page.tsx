'use client';

import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Flame,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  UserRoundSearch,
} from 'lucide-react';

import Link from 'next/link';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useAuth,
} from '@/components/providers/auth-provider';

type Urgency =
  | 'critical'
  | 'high'
  | 'medium';

interface InsightItem {
  leadId: string;
  contactId?: string | null;

  personName: string;
  company?: string | null;
  email?: string | null;

  stage: string;
  temperature?: string | null;

  valueCents?: number | null;
  currency: string;

  urgency: Urgency;
  actionType: string;

  action: string;
  whyNow: string;
  when: string;
  suggestedMessage: string;

  evidence: string[];
  missingInformation: string[];

  href: string;
}

interface InsightsResponse {
  summary: {
    totalRecommendations: number;
    criticalCount: number;
    highCount: number;
    dueNowCount: number;
    valueAtAttentionCents: number;
    currency: string;
  };

  queue: InsightItem[];

  generatedAt: string;

  methodology: {
    type: string;
    note: string;
  };
}

function formatMoney(
  valueCents:
    | number
    | null
    | undefined,

  currency:
    string,
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
    (
      valueCents ??
      0
    ) / 100,
  );
}

function urgencyLabel(
  urgency:
    Urgency,
) {
  if (
    urgency ===
    'critical'
  ) {
    return 'Act now';
  }

  if (
    urgency ===
    'high'
  ) {
    return 'High priority';
  }

  return 'Important';
}

function actionIcon(
  actionType:
    string,
) {
  if (
    actionType ===
    'CREATE_PROPOSAL'
  ) {
    return FileText;
  }

  if (
    actionType ===
    'FIRST_CONTACT'
  ) {
    return UserRoundSearch;
  }

  if (
    actionType ===
    'ADVANCE_NEGOTIATION'
  ) {
    return Target;
  }

  if (
    actionType ===
    'RE_ENGAGE'
  ) {
    return MessageSquareText;
  }

  return Send;
}

export default function InsightsPage() {
  const {
    request,
  } = useAuth();

  const [
    data,
    setData,
  ] =
    useState<
      InsightsResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    activeUrgency,
    setActiveUrgency,
  ] =
    useState<
      'all' |
      Urgency
    >('all');

  const load =
    useCallback(
      async (
        background =
          false,
      ) => {
        if (
          background
        ) {
          setRefreshing(
            true,
          );
        } else {
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
              InsightsResponse
            >(
              '/insights/overview',
            );

          setData(
            response,
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : 'Unable to load sales intelligence.',
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [request],
    );

  useEffect(() => {
    void load();
  }, [load]);

  const queue =
    useMemo(
      () => {
        if (
          !data
        ) {
          return [];
        }

        if (
          activeUrgency ===
          'all'
        ) {
          return data.queue;
        }

        return data.queue.filter(
          (
            item,
          ) =>
            item.urgency ===
            activeUrgency,
        );
      },
      [
        activeUrgency,
        data,
      ],
    );

  if (
    loading
  ) {
    return (
      <div
        className="
          flex
          min-h-[55vh]
          items-center
          justify-center
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-[14px]
            text-[var(--cf-text-secondary)]
          "
        >
          <LoaderCircle
            size={18}
            className="
              animate-spin
            "
          />

          Building your action queue
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        min-w-0
        text-[var(--cf-text)]
      "
    >
      <header
        className="
          flex
          flex-col
          gap-5

          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-2
              text-[12px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[var(--cf-text-secondary)]
            "
          >
            <BrainCircuit
              size={15}
              className="
                text-[var(--cf-primary)]
              "
            />

            Revenue intelligence
          </div>

          <h1
            className="
              mt-2
              text-[32px]
              font-semibold
              tracking-[-1px]

              sm:text-[38px]

              lg:text-[44px]
              lg:tracking-[-1.4px]
            "
          >
            Next best actions
          </h1>

          <p
            className="
              mt-3
              max-w-[760px]
              text-[15px]
              leading-7
              text-[var(--cf-text-secondary)]

              sm:text-[16px]
            "
          >
            Know who deserves attention, why it matters now,
            what to do next, when to act and what you could say.
          </p>
        </div>

        <button
          type="button"
          disabled={
            refreshing
          }
          onClick={() =>
            void load(
              true,
            )
          }
          className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            self-start
            rounded-xl
            border
            border-[var(--cf-border)]
            bg-[var(--cf-surface)]
            px-4
            text-[13px]
            font-semibold
            text-[var(--cf-text-secondary)]
            transition
            hover:bg-[var(--cf-surface-soft)]
            disabled:opacity-60
          "
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? 'animate-spin'
                : ''
            }
          />

          Refresh signals
        </button>
      </header>

      {error && (
        <div
          className="
            mt-5
            rounded-xl
            border
            border-red-500/20
            bg-red-500/5
            px-4
            py-3
            text-[13px]
            text-red-600
          "
        >
          {error}
        </div>
      )}

      <div
        className="
          mt-6
          grid
          gap-3

          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <MetricCard
          icon={
            <AlertTriangle
              size={17}
            />
          }
          label="Act now"
          value={
            data?.summary
              .criticalCount ??
            0
          }
          helper="Critical signals"
          danger
        />

        <MetricCard
          icon={
            <Flame
              size={17}
            />
          }
          label="High priority"
          value={
            data?.summary
              .highCount ??
            0
          }
          helper="Strong next actions"
        />

        <MetricCard
          icon={
            <Clock3
              size={17}
            />
          }
          label="Due now / today"
          value={
            data?.summary
              .dueNowCount ??
            0
          }
          helper="Time-sensitive"
        />

        <MetricCard
          icon={
            <CircleDollarSign
              size={17}
            />
          }
          label="Value needing attention"
          value={formatMoney(
            data?.summary
              .valueAtAttentionCents,
            data?.summary
              .currency ??
              'EUR',
          )}
          helper="Across the current queue"
        />
      </div>

      <div
        className="
          mt-6
          grid
          gap-5

          xl:grid-cols-[minmax(0,1fr)_320px]
        "
      >
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
              flex
              flex-col
              gap-3
              border-b
              border-[var(--cf-border-soft)]
              px-4
              py-4

              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-5
            "
          >
            <div>
              <h2
                className="
                  text-[16px]
                  font-semibold
                "
              >
                Priority queue
              </h2>

              <p
                className="
                  mt-1
                  text-[12px]
                  text-[var(--cf-text-muted)]
                "
              >
                Ordered from the strongest live sales signals.
              </p>
            </div>

            <div
              className="
                flex
                gap-1.5
                overflow-x-auto
              "
            >
              {(
                [
                  [
                    'all',
                    'All',
                  ],
                  [
                    'critical',
                    'Act now',
                  ],
                  [
                    'high',
                    'High',
                  ],
                  [
                    'medium',
                    'Important',
                  ],
                ] as const
              ).map(
                (
                  [
                    value,
                    label,
                  ],
                ) => (
                  <button
                    key={
                      value
                    }
                    type="button"
                    onClick={() =>
                      setActiveUrgency(
                        value,
                      )
                    }
                    className={`
                      whitespace-nowrap
                      rounded-lg
                      px-3
                      py-2
                      text-[12px]
                      font-semibold
                      transition

                      ${
                        activeUrgency ===
                        value
                          ? `
                            bg-[var(--cf-primary-soft)]
                            text-[var(--cf-primary)]
                          `
                          : `
                            text-[var(--cf-text-secondary)]
                            hover:bg-[var(--cf-surface-soft)]
                          `
                      }
                    `}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>

          {queue.length ===
          0 ? (
            <div
              className="
                flex
                min-h-[320px]
                flex-col
                items-center
                justify-center
                px-6
                text-center
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-500/10
                  text-emerald-600
                "
              >
                <CheckCircle2
                  size={20}
                />
              </div>

              <h3
                className="
                  mt-4
                  text-[17px]
                  font-semibold
                "
              >
                No actions in this view
              </h3>

              <p
                className="
                  mt-2
                  max-w-[420px]
                  text-[13px]
                  leading-6
                  text-[var(--cf-text-secondary)]
                "
              >
                Your current pipeline does not contain a matching
                signal. Try another priority filter or refresh.
              </p>
            </div>
          ) : (
            <div
              className="
                divide-y
                divide-[var(--cf-border-soft)]
              "
            >
              {queue.map(
                (
                  item,
                  index,
                ) => (
                  <InsightCard
                    key={`${item.leadId}-${item.actionType}`}
                    item={
                      item
                    }
                    position={
                      index +
                      1
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>

        <aside
          className="
            space-y-4
          "
        >
          <div
            className="
              rounded-[16px]
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface)]
              p-5
              shadow-[var(--cf-shadow)]
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
              <BrainCircuit
                size={18}
              />
            </div>

            <h3
              className="
                mt-4
                text-[16px]
                font-semibold
              "
            >
              Why these actions appear
            </h3>

            <p
              className="
                mt-2
                text-[13px]
                leading-6
                text-[var(--cf-text-secondary)]
              "
            >
              ClientFlow uses real follow-up timing, proposal
              engagement, opportunity stage, temperature and inactivity.
            </p>

            <div
              className="
                mt-4
                rounded-xl
                border
                border-[var(--cf-border-soft)]
                bg-[var(--cf-surface-soft)]
                p-3
              "
            >
              <p
                className="
                  text-[12px]
                  font-semibold
                "
              >
                No fake close probability
              </p>

              <p
                className="
                  mt-1
                  text-[12px]
                  leading-5
                  text-[var(--cf-text-secondary)]
                "
              >
                Priority is based on visible evidence, not an invented
                percentage chance of winning.
              </p>
            </div>
          </div>

          <div
            className="
              rounded-[16px]
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface)]
              p-5
              shadow-[var(--cf-shadow)]
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <Sparkles
                size={15}
                className="
                  text-[var(--cf-primary)]
                "
              />

              <p
                className="
                  text-[12px]
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  text-[var(--cf-text-muted)]
                "
              >
                Current phase
              </p>
            </div>

            <h3
              className="
                mt-3
                text-[15px]
                font-semibold
              "
            >
              Evidence-based intelligence
            </h3>

            <p
              className="
                mt-2
                text-[12px]
                leading-5
                text-[var(--cf-text-secondary)]
              "
            >
              The suggested messages are deterministic drafts from your
              live sales context. The next phase can replace only the
              drafting layer with a real AI provider while keeping human
              approval.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
  danger = false,
}: {
  icon:
    React.ReactNode;
  label:
    string;
  value:
    string | number;
  helper:
    string;
  danger?:
    boolean;
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
        <p
          className="
            text-[12px]
            font-semibold
            uppercase
            tracking-[0.08em]
            text-[var(--cf-text-muted)]
          "
        >
          {label}
        </p>

        <span
          className={`
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg

            ${
              danger
                ? `
                  bg-red-500/10
                  text-red-600
                `
                : `
                  bg-[var(--cf-primary-soft)]
                  text-[var(--cf-primary)]
                `
            }
          `}
        >
          {icon}
        </span>
      </div>

      <p
        className={`
          mt-3
          text-[27px]
          font-semibold
          tracking-[-0.8px]

          ${
            danger
              ? 'text-red-600'
              : 'text-[var(--cf-text)]'
          }
        `}
      >
        {value}
      </p>

      <p
        className="
          mt-1
          text-[12px]
          text-[var(--cf-text-secondary)]
        "
      >
        {helper}
      </p>
    </div>
  );
}

function InsightCard({
  item,
  position,
}: {
  item:
    InsightItem;
  position:
    number;
}) {
  const Icon =
    actionIcon(
      item.actionType,
    );

  const badge =
    item.urgency ===
      'critical'
      ? `
        border-red-500/20
        bg-red-500/10
        text-red-600
      `
      : item.urgency ===
          'high'
        ? `
          border-amber-500/20
          bg-amber-500/10
          text-amber-600
        `
        : `
          border-[var(--cf-border)]
          bg-[var(--cf-surface-soft)]
          text-[var(--cf-text-secondary)]
        `;

  return (
    <article
      className="
        px-4
        py-5

        sm:px-5
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4

          lg:flex-row
          lg:items-start
        "
      >
        <div
          className="
            flex
            min-w-0
            flex-1
            items-start
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
            <span
              className="
                text-[12px]
                font-semibold
              "
            >
              {position}
            </span>
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
                gap-2
              "
            >
              <h3
                className="
                  text-[15px]
                  font-semibold
                "
              >
                {item.company ||
                  item.personName}
              </h3>

              <span
                className={`
                  rounded-full
                  border
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold

                  ${badge}
                `}
              >
                {urgencyLabel(
                  item.urgency,
                )}
              </span>
            </div>

            <p
              className="
                mt-1
                text-[12px]
                text-[var(--cf-text-muted)]
              "
            >
              {item.personName}{' '}
              ·{' '}
              {item.stage}{' '}
              ·{' '}
              {formatMoney(
                item.valueCents,
                item.currency,
              )}
            </p>

            <div
              className="
                mt-4
                grid
                gap-3

                md:grid-cols-3
              "
            >
              <SignalBlock
                label="Why now"
                value={
                  item.whyNow
                }
              />

              <SignalBlock
                label="Next action"
                value={
                  item.action
                }
                strong
              />

              <SignalBlock
                label="When"
                value={
                  item.when
                }
              />
            </div>

            <div
              className="
                mt-4
                rounded-xl
                border
                border-[var(--cf-border-soft)]
                bg-[var(--cf-surface-soft)]
                p-3.5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <MessageSquareText
                  size={14}
                  className="
                    text-[var(--cf-primary)]
                  "
                />

                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-[var(--cf-text-muted)]
                  "
                >
                  Suggested message
                </p>
              </div>

              <p
                className="
                  mt-2
                  text-[13px]
                  leading-6
                  text-[var(--cf-text-secondary)]
                "
              >
                {item.suggestedMessage}
              </p>
            </div>

            <div
              className="
                mt-3
                flex
                flex-wrap
                gap-2
              "
            >
              {item.evidence.map(
                (
                  evidence,
                ) => (
                  <span
                    key={
                      evidence
                    }
                    className="
                      rounded-full
                      border
                      border-[var(--cf-border)]
                      bg-[var(--cf-surface)]
                      px-2.5
                      py-1
                      text-[10px]
                      font-medium
                      text-[var(--cf-text-secondary)]
                    "
                  >
                    {evidence}
                  </span>
                ),
              )}
            </div>

            {item.missingInformation.length >
              0 && (
              <p
                className="
                  mt-3
                  text-[11px]
                  leading-5
                  text-[var(--cf-text-muted)]
                "
              >
                Missing context:{' '}
                {item.missingInformation.join(
                  ', ',
                )}
              </p>
            )}
          </div>
        </div>

        <Link
          href={
            item.href
          }
          className="
            inline-flex
            min-h-10
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[var(--cf-primary)]
            px-4
            py-2
            text-center
            text-[12px]
            font-semibold
            text-white
            transition
            hover:bg-[var(--cf-primary-hover)]
          "
        >
          <Icon
            size={14}
          />

          {item.action}

          <ArrowRight
            size={13}
          />
        </Link>
      </div>
    </article>
  );
}

function SignalBlock({
  label,
  value,
  strong = false,
}: {
  label:
    string;
  value:
    string;
  strong?:
    boolean;
}) {
  return (
    <div>
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.08em]
          text-[var(--cf-text-muted)]
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1.5
          text-[12px]
          leading-5

          ${
            strong
              ? `
                font-semibold
                text-[var(--cf-text)]
              `
              : `
                text-[var(--cf-text-secondary)]
              `
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}
