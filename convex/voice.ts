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
 */
export const processTranscript = action({
  args: {
    transcript: v.string(),
    type: v.union(v.literal("bio"), v.literal("preferences")),
  },
  returns: v.union(
    v.object({ bio: v.string(), interests: v.array(v.string()) }),
    v.object({ preferences: v.string(), interests: v.array(v.string()) })
  ),
  handler: async (ctx, args) => {
    if (!args.transcript || args.transcript.trim().length === 0) {
      throw new Error("Transcript cannot be empty");
    }

    try {
      const result = await processVoiceTranscript(args.transcript, args.type);

      // const textField =
      //   args.type === "bio"
      //     ? (result as { bio: string; interests: string[] }).bio
      //     : (result as { preferences: string; interests: string[] })
      //         .preferences;

      // const wordCount = textField
      //   .trim()
      //   .split(/\s+/)
      //   .filter(Boolean).length;

      // if (wordCount < 100 || wordCount > 500) {
      //   console.warn(
      //     `${args.type} word count ${wordCount} is outside range 100-500, retrying...`
      //   );

      //   const retryResult = await processVoiceTranscript(
      //     args.transcript +
      //       "\n\nIMPORTANT: The output MUST be between 100-500 words.",
      //     args.type
      //   );
      //   return retryResult;
      // }

      // if (!result.interests || result.interests.length < 3) {
      //   console.warn(
      //     `${args.type} extracted fewer than 3 interests (${result.interests?.length || 0}), retrying...`
      //   );

      //   const retryResult = await processVoiceTranscript(
      //     args.transcript +
      //       "\n\nIMPORTANT: Extract at least 5 specific interests from the transcript.",
      //     args.type
      //   );
      //   return retryResult;
      // }

      return result;
    } catch (error: any) {
      console.error("Error processing transcript:", error);
      throw new Error(`Failed to process transcript: ${error.message}`);
    }
  },
});
