'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Icon } from '@/components/ui/Icon';

interface Phase {
  name: string;
  /** Distinct from `name` so "Hold" twice per cycle isn't ambiguous out of context. */
  announcement: string;
  duration: number; // ms
  scale: number; // circle target scale during this phase
}

const PHASES: Phase[] = [
  { name: 'Inhale', announcement: 'Breathe in', duration: 4000, scale: 1 },
  { name: 'Hold', announcement: 'Hold, full', duration: 4000, scale: 1 },
  { name: 'Exhale', announcement: 'Breathe out', duration: 6000, scale: 0.6 },
  { name: 'Hold', announcement: 'Hold, empty', duration: 2000, scale: 0.6 },
];

export default function BreathingExercisePage() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [running, setRunning] = useState(true);
  // The global prefers-reduced-motion rule overrides the circle's transition,
  // which would leave a reduced-motion user a static shape with no timing cue
  // at all. Detect it and show a counted cue instead.
  const [reducedMotion, setReducedMotion] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].duration / 1000);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      setPhaseIndex((i) => (i + 1) % PHASES.length);
    }, PHASES[phaseIndex].duration);
    return () => clearTimeout(timer);
  }, [phaseIndex, running]);

  // Countdown drives the reduced-motion cue and the progress text.
  useEffect(() => {
    setSecondsLeft(PHASES[phaseIndex].duration / 1000);
    if (!running) return;
    const tick = setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(tick);
  }, [phaseIndex, running]);

  const phase = PHASES[phaseIndex];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface-light dark:bg-surface-dark">
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-6 py-16">
        <div className="text-center space-y-1">
          <h1 className="font-display text-section font-bold text-ink-light dark:text-ink-dark">
            Let&apos;s breathe together
          </h1>
          <p className="text-sm text-ink-muted">Follow the circle. No need to rush.</p>
        </div>

        <div className="relative h-56 w-56 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 dark:from-primary-700 dark:to-primary-500 opacity-80"
            style={{
              transform: `scale(${phase.scale})`,
              transition: `transform ${phase.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          />
          <div className="relative text-center">
            <span className="block font-display text-2xl font-bold text-white drop-shadow-sm">{phase.name}</span>
            {reducedMotion && (
              <span className="block font-display text-3xl font-bold text-white tabular-nums drop-shadow-sm">
                {secondsLeft}
              </span>
            )}
          </div>
        </div>

        {/* One polite region that changes only on phase change. The label
            itself used to be aria-live, which re-announced every few seconds
            and read "Hold" twice a cycle with no way to tell them apart. */}
        <p className="sr-only" aria-live="polite">
          {phase.announcement}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            aria-pressed={!running}
            className="inline-flex items-center justify-center gap-2 min-h-11 rounded-pill border border-primary-300 dark:border-primary-700 px-6 font-semibold text-ink-light dark:text-ink-dark hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-micro ease-umeed"
          >
            <Icon name={running ? 'heart' : 'arrowRight'} className="icon-inline" />
            {running ? 'Pause' : 'Resume'}
          </button>
          <Link
            href={ROUTES.crisis}
            className="inline-flex items-center justify-center min-h-11 rounded-pill bg-primary-700 hover:bg-primary-800 px-6 font-semibold text-white transition-colors duration-micro ease-umeed"
          >
            I&apos;m done
          </Link>
        </div>

        <Link
          href={ROUTES.crisis}
          className="text-sm font-semibold text-ink-muted hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-micro ease-umeed"
        >
          ← Back to safety mode
        </Link>
      </div>
    </div>
  );
}
