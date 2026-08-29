# Frontend UX Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 8 user-reported UX issues from the post-revamp review (Urdu copy, dashboard routing, chat sidebar, profile placement, dark-mode toggle overlap, dark-mode correctness, readability, and the safety-plan pages) plus 5 additional structural issues found during the full audit.

**Architecture:** Every task is a targeted fix to existing Next.js 14 App Router pages/components — no new routes, no new dependencies, no new abstractions beyond what's already in `components/ui`/`components/common`. Root-cause fixes are preferred over per-page patches wherever the codebase already has a single source of truth (CSS custom properties in `globals.css`, the `MoonToggle`/`Chip`/`Button` shared components) — several findings that looked like "touch 10 files" collapse into a 1–2 file fix once traced to that source.

**Tech Stack:** Next.js 14 (App Router), React, Tailwind CSS, TypeScript. No test framework exists in this repo (confirmed: no jest/vitest/testing-library/cypress in `package.json`, no test directories). "Verify" steps in this plan use what the repo actually has: `npm run type-check` (`tsc --noEmit`), `npm run build`, targeted `grep` checks, and `curl` against a running dev server — the same techniques used to produce the audit this plan implements from.

**Spec:** The audit findings are recorded in this conversation's prior turn (verification of the user's 7 points + 5 additional audit findings A–E). No separate spec file — this plan document carries the full findings inline per task.

