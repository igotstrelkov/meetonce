import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    await ctx.db.patch(args.userId, {
      photoStatus: "approved",
      attractivenessRating: args.rating,
      updatedAt: Date.now(),
    });

    // TODO: Send approval email
    console.log(`✅ Approved user ${args.userId} with rating ${args.rating}`);

    return args.userId;
  },
});

export const rejectPhoto = mutation({
  args: {
    userId: v.id("users"),
    rejectionReason: v.string(),
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
    });

    // TODO: Send rejection email
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
