import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { getWeekOfString } from "./lib/matching";

export const getCurrentMatch = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const weekOf = getWeekOfString();

    // Check if user has a match this week
    const matchAsUser = await ctx.db
      .query("weeklyMatches")
      .withIndex("by_user_and_week", (q) =>
        q.eq("userId", args.userId).eq("weekOf", weekOf)
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
        q.eq("matchUserId", args.userId).eq("weekOf", weekOf)
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
          userName: user.name,
          matchName: matchUser.name,
          matchUrl: `${appUrl}/dashboard`,
        });

        // Send email to match user
        await ctx.scheduler.runAfter(0, internal.emails.sendMutualMatchEmail, {
          to: matchUser.email,
          userName: matchUser.name,
          matchName: user.name,
          matchUrl: `${appUrl}/dashboard`,
        });
      }
    }
  },
});
