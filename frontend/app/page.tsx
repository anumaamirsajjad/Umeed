'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary-900 mb-4">
          Your Supportive Companion
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          A warm, judgment-free space to talk about what's on your mind—adapted to how you prefer to get support.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {/* Chat Feature Card */}
        <Link href={ROUTES.chat}>
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-xl font-semibold text-primary-900 mb-2">
              Talk About Your Feelings
            </h2>
            <p className="text-gray-600">
              Share what's on your mind in a judgment-free space. Get empathetic support that respects your preferences.
            </p>
          </div>
        </Link>

        {/* Safety Plan Feature Card */}
        <Link href={ROUTES.safetyPlanBuilder}>
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-primary-900 mb-2">
              Build Your Safety Plan
            </h2>
            <p className="text-gray-600">
              Create a personal plan with warning signs, coping strategies, and trusted contacts you can reach out to.
            </p>
          </div>
        </Link>

        {/* Resources Feature Card */}
        <Link href={ROUTES.resources}>
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">🌍</div>
            <h2 className="text-xl font-semibold text-primary-900 mb-2">
              Find Resources
            </h2>
            <p className="text-gray-600">
              Browse crisis hotlines, professional services, and support groups in your region.
            </p>
          </div>
        </Link>

        {/* Preferences Feature Card */}
        <Link href={ROUTES.onboarding}>
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-xl font-semibold text-primary-900 mb-2">
              Customize Your Experience
            </h2>
            <p className="text-gray-600">
              Let us know how you prefer to get support, and we'll adapt to your needs.
            </p>
          </div>
        </Link>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <Link href={ROUTES.onboarding}>
          <button className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
            Get Started
          </button>
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          No account needed. Your privacy is protected.
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-16 p-6 bg-primary-100 rounded-lg text-center text-sm text-gray-700">
        <p className="mb-2">
          <strong>Important:</strong> This tool is a supportive companion, not a replacement for professional mental health care.
        </p>
        <p>
          If you're in crisis, please reach out to a crisis hotline immediately.{' '}
          <Link href={ROUTES.resources} className="text-primary-700 hover:underline font-semibold">
            Find resources here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
