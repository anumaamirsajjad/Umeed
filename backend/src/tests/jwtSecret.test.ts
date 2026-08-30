/**
 * Regression test: env.ts must refuse to start the process when JWT_SECRET
 * is missing, rather than falling back to a hardcoded secret that anyone
 * reading this repo could use to forge a valid auth token for any account.
 *
 * Spawns a child process because env.ts validates at import time (a
 * top-level throw) — that can't be exercised by re-importing the module
 * inside this same process, since Node caches ES module evaluation.
 *
 * Run with: npm run test:jwt-secret
 */
import { spawnSync } from 'child_process';

function run() {
  console.log('Testing that the server refuses to boot without JWT_SECRET...\n');

  const result = spawnSync(
    'node',
    [
      '--loader', 'ts-node/esm',
      '--experimental-specifier-resolution=node',
      'src/tests/_importEnvOnly.ts',
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, JWT_SECRET: '' },
      encoding: 'utf-8',
    }
  );

  const failedForRightReason =
    result.status !== 0 && /JWT_SECRET environment variable is required/.test(result.stderr || '');

  if (failedForRightReason) {
    console.log('✅ PASS: server refuses to start without JWT_SECRET set');
    process.exitCode = 0;
  } else {
    console.log('❌ FAIL: server did not refuse to start (or failed for an unrelated reason) without JWT_SECRET');
    console.log('exit code:', result.status);
    console.log('stdout:', result.stdout);
    console.log('stderr:', result.stderr);
    process.exitCode = 1;
  }
}

run();
