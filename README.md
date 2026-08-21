# Cultural Context-Aware Mental Health First Aid

A supportive chatbot and safety-plan builder that adapts its tone and suggested coping steps based on the user's own stated preferences and cultural context, while always surfacing professional and crisis resources as a safety net.

## Project Overview

This is a full-stack application built for Rescue Hacks, a hackathon focused on technology that helps protect or save lives through mental health support.

**Problem:** Most digital mental health tools default to a Western clinical framing, which can feel alienating in cultures where mental health carries stigma, family/community-based coping is the norm, or professional therapy is not the most accessible option.

**Solution:** Gentle, preference-based onboarding and culturally adaptive responses that respect user-stated preferences, not demographic assumptions.

## Key Features

1. **Gentle Onboarding** — Ask about preferences ("talk to family/community?", "avoid certain topics?"), not demographics
2. **Adaptive Conversation** — Responses respect stated preferences while maintaining safety guardrails
3. **Safety Plan Builder** — Guided flow to build personal safety plan: warning signs, coping strategies, trusted contacts, reasons to stay safe (exportable)
4. **Crisis Detection** — Server-side detection of crisis language with immediate escalation to crisis resources
5. **Resource Directory** — Filterable crisis and professional resources by region

## Tech Stack

- **Frontend:** Next.js 14 + React + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **LLM:** Anthropic Claude API
- **Database:** PostgreSQL (production) / SQLite (development)
- **PDF Export:** pdf-lib
- **Deployment:** Vercel (frontend) + Render/Railway (backend)

## Project Structure

```
frontend/       → Next.js React app (port 3000)
backend/        → Express API (port 5000)
resources-db/   → Crisis resources seed data
docs/           → Design documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or SQLite for development)
- Anthropic API key

### Setup

1. **Install dependencies**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Configure environment**
   ```bash
   # Backend
   cp backend/.env.example backend/.env.local
   # Add ANTHROPIC_API_KEY, DATABASE_URL, etc.

   # Frontend
   cp frontend/.env.example frontend/.env.local
   # Add NEXT_PUBLIC_API_URL
   ```

3. **Initialize database**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

   Backend runs on `http://localhost:5000`
   Frontend runs on `http://localhost:3000`

## Build Timeline

- **Day 1:** Chat UI scaffold + Claude API wiring
- **Day 2:** Onboarding flow + preference storage
- **Day 3:** System prompt refinement & testing
- **Day 4:** Crisis detection + escalation UI
- **Day 5:** Safety plan builder + PDF export
- **Day 6:** Resource directory
- **Day 7:** Testing, polish, deployment

## Safety-Critical Components

⚠️ **Crisis Detection:** Implemented server-side in `backend/src/services/crisisDetectionService.ts` as an additional safety layer. See `docs/CRISIS_DETECTION.md` for test cases and methodology.

⚠️ **System Prompt:** Defined in `backend/src/config/systemPrompt.ts`. Never diagnose, never replace therapy, always surface crisis resources. See `docs/SYSTEM_PROMPT.md` for design rationale.

## Contributing

- Keep crisis detection guardrails visible and testable
- Base cultural adaptation on user preferences, never assumed demographics
- Always err on the side of caution with crisis escalation
- Test thoroughly before deployment

## License

[To be determined]

## Contact

For Rescue Hacks coordination: [hackathon contact info]
