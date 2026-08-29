# Auth & Identity Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the JWT auth-bypass hole, and make every protected page in the frontend gate on the app's *real* authenticated identity instead of a disconnected, client-invented `localStorage['userId']` — fixing the reported "account system isn't working," "onboarding isn't wired into auth," and most of "buttons aren't working" findings in one pass.

**Architecture:** The backend's JWT auth (`authService.ts`, `authMiddleware.ts`) is already correct and already the source of truth for every API call — the bug is entirely in the frontend, which additionally tracks a second, fake identity (`localStorage['userId']`, invented by the onboarding page) and uses *that* to decide whether protected pages are accessible, instead of `authContext`'s real `isAuthenticated` state. This plan deletes the fake identity, adds a shared `useRequireAuth` hook that all protected pages call, adds a global 401→login handler so a stale/expired session fails loudly instead of silently, and adds the logout button that currently doesn't exist anywhere in the UI. Separately, it closes a live-verified auth-bypass: `authService.ts` falls back to a hardcoded JWT secret when `JWT_SECRET` isn't set in the environment — confirmed exploitable by forging a valid token for a real account with no password.

**Tech Stack:** Express/TypeScript backend (JWT via `jsonwebtoken`), Next.js 14 App Router frontend (React Context for auth, Axios for API calls). No frontend test framework exists in this repo — verification uses a live signup + Playwright script against the running dev servers (the same method used to find these bugs), not a new test framework.

**Spec:** This plan's spec is the audit findings from this conversation (verified live against the running app on 2026-08-29): (1) `JWT_SECRET` fallback is a real, proven auth bypass; (2) `localStorage['userId']` (set only by the onboarding page) and `authContext`'s real identity are two disconnected values — confirmed via live browser trace; (3) a simulated real logout (clearing only `authToken`/`authUser`, exactly what `authContext.logout()` does) leaves `/chat` fully rendered and interactive-looking, with sends failing silently (401, swallowed into a generic "Sorry, I encountered an error" message) — no redirect to `/login`; (4) no "Log out" control exists anywhere in the rendered UI, confirmed by text search across every page; (5) the Resources page's "matched to your preferences" section is dead in practice because it sends the fake `localStorage['userId']` (which never matches a real preferences record) instead of the authenticated user's real id.

## Global Constraints

- No new frontend dependencies (no test framework, no state library) — reuse `authContext`, `axios`, and the existing page structure.
- Every protected page must redirect to `/login` when not authenticated, not to `/onboarding` (only `/onboarding` itself, and the "not yet onboarded" case, redirects there).
- Don't touch `resources/page.tsx`'s access model — it stays a public, unauthenticated route per the existing design (`GET /resources` requires no auth). Only its personalization `userId` param source changes.
- Keep every visual/behavioral change minimal — this plan fixes identity plumbing, not a UI redesign. `SidebarNav`'s existing look and the three nav items stay as they are; only auth-awareness and a logout control are added.
- `JWT_SECRET` must never have a hardcoded fallback value anywhere in source, including in tests.

---

## Task 1: Backend — require a real `JWT_SECRET`, close the forgeable-token hole

**Files:**
- Modify: `backend/src/config/env.ts`
- Modify: `backend/src/services/authService.ts`
- Modify: `backend/.env`
- Modify: `backend/.env.example`
- Create: `backend/src/tests/_importEnvOnly.ts`
- Create: `backend/src/tests/jwtSecret.test.ts`
- Modify: `backend/package.json`

**Interfaces:**
- Produces: `env.JWT_SECRET: string` (non-empty, validated at process startup in `env.ts`) — consumed by `authService.ts` in place of its current `process.env.JWT_SECRET || 'dev-secret-key-change-in-production'` fallback.

- [ ] **Step 1: Reproduce the bypass (the "failing test")**

```bash
cd /Users/usmannazir/usman/Umeed/backend
node -e "
const jwt = require('jsonwebtoken');
const forged = jwt.sign({ userId: 'any-user-id', email: 'attacker@test.com' }, 'dev-secret-key-change-in-production', { expiresIn: '7d' });
console.log(forged);
" > /tmp/forged.txt
curl -s http://localhost:5001/onboarding/status -H "Authorization: Bearer $(cat /tmp/forged.txt)"
```

Expected right now (bug present): `{"completed":false,"preferences":null}` — a 200, meaning the forged token was accepted with zero knowledge of any real credential. This confirms the bypass before touching code.

