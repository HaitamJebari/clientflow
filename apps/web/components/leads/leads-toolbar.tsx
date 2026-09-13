'use client';

import {
  ArrowDownUp,
  Plus,
  Search,
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

  onSearchChange: (
    value: string,
  ) => void;

  filter: LeadFilter;

  onFilterChange: (
    value: LeadFilter,
  ) => void;

  sort: LeadSort;

  onSortChange: (
    value: LeadSort,
  ) => void;

  resultCount: number;

  onAddLead: () => void;
}

/* =========================================================
   FILTERS
========================================================= */

const filters: {
  label: string;
  value: LeadFilter;
  dotClassName?: string;
}[] = [
  {
    label: 'All',
    value: 'all',
  },

  {
    label: 'Hot',
    value: 'hot',

    // Red point next to "Hot"
    dotClassName:
      'bg-red-500',
  },

  {
    label: 'Warm',
    value: 'warm',

    // Orange point next to "Warm"
    dotClassName:
      'bg-amber-500',
  },

  {
    label: 'Needs attention',
    value: 'attention',
  },
];

/* =========================================================
   TOOLBAR
========================================================= */

export function LeadsToolbar({
  search,
  onSearchChange,

  filter,
  onFilterChange,

  sort,
  onSortChange,

  resultCount,

  onAddLead,
}: LeadsToolbarProps) {
  return (
    <div
      className="
        rounded-[18px]

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
          flex-col
          gap-4
        "
      >
        {/* =================================================
            SEARCH
        ================================================= */}

        <div
          className="
            relative
            w-full
          "
        >
          <Search
            size={18}
            strokeWidth={1.8}
            className="
              pointer-events-none

              absolute
              left-4
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

              pl-11
              pr-11

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
            "
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                onSearchChange('')
              }
              aria-label="Clear search"
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

                hover:bg-[var(--cf-surface-soft)]
                hover:text-[var(--cf-text)]
              "
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* =================================================
            FILTERS + SORT + ADD
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-3

            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* FILTERS */}

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            {filters.map(
              (item) => {
                const active =
                  filter ===
                  item.value;

                return (
                  <button
                    key={
                      item.value
                    }
                    type="button"
                    onClick={() =>
                      onFilterChange(
                        item.value,
                      )
                    }
                    className={`
                      inline-flex
                      h-11

                      items-center
                      gap-2

                      rounded-xl

                      border

                      px-4

                      text-[14px]
                      font-medium

                      transition-all

                      ${
                        active
                          ? `
                              border-[var(--cf-primary)]/25

                              bg-[var(--cf-primary-soft)]

                              text-[var(--cf-primary)]

                              shadow-[0_1px_4px_rgba(0,0,0,.05)]
                            `
                          : `
                              border-[var(--cf-border)]

                              bg-[var(--cf-surface)]

                              text-[var(--cf-text-secondary)]

                              hover:bg-[var(--cf-surface-soft)]
                              hover:text-[var(--cf-text)]
                            `
                      }
                    `}
                  >
                    {item.value ===
                    'attention' ? (
                      <span
                        className="
                          text-[15px]
                          leading-none

                          text-[var(--cf-primary)]
                        "
                      >
                        ✦
                      </span>
                    ) : item.dotClassName ? (
                      <span
                        className={`
                          h-2
                          w-2

                          shrink-0

                          rounded-full

                          ${item.dotClassName}
                        `}
                      />
                    ) : null}

                    <span>
                      {item.label}
                    </span>
                  </button>
                );
              },
            )}
          </div>

          {/* RESULT + SORT + ADD */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3

              sm:flex-nowrap

              lg:justify-end
            "
          >
            <span
              className="
                whitespace-nowrap

                text-[13px]
                font-medium

                text-[var(--cf-text-muted)]
              "
            >
              {resultCount}{' '}
              {resultCount === 1
                ? 'lead'
                : 'leads'}
            </span>

            {/* SORT */}

            <div
              className="
                relative

                min-w-[190px]

                flex-1

                sm:flex-none
              "
            >
              <ArrowDownUp
                size={15}
                className="
                  pointer-events-none

                  absolute
                  left-3.5
                  top-1/2

                  z-10

                  -translate-y-1/2

                  text-[var(--cf-text-muted)]
                "
              />

              <select
                value={sort}
                onChange={(
                  event,
                ) =>
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

                  pl-10
                  pr-9

                  text-[14px]
                  font-medium

                  text-[var(--cf-text)]

                  outline-none

                  transition

                  hover:bg-[var(--cf-surface-soft)]

                  focus:border-[var(--cf-primary)]
                  focus:ring-4
                  focus:ring-[var(--cf-primary-soft)]
                "
              >
                <option value="priority">
                  Highest priority
                </option>

                <option value="value-high">
                  Highest value
                </option>

                <option value="value-low">
                  Lowest value
                </option>

                <option value="company">
                  Company A-Z
                </option>
              </select>
            </div>

            {/* ADD LEAD */}

            <button
              type="button"
              onClick={onAddLead}
              className="
                inline-flex
                h-11

                shrink-0

                items-center
                justify-center
                gap-2

                rounded-xl

                bg-[var(--cf-primary)]

                px-5

                text-[14px]
                font-semibold

                text-white

                shadow-[0_6px_16px_rgba(91,91,247,.22)]

                transition-all

                hover:-translate-y-[1px]
                hover:bg-[var(--cf-primary-hover)]

                active:translate-y-0
              "
            >
              <Plus
                size={16}
                strokeWidth={2}
              />

              Add lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}