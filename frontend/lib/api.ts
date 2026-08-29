import axios, { AxiosInstance } from 'axios';
import { clearStoredAuth, getStoredAuth } from './authStorage';
import { ROUTES } from './constants';
import type {
  ChatRequest,
  ChatResponse,
  UserPreferences,
  OnboardingResponse,
  SafetyPlan,
  SafetyPlanDraft,
  CrisisResource,
  MoodTrendResponse,
  ResourcesResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
client.interceptors.request.use((config) => {
  const { token } = getStoredAuth();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on any protected endpoint means the session is gone (expired token,
// cleared storage, forged/invalid token) — clear local auth state and send
// the user to /login instead of leaving them on a page that looks logged in
// but silently fails every action. Login/signup's own 401s (wrong password)
// are excluded — those pages already show that error inline and must not be
// redirected away from themselves.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url || '';
    const isAuthOwn401 = url === '/auth/login' || url === '/auth/signup';
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      !isAuthOwn401
    ) {
      clearStoredAuth();
      if (window.location.pathname !== ROUTES.login) {
        window.location.href = ROUTES.login;
      }
    }
    return Promise.reject(error);
  }
);

// Health check
export const health = async (): Promise<{ status: string }> => {
  const { data } = await client.get('/health');
  return data;
};

// Chat endpoints
export const sendMessage = async (req: Omit<ChatRequest, 'userId'>): Promise<ChatResponse> => {
  const { data } = await client.post('/chat', req);
  return data;
};

export const startNewChat = async (): Promise<void> => {
  await client.post('/chat/new', {});
};

// Onboarding endpoints
export const savePreferences = async (
  preferences: Partial<UserPreferences>
): Promise<OnboardingResponse> => {
  const { data } = await client.post('/onboarding/preferences', preferences);
  return data;
};

export const getPreferences = async (): Promise<UserPreferences> => {
  const { data } = await client.get('/onboarding/preferences');
  return data;
};

export const checkOnboardingStatus = async (): Promise<{ completed: boolean; preferences: UserPreferences | null }> => {
  const { data } = await client.get('/onboarding/status');
  return data;
};

export const updatePreferences = async (
  preferences: Partial<UserPreferences>
): Promise<{ success: boolean; preferences: UserPreferences }> => {
  const { data } = await client.put('/onboarding/preferences', preferences);
  return data;
};

// Safety plan endpoints
export const saveSafetyPlan = async (
  plan: Partial<SafetyPlan>
): Promise<SafetyPlan> => {
  const { data } = await client.post('/safety-plan', plan);
  return data;
};

export const getSafetyPlan = async (): Promise<SafetyPlan | null> => {
  try {
    const { data } = await client.get('/safety-plan');
    return data;
  } catch (error) {
    // 404 = no plan yet
    return null;
  }
};

export const exportSafetyPlanPDF = async (): Promise<Blob> => {
  const { data } = await client.get('/safety-plan/export', {
    responseType: 'blob',
  });
  return data;
};

export const getSafetyPlanSuggestions = async (): Promise<SafetyPlanDraft> => {
  const { data } = await client.get('/safety-plan/suggestions');
  return data;
};

// Mood tracking endpoints
export const submitMoodCheckin = async (
  moodScore: number,
  moodEmoji: string
): Promise<void> => {
  await client.post('/mood/checkin', { moodScore, moodEmoji });
};

export const getMoodTrend = async (days = 7): Promise<MoodTrendResponse> => {
  const { data } = await client.get('/mood/trend', { params: { days } });
  return data;
};

export const getMoodCheckinStatus = async (): Promise<{ checkedInToday: boolean }> => {
  const { data } = await client.get('/mood/status');
  return data;
};

// Resources endpoints
export const getResources = async (filters?: {
  region?: string;
  country?: string;
  city?: string;
  type?: string;
}): Promise<ResourcesResponse> => {
  const { data } = await client.get('/resources', { params: filters });
  return data;
};

export const searchResources = async (query: string): Promise<CrisisResource[]> => {
  const { data } = await client.get('/resources/search', { params: { q: query } });
  return data;
};

// Auth endpoints - profile and password
export const resetPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  const { data } = await client.post('/auth/password-reset', {
    currentPassword,
    newPassword,
  });
  return data;
};

export default client;
