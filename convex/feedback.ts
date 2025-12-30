import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitPassFeedback = mutation({
  args: {
    matchId: v.id("weeklyMatches"),
    userId: v.id("users"),
    matchUserId: v.id("users"),
    weekOf: v.string(),
    reason: v.union(
      v.literal("too_far"),
      v.literal("lifestyle"),
      v.literal("attraction"),
      v.literal("profile"),
      v.literal("dealbreaker"),
      v.literal("no_chemistry"),
      v.literal("skipped")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("passReasons", {
      ...args,
      providedAt: Date.now(),
    });
  },
});

export const submitDateFeedback = mutation({
  args: {
    matchId: v.id("weeklyMatches"),
    userId: v.id("users"),
    matchUserId: v.id("users"),
    weekOf: v.string(),
    dateHappened: v.union(
      v.literal("yes"),
      v.literal("cancelled_by_them"),
      v.literal("cancelled_by_me"),
      v.literal("rescheduled")
    ),
    overallRating: v.optional(v.number()),
    wouldMeetAgain: v.optional(v.union(
      v.literal("yes"),
      v.literal("maybe"),
      v.literal("no")
    )),
    wentWell: v.optional(v.array(v.string())),
    wentPoorly: v.optional(v.array(v.string())),
    conversationStartersHelpful: v.optional(v.union(
      v.literal("very"),
      v.literal("somewhat"),
      v.literal("not_used"),
      v.literal("not_helpful")
    )),
    venueRating: v.optional(v.union(
      v.literal("perfect"),
      v.literal("good"),
      v.literal("okay"),
      v.literal("not_good"),
      v.literal("went_elsewhere")
    )),
    additionalThoughts: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Store feedback
    await ctx.db.insert("dateOutcomes", {
      ...args,
      providedAt: Date.now(),
      feedbackProvided: true,
    });

    // Check for mutual second date interest
    if (args.wouldMeetAgain === "yes") {
      const otherFeedback = await ctx.db
        .query("dateOutcomes")
        .withIndex("by_match", q => q.eq("matchId", args.matchId))
        .filter(q => q.neq(q.field("userId"), args.userId))
        .first();

      if (otherFeedback?.wouldMeetAgain === "yes") {
        // MUTUAL SECOND DATE! 🎉
        console.log("🎉 MUTUAL SECOND DATE INTEREST!");
        // TODO: Send email with contact info
      }
    }
  },
});

export const getFeedbackForMatch = query({
  args: { matchId: v.id("weeklyMatches"), userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dateOutcomes")
      .withIndex("by_match", q => q.eq("matchId", args.matchId))
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();
  },
});
