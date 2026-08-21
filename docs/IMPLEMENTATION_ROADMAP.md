# Implementation Roadmap

## Project Status: Day 0 Complete (Scaffolding Done)

All directory structure, package files, core configuration, and stub pages are in place. Ready to begin Day 1 implementation.

## What's Been Set Up

✅ **Frontend (Next.js 14)**
- App router structure with routes for home, onboarding, chat, safety-plan, resources
- Tailwind CSS configured with warm, gentle color palette
- TypeScript types and API client (`lib/api.ts`)
- Constants and configuration (`lib/constants.ts`)
- Stub pages (home, onboarding with full logic, chat placeholder, resources, safety-plan)
- Global styles and theme

✅ **Backend (Node.js/Express)**
- Express server scaffold with CORS, JSON middleware
- TypeScript configuration and types
- Environment configuration with validation
- **CRITICAL:** System prompt (`config/systemPrompt.ts`) with full guardrails
- **CRITICAL:** Crisis detection service (`services/crisisDetectionService.ts`) with patterns
- Claude API wrapper (`services/claudeService.ts`)
- Logger utility
- Database schema definition (compatible SQLite/PostgreSQL)

✅ **Data & Documentation**
- Crisis resources seed data (13 resources across 9 regions + global)
- Comprehensive API documentation
- Crisis detection design & test cases
- System prompt design & philosophy
- Resources maintenance guide

✅ **Configuration Files**
- .gitignore
- package.json files with dependencies
- tsconfig.json for both projects
- .env.example files
- Tailwind config

## Day 1: Chat UI & Claude API Wiring

**Goal:** Get the chat working end-to-end with basic Claude responses. No crisis detection yet.

### Frontend Tasks
1. **Wire chat input** (`app/chat/page.tsx`)
   - Connect input field to `/chat` API endpoint
   - Display user messages and AI responses
   - Add loading state while waiting for response
   - Store userId in localStorage (already in onboarding)
   - Retrieve user preferences from onboarding

2. **Add message history** (optional for Day 1, do on Day 2 if short on time)
   - Keep conversation history in state
   - Pass to API so Claude has context

3. **Test with placeholder responses** first
   - Make sure UI works before connecting to Claude

### Backend Tasks
1. **Build `/chat` endpoint** (`routes/chat.ts` + `controllers/chatController.ts`)
   - Accept POST request with: message, userId, preferences
   - Call `sendMessage()` from claudeService with system prompt
   - Return response in correct format
   - DO NOT implement crisis detection yet

2. **Verify Claude API connection**
   - Test that ANTHROPIC_API_KEY is loaded
   - Make test request to Claude API
   - Confirm response format works

3. **Wire preferences** (optional for Day 1)
   - GET endpoint to retrieve user preferences by userId
   - Pass to system prompt construction

4. **Database** (stub for now)
   - Don't need full DB setup yet; can use in-memory storage for hackathon
   - OR: Set up minimal SQLite with user_preferences table

5. **Error handling**
   - Catch API errors and return user-friendly messages
   - Log errors for debugging

### Testing Checklist for Day 1
- [ ] Backend server starts on port 5000
- [ ] GET `/health` returns `{ status: "ok" }`
- [ ] POST `/chat` with test message gets response from Claude
- [ ] Response contains: id, message, isCrisis (false for normal messages)
- [ ] Frontend can send message and display response
- [ ] Preferences (if completed in onboarding) are used in system prompt
- [ ] No crashes or 500 errors on valid requests

### Files to Create/Edit
- `backend/src/routes/chat.ts` — POST /chat endpoint
- `backend/src/controllers/chatController.ts` — Business logic
- `backend/src/db/connection.ts` — Database setup (minimal for now)
- Frontend `app/chat/page.tsx` — Already stubbed, just wire the API calls

### Optional Stretch
- Add loading spinner
- Add error message display
- Start typing indicator

---

