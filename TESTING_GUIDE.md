# Comprehensive Testing Guide

This guide provides step-by-step instructions for thoroughly testing the Umeed mental health support app, including the new authentication system and data persistence features.

## Prerequisites

- Node.js v18+ installed
- Backend and frontend dependencies installed (`npm install` in both directories)
- `.env` file configured with `ANTHROPIC_API_KEY` and other required variables

## Running the Servers

### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:5000` (or the port in your .env).

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:3000`.

## Test Scenarios

### 1. User Signup and Account Creation

**Steps:**
1. Navigate to `http://localhost:3000/signup`
2. Enter an email (e.g., `test@example.com`)
3. Enter a password (must be at least 6 characters)
4. Confirm password
5. Click "Create Account"

**Expected Results:**
- Account created successfully
- Redirected to onboarding page
- User is logged in (token stored in localStorage)
- Email is unique (test creating duplicate email)

**Edge Cases:**
- Password too short (< 6 chars) → error message
- Passwords don't match → error message
- Email already registered → error message

---

### 2. User Onboarding Flow

**Steps:**
1. (After signup) Complete onboarding:
   - Select preferred support style (family_community, professional, solo, mixed)
   - Select topics to avoid (optional)
   - Select languages
   - Enter cultural context (optional)
2. Click "Save and Continue" or similar

**Expected Results:**
- Preferences saved to database linked to user
- User preferences are retrieved when returning to app
- All data persists across sessions

---

### 3. Chat Functionality

**Steps:**
1. Navigate to `/chat`
2. Send messages:
   - "How are you feeling today?" (normal conversation)
   - "I want to die" (crisis test)
   - "my family would be better without me" (indirect crisis test)
   - "I'm so sad I can't eat" (normal mental health topic)

**Expected Results:**
- Messages appear in chat interface
- Claude responds appropriately
- Crisis language triggers crisis alert UI
- Crisis resources are displayed with hotline info
- Tone adapts to user preferences from onboarding

**Crisis Testing:**
Test these phrases to ensure crisis detection works:
- "I want to die"
- "I'm going to kill myself"
- "There's no point in living"
- "My family would be better off without me"
- "I'm planning to hurt myself"
- "No one would miss me"

---

### 4. Safety Plan Builder

**Steps:**
1. Navigate to `/safety-plan/builder`
2. Create a safety plan with:
   - Warning signs (e.g., "insomnia, irritability")
   - Coping strategies (e.g., "walk, call friend")
   - Trusted contacts (with phone numbers)
   - Reasons to stay safe (e.g., "my family, my goals")
3. Save the plan

**Expected Results:**
- Safety plan saved linked to user
- Can navigate to `/safety-plan/view` and retrieve it
- Plan is the same user's data from when it was saved

---

### 5. Safety Plan Export (PDF)

**Steps:**
1. Go to `/safety-plan/view`
2. Click "Export as PDF"
3. Download should start

**Expected Results:**
- PDF file downloads
- PDF contains all user's safety plan data
- PDF is properly formatted and readable

---

### 6. Data Persistence Across Sessions

**Critical Test - This ensures accounts are working:**

**Steps:**
1. Complete signup → onboarding → create safety plan
2. Note the data entered
3. Logout (button should appear in UI)
4. Close the browser entirely
5. Reopen and go to `http://localhost:3000`
6. Click "Login"
7. Enter the email and password you used in step 1
8. Click "Login"

**Expected Results:**
- Successfully logged back in
- Same preferences appear (onboarding data)
- Same safety plan appears
- Chat history is preserved
- Mood check-ins from previous session still visible
- User ID is consistent (same as before logout)

---

### 7. Mood Tracking

**Steps:**
1. Navigate to `/mood`
2. Click mood check-in button
3. Select a mood score (1-5)
4. Add emoji (optional)
5. Submit

**Expected Results:**
- Mood recorded and linked to current user
- Can see mood trend over time
- Only checks in once per day
- Data persists across sessions

---

### 8. Authentication Edge Cases

