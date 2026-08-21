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

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
];

// App routes
export const ROUTES = {
  home: '/',
  onboarding: '/onboarding',
  chat: '/chat',
  safetyPlanBuilder: '/safety-plan/builder',
  safetyPlanView: '/safety-plan/view',
  resources: '/resources',
};

// UI Constants
export const APP_NAME = 'Cultural Context-Aware Mental Health First Aid';
export const APP_TAGLINE = 'Your supportive companion for mental wellbeing';

// Crisis escalation thresholds
export const CRISIS_KEYWORDS = [
  'suicide',
  'suicidal',
  'kill myself',
  'end my life',
  'no reason to live',
  'better off dead',
  'harm myself',
  'self-harm',
  'hurting myself',
  'cut myself',
  'overdose',
];

// Common regions for resources filtering
export const REGIONS = [
  { code: 'north-america', label: 'North America' },
  { code: 'central-america', label: 'Central America' },
  { code: 'south-america', label: 'South America' },
  { code: 'europe', label: 'Europe' },
  { code: 'middle-east', label: 'Middle East' },
  { code: 'africa', label: 'Africa' },
  { code: 'south-asia', label: 'South Asia' },
  { code: 'southeast-asia', label: 'Southeast Asia' },
  { code: 'east-asia', label: 'East Asia' },
  { code: 'oceania', label: 'Oceania' },
];
