'use client';

import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Eye,
  Flame,
  GripVertical,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';

import Link from 'next/link';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  createPortal,
} from 'react-dom';

import {
  useAuth,
} from '@/components/providers/auth-provider';

import {
  ApiError,
} from '@/lib/api';

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
  organizationId?: string;

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

  aiSummary?: string | null;
  aiNextBestAction?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

interface PipelineColumnResponse {
  stage: ApiLeadStage;
  count: number;
  totalValueCents: number;
  hasMore: boolean;
  data: ApiLead[];
}

interface PipelineBoardResponse {
  summary: {
    visibleCount: number;
    openCount: number;
    openValueCents: number;
    wonCount: number;
    wonValueCents: number;
    lostCount: number;
    currency: string;
  };

  columns: PipelineColumnResponse[];

  lost: PipelineColumnResponse;
}

interface PipelineColumnDefinition {
  stage: ApiLeadStage;
  label: string;
  helper: string;
}

interface StageMenuState {
  lead: ApiLead;
  x: number;
  y: number;
}

const initialPipelineSummary = {
  visibleCount: 0,
  openCount: 0,
  openValueCents: 0,
  wonCount: 0,
  wonValueCents: 0,
  lostCount: 0,
  currency: 'EUR',
};

/* =========================================================
   PIPELINE CONFIG
========================================================= */

const ACTIVE_COLUMNS: PipelineColumnDefinition[] = [
  {
    stage: 'NEW',
    label: 'New',
    helper: 'Needs first review',
  },
  {
    stage: 'CONTACTED',
    label: 'Contacted',
    helper: 'Conversation started',
  },
  {
    stage: 'QUALIFIED',
    label: 'Qualified',
    helper: 'Fit confirmed',
  },
  {
    stage: 'PROPOSAL',
    label: 'Proposal',
    helper: 'Offer in progress',
  },
  {
    stage: 'NEGOTIATION',
    label: 'Negotiation',
    helper: 'Closing conversation',
  },
  {
    stage: 'WON',
    label: 'Won',
    helper: 'Closed successfully',
  },
];

const MOVABLE_STAGES: {
  stage: ApiLeadStage;
  label: string;
}[] = [
  {
    stage: 'NEW',
    label: 'New',
  },
  {
    stage: 'CONTACTED',
    label: 'Contacted',
  },
  {
    stage: 'QUALIFIED',
    label: 'Qualified',
  },
  {
    stage: 'PROPOSAL',
    label: 'Proposal',
  },
  {
    stage: 'NEGOTIATION',
    label: 'Negotiation',
  },
  {
    stage: 'WON',
    label: 'Won',
  },
  {
    stage: 'LOST',
    label: 'Lost',
  },
];

/* =========================================================
   HELPERS
========================================================= */

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

function getLeadName(
  lead: ApiLead,
) {
  return [
    lead.firstName,
    lead.lastName,
  ]
    .filter(Boolean)
    .join(' ');
}

function getInitials(
  lead: ApiLead,
) {
  const first =
    lead.firstName?.trim()?.[0] ??
    '';

  const last =
    lead.lastName?.trim()?.[0] ??
    '';

  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }

  return (
    lead.company
      ?.trim()
      .slice(0, 2)
      .toUpperCase() ||
    'LD'
  );
}

function getTemperatureLabel(
  temperature?: ApiLeadTemperature | null,
) {
  if (temperature === 'HOT') {
    return 'Hot';
  }

  if (temperature === 'COLD') {
    return 'Cold';
  }

  return 'Warm';
}

