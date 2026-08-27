# Umeed Visual Identity & Implementation Guide

**Status:** Design system finalized — ready for implementation  
**Date:** 2026-08-27  
**Scope:** Complete visual overhaul from generic wellness-app template to culturally grounded, warm design system

---

## 1. Design Philosophy — The Core Shift

### From → To

| Aspect | Old | New |
|--------|-----|-----|
| **Aesthetic** | Generic wellness template (cards, chips, gradients) | Warm physical space (chai, terracotta, handwritten notebooks) |
| **Color palette** | Cool coral/blush + cool grays | Warm orange/beige + brown neutrals (never cool grays) |
| **Typography** | System font stack, no hierarchy | Serif display (Fraunces) + sans body (Inter) + Nastaliq for Urdu |
| **Feature layout** | 2-column card grids, bulleted lists | Asymmetric chapters, custom metaphors (notebook, map, ambient line) |
| **Cultural voice** | Generic English-first with "translation" | Bilingual-first (Urdu + Roman Urdu + English) with respect for stated preferences |
| **Logo** | TBD | Cup of Hope (recommended) — continuous line-drawing chai → Urdu letterform |
| **Layout** | Mobile-first, hamburger nav | Desktop-first, persistent left rail (3 items) |

### Why This Matters

The old design relied on patterns that could describe *any* mental health app—it was templated. The new system is specific to Umeed's subject: a South Asian context of hope (امید), where warmth and connection are expressed through chai, handwritten notes, and steady presence—not through clinical metaphors or generic wellness UI.

---

## 2. Design Tokens — CSS Variables

Copy these tokens into your root CSS file (e.g., `frontend/styles/tokens.css` or into `frontend/app/globals.css`):

```css
:root {
  /* Primary Palette */
  --umeed-orange-500: #F46B1F;
  --umeed-orange-700: #C4491A;
  --umeed-orange-100: #FDE3CE;
  
  /* Neutrals (Warm) */
  --umeed-beige-50: #FBF3E7;   /* Canvas/bg */
  --umeed-beige-200: #F2E4D0;  /* Surface/panels */
  --umeed-ink-900: #3A2A1C;    /* Primary text */
  --umeed-ink-500: #8C765F;    /* Secondary/muted */
  
  /* Semantic */
  --umeed-green-600: #3F7D4E;  /* Pattern insight ONLY */
  --umeed-crisis-600: #C0392B; /* Crisis mode ONLY */
  
  /* Typography Scale */
  --type-caption: 13px;
  --type-body: 16px;
  --type-lead: 20px;
  --type-section: 28px;
  --type-heading: 44px;
  --type-hero: 64px;
  
  /* Motion */
  --ease-umeed: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-quick: 300ms;
  --duration-standard: 400ms;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --umeed-beige-50: #241811;
    --umeed-beige-200: #342418;
    --umeed-ink-900: #F5F0EA;
    --umeed-ink-500: #C4B3A0;
    --umeed-orange-500: #FF8A42;
    --umeed-orange-700: #FFAA5F;
  }
}

:root[data-theme="dark"] {
  --umeed-beige-50: #241811;
  --umeed-beige-200: #342418;
  --umeed-ink-900: #F5F0EA;
  --umeed-ink-500: #C4B3A0;
  --umeed-orange-500: #FF8A42;
  --umeed-orange-700: #FFAA5F;
}
```

**Constraints on token usage:**
- `--umeed-crisis-600`: Crisis mode screen **only**. Never use decoratively elsewhere.
- `--umeed-green-600`: "I noticed a pattern" moments **only**. Never for general accent.
- No custom colors should be added—stick to this palette. If something needs a new color, it means the layout or semantic intent is wrong.

---

## 3. Typography Implementation

### Font Imports

Add to `frontend/app/layout.tsx` or `frontend/styles/globals.css`:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Inter:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap">
```

### CSS Classes/Utilities

```css
/* Display headings */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  line-height: 1.2;
  color: var(--umeed-ink-900);
}

h1 { font-size: var(--type-hero); }
h2 { font-size: var(--type-heading); }
h3 { font-size: var(--type-section); }

/* Body text */
body, p, span, label {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: var(--type-body);
  color: var(--umeed-ink-900);
}

/* Urdu text */
.urdu-text {
  font-family: 'Noto Nastaliq Urdu', serif;
  font-size: 1.1em;
  line-height: 1.8;
  color: var(--umeed-ink-900);
  font-weight: 700;
}