- [ ] **Step 2: Add `JWT_SECRET` to `env.ts` with no fallback, fail fast if missing**

Edit `backend/src/config/env.ts`:

```ts
import 'dotenv/config';

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // API Keys
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',

  // Auth token signing — no hardcoded fallback: a shared default committed to
  // source would let anyone forge a valid token for any account without a
  // password. See backend/src/tests/jwtSecret.test.ts.
  JWT_SECRET: process.env.JWT_SECRET || '',

  // Crisis classifier — cheap/fast model, runs on every message in parallel with the main reply
  CRISIS_CLASSIFIER_MODEL: process.env.CRISIS_CLASSIFIER_MODEL || 'meta-llama/llama-3.1-8b-instruct',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'sqlite:data/rescue.db',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Validation
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};

// Validate required env vars
if (!env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}
if (!env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required (no default — a shared fallback would let anyone forge auth tokens). Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
  );
}

export default env;
```

- [ ] **Step 3: Point `authService.ts` at `env.JWT_SECRET`**

Edit `backend/src/services/authService.ts` — add the import and replace the fallback line:

```ts
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRow } from '../db/schema.js';
import { loadTable, saveTable } from '../db/jsonStore.js';
import env from '../config/env.js';

const JWT_SECRET = env.JWT_SECRET;
const TOKEN_EXPIRY = '7d';
```

(Delete the old `const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';` line entirely — no fallback string anywhere.)

- [ ] **Step 4: Generate a real secret and set it in the running dev environment**

```bash
cd /Users/usmannazir/usman/Umeed/backend
SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
echo "JWT_SECRET=$SECRET" >> .env
```

Also add to `backend/.env.example` (documentation only, no real value):

```
# Required — no default. Generate with:
# node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=
```

- [ ] **Step 5: Restart the backend and re-run the bypass attempt — confirm the old forged token now works only if it's re-signed with the new secret (i.e. confirm you can no longer forge one without reading `.env`)**

```bash
# restart: kill the existing dev process on :5001 and run `npm run dev` again,
# or send SIGHUP/kill+restart however this dev server is normally managed.
curl -s http://localhost:5001/onboarding/status -H "Authorization: Bearer $(cat /tmp/forged.txt)"
```

Expected: `{"error":"Invalid or expired token"}` — the token signed with the old hardcoded string is now rejected because `JWT_SECRET` no longer matches it. A real login/signup still issues a valid token as before (unaffected — same code path, just a different, non-public secret).

- [ ] **Step 6: Add a regression test that the server refuses to boot without `JWT_SECRET`**

Create `backend/src/tests/_importEnvOnly.ts`:

```ts
// Minimal script whose only job is to import env.ts, so a parent process
// (see jwtSecret.test.ts) can check whether env.ts's startup validation
// throws. Kept separate from env.ts's own logic so the parent test doesn't
// have to parse this file — it only cares about the child process's exit
// code and stderr.
import '../config/env.js';
console.log('env loaded without throwing');
```

Create `backend/src/tests/jwtSecret.test.ts`:

```ts
/**
 * Regression test: env.ts must refuse to start the process when JWT_SECRET
 * is missing, rather than falling back to a hardcoded secret that anyone
 * reading this repo could use to forge a valid auth token for any account.
 *
 * Spawns a child process because env.ts validates at import time (a
 * top-level throw) — that can't be exercised by re-importing the module
 * inside this same process, since Node caches ES module evaluation.
 *
 * Run with: npm run test:jwt-secret
 */
import { spawnSync } from 'child_process';

function run() {
  console.log('Testing that the server refuses to boot without JWT_SECRET...\n');

  const result = spawnSync(
    'node',
    [
      '--loader', 'ts-node/esm',
      '--experimental-specifier-resolution=node',
      'src/tests/_importEnvOnly.ts',
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, JWT_SECRET: '' },
      encoding: 'utf-8',
    }
  );

  const failedForRightReason =
    result.status !== 0 && /JWT_SECRET environment variable is required/.test(result.stderr || '');

  if (failedForRightReason) {
    console.log('✅ PASS: server refuses to start without JWT_SECRET set');
    process.exitCode = 0;
  } else {
    console.log('❌ FAIL: server did not refuse to start (or failed for an unrelated reason) without JWT_SECRET');
    console.log('exit code:', result.status);
    console.log('stdout:', result.stdout);
    console.log('stderr:', result.stderr);
    process.exitCode = 1;
  }
}

run();
```

