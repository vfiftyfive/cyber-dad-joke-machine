import { toast } from "sonner";

interface JokeResponse {
  joke: string;
  loading: boolean;
  error: string | null;
}

export const fetchDadJoke = async (): Promise<JokeResponse> => {
  try {
    // In development, use localhost:8000
    // In production, use relative URL since frontend and backend are in same container
    const API_URL = import.meta.env.PROD
      ? '/joke'
      : 'http://localhost:8000/joke';

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch joke: ${response.status} ${response.statusText} ${errorText}`);
    }

    const data = await response.json();
    if (!data.joke) {
      throw new Error('Invalid response format');
    }
    
    return { joke: data.joke, loading: false, error: null };
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error occurred';
    console.error("Error fetching dad joke:", {
      message: errorMessage,
      error
    });
    toast.error(`Failed to fetch joke: ${errorMessage}`);
    return { joke: "", loading: false, error: errorMessage };
  }
};
