import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every Wednesday at 11 PM UTC
crons.weekly(
  "weekly-match-generation",
  {
    dayOfWeek: "wednesday",
    hourUTC: 23,
    minuteUTC: 0,
  },
  internal.matching.weeklyMatchGeneration,
);

// Run Friday at midnight UTC — ~25 hours after Wednesday match generation
crons.weekly(
  "expire-stale-matches",
  { dayOfWeek: "friday", hourUTC: 0, minuteUTC: 0 },
  internal.matching.expireStaleMatches,
);

// Run daily at 3 AM UTC to clean up expired messages
crons.daily(
  "cleanup-expired-messages",
  {
    hourUTC: 3,
    minuteUTC: 0,
  },
  internal.chat.cleanupExpiredMessages,
);

export default crons;
