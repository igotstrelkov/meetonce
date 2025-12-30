"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PassFeedbackForm from "./PassFeedbackForm";

export default function MatchCard({ match, matchUser, isReversed }: any) {
  const respond = useMutation(api.matches.respondToMatch);
  const [showPassFeedback, setShowPassFeedback] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // TODO: Save pass reason if provided
      if (reason) {
        console.log("Pass reason:", reason);
      }
    } catch (error) {
      console.error("Error responding to match:", error);
      alert("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-8 space-y-6">
      {/* Profile Photo */}
      <div className="flex justify-center">
        <img
          src={matchUser?.photoUrl || "/default-avatar.png"}
          alt={matchUser?.name}
          className="w-64 h-64 object-cover rounded-lg shadow-lg"
        />
      </div>

      {/* Basic Info */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          {matchUser?.name}, {matchUser?.age}
        </h2>
        <p className="text-gray-600">{matchUser?.location}</p>
      </div>

      {/* Compatibility Score */}
      <div className="bg-pink-50 rounded-lg p-4 text-center">
        <div className="text-sm text-gray-600 mb-1">Compatibility Score</div>
        <div className="text-4xl font-bold text-pink-600">
          {match.compatibilityScore}%
        </div>
      </div>

      {/* Why You Matched */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Why We Matched You</h3>
        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
          {match.explanation}
        </div>
      </div>

      {/* Full Profile */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">About {matchUser?.name}</h3>
          <p className="text-gray-700 leading-relaxed">{matchUser?.bio}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Looking For</h3>
          <p className="text-gray-700 leading-relaxed">{matchUser?.lookingFor}</p>
        </div>

        <div>
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
        </div>
      </div>

      {/* Response Buttons or Status */}
      {myResponse === "pending" && !hasResponded && !showPassFeedback && (
        <div className="flex gap-4">
          <Button
            onClick={handleInterested}
            size="lg"
            className="flex-1 bg-pink-600 hover:bg-pink-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "❤️ I'm Interested!"}
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

      {/* Mutual Match! */}
      {match.mutualMatch && (
        <div className="bg-pink-50 border-2 border-pink-500 rounded-lg p-6 space-y-4">
          <h3 className="text-2xl font-bold text-center text-pink-600">
            🎉 It's a Match!
          </h3>

          <div>
            <h4 className="font-semibold mb-2">Conversation Starters:</h4>
            <ul className="space-y-2">
              {match.conversationStarters.map((starter: string, i: number) => (
                <li key={i} className="text-gray-700">
                  {i + 1}. {starter}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Suggested Meeting Spot:</h4>
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold">{match.suggestedVenue.name}</p>
              <p className="text-sm text-gray-600">{match.suggestedVenue.address}</p>
              <p className="text-sm text-gray-600 mt-1">{match.suggestedVenue.description}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              You'll receive an email with {matchUser?.name}'s contact information to schedule your date!
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
