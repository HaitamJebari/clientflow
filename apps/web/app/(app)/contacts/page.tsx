'use client';

import {
  ArrowRight,
  BriefcaseBusiness,
  CircleDollarSign,
  Mail,
  Phone,
  Search,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';

import Link from 'next/link';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useAuth,
} from '@/components/providers/auth-provider';

/* =========================================================
   TYPES
========================================================= */

type ContactFilter =
  | 'all'
  | 'active'
  | 'clients'
  | 'inactive';

type ContactSort =
  | 'recent'
  | 'name'
  | 'company'
  | 'value';

interface ContactRecord {
  id: string;

  firstName: string;
  lastName: string;

  email: string;
  phone: string;

  company: string;
  jobTitle: string;

  activeOpportunityCount: number;

  openValueCents: number;
  lifetimeValueCents: number;

  latestActivityAt: string | null;
}

interface ContactsListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface ContactsListResponse {
  data: ContactRecord[];
  meta: ContactsListMeta;
}

interface ContactsSummary {
  totalContacts: number;
  activeContacts: number;
  clientContacts: number;
  lifetimeValueCents: number;
  currency: string;
}

const CONTACTS_PAGE_SIZE =
  20;

const initialMeta:
  ContactsListMeta = {
    page: 1,
    pageSize:
      CONTACTS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasPreviousPage:
      false,
    hasNextPage:
      false,
  };

const initialSummary:
  ContactsSummary = {
    totalContacts: 0,
    activeContacts: 0,
    clientContacts: 0,
    lifetimeValueCents: 0,
    currency: 'EUR',
  };

function contactName(
  contact:
    ContactRecord,
) {
  return [
    contact.firstName,
    contact.lastName,
  ]
    .filter(Boolean)
    .join(' ') ||
    'Unnamed contact';
}

function getInitials(
  contact:
    ContactRecord,
) {
  const first =
    contact.firstName
      ?.trim()?.[0] ??
    '';

  const last =
    contact.lastName
      ?.trim()?.[0] ??
    '';

  return (
    `${first}${last}`.toUpperCase() ||
    contact.company
      ?.slice(0, 2)
      .toUpperCase() ||
    'CT'
  );
}

function formatMoney(
  valueCents:
    number,
) {
  return new Intl.NumberFormat(
    'en-IE',
    {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    },
  ).format(
    valueCents / 100,
  );
}

