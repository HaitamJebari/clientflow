'use client';

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  LoaderCircle,
  RefreshCw,
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

interface FollowUpSummary {
  pendingCount: number;
  overdueCount: number;
  dueNext24HoursCount: number;
  upcoming7DaysCount: number;
  completedCount: number;
}

interface FollowUpItem {
  id: string;
  scheduledFor: string;
  subject?: string | null;
  reason?: string | null;

  lead: {
    id: string;
    firstName: string;
    lastName?: string | null;
    company?: string | null;
  };
}

interface FollowUpsResponse {
  data:
    FollowUpItem[];
}

interface ProposalItem {
  id: string;
  title: string;
  viewCount: number;
  viewedAt?: string | null;

  lead: {
    firstName: string;
    lastName?: string | null;
    company?: string | null;
  };
}

interface ProposalsResponse {
  data:
    ProposalItem[];
}

type AlertItem = {
  id: string;
  kind:
    | 'overdue'
    | 'proposal';
  title: string;
  body: string;
  href: string;
  time?: string | null;
};

function personName(
  firstName: string,
  lastName?:
    string | null,
) {
  return [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(' ');
}

function formatTime(
  value?:
    string | null,
) {
  if (!value) {
    return 'Recently';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat(
    'en',
    {
      day:
        'numeric',
      month:
        'short',
      hour:
        '2-digit',
      minute:
        '2-digit',
    },
  ).format(date);
}

export default function NotificationsPage() {
  const {
    request,
  } = useAuth();

  const [
    summary,
    setSummary,
  ] =
    useState<
      FollowUpSummary
    >({
      pendingCount: 0,
      overdueCount: 0,
      dueNext24HoursCount: 0,
      upcoming7DaysCount: 0,
      completedCount: 0,
    });

  const [
    overdue,
    setOverdue,
  ] =
    useState<
      FollowUpItem[]
    >([]);

  const [
    viewed,
    setViewed,
  ] =
    useState<
      ProposalItem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

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
          const [
            totals,
            overdueResponse,
            proposalResponse,
          ] =
            await Promise.all([
              request<
                FollowUpSummary
              >(
                '/follow-ups/summary/overview',
              ),

              request<
                FollowUpsResponse
              >(
                '/follow-ups?page=1&pageSize=20&filter=overdue&sort=due',
              ),

              request<
                ProposalsResponse
              >(
                '/proposals?page=1&pageSize=20&filter=VIEWED&sort=recent',
              ),
            ]);

          setSummary(
            totals,
          );

          setOverdue(
            overdueResponse.data ??
              [],
          );

          setViewed(
            proposalResponse.data ??
              [],
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : 'Unable to load notifications.',
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

  const alerts =
    useMemo<
      AlertItem[]
    >(
      () => [
        ...overdue.map(
          (
            item,
          ) => ({
            id:
              `follow-up-${item.id}`,

            kind:
              'overdue' as const,

            title:
              item.subject ||
              `Follow up with ${item.lead.company || personName(
                item.lead.firstName,
                item.lead.lastName,
              )}`,

            body:
              item.reason ||
              'This follow-up is overdue and needs attention.',

            href:
              '/follow-ups',

            time:
              item.scheduledFor,
          }),
        ),

        ...viewed.map(
          (
            item,
          ) => ({
            id:
              `proposal-${item.id}`,

            kind:
              'proposal' as const,

            title:
              `${item.lead.company || personName(
                item.lead.firstName,
                item.lead.lastName,
              )} viewed a proposal`,

            body:
              `${item.title} has ${item.viewCount} recorded view${
                item.viewCount ===
                1
                  ? ''
                  : 's'
              }.`,

            href:
              `/proposals/${item.id}`,

            time:
              item.viewedAt,
          }),
        ),
      ],
      [
        overdue,
        viewed,
      ],
    );

  return (
    <div
      className="
        min-w-0
        text-[var(--cf-text)]
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5

          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[12px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[var(--cf-text-secondary)]
            "
          >
            Workspace
          </p>

          <h1
            className="
              mt-2
              text-[32px]
              font-semibold
              tracking-[-1px]

              sm:text-[38px]
            "
          >
            Notifications
          </h1>

          <p
            className="
              mt-2
              max-w-[720px]
              text-[15px]
              leading-6
              text-[var(--cf-text-secondary)]

              sm:text-[16px]
            "
          >
            Live workspace alerts built from your real proposals
            and follow-up deadlines.
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
            gap-2
            self-start
            rounded-xl
            border
            border-[var(--cf-border)]
            px-4
            text-[13px]
            font-semibold
            text-[var(--cf-text-secondary)]
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

          Refresh
        </button>
      </div>

      <div
        className="
          mt-6
          grid
          gap-3

          sm:grid-cols-3
        "
      >
        <Metric
          label="Overdue"
          value={
            summary.overdueCount
          }
          icon={
            <AlertTriangle
              size={16}
            />
          }
          danger
        />

        <Metric
          label="Due next 24h"
          value={
            summary.dueNext24HoursCount
          }
          icon={
            <Clock3
              size={16}
            />
          }
        />

        <Metric
          label="Proposal alerts"
          value={
            viewed.length
          }
          icon={
            <Eye
              size={16}
            />
          }
        />
      </div>

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

      <section
        className="
          mt-6
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
            border-b
            border-[var(--cf-border-soft)]
            px-5
            py-4
          "
        >
          <h2
            className="
              text-[16px]
              font-semibold
            "
          >
            Needs your attention
          </h2>

          <p
            className="
              mt-1
              text-[12px]
              text-[var(--cf-text-muted)]
            "
          >
            These are live alerts, not fake read/unread notification records.
          </p>
        </div>

        {loading ? (
          <div
            className="
              flex
              min-h-[300px]
              items-center
              justify-center
              gap-2
              text-[13px]
              text-[var(--cf-text-secondary)]
            "
          >
            <LoaderCircle
              size={16}
              className="
                animate-spin
              "
            />

            Loading alerts
          </div>
        ) : alerts.length ===
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
              You are caught up
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
              There are no overdue follow-ups or currently viewed
              proposal alerts in this workspace.
            </p>
          </div>
        ) : (
          <div
            className="
              divide-y
              divide-[var(--cf-border-soft)]
            "
          >
            {alerts.map(
              (
                alert,
              ) => (
                <Link
                  key={
                    alert.id
                  }
                  href={
                    alert.href
                  }
                  className="
                    flex
                    items-start
                    gap-3
                    px-5
                    py-4
                    transition
                    hover:bg-[var(--cf-surface-hover)]
                  "
                >
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl

                      ${
                        alert.kind ===
                        'overdue'
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
                    {alert.kind ===
                    'overdue' ? (
                      <AlertTriangle
                        size={16}
                      />
                    ) : (
                      <FileText
                        size={16}
                      />
                    )}
                  </div>

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <p
                      className="
                        text-[14px]
                        font-semibold
                      "
                    >
                      {alert.title}
                    </p>

                    <p
                      className="
                        mt-1
                        text-[12px]
                        leading-5
                        text-[var(--cf-text-secondary)]
                      "
                    >
                      {alert.body}
                    </p>

                    <p
                      className="
                        mt-2
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-[0.07em]
                        text-[var(--cf-text-muted)]
                      "
                    >
                      {formatTime(
                        alert.time,
                      )}
                    </p>
                  </div>
                </Link>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  danger = false,
}: {
  label:
    string;
  value:
    number;
  icon:
    React.ReactNode;
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
        "
      >
        <p
          className="
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.08em]
            text-[var(--cf-text-muted)]
          "
        >
          {label}
        </p>

        <span
          className={
            danger
              ? 'text-red-600'
              : 'text-[var(--cf-primary)]'
          }
        >
          {icon}
        </span>
      </div>

      <p
        className={`
          mt-3
          text-[27px]
          font-semibold

          ${
            danger
              ? 'text-red-600'
              : ''
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}
