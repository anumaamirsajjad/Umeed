'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { savePreferences, checkOnboardingStatus } from '@/lib/api';
import type { UserPreferences } from '@/lib/types';
import {
  SUPPORT_STYLE_OPTIONS,
  TOPICS_OF_CONCERN,
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

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('redirect');
  const [loading, setLoading] = useState(false);
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userId');
      if (stored) return stored;
      const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', newId);
      return newId;
    }
    return '';
  });

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkOnboardingStatus();
        if (status.completed) {
          // User has completed onboarding, skip to chat
          router.push(ROUTES.chat);
        } else {
          // User hasn't completed onboarding, show the first step
          setStep('name');
        }
      } catch (err) {
        // If API fails, start onboarding (could be first-time user)
        setStep('name');
      }
    };

    checkStatus();
  }, [router]);

  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    name: '',
    preferredSupportStyle: 'mixed',
    topicsToAvoid: [],
    topicsOfConcern: [],
    languages: ['en'],
  });

  const handleTopicToggle = (topic: string) => {
    const current = preferences.topicsOfConcern || [];
    const updated = current.includes(topic)
      ? current.filter((t) => t !== topic)
      : [...current, topic];
    setPreferences({ ...preferences, topicsOfConcern: updated });
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
  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--umeed-beige-50)',
    }}>
      {/* Loading/Redirect state */}
      {step === 'redirect' && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: '44px',
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 700,
              color: 'var(--umeed-ink-900)',
              margin: '0 0 12px 0',
            }}>
              Welcome back
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--umeed-ink-500)',
              margin: 0,
            }}>
              Loading your preferences...
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {step !== 'complete' && step !== 'redirect' && (
        <div style={{
          height: '4px',
          backgroundColor: 'var(--umeed-orange-100)',
          position: 'sticky',
          top: 0,
        }}>
          <div style={{
            height: '100%',
            backgroundColor: 'var(--umeed-orange-500)',
            width: `${progress}%`,
            transition: 'width 400ms cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        </div>
      )}

      {step === 'name' && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}>
          <div style={{
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
          }}>
            <h1 style={{
              fontSize: '44px',
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 700,
              color: 'var(--umeed-ink-900)',
              margin: '0 0 12px 0',
            }}>
              Hello, I'm Umeed.
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--umeed-ink-500)',
              marginBottom: '48px',
              lineHeight: 1.6,
            }}>
              Your companion for the days that feel heavy — and the lighter ones too.
            </p>

            <div style={{ marginBottom: '32px' }}>
              <label htmlFor="name-input" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--umeed-ink-900)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                What should I call you?
              </label>
              <input
                id="name-input"
                type="text"
                placeholder="Your name or nickname"
                value={preferences.name || ''}
                onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
                maxLength={50}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '9999px',
                  border: `1px solid var(--umeed-orange-100)`,
                  backgroundColor: 'white',
                  color: 'var(--umeed-ink-900)',
                  fontSize: '16px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  outline: 'none',
                  transition: 'all 300ms',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--umeed-orange-500)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--umeed-orange-100)';
                }}
              />
            </div>

            <button
              onClick={() => setStep('topics')}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '9999px',
                backgroundColor: 'var(--umeed-orange-500)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 300ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--umeed-orange-700)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--umeed-orange-500)';
              }}
            >
              Let's start
            </button>
          </div>
        </div>
      )}

      {step === 'topics' && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}>
          <div style={{
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
          }}>
            <h1 style={{
              fontSize: '44px',
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 700,
              color: 'var(--umeed-ink-900)',
              margin: '0 0 12px 0',
            }}>
              What's on your mind?
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--umeed-ink-500)',
              marginBottom: '48px',
              lineHeight: 1.6,
            }}>
              Pick whatever feels true right now. You can always change this.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '32px',
            }} role="group" aria-label="What's on your mind">
              {TOPICS_OF_CONCERN.map((topic) => {
                const selected = preferences.topicsOfConcern?.includes(topic) || false;
                return (
                  <button
                    key={topic}
                    onClick={() => handleTopicToggle(topic)}
                    style={{
                      padding: '16px 12px',
                      borderRadius: '8px',
                      border: selected ? 'none' : `1px solid var(--umeed-orange-100)`,
                      backgroundColor: selected ? 'var(--umeed-orange-500)' : 'white',
                      color: selected ? 'white' : 'var(--umeed-ink-900)',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 300ms',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = 'var(--umeed-orange-100)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep('support-style')}
              disabled={(preferences.topicsOfConcern?.length || 0) === 0}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '9999px',
                backgroundColor: 'var(--umeed-orange-500)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 300ms',
                opacity: (preferences.topicsOfConcern?.length || 0) === 0 ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if ((preferences.topicsOfConcern?.length || 0) > 0) {
                  e.currentTarget.style.backgroundColor = 'var(--umeed-orange-700)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--umeed-orange-500)';
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'support-style' && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}>
          <div style={{
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
          }}>
            <h1 style={{
              fontSize: '44px',
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 700,
              color: 'var(--umeed-ink-900)',
              margin: '0 0 12px 0',
            }}>
              How do you prefer support?
            </h1>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '32px',
              marginBottom: '32px',
            }} role="radiogroup" aria-label="Preferred support style">
              {SUPPORT_STYLE_OPTIONS.map((option) => {
                const checked = preferences.preferredSupportStyle === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSupportStyleChange(option.value)}
                    style={{
                      textAlign: 'left',
                      padding: '16px',
                      borderRadius: '8px',
                      border: checked ? 'none' : `1px solid var(--umeed-orange-100)`,
                      backgroundColor: checked ? 'var(--umeed-orange-100)' : 'white',
                      color: 'var(--umeed-ink-900)',
                      transition: 'all 300ms',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!checked) {
                        e.currentTarget.style.backgroundColor = 'var(--umeed-orange-100)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!checked) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <div style={{
                      fontWeight: 700,
                      fontSize: '16px',
                      marginBottom: '4px',
                    }}>
                      {option.label}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--umeed-ink-500)',
                    }}>
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep('topics')}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '9999px',
                backgroundColor: 'white',
                color: 'var(--umeed-ink-900)',
                border: `1px solid var(--umeed-orange-100)`,
                fontWeight: 700,
                fontSize: '16px',
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
              Back
            </button>
          </div>
        </div>
      )}

      {step === 'languages' && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}>
          <div style={{
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
          }}>
            <h1 style={{
              fontSize: '44px',
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 700,
              color: 'var(--umeed-ink-900)',
              margin: '0 0 12px 0',
            }}>
              Preferred language
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'var(--umeed-ink-500)',
              marginBottom: '32px',
            }}>
              Select the language you'd like us to use when possible.
            </p>

            <div style={{ marginBottom: '32px' }}>
              <label htmlFor="language-select" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--umeed-ink-900)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Language
              </label>
              <select
                id="language-select"
                value={preferences.languages?.[0] || 'en'}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `1px solid var(--umeed-orange-100)`,
                  backgroundColor: 'white',
                  color: 'var(--umeed-ink-900)',
                  fontSize: '16px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  outline: 'none',
                  transition: 'all 300ms',
                  cursor: 'pointer',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--umeed-orange-500)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--umeed-orange-100)';
                }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
              <button
                onClick={() => setStep('support-style')}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '9999px',
                  backgroundColor: 'white',
                  color: 'var(--umeed-ink-900)',
                  border: `1px solid var(--umeed-orange-100)`,
                  fontWeight: 700,
                  fontSize: '16px',
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
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--umeed-orange-500)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 300ms',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'var(--umeed-orange-700)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--umeed-orange-500)';
                }}
              >
                {loading ? 'Saving...' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}>
          <div style={{
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: '44px',
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 700,
              color: 'var(--umeed-ink-900)',
              margin: '0 0 12px 0',
            }}>
              All set!
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--umeed-ink-500)',
              margin: '0 0 16px 0',
              lineHeight: 1.6,
            }}>
              Your preferences have been saved. Let's get started.
            </p>
            <p style={{
              fontSize: '14px',
              color: 'var(--umeed-ink-500)',
              margin: 0,
            }}>
              Redirecting to chat...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
