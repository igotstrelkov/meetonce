"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import PostDateFeedbackForm from "@/components/feedback/PostDateFeedbackForm";
import { useRouter } from "next/navigation";

export default function FeedbackPage({
  params,
}: {
  params: { matchId: string };
}) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const matchId = params.matchId as Id<"weeklyMatches">;

  // Load match data
  const matchData = useQuery(api.matches.getMatchById, { matchId });

  // Load current user from Convex
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  if (!clerkUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please sign in to provide feedback.</p>
      </div>
    );
  }

  if (matchData === undefined || currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!matchData || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Match Not Found</h1>
          <p className="text-gray-600 mb-4">
            We couldn't find the match you're looking for.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-pink-600 hover:text-pink-700 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Determine which user is the match partner
  const isUserFirst = matchData.match.userId === currentUser._id;
  const matchPartner = isUserFirst ? matchData.matchUser : matchData.user;
  const matchUserId = matchPartner._id;

  const handleComplete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-900 font-medium mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">Post-Date Feedback</h1>
          <p className="text-gray-600">
            Tell us about your date with {matchPartner.name}
          </p>
        </div>

        <PostDateFeedbackForm
          matchId={matchId}
          userId={currentUser._id}
          matchUserId={matchUserId}
          weekOf={matchData.match.weekOf}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
