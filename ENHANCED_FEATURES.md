# Enhanced Features Plan - Umeed (Living, Personalized AI)

## Overview

This document outlines the 6 enhanced features that transform the app from a functional chatbot into a **living, evolving companion** that learns, adapts, and feels personalized to each user's unique moment and context.

**Core Philosophy:** The app should feel *alive* — noticing patterns, remembering preferences, and adapting in real-time — while respecting privacy and never feeling intrusive.

---

# Feature 1: Living, Evolving Profile (Pattern Learning)

## Description
Instead of static onboarding preferences, Umeed quietly learns from conversations and notices patterns over time.

### How It Works

**Pattern Detection (Silent, Non-intrusive):**
- After 5+ messages in a conversation, Claude identifies 1-2 subtle patterns
- Examples:
  - "You've mentioned exams three times this week"
  - "You tend to feel worse on Sunday nights"
  - "You often mention your sister when talking about support"
  - "Work stress seems to spike around deadline time"

**Gentle Pattern Reflection:**
Claude surfaces pattern once, gently, mid-conversation:
```
Umeed: "I've noticed exams come up a lot lately — want to talk about that, 
or would it help to just vent?"
```

**Storage & Decay:**
- Store detected patterns in `user_patterns` table
- Each pattern has: `pattern_text`, `confidence` (0-1), `first_detected`, `last_mentioned`
- Patterns fade over time (2-week decay) to stay current
- Max 10 active patterns per user (prevents clutter)

### Implementation Details

