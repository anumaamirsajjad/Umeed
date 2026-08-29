# Umeed — Cultural Context-Aware Mental Health Support

<div align="center">
  <img src="./logo.jpg" alt="Umeed Logo" width="200" />
  <p><strong>Umeed</strong> (meaning "hope") is a culturally-sensitive mental health support chatbot with persistent user accounts and safety planning.</p>
</div>

## Overview

A full-stack mental health support application built for Rescue Hacks 2026. Users create accounts, get support through AI conversation, build personalized safety plans, and have data that persists across visits—enabling the model to learn patterns over time.

**Problem:** Most digital mental health tools:
- Default to Western clinical framing
- Don't adapt to cultural preferences
- Don't persist data (each conversation is isolated)
- Assume demographics instead of asking preferences

**Solution:** 
- Gentle, preference-based onboarding (not demographics)
- Persistent user accounts with data continuity
- Server-side crisis detection with immediate escalation
- Culturally-adaptive responses that respect stated preferences

## Key Features

✅ **User Accounts** — Email/password signup, JWT authentication, persistent data
✅ **Adaptive Conversation** — Claude responds respecting user preferences from onboarding
✅ **Server-Side Crisis Detection** — Immediate escalation (independent of LLM judgment)
✅ **Safety Plan Builder** — Create personalized plans with warning signs, coping strategies, trusted contacts
✅ **Safety Plan Export** — Download as PDF for offline access
✅ **Mood Tracking** — Daily check-ins with trend analysis
✅ **Resource Directory** — Crisis hotlines by region/country/language
✅ **Data Persistence** — Preferences, plans, and patterns saved per user
✅ **Pattern Learning** — Model learns from returning user's behavior over time

## Tech Stack

- **Frontend:** Next.js 14 + React + Tailwind CSS + React Context
- **Backend:** Node.js + Express + TypeScript
- **Auth:** JWT tokens + Bcryptjs password hashing
- **LLM:** Anthropic Claude API
- **Storage:** JSON file store (MVP) / PostgreSQL (production-ready)
- **Export:** pdf-lib for PDF generation

## Quick Start

### Prerequisites
```bash
- Node.js 18+
- npm/yarn
- ANTHROPIC_API_KEY environment variable
```

### Running Locally

```bash
# Backend (Terminal 1)
cd backend
npm install
npm run dev
# Runs on http://localhost:5000

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### First Time User
1. Visit `http://localhost:3000/signup`
2. Create account
3. Complete onboarding (preferences)
4. Start chatting
5. Build safety plan

### Returning User
1. Visit `http://localhost:3000/login`
2. Enter credentials
3. All previous data restored

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](./CLAUDE.md) | Project brief, guardrails, safety requirements |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | 12 comprehensive test scenarios |
| [AUTH_IMPLEMENTATION_SUMMARY.md](./AUTH_IMPLEMENTATION_SUMMARY.md) | Authentication system details |
| [docs/CRISIS_DETECTION.md](./docs/CRISIS_DETECTION.md) | Crisis detection test cases |
| [docs/SYSTEM_PROMPT.md](./docs/SYSTEM_PROMPT.md) | Claude system prompt rationale |
| [docs/API.md](./docs/API.md) | API endpoint reference |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment guide (Vercel + Render) |
| [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) | Development setup |
| [docs/USER_GUIDE.md](./docs/USER_GUIDE.md) | Feature walkthrough |

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── services/          # Business logic (auth, chat, crisis detection)
│   │   ├── routes/            # API endpoints
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, logging
│   │   ├── db/                # Persistence
│   │   └── config/            # Configuration
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── (auth)/            # Signup/login pages
│   │   ├── chat/              # Chat interface
│   │   ├── safety-plan/       # Safety plan builder/viewer
│   │   ├── mood/              # Mood tracking
│   │   └── resources/         # Crisis resources
│   ├── components/            # React components
│   ├── lib/                   # Auth context, API, types
│   └── package.json
├── docs/                      # Documentation
├── resources-db/              # Crisis resources database
├── logo.jpg                   # Umeed branding
├── CLAUDE.md                  # Project instructions
├── README.md                  # This file
└── TESTING_GUIDE.md           # Testing reference
```

## API Endpoints

### Authentication
- `POST /auth/signup` — Create account
- `POST /auth/login` — Login, get JWT token
- `POST /auth/verify` — Verify token

### Chat (requires auth)
- `POST /chat` — Send message to Claude
- `POST /chat/new` — Start fresh session

### Onboarding (requires auth)
- `POST /onboarding/preferences` — Save preferences
- `GET /onboarding/preferences` — Get user preferences

### Safety Planning (requires auth)
- `POST /safety-plan` — Create/update plan
- `GET /safety-plan` — Get user plan
- `GET /safety-plan/suggestions` — AI suggestions
- `GET /safety-plan/export` — PDF export

### Mood (requires auth)
- `POST /mood/checkin` — Record mood
- `GET /mood/status` — Today's check-in status
- `GET /mood/trend` — Mood history (last N days)

### Resources (public)
- `GET /resources` — Get crisis resources
- `GET /resources/search` — Search resources

See [docs/API.md](./docs/API.md) for full details.

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for 12 comprehensive test scenarios:

✅ Signup with validation
✅ Login and persistent sessions
✅ Data persistence across logout/login
✅ Chat with crisis detection
✅ Safety plan creation and export
✅ Multiple user isolation
✅ Edge cases and error handling

## Security Features

✅ Password hashing (bcryptjs, 10-salt rounds)
✅ JWT token validation on all protected routes
✅ 7-day token expiry
✅ User data isolation (users see only their data)
✅ CORS protection
✅ No sensitive data logged

See [AUTH_IMPLEMENTATION_SUMMARY.md](./AUTH_IMPLEMENTATION_SUMMARY.md) for details.

## Safety Guardrails

⚠️ **Non-negotiable safety requirements:**

1. **Server-Side Crisis Detection** — Runs independently, never relies on LLM alone
2. **Immediate Escalation** — Crisis language triggers instant resource display
3. **No Diagnosis** — Never diagnoses conditions or claims to replace therapy
4. **Always Show Resources** — Crisis hotlines visible always, not just in crisis
5. **Respect Preferences** — Adapt to user preferences, never assume culture

See [docs/CRISIS_DETECTION.md](./docs/CRISIS_DETECTION.md) for test cases.

## Environment Variables

**Backend (.env):**
```
NODE_ENV=development
PORT=5000
ANTHROPIC_API_KEY=sk-...
JWT_SECRET=  # generate: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Known Limitations

- [ ] Email verification (add before production)
- [ ] Password reset flow
- [ ] Rate limiting on auth endpoints
- [ ] Refresh token support
- [ ] Persistent chat history (currently in-memory per session)
- [ ] Admin dashboard
- [ ] GDPR compliance (data export/deletion)

## Next Steps for Production

1. Email verification on signup
2. Password reset functionality
3. Rate limiting (prevent brute force)
4. Persistent encrypted chat history
5. Enable HTTPS
6. Database migration (PostgreSQL)
7. Admin dashboard
8. Load testing and optimization
9. Penetration testing

## Contributing

- Keep crisis detection visible and testable
- Base cultural adaptation on preferences, not assumptions
- Always err on the side of caution with crisis escalation
- Test thoroughly before deployment

## License

[To be determined]

---

**Remember:** Umeed is a supportive companion tool, not a replacement for professional mental health care. Always seek help from qualified professionals when needed.

Built for Rescue Hacks 2026.
