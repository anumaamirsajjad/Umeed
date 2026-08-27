'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export type AppPage = 'chat' | 'safety-plan' | 'mood' | 'resources';

interface AppHeaderProps {
  current?: AppPage;
  onNewChat?: () => void;
}

const NAV_LINKS: { page: AppPage; href: string; label: string }[] = [
  { page: 'safety-plan', href: ROUTES.safetyPlanBuilder, label: 'Safety Plan' },
  { page: 'mood', href: ROUTES.mood, label: 'Mood' },
  { page: 'resources', href: ROUTES.resources, label: 'Resources' },
];

function linkClasses(active: boolean) {
  return active
    ? 'text-primary-900 dark:text-primary-100 font-semibold'
    : 'text-ink-light/80 dark:text-ink-dark/80 hover:text-primary-700 dark:hover:text-primary-300';
}

/**
 * Shared top nav used on every inner page (chat, safety plan, mood, resources)
 * so there's always a way back to Home and across sections — not just the chat page.
 */
export function AppHeader({ current, onNewChat }: AppHeaderProps) {
  return (
    <div className="bg-surface dark:bg-surface-darker shadow-sm border-b border-primary-100 dark:border-primary-900/30">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link
            href={ROUTES.home}
            className="text-lg font-bold text-primary-900 dark:text-primary-100 hover:text-primary-700 dark:hover:text-primary-300"
          >
            🏠 Home
          </Link>
          {current === 'chat' && onNewChat ? (
            <button
              type="button"
              onClick={onNewChat}
              className="text-sm font-medium text-ink-light/80 dark:text-ink-dark/80 hover:text-primary-700 dark:hover:text-primary-300"
            >
              + New chat
            </button>
          ) : (
            <Link href={ROUTES.chat} className={`text-sm ${linkClasses(current === 'chat')}`}>
              Chat
            </Link>
          )}
        </div>
        <nav className="flex items-center gap-4 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.page} href={link.href} className={linkClasses(current === link.page)}>
              {link.label}
            </Link>
          ))}
          {/* Always reachable, independent of whether a crisis alert has triggered */}
          <Link
            href={ROUTES.resources}
            className="font-semibold text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 flex items-center gap-1"
          >
            <svg className="icon-inline" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6.6 10.2c1.4 2.8 3.6 5 6.4 6.4l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.1c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.2z" />
            </svg>
            Get help now
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default AppHeader;
