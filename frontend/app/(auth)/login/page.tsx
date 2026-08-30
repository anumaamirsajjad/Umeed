'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/lib/constants';
import { MoonToggle } from '@/components/common/MoonToggle';
import { checkOnboardingStatus } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Deliberately NOT authContext's `isLoading`: that one starts true while the
  // stored session is restored, which left this form disabled and the button
  // reading "Logging in…" before the user had typed anything.
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      const status = await checkOnboardingStatus().catch(() => ({ completed: false }));
      router.push(status.completed ? ROUTES.dashboard : ROUTES.onboarding);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That login didn’t work. Check your details and try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] jali-bg bg-surface-light dark:bg-surface-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md relative rounded-card bg-surface dark:bg-surface-darker shadow-sm border border-primary-100 dark:border-primary-900/40 p-8 animate-fade-up">
        <div className="absolute top-4 right-4">
          <MoonToggle size="sm" />
        </div>
        <div className="flex justify-center mb-6">
          <Image src="/logo.jpg" alt="Umeed" width={64} height={64} className="rounded-lg" />
        </div>
        <h1 className="font-display text-3xl font-bold text-center text-ink-light dark:text-ink-dark mb-1">
          Welcome back
        </h1>
        <p className="text-center text-ink-muted mb-8">
          Continue your journey with Umeed.
        </p>

        {error && (
          <div
            role="alert"
            className="bg-crisis-50 dark:bg-crisis-900/30 text-crisis-700 dark:text-crisis-300 px-4 py-3 rounded-lg mb-6 text-sm"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={submitting}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={submitting}
            autoComplete="current-password"
          />
          <Button type="submit" size="lg" loading={submitting} className="w-full rounded-pill">
            {submitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="text-center text-ink-muted mt-6 text-sm">
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.signup} className="text-primary-700 dark:text-primary-300 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