/* Roman Urdu (italic, with English translation below) */
.roman-urdu {
  font-family: 'Inter', sans-serif;
  font-style: italic;
  font-size: var(--type-lead);
  color: var(--umeed-ink-900);
}
```

### Type Scale Usage

- **Hero headlines (64px):** Landing page hero, crisis screen title
- **Page headings (44px):** Main page titles
- **Section headings (28px):** Feature/chapter section titles
- **Lead (20px):** Emphasis text, intro copy, Urdu display lines
- **Body (16px):** Running copy, UI labels, chat messages
- **Caption (13px):** Timestamps, hints, secondary info

---

## 4. Layout Rules

### Left Rail Navigation (Not Bottom)

Every screen inside the app should include a persistent left sidebar (80px wide on desktop, collapses to horizontal strip on mobile).

Three items: **Talk** (💬 گفتگو), **My Plan** (📋 میری منصوبہ‌بندی), **Support** (🤝 معاونت)

**Styles:**
```css
.sidebar-nav {
  position: fixed;
  left: 0;
  top: 0;
  width: 80px;
  height: 100vh;
  background: var(--umeed-beige-200);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  gap: 40px;
  border-right: 1px solid var(--umeed-beige-50);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--umeed-ink-500);
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 300ms var(--ease-umeed);
}

.nav-item:hover,
.nav-item.active {
  color: var(--umeed-orange-500);
}
```

### Landing Page Structure

Long-scroll, chapter-based layout (not a 4-card grid). Each section:
1. Full viewport height
2. Large Urdu headline + English subline (staggered fade-in on load)
3. One custom illustration or mock (not a stock icon)
4. One short paragraph of human copy
5. No bullet points

**Example structure:**
```html
<section>
  <div class="chapter-content">
    <div class="chapter-text">
      <h2>Talk</h2>
      <div class="urdu-text">گفتگو کریں</div>
      <p>[One sentence about what this feature is]</p>
      <p>[One paragraph of human copy, 16px]</p>
    </div>
    <div class="chapter-visual">
      [Illustration placeholder, 100px emoji or icon]
    </div>
  </div>
</section>
```

### Chat Screen (Two-Column Desktop)

- **Left:** Conversation thread, max 640px reading width
- **Right:** Ambient sidebar (300px) with current comfort mode, mood, patterns
- **Mobile:** Stack to single column

```html
<div style="display: grid; grid-template-columns: 1fr 300px; gap: 30px;">
  <div class="chat-messages"><!-- Thread --></div>
  <div class="chat-sidebar"><!-- Mood, comfort mode, patterns --></div>
</div>
```

### Safety Plan Builder (Notebook Metaphor)

Left border (12px orange), left margin (30px), lines on the left spine (rendered as repeating gradient), dashed-border input fields. Never a step-form wizard.

```css
.notebook {
  background: white;
  border-left: 12px solid var(--umeed-orange-500);
  padding: 40px;
  position: relative;
}

.notebook::before {
  content: '';
  position: absolute;
  left: 40px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    var(--umeed-orange-100) 0,
    var(--umeed-orange-100) 24px,
    transparent 24px,
    transparent 28px
  );
}
```

### Resources (Map & Pins)

Left side: illustrated map (emoji or SVG) with animated pins. Right side: resource list (cards with left orange border, hover lift).

---

## 5. Motion & Interaction

### Page Load
Hero headline + Urdu line fade in with 0.5s stagger:
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-headline { animation: fadeInUp 0.8s var(--ease-umeed) 0.1s backwards; }
.hero-subline { animation: fadeInUp 0.8s var(--ease-umeed) 0.3s backwards; }
```

### Scroll-Triggered Reveals
Each chapter section fades in on scroll (use `IntersectionObserver`). Easing: `var(--ease-umeed)`, duration: 300–400ms.

### Hover States
Buttons: scale 1.02 + glow effect (soft orange box-shadow)
```css
.button:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(244, 107, 31, 0.3);
}
```

### Reduced Motion
Always respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Logo — Three Directions (Pick One)

### Direction A: Cup of Hope (Recommended Primary)

**Visual:** Continuous line-drawing chai cup. Steam rises as three soft curves, morphing into the Urdu ی (choti yeh) or heart-adjacent shape without being literal.

