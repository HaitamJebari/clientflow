'use client';

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MailPlus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
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

import {
  clientFlowSwal,
} from '@/lib/swal';

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
    createdAt?: string;
  };
}

interface MembersResponse {
  viewerRole: MemberRole;

  data:
    MemberRecord[];

  meta: {
    total: number;
  };
}

interface InvitationRecord {
  id: string;
  email: string;
  role: MemberRole;
  expiresAt: string;
  createdAt: string;

  invitedBy?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

interface InvitationsResponse {
  data:
    InvitationRecord[];

  meta: {
    total: number;
  };
}

interface CreateInvitationResponse {
  invitation:
    InvitationRecord;

  emailSent:
    true;

  emailMessageId:
    string;
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

function formatDate(
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
    return '—';
  }

  return new Intl.DateTimeFormat(
    'en',
    {
      day:
        'numeric',
      month:
        'short',
      year:
        'numeric',
    },
  ).format(
    date,
  );
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
    invitations,
    setInvitations,
  ] =
    useState<
      InvitationRecord[]
    >([]);

  const [
    viewerRole,
    setViewerRole,
  ] =
    useState<
      MemberRole
    >('MEMBER');

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

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(null);

  const [
    inviteOpen,
    setInviteOpen,
  ] =
    useState(false);

  const [
    inviteEmail,
    setInviteEmail,
  ] =
    useState('');

  const [
    inviteRole,
    setInviteRole,
  ] =
    useState<
      'ADMIN' |
      'MEMBER'
    >('MEMBER');

  const [
    creatingInvite,
    setCreatingInvite,
  ] =
    useState(false);

  const [
    busyId,
    setBusyId,
  ] =
    useState<
      string | null
    >(null);

  const canManage =
    viewerRole ===
      'OWNER' ||
    viewerRole ===
      'ADMIN';

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
          const membersResponse =
            await request<
              MembersResponse
            >(
              '/members',
            );

          setMembers(
            membersResponse.data ??
              [],
          );

          setViewerRole(
            membersResponse.viewerRole,
          );

          if (
            membersResponse.viewerRole ===
              'OWNER' ||
            membersResponse.viewerRole ===
              'ADMIN'
          ) {
            const invitationResponse =
              await request<
                InvitationsResponse
              >(
                '/members/invitations',
              );

            setInvitations(
              invitationResponse.data ??
                [],
            );
          } else {
            setInvitations(
              [],
            );
          }
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

