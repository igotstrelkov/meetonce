import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

/**
 * Get messages for a match with pagination
 * Returns messages sorted by time with sender info (name, photoUrl)
 */
export const getMessages = query({
  args: {
    matchId: v.id("weeklyMatches"),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Verify user is part of this match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (
      match.userId !== currentUser._id &&
      match.matchUserId !== currentUser._id
    ) {
      throw new Error("Unauthorized: You are not part of this match");
    }

    // Load messages with pagination (50 per page)
    const limit = 50;
    let messagesQuery = ctx.db
      .query("messages")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .order("desc"); // Most recent first for initial load

    if (args.cursor) {
      messagesQuery = messagesQuery.filter((q) =>
        q.lt(q.field("sentAt"), args.cursor!)
      );
    }

    const messages = await messagesQuery.take(limit);

    // Get sender info for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          senderName: sender?.firstName || "Unknown User",
          senderPhotoUrl: sender?.photoStorageId
            ? await ctx.storage.getUrl(sender.photoStorageId)
            : null,
        };
      })
    );

    // Reverse to show oldest first in UI
    return messagesWithSenders.reverse();
  },
});

/**
 * Get count of unread messages for current user in a match
 */
export const getUnreadCount = query({
  args: {
    matchId: v.id("weeklyMatches"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Count unread messages where current user is receiver
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_match_and_receiver", (q) =>
        q.eq("matchId", args.matchId).eq("receiverId", currentUser._id)
      )
      .filter((q) => q.eq(q.field("readAt"), undefined))
      .collect();

    return unreadMessages.length;
  },
});

/**
 * Send a new message in a match
 * Validates match exists, mutual match, not expired, and content
 */
export const sendMessage = mutation({
  args: {
    matchId: v.id("weeklyMatches"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Get match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Verify user is part of match
    if (
      match.userId !== currentUser._id &&
      match.matchUserId !== currentUser._id
    ) {
      throw new Error("Unauthorized: You are not part of this match");
    }

    // Verify mutual match exists
    if (!match.mutualMatch) {
      throw new Error("Cannot send messages until both users are interested");
    }

    // Check match hasn't expired (Friday 11:59pm)
    const now = Date.now();
    if (now > match.expiresAt) {
      throw new Error(
        "This chat has expired. Complete post-date feedback to continue."
      );
    }

    // Validate content
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Message cannot be empty");
    }

    if (trimmedContent.length > 1000) {
      throw new Error("Message must be 1000 characters or less");
    }

    // Determine receiver
    const receiverId =
      match.userId === currentUser._id ? match.matchUserId : match.userId;

    // Insert message
    const messageId = await ctx.db.insert("messages", {
      matchId: args.matchId,
      senderId: currentUser._id,
      receiverId: receiverId,
      content: trimmedContent,
      sentAt: now,
      flagged: false,
    });

    // Schedule notification check (2 minute delay)
    // This allows the user time to read the message in the app before getting an email
    // This dramatically reduces email spam for active conversations
    await ctx.scheduler.runAfter(
      2 * 60 * 1000,
      internal.chat.checkUnreadAndSendEmail,
      {
        messageId,
        matchId: args.matchId,
        senderName: currentUser.firstName,
      }
    );

    // Return new message with sender info
    const newMessage = await ctx.db.get(messageId);
    return {
      ...newMessage,
      senderName: currentUser.firstName,
      senderPhotoUrl: currentUser.photoStorageId
        ? await ctx.storage.getUrl(currentUser.photoStorageId)
        : null,
    };
  },
});

/**
 * Mark all unread messages as read for current user in a match
 * Called when user views the chat
 */
export const markMessagesAsRead = mutation({
  args: {
    matchId: v.id("weeklyMatches"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Get all unread messages where current user is receiver
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_match_and_receiver", (q) =>
        q.eq("matchId", args.matchId).eq("receiverId", currentUser._id)
      )
      .filter((q) => q.eq(q.field("readAt"), undefined))
      .collect();

    // Mark all as read
    const now = Date.now();
    await Promise.all(
      unreadMessages.map((message) =>
        ctx.db.patch(message._id, { readAt: now })
      )
    );

    return unreadMessages.length;
  },
});

