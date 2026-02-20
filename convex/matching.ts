import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import {
  analyzeCompatibility,
  formatProfile,
  getWeekOfString,
} from "./lib/matching";
import { makeMatchKey } from "./lib/utils";

// ===== QUERIES =====

export const getUnmatchedUsersBatch = internalQuery({
  args: {
    skip: v.number(),
    limit: v.number(),
    weekOf: v.string(),
  },
  handler: async (ctx, args) => {
    const { skip, limit, weekOf } = args;

    // Use by_week index — O(matches_this_week) instead of full table scan
    const thisWeekMatches = await ctx.db
      .query("weeklyMatches")
      .withIndex("by_week", (q) => q.eq("weekOf", weekOf))
      .collect();

    const matchedIds = new Set<string>(
      thisWeekMatches.flatMap((m) => [m.userId, m.matchUserId])
    );

    // Use by_account_status index — only scans approved users, not all users
    const approvedUsers = await ctx.db
      .query("users")
      .withIndex("by_account_status", (q) => q.eq("accountStatus", "approved"))
      .filter((q) => q.eq(q.field("vacationMode"), false))
      .collect();

    const unmatched = approvedUsers.filter((u) => !matchedIds.has(u._id));

    return unmatched.slice(skip, skip + limit);
  },
});

export const loadAndFilterCandidates = internalQuery({
  args: {
    userId: v.id("users"),
    candidateIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    // Run all candidate checks in parallel — 3 reads per candidate fire simultaneously
    const results = await Promise.all(
      args.candidateIds
        .filter((id) => id !== args.userId)
        .map(async (candidateId) => {
          const [candidate, previousMatch, reversePreviousMatch] =
            await Promise.all([
              ctx.db.get(candidateId),
              ctx.db
                .query("weeklyMatches")
                .withIndex("by_user_and_match", (q) =>
                  q
                    .eq("userId", args.userId)
                    .eq("matchUserId", candidateId)
                )
                .first(),
              ctx.db
                .query("weeklyMatches")
                .withIndex("by_match_and_user", (q) =>
                  q
                    .eq("matchUserId", args.userId)
                    .eq("userId", candidateId)
                )
                .first(),
            ]);

          if (!candidate) return null;
          if (candidate.accountStatus !== "approved" || candidate.vacationMode)
            return null;
          if (previousMatch || reversePreviousMatch) return null;

          // Age preference filters (both directions)
          if (user.minAge && candidate.age < user.minAge) return null;
          if (user.maxAge && candidate.age > user.maxAge) return null;
          if (candidate.minAge && user.age < candidate.minAge) return null;
          if (candidate.maxAge && user.age > candidate.maxAge) return null;

          // Attractiveness compatibility (±2)
          const userRating = user.attractivenessRating ?? 5;
          const candidateRating = candidate.attractivenessRating ?? 5;
          if (Math.abs(userRating - candidateRating) > 2) return null;

          return candidate;
        })
    );

    return results.filter((c): c is Doc<"users"> => c !== null);
  },
});

export const getUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const hasMatchThisWeek = internalQuery({
  args: { userId: v.id("users"), weekOf: v.string() },
  handler: async (ctx, args) => {
    const [asUser, asMatchUser] = await Promise.all([
      ctx.db
        .query("weeklyMatches")
        .withIndex("by_user_and_week", (q) =>
          q.eq("userId", args.userId).eq("weekOf", args.weekOf)
        )
        .first(),
      ctx.db
        .query("weeklyMatches")
        .withIndex("by_match_user_and_week", (q) =>
          q.eq("matchUserId", args.userId).eq("weekOf", args.weekOf)
        )
        .first(),
    ]);
    return !!(asUser || asMatchUser);
  },
});

// ===== MUTATIONS =====

