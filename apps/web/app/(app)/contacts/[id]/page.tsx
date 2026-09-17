'use client';

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  FileText,
  Mail,
  MessageSquareText,
  Phone,
  UserRound,
} from 'lucide-react';

import Link from 'next/link';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  useParams,
} from 'next/navigation';

import {
  useAuth,
} from '@/components/providers/auth-provider';

/* =========================================================
   TYPES
========================================================= */

type ApiLeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

type ApiLeadTemperature =
  | 'HOT'
  | 'WARM'
  | 'COLD';

type ApiLeadQualification =
  | 'UNASSESSED'
  | 'STRONG_FIT'
  | 'GOOD_FIT'
  | 'WEAK_FIT'
  | 'UNQUALIFIED';

interface ApiLead {
  id: string;

  firstName: string;
  lastName?: string | null;

  email?: string | null;
  phone?: string | null;

  company?: string | null;
  jobTitle?: string | null;
  website?: string | null;

  source?: string | null;

  stage: ApiLeadStage;
  temperature?: ApiLeadTemperature | null;
  qualification?: ApiLeadQualification | null;

  valueCents?: number | null;
  currency?: string | null;

  notes?: string | null;

  lastActivityAt?: string | null;
  lastContactedAt?: string | null;
  nextFollowUpAt?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ContactDetailsResponse {
  id: string;

  firstName: string;
  lastName?: string | null;

  email?: string | null;
  phone?: string | null;

  company?: string | null;
  jobTitle?: string | null;
  website?: string | null;

  source?: string | null;

  activeOpportunityCount: number;
  opportunityCount: number;

  openValueCents: number;
  lifetimeValueCents: number;

  latestActivityAt?: string | null;

  opportunities: ApiLead[];
}

/* =========================================================
   HELPERS
========================================================= */

function fullName(
  lead:
    Pick<
      ContactDetailsResponse,
      | 'firstName'
      | 'lastName'
    >
    | ApiLead,
) {
  return [
    lead.firstName,
    lead.lastName,
  ]
    .filter(Boolean)
    .join(' ') ||
    'Unnamed contact';
}

function getInitials(
  lead:
    Pick<
      ContactDetailsResponse,
      | 'firstName'
      | 'lastName'
      | 'company'
    >
    | ApiLead,
) {
  const first =
    lead.firstName
      ?.trim()?.[0] ??
    '';

  const last =
    lead.lastName
      ?.trim()?.[0] ??
    '';

  return (
    `${first}${last}`.toUpperCase() ||
    lead.company
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

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return 'Not available';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Not available';
  }

  return date.toLocaleString(
    'en-GB',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

function stageLabel(
  stage:
    ApiLeadStage,
) {
  switch (stage) {
    case 'CONTACTED':
      return 'Contacted';

    case 'QUALIFIED':
      return 'Qualified';

    case 'PROPOSAL':
      return 'Proposal';

    case 'NEGOTIATION':
      return 'Negotiation';

    case 'WON':
      return 'Won';

    case 'LOST':
      return 'Lost';

    case 'NEW':
    default:
      return 'New';
  }
}

function isActive(
  stage:
    ApiLeadStage,
) {
  return (
    stage !== 'WON' &&
    stage !== 'LOST'
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ContactDetailsPage() {
  const params =
    useParams();

  const {
    request,
  } = useAuth();

  const id =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  const [
    contactLead,
    setContactLead,
  ] =
    useState<
      ContactDetailsResponse | null
    >(
      null,
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
    >(
      null,
    );

  const loadContact =
    useCallback(
      async () => {
        if (
          !id ||
          typeof id !==
            'string'
        ) {
          setError(
            'Contact not found.',
          );

          setLoading(
            false,
          );

          return;
        }

        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const response =
            await request<
              ContactDetailsResponse
            >(
              `/contacts/${id}`,
            );

          setContactLead(
            response,
          );
        } catch (
          loadError
        ) {
          if (
            loadError instanceof
            Error
          ) {
            setError(
              loadError.message,
            );
          } else {
            setError(
              'Unable to load this contact.',
            );
          }
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        id,
        request,
      ],
    );

  useEffect(() => {
    void loadContact();
  }, [loadContact]);

  if (loading) {
    return (
      <ContactLoading />
    );
  }

  if (
    error ||
    !contactLead
  ) {
    return (
      <ContactError
        message={
          error ||
          'Contact not found.'
        }
        onRetry={() => {
          void loadContact();
        }}
      />
    );
  }

  const relatedOpportunities =
    contactLead.opportunities;

  const activeOpportunities =
    relatedOpportunities.filter(
      (lead) =>
        isActive(
          lead.stage,
        ),
    );

  const openValue =
    contactLead.openValueCents;

  const lifetimeValue =
    contactLead.lifetimeValueCents;

  const latestActivity =
    contactLead.latestActivityAt ??
    null;

  return (
    <div
      className="
        cf-dashboard-enter
        min-w-0
        text-[var(--cf-text)]
      "
    >
      <Link
        href="/contacts"
        className="
          inline-flex
          min-h-10
          items-center
          gap-2
          rounded-xl
          px-2
          text-[14px]
          font-medium
          text-[var(--cf-text-secondary)]
          transition
          hover:bg-[var(--cf-surface-soft)]
          hover:text-[var(--cf-text)]
        "
      >
        <ArrowLeft
          size={16}
        />

        Back to contacts
      </Link>

      {/* ===================================================
          CONTACT HERO
      =================================================== */}

      <section
        className="
          mt-4
          rounded-[20px]
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface)]
          p-5
          shadow-[var(--cf-shadow)]

          sm:p-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5

            md:flex-row
            md:items-start
            md:justify-between
          "
        >
          <div
            className="
              flex
              min-w-0
              items-start
              gap-4
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[var(--cf-primary-soft)]
                text-[16px]
                font-semibold
                text-[var(--cf-primary)]

                sm:h-16
                sm:w-16
                sm:text-[17px]
              "
            >
              {getInitials(
                contactLead,
              )}
            </div>

            <div
              className="
                min-w-0
              "
            >
              <h1
                className="
                  break-words
                  text-[28px]
                  font-semibold
                  leading-tight
                  tracking-[-0.7px]

                  sm:text-[35px]
                "
              >
                {fullName(
                  contactLead,
                )}
              </h1>

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  gap-x-3
                  gap-y-1.5
                  text-[14px]
                  text-[var(--cf-text-secondary)]
                "
              >
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                  "
                >
                  <BriefcaseBusiness
                    size={14}
                  />

                  {contactLead.company ||
                    'No company'}
                </span>

                {contactLead.jobTitle && (
                  <span>
                    {
                      contactLead.jobTitle
                    }
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            {contactLead.email && (
              <a
                href={`mailto:${contactLead.email}`}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-[var(--cf-border)]
                  bg-[var(--cf-surface)]
                  px-3.5
                  text-[13px]
                  font-semibold
                  text-[var(--cf-text)]
                  transition
                  hover:bg-[var(--cf-surface-soft)]
                "
              >
                <Mail
                  size={14}
                />

                Email
              </a>
            )}

            {contactLead.phone && (
              <a
                href={`tel:${contactLead.phone}`}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[var(--cf-primary)]
                  px-3.5
                  text-[13px]
                  font-semibold
                  text-white
                  transition
                  hover:bg-[var(--cf-primary-hover)]
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
            mt-6
            grid
            grid-cols-2
            gap-2.5

            lg:grid-cols-4
          "
        >
          <Metric
            label="Active opportunities"
            value={String(
              activeOpportunities.length,
            )}
            icon={
              <BriefcaseBusiness
                size={17}
              />
            }
          />

          <Metric
            label="Open value"
            value={formatMoney(
              openValue,
            )}
            icon={
              <CircleDollarSign
                size={17}
              />
            }
          />

          <Metric
            label="Lifetime value"
            value={formatMoney(
              lifetimeValue,
            )}
            icon={
              <CircleDollarSign
                size={17}
              />
            }
          />

          <Metric
            label="Last activity"
            value={formatDate(
              latestActivity,
            )}
            icon={
              <Clock3
                size={17}
              />
            }
          />
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          mt-4
          grid
          gap-4

          xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]
        "
      >
        <div
          className="
            grid
            min-w-0
            gap-4
          "
        >
          <DetailCard
            title="Contact information"
            description="Known information about this person."
          >
            <div
              className="
                grid
                gap-3

                sm:grid-cols-2
              "
            >
              <InfoItem
                label="Email"
                value={
                  contactLead.email ||
                  'Not provided'
                }
                icon={
                  <Mail
                    size={16}
                  />
                }
                href={
                  contactLead.email
                    ? `mailto:${contactLead.email}`
                    : undefined
                }
              />

              <InfoItem
                label="Phone"
                value={
                  contactLead.phone ||
                  'Not provided'
                }
                icon={
                  <Phone
                    size={16}
                  />
                }
                href={
                  contactLead.phone
                    ? `tel:${contactLead.phone}`
                    : undefined
                }
              />

              <InfoItem
                label="Company"
                value={
                  contactLead.company ||
                  'Not provided'
                }
                icon={
                  <BriefcaseBusiness
                    size={16}
                  />
                }
              />

              <InfoItem
                label="Website"
                value={
                  contactLead.website ||
                  'Not provided'
                }
                icon={
                  <ExternalLink
                    size={16}
                  />
                }
                href={
                  contactLead.website ||
                  undefined
                }
                external={
                  Boolean(
                    contactLead.website,
                  )
                }
              />
            </div>
          </DetailCard>

          <DetailCard
            title="Related opportunities"
            description="All opportunities currently linked to this person."
          >
            <div
              className="
                grid
                gap-2.5
              "
            >
              {relatedOpportunities.length >
              0 ? (
                relatedOpportunities.map(
                  (lead) => (
                    <OpportunityRow
                      key={
                        lead.id
                      }
                      lead={
                        lead
                      }
                    />
                  ),
                )
              ) : (
                <EmptyState>
                  No related opportunities found.
                </EmptyState>
              )}
            </div>
          </DetailCard>

          <DetailCard
            title="Activity"
            description="Important dates from this contact's related opportunities."
          >
            <div
              className="
                grid
                gap-2.5
              "
            >
              {relatedOpportunities.map(
                (lead) => (
                  <ActivityRow
                    key={
                      lead.id
                    }
                    lead={
                      lead
                    }
                  />
                ),
              )}
            </div>
          </DetailCard>
        </div>

        <div
          className="
            grid
            min-w-0
            content-start
            gap-4
          "
        >
          <DetailCard
            title="Relationship"
            description="A quick view of the current relationship."
          >
            <div
              className="
                grid
                gap-3
              "
            >
              <RelationshipItem
                label="Current company"
                value={
                  contactLead.company ||
                  'Unknown'
                }
              />

              <RelationshipItem
                label="Role"
                value={
                  contactLead.jobTitle ||
                  'Not provided'
                }
              />

              <RelationshipItem
                label="First source"
                value={
                  relatedOpportunities[
                    relatedOpportunities.length -
                      1
                  ]?.source ||
                  'Unknown'
                }
              />

              <RelationshipItem
                label="Opportunities"
                value={String(
                  relatedOpportunities.length,
                )}
              />
            </div>
          </DetailCard>

          <DetailCard
            title="Messages"
            description="Communication history."
          >
            <ComingSoonBlock
              icon={
                <MessageSquareText
                  size={17}
                />
              }
              title="Messages are not connected yet"
              text="This section will show real conversations after ClientFlow's messaging integration is implemented."
            />
          </DetailCard>

          <DetailCard
            title="Proposals"
            description="Proposal history for this contact."
          >
            <ComingSoonBlock
              icon={
                <FileText
                  size={17}
                />
              }
              title="Proposal history is coming next"
              text="We will connect real proposal records here instead of displaying placeholder proposal data."
            />
          </DetailCard>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Metric({
  label,
  value,
  icon,
}: {
  label:
    string;

  value:
    string;

  icon:
    React.ReactNode;
}) {
  return (
    <div
      className="
        min-w-0
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
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          bg-[var(--cf-surface)]
          text-[var(--cf-text-secondary)]
        "
      >
        {icon}
      </div>

      <p
        className="
          mt-3
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.07em]
          text-[var(--cf-text-muted)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          truncate
          text-[14px]
          font-semibold
          text-[var(--cf-text)]
        "
      >
        {value}
      </p>
    </div>
  );
}

function DetailCard({
  title,
  description,
  children,
}: {
  title:
    string;

  description:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <section
      className="
        rounded-[18px]
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
          text-[17px]
          font-semibold
          tracking-[-0.2px]
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-1
          text-[13px]
          leading-5
          text-[var(--cf-text-muted)]
        "
      >
        {description}
      </p>

      <div
        className="
          mt-5
        "
      >
        {children}
      </div>
    </section>
  );
}

function InfoItem({
  label,
  value,
  icon,
  href,
  external = false,
}: {
  label:
    string;

  value:
    string;

  icon:
    React.ReactNode;

  href?:
    string;

  external?:
    boolean;
}) {
  const content = (
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
        {icon}
      </div>

      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.07em]
            text-[var(--cf-text-muted)]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            truncate
            text-[13px]
            font-medium
            text-[var(--cf-text)]
          "
        >
          {value}
        </p>
      </div>
    </div>
  );

  if (!href) {
    return (
      <div
        className="
          rounded-xl
          border
          border-[var(--cf-border-soft)]
          p-3
        "
      >
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target={
        external
          ? '_blank'
          : undefined
      }
      rel={
        external
          ? 'noreferrer'
          : undefined
      }
      className="
        rounded-xl
        border
        border-[var(--cf-border-soft)]
        p-3
        transition
        hover:bg-[var(--cf-surface-soft)]
      "
    >
      {content}
    </a>
  );
}

function OpportunityRow({
  lead,
}: {
  lead:
    ApiLead;
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-3
        rounded-xl
        border
        border-[var(--cf-border-soft)]
        bg-[var(--cf-surface-soft)]
        p-3.5

        sm:flex-row
        sm:items-center
        sm:justify-between
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
            className="
              text-[14px]
              font-semibold
              text-[var(--cf-text)]
            "
          >
            {lead.company ||
              fullName(
                lead,
              )}
          </span>

          <StagePill
            stage={
              lead.stage
            }
          />
        </div>

        <p
          className="
            mt-1
            text-[12px]
            text-[var(--cf-text-muted)]
          "
        >
          {lead.source ||
            'Unknown source'}{' '}
          ·{' '}
          {formatDate(
            lead.updatedAt ??
              lead.createdAt,
          )}
        </p>
      </div>

      <div
        className="
          flex
          items-center
          justify-between
          gap-3

          sm:justify-end
        "
      >
        <span
          className="
            text-[14px]
            font-semibold
            text-[var(--cf-text)]
          "
        >
          {formatMoney(
            lead.valueCents ??
              0,
          )}
        </span>

        <Link
          href={`/leads/${lead.id}`}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            bg-[var(--cf-surface)]
            text-[var(--cf-text-secondary)]
            transition
            hover:text-[var(--cf-primary)]
          "
        >
          <ArrowRight
            size={14}
          />
        </Link>
      </div>
    </div>
  );
}

function ActivityRow({
  lead,
}: {
  lead:
    ApiLead;
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        rounded-xl
        border
        border-[var(--cf-border-soft)]
        p-3.5
      "
    >
      <div
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
        <CalendarClock
          size={15}
        />
      </div>

      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            text-[13px]
            font-semibold
            text-[var(--cf-text)]
          "
        >
          {stageLabel(
            lead.stage,
          )}{' '}
          opportunity ·{' '}
          {lead.company ||
            'No company'}
        </p>

        <p
          className="
            mt-1
            text-[12px]
            text-[var(--cf-text-muted)]
          "
        >
          Last activity:{' '}
          {formatDate(
            lead.lastActivityAt ??
              lead.updatedAt,
          )}
        </p>

        {lead.nextFollowUpAt && (
          <p
            className="
              mt-1
              text-[12px]
              text-[var(--cf-primary)]
            "
          >
            Follow-up:{' '}
            {formatDate(
              lead.nextFollowUpAt,
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function RelationshipItem({
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
        flex
        items-center
        justify-between
        gap-4
        rounded-xl
        bg-[var(--cf-surface-soft)]
        px-3.5
        py-3
      "
    >
      <span
        className="
          text-[12px]
          text-[var(--cf-text-muted)]
        "
      >
        {label}
      </span>

      <span
        className="
          max-w-[60%]
          truncate
          text-right
          text-[13px]
          font-semibold
          text-[var(--cf-text)]
        "
      >
        {value}
      </span>
    </div>
  );
}

function ComingSoonBlock({
  icon,
  title,
  text,
}: {
  icon:
    React.ReactNode;

  title:
    string;

  text:
    string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-dashed
        border-[var(--cf-border)]
        bg-[var(--cf-surface-soft)]
        p-4
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          bg-[var(--cf-primary-soft)]
          text-[var(--cf-primary)]
        "
      >
        {icon}
      </div>

      <p
        className="
          mt-3
          text-[14px]
          font-semibold
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1.5
          text-[13px]
          leading-5
          text-[var(--cf-text-secondary)]
        "
      >
        {text}
      </p>
    </div>
  );
}

function StagePill({
  stage,
}: {
  stage:
    ApiLeadStage;
}) {
  const label =
    stageLabel(
      stage,
    );

  const classes =
    stage === 'WON'
      ? `
          bg-emerald-500/10
          text-emerald-600
        `
      : stage ===
          'LOST'
        ? `
            bg-red-500/10
            text-red-600
          `
        : stage ===
            'PROPOSAL'
          ? `
              bg-[var(--cf-primary-soft)]
              text-[var(--cf-primary)]
            `
          : `
              bg-[var(--cf-surface)]
              text-[var(--cf-text-secondary)]
            `;

  return (
    <span
      className={`
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold
        ${classes}
      `}
    >
      {label}
    </span>
  );
}

function EmptyState({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-dashed
        border-[var(--cf-border)]
        bg-[var(--cf-surface-soft)]
        px-4
        py-5
        text-[14px]
        text-[var(--cf-text-muted)]
      "
    >
      {children}
    </div>
  );
}

/* =========================================================
   STATES
========================================================= */

function ContactLoading() {
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
          Loading contact...
        </p>
      </div>
    </div>
  );
}

function ContactError({
  message,
  onRetry,
}: {
  message:
    string;

  onRetry:
    () => void;
}) {
  return (
    <div
      className="
        mx-auto
        flex
        min-h-[440px]
        max-w-[620px]
        flex-col
        items-center
        justify-center
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
          bg-red-500/10
          text-red-600
        "
      >
        <UserRound
          size={20}
        />
      </div>

      <h1
        className="
          mt-4
          text-[22px]
          font-semibold
        "
      >
        Unable to open contact
      </h1>

      <p
        className="
          mt-2
          text-[14px]
          leading-6
          text-[var(--cf-text-secondary)]
        "
      >
        {message}
      </p>

      <div
        className="
          mt-5
          flex
          gap-2
        "
      >
        <Link
          href="/contacts"
          className="
            inline-flex
            h-10
            items-center
            rounded-xl
            border
            border-[var(--cf-border)]
            px-4
            text-[13px]
            font-semibold
          "
        >
          Back to contacts
        </Link>

        <button
          type="button"
          onClick={onRetry}
          className="
            h-10
            rounded-xl
            bg-[var(--cf-primary)]
            px-4
            text-[13px]
            font-semibold
            text-white
          "
        >
          Try again
        </button>
      </div>
    </div>
  );
}