Add the script to `backend/package.json` (in `"scripts"`, alongside the other `test:*` entries, and into the aggregate `"test"` script):

```json
"test:jwt-secret": "node --loader ts-node/esm --experimental-specifier-resolution=node src/tests/jwtSecret.test.ts",
```

and change:

```json
"test": "npm run test:crisis-detection && npm run test:crisis-classifier && npm run test:system-prompt",
```

to:

```json
"test": "npm run test:crisis-detection && npm run test:jwt-secret && npm run test:crisis-classifier && npm run test:system-prompt",
```

- [ ] **Step 7: Run the new test, confirm it passes**

```bash
cd /Users/usmannazir/usman/Umeed/backend
npm run test:jwt-secret
```

Expected: `✅ PASS: server refuses to start without JWT_SECRET set`, exit code 0.

- [ ] **Step 8: Commit**

```bash
git add backend/src/config/env.ts backend/src/services/authService.ts backend/.env.example backend/src/tests/_importEnvOnly.ts backend/src/tests/jwtSecret.test.ts backend/package.json
git commit -m "fix: require JWT_SECRET with no hardcoded fallback, close forgeable-token auth bypass"
```

(`backend/.env` is gitignored — do not add it; the real secret stays local.)

---

## Task 2: Frontend — shared auth-storage module (single source of truth for the localStorage keys)

**Files:**
- Create: `frontend/lib/authStorage.ts`
- Test: manual, via Step 3 below (no frontend test framework in this repo)

