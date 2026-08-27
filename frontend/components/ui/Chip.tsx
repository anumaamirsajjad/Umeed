'use client';

import { ButtonHTMLAttributes } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
}

// rounded-lg (small-radius token) — multi-select chip, used with aria-pressed for a11y.
export function Chip({ selected, className = '', children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={
        `rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-micro ease-umeed ` +
        (selected
          ? 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600'
          : 'bg-surface border-primary-200 text-ink-light hover:border-primary-400 hover:bg-primary-50 ' +
            'dark:bg-surface-dark dark:border-primary-900/50 dark:text-ink-dark dark:hover:bg-primary-900/20') +
        ` ${className}`
      }
      {...props}
    >
      {children}
    </button>
  );
}