## Day 2: Onboarding Flow & Preference Storage

**Goal:** Complete onboarding logic and persist preferences.

### Frontend Tasks
- ✅ Onboarding pages already implemented (`app/(auth)/onboarding/page.tsx`)
- Wire the POST `/onboarding/preferences` call (already in code)
- Test the full flow

### Backend Tasks
1. **Build `/onboarding/preferences` endpoints**
   - POST: Save preferences
   - GET: Retrieve preferences

2. **Database**
   - Implement `user_preferences` table
   - Add create/read methods
   - Test save and retrieve

3. **Integrate with chat**
   - When user sends message, fetch their preferences
   - Pass to system prompt
   - Verify personalization works

### Testing Checklist for Day 2
- [ ] Complete onboarding flow without errors
- [ ] Preferences saved to database
- [ ] GET preferences retrieves saved data
- [ ] Chat API uses stored preferences in system prompt
- [ ] Different support styles get different response tones

---

## Day 3: System Prompt Refinement & Testing

**Goal:** Refine and extensively test the system prompt for warmth, cultural sensitivity, and guardrails.

**This is the most important day.** The prompt quality directly impacts user experience and safety.

### Tasks
1. **Manual testing** with scenarios from `docs/SYSTEM_PROMPT.md`
   - Test each scenario and evaluate quality
   - Look for: warmth, empathy, no diagnosis, cultural humility
   - Iterate on prompt as needed

2. **Prompt versioning**
   - Document changes in `docs/SYSTEM_PROMPT.md`
   - Keep version history
   - Test each iteration thoroughly

3. **A/B testing** (optional)
   - Test different wordings for key sections
   - Get team feedback on tone

4. **Edge cases**
   - User mentions diagnoses
   - User asks if they have a condition
   - User from non-Western context
   - User in mild vs. acute distress

### Testing Checklist for Day 3
- [ ] Prompt never diagnoses (test with "do I have anxiety?")
- [ ] Prompt never claims to replace therapy
- [ ] Prompt respects user preferences
- [ ] Tone is warm and genuine, not clinical
- [ ] Professional support is visible but not pushy
- [ ] Cultural different approaches are validated
- [ ] All guardrails are present and enforced

---

## Day 4: Crisis Detection & Escalation UI

**Goal:** Implement server-side crisis detection and build the crisis alert UI.

### Frontend Tasks
1. **Crisis Alert Component** (`components/common/CrisisAlert.tsx`)
   - Display when isCrisis=true
   - Show crisis hotline resources prominently
   - Make it visible but not alarming
   - Include call-to-action button with phone number

2. **Integrate into chat**
   - When isCrisis response received, show alert
   - Keep alert visible throughout conversation
   - Option to minimize but not dismiss

3. **Test with mock crisis responses**

### Backend Tasks
1. **Wire crisis detection** into `/chat` endpoint
   - Call `detectCrisis()` on user message
   - If crisis detected, set isCrisis=true in response
   - Return relevant resources

2. **Get crisis resources** based on user location/preferences
   - Query `crisis_resources` table
   - Filter to relevant hotlines
   - Return in response

3. **Logging**
   - Log all crisis detections for monitoring

### Testing Checklist for Day 4
- [ ] Crisis detection triggers on high-severity patterns
- [ ] Crisis detection triggers on multiple warning patterns
- [ ] Crisis alert UI displays with resources
- [ ] Phone numbers in alert are clickable/copyable
- [ ] Non-crisis messages don't trigger false alerts
- [ ] Indirect crisis language is caught
- [ ] Resources are relevant to user's region (if available)

---

## Day 5: Safety Plan Builder & PDF Export

**Goal:** Implement guided safety plan builder and PDF export.

### Frontend Tasks
1. **Replace safety plan stubs** with full implementation
   - Warning signs section
   - Coping strategies section
   - Trusted contacts section (with phone/email)
   - Reasons to stay safe section