function formatRelativeDate(
  value:
    string | null,
) {
  if (!value) {
    return 'No activity';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'No activity';
  }

  const difference =
    Math.max(
      0,
      Date.now() -
        date.getTime(),
    );

  const minutes =
    Math.floor(
      difference /
        60_000,
    );

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  if (days < 30) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ContactsPage() {
  const {
    request,
  } = useAuth();

  const [
    contacts,
    setContacts,
  ] =
    useState<
      ContactRecord[]
    >([]);

  const [
    meta,
    setMeta,
  ] =
    useState<
      ContactsListMeta
    >(
      initialMeta,
    );

  const [
    summary,
    setSummary,
  ] =
    useState<
      ContactsSummary
    >(
      initialSummary,
    );

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
      ContactFilter
    >(
      'all',
    );

  const [
    sort,
    setSort,
  ] =
    useState<
      ContactSort
    >(
      'recent',
    );

  const [
    page,
    setPage,
  ] =
    useState(1);

  const requestSequence =
    useRef(0);

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          setDebouncedSearch(
            search.trim(),
          );

          setPage(1);
        },
        350,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [search]);

  const loadContacts =
    useCallback(
      async () => {
        const sequence =
          ++requestSequence.current;

        setError(null);

        try {
          const params =
            new URLSearchParams({
              page:
                String(page),

              pageSize:
                String(
                  CONTACTS_PAGE_SIZE,
                ),

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

          const response =
            await request<
              ContactsListResponse
            >(
              `/contacts?${params.toString()}`,
            );

          if (
            sequence !==
            requestSequence.current
          ) {
            return;
          }

          setContacts(
            response.data,
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

          if (
            loadError instanceof
            Error
          ) {
            setError(
              loadError.message,
            );
          } else {
            setError(
              'Failed to load contacts.',
            );
          }
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
        request,
        page,
        filter,
        sort,
        debouncedSearch,
      ],
    );

  const loadSummary =
    useCallback(
      async () => {
        try {
          const response =
            await request<
              ContactsSummary
            >(
              '/contacts/summary/overview',
            );

          setSummary(
            response,
          );
        } catch {
          /*
           * Keep the page usable even if summary metrics
           * temporarily fail.
           */
        }
      },
      [request],
    );

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const filteredContacts =
    contacts;

  const activeContacts =
    summary.activeContacts;

  const clientContacts =
    summary.clientContacts;

  const lifetimeValue =
    summary.lifetimeValueCents;

  if (loading) {
    return (
      <ContactsLoading />
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
          gap-5

          xl:flex-row
          xl:items-end
          xl:justify-between
        "
      >
        <div>
          <div
            className="
              mb-3
              flex
              items-center
              gap-2
              text-[13px]
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
                bg-[var(--cf-primary)]
              "
            />

            Relationship workspace
          </div>

          <h1
            className="
              text-[30px]
              font-semibold
              leading-[1.1]
              tracking-[-1px]

              sm:text-[38px]

              lg:text-[44px]
              lg:tracking-[-1.4px]
            "
          >
            Contacts
          </h1>

          <p
            className="
              mt-3
              max-w-[720px]
              text-[16px]
              leading-7
              text-[var(--cf-text-secondary)]
            "
          >
            The people behind your opportunities, grouped into one clean relationship view.
          </p>
        </div>

        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >
          <SummaryChip
            icon={
              <UsersRound
                size={15}
              />
            }
            label={`${summary.totalContacts} contacts`}
          />

          <SummaryChip
            icon={
              <BriefcaseBusiness
                size={15}
              />
            }
            label={`${activeContacts} active`}
            primary
          />

          <SummaryChip
            icon={
              <CircleDollarSign
                size={15}
              />
            }
            label={`${formatMoney(lifetimeValue)} won`}
            success
          />
        </div>
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

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
          "
        >
          <p
            className="
              text-[14px]
              leading-5
              text-red-600
            "
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              setError(null)
            }
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-red-500
              hover:bg-red-500/10
            "
          >
            <X
              size={14}
            />
          </button>
        </div>
      )}

      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <section
        className="
          mt-8
          rounded-[18px]
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface)]
          p-3
          shadow-[var(--cf-shadow)]

          sm:p-4
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3

            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div
            className="
              relative
              min-w-0
              flex-1

              lg:max-w-[460px]
            "
          >
            <Search
              size={17}
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-[var(--cf-text-muted)]
              "
            />

            <input
              type="search"
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search contacts..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-[var(--cf-border)]
                bg-[var(--cf-surface-soft)]
                pl-10
                pr-10
                text-[15px]
                text-[var(--cf-text)]
                outline-none
                transition
                placeholder:text-[var(--cf-text-muted)]
                focus:border-[var(--cf-primary)]
                focus:bg-[var(--cf-surface)]
                focus:ring-4
                focus:ring-[var(--cf-primary-soft)]
              "
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch('')
                }
                aria-label="Clear search"
                className="
                  absolute
                  right-2
                  top-1/2
                  flex
                  h-7
                  w-7
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-lg
                  text-[var(--cf-text-muted)]
                  hover:bg-[var(--cf-surface-hover)]
                "
              >
                <X
                  size={14}
                />
              </button>
            )}
          </div>

          <div
            className="
              flex
              flex-col
              gap-2

              sm:flex-row
              sm:flex-wrap
            "
          >
            <select
              value={filter}
              onChange={(
                event,
              ) => {
                setFilter(
                  event.target
                    .value as ContactFilter,
                );

                setPage(1);
              }}
              className="
                h-11
                rounded-xl
                border
                border-[var(--cf-border)]
                bg-[var(--cf-surface)]
                px-3
                text-[14px]
                font-medium
                text-[var(--cf-text-secondary)]
                outline-none
                focus:border-[var(--cf-primary)]
              "
            >
              <option value="all">
                All contacts
              </option>

              <option value="active">
                Active opportunities
              </option>

              <option value="clients">
                Won clients
              </option>

              <option value="inactive">
                No active opportunity
              </option>
            </select>

            <select
              value={sort}
              onChange={(
                event,
              ) => {
                setSort(
                  event.target
                    .value as ContactSort,
                );

                setPage(1);
              }}
              className="
                h-11
                rounded-xl
                border
                border-[var(--cf-border)]
                bg-[var(--cf-surface)]
                px-3
                text-[14px]
                font-medium
                text-[var(--cf-text-secondary)]
                outline-none
                focus:border-[var(--cf-primary)]
              "
            >
              <option value="recent">
                Recent activity
              </option>

              <option value="name">
                Name A-Z
              </option>

              <option value="company">
                Company A-Z
              </option>

              <option value="value">
                Highest value
              </option>
            </select>
          </div>
        </div>

        <div
          className="
            mt-3
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
            border-t
            border-[var(--cf-border-soft)]
            pt-3
          "
        >
          <p
            className="
              text-[12px]
              text-[var(--cf-text-muted)]
            "
          >
            {meta.total}{' '}
            {meta.total === 1
              ? 'contact'
              : 'contacts'}{' '}
            match
          </p>

          <p
            className="
              text-[12px]
              text-[var(--cf-text-muted)]
            "
          >
            {clientContacts} with won revenue
          </p>
        </div>
      </section>

      {/* ===================================================
          DESKTOP TABLE
      =================================================== */}

      {filteredContacts.length >
      0 ? (
        <>
          <section
            className="
              mt-4
              hidden
              overflow-hidden
              rounded-[18px]
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface)]
              shadow-[var(--cf-shadow)]

              lg:block
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
                  min-w-[1040px]
                  border-collapse
                "
              >
                <thead>
                  <tr
                    className="
                      border-b
                      border-[var(--cf-border-soft)]
                      bg-[var(--cf-surface-soft)]
                    "
                  >
                    <TableHeading>
                      Contact
                    </TableHeading>

                    <TableHeading>
                      Company
                    </TableHeading>

                    <TableHeading>
                      Email
                    </TableHeading>

                    <TableHeading>
                      Phone
                    </TableHeading>

                    <TableHeading>
                      Active opportunities
                    </TableHeading>

                    <TableHeading>
                      Open value
                    </TableHeading>

                    <TableHeading>
                      Lifetime value
                    </TableHeading>

                    <TableHeading>
                      Last activity
                    </TableHeading>

                    <th
                      className="
                        w-[50px]
                      "
                    />
                  </tr>
                </thead>

                <tbody>
                  {filteredContacts.map(
                    (
                      contact,
                      index,
                    ) => (
                      <ContactRow
                        key={
                          contact.id
                        }
                        contact={
                          contact
                        }
                        last={
                          index ===
                          filteredContacts.length -
                            1
                        }
                      />
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ===============================================
              MOBILE / TABLET
          =============================================== */}

          <div
            className="
              mt-4
              grid
              gap-3

              sm:grid-cols-2

              lg:hidden
            "
          >
            {filteredContacts.map(
              (contact) => (
                <ContactCard
                  key={
                    contact.id
                  }
                  contact={
                    contact
                  }
                />
              ),
            )}
          </div>
        </>
      ) : (
        <ContactsEmpty
          search={search}
          onClear={() => {
            setSearch('');
            setFilter('all');
          }}
        />
      )}

      {meta.total > 0 && (
        <div
          className="
            mt-5
            flex
            flex-col
            gap-3
            rounded-[16px]
            border
            border-[var(--cf-border)]
            bg-[var(--cf-surface)]
            px-4
            py-3
            shadow-[var(--cf-shadow)]

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              text-[12px]
              text-[var(--cf-text-muted)]
            "
          >
            Showing{' '}
            {Math.min(
              (meta.page - 1) *
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
              justify-between
              gap-2

              sm:justify-end
            "
          >
            <button
              type="button"
              disabled={
                !meta.hasPreviousPage
              }
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                )
              }
              className="
                h-9
                rounded-xl
                border
                border-[var(--cf-border)]
                bg-[var(--cf-surface)]
                px-3
                text-[12px]
                font-semibold
                text-[var(--cf-text-secondary)]
                transition

                hover:bg-[var(--cf-surface-soft)]

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Previous
            </button>

            <span
              className="
                px-2
                text-[12px]
                font-medium
                text-[var(--cf-text-muted)]
              "
            >
              Page {meta.page} of{' '}
              {meta.totalPages}
            </span>

            <button
              type="button"
              disabled={
                !meta.hasNextPage
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1,
                )
              }
              className="
                h-9
                rounded-xl
                border
                border-[var(--cf-border)]
                bg-[var(--cf-surface)]
                px-3
                text-[12px]
                font-semibold
                text-[var(--cf-text-secondary)]
                transition

                hover:bg-[var(--cf-surface-soft)]

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TABLE
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
        py-3.5
        text-left
        text-[11px]
        font-semibold
        uppercase
        tracking-[0.09em]
        text-[var(--cf-text-muted)]
      "
    >
      {children}
    </th>
  );
}

