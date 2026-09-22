'use client';

import {
  Building2,
  Check,
  LoaderCircle,
  Save,
  Settings2,
  UserRound,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import {
  useAuth,
} from '@/components/providers/auth-provider';

type Tab =
  | 'profile'
  | 'workspace'
  | 'preferences';

export default function SettingsPage() {
  const {
    user,
    organization,
    request,
  } = useAuth();

  const [
    tab,
    setTab,
  ] =
    useState<Tab>(
      'profile',
    );

  const [
    firstName,
    setFirstName,
  ] =
    useState('');

  const [
    lastName,
    setLastName,
  ] =
    useState('');

  const [
    organizationName,
    setOrganizationName,
  ] =
    useState('');

  const [
    website,
    setWebsite,
  ] =
    useState('');

  const [
    industry,
    setIndustry,
  ] =
    useState('');

  const [
    defaultPage,
    setDefaultPage,
  ] =
    useState(
      'dashboard',
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    message,
    setMessage,
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

  useEffect(() => {
    setFirstName(
      user?.firstName ??
        '',
    );

    setLastName(
      user?.lastName ??
        '',
    );

    setOrganizationName(
      organization?.name ??
        '',
    );

    setWebsite(
      organization?.website ??
        '',
    );

    setIndustry(
      organization?.industry ??
        '',
    );

    setDefaultPage(
      window.localStorage.getItem(
        'clientflow.defaultPage',
      ) ??
        'dashboard',
    );
  }, [
    organization,
    user,
  ]);

  async function saveProfile(
    event:
      React.FormEvent,
  ) {
    event.preventDefault();

    setSaving(
      true,
    );
    setError(
      null,
    );
    setMessage(
      null,
    );

    try {
      await request(
        '/users/me',
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              firstName:
                firstName.trim() ||
                undefined,

              lastName:
                lastName.trim() ||
                undefined,
            }),
        },
      );

      setMessage(
        'Profile saved.',
      );
    } catch (
      saveError
    ) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : 'Unable to save profile.',
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  async function saveWorkspace(
    event:
      React.FormEvent,
  ) {
    event.preventDefault();

    setSaving(
      true,
    );
    setError(
      null,
    );
    setMessage(
      null,
    );

    try {
      await request(
        '/organizations/current',
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              name:
                organizationName.trim(),

              website:
                website.trim() ||
                undefined,

              industry:
                industry.trim() ||
                undefined,
            }),
        },
      );

      setMessage(
        'Workspace settings saved.',
      );
    } catch (
      saveError
    ) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : 'Unable to save workspace settings.',
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  function savePreferences(
    event:
      React.FormEvent,
  ) {
    event.preventDefault();

    window.localStorage.setItem(
      'clientflow.defaultPage',
      defaultPage,
    );

    setError(
      null,
    );

    setMessage(
      'Preferences saved on this device.',
    );
  }

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
          Account & workspace
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
          Settings
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
          Manage your profile, workspace identity and local interface preferences.
        </p>
      </div>

      <div
        className="
          mt-6
          flex
          gap-2
          overflow-x-auto
        "
      >
        <TabButton
          active={
            tab ===
            'profile'
          }
          onClick={() =>
            setTab(
              'profile',
            )
          }
          icon={
            <UserRound
              size={14}
            />
          }
        >
          Profile
        </TabButton>

        <TabButton
          active={
            tab ===
            'workspace'
          }
          onClick={() =>
            setTab(
              'workspace',
            )
          }
          icon={
            <Building2
              size={14}
            />
          }
        >
          Workspace
        </TabButton>

        <TabButton
          active={
            tab ===
            'preferences'
          }
          onClick={() =>
            setTab(
              'preferences',
            )
          }
          icon={
            <Settings2
              size={14}
            />
          }
        >
          Preferences
        </TabButton>
      </div>

      {message && (
        <div
          className="
            mt-5
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-emerald-500/20
            bg-emerald-500/5
            px-4
            py-3
            text-[13px]
            text-emerald-700
          "
        >
          <Check
            size={15}
          />

          {message}
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
            text-red-600
          "
        >
          {error}
        </div>
      )}

      <section
        className="
          mt-5
          rounded-[16px]
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface)]
          p-5
          shadow-[var(--cf-shadow)]

          sm:p-6
        "
      >
        {tab ===
          'profile' && (
          <form
            onSubmit={
              saveProfile
            }
            className="
              max-w-[760px]
            "
          >
            <SectionHeader
              title="Profile information"
              description="Used throughout your ClientFlow workspace."
            />

            <div
              className="
                mt-6
                grid
                gap-4

                sm:grid-cols-2
              "
            >
              <Field
                label="First name"
              >
                <input
                  value={
                    firstName
                  }
                  onChange={(
                    event,
                  ) =>
                    setFirstName(
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
                label="Last name"
              >
                <input
                  value={
                    lastName
                  }
                  onChange={(
                    event,
                  ) =>
                    setLastName(
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
                label="Email"
                className="sm:col-span-2"
              >
                <input
                  value={
                    user?.email ??
                    ''
                  }
                  readOnly
                  className={`${inputClass} opacity-70`}
                />

                <p
                  className="
                    mt-2
                    text-[11px]
                    text-[var(--cf-text-muted)]
                  "
                >
                  Email changes are not enabled in this settings phase.
                </p>
              </Field>
            </div>

            <SaveButton
              saving={
                saving
              }
            />
          </form>
        )}

        {tab ===
          'workspace' && (
          <form
            onSubmit={
              saveWorkspace
            }
            className="
              max-w-[760px]
            "
          >
            <SectionHeader
              title="Workspace identity"
              description="Information associated with the current organization."
            />

            <div
              className="
                mt-6
                grid
                gap-4
              "
            >
              <Field
                label="Workspace name"
              >
                <input
                  value={
                    organizationName
                  }
                  onChange={(
                    event,
                  ) =>
                    setOrganizationName(
                      event.target
                        .value,
                    )
                  }
                  className={
                    inputClass
                  }
                  required
                />
              </Field>

              <Field
                label="Website"
              >
                <input
                  value={
                    website
                  }
                  onChange={(
                    event,
                  ) =>
                    setWebsite(
                      event.target
                        .value,
                    )
                  }
                  placeholder="https://example.com"
                  className={
                    inputClass
                  }
                />
              </Field>

              <Field
                label="Industry"
              >
                <input
                  value={
                    industry
                  }
                  onChange={(
                    event,
                  ) =>
                    setIndustry(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Software, Consulting, Agency..."
                  className={
                    inputClass
                  }
                />
              </Field>
            </div>

            <SaveButton
              saving={
                saving
              }
            />
          </form>
        )}

        {tab ===
          'preferences' && (
          <form
            onSubmit={
              savePreferences
            }
            className="
              max-w-[760px]
            "
          >
            <SectionHeader
              title="Interface preferences"
              description="These preferences are stored locally on this device for now."
            />

            <div
              className="
                mt-6
              "
            >
              <Field
                label="Default workspace page"
              >
                <select
                  value={
                    defaultPage
                  }
                  onChange={(
                    event,
                  ) =>
                    setDefaultPage(
                      event.target
                        .value,
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="dashboard">
                    Dashboard
                  </option>

                  <option value="leads">
                    Leads
                  </option>

                  <option value="pipeline">
                    Pipeline
                  </option>

                  <option value="follow-ups">
                    Follow-ups
                  </option>
                </select>
              </Field>
            </div>

            <SaveButton
              saving={
                false
              }
            />
          </form>
        )}
      </section>
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
  text-[var(--cf-text)]
  outline-none
  transition
  focus:border-[var(--cf-primary)]
`;

function SectionHeader({
  title,
  description,
}: {
  title:
    string;
  description:
    string;
}) {
  return (
    <div>
      <h2
        className="
          text-[18px]
          font-semibold
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-1
          text-[13px]
          leading-6
          text-[var(--cf-text-secondary)]
        "
      >
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  className = '',
  children,
}: {
  label:
    string;
  className?:
    string;
  children:
    React.ReactNode;
}) {
  return (
    <label
      className={
        className
      }
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
        {label}
      </span>

      {children}
    </label>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active:
    boolean;
  onClick:
    () => void;
  icon:
    React.ReactNode;
  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        inline-flex
        h-10
        items-center
        gap-2
        whitespace-nowrap
        rounded-xl
        px-3
        text-[12px]
        font-semibold
        transition

        ${
          active
            ? `
              bg-[var(--cf-primary-soft)]
              text-[var(--cf-primary)]
            `
            : `
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface)]
              text-[var(--cf-text-secondary)]
            `
        }
      `}
    >
      {icon}

      {children}
    </button>
  );
}

function SaveButton({
  saving,
}: {
  saving:
    boolean;
}) {
  return (
    <button
      type="submit"
      disabled={
        saving
      }
      className="
        mt-6
        inline-flex
        h-11
        items-center
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
      {saving ? (
        <LoaderCircle
          size={15}
          className="
            animate-spin
          "
        />
      ) : (
        <Save
          size={15}
        />
      )}

      Save changes
    </button>
  );
}
