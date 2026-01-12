import { MatchDrawer } from "@/components/match/MatchDrawer";
import PassFeedbackForm from "@/components/match/PassFeedbackForm";
import { StatusCard } from "@/components/match/StatusCard";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMatchInteraction } from "@/hooks/useMatchInteraction";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Split content into a separate component to allow using the hook conditionally/cleanly
export const DashboardContent = ({
  currentUser,
  matchData,
  unreadCount,
  myResponse,
  theirResponse,
  isReversed,
}: {
  currentUser: any;
  matchData: any;
  unreadCount: number;
  myResponse: string;
  theirResponse: string;
  isReversed: boolean;
}) => {
  const router = useRouter();
  const { match } = matchData;

  const {
    handleInterested,
    handlePass,
    handlePassComplete,
    isSubmitting,
    showPassFeedback,
    setShowPassFeedback,
  } = useMatchInteraction({
    matchId: match._id,
    userId: currentUser._id,
    matchUserId: isReversed ? match.userId : match.matchUserId,
    isReversed,
    weekOf: match.weekOf,
  });

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

      <div>
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
      </div>

      {/* Mutual Match - Chat Button */}
      {match.mutualMatch && (
        <StatusCard
          icon="🎉"
          title="It's Mutual!"
          description="You both are interested! Start chatting to plan your date."
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

          <p className="text-sm text-muted-foreground text-center">
            Chat is active until Friday at 11:59 PM
          </p>
        </StatusCard>
      )}
    </div>
  );
};
