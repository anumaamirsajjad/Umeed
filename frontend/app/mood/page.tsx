'use client';

import { useState, useEffect } from 'react';
import { getMoodTrend } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';
import type { MoodTrendPoint } from '@/lib/types';
import { Card } from '@/components/ui/Card';

const CHART_WIDTH = 640;
const CHART_HEIGHT = 260;
// Asymmetric padding: room on the left for mood labels, on the bottom for dates.
const PAD = { top: 20, right: 20, bottom: 44, left: 104 };

const MOOD_LABELS: Record<number, string> = {
  1: 'Really struggling',
  2: 'Not great',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

function MoodLineChart({ data }: { data: MoodTrendPoint[] }) {
  if (data.length === 0) return null;

  const usableWidth = CHART_WIDTH - PAD.left - PAD.right;
  const usableHeight = CHART_HEIGHT - PAD.top - PAD.bottom;

  const xFor = (i: number) => PAD.left + (data.length === 1 ? usableWidth / 2 : (i / (data.length - 1)) * usableWidth);
  const yFor = (mood: number) => PAD.top + usableHeight - ((mood - 1) / 4) * usableHeight;

  const linePoints = data.map((d, i) => `${xFor(i)},${yFor(d.mood)}`).join(' ');
  const areaPoints = `${xFor(0)},${yFor(1)} ${linePoints} ${xFor(data.length - 1)},${yFor(1)}`;

  // Font sizes are in viewBox units against a 640-wide box. On a 360px screen
  // the box scales to ~0.56, so 18 renders at ~10px — the old value of 10
  // rendered at ~5.6px and was unreadable.
  const AXIS_FONT = 18;

  return (
    <>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Mood over the last ${data.length} check-ins, on a scale of 1 to 5. Values are listed in the table below.`}
      >
        <rect
          x={PAD.left}
          y={PAD.top}
          width={usableWidth}
          height={usableHeight}
          className="fill-primary-50 dark:fill-surface-dark"
        />

        {/* Gridlines, each now labelled — previously you could see five lines
            but had no way to tell which mood any of them meant. */}
        <g className="text-primary-200 dark:text-primary-900/60" stroke="currentColor">
          {[1, 2, 3, 4, 5].map((level) => (
            <line key={level} x1={PAD.left} x2={CHART_WIDTH - PAD.right} y1={yFor(level)} y2={yFor(level)} strokeWidth={1} />
          ))}
        </g>
        <g className="fill-ink-light/70 dark:fill-ink-dark/70" fontSize={AXIS_FONT}>
          {[1, 2, 3, 4, 5].map((level) => (
            <text key={level} x={PAD.left - 10} y={yFor(level) + AXIS_FONT / 3} textAnchor="end">
              {MOOD_LABELS[level]}
            </text>
          ))}
        </g>

        <polygon points={areaPoints} className="fill-accent-500/10 dark:fill-accent-400/10" />

        <polyline
          points={linePoints}
          fill="none"
          className="stroke-accent-600 dark:stroke-accent-400"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {data.map((d, i) => (
          <g key={d.date + i}>
            <circle cx={xFor(i)} cy={yFor(d.mood)} r={5} className="fill-accent-600 dark:fill-accent-400" />
            <text
              x={xFor(i)}
              y={CHART_HEIGHT - 14}
              fontSize={AXIS_FONT}
              textAnchor="middle"
              className="fill-ink-light/70 dark:fill-ink-dark/70"
            >
              {d.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>

      {/* The chart is an image to assistive tech; this is where the actual
          numbers live. Visually hidden, fully readable by a screen reader. */}
      <table className="sr-only">
        <caption>Mood check-ins</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Mood</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={d.date + i}>
              <th scope="row">{d.date}</th>
              <td>{MOOD_LABELS[d.mood] ?? d.mood} ({d.mood} of 5)</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function MoodChartSkeleton() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="Loading mood trend">
      <div className="h-4 w-40 rounded-lg bg-primary-100 dark:bg-primary-900/30" />
      <div className="h-[220px] w-full rounded-lg bg-primary-50 dark:bg-surface-dark" />
    </div>
  );
}

export default function MoodTrendPage() {
  const [data, setData] = useState<MoodTrendPoint[]>([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    getMoodTrend(7)
      .then((trend) => {
        setData(trend.data);
        setAverage(trend.average);
      })
      .catch((err) => {
        console.error('Error loading mood trend:', err);
        setError('Could not load your mood trend right now.');
      })
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="flex-1 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card padding="lg" className="space-y-6">
          <div className="space-y-1">
            <h1 className="font-display text-heading font-bold text-ink-light dark:text-ink-dark">Your Week in Mood</h1>
            <p className="text-base text-ink-muted">
              Private to you — a gentle way to notice how you&apos;ve been feeling.
            </p>
          </div>

          {loading ? (
            <MoodChartSkeleton />
          ) : error ? (
            <p className="text-base text-crisis-700 dark:text-crisis-300" role="alert">{error}</p>
          ) : data.length === 0 ? (
            <div className="rounded-2xl bg-primary-50 dark:bg-primary-900/20 p-8 text-center text-ink-muted">
              No mood check-ins yet this week. They&apos;ll show up here once you start checking in from
              the chat page.
            </div>
          ) : (
            <>
              <p className="text-lg text-ink-light dark:text-ink-dark">
                Average mood: <span className="font-bold text-primary-900 dark:text-primary-100">{average}/5</span>
              </p>
              <MoodLineChart data={data} />
            </>
          )}
        </Card>
      </div>
      </div>
    </div>
  );
}
