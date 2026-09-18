'use client';

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  LoaderCircle,
  MailCheck,
  Trash2,
  XCircle,
} from 'lucide-react';

import Link from 'next/link';

import {
  useParams,
  useRouter,
} from 'next/navigation';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  useAuth,
} from '@/components/providers/auth-provider';

import {
  clientFlowSwal,
} from '@/lib/swal';

type ProposalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

interface ProposalDetail {
  id: string;

  title: string;
  status: ProposalStatus;

  amountCents: number;
  currency: string;

  summary?: string | null;
  scope?: string | null;
  timeline?: string | null;
  terms?: string | null;

  validUntil?: string | null;

  sentAt?: string | null;
  viewedAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;

  viewCount: number;

  createdAt: string;
  updatedAt: string;

  lead: {
    id: string;

    firstName: string;
    lastName?: string | null;

    email?: string | null;
    phone?: string | null;

    company?: string | null;
    jobTitle?: string | null;

    stage: string;
    temperature?: string | null;
    qualification: string;

    valueCents?: number | null;
    currency: string;

    nextFollowUpAt?: string | null;
  };

  contact?: {
    id: string;

    firstName: string;
    lastName?: string | null;

    email?: string | null;
    phone?: string | null;

    company?: string | null;
    jobTitle?: string | null;
    website?: string | null;
  } | null;
}

function formatMoney(
  valueCents: number,
  currency = 'EUR',
) {
  return new Intl.NumberFormat(
    'en-IE',
    {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    },
  ).format(
    valueCents / 100,
  );
}

function formatDateTime(
  value?:
    | string
    | null,
) {
  if (!value) {
    return '—';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'en',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(date);
}

function statusClasses(
  status:
    ProposalStatus,
) {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-emerald-500/10 text-emerald-600';

    case 'REJECTED':
      return 'bg-red-500/10 text-red-600';

    case 'VIEWED':
      return 'bg-sky-500/10 text-sky-600';

    case 'SENT':
      return 'bg-violet-500/10 text-violet-600';

    case 'EXPIRED':
      return 'bg-amber-500/10 text-amber-600';

    default:
      return 'bg-[var(--cf-surface-soft)] text-[var(--cf-text-secondary)]';
  }
}

function clientName(
  proposal:
    ProposalDetail,
) {
  const person =
    proposal.contact ??
    proposal.lead;

  return (
    [
      person.firstName,
      person.lastName,
    ]
      .filter(Boolean)
      .join(' ') ||
    person.email ||
    'Unnamed client'
  );
}