/**
 * Flag a message as inappropriate
 * Admin safety feature - marks message for review
 */
export const flagMessage = mutation({
  args: {
    messageId: v.id("messages"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Verify user is part of the match (either sender or receiver)
    if (
      message.senderId !== currentUser._id &&
      message.receiverId !== currentUser._id
    ) {
      throw new Error("Unauthorized: You are not part of this conversation");
    }

    // Mark message as flagged
    await ctx.db.patch(args.messageId, {
      flagged: true,
      flaggedReason: args.reason,
    });

    // TODO: Notify admins for review (future enhancement)
    console.log(
      `Message ${args.messageId} flagged by user ${currentUser._id}: ${args.reason}`
    );

    return { success: true };
  },
});

/**
 * Cleanup expired messages
 * Internal cron job - runs daily at 3 AM UTC
 * Deletes messages from matches that expired more than 7 days ago
 */
export const cleanupExpiredMessages = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    // Find all expired matches (expired more than 7 days ago)
    const expiredMatches = await ctx.db
      .query("weeklyMatches")
      .filter((q) => q.lt(q.field("expiresAt"), sevenDaysAgo))
      .collect();

    let totalDeleted = 0;

    // For each expired match, delete all messages
    for (const match of expiredMatches) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_match", (q) => q.eq("matchId", match._id))
        .collect();

      for (const message of messages) {
        await ctx.db.delete(message._id);
        totalDeleted++;
      }
    }

    console.log(
      `🧹 Cleanup completed: Deleted ${totalDeleted} messages from ${expiredMatches.length} expired matches`
    );

    return {
      deletedMessages: totalDeleted,
      expiredMatches: expiredMatches.length,
    };
  },
});

/**
 * Check if message is still unread and send email notification
 * Logic:
 * 1. Checks if message.readAt is still null
 * 2. Checks if unreadCount is 1 OR >5 mins since last email
 * 3. Schedules email if conditions met
 */
export const checkUnreadAndSendEmail = internalMutation({
  args: {
    messageId: v.id("messages"),
    matchId: v.id("weeklyMatches"),
    senderName: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Check if message exists and is still unread
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      return; // Message deleted
    }

    if (message.readAt) {
      // console.log("Message read, skipping email");
      return; // User has seen it! Anti-spam success.
    }

    // 2. Get receiver info
    const receiver = await ctx.db.get(message.receiverId);
    if (!receiver || !receiver.email) {
      return;
    }

    // 3. Count total unread messages
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_match_and_receiver", (q) =>
        q.eq("matchId", args.matchId).eq("receiverId", message.receiverId)
      )
      .filter((q) => q.eq(q.field("readAt"), undefined))
      .collect();

    const unreadCount = unreadMessages.length;

    // 4. Check "5 minute rule" (Anti-spam throttling)
    const match = await ctx.db.get(args.matchId);
    if (!match) return;

    const lastNotificationAt = match.lastNotificationEmailSentAt ?? 0;
    const now = Date.now();
    const FIVE_MINUTES_MS = 5 * 60 * 1000;

    const shouldNotify =
      unreadCount === 1 || // First unread message (or first in a while)
      now - lastNotificationAt > FIVE_MINUTES_MS; // 5+ min since last email

    if (shouldNotify) {
      // Prepare email data
      const messagePreview =
        message.content.length > 100
          ? message.content.substring(0, 100) + "..."
          : message.content;

      const matchUrl = `${process.env.NEXT_PUBLIC_APP_URL}/chat/${args.matchId}`;

      // Schedule email
      await ctx.scheduler.runAfter(0, internal.emails.sendNewMessageEmail, {
        to: receiver.email,
        receiverName: receiver.firstName,
        senderName: args.senderName,
        messagePreview,
        matchUrl,
        unreadCount,
      });

      // Update timestamp
      await ctx.db.patch(args.matchId, {
        lastNotificationEmailSentAt: now,
      });

      console.log(
        `📧 Delayed Notification Sent: ${receiver.email} has ${unreadCount} unread messages`
      );
    } else {
      console.log(
        `Skipping email: Unread=${unreadCount}, LastSent=${Math.round((now - lastNotificationAt) / 1000)}s ago`
      );
    }
  },
});
