'use client';

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LoaderCircle,
  Plus,
  Search,
} from 'lucide-react';

import Link from 'next/link';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useAuth,
} from '@/components/providers/auth-provider';

type ProposalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

type ProposalFilter =
  | 'all'
  | ProposalStatus;

type ProposalSort =
  | 'recent'
  | 'title'
  | 'amount'
  | 'status';

interface ProposalListItem {
  id: string;

  title: string;
  status: ProposalStatus;

  amountCents: number;
  currency: string;

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
    company?: string | null;

    stage: string;

    valueCents?: number | null;
    currency?: string | null;
  };

  contact?: {
    id: string;

    firstName: string;
    lastName?: string | null;

    email?: string | null;
    company?: string | null;
  } | null;
}

interface ProposalListResponse {
  data: ProposalListItem[];

  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

const statusOptions: {
  value: ProposalFilter;
  label: string;
}[] = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'DRAFT',
    label: 'Draft',
  },
  {
    value: 'SENT',
    label: 'Sent',
  },
  {
    value: 'VIEWED',
    label: 'Viewed',
  },
  {
    value: 'ACCEPTED',
    label: 'Accepted',
  },
  {
    value: 'REJECTED',
    label: 'Rejected',
  },
  {
    value: 'EXPIRED',
    label: 'Expired',
  },
];

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

function contactName(
  proposal:
    ProposalListItem,
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
    proposal.lead.email ||
    'Unnamed client'
  );
}

function companyName(
  proposal:
    ProposalListItem,
) {
  return (
    proposal.contact
      ?.company ||
    proposal.lead
      .company ||
    'No company'
  );
}

