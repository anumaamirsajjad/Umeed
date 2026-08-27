'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Talk', urdu: 'گفتگو', href: '/chat' },
    { label: 'My Plan', urdu: 'میری منصوبہ', href: '/safety-plan/view' },
    { label: 'Support', urdu: 'معاونت', href: '/resources' },
  ];

  return (
    <nav
      className="fixed left-0 top-0 w-20 h-screen flex flex-col items-center gap-10 py-6 border-r"
      style={{
        backgroundColor: 'var(--umeed-beige-200)',
        borderColor: 'var(--umeed-orange-100)',
      }}
    >
      {navItems.map((item) => {
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
            <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{
              backgroundColor: isActive ? 'var(--umeed-orange-100)' : 'transparent',
            }}>
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
    </nav>
  );
}
