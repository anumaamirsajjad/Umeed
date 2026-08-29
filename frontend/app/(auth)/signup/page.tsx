'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/lib/constants';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await signup(email, password);
      router.push(ROUTES.onboarding);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  }

  return (
    <div className="min-h-screen jali-bg bg-surface-light dark:bg-surface-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-card bg-surface dark:bg-surface-darker shadow-sm border border-primary-100 dark:border-primary-900/40 p-8 animate-fade-up">
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
          <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
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
            disabled={isLoading}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <Button type="submit" size="lg" loading={isLoading} className="w-full rounded-pill">
            {isLoading ? 'Creating account…' : 'Create account'}
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
