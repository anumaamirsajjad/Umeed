// Minimal script whose only job is to import env.ts, so a parent process
// (see jwtSecret.test.ts) can check whether env.ts's startup validation
// throws. Kept separate from env.ts's own logic so the parent test doesn't
// have to parse this file — it only cares about the child process's exit
// code and stderr.
import '../config/env.js';
console.log('env loaded without throwing');
