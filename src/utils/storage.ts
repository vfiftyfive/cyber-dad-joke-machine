
// Utility functions for localStorage operations

const STORAGE_KEYS = {
  API_KEY: 'openai_api_key'
};

export const getApiKey = (): string => {
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
};

export const setApiKey = (apiKey: string): void => {
  localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
};

export const clearApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEYS.API_KEY);
};
