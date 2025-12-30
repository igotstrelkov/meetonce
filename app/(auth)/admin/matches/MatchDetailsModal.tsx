"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function MatchDetailsModal({
  matchId,
  onClose,
}: {
  matchId: Id<"weeklyMatches">;
  onClose: () => void;
}) {
  const details = useQuery(api.admin.getMatchDetails, { matchId });

  if (!details) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <div className="py-8 text-center text-gray-500">
            Loading match details...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const {
    match,
    user,
    matchUser,
    userPassReason,
    matchUserPassReason,
    userOutcome,
    matchUserOutcome,
  } = details;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Match Details: {user?.name} ↔ {matchUser?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Match Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Week of: {new Date(match.weekOf).toLocaleDateString()}</div>
              <div>Compatibility: {match.compatibilityScore}%</div>
              <div>
                Status: <Badge>{match.status}</Badge>
              </div>
              <div>Mutual Match: {match.mutualMatch ? "✅ Yes" : "❌ No"}</div>
            </div>
          </div>

          {/* AI Explanation */}
          <div>
            <h3 className="font-semibold mb-2">Why They Were Matched</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {match.explanation}
            </p>
          </div>

          {/* Conversation Starters */}
          <div>
            <h3 className="font-semibold mb-2">Conversation Starters</h3>
            <ul className="text-sm space-y-1">
              {match.conversationStarters.map((starter, i) => (
                <li key={i} className="text-gray-700">
                  • {starter}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested Venue */}
          <div>
            <h3 className="font-semibold mb-2">Suggested Venue</h3>
            <div className="text-sm">
              <div className="font-medium">{match.suggestedVenue.name}</div>
              <div className="text-gray-600">{match.suggestedVenue.address}</div>
              <div className="text-gray-600 mt-1">
                {match.suggestedVenue.description}
              </div>
            </div>
          </div>

          {/* User Responses */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">{user?.name}'s Response</h3>
              <ResponseBadge response={match.userResponse} />
              {match.userRespondedAt && (
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(match.userRespondedAt).toLocaleString()}
                </div>
              )}
              {userPassReason && (
                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    Pass Reason:
                  </div>
                  <div className="text-sm">
                    {formatPassReason(userPassReason.reason)}
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">{matchUser?.name}'s Response</h3>
              <ResponseBadge response={match.matchResponse} />
              {match.matchRespondedAt && (
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(match.matchRespondedAt).toLocaleString()}
                </div>
              )}
              {matchUserPassReason && (
                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    Pass Reason:
                  </div>
                  <div className="text-sm">
                    {formatPassReason(matchUserPassReason.reason)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date Outcomes (if mutual match) */}
          {match.mutualMatch && (userOutcome || matchUserOutcome) && (
            <div>
              <h3 className="font-semibold mb-3">Date Outcomes</h3>
              <div className="grid grid-cols-2 gap-4">
                {userOutcome && (
                  <DateOutcomeCard
                    userName={user?.name || "User"}
                    outcome={userOutcome}
                  />
                )}
                {matchUserOutcome && (
                  <DateOutcomeCard
                    userName={matchUser?.name || "Match"}
                    outcome={matchUserOutcome}
                  />
                )}
              </div>

              {/* Mutual Second Date Indicator */}
              {userOutcome?.wouldMeetAgain === "yes" &&
                matchUserOutcome?.wouldMeetAgain === "yes" && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-700">
                      🎉 SUCCESS STORY! Both want a second date!
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      This counts toward the Mutual Interest Rate (PRIMARY METRIC)
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResponseBadge({ response }: { response: string }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    interested: "bg-green-100 text-green-800",
    passed: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge className={colors[response as keyof typeof colors]}>
      {response}
    </Badge>
  );
}

function formatPassReason(reason: string): string {
  const reasons: Record<string, string> = {
    too_far: "Too far away",
    lifestyle: "Lifestyle mismatch",
    attraction: "Not physically attracted",
    profile: "Profile didn't resonate",
    dealbreaker: "Dealbreaker in profile",
    no_chemistry: "Don't feel the chemistry",
    skipped: "Skipped feedback",
  };
  return reasons[reason] || reason;
}

function DateOutcomeCard({
  userName,
  outcome,
}: {
  userName: string;
  outcome: any;
}) {
  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <h4 className="font-medium mb-2">{userName}</h4>
      <div className="text-sm space-y-1">
        <div>
          Date happened: <strong>{outcome.dateHappened}</strong>
        </div>
        {outcome.overallRating && (
          <div>
            Rating:{" "}
            <strong>
              {"★".repeat(outcome.overallRating)}
              {"☆".repeat(5 - outcome.overallRating)}
            </strong>
          </div>
        )}
        {outcome.wouldMeetAgain && (
          <div className="mt-2">
            <span
              className={
                outcome.wouldMeetAgain === "yes"
                  ? "text-green-600 font-semibold"
                  : ""
              }
            >
              Second date: {outcome.wouldMeetAgain}
              {outcome.wouldMeetAgain === "yes" && " 💚"}
            </span>
          </div>
        )}
        {outcome.wentWell && outcome.wentWell.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-600">Went well:</div>
            <div className="text-xs">{outcome.wentWell.join(", ")}</div>
          </div>
        )}
        {outcome.wentPoorly && outcome.wentPoorly.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-600">Didn't go well:</div>
            <div className="text-xs">{outcome.wentPoorly.join(", ")}</div>
          </div>
        )}
        {outcome.additionalThoughts && (
          <div className="mt-2">
            <div className="text-xs text-gray-600">Additional thoughts:</div>
            <div className="text-xs italic">{outcome.additionalThoughts}</div>
          </div>
        )}
      </div>
    </div>
  );
}
