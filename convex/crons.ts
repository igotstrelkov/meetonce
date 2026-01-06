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
  internal.matching.weeklyMatchGeneration
);

// Run daily at 3 AM UTC to clean up expired messages
crons.daily(
  "cleanup-expired-messages",
  {
    hourUTC: 3,
    minuteUTC: 0,
  },
  internal.chat.cleanupExpiredMessages
);

export default crons;
