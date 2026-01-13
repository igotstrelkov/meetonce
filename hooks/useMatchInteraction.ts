import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";

interface UseMatchInteractionProps {
  matchId?: Id<"weeklyMatches">;
  matchUserId?: Id<"users">;
  isReversed?: boolean;
  weekOf?: string;
}

export function useMatchInteraction({
  matchId,
  matchUserId,
  isReversed,
  weekOf,
}: UseMatchInteractionProps) {
  const respond = useMutation(api.matches.respondToMatch);
  const submitPassFeedback = useMutation(api.feedback.submitPassFeedback);

  const [showPassFeedback, setShowPassFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInterested = async () => {
    if (isSubmitting || !matchId || !isReversed) return;
    setIsSubmitting(true);

    try {
      await respond({
        matchId,
        response: "interested",
        isReversed,
      });
    } catch (error) {
      console.error("Error responding to match:", error);
      alert("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePass = () => {
    setShowPassFeedback(true);
  };

  const handlePassComplete = async (reason?: string) => {
    if (isSubmitting || !matchId || !isReversed) return;
    setIsSubmitting(true);

    try {
      await respond({
        matchId,
        response: "passed",
        isReversed,
      });

      setShowPassFeedback(false);

      if (reason && matchUserId && weekOf) {
        await submitPassFeedback({
          matchId,
          matchUserId,
          weekOf,
          reason: reason as any,
        });
      }
    } catch (error) {
      console.error("Error responding to match:", error);
      alert("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleInterested,
    handlePass,
    handlePassComplete,
    isSubmitting,
    showPassFeedback,
    setShowPassFeedback,
  };
}
