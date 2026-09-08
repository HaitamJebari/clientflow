'use client';

import {
  Sparkles,
  UsersRound,
} from 'lucide-react';

import {
  useMemo,
  useState,
} from 'react';

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


/* =========================================================
   TEMPORARY MVP DATA

   This will be replaced with:
   GET /api/v1/leads

   AI fields are currently UI preview data.
========================================================= */

const leads: Lead[] = [
  {
    id: 'lead-1',

    firstName: 'Sarah',
    lastName: 'Miller',

    email: 'sarah@acmestudio.com',

    company: 'Acme Studio',

    initials: 'SM',

    value: 8500,

    stage: 'Proposal',

    temperature: 'Hot',

    qualification: 'Strong fit',

    source: 'Referral',

    lastActivity: '20 min ago',

    signal: 'Proposal viewed 3×',

    insight:
      'High-value opportunity with recent proposal engagement. No response for 4 days.',

    actionLabel:
      'Review follow-up',

    actionHint:
      'Follow up today while proposal engagement is still recent.',

    needsAttention: true,

    priority: 100,
  },

  {
    id: 'lead-2',

    firstName: 'James',
    lastName: 'Carter',

    email: 'james@techcorp.io',

    company: 'TechCorp',

    initials: 'JC',

    value: 6000,

    stage: 'Qualified',

    temperature: 'Hot',

    qualification: 'Strong fit',

    source: 'Website',

    lastActivity: '2 hours ago',

    signal: 'Scope confirmed',

    insight:
      'Budget, scope and project timeline are clear. This lead is ready for a proposal.',

    actionLabel:
      'Create proposal',

    actionHint:
      'Create the proposal while requirements are fresh.',

    needsAttention: true,

    priority: 95,
  },

  {
    id: 'lead-3',

    firstName: 'Lina',
    lastName: 'Benali',

    email: 'lina@startupx.co',

    company: 'StartupX',

    initials: 'LB',

    value: 5000,

    stage: 'Qualified',

    temperature: 'Warm',

    qualification: 'Good fit',

    source: 'LinkedIn',

    lastActivity: '3 hours ago',

    signal: 'Timeline question',

    insight:
      'The lead asked about delivery timing and is waiting for a response.',

    actionLabel:
      'Reply to timeline',

    actionHint:
      'Answer the timeline question before the conversation loses momentum.',

    needsAttention: true,

    priority: 90,
  },

  {
    id: 'lead-4',

    firstName: 'Daniel',
    lastName: 'Brooks',

    email: 'daniel@atlasdigital.com',

    company: 'Atlas Digital',

    initials: 'DB',

    value: 4600,

    stage: 'Negotiation',

    temperature: 'Hot',

    qualification: 'Strong fit',

    source: 'Outbound',

    lastActivity: '5 hours ago',

    signal: 'Pricing discussion',

    insight:
      'The deal has reached pricing negotiation. Scope remains aligned.',

    actionLabel:
      'Prepare negotiation',

    actionHint:
      'Review pricing and negotiation points before replying.',

    needsAttention: false,

    priority: 82,
  },

  {
    id: 'lead-5',

    firstName: 'Omar',
    lastName: 'Hassan',

    email: 'omar@northstarlabs.com',

    company: 'Northstar Labs',

    initials: 'OH',

    value: 3500,

    stage: 'New',

    temperature: 'Warm',

    qualification:
      'Needs discovery',

    source: 'Website',

    lastActivity: '1 day ago',

    signal: 'Budget unknown',

    insight:
      'The project looks relevant, but budget and decision timeline are still missing.',

    actionLabel:
      'Qualify lead',

    actionHint:
      'Ask about budget, timeline and decision process.',

    needsAttention: false,

    priority: 62,
  },

  {
    id: 'lead-6',

    firstName: 'Emma',
    lastName: 'Wilson',

    email: 'emma@brightline.design',

    company: 'Brightline',

    initials: 'EW',

    value: 2800,

    stage: 'Proposal',

    temperature: 'Warm',

    qualification: 'Good fit',

    source: 'Referral',

    lastActivity: '2 days ago',

    signal: 'Proposal delivered',

    insight:
      'The proposal was delivered but there has not been meaningful engagement yet.',

    actionLabel:
      'Check proposal',

    actionHint:
      'Check whether the proposal needs clarification before following up.',

    needsAttention: false,

    priority: 56,
  },
];