**Test invalid logins:**
1. Try logging in with wrong email → error
2. Try logging in with wrong password → error
3. Try accessing protected routes without token → redirect to login

**Test token expiry:**
1. Login and get a token
2. Manually modify `localStorage` to set authToken to invalid string
3. Try making API request → should error or redirect

---

### 9. Logout and Re-login

**Steps:**
1. Login with valid credentials
2. Find logout button (should be in header/nav)
3. Click logout
4. Verify redirected to login page
5. localStorage should be cleared (open DevTools → Application → localStorage)
6. Login again with same credentials

**Expected Results:**
- Successfully logged out
- Token cleared from localStorage
- Can log back in
- Previous data still exists (re-login retrieves it)

---

### 10. Multiple Users

**Steps:**
1. User A: Signup, onboarding, create safety plan
2. User A: Logout
3. User B: Signup, onboarding, create different safety plan
4. User B: Logout
5. User A: Login again

**Expected Results:**
- User A sees their own data (not User B's)
- User B sees their own data (not User A's)
- Each user's preferences and plans are separate
- No data leakage between users

---

### 11. Crisis Resources Display

**Steps:**
1. In chat, trigger crisis alert with "I want to die"
2. Check that crisis resources are displayed
3. Click on a resource link
4. Verify resource information is correct

**Expected Results:**
- Crisis alert shows immediately
- Resources match user's region/language preferences
- Hotline numbers are clickable/copyable
- Resource descriptions are accurate

---

### 12. Pattern Detection (if implemented)

**Steps:**
1. Have chat conversations over multiple sessions
2. Mention similar themes/patterns repeatedly
3. Check if app learns and mentions patterns in safety plan suggestions

**Expected Results:**
- App detects repeated patterns
- Patterns inform safety plan suggestions
- Model learns user's specific triggers and coping strategies

---

## API Testing (Manual with Curl/Postman)

### Signup
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Send Chat Message (requires token)
```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"How are you feeling today?"}'
```

### Save Preferences (requires token)
```bash
curl -X POST http://localhost:5000/onboarding/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "preferredSupportStyle":"mixed",
    "languages":["English"],
    "topicsToAvoid":["politics"]
  }'
```

---

## Performance Testing

- Test app responsiveness during slow network
- Test with multiple concurrent users (if deployed)
- Monitor token refresh/expiry behavior
- Check database query performance with large chat histories

---

## Security Checklist

- [ ] Passwords are hashed (not stored in plain text)
- [ ] JWT tokens are validated on every protected request
- [ ] Tokens include expiry (7 days default)
- [ ] Invalid tokens are rejected
- [ ] Users cannot access other users' data
- [ ] No sensitive data logged to console (in production)
- [ ] SQL injection is prevented (using parameterized queries if using SQL)
- [ ] CORS is properly configured

---

## Known Issues / Limitations

1. **Session expiry**: Currently tokens expire after 7 days. Users will need to re-login.
2. **No password reset**: Add this feature for production.
3. **No email verification**: Add this for production security.
4. **Rate limiting**: Not implemented - add this before production deployment.

---

## Next Steps for Production

1. [ ] Email verification on signup
2. [ ] Password reset flow
3. [ ] Rate limiting on auth endpoints
4. [ ] Admin dashboard for user management
5. [ ] GDPR compliance (data export, deletion)
6. [ ] Improved error messages
7. [ ] Logging and monitoring
8. [ ] Load testing
9. [ ] Penetration testing

---

## Troubleshooting

**Backend not starting:**
- Check NODE_ENV is set (default: development)
- Check ANTHROPIC_API_KEY is set
- Check port 5000 isn't already in use

**Frontend can't connect to backend:**
- Check NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Check both servers are running

**Tokens not persisting:**
- Check localStorage is enabled in browser
- Check DevTools → Application → localStorage
- Try incognito/private mode (localStorage is cleared on close)

**Signup fails:**
- Check backend logs for errors
- Verify email isn't already registered
- Check password is at least 6 characters
