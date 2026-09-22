'use client';

import {
  CheckCircle2,
  LoaderCircle,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
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

type MemberRole =
  | 'OWNER'
  | 'ADMIN'
  | 'MEMBER';

interface MemberRecord {
  id: string;
  role: MemberRole;
  joinedAt: string;
  isCurrentUser: boolean;

  user: {
    id: string;
    email: string;

    firstName?: string | null;
    lastName?: string | null;

    avatarUrl?: string | null;
    emailVerified: boolean;
    createdAt: string;
  };
}

interface MembersResponse {
  data:
    MemberRecord[];

  meta: {
    total: number;
  };
}

function displayName(
  member:
    MemberRecord,
) {
  const name =
    [
      member.user.firstName,
      member.user.lastName,
    ]
      .filter(Boolean)
      .join(' ');

  return name ||
    member.user.email;
}

function initials(
  member:
    MemberRecord,
) {
  const value =
    [
      member.user.firstName,
      member.user.lastName,
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

  return (
    value ||
    member.user.email[0]
      ?.toUpperCase() ||
    'U'
  );
}

function roleLabel(
  role:
    MemberRole,
) {
  if (
    role ===
    'OWNER'
  ) {
    return 'Owner';
  }

  if (
    role ===
    'ADMIN'
  ) {
    return 'Admin';
  }

  return 'Member';
}

export default function MembersPage() {
  const {
    request,
    organization,
  } = useAuth();

  const [
    members,
    setMembers,
  ] =
    useState<
      MemberRecord[]
    >([]);

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

  const load =
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
              MembersResponse
            >(
              '/members',
            );

          setMembers(
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
              : 'Unable to load workspace members.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [request],
    );

  useEffect(() => {
    void load();
  }, [load]);

  const filtered =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return members;
        }

        return members.filter(
          (
            member,
          ) =>
            displayName(
              member,
            )
              .toLowerCase()
              .includes(
                query,
              ) ||
            member.user.email
              .toLowerCase()
              .includes(
                query,
              ) ||
            member.role
              .toLowerCase()
              .includes(
                query,
              ),
        );
      },
      [
        members,
        search,
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
          Members
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
          People who can access {organization?.name ?? 'this workspace'}.
          Role editing and email invitations are intentionally left for
          the invitation workflow phase.
        </p>
      </div>

      <div
        className="
          mt-6
          grid
          gap-3

          sm:grid-cols-3
        "
      >
        <Stat
          label="Total members"
          value={
            members.length
          }
          icon={
            <UsersRound
              size={16}
            />
          }
        />

        <Stat
          label="Owners & admins"
          value={
            members.filter(
              (
                member,
              ) =>
                member.role ===
                  'OWNER' ||
                member.role ===
                  'ADMIN',
            ).length
          }
          icon={
            <ShieldCheck
              size={16}
            />
          }
        />

        <Stat
          label="Verified emails"
          value={
            members.filter(
              (
                member,
              ) =>
                member.user
                  .emailVerified,
            ).length
          }
          icon={
            <CheckCircle2
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
              Workspace access
            </h2>

            <p
              className="
                mt-1
                text-[12px]
                text-[var(--cf-text-muted)]
              "
            >
              {members.length} active membership{members.length === 1 ? '' : 's'}
            </p>
          </div>

          <label
            className="
              flex
              h-10
              w-full
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface-soft)]
              px-3

              sm:w-[280px]
            "
          >
            <Search
              size={14}
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
              placeholder="Search members"
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

        {loading ? (
          <div
            className="
              flex
              min-h-[280px]
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

            Loading members
          </div>
        ) : filtered.length ===
          0 ? (
          <div
            className="
              flex
              min-h-[280px]
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <UserRound
              size={22}
              className="
                text-[var(--cf-text-muted)]
              "
            />

            <p
              className="
                mt-3
                text-[14px]
                font-semibold
              "
            >
              No members found
            </p>
          </div>
        ) : (
          <div
            className="
              divide-y
              divide-[var(--cf-border-soft)]
            "
          >
            {filtered.map(
              (
                member,
              ) => (
                <div
                  key={
                    member.id
                  }
                  className="
                    flex
                    flex-col
                    gap-3
                    px-4
                    py-4

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-5
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
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[var(--cf-primary-soft)]
                        text-[11px]
                        font-semibold
                        text-[var(--cf-primary)]
                      "
                    >
                      {initials(
                        member,
                      )}
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
                            text-[14px]
                            font-semibold
                          "
                        >
                          {displayName(
                            member,
                          )}
                        </p>

                        {member.isCurrentUser && (
                          <span
                            className="
                              rounded-full
                              bg-[var(--cf-surface-soft)]
                              px-2
                              py-1
                              text-[9px]
                              font-semibold
                              text-[var(--cf-text-muted)]
                            "
                          >
                            You
                          </span>
                        )}
                      </div>

                      <p
                        className="
                          mt-1
                          truncate
                          text-[12px]
                          text-[var(--cf-text-secondary)]
                        "
                      >
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        rounded-full
                        bg-[var(--cf-primary-soft)]
                        px-3
                        py-1.5
                        text-[10px]
                        font-semibold
                        text-[var(--cf-primary)]
                      "
                    >
                      {roleLabel(
                        member.role,
                      )}
                    </span>

                    <span
                      className="
                        text-[11px]
                        text-[var(--cf-text-muted)]
                      "
                    >
                      {member.user.emailVerified
                        ? 'Verified'
                        : 'Unverified'}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label:
    string;
  value:
    number;
  icon:
    React.ReactNode;
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
          className="
            text-[var(--cf-primary)]
          "
        >
          {icon}
        </span>
      </div>

      <p
        className="
          mt-3
          text-[27px]
          font-semibold
        "
      >
        {value}
      </p>
    </div>
  );
}
