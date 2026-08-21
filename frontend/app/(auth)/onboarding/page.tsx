'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePreferences } from '@/lib/api';
import type { UserPreferences } from '@/lib/types';
import {
  SUPPORT_STYLE_OPTIONS,
  COMMON_TOPICS_TO_AVOID,
  LANGUAGES,
  ROUTES,
} from '@/lib/constants';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'support-style' | 'topics' | 'languages' | 'complete'>('welcome');
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

  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    preferredSupportStyle: 'mixed',
    topicsToAvoid: [],
    languages: ['en'],
  });

  const handleSupportStyleChange = (style: string) => {
    setPreferences({ ...preferences, preferredSupportStyle: style as any });
    setStep('topics');
  };

  const handleTopicToggle = (topic: string) => {
    const current = preferences.topicsToAvoid || [];
    const updated = current.includes(topic)
      ? current.filter(t => t !== topic)
      : [...current, topic];
    setPreferences({ ...preferences, topicsToAvoid: updated });
  };

  const handleLanguageToggle = (lang: string) => {
    const current = preferences.languages || [];
    const updated = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang];
    setPreferences({ ...preferences, languages: updated });
  };

  const handleContinue = async () => {
    if (step === 'languages') {
      setLoading(true);
      try {
        await savePreferences(userId, preferences);
        setStep('complete');
        // Redirect to chat after 2 seconds
        setTimeout(() => {
          router.push(ROUTES.chat);
        }, 2000);
      } catch (error) {
        console.error('Error saving preferences:', error);
        alert('Error saving preferences. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (step === 'topics') {
      setStep('languages');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        {step === 'welcome' && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary-900 mb-4">
              Welcome
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Before we start, we'd like to understand how you prefer to get support. This helps us adapt our responses to what works best for you.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              We're not asking about your background or identity—just your preferences.
            </p>
            <button
              onClick={() => setStep('support-style')}
              className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 'support-style' && (
          <div>
            <h2 className="text-2xl font-bold text-primary-900 mb-6">
              How do you prefer to get support?
            </h2>
            <div className="space-y-3">
              {SUPPORT_STYLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSupportStyleChange(option.value)}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-accent-400 hover:bg-accent-50 transition-colors"
                >
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'topics' && (
          <div>
            <h2 className="text-2xl font-bold text-primary-900 mb-4">
              Any topics you'd like us to avoid?
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              (Optional — select topics you prefer not to discuss right now)
            </p>
            <div className="space-y-2">
              {COMMON_TOPICS_TO_AVOID.map((topic) => (
                <label key={topic} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.topicsToAvoid?.includes(topic) || false}
                    onChange={() => handleTopicToggle(topic)}
                    className="mr-3 w-5 h-5 text-accent-500"
                  />
                  <span className="text-gray-900">{topic}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setStep('languages')}
              className="mt-8 bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'languages' && (
          <div>
            <h2 className="text-2xl font-bold text-primary-900 mb-4">
              Preferred languages
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Select the languages you'd like us to use when possible.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <label key={lang.code} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.languages?.includes(lang.code) || false}
                    onChange={() => handleLanguageToggle(lang.code)}
                    className="mr-3 w-5 h-5 text-accent-500"
                  />
                  <span className="text-gray-900">{lang.name}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleContinue}
              disabled={loading}
              className="mt-8 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full"
            >
              {loading ? 'Saving...' : 'Complete'}
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-primary-900 mb-4">
              All set!
            </h2>
            <p className="text-gray-600 mb-8">
              Your preferences have been saved. Let's get started.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to chat...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
