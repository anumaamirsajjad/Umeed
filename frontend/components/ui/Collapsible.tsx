'use client';

import { useId, useState } from 'react';
import { Card } from './Card';

interface CollapsibleProps {
  title: string;
  icon?: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Collapsible({ title, icon, description, defaultOpen = true, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <Card padding="md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <div>
          <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-100">
            {icon && <span aria-hidden="true">{icon} </span>}
            {title}
          </h2>
          {description && (
            <p className="text-sm text-ink-light/70 dark:text-ink-dark/70 mt-1">{description}</p>
          )}
        </div>
        <svg
          className={`icon-inline flex-shrink-0 mt-1 transition-transform duration-micro ease-umeed ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div id={panelId} className="mt-4">
          {children}
        </div>
      )}
    </Card>
  );
}
