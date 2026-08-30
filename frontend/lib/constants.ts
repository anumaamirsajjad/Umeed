// Onboarding flow configuration
export const SUPPORT_STYLE_OPTIONS = [
  {
    value: 'family_community',
    label: 'Talk to family or community members',
    description: 'I prefer to reach out to trusted family or community for support',
  },
  {
    value: 'professional',
    label: 'Speak with a professional',
    description: 'I prefer professional mental health support (therapy, counseling)',
  },
  {
    value: 'solo',
    label: 'Work through it on my own',
    description: 'I prefer to process things privately first',
  },
  {
    value: 'mixed',
    label: 'Mix of approaches',
    description: 'I use different approaches depending on the situation',
  },
];

// Screen 2 of onboarding ("What's on your mind?") — what the user wants to
// focus on, not what to avoid. Copy is deliberate, keep exact wording.
export const TOPICS_OF_CONCERN = [
  'Anxiety or worry',
  'Low mood',
  'Stress at work',
  'Loss or grief',
  'Relationships',
  'Sleep',
  'Identity & purpose',
  'Just checking in',
];

export const COMMON_TOPICS_TO_AVOID = [
  'Medical treatments',
  'Medication',
  'Psychiatric diagnosis',
  'Grief and loss',
  'Relationship issues',
  'Financial stress',
  'Work stress',
  'Identity and sexuality',
  'Discrimination',
  'Other (please specify)',
];

// Pakistan-focused phase: English and Roman Urdu lead the list; the rest
// follow alphabetically. Reorder here only — this stays a general list so
// it's easy to widen again as the product expands beyond Pakistan.
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ur', name: 'اردو / Roman Urdu' },
  { code: 'ar', name: 'العربية' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'pt', name: 'Português' },
  { code: 'zh', name: '中文' },
];

// sessionStorage key used to hand the current crisisAlert (matched resources,
// message, severity) from the chat page to the full-screen Safety Mode
// redirect — cleared as soon as the Safety Mode screen reads it.
export const CRISIS_ALERT_STORAGE_KEY = 'umeed-crisis-alert';

// sessionStorage key for the chat page's selected support style (comfort
// mode) — persisted so it survives the chat page unmounting when a crisis
// redirect sends the user to Safety Mode and back.
export const COMFORT_MODE_STORAGE_KEY = 'umeed-comfort-mode';

// App routes
export const ROUTES = {
  home: '/',
  signup: '/signup',
  login: '/login',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  chat: '/chat',
  profile: '/profile',
  safetyPlanBuilder: '/safety-plan/builder',
  safetyPlanView: '/safety-plan/view',
  resources: '/resources',
  mood: '/mood',
  crisis: '/crisis',
  breathe: '/crisis/breathe',
};

// Deliberately NOT defined here: a client-side crisis keyword list. Crisis
// detection is server-side only (see backend/src/services/crisisDetectionService.ts)
// so there is exactly one source of truth. A copy in the client would drift.
