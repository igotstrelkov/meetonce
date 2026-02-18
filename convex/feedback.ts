import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export const submitPassFeedback = mutation({
  args: {
    matchId: v.id("weeklyMatches"),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }
    await ctx.db.insert("passReasons", {
      ...args,
      userId: currentUser._id,
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
      v.literal("no_show"),
      v.literal("cancelled_by_them"),
      v.literal("cancelled_by_me"),
      v.literal("rescheduled")
    ),
    overallRating: v.optional(v.number()),
    wouldMeetAgain: v.optional(
      v.union(v.literal("yes"), v.literal("maybe"), v.literal("no"))
    ),
    wentWell: v.optional(v.array(v.string())),
    wentPoorly: v.optional(v.array(v.string())),
    venueRating: v.optional(
      v.union(
        v.literal("perfect"),
        v.literal("good"),
        v.literal("okay"),
        v.literal("not_good"),
        v.literal("went_elsewhere")
      )
    ),
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
        .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
        .filter((q) => q.neq(q.field("userId"), args.userId))
        .first();

      if (otherFeedback?.wouldMeetAgain === "yes") {
        // MUTUAL SECOND DATE! 🎉
        console.log("🎉 MUTUAL SECOND DATE INTEREST!");

        // Get both users and the match
        const user = await ctx.db.get(args.userId);
        const matchUser = await ctx.db.get(args.matchUserId);

        if (user && matchUser) {
          // Send contact info to both users
          await ctx.scheduler.runAfter(
            0,
            internal.emails.sendSecondDateContactEmail,
            {
              to: user.email,
              userName: user.firstName,
              matchName: matchUser.firstName,
              matchEmail: matchUser.email,
            }
          );

          await ctx.scheduler.runAfter(
            0,
            internal.emails.sendSecondDateContactEmail,
            {
              to: matchUser.email,
              userName: matchUser.firstName,
              matchName: user.firstName,
              matchEmail: user.email,
            }
          );
        }
      }
    }

    // Ghosting detection: ban the other user if they cancelled on a mutual match
    if (args.dateHappened === "cancelled_by_them" || args.dateHappened === "no_show") {
      const match = await ctx.db.get(args.matchId);
      if (match?.mutualMatch === true) {
        const ghoster = await ctx.db.get(args.matchUserId);
        if (ghoster) {
          await ctx.scheduler.runAfter(
            0,
            internal.emails.sendGhostingBanEmail,
            {
              userId: args.matchUserId,
              to: ghoster.email,
              userName: ghoster.firstName,
            }
          );
        }
      }
    }
  },
});

export const getFeedbackForMatch = query({
  args: { matchId: v.id("weeklyMatches"), userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dateOutcomes")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
  },
});

export const getDateOutcome = query({
  args: { matchId: v.id("weeklyMatches") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Check if user has provided feedback for this match
    const outcome = await ctx.db
      .query("dateOutcomes")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("userId"), currentUser._id))
      .first();

    if (!outcome) {
      throw new Error("Date outcome not found");
    }

    return {
      ...outcome,
    };
  },
});
