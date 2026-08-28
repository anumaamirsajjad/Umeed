'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSafetyPlan, exportSafetyPlanPDF } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import type { SafetyPlan } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomNav } from '@/components/common/BottomNav';

function PlanSection({ title, icon, items, emptyLabel }: { title: string; icon: string; items: string[]; emptyLabel: string }) {
  return (
    <div className="space-y-2">
      <h2 className="font-serif text-lg font-semibold text-ink-light dark:text-ink-dark">
        <span aria-hidden="true">{icon} </span>
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
  const [exporting, setExporting] = useState(false);
  const [userId] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : ''));

  useEffect(() => {
    if (!userId) {
      if (typeof window !== 'undefined') window.location.href = ROUTES.onboarding;
      return;
    }
    getSafetyPlan()
      .then(setPlan)
      .finally(() => setLoading(false));
  }, [userId]);

  const handleExportPDF = async () => {
    setExporting(true);
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
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark pb-24">
      <div className="flex-1 px-6 pt-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card
            padding="lg"
            className="rounded-card space-y-8 bg-gradient-to-br from-primary-50 to-surface dark:from-surface-darker dark:to-surface-dark"
          >
            {loading ? (
              <ViewSkeleton />
            ) : !plan ? (
              <div className="text-center space-y-4 py-8">
                <p className="text-base text-ink-muted">You haven't saved a safety plan yet.</p>
                <Link href={ROUTES.safetyPlanBuilder}>
                  <Button className="rounded-pill">Build your safety plan</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <h1 className="font-serif text-2xl font-bold text-ink-light dark:text-ink-dark">
                    My Personal Safety Plan
                  </h1>
                  {plan.updatedAt && (
                    <p className="text-sm text-ink-muted">
                      Last updated {new Date(plan.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  <PlanSection title="Warning Signs" icon="📍" items={plan.warningSigns} emptyLabel="Nothing added yet." />
                  <PlanSection title="Coping Strategies" icon="🛠️" items={plan.copingStrategies} emptyLabel="Nothing added yet." />

                  <div className="space-y-2">
                    <h2 className="font-serif text-lg font-semibold text-ink-light dark:text-ink-dark">
                      <span aria-hidden="true">👥 </span>People in Your Corner
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

                  <PlanSection title="What Keeps You Going" icon="💪" items={plan.reasonsToStaySafe} emptyLabel="Nothing added yet." />
                  <PlanSection
                    title="Making Space Safer"
                    icon="🏠"
                    items={plan.environmentSafetySteps}
                    emptyLabel="Nothing added yet."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href={ROUTES.safetyPlanBuilder} className="flex-1">
                    <Button variant="ghost" className="w-full rounded-pill">
                      Edit plan
                    </Button>
                  </Link>
                  <Button className="flex-1 rounded-pill" loading={exporting} onClick={handleExportPDF}>
                    📄 Export as PDF
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      <BottomNav active="plan" />
    </div>
  );
}
