# Phase 6.1: Comprehensive Test Report

**Date:** 2026-08-23
**Scope:** Crisis detection regex suite, TypeScript/build health, security & privacy review.

## Crisis Detection Suite (`npm run test:crisis-detection`)

This suite runs offline (no Claude API calls) against `crisisDetectionService.ts`, the
server-side regex safety net described in `CLAUDE.md`.

**Before this pass:**

| Metric | Result | Target |
|---|---|---|
| Sensitivity | 68.2% | ≥95% |
| Specificity | 50.0% | ≥98% |
| Tests passed | 20/32 (63%) | 32/32 |

This was a real safety gap: 7 of the 30+ required phrasings from `docs/CRISIS_DETECTION.md`
— including "nothing to live for", "my family would be better off without me", "I just don't
want to live anymore", and "I'm so tired of living" — were silently **not** escalating.
Root causes, fixed in `backend/src/services/crisisDetectionService.ts`:

1. Several documented phrasings ("nothing to live for", "better off without me") had no
   matching pattern at all.
2. Medium-confidence ("warning") patterns only escalated when **two or more** matched.
   `docs/CRISIS_DETECTION.md`'s own "SHOULD ESCALATE" examples are single ambiguous
   phrases, so this threshold contradicted the documented "err on the side of caution"
   design and silently downgraded real single-signal crisis messages to normal chat.
3. The bare word "suicide"/"suicidal" matched unconditionally, so academic, historical,
   media, and "used to feel suicidal but I'm better now" messages all falsely escalated —
   also explicitly against `docs/CRISIS_DETECTION.md`'s "SHOULD NOT TRIGGER" list.

**Fixes applied:**
- Added missing patterns for the documented phrasings above.
- Any single medium/warning pattern match now escalates (was: required 2+).
- Added a small, narrowly-scoped negation-context check: a **bare** "suicide/suicidal"
  mention (no other crisis/warning pattern) is suppressed only when the message also reads
  as academic/research, historical (a year is present), media/fictional, or an
  explicitly-resolved past experience ("used to... but I'm better now"). Any other crisis
  or warning pattern match still escalates regardless of this context — the suppression
  never overrides a real signal, it only stops the single-keyword false alarm.

**After this pass:**

| Metric | Result | Target |
|---|---|---|
| Sensitivity | **100%** | ≥95% ✅ |
| Specificity | **100%** | ≥98% ✅ |
| Tests passed | **32/32 (100%)** | 32/32 ✅ |

Re-run anytime with `cd backend && npm run test:crisis-detection`.

## Crisis Classifier (LLM layer, `npm run test:crisis-classifier`)

Wired up but **not run in this pass** — it calls the live classifier model over the network
for 24 multilingual (English / Roman Urdu / Roman Punjabi / code-switched) test cases, which
costs API calls. Run it manually before demo day: `cd backend && npm run test:crisis-classifier`.
The regex suite above is the independent safety net either way — see `chatController.ts`,
which escalates if *either* layer flags risk.

## System Prompt Validation (`npm run test:system-prompt`)

Wired up but **not run in this pass** — each of the 8 scenarios makes a real Claude API call.
Run manually before demo day: `cd backend && npm run test:system-prompt`.

## Build / Type-Check Health

- `cd backend && npx tsc --noEmit` — clean, no errors.
- `cd frontend && npx tsc --noEmit` — clean, no errors.
- `cd backend && npm run build` — succeeds.
- `cd frontend && npm run build` — succeeds (`next build`, all 7 routes prerender statically).

## Not Covered In This Pass

Mobile/screen-reader/keyboard testing, load testing, and live end-to-end click-through
require a running browser session and were not exercised here. See the Phase 6 checklist in
`COMPLETE_IMPLEMENTATION_PLAN.md` for what's still outstanding before demo day.
