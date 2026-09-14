'use client';

import {
  AlertTriangle,
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

import {
  LeadMobileCard,
} from '@/components/leads/lead-mobile-card';

import {
  LeadsTable,
} from '@/components/leads/leads-table';

import type {
  Lead,
} from '@/components/leads/leads-table';

import {
  LeadsToolbar,
} from '@/components/leads/leads-toolbar';

import type {
  LeadFilter,
  LeadSort,
} from '@/components/leads/leads-toolbar';

import {
  useAuth,
} from '@/components/providers/auth-provider';

import {
  ApiError,
} from '@/lib/api';

/* =========================================================
   API TYPES
========================================================= */

interface LeadApiItem {
  id: string;

  firstName?: string | null;
  lastName?: string | null;

  email?: string | null;
  phone?: string | null;

  company?: string | null;
  jobTitle?: string | null;
  website?: string | null;

  source?: string | null;

  stage?: string | null;
  temperature?: string | null;
  qualification?: string | null;

  valueCents?: number | null;
  currency?: string | null;

  notes?: string | null;

  lastActivityAt?: string | null;
  lastContactedAt?: string | null;
  nextFollowUpAt?: string | null;

  aiSummary?: string | null;
  aiNextBestAction?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

interface LeadsListResponse {
  leads?: LeadApiItem[];
  data?: LeadApiItem[];
}

type LeadMutationResponse =
  | LeadApiItem
  | {
      lead?: LeadApiItem;
      data?: LeadApiItem;
    };

type TemperatureValue =
  | 'Hot'
  | 'Warm'
  | 'Cold';

type StageValue =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

interface LeadFormState {
  firstName: string;
  lastName: string;

  company: string;
  jobTitle: string;

  email: string;
  phone: string;

  website: string;
  source: string;

  estimatedValue: string;

  temperature:
    TemperatureValue;

  stage: StageValue;

  nextFollowUp: string;

  notes: string;
}

/* =========================================================
   FORM DEFAULTS
========================================================= */

const initialLeadForm: LeadFormState =
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

    stage: 'New',

    nextFollowUp: '',

    notes: '',
  };

/* =========================================================
   HELPERS
========================================================= */

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
    company
      ?.trim()
      .split(/\s+/) ?? [];

  return (
    companyWords
      .slice(0, 2)
      .map(
        (word) =>
          word[0] ?? '',
      )
      .join('')
      .toUpperCase() ||
    'LD'
  );
}

function normalizeTemperature(
  value?: string | null,
): TemperatureValue {
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
    case 'STRONG FIT':
      return 'Strong fit';

    case 'GOOD_FIT':
    case 'GOOD FIT':
      return 'Good fit';

    case 'WEAK_FIT':
    case 'WEAK FIT':
      return 'Weak fit';

    case 'UNQUALIFIED':
      return 'Unqualified';

    case 'UNASSESSED':
    default:
      return 'Unassessed';
  }
}

