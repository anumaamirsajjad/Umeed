import type { DetectedLanguage } from '../types/index.js';

/**
 * Lightweight heuristic language/register detection (no extra LLM call).
 *
 * Distinguishes English, Roman Urdu, Roman Punjabi, and code-switched mixes
 * thereof — very common in Pakistani texting (e.g. "yar I'm just not
 * feeling good today"). This governs which register the system prompt
 * instructs the model to reply in; it is intentionally separate from
 * crisis-language matching in crisisDetectionService.ts.
 */

// Common Roman Urdu function/marker words
const ROMAN_URDU_WORDS = [
  'yar', 'yaar', 'acha', 'accha', 'nahi', 'nahin', 'nai', 'kya', 'hai', 'hain',
  'mera', 'meri', 'mujhe', 'tumhe', 'tumhara', 'tera', 'teri', 'uska', 'uski',
  'kyun', 'kyu', 'matlab', 'theek', 'thek', 'bohat', 'bahut', 'zindagi',
  'pareshan', 'pata', 'han', 'haan', 'bilkul', 'wala', 'wali', 'karo', 'kar',
  'raha', 'rahi', 'rahe', 'hoga', 'hogi', 'lag', 'dil', 'ghar', 'abhi', 'kuch',
  'sab', 'bhi', 'bas', 'apna', 'apni', 'phir', 'toh',
];

// Common Roman Punjabi function/marker words (distinct from Urdu where possible)
const ROMAN_PUNJABI_WORDS = [
  'ki', 'kithe', 'tuhada', 'tuhadi', 'sanu', 'menu', 'ni', 'changa', 'changi',
  'kado', 'kadon', 'oye', 'paaji', 'veer', 'mainu', 'tenu', 'assi', 'tussi',
  'ghar', 'kamm', 'jado', 'odo', 'ae', 'aa', 'nai', 'karda', 'kardi',
];

function countMatches(text: string, words: string[]): number {
  const tokens = text.toLowerCase().split(/[^a-z']+/).filter(Boolean);
  const tokenSet = new Set(tokens);
  let count = 0;
  for (const word of words) {
    if (tokenSet.has(word)) count++;
  }
  return count;
}

export interface LanguageDetectionResult {
  label: DetectedLanguage;
  confidence: number; // 0-1, based on marker word density
}

export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || !text.trim()) {
    return { label: 'english', confidence: 0 };
  }

  const urduHits = countMatches(text, ROMAN_URDU_WORDS);
  const punjabiHits = countMatches(text, ROMAN_PUNJABI_WORDS);
  const desiHits = urduHits + punjabiHits;

  const tokenCount = text.split(/\s+/).filter(Boolean).length;
  const hasLatinEnglishWords = /\b(the|is|are|and|but|to|my|i|not|feel|feeling)\b/i.test(text);

  if (desiHits === 0) {
    return { label: 'english', confidence: hasLatinEnglishWords ? 0.6 : 0.3 };
  }

  const desiRatio = desiHits / Math.max(tokenCount, 1);

  if (hasLatinEnglishWords) {
    // Mix of English words and Roman Urdu/Punjabi markers in the same message
    return { label: 'code_switched', confidence: Math.min(0.5 + desiRatio, 0.95) };
  }

  if (punjabiHits > urduHits) {
    return { label: 'roman_punjabi', confidence: Math.min(0.5 + desiRatio, 0.95) };
  }

  return { label: 'roman_urdu', confidence: Math.min(0.5 + desiRatio, 0.95) };
}

export default { detectLanguage };