**Database Changes:**
```sql
CREATE TABLE user_patterns (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pattern_text TEXT NOT NULL,          -- "exams come up frequently"
  pattern_type TEXT,                    -- "recurring_topic", "emotional_cycle", "coping_behavior"
  confidence REAL,                      -- 0-1 confidence score
  evidence TEXT,                        -- JSON array of quote examples
  first_detected TIMESTAMP,
  last_mentioned TIMESTAMP,
  frequency INT,                        -- How many times pattern detected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Backend Changes:**
1. Create `backend/src/services/patternDetectionService.ts`
   - Analyze conversation history for patterns
   - Run after every 5th message
   - Return 1-2 high-confidence patterns

2. Update `backend/src/config/systemPrompt.ts`
   - Add section: "LEARNED PATTERNS"
   - Include active patterns if available
   - Instruct Claude to reference patterns gently

3. Create `backend/src/db/operations/patterns.ts`
   - `savePattern()` — store detected pattern
   - `getActivePatterns()` — retrieve for system prompt
   - `decayOldPatterns()` — fade old patterns

**API Changes:**
- POST `/chat` — already handles this, just stores patterns
- GET `/patterns/:userId` — retrieve active patterns (for debugging)

**Frontend Changes:**
- No visible UI change needed
- Patterns are embedded in Claude's responses naturally

### Example Implementation

**Pattern Detection Logic:**
```typescript
// backend/src/services/patternDetectionService.ts
export async function detectPatterns(
  userId: string,
  recentMessages: ChatMessage[]
): Promise<Pattern[]> {
  // Only run every 5+ messages
  if (recentMessages.length % 5 !== 0) return [];
  
  // Ask Claude to identify patterns in conversation
  const prompt = `Analyze these recent messages from the user. 
  Identify 1-2 recurring topics, emotional patterns, or behaviors.
  Be subtle and gentle. Return JSON:
  [
    {
      pattern: "string describing pattern",
      type: "recurring_topic" | "emotional_cycle" | "coping_behavior",
      confidence: 0.9,
      examples: ["quote1", "quote2"]
    }
  ]`;
  
  const response = await claudeService.sendMessage(prompt, {
    conversationHistory: recentMessages,
    maxTokens: 300
  });
  
  // Parse and store patterns
  const patterns = JSON.parse(response);
  for (const pattern of patterns) {
    db.prepare(`
      INSERT INTO user_patterns (...)
      VALUES (...)
    `).run(...);
  }
  
  return patterns;
}
```

**Claude Integration:**
```typescript
// When building system prompt, include patterns
export function buildSystemPrompt(preferences?: UserPreferences, patterns?: Pattern[]): string {
  let prompt = basePrompt;
  
  if (patterns && patterns.length > 0) {
    prompt += `\nLEARNED PATTERNS ABOUT THIS USER:\n`;
    patterns.forEach(p => {
      prompt += `- ${p.pattern_text} (confidence: ${p.confidence})\n`;
    });
    prompt += `\nGently reference these patterns if relevant, but don't force it. 
    They should surface naturally in conversation.`;
  }
  
  return prompt;
}
```

### Testing
- [ ] Patterns detected after 5+ messages
- [ ] Patterns are accurate and non-intrusive
- [ ] Patterns don't feel invasive or creepy
- [ ] Old patterns decay after 2 weeks
- [ ] Max 10 patterns maintained
- [ ] Claude references patterns naturally

### Timeline Integration
**Best fit:** Day 3-4 (add pattern detection to Claude integration)  
**Effort:** 4-6 hours  
**Priority:** HIGH (core "wow" feature)

---

# Feature 2: Culturally-Flavored Coping Suggestions

## Description
Instead of generic advice ("try deep breathing"), coping suggestions are specific and textured based on user's stated preferences and detected patterns.

### How It Works

**Generic → Specific:**
- ❌ Generic: "Consider talking to a trusted family member"
- ✅ Specific: "Maybe make chai and sit with your mom for ten minutes before saying anything"

- ❌ Generic: "Try deep breathing or meditation"
- ✅ Specific: "Take a walk in your neighborhood like you mentioned before, or put on the music you played last week"

**Data-Driven Specificity:**
1. Pull user's stated preferences (family-centered, professional, solo, etc.)
2. Pull detected patterns (what they've mentioned working in past)
3. Pull cultural context (if shared)
4. Claude generates 2-3 ultra-specific suggestions tailored to them

### Implementation Details

**Claude System Prompt Addition:**
```
WHEN SUGGESTING COPING STRATEGIES:
- Do NOT suggest generic strategies like "deep breathing" or "talk to someone"
- Instead, reference specific things THIS USER has mentioned or indicated they like
- Examples based on their data:
  * User mentioned their mom's chai → "Make chai like your mom makes it"
  * User said they like walking → "Walk that favorite route you mentioned"
  * User indicated family support → "Sit with someone close, no pressure to talk"
