'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSafetyPlan, exportSafetyPlanPDF } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { useRequireAuth } from '@/lib/useRequireAuth';
import type { SafetyPlan } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';

function PlanSection({ title, icon, items, emptyLabel }: { title: string; icon: IconName; items: string[]; emptyLabel: string }) {
  return (
    <div className="space-y-2">
      <h2 className="font-display text-lg font-semibold text-ink-light dark:text-ink-dark flex items-center gap-2">
        <Icon name={icon} className="icon-inline text-primary-600 dark:text-primary-300" />
        {title}
      </h2>
      {items.length > 0 ? (
        <ul className="space-y-1.5 list-disc list-inside">
          {items.map((item, idx) => (
            <li key={idx} className="text-base text-ink-light dark:text-ink-dark">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted italic">{emptyLabel}</p>
      )}
    </div>
  );
}

function ViewSkeleton() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Loading safety plan">
      <div className="h-8 w-64 rounded-pill bg-primary-100 dark:bg-primary-900/30" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-5 w-40 rounded-pill bg-primary-100 dark:bg-primary-900/30" />
          <div className="h-4 w-full rounded-pill bg-primary-50 dark:bg-surface-dark" />
          <div className="h-4 w-2/3 rounded-pill bg-primary-50 dark:bg-surface-dark" />
        </div>
      ))}
    </div>
  );
}

export default function SafetyPlanViewPage() {
  const [plan, setPlan] = useState<SafetyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    getSafetyPlan()
      .then(setPlan)
      // A failed load is not an empty plan. Telling someone with a saved plan
      // that they never made one is the worse of the two wrong answers.
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  const handleExportPDF = async () => {
    setExporting(true);
    setExportError(false);
    try {
      const blob = await exportSafetyPlanPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'safety-plan.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setExportError(true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface-light dark:bg-surface-dark">
      <div className="flex-1 px-6 pt-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card padding="lg" className="space-y-8">
            {loading ? (
              <ViewSkeleton />
            ) : loadError ? (
              <div className="text-center space-y-4 py-8" role="alert">
                <p className="text-base text-crisis-700 dark:text-crisis-300">
                  We couldn&apos;t load your safety plan just now.
                </p>
                <Button className="rounded-pill" onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </div>
            ) : !plan ? (
              <div className="text-center space-y-4 py-8">
                <p className="text-base text-ink-muted">You haven&apos;t saved a safety plan yet.</p>
                <Link
                  href={ROUTES.safetyPlanBuilder}
                  className="inline-flex items-center justify-center min-h-11 rounded-pill bg-primary-700 hover:bg-primary-800 text-white font-semibold px-6 transition-colors duration-micro ease-umeed"
                >
                  Build your safety plan
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <h1 className="font-display text-2xl font-bold text-ink-light dark:text-ink-dark">
                    My Personal Safety Plan
                  </h1>
                  {plan.updatedAt && (
                    <p className="text-sm text-ink-muted">
                      Last updated {new Date(plan.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  <PlanSection title="Warning Signs" icon="flag" items={plan.warningSigns} emptyLabel="Nothing added yet." />
                  <PlanSection title="Coping Strategies" icon="leaf" items={plan.copingStrategies} emptyLabel="Nothing added yet." />

                  <div className="space-y-2">
                    <h2 className="font-display text-lg font-semibold text-ink-light dark:text-ink-dark flex items-center gap-2">
                      <Icon name="people" className="icon-inline text-primary-600 dark:text-primary-300" />
                      People in Your Corner
                    </h2>
                    {plan.trustedContacts.length > 0 ? (
                      <ul className="space-y-1.5">
                        {plan.trustedContacts.map((contact, idx) => (
                          <li key={idx} className="text-base text-ink-light dark:text-ink-dark">
                            <span className="font-semibold">{contact.name}</span>
                            {contact.relationship && ` — ${contact.relationship}`}
                            {contact.phone && (
                              <>
                                {' · '}
                                <a href={`tel:${contact.phone}`} className="text-primary-600 dark:text-primary-300 hover:underline">
                                  {contact.phone}
                                </a>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-ink-muted italic">Nothing added yet.</p>
                    )}
                  </div>

                  <PlanSection title="What Keeps You Going" icon="heart" items={plan.reasonsToStaySafe} emptyLabel="Nothing added yet." />
                  <PlanSection
                    title="Making Space Safer"
                    icon="house"
                    items={plan.environmentSafetySteps}
                    emptyLabel="Nothing added yet."
                  />
                </div>

                {/* These were <Link><Button/></Link> — a <button> inside an
                    <a>, which is invalid and produces two tab stops. The link
                    is now styled directly. */}
                <div className="space-y-2 pt-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={ROUTES.safetyPlanBuilder}
                      className="flex-1 inline-flex items-center justify-center min-h-11 rounded-pill font-semibold text-primary-800 dark:text-primary-100 hover:bg-primary-100 dark:hover:bg-white/5 transition-colors duration-micro ease-umeed"
                    >
                      Edit plan
                    </Link>
                    <Button className="flex-1 rounded-pill gap-1.5" loading={exporting} onClick={handleExportPDF}>
                      <Icon name="download" className="icon-inline" />
                      Export as PDF
                    </Button>
                  </div>
                  {exportError && (
                    <p className="text-sm text-crisis-700 dark:text-crisis-300 text-center" role="alert">
                      That export didn&apos;t go through. Try again in a moment.
                    </p>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
