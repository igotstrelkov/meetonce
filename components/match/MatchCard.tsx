"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { MapPin, MessageCircle, Sparkles } from "lucide-react";
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
  const [imageLoaded, setImageLoaded] = useState(false);

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
      {/* Profile Photo with Loading State */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-2xl aspect-square">
              <LoadingSpinner size="lg" centered={false} />
            </div>
          )}
          <img
            src={matchUser?.photoUrl || "/avatar.png"}
            alt={matchUser?.name}
            className={`w-full aspect-square object-cover rounded-2xl shadow-lg transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold mb-1">
                {matchUser?.name}, {matchUser?.age}
              </CardTitle>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{matchUser?.location}</span>
              </div>
            </div>
            {/* <Heart className="w-6 h-6 text-primary" /> */}
          </div>
        </CardHeader>
      </Card>

      {/* Compatibility Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <div className="text-sm font-medium text-muted-foreground">
                Compatibility Score
              </div>
            </div>
            <div className="text-5xl font-bold text-primary">
              {match.compatibilityScore}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why We Matched You */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Why We Matched You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {match.explanation}
          </p>
        </CardContent>
      </Card>

      {/* About Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-xl">About {matchUser?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {matchUser?.bio}
          </p>
        </CardContent>
      </Card> */}

      {/* Looking For Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-xl">Looking For</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {matchUser?.lookingFor}
          </p>
        </CardContent>
      </Card> */}

      {/* Interests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {matchUser?.interests.map((interest: string) => (
              <Badge key={interest} variant="outline">
                {interest}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Buttons or Status */}
      {myResponse === "pending" && !hasResponded && !showPassFeedback && (
        <div className="flex flex-col sm:flex-row gap-4">
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
      )}

      {showPassFeedback && (
        <PassFeedbackForm
          onSubmit={handlePassComplete}
          onCancel={() => setShowPassFeedback(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {myResponse !== "pending" && (
        <div>
          {myResponse === "interested" && theirResponse === "pending" && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  {/* <Heart className="w-5 h-5" /> */}
                  <p className="font-semibold">
                    You're interested! Waiting for their response...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {myResponse === "passed" && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  You passed on this match.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Mutual Match - Chat Button */}
      {match.mutualMatch && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <h3 className="text-2xl font-bold text-primary">It's a Match!</h3>
              <p className="text-muted-foreground">
                You both are interested! Start chatting to plan your date.
              </p>
            </div>

            <Separator />

            <Button
              onClick={() => router.push(`/chat/${match._id}`)}
              size="lg"
              className="w-full gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Open Chat
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Chat is active until Friday at 11:59 PM
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
