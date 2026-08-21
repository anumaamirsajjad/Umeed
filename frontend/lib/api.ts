import axios, { AxiosInstance } from 'axios';
import type {
  ChatRequest,
  ChatResponse,
  UserPreferences,
  OnboardingResponse,
  SafetyPlan,
  CrisisResource,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const health = async (): Promise<{ status: string }> => {
  const { data } = await client.get('/health');
  return data;
};

// Chat endpoints
export const sendMessage = async (req: ChatRequest): Promise<ChatResponse> => {
  const { data } = await client.post('/chat', req);
  return data;
};

// Onboarding endpoints
export const savePreferences = async (
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<OnboardingResponse> => {
  const { data } = await client.post('/onboarding/preferences', {
    userId,
    ...preferences,
  });
  return data;
};

export const getPreferences = async (userId: string): Promise<UserPreferences> => {
  const { data } = await client.get(`/onboarding/preferences/${userId}`);
  return data;
};

// Safety plan endpoints
export const saveSafetyPlan = async (
  userId: string,
  plan: Partial<SafetyPlan>
): Promise<SafetyPlan> => {
  const { data } = await client.post('/safety-plan', { userId, ...plan });
  return data;
};

export const getSafetyPlan = async (userId: string): Promise<SafetyPlan | null> => {
  try {
    const { data } = await client.get(`/safety-plan/${userId}`);
    return data;
  } catch (error) {
    // 404 = no plan yet
    return null;
  }
};

export const exportSafetyPlanPDF = async (userId: string): Promise<Blob> => {
  const { data } = await client.get(`/safety-plan/${userId}/export`, {
    responseType: 'blob',
  });
  return data;
};

// Resources endpoints
export const getResources = async (filters?: {
  region?: string;
  country?: string;
  type?: string;
}): Promise<CrisisResource[]> => {
  const { data } = await client.get('/resources', { params: filters });
  return data;
};

export const searchResources = async (query: string): Promise<CrisisResource[]> => {
  const { data } = await client.get('/resources/search', { params: { q: query } });
  return data;
};

export default client;
