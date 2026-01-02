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

/**
 * Process voice interview transcript into optimized bio or preferences text
 */
export async function processVoiceTranscript(
  transcript: string,
  type: "bio" | "preferences"
): Promise<string> {
  const systemPrompts = {
    bio: `You are a professional dating profile writer. Convert this voice interview transcript into a compelling, authentic bio (50-300 words).

REQUIREMENTS:
- Write in first person
- Capture their personality and authenticity
- Focus on specifics, not generics
- Natural, conversational tone
- Remove filler words and repetition
- Organize into coherent narrative

OUTPUT FORMAT: Single paragraph bio (50-300 words)`,

    preferences: `You are a professional dating profile writer. Convert this voice interview transcript into clear relationship preferences (20-100 words).

REQUIREMENTS:
- Write in first person
- Focus on values and compatibility
- Be specific about what matters
- Positive framing (what they want, not just what they don't)
- Remove filler words

OUTPUT FORMAT: Single paragraph preferences (20-100 words)`,
  };

  const response = await callOpenRouter({
    model: "openai/gpt-4o",
    messages: [
      {
        role: "system",
        content: systemPrompts[type],
      },
      {
        role: "user",
        content: `TRANSCRIPT:\n${transcript}\n\nGenerate the optimized ${type}.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content.trim();
}
