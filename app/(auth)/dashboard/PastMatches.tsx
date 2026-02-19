"use client";

import { FeedbackContent } from "@/app/(auth)/dashboard/FeedbackContent";
import { FeedbackForm } from "@/app/(auth)/dashboard/FeedbackForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Calendar, Check, ChevronDown, ChevronUp, MapPin, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatWeekOf(weekOf: string): string {
  // weekOf is "YYYY-MM-DD" (Monday of that week)
  const date = new Date(weekOf + "T12:00:00");
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks === 0) return "This week";
  if (diffWeeks === 1) return "Last week";
  if (diffWeeks < 8) return `${diffWeeks} weeks ago`;
  return date.toLocaleDateString("en-IE", { month: "long", day: "numeric" });
}

// ─── Root component ──────────────────────────────────────────────────────────

export function PastMatches() {
  const pastMatches = useQuery(api.matches.getPastMatches, {});

  if (pastMatches === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  const mutual = pastMatches.filter((item) => item.match.mutualMatch);

  if (mutual.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <Calendar className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">No Past Dates</h2>
        <p className="text-muted-foreground max-w-md">
          Your past dates will appear here. Leave feedback after each one to
          help us find you better matches.
        </p>
      </div>
    );
  }

  // Pending feedback first, then done
  const sorted = [...mutual].sort((a, b) => {
    if (a.feedbackProvided === b.feedbackProvided) return 0;
    return a.feedbackProvided ? 1 : -1;
  });

  const pendingCount = sorted.filter((m) => !m.feedbackProvided).length;

  return (
    <div className="space-y-3">
      {pendingCount > 0 && (
        <p className="text-xs text-amber-600 font-medium px-1">
          {pendingCount} date{pendingCount === 1 ? "" : "s"} awaiting feedback
        </p>
      )}
      {sorted.map((item) => (
        <PastMatchItem key={item.match._id} item={item} />
      ))}
    </div>
  );
}

// ─── Individual item ─────────────────────────────────────────────────────────

interface PastMatchItemProps {
  item: {
    match: Doc<"weeklyMatches">;
    matchUser: Doc<"users"> & { photoUrl: string | null };
    feedbackProvided: boolean;
  };
}

function PastMatchItem({ item }: PastMatchItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { match, matchUser, feedbackProvided } = item;

  const dateLabel = formatWeekOf(match.weekOf);
  const isPending = !feedbackProvided;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-shadow ${
        isPending
          ? "border-amber-200 bg-amber-50/40 shadow-sm"
          : "border-border bg-background"
      }`}
    >
      {/* ── Card header ── */}
      <div
        className="flex gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Photo */}
        <div className="shrink-0 relative w-[72px] h-[72px]">
          <Image
            src={matchUser.photoUrl || "/avatar.png"}
            alt={matchUser.firstName}
            fill
            className={`object-cover rounded-xl transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } ${!isPending ? "opacity-70" : ""}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg leading-tight">
              {matchUser.firstName}, {matchUser.age}
            </h3>
            {/* Compatibility chip */}
            <span className="shrink-0 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {match.compatibilityScore}%
            </span>
          </div>

          <div className="mt-1 space-y-0.5">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{match.suggestedVenue.name}</span>
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {dateLabel}
            </p>
          </div>
        </div>

        {/* Status + chevron */}
        <div className="shrink-0 flex flex-col items-end justify-between">
          {feedbackProvided ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400 mt-1" />
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* ── Pending CTA (not expanded) ── */}
      {isPending && !expanded && (
        <div
          className="mx-4 mb-4 flex items-center justify-between bg-amber-100/60 border border-amber-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={() => setExpanded(true)}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-700" />
            <span className="text-sm font-medium text-amber-800">
              How did it go with {matchUser.firstName}?
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-amber-600" />
        </div>
      )}

      {/* ── Expanded content ── */}
      {expanded && (
        <div className="border-t border-border">
          {feedbackProvided ? (
            <div className="p-4">
              <FeedbackContent match={match} matchUser={matchUser} />
            </div>
          ) : (
            <div className="p-4">
              <FeedbackForm
                match={match}
                onComplete={() => setExpanded(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
