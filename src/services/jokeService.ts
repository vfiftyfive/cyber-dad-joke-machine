
import { toast } from "sonner";

interface JokeResponse {
  joke: string;
  loading: boolean;
  error: string | null;
}

export const fetchDadJoke = async (): Promise<JokeResponse> => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
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
    toast.error("Failed to fetch joke. Please try again.");
    return { joke: "", loading: false, error: error.message };
  }
};