- Be specific, warm, and personal
- Each suggestion should feel like you KNOW this person
```

**Backend Changes:**
1. Enhance `claudeService.ts` to include:
   - User preferences
   - Active patterns
   - Past successful coping strategies (from safety plan)
   - Recent conversation context

2. Coping suggestion API:
   ```typescript
   export async function generateCopingSuggestions(
     userId: string,
     currentSituation: string
   ): Promise<string[]> {
     const preferences = await getPreferences(userId);
     const patterns = await getActivePatterns(userId);
     const safetyPlan = await getSafetyPlan(userId);
     
     const prompt = `User is experiencing: "${currentSituation}"
     Their preferences: ${preferences}
     Patterns you've noticed: ${patterns}
     They've found helpful before: ${safetyPlan.copingStrategies}
     
     Suggest 2-3 specific, personalized coping strategies. 
     Be warm, specific, and reference things they've told you.`;
     
     const suggestions = await claudeService.sendMessage(prompt);
     return parseStrategies(suggestions);
   }
   ```

### Frontend Changes
- Display coping suggestions naturally in chat (not as separate UI)
- Example: "Something that might help right now: maybe make chai like your mom does, or take a walk in your neighborhood like you mentioned last week"

### Testing
- [ ] Suggestions are specific, not generic
- [ ] Suggestions reference user's actual preferences
- [ ] Suggestions feel warm and personal
- [ ] Suggestions are actionable
- [ ] A/B test: specific vs generic (specific should rank higher in user satisfaction)

### Timeline Integration
**Best fit:** Day 2-3 (integrate into Claude system prompt)  
**Effort:** 2-3 hours  
**Priority:** MEDIUM (high impact, low effort)

---

# Feature 3: Comfort Mode Picker (Session-Level Tone)

## Description
Let users pick a tone/mode for *this chat session*, not just onboarding preferences. Modes: "Just listen," "Help me problem-solve," "Distract me," "Guide me through safety plan."

### How It Works

**UI: Comfort Mode Buttons**
At the top of chat, soft buttons:
```
┌─────────────────────────────────────────────┐
│ How can I help you right now?               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │ 🎧       │ │ 🧠       │ │ 😊       │ ... │
│ │ Just     │ │ Help me  │ │ Distract │     │
│ │ listen   │ │ problem- │ │ me       │     │
│ │          │ │ solve    │ │          │     │
│ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────┘
```

**Modes:**
1. **🎧 Just Listen** — Pure empathetic listening, minimal suggestions
2. **🧠 Help Me Problem-Solve** — Collaborative brainstorming, action-oriented
3. **😊 Distract Me** — Light conversation, redirect to positive topics
4. **📋 Guide Me** — Walk through safety plan, coping strategies

**System Prompt Adaptation:**
Each mode changes Claude's approach:
```
if mode === "just_listen":
  prompt += "Focus on empathetic listening. Reflect back what you hear. 
  Minimal suggestions unless asked."

if mode === "problem_solve":
  prompt += "Help them brainstorm solutions. Ask clarifying questions. 
  Suggest concrete next steps."

if mode === "distract":
  prompt += "Keep the conversation light and engaging. 
  Gently redirect to positive topics when appropriate. 
  Maybe ask about their interests, hobbies, favorite music."

if mode === "guide":
  prompt += "Help them work through their safety plan step by step. 
  Ask about warning signs, coping strategies, trusted contacts."
```

### Implementation Details

**Database Changes:**
```sql
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  comfort_mode TEXT,               -- "just_listen", "problem_solve", "distract", "guide"
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  message_count INT DEFAULT 0
);
```

**Backend Changes:**
1. Update `POST /chat` endpoint:
   ```typescript
   interface ChatRequest {
     message: string;
     userId: string;
     comfortMode?: 'just_listen' | 'problem_solve' | 'distract' | 'guide';
     sessionId?: string;
   }
   ```

2. Create session on first message (or receive sessionId)
3. Pass comfortMode to system prompt

**Frontend Changes:**
1. Add comfort mode selector to chat page
   ```typescript
   <div className="flex gap-2 mb-4">
     {COMFORT_MODES.map(mode => (
       <button
         key={mode.id}
         onClick={() => setComfortMode(mode.id)}
         className={`px-4 py-2 rounded-lg transition ${
           comfortMode === mode.id
             ? 'bg-accent-500 text-white'
             : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
         }`}
       >
         {mode.emoji} {mode.label}
       </button>
     ))}
   </div>
   ```

2. Send comfortMode with every message

3. Visual indicator showing current mode

### Testing
- [ ] Mode buttons appear at top of chat
- [ ] Selecting mode changes Claude's responses
- [ ] "Just listen" mode is empathetic, not action-oriented
- [ ] "Problem-solve" mode generates solutions
- [ ] "Distract" mode keeps conversation light
- [ ] "Guide" mode walks through safety plan
- [ ] Mode can be changed mid-conversation

### Timeline Integration
**Best fit:** Day 2 (integrate into chat API)  
**Effort:** 3-4 hours  
**Priority:** HIGH (small feature, huge impact on "feels alive")

---

# Feature 4: Mood Check-In with Visual Trend

## Description
A tiny daily mood tap-in (emoji or 1-5 scale) that builds a visual trend line over the week. No data hoarding, just "here's how you've been."

### How It Works

**Daily Mood Check-In:**
- Unobtrusive modal on first chat of the day: "How's your mood today?"
- 5 emoji options: 😢 😞 😐 🙂 😊 (or 1-5 scale)
- Takes 2 seconds, totally optional
- Stores in database

**Visual Trend (Private, No Sharing):**
- Page: `/mood-trend` (accessible from chat)
- Shows 7-day line chart with soft, warm colors
- No judgement, just a reflection
- Helps user see patterns ("I'm usually worse on Mondays")
- Ties into pattern detection (system prompt references this)

**Data Privacy:**
- Only stored locally (not shared)
- Can be deleted anytime
- No analytics or tracking
- User sees their own data only

### Implementation Details

**Database Changes:**
```sql
CREATE TABLE mood_checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mood_score INT CHECK (mood_score BETWEEN 1 AND 5),
  mood_emoji TEXT,                   -- "😢", "😐", "😊"
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT                         -- Optional: why they picked that mood
);

