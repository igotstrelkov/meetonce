"use client";

import PostDateFeedbackForm from "@/components/feedback/PostDateFeedbackForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { matchId: rawMatchId } = use(params);
  const matchId = rawMatchId as Id<"weeklyMatches">;

  // Load match data
  const matchData = useQuery(api.matches.getMatchById, { matchId });

  // Load current user from Convex
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // if (!currentUser) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <p className="text-gray-600">Please sign in to provide feedback.</p>
  //     </div>
  //   );
  // }

  if (matchData === undefined || currentUser === undefined) {
    return <LoadingSpinner />;
  }

  if (!matchData || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Match Not Found</h1>
          <p className="text-gray-600 mb-4">
            We couldn't find the match you're looking for.
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            ← Back to Dashboard
          </Button>
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
    <div className="min-h-screen ">
      <div className="max-w-3xl mx-auto px-4">
        {/* <div className="mb-6">
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
        </div> */}
        <div className="pb-4">
          <div className="flex items-center gap-3">
            <ChevronLeft size={35} onClick={() => router.push("/dashboard")} />
            <div>
              <h3 className="font-semibold text-gray-900">
                Post-Date Feedback
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>Tell us about your date with {matchPartner.name}</span>
              </div>
            </div>
          </div>
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
