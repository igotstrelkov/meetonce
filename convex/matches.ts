import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { getWeekOfString } from "./lib/matching";

export const getCurrentMatch = query({
  handler: async (ctx) => {
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

    const weekOf = getWeekOfString();

    // Check if user has a match this week
    const matchAsUser = await ctx.db
      .query("weeklyMatches")
      .withIndex("by_user_and_week", (q) =>
        q.eq("userId", currentUser._id).eq("weekOf", weekOf)
      )
      .first();

    if (matchAsUser) {
      const matchUser = await ctx.db.get(matchAsUser.matchUserId);
      if (!matchUser) return null;

      // Convert photo storage ID to URL
      const photoUrl = matchUser.photoStorageId
        ? await ctx.storage.getUrl(matchUser.photoStorageId)
        : null;

      return {
        match: matchAsUser,
        matchUser: { ...matchUser, photoUrl },
        isReversed: false,
      };
    }

    // Check if user is the match (reversed)
    const matchAsMatch = await ctx.db
      .query("weeklyMatches")
      .withIndex("by_match_user_and_week", (q) =>
        q.eq("matchUserId", currentUser._id).eq("weekOf", weekOf)
      )
      .first();

    if (matchAsMatch) {
      const matchUser = await ctx.db.get(matchAsMatch.userId);
      if (!matchUser) return null;

      // Convert photo storage ID to URL
      const photoUrl = matchUser.photoStorageId
        ? await ctx.storage.getUrl(matchUser.photoStorageId)
        : null;

      return {
        match: matchAsMatch,
        matchUser: { ...matchUser, photoUrl },
        isReversed: true,
      };
    }

    return null;
  },
});

export const getPastMatches = query({
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

    const currentWeek = getWeekOfString();

    // Get all matches where user is either userId or matchUserId, excluding current week
    const matchesAsUser = await ctx.db
      .query("weeklyMatches")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .filter((q) => q.neq(q.field("weekOf"), currentWeek))
      .order("desc")
      .collect();

    const matchesAsMatch = await ctx.db
      .query("weeklyMatches")
      .withIndex("by_match_user", (q) => q.eq("matchUserId", currentUser._id))
      .filter((q) => q.neq(q.field("weekOf"), currentWeek))
      .order("desc")
      .collect();

    // Combine and load match users
    const allMatches = [...matchesAsUser, ...matchesAsMatch];

    // Sort by sentAt (most recent first)
    allMatches.sort((a, b) => b.sentAt - a.sentAt);

    // Load match users with photos and feedback status
    const matchesWithUsers = await Promise.all(
      allMatches.map(async (match) => {
        const isReversed = match.matchUserId === args.userId;
        const matchUserId = isReversed ? match.userId : match.matchUserId;
        const matchUser = await ctx.db.get(matchUserId);

        if (!matchUser) return null;

        const photoUrl = matchUser.photoStorageId
          ? await ctx.storage.getUrl(matchUser.photoStorageId)
          : null;

        // Check if user has provided feedback for this match
        const feedback = await ctx.db
          .query("dateOutcomes")
          .withIndex("by_match", (q) => q.eq("matchId", match._id))

          .first();

        return {
          match,
          matchUser: { ...matchUser, photoUrl },
          isReversed,
          feedbackProvided: feedback !== null,
        };
      })
    );

    // Filter out null values and return
    return matchesWithUsers.filter((m) => m !== null);
  },
});

export const getMatchById = query({
  args: { matchId: v.id("weeklyMatches") },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) return null;

    // Load both users with photo URLs
    const user = await ctx.db.get(match.userId);
    const matchUser = await ctx.db.get(match.matchUserId);

    if (!user || !matchUser) return null;

    const userPhotoUrl = user.photoStorageId
      ? await ctx.storage.getUrl(user.photoStorageId)
      : null;

    const matchUserPhotoUrl = matchUser.photoStorageId
      ? await ctx.storage.getUrl(matchUser.photoStorageId)
      : null;

    return {
      match,
      user: { ...user, photoUrl: userPhotoUrl },
      matchUser: { ...matchUser, photoUrl: matchUserPhotoUrl },
    };
  },
});

export const respondToMatch = mutation({
  args: {
    matchId: v.id("weeklyMatches"),
    response: v.union(v.literal("interested"), v.literal("passed")),
    isReversed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");

    const fieldToUpdate = args.isReversed ? "matchResponse" : "userResponse";
    const timestampField = args.isReversed
      ? "matchRespondedAt"
      : "userRespondedAt";

    // Update response
    await ctx.db.patch(args.matchId, {
      [fieldToUpdate]: args.response,
      [timestampField]: Date.now(),
    });

    // Check for mutual match
    const updatedMatch = await ctx.db.get(args.matchId);
    if (
      updatedMatch!.userResponse === "interested" &&
      updatedMatch!.matchResponse === "interested"
    ) {
      await ctx.db.patch(args.matchId, { mutualMatch: true });

      console.log("🎉 MUTUAL MATCH!");

      // Send mutual match emails to both users
      const user = await ctx.db.get(updatedMatch!.userId);
      const matchUser = await ctx.db.get(updatedMatch!.matchUserId);

      if (user && matchUser) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;

        // Send email to user
        await ctx.scheduler.runAfter(0, internal.emails.sendMutualMatchEmail, {
          to: user.email,
          userName: user.firstName,
          matchName: matchUser.firstName,
          matchUrl: `${appUrl}/dashboard`,
        });

        // Send email to match user
        await ctx.scheduler.runAfter(0, internal.emails.sendMutualMatchEmail, {
          to: matchUser.email,
          userName: matchUser.firstName,
          matchName: user.firstName,
          matchUrl: `${appUrl}/dashboard`,
        });
      }
    }
  },
});
