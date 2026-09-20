'use client';

import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';

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

type FollowUpStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'CANCELLED';

type FollowUpChannel =
  | 'EMAIL'
  | 'CALL'
  | 'WHATSAPP'
  | 'LINKEDIN'
  | 'OTHER';

type FollowUpFilter =
  | 'all'
  | 'pending'
  | 'overdue'
  | 'completed'
  | 'cancelled';

type FollowUpSort =
  | 'due'
  | 'recent'
  | 'client';

interface LeadOption {
  id: string;
  contactId?: string | null;

  firstName: string;
  lastName?: string | null;

  email?: string | null;
  phone?: string | null;

  company?: string | null;
  jobTitle?: string | null;

  stage: string;
  temperature?: string | null;

  valueCents?: number | null;
  currency: string;

  nextFollowUpAt?: string | null;
}

interface FollowUpItem {
  id: string;

  leadId: string;
  contactId?: string | null;

  channel:
    FollowUpChannel;

  status:
    FollowUpStatus;

  scheduledFor: string;

  subject?: string | null;
  draftMessage?: string | null;
  reason?: string | null;

  completedAt?: string | null;
  cancelledAt?: string | null;

  createdAt: string;
  updatedAt: string;

  lead: LeadOption;

  contact?: {
    id: string;

    firstName: string;
    lastName?: string | null;

    email?: string | null;
    phone?: string | null;

    company?: string | null;
    jobTitle?: string | null;
  } | null;
}

