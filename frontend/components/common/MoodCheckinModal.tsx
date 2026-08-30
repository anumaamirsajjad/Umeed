'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface MoodCheckinModalProps {
  isOpen: boolean;
  onSubmit: (moodScore: number, moodEmoji: string) => void | Promise<void>;
  onClose: () => void;
}

const MOOD_OPTIONS = [
  { emoji: '😢', label: 'Really struggling' },
  { emoji: '😞', label: 'Not great' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😊', label: 'Great' },
];

export function MoodCheckinModal({ isOpen, onSubmit, onClose }: MoodCheckinModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  // The modal stays mounted while closed (it just renders null), so its state
  // outlives a close. Without this reset, checking in once left `saved` true
  // forever and every later open showed the confirmation panel with no controls.
  useEffect(() => {
    if (isOpen) {
      setSelected(null);
      setSaving(false);
      setSaved(false);
      setError(null);
      restoreFocusTo.current = document.activeElement as HTMLElement | null;
      // Focus the panel so the next Tab lands inside the dialog, not behind it.
      requestAnimationFrame(() => panelRef.current?.focus());
    } else {
      restoreFocusTo.current?.focus();
    }
  }, [isOpen]);

  // Escape to dismiss, and a focus trap so Tab cannot reach the page behind.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (selected === null) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(selected + 1, MOOD_OPTIONS[selected].emoji);
      setSaved(true);
      setTimeout(onClose, 1200);
    } catch {
      setError("That didn't save. Give it another try?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-overlay ease-umeed"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mood-checkin-title"
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl bg-surface dark:bg-surface-darker p-8 max-w-sm w-full shadow-lg space-y-6 outline-none"
      >
        {saved ? (
          <div className="text-center space-y-2 py-4">
            <div className="text-3xl" aria-hidden="true">✓</div>
            <p className="text-lg font-semibold text-primary-900 dark:text-primary-100" role="status">
              Thanks for checking in
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h2 id="mood-checkin-title" className="font-display text-section font-bold text-ink-light dark:text-ink-dark">
                How&apos;s your mood today?
              </h2>
              <p className="text-sm text-ink-muted">Just for you — private, and only takes a second.</p>
            </div>

            <div className="flex justify-center gap-2" role="radiogroup" aria-label="Select your mood">
              {MOOD_OPTIONS.map((option, i) => (
                <button
                  key={option.emoji}
                  type="button"
                  role="radio"
                  aria-checked={selected === i}
                  aria-label={option.label}
                  title={option.label}
                  onClick={() => setSelected(i)}
                  className={`text-3xl h-12 w-12 flex items-center justify-center rounded-lg transition-all duration-micro ease-umeed ${
                    selected === i
                      ? 'scale-110 bg-accent-100 dark:bg-accent-900/40'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {option.emoji}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-crisis-700 dark:text-crisis-300 text-center" role="alert">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Button className="w-full" size="lg" disabled={selected === null} loading={saving} onClick={handleSave}>
                Save
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-11 text-ink-muted hover:text-ink-light dark:hover:text-ink-dark text-sm transition-colors duration-micro ease-umeed"
              >
                Not today
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