export default function ProposalDetailPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const {
    request,
  } = useAuth();

  const [
    proposal,
    setProposal,
  ] =
    useState<
      ProposalDetail | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const loadProposal =
    useCallback(
      async () => {
        setLoading(
          true,
        );
        setError(
          null,
        );

        try {
          const response =
            await request<
              ProposalDetail
            >(
              `/proposals/${params.id}`,
            );

          setProposal(
            response,
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : 'Unable to load proposal.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        params.id,
        request,
      ],
    );

  useEffect(() => {
    void loadProposal();
  }, [loadProposal]);

  async function runAction(
    action:
      'mark-sent'
      | 'record-view'
      | 'accept'
      | 'reject',
  ) {
    if (!proposal) {
      return;
    }

    setActionLoading(
      action,
    );
    setError(
      null,
    );

    try {
      await request(
        `/proposals/${proposal.id}/${action}`,
        {
          method:
            'POST',
        },
      );

      await loadProposal();
    } catch (
      actionError
    ) {
      setError(
        actionError instanceof
          Error
          ? actionError.message
          : 'Unable to update proposal.',
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  async function deleteDraft() {
    if (!proposal) {
      return;
    }

    const result =
      await clientFlowSwal.fire({
        title:
          'Delete draft proposal?',

        text:
          'This removes the draft permanently. The lead and contact will remain.',

        icon:
          'warning',

        showCancelButton:
          true,

        confirmButtonText:
          'Delete draft',

        cancelButtonText:
          'Cancel',
      });

    if (
      !result.isConfirmed
    ) {
      return;
    }

    setActionLoading(
      'delete',
    );

    try {
      await request(
        `/proposals/${proposal.id}`,
        {
          method:
            'DELETE',
        },
      );

      router.push(
        '/proposals',
      );
    } catch (
      deleteError
    ) {
      setError(
        deleteError instanceof
          Error
          ? deleteError.message
          : 'Unable to delete proposal.',
      );

      setActionLoading(
        null,
      );
    }
  }

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[420px]
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
            size={17}
            className="
              animate-spin
            "
          />

          Loading proposal
        </div>
      </div>
    );
  }

  if (
    error &&
    !proposal
  ) {
    return (
      <div
        className="
          rounded-[16px]
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface)]
          p-6
          text-center
        "
      >
        <p
          className="
            text-[15px]
            font-semibold
            text-red-600
          "
        >
          {error}
        </p>

        <Link
          href="/proposals"
          className="
            mt-4
            inline-flex
            text-[13px]
            font-semibold
            text-[var(--cf-primary)]
          "
        >
          Back to proposals
        </Link>
      </div>
    );
  }

  if (!proposal) {
    return null;
  }

  const person =
    proposal.contact ??
    proposal.lead;

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1180px]
        text-[var(--cf-text)]
      "
    >
      <Link
        href="/proposals"
        className="
          inline-flex
          items-center
          gap-2
          text-[13px]
          font-semibold
          text-[var(--cf-text-secondary)]
          transition
          hover:text-[var(--cf-text)]
        "
      >
        <ArrowLeft
          size={15}
        />

        Back to proposals
      </Link>

      <div
        className="
          mt-5
          flex
          flex-col
          gap-5

          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
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
            <span
              className={`
                rounded-full
                px-2.5
                py-1
                text-[12px]
                font-semibold

                ${statusClasses(
                  proposal.status,
                )}
              `}
            >
              {proposal.status.charAt(
                0,
              ) +
                proposal.status
                  .slice(1)
                  .toLowerCase()}
            </span>

            <span
              className="
                text-[12px]
                text-[var(--cf-text-muted)]
              "
            >
              Created{' '}
              {formatDateTime(
                proposal.createdAt,
              )}
            </span>
          </div>

          <h1
            className="
              mt-3
              text-[32px]
              font-semibold
              tracking-[-1px]

              sm:text-[40px]
            "
          >
            {proposal.title}
          </h1>

          <p
            className="
              mt-2
              text-[15px]
              text-[var(--cf-text-secondary)]
            "
          >
            {clientName(
              proposal,
            )}{' '}
            ·{' '}
            {person.company ||
              'No company'}
          </p>
        </div>

        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >
          {proposal.status ===
            'DRAFT' && (
            <>
              <button
                type="button"
                disabled={
                  actionLoading !==
                  null
                }
                onClick={() =>
                  void runAction(
                    'mark-sent',
                  )
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  bg-[var(--cf-primary)]
                  px-4
                  text-[13px]
                  font-semibold
                  text-white
                  disabled:opacity-60
                "
              >
                <MailCheck
                  size={15}
                />

                Mark sent
              </button>

              <button
                type="button"
                disabled={
                  actionLoading !==
                  null
                }
                onClick={() =>
                  void deleteDraft()
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-red-500/20
                  px-4
                  text-[13px]
                  font-semibold
                  text-red-600
                  disabled:opacity-60
                "
              >
                <Trash2
                  size={15}
                />

                Delete draft
              </button>
            </>
          )}

          {(
            proposal.status ===
              'SENT' ||
            proposal.status ===
              'VIEWED'
          ) && (
            <>
              <button
                type="button"
                disabled={
                  actionLoading !==
                  null
                }
                onClick={() =>
                  void runAction(
                    'accept',
                  )
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  bg-emerald-600
                  px-4
                  text-[13px]
                  font-semibold
                  text-white
                  disabled:opacity-60
                "
              >
                <CheckCircle2
                  size={15}
                />

                Mark accepted
              </button>

              <button
                type="button"
                disabled={
                  actionLoading !==
                  null
                }
                onClick={() =>
                  void runAction(
                    'reject',
                  )
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-red-500/20
                  px-4
                  text-[13px]
                  font-semibold
                  text-red-600
                  disabled:opacity-60
                "
              >
                <XCircle
                  size={15}
                />

                Mark rejected
              </button>
            </>
          )}
        </div>
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

      <div
        className="
          mt-7
          grid
          gap-4

          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <Metric
          label="Proposal value"
          value={formatMoney(
            proposal.amountCents,
            proposal.currency,
          )}
        />

        <Metric
          label="Views"
          value={String(
            proposal.viewCount,
          )}
        />

        <Metric
          label="Valid until"
          value={formatDateTime(
            proposal.validUntil,
          )}
        />

        <Metric
          label="Opportunity stage"
          value={
            proposal.lead
              .stage
          }
        />
      </div>

      <div
        className="
          mt-5
          grid
          gap-5

          xl:grid-cols-[minmax(0,1fr)_340px]
        "
      >
        <main
          className="
            space-y-4
          "
        >
          <ProposalSection
            title="Executive summary"
            value={
              proposal.summary
            }
          />

          <ProposalSection
            title="Scope"
            value={
              proposal.scope
            }
          />

          <ProposalSection
            title="Timeline"
            value={
              proposal.timeline
            }
          />

          <ProposalSection
            title="Terms"
            value={
              proposal.terms
            }
          />
        </main>

        <aside
          className="
            space-y-4
          "
        >
          <section
            className="
              rounded-[16px]
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface)]
              p-5
              shadow-[var(--cf-shadow)]
            "
          >
            <h2
              className="
                text-[17px]
                font-semibold
              "
            >
              Client
            </h2>

            <p
              className="
                mt-4
                text-[15px]
                font-semibold
              "
            >
              {clientName(
                proposal,
              )}
            </p>

            <p
              className="
                mt-1
                text-[13px]
                text-[var(--cf-text-secondary)]
              "
            >
              {person.jobTitle ||
                'No job title'}
            </p>

            <div
              className="
                mt-4
                space-y-2
                text-[13px]
                text-[var(--cf-text-secondary)]
              "
            >
              <p>
                {person.email ||
                  'No email'}
              </p>

              <p>
                {person.phone ||
                  'No phone'}
              </p>

              <p>
                {person.company ||
                  'No company'}
              </p>
            </div>

            <Link
              href={`/leads/${proposal.lead.id}`}
              className="
                mt-4
                inline-flex
                text-[13px]
                font-semibold
                text-[var(--cf-primary)]
              "
            >
              Open opportunity
            </Link>
          </section>

          <section
            className="
              rounded-[16px]
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface)]
              p-5
              shadow-[var(--cf-shadow)]
            "
          >
            <h2
              className="
                text-[17px]
                font-semibold
              "
            >
              Status history
            </h2>

            <div
              className="
                mt-4
                space-y-3
              "
            >
              <StatusRow
                icon={
                  Clock3
                }
                label="Created"
                value={formatDateTime(
                  proposal.createdAt,
                )}
              />

              <StatusRow
                icon={
                  MailCheck
                }
                label="Sent"
                value={formatDateTime(
                  proposal.sentAt,
                )}
              />

              <StatusRow
                icon={
                  Eye
                }
                label="Viewed"
                value={formatDateTime(
                  proposal.viewedAt,
                )}
              />

              <StatusRow
                icon={
                  CheckCircle2
                }
                label="Accepted"
                value={formatDateTime(
                  proposal.acceptedAt,
                )}
              />

              <StatusRow
                icon={
                  XCircle
                }
                label="Rejected"
                value={formatDateTime(
                  proposal.rejectedAt,
                )}
              />
            </div>
          </section>

          {(
            proposal.status ===
              'SENT' ||
            proposal.status ===
              'VIEWED'
          ) && (
            <button
              type="button"
              disabled={
                actionLoading !==
                null
              }
              onClick={() =>
                void runAction(
                  'record-view',
                )
              }
              className="
                w-full
                rounded-xl
                border
                border-[var(--cf-border)]
                bg-[var(--cf-surface-soft)]
                px-4
                py-3
                text-[12px]
                font-semibold
                text-[var(--cf-text-secondary)]
                disabled:opacity-60
              "
            >
              Development test: record one view
            </button>
          )}

          <p
            className="
              px-1
              text-[11px]
              leading-5
              text-[var(--cf-text-muted)]
            "
          >
            “Mark sent” records proposal state only. External
            email delivery and public client acceptance are
            separate integration steps.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
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

      <p
        className="
          mt-2
          break-words
          text-[18px]
          font-semibold
        "
      >
        {value}
      </p>
    </div>
  );
}

function ProposalSection({
  title,
  value,
}: {
  title: string;
  value?:
    | string
    | null;
}) {
  return (
    <section
      className="
        rounded-[16px]
        border
        border-[var(--cf-border)]
        bg-[var(--cf-surface)]
        p-5
        shadow-[var(--cf-shadow)]

        sm:p-6
      "
    >
      <h2
        className="
          text-[19px]
          font-semibold
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-3
          whitespace-pre-wrap
          text-[14px]
          leading-7
          text-[var(--cf-text-secondary)]
        "
      >
        {value ||
          'Not added yet.'}
      </p>
    </section>
  );
}

function StatusRow({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
      "
    >
      <div
        className="
          mt-0.5
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[var(--cf-surface-soft)]
          text-[var(--cf-text-secondary)]
        "
      >
        <Icon
          size={14}
        />
      </div>

      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            text-[12px]
            font-semibold
            text-[var(--cf-text)]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            text-[12px]
            leading-5
            text-[var(--cf-text-muted)]
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}
