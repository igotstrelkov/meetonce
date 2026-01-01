import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { generateEmbedding } from "./lib/openrouter";
import { makeMatchKey } from "./lib/utils";

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    return {
      ...user,
      photoUrl: user.photoStorageId
        ? await ctx.storage.getUrl(user.photoStorageId)
        : null
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const internalCreateUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    age: v.number(),
    gender: v.string(),
    location: v.string(),
    bio: v.string(),
    lookingFor: v.string(),
    interests: v.array(v.string()),
    interestedIn: v.string(),
    minAge: v.number(),
    maxAge: v.number(),
    photoStorageId: v.optional(v.string()),
    verificationDocStorageId: v.optional(v.string()),
    embedding: v.array(v.number()),
  },

  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      throw new Error("User already exists");
    }

    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      age: args.age,
      gender: args.gender,
      location: args.location,
      bio: args.bio,
      lookingFor: args.lookingFor,
      interests: args.interests,
      interestedIn: args.interestedIn,
      minAge: args.minAge,
      maxAge: args.maxAge,
      photoStorageId: args.photoStorageId,
      verificationDocStorageId: args.verificationDocStorageId,
      embedding: args.embedding,
      photoStatus: "pending",
      photoResubmissionCount: 0,
      verificationStatus: "pending",
      vacationMode: false,
      isAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      matchKey: makeMatchKey({ photoStatus: "pending", vacationMode: false, gender: args.gender }),
    });
  },
});

export const createUserProfile = action({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    age: v.number(),
    gender: v.string(),
    location: v.string(),
    bio: v.string(),
    lookingFor: v.string(),
    interests: v.array(v.string()),
    interestedIn: v.string(),
    minAge: v.number(),
    maxAge: v.number(),
    photoStorageId: v.optional(v.string()),
    verificationDocStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate embedding from profile text
    const profileText = `${args.bio}\n\nLooking for ${args.lookingFor}`;

    const embedding = await generateEmbedding(profileText);

    await ctx.runMutation(internal.users.internalCreateUser, {
      ...args,
      embedding,
    });
  },
});

export const internalUpdateProfile = internalMutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    lookingFor: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    interestedIn: v.optional(v.string()),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    embedding: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const updateProfile = action({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    lookingFor: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    interestedIn: v.optional(v.string()),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
  },
  
  handler: async (ctx, args) => {
    // If profile text changed, regenerate embedding
    let embedding: number[] | undefined;
    
    if (args.name || args.age || args.bio || args.lookingFor || args.interests) {
       // We need to fetch the user to get current data for the embedding text
       // But actions can't use ctx.db. So we might need to query first or pass all data.
       // For simplicity, let's just make a quick query to get the current user data
       // Note: In Actions, we use ctx.runQuery
       const user = await ctx.runQuery(internal.users.getUserInternal, { userId: args.userId });
       
       if (!user) throw new Error("User not found");

       const profileText = `${args.bio}\n\nLooking for ${args.lookingFor}`;

        embedding = await generateEmbedding(profileText);
    }

    await ctx.runMutation(internal.users.internalUpdateProfile, {
      ...args,
      embedding,
    });
  },
});

export const getUserInternal = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  }
});

export const updatePhotoStatus = mutation({
  args: {
    userId: v.id("users"),
    photoStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    attractivenessRating: v.optional(v.number()),
    photoRejectionReason: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
      matchKey: makeMatchKey({ photoStatus: args.photoStatus, vacationMode: user.vacationMode, gender: user.gender }),
    });

    return userId;
  },
});

export const setVacationMode = mutation({
  args: {
    userId: v.id("users"),
    vacationMode: v.boolean(),
    vacationUntil: v.optional(v.number()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const { userId, vacationMode, vacationUntil } = args;

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }



    await ctx.db.patch(userId, {
      vacationMode,
      vacationUntil,
      updatedAt: Date.now(),
      matchKey: makeMatchKey({ photoStatus: user.photoStatus, vacationMode, gender: user.gender }),
    });

    return userId;
  },
});

// export const getUsersForMatching = query({
//   args: {},
//   returns: v.array(v.any()),
//   handler: async (ctx) => {
//     // Get all approved users not on vacation
//     const users = await ctx.db
//       .query("users")
//       .withIndex("by_photo_status", q => q.eq("photoStatus", "approved"))
//       .collect();

//     return users.filter(user => !user.vacationMode);
//   },
// });

export const isUserAdmin = query({
  args: { clerkId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();

    return user?.isAdmin ?? false;
  },
});

export const makeUserAdmin = mutation({
  args: { userId: v.id("users") },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isAdmin: true });
    return args.userId;
  },
});