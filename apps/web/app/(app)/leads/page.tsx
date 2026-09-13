'use client';

import {
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/components/providers/auth-provider';
import {
  LeadsTable,
} from '@/components/leads/leads-table';
import type {
  Lead,
} from '@/components/leads/leads-table';
import {
  LeadMobileCard,
} from '@/components/leads/lead-mobile-card';
import {
  LeadsToolbar,
} from '@/components/leads/leads-toolbar';
import type {
  LeadFilter,
  LeadSort,
} from '@/components/leads/leads-toolbar';
import { ApiError } from '@/lib/api';

/* =========================================================
   API TYPES
========================================================= */

interface LeadApiItem {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  website?: string | null;
  valueCents?: number | null;
  stage?: string | null;
  temperature?: string | null;
  qualification?: string | null;
  source?: string | null;
  notes?: string | null;
  nextFollowUpAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface LeadsListResponse {
  leads?: LeadApiItem[];
  data?: LeadApiItem[];
}

type CreateLeadResponse =
  | LeadApiItem
  | {
      lead?: LeadApiItem;
      data?: LeadApiItem;
    };

type TemperatureValue =
  | 'Hot'
  | 'Warm';

interface CreateLeadFormState {
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  email: string;
  phone: string;
  website: string;
  source: string;
  estimatedValue: string;
  temperature: TemperatureValue;
  nextFollowUp: string;
  notes: string;
}

/* =========================================================
   HELPERS
========================================================= */

const initialCreateLeadForm: CreateLeadFormState =
  {
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    email: '',
    phone: '',
    website: '',
    source: 'Website',
    estimatedValue: '',
    temperature: 'Warm',
    nextFollowUp: '',
    notes: '',
  };

function formatCurrency(
  amount: number,
) {
  return new Intl.NumberFormat(
    'en-IE',
    {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    },
  ).format(amount);
}

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  company?: string | null,
) {
  const first =
    firstName?.trim()?.[0] ?? '';
  const last =
    lastName?.trim()?.[0] ?? '';

  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }

  const companyWords =
    company?.trim().split(/\s+/) ?? [];

  return companyWords
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase() || 'LD';
}

function normalizeTemperature(
  value?: string | null,
): 'Hot' | 'Warm' {
  if (
    value?.toUpperCase() === 'HOT'
  ) {
    return 'Hot';
  }

  return 'Warm';
}

function normalizeQualification(
  value?: string | null,
) {
  switch (
    value?.toUpperCase()
  ) {
    case 'STRONG_FIT':
    case 'STRONG FIT':
      return 'Strong fit';

    case 'GOOD_FIT':
    case 'GOOD FIT':
      return 'Good fit';

    case 'NEEDS_DISCOVERY':
    case 'NEEDS DISCOVERY':
      return 'Needs discovery';

    case 'UNASSESSED':
    default:
      return 'Unassessed';
  }
}

function normalizeStage(
  value?: string | null,
) {
  switch (
    value?.toUpperCase()
  ) {
    case 'NEW':
      return 'New';
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
    default:
      return 'New';
  }
}

function mapLeadToUi(
  lead: LeadApiItem,
): Lead {
  const firstName =
    lead.firstName?.trim() || '';
  const lastName =
    lead.lastName?.trim() || '';
  const value =
    Math.round(
      (lead.valueCents ?? 0) / 100,
    ) || 0;
  const stage =
    normalizeStage(lead.stage);
  const temperature =
    normalizeTemperature(
      lead.temperature,
    );

  return {
    id: lead.id,
    firstName,
    lastName,
    email: lead.email ?? '',
    company:
      lead.company ?? 'Unknown company',
    initials: getInitials(
      firstName,
      lastName,
      lead.company,
    ),
    value,
    stage,
    temperature,
    qualification:
      normalizeQualification(
        lead.qualification,
      ),
    source:
      lead.source ?? 'Website',
    lastActivity: 'Just now',
    signal:
      lead.nextFollowUpAt
        ? 'Follow-up scheduled'
        : 'Newly created lead',
    insight:
      lead.notes?.trim() ||
      'Lead created and ready for qualification.',
    actionLabel:
      stage === 'New'
        ? 'Qualify lead'
        : stage === 'Qualified'
          ? 'Create proposal'
          : 'Review lead',
    actionHint:
      lead.notes?.trim() ||
      'Start qualification and add more context.',
    needsAttention:
      temperature === 'Hot',
    priority:
      temperature === 'Hot'
        ? 90
        : 70,
  };
}

