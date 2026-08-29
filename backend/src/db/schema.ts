/**
 * Database Schema
 *
 * This schema is compatible with both SQLite (development) and PostgreSQL (production).
 * Use the migration system to apply changes.
 */

export const SCHEMA_SQL = `
-- Users (authentication)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences (from onboarding)
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  preferred_support_style TEXT NOT NULL CHECK (preferred_support_style IN ('family_community', 'professional', 'solo', 'mixed')),
  topics_to_avoid TEXT, -- JSON array stored as text
  languages TEXT, -- JSON array stored as text
  cultural_context TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Safety Plans
CREATE TABLE IF NOT EXISTS safety_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  warning_signs TEXT NOT NULL, -- JSON array
  coping_strategies TEXT NOT NULL, -- JSON array
  trusted_contacts TEXT NOT NULL, -- JSON array
  reasons_to_stay_safe TEXT NOT NULL, -- JSON array
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crisis Resources (seeded from resources-db/resources.json)
CREATE TABLE IF NOT EXISTS crisis_resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('crisis_hotline', 'professional', 'support_group', 'online_resource')),
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  web TEXT,
  languages TEXT NOT NULL, -- JSON array
  availability TEXT NOT NULL CHECK (availability IN ('24/7', 'business_hours', 'specific_times')),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Mood Check-ins
CREATE TABLE IF NOT EXISTS mood_checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  mood_emoji TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Patterns (living profile / pattern detection)
CREATE TABLE IF NOT EXISTS user_patterns (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pattern_text TEXT NOT NULL,
  pattern_type TEXT,
  confidence REAL,
  evidence TEXT, -- JSON array
  first_detected TIMESTAMP,
  last_mentioned TIMESTAMP,
  frequency INTEGER
);

-- Conversations (user's chat threads)
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  detected_language TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Messages (individual turns within conversations)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_plans_user_id ON safety_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_resources_region ON crisis_resources(region);
CREATE INDEX IF NOT EXISTS idx_crisis_resources_type ON crisis_resources(type);
CREATE INDEX IF NOT EXISTS idx_mood_checkins_user_id ON mood_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_patterns_user_id ON user_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
`;

// NOTE: This schema documents the intended relational shape. The current MVP
// persistence layer (backend/src/db/jsonStore.ts) stores these same tables as
// flat JSON files instead of executing this SQL - see safety_plans, mood_checkins,
// user_patterns, conversations, and messages records under backend/data/. Swap in a real SQL engine against
// this schema when moving past the hackathon MVP.

// Type definitions for database rows
export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesRow {
  id: string;
  user_id: string;
  preferred_support_style: 'family_community' | 'professional' | 'solo' | 'mixed';
  topics_to_avoid: string; // JSON string
  languages: string; // JSON string
  cultural_context?: string;
  created_at: string;
  updated_at: string;
}

export interface SafetyPlanRow {
  id: string;
  user_id: string;
  warning_signs: string; // JSON string
  coping_strategies: string; // JSON string
  trusted_contacts: string; // JSON string
  reasons_to_stay_safe: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface CrisisResourceRow {
  id: string;
  name: string;
  type: 'crisis_hotline' | 'professional' | 'support_group' | 'online_resource';
  region: string;
  country: string;
  phone?: string;
  web?: string;
  languages: string; // JSON string
  availability: '24/7' | 'business_hours' | 'specific_times';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationRow {
  id: string;
  user_id: string;
  title: string;
  detected_language?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
