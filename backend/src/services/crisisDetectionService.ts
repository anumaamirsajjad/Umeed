import type { CrisisDetectionResult } from '../types/index.js';

/**
 * CRITICAL SAFETY SERVICE
 *
 * Crisis detection runs server-side as an independent safety net.
 * It does NOT replace the LLM's judgment but augments it.
 * This service errs on the side of caution: ambiguous language → escalate.
 *
 * See docs/CRISIS_DETECTION.md for test cases and methodology.
 *
 * This regex layer only covers English and is intentionally not extended to
 * Roman Urdu/Punjabi — that coverage now comes from the independent LLM
 * classifier in crisisClassifierService.ts, which doesn't require a
 * hand-sourced phrase list. Both layers run on every message; either one
 * flagging risk is enough to escalate (see chatController.ts).
 */

interface PatternMatch {
  pattern: RegExp;
  severity: 'high' | 'medium';
  /** Matches only on a bare mention of "suicide/suicidal" with no other context — subject to negation-context suppression. */
  generic?: boolean;
  /**
   * Medium-severity only: this phrasing is common in ordinary, non-crisis venting
   * ("I can't do this deadline", "work today was too much") and is not a reliable
   * crisis signal on its own — it only counts toward escalation when paired with
   * at least one other matched pattern (see detectCrisis).
   */
  ambiguous?: boolean;
}

