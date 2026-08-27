'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface Phase {
  name: string;
  duration: number; // ms
  scale: number; // circle target scale during this phase
}

const PHASES: Phase[] = [
  { name: 'Inhale', duration: 4000, scale: 1 },
  { name: 'Hold', duration: 4000, scale: 1 },
  { name: 'Exhale', duration: 6000, scale: 0.6 },
  { name: 'Hold', duration: 2000, scale: 0.6 },
];

export default function BreathingExercisePage() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhaseIndex((i) => (i + 1) % PHASES.length);
    }, PHASES[phaseIndex].duration);
    return () => clearTimeout(timer);
  }, [phaseIndex]);

  const phase = PHASES[phaseIndex];

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark">
      <div className="px-6 pt-6 pb-4">
        <Link
          href={ROUTES.crisis}
          className="text-sm font-semibold text-ink-light dark:text-ink-dark hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-micro ease-umeed"
        >
          ← Back to safety mode
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-6 pb-16">
        <div className="text-center space-y-1">
          <h1 className="font-serif text-2xl font-bold text-ink-light dark:text-ink-dark">Let's breathe together</h1>
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
          <span className="relative font-serif text-xl font-bold text-white drop-shadow-sm" aria-live="polite">
            {phase.name}
          </span>
        </div>

        <Link
          href={ROUTES.crisis}
          className="rounded-pill border border-primary-300 dark:border-primary-700 text-ink-light dark:text-ink-dark font-semibold px-6 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-micro ease-umeed"
        >
          I'm done
        </Link>
      </div>
    </div>
  );
}