  async function createInvitation(
    event:
      React.FormEvent,
  ) {
    event.preventDefault();

    const email =
      inviteEmail
        .trim()
        .toLowerCase();

    if (!email) {
      setError(
        'Enter the email address you want to invite.',
      );
      return;
    }

    setCreatingInvite(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const response =
        await request<
          CreateInvitationResponse
        >(
          '/members/invitations',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                email,

                role:
                  inviteRole,
              }),
          },
        );

      setInvitations(
        (
          current,
        ) => [
          response.invitation,
          ...current,
        ],
      );

      setInviteEmail(
        '',
      );

      setInviteRole(
        'MEMBER',
      );

      setInviteOpen(
        false,
      );

      const successMessage =
        `Invitation email sent to ${response.invitation.email}.`;

      setSuccess(
        successMessage,
      );

      await clientFlowSwal.fire({
        title:
          'Invitation sent',

        text:
          successMessage,

        icon:
          'success',

        confirmButtonText:
          'OK',
      });
    } catch (
      inviteError
    ) {
      setError(
        inviteError instanceof
          Error
          ? inviteError.message
          : 'Unable to create invitation.',
      );
    } finally {
      setCreatingInvite(
        false,
      );
    }
  }

  async function revokeInvitation(
    invitation:
      InvitationRecord,
  ) {
    const result =
      await clientFlowSwal.fire({
        title:
          'Cancel invitation?',

        text:
          `The pending invitation for ${invitation.email} will no longer be usable.`,

        icon:
          'warning',

        showCancelButton:
          true,

        confirmButtonText:
          'Yes, cancel invitation',

        cancelButtonText:
          'Keep invitation',

        reverseButtons:
          true,

        focusCancel:
          true,
      });

    if (
      !result.isConfirmed
    ) {
      return;
    }

    setBusyId(
      invitation.id,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      await request(
        `/members/invitations/${invitation.id}`,
        {
          method:
            'DELETE',
        },
      );

      setInvitations(
        (
          current,
        ) =>
          current.filter(
            (
              item,
            ) =>
              item.id !==
              invitation.id,
          ),
      );

      await clientFlowSwal.fire({
        title:
          'Invitation cancelled',

        text:
          `${invitation.email} can no longer use that invitation.`,

        icon:
          'success',

        confirmButtonText:
          'OK',
      });
    } catch (
      revokeError
    ) {
      const message =
        revokeError instanceof
          Error
          ? revokeError.message
          : 'Unable to cancel invitation.';

      setError(
        message,
      );

      await clientFlowSwal.fire({
        title:
          'Could not cancel invitation',

        text:
          message,

        icon:
          'error',

        confirmButtonText:
          'OK',
      });
    } finally {
      setBusyId(
        null,
      );
    }
  }

  async function changeRole(
    member:
      MemberRecord,

    role:
      MemberRole,
  ) {
    if (
      member.role ===
      role
    ) {
      return;
    }

    setBusyId(
      member.id,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      await request(
        `/members/${member.id}/role`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              role,
            }),
        },
      );

      setMembers(
        (
          current,
        ) =>
          current.map(
            (
              item,
            ) =>
              item.id ===
              member.id
                ? {
                    ...item,
                    role,
                  }
                : item,
          ),
      );

      setSuccess(
        `${displayName(member)} is now ${roleLabel(role)}.`,
      );
    } catch (
      roleError
    ) {
      setError(
        roleError instanceof
          Error
          ? roleError.message
          : 'Unable to update member role.',
      );
    } finally {
      setBusyId(
        null,
      );
    }
  }

  async function removeMember(
    member:
      MemberRecord,
  ) {
    const result =
      await clientFlowSwal.fire({
        title:
          'Remove member?',

        text:
          `${displayName(member)} will lose access to ${organization?.name ?? 'this workspace'} and their active workspace sessions will be revoked.`,

        icon:
          'warning',

        showCancelButton:
          true,

        confirmButtonText:
          'Yes, remove member',

        cancelButtonText:
          'Keep member',

        reverseButtons:
          true,

        focusCancel:
          true,
      });

    if (
      !result.isConfirmed
    ) {
      return;
    }

    setBusyId(
      member.id,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      await request(
        `/members/${member.id}`,
        {
          method:
            'DELETE',
        },
      );

      setMembers(
        (
          current,
        ) =>
          current.filter(
            (
              item,
            ) =>
              item.id !==
              member.id,
          ),
      );

      setSuccess(
        `${displayName(member)} was removed from the workspace.`,
      );
    } catch (
      removeError
    ) {
      setError(
        removeError instanceof
          Error
          ? removeError.message
          : 'Unable to remove member.',
      );
    } finally {
      setBusyId(
        null,
      );
    }
  }

  function canRemove(
    member:
      MemberRecord,
  ) {
    if (
      member.isCurrentUser
    ) {
      return false;
    }

    if (
      viewerRole ===
      'OWNER'
    ) {
      return true;
    }

    return (
      viewerRole ===
        'ADMIN' &&
      member.role ===
        'MEMBER'
    );
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
            Members
          </h1>

          <p
            className="
              mt-2
              max-w-[760px]
              text-[15px]
              leading-6
              text-[var(--cf-text-secondary)]

              sm:text-[16px]
            "
          >
            Manage access to {organization?.name ?? 'this workspace'},
            member roles and pending invitations.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => {
              setError(
                null,
              );

              setSuccess(
                null,
              );

              setInviteOpen(
                true,
              );
            }}
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
              text-[13px]
              font-semibold
              text-white
              transition
              hover:bg-[var(--cf-primary-hover)]
            "
          >
            <MailPlus
              size={15}
            />

            Invite member
          </button>
        )}
      </div>

      <div
        className="
          mt-6
          grid
          gap-3

          sm:grid-cols-4
        "
      >
        <Stat
          label="Members"
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
          label="Pending invites"
          value={
            invitations.length
          }
          icon={
            <Clock3
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

      {success && (
        <div
          className="
            mt-5
            rounded-xl
            border
            border-emerald-500/20
            bg-emerald-500/5
            px-4
            py-3
            text-[13px]
            leading-5
            text-emerald-700
          "
        >
          {success}
        </div>
      )}

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
            leading-5
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
              Your role: {roleLabel(viewerRole)}
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
          <LoadingState
            label="Loading members"
          />
        ) : filtered.length ===
          0 ? (
          <div
            className="
              flex
              min-h-[260px]
              flex-col
              items-center
              justify-center
              px-6
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
                    gap-4
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
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    {viewerRole ===
                      'OWNER' &&
                    !member.isCurrentUser ? (
                      <select
                        value={
                          member.role
                        }
                        disabled={
                          busyId ===
                          member.id
                        }
                        onChange={(
                          event,
                        ) =>
                          void changeRole(
                            member,
                            event.target
                              .value as
                              MemberRole,
                          )
                        }
                        className="
                          h-9
                          rounded-lg
                          border
                          border-[var(--cf-border)]
                          bg-[var(--cf-surface-soft)]
                          px-3
                          text-[11px]
                          font-semibold
                          outline-none
                        "
                      >
                        <option value="OWNER">
                          Owner
                        </option>

                        <option value="ADMIN">
                          Admin
                        </option>

                        <option value="MEMBER">
                          Member
                        </option>
                      </select>
                    ) : (
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
                    )}

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

                    {canRemove(
                      member,
                    ) && (
                      <button
                        type="button"
                        disabled={
                          busyId ===
                          member.id
                        }
                        onClick={() =>
                          void removeMember(
                            member,
                          )
                        }
                        aria-label={`Remove ${displayName(member)}`}
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          text-[var(--cf-text-muted)]
                          transition
                          hover:bg-red-500/10
                          hover:text-red-600
                          disabled:opacity-50
                        "
                      >
                        {busyId ===
                        member.id ? (
                          <LoaderCircle
                            size={14}
                            className="
                              animate-spin
                            "
                          />
                        ) : (
                          <Trash2
                            size={14}
                          />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {canManage && (
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
            <h2
              className="
                text-[16px]
                font-semibold
              "
            >
              Pending invitations
            </h2>

            <p
              className="
                mt-1
                text-[12px]
                leading-5
                text-[var(--cf-text-muted)]
              "
            >
              Invitation emails contain a secure acceptance link and
              expire after 7 days.
            </p>
          </div>

          {loading ? (
            <LoadingState
              label="Loading invitations"
            />
          ) : invitations.length ===
            0 ? (
            <div
              className="
                px-5
                py-10
                text-center
              "
            >
              <MailPlus
                size={20}
                className="
                  mx-auto
                  text-[var(--cf-text-muted)]
                "
              />

              <p
                className="
                  mt-3
                  text-[13px]
                  font-semibold
                "
              >
                No pending invitations
              </p>
            </div>
          ) : (
            <div
              className="
                divide-y
                divide-[var(--cf-border-soft)]
              "
            >
              {invitations.map(
                (
                  invitation,
                ) => (
                  <div
                    key={
                      invitation.id
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
                        min-w-0
                      "
                    >
                      <p
                        className="
                          truncate
                          text-[14px]
                          font-semibold
                        "
                      >
                        {invitation.email}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[11px]
                          text-[var(--cf-text-muted)]
                        "
                      >
                        Expires {formatDate(
                          invitation.expiresAt,
                        )}
                      </p>
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
                          invitation.role,
                        )}
                      </span>

                      <span
                        className="
                          rounded-full
                          border
                          border-amber-500/20
                          bg-amber-500/10
                          px-3
                          py-1.5
                          text-[10px]
                          font-semibold
                          text-amber-700
                        "
                      >
                        Pending
                      </span>

                      <button
                        type="button"
                        disabled={
                          busyId ===
                          invitation.id
                        }
                        onClick={() =>
                          void revokeInvitation(
                            invitation,
                          )
                        }
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          text-[var(--cf-text-muted)]
                          transition
                          hover:bg-red-500/10
                          hover:text-red-600
                          disabled:opacity-50
                        "
                        aria-label={`Cancel invitation for ${invitation.email}`}
                      >
                        {busyId ===
                        invitation.id ? (
                          <LoaderCircle
                            size={14}
                            className="
                              animate-spin
                            "
                          />
                        ) : (
                          <X
                            size={15}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      )}

      {inviteOpen && (
        <div
          className="
            fixed
            inset-0
            z-[220]
            flex
            items-center
            justify-center
            bg-black/45
            p-4
            backdrop-blur-[2px]
          "
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setInviteOpen(
                false,
              );
            }
          }}
        >
          <div
            className="
              w-full
              max-w-[520px]
              rounded-[18px]
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface)]
              p-5
              shadow-[0_24px_80px_rgba(0,0,0,.28)]

              sm:p-6
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <h2
                  className="
                    text-[20px]
                    font-semibold
                  "
                >
                  Invite a workspace member
                </h2>

                <p
                  className="
                    mt-2
                    text-[13px]
                    leading-6
                    text-[var(--cf-text-secondary)]
                  "
                >
                  ClientFlow will send a real invitation email with a
                  secure acceptance link that expires after 7 days.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setInviteOpen(
                    false,
                  )
                }
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-[var(--cf-text-muted)]
                  hover:bg-[var(--cf-surface-soft)]
                "
                aria-label="Close invitation form"
              >
                <X
                  size={17}
                />
              </button>
            </div>

            <form
              onSubmit={
                createInvitation
              }
              className="
                mt-6
              "
            >
              <label
                className="
                  block
                "
              >
                <span
                  className="
                    mb-2
                    block
                    text-[12px]
                    font-semibold
                    text-[var(--cf-text-secondary)]
                  "
                >
                  Work email
                </span>

                <input
                  type="email"
                  required
                  value={
                    inviteEmail
                  }
                  onChange={(
                    event,
                  ) =>
                    setInviteEmail(
                      event.target
                        .value,
                    )
                  }
                  placeholder="teammate@example.com"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-[var(--cf-border)]
                    bg-[var(--cf-surface-soft)]
                    px-3
                    text-[14px]
                    outline-none
                    focus:border-[var(--cf-primary)]
                  "
                />
              </label>

              <label
                className="
                  mt-4
                  block
                "
              >
                <span
                  className="
                    mb-2
                    block
                    text-[12px]
                    font-semibold
                    text-[var(--cf-text-secondary)]
                  "
                >
                  Role
                </span>

                <select
                  value={
                    inviteRole
                  }
                  onChange={(
                    event,
                  ) =>
                    setInviteRole(
                      event.target
                        .value as
                        'ADMIN' |
                        'MEMBER',
                    )
                  }
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-[var(--cf-border)]
                    bg-[var(--cf-surface-soft)]
                    px-3
                    text-[14px]
                    outline-none
                    focus:border-[var(--cf-primary)]
                  "
                >
                  <option value="MEMBER">
                    Member
                  </option>

                  {viewerRole ===
                    'OWNER' && (
                    <option value="ADMIN">
                      Admin
                    </option>
                  )}
                </select>
              </label>

              <div
                className="
                  mt-6
                  flex
                  flex-col-reverse
                  gap-2

                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setInviteOpen(
                      false,
                    )
                  }
                  className="
                    h-11
                    rounded-xl
                    border
                    border-[var(--cf-border)]
                    px-4
                    text-[13px]
                    font-semibold
                    text-[var(--cf-text-secondary)]
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingInvite
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
                    text-[13px]
                    font-semibold
                    text-white
                    disabled:opacity-60
                  "
                >
                  {creatingInvite ? (
                    <LoaderCircle
                      size={15}
                      className="
                        animate-spin
                      "
                    />
                  ) : (
                    <MailPlus
                      size={15}
                    />
                  )}

                  Create invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState({
  label,
}: {
  label:
    string;
}) {
  return (
    <div
      className="
        flex
        min-h-[220px]
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

      {label}
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
