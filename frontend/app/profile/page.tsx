'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPreferences, updatePreferences, resetPassword } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';
import type { UserPreferences } from '@/lib/types';
import {
  SUPPORT_STYLE_OPTIONS,
  TOPICS_OF_CONCERN,
  COMMON_TOPICS_TO_AVOID,
  LANGUAGES,
  ROUTES,
} from '@/lib/constants';

type Tab = 'preferences' | 'password';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [tab, setTab] = useState<Tab>('preferences');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Password reset form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load preferences
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

  const handleSavePreferences = async () => {
    if (!preferences) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await updatePreferences(preferences);
      setSuccessMessage('Preferences updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!preferences) return;

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
    const updated = current.includes(topic)
      ? current.filter((t) => t !== topic)
      : [...current, topic];
    setPreferences({ ...preferences, topicsOfConcern: updated });
  };

  const handleAvoidTopicToggle = (topic: string) => {
    if (!preferences) return;
    const current = preferences.topicsToAvoid || [];
    const updated = current.includes(topic)
      ? current.filter((t) => t !== topic)
      : [...current, topic];
    setPreferences({ ...preferences, topicsToAvoid: updated });
  };

  const handleSupportStyleChange = (style: string) => {
    if (!preferences) return;
    setPreferences({ ...preferences, preferredSupportStyle: style as any });
  };

  const handleLanguageChange = (code: string) => {
    if (!preferences) return;
    setPreferences({ ...preferences, languages: [code] });
  };

  if (loading && !preferences) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--umeed-beige-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '18px',
            color: 'var(--umeed-ink-500)',
          }}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--umeed-beige-50)',
      paddingLeft: '80px',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        padding: '20px 40px',
        borderBottom: '1px solid var(--umeed-orange-200)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{
          fontSize: '28px',
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 700,
          color: 'var(--umeed-ink-900)',
          margin: 0,
        }}>
          Profile Settings
        </h1>
        <Link
          href={ROUTES.chat}
          style={{
            backgroundColor: 'var(--umeed-orange-500)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '9999px',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'all 300ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--umeed-orange-700)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--umeed-orange-500)';
          }}
        >
          Back to Chat
        </Link>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '600px',
        margin: '40px auto',
        paddingLeft: '20px',
        paddingRight: '20px',
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          borderBottom: '1px solid var(--umeed-orange-100)',
        }}>
          <button
            onClick={() => setTab('preferences')}
            style={{
              padding: '12px 24px',
              borderRadius: '0',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: tab === 'preferences' ? '3px solid var(--umeed-orange-500)' : 'none',
              color: tab === 'preferences' ? 'var(--umeed-orange-500)' : 'var(--umeed-ink-500)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 300ms',
            }}
          >
            Preferences
          </button>
          <button
            onClick={() => setTab('password')}
            style={{
              padding: '12px 24px',
              borderRadius: '0',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: tab === 'password' ? '3px solid var(--umeed-orange-500)' : 'none',
              color: tab === 'password' ? 'var(--umeed-orange-500)' : 'var(--umeed-ink-500)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 300ms',
            }}
          >
            Password
          </button>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div style={{
            backgroundColor: 'var(--umeed-crisis-100)',
            border: `1px solid var(--umeed-crisis-300)`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: 'var(--umeed-crisis-700)',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            backgroundColor: 'var(--umeed-green-100)',
            border: `1px solid var(--umeed-green-300)`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: 'var(--umeed-green-700)',
            fontSize: '14px',
          }}>
            {successMessage}
          </div>
        )}

        {/* Preferences Tab */}
        {tab === 'preferences' && preferences && (
          <div>
            {/* Name */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--umeed-ink-900)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Your Name
              </label>
              <input
                type="text"
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
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Support Style */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--umeed-ink-900)',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                How do you prefer support?
              </label>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
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
            </div>

            {/* Topics */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--umeed-ink-900)',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                What's on your mind?
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
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
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topics to avoid */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--umeed-ink-900)',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Anything you'd rather I steer away from?
              </label>
              <p style={{
                fontSize: '14px',
                color: 'var(--umeed-ink-500)',
                marginTop: 0,
                marginBottom: '16px',
              }}>
                Optional. I'll acknowledge these if they come up but won't push deeper.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
                {COMMON_TOPICS_TO_AVOID.map((topic) => {
                  const selected = preferences.topicsToAvoid?.includes(topic) || false;
                  return (
                    <button
                      key={topic}
                      onClick={() => handleAvoidTopicToggle(topic)}
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
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cultural context */}
            <div style={{ marginBottom: '32px' }}>
              <label htmlFor="cultural-context-input" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--umeed-ink-900)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Anything about your background or culture you'd like me to keep in mind? Optional.
              </label>
              <textarea
                id="cultural-context-input"
                placeholder="Share as much or as little as you'd like"
                value={preferences.culturalContext || ''}
                onChange={(e) => setPreferences({ ...preferences, culturalContext: e.target.value })}
                rows={3}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  border: `1px solid var(--umeed-orange-100)`,
                  backgroundColor: 'white',
                  color: 'var(--umeed-ink-900)',
                  fontSize: '16px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  outline: 'none',
                  transition: 'all 300ms',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Language */}
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
                Preferred Language
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
                  boxSizing: 'border-box',
                }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSavePreferences}
              disabled={loading}
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
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--umeed-ink-900)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
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
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--umeed-ink-900)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--umeed-ink-900)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={handlePasswordReset}
              disabled={passwordLoading}
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
                opacity: passwordLoading ? 0.7 : 1,
              }}
            >
              {passwordLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
