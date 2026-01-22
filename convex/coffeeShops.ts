import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { searchCoffeeShops as searchPlaces } from "./lib/googlePlaces";

// Query: Get all coffee shops
export const getAllCoffeeShops = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let coffeeShops;

    if (args.activeOnly) {
      coffeeShops = await ctx.db
        .query("coffeeShops")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();
    } else {
      coffeeShops = await ctx.db.query("coffeeShops").collect();
    }

    // Sort by name alphabetically
    return coffeeShops.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Query: Check if a coffee shop exists by place ID
export const coffeeShopExists = query({
  args: { placeId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("coffeeShops")
      .withIndex("by_place_id", (q) => q.eq("placeId", args.placeId))
      .first();
    return existing !== null;
  },
});

// Action: Search Google Places for coffee shops
export const searchCoffeeShops = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return [];
    }

    return await searchPlaces(args.query);
  },
});

// Mutation: Add a coffee shop
export const addCoffeeShop = mutation({
  args: {
    placeId: v.string(),
    name: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    rating: v.optional(v.number()),
    userRatingsTotal: v.optional(v.number()),
    priceLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check for duplicates
    const existing = await ctx.db
      .query("coffeeShops")
      .withIndex("by_place_id", (q) => q.eq("placeId", args.placeId))
      .first();

    if (existing) {
      throw new Error("Coffee shop already exists");
    }

    // Get current user identity
    const identity = await ctx.auth.getUserIdentity();
    const addedBy = identity?.subject;

    const now = Date.now();
    return await ctx.db.insert("coffeeShops", {
      placeId: args.placeId,
      name: args.name,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      rating: args.rating,
      userRatingsTotal: args.userRatingsTotal,
      priceLevel: args.priceLevel,
      addedBy,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation: Delete a coffee shop
export const deleteCoffeeShop = mutation({
  args: { coffeeShopId: v.id("coffeeShops") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.coffeeShopId);
  },
});

// Mutation: Toggle active status (soft delete/restore)
export const toggleCoffeeShopActive = mutation({
  args: { coffeeShopId: v.id("coffeeShops") },
  handler: async (ctx, args) => {
    const coffeeShop = await ctx.db.get(args.coffeeShopId);
    if (!coffeeShop) {
      throw new Error("Coffee shop not found");
    }

    await ctx.db.patch(args.coffeeShopId, {
      isActive: !coffeeShop.isActive,
      updatedAt: Date.now(),
    });
  },
});
