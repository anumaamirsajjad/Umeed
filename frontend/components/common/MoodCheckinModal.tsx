'use client';

import { useState } from 'react';
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

  if (!isOpen) return null;

  const handleSave = async () => {
    if (selected === null) return;
    setSaving(true);
    try {
      await onSubmit(selected + 1, MOOD_OPTIONS[selected].emoji);
      setSaved(true);
      setTimeout(onClose, 1200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-overlay ease-umeed"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mood-checkin-title"
    >
      <div className="rounded-2xl bg-surface dark:bg-surface-darker p-8 max-w-sm w-full shadow-xl space-y-6">
        {saved ? (
          <div className="text-center space-y-2 py-4">
            <div className="text-3xl" aria-hidden="true">✓</div>
            <p className="text-lg font-semibold text-primary-900 dark:text-primary-100">Thanks for checking in</p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h2 id="mood-checkin-title" className="text-xl font-bold text-primary-900 dark:text-primary-100">
                How's your mood today?
              </h2>
              <p className="text-sm text-ink-light/70 dark:text-ink-dark/70">
                Just for you — private, and only takes a second.
              </p>
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
                  className={`text-3xl p-2 rounded-lg transition-all duration-micro ease-umeed ${
                    selected === i ? 'scale-125 bg-accent-50 dark:bg-accent-900/30' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  {option.emoji}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Button className="w-full" size="lg" disabled={selected === null} loading={saving} onClick={handleSave}>
                Save
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-ink-light/60 dark:text-ink-dark/60 hover:text-ink-light dark:hover:text-ink-dark text-sm py-2 transition-colors duration-micro ease-umeed"
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