CREATE INDEX idx_mood_by_user_date ON mood_checkins(user_id, DATE(timestamp));
```

**Backend API:**
1. POST `/mood/checkin`
   ```typescript
   {
     "userId": "user-123",
     "moodScore": 4,
     "moodEmoji": "🙂",
     "notes": "feeling better today"
   }
   ```

2. GET `/mood/trend/:userId?days=7`
   ```typescript
   {
     "data": [
       {"date": "2026-08-21", "mood": 3, "emoji": "😞"},
       {"date": "2026-08-22", "mood": 4, "emoji": "🙂"},
       ...
     ],
     "average": 3.5,
     "trend": "improving" | "declining" | "stable"
   }
   ```

**Frontend Changes:**

1. Mood check-in modal (shows once per day)
   ```typescript
   <MoodCheckinModal
     isOpen={shouldShowMoodCheckin}
     onSubmit={(mood) => {
       submitMoodCheckin(mood);
       setMoodCheckinShown(true);
     }}
   />
   ```

2. Mood trend page
   ```typescript
   // frontend/app/mood/page.tsx
   export default function MoodTrendPage() {
     const [data, setData] = useState<MoodData[]>([]);
     
     useEffect(() => {
       const trend = await getMoodTrend(userId, 7);
       setData(trend.data);
     }, [userId]);
     
     return (
       <div>
         <h1>Your Week in Mood</h1>
         <LineChart data={data} />
         <p>Average: {calculateAverage(data)}</p>
         <p>Trend: {data.trend}</p>
       </div>
     );
   }
   ```

3. Link from chat page to mood trend

**Chart Library:**
- Use `recharts` (already in dependencies) for simple line chart
- Soft colors: primary color palette for line, light background

### Testing
- [ ] Mood check-in appears once per day
- [ ] Can submit mood with emoji or score
- [ ] Mood data saves to database
- [ ] Trend page shows 7-day chart
- [ ] Chart updates with new entries
- [ ] Average mood calculated correctly
- [ ] User can view own data only

### Timeline Integration
**Best fit:** Day 5 (not critical path, can add after safety plan)  
**Effort:** 4-5 hours  
**Priority:** MEDIUM (nice-to-have, demo-friendly)

---

# Feature 5: Personalized Safety Plan Prompts (AI Co-Authoring)

## Description
Instead of blank "list your coping strategies" fields, Umeed suggests draft entries based on what came up in chat, making the safety plan feel co-written.

### How It Works

**Smart Suggestions:**
1. User navigates to safety plan builder
2. Umeed analyzes their chat history (with permission)
3. Pre-fills fields with suggestions:
   - **Warning Signs:** "You mentioned feeling withdrawn and not sleeping well"
   - **Coping Strategies:** "You said taking a walk helps, or spending time with your sister"
   - **Trusted Contacts:** "You've mentioned your mom and your best friend several times"
   - **Reasons to Stay:** "You've talked about wanting to see your nephew graduate, and how much your kids depend on you"

4. User sees suggestions, can accept/edit/delete
5. Feels collaborative, not intrusive

### Implementation Details

**Backend Service:**
```typescript
// backend/src/services/safetyPlanService.ts
export async function generateSafetyPlanDraft(
  userId: string,
  chatHistory: ChatMessage[]
): Promise<SafetyPlanDraft> {
  const prompt = `Based on this person's recent conversations, 
  suggest entries for their safety plan.
  
  Chat history: ${chatHistory.slice(-30).map(m => m.content).join('\n')}
  
  Return JSON:
  {
    warningSigns: ["sign1", "sign2"],
    copingStrategies: ["strategy1", "strategy2"],
    trustedContacts: [{name, relationship}, ...],
    reasonsToStaySafe: ["reason1", "reason2"]
  }`;
  
  const suggestions = await claudeService.sendMessage(prompt);
  return JSON.parse(suggestions);
}
```

**Frontend Changes:**

1. Add "Load from chats" button in safety plan builder
   ```typescript
   <button onClick={handleLoadFromChats}>
     💡 Load suggestions from our chats
   </button>
   ```

2. When clicked, fetch suggestions and pre-fill fields
   ```typescript
   const handleLoadFromChats = async () => {
     const draft = await generateSafetyPlanDraft(userId);
     // Fill form fields with draft values
     setWarningSigns([...draft.warningSigns]);
     setCopingStrategies([...draft.copingStrategies]);
     // etc.
   };
   ```

3. User can edit/delete/add more before saving

### Testing
- [ ] Suggestions are accurate and relevant
- [ ] Suggestions don't include personal data inappropriately
- [ ] User can edit suggestions
- [ ] User can delete suggestions they don't like
- [ ] Saved plan includes edited suggestions
- [ ] Feature is optional (user can still fill blank form)

### Timeline Integration
**Best fit:** Day 5 (integrate with safety plan builder)  
**Effort:** 3-4 hours  
**Priority:** MEDIUM (enhances existing feature)

---

# Feature 6: "Someone Like Me" Resource Nudge

## Description
When showing resources, lead with ones tagged for relevant context the user opted into sharing, filtered by their preferences — so it doesn't feel like a generic phone-number list.

### How It Works

**Smart Resource Filtering:**
1. User's preferences: "family_community" support style, mentioned they're a student
2. Resources tagged with: `contexts: ["student", "south_asian", "young_adult"]`
3. System leads with resources matching their contexts
4. Non-intrusive: "Resources for people in situations like yours"

**Example:**
- Generic: Shows all 13 resources, user scrolls to find relevant one
- Smart: "Here are resources made by and for young adults like you" (shows 3 relevant), then "Other resources available" (shows remaining 10)

### Implementation Details

**Database Changes:**
```sql
-- Add to crisis_resources table:
ALTER TABLE crisis_resources ADD COLUMN contexts TEXT; -- JSON array
-- Example: ["student", "lgbtq", "south_asian", "working_parent", "young_adult"]
-- Example: ["low_income", "remote_accessible", "spanish_language"]

