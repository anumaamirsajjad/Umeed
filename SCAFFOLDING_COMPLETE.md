# Project Scaffolding Complete ✓

## Summary

The **Cultural Context-Aware Mental Health First Aid** application has been fully scaffolded and is ready for Day 1 implementation.

### What's Ready to Go

#### 1. Frontend (React/Next.js 14)
- ✅ Full app router structure
- ✅ 4 main page flows: Home, Onboarding, Chat, Safety Plan, Resources
- ✅ Onboarding page with complete, tested logic
- ✅ TypeScript types and API client
- ✅ Tailwind CSS with warm, gentle color palette
- ✅ Environment configuration
- ✅ Constants for all UI options

#### 2. Backend (Node.js/Express)
- ✅ Express server scaffold with middleware
- ✅ **CRITICAL:** System prompt with full guardrails (never diagnose, never replace therapy, cultural humility, preference-based personalization)
- ✅ **CRITICAL:** Crisis detection service with comprehensive patterns and test cases
- ✅ Claude API wrapper (ready to call Anthropic)
- ✅ Logger utility
- ✅ Environment validation
- ✅ TypeScript types
- ✅ Error handling middleware

#### 3. Data & Configuration
- ✅ Database schema (SQLite/PostgreSQL compatible)
- ✅ 13 crisis/professional resources across 9 regions + global
- ✅ All package.json with dependencies configured
- ✅ .env templates for both projects

#### 4. Documentation
- ✅ `CLAUDE.md` — Codebase overview for future sessions
- ✅ `README.md` — Project overview and setup
- ✅ `API.md` — Complete endpoint documentation
- ✅ `CRISIS_DETECTION.md` — Patterns, test cases, methodology
- ✅ `SYSTEM_PROMPT.md` — Guardrail philosophy and evolution
- ✅ `IMPLEMENTATION_ROADMAP.md` — Day-by-day build plan
- ✅ `resources-db/README.md` — How to maintain crisis resources

---

## File Structure

```
rescue/
├── frontend/                          # Next.js React app
│   ├── app/
│   │   ├── (auth)/onboarding/        # ✅ Full onboarding flow
│   │   ├── chat/                      # Stub (ready for Day 1)
│   │   ├── safety-plan/               # Stubs (ready for Day 5)
│   │   ├── resources/                 # Stub (ready for Day 6)
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Home page
│   │   └── globals.css                # Global styles
│   ├── components/                    # Component structure ready
│   ├── lib/
│   │   ├── api.ts                     # ✅ API client
│   │   ├── types.ts                   # ✅ TypeScript types
│   │   ├── constants.ts               # ✅ UI constants
│   │   └── utils.ts                   # Utilities
│   ├── tailwind.config.js             # ✅ Color palette
│   ├── tsconfig.json                  # ✅ TypeScript config
│   ├── package.json                   # ✅ Dependencies
│   ├── .env.example                   # ✅ Config template
│   └── ...other Next.js files
│
├── backend/                           # Express.js API
│   ├── src/
│   │   ├── config/
│   │   │   ├── systemPrompt.ts        # 🔴 CRITICAL: System prompt with guardrails
│   │   │   ├── env.ts                 # Environment validation
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── crisisDetectionService.ts  # 🔴 CRITICAL: Crisis detection
│   │   │   ├── claudeService.ts            # Claude API wrapper
│   │   │   └── ...
│   │   ├── routes/                    # API endpoint stubs (Day 1+)
│   │   ├── controllers/               # Business logic stubs
│   │   ├── middleware/                # Error handlers
│   │   ├── db/
│   │   │   ├── schema.ts              # ✅ Database schema
│   │   │   └── migrations/            # Migration files
│   │   ├── utils/
│   │   │   ├── logger.ts              # ✅ Logger
│   │   │   └── ...
│   │   ├── types/
│   │   │   └── index.ts               # ✅ TypeScript types
│   │   └── index.ts                   # ✅ Server entry point
│   ├── tsconfig.json                  # ✅ TypeScript config
│   ├── package.json                   # ✅ Dependencies
│   ├── .env.example                   # ✅ Config template
│   └── ...other Node files
│
├── resources-db/
│   ├── resources.json                 # ✅ 13 crisis resources (9 regions + global)
│   └── README.md                      # ✅ Maintenance guide
│
├── docs/
│   ├── CRISIS_DETECTION.md            # ✅ Test cases & patterns
│   ├── SYSTEM_PROMPT.md               # ✅ Design philosophy
│   ├── API.md                         # ✅ Endpoint docs
│   ├── IMPLEMENTATION_ROADMAP.md      # ✅ Build plan
│   └── DEPLOYMENT.md                  # Deployment guide (stub)
│
├── CLAUDE.md                          # ✅ Codebase brief
├── README.md                          # ✅ Project overview
├── .gitignore                         # ✅ Git config
└── SCAFFOLDING_COMPLETE.md            # This file

```

