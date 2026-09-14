'use client';

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound,
} from 'lucide-react';

import Link from 'next/link';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useParams,
} from 'next/navigation';

import {
  useAuth,
} from '@/components/providers/auth-provider';

/* =========================================================
   API TYPES
========================================================= */

interface LeadApiItem {
  id: string;
  organizationId?: string;

  firstName: string;
  lastName?: string | null;

  email?: string | null;
  phone?: string | null;

  company?: string | null;
  jobTitle?: string | null;
  website?: string | null;

  source?: string | null;

  stage?:
    | 'NEW'
    | 'CONTACTED'
    | 'QUALIFIED'
    | 'PROPOSAL'
    | 'NEGOTIATION'
    | 'WON'
    | 'LOST'
    | string
    | null;

  temperature?:
    | 'HOT'
    | 'WARM'
    | 'COLD'
    | string
    | null;

  qualification?:
    | 'UNASSESSED'
    | 'STRONG_FIT'
    | 'GOOD_FIT'
    | 'WEAK_FIT'
    | 'UNQUALIFIED'
    | string
    | null;

  valueCents?: number | null;
  currency?: string | null;

  notes?: string | null;

  lastActivityAt?: string | null;
  lastContactedAt?: string | null;
  nextFollowUpAt?: string | null;