function extractLeads(
  payload: LeadsListResponse | LeadApiItem[],
): LeadApiItem[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.leads)) {
    return payload.leads;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

function extractCreatedLead(
  payload: CreateLeadResponse,
): LeadApiItem | null {
  /*
   * The NestJS LeadsService currently returns the
   * Prisma-created lead directly:
   *
   * {
   *   id: '...',
   *   firstName: '...',
   *   ...
   * }
   *
   * Keep support for wrapped responses too so this
   * frontend does not break if the API response is
   * later standardized as { lead } or { data }.
   */
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

/* =========================================================
   PAGE
========================================================= */

export default function LeadsPage() {
  const { request } = useAuth();

  const [
    leads,
    setLeads,
  ] = useState<Lead[]>([]);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    filter,
    setFilter,
  ] =
    useState<LeadFilter>(
      'all',
    );

  const [
    sort,
    setSort,
  ] =
    useState<LeadSort>(
      'priority',
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    pageError,
    setPageError,
  ] = useState<string | null>(
    null,
  );

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false);

  const [
    isSubmittingCreate,
    setIsSubmittingCreate,
  ] = useState(false);

  const [
    createError,
    setCreateError,
  ] = useState<string | null>(
    null,
  );

  const [
    createForm,
    setCreateForm,
  ] = useState<CreateLeadFormState>(
    initialCreateLeadForm,
  );

  const [
    createSuccessMessage,
    setCreateSuccessMessage,
  ] = useState<string | null>(
    null,
  );

  const openCreateModal =
    useCallback(() => {
      setCreateError(null);
      setCreateSuccessMessage(
        null,
      );
      setCreateForm(
        initialCreateLeadForm,
      );
      setIsCreateModalOpen(true);
    }, []);

  const closeCreateModal =
    useCallback(() => {
      if (isSubmittingCreate) {
        return;
      }

      setIsCreateModalOpen(false);
      setCreateError(null);
    }, [isSubmittingCreate]);

  useEffect(() => {
    const originalOverflow =
      document.body.style.overflow;

    if (isCreateModalOpen) {
      document.body.style.overflow =
        'hidden';
    }

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [isCreateModalOpen]);

  useEffect(() => {
    if (!isCreateModalOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === 'Escape' &&
        !isSubmittingCreate
      ) {
        closeCreateModal();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    closeCreateModal,
    isCreateModalOpen,
    isSubmittingCreate,
  ]);

  const loadLeads =
    useCallback(async () => {
      setIsLoading(true);
      setPageError(null);

      try {
        const response =
          await request<
            LeadsListResponse | LeadApiItem[]
          >('/leads');

        const items =
          extractLeads(response);

        setLeads(
          items.map(mapLeadToUi),
        );
      } catch (error) {
        if (
          error instanceof Error
        ) {
          setPageError(
            error.message,
          );
        } else {
          setPageError(
            'Failed to load leads.',
          );
        }
      } finally {
        setIsLoading(false);
      }
    }, [request]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    if (!createSuccessMessage) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        setCreateSuccessMessage(
          null,
        );
      }, 3500);

    return () =>
      window.clearTimeout(timeout);
  }, [createSuccessMessage]);

  const filteredLeads =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      let result =
        leads.filter((lead) => {
          const matchesSearch =
            !normalizedSearch ||
            [
              lead.firstName,
              lead.lastName,
              lead.email,
              lead.company,
              lead.source,
              lead.stage,
              lead.qualification,
            ].some((value) =>
              value
                ?.toLowerCase()
                .includes(
                  normalizedSearch,
                ),
            );

          let matchesFilter =
            true;

          if (
            filter === 'hot'
          ) {
            matchesFilter =
              lead.temperature ===
              'Hot';
          }

          if (
            filter === 'warm'
          ) {
            matchesFilter =
              lead.temperature ===
              'Warm';
          }

          if (
            filter ===
            'attention'
          ) {
            matchesFilter =
              lead.needsAttention;
          }

          return (
            matchesSearch &&
            matchesFilter
          );
        });

      result = [...result];

      switch (sort) {
        case 'value-high':
          result.sort(
            (a, b) =>
              b.value - a.value,
          );
          break;

        case 'value-low':
          result.sort(
            (a, b) =>
              a.value - b.value,
          );
          break;

        case 'company':
          result.sort(
            (a, b) =>
              a.company.localeCompare(
                b.company,
              ),
          );
          break;

        case 'priority':
        default:
          result.sort(
            (a, b) =>
              b.priority -
              a.priority,
          );
          break;
      }

      return result;
    }, [
      leads,
      search,
      filter,
      sort,
    ]);

  const totalValue =
    leads.reduce(
      (total, lead) =>
        total + lead.value,
      0,
    );

  const attentionCount =
    leads.filter(
      (lead) =>
        lead.needsAttention,
    ).length;

  const handleCreateFieldChange =
    <
      K extends keyof CreateLeadFormState,
    >(
      key: K,
      value: CreateLeadFormState[K],
    ) => {
      setCreateForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const handleCreateLead =
    async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setCreateError(null);
      setCreateSuccessMessage(
        null,
      );

      if (
        !createForm.firstName.trim()
      ) {
        setCreateError(
          'First name is required.',
        );
        return;
      }

      if (
        !createForm.company.trim()
      ) {
        setCreateError(
          'Company is required.',
        );
        return;
      }

      if (
        !createForm.email.trim()
      ) {
        setCreateError(
          'Email is required.',
        );
        return;
      }

      const estimatedValueNumber =
        Number(
          createForm.estimatedValue ||
            '0',
        );

      if (
        Number.isNaN(
          estimatedValueNumber,
        ) ||
        estimatedValueNumber < 0
      ) {
        setCreateError(
          'Estimated value must be a valid number.',
        );
        return;
      }

      setIsSubmittingCreate(
        true,
      );

      try {
        const response =
          await request<CreateLeadResponse>(
            '/leads',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                firstName:
                  createForm.firstName.trim(),
                lastName:
                  createForm.lastName.trim() ||
                  undefined,
                company:
                  createForm.company.trim(),
                jobTitle:
                  createForm.jobTitle.trim() ||
                  undefined,
                email:
                  createForm.email.trim(),
                phone:
                  createForm.phone.trim() ||
                  undefined,
                website:
                  createForm.website.trim() ||
                  undefined,
                source:
                  createForm.source,
                temperature:
                  createForm.temperature.toUpperCase(),
                stage: 'NEW',
                qualification:
                  'UNASSESSED',
                valueCents:
                  Math.round(
                    estimatedValueNumber *
                      100,
                  ),
                nextFollowUpAt:
                  createForm.nextFollowUp ||
                  undefined,
                notes:
                  createForm.notes.trim() ||
                  undefined,
              }),
            },
          );

        const createdLeadApi =
          extractCreatedLead(
            response,
          );

        if (createdLeadApi) {
          const createdLeadUi =
            mapLeadToUi(
              createdLeadApi,
            );

          setLeads((prev) => [
            createdLeadUi,
            ...prev,
          ]);
        } else {
          /*
           * The request completed successfully, so do not
           * report a false creation failure just because a
           * future API version changes the response shape.
           */
          await loadLeads();
        }

        setCreateSuccessMessage(
          'Lead created successfully.',
        );

        setIsCreateModalOpen(
          false,
        );
        setCreateForm(
          initialCreateLeadForm,
        );
      } catch (error) {
        if (
          error instanceof
          ApiError
        ) {
          setCreateError(
            error.message ||
              'Failed to create lead.',
          );
        } else if (
          error instanceof Error
        ) {
          setCreateError(
            error.message,
          );
        } else {
          setCreateError(
            'Failed to create lead.',
          );
        }
      } finally {
        setIsSubmittingCreate(
          false,
        );
      }
    };

  return (
    <>
      <div
        className="
          cf-dashboard-enter
          text-[var(--cf-text)]
        "
      >
        {/* PAGE HEADER */}
        <div
          className="
            flex
            flex-col
            gap-5

            xl:flex-row
            xl:items-start
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
                text-[12px]
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
              Sales workspace
            </div>

            <h1
              className="
                text-[30px]
                font-semibold
                leading-[1.1]
                tracking-[-1px]
                text-[var(--cf-text)]
                sm:text-[38px]
                lg:text-[44px]
                lg:tracking-[-1.4px]
              "
            >
              Leads
            </h1>

            <p
              className="
                mt-3
                max-w-[720px]
                text-[15px]
                leading-7
                text-[var(--cf-text-secondary)]
              "
            >
              Prioritize the leads
              most likely to move
              forward and know
              exactly what action
              to take next.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2

              xl:justify-end
            "
          >
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
                    size={14}
                  />
                }
                label={`${leads.length} active leads`}
              />

              <SummaryChip
                icon={
                  <Sparkles
                    size={14}
                  />
                }
                label={`${attentionCount} need attention`}
                primary
              />

              <SummaryChip
                label={`${formatCurrency(totalValue)} potential`}
              />
            </div>
          </div>
        </div>

        {createSuccessMessage && (
          <div
            className="
              mt-5
              rounded-xl
              border
              border-[var(--cf-success)]/25
              bg-[var(--cf-success)]/10
              px-4
              py-3
              text-[14px]
              font-medium
              text-[var(--cf-success)]
            "
          >
            {createSuccessMessage}
          </div>
        )}

        {/* TOOLBAR */}
        <div className="mt-8">
          <LeadsToolbar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            sort={sort}
            onSortChange={setSort}
            resultCount={filteredLeads.length}
            onAddLead={openCreateModal}
          />
        </div>

        {/* CONTENT */}
        <div className="mt-4">
          {isLoading ? (
            <div
              className="
                rounded-[16px]
                border
                border-[var(--cf-border)]
                bg-[var(--cf-surface)]
                px-6
                py-14
                text-center
                text-[15px]
                text-[var(--cf-text-secondary)]
              "
            >
              Loading leads...
            </div>
          ) : pageError ? (
            <div
              className="
                rounded-[16px]
                border
                border-[var(--cf-danger)]/20
                bg-[var(--cf-danger)]/5
                px-6
                py-10
                text-center
              "
            >
              <p
                className="
                  text-[15px]
                  font-medium
                  text-[var(--cf-text)]
                "
              >
                Failed to load
                leads
              </p>

              <p
                className="
                  mt-2
                  text-[14px]
                  text-[var(--cf-text-secondary)]
                "
              >
                {pageError}
              </p>

              <button
                type="button"
                onClick={() => {
                  void loadLeads();
                }}
                className="
                  mt-5
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  rounded-lg
                  bg-[var(--cf-primary)]
                  px-4
                  text-[14px]
                  font-semibold
                  text-white
                  transition
                  hover:bg-[var(--cf-primary-hover)]
                "
              >
                Try again
              </button>
            </div>
          ) : filteredLeads.length >
            0 ? (
            <>
              <div
                className="
                  hidden
                  lg:block
                "
              >
                <LeadsTable
                  leads={
                    filteredLeads
                  }
                />
              </div>

              <div
                className="
                  grid
                  gap-3
                  lg:hidden
                "
              >
                {filteredLeads.map(
                  (lead) => (
                    <LeadMobileCard
                      key={
                        lead.id
                      }
                      lead={lead}
                    />
                  ),
                )}
              </div>
            </>
          ) : (
            <EmptyLeadsState
              search={search}
              onClear={() => {
                setSearch('');
                setFilter(
                  'all',
                );
              }}
            />
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <CreateLeadModal
          form={createForm}
          isSubmitting={
            isSubmittingCreate
          }
          error={createError}
          onChange={
            handleCreateFieldChange
          }
          onClose={
            closeCreateModal
          }
          onSubmit={
            handleCreateLead
          }
        />
      )}
    </>
  );
}

