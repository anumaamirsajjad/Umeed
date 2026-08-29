'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ROUTES } from '@/lib/constants';

const NAV_ITEMS = [
  { label: 'Talk', urdu: 'گفتگو', href: '/chat' },
  { label: 'My Plan', urdu: 'میری منصوبہ', href: '/safety-plan/view' },
  { label: 'Support', urdu: 'معاونت', href: '/resources' },
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
    router.push(ROUTES.login);
  };

  return (
    <nav
      className="fixed left-0 top-0 w-20 h-screen flex flex-col items-center justify-between gap-10 py-6 border-r"
      style={{
        backgroundColor: 'var(--umeed-beige-200)',
        borderColor: 'var(--umeed-orange-100)',
      }}
    >
      <div className="flex flex-col items-center gap-10">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-all duration-300"
              style={{
                color: isActive ? 'var(--umeed-orange-500)' : 'var(--umeed-ink-500)',
                textDecoration: 'none',
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: isActive ? 'var(--umeed-orange-100)' : 'transparent' }}
              >
                {item.label.charAt(0)}
              </span>
              <span style={{ fontSize: '7px', fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700 }}>
                {item.urdu}
              </span>
              <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        aria-label="Log out"
        className="flex flex-col items-center gap-1 transition-all duration-300"
        style={{ color: 'var(--umeed-ink-500)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span className="w-6 h-6 rounded-full flex items-center justify-center">⎋</span>
        <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
          Log out
        </span>
      </button>
    </nav>
  );
}
