'use client';

import {
  Building2,
  LoaderCircle,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  Send,
  UserRound,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useAuth,
} from '@/components/providers/auth-provider';

interface ContactItem {
  id: string;
  firstName: string;
  lastName?: string | null;

  email?: string | null;
  phone?: string | null;

  company?: string | null;
  jobTitle?: string | null;

  activeOpportunityCount?: number;
  openValueCents?: number;
  lifetimeValueCents?: number;

  updatedAt?: string;
}

interface ContactsResponse {
  data:
    ContactItem[];

  meta?: {
    total?: number;
  };
}

function nameOf(
  contact:
    ContactItem,
) {
  return (
    [
      contact.firstName,
      contact.lastName,
    ]
      .filter(Boolean)
      .join(' ') ||
    contact.email ||
    'Unnamed contact'
  );
}

function initialsOf(
  contact:
    ContactItem,
) {
  const value =
    [
      contact.firstName,
      contact.lastName,
    ]
      .filter(Boolean)
      .map(
        (
          part,
        ) =>
          part?.trim()?.[0] ??
          '',
      )
      .join('')
      .slice(
        0,
        2,
      )
      .toUpperCase();

  return value ||
    'CF';
}

export default function ConversationsPage() {
  const {
    request,
  } = useAuth();

  const [
    contacts,
    setContacts,
  ] =
    useState<
      ContactItem[]
    >([]);

  const [
    selectedId,
    setSelectedId,
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

  const loadContacts =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const params =
            new URLSearchParams({
              page:
                '1',

              pageSize:
                '50',

              filter:
                'all',

              sort:
                'recent',
            });

          if (
            search.trim()
          ) {
            params.set(
              'search',
              search.trim(),
            );
          }

          const response =
            await request<
              ContactsResponse
            >(
              `/contacts?${params.toString()}`,
            );

          const next =
            response.data ??
            [];

          setContacts(
            next,
          );

          setSelectedId(
            (
              current,
            ) => {
              if (
                current &&
                next.some(
                  (
                    item,
                  ) =>
                    item.id ===
                    current,
                )
              ) {
                return current;
              }

              return next[0]
                ?.id ??
                null;
            },
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : 'Unable to load contacts.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        request,
        search,
      ],
    );

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadContacts();
        },
        250,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [loadContacts]);

  const selected =
    useMemo(
      () =>
        contacts.find(
          (
            item,
          ) =>
            item.id ===
            selectedId,
        ) ??
        null,
      [
        contacts,
        selectedId,
      ],
    );

  return (
    <div
      className="
        min-w-0
        text-[var(--cf-text)]
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
          Conversations
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
          Keep client communication close to the opportunity.
          Email synchronization is intentionally not faked before
          a real provider is connected.
        </p>
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
          grid
          min-h-[620px]
          overflow-hidden
          rounded-[18px]
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface)]
          shadow-[var(--cf-shadow)]

          lg:grid-cols-[330px_minmax(0,1fr)]
        "
      >
        <aside
          className="
            border-b
            border-[var(--cf-border)]

            lg:border-b-0
            lg:border-r
          "
        >
          <div
            className="
              border-b
              border-[var(--cf-border-soft)]
              p-4
            "
          >
            <label
              className="
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
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search contacts"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[13px]
                  outline-none
                "
              />
            </label>
          </div>

          <div
            className="
              max-h-[320px]
              overflow-y-auto

              lg:max-h-[680px]
            "
          >
            {loading ? (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  p-5
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

                Loading contacts
              </div>
            ) : contacts.length ===
              0 ? (
              <div
                className="
                  p-5
                  text-[13px]
                  leading-6
                  text-[var(--cf-text-secondary)]
                "
              >
                No contacts match this search.
              </div>
            ) : (
              contacts.map(
                (
                  contact,
                ) => {
                  const active =
                    selectedId ===
                    contact.id;

                  return (
                    <button
                      key={
                        contact.id
                      }
                      type="button"
                      onClick={() =>
                        setSelectedId(
                          contact.id,
                        )
                      }
                      className={`
                        flex
                        w-full
                        items-center
                        gap-3
                        border-b
                        border-[var(--cf-border-soft)]
                        px-4
                        py-4
                        text-left
                        transition

                        ${
                          active
                            ? `
                              bg-[var(--cf-primary-soft)]
                            `
                            : `
                              hover:bg-[var(--cf-surface-hover)]
                            `
                        }
                      `}
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
                          bg-[var(--cf-surface-soft)]
                          text-[11px]
                          font-semibold
                          text-[var(--cf-primary)]
                        "
                      >
                        {initialsOf(
                          contact,
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
                            truncate
                            text-[14px]
                            font-semibold
                          "
                        >
                          {nameOf(
                            contact,
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
                          {contact.company ||
                            contact.email ||
                            'No company'}
                        </p>
                      </div>

                      {(contact.activeOpportunityCount ??
                        0) >
                        0 && (
                        <span
                          className="
                            rounded-full
                            bg-[var(--cf-primary)]
                            px-2
                            py-1
                            text-[9px]
                            font-semibold
                            text-white
                          "
                        >
                          {
                            contact.activeOpportunityCount
                          }
                        </span>
                      )}
                    </button>
                  );
                },
              )
            )}
          </div>
        </aside>

        <div
          className="
            min-w-0
          "
        >
          {!selected ? (
            <div
              className="
                flex
                min-h-[500px]
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
                  bg-[var(--cf-primary-soft)]
                  text-[var(--cf-primary)]
                "
              >
                <MessageSquareText
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
                Select a contact
              </h2>

              <p
                className="
                  mt-2
                  max-w-[420px]
                  text-[13px]
                  leading-6
                  text-[var(--cf-text-secondary)]
                "
              >
                Choose a contact to see communication options and
                sales context.
              </p>
            </div>
          ) : (
            <>
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  border-b
                  border-[var(--cf-border-soft)]
                  px-5
                  py-5

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
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
                    {initialsOf(
                      selected,
                    )}
                  </div>

                  <div
                    className="
                      min-w-0
                    "
                  >
                    <h2
                      className="
                        truncate
                        text-[17px]
                        font-semibold
                      "
                    >
                      {nameOf(
                        selected,
                      )}
                    </h2>

                    <p
                      className="
                        mt-1
                        truncate
                        text-[12px]
                        text-[var(--cf-text-secondary)]
                      "
                    >
                      {[
                        selected.jobTitle,
                        selected.company,
                      ]
                        .filter(
                          Boolean,
                        )
                        .join(
                          ' · ',
                        ) ||
                        'Client contact'}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}`}
                      className="
                        inline-flex
                        h-10
                        items-center
                        gap-2
                        rounded-xl
                        bg-[var(--cf-primary)]
                        px-4
                        text-[12px]
                        font-semibold
                        text-white
                      "
                    >
                      <Mail
                        size={14}
                      />

                      Email
                    </a>
                  )}

                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      className="
                        inline-flex
                        h-10
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-[var(--cf-border)]
                        px-4
                        text-[12px]
                        font-semibold
                        text-[var(--cf-text-secondary)]
                      "
                    >
                      <Phone
                        size={14}
                      />

                      Call
                    </a>
                  )}
                </div>
              </div>

              <div
                className="
                  grid
                  min-h-[455px]
                  place-items-center
                  px-5
                  py-8
                "
              >
                <div
                  className="
                    max-w-[520px]
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      bg-[var(--cf-surface-soft)]
                      text-[var(--cf-text-secondary)]
                    "
                  >
                    <Send
                      size={19}
                    />
                  </div>

                  <h3
                    className="
                      mt-4
                      text-[17px]
                      font-semibold
                    "
                  >
                    Message history is not connected yet
                  </h3>

                  <p
                    className="
                      mt-2
                      text-[13px]
                      leading-6
                      text-[var(--cf-text-secondary)]
                    "
                  >
                    ClientFlow will show real inbound and outbound
                    email here after an email provider is connected.
                    Until then, use the direct email or call actions
                    above instead of displaying fake conversations.
                  </p>

                  <div
                    className="
                      mt-5
                      grid
                      gap-3
                      text-left

                      sm:grid-cols-2
                    "
                  >
                    <InfoCard
                      icon={
                        <Building2
                          size={15}
                        />
                      }
                      label="Company"
                      value={
                        selected.company ||
                        'Not provided'
                      }
                    />

                    <InfoCard
                      icon={
                        <UserRound
                          size={15}
                        />
                      }
                      label="Open opportunities"
                      value={String(
                        selected.activeOpportunityCount ??
                          0,
                      )}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;
  label:
    string;
  value:
    string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-[var(--cf-border)]
        bg-[var(--cf-surface-soft)]
        p-3.5
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          text-[var(--cf-text-muted)]
        "
      >
        {icon}

        <span
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.08em]
          "
        >
          {label}
        </span>
      </div>

      <p
        className="
          mt-2
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