// High-confidence crisis indicators
const CRISIS_PATTERNS: PatternMatch[] = [
  // Explicit suicidal ideation
  { pattern: /suicide|suicidal/i, severity: 'high', generic: true },
  { pattern: /kill\s*myself|kill\s*me/i, severity: 'high' },
  { pattern: /end\s*my\s*life|end\s*it\s*all/i, severity: 'high' },
  { pattern: /no\s*reason\s*to\s*live|no\s*point\s*in\s*living|nothing\s*to\s*live\s*for/i, severity: 'high' },
  { pattern: /better\s*off\s*(if\s*i\s*(was|were)\s*)?dead|better\s*off\s*without\s*me|world\s*better\s*without\s*me/i, severity: 'high' },
  { pattern: /want\s*to\s*die|going\s*to\s*die/i, severity: 'high' },
  { pattern: /wish\s*i\s*were\s*dead|wish\s*i\s*was\s*dead/i, severity: 'high' },

  // Self-harm
  { pattern: /cut\s*myself|cutting\s*myself/i, severity: 'high' },
  { pattern: /hurt\s*myself|hurting\s*myself/i, severity: 'high' },
  { pattern: /self.?harm|self.?injure/i, severity: 'high' },
  { pattern: /slash\s*wrist|slit\s*wrist/i, severity: 'high' },
  { pattern: /bang\s*head|hit\s*myself/i, severity: 'high' },

  // Overdose/poisoning
  { pattern: /overdose|take\s*pills|swallow\s*pills/i, severity: 'high' },
  { pattern: /poison|toxin/i, severity: 'high' },

  // Methods indication
  { pattern: /jump\s*off|jump\s*from/i, severity: 'high' },
  { pattern: /hang\s*myself/i, severity: 'high' },
  { pattern: /gun|shoot\s*myself/i, severity: 'high' },
  { pattern: /rope|noose/i, severity: 'high' },

  // Hopelessness/Despair (broader, requires context)
  { pattern: /hopeless|no\s*hope/i, severity: 'high' },
  { pattern: /worthless|no\s*worth/i, severity: 'high' },
  { pattern: /pointless|no\s*point/i, severity: 'high' },
  { pattern: /can't\s*go\s*on|cannot\s*go\s*on/i, severity: 'high' },
  { pattern: /give\s*up|giving\s*up/i, severity: 'high' },

  // Goodbye/Farewell language
  { pattern: /goodbye|farewell|last\s*goodbye/i, severity: 'high' },
  { pattern: /telling\s*people\s*goodbye|saying\s*goodbye/i, severity: 'high' },
];

// Medium-confidence patterns — a single match still escalates, EXCEPT for the two
// marked `ambiguous: true` below, which are extremely common in everyday, non-crisis
// venting ("I can't handle this deadline", "today was just too much") and need a
// second matched pattern alongside them before they escalate (see detectCrisis).
const WARNING_PATTERNS: PatternMatch[] = [
  { pattern: /don't\s*want\s*to\s*live/i, severity: 'medium' },
  { pattern: /tired\s*of\s*living/i, severity: 'medium' },
  { pattern: /can(?:'t|not)\s*do\s*this|can(?:'t|not)\s*handle\s*this/i, severity: 'medium', ambiguous: true },
  { pattern: /it's\s*too\s*much/i, severity: 'medium', ambiguous: true },
  { pattern: /(everyone|everybody|family|they)\s*(would\s*be|is|are)?\s*better\s*off/i, severity: 'medium' },
  { pattern: /no\s*one\s*cares|nobody\s*cares/i, severity: 'medium' },
  { pattern: /all\s*alone|completely\s*alone/i, severity: 'medium' },
  { pattern: /nobody\s*needs\s*me/i, severity: 'medium' },
  { pattern: /totally\s*broken/i, severity: 'medium' },
];

// Context that indicates the message is discussing suicide/suicidal in a non-personal-crisis
// sense (academic, historical, media, or resolved past experience) — see docs/CRISIS_DETECTION.md
// "SHOULD NOT TRIGGER". Only suppresses a *bare* mention of "suicide/suicidal"; any other
// crisis/warning pattern match still escalates regardless of this context.
const NEGATION_CONTEXT_PATTERNS: RegExp[] = [
  /research(ing)?|thesis|paper|stud(y|ying|ies)/i,
  /prevention/i,
  /statistics|rates?\s+(are|have|is|increasing|rising|falling)/i,
  /according\s*to\s*(who|cdc|the)/i,
  /movie|film|character|documentary|book|novel|show/i,
  /used\s*to\s*(feel|be|have)|in\s*the\s*past|no\s*longer|from\s*my\s*past|but\s*i'?m\s*(much\s*)?better\s*now|but\s*i'?m\s*getting\s*help/i,
  /committed\s*suicide\s*in\s*\d{4}|died\s*(by|from)\s*suicide\s*in\s*\d{4}/i,
  // A year mention alongside a bare "suicide" reference reads as a historical/biographical fact.
  /\b(19|20)\d{2}\b/,
];

const ALL_PATTERNS: PatternMatch[] = [...CRISIS_PATTERNS, ...WARNING_PATTERNS];

export function detectCrisis(text: string): CrisisDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      isCrisis: false,
      matchedPatterns: [],
      confidence: 0,
    };
  }

  const matched = ALL_PATTERNS.filter((m) => m.pattern.test(text));
  const matchedPatterns = matched.map((m) => m.pattern.source);
  const highMatches = matched.filter((m) => m.severity === 'high');
  const nonGenericHighMatches = highMatches.filter((m) => !m.generic);
  const mediumMatches = matched.filter((m) => m.severity === 'medium');

  // A bare "suicide"/"suicidal" mention with no other crisis signal is suppressed when the
  // surrounding text reads as academic, historical, media, or a resolved past experience.
  const onlyGenericHighMatch = highMatches.length > 0 && nonGenericHighMatches.length === 0;
  const isSuppressedGenericMention =
    onlyGenericHighMatch &&
    mediumMatches.length === 0 &&
    NEGATION_CONTEXT_PATTERNS.some((p) => p.test(text));

  const hasHighSeverity = highMatches.length > 0 && !isSuppressedGenericMention;

  // "Ambiguous" medium matches (see WARNING_PATTERNS) only count once corroborated
  // by a matched pattern OUTSIDE that ambiguous set — otherwise ordinary venting that
  // happens to hit both ambiguous phrases at once ("I can't handle this, it's too
  // much this week") would corroborate itself and escalate anyway.
  const ambiguousMediumMatches = mediumMatches.filter((m) => m.ambiguous);
  const nonAmbiguousMediumMatches = mediumMatches.filter((m) => !m.ambiguous);
  const hasCorroboratedAmbiguousMatch =
    ambiguousMediumMatches.length > 0 && matched.length > ambiguousMediumMatches.length;
  const hasMediumSeverity = nonAmbiguousMediumMatches.length > 0 || hasCorroboratedAmbiguousMatch;

  // Decision logic:
  // - Any high severity match (that isn't a suppressed generic mention) = CRISIS
  // - Any non-ambiguous medium/warning match = CRISIS (ambiguous language still escalates)
  // - An "ambiguous" match only escalates when corroborated by another signal
  const isCrisis = hasHighSeverity || hasMediumSeverity;
  const severity = hasHighSeverity ? ('critical' as const) : ('high' as const);

  // Confidence calculation
  let confidence = 0;
  if (hasHighSeverity) {
    confidence = 0.95; // Very confident with high severity match
  } else if (hasMediumSeverity) {
    confidence = 0.7; // Medium confidence with warning patterns
  }

  return {
    isCrisis,
    severity: isCrisis ? severity : undefined,
    matchedPatterns: isSuppressedGenericMention ? [] : matchedPatterns,
    confidence,
  };
}

/**
 * Analyze emotional intensity in text to support crisis detection
 * Used as a secondary check for edge cases
 */
export function analyzeEmotionalIntensity(text: string): number {
  const intensityMarkers = [
    /!!+|\.\.\.+/g, // Excessive punctuation
    /\b(i can't|i can not|i won't|i will not|never|always|no way|absolutely)\b/gi, // Absolutist language
    /\b(dying|dead|death|pain|suffering|agony)\b/gi, // Distressing words
  ];

  let intensityScore = 0;
  for (const marker of intensityMarkers) {
    const matches = text.match(marker);
    if (matches) {
      intensityScore += matches.length;
    }
  }

  // Normalize to 0-1 scale
  return Math.min(intensityScore / 10, 1);
}

/**
 * Format crisis detection for logging/debugging
 */
export function formatCrisisDetectionLog(
  text: string,
  result: CrisisDetectionResult
): string {
  return `[CRISIS DETECTION] isCrisis=${result.isCrisis} | severity=${result.severity || 'n/a'} | confidence=${result.confidence.toFixed(2)} | matched=${result.matchedPatterns.length} patterns`;
}

export default { detectCrisis, analyzeEmotionalIntensity, formatCrisisDetectionLog };
