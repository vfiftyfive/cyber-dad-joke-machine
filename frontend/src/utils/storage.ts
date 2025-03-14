// Utility functions for localStorage and environment variables

const STORAGE_KEYS = {
  API_KEY: 'openai_api_key'
};

export const getApiKey = (): string => {
  // Get API key from environment variable
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envApiKey) return envApiKey;
  
  // Fallback to localStorage if not in environment
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
};

export const setApiKey = (apiKey: string): void => {
  localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
};

export const clearApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEYS.API_KEY);
};