interface FollowUpsResponse {
  data:
    FollowUpItem[];

  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

interface FollowUpSummary {
  pendingCount: number;
  overdueCount: number;
  dueNext24HoursCount: number;
  upcoming7DaysCount: number;
  completedCount: number;
}

interface LeadOptionsResponse {
  data:
    LeadOption[];
}

interface FollowUpForm {
  leadId: string;
  channel:
    FollowUpChannel;
  scheduledFor: string;
  subject: string;
  reason: string;
  draftMessage: string;
}

const initialForm:
  FollowUpForm = {
    leadId: '',
    channel: 'EMAIL',
    scheduledFor: '',
    subject: '',
    reason: '',
    draftMessage: '',
  };

const filterOptions: {
  value:
    FollowUpFilter;
  label: string;
}[] = [
  {
    value: 'pending',
    label: 'Pending',
  },
  {
    value: 'overdue',
    label: 'Overdue',
  },
  {
    value: 'completed',
    label: 'Completed',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
  {
    value: 'all',
    label: 'All',
  },
];

function clientName(
  item:
    FollowUpItem,
) {
  const person =
    item.contact ??
    item.lead;

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

function leadName(
  lead:
    LeadOption,
) {
  return (
    [
      lead.firstName,
      lead.lastName,
    ]
      .filter(Boolean)
      .join(' ') ||
    lead.email ||
    'Unnamed lead'
  );
}

function formatMoney(
  valueCents?:
    | number
    | null,

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
    (
      valueCents ??
      0
    ) / 100,
  );
}

function formatDateTime(
  value:
    string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Invalid date';
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

function dueLabel(
  item:
    FollowUpItem,
) {
  if (
    item.status ===
    'COMPLETED'
  ) {
    return 'Completed';
  }

  if (
    item.status ===
    'CANCELLED'
  ) {
    return 'Cancelled';
  }

  const due =
    new Date(
      item.scheduledFor,
    ).getTime();

  const now =
    Date.now();

  const diff =
    due - now;

  if (diff < 0) {
    const hours =
      Math.max(
        1,
        Math.round(
          Math.abs(
            diff,
          ) /
            3_600_000,
        ),
      );

    if (hours < 24) {
      return `${hours}h overdue`;
    }

    const days =
      Math.max(
        1,
        Math.round(
          hours / 24,
        ),
      );

    return `${days}d overdue`;
  }

  const hours =
    Math.max(
      1,
      Math.round(
        diff /
          3_600_000,
      ),
    );

  if (hours < 24) {
    return `Due in ${hours}h`;
  }

  const days =
    Math.max(
      1,
      Math.round(
        hours / 24,
      ),
    );

  return `Due in ${days}d`;
}

function channelLabel(
  channel:
    FollowUpChannel,
) {
  switch (channel) {
    case 'WHATSAPP':
      return 'WhatsApp';

    case 'LINKEDIN':
      return 'LinkedIn';

    case 'CALL':
      return 'Call';

    case 'OTHER':
      return 'Other';

    default:
      return 'Email';
  }
}

function channelIcon(
  channel:
    FollowUpChannel,
) {
  switch (channel) {
    case 'CALL':
      return Phone;

    case 'WHATSAPP':
    case 'LINKEDIN':
    case 'OTHER':
      return MessageCircle;

    default:
      return Mail;
  }
}

export default function FollowUpsPage() {
  const {
    request,
  } = useAuth();

  const [
    items,
    setItems,
  ] =
    useState<
      FollowUpItem[]
    >([]);

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
      FollowUpFilter
    >('pending');

  const [
    sort,
    setSort,
  ] =
    useState<
      FollowUpSort
    >('due');

  const [
    page,
    setPage,
  ] =
    useState(1);

  const [
    meta,
    setMeta,
  ] =
    useState<
      FollowUpsResponse['meta']
    >({
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState(
      initialForm,
    );

  const [
    leads,
    setLeads,
  ] =
    useState<
      LeadOption[]
    >([]);

  const [
    leadSearch,
    setLeadSearch,
  ] =
    useState('');

  const [
    loadingLeads,
    setLoadingLeads,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    actionId,
    setActionId,
  ] =
    useState<
      string | null
    >(null);

  const sequence =
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

  const loadData =
    useCallback(
      async () => {
        const current =
          ++sequence.current;

        setError(
          null,
        );

        if (
          items.length ===
          0
        ) {
          setLoading(
            true,
          );
        }

        try {
          const [
            list,
            totals,
          ] =
            await Promise.all([
              request<
                FollowUpsResponse
              >(
                `/follow-ups?${queryString}`,
              ),

              request<
                FollowUpSummary
              >(
                '/follow-ups/summary/overview',
              ),
            ]);

          if (
            current !==
            sequence.current
          ) {
            return;
          }

          setItems(
            list.data ??
            [],
          );

          setMeta(
            list.meta,
          );

          setSummary(
            totals,
          );
        } catch (
          loadError
        ) {
          if (
            current !==
            sequence.current
          ) {
            return;
          }

          setError(
            loadError instanceof
              Error
              ? loadError.message
              : 'Unable to load follow-ups.',
          );
        } finally {
          if (
            current ===
            sequence.current
          ) {
            setLoading(
              false,
            );
          }
        }
      },
      [
        items.length,
        queryString,
        request,
      ],
    );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadLeadOptions =
    useCallback(
      async (
        value = '',
      ) => {
        setLoadingLeads(
          true,
        );

        try {
          const params =
            new URLSearchParams();

          if (
            value.trim()
          ) {
            params.set(
              'search',
              value.trim(),
            );
          }

          const response =
            await request<
              LeadOptionsResponse
            >(
              `/follow-ups/options/leads${
                params.toString()
                  ? `?${params.toString()}`
                  : ''
              }`,
            );

          setLeads(
            response.data ??
            [],
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : 'Unable to load opportunities.',
          );
        } finally {
          setLoadingLeads(
            false,
          );
        }
      },
      [request],
    );

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          void loadLeadOptions(
            leadSearch,
          );
        },
        300,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [
    leadSearch,
    loadLeadOptions,
    modalOpen,
  ]);

  function openCreate() {
    setForm(
      initialForm,
    );

    setLeadSearch(
      '',
    );

    setModalOpen(
      true,
    );

    void loadLeadOptions();
  }

  function chooseLead(
    lead:
      LeadOption,
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,

        leadId:
          lead.id,

        subject:
          current.subject ||
          `Follow up with ${
            lead.company ||
            leadName(lead)
          }`,
      }),
    );
  }