**Known gap, deliberately out of scope:** audit finding B ("`SidebarNav` has no mobile collapse behavior — it's a permanently-fixed 80px rail on every authenticated page") is only fixed for the chat page itself (Task 10 restructures chat's *own* two columns). The `SidebarNav` component's own lack of a mobile mode still affects every other authenticated page (dashboard, resources, profile, mood, safety-plan). None of the 8 user-reported items named this directly, and fixing it properly means giving `SidebarNav` its own responsive mode consistently across ~10 pages — sized like its own task, not a rider on this one. Flagging it here so it isn't silently dropped; say the word if you want it added as an 11th task.

## Global Constraints

- Preserve every existing API call, prop, and piece of state exactly — these are styling/structure/routing fixes, not behavior changes to data flow.
- No new npm dependencies.
- Match existing conventions: Tailwind token system (`primary`/`accent`/`surface`/`ink`) for anything already on it; the `umeed-*` CSS custom properties only where a page is still intentionally inline-style (there are none left after the previous revamp — confirm this stays true).
- All contrast fixes must be justified by an actual computed WCAG contrast ratio (4.5:1 normal text, 3:1 large text/UI components), not eyeballed.
- Run `npm run type-check` after every task before moving to the next.

---

## Task 1: Fix the dark-mode theme-sync bug and CSS var gap

**Files:**
- Modify: `frontend/lib/theme.ts`
- Modify: `frontend/lib/useTheme.ts`
- Modify: `frontend/app/globals.css`

**Interfaces:**
- Consumes: nothing new.
- Produces: `resolveInitialTheme()` (unchanged signature, fixed behavior) — still consumed by `useTheme.ts`. `getSystemTheme` is removed (only caller was the buggy path).

**Root cause:** `THEME_INIT_SCRIPT` (the pre-paint inline script in `layout.tsx`, sets the DOM `.dark` class before React loads) defaults to **light** when nothing is stored. But `resolveInitialTheme()` in `theme.ts` (what the `useTheme()` hook believes is current) falls back to **`getSystemTheme()`** — a different default. Worse, `useTheme()`'s effect only calls `setThemeState(...)`, never `applyTheme(...)`, so the DOM and the toggle's displayed state can permanently disagree for any first-time visitor whose OS is set to dark mode. Also: `--umeed-orange-100` has no `:root.dark` override while every sibling in that scale does (used by the safety-plan builder's spine line — fixed in Task 9, but the var needs a dark value regardless).

- [ ] **Step 1: Make `resolveInitialTheme` match the init script exactly, and sync the DOM on mount**

Edit `frontend/lib/theme.ts` — remove `getSystemTheme` (its only caller is being fixed) and change the fallback:

```ts
export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? 'light';
}
```

Delete the now-unused `getSystemTheme` function entirely.

Edit `frontend/lib/useTheme.ts` to reconcile the DOM on mount, not just React state:

```ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { applyTheme, resolveInitialTheme, setTheme, type Theme } from './theme';

// For the settings screen's manual override toggle. The inline script in
// layout.tsx already set the DOM class before hydration; this re-applies it
// so DOM and React state can never disagree, then exposes a setter that
// also persists the choice.
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const initial = resolveInitialTheme();
    applyTheme(initial);
    setThemeState(initial);
  }, []);

  const update = useCallback((next: Theme) => {
    setTheme(next);
    setThemeState(next);
  }, []);

  return [theme, update];
}
```

- [ ] **Step 2: Add the missing dark-mode override for `--umeed-orange-100`**

In `frontend/app/globals.css`, add to the `:root.dark` block (it currently has `orange-500`/`orange-700` but not `orange-100`):

```css
:root.dark {
  --umeed-beige-50: #20241F;
  --umeed-beige-200: #2B302A;
  --umeed-ink-900: #EDEBE7;
  --umeed-ink-500: #A8A296;
  --umeed-orange-500: #93AC97;
  --umeed-orange-700: #ACC2AE;
  --umeed-orange-100: #2F3A31;
  --jali-line: rgba(237, 235, 231, 0.05);
  color-scheme: dark;
}
```

(`#2F3A31` is a dark desaturated sage — keeps the dotted spine line visible against `surface-darker` without glowing.)

- [ ] **Step 3: Verify**

```bash
cd frontend && npm run type-check
grep -n "getSystemTheme" lib/*.ts app/**/*.tsx 2>/dev/null
```
Expected: `type-check` passes with no errors; the `grep` for `getSystemTheme` returns nothing (confirms no dangling references to the deleted function).

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/theme.ts frontend/lib/useTheme.ts frontend/app/globals.css
git commit -m "fix: reconcile dark-mode default and DOM sync, add missing dark var"
```

---

## Task 2: Fix readability — contrast token and component fixes

**Files:**
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/app/globals.css`
- Modify: `frontend/components/ui/Button.tsx`
- Modify: `frontend/app/resources/page.tsx`
- Modify (mechanical, sed): every file using the `text-ink-light/NN dark:text-ink-dark/NN` opacity pattern

**Interfaces:**
- Consumes: nothing new.
- Produces: `ink.muted` Tailwind token now resolves through `var(--umeed-ink-500)` — theme-aware everywhere it's already used (34 existing call sites, zero of them need editing).

**Computed contrast failures being fixed** (WCAG AA requires 4.5:1 normal text, 3:1 large text/UI):
| Pair | Current ratio | Fixed ratio |
|---|---|---|
| `ink-muted` (#8A8578) on canvas (#F7F4EF) | 3.35:1 | 5.32:1 |
| `ink-muted` on dark canvas (#23262B) | 4.13:1 | 7.18:1 |
| `ink-light/70` opacity pattern on canvas | 4.11:1 | (replaced by fixed `ink-muted`) |
| White text on `Button` primary variant (`primary-600`) | 3.88:1 | 5.41:1 (`primary-700`) |
| White text on resources page type badge (`accent-600`) | 4.00:1 | 5.51:1 (`accent-700`) |

- [ ] **Step 1: Repoint `ink.muted` at the CSS variable and fix its values (root-cause fix — zero per-usage edits needed)**

`ink.muted` today is a static hex baked into `tailwind.config.js`, unlike `surface`/`ink.light`/`ink.dark` which already reference CSS vars that flip under `.dark`. Bringing it onto the same pattern fixes all 34 existing `text-ink-muted` call sites at once.

In `frontend/tailwind.config.js`, change:
```js
ink: {
  light: '#44403A',
  dark: '#EDEBE7',
  muted: '#8A8578',
},
```
to:
```js
ink: {
  light: '#44403A',
  dark: '#EDEBE7',
  muted: 'var(--umeed-ink-500)',
},
```

In `frontend/app/globals.css`, update the values `--umeed-ink-500` already carries (this var is currently unused elsewhere — confirmed via `grep -rn umeed-ink-500 app components` returning only its own two definitions):

In `:root`, change `--umeed-ink-500: #8A8578;` to `--umeed-ink-500: #6B6659;` (5.32:1 on the light canvas).

In `:root.dark`, change `--umeed-ink-500: #A8A296;` to `--umeed-ink-500: #B8B2A3;` (7.18:1 on the dark canvas).

- [ ] **Step 2: Replace the low-contrast opacity pattern with the now-fixed `ink-muted` token**

The `text-ink-light/NN dark:text-ink-dark/NN` pattern (27 occurrences, opacity levels 60/70/80) computes to ~4.1:1 at best — still under AA, and it's inconsistent (three different opacity levels doing the same "secondary text" job with no design rationale). Collapse all of them to the single, now-correct `ink-muted` token:

```bash
cd frontend
grep -rl 'text-ink-light/[0-9]* dark:text-ink-dark/[0-9]*' app components | while read -r f; do
  sed -i '' -E 's/text-ink-light\/[0-9]+ dark:text-ink-dark\/[0-9]+/text-ink-muted/g' "$f"
done
```

- [ ] **Step 3: Darken the primary `Button` variant for AA compliance**

Read `frontend/components/ui/Button.tsx` first to confirm current class strings, then change the `primary` variant's light-mode background one step darker (dark mode's variant already passes at 5.65:1 — dark text on `primary-500` — leave it as-is):

```tsx
const variants: Record<Variant, string> = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 ' +
    'focus-visible:outline-primary-600 dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-surface-darker',
  // ...secondary, ghost, danger unchanged
};
```

- [ ] **Step 4: Darken the resource-type badge on the resources page**

In `frontend/app/resources/page.tsx`, in `ResourceCard`, change:
```tsx
<span className="bg-accent-600 text-white px-3 py-1 rounded-pill text-xs font-bold whitespace-nowrap">
```
to:
```tsx
<span className="bg-accent-700 text-white px-3 py-1 rounded-pill text-xs font-bold whitespace-nowrap">
```

- [ ] **Step 5: Verify**

```bash
cd frontend
npm run type-check
grep -rn "text-ink-light/[0-9]" app components  # expect: no output
grep -rn "bg-primary-600 text-white" components/ui/Button.tsx  # expect: no output
npm run build
```
Expected: type-check and build both clean; both greps return nothing.

- [ ] **Step 6: Commit**

Step 2's `sed` touches an unpredictable set of files (whatever the `grep -rl` matches at run time), so stage by tracked-modified state rather than an explicit file list:

```bash
git add -u frontend/app frontend/components frontend/tailwind.config.js
git commit -m "fix: raise text and button contrast to WCAG AA across the app"
```

---

## Task 3: Reposition the dark-mode toggle so it never overlaps page content

**Files:**
- Modify: `frontend/components/common/MoonToggle.tsx`
- Modify: `frontend/app/layout.tsx`
- Modify: `frontend/components/common/SidebarNav.tsx`
- Modify: `frontend/app/page.tsx`
- Modify: `frontend/app/(auth)/login/page.tsx`
- Modify: `frontend/app/(auth)/signup/page.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `MoonToggle({ size?: 'sm' | 'lg' })` — new optional prop, `'lg'` (current visual size) is the default so any caller that doesn't pass `size` keeps today's look.

**Root cause:** `MoonToggle` is unconditionally `fixed top-4 right-4 z-50` and rendered once, globally, in `layout.tsx` — completely uncoordinated with whatever any given page puts in its own top-right corner (profile's "Back to chat" button, the landing header's Sign-up button at in-between viewport widths, every authenticated page's right-aligned header link on mobile). Fix: stop floating it independently — place it in the flow, once per context (`SidebarNav` for every authenticated page, inline in the header for the 3 public pages).

- [ ] **Step 1: Make `MoonToggle` support two sizes and drop its own fixed positioning**

Read `frontend/components/common/MoonToggle.tsx` first, then replace its contents:

```tsx
'use client';

import { useTheme } from '@/lib/useTheme';

interface MoonToggleProps {
  size?: 'sm' | 'lg';
}

// Dark-mode toggle. No longer self-positions — callers place it in their own
// layout (SidebarNav for authenticated pages, inline in the header for the
// 3 public pages) so it never overlaps page content.
export function MoonToggle({ size = 'lg' }: MoonToggleProps) {
  const [theme, setTheme] = useTheme();
  const isDark = theme === 'dark';
  const dims = size === 'sm' ? 'h-9 w-9 rounded-lg' : 'h-10 w-10 rounded-pill';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={`flex items-center justify-center ${dims}
        bg-surface text-ink-light shadow-sm border border-primary-100
        hover:bg-primary-50 active:bg-primary-100
        dark:bg-surface-darker dark:text-ink-dark dark:border-primary-900/40 dark:hover:bg-primary-900/20`}
    >
      {isDark ? (
        <svg className="icon-inline" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          />
        </svg>
      ) : (
        <svg className="icon-inline" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.7 14.3A8.5 8.5 0 019.7 3.3a.75.75 0 00-.9-1 10 10 0 1013 12.9.75.75 0 00-1.1-.9z" />
        </svg>
      )}
    </button>
  );
}

export default MoonToggle;
```

- [ ] **Step 2: Remove the unconditional global render from the layout**

Read `frontend/app/layout.tsx` first. Remove the `<MoonToggle />` line and its import:

```tsx
import type { Metadata } from 'next';
import { Inter, Fraunces, Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { AuthProvider } from '@/lib/authContext';
import { SidebarNav } from '@/components/common/SidebarNav';
import { AppShell } from '@/components/common/AppShell';

// ...font consts and metadata unchanged...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${nastaliq.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body style={{ backgroundColor: 'var(--umeed-beige-50)', color: 'var(--umeed-ink-900)' }}>
        <AuthProvider>
          <SidebarNav />
          <AppShell>
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

- [ ] **Step 3: Add the toggle into `SidebarNav` (covers every authenticated page in one place)**

Read `frontend/components/common/SidebarNav.tsx` first (it was restructured in the earlier revamp). Import `MoonToggle` and place it directly above the logout button, both grouped in a bottom cluster so the existing `justify-between` layout (logo / nav-group / bottom-group) still holds:

```tsx
import { MoonToggle } from './MoonToggle';
// ...existing imports...

// inside the returned <nav>, replace the standalone logout <button> block with:
<div className="flex flex-col items-center gap-4">
  <MoonToggle size="sm" />
  <button
    type="button"
    onClick={handleLogout}
    aria-label="Log out"
    className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer
      text-ink-muted hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-micro ease-umeed"
  >
    <span className="w-9 h-9 rounded-lg flex items-center justify-center">
      <Icon name="logout" className="h-[18px] w-[18px]" />
    </span>
    <span className="text-[9px] font-semibold tracking-wide uppercase leading-none">Log out</span>
  </button>
</div>
```

- [ ] **Step 4: Add the toggle inline in the landing page header**

In `frontend/app/page.tsx`, import `MoonToggle` and add it as the first item in the header's button group:

```tsx
import { MoonToggle } from '@/components/common/MoonToggle';
// ...

<div className="flex items-center gap-2">
  <MoonToggle size="sm" />
  <Link href={ROUTES.login} ...>Log in</Link>
  <Link href={ROUTES.signup} ...>Sign up</Link>
</div>
```

- [ ] **Step 5: Add the toggle inline (scoped to the card) on login and signup**

In both `frontend/app/(auth)/login/page.tsx` and `frontend/app/(auth)/signup/page.tsx`, import `MoonToggle` and add it inside the existing `relative`-positioned card wrapper (`w-full max-w-md ...`) so it's `absolute` relative to the card, never the viewport:

```tsx
import { MoonToggle } from '@/components/common/MoonToggle';
// ...

<div className="w-full max-w-md relative rounded-card bg-surface dark:bg-surface-darker shadow-sm border border-primary-100 dark:border-primary-900/40 p-8 animate-fade-up">
  <div className="absolute top-4 right-4">
    <MoonToggle size="sm" />
  </div>
  {/* existing card content unchanged */}
</div>
```

- [ ] **Step 6: Verify**

```bash
cd frontend
npm run type-check
grep -rn "fixed top-4 right-4" app components  # expect: no output — confirms no floating toggle remains
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/components/common/MoonToggle.tsx frontend/app/layout.tsx frontend/components/common/SidebarNav.tsx frontend/app/page.tsx "frontend/app/(auth)/login/page.tsx" "frontend/app/(auth)/signup/page.tsx"
git commit -m "fix: stop floating the dark-mode toggle independently of page layout"
```

---

## Task 4: Add a Profile Settings entry point to the persistent nav

**Files:**
- Modify: `frontend/components/ui/Icon.tsx`
- Modify: `frontend/components/common/SidebarNav.tsx`

**Interfaces:**
- Consumes: `Icon` component from Task 3's untouched base (adding one new icon name).
- Produces: new `IconName` value `'user'`.

**Root cause:** `grep -rn "ROUTES.profile"` across the whole app returns exactly one hit — a text link buried in the chat page's right sidebar. Profile settings has no entry point in the persistent nav that's on every authenticated page.

- [ ] **Step 1: Add a single-person icon**

In `frontend/components/ui/Icon.tsx`, add to the `PATHS` map (next to `people`):

```tsx
user: (
  <>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7" />
  </>
),
```

- [ ] **Step 2: Add Profile to the sidebar's nav items**

In `frontend/components/common/SidebarNav.tsx`, add a fourth entry to `NAV_ITEMS`:

```tsx
const NAV_ITEMS: { label: string; urdu: string; href: string; icon: IconName }[] = [
  { label: 'Talk', urdu: 'گفتگو', href: ROUTES.chat, icon: 'chat' },
  { label: 'My Plan', urdu: 'میری منصوبہ', href: ROUTES.safetyPlanView, icon: 'compass' },
  { label: 'Support', urdu: 'معاونت', href: ROUTES.resources, icon: 'lifebuoy' },
  { label: 'Profile', urdu: 'پروفائل', href: ROUTES.profile, icon: 'user' },
];
```

- [ ] **Step 3: Verify**

```bash
cd frontend && npm run type-check && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add frontend/components/ui/Icon.tsx frontend/components/common/SidebarNav.tsx
git commit -m "feat: add Profile Settings to the persistent sidebar nav"
```

---

## Task 5: Remove the redundant bottom nav on the safety-plan view page

**Files:**
- Modify: `frontend/app/safety-plan/view/page.tsx`

**Root cause (corrected from initial audit pass — verified precisely before writing this task):** only `safety-plan/view/page.tsx` renders `BottomNav` alongside the always-on `SidebarNav`; `/mood` does not (it uses `AppHeader` only, no `BottomNav`). So this is a one-file fix, not two.

- [ ] **Step 1: Remove `BottomNav` and its now-unnecessary bottom padding**

Read `frontend/app/safety-plan/view/page.tsx` first. Remove the `BottomNav` import and its render, and remove the `pb-24` on the root div (was reserving space for the bottom bar):

```tsx
// remove this import:
import { BottomNav } from '@/components/common/BottomNav';

// change:
<div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark pb-24">
// to:
<div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark">

// remove the closing `<BottomNav active="plan" />` line entirely.
```

- [ ] **Step 2: Verify**

```bash
cd frontend
grep -n "BottomNav" app/safety-plan/view/page.tsx  # expect: no output
npm run type-check
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/safety-plan/view/page.tsx
git commit -m "fix: remove duplicate nav — SidebarNav already covers safety-plan view"
```

---

## Task 6: Fix `Chip`'s disabled state and its own contrast failure

**Files:**
- Modify: `frontend/components/ui/Chip.tsx`

**Root cause:** Two issues in one small component. (1) The resources page passes `disabled` to `Chip` while searching, but `Chip.tsx` never branches its className on `disabled` — no visual dimming, only the native cursor change. (2) The `selected` state uses `bg-primary-500` with white text — computed contrast **3.14:1**, well under the 4.5:1 requirement, and this is used heavily (onboarding topic selection, profile preferences, resources city filters).

- [ ] **Step 1: Fix both in one edit**

Read `frontend/components/ui/Chip.tsx` first, then replace the className logic:

```tsx
export function Chip({ selected, className = '', children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={
        `rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-micro ease-umeed ` +
        `disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:border-primary-200 ` +
        (selected
          ? 'bg-primary-700 border-primary-700 text-white hover:bg-primary-800'
          : 'bg-surface border-primary-200 text-ink-light hover:border-primary-400 hover:bg-primary-50 ' +
            'dark:bg-surface-dark dark:border-primary-900/50 dark:text-ink-dark dark:hover:bg-primary-900/20') +
        ` ${className}`
      }
      {...props}
    >
      {children}
    </button>
  );
}
```

(`primary-700` on white: 5.41:1 — passes. Note the `disabled:hover:*` overrides only meaningfully apply to the unselected branch's hover classes since a disabled chip is realistically never in the selected+hovered state in this app's usage, but they're harmless either way.)

- [ ] **Step 2: Verify**

```bash
cd frontend && npm run type-check && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/ui/Chip.tsx
git commit -m "fix: Chip disabled state now visible, selected state now meets AA contrast"
```

---

## Task 7: Restore the Urdu copy on the landing page

**Files:**
- Modify: `frontend/app/page.tsx`

**Root cause:** The original landing page had an Urdu hero subline and Urdu chapter labels (recovered verbatim from git history at `HEAD:frontend/app/page.tsx`, since the revamp overwrote them without capturing the original text first). Recovered originals:
- Hero subline: `امید سے بات کریں`
- Talk: `گفتگو کریں` · Safety Plan: `منصوبہ بنائیں` · Resources: `وسائل`

- [ ] **Step 1: Add the hero subline**

Read the current `frontend/app/page.tsx` first (Task 3 already modified its header in this same file). Add the Urdu line between the `<h1>` and the English lead paragraph:

```tsx
<h1 className="animate-fade-up font-display text-4xl md:text-hero font-bold text-ink-light dark:text-ink-dark leading-tight">
  Support that meets you <em className="italic text-primary-700 dark:text-primary-300">where you are</em>.
</h1>
<p
  className="animate-fade-up font-nastaliq text-xl font-bold text-primary-700 dark:text-primary-300"
  style={{ animationDelay: '40ms' }}
  lang="ur"
  dir="rtl"
>
  امید سے بات کریں
</p>
<p
  className="animate-fade-up text-lead text-ink-light/80 dark:text-ink-dark/80 max-w-xl mx-auto"
  style={{ animationDelay: '90ms' }}
>
  Culturally-sensitive AI support that remembers your preferences, paired with a safety plan that&apos;s
  actually yours.
</p>
```

- [ ] **Step 2: Add Urdu labels to the feature cards**

Update the `FEATURES` array and its rendering to include the recovered Urdu label under each English title:

```tsx
const FEATURES: { icon: IconName; title: string; urdu: string; body: string }[] = [
  {
    icon: 'chat',
    title: 'Talk, your way',
    urdu: 'گفتگو کریں',
    body: "Tell us how you'd rather be supported — family, professional, or working through it solo. We adapt to what you say, never to assumptions about who you are.",
  },
  {
    icon: 'compass',
    title: "A safety plan that's yours",
    urdu: 'منصوبہ بنائیں',
    body: 'Build a plan for hard days — warning signs, coping strategies, people you trust — and export it whenever you need it.',
  },
  {
    icon: 'lifebuoy',
    title: 'Real resources, nearby',
    urdu: 'وسائل',
    body: 'Crisis lines and professional support, filtered to your region — always one tap away, whether or not you're signed in.',
  },
];
```

In the card render, add the Urdu label next to the title:

```tsx
<h2 className="font-display text-lg font-semibold text-ink-light dark:text-ink-dark flex items-baseline gap-2">
  {f.title}
  <span className="font-nastaliq text-sm text-primary-600 dark:text-primary-300" lang="ur" dir="rtl">
    {f.urdu}
  </span>
</h2>
```

- [ ] **Step 3: Verify**

```bash
cd frontend
grep -n "امید سے بات کریں\|گفتگو کریں\|منصوبہ بنائیں\|وسائل" app/page.tsx
npm run type-check && npm run build
```
Expected: all four Urdu strings found; build clean.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "fix: restore Urdu copy on the landing page (recovered from git history)"
```

---

## Task 8: Wire the dashboard into the post-auth flow

**Files:**
- Modify: `frontend/app/(auth)/login/page.tsx`
- Modify: `frontend/app/(auth)/onboarding/page.tsx`

**Root cause:** Traced every redirect — login always pushes to `/onboarding`, onboarding-complete always pushes to `/chat`. `/dashboard` is never a real destination for any user, ever, only reachable by manually clicking the sidebar logo.

**Decision:** returning (already-onboarded) users land on the dashboard after login; new users still go through onboarding, and land on the dashboard once it's done. Chat stays one click away via the dashboard's primary "Continue the conversation" action — this was the explicit design intent from the original dashboard build (`Dashboard is a hub with summary cards... deep-links into /chat`).

- [ ] **Step 1: Branch login's redirect on onboarding status**

Read `frontend/app/(auth)/login/page.tsx` first (Task 3 already added `MoonToggle` to it). Import `checkOnboardingStatus` and branch:

```tsx
import { checkOnboardingStatus } from '@/lib/api';
// ...existing imports...

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError('');

  if (!email || !password) {
    setError('Email and password are required');
    return;
  }

  try {
    await login(email, password);
    const status = await checkOnboardingStatus().catch(() => ({ completed: false }));
    router.push(status.completed ? ROUTES.dashboard : ROUTES.onboarding);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Login failed');
  }
}
```

- [ ] **Step 2: Send onboarding-complete users to the dashboard instead of chat**

Read `frontend/app/(auth)/onboarding/page.tsx` first. There are two `router.push(ROUTES.chat)` calls — the "already completed, bounce forward" check in the status-check effect, and the post-save redirect after `handleComplete`. Change both to `ROUTES.dashboard`:

```tsx
// in the useEffect status check:
if (status.completed) {
  router.push(ROUTES.dashboard);
} else {
  setStep('name');
}

// in handleComplete's setTimeout:
setTimeout(() => {
  router.push(ROUTES.dashboard);
}, 2000);
```

(Signup's redirect to `ROUTES.onboarding` is correct as-is — a brand-new user always needs onboarding first — no change needed there.)

- [ ] **Step 3: Verify**

```bash
cd frontend
grep -n "ROUTES.chat" "app/(auth)/onboarding/page.tsx"  # expect: no output
grep -n "ROUTES.dashboard" "app/(auth)/login/page.tsx" "app/(auth)/onboarding/page.tsx"  # expect: 1 hit each
npm run type-check && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/(auth)/login/page.tsx" "frontend/app/(auth)/onboarding/page.tsx"
git commit -m "fix: route returning and newly-onboarded users to the dashboard"
```

---

## Task 9: My Plan (safety-plan builder + view) UI fixes

**Files:**
- Modify: `frontend/app/safety-plan/view/page.tsx`
- Modify: `frontend/app/safety-plan/builder/page.tsx`
- Modify: `frontend/app/crisis/breathe/page.tsx`

**Root cause:** Two concrete, verifiable bugs, both in the "same class" as fixes already made elsewhere in the revamp but missed on these files:
1. `font-serif` (Tailwind's generic serif fallback stack) is used in 5 places across these two file groups instead of `font-display` (the actual Fraunces display face loaded for the app) — headings on these pages render in the browser's default serif instead of the brand typeface.
2. In the builder, the two "helper" actions on the same step ("Add contact" and "Suggest from our chats") use different `Button` variants (`ghost` vs `secondary`) for equivalent-weight actions — visually inconsistent for no reason.

- [ ] **Step 1: Fix the font on safety-plan/view**

Read `frontend/app/safety-plan/view/page.tsx` first. Change all three `font-serif` occurrences to `font-display`:
- `PlanSection`'s `<h2>` (the icon+title heading, appears once in the shared component and is reused per section)
- The main `<h1>My Personal Safety Plan</h1>`
- The inline "People in Your Corner" `<h2>`

```bash
sed -i '' 's/font-serif/font-display/g' frontend/app/safety-plan/view/page.tsx
```

- [ ] **Step 2: Fix the font on the breathing exercise (same bug class)**

```bash
sed -i '' 's/font-serif/font-display/g' frontend/app/crisis/breathe/page.tsx
```

- [ ] **Step 3: Standardize the two helper-action buttons in the safety-plan builder**

Read `frontend/app/safety-plan/builder/page.tsx` first. Change the "Suggest from our chats" button from `variant="secondary"` to `variant="ghost"` so both helper actions read as the same visual weight (the primary CTA — "Next"/"See my plan" — stays the only filled button on the screen):

```tsx
<Button
  variant="ghost"
  loading={suggesting}
  onClick={handleSuggest}
>
  <Icon name="sparkle" className="icon-inline" />
  {suggesting ? 'Getting suggestions...' : 'Suggest from our chats'}
</Button>
```

- [ ] **Step 4: Verify**

```bash
cd frontend
grep -n "font-serif" app/safety-plan/view/page.tsx app/crisis/breathe/page.tsx  # expect: no output
grep -n 'variant="secondary"' app/safety-plan/builder/page.tsx  # expect: no output
npm run type-check && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add frontend/app/safety-plan/view/page.tsx frontend/app/crisis/breathe/page.tsx frontend/app/safety-plan/builder/page.tsx
git commit -m "fix: correct display font and button-variant consistency on My Plan pages"
```

---

## Task 10: Restructure the chat page — collapsible sidebars, ChatGPT-style, mobile-responsive

**Files:**
- Modify: `frontend/components/ui/Icon.tsx`
- Modify: `frontend/app/chat/page.tsx`

**Interfaces:**
- Consumes: `Icon` from Task 4's state (adding one more icon name: `'menu'`).
- Produces: nothing new consumed elsewhere — this page is a leaf.

**Root cause:** `grid-cols-[240px_1fr_300px]` is a hardcoded, non-responsive 3-column grid (confirmed via grep: zero `md:`/`sm:`/`lg:` breakpoint classes in the whole file) — on a phone it doesn't reflow, it crushes three columns together. It also can't collapse on desktop, so the 240px conversation rail is permanently on-screen even with zero conversations. Fix: both side columns become collapsible drawers (overlay + backdrop below `lg`, in-flow width-collapse at `lg`+), each with its own toggle button in the header — symmetric, and this is the same underlying mechanism a ChatGPT-style sidebar uses.

**All existing state, handlers, and API calls in this file are unchanged — this task only replaces the JSX return statement and adds two new pieces of UI state.**

- [ ] **Step 1: Add the hamburger/menu icon**

In `frontend/components/ui/Icon.tsx`, add to `PATHS`:

```tsx
menu: <path d="M4 6h16M4 12h16M4 18h16" />,
```

- [ ] **Step 2: Add the two drawer-toggle states**

Read `frontend/app/chat/page.tsx` first (it was fully rewritten in the earlier revamp — confirm current state names before editing, they should match what follows). Add two new `useState` calls near the existing ones:

```tsx
const [sidebarOpen, setSidebarOpen] = useState(true);
const [rightPanelOpen, setRightPanelOpen] = useState(true);
```

(Default `true` so desktop users see the same layout as today; the CSS in the next step makes them start visually closed below the `lg` breakpoint regardless of this default, via `-translate-x-full`/`translate-x-full` base classes that only get overridden at `lg:`.)

- [ ] **Step 3: Replace the 3-column grid with two collapsible drawers**

Replace the outer layout `<div className="grid grid-cols-[240px_1fr_300px] gap-6 flex-1 overflow-hidden p-6">` and its three children with:

```tsx
<div className="relative flex flex-1 overflow-hidden">
  {/* Mobile/tablet backdrop for either open drawer */}
  {(sidebarOpen || rightPanelOpen) && (
    <div
      className="fixed inset-0 bg-black/40 z-30 lg:hidden"
      onClick={() => {
        setSidebarOpen(false);
        setRightPanelOpen(false);
      }}
    />
  )}

  {/* Conversation list: overlay drawer below lg, collapsible column at lg+ */}
  <div
    className={`fixed lg:static inset-y-0 left-0 z-40 lg:z-auto w-64 lg:overflow-hidden
      transition-transform lg:transition-[width] duration-quick ease-umeed
      ${sidebarOpen ? 'translate-x-0 lg:w-64' : '-translate-x-full lg:translate-x-0 lg:w-0'}
      bg-surface dark:bg-surface-darker border-r border-primary-100 dark:border-primary-900/40
      lg:rounded-card lg:border lg:m-6 lg:mr-0
      p-4 flex flex-col gap-1 overflow-y-auto`}
  >
    <button
      onClick={handleNewChat}
      className="mb-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm px-3 py-2.5 transition-colors duration-micro ease-umeed"
    >
      + New chat
    </button>
    {conversations.map((conv) => (
      <div
        key={conv.id}
        className={`group flex items-center gap-1 rounded-lg px-2.5 py-2 cursor-pointer transition-colors duration-micro ease-umeed ${
          conv.id === activeConversationId
            ? 'bg-primary-100 dark:bg-primary-900/40'
            : 'hover:bg-primary-50 dark:hover:bg-primary-900/20'
        }`}
        onClick={() => renamingId !== conv.id && handleSelectConversation(conv.id)}
      >
        {renamingId === conv.id ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => handleRenameSubmit(conv.id)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(conv.id)}
            className="flex-1 text-sm px-1.5 py-0.5 rounded border border-primary-300 dark:border-primary-700 bg-surface dark:bg-surface-dark text-ink-light dark:text-ink-dark outline-none"
          />
        ) : (
          <span className="flex-1 text-sm text-ink-light dark:text-ink-dark truncate">{conv.title}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setRenamingId(conv.id);
            setRenameValue(conv.title);
          }}
          aria-label="Rename conversation"
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-ink-muted transition-opacity duration-micro ease-umeed"
        >
          <Icon name="pencil" className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteConversation(conv.id);
          }}
          aria-label="Delete conversation"
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-ink-muted transition-opacity duration-micro ease-umeed"
        >
          <Icon name="trash" className="h-3.5 w-3.5" />
        </button>
      </div>
    ))}
  </div>

  {/* Middle: messages column, now with both drawer toggles in its header */}
  <div className="flex-1 flex flex-col min-w-0 p-6">
    <div className="flex justify-between items-center mb-5 pb-4 border-b border-primary-100 dark:border-primary-900/40">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle conversations"
          aria-pressed={sidebarOpen}
          className="h-9 w-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-micro ease-umeed"
        >
          <Icon name="menu" className="icon-inline" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-light dark:text-ink-dark m-0">Umeed</h1>
          <p className="text-xs text-ink-muted mt-1">Your companion</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={ROUTES.crisis}
          className="inline-flex items-center gap-1.5 rounded-pill bg-crisis-600 hover:bg-crisis-700 text-white text-xs font-bold px-4 py-2 transition-colors duration-micro ease-umeed whitespace-nowrap"
        >
          <Icon name="shield" className="h-3.5 w-3.5" />
          Help Now
        </Link>
        <button
          onClick={() => setRightPanelOpen((v) => !v)}
          aria-label="Toggle mood and support settings"
          aria-pressed={rightPanelOpen}
          className="h-9 w-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-micro ease-umeed"
        >
          <Icon name="heart" className="icon-inline" />
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto mb-5 flex flex-col gap-4 max-w-[640px]">
      {/* Greeting, messages.map(...), loading indicator, messagesEndRef — unchanged, copy from current file */}
    </div>

    <form onSubmit={handleSendMessage} className="flex gap-3">
      {/* input + send button — unchanged, copy from current file */}
    </form>
  </div>

  {/* Right: mood/support panel — same drawer mechanism, mirrored to the right edge */}
  <div
    className={`fixed lg:static inset-y-0 right-0 z-40 lg:z-auto w-[300px] lg:overflow-hidden
      transition-transform lg:transition-[width] duration-quick ease-umeed
      ${rightPanelOpen ? 'translate-x-0 lg:w-[300px]' : 'translate-x-full lg:translate-x-0 lg:w-0'}
      bg-surface dark:bg-surface-darker border-l border-primary-100 dark:border-primary-900/40
      lg:rounded-card lg:border lg:m-6 lg:ml-0
      p-6 flex flex-col gap-6 overflow-y-auto`}
  >
    {/* mood picker, SegmentedControl, profile settings link — unchanged, copy from current file */}
  </div>
