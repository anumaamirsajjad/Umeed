'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSafetyPlan,
  saveSafetyPlan,
  getSafetyPlanSuggestions,
} from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StepProgress } from '@/components/ui/StepProgress';
import { Icon } from '@/components/ui/Icon';
import type { SafetyPlan, TrustedContact } from '@/lib/types';

const EMPTY_PLAN: SafetyPlan = {
  userId: '',
  warningSigns: [],
  copingStrategies: [],
  trustedContacts: [],
  reasonsToStaySafe: [],
  environmentSafetySteps: [],
};

const EMPTY_CONTACT: TrustedContact = { name: '', relationship: '', phone: '', email: '' };

type StepKey = 'warning' | 'coping' | 'contacts' | 'reasons' | 'environment';

interface StepConfig {
  key: StepKey;
  heading: string;
  subtext: string;
  placeholder?: string;
  field?: keyof SafetyPlan;
}

const STEPS: StepConfig[] = [
  {
    key: 'warning',
    heading: 'What do you notice first when things start feeling heavy?',
    subtext: "Write as much or as little as you like. It's just for you.",
    placeholder: 'e.g., I stop replying to messages, I lose interest in eating, I go quiet...',
    field: 'warningSigns',
  },
  {
    key: 'coping',
    heading: "What actually helps you when you're struggling?",
    subtext: "Write as much or as little as you like. It's just for you.",
    placeholder: 'e.g., A slow walk, calling my sister, making chai and sitting outside...',
    field: 'copingStrategies',
  },
  {
    key: 'contacts',
    heading: 'Who can you reach out to?',
    subtext: 'People you trust to be there for you, even just to sit with you.',
  },
  {
    key: 'reasons',
    heading: 'What keeps you going, even on hard days?',
    subtext: "Write as much or as little as you like. It's just for you.",
    placeholder: "e.g., My family needs me, finishing what I've started, my faith...",
    field: 'reasonsToStaySafe',
  },
  {
    key: 'environment',
    heading: "Is there anything you'd want to put out of reach on a hard day?",
    subtext: "Write as much or as little as you like. It's just for you.",
    placeholder: 'e.g., Staying off social media after 10pm, keeping my keys with [trusted contact]...',
    field: 'environmentSafetySteps',
  },
];

function linesToArray(text: string): string[] {
  return text.split('\n');
}

