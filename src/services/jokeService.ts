
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
    return { 
      joke: "", 
      loading: false, 
      error: "No API key provided. Please configure your OpenAI API key in settings." 
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
            content: "You are a dad joke generator. Respond with only a short, funny dad joke. No explanations or other text."
          },
          {
            role: "user",
            content: "Tell me a dad joke"
          }
        ],
        temperature: 0.7,
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
      toast.error("Invalid API key. Please check your settings.");
    } else {
      toast.error("Failed to fetch joke. Please try again.");
    }
    
    return { joke: "", loading: false, error: error.message };
  }
};
