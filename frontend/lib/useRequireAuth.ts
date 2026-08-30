'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './authContext';
import { checkOnboardingStatus } from './api';
import { ROUTES } from './constants';

interface UseRequireAuthOptions {
  /**
   * When true (default), also redirects to /onboarding if the authenticated
   * user hasn't saved onboarding preferences yet. Pass false on the
   * onboarding page itself, which handles that case on its own.
   */
  requireOnboarded?: boolean;
}

/**
 * Gates a page on real auth state (authContext), not the client-invented
 * localStorage['userId'] the app used to check instead. Redirects to /login
 * if not authenticated, or to /onboarding if authenticated but onboarding
 * isn't complete (unless requireOnboarded is false).
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { requireOnboarded = true } = options;
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.login);
      return;
    }

    if (requireOnboarded) {
      checkOnboardingStatus()
        .then((status) => {
          if (!status.completed) {
            router.replace(ROUTES.onboarding);
          }
        })
        .catch(() => {
          // A transient failure here shouldn't bounce an otherwise-valid
          // session — let the page's own data loading surface the real error.
        });
    }
  }, [isAuthenticated, isLoading, requireOnboarded, router]);

  return { isAuthenticated, isLoading };
}