-- Add to user_preferences:
ALTER TABLE user_preferences ADD COLUMN contexts TEXT; -- JSON array
-- What user has shared about themselves (optional)
```

**Resource Data Enhancement:**
```json
{
  "id": "us-thotline",
  "name": "Trans Lifeline",
  "type": "crisis_hotline",
  "region": "north-america",
  "country": "United States",
  "phone": "877-565-8860",
  "contexts": ["lgbtq", "trans", "young_adult"],
  "languages": ["en"],
  "availability": "24/7"
}
```

**Backend Changes:**
```typescript
// Enhanced /resources endpoint
export async function listResources(req, res) {
  const { userId, region, type } = req.query;
  
  let userContexts = [];
  if (userId) {
    const prefs = await getUserPreferences(userId);
    userContexts = JSON.parse(prefs.contexts || '[]');
  }
  
  // Query with context matching
  let resources = db.prepare(`SELECT * FROM crisis_resources WHERE ...`).all();
  
  // Sort: matching contexts first, then others
  const matched = resources.filter(r => 
    JSON.parse(r.contexts || '[]').some(c => userContexts.includes(c))
  );
  const others = resources.filter(r =>
    !JSON.parse(r.contexts || '[]').some(c => userContexts.includes(c))
  );
  
  res.json({
    matched: {
      label: "Resources for people like you",
      resources: matched
    },
    other: {
      label: "Other resources available",
      resources: others
    }
  });
}
```

**Frontend Changes:**
```typescript
// frontend/app/resources/page.tsx
<div>
  {matched.resources.length > 0 && (
    <section>
      <h2 className="text-lg font-bold text-primary-900 mb-4">
        💜 Resources for people like you
      </h2>
      <div className="space-y-3">
        {matched.resources.map(r => <ResourceCard key={r.id} resource={r} />)}
      </div>
    </section>
  )}
  
  <section>
    <h2 className="text-lg font-bold text-gray-900 mb-4">
      Other resources available
    </h2>
    <div className="space-y-3">
      {other.resources.map(r => <ResourceCard key={r.id} resource={r} />)}
    </div>
  </section>
