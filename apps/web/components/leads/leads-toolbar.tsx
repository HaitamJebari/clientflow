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
    dotClassName: 'bg-red-500',
  },

  {
    label: 'Warm',
    value: 'warm',
    dotClassName: 'bg-amber-500',
  },

  {
    label: 'Needs attention',
    value: 'attention',
  },
];

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
  onAddLead,
}: LeadsToolbarProps) {
  return (
    <section
      className="
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

          sm:gap-4
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
                hover:bg-[var(--cf-surface-hover)]
                hover:text-[var(--cf-text)]
              "
            >
              <X
                size={15}
              />
            </button>
          )}
        </div>

        {/* =================================================
            MOBILE FILTERS
            No horizontal clipping:
            All / Hot / Warm on row 1
            Needs attention full width on row 2
        ================================================= */}

        <div
          className="
            grid
            grid-cols-3
            gap-2

            lg:hidden
          "
        >
          {filters
            .filter(
              (item) =>
                item.value !==
                'attention',
            )
            .map(
              (item) => (
                <FilterButton
                  key={
                    item.value
                  }
                  item={item}
                  active={
                    filter ===
                    item.value
                  }
                  onClick={() =>
                    onFilterChange(
                      item.value,
                    )
                  }
                  mobileFull
                />
              ),
            )}

          <div
            className="
              col-span-3
            "
          >
            <FilterButton
              item={
                filters.find(
                  (item) =>
                    item.value ===
                    'attention',
                )!
              }
              active={
                filter ===
                'attention'
              }
              onClick={() =>
                onFilterChange(
                  'attention',
                )
              }
              mobileFull
            />
          </div>
        </div>

        {/* =================================================
            MOBILE / TABLET CONTROLS
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-2.5

            lg:hidden
          "
        >
          <div
            className="
              px-0.5
            "
          >
            <span
              className="
                text-[12px]
                font-medium
                text-[var(--cf-text-muted)]
              "
            >
              {resultCount}{' '}
              {resultCount === 1
                ? 'lead'
                : 'leads'}
            </span>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-2

              min-[360px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]
            "
          >
            <SortSelect
              sort={sort}
              onSortChange={
                onSortChange
              }
              mobile
            />

            <AddLeadButton
              onClick={
                onAddLead
              }
              mobile
            />
          </div>
        </div>

        {/* =================================================
            DESKTOP
        ================================================= */}

        <div
          className="
            hidden

            lg:flex
            lg:items-center
            lg:justify-between
            lg:gap-4
          "
        >
          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            {filters.map(
              (item) => (
                <FilterButton
                  key={
                    item.value
                  }
                  item={item}
                  active={
                    filter ===
                    item.value
                  }
                  onClick={() =>
                    onFilterChange(
                      item.value,
                    )
                  }
                />
              ),
            )}
          </div>

          <div
            className="
              flex
              shrink-0
              items-center
              gap-3
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

            <SortSelect
              sort={sort}
              onSortChange={
                onSortChange
              }
            />

            <AddLeadButton
              onClick={
                onAddLead
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  item,
  active,
  onClick,
  mobileFull = false,
}: {
  item: {
    label: string;
    value: LeadFilter;
    dotClassName?: string;
  };

  active: boolean;

  onClick: () => void;

  mobileFull?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        h-11
        shrink-0
        items-center
        justify-center
        gap-2
        whitespace-nowrap
        rounded-xl

        ${mobileFull
          ? 'w-full px-2'
          : 'px-4'
        }
        border
        text-[14px]
        font-medium
        transition-all
        duration-150
        active:scale-[0.98]

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
}

/* =========================================================
   SORT
========================================================= */

function SortSelect({
  sort,
  onSortChange,
  mobile = false,
}: {
  sort: LeadSort;

  onSortChange: (
    value: LeadSort,
  ) => void;

  mobile?: boolean;
}) {
  return (
    <div
      className={`
        relative
        min-w-0

        ${
          mobile
            ? 'w-full'
            : 'w-[190px]'
        }
      `}
    >
      <ArrowDownUp
        size={15}
        className="
          pointer-events-none
          absolute
          left-3
          top-1/2
          z-10
          -translate-y-1/2
          text-[var(--cf-text-muted)]
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
        className={`
          h-11
          w-full
          min-w-0
          appearance-none
          rounded-xl
          border
          border-[var(--cf-border)]
          bg-[var(--cf-surface)]
          pl-9
          pr-7
          font-medium
          text-[var(--cf-text)]
          outline-none
          transition
          hover:bg-[var(--cf-surface-soft)]
          focus:border-[var(--cf-primary)]
          focus:ring-4
          focus:ring-[var(--cf-primary-soft)]

          ${
            mobile
              ? 'text-[13px]'
              : 'text-[14px]'
          }
        `}
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
  );
}

/* =========================================================
   ADD LEAD
========================================================= */

function AddLeadButton({
  onClick,
  mobile = false,
}: {
  onClick: () => void;
  mobile?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        h-11
        shrink-0
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-[var(--cf-primary)]
        font-semibold
        text-white
        shadow-[0_6px_16px_rgba(91,91,247,.22)]
        transition-all
        hover:-translate-y-[1px]
        hover:bg-[var(--cf-primary-hover)]
        active:translate-y-0
        active:scale-[0.98]

        ${
          mobile
            ? `
                w-full
                px-3
                text-[14px]
              `
            : `
                px-5
                text-[14px]
              `
        }
      `}
    >
      <Plus
        size={16}
        strokeWidth={2}
      />

      <span>
        Add lead
      </span>
    </button>
  );
}