function ContactRow({
  contact,
  last,
}: {
  contact:
    ContactRecord;

  last:
    boolean;
}) {
  return (
    <tr
      className={`
        transition
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
      <td
        className="
          px-4
          py-4
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
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[var(--cf-primary-soft)]
              text-[12px]
              font-semibold
              text-[var(--cf-primary)]
            "
          >
            {getInitials(
              contact,
            )}
          </div>

          <div
            className="
              min-w-0
            "
          >
            <Link
              href={`/contacts/${contact.id}`}
              className="
                block
                max-w-[190px]
                truncate
                text-[14px]
                font-semibold
                text-[var(--cf-text)]
                transition
                hover:text-[var(--cf-primary)]
              "
            >
              {contactName(
                contact,
              )}
            </Link>

            <p
              className="
                mt-1
                max-w-[190px]
                truncate
                text-[11px]
                text-[var(--cf-text-muted)]
              "
            >
              {contact.jobTitle ||
                'Contact'}
            </p>
          </div>
        </div>
      </td>

      <td
        className="
          px-4
          py-4
          text-[13px]
          text-[var(--cf-text-secondary)]
        "
      >
        {contact.company}
      </td>

      <td
        className="
          px-4
          py-4
        "
      >
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="
              text-[13px]
              text-[var(--cf-text-secondary)]
              transition
              hover:text-[var(--cf-primary)]
            "
          >
            {contact.email}
          </a>
        ) : (
          <span
            className="
              text-[13px]
              text-[var(--cf-text-muted)]
            "
          >
            —
          </span>
        )}
      </td>

      <td
        className="
          px-4
          py-4
          text-[13px]
          text-[var(--cf-text-secondary)]
        "
      >
        {contact.phone ||
          '—'}
      </td>

      <td
        className="
          px-4
          py-4
        "
      >
        <span
          className="
            inline-flex
            min-w-8
            items-center
            justify-center
            rounded-full
            bg-[var(--cf-surface-soft)]
            px-2.5
            py-1.5
            text-[11px]
            font-semibold
            text-[var(--cf-text-secondary)]
          "
        >
          {
            contact.activeOpportunityCount
          }
        </span>
      </td>

      <td
        className="
          px-4
          py-4
          text-[14px]
          font-semibold
          text-[var(--cf-text)]
        "
      >
        {formatMoney(
          contact.openValueCents,
        )}
      </td>

      <td
        className="
          px-4
          py-4
          text-[14px]
          font-semibold
          text-[var(--cf-text)]
        "
      >
        {formatMoney(
          contact.lifetimeValueCents,
        )}
      </td>

      <td
        className="
          px-4
          py-4
          text-[12px]
          text-[var(--cf-text-muted)]
        "
      >
        {formatRelativeDate(
          contact.latestActivityAt,
        )}
      </td>

      <td
        className="
          px-3
          py-4
        "
      >
        <Link
          href={`/contacts/${contact.id}`}
          aria-label={`Open ${contactName(contact)}`}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            text-[var(--cf-text-muted)]
            transition
            hover:bg-[var(--cf-primary-soft)]
            hover:text-[var(--cf-primary)]
          "
        >
          <ArrowRight
            size={15}
          />
        </Link>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function ContactCard({
  contact,
}: {
  contact:
    ContactRecord;
}) {
  return (
    <article
      className="
        rounded-[16px]
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
          items-start
          gap-3
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[var(--cf-primary-soft)]
            text-[12px]
            font-semibold
            text-[var(--cf-primary)]
          "
        >
          {getInitials(
            contact,
          )}
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <Link
            href={`/contacts/${contact.id}`}
            className="
              block
              truncate
              text-[16px]
              font-semibold
              text-[var(--cf-text)]
            "
          >
            {contactName(
              contact,
            )}
          </Link>

          <p
            className="
              mt-1
              truncate
              text-[13px]
              text-[var(--cf-text-secondary)]
            "
          >
            {contact.company}
          </p>

          <p
            className="
              mt-0.5
              truncate
              text-[11px]
              text-[var(--cf-text-muted)]
            "
          >
            {contact.jobTitle ||
              'Contact'}
          </p>
        </div>

        <Link
          href={`/contacts/${contact.id}`}
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[var(--cf-surface-soft)]
            text-[var(--cf-text-secondary)]
          "
        >
          <ArrowRight
            size={15}
          />
        </Link>
      </div>

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-2
        "
      >
        <MetricBox
          label="Active opportunities"
          value={String(
            contact.activeOpportunityCount,
          )}
        />

        <MetricBox
          label="Open value"
          value={formatMoney(
            contact.openValueCents,
          )}
        />

        <MetricBox
          label="Lifetime value"
          value={formatMoney(
            contact.lifetimeValueCents,
          )}
        />

        <MetricBox
          label="Last activity"
          value={formatRelativeDate(
            contact.latestActivityAt,
          )}
        />
      </div>

      <div
        className="
          mt-4
          grid
          gap-2
        "
      >
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="
              flex
              min-h-10
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--cf-border-soft)]
              px-3
              text-[12px]
              text-[var(--cf-text-secondary)]
            "
          >
            <Mail
              size={14}
            />

            <span
              className="
                truncate
              "
            >
              {contact.email}
            </span>
          </a>
        )}

        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="
              flex
              min-h-10
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--cf-border-soft)]
              px-3
              text-[12px]
              text-[var(--cf-text-secondary)]
            "
          >
            <Phone
              size={14}
            />

            <span
              className="
                truncate
              "
            >
              {contact.phone}
            </span>
          </a>
        )}
      </div>
    </article>
  );
}

function MetricBox({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div
      className="
        min-w-0
        rounded-xl
        bg-[var(--cf-surface-soft)]
        p-3
      "
    >
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.06em]
          text-[var(--cf-text-muted)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          truncate
          text-[13px]
          font-semibold
          text-[var(--cf-text)]
        "
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function SummaryChip({
  icon,
  label,
  primary = false,
  success = false,
}: {
  icon:
    React.ReactNode;

  label:
    string;

  primary?:
    boolean;

  success?:
    boolean;
}) {
  return (
    <div
      className={`
        inline-flex
        h-11
        items-center
        gap-2
        rounded-xl
        border
        px-3.5
        text-[14px]
        font-medium

        ${
          success
            ? `
                border-emerald-500/15
                bg-emerald-500/10
                text-emerald-600
              `
            : primary
              ? `
                  border-[var(--cf-primary)]/20
                  bg-[var(--cf-primary-soft)]
                  text-[var(--cf-primary)]
                `
              : `
                  border-[var(--cf-border)]
                  bg-[var(--cf-surface)]
                  text-[var(--cf-text-secondary)]
                `
        }
      `}
    >
      {icon}

      {label}
    </div>
  );
}

/* =========================================================
   STATES
========================================================= */

function ContactsLoading() {
  return (
    <div
      className="
        flex
        min-h-[500px]
        items-center
        justify-center
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          gap-3
        "
      >
        <div
          className="
            h-8
            w-8
            animate-spin
            rounded-full
            border-[3px]
            border-[var(--cf-border)]
            border-t-[var(--cf-primary)]
          "
        />

        <p
          className="
            text-[14px]
            text-[var(--cf-text-secondary)]
          "
        >
          Loading contacts...
        </p>
      </div>
    </div>
  );
}

function ContactsEmpty({
  search,
  onClear,
}: {
  search:
    string;

  onClear:
    () => void;
}) {
  return (
    <div
      className="
        mt-4
        flex
        min-h-[340px]
        flex-col
        items-center
        justify-center
        rounded-[18px]
        border
        border-dashed
        border-[var(--cf-border)]
        bg-[var(--cf-surface)]
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
          rounded-2xl
          bg-[var(--cf-primary-soft)]
          text-[var(--cf-primary)]
        "
      >
        <UserRound
          size={20}
        />
      </div>

      <h2
        className="
          mt-4
          text-[20px]
          font-semibold
        "
      >
        No contacts found
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
        {search
          ? 'No contacts match the current search and filter.'
          : 'Contacts are created and linked automatically from the people attached to your opportunities.'}
      </p>

      <button
        type="button"
        onClick={onClear}
        className="
          mt-5
          h-10
          rounded-xl
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface)]
          px-4
          text-[13px]
          font-semibold
          text-[var(--cf-text)]
          transition
          hover:bg-[var(--cf-surface-soft)]
        "
      >
        Clear filters
      </button>
    </div>
  );
}
