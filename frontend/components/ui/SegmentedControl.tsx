'use client';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
}

// Light pill toggle, rounded-lg segments inside a rounded-lg track.
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 rounded-lg bg-primary-50 dark:bg-surface-dark p-1 border border-primary-100 dark:border-primary-900/40"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={
              `rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-micro ease-umeed ` +
              (selected
                ? 'bg-surface dark:bg-primary-800 text-primary-900 dark:text-primary-50 shadow-sm'
                : 'text-ink-muted hover:text-ink-light dark:hover:text-ink-dark')
            }
          >
            {option.icon && <span aria-hidden="true">{option.icon} </span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