**Wordmark:** "Umeed" in terracotta-orange (#F46B1F), rounded-but-confident sans (Inter 700). امید in Nastaliq script, slightly smaller, deep rust/brown (#C4491A), placed above or beside.

**Why:** Immediate cultural resonance (chai as hope), scales perfectly to 24px favicon, warm & tactile.

### Direction B: Rising Sun Arc

**Visual:** Minimal arc (rising sun) built from 3–4 concentric strokes in gradient orange tones (terracotta → amber → gold). Horizon line doubles as underline beneath "umeed" lowercase.

**Why:** Cosmic/hopeful, strong horizontal anchor, minimal line economy.

### Direction C: Open Hand / Diya Lamp

**Visual:** Single-stroke icon reading as both a cupped hand (receiving support) and oil lamp diya (holding light). One weight, no gradients. Sits left of wordmark.

**Why:** Dual meaning (give & receive), South Asian gesture language, ultra-legible at small scale.

---

## 7. Copy Voice Guidelines

### Tone
- Sentence case, warm, plainspoken
- Never clinical ("diagnose", "therapy", "mental health condition")
- Never falsely cheerful ("You've got this!", "Let's go!")
- Umeed is a steady friend, not a hype coach

### Bilingual Structure
Every Urdu/Roman Urdu line pairs with a small English translation below, in muted ink tone (not a full duplicate paragraph):

```html
<h1>
  <div class="urdu-text">امید سے بات کرو</div>
  <p class="translation">Talk to Umeed</p>
</h1>
```

### Avoid
- No emoji in headings
- No exclamation-point positivity
- No generic wellness-app language ("mindfulness", "self-care rituals", "journey")
- No brain icons, lotus flowers, puzzle pieces, meditating silhouettes

---

## 8. Implementation Checklist

### Phase 1: Design Tokens & Theme (Week 1)

- [ ] Add CSS variables to `frontend/app/globals.css` (colors, type scale, motion)
- [ ] Import Google Fonts (Fraunces, Inter, Noto Nastaliq Urdu)
- [ ] Create `frontend/lib/theme.ts` with token-to-Tailwind mapping (if using Tailwind)
- [ ] Test dark mode on both explicit theme and system preference
- [ ] Verify no cool grays anywhere in UI

### Phase 2: Navigation & Layout (Week 1)

- [ ] Build left rail nav component (`frontend/components/SidebarNav.tsx`)
- [ ] Update `frontend/app/layout.tsx` to include sidebar
- [ ] Update all page layouts to add `margin-left: 80px` (desktop) / 0 (mobile)
- [ ] Update mobile nav from bottom to horizontal strip (60px height, flex)
- [ ] Test responsive breakpoint at 768px

### Phase 3: Landing Page (Week 2)

- [ ] Replace current landing with chapter-based long-scroll structure
- [ ] Implement scroll-triggered fade-in animations
- [ ] Add hero headline stagger animation (Urdu + English)
- [ ] Remove all card grids / bulleted lists
- [ ] Add custom illustrations (or emoji placeholders for MVP)
- [ ] Test on mobile (should stack to single column)

### Phase 4: Chat Screen (Week 2)

- [ ] Update chat layout to two-column desktop (message + sidebar)
- [ ] Sidebar widgets: comfort mode, mood, patterns
- [ ] Message bubbles: orange-100 for user, beige-200 for assistant
- [ ] Update font family for messages (16px Inter)
- [ ] Add message fade-in animation

### Phase 5: Safety Plan Builder (Week 2)

- [ ] Implement notebook metaphor (left border, spine lines)
- [ ] Four sections: warning signs, coping, people, reasons to stay
- [ ] Dashed-border textareas (no form wizard)
- [ ] "Export as PDF" button
- [ ] Test on mobile (notebook should stack to single column)

### Phase 6: Resources Page (Week 3)

- [ ] Implement map-and-pins visual (SVG or emoji + absolute positioned pins)
- [ ] Animated pins (pulse effect, staggered)
- [ ] Resource list cards with left orange border
- [ ] Hover lift effect on cards
- [ ] Filter by region/language

### Phase 7: Mood Trends (Week 3)

- [ ] Ambient line chart (SVG, no Recharts card wrapper)
- [ ] Gradient line (terracotta → gold → terracotta)
- [ ] Pattern insight box (green accent, reserved for insights only)
- [ ] 7-day data points with soft animation on load

### Phase 8: Crisis Mode (Week 3)

- [ ] Full-screen background (`--umeed-crisis-600`)
- [ ] White text, oversized phone numbers
- [ ] Tap targets ≥ 48px
- [ ] Two buttons: "Talk to a Counselor" (white), "Back to Safety" (outlined)
- [ ] Test on mobile (should remain full-screen, oversized)

### Phase 9: QA & Polish (Week 4)

- [ ] [ ] Test dark mode across all screens
- [ ] [ ] Test reduced-motion on animations
- [ ] [ ] Verify all copy is bilingual with translations
- [ ] [ ] Test responsive breakpoints (mobile, tablet, desktop)
- [ ] [ ] Check that no semantic colors appear outside their designated role (crisis red, pattern green)
- [ ] [ ] Manual accessibility audit (color contrast, keyboard nav, screen reader)
- [ ] [ ] Test crisis detection workflow end-to-end

---

## 9. Tailwind Configuration (If Using Tailwind)

If your project uses Tailwind, extend `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        umeed: {
          'orange-500': '#F46B1F',
          'orange-700': '#C4491A',
          'orange-100': '#FDE3CE',
          'beige-50': '#FBF3E7',
          'beige-200': '#F2E4D0',
          'ink-900': '#3A2A1C',
          'ink-500': '#8C765F',
          'green-600': '#3F7D4E',
          'crisis-600': '#C0392B',
        },
      },
      fontSize: {
        caption: '13px',
        body: '16px',
        lead: '20px',
        section: '28px',
        heading: '44px',
        hero: '64px',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        nastaliq: ['Noto Nastaliq Urdu', 'serif'],
      },
      transitionTimingFunction: {
        umeed: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
};
```

Then use in components:
```jsx
<h1 className="font-display text-hero text-umeed-ink-900">امید</h1>
<button className="bg-umeed-orange-500 hover:bg-umeed-orange-700 transition-all duration-300 ease-umeed">Send</button>
```

---

## 10. Files to Create / Modify

### New Files
- `frontend/components/SidebarNav.tsx` — Left navigation component
- `frontend/lib/design-tokens.ts` — Token exports (for non-CSS uses)
- `DESIGN_SYSTEM.md` — This doc
- Design artifacts (published at design review links)

### Files to Modify
- `frontend/app/layout.tsx` — Add sidebar, update fonts
- `frontend/app/globals.css` — Add token variables, typography
- `frontend/app/page.tsx` — Rewrite landing as chapters
- `frontend/app/chat/page.tsx` — Two-column layout
- `frontend/app/safety-plan/builder/page.tsx` — Notebook metaphor
- `frontend/app/resources/page.tsx` — Map & pins
- `frontend/app/mood/page.tsx` or similar — Ambient gradient chart
- `frontend/tailwind.config.js` — Token mappings (if using Tailwind)

### No Changes Needed (Preserve Existing Logic)
- Backend API endpoints — no breaking changes
- Crisis detection logic — reuse as-is
- Database schema — no changes
- Environment variables — no new ones needed

---

## 11. Migration Strategy (Zero Downtime)

### Step 1: Deploy tokens & theme (backwards compatible)
Add CSS variables to globals.css alongside old colors. Existing components still work.

### Step 2: Deploy new navigation sidebar
New component wraps all pages. Old nav elements can coexist temporarily.

### Step 3: Replace screens one at a time
Each screen migrated individually. Old screens removed as new ones are merged.

### Step 4: Remove old design
Once all screens migrated, delete old color variables, unused components, old fonts.

**Timeline:** 4 weeks for full rollout, can be phased per your release cadence.

---

## 12. Visual Design Artifacts

Three interactive design artifacts created for reference:

1. **Design System** — https://claude.ai/code/artifact/c9575840-3a9f-4f98-a2a0-85f17fa2dbc6
   - Color tokens, typography scale, logo concepts, component patterns

2. **Landing Page** — https://claude.ai/code/artifact/5cbeb4fb-a553-4da1-ab0a-8fade92fcbda
   - Chapter-based long-scroll home with all six features

3. **App Screens** — https://claude.ai/code/artifact/924aa796-14b6-4404-90f9-d98f235ff6dc
   - Chat, safety plan builder, resources, mood trends, crisis mode

Use these as high-fidelity reference while implementing.

---

## 13. FAQ & Troubleshooting

**Q: Can we use different fonts?**  
A: No. Fraunces (display), Inter (body), Noto Nastaliq Urdu (Urdu script) are core to the identity. Substitutes will break the warmth.

**Q: Why no cool grays?**  
A: Every neutral carries a warm (orange/brown) undertone. This is what makes it feel designed rather than templated. It's the secret sauce.

**Q: What about the old coral/blush colors?**  
A: Remove them completely. They're part of the generic template we're moving away from.

**Q: Do we need to re-engineer the crisis detection?**  
A: No. Crisis mode is a *visual* redesign only. The server-side logic stays the same.

**Q: Can we add new accent colors?**  
A: No. If you need a new color, reconsider the layout or semantic intent. The palette is intentionally small.

**Q: Mobile-first or desktop-first?**  
A: Desktop-first design (left rail nav), but always test mobile responsiveness. Navigation collapses to horizontal strip, layouts stack to single column.

---

## 14. Next Steps

1. **Review** these three artifacts with your design & dev team
2. **Clarify** any questions (respond in CLAUDE.md)
3. **Pick logo direction** (recommend Direction A: Cup of Hope)
4. **Phase 1 implementation** — tokens, fonts, sidebar (1 week)
5. **Phase 2 implementation** — landing, chat, safety plan (2 weeks)
6. **QA & testing** (1 week)
7. **Launch** 🌅

---

**Questions?** Check the design artifacts or update CLAUDE.md with feedback.

**Last updated:** 2026-08-27