---

## Key Safety Features Already Built

### 🔴 System Prompt (Critical)
Located in: `backend/src/config/systemPrompt.ts`

**Guardrails:**
- Never diagnose mental illness or conditions
- Never claim to replace therapy or medical care
- Always frame as "supportive companion tool"
- Always surface crisis resources
- Respect user-stated preferences, never demographic assumptions
- Maintain cultural humility and avoid stereotypes

**Personalization:**
- Dynamically adapts based on onboarding preferences
- Support style: family/community, professional, solo, or mixed
- Topics to avoid: respected by not deepening those discussions
- Languages: responds in preferred language when possible
- Cultural context: acknowledged but not assumed

### 🔴 Crisis Detection (Critical)
Located in: `backend/src/services/crisisDetectionService.ts`

**What it does:**
- Server-side, independent safety net (doesn't rely solely on LLM)
- HIGH-SEVERITY patterns: "kill myself", "end my life", "self-harm", "overdose", etc.
- WARNING patterns: "hopeless", "worthless", "everyone would be better", etc.
- Errs on side of caution: ambiguous language → escalate
- Returns confidence score and matched patterns for debugging

**Test cases:**
- 30+ test scenarios documented in `docs/CRISIS_DETECTION.md`
- False negative, false positive, and edge case examples provided

---

## Quick Start

### 1. Install Dependencies
```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### 2. Configure Environment
```bash
# Backend
cp backend/.env.example backend/.env.local
# Edit .env.local and add ANTHROPIC_API_KEY

# Frontend
cp frontend/.env.example frontend/.env.local
```

### 3. Start Development Servers
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Backend runs on: `http://localhost:5000`  
Frontend runs on: `http://localhost:3000`

### 4. Test Health
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok"}
```

---

## What's NOT Yet Implemented

These are placeholders or stubs, ready for implementation:

- [ ] `/chat` API endpoint (Day 1)
- [ ] `/onboarding/preferences` endpoints (Day 2)
- [ ] `/safety-plan` endpoints (Day 5)
- [ ] `/resources` endpoints (Day 6)
- [ ] Database connection (start Day 2)
- [ ] Chat UI integration with API (Day 1)
- [ ] Safety plan builder pages (Day 5)
- [ ] PDF export (Day 5)
- [ ] Resource seeding (Day 6)
- [ ] Authentication (not needed for hackathon)

---

## Next: Day 1 Implementation

**Goal:** Get chat working end-to-end with Claude responses.

### Frontend
1. Wire chat input form to `/chat` API endpoint
2. Display responses in conversation
3. Add loading state

### Backend
1. Create `/chat` POST endpoint
2. Call Claude API with system prompt
3. Return formatted response
4. (Optional) Set up minimal database

**See:** `docs/IMPLEMENTATION_ROADMAP.md` for detailed Day 1 plan.

---

## Critical Files for Safety Review

These files implement the safety guardrails and must be reviewed before deployment:

1. **`backend/src/config/systemPrompt.ts`**
   - System prompt with guardrails
   - Personalization logic
   - Never diagnose / never replace therapy constraints

2. **`backend/src/services/crisisDetectionService.ts`**
   - Crisis language patterns
   - Detection logic
   - Confidence scoring

3. **`docs/CRISIS_DETECTION.md`**
   - Test cases and phrasings
   - False negative / false positive guidance
   - Escalation logic

4. **`docs/SYSTEM_PROMPT.md`**
   - System prompt design philosophy
   - Guardrail rationale
   - Prompt iteration history

---

## Questions or Issues?

Refer to:
- **Codebase overview:** `CLAUDE.md`
- **Crisis detection:** `docs/CRISIS_DETECTION.md`
- **System prompt:** `docs/SYSTEM_PROMPT.md`
- **API endpoints:** `docs/API.md`
- **Build plan:** `docs/IMPLEMENTATION_ROADMAP.md`

---

## Stats

- **Lines of code (scaffolding):** ~2,000+
- **Configuration files:** 15+
- **Documentation pages:** 5
- **TypeScript types defined:** 20+
- **Crisis detection patterns:** 30+
- **Crisis resources in DB:** 13
- **Onboarding options:** 40+

---

✅ **Scaffolding Status:** COMPLETE

Ready to begin Day 1 implementation on the `/chat` endpoint and frontend wiring.

**Good luck!** 🚀

---

**Generated:** 2026-08-21  
**Version:** 1.0 (Scaffolding Complete)
