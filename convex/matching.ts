import { v } from "convex/values";
import { internal } from "./_generated/api";
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
  suggestVenue,
} from "./lib/matching";
import { makeMatchKey } from "./lib/utils";

// ===== QUERIES (Read-only database operations) =====

export const getUnmatchedUsersBatch = internalQuery({
  args: {
    skip: v.number(),
    limit: v.number(),
    weekOf: v.string(),
  },
  handler: async (ctx, args) => {
    const { skip, limit, weekOf } = args;

    // Get all eligible users
    const allEligible = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("accountStatus"), "approved"),
          q.eq(q.field("vacationMode"), false)
        )
      )
      .collect();

    // Filter out users who already have matches this week
    const unmatched: Doc<"users">[] = [];
    for (const user of allEligible) {
      const hasMatch = await ctx.db
        .query("weeklyMatches")
        .withIndex("by_user_and_week", (q) =>
          q.eq("userId", user._id).eq("weekOf", weekOf)
        )
        .first();

      const hasReverseMatch = await ctx.db
        .query("weeklyMatches")
        .withIndex("by_match_user_and_week", (q) =>
          q.eq("matchUserId", user._id).eq("weekOf", weekOf)
        )
        .first();

      if (!hasMatch && !hasReverseMatch) {
        unmatched.push(user);
      }
    }

    // Return paginated batch
    return unmatched.slice(skip, skip + limit);
  },
});

export const loadAndFilterCandidates = internalQuery({
  args: {
    userId: v.id("users"),
    candidateIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const candidates = [];

    // Load the user to get their preferences
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    for (const candidateId of args.candidateIds) {
      // Skip self
      if (candidateId === args.userId) continue;

      // Load candidate document
      const candidate = await ctx.db.get(candidateId);
      if (!candidate) continue;

      // Filter: Must have approved photo and not be on vacation
      if (candidate.accountStatus !== "approved" || candidate.vacationMode) {
        continue;
      }

      // Check if already matched with this user (in any week)
      const previousMatch = await ctx.db
        .query("weeklyMatches")
        .withIndex("by_user_and_match", (q) =>
          q.eq("userId", args.userId).eq("matchUserId", candidateId)
        )
        .first();

      const reversePreviousMatch = await ctx.db
        .query("weeklyMatches")
        .withIndex("by_match_and_user", (q) =>
          q.eq("matchUserId", args.userId).eq("userId", candidateId)
        )
        .first();

      // Only include if never matched before
      if (!previousMatch && !reversePreviousMatch) {
        candidates.push(candidate);
      }

      // Filter user's age preference for candidate
      if (user.minAge && candidate.age < user.minAge) {
        console.log(
          `Filtered out ${candidate.name}: too young (${candidate.age} < ${user.minAge})`
        );
        continue;
      }

      if (user.maxAge && candidate.age > user.maxAge) {
        console.log(
          `Filtered out ${candidate.name}: too old (${candidate.age} > ${user.maxAge})`
        );
        continue;
      }

      // Filter candidate's age preference for user (bidirectional check)
      if (candidate.minAge && user.age < candidate.minAge) {
        console.log(
          `Filtered out ${candidate.name}: user too young for candidate`
        );
        continue;
      }

      if (candidate.maxAge && user.age > candidate.maxAge) {
        console.log(
          `Filtered out ${candidate.name}: user too old for candidate`
        );
        continue;
      }
    }

    return candidates;
  },
});

export const validateMatch = internalQuery({
  args: {
    userId: v.id("users"),
    candidateId: v.id("users"),
    userRating: v.optional(v.number()),
    candidateRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check 1: Never matched before (with pass history check)
    const previousMatchAsUser = await ctx.db
      .query("weeklyMatches")
      .withIndex("by_user_and_match", (q) =>
        q.eq("userId", args.userId).eq("matchUserId", args.candidateId)
      )
      .first();

    const previousMatchAsMatch = await ctx.db
      .query("weeklyMatches")
      .withIndex("by_match_and_user", (q) =>
        q.eq("matchUserId", args.userId).eq("userId", args.candidateId)
      )
      .first();

    // If they've been matched before, check if either person passed
    if (previousMatchAsUser || previousMatchAsMatch) {
      const match = previousMatchAsUser || previousMatchAsMatch;

      const userResponse =
        match!.userId === args.userId
          ? match!.userResponse
          : match!.matchResponse;

      const candidateResponse =
        match!.userId === args.candidateId
          ? match!.userResponse
          : match!.matchResponse;

      // Don't re-match if either person passed
      if (userResponse === "passed" || candidateResponse === "passed") {
        return false;
      }

      // Also don't re-match if they were already matched (even if both interested)
      return false;
    }

    // Check 2: Attractiveness compatibility (±2 points)
    const userRating = args.userRating ?? 5;
    const candidateRating = args.candidateRating ?? 5;
    const ratingDiff = Math.abs(userRating - candidateRating);

    if (ratingDiff > 2) {
      return false;
    }

    return true;
  },
});

// ===== MUTATION (Write to database) =====

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
      description: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("weeklyMatches", {
      userId: args.userId,
      matchUserId: args.matchUserId,
      weekOf: args.weekOf,
      compatibilityScore: args.compatibilityScore,
      explanation: args.explanation,
      dimensionScores: args.dimensionScores,
      redFlags: args.redFlags,
      suggestedVenue: args.suggestedVenue,

      // Responses
      userResponse: "pending",
      matchResponse: "pending",
      userRespondedAt: undefined,
      matchRespondedAt: undefined,
      mutualMatch: false,

      // Status
      status: "sent",
      dateScheduled: false,

      // Timestamps
      sentAt: now,
      expiresAt: now + oneWeek,
    });
  },
});

