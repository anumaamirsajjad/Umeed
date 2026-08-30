'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getPreferences,
  listConversations,
  getMoodTrend,
  getSafetyPlan,
  submitMoodCheckin,
} from '@/lib/api';
import { MoodCheckinModal } from '@/components/common/MoodCheckinModal';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { ROUTES } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import type { Conversation, MoodTrendResponse, SafetyPlan } from '@/lib/types';

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-3" role="status" aria-label="Loading">
      <div className="h-4 w-32 rounded-lg bg-primary-100 dark:bg-primary-900/30" />
      <div className="h-16 w-full rounded-lg bg-primary-50 dark:bg-surface-dark" />
    </div>
  );
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  const [name, setName] = useState<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [conversationsError, setConversationsError] = useState(false);

  const [mood, setMood] = useState<MoodTrendResponse | null>(null);
  const [moodError, setMoodError] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);

  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan | null | undefined>(undefined);
  const [safetyPlanError, setSafetyPlanError] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    getPreferences().then((p) => setName(p.name?.trim() || null)).catch(() => {});

    listConversations()
      .then(setConversations)
      .catch(() => setConversationsError(true));

    getMoodTrend(7)
      .then(setMood)
      .catch(() => setMoodError(true));

    getSafetyPlan()
      .then(setSafetyPlan)
      .catch(() => setSafetyPlanError(true));
  }, [authLoading, isAuthenticated]);

  const refreshMood = () => getMoodTrend(7).then(setMood).catch(() => setMoodError(true));

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark px-4 py-10">
      <MoodCheckinModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSubmit={async (score, emoji) => {
          await submitMoodCheckin(score, emoji);
          await refreshMood();
        }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header: greeting + persistent Safety Mode exit */}
        <div className="animate-fade-up flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-light dark:text-ink-dark">
              Welcome back{name ? `, ${name}` : ''}
            </h1>
            <p className="text-sm text-ink-muted">Glad you&apos;re here.</p>
          </div>
          <Link
            href={ROUTES.crisis}
            className="inline-flex items-center gap-2 rounded-pill bg-crisis-600 hover:bg-crisis-700 text-white font-semibold text-sm px-5 py-2.5 transition-colors duration-micro ease-umeed whitespace-nowrap"
          >
            <Icon name="shield" className="icon-inline" />
            Safety Mode
          </Link>
        </div>

        {/* One clear primary action */}
        <Link
          href={ROUTES.chat}
          className="animate-fade-up group flex items-center justify-center gap-2 rounded-2xl bg-primary-700 hover:bg-primary-800 text-white text-center font-semibold text-lg py-5 transition-colors duration-micro ease-umeed"
          style={{ animationDelay: '70ms' }}
        >
          Continue the conversation
          <Icon name="arrowRight" className="icon-inline transition-transform duration-micro ease-umeed group-hover:translate-x-1" />
        </Link>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent conversations */}
          <Card
            padding="lg"
            className="animate-fade-up space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-quick ease-umeed"
            style={{ animationDelay: '130ms' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-light dark:text-ink-dark flex items-center gap-2">
                <Icon name="chat" className="icon-inline text-primary-600 dark:text-primary-300" />
                Recent conversations
              </h2>
              <Link href={ROUTES.chat} className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                See all
              </Link>
            </div>
            {conversations === null ? (
              conversationsError ? (
                <p className="text-sm text-ink-muted">Couldn&apos;t load conversations.</p>
              ) : (
                <CardSkeleton />
              )
            ) : conversations.length === 0 ? (
              <p className="text-sm text-ink-muted">
                No conversations yet — whenever you&apos;re ready, we&apos;re here.
              </p>
            ) : (
              <ul className="space-y-1">
                {conversations.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`${ROUTES.chat}?c=${c.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 -mx-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-micro ease-umeed"
                    >
                      <span className="text-sm text-ink-light dark:text-ink-dark truncate">{c.title}</span>
                      <span className="text-xs text-ink-muted whitespace-nowrap">{timeAgo(c.updatedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Mood */}
          <Card
            padding="lg"
            className="animate-fade-up space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-quick ease-umeed"
            style={{ animationDelay: '190ms' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-light dark:text-ink-dark flex items-center gap-2">
                <Icon name="heart" className="icon-inline text-accent-600 dark:text-accent-300" />
                How you&apos;ve been feeling
              </h2>
              <Link href={ROUTES.mood} className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                See your week
              </Link>
            </div>
            {mood === null ? (
              moodError ? (
                <p className="text-sm text-ink-muted">Couldn&apos;t load your mood trend.</p>
              ) : (
                <CardSkeleton />
              )
            ) : mood.data.length === 0 ? (
              <p className="text-sm text-ink-muted">
                No check-ins yet this week — no pressure, just here whenever you want it.
              </p>
            ) : (
              <p className="text-sm text-ink-light dark:text-ink-dark">
                7-day average: <span className="font-semibold">{mood.average}/5</span>
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowMoodModal(true)}
              className="text-sm font-semibold text-accent-700 dark:text-accent-300 hover:text-accent-800 dark:hover:text-accent-200"
            >
              + Quick check-in
            </button>
          </Card>
        </div>

        {/* Safety plan status */}
        <Card
          padding="lg"
          className="animate-fade-up space-y-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-quick ease-umeed"
          style={{ animationDelay: '250ms' }}
        >
          <h2 className="font-display text-lg font-semibold text-ink-light dark:text-ink-dark flex items-center gap-2">
            <Icon name="compass" className="icon-inline text-primary-600 dark:text-primary-300" />
            Your safety plan
          </h2>
          {safetyPlan === undefined ? (
            safetyPlanError ? (
              <p className="text-sm text-ink-muted">Couldn&apos;t load your safety plan.</p>
            ) : (
              <CardSkeleton />
            )
          ) : safetyPlan === null ? (
            <>
              <p className="text-sm text-ink-muted">
                You haven&apos;t started a safety plan yet. It only takes a few minutes, and you can come back to it
                anytime.
              </p>
              <Link
                href={ROUTES.safetyPlanBuilder}
                className="inline-flex rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm px-4 py-2 transition-colors duration-micro ease-umeed"
              >
                Start your safety plan
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-ink-muted">
                {safetyPlan.warningSigns.length} warning sign{safetyPlan.warningSigns.length === 1 ? '' : 's'} and{' '}
                {safetyPlan.copingStrategies.length} coping strateg
                {safetyPlan.copingStrategies.length === 1 ? 'y' : 'ies'} noted.
              </p>
              <Link
                href={ROUTES.safetyPlanView}
                className="inline-flex rounded-lg border border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-200 font-semibold text-sm px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-micro ease-umeed"
              >
                View your plan
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
