'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export type NavTab = 'talk' | 'plan' | 'support';

interface BottomNavProps {
  active: NavTab;
}

const TABS: { tab: NavTab; href: string; label: string; icon: JSX.Element }[] = [
  {
    tab: 'talk',
    href: ROUTES.chat,
    label: 'Talk',
    icon: (
      <path d="M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H9l-4 4v-4H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
    ),
  },
  {
    tab: 'plan',
    href: ROUTES.safetyPlanBuilder,
    label: 'My plan',
    icon: (
      <path d="M12 2l8 3v6c0 5-3.4 8.9-8 11-4.6-2.1-8-6-8-11V5l8-3z" />
    ),
  },
  {
    tab: 'support',
    href: ROUTES.resources,
    label: 'Support',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16.5v.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </>
    ),
  },
];

// Persistent bottom tab nav for the three main app sections. Active tab gets
// a light coral pill behind the icon+label per design spec.
export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 dark:bg-surface-darker/95 backdrop-blur
        border-t border-primary-100 dark:border-primary-900/40 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto flex items-stretch justify-around px-2 py-2">
        {TABS.map(({ tab, href, label, icon }) => {
          const isActive = tab === active;
          return (
            <Link
              key={tab}
              href={href}
              className={`flex flex-col items-center gap-1 min-w-[4.5rem] px-3 py-2 rounded-pill text-xs font-medium
                transition-all duration-micro ease-umeed
                ${
                  isActive
                    ? 'bg-secondary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-ink-muted hover:text-primary-500'
                }`}
            >
              <svg
                className="icon-inline"
                viewBox="0 0 24 24"
                fill={isActive ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={isActive ? 0 : 1.75}
                aria-hidden="true"
              >
                {icon}
              </svg>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
