import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MatchDrawer } from "@/components/match/MatchDrawer";
import PassFeedbackForm from "@/components/match/PassFeedbackForm";
import { StatusCard } from "@/components/match/StatusCard";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { useMatchInteraction } from "@/hooks/useMatchInteraction";
import { useQuery } from "convex/react";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Split content into a separate component to allow using the hook conditionally/cleanly
export const ThisWeek = () => {
  const router = useRouter();

  const matchData = useQuery(api.matches.getCurrentMatch);

  // Query unread count
  const unreadCount =
    useQuery(
      api.chat.getUnreadCount,
      matchData && matchData.match.mutualMatch
        ? { matchId: matchData.match._id }
        : "skip"
    ) || 0;

  const match = matchData?.match;
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

  if (matchData === undefined) {
    return <LoadingSpinner />;
  }

  if (matchData === null || !match) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">No Match This Week</h2>
          <p className="text-gray-700">
            We're still looking for your perfect match. New matches are released
            every Monday morning!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MatchDrawer match={match} matchUser={matchData.matchUser} />

      {/* Response Buttons or Status */}
      {myResponse === "pending" && (
        <Card>
          <CardFooter className="pt-6">
            <Button
              onClick={handleInterested}
              size="lg"
              className="flex-1 mr-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "I'm Interested!"}
            </Button>
            <Button
              onClick={handlePass}
              size="lg"
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Pass
            </Button>
          </CardFooter>
        </Card>
      )}

      {showPassFeedback && (
        <PassFeedbackForm
          onSubmit={handlePassComplete}
          onCancel={() => setShowPassFeedback(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {myResponse === "interested" && theirResponse === "pending" && (
        <StatusCard
          icon="🤞"
          title="Response Sent!"
          description="You're interested! Waiting for their response..."
        />
      )}

      {myResponse === "passed" && (
        <StatusCard
          icon="👋"
          title="Passed"
          description="You passed on this match. Check back next Monday!"
        />
      )}

      {/* Mutual Match - Chat Button */}
      {match.mutualMatch && (
        <StatusCard
          icon="🎉"
          title="It's a Date!"
          description="You both are interested! Use chat to plan your first date."
        >
          <Separator />

          <Button
            onClick={() => router.push(`/chat/${match._id}`)}
            size="lg"
            className="w-full gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Open Chat
            {unreadCount > 0 && <span>({unreadCount} new)</span>}
          </Button>
        </StatusCard>
      )}
    </div>
  );
};
