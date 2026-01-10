"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import MatchCard from "@/components/match/MatchCard";
import PassFeedbackForm from "@/components/match/PassFeedbackForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { MessageCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const matchData = useQuery(
    api.matches.getCurrentMatch,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  // Query unread count
  const unreadCount =
    useQuery(
      api.chat.getUnreadCount,
      matchData && matchData.match.mutualMatch
        ? { matchId: matchData.match._id }
        : "skip"
    ) || 0;

  const respond = useMutation(api.matches.respondToMatch);
  const submitPassFeedback = useMutation(api.feedback.submitPassFeedback);

  const [showPassFeedback, setShowPassFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If still loading, wait
    if (currentUser === undefined) return;

    // If user doesn't exist in Convex, redirect to onboarding
    if (currentUser === null) {
      router.push("/onboarding");
      return;
    }

    // User exists and is authenticated - stay on dashboard
  }, [currentUser, router]);

  if (currentUser === undefined || matchData === undefined) {
    return <LoadingSpinner />;
  }

  if (currentUser === null) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            User Profile Not Found
          </h2>
          <p className="text-gray-600">
            We couldn't locate your profile data. You may need to complete the
            onboarding process.
          </p>
          <Button onClick={() => router.push("/onboarding")}>
            Complete Onboarding
          </Button>
        </div>
      </div>
    );
  }

  if (currentUser.accountStatus === "rejected") {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Needs Update</h2>
          <p className="text-gray-700 mb-4">
            {currentUser.accountRejectionReason ||
              "Your profile didn't meet our quality standards."}
          </p>
          <Button onClick={() => router.push("/onboarding/resubmit")}>
            Resubmit Profile
          </Button>
        </div>
      </div>
    );
  }

  if (currentUser.accountStatus === "pending") {
    return (
      <div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Under Review</h2>
          <p className="text-gray-700">
            Your profile is being reviewed by our team. You'll receive an email
            within 24 hours when your profile is approved or if we need a
            different photo.
          </p>
        </div>
      </div>
    );
  }

  if (matchData === null) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">No Match This Week</h2>
        <p className="text-gray-700">
          We're still looking for your perfect match. New matches are released
          every Monday morning!
        </p>
      </div>
    );
  }

  const { match, isReversed } = matchData;
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

      setShowPassFeedback(false);

      // Save pass reason if provided
      if (reason) {
        await submitPassFeedback({
          matchId: match._id,
          userId: currentUser._id,
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
      <Drawer>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl">😉</div>
              <h3 className="text-2xl font-bold">Your Weekly Match</h3>
              <p className="text-muted-foreground">
                Expires Friday at 11:59 PM
              </p>
            </div>

            <Separator />
            <DrawerTrigger asChild>
              <Button size="lg" className="w-full gap-2">
                <User className="w-5 h-5" />
                Match Details
              </Button>
            </DrawerTrigger>
          </CardContent>
        </Card>

        <DrawerContent
          className="h-[90vh]"
          aria-description={undefined}
          aria-describedby={undefined}
        >
          <DrawerHeader className="hidden">
            <DrawerTitle>Match Details</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="max-w-md mx-auto space-y-6">
              <MatchCard
                match={matchData.match}
                matchUser={matchData.matchUser}
                isReversed={matchData.isReversed}
                currentUserId={currentUser._id}
              />
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Response Buttons or Status */}
      <Card>
        <CardFooter>
          <Button
            onClick={handleInterested}
            size="lg"
            className="flex-1 mr-4"
            disabled={isSubmitting || myResponse !== "pending"}
          >
            {isSubmitting ? "Submitting..." : "I'm Interested!"}
          </Button>
          <Button
            onClick={handlePass}
            size="lg"
            variant="outline"
            className="flex-1"
            disabled={isSubmitting || myResponse !== "pending"}
          >
            Pass
          </Button>
        </CardFooter>
      </Card>

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
              <CardContent className="pt-6 space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-4xl">🤞</div>
                  <h3 className="text-2xl font-bold">Response Sent!</h3>
                  <p className="text-muted-foreground">
                    You're interested! Waiting for their response...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {myResponse === "passed" && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-4xl">👋</div>
                  <h3 className="text-2xl font-bold">Passed</h3>
                  <p className="text-muted-foreground">
                    You passed on this match. Check back next Monday!
                  </p>
                </div>
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
              <h3 className="text-2xl font-bold">It's Mutual!</h3>
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
              {unreadCount > 0 && <span>({unreadCount} new)</span>}
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