  function updateField<
    K extends keyof FollowUpForm,
  >(
    key: K,
    value:
      FollowUpForm[K],
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [key]:
          value,
      }),
    );
  }

  async function createFollowUp(
    event:
      React.FormEvent,
  ) {
    event.preventDefault();

    if (
      !form.leadId
    ) {
      setError(
        'Choose an opportunity first.',
      );
      return;
    }

    if (
      !form.scheduledFor
    ) {
      setError(
        'Choose when the follow-up is due.',
      );
      return;
    }

    setSubmitting(
      true,
    );
    setError(
      null,
    );

    try {
      await request(
        '/follow-ups',
        {
          method:
            'POST',

          body:
            JSON.stringify({
              leadId:
                form.leadId,

              channel:
                form.channel,

              scheduledFor:
                new Date(
                  form.scheduledFor,
                ).toISOString(),

              subject:
                form.subject.trim() ||
                undefined,

              reason:
                form.reason.trim() ||
                undefined,

              draftMessage:
                form.draftMessage.trim() ||
                undefined,
            }),
        },
      );

      setModalOpen(
        false,
      );

      setPage(
        1,
      );

      await loadData();
    } catch (
      submitError
    ) {
      setError(
        submitError instanceof
          Error
          ? submitError.message
          : 'Unable to create follow-up.',
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  async function runAction(
    item:
      FollowUpItem,

    action:
      'complete'
      | 'cancel'
      | 'delete',
  ) {
    setActionId(
      item.id,
    );

    setError(
      null,
    );

    try {
      if (
        action ===
        'delete'
      ) {
        await request(
          `/follow-ups/${item.id}`,
          {
            method:
              'DELETE',
          },
        );
      } else {
        await request(
          `/follow-ups/${item.id}/${action}`,
          {
            method:
              'POST',
          },
        );
      }

      await loadData();
    } catch (
      actionError
    ) {
      setError(
        actionError instanceof
          Error
          ? actionError.message
          : 'Unable to update follow-up.',
      );
    } finally {
      setActionId(
        null,
      );
    }
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
            Follow-ups
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
            Keep every active opportunity moving with a clear
            reason, due time and client-ready draft you control.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openCreate
          }
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

          New follow-up
        </button>
      </div>

      <div
        className="
          mt-6
          grid
          gap-3

          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <SummaryCard
          label="Overdue"
          value={
            summary.overdueCount
          }
          note="Needs attention now"
          danger={
            summary.overdueCount >
            0
          }
        />

        <SummaryCard
          label="Next 24 hours"
          value={
            summary.dueNext24HoursCount
          }
          note="Coming up soon"
        />

        <SummaryCard
          label="Upcoming 7 days"
          value={
            summary.upcoming7DaysCount
          }
          note="Scheduled pipeline work"
        />

        <SummaryCard
          label="Completed"
          value={
            summary.completedCount
          }
          note="Finished follow-ups"
          success
        />
      </div>

      {error && (
        <div
          className="
            mt-5
            flex
            items-start
            justify-between
            gap-3
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
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError(
                null,
              )
            }
          >
            <X
              size={15}
            />
          </button>
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
            {filterOptions.map(
              (
                option,
              ) => (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  onClick={() => {
                    setFilter(
                      option.value,
                    );
                    setPage(
                      1,
                    );
                  }}
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
              placeholder="Search client, company, subject or reason"
              className="
                min-w-0
                flex-1
                bg-transparent
                text-[14px]
                outline-none
              "
            />
          </label>

          <select
            value={sort}
            onChange={(
              event,
            ) => {
              setSort(
                event.target
                  .value as
                  FollowUpSort,
              );

              setPage(
                1,
              );
            }}
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
            <option value="due">
              Due first
            </option>

            <option value="recent">
              Recently updated
            </option>

            <option value="client">
              Client name
            </option>
          </select>
        </div>

        {loading ? (
          <div
            className="
              flex
              min-h-[300px]
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

              Loading follow-ups
            </div>
          </div>
        ) : items.length ===
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
              <CalendarClock
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
              No follow-ups found
            </h2>

            <p
              className="
                mt-2
                max-w-[430px]
                text-[14px]
                leading-6
                text-[var(--cf-text-secondary)]
              "
            >
              Schedule the next touchpoint for an open opportunity,
              or adjust the current filters.
            </p>
          </div>
        ) : (
          <>
            <div
              className="
                divide-y
                divide-[var(--cf-border-soft)]
              "
            >
              {items.map(
                (
                  item,
                ) => {
                  const Icon =
                    channelIcon(
                      item.channel,
                    );

                  const overdue =
                    item.status ===
                      'PENDING' &&
                    new Date(
                      item.scheduledFor,
                    ).getTime() <
                      Date.now();

                  return (
                    <article
                      key={
                        item.id
                      }
                      className="
                        grid
                        gap-4
                        px-4
                        py-5

                        lg:grid-cols-[minmax(0,1.5fr)_minmax(180px,.8fr)_minmax(160px,.7fr)_auto]
                        lg:items-center

                        sm:px-5
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
                            <Icon
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
                              <p
                                className="
                                  truncate
                                  text-[15px]
                                  font-semibold
                                "
                              >
                                {item.subject ||
                                  `Follow up with ${clientName(
                                    item,
                                  )}`}
                              </p>

                              <StatusBadge
                                status={
                                  item.status
                                }
                              />
                            </div>

                            <p
                              className="
                                mt-1
                                truncate
                                text-[13px]
                                text-[var(--cf-text-secondary)]
                              "
                            >
                              {clientName(
                                item,
                              )}{' '}
                              ·{' '}
                              {item.lead
                                .company ||
                                'No company'}{' '}
                              ·{' '}
                              {channelLabel(
                                item.channel,
                              )}
                            </p>

                            <p
                              className="
                                mt-2
                                text-[13px]
                                leading-5
                                text-[var(--cf-text-secondary)]
                              "
                            >
                              {item.reason ||
                                'Scheduled follow-up'}
                            </p>

                            {item.draftMessage && (
                              <p
                                className="
                                  mt-2
                                  line-clamp-2
                                  text-[12px]
                                  leading-5
                                  text-[var(--cf-text-muted)]
                                "
                              >
                                {item.draftMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p
                          className="
                            text-[12px]
                            font-semibold
                            uppercase
                            tracking-[0.08em]
                            text-[var(--cf-text-muted)]
                          "
                        >
                          Opportunity
                        </p>

                        <p
                          className="
                            mt-1
                            text-[14px]
                            font-semibold
                          "
                        >
                          {formatMoney(
                            item.lead
                              .valueCents,
                            item.lead
                              .currency,
                          )}
                        </p>

                        <p
                          className="
                            mt-1
                            text-[12px]
                            text-[var(--cf-text-secondary)]
                          "
                        >
                          {item.lead.stage}
                        </p>
                      </div>

                      <div>
                        <p
                          className="
                            text-[12px]
                            font-semibold
                            uppercase
                            tracking-[0.08em]
                            text-[var(--cf-text-muted)]
                          "
                        >
                          Due
                        </p>

                        <p
                          className={`
                            mt-1
                            text-[13px]
                            font-semibold

                            ${
                              overdue
                                ? 'text-red-600'
                                : 'text-[var(--cf-text)]'
                            }
                          `}
                        >
                          {dueLabel(
                            item,
                          )}
                        </p>

                        <p
                          className="
                            mt-1
                            text-[12px]
                            text-[var(--cf-text-muted)]
                          "
                        >
                          {formatDateTime(
                            item.scheduledFor,
                          )}
                        </p>
                      </div>

                      {item.status ===
                      'PENDING' ? (
                        <div
                          className="
                            flex
                            flex-wrap
                            gap-2

                            lg:justify-end
                          "
                        >
                          <button
                            type="button"
                            disabled={
                              actionId ===
                              item.id
                            }
                            onClick={() =>
                              void runAction(
                                item,
                                'complete',
                              )
                            }
                            className="
                              inline-flex
                              h-9
                              items-center
                              gap-1.5
                              rounded-lg
                              bg-emerald-600
                              px-3
                              text-[12px]
                              font-semibold
                              text-white
                              disabled:opacity-50
                            "
                          >
                            <CheckCircle2
                              size={14}
                            />

                            Complete
                          </button>

                          <button
                            type="button"
                            disabled={
                              actionId ===
                              item.id
                            }
                            onClick={() =>
                              void runAction(
                                item,
                                'cancel',
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
                              text-[12px]
                              font-semibold
                              text-[var(--cf-text-secondary)]
                              disabled:opacity-50
                            "
                          >
                            <XCircle
                              size={14}
                            />

                            Cancel
                          </button>

                          <button
                            type="button"
                            aria-label="Delete follow-up"
                            disabled={
                              actionId ===
                              item.id
                            }
                            onClick={() =>
                              void runAction(
                                item,
                                'delete',
                              )
                            }
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-red-500/15
                              text-red-500
                              disabled:opacity-50
                            "
                          >
                            <Trash2
                              size={14}
                            />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="
                            lg:text-right
                          "
                        >
                          <p
                            className="
                              text-[12px]
                              text-[var(--cf-text-muted)]
                            "
                          >
                            Updated
                          </p>

                          <p
                            className="
                              mt-1
                              text-[12px]
                              font-medium
                              text-[var(--cf-text-secondary)]
                            "
                          >
                            {formatDateTime(
                              item.updatedAt,
                            )}
                          </p>
                        </div>
                      )}
                    </article>
                  );
                },
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
                {meta.total}{' '}
                {meta.total ===
                1
                  ? 'follow-up'
                  : 'follow-ups'}
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
                    gap-1
                    rounded-lg
                    border
                    border-[var(--cf-border)]
                    px-3
                    text-[12px]
                    font-semibold
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
                    text-[12px]
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
                    gap-1
                    rounded-lg
                    border
                    border-[var(--cf-border)]
                    px-3
                    text-[12px]
                    font-semibold
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
      </section>

      {modalOpen && (
        <CreateFollowUpModal
          form={
            form
          }
          leads={
            leads
          }
          leadSearch={
            leadSearch
          }
          loadingLeads={
            loadingLeads
          }
          submitting={
            submitting
          }
          onLeadSearch={
            setLeadSearch
          }
          onChooseLead={
            chooseLead
          }
          onChange={
            updateField
          }
          onClose={() =>
            setModalOpen(
              false,
            )
          }
          onSubmit={
            createFollowUp
          }
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  note,
  danger = false,
  success = false,
}: {
  label: string;
  value: number;
  note: string;
  danger?: boolean;
  success?: boolean;
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
        className={`
          mt-2
          text-[28px]
          font-semibold
          tracking-[-0.8px]

          ${
            danger
              ? 'text-red-600'
              : success
                ? 'text-emerald-600'
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
        {note}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    FollowUpStatus;
}) {
  const styles =
    status ===
    'COMPLETED'
      ? 'bg-emerald-500/10 text-emerald-600'
      : status ===
          'CANCELLED'
        ? 'bg-red-500/10 text-red-600'
        : 'bg-violet-500/10 text-violet-600';

  return (
    <span
      className={`
        rounded-full
        px-2.5
        py-1
        text-[11px]
        font-semibold

        ${styles}
      `}
    >
      {status.charAt(0) +
        status
          .slice(1)
          .toLowerCase()}
    </span>
  );
}

function CreateFollowUpModal({
  form,
  leads,
  leadSearch,
  loadingLeads,
  submitting,
  onLeadSearch,
  onChooseLead,
  onChange,
  onClose,
  onSubmit,
}: {
  form:
    FollowUpForm;

  leads:
    LeadOption[];

  leadSearch:
    string;

  loadingLeads:
    boolean;

  submitting:
    boolean;

  onLeadSearch:
    (
      value: string,
    ) => void;

  onChooseLead:
    (
      lead:
        LeadOption,
    ) => void;

  onChange:
    <
      K extends keyof FollowUpForm,
    >(
      key: K,
      value:
        FollowUpForm[K],
    ) => void;

  onClose:
    () => void;

  onSubmit:
    (
      event:
        React.FormEvent,
    ) => Promise<void>;
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[180]
        flex
        items-center
        justify-center
        bg-[rgba(10,15,30,.58)]
        px-4
        py-6
        backdrop-blur-[8px]
      "
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={
          onSubmit
        }
        className="
          grid
          max-h-[92vh]
          w-full
          max-w-[980px]
          overflow-hidden
          rounded-[22px]
          border
          border-white/10
          bg-[var(--cf-surface)]
          shadow-[0_30px_90px_rgba(15,23,42,.28)]

          lg:grid-cols-[330px_minmax(0,1fr)]
        "
      >
        <aside
          className="
            border-b
            border-[var(--cf-border-soft)]
            p-5

            lg:border-b-0
            lg:border-r
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
                  tracking-[0.1em]
                  text-[var(--cf-text-muted)]
                "
              >
                Opportunity
              </p>

              <h2
                className="
                  mt-1
                  text-[20px]
                  font-semibold
                "
              >
                Choose a client
              </h2>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-[var(--cf-text-secondary)]
                hover:bg-[var(--cf-surface-soft)]
              "
            >
              <X
                size={16}
              />
            </button>
          </div>

          <label
            className="
              mt-4
              flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface-soft)]
              px-3
            "
          >
            <Search
              size={15}
              className="
                text-[var(--cf-text-muted)]
              "
            />

            <input
              value={
                leadSearch
              }
              onChange={(
                event,
              ) =>
                onLeadSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search opportunities"
              className="
                min-w-0
                flex-1
                bg-transparent
                text-[13px]
                outline-none
              "
            />
          </label>

          <div
            className="
              mt-3
              max-h-[310px]
              space-y-2
              overflow-y-auto
              pr-1

              lg:max-h-[560px]
            "
          >
            {loadingLeads ? (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  py-5
                  text-[13px]
                  text-[var(--cf-text-secondary)]
                "
              >
                <LoaderCircle
                  size={15}
                  className="
                    animate-spin
                  "
                />

                Loading opportunities
              </div>
            ) : leads.length ===
              0 ? (
              <p
                className="
                  py-5
                  text-[13px]
                  text-[var(--cf-text-secondary)]
                "
              >
                No open opportunities found.
              </p>
            ) : (
              leads.map(
                (
                  lead,
                ) => (
                  <button
                    key={
                      lead.id
                    }
                    type="button"
                    onClick={() =>
                      onChooseLead(
                        lead,
                      )
                    }
                    className={`
                      w-full
                      rounded-xl
                      border
                      p-3
                      text-left
                      transition

                      ${
                        form.leadId ===
                        lead.id
                          ? `
                            border-[var(--cf-primary)]
                            bg-[var(--cf-primary-soft)]
                          `
                          : `
                            border-[var(--cf-border)]
                            hover:bg-[var(--cf-surface-soft)]
                          `
                      }
                    `}
                  >
                    <p
                      className="
                        truncate
                        text-[14px]
                        font-semibold
                      "
                    >
                      {leadName(
                        lead,
                      )}
                    </p>

                    <p
                      className="
                        mt-1
                        truncate
                        text-[12px]
                        text-[var(--cf-text-secondary)]
                      "
                    >
                      {lead.company ||
                        'No company'}{' '}
                      ·{' '}
                      {lead.stage}
                    </p>

                    <p
                      className="
                        mt-2
                        text-[13px]
                        font-semibold
                        text-[var(--cf-primary)]
                      "
                    >
                      {formatMoney(
                        lead.valueCents,
                        lead.currency,
                      )}
                    </p>
                  </button>
                ),
              )
            )}
          </div>
        </aside>

        <div
          className="
            min-h-0
            overflow-y-auto
            p-5

            sm:p-6
          "
        >
          <div
            className="
              hidden
              items-start
              justify-between
              gap-3

              lg:flex
            "
          >
            <div>
              <p
                className="
                  text-[12px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-[var(--cf-text-muted)]
                "
              >
                Follow-up
              </p>

              <h2
                className="
                  mt-1
                  text-[22px]
                  font-semibold
                "
              >
                Plan the next touchpoint
              </h2>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-[var(--cf-text-secondary)]
                hover:bg-[var(--cf-surface-soft)]
              "
            >
              <X
                size={16}
              />
            </button>
          </div>

          <div
            className="
              mt-1
              grid
              gap-4

              md:grid-cols-2
              lg:mt-5
            "
          >
            <Field
              label="Channel"
            >
              <select
                value={
                  form.channel
                }
                onChange={(
                  event,
                ) =>
                  onChange(
                    'channel',
                    event.target
                      .value as
                      FollowUpChannel,
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="EMAIL">
                  Email
                </option>

                <option value="CALL">
                  Call
                </option>

                <option value="WHATSAPP">
                  WhatsApp
                </option>

                <option value="LINKEDIN">
                  LinkedIn
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </Field>

            <Field
              label="Due date and time"
            >
              <input
                type="datetime-local"
                value={
                  form.scheduledFor
                }
                onChange={(
                  event,
                ) =>
                  onChange(
                    'scheduledFor',
                    event.target
                      .value,
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field
              label="Subject"
              className="md:col-span-2"
            >
              <input
                value={
                  form.subject
                }
                onChange={(
                  event,
                ) =>
                  onChange(
                    'subject',
                    event.target
                      .value,
                  )
                }
                placeholder="Follow up on proposal"
                className={
                  inputClass
                }
              />
            </Field>

            <Field
              label="Why this follow-up matters"
              className="md:col-span-2"
            >
              <textarea
                value={
                  form.reason
                }
                onChange={(
                  event,
                ) =>
                  onChange(
                    'reason',
                    event.target
                      .value,
                  )
                }
                rows={3}
                placeholder="Example: proposal sent 3 days ago, waiting on a decision."
                className={
                  textareaClass
                }
              />
            </Field>

            <Field
              label="Draft message"
              className="md:col-span-2"
            >
              <textarea
                value={
                  form.draftMessage
                }
                onChange={(
                  event,
                ) =>
                  onChange(
                    'draftMessage',
                    event.target
                      .value,
                  )
                }
                rows={7}
                placeholder="Write the message you may send. Nothing is sent automatically."
                className={
                  textareaClass
                }
              />
            </Field>
          </div>

          <div
            className="
              mt-4
              rounded-xl
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface-soft)]
              px-4
              py-3
              text-[12px]
              leading-5
              text-[var(--cf-text-secondary)]
            "
          >
            ClientFlow stores this as a planned action and editable
            draft. It does not send the message automatically.
          </div>

          <div
            className="
              mt-6
              flex
              flex-col-reverse
              gap-3

              sm:flex-row
              sm:justify-end
            "
          >
            <button
              type="button"
              onClick={
                onClose
              }
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-[var(--cf-border)]
                px-4
                text-[14px]
                font-semibold
                text-[var(--cf-text-secondary)]
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting
              }
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[var(--cf-primary)]
                px-5
                text-[14px]
                font-semibold
                text-white
                disabled:opacity-60
              "
            >
              {submitting && (
                <LoaderCircle
                  size={15}
                  className="
                    animate-spin
                  "
                />
              )}

              Schedule follow-up
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const inputClass = `
  h-11
  w-full
  rounded-xl
  border
  border-[var(--cf-border)]
  bg-[var(--cf-surface-soft)]
  px-3
  text-[14px]
  outline-none
  transition
  focus:border-[var(--cf-primary)]
`;

const textareaClass = `
  w-full
  resize-y
  rounded-xl
  border
  border-[var(--cf-border)]
  bg-[var(--cf-surface-soft)]
  px-3
  py-3
  text-[14px]
  leading-6
  outline-none
  transition
  focus:border-[var(--cf-primary)]
`;

function Field({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children:
    React.ReactNode;
}) {
  return (
    <label
      className={`
        block
        ${className}
      `}
    >
      <span
        className="
          mb-2
          block
          text-[13px]
          font-semibold
          text-[var(--cf-text-secondary)]
        "
      >
        {label}
      </span>

      {children}
    </label>
  );
}
