"use client";

import { use } from "react";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ChatInterface } from "@/components/match/ChatInterface";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

export default function ChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const router = useRouter();
  const { matchId: rawMatchId } = use(params);
  const matchId = rawMatchId as Id<"weeklyMatches">;

  // Get current user
  const currentUser = useQuery(api.users.getCurrentUser);

  // Get match by ID
  const matchData = useQuery(api.matches.getMatchById, { matchId });

  if (!currentUser || !matchData) {
    return <LoadingSpinner />;
  }

  const { match, user, matchUser } = matchData;

  // Determine who is the partner
  const isCurrentUserUser = user._id === currentUser._id;
  const partner = isCurrentUserUser ? matchUser : user;

  // Check if mutual match exists
  if (!match.mutualMatch) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Chat Not Available</h1>
          <p className="text-gray-600 mb-6">
            Chat is only available after both users express interest.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4">
      <ChatInterface
        matchId={match._id}
        matchUser={{
          _id: partner._id,
          name: partner.firstName,
          photoUrl: partner.photoUrl,
        }}
        currentUserId={currentUser._id}
        expiresAt={match.expiresAt}
      />
    </div>
  );
}
