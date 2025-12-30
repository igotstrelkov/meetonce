import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentMatch = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const weekOf = getWeekOfString();

    // Check if user has a match this week
    const matchAsUser = await ctx.db
      .query("weeklyMatches")
      .withIndex("by_user_and_week", q =>
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
      .withIndex("by_match_user_and_week", q =>
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
    const timestampField = args.isReversed ? "matchRespondedAt" : "userRespondedAt";

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

      // TODO: Send mutual match emails
      console.log("🎉 MUTUAL MATCH!");
    }
  },
});

function getWeekOfString(): string {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  return monday.toISOString().split('T')[0];
}
