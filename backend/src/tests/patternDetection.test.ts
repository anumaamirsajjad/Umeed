/**
 * Regression test: detectPatterns must actually be reachable with a real
 * accumulated message history, not just a length-1 array forever (Task 4,
 * Bug 2 — chatController.ts previously called detectPatterns(userId, [{ ...one
 * message... }]) on every turn, so the `recentMessages.length % 5 !== 0` gate
 * inside patternDetectionService.ts could never pass).
 *
 * Stubs global.fetch so no live network call / paid API call happens —
 * this only verifies the length-gate itself, not real pattern extraction.
 * The stub returns '[]' so detectPatterns saves nothing (no persistent
 * side effects on backend/data/user_patterns.json).
 *
 * Run with: npm run test:pattern-detection
 */
import { detectPatterns } from '../services/patternDetectionService.js';
import type { ChatMessage } from '../types/index.js';

const originalFetch = global.fetch;
let fetchCallCount = 0;

global.fetch = (async (...args: Parameters<typeof fetch>) => {
  fetchCallCount++;
  return new Response(JSON.stringify({ choices: [{ message: { content: '[]' } }] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}) as typeof fetch;

function messagesOfLength(n: number): ChatMessage[] {
  return Array.from({ length: n }, (_, i) => ({ role: 'user' as const, content: `test message ${i}` }));
}

interface TestCase {
  length: number;
  expectFetch: boolean;
}

const testCases: TestCase[] = [
  { length: 1, expectFetch: false },
  { length: 4, expectFetch: false },
  { length: 5, expectFetch: true },
  { length: 9, expectFetch: false },
  { length: 10, expectFetch: true },
];

async function run() {
  console.log('\nRunning pattern detection gate tests...\n');

  let passed = 0;
  let failed = 0;

  try {
    for (const testCase of testCases) {
      fetchCallCount = 0;
      await detectPatterns('test-user-id', messagesOfLength(testCase.length));

      const actualCalled = fetchCallCount > 0;
      const expectedCallCount = testCase.expectFetch ? 1 : 0;
      const ok = fetchCallCount === expectedCallCount;

      const name = `length=${testCase.length} should ${testCase.expectFetch ? '' : 'NOT '}trigger detection (fetchCallCount=${fetchCallCount})`;
      if (ok) {
        passed++;
        console.log(`PASS: ${name}`);
      } else {
        failed++;
        console.log(`FAIL: ${name} (called=${actualCalled})`);
      }
    }
  } finally {
    global.fetch = originalFetch;
  }

  console.log(`\n${passed}/${testCases.length} passed`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run();
