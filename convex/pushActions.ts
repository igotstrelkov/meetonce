"use node";

import { v } from "convex/values";
import webpush from "web-push";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const sendPushToUser = internalAction({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.log("⚠️ VAPID keys not configured, skipping push notification");
      return;
    }

    webpush.setVapidDetails(
      "mailto:admin@meetonce.ie",
      vapidPublicKey,
      vapidPrivateKey
    );

    // Get all subscriptions for this user
    const subscriptions = await ctx.runQuery(
      internal.notifications.getSubscriptionsForUser,
      { userId: args.userId }
    );

    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      url: args.url,
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
      } catch (err: unknown) {
        const error = err as { statusCode?: number };
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription expired or invalid — clean it up
          await ctx.runMutation(
            internal.notifications.deleteSubscriptionById,
            { subscriptionId: sub._id }
          );
          console.log(`🗑️ Removed expired push subscription ${sub._id}`);
        } else {
          console.error(`Failed to send push to ${sub.endpoint}:`, err);
        }
      }
    }
  },
});
