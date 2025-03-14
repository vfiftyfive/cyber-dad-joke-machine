
import { toast } from "sonner";

interface JokeResponse {
  joke: string;
  loading: boolean;
  error: string | null;
}

export const fetchDadJoke = async (): Promise<JokeResponse> => {
  try {
    // First check if API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Missing OpenAI API key");
      return { 
        joke: "", 
        loading: false, 
        error: "OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables." 
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Fallback to a more reliable model
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
      const errorText = await response.text();
      let errorMessage = "Failed to fetch joke";
      
      try {
        // Try to parse as JSON to get the error message
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If not JSON, use the text as is
        errorMessage = errorText || errorMessage;
      }
      
      console.error("API Error:", errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const joke = data.choices[0]?.message?.content?.trim();
    
    if (!joke) {
      throw new Error("No joke was returned from the API");
    }

    return { joke, loading: false, error: null };
  } catch (error: any) {
    const errorMessage = error.message || "An unknown error occurred";
    console.error("Error fetching dad joke:", errorMessage);
    toast.error("Failed to fetch joke: " + errorMessage);
    return { joke: "", loading: false, error: errorMessage };
  }
};
