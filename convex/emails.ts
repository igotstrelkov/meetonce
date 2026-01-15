import { v } from "convex/values";
import MutualMatch from "../emails/MutualMatch";
import NewMessage from "../emails/NewMessage";
import PhotoApproved from "../emails/PhotoApproved";
import PhotoRejected from "../emails/PhotoRejected";
import SecondDateContact from "../emails/SecondDateContact";
import Waitlist from "../emails/Waitlist";
import WeeklyMatch from "../emails/WeeklyMatch";
import { action, internalAction } from "./_generated/server";

export const sendWaitlistEmail = internalAction({
  args: {
    to: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`
      ====== WAITLIST EMAIL ======
      To: ${args.to}
      Subject: You're on the Waitlist!

      Hi ${args.userName},

      Your profile has been reviewed and you're on our waitlist.
      We'll notify you when your account is fully activated.
      ============================
    `);

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <admin@meetonce.co>",
        to: args.to,
        subject: "You're on the Waitlist!",
        react: Waitlist({
          userName: args.userName,
        }),
      });
      console.log(`✅ Waitlist email sent to ${args.to}`);
    } catch (error) {
      console.error("❌ Email error:", error);
      throw error;
    }
  },
});

export const sendPhotoApprovedEmail = internalAction({
  args: {
    to: v.string(),
    userName: v.string(),
    dashboardUrl: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`
      ====== PHOTO APPROVED EMAIL ======
      To: ${args.to}
      Subject: Your Profile is Live!

      Hi ${args.userName},

      Great news! Your photo has been approved and your profile is now live.

      You'll start receiving weekly matches every Monday morning.

      Dashboard: ${args.dashboardUrl}
      ==================================
    `);

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <admin@meetonce.co>",
        to: args.to,
        subject: "Your Profile is Live!",
        react: PhotoApproved({
          userName: args.userName,
          dashboardUrl: args.dashboardUrl,
        }),
      });
      console.log(`✅ Photo approved email sent to ${args.to}`);
    } catch (error) {
      console.error("❌ Email error:", error);
      throw error;
    }
  },
});

export const sendPhotoRejectedEmail = internalAction({
  args: {
    to: v.string(),
    userName: v.string(),
    reason: v.string(),
    guidance: v.optional(v.string()),
    uploadUrl: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`
      ====== PHOTO REJECTED EMAIL ======
      To: ${args.to}
      Subject: Photo Review Update

      Hi ${args.userName},

      Your photo needs to be updated.

      Reason: ${args.reason}
      ${args.guidance ? `Guidance: ${args.guidance}` : ""}

      Upload New Photo: ${args.uploadUrl}
      ==================================
    `);

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <admin@meetonce.co>",
        to: args.to,
        subject: "Photo Review Update",
        react: PhotoRejected({
          userName: args.userName,
          reason: args.reason,
          guidance: args.guidance,
          uploadUrl: args.uploadUrl,
        }),
      });
      console.log(`✅ Photo rejected email sent to ${args.to}`);
    } catch (error) {
      console.error("❌ Email error:", error);
      throw error;
    }
  },
});

export const sendWeeklyMatchEmail = internalAction({
  args: {
    to: v.string(),
    userName: v.string(),
    matchName: v.string(),
    matchAge: v.number(),
    matchUrl: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`
      ====== WEEKLY MATCH EMAIL ======
      To: ${args.to}
      Subject: Your Weekly Match: ${args.matchName}!

      Hi ${args.userName},

      We've found someone special for you this week!

      Meet ${args.matchName}, ${args.matchAge}

      View Your Match: ${args.matchUrl}

      Respond by Friday to let them know you're interested!
      ================================
    `);

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <admin@meetonce.co>",
        to: args.to,
        subject: `Your Weekly Match: ${args.matchName}!`,
        react: WeeklyMatch({
          userName: args.userName,
          matchName: args.matchName,
          matchAge: args.matchAge,
          matchUrl: args.matchUrl,
        }),
      });
      console.log(`✅ Weekly match email sent to ${args.to}`);
    } catch (error) {
      console.error("❌ Email error:", error);
      throw error;
    }
  },
});

