import { v } from "convex/values";
import { action } from "./_generated/server";
import { processVoiceTranscript } from "./lib/openrouter";
import { getOrCreateAssistant } from "./lib/vapi";

/**
 * Create or get Bio assistant ID
 */
export const getBioAssistant = action({
  args: {},
  returns: v.string(),
  handler: async () => {
    return await getOrCreateAssistant("bio");
  },
});

/**
 * Create or get Preferences assistant ID
 */
export const getPreferencesAssistant = action({
  args: {},
  returns: v.string(),
  handler: async () => {
    return await getOrCreateAssistant("preferences");
  },
});

/**
 * Process voice transcript and return optimized text with extracted interests
 * Includes validation to detect insufficient transcripts
 */
export const processTranscript = action({
  args: {
    transcript: v.string(),
    type: v.union(v.literal("bio"), v.literal("preferences")),
  },
  returns: v.union(
    v.object({
      success: v.literal(true),
      bio: v.string(),
      interests: v.array(v.string()),
    }),
    v.object({
      success: v.literal(true),
      preferences: v.string(),
      interests: v.array(v.string()),
    }),
    v.object({
      success: v.literal(false),
      reason: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    if (!args.transcript || args.transcript.trim().length === 0) {
      return {
        success: false as const,
        reason: "No response was recorded. Please try again and speak clearly.",
      };
    }

    try {
      const result = await processVoiceTranscript(args.transcript, args.type);
      return result;
    } catch (error: any) {
      console.error("Error processing transcript:", error);
      throw new Error(`Failed to process transcript: ${error.message}`);
    }
  },
});
