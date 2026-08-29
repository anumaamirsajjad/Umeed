'use client';

import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef, useId } from 'react';

// rounded-lg (small-radius token), shared by text inputs and selects.
const fieldBase =
  'w-full rounded-lg border bg-surface dark:bg-surface-dark px-4 py-2.5 text-base ' +
  'text-ink-light dark:text-ink-dark placeholder:text-ink-light/50 dark:placeholder:text-ink-dark/50 ' +
  'transition-all duration-micro ease-umeed ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

function fieldBorder(hasError?: boolean) {
  return hasError
    ? 'border-red-500'
    : 'border-primary-200 dark:border-primary-900/50';
}

interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, hint, error, htmlFor, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-light dark:text-ink-dark">
          {label}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-ink-muted">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-700 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className = '', ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <FieldWrapper label={label} hint={hint} error={error} htmlFor={inputId}>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`${fieldBase} ${fieldBorder(!!error)} ${className}`}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, id, className = '', children, ...props }, ref) => {
    const autoId = useId();
    const selectId = id ?? autoId;
    return (
      <FieldWrapper label={label} hint={hint} error={error} htmlFor={selectId}>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error || undefined}
          className={`${fieldBase} ${fieldBorder(!!error)} ${className}`}
          {...props}
        >
          {children}
        </select>
      </FieldWrapper>
    );
  }
);
Select.displayName = 'Select';
