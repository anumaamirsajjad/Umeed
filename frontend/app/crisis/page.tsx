'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ROUTES, CRISIS_ALERT_STORAGE_KEY } from '@/lib/constants';
import { ACTIVE_EMERGENCY_CONTACT, ACTIVE_CRISIS_HELPLINE, type EmergencyContact } from '@/lib/emergencyContacts';
import { Icon } from '@/components/ui/Icon';
import type { CrisisAlert } from '@/lib/types';

/**
 * A number is never shown bare. `service` says what the line actually reaches,
 * because "Emergency services · 15" alone doesn't tell someone in crisis that
 * 15 is the police control room and not a mental-health line.
 */
function EmergencyCard({ contact }: { contact: EmergencyContact }) {
  return (
    <a
      href={`tel:${contact.tel}`}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white px-6 py-7 text-crisis-600 transition-transform duration-quick ease-umeed hover:scale-[1.02] hover:shadow-lg"
    >
      <span className="text-2xl font-bold">{contact.label}</span>
      <span className="text-4xl font-bold tracking-tight">{contact.number}</span>
      <span className="mt-1 text-sm font-medium text-crisis-700">{contact.service}</span>
    </a>
  );
}

export default function CrisisSafetyModePage() {
  const [alert, setAlert] = useState<CrisisAlert | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

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

  // The redirect out of chat is a full page navigation, so assistive tech would
  // otherwise stay wherever it was. Move focus to the heading on arrival.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Resources without a phone number would otherwise render as a tappable
  // `tel:undefined` button that dials nothing.
  const callableResources = (alert?.resources ?? []).filter((r) => r.phone).slice(0, 3);

  return (
    <div className="min-h-[100dvh] bg-crisis-600 text-white flex flex-col p-6 animate-settle">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-10 max-w-xl mx-auto w-full">
        <div className="flex flex-col gap-4">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-hero font-bold leading-tight outline-none"
          >
            You&apos;re here.
          </h1>
          <p className="text-xl leading-relaxed">
            That matters. This is a safe space. You don&apos;t have to figure everything out right now.
          </p>
          {alert?.message && <p className="mt-2 text-lg font-medium">{alert.message}</p>}
        </div>

        <div className="w-full flex flex-col gap-4">
          <p className="text-sm font-bold uppercase tracking-wide">Call now if in danger</p>
          <EmergencyCard contact={ACTIVE_EMERGENCY_CONTACT} />
          <EmergencyCard contact={ACTIVE_CRISIS_HELPLINE} />
        </div>

        {callableResources.length > 0 && (
          <div className="w-full flex flex-col gap-3 mt-6 pt-6 border-t border-white/30">
            <p className="text-sm font-bold uppercase tracking-wide">Other resources</p>
            {callableResources.map((resource) => (
              <a
                key={resource.id}
                href={`tel:${resource.phone}`}
                className="flex justify-between items-center gap-3 min-h-[60px] px-6 py-5 bg-white/15 hover:bg-white/25 rounded-2xl font-semibold transition-all duration-quick ease-umeed hover:translate-x-1"
              >
                <span className="text-left">
                  <span className="block text-base font-bold">{resource.name}</span>
                  {resource.description && <span className="block text-xs">{resource.description}</span>}
                </span>
                <span className="text-lg font-bold whitespace-nowrap">{resource.phone}</span>
              </a>
            ))}
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          <Link
            href={ROUTES.breathe}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/50 px-6 py-4 font-semibold hover:bg-white/10 transition-colors duration-quick ease-umeed"
          >
            <Icon name="heart" className="icon-inline" />
            Try a breathing exercise
          </Link>
          <Link
            href={ROUTES.resources}
            className="w-full min-h-12 flex items-center justify-center rounded-2xl bg-white text-crisis-600 font-bold hover:scale-[1.02] transition-transform duration-quick ease-umeed"
          >
            View all support resources
          </Link>
        </div>
      </div>

      {/* The way out sits last — in the DOM and on screen. Nothing should be
          tabbed through before the emergency numbers. */}
      <div className="mt-10 flex justify-center">
        <Link
          href={ROUTES.chat}
          className="inline-flex items-center gap-1.5 py-2 text-base font-bold underline underline-offset-4 hover:no-underline transition-all duration-quick ease-umeed"
        >
          ← Back to chat
        </Link>
      </div>
    </div>
  );
}