/* =========================================================
   PAGE
========================================================= */

export default function LeadsPage() {
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
              ].some((value) =>
                value
                  .toLowerCase()
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
          },
        );


      result = [...result];


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
      search,
      filter,
      sort,
    ]);


  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalValue =
    leads.reduce(
      (total, lead) =>
        total +
        lead.value,
      0,
    );


  const attentionCount =
    leads.filter(
      (lead) =>
        lead.needsAttention,
    ).length;


  const currency =
    new Intl.NumberFormat(
      'en-IE',
      {
        style: 'currency',

        currency: 'EUR',

        maximumFractionDigits: 0,
      },
    ).format(totalValue);


  return (
    <div
      className="
        cf-dashboard-enter

        min-w-0

        text-[var(--cf-text)]
      "
    >
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div
        className="
          flex
          flex-col
          justify-between
          gap-6

          xl:flex-row
          xl:items-end
        "
      >
        <div
          className="
            min-w-0
          "
        >
          {/* Workspace label */}

          <div
            className="
              mb-3

              flex
              items-center
              gap-2

              text-[11px]
              font-bold
              uppercase
              tracking-[0.15em]

              text-[var(--cf-text-secondary)]

              sm:text-[12px]
            "
          >
            <span
              className="
                h-2
                w-2

                shrink-0

                rounded-full

                bg-[var(--cf-primary)]
              "
            />

            Sales workspace
          </div>


          {/* Main title */}

          <h1
            className="
              text-[30px]
              font-semibold
              leading-[1.1]
              tracking-[-1px]

              text-[var(--cf-text)]

              sm:text-[38px]

              lg:text-[48px]
              lg:tracking-[-1.5px]
            "
          >
            Leads
          </h1>


          {/* Description */}

          <p
            className="
              mt-3

              max-w-[760px]

              text-[14px]
              font-medium
              leading-6

              text-[var(--cf-text-secondary)]

              sm:text-[16px]
              sm:leading-7
            "
          >
            Prioritize the leads most likely
            to move forward and know exactly
            what action to take next.
          </p>
        </div>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <div
          className="
            flex
            flex-wrap
            gap-2.5
          "
        >
          <SummaryChip
            icon={
              <UsersRound
                size={15}
              />
            }
            label={`${leads.length} active leads`}
          />


          <SummaryChip
            icon={
              <Sparkles
                size={15}
              />
            }
            label={`${attentionCount} need attention`}
            primary
          />


          <SummaryChip
            label={`${currency} potential`}
          />
        </div>
      </div>


      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <div
        className="
          mt-7

          sm:mt-8
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
        />
      </div>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          mt-4
        "
      >
        {filteredLeads.length >
        0 ? (
          <>
            {/* Desktop */}

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


            {/* Mobile / Tablet */}

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
        min-h-10
        items-center
        gap-2

        rounded-xl

        border

        px-3.5
        py-2

        text-[12px]
        font-semibold

        sm:text-[13px]

        ${
          primary
            ? `
              border-[var(--cf-primary)]/25

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

      <span
        className="
          whitespace-nowrap
        "
      >
        {label}
      </span>
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
        min-h-[380px]
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

          text-[21px]
          font-semibold

          text-[var(--cf-text)]

          sm:text-[23px]
        "
      >
        No leads found
      </h2>


      <p
        className="
          mt-2

          max-w-[460px]

          text-[14px]
          font-medium
          leading-6

          text-[var(--cf-text-secondary)]

          sm:text-[15px]
        "
      >
        {search
          ? `No leads match “${search}”. Try another search or clear your filters.`
          : 'There are no leads matching the current filter.'}
      </p>


      <button
        type="button"
        onClick={onClear}
        data-tooltip="Show all leads"
        data-tooltip-position="top"
        className="
          mt-5

          h-11

          rounded-lg

          bg-[var(--cf-primary)]

          px-5

          text-[14px]
          font-semibold
          text-white

          transition

          hover:bg-[var(--cf-primary-hover)]

          active:scale-[0.98]
        "
      >
        Clear filters
      </button>
    </div>
  );
}