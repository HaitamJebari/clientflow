'use client';

import {
  Moon,
  Sun,
} from 'lucide-react';

import {
  useTheme,
} from 'next-themes';

import {
  useEffect,
  useState,
} from 'react';

export function ThemeToggle() {
  const {
    resolvedTheme,
    setTheme,
  } = useTheme();

  const [
    mounted,
    setMounted,
  ] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="
          h-10
          w-10

          rounded-lg

          border
          border-[var(--cf-border)]

          bg-[var(--cf-surface)]
        "
      />
    );
  }

  const isDark =
    resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={
        isDark
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      }
      data-tooltip={
        isDark
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      }
      onClick={() =>
        setTheme(
          isDark
            ? 'light'
            : 'dark',
        )
      }
      className="
        group
        relative

        flex
        h-10
        w-10

        items-center
        justify-center

        rounded-lg

        border
        border-[var(--cf-border)]

        bg-[var(--cf-surface)]

        text-[var(--cf-text-secondary)]

        transition-all
        duration-200

        hover:bg-[var(--cf-surface-soft)]
        hover:text-[var(--cf-text)]
      "
    >
      <span
        className="
          transition-all
          duration-200

          group-hover:rotate-12
          group-hover:scale-110
        "
      >
        {isDark ? (
          <Sun
            size={16}
            strokeWidth={1.8}
          />
        ) : (
          <Moon
            size={16}
            strokeWidth={1.8}
          />
        )}
      </span>
    </button>
  );
}