export default function SafetyPlanBuilder() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [plan, setPlan] = useState<SafetyPlan>(EMPTY_PLAN);
  const [contactDraft, setContactDraft] = useState<TrustedContact>(EMPTY_CONTACT);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  // Errors and "nothing to suggest yet" notes shared one style, so a failed
  // save looked exactly like a helpful tip.
  const [statusIsError, setStatusIsError] = useState(false);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    getSafetyPlan()
      .then((existing) => {
        if (existing) setPlan({ ...EMPTY_PLAN, ...existing });
      })
      .catch(() => {
        // Starting from a blank plan would silently overwrite a saved one on
        // the first "Next", so say what happened instead.
        setStatusMessage("We couldn't load your saved plan. Reload before editing so nothing gets overwritten.");
        setStatusIsError(true);
      })
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  const persist = useCallback(
    async (planToSave: SafetyPlan) => {
      try {
        const sanitized: SafetyPlan = {
          ...planToSave,
          warningSigns: planToSave.warningSigns.map((s) => s.trim()).filter(Boolean),
          copingStrategies: planToSave.copingStrategies.map((s) => s.trim()).filter(Boolean),
          reasonsToStaySafe: planToSave.reasonsToStaySafe.map((s) => s.trim()).filter(Boolean),
          environmentSafetySteps: planToSave.environmentSafetySteps.map((s) => s.trim()).filter(Boolean),
        };
        const saved = await saveSafetyPlan(sanitized);
        setPlan(saved);
        return saved;
      } catch (error) {
        console.error('Error saving safety plan:', error);
        setStatusMessage('Something went wrong saving your plan. Please try again.');
        setStatusIsError(true);
        return null;
      }
    },
    []
  );

  // Stay on the current step when the save fails. Advancing regardless meant a
  // network blip discarded whatever the user had just written, with only a
  // status line they had already scrolled past.
  const goToStep = async (index: number) => {
    setStatusMessage(null);
    setStatusIsError(false);
    const saved = await persist(plan);
    if (!saved) return;
    setStepIndex(index);
  };

  const handleAddContact = () => {
    if (!contactDraft.name.trim()) return;
    setPlan((prev) => ({ ...prev, trustedContacts: [...prev.trustedContacts, contactDraft] }));
    setContactDraft(EMPTY_CONTACT);
  };

  const handleRemoveContact = (index: number) => {
    setPlan((prev) => ({ ...prev, trustedContacts: prev.trustedContacts.filter((_, i) => i !== index) }));
  };

  const handleFinish = async () => {
    setSaving(true);
    setStatusMessage(null);
    setStatusIsError(false);
    const saved = await persist(plan);
    setSaving(false);
    if (saved) router.push(ROUTES.safetyPlanView);
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    setStatusMessage(null);
    setStatusIsError(false);
    try {
      const suggestions = await getSafetyPlanSuggestions();
      const dedupe = (existing: string[], incoming: string[]) => Array.from(new Set([...existing, ...incoming]));

      switch (step.key) {
        case 'warning':
          if (suggestions.warningSigns.length === 0) {
            setStatusMessage("We don't have enough from our chats yet — keep talking with me, or fill this in yourself.");
            break;
          }
          setPlan((prev) => ({ ...prev, warningSigns: dedupe(prev.warningSigns, suggestions.warningSigns) }));
          break;
        case 'coping':
          if (suggestions.copingStrategies.length === 0) {
            setStatusMessage("We don't have enough from our chats yet — keep talking with me, or fill this in yourself.");
            break;
          }
          setPlan((prev) => ({ ...prev, copingStrategies: dedupe(prev.copingStrategies, suggestions.copingStrategies) }));
          break;
        case 'contacts':
          if (suggestions.trustedContacts.length === 0) {
            setStatusMessage("We don't have enough from our chats yet — you can add people yourself below.");
            break;
          }
          setPlan((prev) => ({
            ...prev,
            trustedContacts: [
              ...prev.trustedContacts,
              ...suggestions.trustedContacts.map((c) => ({ name: c.name, relationship: c.relationship })),
            ],
          }));
          break;
        case 'reasons':
          if (suggestions.reasonsToStaySafe.length === 0) {
            setStatusMessage("We don't have enough from our chats yet — keep talking with me, or fill this in yourself.");
            break;
          }
          setPlan((prev) => ({ ...prev, reasonsToStaySafe: dedupe(prev.reasonsToStaySafe, suggestions.reasonsToStaySafe) }));
          break;
        case 'environment':
          if (suggestions.environmentSafetySteps.length === 0) {
            setStatusMessage("We don't have enough from our chats yet — keep talking with me, or fill this in yourself.");
            break;
          }
          setPlan((prev) => ({
            ...prev,
            environmentSafetySteps: dedupe(prev.environmentSafetySteps, suggestions.environmentSafetySteps),
          }));
          break;
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setStatusMessage('Could not load suggestions right now.');
      setStatusIsError(true);
    } finally {
      setSuggesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-surface-light dark:bg-surface-dark">
        <p className="text-ink-muted" role="status">Loading your safety plan…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface-light dark:bg-surface-dark pt-8 pb-16 px-5">
      <div className="max-w-3xl mx-auto mb-10">
        <h1 className="font-display text-heading font-bold text-ink-light dark:text-ink-dark mb-4">My Safety Plan</h1>
        <StepProgress step={stepIndex + 1} total={STEPS.length} />
      </div>

      {/* Notebook section: a solid spine + faint rule lines evoke a page in a
          personal notebook, not a clinical form. */}
      <div className="max-w-3xl mx-auto relative rounded-2xl bg-surface dark:bg-surface-darker border border-primary-100 dark:border-primary-900/40 shadow-sm pl-12 pr-8 py-10 md:pl-14">
        <div
          className="absolute left-10 top-0 bottom-0 w-0.5 md:left-12"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, var(--umeed-orange-100) 0, var(--umeed-orange-100) 24px, transparent 24px, transparent 28px)',
          }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-3 rounded-l-2xl bg-primary-600" />

        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-ink-light dark:text-ink-dark mb-2">{step.heading}</h2>
          <p className="text-base text-ink-muted">{step.subtext}</p>
        </div>

        {statusMessage && (
          <div
            role={statusIsError ? 'alert' : 'status'}
            className={`px-4 py-3 rounded-lg text-sm mb-6 ${
              statusIsError
                ? 'bg-crisis-50 dark:bg-crisis-900/30 text-crisis-700 dark:text-crisis-300'
                : 'bg-primary-50 dark:bg-primary-900/20 text-ink-light dark:text-ink-dark'
            }`}
          >
            {statusMessage}
          </div>
        )}

        {step.field ? (
          <textarea
            aria-label={step.heading}
            value={(plan[step.field] as string[]).join('\n')}
            onChange={(e) => setPlan((prev) => ({ ...prev, [step.field as keyof SafetyPlan]: linesToArray(e.target.value) }))}
            placeholder={step.placeholder}
            rows={10}
            className="w-full p-4 rounded-2xl border border-primary-200 dark:border-primary-900/50 bg-surface-light dark:bg-surface-dark text-ink-light dark:text-ink-dark text-base leading-relaxed outline-none transition-colors duration-quick ease-umeed focus:border-primary-500 resize-vertical"
          />
        ) : (
          <div>
            {plan.trustedContacts.length > 0 && (
              <div className="mb-6 space-y-3">
                {plan.trustedContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center pb-3 border-b border-primary-100 dark:border-primary-900/40"
                  >
                    <div>
                      <div className="text-base font-bold text-ink-light dark:text-ink-dark">
                        {contact.name || 'Unnamed contact'}
                      </div>
                      {(contact.relationship || contact.phone) && (
                        <div className="text-sm text-ink-muted mt-1">
                          {contact.relationship && <span>{contact.relationship}</span>}
                          {contact.relationship && contact.phone && <span> · </span>}
                          {contact.phone && <span>{contact.phone}</span>}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(idx)}
                      aria-label={`Remove ${contact.name}`}
                      className="text-ink-muted hover:text-crisis-600 transition-colors duration-quick ease-umeed"
                    >
                      <Icon name="x" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Name"
                placeholder="e.g. Ayesha"
                value={contactDraft.name}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                label="Relationship"
                placeholder="e.g. sister, friend"
                value={contactDraft.relationship}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, relationship: e.target.value }))}
              />
              <Input
                label="Phone (optional)"
                type="tel"
                placeholder="e.g. 03xx-xxxxxxx"
                value={contactDraft.phone}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                label="Email (optional)"
                type="email"
                placeholder="e.g. ayesha@example.com"
                value={contactDraft.email}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            {/* Disabled rather than silently no-op'ing on an empty name. */}
            <Button variant="ghost" disabled={!contactDraft.name.trim()} onClick={handleAddContact}>
              <Icon name="people" className="icon-inline" />
              Add contact
            </Button>
          </div>
        )}

        <div className="mt-8">
          <Button
            variant="ghost"
            loading={suggesting}
            onClick={handleSuggest}
          >
            <Icon name="sparkle" className="icon-inline" />
            {suggesting ? 'Getting suggestions...' : 'Suggest from our chats'}
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-8 flex gap-3">
        {stepIndex > 0 && (
          <Button variant="ghost" onClick={() => goToStep(stepIndex - 1)}>
            Back
          </Button>
        )}
        <Button
          className="flex-1"
          loading={saving}
          onClick={isLastStep ? handleFinish : () => goToStep(stepIndex + 1)}
        >
          {saving ? 'Saving...' : isLastStep ? 'See my plan' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
