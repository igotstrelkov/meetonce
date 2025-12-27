import { createOpenRouter } from '@openrouter/ai-sdk-provider';
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  response_format?: { type: "json_object" };
  temperature?: number;
  max_tokens?: number;
}

export async function callOpenRouter(
  request: OpenRouterRequest
): Promise<any> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  return await response.json();
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.EMBEDDING_MODEL ?? "openai/text-embedding-3-small",
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding generation failed: ${await response.text()}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function callWithRetry(
  request: OpenRouterRequest,
  maxRetries = 3
): Promise<any> {
  let delay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callOpenRouter(request);
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;

      if (error.message.includes("429")) {
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      if (error.message.includes("503")) {
        console.log("Model unavailable, using fallback...");
        return await callOpenRouter({
          ...request,
          model: process.env.FALLBACK_MODEL ?? "meta-llama/llama-3-8b-instruct:free"
        });
      }

      throw error;
    }
  }
}
