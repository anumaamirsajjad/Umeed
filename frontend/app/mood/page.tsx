'use client';

import { useState, useEffect } from 'react';
import { getMoodTrend } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import type { MoodTrendPoint } from '@/lib/types';
import { AppHeader } from '@/components/common/AppHeader';
import { Card } from '@/components/ui/Card';

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PADDING = 32;

function MoodLineChart({ data }: { data: MoodTrendPoint[] }) {
  if (data.length === 0) return null;

  const usableWidth = CHART_WIDTH - PADDING * 2;
  const usableHeight = CHART_HEIGHT - PADDING * 2;

  const xFor = (i: number) => PADDING + (data.length === 1 ? usableWidth / 2 : (i / (data.length - 1)) * usableWidth);
  const yFor = (mood: number) => PADDING + usableHeight - ((mood - 1) / 4) * usableHeight;

  const linePoints = data.map((d, i) => `${xFor(i)},${yFor(d.mood)}`).join(' ');
  const areaPoints = `${xFor(0)},${yFor(1)} ${linePoints} ${xFor(data.length - 1)},${yFor(1)}`;

  return (
    <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full h-auto" role="img" aria-label="7-day mood trend line chart">
      {/* Plot background: tan surface the green line sits on */}
      <rect
        x={PADDING}
        y={PADDING}
        width={usableWidth}
        height={usableHeight}
        className="fill-primary-50 dark:fill-surface-dark"
      />

      {/* Gridlines for mood levels 1-5 */}
      <g className="text-primary-200 dark:text-primary-900/60" stroke="currentColor">
        {[1, 2, 3, 4, 5].map((level) => (
          <line key={level} x1={PADDING} x2={CHART_WIDTH - PADDING} y1={yFor(level)} y2={yFor(level)} strokeWidth={1} />
        ))}
      </g>

      {/* Soft fill under the line */}
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
            y={CHART_HEIGHT - 6}
            fontSize={10}
            textAnchor="middle"
            className="fill-ink-light/60 dark:fill-ink-dark/60"
          >
            {d.date.slice(5)}
          </text>
        </g>
      ))}
    </svg>
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
  const [userId] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : ''));

  useEffect(() => {
    if (!userId) {
      if (typeof window !== 'undefined') window.location.href = ROUTES.onboarding;
      return;
    }

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
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader current="mood" />
      <div className="flex-1 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card padding="lg" className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">Your Week in Mood</h1>
            <p className="text-base text-ink-light/70 dark:text-ink-dark/70">
              Private to you — a gentle way to notice how you've been feeling.
            </p>
          </div>

          {loading ? (
            <MoodChartSkeleton />
          ) : error ? (
            <p className="text-base text-primary-800 dark:text-primary-200">{error}</p>
          ) : data.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-primary-200 dark:border-primary-900/50 p-8 text-center text-ink-light/60 dark:text-ink-dark/60">
              No mood check-ins yet this week. They'll show up here once you start checking in from
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
