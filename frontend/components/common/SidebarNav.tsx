'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ROUTES } from '@/lib/constants';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MoonToggle } from './MoonToggle';

const NAV_ITEMS: { label: string; urdu: string; href: string; icon: IconName }[] = [
  { label: 'Talk', urdu: 'گفتگو', href: ROUTES.chat, icon: 'chat' },
  { label: 'My Plan', urdu: 'میری منصوبہ', href: ROUTES.safetyPlanView, icon: 'compass' },
  { label: 'Support', urdu: 'معاونت', href: ROUTES.resources, icon: 'lifebuoy' },
  { label: 'Profile', urdu: 'پروفائل', href: ROUTES.profile, icon: 'user' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Nothing to gate for a logged-out visitor (landing/login/signup pages) —
  // and no logout control should be reachable there either.
  if (isLoading || !isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.replace(ROUTES.login);
  };

  return (
    <nav
      className="fixed left-0 top-0 w-20 h-screen flex flex-col items-center justify-between gap-8 py-6
        border-r bg-surface-light dark:bg-surface-dark border-primary-100 dark:border-primary-900/40"
    >
      <Link
        href={ROUTES.dashboard}
        aria-label="Umeed home"
        className="font-display text-lg font-bold text-primary-700 dark:text-primary-300"
      >
        U
      </Link>

      <div className="flex flex-col items-center gap-8">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={`${item.label} · ${item.urdu}`}
              className={`flex flex-col items-center gap-1.5 no-underline transition-colors duration-micro ease-umeed ${
                isActive
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-ink-muted hover:text-primary-600 dark:hover:text-primary-300'
              }`}
            >
              <span
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-micro ease-umeed ${
                  isActive ? 'bg-primary-100 dark:bg-primary-900/40' : ''
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-semibold tracking-wide uppercase leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-4">
        <MoonToggle size="sm" />
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer
            text-ink-muted hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-micro ease-umeed"
        >
          <span className="w-9 h-9 rounded-lg flex items-center justify-center">
            <Icon name="logout" className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[9px] font-semibold tracking-wide uppercase leading-none">Log out</span>
        </button>
      </div>
    </nav>
  );
}
