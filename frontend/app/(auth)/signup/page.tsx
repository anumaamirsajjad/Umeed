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

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  // See login/page.tsx: authContext's `isLoading` covers session restore, not
  // this form's submission.
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Fill in every field to create your account.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Those two passwords don’t match.');
      return;
    }

    if (password.length < 6) {
      setError('Use at least 6 characters for your password.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(email, password);
      router.push(ROUTES.onboarding);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We couldn’t create that account. Try again.');
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
          Create your account
        </h1>
        <p className="text-center text-ink-muted mb-8">
          Free to use. No demographic questions — ever.
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
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={submitting}
            autoComplete="new-password"
          />
          <Button type="submit" size="lg" loading={submitting} className="w-full rounded-pill">
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-ink-muted mt-6 text-sm">
          Already have an account?{' '}
          <Link href={ROUTES.login} className="text-primary-700 dark:text-primary-300 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