  aiSummary?: string | null;
  aiNextBestAction?: string | null;
  aiInformationConfidence?: number | null;
  aiRisks?: string[] | null;
  aiMissingInformation?: string[] | null;
  aiUpdatedAt?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

type LeadResponse =
  | LeadApiItem
  | {
      lead?: LeadApiItem;
      data?: LeadApiItem;
    };

/* =========================================================
   HELPERS
========================================================= */

function extractLead(
  payload: LeadResponse,
): LeadApiItem | null {
  if (
    'id' in payload &&
    typeof payload.id === 'string'
  ) {
    return payload;
  }

  if ('lead' in payload && payload.lead) {
    return payload.lead;
  }

  if ('data' in payload && payload.data) {
    return payload.data;
  }

  return null;
}

function formatName(
  lead: LeadApiItem,
) {
  return [
    lead.firstName,
    lead.lastName,
  ]
    .filter(Boolean)
    .join(' ');
}

function getInitials(
  lead: LeadApiItem,
) {
  const first =
    lead.firstName?.trim()?.[0] ??
    '';

  const last =
    lead.lastName?.trim()?.[0] ??
    '';

  return (
    `${first}${last}`.toUpperCase() ||
    lead.company
      ?.trim()
      .slice(0, 2)
      .toUpperCase() ||
    'LD'
  );
}

function normalizeStage(
  value?: string | null,
) {
  switch (
    value?.toUpperCase()
  ) {
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

function normalizeTemperature(
  value?: string | null,
) {
  switch (
    value?.toUpperCase()
  ) {
    case 'HOT':
      return 'Hot';

    case 'COLD':
      return 'Cold';

    case 'WARM':
    default:
      return 'Warm';
  }
}

function normalizeQualification(
  value?: string | null,
) {
  switch (
    value?.toUpperCase()
  ) {
    case 'STRONG_FIT':
      return 'Strong fit';

    case 'GOOD_FIT':
      return 'Good fit';

    case 'WEAK_FIT':
      return 'Weak fit';

    case 'UNQUALIFIED':
      return 'Unqualified';

    case 'UNASSESSED':
    default:
      return 'Unassessed';
  }
}

function formatMoney(
  valueCents?: number | null,
  currency?: string | null,
) {
  return new Intl.NumberFormat(
    'en-IE',
    {
      style: 'currency',
      currency:
        currency || 'EUR',
      maximumFractionDigits: 0,
    },
  ).format(
    (valueCents ?? 0) /
      100,
  );
}

function formatDateTime(
  value?: string | null,
) {
  if (!value) {
    return 'Not set';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Not set';
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

function getDefaultAction(
  stage: string,
) {
  switch (stage) {
    case 'New':
      return 'Qualify this lead';

    case 'Contacted':
      return 'Continue the conversation';

    case 'Qualified':
      return 'Prepare a proposal';

    case 'Proposal':
      return 'Review the follow-up timing';

    case 'Negotiation':
      return 'Prepare the negotiation';

    case 'Won':
      return 'Prepare client handoff';

    case 'Lost':
      return 'Review why the opportunity was lost';

    default:
      return 'Review this opportunity';
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function LeadDetailsPage() {
  const params =
    useParams();

  const {
    request,
  } = useAuth();

  const leadId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  const [
    lead,
    setLead,
  ] =
    useState<LeadApiItem | null>(
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
    useState<string | null>(
      null,
    );

  const loadLead =
    useCallback(
      async () => {
        if (
          !leadId ||
          typeof leadId !==
            'string'
        ) {
          setError(
            'Lead not found.',
          );

          setLoading(
            false,
          );

          return;
        }

        setLoading(true);
        setError(null);

        try {
          const response =
            await request<LeadResponse>(
              `/leads/${leadId}`,
            );

          const result =
            extractLead(
              response,
            );

          if (!result) {
            throw new Error(
              'Lead data was not returned by the API.',
            );
          }

          setLead(result);
        } catch (loadError) {
          if (
            loadError instanceof
            Error
          ) {
            setError(
              loadError.message,
            );
          } else {
            setError(
              'Unable to load this lead.',
            );
          }
        } finally {
          setLoading(false);
        }
      },
      [
        leadId,
        request,
      ],
    );

  useEffect(() => {
    void loadLead();
  }, [loadLead]);

  const display = useMemo(
    () => {
      if (!lead) {
        return null;
      }

      const stage =
        normalizeStage(
          lead.stage,
        );

      const temperature =
        normalizeTemperature(
          lead.temperature,
        );

      return {
        name:
          formatName(lead),

        initials:
          getInitials(lead),

        stage,

        temperature,

        qualification:
          normalizeQualification(
            lead.qualification,
          ),

        value:
          formatMoney(
            lead.valueCents,
            lead.currency,
          ),

        nextAction:
          lead.aiNextBestAction?.trim() ||
          getDefaultAction(
            stage,
          ),

        hasAi:
          Boolean(
            lead.aiSummary ||
              lead.aiNextBestAction ||
              lead.aiInformationConfidence !==
                null &&
                lead.aiInformationConfidence !==
                  undefined ||
              lead.aiRisks?.length ||
              lead.aiMissingInformation?.length,
          ),
      };
    },
    [lead],
  );

  if (loading) {
    return (
      <LeadDetailsLoading />
    );
  }

  if (
    error ||
    !lead ||
    !display
  ) {
    return (
      <LeadDetailsError
        message={
          error ||
          'Lead not found.'
        }
        onRetry={() => {
          void loadLead();
        }}
      />
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
          BACK
      =================================================== */}

      <Link
        href="/leads"
        className="
          inline-flex
          min-h-10
          items-center
          gap-2
          rounded-xl
          px-2
          text-[13px]
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

        Back to leads
      </Link>

      {/* ===================================================
          HERO
      =================================================== */}

      <section
        className="
          mt-4
          overflow-hidden
          rounded-[20px]
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface)]
          shadow-[var(--cf-shadow)]
        "
      >
        <div
          className="
            p-5

            sm:p-6

            lg:p-7
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
                  border
                  border-[var(--cf-border)]
                  bg-[var(--cf-primary-soft)]
                  text-[15px]
                  font-semibold
                  text-[var(--cf-primary)]

                  sm:h-16
                  sm:w-16
                  sm:text-[17px]
                "
              >
                {display.initials}
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
                  <h1
                    className="
                      break-words
                      text-[27px]
                      font-semibold
                      leading-tight
                      tracking-[-0.7px]

                      sm:text-[34px]
                    "
                  >
                    {display.name}
                  </h1>

                  <TemperatureBadge
                    temperature={
                      display.temperature
                    }
                  />
                </div>

                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    items-center
                    gap-x-3
                    gap-y-1.5
                    text-[13px]
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
                    <Building2
                      size={14}
                    />

                    {lead.company ||
                      'No company'}
                  </span>

                  {lead.jobTitle && (
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

                      {
                        lead.jobTitle
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
              <StatusBadge
                label={
                  display.stage
                }
                tone="primary"
              />

              <StatusBadge
                label={
                  display.qualification
                }
                tone="neutral"
              />
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
            <MetricCard
              label="Potential value"
              value={
                display.value
              }
              icon={
                <CircleDollarSign
                  size={17}
                />
              }
            />

            <MetricCard
              label="Stage"
              value={
                display.stage
              }
              icon={
                <MapPin
                  size={17}
                />
              }
            />

            <MetricCard
              label="Qualification"
              value={
                display.qualification
              }
              icon={
                <UserRound
                  size={17}
                />
              }
            />

            <MetricCard
              label="Source"
              value={
                lead.source ||
                'Unknown'
              }
              icon={
                <Globe2
                  size={17}
                />
              }
            />
          </div>
        </div>
      </section>

      {/* ===================================================
          MAIN CONTENT
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
          {/* CONTACT */}

          <DetailCard
            title="Contact & company"
            description="The information you currently know about this opportunity."
          >
            <div
              className="
                grid
                gap-3

                sm:grid-cols-2
              "
            >
              <ContactItem
                icon={
                  <Mail
                    size={16}
                  />
                }
                label="Email"
                value={
                  lead.email ||
                  'Not provided'
                }
                href={
                  lead.email
                    ? `mailto:${lead.email}`
                    : undefined
                }
              />

              <ContactItem
                icon={
                  <Phone
                    size={16}
                  />
                }
                label="Phone"
                value={
                  lead.phone ||
                  'Not provided'
                }
                href={
                  lead.phone
                    ? `tel:${lead.phone}`
                    : undefined
                }
              />

              <ContactItem
                icon={
                  <Globe2
                    size={16}
                  />
                }
                label="Website"
                value={
                  lead.website ||
                  'Not provided'
                }
                href={
                  lead.website ||
                  undefined
                }
                external={
                  Boolean(
                    lead.website,
                  )
                }
              />

              <ContactItem
                icon={
                  <BriefcaseBusiness
                    size={16}
                  />
                }
                label="Job title"
                value={
                  lead.jobTitle ||
                  'Not provided'
                }
              />
            </div>
          </DetailCard>

          {/* NOTES */}

          <DetailCard
            title="Opportunity notes"
            description="Project context, requirements and useful sales information."
          >
            {lead.notes?.trim() ? (
              <p
                className="
                  whitespace-pre-wrap
                  break-words
                  text-[14px]
                  leading-7
                  text-[var(--cf-text-secondary)]
                "
              >
                {lead.notes}
              </p>
            ) : (
              <EmptyText>
                No notes have been added to this lead yet.
              </EmptyText>
            )}
          </DetailCard>

          {/* ACTIVITY */}

          <DetailCard
            title="Lead timing"
            description="Key dates currently stored for this opportunity."
          >
            <div
              className="
                grid
                gap-3

                sm:grid-cols-2
              "
            >
              <DateItem
                label="Next follow-up"
                value={
                  formatDateTime(
                    lead.nextFollowUpAt,
                  )
                }
                icon={
                  <CalendarClock
                    size={16}
                  />
                }
                emphasize={
                  Boolean(
                    lead.nextFollowUpAt,
                  )
                }
              />

              <DateItem
                label="Last contacted"
                value={
                  formatDateTime(
                    lead.lastContactedAt,
                  )
                }
                icon={
                  <Phone
                    size={16}
                  />
                }
              />

              <DateItem
                label="Last activity"
                value={
                  formatDateTime(
                    lead.lastActivityAt,
                  )
                }
                icon={
                  <Clock3
                    size={16}
                  />
                }
              />

              <DateItem
                label="Created"
                value={
                  formatDateTime(
                    lead.createdAt,
                  )
                }
                icon={
                  <UserRound
                    size={16}
                  />
                }
              />
            </div>
          </DetailCard>
        </div>

        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <div
          className="
            grid
            min-w-0
            content-start
            gap-4
          "
        >
          {/* NEXT ACTION */}

          <section
            className="
              rounded-[18px]
              border
              border-[var(--cf-primary)]/20
              bg-[var(--cf-primary-soft)]
              p-5
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-[var(--cf-primary)]
              "
            >
              <Sparkles
                size={14}
              />

              Next best action
            </div>

            <h2
              className="
                mt-3
                text-[21px]
                font-semibold
                leading-snug
                tracking-[-0.35px]
                text-[var(--cf-text)]
              "
            >
              {display.nextAction}
            </h2>

            <p
              className="
                mt-3
                text-[13px]
                leading-6
                text-[var(--cf-text-secondary)]
              "
            >
              {lead.aiNextBestAction
                ? 'This recommendation comes from the lead intelligence stored by ClientFlow.'
                : 'This is a stage-based fallback. AI recommendations will replace it after lead intelligence is enabled.'}
            </p>

            {lead.nextFollowUpAt && (
              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-[var(--cf-primary)]/15
                  bg-[var(--cf-surface)]/75
                  px-3.5
                  py-3
                "
              >
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-[var(--cf-text-muted)]
                  "
                >
                  Follow-up
                </p>

                <p
                  className="
                    mt-1
                    text-[13px]
                    font-semibold
                    text-[var(--cf-text)]
                  "
                >
                  {formatDateTime(
                    lead.nextFollowUpAt,
                  )}
                </p>
              </div>
            )}
          </section>

          {/* AI INTELLIGENCE */}

          <DetailCard
            title="AI intelligence"
            description="Qualification reasoning, risks and missing information."
            accent
          >
            {display.hasAi ? (
              <div
                className="
                  grid
                  gap-4
                "
              >
                {lead.aiSummary && (
                  <div>
                    <MiniLabel>
                      Summary
                    </MiniLabel>

                    <p
                      className="
                        mt-2
                        text-[13px]
                        leading-6
                        text-[var(--cf-text-secondary)]
                      "
                    >
                      {
                        lead.aiSummary
                      }
                    </p>
                  </div>
                )}

                {lead.aiInformationConfidence !==
                  null &&
                  lead.aiInformationConfidence !==
                    undefined && (
                  <div>
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <MiniLabel>
                        Information confidence
                      </MiniLabel>

                      <span
                        className="
                          text-[12px]
                          font-semibold
                          text-[var(--cf-text)]
                        "
                      >
                        {
                          lead.aiInformationConfidence
                        }
                        %
                      </span>
                    </div>

                    <div
                      className="
                        mt-2
                        h-2
                        overflow-hidden
                        rounded-full
                        bg-[var(--cf-surface-soft)]
                      "
                    >
                      <div
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              lead.aiInformationConfidence,
                            ),
                          )}%`,
                        }}
                        className="
                          h-full
                          rounded-full
                          bg-[var(--cf-primary)]
                        "
                      />
                    </div>
                  </div>
                )}

                {Boolean(
                  lead.aiRisks
                    ?.length,
                ) && (
                  <InsightList
                    title="Risks"
                    items={
                      lead.aiRisks ||
                      []
                    }
                  />
                )}

                {Boolean(
                  lead.aiMissingInformation
                    ?.length,
                ) && (
                  <InsightList
                    title="Missing information"
                    items={
                      lead.aiMissingInformation ||
                      []
                    }
                  />
                )}
              </div>
            ) : (
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
                  <Sparkles
                    size={16}
                  />
                </div>

                <p
                  className="
                    mt-3
                    text-[13px]
                    font-semibold
                    text-[var(--cf-text)]
                  "
                >
                  AI analysis has not been generated yet
                </p>

                <p
                  className="
                    mt-1.5
                    text-[12px]
                    leading-5
                    text-[var(--cf-text-secondary)]
                  "
                >
                  ClientFlow will eventually use the lead context to surface a summary, risks, missing information and a recommended next action.
                </p>
              </div>
            )}
          </DetailCard>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
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
          tracking-[0.08em]
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
  accent = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className={`
        rounded-[18px]
        border
        bg-[var(--cf-surface)]
        p-5
        shadow-[var(--cf-shadow)]

        sm:p-6

        ${
          accent
            ? 'border-[var(--cf-primary)]/15'
            : 'border-[var(--cf-border)]'
        }
      `}
    >
      <div>
        <h2
          className="
            text-[17px]
            font-semibold
            tracking-[-0.2px]
            text-[var(--cf-text)]
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-1
            text-[12px]
            leading-5
            text-[var(--cf-text-muted)]
          "
        >
          {description}
        </p>
      </div>

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

function ContactItem({
  icon,
  label,
  value,
  href,
  external = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
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
          flex-1
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

      {href && (
        <ExternalLink
          size={13}
          className="
            shrink-0
            text-[var(--cf-text-muted)]
          "
        />
      )}
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
        hover:border-[var(--cf-primary)]/25
        hover:bg-[var(--cf-surface-soft)]
      "
    >
      {content}
    </a>
  );
}

function DateItem({
  icon,
  label,
  value,
  emphasize = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        p-3.5

        ${
          emphasize
            ? `
                border-[var(--cf-primary)]/20
                bg-[var(--cf-primary-soft)]
              `
            : `
                border-[var(--cf-border-soft)]
                bg-[var(--cf-surface-soft)]
              `
        }
      `}
    >
      <div
        className="
          flex
          items-center
          gap-2
          text-[var(--cf-text-secondary)]
        "
      >
        {icon}

        <span
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.07em]
          "
        >
          {label}
        </span>
      </div>

      <p
        className="
          mt-2
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

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone:
    | 'primary'
    | 'neutral';
}) {
  return (
    <span
      className={`
        inline-flex
        min-h-9
        items-center
        rounded-full
        px-3
        text-[11px]
        font-semibold

        ${
          tone ===
          'primary'
            ? `
                bg-[var(--cf-primary-soft)]
                text-[var(--cf-primary)]
              `
            : `
                bg-[var(--cf-surface-soft)]
                text-[var(--cf-text-secondary)]
              `
        }
      `}
    >
      {label}
    </span>
  );
}

function TemperatureBadge({
  temperature,
}: {
  temperature: string;
}) {
  const className =
    temperature === 'Hot'
      ? `
          bg-red-500/10
          text-red-600
        `
      : temperature ===
          'Cold'
        ? `
            bg-sky-500/10
            text-sky-600
          `
        : `
            bg-amber-500/10
            text-amber-600
          `;

  return (
    <span
      className={`
        inline-flex
        h-7
        items-center
        gap-1.5
        rounded-full
        px-2.5
        text-[10px]
        font-semibold
        ${className}
      `}
    >
      <span
        className="
          h-1.5
          w-1.5
          rounded-full
          bg-current
        "
      />

      {temperature}
    </span>
  );
}

function MiniLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p
      className="
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.08em]
        text-[var(--cf-text-muted)]
      "
    >
      {children}
    </p>
  );
}

function InsightList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <MiniLabel>
        {title}
      </MiniLabel>

      <div
        className="
          mt-2
          grid
          gap-2
        "
      >
        {items.map(
          (
            item,
            index,
          ) => (
            <div
              key={`${item}-${index}`}
              className="
                rounded-lg
                border
                border-[var(--cf-border-soft)]
                bg-[var(--cf-surface-soft)]
                px-3
                py-2.5
                text-[12px]
                leading-5
                text-[var(--cf-text-secondary)]
              "
            >
              {item}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function EmptyText({
  children,
}: {
  children: React.ReactNode;
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
        text-[13px]
        leading-6
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

function LeadDetailsLoading() {
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
            text-[13px]
            text-[var(--cf-text-secondary)]
          "
        >
          Loading lead...
        </p>
      </div>
    </div>
  );
}

function LeadDetailsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="
        mx-auto
        flex
        min-h-[420px]
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
          text-[var(--cf-text)]
        "
      >
        Unable to open this lead
      </h1>

      <p
        className="
          mt-2
          max-w-[460px]
          text-[13px]
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
          flex-wrap
          justify-center
          gap-2
        "
      >
        <Link
          href="/leads"
          className="
            inline-flex
            h-11
            items-center
            justify-center
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
          Back to leads
        </Link>

        <button
          type="button"
          onClick={onRetry}
          className="
            inline-flex
            h-11
            items-center
            justify-center
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
          Try again
        </button>
      </div>
    </div>
  );
}