export const saveMatch = internalMutation({
  args: {
    userId: v.id("users"),
    matchUserId: v.id("users"),
    weekOf: v.string(),
    compatibilityScore: v.number(),
    explanation: v.string(),
    dimensionScores: v.optional(
      v.object({
        values: v.number(),
        lifestyle: v.number(),
        interests: v.number(),
        communication: v.number(),
        relationshipVision: v.number(),
      })
    ),
    redFlags: v.optional(v.array(v.string())),
    suggestedVenue: v.object({
      name: v.string(),
      address: v.string(),
      placeId: v.string(),
      rating: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Deduplication guard — handles races between parallel processUserMatch actions.
    // Mutations are serialized in Convex so this check + insert is atomic.
    const [u1AsUser, u1AsMatch, u2AsUser, u2AsMatch] = await Promise.all([
      ctx.db
        .query("weeklyMatches")
        .withIndex("by_user_and_week", (q) =>
          q.eq("userId", args.userId).eq("weekOf", args.weekOf)
        )
        .first(),
      ctx.db
        .query("weeklyMatches")
        .withIndex("by_match_user_and_week", (q) =>
          q.eq("matchUserId", args.userId).eq("weekOf", args.weekOf)
        )
        .first(),
      ctx.db
        .query("weeklyMatches")
        .withIndex("by_user_and_week", (q) =>
          q.eq("userId", args.matchUserId).eq("weekOf", args.weekOf)
        )
        .first(),
      ctx.db
        .query("weeklyMatches")
        .withIndex("by_match_user_and_week", (q) =>
          q.eq("matchUserId", args.matchUserId).eq("weekOf", args.weekOf)
        )
        .first(),
    ]);

    if (u1AsUser || u1AsMatch || u2AsUser || u2AsMatch) {
      console.log(
        `⚠️ Duplicate save prevented: ${args.userId} <-> ${args.matchUserId}`
      );
      return;
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    await ctx.db.insert("weeklyMatches", {
      userId: args.userId,
      matchUserId: args.matchUserId,
      weekOf: args.weekOf,
      compatibilityScore: args.compatibilityScore,
      explanation: args.explanation,
      dimensionScores: args.dimensionScores,
      redFlags: args.redFlags,
      suggestedVenue: args.suggestedVenue,

      userResponse: "pending",
      matchResponse: "pending",
      userRespondedAt: undefined,
      matchRespondedAt: undefined,
      mutualMatch: false,

      status: "sent",
      dateScheduled: false,

      sentAt: now,
      expiresAt: now + oneDay,
    });
  },
});

export const expireStaleMatches = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();

    const stale = await ctx.db
      .query("weeklyMatches")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "sent"),
          q.eq(q.field("mutualMatch"), false),
          q.lt(q.field("expiresAt"), now)
        )
      )
      .collect();

    for (const match of stale) {
      await ctx.db.patch(match._id, {
        status: "expired",
        userResponse:
          match.userResponse === "pending" ? "passed" : match.userResponse,
        matchResponse:
          match.matchResponse === "pending" ? "passed" : match.matchResponse,
      });
    }

    console.log(`⏰ Expired ${stale.length} stale matches`);
    return { expired: stale.length };
  },
});

// ===== ACTIONS =====

export const weeklyMatchGeneration = internalAction({
  handler: async (ctx) => {
    console.log("🚀 Starting weekly match generation");

    const weekOf = getWeekOfString();

    await ctx.scheduler.runAfter(0, internal.matching.runMatchingBatch, {
      skip: 0,
      batchSize: 50,
      weekOf,
    });

    console.log("✅ Batched matching process initiated");
  },
});

/**
 * Coordinator: fetches a batch of unmatched users and schedules
 * a processUserMatch action for each one. Actions run in parallel
 * across Convex's worker pool — no more serial per-user processing.
 */
export const runMatchingBatch = internalAction({
  args: {
    skip: v.number(),
    batchSize: v.number(),
    weekOf: v.string(),
  },
  handler: async (ctx, args) => {
    const { skip, batchSize, weekOf } = args;

    console.log(`📦 Scheduling batch: skip=${skip}, size=${batchSize}`);

    const batch = await ctx.runQuery(internal.matching.getUnmatchedUsersBatch, {
      skip,
      limit: batchSize,
      weekOf,
    });

    if (batch.length === 0) {
      console.log("🎉 All users processed! Matching complete.");
      return;
    }

    // Schedule each eligible user as an independent action — parallel execution
    await Promise.all(
      batch
        .filter((user) => user.embedding)
        .map((user) =>
          ctx.scheduler.runAfter(0, internal.matching.processUserMatch, {
            userId: user._id,
            weekOf,
          })
        )
    );

    console.log(`📤 Scheduled ${batch.length} user actions`);

    // Schedule next batch if more users remain
    if (batch.length === batchSize) {
      await ctx.scheduler.runAfter(0, internal.matching.runMatchingBatch, {
        skip: skip + batchSize,
        batchSize,
        weekOf,
      });
    } else {
      console.log("🏁 This was the last batch. All done!");
    }
  },
});

/**
 * Handles the full matching pipeline for a single user.
 * Runs independently and in parallel with other users' actions.
 */
