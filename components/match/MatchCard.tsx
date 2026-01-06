"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PassFeedbackForm from "./PassFeedbackForm";

type MatchCardProps = {
  match: any;
  matchUser: any;
  isReversed: boolean;
  currentUserId: Id<"users">;
};

export default function MatchCard({
  match,
  matchUser,
  isReversed,
  currentUserId,
}: MatchCardProps) {
  const router = useRouter();
  const respond = useMutation(api.matches.respondToMatch);
  const submitPassFeedback = useMutation(api.feedback.submitPassFeedback);
  const [showPassFeedback, setShowPassFeedback] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const myResponse = isReversed ? match.matchResponse : match.userResponse;
  const theirResponse = isReversed ? match.userResponse : match.matchResponse;

  const handleInterested = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await respond({
        matchId: match._id,
        response: "interested",
        isReversed,
      });
      setHasResponded(true);
    } catch (error) {
      console.error("Error responding to match:", error);
      alert("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePass = async () => {
    setShowPassFeedback(true);
  };

  const handlePassComplete = async (reason?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await respond({
        matchId: match._id,
        response: "passed",
        isReversed,
      });
      setHasResponded(true);
      setShowPassFeedback(false);

      // Save pass reason if provided
      if (reason) {
        await submitPassFeedback({
          matchId: match._id,
          userId: currentUserId,
          matchUserId: isReversed ? match.userId : match.matchUserId,
          weekOf: match.weekOf,
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

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div className="flex justify-center">
        <img
          src={matchUser?.profileImage || "/avatar.png"}
          alt={matchUser?.name}
          className="w-96 h-96 object-cover rounded-lg shadow-lg"
        />
      </div>

      {/* Basic Info */}
      <div className="">
        <h2 className="text-3xl font-bold mb-2">
          {matchUser?.name}, {matchUser?.age}
        </h2>
        <p className="text-gray-600">{`${matchUser?.location}, Ireland`}</p>
      </div>

      {/* Compatibility Score */}
      {/* <div className="bg-orange-50 border-2 border-primary rounded-lg p-4 text-center">
        <div className="text-gray-700 text-sm mb-1">Compatibility Score</div>
        <div className="text-4xl font-bold text-primary">
          {match.compatibilityScore}%
        </div>
      </div> */}

      {/* Why You Matched */}
      <div className="border rounded-lg p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Why We Matched You</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {isExpanded && (
          <div className="text-gray-700 leading-relaxed whitespace-pre-line mt-3 animate-in fade-in slide-in-from-top-1">
            {match.explanation}
          </div>
        )}
      </div>

      {/* Full Profile */}
      <div className="space-y-4">
        {/* <div>
          <h3 className="text-lg font-semibold mb-2">About {matchUser?.name}</h3>
          <p className="text-gray-700 leading-relaxed">{matchUser?.bio}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Looking For</h3>
          <p className="text-gray-700 leading-relaxed">{matchUser?.lookingFor}</p>
        </div> */}

        {/* <div>
          <h3 className="text-lg font-semibold mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {matchUser?.interests.map((interest: string) => (
              <span
                key={interest}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div> */}
      </div>

      {/* Response Buttons or Status */}
      {myResponse === "pending" && !hasResponded && !showPassFeedback && (
        <>
          <div className="flex gap-4">
            <Button
              onClick={handleInterested}
              size="lg"
              className="flex-1"
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
          </div>
        </>
      )}

      {showPassFeedback && (
        <PassFeedbackForm
          onSubmit={handlePassComplete}
          onCancel={() => setShowPassFeedback(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {myResponse !== "pending" && (
        <div className="text-center">
          {myResponse === "interested" && theirResponse === "pending" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-semibold">
                ✓ You're interested! Waiting for their response...
              </p>
            </div>
          )}

          {myResponse === "passed" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700">You passed on this match.</p>
            </div>
          )}
        </div>
      )}

      {/* Mutual Match - Chat Button */}
      {match.mutualMatch && (
        <div className="bg-orange-50 border-2 border-primary rounded-lg p-6 space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary mb-2">
              🎉 It's a Match!
            </h3>
            <p className="text-gray-700 mb-4">
              You both are interested! Start chatting to plan your date.
            </p>
          </div>

          <Button
            onClick={() => router.push(`/chat/${match._id}`)}
            size="lg"
            className="w-full gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Open Chat
          </Button>

          <p className="text-sm text-gray-600 text-center">
            Chat is active until Friday at 11:59 PM
          </p>
        </div>
      )}
    </div>
  );
}
