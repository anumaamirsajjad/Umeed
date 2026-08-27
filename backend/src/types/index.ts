// User Preferences
export interface UserPreferences {
  id: string;
  userId: string;
  name?: string;
  preferredSupportStyle: 'family_community' | 'professional' | 'solo' | 'mixed';
  topicsToAvoid: string[];
  // What the user says is on their mind right now (opposite of topicsToAvoid).
  topicsOfConcern?: string[];
  languages: string[];
  culturalContext?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Safety Plan
export interface SafetyPlan {
  id: string;
  userId: string;
  warningSigns: string[];
  copingStrategies: string[];
  trustedContacts: TrustedContact[];
  reasonsToStaySafe: string[];
  // Step 5, "Making space safer" — things to put out of reach on a hard day.
  environmentSafetySteps: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TrustedContact {
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  notes?: string;
}

// Crisis Resource
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
  // Preference-based tags for smart matching (mirrors UserPreferences.preferredSupportStyle
  // values) — never demographic. See resourcesService.matchForUser.
  contexts?: string[];
  // Explicit `false` = contact details are a best-effort placeholder that
  // still needs a human to confirm before this ships to real users.
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Crisis Detection Result
export interface CrisisDetectionResult {
  isCrisis: boolean;
  severity?: 'high' | 'critical';
  matchedPatterns: string[];
  confidence: number;
}

// API Types
export interface ChatRequest {
  message: string;
  userId: string;
  preferences?: Partial<UserPreferences>;
  comfortMode?: 'just_listen' | 'problem_solve' | 'distract' | 'guide';
}

export interface ChatResponse {
  id: string;
  message: string;
  isCrisis: boolean;
  crisisAlert?: {
    triggered: boolean;
    severity: 'high' | 'critical';
    message: string;
    resources: CrisisResource[];
  };
  suggestedResources?: CrisisResource[];
  // Set when this reply naturally references a pattern noticed across the user's
  // chat history (see patternDetectionService) — lets the frontend style it distinctly.
  messageType?: 'pattern_insight';
}

export interface OnboardingRequest {
  userId: string;
  name?: string;
  preferredSupportStyle: 'family_community' | 'professional' | 'solo' | 'mixed';
  topicsToAvoid?: string[];
  topicsOfConcern?: string[];
  languages?: string[];
  culturalContext?: string;
}