export const sendMutualMatchEmail = internalAction({
  args: {
    to: v.string(),
    userName: v.string(),
    matchName: v.string(),
    matchUrl: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`
      ====== MUTUAL MATCH EMAIL ======
      To: ${args.to}
      Subject: It's a Match with ${args.matchName}!

      Hi ${args.userName},

      Great news! ${args.matchName} is interested too!

      Match Details: ${args.matchUrl}

      Start chatting now in the app to plan your date!
      ================================
    `);

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <admin@meetonce.co>",
        to: args.to,
        subject: `It's a Match with ${args.matchName}!`,
        react: MutualMatch({
          userName: args.userName,
          matchName: args.matchName,
          matchUrl: args.matchUrl,
        }),
      });
      console.log(`✅ Mutual match email sent to ${args.to}`);
    } catch (error) {
      console.error("❌ Email error:", error);
      throw error;
    }
  },
});

export const sendSecondDateContactEmail = internalAction({
  args: {
    to: v.string(),
    userName: v.string(),
    matchName: v.string(),
    matchEmail: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`
      ====== SECOND DATE CONTACT INFO ======
      To: ${args.to}
      Subject: ${args.matchName} wants a second date too!

      Hi ${args.userName},

      Amazing news! Both you and ${args.matchName} want to meet again!

      Here's their contact information:
      Email: ${args.matchEmail}

      Reach out and plan your second date!
      ======================================
    `);

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <admin@meetonce.co>",
        to: args.to,
        subject: `${args.matchName} wants a second date too!`,
        react: SecondDateContact({
          userName: args.userName,
          matchName: args.matchName,
          matchEmail: args.matchEmail,
        }),
      });
      console.log(`✅ Second date contact email sent to ${args.to}`);
    } catch (error) {
      console.error("❌ Email error:", error);
      throw error;
    }
  },
});

export const sendNewMessageEmail = internalAction({
  args: {
    to: v.string(),
    receiverName: v.string(),
    senderName: v.string(),
    messagePreview: v.string(),
    matchUrl: v.string(),
    unreadCount: v.number(),
  },
  handler: async (ctx, args) => {
    const messageCount =
      args.unreadCount === 1
        ? "1 new message"
        : `${args.unreadCount} new messages`;

    console.log(`
      ====== NEW MESSAGE EMAIL ======
      To: ${args.to}
      From: ${args.senderName}
      Unread Count: ${args.unreadCount}
      Subject: New message from ${args.senderName}
      ==================================
    `);

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <admin@meetonce.co>",
        to: args.to,
        subject: `New message from ${args.senderName}`,
        react: NewMessage({
          receiverName: args.receiverName,
          senderName: args.senderName,
          messagePreview: args.messagePreview,
          matchUrl: args.matchUrl,
          unreadCount: args.unreadCount,
        }),
      });
      console.log(`✅ New message email sent to ${args.to} (${messageCount})`);
    } catch (error) {
      console.error("❌ Email error:", error);
      // Don't throw - email failures should not block message delivery
    }
  },
});

export const sendUserFeedback = action({
  args: {
    feedback: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated to send feedback");
    }

    const userInfo = args.userEmail || identity.email || identity.subject;

    console.log(`
      ====== USER FEEDBACK ======
      From: ${userInfo}
      Feedback: ${args.feedback}
      ===========================
    `);

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <admin@meetonce.co>",
        to: "igorstrelkov95@gmail.com",
        subject: "MeetOnce User Feedback",
        text: `Feedback from: ${userInfo}\n\n${args.feedback}`,
      });
      console.log(`✅ User feedback email sent`);
      return { success: true };
    } catch (error) {
      console.error("❌ Feedback email error:", error);
      throw new Error("Failed to send feedback");
    }
  },
});
