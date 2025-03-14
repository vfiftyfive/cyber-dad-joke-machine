
import { toast } from "sonner";
import { getApiKey } from "../utils/storage";

interface JokeResponse {
  joke: string;
  loading: boolean;
  error: string | null;
}

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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a dad joke generator. Respond with only a short, funny dad joke. Ensure each joke is unique and different from previous ones. No explanations or other text."
          },
          {
            role: "user",
            content: "Tell me a fresh dad joke that's different from standard ones"
          }
        ],
        temperature: 1.5,
        top_p: 0.9,
        frequency_penalty: 0.8,
        presence_penalty: 0.6,
        max_tokens: 100
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
