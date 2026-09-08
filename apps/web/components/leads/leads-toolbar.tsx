'use client';

import {
  ArrowDownUp,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';


/* =========================================================
   TYPES
========================================================= */

export type LeadFilter =
  | 'all'
  | 'hot'
  | 'warm'
  | 'attention';


export type LeadSort =
  | 'priority'
  | 'value-high'
  | 'value-low'
  | 'company';


interface LeadsToolbarProps {
  search: string;

  onSearchChange:
    (value: string) => void;

  filter: LeadFilter;

  onFilterChange:
    (value: LeadFilter) => void;

  sort: LeadSort;

  onSortChange:
    (value: LeadSort) => void;

  resultCount: number;
}


/* =========================================================
   FILTERS
========================================================= */

const filters: {
  label: string;
  value: LeadFilter;
}[] = [
  {
    label: 'All',
    value: 'all',
  },

  {
    label: 'Hot',
    value: 'hot',
  },

  {
    label: 'Warm',
    value: 'warm',
  },

  {
    label: 'Needs attention',
    value: 'attention',
  },
];


/* =========================================================
   FILTER STYLES
========================================================= */

function getFilterStyle(
  value: LeadFilter,
  active: boolean,
) {
  if (active) {
    if (value === 'hot') {
      return `
        border-red-500/30
        bg-red-500/10
        text-red-600

        dark:border-red-400/30
        dark:bg-red-400/10
        dark:text-red-300
      `;
    }


    if (value === 'warm') {
      return `
        border-amber-500/30
        bg-amber-500/12
        text-amber-700

        dark:border-amber-400/30
        dark:bg-amber-400/10
        dark:text-amber-300
      `;
    }


    if (value === 'attention') {
      return `
        border-[var(--cf-primary)]/30

        bg-[var(--cf-primary-soft)]

        text-[var(--cf-primary)]
      `;
    }


    return `
      border-[var(--cf-primary)]/25

      bg-[var(--cf-primary-soft)]

      text-[var(--cf-primary)]
    `;
  }


  return `
    border-[var(--cf-border)]

    bg-[var(--cf-surface)]

    text-[var(--cf-text-secondary)]

    hover:border-[var(--cf-primary)]/25
    hover:bg-[var(--cf-surface-hover)]
    hover:text-[var(--cf-text)]
  `;
}


/* =========================================================
   COMPONENT
========================================================= */

export function LeadsToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  resultCount,
}: LeadsToolbarProps) {
  return (
    <div
      className="
        rounded-[16px]

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

          xl:flex-row
          xl:items-center
          xl:justify-between
        "
      >
        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div
          className="
            flex
            min-w-0
            flex-1
            flex-col
            gap-3

            lg:flex-row
            lg:items-center
          "
        >
          {/* ===============================================
              SEARCH
          =============================================== */}

          <div
            className="
              relative

              w-full

              lg:max-w-[360px]
            "
          >
            <Search
              size={17}
              strokeWidth={1.9}
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
              onChange={(event) =>
                onSearchChange(
                  event.target.value,
                )
              }
              placeholder="Search leads..."
              aria-label="Search leads"
              className="
                h-12
                w-full

                rounded-xl

                border
                border-[var(--cf-border)]

                bg-[var(--cf-surface-soft)]

                pl-10
                pr-10

                text-[14px]
                font-medium

                text-[var(--cf-text)]

                outline-none

                transition-all

                placeholder:font-normal
                placeholder:text-[var(--cf-text-muted)]

                hover:border-[var(--cf-primary)]/25

                focus:border-[var(--cf-primary)]
                focus:bg-[var(--cf-surface)]

                focus:ring-4
                focus:ring-[var(--cf-primary-soft)]

                sm:text-[15px]
              "
            />


            {search && (
              <button
                type="button"
                onClick={() =>
                  onSearchChange('')
                }
                aria-label="Clear search"
                data-tooltip="Clear search"
                data-tooltip-position="top"
                className="
                  absolute
                  right-2
                  top-1/2

                  flex
                  h-8
                  w-8
                  -translate-y-1/2
                  items-center
                  justify-center

                  rounded-lg

                  text-[var(--cf-text-muted)]

                  transition

                  hover:bg-[var(--cf-surface-hover)]
                  hover:text-[var(--cf-text)]

                  active:scale-[0.95]
                "
              >
                <X
                  size={14}
                />
              </button>
            )}
          </div>


          {/* ===============================================
              FILTERS

              Mobile:
              clean 2-column grid.

              Tablet/Desktop:
              same buttons become one horizontal row.
          =============================================== */}

          <div
            className="
              grid
              w-full
              grid-cols-2
              gap-2

              sm:flex
              sm:w-auto
              sm:flex-wrap
              sm:items-center
            "
          >
            {filters.map(
              (item) => {
                const active =
                  filter ===
                  item.value;


                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      onFilterChange(
                        item.value,
                      )
                    }
                    aria-pressed={active}
                    className={`
                      flex
                      h-10
                      min-w-0
                      items-center
                      justify-center
                      gap-2

                      whitespace-nowrap

                      rounded-xl

                      border

                      px-3

                      text-[13px]
                      font-semibold

                      transition-all
                      duration-150

                      active:scale-[0.97]

                      sm:h-11
                      sm:px-3.5
                      sm:text-[14px]

                      ${getFilterStyle(
                        item.value,
                        active,
                      )}
                    `}
                  >
                    {/* All */}

                    {item.value ===
                      'all' && (
                      <span
                        className={`
                          h-1.5
                          w-1.5
                          shrink-0

                          rounded-full

                          ${
                            active
                              ? 'bg-[var(--cf-primary)]'
                              : 'bg-[var(--cf-text-muted)]'
                          }
                        `}
                      />
                    )}


                    {/* Hot */}

                    {item.value ===
                      'hot' && (
                      <span
                        className="
                          h-2
                          w-2
                          shrink-0

                          rounded-full

                          bg-red-500
                        "
                      />
                    )}


                    {/* Warm */}

                    {item.value ===
                      'warm' && (
                      <span
                        className="
                          h-2
                          w-2
                          shrink-0

                          rounded-full

                          bg-amber-500
                        "
                      />
                    )}


                    {/* Needs attention */}

                    {item.value ===
                      'attention' && (
                      <Sparkles
                        size={13}
                        strokeWidth={2}
                        className="
                          shrink-0

                          text-[var(--cf-primary)]
                        "
                      />
                    )}


                    <span
                      className="
                        truncate
                      "
                    >
                      {item.label}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>


        {/* =================================================
            BOTTOM / RIGHT CONTROLS
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          {/* Result count - desktop */}

          <span
            className="
              hidden

              whitespace-nowrap

              text-[12px]
              font-semibold

              text-[var(--cf-text-secondary)]

              xl:block
            "
          >
            {resultCount}{' '}

            {resultCount === 1
              ? 'lead'
              : 'leads'}
          </span>


          {/* ===============================================
              SORT
          =============================================== */}

          <div
            className="
              relative

              min-w-0
              flex-1

              sm:flex-none
            "
          >
            <ArrowDownUp
              size={15}
              strokeWidth={1.9}
              className="
                pointer-events-none

                absolute
                left-3
                top-1/2

                -translate-y-1/2

                text-[var(--cf-text-secondary)]
              "
            />


            <select
              value={sort}
              onChange={(event) =>
                onSortChange(
                  event.target
                    .value as LeadSort,
                )
              }
              aria-label="Sort leads"
              className="
                h-11
                w-full

                appearance-none

                rounded-xl

                border
                border-[var(--cf-border)]

                bg-[var(--cf-surface)]

                pl-9
                pr-8

                text-[13px]
                font-semibold

                text-[var(--cf-text-secondary)]

                outline-none

                transition-all

                hover:bg-[var(--cf-surface-soft)]
                hover:text-[var(--cf-text)]

                focus:border-[var(--cf-primary)]
                focus:ring-2
                focus:ring-[var(--cf-primary-soft)]

                sm:w-[185px]
                sm:text-[14px]
              "
            >
              <option
                value="priority"
              >
                Highest priority
              </option>

              <option
                value="value-high"
              >
                Highest value
              </option>

              <option
                value="value-low"
              >
                Lowest value
              </option>

              <option
                value="company"
              >
                Company A-Z
              </option>
            </select>
          </div>


          {/* ===============================================
              ADD LEAD
          =============================================== */}

          <button
            type="button"
            aria-label="Add lead"
            data-tooltip="Create a new lead"
            data-tooltip-position="top"
            className="
              flex
              h-11
              shrink-0
              items-center
              justify-center
              gap-2

              rounded-xl

              bg-[var(--cf-primary)]

              px-3.5

              text-[13px]
              font-semibold
              text-white

              shadow-[0_6px_18px_rgba(91,91,247,.18)]

              transition-all

              hover:-translate-y-[1px]
              hover:bg-[var(--cf-primary-hover)]

              active:scale-[0.98]

              sm:px-4
              sm:text-[14px]
            "
          >
            <Plus
              size={16}
              strokeWidth={2.2}
            />


            <span
              className="
                inline

                sm:hidden
              "
            >
              Add
            </span>


            <span
              className="
                hidden

                sm:inline
              "
            >
              Add lead
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}