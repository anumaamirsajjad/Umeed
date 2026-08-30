'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPreferences, updatePreferences, resetPassword } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { useAuth } from '@/lib/authContext';
import type { UserPreferences } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { MoonToggle } from '@/components/common/MoonToggle';
import {
  SUPPORT_STYLE_OPTIONS,
  TOPICS_OF_CONCERN,
  COMMON_TOPICS_TO_AVOID,
  LANGUAGES,
  ROUTES,
} from '@/lib/constants';

type Tab = 'preferences' | 'password';

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('preferences');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [dirty, setDirty] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const loadPreferences = async () => {
      try {
        const prefs = await getPreferences();
        setPreferences(prefs);
      } catch (err) {
        setError('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [authLoading, isAuthenticated]);

  // Edited preferences used to vanish silently on tab switch or navigation.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Single funnel for preference edits so `dirty` can't drift out of sync.
  const editPreferences = (patch: Partial<UserPreferences>) => {
    setPreferences((prev) => (prev ? { ...prev, ...patch } : prev));
    setDirty(true);
  };

  const handleLogout = () => {
    if (dirty && !window.confirm('You have unsaved changes. Sign out anyway?')) return;
    logout();
    router.replace(ROUTES.login);
  };

  const handleTabChange = (next: Tab) => {
    if (dirty && next !== tab && !window.confirm('You have unsaved changes. Leave this tab anyway?')) return;
    setError('');
    setSuccessMessage('');
    setTab(next);
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await updatePreferences(preferences);
      setSuccessMessage('Preferences saved');
      setDirty(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await resetPassword(currentPassword, newPassword);
      setSuccessMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleTopicToggle = (topic: string) => {
    if (!preferences) return;
    const current = preferences.topicsOfConcern || [];
    editPreferences({
      topicsOfConcern: current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic],
    });
  };

  const handleAvoidTopicToggle = (topic: string) => {
    if (!preferences) return;
    const current = preferences.topicsToAvoid || [];
    editPreferences({
      topicsToAvoid: current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic],
    });
  };

  const handleSupportStyleChange = (style: string) => {
    editPreferences({ preferredSupportStyle: style as UserPreferences['preferredSupportStyle'] });
  };

  const handleLanguageChange = (code: string) => {
    editPreferences({ languages: [code] });
  };

  if (loading && !preferences) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-surface-light dark:bg-surface-dark">
        <p className="text-lg text-ink-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface-light dark:bg-surface-dark">
      {/* md:top offset clears the floating desktop nav pill; on mobile the nav
          is a bottom bar so top-0 is correct there. */}
      <div className="bg-surface/80 dark:bg-surface-darker/80 backdrop-blur px-6 py-5 border-b border-primary-100 dark:border-primary-900/40 flex justify-between items-center gap-4 sticky top-0 md:top-[var(--nav-h)] z-10">
        <h1 className="font-display text-section font-bold text-ink-light dark:text-ink-dark">Profile Settings</h1>
        <div className="flex items-center gap-2">
          <MoonToggle size="sm" />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-pill min-h-11 px-4 text-sm font-semibold text-ink-muted hover:text-crisis-700 dark:hover:text-crisis-300 transition-colors duration-micro ease-umeed"
          >
            <Icon name="logout" className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 py-10">
        <div role="tablist" aria-label="Profile sections" className="flex gap-6 mb-8 border-b border-primary-100 dark:border-primary-900/40">
          {(['preferences', 'password'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => handleTabChange(t)}
              className={`px-1 pb-3 min-h-11 font-semibold text-sm capitalize transition-colors duration-quick ease-umeed border-b-2 -mb-px ${
                tab === t
                  ? 'border-primary-600 text-primary-700 dark:text-primary-300'
                  : 'border-transparent text-ink-muted hover:text-ink-light dark:hover:text-ink-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="bg-crisis-50 dark:bg-crisis-900/30 text-crisis-700 dark:text-crisis-300 rounded-lg px-4 py-3 mb-5 text-sm"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-lg px-4 py-3 mb-5 text-sm flex items-center gap-2"
          >
            <Icon name="sparkle" className="icon-inline" />
            {successMessage}
          </div>
        )}

        {tab === 'preferences' && preferences && (
          <div role="tabpanel" id="panel-preferences" aria-labelledby="tab-preferences" className="space-y-8">
            <Input
              label="Your name"
              value={preferences.name || ''}
              onChange={(e) => editPreferences({ name: e.target.value })}
              maxLength={50}
            />

            <div>
              <span className="block text-sm font-semibold text-ink-light dark:text-ink-dark mb-3" id="support-style-label">
                How do you prefer support?
              </span>
              <div className="flex flex-col gap-3" role="radiogroup" aria-labelledby="support-style-label">
                {SUPPORT_STYLE_OPTIONS.map((option) => {
                  const checked = preferences.preferredSupportStyle === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      onClick={() => handleSupportStyleChange(option.value)}
                      className={`text-left rounded-2xl p-4 transition-colors duration-quick ease-umeed ${
                        checked
                          ? 'bg-primary-100 dark:bg-primary-900/40'
                          : 'border border-primary-100 dark:border-primary-900/40 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}
                    >
                      <div className="font-semibold text-base text-ink-light dark:text-ink-dark mb-1">{option.label}</div>
                      <div className="text-sm text-ink-muted">{option.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-light dark:text-ink-dark mb-3">
                What&apos;s on your mind?
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPICS_OF_CONCERN.map((topic) => (
                  <Chip key={topic} selected={preferences.topicsOfConcern?.includes(topic) || false} onClick={() => handleTopicToggle(topic)}>
                    {topic}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-light dark:text-ink-dark mb-1">
                Anything you&apos;d rather I steer away from?
              </label>
              <p className="text-sm text-ink-muted mb-3">
                Optional. I&apos;ll acknowledge these if they come up but won&apos;t push deeper.
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_TOPICS_TO_AVOID.map((topic) => (
                  <Chip
                    key={topic}
                    selected={preferences.topicsToAvoid?.includes(topic) || false}
                    onClick={() => handleAvoidTopicToggle(topic)}
                  >
                    {topic}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="cultural-context-input" className="block text-sm font-semibold text-ink-light dark:text-ink-dark mb-2">
                Anything about your background or culture you&apos;d like me to keep in mind? Optional.
              </label>
              <textarea
                id="cultural-context-input"
                placeholder="Share as much or as little as you'd like"
                value={preferences.culturalContext || ''}
                onChange={(e) => editPreferences({ culturalContext: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full rounded-2xl border border-primary-200 dark:border-primary-900/50 bg-surface dark:bg-surface-dark px-4 py-3 text-base text-ink-light dark:text-ink-dark outline-none transition-colors duration-quick ease-umeed focus:border-primary-500 resize-vertical"
              />
            </div>

            <Select
              label="Preferred language"
              value={preferences.languages?.[0] || 'en'}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </Select>

            <Button size="lg" className="w-full rounded-pill" loading={loading} onClick={handleSavePreferences}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        )}

        {tab === 'password' && (
          <div role="tabpanel" id="panel-password" aria-labelledby="tab-password" className="space-y-5">
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button size="lg" className="w-full rounded-pill" loading={passwordLoading} onClick={handlePasswordReset}>
              {passwordLoading ? 'Changing password...' : 'Change password'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
