'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      await login(email, password);
      router.push(ROUTES.onboarding);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="min-h-screen jali-bg bg-surface-light dark:bg-surface-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-card bg-surface dark:bg-surface-darker shadow-sm border border-primary-100 dark:border-primary-900/40 p-8 animate-fade-up">
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
            autoComplete="current-password"
          />
          <Button type="submit" size="lg" loading={isLoading} className="w-full rounded-pill">
            {isLoading ? 'Logging in…' : 'Log in'}
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