/* =========================================================
   SUMMARY CHIP
========================================================= */

function SummaryChip({
  icon,
  label,
  primary,
}: {
  icon?: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`
        flex
        h-11
        items-center
        gap-2
        rounded-xl
        border
        px-3.5
        text-[13px]
        font-medium
        ${
          primary
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
   EMPTY STATE
========================================================= */

function EmptyLeadsState({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div
      className="
        flex
        min-h-[360px]
        flex-col
        items-center
        justify-center
        rounded-[16px]
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
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-[var(--cf-primary-soft)]
          text-[var(--cf-primary)]
        "
      >
        <UsersRound
          size={22}
        />
      </div>

      <h2
        className="
          mt-5
          text-[30px]
          font-semibold
          tracking-[-0.7px]
          text-[var(--cf-text)]
        "
      >
        No leads found
      </h2>

      <p
        className="
          mt-3
          max-w-[440px]
          text-[15px]
          leading-7
          text-[var(--cf-text-secondary)]
        "
      >
        {search
          ? `No leads match “${search}”. Try another search or clear your filters.`
          : 'There are no leads matching the current filter.'}
      </p>

      <button
        type="button"
        onClick={onClear}
        className="
          mt-6
          inline-flex
          h-11
          items-center
          justify-center
          rounded-lg
          bg-[var(--cf-primary)]
          px-5
          text-[14px]
          font-semibold
          text-white
          transition
          hover:bg-[var(--cf-primary-hover)]
        "
      >
        Clear filters
      </button>
    </div>
  );
}

/* =========================================================
   CREATE LEAD MODAL
========================================================= */

function CreateLeadModal({
  form,
  isSubmitting,
  error,
  onChange,
  onClose,
  onSubmit,
}: {
  form: CreateLeadFormState;
  isSubmitting: boolean;
  error: string | null;
  onChange: <
    K extends keyof CreateLeadFormState,
  >(
    key: K,
    value: CreateLeadFormState[K],
  ) => void;
  onClose: () => void;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => Promise<void>;
}) {
  return (
    <div
      onClick={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-center
        justify-center
        bg-[rgba(10,15,30,0.58)]
        px-4
        py-6
        backdrop-blur-[8px]
      "
    >
      <div
        className="
          relative
          flex
          max-h-[90vh]
          w-full
          max-w-[920px]
          flex-col
          overflow-hidden
          rounded-[24px]
          border
          border-white/10
          bg-[var(--cf-surface)]
          shadow-[0_30px_80px_rgba(15,23,42,.35)]
        "
      >
        {/* Header */}
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-[var(--cf-border-soft)]
            px-5
            py-5

            sm:px-6
          "
        >
          <div>
            <div
              className="
                mb-2
                text-[12px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[var(--cf-text-secondary)]
              "
            >
              New lead
            </div>

            <h2
              className="
                text-[24px]
                font-semibold
                tracking-[-0.5px]
                text-[var(--cf-text)]
                sm:text-[28px]
              "
            >
              Add lead
            </h2>

            <p
              className="
                mt-2
                max-w-[620px]
                text-[14px]
                leading-6
                text-[var(--cf-text-secondary)]
                sm:text-[15px]
              "
            >
              Start with what you
              know. You can add
              more context as the
              opportunity develops.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface-soft)]
              text-[var(--cf-text-secondary)]
              transition
              hover:bg-[var(--cf-surface-hover)]
              hover:text-[var(--cf-text)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={onSubmit}
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              px-5
              py-5

              sm:px-6
            "
          >
            {error && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-[var(--cf-danger)]/20
                  bg-[var(--cf-danger)]/5
                  px-4
                  py-3
                  text-[14px]
                  text-[var(--cf-danger)]
                "
              >
                {error}
              </div>
            )}

            <div
              className="
                grid
                gap-4
                md:grid-cols-2
              "
            >
              <Field>
                <Label>
                  First name *
                </Label>
                <Input
                  value={
                    form.firstName
                  }
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'firstName',
                      event.target
                        .value,
                    )
                  }
                  placeholder="Sarah"
                />
              </Field>

              <Field>
                <Label>
                  Last name
                </Label>
                <Input
                  value={
                    form.lastName
                  }
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'lastName',
                      event.target
                        .value,
                    )
                  }
                  placeholder="Miller"
                />
              </Field>

              <Field>
                <Label>
                  Company *
                </Label>
                <Input
                  value={
                    form.company
                  }
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'company',
                      event.target
                        .value,
                    )
                  }
                  placeholder="Acme Studio"
                />
              </Field>

              <Field>
                <Label>
                  Job title
                </Label>
                <Input
                  value={
                    form.jobTitle
                  }
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'jobTitle',
                      event.target
                        .value,
                    )
                  }
                  placeholder="Founder"
                />
              </Field>

              <Field>
                <Label>
                  Email *
                </Label>
                <Input
                  type="email"
                  value={
                    form.email
                  }
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'email',
                      event.target
                        .value,
                    )
                  }
                  placeholder="sarah@acme.com"
                />
              </Field>

              <Field>
                <Label>
                  Phone
                </Label>
                <Input
                  value={form.phone}
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'phone',
                      event.target
                        .value,
                    )
                  }
                  placeholder="+1 555 123 4567"
                />
              </Field>

              <Field>
                <Label>
                  Website
                </Label>
                <Input
                  value={
                    form.website
                  }
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'website',
                      event.target
                        .value,
                    )
                  }
                  placeholder="https://acme.com"
                />
              </Field>

              <Field>
                <Label>
                  Source
                </Label>
                <Select
                  value={
                    form.source
                  }
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'source',
                      event.target
                        .value,
                    )
                  }
                >
                  <option value="Website">
                    Website
                  </option>
                  <option value="Referral">
                    Referral
                  </option>
                  <option value="LinkedIn">
                    LinkedIn
                  </option>
                  <option value="Outbound">
                    Outbound
                  </option>
                </Select>
              </Field>

              <Field>
                <Label>
                  Estimated value
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    form.estimatedValue
                  }
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'estimatedValue',
                      event.target
                        .value,
                    )
                  }
                  placeholder="8500"
                />
              </Field>

              <Field>
                <Label>
                  Temperature
                </Label>
                <Select
                  value={
                    form.temperature
                  }
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'temperature',
                      event.target
                        .value as TemperatureValue,
                    )
                  }
                >
                  <option value="Warm">
                    Warm
                  </option>
                  <option value="Hot">
                    Hot
                  </option>
                </Select>
              </Field>

              <Field className="md:col-span-2">
                <Label>
                  Next follow-up
                </Label>
                <Input
                  type="datetime-local"
                  value={
                    form.nextFollowUp
                  }
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'nextFollowUp',
                      event.target
                        .value,
                    )
                  }
                />
              </Field>

              <Field className="md:col-span-2">
                <Label>
                  Notes
                </Label>
                <Textarea
                  value={form.notes}
                  onChange={(
                    event,
                  ) =>
                    onChange(
                      'notes',
                      event.target
                        .value,
                    )
                  }
                  placeholder="Project scope, budget context, timing, pain points..."
                />
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-[var(--cf-border-soft)]
              px-5
              py-4

              sm:flex-row
              sm:justify-end
              sm:px-6
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-[var(--cf-border)]
                bg-[var(--cf-surface)]
                px-5
                text-[14px]
                font-semibold
                text-[var(--cf-text)]
                transition
                hover:bg-[var(--cf-surface-soft)]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                bg-[var(--cf-primary)]
                px-5
                text-[14px]
                font-semibold
                text-white
                shadow-[0_8px_18px_rgba(91,91,247,.22)]
                transition
                hover:bg-[var(--cf-primary-hover)]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isSubmitting
                ? 'Creating...'
                : 'Create lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   SHARED FORM UI
========================================================= */

function Field({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-2 ${className}`}
    >
      {children}
    </div>
  );
}

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label
      className="
        text-[13px]
        font-semibold
        text-[var(--cf-text)]
      "
    >
      {children}
    </label>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={`
        h-12
        w-full
        rounded-xl
        border
        border-[var(--cf-border)]
        bg-[var(--cf-surface-soft)]
        px-4
        text-[15px]
        text-[var(--cf-text)]
        outline-none
        transition
        placeholder:text-[var(--cf-text-muted)]
        hover:border-[var(--cf-primary)]/30
        focus:border-[var(--cf-primary)]
        focus:bg-[var(--cf-surface)]
        focus:ring-4
        focus:ring-[var(--cf-primary-soft)]
        ${props.className ?? ''}
      `}
    />
  );
}

function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={`
        h-12
        w-full
        rounded-xl
        border
        border-[var(--cf-border)]
        bg-[var(--cf-surface-soft)]
        px-4
        text-[15px]
        text-[var(--cf-text)]
        outline-none
        transition
        hover:border-[var(--cf-primary)]/30
        focus:border-[var(--cf-primary)]
        focus:bg-[var(--cf-surface)]
        focus:ring-4
        focus:ring-[var(--cf-primary-soft)]
        ${props.className ?? ''}
      `}
    />
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      rows={5}
      className={`
        w-full
        rounded-xl
        border
        border-[var(--cf-border)]
        bg-[var(--cf-surface-soft)]
        px-4
        py-3
        text-[15px]
        text-[var(--cf-text)]
        outline-none
        transition
        placeholder:text-[var(--cf-text-muted)]
        hover:border-[var(--cf-primary)]/30
        focus:border-[var(--cf-primary)]
        focus:bg-[var(--cf-surface)]
        focus:ring-4
        focus:ring-[var(--cf-primary-soft)]
        ${props.className ?? ''}
      `}
    />
  );
}