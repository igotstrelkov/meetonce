import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every Sunday at 11 PM UTC
crons.weekly(
  "weekly-match-generation",
  {
    dayOfWeek: "sunday",
    hourUTC: 23,
    minuteUTC: 0,
  },
  internal.matching.weeklyMatchGeneration,
);

// Run Monday at 11 PM UTC — 24 hours (+1) after Sunday match generation
crons.weekly(
  "expire-stale-matches",
  { dayOfWeek: "tuesday", hourUTC: 0, minuteUTC: 0 },
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
