# Phase 6.3: Security & Privacy Review

**Date:** 2026-08-23

| Check | Status | Notes |
|---|---|---|
| No chat history stored long-term | ✅ | `sessionService.ts` keeps conversation turns in an in-memory `Map`, process lifetime only — nothing written to disk or `data/*.json`. |
| Only preferences and safety plans persisted | ✅ | `backend/data/*.json` (via `jsonStore.ts`) holds only `preferences`, `safety_plans`, `mood_entries`, and `patterns` — no message content. |
| No full messages in logs | ✅ | `chatController.ts` logs `userId` and crisis metadata (`severity`, `regex`, `classifier` booleans/labels) — never `message` or `claudeResponse` text. |
| Parameterized SQL queries | N/A | No SQL is in use. `db/connection.ts` (an old `sql.js`-based module) is present but unused/dead — nothing imports it; all persistence goes through the file-backed `jsonStore.ts`. Recommend deleting `connection.ts` in a follow-up to avoid confusion. |
| No unescaped user input (XSS) | ✅ | Backend is a JSON API (no server-rendered HTML with user content). Frontend renders chat messages as React text children (`{message.content}` style), not `dangerouslySetInnerHTML` — React escapes by default. |
| API keys in `.env` only | ✅ | `ANTHROPIC_API_KEY` etc. read via `dotenv/config` in `env.ts`; `.gitignore` excludes `.env`, `.env.local`, `.env.*.local`. `backend/data/` (which could contain user data) is also gitignored. |
| CORS configured correctly | ✅ | `cors({ origin: env.CORS_ORIGIN })`, defaults to `http://localhost:3000` in dev; must be set to the real frontend origin in production (see `DEPLOYMENT.md`). |
| Input validation on all endpoints | ⚠️ Partial | `chatController.ts` validates `message`/`userId` presence. Other controllers (onboarding, safety-plan, mood, resources) accept `req.body`/`req.query` fields largely as-is with light presence checks — no schema/type validation library (e.g. zod) is used. Low risk here since there's no SQL/HTML injection surface, but malformed payloads could produce confusing 500s rather than clean 400s. Left as a known gap (see below), not blocking for hackathon scope. |

## Findings

**Fixed in this pass:**
- Crisis detection sensitivity/specificity gap — see `PHASE_6_TEST_REPORT.md`. This was the
  one item that mattered for the "Safety (Non-Negotiable)" checklist in `CLAUDE.md`.

**Known gaps (not fixed, low severity, tracked for a future pass):**
- `backend/src/db/connection.ts` is dead code (broken `sql.js` wrapper, superseded by
  `jsonStore.ts` per the Phase 4/5 completion notes in `COMPLETE_IMPLEMENTATION_PLAN.md`).
  Safe to delete; not a security issue since nothing calls it, just clutter.
- Request body validation across non-chat controllers is presence-only, not shape/type
  validated. No exploitable vulnerability identified (no SQL/shell/HTML sinks touch this
  input), but a malformed request can currently reach a 500 instead of a clean 400.

## Verdict

No exploitable vulnerabilities found. The one real safety-relevant defect (crisis detection
sensitivity) has been fixed and re-verified — see the test report.
