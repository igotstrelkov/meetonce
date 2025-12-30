import { internalAction } from "./_generated/server";
import { v } from "convex/values";

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
      Subject: ✅ Your Profile is Live!

      Hi ${args.userName},

      Great news! Your photo has been approved and your profile is now live.

      You'll start receiving weekly matches every Monday morning.

      Dashboard: ${args.dashboardUrl}
      ==================================
    `);

    // Uncomment when ready to send real emails:
    /*
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <matches@yourdomain.com>",
        to: args.to,
        subject: "✅ Your Profile is Live!",
        html: `
          <h1>Your Profile is Live!</h1>
          <p>Hi ${args.userName},</p>
          <p>Great news! Your photo has been approved and your profile is now live.</p>
          <p>You'll start receiving weekly matches every Monday morning.</p>
          <p><a href="${args.dashboardUrl}">Go to Dashboard</a></p>
        `,
      });
      console.log(`Photo approved email sent to ${args.to}`);
    } catch (error) {
      console.error("Email error:", error);
    }
    */
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
      ${args.guidance ? `Guidance: ${args.guidance}` : ''}

      Upload New Photo: ${args.uploadUrl}
      ==================================
    `);

    // Uncomment when ready to send real emails:
    /*
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <matches@yourdomain.com>",
        to: args.to,
        subject: "Photo Review Update",
        html: `
          <h1>Photo Review Update</h1>
          <p>Hi ${args.userName},</p>
          <p>Your photo needs to be updated.</p>
          <p><strong>Reason:</strong> ${args.reason}</p>
          ${args.guidance ? `<p><strong>Guidance:</strong> ${args.guidance}</p>` : ''}
          <p><a href="${args.uploadUrl}">Upload New Photo</a></p>
        `,
      });
      console.log(`Photo rejected email sent to ${args.to}`);
    } catch (error) {
      console.error("Email error:", error);
    }
    */
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
    // TODO: Integrate with Resend
    // For now, just log the email that would be sent
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

    // Uncomment when ready to send real emails:
    /*
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <matches@yourdomain.com>",
        to: args.to,
        subject: `Your Weekly Match: ${args.matchName}!`,
        html: `
          <h1>Your Weekly Match</h1>
          <p>Hi ${args.userName},</p>
          <p>We've found someone special for you: ${args.matchName}, ${args.matchAge}</p>
          <p><a href="${args.matchUrl}">View Your Match</a></p>
        `,
      });
      console.log(`Email sent to ${args.to}`);
    } catch (error) {
      console.error("Email error:", error);
    }
    */
  },
});

export const sendMutualMatchEmail = internalAction({
  args: {
    to: v.string(),
    userName: v.string(),
    matchName: v.string(),
    conversationStarters: v.array(v.string()),
    venueName: v.string(),
    venueAddress: v.string(),
    matchUrl: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`
      ====== MUTUAL MATCH EMAIL ======
      To: ${args.to}
      Subject: 🎉 It's a Match with ${args.matchName}!

      Hi ${args.userName},

      Great news! ${args.matchName} is interested too!

      Conversation Starters:
      ${args.conversationStarters.map((s, i) => `${i + 1}. ${s}`).join("\n")}

      Suggested Venue:
      ${args.venueName}
      ${args.venueAddress}

      Match Details: ${args.matchUrl}

      We'll send you both contact information to schedule your date!
      ================================
    `);

    // Uncomment when ready to send real emails:
    /*
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "MeetOnce <matches@yourdomain.com>",
        to: args.to,
        subject: \`🎉 It's a Match with \${args.matchName}!\`,
        html: \`
          <h1>It's a Match!</h1>
          <p>Hi \${args.userName},</p>
          <p>Exciting news! \${args.matchName} is interested too!</p>
          <h3>Conversation Starters:</h3>
          <ul>
            \${args.conversationStarters.map((s, i) => \`<li>\${i + 1}. \${s}</li>\`).join('')}
          </ul>
          <h3>Suggested Meeting Spot:</h3>
          <p><strong>\${args.venueName}</strong><br>\${args.venueAddress}</p>
          <p><a href="\${args.matchUrl}">View Match Details</a></p>
        \`,
      });
      console.log(\`Mutual match email sent to \${args.to}\`);
    } catch (error) {
      console.error("Email error:", error);
    }
    */
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
      Subject: 🎉 ${args.matchName} wants a second date too!

      Hi ${args.userName},

      Amazing news! Both you and ${args.matchName} want to meet again!

      Here's their contact information:
      Email: ${args.matchEmail}

      Reach out and plan your second date!
      ======================================
    `);
  },
});