// ===== ACTIONS (Orchestration + External API calls + Vector Search) =====

export const weeklyMatchGeneration = internalAction({
  handler: async (ctx) => {
    console.log("🚀 Starting weekly match generation");

    const weekOf = getWeekOfString();

    // Start the batch process
    await ctx.scheduler.runAfter(0, internal.matching.runMatchingBatch, {
      skip: 0,
      batchSize: 50,
      weekOf,
    });

    console.log("✅ Batched matching process initiated");
  },
});

export const runMatchingBatch = internalAction({
  args: {
    skip: v.number(),
    batchSize: v.number(),
    weekOf: v.string(),
  },
  handler: async (ctx, args) => {
    const { skip, batchSize, weekOf } = args;

    console.log(`📦 Processing batch: skip=${skip}, size=${batchSize}`);

    // Step 1: Fetch batch of unmatched users
    const batch = await ctx.runQuery(internal.matching.getUnmatchedUsersBatch, {
      skip,
      limit: batchSize,
      weekOf,
    });

    if (batch.length === 0) {
      console.log("🎉 All users processed! Matching complete.");
      return;
    }

    console.log(`Found ${batch.length} users in this batch`);

    const matchedInBatch = new Set<string>();

    // Step 2: Process each user in the batch
    for (const user of batch) {
      if (matchedInBatch.has(user._id)) {
        console.log(`Skipping ${user.name} - already matched in this batch`);
        continue;
      }

      if (!user.embedding) {
        console.log(`Skipping ${user.name} - no embedding`);
        continue;
      }

      const matchKey = makeMatchKey({
        accountStatus: "approved",
        vacationMode: false,
        gender: user.interestedIn,
      });

      // Step 2a: Vector search for similar users (MUST be in action!)
      // ctx.vectorSearch returns Array<{_id, _score}>
      const vectorResults = await ctx.vectorSearch("users", "by_embedding", {
        vector: user.embedding,
        limit: 256, // Max limit, we'll narrow down
        filter: (q) => q.eq("matchKey", matchKey),
      });

      console.log(
        `Vector search found ${vectorResults.length} similar users for ${user.name}`
      );

      // Extract IDs and filter out self
      const candidateIds = vectorResults
        .filter((result) => result._id !== user._id)
        .slice(0, 100) // Top 100 by similarity
        .map((result) => result._id);

      if (candidateIds.length === 0) {
        console.log(`No vector search candidates for ${user.name}`);
        continue;
      }

      // Step 2b: Load candidate documents and filter by match history
      const candidates = await ctx.runQuery(
        internal.matching.loadAndFilterCandidates,
        { userId: user._id, candidateIds }
      );

      if (candidates.length === 0) {
        console.log(
          `No unmatched candidates for ${user.name} after history filter`
        );
        continue;
      }

      console.log(
        `${candidates.length} candidates after history filter for ${user.name}`
      );

      // Step 2c: Analyze top 20 candidates with LLM
      const top20 = candidates.slice(0, 20);
      const analyzed = await Promise.all(
        top20.map(async (candidate) => {
          const compatibility = await analyzeCompatibility(
            formatProfile(user),
            formatProfile(candidate)
          );
          return {
            candidate,
            score: compatibility.totalScore,
            explanation: compatibility.explanation,
            dimensionScores: compatibility.dimensionScores,
            redFlags: compatibility.redFlags,
          };
        })
      );

      // Sort by compatibility score
      const ranked = analyzed.sort((a, b) => b.score - a.score);

      // Step 2d: Find first valid match
      let matchData = null;
      for (const item of ranked) {
        if (item.score < 70) {
          console.log(
            `Skipping ${item.candidate.name} - score ${item.score} < 70`
          );
          continue;
        }

        const isValid = await ctx.runQuery(internal.matching.validateMatch, {
          userId: user._id,
          candidateId: item.candidate._id,
          userRating: user.attractivenessRating,
          candidateRating: item.candidate.attractivenessRating,
        });

        if (isValid) {
          matchData = {
            matchUser: item.candidate,
            score: item.score,
            explanation: item.explanation,
            dimensionScores: item.dimensionScores,
            redFlags: item.redFlags,
          };
          break;
        }
      }

      if (!matchData) {
        console.log(`No valid match found for ${user.name}`);
        continue;
      }

      // Step 2e: Generate venue suggestion
      const venue = await suggestVenue(user.location);

      // Step 2f: Save match via mutation
      await ctx.runMutation(internal.matching.saveMatch, {
        userId: user._id,
        matchUserId: matchData.matchUser._id,
        weekOf,
        compatibilityScore: matchData.score,
        explanation: matchData.explanation,
        dimensionScores: matchData.dimensionScores,
        redFlags: matchData.redFlags,
        suggestedVenue: venue,
      });

      matchedInBatch.add(user._id);
      matchedInBatch.add(matchData.matchUser._id);

      console.log(
        `✅ Matched ${user.name} ↔ ${matchData.matchUser.name} (${matchData.score}% compatible)`
      );
    }

    console.log(`Batch complete. Matched ${matchedInBatch.size / 2} pairs.`);

    // Step 3: Recursively schedule next batch if more users remain
    if (batch.length === batchSize) {
      console.log("📤 Scheduling next batch...");
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

// ===== TESTING FUNCTION =====

export const testMatchingAlgorithm = internalAction({
  handler: async (ctx) => {
    console.log("🧪 Testing matching algorithm with small batch...");

    await ctx.scheduler.runAfter(0, internal.matching.runMatchingBatch, {
      skip: 0,
      batchSize: 5, // Small batch for testing
      weekOf: getWeekOfString(),
    });

    console.log("✅ Test batch scheduled");
  },
});
