# Integrated Implementation Plan with Enhanced Features

## Overview

This document maps the 6 enhanced features into the existing 7-day implementation plan, showing exactly where each feature is built and tested.

---

# Phase 1: Foundation & Core API + Comfort Mode (Days 1-2, ~30 hours)

## Day 1: Chat API & Comfort Mode UI (8 hours)

### Phase 1.1: Backend Chat Endpoint (4 hours)
✅ **No changes** — Chat endpoint unchanged
- POST `/chat` accepts message, userId, preferences
- Returns message, isCrisis, resources

### NEW Phase 1.1B: Add Comfort Mode Support (1 hour)
**New Feature:** Comfort Mode Picker

**Tasks:**
1. Update ChatRequest type to include comfortMode
   ```typescript
   interface ChatRequest {
     message: string;
     userId: string;
     preferences?: UserPreferences;
     comfortMode?: 'just_listen' | 'problem_solve' | 'distract' | 'guide';
     sessionId?: string;
   }
   ```

2. Create `backend/src/db/models/chatSessions.ts`
   ```sql
   CREATE TABLE chat_sessions (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     comfort_mode TEXT,
     started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     ended_at TIMESTAMP,
     message_count INT DEFAULT 0
   );
   ```

3. Create session on first message

**Testing:**
- [ ] Can send message with comfortMode parameter
- [ ] Session created in database

**Deliverable:** Comfort mode data structure ready

---

### Phase 1.3: Frontend Chat UI + Comfort Mode Buttons (3 hours)

**Part A (existing):** Wire chat input to API (2 hours)

**Part B (NEW):** Add Comfort Mode UI (1 hour)

**Tasks:**
1. Add comfort mode constants
   ```typescript
   // frontend/lib/constants.ts
   export const COMFORT_MODES = [
     {
       id: 'just_listen',
       emoji: '🎧',
       label: 'Just listen',
       description: 'I need empathetic listening'
     },
     {
       id: 'problem_solve',
       emoji: '🧠',
       label: 'Help me problem-solve',
       description: 'I want to brainstorm solutions'
     },
     {
       id: 'distract',
       emoji: '😊',
       label: 'Distract me',
       description: 'I want a lighter conversation'
     },
     {
       id: 'guide',
       emoji: '📋',
       label: 'Guide me',
       description: 'Walk me through my safety plan'
     }
   ];
   ```

