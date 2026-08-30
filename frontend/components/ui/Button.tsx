'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

// rounded-lg (small-radius token) for every button, per design system.
const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold ' +
  'transition-all duration-micro ease-umeed disabled:opacity-50 disabled:cursor-not-allowed ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 ' +
    // Fixed dark ink for text-on-accent, independent of the `surface-darker`
    // elevation token (that one moves for card/bubble elevation; this button
    // text needs to stay dark against primary-500 regardless).
    'focus-visible:outline-primary-600 dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-[#17181C]',
  secondary:
    'bg-accent-100 text-accent-900 hover:bg-accent-200 active:bg-accent-300 ' +
    'focus-visible:outline-accent-500 dark:bg-accent-900/40 dark:text-accent-100 dark:hover:bg-accent-900/60',
  ghost:
    'bg-transparent text-primary-800 hover:bg-primary-100 active:bg-primary-200 ' +
    'focus-visible:outline-primary-500 dark:text-primary-100 dark:hover:bg-white/5',
  // Reserved for crisis-adjacent actions — not general destructive UI.
  danger:
    'bg-crisis-600 text-white hover:bg-crisis-700 active:bg-crisis-700 focus-visible:outline-crisis-600',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2.5',
  lg: 'text-lg px-6 py-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="icon-inline animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