function normalizeStage(
  value?: string | null,
): StageValue {
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

function formatRelativeDate(
  value?: string | null,
) {
  if (!value) {
    return 'No activity yet';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'No activity yet';
  }

  const difference =
    Date.now() -
    date.getTime();

  if (difference < 60_000) {
    return 'Just now';
  }

  const minutes =
    Math.floor(
      difference / 60_000,
    );

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `${hours} ${
      hours === 1
        ? 'hour'
        : 'hours'
    } ago`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  if (days < 30) {
    return `${days} ${
      days === 1
        ? 'day'
        : 'days'
    } ago`;
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

function toDateTimeLocal(
  value?: string | null,
) {
  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset * 60_000,
    );

  return localDate
    .toISOString()
    .slice(0, 16);
}

function getSignal(
  lead: LeadApiItem,
) {
  if (
    lead.nextFollowUpAt
  ) {
    const followUp =
      new Date(
        lead.nextFollowUpAt,
      );

    if (
      !Number.isNaN(
        followUp.getTime(),
      ) &&
      followUp.getTime() <=
        Date.now()
    ) {
      return 'Follow-up due';
    }

    return 'Follow-up scheduled';
  }

  switch (
    normalizeStage(
      lead.stage,
    )
  ) {
    case 'New':
      return 'New lead';

    case 'Contacted':
      return 'Contacted';

    case 'Qualified':
      return 'Qualified';

    case 'Proposal':
      return 'Proposal';

    case 'Negotiation':
      return 'Negotiation';

    case 'Won':
      return 'Won';

    case 'Lost':
      return 'Lost';

    default:
      return 'Lead';
  }
}

function getDefaultAction(
  stage: StageValue,
) {
  switch (stage) {
    case 'New':
      return 'Qualify lead';

    case 'Contacted':
      return 'Continue conversation';

    case 'Qualified':
      return 'Create proposal';

    case 'Proposal':
      return 'Review follow-up';

    case 'Negotiation':
      return 'Prepare negotiation';

    case 'Won':
      return 'Review handoff';

    case 'Lost':
      return 'Review lost deal';

    default:
      return 'Review lead';
  }
}

function mapLeadToUi(
  lead: LeadApiItem,
): Lead {
  const firstName =
    lead.firstName
      ?.trim() || '';

  const lastName =
    lead.lastName
      ?.trim() || '';

  const company =
    lead.company
      ?.trim() ||
    'Unknown company';

  const value =
    Math.round(
      (
        lead.valueCents ??
        0
      ) / 100,
    ) || 0;

  const stage =
    normalizeStage(
      lead.stage,
    );

  const temperature =
    normalizeTemperature(
      lead.temperature,
    );

  const followUpDue =
    lead.nextFollowUpAt
      ? new Date(
          lead.nextFollowUpAt,
        ).getTime() <=
        Date.now()
      : false;

  const temperaturePriority =
    temperature === 'Hot'
      ? 30
      : temperature ===
          'Warm'
        ? 20
        : 10;

  const stagePriority: Record<
    StageValue,
    number
  > = {
    New: 10,
    Contacted: 20,
    Qualified: 30,
    Proposal: 40,
    Negotiation: 45,
    Won: 0,
    Lost: 0,
  };

  return {
    id: lead.id,

    firstName,
    lastName,

    email:
      lead.email ?? '',

    company,

    jobTitle:
      lead.jobTitle ?? '',

    phone:
      lead.phone ?? '',

    website:
      lead.website ?? '',

    notes:
      lead.notes ?? '',

    nextFollowUpAt:
      lead.nextFollowUpAt ??
      null,

    initials:
      getInitials(
        firstName,
        lastName,
        company,
      ),

    value,

    stage,

    temperature,

    qualification:
      normalizeQualification(
        lead.qualification,
      ),

    source:
      lead.source ??
      'Website',

    lastActivity:
      formatRelativeDate(
        lead.lastActivityAt ??
          lead.updatedAt ??
          lead.createdAt,
      ),

    signal:
      getSignal(lead),

    insight:
      lead.aiSummary ??
      lead.notes?.trim() ??
      'AI intelligence will appear when enough lead context is available.',

    actionLabel:
      lead.aiNextBestAction ??
      getDefaultAction(
        stage,
      ),

    actionHint:
      followUpDue
        ? 'This follow-up is due now.'
        : lead.nextFollowUpAt
          ? 'A follow-up is already scheduled.'
          : 'Review the lead and decide the next best step.',

    needsAttention:
      followUpDue ||
      temperature === 'Hot',

    priority:
      (
        followUpDue
          ? 100
          : 0
      ) +
      temperaturePriority +
      stagePriority[stage],
  };
}

function extractLeads(
  payload:
    | LeadsListResponse
    | LeadApiItem[],
): LeadApiItem[] {
  if (
    Array.isArray(payload)
  ) {
    return payload;
  }

  if (
    Array.isArray(
      payload.leads,
    )
  ) {
    return payload.leads;
  }

  if (
    Array.isArray(
      payload.data,
    )
  ) {
    return payload.data;
  }

  return [];
}

function extractMutatedLead(
  payload:
    LeadMutationResponse,
): LeadApiItem | null {
  if (
    'id' in payload &&
    typeof payload.id ===
      'string'
  ) {
    return payload;
  }

  if (
    'lead' in payload &&
    payload.lead
  ) {
    return payload.lead;
  }

  if (
    'data' in payload &&
    payload.data
  ) {
    return payload.data;
  }

  return null;
}

function leadToForm(
  lead: Lead,
): LeadFormState {
  return {
    firstName:
      lead.firstName,

    lastName:
      lead.lastName,

    company:
      lead.company ===
      'Unknown company'
        ? ''
        : lead.company,

    jobTitle:
      lead.jobTitle ?? '',

    email:
      lead.email,

    phone:
      lead.phone ?? '',

    website:
      lead.website ?? '',

    source:
      lead.source || 'Website',

    estimatedValue:
      String(
        lead.value ?? 0,
      ),

    temperature:
      lead.temperature,

    stage:
      lead.stage,

    nextFollowUp:
      toDateTimeLocal(
        lead.nextFollowUpAt,
      ),

    notes:
      lead.notes ?? '',
  };
}

function buildLeadPayload(
  form: LeadFormState,
  includeStage: boolean,
) {
  const estimatedValue =
    Number(
      form.estimatedValue ||
        '0',
    );

  return {
    firstName:
      form.firstName.trim(),

    lastName:
      form.lastName.trim() ||
      undefined,

    company:
      form.company.trim(),

    jobTitle:
      form.jobTitle.trim() ||
      undefined,

    email:
      form.email.trim(),

    phone:
      form.phone.trim() ||
      undefined,

    website:
      form.website.trim() ||
      undefined,

    source:
      form.source,

    temperature:
      form.temperature.toUpperCase(),

    ...(includeStage
      ? {
          stage:
            form.stage.toUpperCase(),
        }
      : {
          stage: 'NEW',
          qualification:
            'UNASSESSED',
        }),

    valueCents:
      Math.round(
        estimatedValue * 100,
      ),

    nextFollowUpAt:
      form.nextFollowUp
        ? new Date(
            form.nextFollowUp,
          ).toISOString()
        : undefined,

    notes:
      form.notes.trim() ||
      undefined,
  };
}

function getFormError(
  form: LeadFormState,
): string | null {
  if (
    !form.firstName.trim()
  ) {
    return 'First name is required.';
  }

  if (
    !form.company.trim()
  ) {
    return 'Company is required.';
  }

  if (
    !form.email.trim()
  ) {
    return 'Email is required.';
  }

  const estimatedValue =
    Number(
      form.estimatedValue ||
        '0',
    );

  if (
    Number.isNaN(
      estimatedValue,
    ) ||
    estimatedValue < 0
  ) {
    return 'Estimated value must be a valid number.';
  }

  return null;
}

/* =========================================================
   PAGE
========================================================= */

export default function LeadsPage() {
  const {
    request,
  } = useAuth();

  const [
    leads,
    setLeads,
  ] =
    useState<Lead[]>([]);

  const [
    search,
    setSearch,
  ] =
    useState('');

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
  ] =
    useState(true);

  const [
    pageError,
    setPageError,
  ] =
    useState<
      string | null
    >(null);

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<
      string | null
    >(null);

  /* =======================================================
     CREATE
  ======================================================= */

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] =
    useState(false);

  const [
    createForm,
    setCreateForm,
  ] =
    useState<LeadFormState>(
      initialLeadForm,
    );

  const [
    createError,
    setCreateError,
  ] =
    useState<
      string | null
    >(null);

  const [
    isSubmittingCreate,
    setIsSubmittingCreate,
  ] =
    useState(false);

  /* =======================================================
     EDIT
  ======================================================= */

  const [
    editingLead,
    setEditingLead,
  ] =
    useState<Lead | null>(
      null,
    );

  const [
    editForm,
    setEditForm,
  ] =
    useState<LeadFormState>(
      initialLeadForm,
    );

  const [
    editError,
    setEditError,
  ] =
    useState<
      string | null
    >(null);

  const [
    isSubmittingEdit,
    setIsSubmittingEdit,
  ] =
    useState(false);

  /* =======================================================
     DELETE
  ======================================================= */

  const [
    deletingLead,
    setDeletingLead,
  ] =
    useState<Lead | null>(
      null,
    );

  const [
    deleteError,
    setDeleteError,
  ] =
    useState<
      string | null
    >(null);

  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(false);

  /* =======================================================
     LOAD
  ======================================================= */

  const loadLeads =
    useCallback(
      async () => {
        setIsLoading(true);
        setPageError(null);

        try {
          const response =
            await request<
              | LeadsListResponse
              | LeadApiItem[]
            >(
              '/leads',
            );

          const items =
            extractLeads(
              response,
            );

          setLeads(
            items.map(
              mapLeadToUi,
            ),
          );
        } catch (error) {
          if (
            error instanceof
            Error
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
          setIsLoading(
            false,
          );
        }
      },
      [request],
    );

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  /* =======================================================
     SUCCESS MESSAGE
  ======================================================= */

  useEffect(() => {
    if (
      !successMessage
    ) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          setSuccessMessage(
            null,
          );
        },
        3500,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [successMessage]);

  /* =======================================================
     MODAL PAGE LOCK
  ======================================================= */

  const hasOpenModal =
    isCreateModalOpen ||
    editingLead !== null ||
    deletingLead !== null;

  useEffect(() => {
    const originalOverflow =
      document.body.style
        .overflow;

    if (hasOpenModal) {
      document.body.style
        .overflow =
        'hidden';
    }

    return () => {
      document.body.style
        .overflow =
        originalOverflow;
    };
  }, [hasOpenModal]);

  /* =======================================================
     FILTER + SEARCH + SORT
  ======================================================= */

  const filteredLeads =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      let result =
        leads.filter(
          (lead) => {
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
              ].some(
                (value) =>
                  value
                    ?.toLowerCase()
                    .includes(
                      normalizedSearch,
                    ),
              );

            let matchesFilter =
              true;

            if (
              filter ===
              'hot'
            ) {
              matchesFilter =
                lead.temperature ===
                'Hot';
            }

            if (
              filter ===
              'warm'
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
          },
        );

      result =
        [...result];

      switch (sort) {
        case 'value-high':
          result.sort(
            (a, b) =>
              b.value -
              a.value,
          );
          break;

        case 'value-low':
          result.sort(
            (a, b) =>
              a.value -
              b.value,
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

  const activeLeads =
    leads.filter(
      (lead) =>
        lead.stage !== 'Won' &&
        lead.stage !== 'Lost',
    );

  const totalValue =
    activeLeads.reduce(
      (
        total,
        lead,
      ) =>
        total +
        lead.value,
      0,
    );

  const attentionCount =
    activeLeads.filter(
      (lead) =>
        lead.needsAttention,
    ).length;

  /* =======================================================
     CREATE ACTIONS
  ======================================================= */

  const openCreateModal =
    useCallback(() => {
      setCreateForm(
        initialLeadForm,
      );

      setCreateError(
        null,
      );

      setIsCreateModalOpen(
        true,
      );
    }, []);

  const closeCreateModal =
    useCallback(() => {
      if (
        isSubmittingCreate
      ) {
        return;
      }

      setIsCreateModalOpen(
        false,
      );

      setCreateError(
        null,
      );
    }, [
      isSubmittingCreate,
    ]);

  const handleCreateFieldChange =
    <
      K extends keyof LeadFormState,
    >(
      key: K,
      value:
        LeadFormState[K],
    ) => {
      setCreateForm(
        (previous) => ({
          ...previous,
          [key]: value,
        }),
      );
    };

  const handleCreateLead =
    async (
      event:
        React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setCreateError(
        null,
      );

      const validationError =
        getFormError(
          createForm,
        );

      if (
        validationError
      ) {
        setCreateError(
          validationError,
        );

        return;
      }

      setIsSubmittingCreate(
        true,
      );

      try {
        const response =
          await request<LeadMutationResponse>(
            '/leads',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify(
                  buildLeadPayload(
                    createForm,
                    false,
                  ),
                ),
            },
          );

        const created =
          extractMutatedLead(
            response,
          );

        if (created) {
          setLeads(
            (previous) => [
              mapLeadToUi(
                created,
              ),
              ...previous,
            ],
          );
        } else {
          await loadLeads();
        }

        setIsCreateModalOpen(
          false,
        );

        setCreateForm(
          initialLeadForm,
        );

        setSuccessMessage(
          'Lead created successfully.',
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
          error instanceof
          Error
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

  /* =======================================================
     EDIT ACTIONS
  ======================================================= */

  const openEditModal =
    useCallback(
      (lead: Lead) => {
        setEditingLead(
          lead,
        );

        setEditForm(
          leadToForm(
            lead,
          ),
        );

        setEditError(
          null,
        );
      },
      [],
    );

  const closeEditModal =
    useCallback(() => {
      if (
        isSubmittingEdit
      ) {
        return;
      }

      setEditingLead(
        null,
      );

      setEditError(
        null,
      );
    }, [
      isSubmittingEdit,
    ]);

  const handleEditFieldChange =
    <
      K extends keyof LeadFormState,
    >(
      key: K,
      value:
        LeadFormState[K],
    ) => {
      setEditForm(
        (previous) => ({
          ...previous,
          [key]: value,
        }),
      );
    };

  const handleEditLead =
    async (
      event:
        React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (!editingLead) {
        return;
      }

      setEditError(
        null,
      );

      const validationError =
        getFormError(
          editForm,
        );

      if (
        validationError
      ) {
        setEditError(
          validationError,
        );

        return;
      }

      setIsSubmittingEdit(
        true,
      );

      try {
        const response =
          await request<LeadMutationResponse>(
            `/leads/${editingLead.id}`,
            {
              method: 'PATCH',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify(
                  buildLeadPayload(
                    editForm,
                    true,
                  ),
                ),
            },
          );

        const updated =
          extractMutatedLead(
            response,
          );

        if (updated) {
          const mapped =
            mapLeadToUi(
              updated,
            );

          setLeads(
            (previous) =>
              previous.map(
                (lead) =>
                  lead.id ===
                  mapped.id
                    ? mapped
                    : lead,
              ),
          );
        } else {
          await loadLeads();
        }

        setEditingLead(
          null,
        );

        setSuccessMessage(
          'Lead updated successfully.',
        );
      } catch (error) {
        if (
          error instanceof
          ApiError
        ) {
          setEditError(
            error.message ||
              'Failed to update lead.',
          );
        } else if (
          error instanceof
          Error
        ) {
          setEditError(
            error.message,
          );
        } else {
          setEditError(
            'Failed to update lead.',
          );
        }
      } finally {
        setIsSubmittingEdit(
          false,
        );
      }
    };

  /* =======================================================
     DELETE ACTIONS
  ======================================================= */

  const openDeleteModal =
    useCallback(
      (lead: Lead) => {
        setDeletingLead(
          lead,
        );

        setDeleteError(
          null,
        );
      },
      [],
    );

  const closeDeleteModal =
    useCallback(() => {
      if (isDeleting) {
        return;
      }

      setDeletingLead(
        null,
      );

      setDeleteError(
        null,
      );
    }, [isDeleting]);

  const handleDeleteLead =
    async () => {
      if (!deletingLead) {
        return;
      }

      setDeleteError(
        null,
      );

      setIsDeleting(
        true,
      );

      try {
        await request<{
          success: boolean;
          message: string;
        }>(
          `/leads/${deletingLead.id}`,
          {
            method: 'DELETE',
          },
        );

        setLeads(
          (previous) =>
            previous.filter(
              (lead) =>
                lead.id !==
                deletingLead.id,
            ),
        );

        setDeletingLead(
          null,
        );

        setSuccessMessage(
          'Lead deleted successfully.',
        );
      } catch (error) {
        if (
          error instanceof
          ApiError
        ) {
          setDeleteError(
            error.message ||
              'Failed to delete lead.',
          );
        } else if (
          error instanceof
          Error
        ) {
          setDeleteError(
            error.message,
          );
        } else {
          setDeleteError(
            'Failed to delete lead.',
          );
        }
      } finally {
        setIsDeleting(
          false,
        );
      }
    };

  /* =======================================================
     PAGE
  ======================================================= */

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
            <SummaryChip
              icon={
                <UsersRound
                  size={14}
                />
              }
              label={`${activeLeads.length} active leads`}
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

        {/* SUCCESS */}

        {successMessage && (
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
            {successMessage}
          </div>
        )}

        {/* TOOLBAR */}

        <div
          className="
            mt-8
          "
        >
          <LeadsToolbar
            search={search}
            onSearchChange={
              setSearch
            }
            filter={filter}
            onFilterChange={
              setFilter
            }
            sort={sort}
            onSortChange={
              setSort
            }
            resultCount={
              filteredLeads.length
            }
            onAddLead={
              openCreateModal
            }
          />
        </div>

        {/* CONTENT */}

        <div
          className="
            mt-4
          "
        >
          {isLoading ? (
            <LoadingState />
          ) : pageError ? (
            <ErrorState
              message={
                pageError
              }
              onRetry={() => {
                void loadLeads();
              }}
            />
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
                  onEdit={
                    openEditModal
                  }
                  onDelete={
                    openDeleteModal
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
                      lead={
                        lead
                      }
                      onEdit={
                        openEditModal
                      }
                      onDelete={
                        openDeleteModal
                      }
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
              onAddLead={
                openCreateModal
              }
            />
          )}
        </div>
      </div>

      {/* CREATE MODAL */}

      {isCreateModalOpen && (
        <LeadFormModal
          mode="create"
          form={createForm}
          error={createError}
          isSubmitting={
            isSubmittingCreate
          }
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

      {/* EDIT MODAL */}

      {editingLead && (
        <LeadFormModal
          mode="edit"
          form={editForm}
          error={editError}
          isSubmitting={
            isSubmittingEdit
          }
          onChange={
            handleEditFieldChange
          }
          onClose={
            closeEditModal
          }
          onSubmit={
            handleEditLead
          }
        />
      )}

      {/* DELETE MODAL */}

      {deletingLead && (
        <DeleteLeadModal
          lead={
            deletingLead
          }
          error={
            deleteError
          }
          isDeleting={
            isDeleting
          }
          onClose={
            closeDeleteModal
          }
          onConfirm={() => {
            void handleDeleteLead();
          }}
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
   LOADING / ERROR / EMPTY
========================================================= */

function LoadingState() {
  return (
    <div
      className="
        flex
        min-h-[360px]
        items-center
        justify-center
        rounded-[16px]
        border
        border-[var(--cf-border)]
        bg-[var(--cf-surface)]
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
          Loading leads...
        </p>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="
        rounded-[16px]
        border
        border-red-500/20
        bg-red-500/5
        px-6
        py-10
        text-center
      "
    >
      <p
        className="
          text-[15px]
          font-semibold
          text-[var(--cf-text)]
        "
      >
        Failed to load leads
      </p>

      <p
        className="
          mt-2
          text-[14px]
          text-[var(--cf-text-secondary)]
        "
      >
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
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
  );
}

function EmptyLeadsState({
  search,
  onClear,
  onAddLead,
}: {
  search: string;
  onClear: () => void;
  onAddLead: () => void;
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
          text-[24px]
          font-semibold
          tracking-[-0.5px]
          text-[var(--cf-text)]
        "
      >
        No leads found
      </h2>

      <p
        className="
          mt-2
          max-w-[440px]
          text-[14px]
          leading-6
          text-[var(--cf-text-secondary)]
        "
      >
        {search
          ? `No leads match “${search}”. Try another search or clear your filters.`
          : 'Your workspace does not have a lead matching this view yet.'}
      </p>

      <div
        className="
          mt-6
          flex
          flex-wrap
          justify-center
          gap-2
        "
      >
        {(search) && (
          <button
            type="button"
            onClick={onClear}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              rounded-lg
              border
              border-[var(--cf-border)]
              bg-[var(--cf-surface)]
              px-5
              text-[14px]
              font-semibold
              text-[var(--cf-text)]
              transition
              hover:bg-[var(--cf-surface-soft)]
            "
          >
            Clear filters
          </button>
        )}

        {!search && (
          <button
            type="button"
            onClick={
              onAddLead
            }
            className="
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
            Add your first lead
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   LEAD FORM MODAL
========================================================= */

function LeadFormModal({
  mode,
  form,
  error,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: {
  mode:
    | 'create'
    | 'edit';

  form:
    LeadFormState;

  error:
    string | null;

  isSubmitting:
    boolean;

  onChange: <
    K extends keyof LeadFormState,
  >(
    key: K,
    value:
      LeadFormState[K],
  ) => void;

  onClose:
    () => void;

  onSubmit: (
    event:
      React.FormEvent<HTMLFormElement>,
  ) => Promise<void>;
}) {
  const isEdit =
    mode === 'edit';

  return (
    <div
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
      className="
        fixed
        inset-0
        z-[160]
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
              {isEdit
                ? 'Edit lead'
                : 'New lead'}
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
              {isEdit
                ? 'Update lead'
                : 'Add lead'}
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
              {isEdit
                ? 'Keep the opportunity information accurate so ClientFlow can recommend the right next step.'
                : 'Start with what you know. You can add more context as the opportunity develops.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              isSubmitting
            }
            aria-label="Close"
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
            <X
              size={18}
            />
          </button>
        </div>

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
                  border-red-500/25
                  bg-red-500/5
                  px-4
                  py-3
                  text-[14px]
                  text-red-600
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
                  value={
                    form.phone
                  }
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

                  <option value="Other">
                    Other
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
                  <option value="Hot">
                    Hot
                  </option>

                  <option value="Warm">
                    Warm
                  </option>

                  <option value="Cold">
                    Cold
                  </option>
                </Select>
              </Field>

              {isEdit && (
                <Field>
                  <Label>
                    Stage
                  </Label>

                  <Select
                    value={
                      form.stage
                    }
                    onChange={(
                      event,
                    ) =>
                      onChange(
                        'stage',
                        event.target
                          .value as StageValue,
                      )
                    }
                  >
                    <option value="New">
                      New
                    </option>

                    <option value="Contacted">
                      Contacted
                    </option>

                    <option value="Qualified">
                      Qualified
                    </option>

                    <option value="Proposal">
                      Proposal
                    </option>

                    <option value="Negotiation">
                      Negotiation
                    </option>

                    <option value="Won">
                      Won
                    </option>

                    <option value="Lost">
                      Lost
                    </option>
                  </Select>
                </Field>
              )}

              <Field
                className={
                  isEdit
                    ? ''
                    : 'md:col-span-2'
                }
              >
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

              <Field
                className="
                  md:col-span-2
                "
              >
                <Label>
                  Notes
                </Label>

                <Textarea
                  value={
                    form.notes
                  }
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
              disabled={
                isSubmitting
              }
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
              disabled={
                isSubmitting
              }
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
                ? isEdit
                  ? 'Saving...'
                  : 'Creating...'
                : isEdit
                  ? 'Save changes'
                  : 'Create lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   DELETE MODAL
========================================================= */

function DeleteLeadModal({
  lead,
  error,
  isDeleting,
  onClose,
  onConfirm,
}: {
  lead: Lead;
  error: string | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
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
      className="
        fixed
        inset-0
        z-[170]
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
          w-full
          max-w-[470px]
          rounded-[22px]
          border
          border-white/10
          bg-[var(--cf-surface)]
          p-6
          shadow-[0_30px_80px_rgba(15,23,42,.35)]
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
          <AlertTriangle
            size={21}
          />
        </div>

        <h2
          className="
            mt-5
            text-[22px]
            font-semibold
            tracking-[-0.4px]
            text-[var(--cf-text)]
          "
        >
          Delete this lead?
        </h2>

        <p
          className="
            mt-2
            text-[14px]
            leading-6
            text-[var(--cf-text-secondary)]
          "
        >
          <span
            className="
              font-semibold
              text-[var(--cf-text)]
            "
          >
            {lead.firstName}{' '}
            {lead.lastName}
          </span>{' '}
          from {lead.company} will
          be permanently removed.
          This action cannot be
          undone.
        </p>

        {error && (
          <div
            className="
              mt-4
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
            onClick={onClose}
            disabled={
              isDeleting
            }
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
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={
              isDeleting
            }
            className="
              inline-flex
              h-11
              items-center
              justify-center
              rounded-xl
              bg-red-600
              px-5
              text-[14px]
              font-semibold
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isDeleting
              ? 'Deleting...'
              : 'Delete lead'}
          </button>
        </div>
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
  children:
    React.ReactNode;
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
  children:
    React.ReactNode;
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
  props:
    React.InputHTMLAttributes<HTMLInputElement>,
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
  props:
    React.SelectHTMLAttributes<HTMLSelectElement>,
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
  props:
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
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
