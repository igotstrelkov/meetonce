import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { makeMatchKey } from "./lib/utils";

export const getPendingPhotos = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_photo_status", q => q.eq("photoStatus", "pending"))
      .collect();

    // Convert storage IDs to URLs
    const usersWithUrls = await Promise.all(
      users.map(async (user) => {
        const photoUrl = user.photoStorageId
          ? await ctx.storage.getUrl(user.photoStorageId)
          : null;

        return {
          ...user,
          photoUrl, // Return as photoUrl for display in UI
        };
      })
    );

    return usersWithUrls;
  },
});

export const approvePhoto = mutation({
  args: {
    userId: v.id("users"),
    rating: v.number(),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    // Get user data for email
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Update photo status
    await ctx.db.patch(args.userId, {
      photoStatus: "approved",
      attractivenessRating: args.rating,
      updatedAt: Date.now(),
      matchKey: makeMatchKey({ photoStatus: "approved", vacationMode: user.vacationMode, gender: user.gender }),
    });

    // Send approval email
    await ctx.scheduler.runAfter(0, internal.emails.sendPhotoApprovedEmail, {
      to: user.email,
      userName: user.name,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    });

    console.log(`✅ Approved user ${args.userId} with rating ${args.rating}`);

    return args.userId;
  },
});

