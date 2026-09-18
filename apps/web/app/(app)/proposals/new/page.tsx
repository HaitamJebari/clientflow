'use client';

import {
  ArrowLeft,
  FileText,
  LoaderCircle,
  Search,
} from 'lucide-react';

import Link from 'next/link';

import {
  useRouter,
} from 'next/navigation';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useAuth,
} from '@/components/providers/auth-provider';

interface LeadOption {
  id: string;
  contactId?: string | null;

  firstName: string;
  lastName?: string | null;

  email?: string | null;
  company?: string | null;

  stage: string;

  valueCents?: number | null;
  currency?: string | null;

  updatedAt: string;
}

interface LeadOptionsResponse {
  data: LeadOption[];
}

interface CreatedProposal {
  id: string;
}

interface ProposalForm {
  leadId: string;
  title: string;
  amount: string;
  currency: string;

  summary: string;
  scope: string;
  timeline: string;
  terms: string;

  validUntil: string;
}

const initialForm:
  ProposalForm = {
    leadId: '',
    title: '',
    amount: '',
    currency: 'EUR',

    summary: '',
    scope: '',
    timeline: '',
    terms: '',

    validUntil: '',
  };

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

export default function NewProposalPage() {
  const router =
    useRouter();

  const {
    request,
  } = useAuth();

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
    search,
    setSearch,
  ] =
    useState('');

  const [
    loadingLeads,
    setLoadingLeads,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const selectedLead =
    useMemo(
      () =>
        leads.find(
          (lead) =>
            lead.id ===
            form.leadId,
        ) ??
        null,
      [
        form.leadId,
        leads,
      ],
    );

  const loadLeads =
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
              `/proposals/options/leads${
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
    void loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadLeads(
            search,
          );
        },
        300,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [
    loadLeads,
    search,
  ]);

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

        title:
          current.title ||
          `${
            lead.company ||
            leadName(lead)
          } proposal`,

        amount:
          current.amount ||
          String(
            (
              lead.valueCents ??
              0
            ) / 100,
          ),

        currency:
          lead.currency ||
          'EUR',
      }),
    );
  }

  function updateField(
    field:
      keyof ProposalForm,

    value:
      string,
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [field]:
          value,
      }),
    );
  }

  async function handleSubmit(
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
      !form.title.trim()
    ) {
      setError(
        'Proposal title is required.',
      );
      return;
    }

    const numericAmount =
      Number(
        form.amount,
      );

    if (
      Number.isNaN(
        numericAmount,
      ) ||
      numericAmount <
        0
    ) {
      setError(
        'Enter a valid proposal amount.',
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
      const proposal =
        await request<
          CreatedProposal
        >(
          '/proposals',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                leadId:
                  form.leadId,

                title:
                  form.title.trim(),

                amountCents:
                  Math.round(
                    numericAmount *
                      100,
                  ),

                currency:
                  form.currency,

                summary:
                  form.summary.trim() ||
                  undefined,

                scope:
                  form.scope.trim() ||
                  undefined,

                timeline:
                  form.timeline.trim() ||
                  undefined,

                terms:
                  form.terms.trim() ||
                  undefined,

                validUntil:
                  form.validUntil
                    ? new Date(
                        `${form.validUntil}T23:59:59`,
                      ).toISOString()
                    : undefined,
              }),
          },
        );

      router.push(
        `/proposals/${proposal.id}`,
      );
    } catch (
      submitError
    ) {
      setError(
        submitError instanceof
          Error
          ? submitError.message
          : 'Unable to create proposal.',
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

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
          gap-2
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
          Proposal builder
        </p>

        <h1
          className="
            text-[32px]
            font-semibold
            tracking-[-1px]

            sm:text-[38px]
          "
        >
          Create proposal
        </h1>

        <p
          className="
            max-w-[720px]
            text-[15px]
            leading-6
            text-[var(--cf-text-secondary)]
          "
        >
          Start from a real opportunity. ClientFlow keeps the
          offer connected to the lead, contact and pipeline.
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
            font-medium
            text-red-600
          "
        >
          {error}
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="
          mt-7
          grid
          gap-5

          xl:grid-cols-[360px_minmax(0,1fr)]
        "
      >
        <aside
          className="
            h-fit
            rounded-[16px]
            border
            border-[var(--cf-border)]
            bg-[var(--cf-surface)]
            p-4
            shadow-[var(--cf-shadow)]

            sm:p-5
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
                items-center
                justify-center
                rounded-xl
                bg-[var(--cf-primary-soft)]
                text-[var(--cf-primary)]
              "
            >
              <FileText
                size={17}
              />
            </div>

            <div>
              <h2
                className="
                  text-[17px]
                  font-semibold
                "
              >
                Opportunity
              </h2>

              <p
                className="
                  mt-0.5
                  text-[12px]
                  text-[var(--cf-text-secondary)]
                "
              >
                Choose who this offer is for.
              </p>
            </div>
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
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
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
              max-h-[420px]
              space-y-2
              overflow-y-auto
              pr-1
            "
          >
            {loadingLeads ? (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  py-6
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
                  py-6
                  text-[13px]
                  leading-5
                  text-[var(--cf-text-secondary)]
                "
              >
                No open opportunities match this search.
              </p>
            ) : (
              leads.map(
                (lead) => (
                  <button
                    key={
                      lead.id
                    }
                    type="button"
                    onClick={() =>
                      chooseLead(
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
                        lead.currency ??
                          'EUR',
                      )}
                    </p>
                  </button>
                ),
              )
            )}
          </div>
        </aside>

        <section
          className="
            rounded-[16px]
            border
            border-[var(--cf-border)]
            bg-[var(--cf-surface)]
            p-4
            shadow-[var(--cf-shadow)]

            sm:p-6
          "
        >
          <div
            className="
              grid
              gap-4

              md:grid-cols-2
            "
          >
            <Field
              label="Proposal title"
              required
              className="md:col-span-2"
            >
              <input
                value={
                  form.title
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'title',
                    event.target
                      .value,
                  )
                }
                placeholder="Website redesign proposal"
                className={inputClass}
              />
            </Field>

            <Field
              label="Amount"
              required
            >
              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.amount
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'amount',
                    event.target
                      .value,
                  )
                }
                placeholder="8500"
                className={inputClass}
              />
            </Field>

            <Field
              label="Currency"
            >
              <select
                value={
                  form.currency
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'currency',
                    event.target
                      .value,
                  )
                }
                className={inputClass}
              >
                <option value="EUR">
                  EUR
                </option>
                <option value="USD">
                  USD
                </option>
                <option value="GBP">
                  GBP
                </option>
                <option value="MAD">
                  MAD
                </option>
              </select>
            </Field>

            <Field
              label="Valid until"
              className="md:col-span-2"
            >
              <input
                type="date"
                value={
                  form.validUntil
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'validUntil',
                    event.target
                      .value,
                  )
                }
                className={inputClass}
              />
            </Field>

            <Field
              label="Executive summary"
              className="md:col-span-2"
            >
              <textarea
                value={
                  form.summary
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'summary',
                    event.target
                      .value,
                  )
                }
                rows={4}
                placeholder="Summarize the outcome, problem and proposed solution."
                className={textareaClass}
              />
            </Field>

            <Field
              label="Scope"
              className="md:col-span-2"
            >
              <textarea
                value={
                  form.scope
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'scope',
                    event.target
                      .value,
                  )
                }
                rows={6}
                placeholder="Describe deliverables, inclusions and boundaries."
                className={textareaClass}
              />
            </Field>

            <Field
              label="Timeline"
              className="md:col-span-2"
            >
              <textarea
                value={
                  form.timeline
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'timeline',
                    event.target
                      .value,
                  )
                }
                rows={4}
                placeholder="Example: Discovery 1 week, design 2 weeks, development 4 weeks."
                className={textareaClass}
              />
            </Field>

            <Field
              label="Terms"
              className="md:col-span-2"
            >
              <textarea
                value={
                  form.terms
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    'terms',
                    event.target
                      .value,
                  )
                }
                rows={4}
                placeholder="Payment schedule, revisions, dependencies or other terms."
                className={textareaClass}
              />
            </Field>
          </div>

          {selectedLead && (
            <div
              className="
                mt-6
                rounded-xl
                border
                border-[var(--cf-border)]
                bg-[var(--cf-surface-soft)]
                p-4
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
                Connected opportunity
              </p>

              <p
                className="
                  mt-2
                  text-[15px]
                  font-semibold
                "
              >
                {leadName(
                  selectedLead,
                )}
              </p>

              <p
                className="
                  mt-1
                  text-[13px]
                  text-[var(--cf-text-secondary)]
                "
              >
                {selectedLead.company ||
                  'No company'}{' '}
                ·{' '}
                {formatMoney(
                  selectedLead.valueCents,
                  selectedLead.currency ??
                    'EUR',
                )}{' '}
                ·{' '}
                {selectedLead.stage}
              </p>
            </div>
          )}

          <div
            className="
              mt-6
              flex
              flex-col-reverse
              gap-3

              sm:flex-row
              sm:items-center
              sm:justify-end
            "
          >
            <Link
              href="/proposals"
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
            </Link>

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

                disabled:cursor-not-allowed
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

              Create draft
            </button>
          </div>
        </section>
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
  required = false,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
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

        {required && (
          <span
            className="
              ml-1
              text-red-500
            "
          >
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}
