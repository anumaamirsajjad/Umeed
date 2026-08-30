/**
 * Regression test: buildSystemPrompt must include the user's stated
 * topicsOfConcern in the personalization addendum when present, and must
 * omit that section entirely when absent (Task 4, Bug 1 — topicsOfConcern
 * was previously dropped in chatController.ts before ever reaching
 * buildSystemPrompt).
 *
 * Pure function under test — no network calls, no live LLM API.
 *
 * Run with: npm run test:system-prompt-personalization
 */
import buildSystemPrompt from '../config/systemPrompt.js';
import type { UserPreferences } from '../types/index.js';

function basePreferences(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return {
    id: 'pref-test-user',
    userId: 'test-user',
    preferredSupportStyle: 'mixed',
    topicsToAvoid: [],
    languages: ['en'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

interface TestCase {
  name: string;
  run: () => boolean;
}

const testCases: TestCase[] = [
  {
    name: 'includes topicsOfConcern in the prompt when set',
    run: () => {
      const preferences = basePreferences({ topicsOfConcern: ['work stress', 'sleep'] });
      const prompt = buildSystemPrompt(preferences);
      return prompt.includes('They said this is on their mind right now: work stress, sleep');
    },
  },
  {
    name: 'omits the "on their mind right now" section when topicsOfConcern is empty',
    run: () => {
      const preferences = basePreferences({ topicsOfConcern: [] });
      const prompt = buildSystemPrompt(preferences);
      return !prompt.includes('on their mind right now');
    },
  },
  {
    name: 'omits the "on their mind right now" section when topicsOfConcern is omitted',
    run: () => {
      const preferences = basePreferences();
      delete preferences.topicsOfConcern;
      const prompt = buildSystemPrompt(preferences);
      return !prompt.includes('on their mind right now');
    },
  },
];

function run() {
  console.log('\nRunning system prompt personalization tests...\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const ok = testCase.run();
    if (ok) {
      passed++;
      console.log(`PASS: ${testCase.name}`);
    } else {
      failed++;
      console.log(`FAIL: ${testCase.name}`);
    }
  }

  console.log(`\n${passed}/${testCases.length} passed`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run();
