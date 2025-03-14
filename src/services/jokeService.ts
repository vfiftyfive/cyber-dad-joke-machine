
import { toast } from "sonner";
import { getApiKey } from "../utils/storage";

interface JokeResponse {
  joke: string;
  loading: boolean;
  error: string | null;
}

// Keep track of previously seen jokes to avoid repetition
const seenJokes = new Set<string>();

export const fetchDadJoke = async (): Promise<JokeResponse> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("No API key found in environment variables or local storage");
    toast.error("API key not configured");
    return { 
      joke: "", 
      loading: false, 
      error: "No API key available" 
    };
  }

  try {
    // Add a unique seed value and timestamp to force variation
    const timestamp = new Date().getTime();
    const seed = Math.random().toString(36).substring(2, 15);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        // Add cache control headers
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",  // Changed from gpt-4o to gpt-3.5-turbo
        messages: [
          {
            role: "system",
            content: "You are a dad joke generator. Generate original, funny dad jokes that are different each time. Each joke should be clean, appropriate, and follow the classic dad joke format - usually involving a pun or wordplay. Respond with ONLY the joke text, nothing else."
          },
          {
            role: "user",
            content: `Tell me an original dad joke that I haven't heard before. Make it coherent and clever. Use this random seed: ${seed} and timestamp: ${timestamp} to ensure uniqueness.`
          }
        ],
        temperature: 0.9,  // Keep balanced temperature for creativity with coherence
        top_p: 0.95,       // Slight filtering to avoid the most improbable tokens
        frequency_penalty: 0.7,  // Discourage repetition but not too aggressively
        presence_penalty: 0.7,   // Encourage new content but not excessively
        max_tokens: 150,
        user: `user_${timestamp}_${seed}`,  // Keep unique identifier
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to fetch joke");
    }

    const data = await response.json();
    const joke = data.choices[0]?.message?.content?.trim();
    
    if (!joke) {
      throw new Error("No joke was returned from the API");
    }

    // Check if we've seen this joke before
    if (seenJokes.has(joke)) {
      console.log("Duplicate joke detected, fetching a new one");
      // If this is a duplicate, try again with a different seed
      return fetchDadJoke();
    }

    // Add this joke to our seen jokes set
    seenJokes.add(joke);
    
    // Limit the size of the set to prevent memory issues
    if (seenJokes.size > 100) {
      // Convert to array, remove the oldest joke, convert back to set
      const jokesArray = Array.from(seenJokes);
      seenJokes.clear();
      jokesArray.slice(1).forEach(j => seenJokes.add(j));
    }

    return { joke, loading: false, error: null };
  } catch (error: any) {
    console.error("Error fetching dad joke:", error);
    
    // Check for API key related errors
    const errorMsg = error.message || "";
    if (errorMsg.includes("API key") || errorMsg.includes("auth") || errorMsg.includes("Authentication")) {
      toast.error("Invalid API key. Please check your environment variables.");
    } else {
      toast.error("Failed to fetch joke. Please try again.");
    }
    
    return { joke: "", loading: false, error: error.message };
  }
};
