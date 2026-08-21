// User Preferences from Onboarding
export interface UserPreferences {
  id?: string;
  userId: string;
  preferredSupportStyle: 'family_community' | 'professional' | 'solo' | 'mixed';
  topicsToAvoid: string[];
  languages: string[];
  culturalContext?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Chat Message
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isCrisisResponse?: boolean;
}

// Safety Plan
export interface SafetyPlan {
  id?: string;
  userId: string;
  warningSigns: string[];
  copingStrategies: string[];
  trustedContacts: TrustedContact[];
  reasonsToStaySafe: string[];
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
  phone?: string;
  web?: string;
  languages: string[];
  availability: '24/7' | 'business_hours' | 'specific_times';
  description?: string;
}

// API Request/Response types
export interface ChatRequest {
  message: string;
  userId: string;
  preferences?: UserPreferences;
}

export interface ChatResponse {
  id: string;
  message: string;
  isCrisis: boolean;
  crisisAlert?: CrisisAlert;
  suggestedResources?: CrisisResource[];
}

export interface OnboardingResponse {
  userId: string;
  preferences: UserPreferences;
}