export const rejectPhoto = mutation({
  args: {
    userId: v.id("users"),
    rejectionReason: v.string(),
    guidance: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      photoStatus: "rejected",
      photoRejectionReason: args.rejectionReason,
      photoResubmissionCount: user.photoResubmissionCount + 1,
      updatedAt: Date.now(),
      matchKey: makeMatchKey({ photoStatus: "rejected", vacationMode: user.vacationMode, gender: user.gender }),
    });

    // Send rejection email
    await ctx.scheduler.runAfter(0, internal.emails.sendPhotoRejectedEmail, {
      to: user.email,
      userName: user.name,
      reason: formatRejectionReason(args.rejectionReason),
      guidance: args.guidance,
      uploadUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding`,
    });

    console.log(`❌ Rejected user ${args.userId}: ${args.rejectionReason}`);

    return args.userId;
  },
});

export const getPlatformMetrics = query({
  args: {},
  returns: v.object({
    totalUsers: v.number(),
    pendingPhotos: v.number(),
    approvedUsers: v.number(),
    activeUsers: v.number(),
    approvalRate: v.number(),
  }),
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    const totalUsers = allUsers.length;
    const pendingPhotos = allUsers.filter(u => u.photoStatus === "pending").length;
    const approvedUsers = allUsers.filter(u => u.photoStatus === "approved").length;
    const activeUsers = allUsers.filter(u =>
      u.photoStatus === "approved" && !u.vacationMode
    ).length;

    return {
      totalUsers,
      pendingPhotos,
      approvedUsers,
      activeUsers,
      approvalRate: totalUsers > 0 ? Math.round((approvedUsers / totalUsers) * 100) : 0,
    };
  },
});

// === ANALYTICS QUERIES ===

export const getMatchingAnalytics = query({
  handler: async (ctx) => {
    const allMatches = await ctx.db.query("weeklyMatches").collect();
    const thisWeek = getWeekOfString();
    const thisWeeksMatches = allMatches.filter(m => m.weekOf === thisWeek);

    const responded = thisWeeksMatches.filter(m =>
      m.userResponse !== "pending" && m.matchResponse !== "pending"
    );

    const mutualMatches = thisWeeksMatches.filter(m => m.mutualMatch);

    return {
      totalMatches: thisWeeksMatches.length,
      responseRate: thisWeeksMatches.length > 0 ? (responded.length / (thisWeeksMatches.length * 2)) * 100 : 0,
      mutualMatchRate: responded.length > 0 ? (mutualMatches.length / responded.length) * 100 : 0,
    };
  },
});

export const getDateOutcomeMetrics = query({
  handler: async (ctx) => {
    const outcomes = await ctx.db.query("dateOutcomes").collect();
    const datesHappened = outcomes.filter(o => o.dateHappened === "yes");

    // PRIMARY METRIC: Mutual Interest Rate
    const mutualSecondDates = datesHappened.filter(o => {
      if (o.wouldMeetAgain !== "yes") return false;

      const other = outcomes.find(f =>
        f.matchId === o.matchId && f.userId !== o.userId
      );
      return other?.wouldMeetAgain === "yes";
    });

    const mutualInterestRate = datesHappened.length > 0
      ? (mutualSecondDates.length / datesHappened.length) * 100
      : 0;

    const avgRating = datesHappened.length > 0
      ? datesHappened.reduce((sum, o) => sum + (o.overallRating ?? 0), 0) / datesHappened.length
      : 0;

    return {
      totalFeedback: outcomes.length,
      datesCompleted: datesHappened.length,
      mutualInterestRate,
      avgRating,
      successStories: mutualSecondDates.length,
    };
  },
});

// === MATCHES ADMIN QUERIES ===

export const getAllMatches = query({
  args: {
    limit: v.optional(v.number()),
    weekOf: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Fetch matches with optional week filter
    const matches = args.weekOf
      ? await ctx.db
          .query("weeklyMatches")
          .withIndex("by_week", q => q.eq("weekOf", args.weekOf!))
          .order("desc")
          .take(args.limit ?? 100)
      : await ctx.db
          .query("weeklyMatches")
          .order("desc")
          .take(args.limit ?? 100);

    // Enrich with user data
    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {
        const user = await ctx.db.get(match.userId);
        const matchUser = await ctx.db.get(match.matchUserId);

        return {
          ...match,
          userName: user?.name,
          matchUserName: matchUser?.name,
        };
      })
    );

    return enrichedMatches;
  },
});

export const getMatchDetails = query({
  args: { matchId: v.id("weeklyMatches") },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) return null;

    const user = await ctx.db.get(match.userId);
    const matchUser = await ctx.db.get(match.matchUserId);

    // Get pass reasons for both users (if they passed)
    const userPassReason = await ctx.db
      .query("passReasons")
      .withIndex("by_match", q => q.eq("matchId", args.matchId))
      .filter(q => q.eq(q.field("userId"), match.userId))
      .first();

    const matchUserPassReason = await ctx.db
      .query("passReasons")
      .withIndex("by_match", q => q.eq("matchId", args.matchId))
      .filter(q => q.eq(q.field("userId"), match.matchUserId))
      .first();

    // Get date outcomes for both users (if they went on date)
    const userOutcome = await ctx.db
      .query("dateOutcomes")
      .withIndex("by_match", q => q.eq("matchId", args.matchId))
      .filter(q => q.eq(q.field("userId"), match.userId))
      .first();

    const matchUserOutcome = await ctx.db
      .query("dateOutcomes")
      .withIndex("by_match", q => q.eq("matchId", args.matchId))
      .filter(q => q.eq(q.field("userId"), match.matchUserId))
      .first();

    return {
      match,
      user,
      matchUser,
      userPassReason,
      matchUserPassReason,
      userOutcome,
      matchUserOutcome,
    };
  },
});

export const getMatchStats = query({
  handler: async (ctx) => {
    const allMatches = await ctx.db.query("weeklyMatches").collect();

    const totalMatches = allMatches.length;
    const mutualMatches = allMatches.filter(m => m.mutualMatch).length;
    const bothResponded = allMatches.filter(m =>
      m.userResponse !== "pending" && m.matchResponse !== "pending"
    ).length;
    const bothPassed = allMatches.filter(m =>
      m.userResponse === "passed" && m.matchResponse === "passed"
    ).length;

    // Get date outcomes
    const dateOutcomes = await ctx.db.query("dateOutcomes").collect();
    const datesHappened = dateOutcomes.filter(o => o.dateHappened === "yes").length;

    return {
      totalMatches,
      mutualMatches,
      mutualMatchRate: totalMatches > 0 ? Math.round((mutualMatches / totalMatches) * 100) : 0,
      responseRate: totalMatches > 0 ? Math.round((bothResponded / (totalMatches * 2)) * 100) : 0,
      bothPassedCount: bothPassed,
      datesCompleted: datesHappened,
    };
  },
});

export const getWeeksWithMatches = query({
  handler: async (ctx) => {
    const matches = await ctx.db.query("weeklyMatches").collect();

    // Get unique weeks
    const weeks = [...new Set(matches.map(m => m.weekOf))];

    // Sort by date (most recent first)
    return weeks.sort((a, b) => b.localeCompare(a));
  },
});

// Helper functions
function getWeekOfString(): string {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  return monday.toISOString().split('T')[0];
}

function formatRejectionReason(reason: string): string {
  const reasons: Record<string, string> = {
    poor_quality: "Poor photo quality",
    face_obscured: "Face is obscured or not clearly visible",
    group_photo: "Group photo (we need a solo photo)",
    inappropriate: "Inappropriate content",
    heavily_filtered: "Heavily filtered or edited",
    poor_lighting: "Poor lighting",
    face_not_visible: "Face not visible",
    other: "Photo doesn't meet our standards",
  };
  return reasons[reason] || reason;
}