function getQualificationLabel(
  qualification?: ApiLeadQualification | null,
) {
  switch (qualification) {
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

function getFollowUpState(
  lead: ApiLead,
) {
  if (!lead.nextFollowUpAt) {
    return null;
  }

  const date =
    new Date(
      lead.nextFollowUpAt,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  const now =
    Date.now();

  const difference =
    date.getTime() - now;

  if (difference <= 0) {
    return {
      label:
        'Follow-up due',
      urgent:
        true,
    };
  }

  const hours =
    Math.ceil(
      difference /
        3_600_000,
    );

  if (hours <= 24) {
    return {
      label:
        'Follow up today',
      urgent:
        true,
    };
  }

  const days =
    Math.ceil(
      hours / 24,
    );

  return {
    label:
      `Follow up in ${days}d`,
    urgent:
      false,
  };
}

function getLastActivity(
  lead: ApiLead,
) {
  const raw =
    lead.lastActivityAt ??
    lead.updatedAt ??
    lead.createdAt;

  if (!raw) {
    return 'No activity';
  }

  const date =
    new Date(raw);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'No activity';
  }

  const diff =
    Date.now() -
    date.getTime();

  const minutes =
    Math.max(
      0,
      Math.floor(
        diff / 60_000,
      ),
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

  return `${days}d ago`;
}

function stageLabel(
  stage: ApiLeadStage,
) {
  return (
    MOVABLE_STAGES.find(
      (item) =>
        item.stage === stage,
    )?.label ?? stage
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function PipelinePage() {
  const {
    request,
  } = useAuth();

  const [
    leads,
    setLeads,
  ] =
    useState<ApiLead[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

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
    pipelineSummary,
    setPipelineSummary,
  ] =
    useState(
      initialPipelineSummary,
    );

  const [
    columnStats,
    setColumnStats,
  ] =
    useState<
      Record<
        string,
        {
          count: number;
          totalValueCents: number;
          hasMore: boolean;
        }
      >
    >({});

  const [
    showLost,
    setShowLost,
  ] =
    useState(false);

  const [
    draggedLeadId,
    setDraggedLeadId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    dragOverStage,
    setDragOverStage,
  ] =
    useState<ApiLeadStage | null>(
      null,
    );

  const [
    movingLeadId,
    setMovingLeadId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    stageMenu,
    setStageMenu,
  ] =
    useState<StageMenuState | null>(
      null,
    );

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          setDebouncedSearch(
            search.trim(),
          );
        },
        350,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [search]);

  const loadPipeline =
    useCallback(
      async (
        showLoader = true,
      ) => {
        if (showLoader) {
          setIsLoading(true);
        }

        setError(null);

        try {
          const params =
            new URLSearchParams({
              limitPerStage:
                '20',
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
            await request<PipelineBoardResponse>(
              `/leads/pipeline/board?${params.toString()}`,
            );

          const visibleLeads =
            response.columns.flatMap(
              (column) =>
                column.data,
            );

          setLeads([
            ...visibleLeads,
            ...response.lost.data,
          ]);

          setPipelineSummary(
            response.summary,
          );

          setColumnStats(
            Object.fromEntries(
              [
                ...response.columns,
                response.lost,
              ].map(
                (column) => [
                  column.stage,
                  {
                    count:
                      column.count,

                    totalValueCents:
                      column.totalValueCents,

                    hasMore:
                      column.hasMore,
                  },
                ],
              ),
            ),
          );
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
              'Failed to load pipeline.',
            );
          }
        } finally {
          if (showLoader) {
            setIsLoading(
              false,
            );
          }
        }
      },
      [
        request,
        debouncedSearch,
      ],
    );

  useEffect(() => {
    void loadPipeline();
  }, [loadPipeline]);

  const activeLeads =
    leads.filter(
      (lead) =>
        lead.stage !==
        'LOST',
    );

  const openPipelineValueCents =
    pipelineSummary.openValueCents;

  const wonValueCents =
    pipelineSummary.wonValueCents;

  const lostLeads =
    leads.filter(
      (lead) =>
        lead.stage ===
        'LOST',
    );

  const moveLead =
    useCallback(
      async (
        lead: ApiLead,
        nextStage:
          ApiLeadStage,
      ) => {
        if (
          lead.stage ===
          nextStage
        ) {
          setStageMenu(
            null,
          );
          return;
        }

        const previousStage =
          lead.stage;

        setMovingLeadId(
          lead.id,
        );

        setStageMenu(
          null,
        );

        /*
         * Optimistic UI:
         * move immediately, then
         * restore if PATCH fails.
         */
        setLeads(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                lead.id
                  ? {
                      ...item,
                      stage:
                        nextStage,
                    }
                  : item,
            ),
        );

        try {
          const updated =
            await request<ApiLead>(
              `/leads/${lead.id}`,
              {
                method:
                  'PATCH',

                body:
                  JSON.stringify({
                    stage:
                      nextStage,
                  }),
              },
            );

          setLeads(
            (current) =>
              current.map(
                (item) =>
                  item.id ===
                  lead.id
                    ? {
                        ...item,
                        ...updated,
                      }
                    : item,
              ),
          );

          await loadPipeline(
            false,
          );
        } catch (moveError) {
          setLeads(
            (current) =>
              current.map(
                (item) =>
                  item.id ===
                  lead.id
                    ? {
                        ...item,
                        stage:
                          previousStage,
                      }
                    : item,
              ),
          );

          if (
            moveError instanceof
            ApiError
          ) {
            setError(
              moveError.message ||
                'Could not move this lead.',
            );
          } else if (
            moveError instanceof
            Error
          ) {
            setError(
              moveError.message,
            );
          } else {
            setError(
              'Could not move this lead.',
            );
          }
        } finally {
          setMovingLeadId(
            null,
          );
        }
      },
      [
        request,
        loadPipeline,
      ],
    );

  const handleDrop =
    (
      stage:
        ApiLeadStage,
    ) => {
      if (
        !draggedLeadId
      ) {
        return;
      }

      const lead =
        leads.find(
          (item) =>
            item.id ===
            draggedLeadId,
        );

      setDraggedLeadId(
        null,
      );

      setDragOverStage(
        null,
      );

      if (!lead) {
        return;
      }

      void moveLead(
        lead,
        stage,
      );
    };

  if (isLoading) {
    return (
      <PipelineLoading />
    );
  }

  return (
    <>
      <div
        className="
          cf-dashboard-enter
          min-w-0
          text-[var(--cf-text)]
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

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
              Pipeline
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
              Move opportunities
              through each sales
              stage while keeping
              the next revenue
              action visible.
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
              label={`${pipelineSummary.visibleCount} opportunities`}
            />

            <SummaryChip
              label={`${formatMoney(openPipelineValueCents)} open`}
              primary
            />

            <SummaryChip
              label={`${formatMoney(wonValueCents)} won`}
              success
            />
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

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
                transition
                hover:bg-red-500/10
              "
            >
              <X
                size={14}
              />
            </button>
          </div>
        )}

        {/* =================================================
            TOOLBAR
        ================================================= */}

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

              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <div
              className="
                relative
                min-w-0
                flex-1

                md:max-w-[480px]
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
                placeholder="Search pipeline..."
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
                    transition
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
                grid
                grid-cols-2
                gap-2

                sm:flex
                sm:flex-wrap
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={() =>
                  setShowLost(true)
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-[var(--cf-border)]
                  bg-[var(--cf-surface)]
                  px-4
                  text-[14px]
                  font-semibold
                  text-[var(--cf-text-secondary)]
                  transition
                  hover:bg-[var(--cf-surface-soft)]
                  hover:text-[var(--cf-text)]
                "
              >
                <Eye
                  size={15}
                />

                Lost
                <span
                  className="
                    rounded-full
                    bg-[var(--cf-surface-soft)]
                    px-1.5
                    py-0.5
                    text-[11px]
                  "
                >
                  {
                    pipelineSummary.lostCount
                  }
                </span>
              </button>

              <Link
                href="/leads"
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[var(--cf-primary)]
                  px-4
                  text-[14px]
                  font-semibold
                  text-white
                  shadow-[0_6px_16px_rgba(91,91,247,.22)]
                  transition
                  hover:bg-[var(--cf-primary-hover)]
                "
              >
                <Plus
                  size={15}
                />

                Add lead
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================
            BOARD
        ================================================= */}

        {activeLeads.length >
        0 ? (
          <div
            className="
              mt-4
              -mx-1
              overflow-x-auto
              px-1
              pb-4

              [scrollbar-width:thin]
              [scrollbar-color:var(--cf-border)_transparent]
            "
          >
            <div
              className="
                grid
                min-w-max
                auto-cols-[292px]
                grid-flow-col
                gap-3

                lg:auto-cols-[310px]
              "
            >
              {ACTIVE_COLUMNS.map(
                (column) => {
                  const columnLeads =
                    activeLeads.filter(
                      (lead) =>
                        lead.stage ===
                        column.stage,
                    );

                  const stats =
                    columnStats[
                      column.stage
                    ] ?? {
                      count:
                        columnLeads.length,

                      totalValueCents:
                        columnLeads.reduce(
                          (
                            total,
                            lead,
                          ) =>
                            total +
                            (lead.valueCents ??
                              0),
                          0,
                        ),

                      hasMore:
                        false,
                    };

                  return (
                    <PipelineColumn
                      key={
                        column.stage
                      }
                      definition={
                        column
                      }
                      leads={
                        columnLeads
                      }
                      valueCents={
                        stats.totalValueCents
                      }
                      totalCount={
                        stats.count
                      }
                      hasMore={
                        stats.hasMore
                      }
                      isDragOver={
                        dragOverStage ===
                        column.stage
                      }
                      draggedLeadId={
                        draggedLeadId
                      }
                      movingLeadId={
                        movingLeadId
                      }
                      onDragStart={(
                        id,
                      ) => {
                        setDraggedLeadId(
                          id,
                        );
                      }}
                      onDragEnd={() => {
                        setDraggedLeadId(
                          null,
                        );

                        setDragOverStage(
                          null,
                        );
                      }}
                      onDragOver={() => {
                        setDragOverStage(
                          column.stage,
                        );
                      }}
                      onDrop={() =>
                        handleDrop(
                          column.stage,
                        )
                      }
                      onOpenStageMenu={(
                        lead,
                        rect,
                      ) => {
                        setStageMenu({
                          lead,
                          x:
                            rect.right,
                          y:
                            rect.bottom,
                        });
                      }}
                    />
                  );
                },
              )}
            </div>
          </div>
        ) : (
          <PipelineEmpty
            search={search}
            onClear={() =>
              setSearch('')
            }
          />
        )}

        <p
          className="
            mt-1
            text-[12px]
            leading-5
            text-[var(--cf-text-muted)]
          "
        >
          Desktop: drag a card
          between stages. On mobile
          or tablet, use the
          opportunity menu to change
          stage.
        </p>
      </div>

      {/* ===================================================
          STAGE MENU
      =================================================== */}

      {stageMenu && (
        <StageMenu
          state={
            stageMenu
          }
          moving={
            movingLeadId ===
            stageMenu.lead.id
          }
          onClose={() =>
            setStageMenu(null)
          }
          onMove={(
            stage,
          ) => {
            void moveLead(
              stageMenu.lead,
              stage,
            );
          }}
        />
      )}

      {/* ===================================================
          LOST MODAL
      =================================================== */}

      {showLost && (
        <LostLeadsModal
          leads={lostLeads}
          onClose={() =>
            setShowLost(false)
          }
          onRestore={(
            lead,
          ) => {
            void moveLead(
              lead,
              'NEW',
            );
          }}
        />
      )}
    </>
  );
}