2. Add comfort mode component
   ```typescript
   // frontend/components/chat/ComfortModeSelector.tsx
   export function ComfortModeSelector({ 
     selected, 
     onChange 
   }: Props) {
     return (
       <div className="flex gap-2 mb-4 p-4 bg-primary-50 rounded-lg">
         <p className="text-sm text-gray-600 mr-2">How can I help right now?</p>
         {COMFORT_MODES.map(mode => (
           <button
             key={mode.id}
             onClick={() => onChange(mode.id)}
             className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
               selected === mode.id
                 ? 'bg-accent-500 text-white'
                 : 'bg-white text-gray-900 hover:bg-gray-100'
             }`}
             title={mode.description}
           >
             <span className="text-lg">{mode.emoji}</span>
             <span className="text-xs whitespace-nowrap">{mode.label}</span>
           </button>
         ))}
       </div>
     );
   }
   ```

3. Integrate into chat page
   ```typescript
   // frontend/app/chat/page.tsx
   const [comfortMode, setComfortMode] = useState<string>('just_listen');
   
   return (
     <div>
       <ComfortModeSelector selected={comfortMode} onChange={setComfortMode} />
       {/* Chat messages */}
       {/* Input form */}
     </div>
   );
   ```

4. Pass comfortMode with every message
   ```typescript
   const handleSendMessage = async () => {
     await sendMessage({
       message: input,
       userId: userId,
       preferences: userPreferences,
       comfortMode: comfortMode  // NEW
     });
   };
   ```

**Testing:**
- [ ] Comfort mode buttons appear
- [ ] Can click buttons
- [ ] Selected mode is highlighted
- [ ] Comfort mode sent with chat message

**Deliverable:** Comfort mode UI working in chat

---

## Day 2: Database + Onboarding + Language Support (8 hours)

### Phase 1.4: Database Setup (4 hours)
✅ **No changes** — Standard setup, add one table
- Add: `chat_sessions` table (for comfort mode)

### Phase 1.5: Onboarding Preferences API (3 hours)
✅ **Existing** — No changes to core
- **NEW:** Store language preference
  ```sql
  ALTER TABLE user_preferences ADD COLUMN preferred_language TEXT DEFAULT 'en';
  ```

### NEW Phase 1.5B: Language Support (2 hours)

**New Feature:** Urdu/Roman English Support

**Tasks:**
1. Add language options to onboarding
   ```typescript
   // frontend/lib/constants.ts
   export const LANGUAGE_OPTIONS = [
     { code: 'en', label: 'English', flag: '🇬🇧' },
     { code: 'ur', label: 'اردو (Urdu)', flag: '🇵🇰' },
     { code: 'ur-x-roman', label: 'Roman Urdu (Romanized)', flag: '🇵🇰' }
   ];
   ```

2. Add to onboarding form
   - Show language picker (can select multiple)
   - Set `preferred_language` in preferences

3. Backend stores language preference
   - GET preferences retrieves language
   - Pass to system prompt

**Testing:**
- [ ] Language options show in onboarding
- [ ] Can select multiple languages
- [ ] Language saved to database
- [ ] Can retrieve language preference

**Deliverable:** Language preference storage ready

---

### Phase 1.6: Frontend Integration (2 hours)
✅ **Existing** — End-to-end onboarding
- **Add:** Language selector now part of onboarding

**Testing:**
- [ ] Complete onboarding with language preference
- [ ] Language preference saved
- [ ] Can retrieve in chat

**Deliverable:** End-to-end flow including language

---

## Phase 1 Summary (Days 1-2)

**New Deliverables:**
- ✅ Comfort mode picker UI in chat
- ✅ Chat sessions table for mode tracking
- ✅ Language preference storage
- ✅ Onboarding includes language selection

**Code Changes:**
- `frontend/components/chat/ComfortModeSelector.tsx` (NEW)
- `frontend/lib/constants.ts` (UPDATED: add COMFORT_MODES, LANGUAGE_OPTIONS)
- `frontend/app/chat/page.tsx` (UPDATED: add comfort mode selector)
- `backend/src/db/schema.ts` (UPDATED: add chat_sessions table, language column)
- `backend/src/types/index.ts` (UPDATED: add comfortMode to ChatRequest)

**Total Time:** ~30 hours (vs 24 original)  
**Added Time:** 6 hours (all high-impact, low-effort features)

---

# Phase 2: System Prompt Refinement + Pattern Detection (Day 3, ~18 hours)

## Morning: System Prompt Refinement (6 hours)

### Phase 2.1: System Prompt Validation (4 hours)
✅ **Existing** — Test all scenarios

### NEW Phase 2.2B: Comfort Mode in Prompt (1 hour)

**New Feature:** Comfort Mode System Prompt Adaptation

**Tasks:**
1. Update `buildSystemPrompt()` to accept comfortMode
   ```typescript
   export function buildSystemPrompt(
     preferences?: UserPreferences,
     patterns?: Pattern[],
     comfortMode?: string
   ): string {
     let prompt = basePrompt;
     
     if (comfortMode === 'just_listen') {
       prompt += `\nMODE: EMPATHETIC LISTENING
       Focus on reflecting back what you hear. 
       Minimal suggestions unless explicitly asked.
       Validate their feelings.`;
     } else if (comfortMode === 'problem_solve') {
       prompt += `\nMODE: COLLABORATIVE PROBLEM-SOLVING
       Ask clarifying questions. Help brainstorm solutions.
       Suggest concrete, actionable next steps.`;
     } else if (comfortMode === 'distract') {
       prompt += `\nMODE: LIGHT CONVERSATION
       Keep tone lighter and more playful.
       Gently redirect to positive topics when appropriate.
       Ask about interests, hobbies, things that bring joy.`;
     } else if (comfortMode === 'guide') {
       prompt += `\nMODE: SAFETY PLAN GUIDE
       Walk them through their safety plan step by step.
       Ask about warning signs, coping strategies, trusted contacts.`;
     }
     
     return prompt;
   }
   ```

2. Update `claudeService.ts` to pass comfortMode
   ```typescript
   export async function sendMessage(
     userMessage: string,
     options: ClaudeServiceOptions = {}
   ): Promise<string> {
     const systemPrompt = buildSystemPrompt(
       options.preferences,
       options.patterns,
       options.comfortMode  // NEW
     );
     // ... rest unchanged
   }
   ```

3. Update chat controller to pass comfortMode
   ```typescript
   const response = await claudeService.sendMessage(userMessage, {
     preferences,
     conversationHistory,
     comfortMode: req.body.comfortMode  // NEW
   });
   ```

**Testing:**
- [ ] "Just listen" mode is empathetic, not action-oriented
- [ ] "Problem-solve" mode generates solutions
- [ ] "Distract" mode keeps conversation light
- [ ] "Guide" mode walks through safety plan
- [ ] Mode changes don't break crisis detection

**Deliverable:** Comfort mode integrated into system prompt

---

### NEW Phase 2.2C: Culturally-Flavored Coping Suggestions (2 hours)

**New Feature:** Personalized, Textured Coping Advice

**Tasks:**
1. Update system prompt with coping guidance
   ```typescript
   const basePrompt = `...
   WHEN SUGGESTING COPING STRATEGIES:
   - Never suggest generic strategies like "deep breathing"
   - Instead, reference specific things THIS USER has mentioned
   - Examples:
     * User mentioned their mom's chai → "Make chai like your mom makes it"
     * User likes walking → "Take that walk route you love"
     * User mentioned art → "Spend 20 minutes sketching or painting"
   - Each suggestion should feel personal and specific
   - Warm, genuine tone
   `;
   ```

2. Create `backend/src/services/copingService.ts` (optional, for advanced suggestions)
   ```typescript
   export async function generatePersonalizedSuggestions(
     userId: string,
     situation: string,
     recentChat: ChatMessage[]
   ): Promise<string[]> {
     // For now, Claude handles this in system prompt
     // Can be extracted to dedicated service later
   }
   ```

**Testing:**
- [ ] Suggestions are specific, not generic
- [ ] Suggestions reference user's actual mentions
- [ ] Suggestions feel warm and personal
- [ ] A/B comparison: specific vs generic (qualitative)

**Deliverable:** Culturally-flavored coping suggestions in system prompt

---

## Afternoon: Pattern Detection (8 hours)

### NEW Phase 2.3B: Pattern Detection Service (4 hours)

**New Feature:** Living, Evolving Profile

**Tasks:**
1. Create `backend/src/db/schema.ts` addition
   ```sql
   CREATE TABLE user_patterns (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     pattern_text TEXT NOT NULL,
     pattern_type TEXT,
     confidence REAL,
     evidence TEXT,
     first_detected TIMESTAMP,
     last_mentioned TIMESTAMP,
     frequency INT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. Create `backend/src/services/patternDetectionService.ts`
   ```typescript
   export async function detectPatterns(
     userId: string,
     recentMessages: ChatMessage[]
   ): Promise<Pattern[]> {
     // Only run every 5+ messages
     if (recentMessages.length % 5 !== 0) return [];
     
     const prompt = `Analyze these messages from the user.
     Identify 1-2 recurring topics, emotional patterns, or behaviors.
     Be subtle and gentle. Return JSON:
     [
       {
         pattern: "description",
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
   
   export async function getActivePatterns(userId: string): Promise<Pattern[]> {
     // Get patterns not older than 2 weeks
     const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
     
     return db.prepare(`
       SELECT * FROM user_patterns
       WHERE user_id = ? AND last_mentioned > ?
       ORDER BY last_mentioned DESC
       LIMIT 10
     `).all(userId, twoWeeksAgo.toISOString());
   }
   ```

3. Create `backend/src/db/operations/patterns.ts`
   ```typescript
   export function savePattern(userId: string, pattern: Pattern) {
     db.prepare(`...`).run(...);
   }
   
   export function decayOldPatterns(userId: string) {
     // Called daily, removes patterns older than 2 weeks
     const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
     db.prepare(`
       DELETE FROM user_patterns
       WHERE user_id = ? AND last_mentioned < ?
     `).run(userId, twoWeeksAgo.toISOString());
   }
   ```

4. Integrate into chat controller
   ```typescript
   const response = await claudeService.sendMessage(userMessage, {...});
   
   // Detect patterns after getting response
   const patterns = await detectPatterns(userId, [...messages, response]);
   
   // Return response
   res.json({...response, patterns});
   ```

**Testing:**
- [ ] Patterns detected after 5+ messages
- [ ] Patterns are accurate and non-intrusive
- [ ] Old patterns decay after 2 weeks
- [ ] Max 10 patterns maintained
- [ ] Confidence scores are reasonable

**Deliverable:** Pattern detection service working

---

### NEW Phase 2.3C: Patterns in System Prompt (2 hours)

**Tasks:**
1. Update `buildSystemPrompt()` to include patterns
   ```typescript
   if (patterns && patterns.length > 0) {
     prompt += `\nLEARNED PATTERNS:\n`;
     patterns.forEach(p => {
       prompt += `- ${p.pattern_text}\n`;
     });
     prompt += `\nGently reference these patterns if relevant.`;
   }
   ```

2. Test pattern reflection
   - User mentions exams multiple times
   - Claude gently notices: "I've noticed exams come up a lot..."
   - User feels understood

**Testing:**
- [ ] Patterns appear in system prompt
- [ ] Claude references patterns naturally
- [ ] Doesn't feel invasive or creepy

**Deliverable:** Living profile feature complete

---

### Phase 2.4: Team Review & Approval (2 hours)
✅ **Existing** — Get sign-off on system prompt with new features

**Testing Checklist:**
- [ ] Comfort mode changes responses appropriately
- [ ] Coping suggestions are specific and warm
- [ ] Pattern detection works
- [ ] Patterns feel natural and non-intrusive
- [ ] No diagnosis language anywhere
- [ ] Cultural humility maintained

**Deliverable:** Approved system prompt v1.3 with all enhancements

---

## Phase 2 Summary (Day 3)

**New Deliverables:**
- ✅ Comfort mode integrated into system prompt
- ✅ Culturally-flavored coping suggestions
- ✅ Pattern detection service
- ✅ Living profile integration
- ✅ All features validated and approved

**Code Changes:**
- `backend/src/config/systemPrompt.ts` (MAJOR: add comfort mode, patterns, coping guidance)
- `backend/src/services/patternDetectionService.ts` (NEW)
- `backend/src/db/operations/patterns.ts` (NEW)
- `backend/src/db/schema.ts` (UPDATED: add user_patterns table)
- `backend/src/controllers/chatController.ts` (UPDATED: call pattern detection)

**Total Time:** ~18 hours (vs 16 original)  
**Added Time:** 2 hours

---

# Phase 3: Crisis Detection (Day 4, ~20 hours)

✅ **No changes** — Crisis detection unchanged
- Phase 3.1-3.6 proceed as planned

**Note:** Crisis detection works with comfort modes (can be in crisis in any mode)

---

# Phase 4: Safety Plan + Mood Tracking (Day 5, ~20 hours)

## Morning: Safety Plan Builder (6 hours)

### Phase 4.1-4.2: Safety Plan API & UI (6 hours)
✅ **Existing** — As planned

### NEW Phase 4.3B: Mood Check-In API (1.5 hours)

**New Feature:** Daily Mood Tracking

**Tasks:**
1. Add database table
   ```sql
   CREATE TABLE mood_checkins (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     mood_score INT CHECK (mood_score BETWEEN 1 AND 5),
     mood_emoji TEXT,
     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     notes TEXT
   );
   
   CREATE INDEX idx_mood_by_user_date 
     ON mood_checkins(user_id, DATE(timestamp));
   ```

2. Create `backend/src/routes/mood.ts`
   ```typescript
   // POST /mood/checkin
   router.post('/checkin', async (req, res) => {
     const { userId, moodScore, moodEmoji, notes } = req.body;
     
     db.prepare(`
       INSERT INTO mood_checkins 
       (id, user_id, mood_score, mood_emoji, notes)
       VALUES (?, ?, ?, ?, ?)
     `).run(`mood-${Date.now()}`, userId, moodScore, moodEmoji, notes);
     
     res.json({success: true});
   });
   
   // GET /mood/trend/:userId?days=7
   router.get('/trend/:userId', async (req, res) => {
     const { userId } = req.params;
     const { days = 7 } = req.query;
     
     const data = db.prepare(`
       SELECT DATE(timestamp) as date, mood_score as mood, mood_emoji as emoji
       FROM mood_checkins
       WHERE user_id = ? AND timestamp > datetime('now', '-' || ? || ' days')
       ORDER BY timestamp ASC
     `).all(userId, days);
     
     const avg = data.length > 0
       ? (data.reduce((sum, d) => sum + d.mood, 0) / data.length).toFixed(1)
       : 0;
     
     res.json({
       data,
       average: avg,
       trend: calculateTrend(data)
     });
   });
   ```

3. Create `backend/src/services/moodService.ts`
   ```typescript
   export function calculateTrend(data: MoodData[]): 'improving' | 'declining' | 'stable' {
     if (data.length < 2) return 'stable';
     
     const first = data.slice(0, Math.floor(data.length / 2));
     const second = data.slice(Math.floor(data.length / 2));
     
     const avgFirst = first.reduce((sum, d) => sum + d.mood, 0) / first.length;
     const avgSecond = second.reduce((sum, d) => sum + d.mood, 0) / second.length;
     
     if (avgSecond > avgFirst + 0.5) return 'improving';
     if (avgSecond < avgFirst - 0.5) return 'declining';
     return 'stable';
   }
   ```

**Testing:**
- [ ] Can submit mood with score and emoji
- [ ] Mood saves to database
- [ ] Can retrieve mood trend
- [ ] Trend calculation is correct

**Deliverable:** Mood checkin API working

---

## Afternoon: Safety Plan Enhancement + Mood UI (6 hours)

### Phase 4.3: PDF Export (3 hours)
✅ **Existing** — As planned

### NEW Phase 4.4B: AI-Suggested Safety Plan Entries (2 hours)

**New Feature:** Personalized Safety Plan Prompts

**Tasks:**
1. Create `backend/src/services/safetyPlanService.ts`
   ```typescript
   export async function generateSafetyPlanDraft(
     userId: string,
     recentMessages: ChatMessage[]
   ): Promise<SafetyPlanDraft> {
     const prompt = `Based on this person's recent conversations,
     suggest specific, personalized entries for their safety plan.
     
     Recent chat: ${recentMessages.slice(-20).map(m => m.content).join('\n')}
     
     Return JSON:
     {
       warningSigns: ["specific sign mentioned in chats"],
       copingStrategies: ["specific strategy they mentioned"],
       trustedContacts: [{name, relationship}],
       reasonsToStaySafe: ["specific reason they mentioned"]
     }`;
     
     const response = await claudeService.sendMessage(prompt);
     return JSON.parse(response);
   }
   ```

2. Add API endpoint
   ```typescript
   // GET /safety-plan/:userId/suggestions
   router.get('/:userId/suggestions', async (req, res) => {
     const { userId } = req.params;
     
     // Get recent messages (would need to store these)
     // For now, generate from patterns
     const patterns = await getActivePatterns(userId);
     const draft = await generateSafetyPlanDraft(userId, patterns);
     
     res.json(draft);
   });
   ```

3. Frontend: Add "Load suggestions" button
   ```typescript
   // frontend/app/safety-plan/builder/page.tsx
   const handleLoadSuggestions = async () => {
     const suggestions = await fetch(
       `/api/safety-plan/${userId}/suggestions`
     ).then(r => r.json());
     
     setWarningSigns(suggestions.warningSigns);
     setCopingStrategies(suggestions.copingStrategies);
     // etc.
   };
   
   return (
     <div>
       <button onClick={handleLoadSuggestions}>
         💡 Load suggestions from our chats
       </button>
       {/* Rest of form */}
     </div>
   );
   ```

**Testing:**
- [ ] Suggestions are relevant
- [ ] User can edit suggestions
- [ ] Suggestions don't feel invasive
- [ ] Optional (user can still fill blank form)

**Deliverable:** AI-suggested safety plan entries

---

### NEW Phase 4.5B: Mood Trend UI (2 hours)

**New Feature:** Mood Check-In Visual Trend

**Tasks:**
1. Create mood check-in modal
   ```typescript
   // frontend/components/common/MoodCheckinModal.tsx
   export function MoodCheckinModal({ isOpen, onSubmit }: Props) {
     const [mood, setMood] = useState(3);
     
     return (
       isOpen && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
           <div className="bg-white rounded-lg p-8">
             <h2 className="text-2xl font-bold mb-4">How's your mood today?</h2>
             
             <div className="flex justify-center gap-4 mb-6">
               {['😢', '😞', '😐', '🙂', '😊'].map((emoji, i) => (
                 <button
                   key={i}
                   onClick={() => setMood(i + 1)}
                   className={`text-4xl transition ${
                     mood === i + 1 ? 'scale-125' : ''
                   }`}
                 >
                   {emoji}
                 </button>
               ))}
             </div>
             
             <button
               onClick={() => onSubmit(mood)}
               className="w-full bg-accent-500 text-white py-3 rounded-lg"
             >
               Save
             </button>
           </div>
         </div>
       )
     );
   }
   ```

2. Show on first chat of day
   ```typescript
   // frontend/app/chat/page.tsx
   useEffect(() => {
     const lastMoodDate = localStorage.getItem('lastMoodDate');
     const today = new Date().toDateString();
     
     if (lastMoodDate !== today) {
       setShowMoodCheckin(true);
     }
   }, []);
   
   const handleMoodSubmit = async (mood: number) => {
     await submitMoodCheckin(userId, mood);
     localStorage.setItem('lastMoodDate', new Date().toDateString());
     setShowMoodCheckin(false);
   };
   ```

3. Create mood trend page
   ```typescript
   // frontend/app/mood/page.tsx
   export default function MoodTrendPage() {
     const [data, setData] = useState<MoodData[]>([]);
     
     useEffect(() => {
       const fetchTrend = async () => {
         const trend = await getMoodTrend(userId, 7);
         setData(trend.data);
       };
       fetchTrend();
     }, []);
     
     return (
       <div>
         <h1>Your Week in Mood</h1>
         <LineChart
           data={data.map(d => ({ date: d.date, mood: d.mood }))}
           dataKey="mood"
         />
         <p>Average: {(data.reduce((s, d) => s + d.mood, 0) / data.length).toFixed(1)}</p>
       </div>
     );
   }
   ```

4. Add link from chat page to mood trend

**Testing:**
- [ ] Modal appears once per day
- [ ] Can submit mood with emoji
- [ ] Mood saved to database
- [ ] Trend page shows line chart
- [ ] Average calculated correctly

**Deliverable:** Mood tracking UI and trend page working

---

## Phase 4 Summary (Day 5)

**New Deliverables:**
- ✅ AI-suggested safety plan entries
- ✅ Mood check-in API
- ✅ Mood check-in modal UI
- ✅ Mood trend page with chart

**Code Changes:**
- `backend/src/services/safetyPlanService.ts` (NEW)
- `backend/src/services/moodService.ts` (NEW)
- `backend/src/routes/mood.ts` (NEW)
- `backend/src/db/schema.ts` (UPDATED: add mood_checkins table)
- `frontend/components/common/MoodCheckinModal.tsx` (NEW)
- `frontend/app/mood/page.tsx` (NEW)
- `frontend/app/safety-plan/builder/page.tsx` (UPDATED: add suggestion button)

**Total Time:** ~20 hours (vs 16 original)  
**Added Time:** 4 hours

---

# Phase 5: Resources + Smart Filtering (Day 6, ~14 hours)

## Morning: Resources Directory (7 hours)

### Phase 5.1-5.2: Resources API & UI (5 hours)
✅ **Existing** — As planned

### NEW Phase 5.3B: "Someone Like Me" Resource Filtering (2 hours)

**New Feature:** Smart Resource Filtering by Context

**Tasks:**
1. Add contexts to resources
   ```sql
   ALTER TABLE crisis_resources ADD COLUMN contexts TEXT; -- JSON array
   ```

2. Update resource data in `resources-db/resources.json`
   ```json
   {
     "id": "us-thotline",
     "name": "Trans Lifeline",
     "contexts": ["lgbtq", "trans", "young_adult"],
     ...
   }
   ```

3. Update resource seeding to include contexts

4. Enhance GET `/resources` endpoint
   ```typescript
   export async function listResources(req, res) {
     const { userId, region, type } = req.query;
     
     let userContexts = [];
     if (userId) {
       const prefs = await getUserPreferences(userId);
       userContexts = JSON.parse(prefs.contexts || '[]');
     }
     
     let resources = db.prepare(`SELECT * FROM crisis_resources WHERE ...`).all();
     
     // Split by matching contexts
     const matched = resources.filter(r =>
       JSON.parse(r.contexts || '[]').some(c => userContexts.includes(c))
     );
     const other = resources.filter(r =>
       !JSON.parse(r.contexts || '[]').some(c => userContexts.includes(c))
     );
     
     res.json({
       matched: { label: "For people like you", resources: matched },
       other: { label: "Other resources", resources: other }
     });
   }
   ```

5. Update frontend to display matched resources first
   ```typescript
   // frontend/app/resources/page.tsx
   {matched.resources.length > 0 && (
     <section>
       <h2>💜 Resources for people like you</h2>
       {/* Display matched resources */}
     </section>
   )}
   
   <section>
     <h2>Other resources available</h2>
     {/* Display other resources */}
   </section>
   ```

**Testing:**
- [ ] Matched resources appear first
- [ ] Messaging is non-intrusive
- [ ] User without contexts sees all resources equally
- [ ] Contexts never inferred (only user-stated)

**Deliverable:** Smart resource filtering working

---

## Phase 5 Summary (Day 6)

**New Deliverables:**
- ✅ "Someone like me" resource filtering
- ✅ Context-based resource organization

**Code Changes:**
- `resources-db/resources.json` (UPDATED: add contexts)
- `backend/src/controllers/resourcesController.ts` (UPDATED: smart filtering)
- `frontend/app/resources/page.tsx` (UPDATED: matched/other display)

**Total Time:** ~14 hours (vs 12 original)  
**Added Time:** 2 hours

---

# Phase 6: Testing, Polish, Deployment (Day 7, ~14 hours)

## Testing Enhancements (4 hours)

### NEW: Enhanced Feature Testing

**Comfort Mode Testing:**
- [ ] Each mode produces different responses
- [ ] Mode changes mid-conversation work
- [ ] No crashes when switching modes

**Pattern Detection Testing:**
- [ ] Patterns accurate and non-intrusive
- [ ] Feel natural, not creepy
- [ ] Decay works (old patterns removed)

**Mood Tracking Testing:**
- [ ] Modal appears once per day
- [ ] Chart displays correctly
- [ ] Trend calculation accurate

**AI Safety Plan Testing:**
- [ ] Suggestions are relevant
- [ ] User can edit suggestions
- [ ] Form still works without suggestions

**Context-Based Resources Testing:**
- [ ] Matched resources appear first
- [ ] Non-matched resources still visible
- [ ] Filtering works with other filters

---

## Deployment (5 hours)
✅ **Existing** — Deploy to Vercel/Render

---

## Demo Preparation (2 hours)

### NEW: Enhanced Demo Script (5-6 minutes)

**1. Welcome & Onboarding (30 sec)**
- Show onboarding with language support
- "You can chat in English, Urdu, or Roman Urdu"

**2. Comfort Mode (1 min)**
- Show comfort mode buttons: "Just listen," "Problem-solve," "Distract," "Guide"
- Send message in "Just listen" mode
- Show empathetic response
- Switch to "Problem-solve" mode
- Same message gets different, action-oriented response
- **Highlight:** "Different modes for different moments"

**3. Pattern Learning (1 min)**
- After a few messages, Claude gently notices: "I've noticed [pattern]"
- "The app learns and adapts over time"

**4. Mood Check-In (30 sec)**
- Show mood modal
- Quick mood entry (emoji)
- Switch to mood trend page
- Show 7-day chart
- "Track how you've been over time"

**5. Safety Plan with AI Suggestions (1 min)**
- Show "Load suggestions from chats" button
- Click to load
- Show AI-generated draft entries
- Edit one to show it's flexible
- "The safety plan is co-written with the app"

**6. Smart Resources (30 sec)**
- Show resources page
- Highlight: "Resources for people like you" section first
- Click phone number (shows tel: link)
- "Resources are personalized to your context"

**7. Language Support (20 sec)**
- Click on Roman Urdu
- Send message in Roman Urdu
- Show Claude responds in Roman Urdu
- "Available in English, Urdu, and Roman Urdu"

**8. Closing (20 sec)**
- "This app is alive, not scripted"
- "It learns, adapts, and feels personal"
- "While always keeping you safe with crisis detection"

**Total:** 5-6 minutes (packed with features)

---

## Phase 6 Summary (Day 7)

**New Deliverables:**
- ✅ Comprehensive testing of all enhanced features
- ✅ Updated demo script with 6 new features
- ✅ Live deployment with all features

**Total Time:** ~14 hours (vs 12 original)  
**Added Time:** 2 hours

---

# Overall Timeline Summary

## Original Plan: 92 hours over 7 days
## Enhanced Plan: 110 hours over 7 days (or 8 days with buffer)

**Time Breakdown:**
- **Phase 1** (Days 1-2): 30 hrs (+6 hrs)
- **Phase 2** (Day 3): 18 hrs (+2 hrs)
- **Phase 3** (Day 4): 20 hrs (no change)
- **Phase 4** (Day 5): 20 hrs (+4 hrs)
- **Phase 5** (Day 6): 14 hrs (+2 hrs)
- **Phase 6** (Day 7): 14 hrs (+2 hrs)
- **Buffer (Day 8)**: 8 hrs (optional)

**Total:** 114 hours / 8 days ≈ 14-15 hrs/day with buffer

---

# Feature Priority Cheat Sheet

**If you run short on time, implement in this order:**

1. ✅ **Comfort Mode** (2 hrs) — Huge UX impact
2. ✅ **Language Support** (2 hrs) — Cultural inclusivity
3. ✅ **Culturally-Flavored Coping** (2 hrs) — Makes app feel personal
4. ✅ **Pattern Learning** (6 hrs) — "Wow" factor for demo
5. ⏸️ **Mood Tracking** (4 hrs) — Nice visual for demo
6. ⏸️ **AI Safety Plan Suggestions** (2 hrs) — Polish, can skip if tight
7. ⏸️ **"Someone Like Me" Resources** (2 hrs) — Polish, can skip if tight

**MVP (must have):** Features 1-3  
**Great Demo (nice to have):** Add features 4-5  
**Polish (skip if tight):** Features 6-7

---

# Success Metrics

| Feature | Success | Metric |
|---------|---------|--------|
| Comfort Mode | Users switch modes mid-conversation | engagement signal |
| Pattern Detection | Users feel "understood" | qualitative feedback |
| Culturally-Flavored Coping | Rated more helpful than generic | A/B test comparison |
| Mood Tracking | Users check trend weekly | engagement signal |
| AI Safety Plan | 70%+ suggestions accepted | no-ignore rate |
| Smart Resources | Matched resources clicked 30% more | engagement lift |
| Language Support | Urdu users have longer sessions | session duration |

---

# Implementation Checklist

### Phase 1 (Days 1-2)
- [ ] Chat endpoint with comfort mode support
- [ ] Comfort mode UI buttons in chat
- [ ] Database: chat_sessions table, language column
- [ ] Onboarding: language selection
- [ ] Language preference stored and retrieved

### Phase 2 (Day 3)
- [ ] System prompt: comfort mode adaptation
- [ ] System prompt: culturally-flavored coping guidance
- [ ] Pattern detection service implemented
- [ ] Pattern database table and queries
- [ ] Patterns integrated into system prompt
- [ ] All features tested and approved

### Phase 3 (Day 4)
- [ ] Crisis detection (unchanged)
- [ ] All crisis tests passing

### Phase 4 (Day 5)
- [ ] Safety plan API (unchanged)
- [ ] AI-suggested safety plan entries
- [ ] Mood checkin API
- [ ] Mood checkin modal UI
- [ ] Mood trend page with chart
- [ ] All features tested

### Phase 5 (Day 6)
- [ ] Resources API (unchanged)
- [ ] "Someone like me" resource filtering
- [ ] Context tagging added to resources.json
- [ ] Frontend displays matched resources first

### Phase 6 (Day 7)
- [ ] All features tested comprehensively
- [ ] Enhanced demo script prepared
- [ ] Deployed to production
- [ ] All URLs verified working

---

**Total Development Time:** ~110 hours over 7-8 days with a capable team

**Ready to build something truly alive?** 🚀
