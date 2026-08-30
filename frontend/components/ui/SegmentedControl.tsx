'use client';

import { useRef } from 'react';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
}

// Light pill toggle, rounded-lg segments inside a rounded-lg track.
// Implements the radiogroup keyboard contract: one tab stop for the whole
// group (roving tabindex), arrows move between options and select as they go.
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.max(
    options.findIndex((o) => o.value === value),
    0
  );

  const move = (delta: number) => {
    const next = (selectedIndex + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        move(1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        move(-1);
        break;
      case 'Home':
        e.preventDefault();
        onChange(options[0].value);
        refs.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        onChange(options[options.length - 1].value);
        refs.current[options.length - 1]?.focus();
        break;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className="inline-flex flex-wrap gap-1 rounded-lg bg-primary-50 dark:bg-surface-dark p-1 border border-primary-100 dark:border-primary-900/40"
    >
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={i === selectedIndex ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={
              `rounded-lg px-3 py-1.5 min-h-11 text-sm font-medium transition-all duration-micro ease-umeed ` +
              (selected
                ? 'bg-surface dark:bg-primary-800 text-primary-900 dark:text-primary-50 shadow-sm'
                : 'text-ink-muted hover:text-ink-light dark:hover:text-ink-dark')
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
