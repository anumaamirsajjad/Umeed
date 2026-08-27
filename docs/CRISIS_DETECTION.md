# Crisis Detection Design & Testing

## Overview

Crisis detection is implemented as a **server-side safety net** in `backend/src/services/crisisDetectionService.ts`. It runs independently of the LLM's own judgment to catch crisis language that might otherwise be missed or minimized.

**Philosophy:** Err on the side of caution. Ambiguous language → escalate.

## How It Works

### Pattern Matching

The service maintains two lists of patterns:

1. **HIGH-SEVERITY patterns** (very confident)
   - Explicit suicidal ideation: "kill myself", "end my life", "no reason to live"
   - Self-harm: "cut myself", "hurt myself", "self-harm"
   - Methods: "jump off", "hang myself", "overdose"
   - Goodbye language: "farewell", "last goodbye"

2. **WARNING patterns** (medium confidence, requires context)
   - "don't want to live", "tired of living"
   - "it's too much", "can't do this"
   - "everyone would be better", "no one cares"
   - "completely alone", "nobody needs me"

### Escalation Logic

A message is flagged as crisis if:
- ✅ It matches a HIGH-SEVERITY pattern (single match = escalate)
- ✅ It matches a WARNING pattern (single match = escalate) — **except** two
  patterns ("can't do this / can't handle this", "it's too much") that are
  common in ordinary, non-crisis venting ("I can't handle this deadline").
  Those two only escalate when corroborated by a matched pattern *outside*
  that pair — matching both of them together (as in "I can't handle this,
  it's too much") is not enough on its own, since that combination was
  previously causing crisis warnings on ordinary chat messages. The semantic
  classifier (`crisisClassifierService.ts`) still runs on every message and
  can independently flag this combination as "ambiguous," surfacing
  resources with gentler framing rather than an urgent alert.

Confidence score ranges 0–1:
- HIGH match = 0.95 confidence
- WARNING match(es) = 0.70 confidence
- No matches = 0.0 confidence

## Test Cases

### MUST TRIGGER Crisis Escalation

These should ALL be caught and escalated:

```
1. Direct ideation:
   "I want to kill myself"
   "I'm going to end it all"
   "I have no reason to live"
   "I'm suicidal"

2. Self-harm intent:
   "I'm going to cut myself"
   "I hurt myself every night"
   "I keep hurting myself"

3. Goodbye language:
   "I'm saying goodbye"
   "This is my last message"
   "I wanted to say farewell"

4. Methods indication:
   "I'm thinking about overdosing"
   "I'm going to jump"
   "I have a rope"

5. Multiple warning signs:
   "I don't want to live anymore, nobody cares about me"
   "Everything is hopeless and I can't do this"
   "I'm completely alone and it's too much"
```

### SHOULD ESCALATE (Ambiguous/Indirect)

These are edge cases where escalation is safer than not:

```
1. Indirect but clear:
   "My family would be better off without me"
   "Everyone would be better if I was gone"
   "I'm just a burden"

2. Hopelessness without direct ideation:
   "I don't see how things can get better"
   "There's no point trying anymore"
   "I'm completely broken"

3. Fatigue language:
   "I'm just so tired of this"
   "I can't keep going like this"
   "I give up"

4. Isolation + despair:
   "I'm totally alone and it's unbearable"
   "No one would even notice if I was gone"
```

### SHOULD NOT TRIGGER

These should pass through to normal conversation:

```
1. General sadness:
   "I've been feeling really down lately"
   "This is the hardest thing I've been through"

2. Hopeful expressions (even if past tense):
   "I used to feel suicidal but I'm getting help now"
   "I've survived crisis before"

3. Academic/fictional:
   "I'm writing a paper about suicide prevention"
   "The character died by suicide"

4. Medication side effect discussion:
   "The antidepressant made me suicidal at first"
   "Some medications can increase suicidal thoughts"

5. Support-seeking language:
   "I'm having a hard time and need help"
   "I'm not sure how much longer I can handle this, what can I do?"
```

## Testing Before Deployment

### Unit Tests

Run the crisis detection service with these inputs:

```typescript
import { detectCrisis } from './crisisDetectionService.ts';

// High confidence
assert(detectCrisis("I want to kill myself").isCrisis === true);
assert(detectCrisis("I'm suicidal").isCrisis === true);
assert(detectCrisis("My family would be better off without me").isCrisis === true);

// Medium confidence
assert(detectCrisis("Nobody needs me and I'm so alone").isCrisis === true);

// Should not trigger
assert(detectCrisis("I've been feeling sad").isCrisis === false);
assert(detectCrisis("I'm working with a therapist on suicidal thoughts from my past").isCrisis === false);
```

### Integration Tests

1. **Test the full flow:** User sends crisis message → detection triggers → escalation UI appears with resources
2. **Test false negatives:** Send indirect crisis language and verify it's caught
3. **Test false positives:** Send benign messages and verify no escalation
4. **Test resource display:** Verify that when crisis is escalated, relevant resources are shown based on user's location/preferences

### Conversation Testing

Manually test with real-looking crisis scenarios:

```
User: "I've tried everything and nothing works. I'm thinking about ending it all."
Expected: CRISIS flagged, hotline resources surfaced immediately

User: "I feel like my kids would be better without me. I'm just a burden."
Expected: CRISIS flagged, resources shown with gentle encouragement

User: "I used to have suicidal thoughts but I'm in therapy now and things are improving."
Expected: Normal conversation (past tense, active help-seeking)
```

## When To Revise Patterns

Update patterns if:
- **False negatives in production:** Real crisis goes undetected → add that language pattern
- **False positives:** Benign message triggers escalation → refine pattern or add negative filters
- **New phrasings:** Users are expressing crisis in ways not yet captured

When updating, document the change in commit message with:
- What phrasing was missed/falsely triggered
- Why the pattern change matters
- Test case added

## Emotional Intensity Analysis

The service includes `analyzeEmotionalIntensity()` which counts markers like:
- Excessive punctuation (`!!`, `...`)
- Absolutist language ("I can't", "never", "always")
- Distressing words ("dying", "pain", "suffering")

This is not used for final crisis decision (too many false positives) but can support edge-case analysis if you're debugging a tricky case.

## Logging & Monitoring

All crisis detections are logged:

```
[2026-08-21T14:23:45Z] CRISIS DETECTION isCrisis=true | severity=critical | confidence=0.95 | matched=3 patterns
```

Monitor logs for:
- Patterns of false positives (same benign phrase triggering repeatedly)
- Patterns of false negatives (crisis language that wasn't caught)
- Confidence scores that are suspiciously low for flagged crises

## Quick Reference

| Scenario | Action |
|----------|--------|
| High-severity pattern match | → Escalate immediately |
| Multiple warning patterns | → Escalate |
| Unclear/ambiguous language | → Escalate (better safe) |
| Past tense crisis language | → Normal conversation |
| Academic/fictional context | → Normal conversation |
| User actively seeking help | → Normal conversation with resource suggestions |

---

**Last reviewed:** 2026-08-21  
**Next review:** After Day 4 crisis detection implementation & before Day 7 testing