**Interfaces:**
- Produces: `getStoredAuth(): { token: string | null; user: StoredUser | null }`, `setStoredAuth(token: string, user: StoredUser): void`, `clearStoredAuth(): void`, `type StoredUser = { id: string; email: string }` — consumed by Task 3 (`lib/api.ts`'s interceptor) and Task 4 (`authContext.tsx`).

- [ ] **Step 1: Create the module**

```ts
// frontend/lib/authStorage.ts
// Single source of truth for the auth localStorage keys, so authContext.tsx
// (React state) and lib/api.ts's response interceptor (outside React, can't
// use hooks) don't duplicate — or drift on — the key names.

export interface StoredUser {
  id: string;
  email: string;
}

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

export function getStoredAuth(): { token: string | null; user: StoredUser | null } {
  if (typeof window === 'undefined') return { token: null, user: null };

  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  let user: StoredUser | null = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }
  return { token, user };
}

export function setStoredAuth(token: string, user: StoredUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Defense in depth: an older build of this app tracked a second, unrelated
  // client-generated id under this key (invented by the onboarding page) and
  // used it — instead of real auth state — to decide whether protected pages
  // were reachable. Clearing it here means no stale copy from before this
  // fix can outlive a logout and paper over the real auth check again.
  localStorage.removeItem('userId');
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/usmannazir/usman/Umeed/frontend && npx tsc --noEmit
```

Expected: no new errors (this file isn't imported anywhere yet, so it should compile standalone).

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/authStorage.ts
git commit -m "feat: add shared authStorage module as single source of truth for auth localStorage keys"
```

---

## Task 3: Frontend — global 401 handler in the API client

**Files:**
- Modify: `frontend/lib/api.ts`

**Interfaces:**
- Consumes: `clearStoredAuth()` from `lib/authStorage.ts` (Task 2), `ROUTES.login` from `lib/constants.ts`.

- [ ] **Step 1: Reproduce the bug (the "failing test") — this is the exact live repro from the audit**

With the frontend dev server running, in a browser console at `http://localhost:3000`:

```js
localStorage.removeItem('authToken');
localStorage.removeItem('authUser');
location.href = '/chat';
```

Expected right now (bug present): `/chat` renders fully (header, mood widget, comfort-mode buttons — looks completely logged in). Typing a message and sending it shows "Sorry, I encountered an error processing your message. Please try again." with no mention of needing to log in, and no redirect happens.

- [ ] **Step 2: Add the response interceptor**

Edit `frontend/lib/api.ts` — add the import and the new interceptor block right after the existing request interceptor:

```ts
import axios, { AxiosInstance } from 'axios';
import { clearStoredAuth } from './authStorage';
import { ROUTES } from './constants';
import type {
  ChatRequest,
  ChatResponse,
  UserPreferences,
  OnboardingResponse,
  SafetyPlan,
  SafetyPlanDraft,
  CrisisResource,
  MoodTrendResponse,
  ResourcesResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
client.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on any protected endpoint means the session is gone (expired token,
// cleared storage, forged/invalid token) — clear local auth state and send
// the user to /login instead of leaving them on a page that looks logged in
// but silently fails every action. Login/signup's own 401s (wrong password)
// are excluded — those pages already show that error inline and must not be
// redirected away from themselves.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url || '';
    const isAuthEndpoint = url.startsWith('/auth/');
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      !isAuthEndpoint
    ) {
      clearStoredAuth();
      if (window.location.pathname !== ROUTES.login) {
        window.location.href = ROUTES.login;
      }
    }
    return Promise.reject(error);
  }
);
```

- [ ] **Step 3: Re-run the repro, confirm it's fixed**

Same steps as Step 1. Expected now: sending a message on `/chat` with no token immediately redirects to `/login` (the `/chat` POST fails with 401, the interceptor fires, storage clears, and the browser navigates to `/login`).

- [ ] **Step 4: Type-check**

```bash
cd /Users/usmannazir/usman/Umeed/frontend && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/api.ts
git commit -m "fix: redirect to login on any 401 from a protected endpoint, instead of failing silently"
```

---

## Task 4: Frontend — `useRequireAuth` hook

**Files:**
- Create: `frontend/lib/useRequireAuth.ts`

**Interfaces:**
- Consumes: `useAuth()` from `lib/authContext.tsx` (`isAuthenticated`, `isLoading`), `checkOnboardingStatus()` from `lib/api.ts`, `ROUTES` from `lib/constants.ts`.
- Produces: `useRequireAuth(options?: { requireOnboarded?: boolean }): { isAuthenticated: boolean; isLoading: boolean }` — consumed by Tasks 6–10 (`chat`, `mood`, `safety-plan/builder`, `safety-plan/view`, `profile`, `onboarding` pages).

- [ ] **Step 1: Create the hook**

```ts
// frontend/lib/useRequireAuth.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './authContext';
import { checkOnboardingStatus } from './api';
import { ROUTES } from './constants';

interface UseRequireAuthOptions {
  /**
   * When true (default), also redirects to /onboarding if the authenticated
   * user hasn't saved onboarding preferences yet. Pass false on the
   * onboarding page itself, which handles that case on its own.
   */
  requireOnboarded?: boolean;
}

/**
 * Gates a page on real auth state (authContext), not the client-invented
 * localStorage['userId'] the app used to check instead. Redirects to /login
 * if not authenticated, or to /onboarding if authenticated but onboarding
 * isn't complete (unless requireOnboarded is false).
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { requireOnboarded = true } = options;
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.login);
      return;
    }

    if (requireOnboarded) {
      checkOnboardingStatus()
        .then((status) => {
          if (!status.completed) {
            router.replace(ROUTES.onboarding);
          }
        })
        .catch(() => {
          // A transient failure here shouldn't bounce an otherwise-valid
          // session — let the page's own data loading surface the real error.
        });
    }
  }, [isAuthenticated, isLoading, requireOnboarded, router]);

  return { isAuthenticated, isLoading };
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/usmannazir/usman/Umeed/frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/useRequireAuth.ts
git commit -m "feat: add useRequireAuth hook as the single auth gate for protected pages"
```

---

## Task 5: Frontend — `authContext.tsx` uses the shared storage module and clears the legacy key on logout

**Files:**
- Modify: `frontend/lib/authContext.tsx`

**Interfaces:**
- Consumes: `getStoredAuth`, `setStoredAuth`, `clearStoredAuth` from `lib/authStorage.ts` (Task 2).

- [ ] **Step 1: Replace direct localStorage calls with the shared module**

Edit `frontend/lib/authContext.tsx` in full:

```tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from './authStorage';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const { token: savedToken, user: savedUser } = getStoredAuth();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      setStoredAuth(data.token, data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      setStoredAuth(data.token, data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signup, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/usmannazir/usman/Umeed/frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/authContext.tsx
git commit -m "refactor: authContext uses shared authStorage module, logout clears legacy userId key"
```

---

## Task 6: Frontend — `SidebarNav` becomes auth-aware and gets the logout button

**Files:**
- Modify: `frontend/components/common/SidebarNav.tsx`
- Create: `frontend/components/common/AppShell.tsx`
- Modify: `frontend/app/layout.tsx`

**Interfaces:**
- Consumes: `useAuth()` from `lib/authContext.tsx`.

This task also fixes a side effect of hiding the sidebar for logged-out users: `layout.tsx` currently hardcodes an 80px left margin (`ml-20`) assuming the sidebar is always shown. Left as-is, that would leave a blank 80px gutter on the landing/login/signup pages once `SidebarNav` returns `null` for them. `AppShell` makes that margin conditional on the same auth state.

- [ ] **Step 1: Reproduce (confirm there is currently no logout control anywhere)**

```bash
# with the frontend running and a real signed-up session in the browser:
# visit /profile and every other page, search the rendered text for
# "log out" / "sign out" — none exists (confirmed in the live audit already).
```

- [ ] **Step 2: Rewrite `SidebarNav.tsx`**

```tsx
// frontend/components/common/SidebarNav.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ROUTES } from '@/lib/constants';

const NAV_ITEMS = [
  { label: 'Talk', urdu: 'گفتگو', href: '/chat' },
  { label: 'My Plan', urdu: 'میری منصوبہ', href: '/safety-plan/view' },
  { label: 'Support', urdu: 'معاونت', href: '/resources' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Nothing to gate for a logged-out visitor (landing/login/signup pages) —
  // and no logout control should be reachable there either.
  if (isLoading || !isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push(ROUTES.login);
  };

  return (
    <nav
      className="fixed left-0 top-0 w-20 h-screen flex flex-col items-center justify-between gap-10 py-6 border-r"
      style={{
        backgroundColor: 'var(--umeed-beige-200)',
        borderColor: 'var(--umeed-orange-100)',
      }}
    >
      <div className="flex flex-col items-center gap-10">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-all duration-300"
              style={{
                color: isActive ? 'var(--umeed-orange-500)' : 'var(--umeed-ink-500)',
                textDecoration: 'none',
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: isActive ? 'var(--umeed-orange-100)' : 'transparent' }}
              >
                {item.label.charAt(0)}
              </span>
              <span style={{ fontSize: '7px', fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700 }}>
                {item.urdu}
              </span>
              <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        aria-label="Log out"
        className="flex flex-col items-center gap-1 transition-all duration-300"
        style={{ color: 'var(--umeed-ink-500)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span className="w-6 h-6 rounded-full flex items-center justify-center">⎋</span>
        <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
          Log out
        </span>
      </button>
    </nav>
  );
}
```

- [ ] **Step 3: Create `AppShell.tsx` for the auth-aware layout margin**

```tsx
// frontend/components/common/AppShell.tsx
'use client';

import { useAuth } from '@/lib/authContext';

/**
 * Applies the left margin that reserves space for SidebarNav — but only when
 * SidebarNav is actually rendering (i.e. the user is authenticated).
 * SidebarNav returns null for logged-out visitors; without this, layout.tsx's
 * old hardcoded `ml-20` would leave a blank 80px gutter on the landing,
 * login, and signup pages.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return <div className={`min-h-screen flex flex-col ${isAuthenticated ? 'ml-20' : ''}`}>{children}</div>;
}
```

- [ ] **Step 4: Wire it into `layout.tsx`**

Edit `frontend/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Inter, Fraunces, Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { AuthProvider } from '@/lib/authContext';
import { MoonToggle } from '@/components/common/MoonToggle';
import { SidebarNav } from '@/components/common/SidebarNav';
import { AppShell } from '@/components/common/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-fraunces', display: 'swap' });
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-nastaliq', display: 'swap' });

export const metadata: Metadata = {
  title: 'Umeed',
  description: 'A supportive companion for mental wellbeing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${nastaliq.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body style={{ backgroundColor: 'var(--umeed-beige-50)', color: 'var(--umeed-ink-900)' }}>
        <AuthProvider>
          <SidebarNav />
          <AppShell>
            <MoonToggle />
            <main className="flex-1">
              {children}
            </main>
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify live** — sign up a fresh test user via a real browser (or reuse the Playwright approach from the audit), confirm: (a) landing/login/signup pages show no sidebar and no blank gutter; (b) once authenticated, the sidebar appears with a "Log out" control at the bottom; (c) clicking it clears storage and lands on `/login`; (d) `/chat` visited afterward now redirects to `/login` (via Task 3's interceptor, since there's no token) instead of rendering.

- [ ] **Step 6: Type-check**

```bash
cd /Users/usmannazir/usman/Umeed/frontend && npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add frontend/components/common/SidebarNav.tsx frontend/components/common/AppShell.tsx frontend/app/layout.tsx
git commit -m "feat: add logout control, hide sidebar for logged-out visitors, keep layout margin in sync"
```

---

## Task 7: Frontend — onboarding page uses real auth, drops the fake identity generator

**Files:**
- Modify: `frontend/app/(auth)/onboarding/page.tsx`

**Interfaces:**
- Consumes: `useRequireAuth` from `lib/useRequireAuth.ts` (Task 4).

- [ ] **Step 1: Reproduce** — the current page generates and stores `localStorage['userId']` unconditionally on mount, even for a visitor who isn't authenticated at all (no token). Confirm: clear all localStorage, visit `/onboarding` directly with no signup/login — the page still renders the "name" step instead of redirecting to `/login`.

- [ ] **Step 2: Remove the fake identity block and add the auth gate**

Edit `frontend/app/(auth)/onboarding/page.tsx` — replace the top of the component:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { savePreferences, checkOnboardingStatus } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';
import type { UserPreferences } from '@/lib/types';
import {
  SUPPORT_STYLE_OPTIONS,
  TOPICS_OF_CONCERN,
  LANGUAGES,
  ROUTES,
} from '@/lib/constants';

type Step = 'name' | 'topics' | 'support-style' | 'languages' | 'complete' | 'redirect';

const STEP_NUMBER: Record<Step, number> = {
  name: 1,
  topics: 2,
  'support-style': 3,
  languages: 4,
  complete: 4,
  redirect: 0,
};
const TOTAL_STEPS = 4;

export default function Onboarding() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useRequireAuth({ requireOnboarded: false });
  const [step, setStep] = useState<Step>('redirect');
  const [loading, setLoading] = useState(false);

  // Check if user has already completed onboarding (only once authenticated)
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const checkStatus = async () => {
      try {
        const status = await checkOnboardingStatus();
        if (status.completed) {
          router.push(ROUTES.chat);
        } else {
          setStep('name');
        }
      } catch (err) {
        setStep('name');
      }
    };

    checkStatus();
  }, [isAuthenticated, isLoading, router]);
```

(Delete the old `const [userId] = useState(() => { ... localStorage.setItem('userId', newId) ... })` block entirely — nothing in this file used that value for anything except the removed local flag; every API call already authenticates via the Bearer token.)

Leave the rest of the component (the `preferences` state, `handleTopicToggle`, `handleSupportStyleChange`, `handleLanguageChange`, `handleComplete`, and all the JSX for each step) unchanged — none of it referenced `userId`.

- [ ] **Step 3: Verify live** — with a fresh incognito-equivalent (cleared localStorage) browser session: visiting `/onboarding` directly now redirects to `/login` instead of rendering the form. After a real signup, `/onboarding` renders normally and completes as before.

- [ ] **Step 4: Type-check**

```bash
cd /Users/usmannazir/usman/Umeed/frontend && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/(auth)/onboarding/page.tsx"
git commit -m "fix: onboarding page requires real auth, stop generating a fake client-side userId"
```

---

## Task 8: Frontend — `chat`, `mood`, `safety-plan/builder`, `safety-plan/view`, `profile` pages switch to `useRequireAuth`

**Files:**
- Modify: `frontend/app/chat/page.tsx`
- Modify: `frontend/app/mood/page.tsx`
- Modify: `frontend/app/safety-plan/builder/page.tsx`
- Modify: `frontend/app/safety-plan/view/page.tsx`
- Modify: `frontend/app/profile/page.tsx`

**Interfaces:**
- Consumes: `useRequireAuth` from `lib/useRequireAuth.ts` (Task 4).

This is the same one-line-shaped change repeated across five files: delete the `localStorage.getItem('userId')` state and its `if (!userId) { window.location.href = ROUTES.onboarding }` effect, replace with `useRequireAuth()`.

- [ ] **Step 1: `frontend/app/chat/page.tsx`**

Replace:

```tsx
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || '';
    }
    return '';
  });

  useEffect(() => {
    if (!userId) {
      if (typeof window !== 'undefined') {
        window.location.href = ROUTES.onboarding;
      }
    } else {
      getPreferences()
        .then(setPreferences)
        .catch((err) => console.warn('Could not load preferences:', err));

      getMoodCheckinStatus()
        .then((status) => setShowMoodCheckin(!status.checkedInToday))
        .catch((err) => console.warn('Could not load mood status:', err));
    }
  }, [userId]);
```

with:

```tsx
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    getPreferences()
      .then(setPreferences)
      .catch((err) => console.warn('Could not load preferences:', err));

    getMoodCheckinStatus()
      .then((status) => setShowMoodCheckin(!status.checkedInToday))
      .catch((err) => console.warn('Could not load mood status:', err));
  }, [authLoading, isAuthenticated]);
```

Add the import: `import { useRequireAuth } from '@/lib/useRequireAuth';` and remove `ROUTES` from the import list only if nothing else in the file still uses it — it does (`ROUTES.crisis`, `ROUTES.profile`), so leave that import as-is.

- [ ] **Step 2: `frontend/app/mood/page.tsx`**

Replace:

```tsx
  const [userId] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : ''));

  useEffect(() => {
    if (!userId) {
      if (typeof window !== 'undefined') window.location.href = ROUTES.onboarding;
      return;
    }

    getMoodTrend(7)
      .then((trend) => {
        setData(trend.data);
        setAverage(trend.average);
      })
      .catch((err) => {
        console.error('Error loading mood trend:', err);
        setError('Could not load your mood trend right now.');
      })
      .finally(() => setLoading(false));
  }, [userId]);
```

with:

```tsx
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    getMoodTrend(7)
      .then((trend) => {
        setData(trend.data);
        setAverage(trend.average);
      })
      .catch((err) => {
        console.error('Error loading mood trend:', err);
        setError('Could not load your mood trend right now.');
      })
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);
```

Add `import { useRequireAuth } from '@/lib/useRequireAuth';`. Remove the now-unused `ROUTES` import only if nothing else in the file uses `ROUTES` — check the file; if `ROUTES` has no other reference after this change, delete that import line to avoid an unused-import lint warning.

- [ ] **Step 3: `frontend/app/safety-plan/builder/page.tsx`**

Replace:

```tsx
  const [userId] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : ''));
  ...
  useEffect(() => {
    if (!userId) {
      if (typeof window !== 'undefined') window.location.href = ROUTES.onboarding;
      return;
    }

    getSafetyPlan()
      .then((existing) => {
        if (existing) setPlan({ ...EMPTY_PLAN, ...existing });
      })
      .finally(() => setLoading(false));
  }, [userId]);
```

with:

```tsx
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  ...
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    getSafetyPlan()
      .then((existing) => {
        if (existing) setPlan({ ...EMPTY_PLAN, ...existing });
      })
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);
```

The `persist` callback's dependency array currently reads `[userId]` — change it to `[]` (it no longer references `userId` at all; it never did anything with it besides closing over the stale variable). Add `import { useRequireAuth } from '@/lib/useRequireAuth';`.

- [ ] **Step 4: `frontend/app/safety-plan/view/page.tsx`**

Replace:

```tsx
  const [userId] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : ''));

  useEffect(() => {
    if (!userId) {
      if (typeof window !== 'undefined') window.location.href = ROUTES.onboarding;
      return;
    }
    getSafetyPlan()
      .then(setPlan)
      .finally(() => setLoading(false));
  }, [userId]);
```

with:

```tsx
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    getSafetyPlan()
      .then(setPlan)
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);
```

Add `import { useRequireAuth } from '@/lib/useRequireAuth';`. Remove the `ROUTES` import if it's now unused in this file (check — the rest of the file uses `Link href={ROUTES.safetyPlanBuilder}`, so it stays).

- [ ] **Step 5: `frontend/app/profile/page.tsx`**

This page currently has no auth gate at all. Add one. Edit the top of the component:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPreferences, updatePreferences, resetPassword } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';
import type { UserPreferences } from '@/lib/types';
import {
  SUPPORT_STYLE_OPTIONS,
  TOPICS_OF_CONCERN,
  LANGUAGES,
  ROUTES,
} from '@/lib/constants';

type Tab = 'preferences' | 'password';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [tab, setTab] = useState<Tab>('preferences');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Password reset form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load preferences
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const loadPreferences = async () => {
      try {
        const prefs = await getPreferences();
        setPreferences(prefs);
      } catch (err) {
        setError('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [authLoading, isAuthenticated]);
```

Leave everything below this (the handlers and JSX) unchanged.

- [ ] **Step 6: Verify live for all five pages** — re-run the exact post-logout repro from Task 3, Step 1, but this time also check `/mood`, `/safety-plan/builder`, `/safety-plan/view`, and `/profile` directly (not just `/chat`): with `authToken`/`authUser` cleared but no token, each of these five pages should now redirect straight to `/login` on load (via `useRequireAuth`'s own effect, not just the 401 interceptor) — no flash of the authenticated-looking UI first.

- [ ] **Step 7: Type-check**

```bash
cd /Users/usmannazir/usman/Umeed/frontend && npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add frontend/app/chat/page.tsx frontend/app/mood/page.tsx frontend/app/safety-plan/builder/page.tsx frontend/app/safety-plan/view/page.tsx frontend/app/profile/page.tsx
git commit -m "fix: chat/mood/safety-plan/profile pages gate on real auth state instead of a fake localStorage id"
```

---

## Task 9: Frontend — resources page personalization uses the real user id

**Files:**
- Modify: `frontend/app/resources/page.tsx`

**Interfaces:**
- Consumes: `useAuth()` from `lib/authContext.tsx`.

**Note:** this page stays a public route with no redirect gate — only the source of the `userId` used for the optional "matched to your preferences" personalization changes.

- [ ] **Step 1: Reproduce** — as a logged-in user with saved preferences, visit `/resources`. Confirm via the network tab (or by re-running the earlier curl check) that `GET /resources?...&userId=...` is sent with the fake `localStorage['userId']` value, which never matches any real `user_preferences` record, so the "Matched to your preferences" section never renders even though the account genuinely has preferences saved.

- [ ] **Step 2: Swap the identity source**

Edit `frontend/app/resources/page.tsx` — replace:

```tsx
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || '';
    }
    return '';
  });
```

with:

```tsx
  const { user } = useAuth();
  const userId = user?.id;
```

Add the import: `import { useAuth } from '@/lib/authContext';`. Remove the now-unused `useState` import only if nothing else in the file uses `useState` — it does (`selectedCity`, `search`, `matched`, `other`, `loading`), so leave that import as-is.

The `useEffect` that builds `params.userId = userId` already checks `if (userId)` beforehand, so no other change is needed — an unauthenticated visitor now simply omits the param (as intended for a public route) instead of sending a garbage id.

- [ ] **Step 3: Verify live** — same logged-in user as Step 1, revisit `/resources`. `GET /resources` now includes the real backend user id, and the "Matched to your preferences" section renders when the account's saved `preferredSupportStyle`/`languages` match a resource's `contexts`/`languages`.

- [ ] **Step 4: Type-check**

```bash
cd /Users/usmannazir/usman/Umeed/frontend && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add frontend/app/resources/page.tsx
git commit -m "fix: resources page personalization uses the real authenticated user id, not a fake local one"
```

---

## Task 10: Full-flow regression check

**Files:** none (verification only)

- [ ] **Step 1: Fresh signup through the full flow**

Using a real browser (or the Playwright script from the audit, updated to not pre-seed any localStorage this time): sign up a brand-new account, complete onboarding, land on `/chat`, confirm `localStorage['userId']` no longer exists at all (grep the full `localStorage` dump for the key — it should be absent, since nothing writes it anymore) and that `authToken`/`authUser` are the only auth-relevant keys present.

- [ ] **Step 2: Full logout repro, now fixed**

From `/chat`, click the new "Log out" control in the sidebar. Confirm: storage clears, browser lands on `/login`, and the sidebar is gone. Manually navigate back to `/chat`, `/mood`, `/safety-plan/builder`, `/safety-plan/view`, `/profile`, and `/onboarding` directly (typing each URL) — every one of them now redirects to `/login` instead of rendering.

- [ ] **Step 3: Two-account isolation still holds**

Sign up a second account, complete onboarding differently (different name/support style), confirm its `/chat` greeting and `/resources` matched section reflect its own preferences, not the first account's — this should already have been true (backend isolation was never broken), just confirming nothing in this refactor accidentally crossed the wires.

- [ ] **Step 4: Backend test suite**

```bash
cd /Users/usmannazir/usman/Umeed/backend
npm run test:crisis-detection
npm run test:jwt-secret
```

(Skip `test:crisis-classifier` / `test:system-prompt` here — those hit the live paid-ish model APIs and aren't relevant to this plan's changes.)

- [ ] **Step 5: Frontend type-check, full**

```bash
cd /Users/usmannazir/usman/Umeed/frontend && npx tsc --noEmit
```

- [ ] **Step 6: Final commit (if Step 1–5 surfaced any small fixes)**

```bash
git add -A
git commit -m "chore: auth/identity fix regression pass"
```

(Skip this commit if nothing needed changing — the point of this task is verification, not new code.)
