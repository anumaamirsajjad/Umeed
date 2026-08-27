'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendMessage, startNewChat, getPreferences, getMoodCheckinStatus, submitMoodCheckin } from '@/lib/api';
import { MoodCheckinModal } from '@/components/common/MoodCheckinModal';
import { ROUTES, CRISIS_ALERT_STORAGE_KEY } from '@/lib/constants';
import type { ChatMessage, ComfortMode, UserPreferences } from '@/lib/types';

// Add pulse animation keyframes
if (typeof document !== 'undefined' && !document.querySelector('#umeed-animations')) {
  const style = document.createElement('style');
  style.id = 'umeed-animations';
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
}

const COMFORT_MODES: { value: ComfortMode; label: string }[] = [
  { value: 'just_listen', label: 'Just listen' },
  { value: 'problem_solve', label: 'Problem-solve' },
  { value: 'distract', label: 'Distract' },
  { value: 'guide', label: 'Guide' },
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [comfortMode, setComfortMode] = useState<ComfortMode>('just_listen');
  const [showMoodCheckin, setShowMoodCheckin] = useState(false);
  const [loggedMood, setLoggedMood] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || '';
    }
    return '';
  });

  useEffect(() => {
    if (!userId) {
      if (typeof window !== 'undefined') {
        window.location.href = ROUTES.onboarding;
      }
    } else {
      getPreferences(userId)
        .then(setPreferences)
        .catch((err) => console.warn('Could not load preferences:', err));

      getMoodCheckinStatus(userId)
        .then((status) => setShowMoodCheckin(!status.checkedInToday))
        .catch((err) => console.warn('Could not load mood status:', err));
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleMoodSubmit = async (moodScore: number, moodEmoji: string) => {
    await submitMoodCheckin(userId, moodScore, moodEmoji);
    setLoggedMood(moodScore);
  };

  const handleInlineMoodTap = async (score: number, emoji: string) => {
    setLoggedMood(score);
    setShowMoodCheckin(false);
    try {
      await submitMoodCheckin(userId, score, emoji);
    } catch (err) {
      console.warn('Could not save mood check-in:', err);
    }
  };

  const handleNewChat = async () => {
    setMessages([]);
    setInput('');
    try {
      await startNewChat(userId);
    } catch (err) {
      console.warn('Could not clear server-side chat session:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage({
        message: input,
        userId,
        preferences: preferences || undefined,
        comfortMode,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        messageType: response.messageType,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.isCrisis && response.crisisAlert) {
        // Server-side crisis detection is the safety net — always escalate to
        // the full-screen Safety Mode, never leave this in-chat only.
        try {
          sessionStorage.setItem(CRISIS_ALERT_STORAGE_KEY, JSON.stringify(response.crisisAlert));
        } catch (err) {
          console.warn('Could not persist crisis alert for Safety Mode:', err);
        }
        router.push(ROUTES.crisis);
        return;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your message. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const greeting = `Hey ${preferences?.name?.trim() || 'there'}, good to see you.`;

  const moodLabel = loggedMood
    ? ['Really struggling', 'Not great', 'Okay', 'Good', 'Great'][loggedMood - 1]
    : 'Not set';

  const moodScores = [1, 2, 3, 4, 5];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--umeed-beige-50)',
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '80px',
    }}>
      <MoodCheckinModal
        isOpen={showMoodCheckin}
        onSubmit={handleMoodSubmit}
        onClose={() => setShowMoodCheckin(false)}
      />

      {/* Two-column layout: messages (left) + sidebar (right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '30px',
        flex: 1,
        overflow: 'hidden',
        padding: '24px',
      }}>

        {/* Left: Messages Column */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--umeed-orange-100)',
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 700,
                color: 'var(--umeed-ink-900)',
                margin: 0,
              }}>
                Umeed
              </h1>
              <p style={{
                fontSize: '13px',
                color: 'var(--umeed-ink-500)',
                margin: '4px 0 0 0',
              }}>
                Your companion
              </p>
            </div>
            <Link
              href={ROUTES.crisis}
              style={{
                backgroundColor: 'var(--umeed-crisis-600)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Help Now
            </Link>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '640px',
          }}>
            {/* Greeting */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: '12px',
            }}>
              <div style={{
                backgroundColor: 'var(--umeed-orange-500)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
              }}>
                U
              </div>
              <div style={{
                backgroundColor: 'var(--umeed-beige-200)',
                padding: '12px 16px',
                borderRadius: '8px',
                color: 'var(--umeed-ink-900)',
                fontSize: '16px',
                lineHeight: 1.5,
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                maxWidth: '500px',
              }}>
                {greeting}
              </div>
            </div>

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: '12px',
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{
                    backgroundColor: 'var(--umeed-orange-500)',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    flexShrink: 0,
                  }}>
                    U
                  </div>
                )}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  lineHeight: 1.5,
                  maxWidth: '500px',
                  ...(msg.role === 'user' ? {
                    backgroundColor: 'var(--umeed-orange-100)',
                    color: 'var(--umeed-ink-900)',
                  } : msg.messageType === 'pattern_insight' ? {
                    backgroundColor: 'var(--umeed-green-600)',
                    color: 'white',
                  } : {
                    backgroundColor: 'var(--umeed-beige-200)',
                    color: 'var(--umeed-ink-900)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  }),
                }}>
                  {msg.messageType === 'pattern_insight' && (
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      marginBottom: '8px',
                      opacity: 0.9,
                    }}>
                      Pattern noticed
                    </div>
                  )}
                  <p style={{ margin: 0 }}>{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                gap: '12px',
              }}>
                <div style={{
                  backgroundColor: 'var(--umeed-orange-500)',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  flexShrink: 0,
                }}>
                  U
                </div>
                <div style={{
                  backgroundColor: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--umeed-orange-500)',
                      borderRadius: '50%',
                      animation: 'pulse 1s infinite',
                    }} />
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--umeed-orange-500)',
                      borderRadius: '50%',
                      animation: 'pulse 1s infinite',
                      animationDelay: '0.2s',
                    }} />
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--umeed-orange-500)',
                      borderRadius: '50%',
                      animation: 'pulse 1s infinite',
                      animationDelay: '0.4s',
                    }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} style={{
            display: 'flex',
            gap: '12px',
          }}>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Type your thoughts..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '9999px',
                border: `1px solid var(--umeed-orange-100)`,
                backgroundColor: 'white',
                color: 'var(--umeed-ink-900)',
                fontSize: '16px',
                fontFamily: 'Inter, system-ui, sans-serif',
                transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                outline: 'none',
                opacity: loading ? 0.5 : 1,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--umeed-orange-500)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--umeed-orange-100)';
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--umeed-orange-500)',
                color: 'white',
                border: 'none',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.backgroundColor = 'var(--umeed-orange-700)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--umeed-orange-500)';
              }}
            >
              →
            </button>
          </form>
        </div>

        {/* Right: Sidebar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          height: 'fit-content',
          position: 'sticky',
          top: '24px',
        }}>
          {/* Mood */}
          <div>
            <h3 style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--umeed-ink-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 12px 0',
            }}>
              How you're feeling
            </h3>
            <div style={{
              display: 'flex',
              gap: '4px',
            }}>
              {moodScores.map((score) => (
                <button
                  key={score}
                  onClick={() => handleInlineMoodTap(score, '')}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: `2px solid ${loggedMood === score ? 'var(--umeed-orange-500)' : 'var(--umeed-orange-100)'}`,
                    backgroundColor: loggedMood === score ? 'var(--umeed-orange-100)' : 'white',
                    color: 'var(--umeed-ink-900)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                  }}
                  title={['Really struggling', 'Not great', 'Okay', 'Good', 'Great'][score - 1]}
                >
                  {score}
                </button>
              ))}
            </div>
            <p style={{
              fontSize: '13px',
              color: 'var(--umeed-ink-500)',
              margin: '8px 0 0 0',
            }}>
              {moodLabel}
            </p>
          </div>

          {/* Comfort Mode */}
          <div>
            <h3 style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--umeed-ink-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 12px 0',
            }}>
              Support style
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {COMFORT_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setComfortMode(mode.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${comfortMode === mode.value ? 'var(--umeed-orange-500)' : 'var(--umeed-orange-100)'}`,
                    backgroundColor: comfortMode === mode.value ? 'var(--umeed-orange-100)' : 'white',
                    color: 'var(--umeed-ink-900)',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--umeed-orange-100)';
                  }}
                  onMouseLeave={(e) => {
                    if (comfortMode !== mode.value) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* New Chat */}
          <div>
            <button
              onClick={handleNewChat}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '4px',
                backgroundColor: 'white',
                border: `1px solid var(--umeed-orange-500)`,
                color: 'var(--umeed-orange-500)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--umeed-orange-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
