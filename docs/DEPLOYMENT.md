# Deployment Guide

**Frontend:** Vercel · **Backend:** Render or Railway

Both platforms auto-deploy on push to `main` once connected — this doc covers the one-time
setup. Neither environment has been provisioned yet as of this writing; treat the steps below
as the checklist for doing that, not a record that it's already live.

## Backend (Render / Railway)

1. Create a new Web Service from the `Umeed` GitHub repo, root directory `backend/`.
2. Build command: `npm install && npm run build`. Start command: `npm start`.
3. Environment variables:
   | Var | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | your key — required, `env.ts` throws on boot without it |
   | `NODE_ENV` | `production` |
   | `PORT` | leave unset; Render/Railway inject their own and `env.ts` reads `process.env.PORT` |
   | `CORS_ORIGIN` | the deployed frontend URL, e.g. `https://umeed.vercel.app` (defaults to `http://localhost:3000` otherwise — chat requests from the real frontend will be blocked by CORS if you skip this) |
   | `CRISIS_CLASSIFIER_MODEL` | optional, defaults to `meta-llama/llama-3.1-8b-instruct` |
4. Persistence: the app uses a file-backed JSON store (`backend/data/*.json`, see
   `db/jsonStore.ts`), not a real database — despite `DATABASE_URL` existing as an env var,
   nothing currently reads it. On most PaaS free tiers the filesystem is **ephemeral**
   (wiped on redeploy/restart), so preferences/safety plans/mood entries will not survive a
   redeploy. Acceptable for a hackathon demo; flag as a known limitation, not a bug, if it
   comes up. A persistent disk (Render) or volume (Railway) fixes this if needed.
5. Verify after deploy: `GET https://<backend-url>/health` → `{"status":"ok"}`.

## Frontend (Vercel)

1. Import the repo into Vercel, root directory `frontend/`. Framework preset: Next.js
   (auto-detected).
2. Environment variable: `NEXT_PUBLIC_API_URL` = the deployed backend URL (from above).
3. Build command / output: Vercel's Next.js defaults are correct — no override needed.
4. Verify after deploy: load the URL, run the onboarding flow, send a chat message.

## Post-Deploy Verification (Phase 6.6 checklist)

- [ ] Frontend URL loads
- [ ] Backend `/health` returns `{"status":"ok"}`
- [ ] Chat works end-to-end (send a message from the deployed frontend, get a reply)
- [ ] Crisis escalation works (send a test crisis phrase, confirm the alert + hotlines appear)
- [ ] No errors in backend logs during the above

## Local Development

```bash
# Backend
cd backend
cp .env.example .env   # fill in ANTHROPIC_API_KEY
npm install
npm run dev             # http://localhost:5000

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:3000
```