export const processUserMatch = internalAction({
  args: {
    userId: v.id("users"),
    weekOf: v.string(),
  },
  handler: async (ctx, args) => {
    // Early exit: another action may have already matched this user
    const alreadyMatched = await ctx.runQuery(
      internal.matching.hasMatchThisWeek,
      { userId: args.userId, weekOf: args.weekOf }
    );
    if (alreadyMatched) {
      console.log(`Skipping ${args.userId} — already matched this week`);
      return;
    }

    const user = await ctx.runQuery(internal.matching.getUser, {
      userId: args.userId,
    });
    if (!user?.embedding) {
      console.log(`Skipping ${args.userId} — no embedding`);
      return;
    }

    const matchKey = makeMatchKey({
      accountStatus: "approved",
      vacationMode: false,
      gender: user.interestedIn,
    });

    // Vector search (must be in action)
    const vectorResults = await ctx.vectorSearch("users", "by_embedding", {
      vector: user.embedding,
      limit: 256,
      filter: (q) => q.eq("matchKey", matchKey),
    });

    console.log(
      `Vector search found ${vectorResults.length} candidates for ${user.firstName}`
    );

    const candidateIds = vectorResults
      .filter((r) => r._id !== args.userId)
      .slice(0, 100)
      .map((r) => r._id);

    if (!candidateIds.length) {
      console.log(`No vector candidates for ${user.firstName}`);
      return;
    }

    const candidates = await ctx.runQuery(
      internal.matching.loadAndFilterCandidates,
      { userId: args.userId, candidateIds }
    );

    if (!candidates.length) {
      console.log(`No filtered candidates for ${user.firstName}`);
      return;
    }

    console.log(
      `${candidates.length} candidates after filtering for ${user.firstName}`
    );

    // Sequential LLM analysis with early exit — stop at first score ≥ 70.
    // Candidates are sorted by vector similarity, the best proxy for compatibility.
    let matchData = null;
    for (const candidate of candidates.slice(0, 20)) {
      const compatibility = await analyzeCompatibility(
        formatProfile(user),
        formatProfile(candidate)
      );

      console.log(`Scored ${candidate.firstName}: ${compatibility.totalScore}`);

      if (compatibility.totalScore >= 70) {
        matchData = {
          matchUser: candidate,
          score: compatibility.totalScore,
          explanation: compatibility.explanation,
          dimensionScores: compatibility.dimensionScores,
          redFlags: compatibility.redFlags,
        };
        break;
      }
    }

    if (!matchData) {
      console.log(`No valid match found for ${user.firstName}`);
      return;
    }

    const coffeeShops = await ctx.runQuery(api.coffeeShops.getAllCoffeeShops, {
      activeOnly: true,
    });
    if (!coffeeShops.length) {
      console.log("⚠️ No active coffee shops, cannot create match");
      return;
    }

    const randomShop =
      coffeeShops[Math.floor(Math.random() * coffeeShops.length)];
    const venue = {
      name: randomShop.name,
      address: randomShop.address,
      placeId: randomShop.placeId,
      rating: randomShop.rating ?? 0,
    };

    // saveMatch handles deduplication atomically — safe under parallel execution
    await ctx.runMutation(internal.matching.saveMatch, {
      userId: args.userId,
      matchUserId: matchData.matchUser._id,
      weekOf: args.weekOf,
      compatibilityScore: matchData.score,
      explanation: matchData.explanation,
      dimensionScores: matchData.dimensionScores,
      redFlags: matchData.redFlags,
      suggestedVenue: venue,
    });

    console.log(
      `✅ Matched ${user.firstName} ↔ ${matchData.matchUser.firstName} (${matchData.score}%)`
    );

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

    await ctx.scheduler.runAfter(0, internal.emails.sendWeeklyMatchEmail, {
      to: user.email,
      userName: user.firstName,
      matchName: matchData.matchUser.firstName,
      matchAge: matchData.matchUser.age,
      matchUrl: dashboardUrl,
    });
    await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToUser, {
      userId: args.userId,
      title: "You have a new match!",
      body: `Check out ${matchData.matchUser.firstName}`,
      url: "/dashboard",
    });
    console.log(`📧 Notified ${user.email}`);

    await ctx.scheduler.runAfter(0, internal.emails.sendWeeklyMatchEmail, {
      to: matchData.matchUser.email,
      userName: matchData.matchUser.firstName,
      matchName: user.firstName,
      matchAge: user.age,
      matchUrl: dashboardUrl,
    });
    await ctx.scheduler.runAfter(0, internal.pushActions.sendPushToUser, {
      userId: matchData.matchUser._id,
      title: "You have a new match!",
      body: `Check out ${user.firstName}`,
      url: "/dashboard",
    });
    console.log(`📧 Notified ${matchData.matchUser.email}`);
  },
});

// ===== TESTING =====

export const testMatchingAlgorithm = internalAction({
  handler: async (ctx) => {
    console.log("🧪 Testing matching algorithm with small batch...");

    await ctx.scheduler.runAfter(0, internal.matching.runMatchingBatch, {
      skip: 0,
      batchSize: 5,
      weekOf: getWeekOfString(),
    });

    console.log("✅ Test batch scheduled");
  },
});
