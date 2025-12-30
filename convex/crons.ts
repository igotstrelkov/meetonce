import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every Sunday at 11 PM UTC
crons.weekly(
  "weekly-match-generation",
  {
    dayOfWeek: "sunday",
    hourUTC: 23,
    minuteUTC: 0
  },
  internal.matching.weeklyMatchGeneration
);

export default crons;
