'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { Icon, type IconName } from '@/components/ui/Icon';

/**
 * `match` is a path prefix, deliberately broader than `href`: the safety-plan
 * tab links to /safety-plan/view but must also read as active on
 * /safety-plan/builder. The old sidebar compared against href alone, so the
 * builder page showed no active destination at all.
 *
 * Theme and sign-out are deliberately NOT here — those are actions, not
 * destinations, and they live on the Profile tab.
 */
const TABS: { label: string; urdu: string; href: string; match: string; icon: IconName }[] = [
  { label: 'Home', urdu: 'گھر', href: ROUTES.dashboard, match: '/dashboard', icon: 'home' },
  { label: 'Talk', urdu: 'گفتگو', href: ROUTES.chat, match: '/chat', icon: 'chat' },
  { label: 'Plan', urdu: 'منصوبہ', href: ROUTES.safetyPlanView, match: '/safety-plan', icon: 'compass' },
  { label: 'Support', urdu: 'معاونت', href: ROUTES.resources, match: '/resources', icon: 'lifebuoy' },
  { label: 'Profile', urdu: 'پروفائل', href: ROUTES.profile, match: '/profile', icon: 'user' },
];

// Translucent + blurred where supported, solid where not, so the nav never
// becomes an unreadable smear on browsers without backdrop-filter.
const GLASS =
  'bg-surface/90 supports-[backdrop-filter]:bg-surface/65 dark:bg-surface-darker/90 ' +
  'dark:supports-[backdrop-filter]:bg-surface-darker/60 backdrop-blur-xl ' +
  'ring-1 ring-ink-light/[0.06] dark:ring-ink-dark/10 shadow-glass';

export function AppNav() {
  const pathname = usePathname();
  const activeIndex = TABS.findIndex((t) => pathname === t.match || pathname.startsWith(t.match + '/'));

  return (
    <nav
      aria-label="Main"
      className={
        // Mobile: anchored to the bottom edge, clear of the home indicator.
        // Desktop: the same element floats as a centred pill at the top.
        'fixed z-40 inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] ' +
        'md:inset-x-auto md:bottom-auto md:top-4 md:left-1/2 md:-translate-x-1/2 md:w-[28rem] ' +
        'rounded-pill jali-bg overflow-hidden ' +
        GLASS
      }
    >
      <div className="relative grid grid-cols-5">
        {/* Signature: the lamp behind the jali screen. Your current place is
            where the light is, and it slides rather than cuts. Equal columns
            mean one translateX step is exactly one tab — no measuring. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 w-1/5 transition-transform duration-standard ease-umeed ${
            activeIndex < 0 ? 'opacity-0' : ''
          }`}
          style={{ transform: `translateX(${Math.max(activeIndex, 0) * 100}%)` }}
        >
          <span
            className="absolute inset-1.5 rounded-pill"
            style={{ background: 'var(--lamp)', boxShadow: '0 0 24px -4px var(--lamp-glow)' }}
          />
        </span>

        {TABS.map((tab, i) => {
          const isActive = i === activeIndex;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${tab.label} · ${tab.urdu}`}
              className={`relative flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-pill no-underline transition-colors duration-quick ease-umeed ${
                isActive
                  ? 'text-primary-800 dark:text-primary-200'
                  : 'text-ink-muted hover:text-primary-700 dark:hover:text-primary-300'
              }`}
            >
              <Icon name={tab.icon} className="h-[1.35rem] w-[1.35rem]" />
              {/* Only the active tab is labelled. One tab is active at a time,
                  so exactly one Urdu word is ever on screen — the bilingual
                  identity stays visible without five words of clutter. */}
              {isActive && (
                <span className="flex flex-col items-center leading-none">
                  <span className="text-[10px] font-semibold uppercase tracking-wide">{tab.label}</span>
                  <span className="font-nastaliq text-[9px] leading-none opacity-70">{tab.urdu}</span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default AppNav;
