import type { CrisisDetectionResult } from '../types/index.js';

/**
 * CRITICAL SAFETY SERVICE
 *
 * Crisis detection runs server-side as an independent safety net.
 * It does NOT replace the LLM's judgment but augments it.
 * This service errs on the side of caution: ambiguous language → escalate.
 *
 * See docs/CRISIS_DETECTION.md for test cases and methodology.
 */

// High-confidence crisis indicators
const CRISIS_PATTERNS = [
  // Explicit suicidal ideation
  /suicide|suicidal/i,
  /kill\s*myself|kill\s*me/i,
  /end\s*my\s*life|end\s*it\s*all/i,
  /no\s*reason\s*to\s*live|no\s*point\s*in\s*living/i,
  /better\s*off\s*dead|world\s*better\s*without\s*me/i,
  /want\s*to\s*die|going\s*to\s*die/i,
  /wish\s*i\s*were\s*dead|wish\s*i\s*was\s*dead/i,

  // Self-harm
  /cut\s*myself|cutting\s*myself/i,
  /hurt\s*myself|hurting\s*myself/i,
  /self.?harm|self.?injure/i,
  /slash\s*wrist|slit\s*wrist/i,
  /bang\s*head|hit\s*myself/i,

  // Overdose/poisoning
  /overdose|take\s*pills|swallow\s*pills/i,
  /poison|toxin/i,

  // Methods indication
  /jump\s*off|jump\s*from/i,
  /hang\s*myself|hang\s*myself/i,
  /gun|shoot\s*myself/i,
  /rope|noose/i,

  // Hopelessness/Despair (broader, requires context)
  /hopeless|no\s*hope/i,
  /worthless|no\s*worth/i,
  /pointless|no\s*point/i,
  /can't\s*go\s*on|cannot\s*go\s*on/i,
  /give\s*up|giving\s*up/i,

  // Goodbye/Farewell language
  /goodbye|farewell|last\s*goodbye/i,
  /telling\s*people\s*goodbye|saying\s*goodbye/i,
];

// Medium-confidence patterns (require more context, but still escalate)
const WARNING_PATTERNS = [
  /don't\s*want\s*to\s*live/i,
  /tired\s*of\s*living/i,
  /can't\s*do\s*this/i,
  /it's\s*too\s*much/i,
  /everyone\s*would\s*be\s*better/i,
  /no\s*one\s*cares/i,
  /all\s*alone|completely\s*alone/i,
  /nobody\s*needs\s*me/i,
  /totally\s*broken/i,
];

interface PatternMatch {
  pattern: RegExp;
  severity: 'high' | 'medium';
}

const ALL_PATTERNS: PatternMatch[] = [
  ...CRISIS_PATTERNS.map((p) => ({ pattern: p, severity: 'high' as const })),
  ...WARNING_PATTERNS.map((p) => ({ pattern: p, severity: 'medium' as const })),
];

export function detectCrisis(text: string): CrisisDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      isCrisis: false,
      matchedPatterns: [],
      confidence: 0,
    };
  }

  const matchedPatterns: string[] = [];
  let hasHighSeverity = false;
  let hasMediumSeverity = false;

  // Check all patterns
  for (const { pattern, severity } of ALL_PATTERNS) {
    if (pattern.test(text)) {
      matchedPatterns.push(pattern.source);
      if (severity === 'high') {
        hasHighSeverity = true;
      } else {
        hasMediumSeverity = true;
      }
    }
  }

  // Decision logic:
  // - High severity match + 50+ character context = CRISIS
  // - Multiple medium severity + high emotional tone = CRISIS
  // - Single high severity = CRISIS
  const isCrisis = hasHighSeverity || (hasMediumSeverity && matchedPatterns.length >= 2);
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
    matchedPatterns,
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
