# Getting Started: Running Umeed Locally

**Project Status:** Phase 1-3 Complete (68/114 hours)  
**Last Updated:** 2026-08-23

---

## Prerequisites

Before you can run the project, you need:

1. **Node.js 18+** (LTS recommended)
   ```bash
   node --version  # Should be v18.x or higher
   ```

2. **npm 8+**
   ```bash
   npm --version  # Should be v8.x or higher
   ```

3. **Anthropic API Key** (REQUIRED)
   - Get one at https://console.anthropic.com
   - You need to sign up and create an API key
   - Save it securely (you'll need it in the next step)

---

## Setup Instructions

### Step 1: Create Backend Environment File

Create `backend/.env`:

```bash
cd backend
```

Create a file named `.env` with:

```env
# API Configuration
PORT=5000
NODE_ENV=development

# Anthropic / Claude API (REQUIRED - get from https://console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXX

# Database
DATABASE_URL=sqlite:data/rescue.db

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

**⚠️ IMPORTANT:** Replace `sk-ant-XXXXXXXXXXXX` with your actual API key from Anthropic.

### Step 2: Create Frontend Environment File

Create `frontend/.env.local`:

```bash
cd ../frontend
```

Create a file named `.env.local` with:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Running the Project

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
Environment: development
```

**Health Check:**
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok"}
```

### Terminal 2: Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## Accessing the App

1. **Open browser:** http://localhost:3000
2. **Expected flow:**
   - Redirects to onboarding (http://localhost:3000/onboarding)
   - Complete onboarding questions
   - Redirects to chat (http://localhost:3000/chat)
   - Can now chat with Claude

---

## Testing the Features

### 1. Test Basic Chat

1. Go to http://localhost:3000/chat
2. Send a message: "I've been feeling down lately"
3. Should receive response from Claude

**Success:** Message appears in chat, response comes back

### 2. Test Crisis Detection

1. Send a crisis message: "I want to kill myself"
2. Crisis alert should appear at top with:
   - 988 Suicide Lifeline
   - Crisis Text Line
   - Red banner with resources

**Success:** Alert appears immediately with clickable phone numbers

### 3. Test API Endpoints

```bash
# Chat endpoint
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How are you doing?",
    "userId": "test-user-1"
  }'

# Onboarding endpoint
curl -X POST http://localhost:5000/onboarding/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "preferredSupportStyle": "family_community",
    "languages": ["en"]
  }'

# Get resources
curl http://localhost:5000/resources

# Search resources
curl "http://localhost:5000/resources/search?q=988"
```

---

## Troubleshooting

### Issue: "ANTHROPIC_API_KEY environment variable is required"

**Solution:** 
1. Make sure you created `backend/.env`
2. Double-check the API key is correct (starts with `sk-ant-`)
3. Restart the backend server

### Issue: "Cannot find module 'better-sqlite3'"

**Solution:**
- This was an issue during development. The backend uses a lightweight JSON-based database for MVP.
- Run `npm install` in the backend directory again

### Issue: Frontend can't connect to backend

**Solution:**
1. Make sure backend is running on http://localhost:5000
2. Check `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5000`
3. Restart frontend server after updating .env.local

### Issue: Chat responses are slow

**Solution:**
1. This is normal on first request (Claude API startup)
2. Subsequent requests should be <2 seconds
3. Check your API key has credits

### Issue: "TypeError: Cannot read property of undefined"

**Solution:**
1. Check browser console for details
2. Make sure backend is running and responding to `/health`
3. Check CORS is configured correctly

---

## Project Structure

```
Umeed/
├── backend/              # Node.js/Express server
│   ├── src/
│   │   ├── index.ts      # Server entry point
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic (Claude, Crisis, etc)
│   │   ├── config/       # System prompt, env
│   │   ├── db/           # Database layer
│   │   ├── tests/        # Test suites
│   │   └── types/        # TypeScript types
│   ├── .env              # Environment variables (YOU CREATE THIS)
│   └── package.json
│
├── frontend/             # Next.js/React app
│   ├── app/              # Page routes
│   ├── components/       # React components
│   ├── lib/              # API client, types, constants
│   ├── .env.local        # Environment variables (YOU CREATE THIS)
│   └── package.json
│
└── docs/                 # Documentation
    ├── SYSTEM_PROMPT.md
    ├── CRISIS_DETECTION.md
    ├── CODE_REVIEW.md
    └── PHASE_*.md
```

---

## Development Notes

### Adding New Features

1. **Backend API:**
   - Create route in `src/routes/`
   - Create controller in `src/controllers/`
   - Create service in `src/services/` if needed

2. **Frontend:**
   - Create component in `src/components/`
   - Use API client from `lib/api.ts`
   - Add types to `lib/types.ts`

### Running Tests

```bash
# Crisis detection tests
cd backend
npm run test -- src/tests/crisisDetection.test.ts

# System prompt validation tests
npm run test -- src/tests/systemPromptValidation.test.ts
```

### Debugging

**Backend:**
```bash
LOG_LEVEL=debug npm run dev  # Verbose logging
```

**Frontend:**
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PORT` | ❌ | 5000 | Backend server port |
| `NODE_ENV` | ❌ | development | Environment (dev/prod) |
| `ANTHROPIC_API_KEY` | ✅ | - | Claude API key |
| `DATABASE_URL` | ❌ | sqlite:data/rescue.db | Database connection |
| `CORS_ORIGIN` | ❌ | http://localhost:3000 | Allowed origins |
| `LOG_LEVEL` | ❌ | info | Logging verbosity |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | http://localhost:5000 | Backend API URL |

---

## Next Steps

After getting the project running:

1. **Test the flow:**
   - Complete onboarding
   - Send a normal message
   - Send a crisis message to test alert

2. **Explore the code:**
   - Read `docs/SYSTEM_PROMPT.md` to understand guardrails
   - Read `docs/CODE_REVIEW.md` for architecture overview
   - Read `backend/src/config/systemPrompt.ts` to see Claude instructions

3. **Start Phase 4:**
   - Implement Safety Plan Builder
   - See `COMPLETE_IMPLEMENTATION_PLAN.md` for details

---

## Getting Help

**API Key Issues?**
- Get a free Anthropic API key at https://console.anthropic.com
- Ensure you have credits remaining

**Code Issues?**
- Check `docs/CODE_REVIEW.md` for known issues
- Read error messages carefully (they usually point to the problem)
- Check `backend/` logs (run with `LOG_LEVEL=debug`)

**Architecture Questions?**
- Read `docs/SYSTEM_PROMPT.md` for system prompt details
- Read `docs/CRISIS_DETECTION.md` for crisis detection
- Read `docs/CODE_REVIEW.md` for architecture

---

**Status:** ✅ Ready to Run  
**Last Tested:** 2026-08-23  
**Phase:** 1-3 Complete (68/114 hours)