</div>
```

### Testing
- [ ] Matching resources appear first
- [ ] Non-intrusive messaging
- [ ] Filters still work (region, type)
- [ ] User with no contexts sees all resources equally
- [ ] Contexts are never inferred (only user-stated)

### Timeline Integration
**Best fit:** Day 6 (integrate with resources directory)  
**Effort:** 2-3 hours  
**Priority:** MEDIUM (enhances UX, good for demo)

---

# Feature 7: Urdu/Roman English Language Support

## Description
Allow users to communicate in Roman Urdu (Urdu written in Latin characters) or English, with system prompt and responses adapted accordingly.

### How It Works

**Language Options:**
- English
- Urdu (Native script: اردو)
- Roman Urdu (Latin script: Urdu written as "Mujhe bilkul samajh ayaa" instead of "مجھے بالکل سمجھ آیا")

**User Can:**
- Switch language at any point in chat
- Chat in Roman Urdu without special keyboard
- Receive responses in chosen language
- Safety plan and resources in their preferred language

### Implementation Details

**Frontend Changes:**

1. Add language picker to chat page
   ```typescript
   const LANGUAGES_SUPPORTED = [
     { code: 'en', label: 'English', flag: '🇺🇸' },
     { code: 'ur', label: 'اردو (Urdu)', flag: '🇵🇰' },
     { code: 'ur-x-roman', label: 'Roman Urdu', flag: '🇵🇰' }
   ];
   ```

2. Language selector in chat header
   ```typescript
   <select value={chatLanguage} onChange={(e) => setChatLanguage(e.target.value)}>
     {LANGUAGES_SUPPORTED.map(lang => (
       <option key={lang.code} value={lang.code}>
         {lang.label}
       </option>
     ))}
   </select>
   ```

3. Include language preference in every message

**Backend Changes:**

1. Update system prompt to support languages
   ```typescript
   export function buildSystemPrompt(
     preferences?: UserPreferences,
     patterns?: Pattern[],
     language?: string
   ): string {
     let prompt = basePrompt;
     
     if (language === 'ur') {
       prompt += `\nYou are speaking in اردو (Urdu). 
       Respond warmly and naturally in Urdu script.`;
     } else if (language === 'ur-x-roman') {
       prompt += `\nYou are speaking in Roman Urdu 
       (Urdu written in Latin characters, like "Mujhe kuch samajh nahi ayaa").
       Respond warmly and naturally in Roman Urdu script.`;
     }
     
     return prompt;
   }
   ```

2. Claude API handles language translation automatically
   - Claude is multilingual
   - Send Roman Urdu, it understands and responds in Roman Urdu
   - Send Urdu script, it responds in Urdu script

3. Store language preference
   ```typescript
   ALTER TABLE user_preferences ADD COLUMN preferred_language TEXT DEFAULT 'en';
   ```

**Testing:**
- [ ] Can switch to Roman Urdu in chat
- [ ] Claude responds in Roman Urdu
- [ ] Crisis messages in Roman Urdu still trigger alerts
- [ ] Safety plan saves in preferred language
- [ ] Resources displayed in preferred language (if available)

### Considerations

**Roman Urdu Challenges:**
- No standardized spelling (Urdu in Latin = many variations)
- Claude may sometimes correct spelling subtly
- Solution: System prompt includes note: "User may write in Roman Urdu with variable spelling — respond naturally without correcting."

**Resources:**
- Many crisis hotlines don't have Urdu speakers
- System prompt should note: "Recommend English-speaking or multilingual resources if available"
- Tag resources with languages supported

### Timeline Integration
**Best fit:** Day 2 (add to system prompt) + Day 6 (UI for language picker)  
**Effort:** 2-3 hours total  
**Priority:** MEDIUM (cultural inclusivity, appeals to South Asian users)

---

# Updated Implementation Timeline

## New Total: 7 Days + 1 Buffer Day (8 days)

### Day 1: Chat API & Basic UI (8 hours)
- Phase 1.1: Backend chat endpoint ✅
- Phase 1.3: Frontend chat UI ✅
- **NEW:** Add comfort mode picker UI (1 hr)

### Day 2: Database, Onboarding, Language Support (8 hours)
- Phase 1.4: Database setup ✅
- Phase 1.5: Onboarding API ✅
- Phase 1.6: Frontend integration ✅
- **NEW:** Add language support (1-2 hrs)
- **NEW:** Add language selector to chat (1 hr)

### Day 3: System Prompt & Pattern Detection (16 hours)
- Phase 2.1-2.4: System prompt refinement ✅
- **NEW:** Pattern detection service (3-4 hrs)
- **NEW:** Culturally-flavored coping suggestions (2 hrs)
- **NEW:** Comfort mode in system prompt (1 hr)

### Day 4: Crisis Detection (20 hours)
- Phase 3.1-3.6: Crisis detection ✅

### Day 5: Safety Plan + Mood Tracking (18 hours)
- Phase 4.1-4.4: Safety plan builder ✅
- **NEW:** Mood check-in API (2 hrs)
- **NEW:** Mood trend page UI (3 hrs)
- **NEW:** AI-suggested safety plan entries (2 hrs)

### Day 6: Resources + Smart Filtering (14 hours)
- Phase 5.1-5.4: Resources directory ✅
- **NEW:** "Someone like me" filtering (2-3 hrs)

### Day 7: Testing & Polish (12 hours)
- Phase 6.1-6.6: Testing, deployment ✅

### Day 8 (Buffer): Final Polish & Demo (8 hours)
- Final bug fixes
- Demo preparation
- Feature fine-tuning

---

# Feature Priority Matrix

| Feature | Impact | Effort | Priority | Timeline |
|---------|--------|--------|----------|----------|
| Comfort Mode | ⭐⭐⭐ HIGH | ⭐ LOW | 1 (Must Have) | Day 1-2 |
| Pattern Learning | ⭐⭐⭐ HIGH | ⭐⭐ MED | 2 (Must Have) | Day 3 |
| Mood Trend | ⭐⭐ MED | ⭐⭐ MED | 3 (Nice) | Day 5 |
| Culturally-Flavored Coping | ⭐⭐⭐ HIGH | ⭐ LOW | 2 (Must Have) | Day 2-3 |
| AI Safety Plan Prompts | ⭐⭐ MED | ⭐⭐ MED | 4 (Nice) | Day 5 |
| "Someone Like Me" Resources | ⭐⭐ MED | ⭐ LOW | 5 (Polish) | Day 6 |
| Urdu/Roman English | ⭐⭐ MED | ⭐ LOW | 6 (Polish) | Day 2,6 |

---

# Demo Script (Updated)

## 5-Minute Demo Walkthrough

**1. Welcome & Onboarding (30 sec)**
- Show landing page
- Walk through onboarding: "I prefer family support" + "I speak Roman Urdu sometimes"

**2. Chat with Comfort Mode (1 min)**
- Show chat page with **new** comfort mode buttons
- Select "Just listen"
- Send: "I've been feeling really down about exams"
- Show Claude's empathetic response
- Mention: "Notice how specific the suggestions are? It's based on what you told me."

**3. Pattern Detection (30 sec)**
- After a few messages, Claude gently notices: "I've noticed exams come up a lot — want to talk about that?"
- Explain: "The app learns and adapts over time"

**4. Comfort Mode Switch (30 sec)**
- Switch to "Help me problem-solve"
- Send same concern
- Show different, action-oriented response
- Highlight: "Same situation, different mode = different support"

**5. Mood Trend (30 sec)**
- Check in mood (emoji)
- Quick glance at mood trend page: "Here's how you've been this week"

**6. Safety Plan with AI Suggestions (1 min)**
- Click "Build Safety Plan"
- Click "Load suggestions from chats"
- Show AI-generated draft entries
- Edit one: "Yes, I love chai with my mom"
- Show final plan
- Export PDF (1 sec)

**7. Resources (30 sec)**
- Show resources page
- Top section: "Resources for people like you" (matched contexts)
- Bottom: "Other resources available"
- Click phone number (shows tel: link)

**8. Closing (30 sec)**
- "This app is designed to be alive, not robotic"
- "It learns, adapts, and feels personal"
- "And it keeps you safe with crisis detection working behind the scenes"

**Total:** 5-6 minutes

---

# Success Metrics

| Feature | Success Metric |
|---------|----------------|
| Comfort Mode | Users switch modes mid-conversation (engagement signal) |
| Pattern Detection | Users feel "understood" (qualitative feedback) |
| Mood Trend | Users check trend page (engagement signal) |
| Culturally-Flavored Suggestions | Suggestions rated more helpful than generic (A/B test) |
| AI Safety Plan Prompts | 70%+ of suggestions accepted/edited (not ignored) |
| "Someone Like Me" Resources | Matched resources clicked 30% more (engagement) |
| Urdu Support | Roman Urdu users engage for longer sessions |

---

# Technical Debt & Future Work

Not included in this build (post-hackathon):
- [ ] Real multilingual resources (most hotlines are English)
- [ ] Authentication (public now)
- [ ] Chat history persistence (currently transient)
- [ ] Predictive crisis alerts (based on mood trend + pattern detection)
- [ ] Export patterns as insights (user-initiated)
- [ ] Shared safety plans (with trusted contacts)
- [ ] Integration with actual therapist scheduling platforms
- [ ] Mobile app (native iOS/Android)

---

# Risk Mitigation for Enhanced Features

| Risk | Mitigation |
|------|-----------|
| Pattern learning feels creepy | Make it optional, easy to opt-out, transparent about what's learned |
| Too many modes overwhelm user | Start with 4 core modes, can add more later |
| Mood tracking becomes anxiety trigger | Frame as "just for you," optional, no judgement |
| AI suggestions are off-target | User can edit/delete, always optional |
| Language support is incomplete | Start with English + Roman Urdu, add Urdu script in v2 |

---

## Conclusion

These 6 features transform Umeed from a functional chatbot into a **living, personalized companion** that:
- ✅ Learns and adapts over time
- ✅ Remembers what works for this specific person
- ✅ Feels warm and culturally sensitive
- ✅ Adapts in real-time based on mood and need
- ✅ Respects privacy and autonomy
- ✅ Speaks the user's language

**Estimated total effort:** 20-25 hours over 7 days (distributed evenly)  
**Recommended approach:** Implement in priority order; cut lower-priority items if time runs short  
**Demo impact:** These features make the 5-minute demo memorable and compelling
