import { LoadingSpinner } from "@/components/LoadingSpinner";
import PassFeedbackForm from "@/components/match/PassFeedbackForm";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { getDirectionsUrl } from "@/convex/lib/googlePlaces";
import { useMatchInteraction } from "@/hooks/useMatchInteraction";
import { useQuery } from "convex/react";
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTimeLabel(expiresAt: number): string {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0)
    return minutes <= 1 ? "Less than a minute left" : `${minutes}m left`;
  if (hours < 2) return `${hours}h ${minutes}m left`;
  return `${hours} hours left`;
}

function getProgressPercent(expiresAt: number): number {
  const total = 24 * 60 * 60 * 1000;
  const remaining = expiresAt - Date.now();
  return Math.max(0, Math.min(100, (remaining / total) * 100));
}

function parseHighlights(explanation: string, slice?: number): string[] {
  const sentences = explanation.match(/[^.!?]+[.!?]+/g) ?? [];
  return sentences
    .map((s) => s.trim())
    .filter((s) => s.length > 30)
    .slice(0, slice);
}

const DIMENSION_META: Record<string, { label: string; max: number }> = {
  values: { label: "Shared Values", max: 25 },
  lifestyle: { label: "Lifestyle", max: 25 },
  interests: { label: "Interests", max: 20 },
  communication: { label: "Communication", max: 20 },
  relationshipVision: { label: "Relationship Vision", max: 10 },
};

// ─── Component ───────────────────────────────────────────────────────────────

