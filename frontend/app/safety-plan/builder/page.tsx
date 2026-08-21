'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function SafetyPlanBuilder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Link href={ROUTES.home} className="text-primary-700 hover:text-primary-900 font-semibold mb-6 inline-block">
          ← Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-4">
            Build Your Safety Plan
          </h1>
          <p className="text-gray-600 mb-8">
            A safety plan is a personalized list of strategies and contacts to help you during difficult moments. This page is a stub and will be fully implemented on Day 5.
          </p>

          <div className="space-y-6">
            <div className="bg-primary-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-primary-900 mb-3">📍 Warning Signs</h2>
              <p className="text-gray-600 text-sm mb-4">Recognize the early signs that you're struggling</p>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500 text-sm">
                Coming soon...
              </div>
            </div>

            <div className="bg-accent-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-primary-900 mb-3">🛠️ Coping Strategies</h2>
              <p className="text-gray-600 text-sm mb-4">Things you can do to feel better</p>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500 text-sm">
                Coming soon...
              </div>
            </div>

            <div className="bg-blue-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-primary-900 mb-3">👥 Trusted Contacts</h2>
              <p className="text-gray-600 text-sm mb-4">People you can reach out to for support</p>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500 text-sm">
                Coming soon...
              </div>
            </div>

            <div className="bg-green-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-primary-900 mb-3">💪 Reasons to Stay Safe</h2>
              <p className="text-gray-600 text-sm mb-4">Things that matter to you and reasons to keep going</p>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500 text-sm">
                Coming soon...
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button disabled className="bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg cursor-not-allowed">
              Save & Export PDF (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
