'use client';

import { useTheme } from '@/lib/useTheme';

// Persistent dark-mode toggle, fixed top-right on every screen per design spec.
export function MoonToggle() {
  const [theme, setTheme] = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-pill
        bg-surface text-ink-light shadow-sm border border-primary-100
        hover:bg-primary-50 active:bg-primary-100
        dark:bg-surface-darker dark:text-ink-dark dark:border-primary-900/40 dark:hover:bg-primary-900/20"
    >
      {isDark ? (
        <svg className="icon-inline" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          />
        </svg>
      ) : (
        <svg className="icon-inline" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.7 14.3A8.5 8.5 0 019.7 3.3a.75.75 0 00-.9-1 10 10 0 1013 12.9.75.75 0 00-1.1-.9z" />
        </svg>
      )}
    </button>
  );
}

export default MoonToggle;
