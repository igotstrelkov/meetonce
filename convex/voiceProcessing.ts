import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Generate optimized bio from voice transcript
 * Takes a conversation transcript and creates a vector-search-optimized bio
 */
export const generateBioFromTranscript = action({
  args: {
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const systemPrompt = `You are an expert dating profile writer. Your task is to transform a voice conversation transcript into a compelling, authentic bio for a dating platform.

Guidelines:
- Extract the most interesting and relevant information about the person
- Write in first person, as if the person is speaking directly
- Keep the tone warm, genuine, and conversational
- Highlight personality traits, passions, values, and what makes them unique
- Include specific details that make the profile memorable
- Optimize for semantic search by including key descriptive terms naturally
- Length: 500-1000 words
- Focus on substance over clichés
- Avoid generic phrases like "I love to laugh" or "looking for adventure"

Output ONLY the bio text, nothing else. No meta-commentary, no JSON, just the bio itself.`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "",
          "X-Title": process.env.OPENROUTER_APP_NAME || "MeetOnce",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Here is the conversation transcript:\n\n${args.transcript}\n\nGenerate the bio:`,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const bio = data.choices[0]?.message?.content?.trim();

      if (!bio) {
        throw new Error("Failed to generate bio from OpenRouter response");
      }

      return bio;
    } catch (error) {
      console.error("Error generating bio from transcript:", error);
      throw error;
    }
  },
});

/**
 * Generate optimized "looking for" description from voice transcript
 * Takes a conversation transcript and creates a vector-search-optimized description
 */
export const generateLookingForFromTranscript = action({
  args: {
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const systemPrompt = `You are an expert dating profile writer. Your task is to transform a voice conversation transcript into a clear, authentic description of what someone is looking for in a partner.

Guidelines:
- Extract the key qualities, values, and traits they mentioned wanting in a partner
- Write in first person, as if the person is speaking directly
- Keep the tone warm, genuine, and specific
- Include both personality traits and lifestyle compatibility factors
- Be honest about what they're looking for without being overly demanding
- Optimize for semantic search by including key descriptive terms naturally
- Length: 200-400 words
- Focus on meaningful compatibility factors
- Avoid generic phrases like "someone who makes me laugh" or "my best friend"

Output ONLY the description text, nothing else. No meta-commentary, no JSON, just the description itself.`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "",
          "X-Title": process.env.OPENROUTER_APP_NAME || "MeetOnce",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Here is the conversation transcript:\n\n${args.transcript}\n\nGenerate the 'looking for' description:`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const lookingFor = data.choices[0]?.message?.content?.trim();

      if (!lookingFor) {
        throw new Error("Failed to generate looking for description from OpenRouter response");
      }

      return lookingFor;
    } catch (error) {
      console.error("Error generating looking for description from transcript:", error);
      throw error;
    }
  },
});