function formatDate(
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

function statusLabel(
  status:
    ProposalStatus,
) {
  return (
    status.charAt(0) +
    status
      .slice(1)
      .toLowerCase()
  );
}

export default function ProposalsPage() {
  const {
    request,
  } = useAuth();

  const [
    proposals,
    setProposals,
  ] =
    useState<
      ProposalListItem[]
    >([]);

  const [
    meta,
    setMeta,
  ] =
    useState<
      ProposalListResponse['meta']
    >({
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });

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

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] =
    useState('');

  const [
    filter,
    setFilter,
  ] =
    useState<
      ProposalFilter
    >('all');

  const [
    sort,
    setSort,
  ] =
    useState<
      ProposalSort
    >('recent');

  const [
    page,
    setPage,
  ] =
    useState(1);

  const requestSequence =
    useRef(0);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setDebouncedSearch(
            search.trim(),
          );
          setPage(1);
        },
        300,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [search]);

  const queryString =
    useMemo(() => {
      const params =
        new URLSearchParams({
          page:
            String(page),

          pageSize:
            '20',

          filter,

          sort,
        });

      if (
        debouncedSearch
      ) {
        params.set(
          'search',
          debouncedSearch,
        );
      }

      return params.toString();
    }, [
      debouncedSearch,
      filter,
      page,
      sort,
    ]);

  const loadProposals =
    useCallback(
      async () => {
        const sequence =
          ++requestSequence.current;

        setError(
          null,
        );

        if (
          proposals.length ===
          0
        ) {
          setLoading(
            true,
          );
        }

        try {
          const response =
            await request<
              ProposalListResponse
            >(
              `/proposals?${queryString}`,
            );

          if (
            sequence !==
            requestSequence.current
          ) {
            return;
          }

          setProposals(
            response.data ??
            [],
          );

          setMeta(
            response.meta,
          );
        } catch (
          loadError
        ) {
          if (
            sequence !==
            requestSequence.current
          ) {
            return;
          }

          setError(
            loadError instanceof
              Error
              ? loadError.message
              : 'Unable to load proposals.',
          );
        } finally {
          if (
            sequence ===
            requestSequence.current
          ) {
            setLoading(
              false,
            );
          }
        }
      },
      [
        proposals.length,
        queryString,
        request,
      ],
    );

  useEffect(() => {
    void loadProposals();
  }, [loadProposals]);

  function changeFilter(
    value:
      ProposalFilter,
  ) {
    setFilter(
      value,
    );
    setPage(1);
  }

  function changeSort(
    value:
      ProposalSort,
  ) {
    setSort(
      value,
    );
    setPage(1);
  }

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

          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              text-[12px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[var(--cf-text-secondary)]
            "
          >
            Engage
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
            Proposals
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
            Turn qualified opportunities into clear offers,
            then keep proposal status connected to the pipeline.
          </p>
        </div>

        <Link
          href="/proposals/new"
          className="
            inline-flex
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

            transition
            hover:bg-[var(--cf-primary-hover)]
          "
        >
          <Plus
            size={16}
          />

          New proposal
        </Link>
      </div>

      <div
        className="
          mt-7
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
            px-4
            py-4

            sm:px-5
          "
        >
          <div
            className="
              flex
              gap-2
              overflow-x-auto
              pb-1
            "
          >
            {statusOptions.map(
              (option) => (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  onClick={() =>
                    changeFilter(
                      option.value,
                    )
                  }
                  className={`
                    whitespace-nowrap
                    rounded-lg
                    px-3
                    py-2
                    text-[13px]
                    font-semibold
                    transition

                    ${
                      filter ===
                      option.value
                        ? `
                          bg-[var(--cf-primary-soft)]
                          text-[var(--cf-primary)]
                        `
                        : `
                          text-[var(--cf-text-secondary)]
                          hover:bg-[var(--cf-surface-soft)]
                          hover:text-[var(--cf-text)]
                        `
                    }
                  `}
                >
                  {option.label}
                </button>
              ),
            )}
          </div>
        </div>

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
          <label
            className="
              flex
              h-11
              min-w-0
              flex-1
              items-center
              gap-2

              rounded-xl
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface-soft)]

              px-3

              sm:max-w-[440px]
            "
          >
            <Search
              size={16}
              className="
                shrink-0
                text-[var(--cf-text-muted)]
              "
            />

            <input
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search proposal, client or company"
              className="
                min-w-0
                flex-1
                bg-transparent
                text-[14px]
                outline-none
                placeholder:text-[var(--cf-text-muted)]
              "
            />
          </label>

          <select
            value={sort}
            onChange={(
              event,
            ) =>
              changeSort(
                event.target
                  .value as
                  ProposalSort,
              )
            }
            className="
              h-11
              rounded-xl
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface)]
              px-3

              text-[13px]
              font-medium
              text-[var(--cf-text-secondary)]

              outline-none
            "
          >
            <option value="recent">
              Recently updated
            </option>

            <option value="title">
              Title A-Z
            </option>

            <option value="amount">
              Highest amount
            </option>

            <option value="status">
              Status
            </option>
          </select>
        </div>

        {error ? (
          <div
            className="
              px-5
              py-10
              text-center
            "
          >
            <p
              className="
                text-[14px]
                font-semibold
                text-red-600
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadProposals()
              }
              className="
                mt-4
                rounded-lg
                border
                border-[var(--cf-border)]
                px-3
                py-2
                text-[13px]
                font-semibold
              "
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div
            className="
              flex
              min-h-[280px]
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

              Loading proposals
            </div>
          </div>
        ) : proposals.length ===
          0 ? (
          <div
            className="
              flex
              min-h-[320px]
              flex-col
              items-center
              justify-center
              px-5
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
                bg-[var(--cf-primary-soft)]
                text-[var(--cf-primary)]
              "
            >
              <FileText
                size={20}
              />
            </div>

            <h2
              className="
                mt-4
                text-[18px]
                font-semibold
              "
            >
              No proposals found
            </h2>

            <p
              className="
                mt-2
                max-w-[420px]
                text-[14px]
                leading-6
                text-[var(--cf-text-secondary)]
              "
            >
              Create a proposal from an open opportunity,
              or adjust the current search and status filter.
            </p>
          </div>
        ) : (
          <>
            <div
              className="
                hidden
                overflow-x-auto

                lg:block
              "
            >
              <table
                className="
                  w-full
                  min-w-[980px]
                  border-collapse
                "
              >
                <thead>
                  <tr
                    className="
                      bg-[var(--cf-surface-soft)]
                    "
                  >
                    {[
                      'Proposal / client',
                      'Amount',
                      'Status',
                      'Views',
                      'Valid until',
                      'Updated',
                      '',
                    ].map(
                      (
                        heading,
                      ) => (
                        <th
                          key={
                            heading
                          }
                          className="
                            px-4
                            py-3.5
                            text-left
                            text-[12px]
                            font-semibold
                            uppercase
                            tracking-[0.08em]
                            text-[var(--cf-text-muted)]
                          "
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {proposals.map(
                    (
                      proposal,
                      index,
                    ) => (
                      <tr
                        key={
                          proposal.id
                        }
                        className={`
                          transition
                          hover:bg-[var(--cf-surface-hover)]

                          ${
                            index !==
                            proposals.length -
                              1
                              ? 'border-b border-[var(--cf-border-soft)]'
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
                          <Link
                            href={`/proposals/${proposal.id}`}
                            className="
                              block
                              max-w-[340px]
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
                              {proposal.title}
                            </p>

                            <p
                              className="
                                mt-1
                                truncate
                                text-[13px]
                                text-[var(--cf-text-secondary)]
                              "
                            >
                              {contactName(
                                proposal,
                              )}{' '}
                              ·{' '}
                              {companyName(
                                proposal,
                              )}
                            </p>
                          </Link>
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                            text-[14px]
                            font-semibold
                          "
                        >
                          {formatMoney(
                            proposal.amountCents,
                            proposal.currency,
                          )}
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                          "
                        >
                          <span
                            className={`
                              inline-flex
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
                            {statusLabel(
                              proposal.status,
                            )}
                          </span>
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                            text-[14px]
                            text-[var(--cf-text-secondary)]
                          "
                        >
                          {proposal.viewCount}
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                            text-[14px]
                            text-[var(--cf-text-secondary)]
                          "
                        >
                          {formatDate(
                            proposal.validUntil,
                          )}
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                            text-[14px]
                            text-[var(--cf-text-secondary)]
                          "
                        >
                          {formatDate(
                            proposal.updatedAt,
                          )}
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                            text-right
                          "
                        >
                          <Link
                            href={`/proposals/${proposal.id}`}
                            className="
                              text-[13px]
                              font-semibold
                              text-[var(--cf-primary)]
                              hover:opacity-80
                            "
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div
              className="
                grid
                gap-3
                p-4

                lg:hidden
              "
            >
              {proposals.map(
                (
                  proposal,
                ) => (
                  <Link
                    key={
                      proposal.id
                    }
                    href={`/proposals/${proposal.id}`}
                    className="
                      rounded-xl
                      border
                      border-[var(--cf-border)]
                      bg-[var(--cf-surface)]

                      p-4

                      transition
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
                          min-w-0
                        "
                      >
                        <p
                          className="
                            truncate
                            text-[16px]
                            font-semibold
                          "
                        >
                          {proposal.title}
                        </p>

                        <p
                          className="
                            mt-1
                            truncate
                            text-[13px]
                            text-[var(--cf-text-secondary)]
                          "
                        >
                          {contactName(
                            proposal,
                          )}{' '}
                          ·{' '}
                          {companyName(
                            proposal,
                          )}
                        </p>
                      </div>

                      <span
                        className={`
                          shrink-0
                          rounded-full
                          px-2.5
                          py-1
                          text-[11px]
                          font-semibold

                          ${statusClasses(
                            proposal.status,
                          )}
                        `}
                      >
                        {statusLabel(
                          proposal.status,
                        )}
                      </span>
                    </div>

                    <div
                      className="
                        mt-4
                        flex
                        items-end
                        justify-between
                        gap-3
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[12px]
                            uppercase
                            tracking-[0.08em]
                            text-[var(--cf-text-muted)]
                          "
                        >
                          Amount
                        </p>

                        <p
                          className="
                            mt-1
                            text-[18px]
                            font-semibold
                          "
                        >
                          {formatMoney(
                            proposal.amountCents,
                            proposal.currency,
                          )}
                        </p>
                      </div>

                      <div
                        className="
                          text-right
                        "
                      >
                        <p
                          className="
                            text-[12px]
                            text-[var(--cf-text-muted)]
                          "
                        >
                          {proposal.viewCount}{' '}
                          {proposal.viewCount ===
                          1
                            ? 'view'
                            : 'views'}
                        </p>

                        <p
                          className="
                            mt-1
                            text-[12px]
                            text-[var(--cf-text-secondary)]
                          "
                        >
                          Updated{' '}
                          {formatDate(
                            proposal.updatedAt,
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>

            <div
              className="
                flex
                flex-col
                gap-3
                border-t
                border-[var(--cf-border-soft)]
                px-4
                py-4

                sm:flex-row
                sm:items-center
                sm:justify-between

                sm:px-5
              "
            >
              <p
                className="
                  text-[13px]
                  text-[var(--cf-text-muted)]
                "
              >
                Showing{' '}
                {Math.min(
                  (
                    meta.page -
                    1
                  ) *
                    meta.pageSize +
                    1,
                  meta.total,
                )}
                -
                {Math.min(
                  meta.page *
                    meta.pageSize,
                  meta.total,
                )}{' '}
                of {meta.total}
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <button
                  type="button"
                  disabled={
                    !meta.hasPreviousPage
                  }
                  onClick={() =>
                    setPage(
                      (
                        current,
                      ) =>
                        Math.max(
                          1,
                          current -
                            1,
                        ),
                    )
                  }
                  className="
                    inline-flex
                    h-9
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-[var(--cf-border)]
                    px-3
                    text-[13px]
                    font-semibold
                    text-[var(--cf-text-secondary)]

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <ChevronLeft
                    size={14}
                  />

                  Previous
                </button>

                <span
                  className="
                    px-2
                    text-[13px]
                    text-[var(--cf-text-muted)]
                  "
                >
                  {meta.page} /{' '}
                  {meta.totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    !meta.hasNextPage
                  }
                  onClick={() =>
                    setPage(
                      (
                        current,
                      ) =>
                        current +
                        1,
                    )
                  }
                  className="
                    inline-flex
                    h-9
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-[var(--cf-border)]
                    px-3
                    text-[13px]
                    font-semibold
                    text-[var(--cf-text-secondary)]

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Next

                  <ChevronRight
                    size={14}
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
