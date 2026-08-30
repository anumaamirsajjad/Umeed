'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { AppNav } from './AppNav';

/**
 * Routes that own the whole viewport and must not show app navigation.
 *
 * `/crisis` is in here deliberately, not incidentally: Safety Mode is a place
 * you arrive at, not a tab you browse from. Stripping the nav is what makes
 * the hard redirect out of chat read as intentional rather than as a page
 * that broke — there is nothing to navigate to, only the thing in front of you.
 */
const BARE_ROUTES = ['/', '/login', '/signup', '/onboarding', '/crisis'];

function isBareRoute(pathname: string): boolean {
  return BARE_ROUTES.some(
    (route) => pathname === route || (route !== '/' && pathname.startsWith(route + '/'))
  );
}

/**
 * Owns the app chrome: decides whether navigation renders, and reserves the
 * space it occupies. Renders nothing structural of its own beyond that.
 *
 * The nav overlays the page (fixed) rather than sitting in flow, so the space
 * is reserved with padding and published as `--nav-h`. A full-height page that
 * needs to fill the remaining viewport reads that variable rather than
 * hardcoding a number:
 *
 *   h-[calc(100dvh-var(--nav-h)-env(safe-area-inset-bottom))]
 *
 * `100dvh` (not `100vh`) is what keeps a bottom-anchored element on screen in
 * iOS Safari, where `100vh` measures the viewport as if the URL bar were
 * always collapsed and pushes the last element below the fold.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  const showNav = !isLoading && isAuthenticated && !isBareRoute(pathname);

  return (
    <div
      className={
        showNav
          ? 'flex min-h-[100dvh] flex-col [--nav-h:4.75rem] md:[--nav-h:4.5rem] ' +
            'pb-[calc(var(--nav-h)+env(safe-area-inset-bottom))] md:pb-0 md:pt-[var(--nav-h)]'
          : 'flex min-h-[100dvh] flex-col [--nav-h:0px]'
      }
    >
      {children}
      {showNav && <AppNav />}
    </div>
  );
}

export default AppShell;
