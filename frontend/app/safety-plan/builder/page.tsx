'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSafetyPlan,
  saveSafetyPlan,
  getSafetyPlanSuggestions,
} from '@/lib/api';
import { ROUTES } from '@/lib/constants';
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
  tabLabel: string;
  heading: string;
  subtext: string;
  placeholder?: string;
  field?: keyof SafetyPlan;
}

const STEPS: StepConfig[] = [
  {
    key: 'warning',
    tabLabel: 'Warning signs',
    heading: 'What do you notice first when things start feeling heavy?',
    subtext: "Write as much or as little as you like. It's just for you.",
    placeholder: 'e.g., I stop replying to messages, I lose interest in eating, I go quiet...',
    field: 'warningSigns',
  },
  {
    key: 'coping',
    tabLabel: 'Coping strategies',
    heading: "What actually helps you when you're struggling?",
    subtext: "Write as much or as little as you like. It's just for you.",
    placeholder: 'e.g., A slow walk, calling my sister, making chai and sitting outside...',
    field: 'copingStrategies',
  },
  {
    key: 'contacts',
    tabLabel: 'People in your corner',
    heading: 'Who can you reach out to?',
    subtext: 'People you trust to be there for you, even just to sit with you.',
  },
  {
    key: 'reasons',
    tabLabel: 'What keeps you going',
    heading: 'What keeps you going, even on hard days?',
    subtext: "Write as much or as little as you like. It's just for you.",
    placeholder: "e.g., My family needs me, finishing what I've started, my faith...",
    field: 'reasonsToStaySafe',
  },
  {
    key: 'environment',
    tabLabel: 'Making space safer',
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
  const [userId] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : ''));
  const [plan, setPlan] = useState<SafetyPlan>(EMPTY_PLAN);
  const [contactDraft, setContactDraft] = useState<TrustedContact>(EMPTY_CONTACT);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  useEffect(() => {
    if (!userId) {
      if (typeof window !== 'undefined') window.location.href = ROUTES.onboarding;
      return;
    }

    getSafetyPlan()
      .then((existing) => {
        if (existing) setPlan({ ...EMPTY_PLAN, ...existing });
      })
      .finally(() => setLoading(false));
  }, [userId]);

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
        return null;
      }
    },
    [userId]
  );

  const goToStep = async (index: number) => {
    setStatusMessage(null);
    await persist(plan);
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
    const saved = await persist(plan);
    setSaving(false);
    if (saved) router.push(ROUTES.safetyPlanView);
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    setStatusMessage(null);
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
    } finally {
      setSuggesting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--umeed-beige-50)',
      }}>
        <p style={{ color: 'var(--umeed-ink-500)' }}>Loading your safety plan...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--umeed-beige-50)',
      paddingLeft: '80px',
      paddingTop: '40px',
      paddingBottom: '60px',
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '900px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '40px',
        paddingRight: '40px',
        marginBottom: '40px',
      }}>
        <h1 style={{
          fontSize: '44px',
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 700,
          color: 'var(--umeed-ink-900)',
          margin: '0 0 16px 0',
        }}>
          My Safety Plan
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--umeed-ink-500)',
          margin: 0,
        }}>
          Step {stepIndex + 1} of {STEPS.length}
        </p>
        <div style={{
          height: '4px',
          backgroundColor: 'var(--umeed-orange-100)',
          borderRadius: '2px',
          marginTop: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            backgroundColor: 'var(--umeed-orange-500)',
            width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
            transition: 'width 400ms cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        </div>
      </div>

      {/* Notebook section */}
      <div style={{
        maxWidth: '900px',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: 'white',
        borderLeft: '12px solid var(--umeed-orange-500)',
        paddingLeft: '40px',
        paddingRight: '40px',
        paddingTop: '40px',
        paddingBottom: '40px',
        position: 'relative',
      }}>
        {/* Spine lines */}
        <div style={{
          position: 'absolute',
          left: '40px',
          top: 0,
          bottom: 0,
          width: '2px',
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            var(--umeed-orange-100) 0,
            var(--umeed-orange-100) 24px,
            transparent 24px,
            transparent 28px
          )`,
        }} />

        {/* Content */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '28px',
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 700,
            color: 'var(--umeed-ink-900)',
            margin: '0 0 8px 0',
          }}>
            {step.heading}
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--umeed-ink-500)',
            margin: 0,
          }}>
            {step.subtext}
          </p>
        </div>

        {statusMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '4px',
            backgroundColor: 'var(--umeed-orange-100)',
            borderLeft: '4px solid var(--umeed-orange-500)',
            color: 'var(--umeed-ink-900)',
            fontSize: '14px',
            marginBottom: '24px',
          }}>
            {statusMessage}
          </div>
        )}

        {/* Text input fields */}
        {step.field ? (
          <textarea
            aria-label={step.heading}
            value={(plan[step.field] as string[]).join('\n')}
            onChange={(e) => setPlan((prev) => ({ ...prev, [step.field as keyof SafetyPlan]: linesToArray(e.target.value) }))}
            placeholder={step.placeholder}
            rows={10}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px dashed var(--umeed-orange-500)',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: 'var(--umeed-ink-900)',
              fontSize: '16px',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: 1.6,
              transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              outline: 'none',
              resize: 'vertical',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--umeed-orange-700)';
              e.currentTarget.style.backgroundColor = 'var(--umeed-orange-100)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--umeed-orange-500)';
              e.currentTarget.style.backgroundColor = 'white';
            }}
          />
        ) : (
          <div>
            {/* Contacts list */}
            {plan.trustedContacts.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                {plan.trustedContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '12px',
                      marginBottom: '12px',
                      borderBottom: '1px solid var(--umeed-orange-100)',
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: 'var(--umeed-ink-900)',
                      }}>
                        {contact.name || 'Unnamed contact'}
                      </div>
                      {(contact.relationship || contact.phone) && (
                        <div style={{
                          fontSize: '14px',
                          color: 'var(--umeed-ink-500)',
                          marginTop: '4px',
                        }}>
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
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        color: 'var(--umeed-ink-500)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transition: 'color 300ms',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--umeed-orange-500)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--umeed-ink-500)';
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add contact form */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--umeed-ink-900)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ayesha"
                  value={contactDraft.name}
                  onChange={(e) => setContactDraft((prev) => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px dashed var(--umeed-orange-500)',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: 'var(--umeed-ink-900)',
                    fontSize: '14px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    outline: 'none',
                    transition: 'all 300ms',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--umeed-orange-700)';
                    e.currentTarget.style.backgroundColor = 'var(--umeed-orange-100)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--umeed-orange-500)';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--umeed-ink-900)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Relationship
                </label>
                <input
                  type="text"
                  placeholder="e.g. sister, friend"
                  value={contactDraft.relationship}
                  onChange={(e) => setContactDraft((prev) => ({ ...prev, relationship: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px dashed var(--umeed-orange-500)',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: 'var(--umeed-ink-900)',
                    fontSize: '14px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    outline: 'none',
                    transition: 'all 300ms',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--umeed-orange-700)';
                    e.currentTarget.style.backgroundColor = 'var(--umeed-orange-100)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--umeed-orange-500)';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--umeed-ink-900)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 03xx-xxxxxxx"
                  value={contactDraft.phone}
                  onChange={(e) => setContactDraft((prev) => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px dashed var(--umeed-orange-500)',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: 'var(--umeed-ink-900)',
                    fontSize: '14px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    outline: 'none',
                    transition: 'all 300ms',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--umeed-orange-700)';
                    e.currentTarget.style.backgroundColor = 'var(--umeed-orange-100)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--umeed-orange-500)';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--umeed-ink-900)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. ayesha@example.com"
                  value={contactDraft.email}
                  onChange={(e) => setContactDraft((prev) => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px dashed var(--umeed-orange-500)',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: 'var(--umeed-ink-900)',
                    fontSize: '14px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    outline: 'none',
                    transition: 'all 300ms',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--umeed-orange-700)';
                    e.currentTarget.style.backgroundColor = 'var(--umeed-orange-100)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--umeed-orange-500)';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddContact}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                border: `1px solid var(--umeed-orange-500)`,
                borderRadius: '4px',
                color: 'var(--umeed-orange-500)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 300ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--umeed-orange-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Add contact
            </button>
          </div>
        )}

        {/* Suggest button */}
        <div style={{ marginTop: '32px' }}>
          <button
            type="button"
            onClick={handleSuggest}
            disabled={suggesting}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              border: `1px solid var(--umeed-green-600)`,
              borderRadius: '4px',
              color: 'var(--umeed-green-600)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: suggesting ? 'not-allowed' : 'pointer',
              opacity: suggesting ? 0.6 : 1,
              transition: 'all 300ms',
            }}
            onMouseEnter={(e) => {
              if (!suggesting) {
                e.currentTarget.style.backgroundColor = 'var(--umeed-green-600)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = 'var(--umeed-green-600)';
            }}
          >
            {suggesting ? 'Getting suggestions...' : 'Suggest from our chats'}
          </button>
        </div>
      </div>

      {/* Navigation buttons */}
      <div style={{
        maxWidth: '900px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '40px',
        paddingLeft: '40px',
        paddingRight: '40px',
        display: 'flex',
        gap: '12px',
      }}>
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={() => goToStep(stepIndex - 1)}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              border: `1px solid var(--umeed-ink-500)`,
              borderRadius: '4px',
              color: 'var(--umeed-ink-900)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 300ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--umeed-beige-200)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={isLastStep ? handleFinish : () => goToStep(stepIndex + 1)}
          disabled={saving}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: 'var(--umeed-orange-500)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontWeight: 700,
            fontSize: '14px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'all 300ms',
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = 'var(--umeed-orange-700)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--umeed-orange-500)';
          }}
        >
          {saving ? 'Saving...' : isLastStep ? 'See my plan' : 'Next'}
        </button>
      </div>
    </div>
  );
}
