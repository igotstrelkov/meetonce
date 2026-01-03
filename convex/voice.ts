import { v } from "convex/values";
import { action } from "./_generated/server";
import { processVoiceTranscript } from "./lib/openrouter";

/**
 * Process voice transcript and return optimized text
 */
export const processTranscript = action({
  args: {
    transcript: v.string(),
    type: v.union(v.literal("bio"), v.literal("preferences")),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    if (!args.transcript || args.transcript.trim().length === 0) {
      throw new Error("Transcript cannot be empty");
    }

    try {
      const processedText = await processVoiceTranscript(
        args.transcript,
        args.type
      );

      // Validate word count
      const wordCount = processedText
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

      if (args.type === "bio") {
        if (wordCount < 100 || wordCount > 500) {
          console.warn(
            `Bio word count ${wordCount} is outside range 100-500, retrying...`
          );
          // Retry with stricter prompt
          const retryText = await processVoiceTranscript(
            args.transcript +
              "\n\nIMPORTANT: The output MUST be between 100-500 words.",
            args.type
          );
          return retryText;
        }
      } else {
        if (wordCount < 100 || wordCount > 500) {
          console.warn(
            `Preferences word count ${wordCount} is outside range 100-500, retrying...`
          );
          // Retry with stricter prompt
          const retryText = await processVoiceTranscript(
            args.transcript +
              "\n\nIMPORTANT: The output MUST be between 100-500 words.",
            args.type
          );
          return retryText;
        }
      }

      return processedText;
    } catch (error: any) {
      console.error("Error processing transcript:", error);
      throw new Error(`Failed to process transcript: ${error.message}`);
    }
  },
});
