'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendMessage, listConversations, getConversation, renameConversation, deleteConversation, getPreferences, getMoodCheckinStatus, submitMoodCheckin } from '@/lib/api';
import { MoodCheckinModal } from '@/components/common/MoodCheckinModal';
import { Avatar } from '@/components/common/Avatar';
import { Icon } from '@/components/ui/Icon';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ROUTES, CRISIS_ALERT_STORAGE_KEY } from '@/lib/constants';
import { useRequireAuth } from '@/lib/useRequireAuth';
import type { ChatMessage, ComfortMode, Conversation, UserPreferences } from '@/lib/types';

const COMFORT_MODES: { value: ComfortMode; label: string }[] = [
  { value: 'just_listen', label: 'Just listen' },
  { value: 'problem_solve', label: 'Problem-solve' },
  { value: 'distract', label: 'Distract' },
  { value: 'guide', label: 'Guide' },
];

const MOOD_LABELS = ['Really struggling', 'Not great', 'Okay', 'Good', 'Great'];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [comfortMode, setComfortMode] = useState<ComfortMode>('just_listen');
  const [showMoodCheckin, setShowMoodCheckin] = useState(false);
  const [loggedMood, setLoggedMood] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    getPreferences()
      .then(setPreferences)
      .catch((err) => console.warn('Could not load preferences:', err));

    getMoodCheckinStatus()
      .then((status) => setShowMoodCheckin(!status.checkedInToday))
      .catch((err) => console.warn('Could not load mood status:', err));

    listConversations()
      .then(async (list) => {
        setConversations(list);
        // A dashboard "recent conversations" card can deep-link here via
        // ?c=<id>; fall back to the most recent conversation otherwise.
        const requestedId = new URLSearchParams(window.location.search).get('c');
        const targetId = (requestedId && list.some((c) => c.id === requestedId))
          ? requestedId
          : list[0]?.id;
        if (targetId) {
          const { messages: loadedMessages } = await getConversation(targetId);
          setActiveConversationId(targetId);
          setMessages(loadedMessages);
        }
      })
      .catch((err) => console.warn('Could not load conversations:', err));
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleMoodSubmit = async (moodScore: number, moodEmoji: string) => {
    await submitMoodCheckin(moodScore, moodEmoji);
    setLoggedMood(moodScore);
  };

  const handleInlineMoodTap = async (score: number, emoji: string) => {
    setLoggedMood(score);
    setShowMoodCheckin(false);
    try {
      await submitMoodCheckin(score, emoji);
    } catch (err) {
      console.warn('Could not save mood check-in:', err);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setActiveConversationId(null);
  };

  const handleSelectConversation = async (id: string) => {
    if (id === activeConversationId) return;
    try {
      const { messages: loadedMessages } = await getConversation(id);
      setActiveConversationId(id);
      setMessages(loadedMessages);
    } catch (err) {
      console.warn('Could not load conversation:', err);
    }
  };

  const handleRenameSubmit = async (id: string) => {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;
    try {
      await renameConversation(id, title);
      const list = await listConversations();
      setConversations(list);
    } catch (err) {
      console.warn('Could not rename conversation:', err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await deleteConversation(id);
      const list = await listConversations();
      setConversations(list);
      if (id === activeConversationId) {
        handleNewChat();
      }
    } catch (err) {
      console.warn('Could not delete conversation:', err);
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
        preferences: preferences || undefined,
        comfortMode,
        conversationId: activeConversationId ?? undefined,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        messageType: response.messageType,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.conversationId !== activeConversationId) {
        setActiveConversationId(response.conversationId);
      }
      listConversations().then(setConversations).catch(() => {});

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
  const moodLabel = loggedMood ? MOOD_LABELS[loggedMood - 1] : 'Not set';
  const moodScores = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex flex-col">
      <MoodCheckinModal
        isOpen={showMoodCheckin}
        onSubmit={handleMoodSubmit}
        onClose={() => setShowMoodCheckin(false)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile/tablet backdrop for either open drawer */}
        {(sidebarOpen || rightPanelOpen) && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => {
              setSidebarOpen(false);
              setRightPanelOpen(false);
            }}
          />
        )}

        {/* Conversation list: overlay drawer below lg, collapsible column at lg+ */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-40 lg:z-auto w-64 lg:overflow-hidden
            transition-transform lg:transition-[width] duration-quick ease-umeed
            ${sidebarOpen ? 'translate-x-0 lg:w-64' : '-translate-x-full lg:translate-x-0 lg:w-0'}
            bg-surface dark:bg-surface-darker border-r border-primary-100 dark:border-primary-900/40
            lg:rounded-card lg:border lg:m-6 lg:mr-0
            p-4 flex flex-col gap-1 overflow-y-auto`}
        >
          <button
            onClick={handleNewChat}
            className="mb-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-3 py-2.5 transition-colors duration-micro ease-umeed"
          >
            + New chat
          </button>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-1 rounded-lg px-2.5 py-2 cursor-pointer transition-colors duration-micro ease-umeed ${
                conv.id === activeConversationId
                  ? 'bg-primary-100 dark:bg-primary-900/40'
                  : 'hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
              onClick={() => renamingId !== conv.id && handleSelectConversation(conv.id)}
            >
              {renamingId === conv.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(conv.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(conv.id)}
                  className="flex-1 text-sm px-1.5 py-0.5 rounded border border-primary-300 dark:border-primary-700 bg-surface dark:bg-surface-dark text-ink-light dark:text-ink-dark outline-none"
                />
              ) : (
                <span className="flex-1 text-sm text-ink-light dark:text-ink-dark truncate">{conv.title}</span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamingId(conv.id);
                  setRenameValue(conv.title);
                }}
                aria-label="Rename conversation"
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-ink-muted transition-opacity duration-micro ease-umeed"
              >
                <Icon name="pencil" className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conv.id);
                }}
                aria-label="Delete conversation"
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-ink-muted transition-opacity duration-micro ease-umeed"
              >
                <Icon name="trash" className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Middle: messages column, now with both drawer toggles in its header */}
        <div className="flex-1 flex flex-col min-w-0 p-6">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-primary-100 dark:border-primary-900/40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Toggle conversations"
                aria-pressed={sidebarOpen}
                className="h-9 w-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-micro ease-umeed"
              >
                <Icon name="menu" className="icon-inline" />
              </button>
              <div>
                <h1 className="font-display text-2xl font-bold text-ink-light dark:text-ink-dark m-0">Umeed</h1>
                <p className="text-xs text-ink-muted mt-1">Your companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.crisis}
                className="inline-flex items-center gap-1.5 rounded-pill bg-crisis-600 hover:bg-crisis-700 text-white text-xs font-bold px-4 py-2 transition-colors duration-micro ease-umeed whitespace-nowrap"
              >
                <Icon name="shield" className="h-3.5 w-3.5" />
                Help Now
              </Link>
              <button
                onClick={() => setRightPanelOpen((v) => !v)}
                aria-label="Toggle mood and support settings"
                aria-pressed={rightPanelOpen}
                className="h-9 w-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-micro ease-umeed"
              >
                <Icon name="heart" className="icon-inline" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-5 flex flex-col gap-4 max-w-[640px]">
            {/* Greeting */}
            <div className="flex justify-start gap-3">
              <Avatar size="sm" />
              <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-3 rounded-2xl rounded-tl-sm text-ink-light dark:text-ink-dark text-base leading-relaxed max-w-[500px]">
                {greeting}
              </div>
            </div>

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <Avatar size="sm" />}
                <div
                  className={`px-4 py-3 text-base leading-relaxed max-w-[500px] ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm'
                      : msg.messageType === 'pattern_insight'
                        ? 'bg-primary-700 text-white rounded-2xl rounded-tl-sm'
                        : 'bg-primary-50 dark:bg-primary-900/20 text-ink-light dark:text-ink-dark rounded-2xl rounded-tl-sm'
                  }`}
                >
                  {msg.messageType === 'pattern_insight' && (
                    <div className="text-xs font-bold mb-2 opacity-90 flex items-center gap-1">
                      <Icon name="sparkle" className="h-3 w-3" />
                      Pattern noticed
                    </div>
                  )}
                  <p className="m-0">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-3">
                <Avatar size="sm" />
                <div className="bg-surface dark:bg-surface-darker px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Type your thoughts..."
              className="flex-1 rounded-pill border border-primary-100 dark:border-primary-900/40 bg-surface dark:bg-surface-darker px-4 py-3 text-base text-ink-light dark:text-ink-dark outline-none transition-colors duration-quick ease-umeed focus:border-primary-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="h-12 w-12 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-colors duration-quick ease-umeed disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="arrowRight" className="icon-inline" />
            </button>
          </form>
        </div>

        {/* Right: mood/support panel — same drawer mechanism, mirrored to the right edge */}
        <div
          className={`fixed lg:static inset-y-0 right-0 z-40 lg:z-auto w-[300px] lg:overflow-hidden
            transition-transform lg:transition-[width] duration-quick ease-umeed
            ${rightPanelOpen ? 'translate-x-0 lg:w-[300px]' : 'translate-x-full lg:translate-x-0 lg:w-0'}
            bg-surface dark:bg-surface-darker border-l border-primary-100 dark:border-primary-900/40
            lg:rounded-card lg:border lg:m-6 lg:ml-0
            p-6 flex flex-col gap-6 overflow-y-auto`}
        >
          <div>
            <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-3">How you&apos;re feeling</h3>
            <div className="flex gap-1">
              {moodScores.map((score) => (
                <button
                  key={score}
                  onClick={() => handleInlineMoodTap(score, '')}
                  title={MOOD_LABELS[score - 1]}
                  className={`h-10 w-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors duration-quick ease-umeed ${
                    loggedMood === score
                      ? 'border-primary-500 bg-primary-100 dark:bg-primary-900/40 text-ink-light dark:text-ink-dark'
                      : 'border-primary-100 dark:border-primary-900/40 bg-surface dark:bg-surface-dark text-ink-light dark:text-ink-dark hover:border-primary-300'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-muted mt-2">{moodLabel}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-3">Support style</h3>
            <SegmentedControl
              options={COMFORT_MODES}
              value={comfortMode}
              onChange={setComfortMode}
              aria-label="Support style"
            />
          </div>

          <Link
            href={ROUTES.profile}
            className="block w-full text-center rounded-lg border border-primary-100 dark:border-primary-900/40 bg-surface dark:bg-surface-dark text-ink-light dark:text-ink-dark font-semibold text-sm px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-quick ease-umeed"
          >
            Profile settings
          </Link>
        </div>
      </div>
    </div>
  );
}
