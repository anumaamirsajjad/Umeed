# Cultural Context-Aware Mental Health First Aid — Codebase Brief

**Built for:** Rescue Hacks 2026  
**Purpose:** Supportive chatbot + safety-plan builder that adapts to user-stated preferences (not demographics) while maintaining safety guardrails for crisis escalation.

## What This Codebase Does

1. **Onboarding** → Gentle, preference-based questions (not demographics)
2. **Conversational AI** → Claude API with carefully engineered system prompt
3. **Crisis Detection** → Server-side detection of crisis language → immediate escalation
4. **Safety Planning** → Guided builder for personal safety plan (exportable PDF)
5. **Resource Directory** → Filterable crisis/professional resources by region

## Critical Safety Guardrails

⚠️ **These are non-negotiable:**

### System Prompt (`backend/src/config/systemPrompt.ts`)
- Never diagnose mental illness or conditions
- Never claim to replace therapy or medical care
- Frame self as "supportive companion tool"
- Always surface crisis resources, not just in crisis cases—make them visible always
- Respect user-stated preferences from onboarding (family-talk, professional, solo coping)
- Never make cultural assumptions—adapt only to explicit preference statements

### Crisis Detection (`backend/src/services/crisisDetectionService.ts`)
- **Runs on server-side**, independent of LLM judgment
- Keywords/patterns: suicidal ideation, self-harm plans, acute despair, hopelessness, "no reason to live", "better off gone"
- **Err on side of caution** — ambiguous language → escalate
- Response: immediately show crisis hotline + gentle encouragement, do not keep conversation in chat only
- **Test extensively** with indirect/subtle phrasings before deployment

## Key Files

### Backend (Node.js/Express)
- `backend/src/index.ts` — Entry point
- `backend/src/config/systemPrompt.ts` — **THE CRITICAL PIECE** — Claude system prompt with guardrails
- `backend/src/services/claudeService.ts` — Claude API wrapper
- `backend/src/services/crisisDetectionService.ts` — Crisis language detection logic
- `backend/src/controllers/chatController.ts` — Chat endpoint logic
- `backend/src/db/schema.ts` — Database structure (user preferences, safety plans, NOT full chat history)
- `backend/src/routes/*.ts` — API endpoints

### Frontend (React/Next.js)
- `frontend/app/layout.tsx` — Root layout, theme setup
- `frontend/app/(auth)/onboarding/page.tsx` — Onboarding flow
- `frontend/app/chat/page.tsx` — Main chat interface
- `frontend/app/safety-plan/builder/page.tsx` — Safety plan builder
- `frontend/app/safety-plan/view/page.tsx` — View/export safety plan
- `frontend/app/resources/page.tsx` — Filterable resource directory
- `frontend/components/common/CrisisAlert.tsx` — **Crisis escalation UI** — always visible when triggered

### Documentation
- `docs/CRISIS_DETECTION.md` — Crisis detection test cases, phrasings, expected responses
- `docs/SYSTEM_PROMPT.md` — System prompt design rationale and iteration history
- `docs/API.md` — Backend API endpoints and payloads
- `docs/DEPLOYMENT.md` — Vercel + Render setup

### Data
- `resources-db/resources.json` — Structured crisis/professional resources by region/country
- Each resource: name, hotline, web, region, languages supported, availability

## Development Workflow

### Before touching the system prompt:
1. Read `docs/SYSTEM_PROMPT.md` to understand prior iterations
2. Test new versions extensively with the example scenarios in `docs/CRISIS_DETECTION.md`
3. Always err on side of caution with crisis escalation

### Before deploying:
1. Run full crisis detection test suite (see `docs/CRISIS_DETECTION.md`)
2. Verify crisis hotlines are current in `resources-db/resources.json`
3. Test onboarding flow end-to-end
4. Manually test with indirect crisis language ("I don't know why I bother", "my family would be better off", etc.)

## Database Schema

Three main tables:
- `user_preferences` — onboarding choices (preference_type, preference_value, user_id, created_at)
- `safety_plans` — user safety plans (user_id, warning_signs, coping_strategies, trusted_contacts, reasons_to_stay_safe, updated_at)
- `crisis_resources` — seeded from `resources-db/resources.json` (name, type, region, hotline, web_url, languages, availability)

**No full chat history stored.** Only preferences and explicitly saved safety plans.

## Deployment

**Frontend:** Vercel (automatic on main branch push)  
**Backend:** Render or Railway (automatic on main branch push)  
Env vars: `ANTHROPIC_API_KEY`, `JWT_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`

## Testing Checklist (Day 7)

- [ ] Onboarding flow complete, preferences stored correctly
- [ ] Chat responds with culturally respectful language
- [ ] System prompt never diagnoses or claims to replace therapy
- [ ] Crisis phrases trigger escalation (test: "I want to die", "no reason to continue", "my family would be better", "I'm going to hurt myself")
- [ ] Crisis alert UI shows immediately with hotline info
- [ ] Safety plan builder exports valid PDF
- [ ] Resource directory filters work by region
- [ ] No sensitive data logged or stored long-term
- [ ] Backend validates all user input (no injection attacks)
- [ ] Crisis hotlines are current (spot-check against known numbers)

## Constraints & Notes

- **Tone:** Warm, gentle, non-clinical. Soft colors (Tailwind palette), no harsh clinical iconography
- **Scope:** One-week build for hackathon. Prioritize safety > polish
- **Ethics:** Adapt to preferences, never assume culture from demographics. If unsure, ask user
- **Crisis handling:** Always escalate + don't rely only on LLM judgment. Server-side detection is the safety net

---

**Last updated:** 2026-08-23  
**Next session focus:** Phase 6 (testing/security/docs) is done. `npm run test:crisis-classifier`
(20 PASS/1 WARN/2 FAIL of 23) and `npm run test:system-prompt` (8/8, avg 4.00/5) have both been
run — see `COMPLETE_IMPLEMENTATION_PLAN.md` Phase 6 summary for details and the two classifier
misses worth investigating. What's left: manually click through the app on mobile + with a
screen reader, and deployment (Vercel + Render/Railway) — see `docs/DEPLOYMENT.md`.
