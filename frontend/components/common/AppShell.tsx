'use client';

import { useAuth } from '@/lib/authContext';

/**
 * Applies the left margin that reserves space for SidebarNav — but only when
 * SidebarNav is actually rendering (i.e. the user is authenticated).
 * SidebarNav returns null for logged-out visitors; without this, layout.tsx's
 * old hardcoded `ml-20` would leave a blank 80px gutter on the landing,
 * login, and signup pages.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return <div className={`min-h-screen flex flex-col ${isAuthenticated ? 'ml-20' : ''}`}>{children}</div>;
}
