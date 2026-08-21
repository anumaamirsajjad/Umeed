// User Preferences
export interface UserPreferences {
  id: string;
  userId: string;
  preferredSupportStyle: 'family_community' | 'professional' | 'solo' | 'mixed';
  topicsToAvoid: string[];
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
  phone?: string;
  web?: string;
  languages: string[];
  availability: '24/7' | 'business_hours' | 'specific_times';
  description?: string;
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
}

export interface OnboardingRequest {
  userId: string;
  preferredSupportStyle: 'family_community' | 'professional' | 'solo' | 'mixed';
  topicsToAvoid?: string[];
  languages?: string[];
  culturalContext?: string;
}
