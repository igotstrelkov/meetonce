import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Authentication
    clerkId: v.string(),
    email: v.string(),

    // Profile
    firstName: v.string(),
    lastName: v.string(),
    age: v.number(),
    gender: v.string(),
    location: v.string(),
    jobTitle: v.string(),
    bio: v.string(),
    lookingFor: v.string(),
    interests: v.array(v.string()),

    // Photo & Review
    photoStorageId: v.optional(v.string()),
    // Verification Document
    verificationDocStorageId: v.optional(v.string()),
    // Account Status
    accountStatus: v.union(
      v.literal("pending"),
      v.literal("waitlisted"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    attractivenessRating: v.optional(v.number()),
    accountRejectionReason: v.optional(v.string()),
    accountResubmissionCount: v.number(),

    // Composite field for vectorSearch filters
    matchKey: v.string(),

    // AI Matching
    embedding: v.optional(v.array(v.float64())),

    // Status
    vacationMode: v.boolean(),
    vacationUntil: v.optional(v.number()),

    // Admin
    isAdmin: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),

    interestedIn: v.string(),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_account_status", ["accountStatus"])
    .index("by_vacation", ["vacationMode"])
    // Vector search index for AI matching
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["matchKey"],
    }),

  weeklyMatches: defineTable({
    // Match Participants
    userId: v.id("users"),
    matchUserId: v.id("users"),
    weekOf: v.string(),

    // AI Analysis
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

    // Venue
    suggestedVenue: v.object({
      name: v.string(),
      address: v.string(),
      placeId: v.string(),
      rating: v.number(),
    }),

    // Responses
    userResponse: v.union(
      v.literal("pending"),
      v.literal("interested"),
      v.literal("passed")
    ),
    matchResponse: v.union(
      v.literal("pending"),
      v.literal("interested"),
      v.literal("passed")
    ),
    userRespondedAt: v.optional(v.number()),
    matchRespondedAt: v.optional(v.number()),

    // Status
    mutualMatch: v.boolean(),
    status: v.union(
      v.literal("sent"),
      v.literal("expired"),
      v.literal("completed")
    ),

    // Scheduling
    dateScheduled: v.boolean(),
    dateScheduledFor: v.optional(v.number()),

    // Notifications
    lastNotificationEmailSentAt: v.optional(v.number()), // Last time "new message" email was sent for this match

    // Timestamps
    sentAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_user_and_match", ["userId", "matchUserId"])
    .index("by_match_and_user", ["matchUserId", "userId"])
    .index("by_user", ["userId"])
    .index("by_match_user", ["matchUserId"])
    .index("by_week", ["weekOf"])
    .index("by_user_and_week", ["userId", "weekOf"])
    .index("by_match_user_and_week", ["matchUserId", "weekOf"]),

  passReasons: defineTable({
    userId: v.id("users"),
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
    providedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_match", ["matchId"])
    .index("by_reason", ["reason"]),

  dateOutcomes: defineTable({
    matchId: v.id("weeklyMatches"),
    userId: v.id("users"),
    matchUserId: v.id("users"),
    weekOf: v.string(),

    // Core Feedback
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

    // Details
    wentWell: v.optional(v.array(v.string())),
    wentPoorly: v.optional(v.array(v.string())),

    // Feature Feedback
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
    providedAt: v.number(),
    feedbackProvided: v.boolean(),
  })
    .index("by_match", ["matchId"])
    .index("by_user", ["userId"])
    .index("by_date_happened", ["dateHappened"])
    .index("by_would_meet_again", ["wouldMeetAgain"]),

  messages: defineTable({
    matchId: v.id("weeklyMatches"),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    sentAt: v.number(),
    readAt: v.optional(v.number()),
    flagged: v.boolean(),
    flaggedReason: v.optional(v.string()),
  })
    .index("by_match", ["matchId", "sentAt"])
    .index("by_match_and_receiver", ["matchId", "receiverId"])
    .index("by_sender", ["senderId"])
    .index("by_flagged", ["flagged"]),

  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),

  coffeeShops: defineTable({
    // Google Places data
    placeId: v.string(),
    name: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),

    // Optional enrichment data
    rating: v.optional(v.number()),
    userRatingsTotal: v.optional(v.number()),
    priceLevel: v.optional(v.number()),

    // Admin metadata
    addedBy: v.optional(v.string()),
    isActive: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_place_id", ["placeId"])
    .index("by_active", ["isActive"]),
});