</div>
```

Copy the unchanged inner content (greeting/messages/loading block, the input form, and the mood/comfort/profile-link block) verbatim from the current file into the three marked spots — none of that JSX changes, only its containing wrapper does.

- [ ] **Step 4: Verify**

```bash
cd frontend
npm run type-check
grep -c "lg:" app/chat/page.tsx  # expect: >0, confirms responsive classes are present now
npm run build
```

- [ ] **Step 5: Manual smoke test**

```bash
(npm run dev -- -p 3077 > /tmp/umeed-chat-check.log 2>&1 &) && sleep 6
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3077/chat
curl -s http://localhost:3077/chat | grep -o "Toggle conversations\|Toggle mood and support settings" | sort -u
lsof -ti :3077 -sTCP:LISTEN | xargs -r kill
```
Expected: `200`; both toggle `aria-label`s found in the rendered HTML.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/ui/Icon.tsx frontend/app/chat/page.tsx
git commit -m "fix: restructure chat page with collapsible drawers, fix mobile responsiveness"
```

---

## Final Verification (after all 10 tasks)

```bash
cd frontend
npm run type-check
npm run build
```
Expected: both clean, all 13 routes still generate.

```bash
(npm run dev -- -p 3088 > /tmp/umeed-final-check.log 2>&1 &) && sleep 6
for p in / /login /signup /onboarding /dashboard /chat /crisis /crisis/breathe /safety-plan/builder /safety-plan/view /resources /mood /profile; do
  echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3088$p")"
done
lsof -ti :3088 -sTCP:LISTEN | xargs -r kill
```
Expected: `200` on all 13 routes.

Then a manual pass (no automated test can cover this): log in as an already-onboarded user and confirm landing on `/dashboard`; toggle dark mode from the sidebar and confirm no flash/mismatch on reload; open `/chat` at a narrow viewport (browser devtools responsive mode, ~375px) and confirm both drawers are closed by default and open via their toggle buttons without overlapping the message thread.