2. **PDF export**
   - Use jspdf or html2pdf
   - Format as printable card
   - Include all safety plan data
   - Make printer-friendly

3. **Edit/update existing plan**

### Backend Tasks
1. **Build `/safety-plan` endpoints**
   - POST: Save plan
   - GET: Retrieve plan
   - GET: Export as PDF

2. **Database**
   - Implement `safety_plans` table
   - CRUD operations

### Testing Checklist for Day 5
- [ ] All sections accept input
- [ ] Plan saves to database
- [ ] Existing plan can be loaded and edited
- [ ] PDF exports correctly
- [ ] PDF is printable and readable
- [ ] PDF doesn't include any personal data beyond what user entered

---

## Day 6: Resource Directory (Buffer Day)

**Goal:** Polish resource directory, add search, improve filtering.

### Frontend Tasks
- ✅ Basic resources page already implemented
- Add search functionality
- Add more filters (language, type, availability)
- Improve display and sorting

### Backend Tasks
- Seed database with resources from `resources-db/resources.json`
- Implement search endpoint
- Add more filter options

---

## Day 7: Testing, Polish, Deployment

**Goal:** Comprehensive testing, bug fixes, polish, deployment.

### Critical Testing
1. **Crisis detection test suite** (see `docs/CRISIS_DETECTION.md`)
   - Test all high-severity patterns
   - Test all warning patterns
   - Test false negatives and false positives
   - Test edge cases

2. **System prompt test scenarios** (see `docs/SYSTEM_PROMPT.md`)
   - Run through all test scenarios
   - Evaluate responses

3. **End-to-end flow**
   - Complete onboarding → chat → crisis scenario → safety plan
   - Complete onboarding → chat → normal conversation → resources

4. **UI/UX**
   - Test on mobile
   - Test keyboard navigation
   - Test accessibility

### Deployment
1. **Frontend**
   - Push to GitHub
   - Deploy to Vercel
   - Verify live

2. **Backend**
   - Push to GitHub
   - Deploy to Render/Railway
   - Verify API endpoints work

3. **Documentation**
   - Update deployment docs
   - Create user guide
   - Test all URLs work

### Demo Prep
1. Record demo scenarios
2. Prepare talking points
3. Practice demo flow

---

## Critical Path (What Must Work)

In order of importance:

1. **System Prompt** (Day 3) — Quality of responses
2. **Crisis Detection** (Day 4) — Safety of users in crisis
3. **Chat API** (Day 1) — Core functionality
4. **Onboarding** (Day 2) — Personalization
5. **Safety Plan** (Day 5) — User value add
6. **Resources** (Day 6) — Helpful reference

---

## Quick Command Reference

### Development
```bash
# Backend
cd backend
npm install
npm run dev  # Starts on port 5000

# Frontend (in another terminal)
cd frontend
npm install
npm run dev  # Starts on port 3000
```

### Database (when ready)
```bash
cd backend
npm run db:migrate  # Create tables
npm run db:seed     # Load resources
```

### Testing
```bash
# Crisis detection
npm test -- crisisDetectionService

# API endpoints
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","userId":"user-1"}'
```

---

## Notes

- **Preferences:** Onboarding flow is ready. Hook it up on Day 2.
- **Database:** Can start with SQLite for hackathon, migrate to Postgres later
- **Crisis Detection:** Already has comprehensive test cases documented
- **System Prompt:** Already has guardrails; just needs refinement and testing
- **No auth:** Public API for hackathon. Add auth before production.
- **No persistence of chat:** Conversations are transient by design (privacy). Only preferences and safety plans saved.

---

**Next:** Start Day 1 implementation. Begin with `/chat` endpoint, get Claude responses flowing, then integrate frontend.

**Questions before starting?** Check:
- CLAUDE.md for codebase overview
- docs/CRISIS_DETECTION.md for what crisis detection does
- docs/SYSTEM_PROMPT.md for guardrail philosophy