export const ThisWeek = () => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [celebrationDone, setCelebrationDone] = useState(false);

  const matchData = useQuery(api.matches.getCurrentMatch);
  const unreadCount =
    useQuery(
      api.chat.getUnreadCount,
      matchData && matchData.match.mutualMatch
        ? { matchId: matchData.match._id }
        : "skip",
    ) ?? 0;

  const match = matchData?.match;
  const matchUser = matchData?.matchUser;
  const isReversed = matchData?.isReversed ?? false;
  const myResponse =
    matchData && match && isReversed
      ? match.matchResponse
      : match?.userResponse;
  const theirResponse =
    matchData && match && isReversed
      ? match.userResponse
      : match?.matchResponse;

  const {
    handleInterested,
    handlePass,
    handlePassComplete,
    isSubmitting,
    showPassFeedback,
    setShowPassFeedback,
  } = useMatchInteraction({
    matchId: match?._id,
    matchUserId: isReversed ? match?.userId : match?.matchUserId,
    isReversed,
    weekOf: match?.weekOf,
  });

  const celebrationKey = match?._id ? `meetonce_celebrated_${match._id}` : null;

  useEffect(() => {
    if (!match?.mutualMatch || !celebrationKey) return;
    // Already played for this match — skip immediately
    if (localStorage.getItem(celebrationKey)) {
      setCelebrationDone(true);
      return;
    }
    // First time — play the interstitial, then persist
    const t = setTimeout(() => {
      setCelebrationDone(true);
      localStorage.setItem(celebrationKey, "1");
    }, 2500);
    return () => clearTimeout(t);
  }, [match?.mutualMatch, celebrationKey]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (matchData === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  // ── No match ──────────────────────────────────────────────────────────────
  if (matchData === null || !match || !matchUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <Calendar className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">No Match This Week</h2>
        <p className="text-muted-foreground max-w-md">
          We're still looking for your perfect match. New matches are released
          every Monday morning!
        </p>
      </div>
    );
  }

  // ── Expired ───────────────────────────────────────────────────────────────
  if (match.status === "expired" || Date.now() > match.expiresAt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <Calendar className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Match Expired</h2>
        <p className="text-muted-foreground max-w-md">
          This match expired — a new one arrives Monday.
        </p>
      </div>
    );
  }

  // ── Shared derived values ─────────────────────────────────────────────────
  const timeLabel = getTimeLabel(match.expiresAt);
  const progressPercent = getProgressPercent(match.expiresAt);
  const msRemaining = match.expiresAt - Date.now();
  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
  const highlights = parseHighlights(match.explanation);
  const dimensions = match.dimensionScores
    ? Object.entries(match.dimensionScores).map(([key, score]) => ({
        key,
        score,
        ...DIMENSION_META[key],
      }))
    : [];
  const theirPronoun =
    matchUser.gender?.toLowerCase() === "male"
      ? "he"
      : matchUser.gender?.toLowerCase() === "female"
        ? "she"
        : "they";
  const scheduledText =
    match.dateScheduled && match.dateScheduledFor
      ? new Date(match.dateScheduledFor).toLocaleString("en-US", {
          weekday: "long",
          hour: "numeric",
          minute: "numeric",
        })
      : "Saturday at 2PM";

  // ══════════════════════════════════════════════════════════════════════════
  // CELEBRATION INTERSTITIAL
  // Shown for 2.5s immediately after mutual match is detected
  // ══════════════════════════════════════════════════════════════════════════
  if (myResponse === "interested" && match.mutualMatch && !celebrationDone) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green-50 text-center px-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-200 ring-offset-4 animate-pulse">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-900 mb-3">
          It&apos;s a match!
        </h1>
        <p className="text-green-700 text-lg max-w-xs">
          You and {matchUser.firstName} both want to meet.
        </p>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MUTUAL MATCH SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (myResponse === "interested" && match.mutualMatch) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-80px)]">
        {/* Photo — half height */}
        <div className="relative h-[50vh] shrink-0">
          <Image
            src={matchUser.photoUrl || "/avatar.png"}
            alt={matchUser.firstName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-950/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="inline-flex items-center gap-1.5 bg-green-500/30 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-semibold border border-green-400/40 mb-3">
              <Check className="w-3.5 h-3.5" />
              It&apos;s a match!
            </div>
            <h1 className="text-3xl font-bold">
              {matchUser.firstName}, {matchUser.age}
            </h1>
            {matchUser.location && (
              <p className="text-white/70 text-sm flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {matchUser.location}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-background px-6 py-8 space-y-4">
          {/* Venue */}
          <div
            className="flex items-start gap-4 p-4 bg-muted/50 rounded-2xl cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() =>
              window.open(
                getDirectionsUrl({
                  placeId: match.suggestedVenue.placeId,
                  address: match.suggestedVenue.address,
                }),
                "_blank",
              )
            }
          >
            <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold">Venue</h3>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {match.suggestedVenue.name}
              </p>
              {/* {match.suggestedVenue.rating && (
                <p className="text-sm text-amber-500 flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {match.suggestedVenue.rating}
                </p>
              )} */}
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-2xl">
            <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Time</h3>
              <p className="text-muted-foreground">{scheduledText}</p>
            </div>
          </div>

          {/* Chat */}
          <Button
            onClick={() => router.push(`/chat/${match._id}`)}
            size="lg"
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat & Plan Date
            {unreadCount > 0 && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-green-700/80 italic">
            Make sure to confirm the details in chat.
          </p>
          <p className="text-xs text-center text-muted-foreground">
            Reminder: this is a commitment to show up. No-shows result in a
            permanent ban.
          </p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INTERESTED — WAITING SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (myResponse === "interested") {
    return (
      <div className="flex flex-col min-h-[calc(100vh-80px)]">
        {/* Compact photo header */}
        <div className="relative h-52 shrink-0">
          <Image
            src={matchUser.photoUrl || "/avatar.png"}
            alt={matchUser.firstName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <h2 className="text-2xl font-bold">
              {matchUser.firstName}, {matchUser.age}
            </h2>
            {matchUser.location && (
              <p className="text-white/70 text-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {matchUser.location}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-background px-6 py-8 space-y-8">
          {/* Confirmation */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mt-3">You&apos;re in</h3>
            <p className="text-muted-foreground text-sm">
              Now waiting for {matchUser.firstName} to decide.
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-muted/40 rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-3">
              {/* You */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center ring-2 ring-green-300">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-700">
                  You ✓
                </span>
              </div>

              {/* Connector */}
              <div className="flex-1 flex items-center">
                <div className="h-0.5 w-1/2 bg-green-300 rounded-full" />
                <div className="h-0.5 w-1/2 border-t-2 border-dashed border-muted-foreground/25" />
              </div>

              {/* Them */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                  <span className="text-muted-foreground font-bold text-lg">
                    ?
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {matchUser.firstName}
                </span>
              </div>
            </div>

            {/* Countdown bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Response window
                </span>
                <span
                  className={`font-semibold ${hoursRemaining < 3 ? "text-red-500" : "text-amber-600"}`}
                >
                  {timeLabel}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${hoursRemaining < 3 ? "bg-red-400" : "bg-amber-400"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Venue locked hint */}
          <div className="border border-dashed border-muted-foreground/20 rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Venue & time unlock if {matchUser.firstName} accepts
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PASSED SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (myResponse === "passed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <X className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">You passed</h2>
        <p className="text-muted-foreground max-w-sm">
          {theirResponse === "interested"
            ? `${matchUser.firstName} had said yes — ${theirPronoun} won't be notified.`
            : "Check back next Monday for your next match."}
        </p>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PENDING SCREEN — main decision view
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="flex flex-col">
        {/* ── Full-viewport hero photo ── */}
        <div className="h-[calc(100svh-80px)] relative shrink-0">
          <Image
            src={matchUser.photoUrl || "/avatar.png"}
            alt={matchUser.firstName}
            fill
            className={`object-cover transition-opacity duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />

          {/* Compatibility chip */}
          <div className="absolute top-6 left-6">
            <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/25">
              <span className="text-white text-sm font-bold">
                {match.compatibilityScore}% Match
              </span>
            </div>
          </div>

          {/* Identity */}
          <div className="absolute bottom-14 left-6 right-6 text-white">
            <h1 className="text-5xl font-bold mb-1">
              {matchUser.firstName}, {matchUser.age}
            </h1>
            {matchUser.jobTitle && (
              <p className="text-white/85 text-lg font-medium">
                {matchUser.jobTitle}
              </p>
            )}
            {matchUser.location && (
              <p className="text-white/60 text-sm flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {matchUser.location}
              </p>
            )}
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-5 left-0 right-0 flex justify-center">
            <ChevronDown className="w-5 h-5 text-white/40 animate-bounce" />
          </div>
        </div>

        {/* ── Analysis panel ── */}
        <div className="bg-background rounded-t-3xl -mt-5 relative z-10 px-6 pt-8 pb-6 space-y-7">
          {/* Why you match — sentence highlights */}
          {highlights.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Why you match
              </h3>
              <ul className="space-y-2.5">
                {highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Compatibility breakdown */}
          {dimensions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Compatibility breakdown
              </h3>
              <div className="space-y-3">
                {dimensions.map(({ key, label, score, max }) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">
                        {label}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {score}/{max}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full"
                        style={{ width: `${(score / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatibility notes */}
          {match.redFlags && match.redFlags.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Compatibility notes
              </h3>
              <ul className="space-y-1.5">
                {match.redFlags.map((flag, i) => (
                  <li
                    key={i}
                    className="text-sm text-amber-800 flex items-start gap-2"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Spacer so fixed bar never covers content */}
        <div className="h-40" />
      </div>

      {/* ── Fixed bottom action bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t px-4 pt-3 pb-6 space-y-3 z-20">
        {/* Time bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Response window
            </span>
            <span
              className={`font-semibold ${hoursRemaining < 3 ? "text-red-500" : "text-amber-600"}`}
            >
              {timeLabel}
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${hoursRemaining < 3 ? "bg-red-400" : "bg-amber-400"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Pass / Accept */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handlePass}
            variant="outline"
            size="lg"
            className="h-14 text-base border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Pass
          </Button>
          <Button
            onClick={handleInterested}
            size="lg"
            className="h-14 text-base bg-foreground hover:bg-foreground/90 text-background shadow-lg shadow-foreground/10"
            disabled={isSubmitting}
          >
            <Check className="w-4 h-4 mr-2" />
            Accept
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          By accepting, you commit to showing up. No-shows result in a permanent
          ban.
        </p>
      </div>

      {/* Pass feedback overlay */}
      {showPassFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <PassFeedbackForm
              onSubmit={handlePassComplete}
              onCancel={() => setShowPassFeedback(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </>
  );
};
