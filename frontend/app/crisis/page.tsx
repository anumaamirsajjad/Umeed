'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES, CRISIS_ALERT_STORAGE_KEY } from '@/lib/constants';
import { ACTIVE_EMERGENCY_CONTACT, ACTIVE_CRISIS_HELPLINE } from '@/lib/emergencyContacts';
import { Icon } from '@/components/ui/Icon';
import type { CrisisAlert } from '@/lib/types';

export default function CrisisSafetyModePage() {
  const [alert, setAlert] = useState<CrisisAlert | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CRISIS_ALERT_STORAGE_KEY);
      if (raw) {
        setAlert(JSON.parse(raw));
        sessionStorage.removeItem(CRISIS_ALERT_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Could not read crisis alert:', err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-crisis-600 text-white flex flex-col p-6">
      <div className="mb-10">
        <Link
          href={ROUTES.chat}
          className="inline-flex items-center gap-1.5 text-base font-bold opacity-90 hover:opacity-100 py-2 transition-opacity duration-quick ease-umeed"
        >
          ← Back to chat
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-10 max-w-xl mx-auto animate-fade-up">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight">You&apos;re here.</h1>
          <p className="text-xl opacity-95 leading-relaxed">
            That matters. This is a safe space. You don&apos;t have to figure everything out right now.
          </p>
          {alert?.message && <p className="text-lg opacity-90 font-medium mt-2">{alert.message}</p>}
        </div>

        <div className="w-full flex flex-col gap-4">
          <p className="text-sm font-bold uppercase tracking-wide opacity-80">Call now if in danger</p>

          <a
            href={`tel:${ACTIVE_EMERGENCY_CONTACT.tel}`}
            className="flex flex-col justify-center items-center gap-2 min-h-20 px-6 py-8 bg-white text-crisis-600 rounded-lg font-bold transition-transform duration-quick ease-umeed hover:scale-[1.02] hover:shadow-lg"
          >
            <span className="text-2xl">{ACTIVE_EMERGENCY_CONTACT.label}</span>
            <span className="text-3xl">{ACTIVE_EMERGENCY_CONTACT.number}</span>
          </a>

          <a
            href={`tel:${ACTIVE_CRISIS_HELPLINE.tel}`}
            className="flex flex-col justify-center items-center gap-2 min-h-20 px-6 py-8 bg-white text-crisis-600 rounded-lg font-bold transition-transform duration-quick ease-umeed hover:scale-[1.02] hover:shadow-lg"
          >
            <span className="text-2xl">{ACTIVE_CRISIS_HELPLINE.label}</span>
            <span className="text-3xl">{ACTIVE_CRISIS_HELPLINE.number}</span>
          </a>
        </div>

        {alert?.resources && alert.resources.length > 0 && (
          <div className="w-full flex flex-col gap-3 mt-6 pt-6 border-t border-white/20">
            <p className="text-sm font-bold uppercase tracking-wide opacity-80">Other resources</p>
            {alert.resources.slice(0, 3).map((resource) => (
              <a
                key={resource.id}
                href={`tel:${resource.phone}`}
                className="flex justify-between items-center gap-3 min-h-[60px] px-6 py-5 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all duration-quick ease-umeed hover:translate-x-1"
              >
                <div className="text-left">
                  <div className="text-base font-bold">{resource.name}</div>
                  {resource.description && <div className="text-xs opacity-80">{resource.description}</div>}
                </div>
                {resource.phone && <div className="text-lg font-bold whitespace-nowrap">{resource.phone}</div>}
              </a>
            ))}
          </div>
        )}

        <Link
          href={ROUTES.breathe}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-4 font-semibold hover:bg-white/10 transition-colors duration-quick ease-umeed"
        >
          <Icon name="heart" className="icon-inline" />
          Try a breathing exercise
        </Link>
      </div>

      <div className="flex flex-col gap-3 mt-10 max-w-xl mx-auto w-full">
        <Link
          href={ROUTES.resources}
          className="text-center min-h-12 flex items-center justify-center rounded-lg bg-white text-crisis-600 font-bold text-base hover:scale-[1.02] transition-transform duration-quick ease-umeed"
        >
          View all support resources
        </Link>
      </div>
    </div>
  );
}
