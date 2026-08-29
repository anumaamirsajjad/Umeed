# Developer Guide

See `CLAUDE.md` at the repo root for the full architecture brief, critical safety guardrails,
and file map. This doc covers day-to-day dev workflow.

## Running Locally

```bash
# Backend — http://localhost:5000
cd backend
cp .env.example .env   # set ANTHROPIC_API_KEY and JWT_SECRET at minimum
npm install
npm run dev

# Frontend — http://localhost:3000
cd frontend
cp .env.example .env
npm install
npm run dev
```

Data persists to `backend/data/*.json` (gitignored) via `db/jsonStore.ts` — a minimal
file-backed key/value store, not a real database. Delete that directory to reset local state.

## Testing

```bash
cd backend
npm run test:crisis-detection    # offline, no API calls — regex safety net, run this often
npm run test:crisis-classifier   # hits the live classifier model — costs API calls
npm run test:system-prompt       # hits the live Claude API — costs API calls
npm run type-check               # tsc --noEmit
npm run lint

cd frontend
npx tsc --noEmit
npm run build                    # also type-checks + lints via Next.js
```

`npm run test:crisis-detection` should stay at 100% pass — see `docs/PHASE_6_TEST_REPORT.md`
and `docs/CRISIS_DETECTION.md` for the methodology and full test case list. If you add a
phrasing to `crisisDetectionService.ts`, add its test case to
`backend/src/tests/crisisDetection.test.ts` in the same change.

## Adding a Feature

1. **Backend:** route (`src/routes/`) → controller (`src/controllers/`) → service
   (`src/services/`). Controllers validate input and shape the response; services hold the
   actual logic.
2. **Frontend:** page in `app/`, shared UI in `components/`, API calls in `lib/api.ts`, shared
   types in `lib/types.ts` (kept in sync with `backend/src/types/index.ts` by hand — there's
   no shared package).
3. If the feature touches user messages or crisis handling in any way, read the "Critical
   Safety Guardrails" section of `CLAUDE.md` first and re-run the crisis detection suite
   before committing.

## Known Issues / Follow-ups

- `backend/src/db/connection.ts` is dead code (an old `sql.js`-based module, superseded by
  `jsonStore.ts`) — safe to delete, nothing imports it.
- Request validation on the onboarding/safety-plan/mood/resources controllers is
  presence-only, not schema-validated. Not currently exploitable (no SQL/HTML sinks), but
  malformed input can surface as a 500 instead of a clean 400 — see `docs/SECURITY_REVIEW.md`.
- The file-backed data store is not concurrency-safe and, on most PaaS free tiers, not
  durable across redeploys — see `docs/DEPLOYMENT.md`.

## Where Things Are

See the "Key Files" section of `CLAUDE.md` — it's the source of truth for file layout and is
kept current there rather than duplicated here.