/* =========================================================
   COLUMN
========================================================= */

function PipelineColumn({
  definition,
  leads,
  valueCents,
  totalCount,
  hasMore,
  isDragOver,
  draggedLeadId,
  movingLeadId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onOpenStageMenu,
}: {
  definition:
    PipelineColumnDefinition;

  leads:
    ApiLead[];

  valueCents:
    number;

  totalCount:
    number;

  hasMore:
    boolean;

  isDragOver:
    boolean;

  draggedLeadId:
    string | null;

  movingLeadId:
    string | null;

  onDragStart:
    (id: string) => void;

  onDragEnd:
    () => void;

  onDragOver:
    () => void;

  onDrop:
    () => void;

  onOpenStageMenu:
    (
      lead: ApiLead,
      rect: DOMRect,
    ) => void;
}) {
  return (
    <section
      onDragOver={(
        event,
      ) => {
        event.preventDefault();

        onDragOver();
      }}
      onDrop={(
        event,
      ) => {
        event.preventDefault();

        onDrop();
      }}
      className={`
        flex
        min-h-[520px]
        flex-col
        rounded-[18px]
        border
        p-3
        transition

        ${
          isDragOver
            ? `
                border-[var(--cf-primary)]/45
                bg-[var(--cf-primary-soft)]
              `
            : `
                border-[var(--cf-border)]
                bg-[var(--cf-surface-soft)]
              `
        }
      `}
    >
      <div
        className="
          rounded-xl
          border
          border-[var(--cf-border-soft)]
          bg-[var(--cf-surface)]
          p-3.5
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          <div>
            <StagePill
              stage={
                definition.stage
              }
              label={
                definition.label
              }
            />

            <p
              className="
                mt-2
                text-[11px]
                text-[var(--cf-text-muted)]
              "
            >
              {
                definition.helper
              }
            </p>
          </div>

          <span
            className="
              inline-flex
              min-w-7
              items-center
              justify-center
              rounded-full
              bg-[var(--cf-surface-soft)]
              px-2
              py-1
              text-[11px]
              font-semibold
              text-[var(--cf-text-secondary)]
            "
          >
            {totalCount}
          </span>
        </div>

        <div
          className="
            mt-3
            flex
            items-end
            justify-between
            gap-2
          "
        >
          <div>
            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.07em]
                text-[var(--cf-text-muted)]
              "
            >
              Stage value
            </p>

            <p
              className="
                mt-1
                text-[19px]
                font-semibold
                tracking-[-0.35px]
                text-[var(--cf-text)]
              "
            >
              {formatMoney(
                valueCents,
              )}
            </p>
          </div>

          {definition.stage ===
            'WON' && (
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-emerald-500/10
                text-emerald-600
              "
            >
              <Trophy
                size={16}
              />
            </div>
          )}
        </div>
      </div>

      <div
        className="
          mt-3
          grid
          gap-2.5
        "
      >
        {leads.map(
          (lead) => (
            <PipelineCard
              key={lead.id}
              lead={lead}
              isDragging={
                draggedLeadId ===
                lead.id
              }
              isMoving={
                movingLeadId ===
                lead.id
              }
              onDragStart={() =>
                onDragStart(
                  lead.id,
                )
              }
              onDragEnd={
                onDragEnd
              }
              onOpenStageMenu={(
                rect,
              ) =>
                onOpenStageMenu(
                  lead,
                  rect,
                )
              }
            />
          ),
        )}

        {leads.length === 0 && (
          <div
            className="
              flex
              min-h-[128px]
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-[var(--cf-border)]
              bg-[var(--cf-surface)]/60
              px-4
              text-center
            "
          >
            <p
              className="
                text-[12px]
                leading-5
                text-[var(--cf-text-muted)]
              "
            >
              Drop an opportunity
              here or change its
              stage from the card
              menu.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   CARD
========================================================= */

function PipelineCard({
  lead,
  isDragging,
  isMoving,
  onDragStart,
  onDragEnd,
  onOpenStageMenu,
}: {
  lead:
    ApiLead;

  isDragging:
    boolean;

  isMoving:
    boolean;

  onDragStart:
    () => void;

  onDragEnd:
    () => void;

  onOpenStageMenu:
    (rect: DOMRect) => void;
}) {
  const menuButtonRef =
    useRef<HTMLButtonElement | null>(
      null,
    );

  const followUp =
    getFollowUpState(
      lead,
    );

  const temperature =
    getTemperatureLabel(
      lead.temperature,
    );

  return (
    <article
      draggable
      onDragStart={
        onDragStart
      }
      onDragEnd={
        onDragEnd
      }
      className={`
        group
        rounded-[15px]
        border
        bg-[var(--cf-surface)]
        p-3.5
        shadow-[var(--cf-shadow)]
        transition-all

        ${
          isDragging
            ? `
                scale-[0.98]
                opacity-50
              `
            : `
                border-[var(--cf-border)]
                hover:-translate-y-[1px]
                hover:border-[var(--cf-primary)]/25
              `
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div
          className="
            flex
            min-w-0
            items-start
            gap-2.5
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
              bg-[var(--cf-primary-soft)]
              text-[11px]
              font-semibold
              text-[var(--cf-primary)]
            "
          >
            {getInitials(
              lead,
            )}
          </div>

          <div
            className="
              min-w-0
            "
          >
            <Link
              href={`/leads/${lead.id}`}
              className="
                block
                truncate
                text-[14px]
                font-semibold
                text-[var(--cf-text)]
                transition
                hover:text-[var(--cf-primary)]
              "
            >
              {getLeadName(
                lead,
              )}
            </Link>

            <p
              className="
                mt-0.5
                truncate
                text-[12px]
                text-[var(--cf-text-secondary)]
              "
            >
              {lead.company ||
                'No company'}
            </p>
          </div>
        </div>

        <button
          ref={
            menuButtonRef
          }
          type="button"
          onClick={() => {
            const rect =
              menuButtonRef.current?.getBoundingClientRect();

            if (rect) {
              onOpenStageMenu(
                rect,
              );
            }
          }}
          aria-label={`Actions for ${getLeadName(lead)}`}
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-[var(--cf-text-muted)]
            transition
            hover:bg-[var(--cf-surface-soft)]
            hover:text-[var(--cf-text)]
          "
        >
          {isMoving ? (
            <LoaderCircle
              size={15}
              className="
                animate-spin
              "
            />
          ) : (
            <MoreHorizontal
              size={16}
            />
          )}
        </button>
      </div>

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <p
          className="
            text-[18px]
            font-semibold
            tracking-[-0.35px]
            text-[var(--cf-text)]
          "
        >
          {formatMoney(
            lead.valueCents,
            lead.currency,
          )}
        </p>

        <TemperaturePill
          label={
            temperature
          }
        />
      </div>

      {followUp && (
        <div
          className={`
            mt-3
            inline-flex
            items-center
            gap-1.5
            rounded-lg
            px-2.5
            py-1.5
            text-[11px]
            font-semibold

            ${
              followUp.urgent
                ? `
                    bg-amber-500/10
                    text-amber-600
                  `
                : `
                    bg-[var(--cf-surface-soft)]
                    text-[var(--cf-text-secondary)]
                  `
            }
          `}
        >
          <Clock3
            size={11}
          />

          {
            followUp.label
          }
        </div>
      )}

      {lead.aiNextBestAction && (
        <div
          className="
            mt-3
            rounded-xl
            bg-[var(--cf-primary-soft)]
            px-3
            py-2.5
          "
        >
          <div
            className="
              flex
              items-center
              gap-1.5
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.07em]
              text-[var(--cf-primary)]
            "
          >
            <Sparkles
              size={10}
            />

            Next action
          </div>

          <p
            className="
              mt-1
              line-clamp-2
              text-[12px]
              leading-5
              text-[var(--cf-text-secondary)]
            "
          >
            {
              lead.aiNextBestAction
            }
          </p>
        </div>
      )}

      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          gap-2
          border-t
          border-[var(--cf-border-soft)]
          pt-3
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-1.5
            text-[11px]
            text-[var(--cf-text-muted)]
          "
        >
          <span
            className="
              truncate
            "
          >
            {getQualificationLabel(
              lead.qualification,
            )}
          </span>

          <span>
            ·
          </span>

          <span
            className="
              shrink-0
            "
          >
            {getLastActivity(
              lead,
            )}
          </span>
        </div>

        <div
          className="
            hidden
            text-[var(--cf-text-muted)]

            lg:block
          "
        >
          <GripVertical
            size={14}
          />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   STAGE MENU
========================================================= */

function StageMenu({
  state,
  moving,
  onClose,
  onMove,
}: {
  state:
    StageMenuState;

  moving:
    boolean;

  onClose:
    () => void;

  onMove:
    (
      stage:
        ApiLeadStage,
    ) => void;
}) {
  const [
    mounted,
    setMounted,
  ] =
    useState(false);

  const [
    mobile,
    setMobile,
  ] =
    useState(false);

  useEffect(() => {
    setMounted(true);

    const query =
      window.matchMedia(
        '(max-width: 767px)',
      );

    const sync = () => {
      setMobile(
        query.matches,
      );
    };

    sync();

    query.addEventListener(
      'change',
      sync,
    );

    return () => {
      query.removeEventListener(
        'change',
        sync,
      );
    };
  }, []);

  useEffect(() => {
    const close = (
      event:
        KeyboardEvent,
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      close,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        close,
      );
    };
  }, [onClose]);

  if (!mounted) {
    return null;
  }

  const width =
    235;

  const left =
    Math.min(
      window.innerWidth -
        width -
        12,
      Math.max(
        12,
        state.x -
          width,
      ),
    );

  const top =
    Math.min(
      window.innerHeight -
        440,
      Math.max(
        12,
        state.y + 8,
      ),
    );

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close stage menu"
        onClick={onClose}
        className={`
          fixed
          inset-0
          z-[190]

          ${
            mobile
              ? `
                  bg-slate-950/35
                  backdrop-blur-[2px]
                `
              : `
                  bg-transparent
                `
          }
        `}
      />

      <div
        style={
          mobile
            ? undefined
            : {
                left,
                top,
              }
        }
        className={`
          fixed
          z-[200]

          border
          border-[var(--cf-border)]

          bg-[var(--cf-surface)]

          shadow-[0_24px_65px_rgba(15,23,42,.24)]

          ${
            mobile
              ? `
                  bottom-3
                  left-3
                  right-3
                  rounded-[20px]
                  p-3
                `
              : `
                  w-[235px]
                  rounded-xl
                  p-2
                `
          }
        `}
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            border-b
            border-[var(--cf-border-soft)]
            px-2
            pb-2.5
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
                text-[var(--cf-text)]
              "
            >
              {getLeadName(
                state.lead,
              )}
            </p>

            <p
              className="
                mt-0.5
                text-[11px]
                text-[var(--cf-text-muted)]
              "
            >
              Move opportunity
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-[var(--cf-text-muted)]
              transition
              hover:bg-[var(--cf-surface-soft)]
            "
          >
            <X
              size={14}
            />
          </button>
        </div>

        <div
          className="
            mt-2
            grid
            gap-1
          "
        >
          {MOVABLE_STAGES.map(
            (item) => {
              const active =
                state.lead.stage ===
                item.stage;

              return (
                <button
                  key={
                    item.stage
                  }
                  type="button"
                  disabled={
                    moving
                  }
                  onClick={() =>
                    onMove(
                      item.stage,
                    )
                  }
                  className={`
                    flex
                    min-h-10
                    w-full
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    px-3
                    text-left
                    text-[13px]
                    font-medium
                    transition

                    ${
                      item.stage ===
                      'LOST'
                        ? `
                            text-red-600
                            hover:bg-red-500/10
                          `
                        : active
                          ? `
                              bg-[var(--cf-primary-soft)]
                              text-[var(--cf-primary)]
                            `
                          : `
                              text-[var(--cf-text)]
                              hover:bg-[var(--cf-surface-soft)]
                            `
                    }
                  `}
                >
                  <span>
                    {
                      item.label
                    }
                  </span>

                  {active && (
                    <Check
                      size={14}
                    />
                  )}
                </button>
              );
            },
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

/* =========================================================
   LOST MODAL
========================================================= */

function LostLeadsModal({
  leads,
  onClose,
  onRestore,
}: {
  leads:
    ApiLead[];

  onClose:
    () => void;

  onRestore:
    (
      lead:
        ApiLead,
    ) => void;
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
        z-[180]
        flex
        items-center
        justify-center
        bg-[rgba(10,15,30,.58)]
        px-4
        py-6
        backdrop-blur-[8px]
      "
    >
      <section
        className="
          flex
          max-h-[86vh]
          w-full
          max-w-[720px]
          flex-col
          overflow-hidden
          rounded-[22px]
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
            p-5
          "
        >
          <div>
            <p
              className="
                text-[12px]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-[var(--cf-text-muted)]
              "
            >
              Closed opportunities
            </p>

            <h2
              className="
                mt-1
                text-[23px]
                font-semibold
                tracking-[-0.4px]
                text-[var(--cf-text)]
              "
            >
              Lost leads
            </h2>

            <p
              className="
                mt-1
                text-[14px]
                leading-5
                text-[var(--cf-text-secondary)]
              "
            >
              Review lost
              opportunities or
              restore one to the
              active pipeline.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
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
              hover:text-[var(--cf-text)]
            "
          >
            <X
              size={17}
            />
          </button>
        </div>

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            p-4
          "
        >
          {leads.length >
          0 ? (
            <div
              className="
                grid
                gap-2
              "
            >
              {leads.map(
                (lead) => (
                  <div
                    key={
                      lead.id
                    }
                    className="
                      flex
                      flex-col
                      gap-3
                      rounded-xl
                      border
                      border-[var(--cf-border)]
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
                      <Link
                        href={`/leads/${lead.id}`}
                        className="
                          block
                          truncate
                          text-[14px]
                          font-semibold
                          text-[var(--cf-text)]
                          transition
                          hover:text-[var(--cf-primary)]
                        "
                      >
                        {getLeadName(
                          lead,
                        )}
                      </Link>

                      <p
                        className="
                          mt-1
                          text-[12px]
                          text-[var(--cf-text-secondary)]
                        "
                      >
                        {lead.company ||
                          'No company'}{' '}
                        ·{' '}
                        {formatMoney(
                          lead.valueCents,
                          lead.currency,
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onRestore(
                          lead,
                        )
                      }
                      className="
                        inline-flex
                        h-10
                        shrink-0
                        items-center
                        justify-center
                        gap-1.5
                        rounded-xl
                        border
                        border-[var(--cf-border)]
                        bg-[var(--cf-surface)]
                        px-3
                        text-[13px]
                        font-semibold
                        text-[var(--cf-text)]
                        transition
                        hover:bg-[var(--cf-primary-soft)]
                        hover:text-[var(--cf-primary)]
                      "
                    >
                      Restore to New

                      <ArrowRight
                        size={13}
                      />
                    </button>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div
              className="
                flex
                min-h-[240px]
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-[var(--cf-border)]
                bg-[var(--cf-surface-soft)]
                px-5
                text-center
              "
            >
              <p
                className="
                  max-w-[360px]
                  text-[14px]
                  leading-6
                  text-[var(--cf-text-muted)]
                "
              >
                No lost
                opportunities
                match the current
                pipeline search.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   SMALL UI
========================================================= */

function SummaryChip({
  label,
  primary = false,
  success = false,
}: {
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
        flex
        h-11
        items-center
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
      {label}
    </div>
  );
}

function StagePill({
  stage,
  label,
}: {
  stage:
    ApiLeadStage;

  label:
    string;
}) {
  const classes =
    stage === 'WON'
      ? `
          bg-emerald-500/10
          text-emerald-600
        `
      : stage ===
          'NEGOTIATION'
        ? `
            bg-amber-500/10
            text-amber-600
          `
        : stage ===
            'PROPOSAL'
          ? `
              bg-[var(--cf-primary-soft)]
              text-[var(--cf-primary)]
            `
          : stage ===
              'QUALIFIED'
            ? `
                bg-emerald-500/10
                text-emerald-600
              `
            : `
                bg-[var(--cf-surface-soft)]
                text-[var(--cf-text-secondary)]
              `;

  return (
    <span
      className={`
        inline-flex
        h-7
        items-center
        rounded-full
        px-2.5
        text-[11px]
        font-semibold
        ${classes}
      `}
    >
      {label}
    </span>
  );
}

function TemperaturePill({
  label,
}: {
  label:
    string;
}) {
  const classes =
    label === 'Hot'
      ? `
          bg-red-500/10
          text-red-600
        `
      : label ===
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
        ${classes}
      `}
    >
      {label ===
        'Hot' && (
        <Flame
          size={10}
        />
      )}

      {label}
    </span>
  );
}

/* =========================================================
   STATES
========================================================= */

function PipelineLoading() {
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
          Loading pipeline...
        </p>
      </div>
    </div>
  );
}

function PipelineEmpty({
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
        min-h-[360px]
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
        <CircleDollarSign
          size={20}
        />
      </div>

      <h2
        className="
          mt-4
          text-[20px]
          font-semibold
          text-[var(--cf-text)]
        "
      >
        No opportunities found
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
          ? 'No pipeline opportunities match your search.'
          : 'Add your first lead and start moving opportunities through the sales process.'}
      </p>

      {search ? (
        <button
          type="button"
          onClick={onClear}
          className="
            mt-5
            inline-flex
            h-10
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
          Clear search
        </button>
      ) : (
        <Link
          href="/leads"
          className="
            mt-5
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[var(--cf-primary)]
            px-4
            text-[13px]
            font-semibold
            text-white
          "
        >
          <Plus
            size={14}
          />

          Add lead
        </Link>
      )}
    </div>
  );
}
