// User Preferences from Onboarding
export interface UserPreferences {
  id?: string;
  userId: string;
  name?: string;
  preferredSupportStyle: 'family_community' | 'professional' | 'solo' | 'mixed';
  topicsToAvoid: string[];
  // What the user says is on their mind right now (opposite of topicsToAvoid) —
  // captured during onboarding to focus the conversation, not to diagnose.
  topicsOfConcern?: string[];
  languages: string[];
  culturalContext?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Comfort mode: how the user wants support framed for this conversation
export type ComfortMode = 'just_listen' | 'problem_solve' | 'distract' | 'guide';

// Chat Message
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isCrisisResponse?: boolean;
  // Set when this message naturally references a pattern the AI has noticed
  // across the user's chat history — styled distinctly in the chat UI.
  messageType?: 'pattern_insight';
}

// Persisted conversation (one thread in a user's chat history)
export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// Safety Plan
export interface SafetyPlan {
  id?: string;
  userId: string;
  warningSigns: string[];
  copingStrategies: string[];
  trustedContacts: TrustedContact[];
  reasonsToStaySafe: string[];
  // Step 5, "Making space safer" — things to put out of reach on a hard day.
  environmentSafetySteps: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TrustedContact {
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  notes?: string;
}

// Crisis Response
export interface CrisisAlert {
  triggered: boolean;
  severity: 'high' | 'critical';
  message: string;
  resources: CrisisResource[];
}

// Crisis/Professional Resources
export interface CrisisResource {
  id: string;
  name: string;
  type: 'crisis_hotline' | 'professional' | 'support_group' | 'online_resource';
  region: string;
  country: string;
  // Absent = nationwide/not city-specific (shown regardless of city filter).
  city?: string;
  phone?: string;
  web?: string;
  languages: string[];
  availability: '24/7' | 'business_hours' | 'specific_times';
  description?: string;
  contexts?: string[];
  // Explicit `false` = contact details are a best-effort placeholder that
  // still needs a human to confirm before this ships to real users.
  verified?: boolean;
}

// Resources API response: personalized matches first, everything else after
export interface ResourcesResponse {
  matched: CrisisResource[];
  other: CrisisResource[];
}

// API Request/Response types
export interface ChatRequest {
  message: string;
  userId: string;
  preferences?: UserPreferences;
  comfortMode?: ComfortMode;
  conversationId?: string;
}

export interface ChatResponse {
  id: string;
  message: string;
  isCrisis: boolean;
  crisisAlert?: CrisisAlert;
  suggestedResources?: CrisisResource[];
  messageType?: 'pattern_insight';
  conversationId: string;
}

export interface OnboardingResponse {
  userId: string;
  preferences: UserPreferences;
}

// Safety Plan AI-suggested draft
export interface SafetyPlanDraft {
  warningSigns: string[];
  copingStrategies: string[];
  trustedContacts: Pick<TrustedContact, 'name' | 'relationship'>[];
  reasonsToStaySafe: string[];
  environmentSafetySteps: string[];
}

// Mood tracking
export interface MoodTrendPoint {
  date: string; // YYYY-MM-DD
  mood: number;
  emoji: string;
}

export interface MoodTrendResponse {
  data: MoodTrendPoint[];
  average: number;
}
