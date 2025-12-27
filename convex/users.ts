import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { generateEmbedding } from "./lib/openrouter";

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
  returns: v.union(v.any(), v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first();
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
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("non-binary")),
    location: v.string(),
    bio: v.string(),
    lookingFor: v.string(),
    interests: v.array(v.string()),
    photoUrl: v.optional(v.string()),
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
      photoUrl: args.photoUrl,
      embedding: args.embedding,
      photoStatus: "pending",
      photoResubmissionCount: 0,
      vacationMode: false,
      isAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const createUser = action({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    age: v.number(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("non-binary")),
    location: v.string(),
    bio: v.string(),
    lookingFor: v.string(),
    interests: v.array(v.string()),
    photoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate embedding from profile text
    const profileText = `
      Name: ${args.name}, Age: ${args.age}, Gender: ${args.gender}
      Location: ${args.location}
      Bio: ${args.bio}
      Looking for: ${args.lookingFor}
      Interests: ${args.interests.join(", ")}
    `;

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

       const profileText = `
        Name: ${args.name ?? user.name}, Age: ${args.age ?? user.age}, Gender: ${user.gender}
        Location: ${args.location ?? user.location}
        Bio: ${args.bio ?? user.bio}
        Looking for: ${args.lookingFor ?? user.lookingFor}
        Interests: ${(args.interests ?? user.interests).join(", ")}
      `;

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
    });

    return userId;
  },
});

export const getUsersForMatching = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    // Get all approved users not on vacation
    const users = await ctx.db
      .query("users")
      .withIndex("by_photo_status", q => q.eq("photoStatus", "approved"))
      .collect();

    return users.filter(user => !user.vacationMode);
  },
});
