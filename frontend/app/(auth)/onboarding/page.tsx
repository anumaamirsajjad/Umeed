'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { savePreferences, checkOnboardingStatus } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { StepProgress } from '@/components/ui/StepProgress';
import { HeaderBand } from './HeaderBand';
import type { UserPreferences } from '@/lib/types';
import {
  SUPPORT_STYLE_OPTIONS,
  TOPICS_OF_CONCERN,
  COMMON_TOPICS_TO_AVOID,
  LANGUAGES,
  ROUTES,
} from '@/lib/constants';

type Step = 'name' | 'topics' | 'support-style' | 'languages' | 'complete' | 'redirect';

const STEP_NUMBER: Record<Step, number> = {
  name: 1,
  topics: 2,
  'support-style': 3,
  languages: 4,
  complete: 4,
  redirect: 0,
};
const TOTAL_STEPS = 4;

function StepShell({
  heading,
  subtext,
  children,
}: {
  heading: string;
  subtext: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen animate-fade-up">
      <HeaderBand heading={heading} subtext={subtext} />
      <div className="max-w-lg mx-auto w-full px-6 pt-8 pb-16">{children}</div>
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth({ requireOnboarded: false });
  const [step, setStep] = useState<Step>('redirect');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const checkStatus = async () => {
      try {
        const status = await checkOnboardingStatus();
        if (status.completed) {
          router.push(ROUTES.chat);
        } else {
          setStep('name');
        }
      } catch (err) {
        setStep('name');
      }
    };

    checkStatus();
  }, [isAuthenticated, isLoading, router]);

  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    name: '',
    preferredSupportStyle: 'mixed',
    topicsToAvoid: [],
    topicsOfConcern: [],
    languages: ['en'],
  });

  const handleTopicToggle = (topic: string) => {
    const current = preferences.topicsOfConcern || [];
    const updated = current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic];
    setPreferences({ ...preferences, topicsOfConcern: updated });
  };

  const handleAvoidTopicToggle = (topic: string) => {
    const current = preferences.topicsToAvoid || [];
    const updated = current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic];
    setPreferences({ ...preferences, topicsToAvoid: updated });
  };

  const handleSupportStyleChange = (style: string) => {
    setPreferences({ ...preferences, preferredSupportStyle: style as any });
    setStep('languages');
  };

  const handleLanguageChange = (code: string) => {
    setPreferences({ ...preferences, languages: [code] });
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await savePreferences(preferences);
      setStep('complete');
      setTimeout(() => {
        router.push(ROUTES.chat);
      }, 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = STEP_NUMBER[step];

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      {step === 'redirect' && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-ink-light dark:text-ink-dark mb-3">Welcome back</h1>
            <p className="text-lg text-ink-muted">Loading your preferences...</p>
          </div>
        </div>
      )}

      {step !== 'complete' && step !== 'redirect' && (
        <div className="sticky top-0 z-10 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur py-4">
          <StepProgress step={currentStep} total={TOTAL_STEPS} />
        </div>
      )}

      {step === 'name' && (
        <StepShell
          heading="Hello, I'm Umeed."
          subtext="Your companion for the days that feel heavy — and the lighter ones too."
        >
          <div className="mb-8">
            <Input
              label="What should I call you?"
              placeholder="Your name or nickname"
              value={preferences.name || ''}
              onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
              maxLength={50}
            />
          </div>

          <Button size="lg" className="w-full rounded-pill" onClick={() => setStep('topics')}>
            Let&apos;s start
          </Button>
        </StepShell>
      )}

      {step === 'topics' && (
        <StepShell heading="What's on your mind?" subtext="Pick whatever feels true right now. You can always change this.">
          <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="What's on your mind">
            {TOPICS_OF_CONCERN.map((topic) => (
              <Chip key={topic} selected={preferences.topicsOfConcern?.includes(topic) || false} onClick={() => handleTopicToggle(topic)}>
                {topic}
              </Chip>
            ))}
          </div>

          <h2 className="font-display text-xl font-bold text-ink-light dark:text-ink-dark mb-1">
            Anything you&apos;d rather I steer away from?
          </h2>
          <p className="text-sm text-ink-muted mb-4 leading-relaxed">
            Optional. I&apos;ll acknowledge these if they come up but won&apos;t push deeper.
          </p>

          <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Topics to avoid">
            {COMMON_TOPICS_TO_AVOID.map((topic) => (
              <Chip key={topic} selected={preferences.topicsToAvoid?.includes(topic) || false} onClick={() => handleAvoidTopicToggle(topic)}>
                {topic}
              </Chip>
            ))}
          </div>

          <div className="mb-8">
            <label
              htmlFor="cultural-context-input"
              className="block text-sm font-semibold text-ink-light dark:text-ink-dark mb-2"
            >
              Anything about your background or culture you&apos;d like me to keep in mind? Optional.
            </label>
            <textarea
              id="cultural-context-input"
              placeholder="Share as much or as little as you'd like"
              value={preferences.culturalContext || ''}
              onChange={(e) => setPreferences({ ...preferences, culturalContext: e.target.value })}
              rows={3}
              maxLength={500}
              className="w-full rounded-2xl border border-primary-200 dark:border-primary-900/50 bg-surface dark:bg-surface-dark px-4 py-3 text-base text-ink-light dark:text-ink-dark outline-none transition-colors duration-quick ease-umeed focus:border-primary-500 resize-vertical"
            />
          </div>

          <Button
            size="lg"
            className="w-full rounded-pill"
            disabled={(preferences.topicsOfConcern?.length || 0) === 0}
            onClick={() => setStep('support-style')}
          >
            Continue
          </Button>
        </StepShell>
      )}

      {step === 'support-style' && (
        <StepShell heading="How do you prefer support?" subtext="Choose whichever fits best — you can change this later.">
          <div className="flex flex-col gap-3 mb-8 mt-2" role="radiogroup" aria-label="Preferred support style">
            {SUPPORT_STYLE_OPTIONS.map((option) => {
              const checked = preferences.preferredSupportStyle === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSupportStyleChange(option.value)}
                  className={`text-left rounded-2xl p-4 transition-colors duration-quick ease-umeed ${
                    checked
                      ? 'bg-primary-100 dark:bg-primary-900/40'
                      : 'border border-primary-100 dark:border-primary-900/40 bg-surface dark:bg-surface-dark hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }`}
                >
                  <div className="font-semibold text-base text-ink-light dark:text-ink-dark mb-1">{option.label}</div>
                  <div className="text-sm text-ink-muted">{option.description}</div>
                </button>
              );
            })}
          </div>

          <Button variant="ghost" size="lg" className="w-full rounded-pill" onClick={() => setStep('topics')}>
            Back
          </Button>
        </StepShell>
      )}

      {step === 'languages' && (
        <StepShell heading="Preferred language" subtext="Select the language you'd like us to use when possible.">
          <div className="mb-8">
            <Select
              label="Language"
              value={preferences.languages?.[0] || 'en'}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" size="lg" className="flex-1 rounded-pill" onClick={() => setStep('support-style')}>
              Back
            </Button>
            <Button size="lg" className="flex-1 rounded-pill" loading={loading} onClick={handleComplete}>
              {loading ? 'Saving...' : 'Complete'}
            </Button>
          </div>
        </StepShell>
      )}

      {step === 'complete' && (
        <div className="min-h-screen flex items-center justify-center px-5">
          <div className="text-center animate-fade-up">
            <h1 className="font-display text-4xl font-bold text-ink-light dark:text-ink-dark mb-3">All set!</h1>
            <p className="text-lg text-ink-muted mb-2 leading-relaxed">
              Your preferences have been saved. Let&apos;s get started.
            </p>
            <p className="text-sm text-ink-muted">Redirecting to chat...</p>
          </div>
        </div>
      )}
    </div>
  );
}
