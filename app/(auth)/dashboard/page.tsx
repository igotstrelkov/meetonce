"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import MatchCard from "@/components/match/MatchCard";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const matchData = useQuery(
    api.matches.getCurrentMatch,
    currentUser?.photoStatus === "approved" ? { userId: currentUser._id } : "skip"
  );

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

  if (currentUser === undefined || currentUser === null) {
    return <LoadingSpinner />;
  }

  if (currentUser.photoStatus === "rejected") {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Photo Needs Update</h2>
          <p className="text-gray-700 mb-4">
            {currentUser.photoRejectionReason || "Your photo didn't meet our quality standards."}
          </p>
          <a
            href="/profile/edit-photo"
            className="text-pink-600 hover:text-pink-700 font-semibold"
          >
            Upload New Photo →
          </a>
        </div>
      </div>
    );
  }

  if (currentUser.photoStatus === "pending") {
    return (
      <div >
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Under Review</h2>
          <p className="text-gray-700">
            Your profile is being reviewed by our team. You'll receive an email within 24 hours
            when your profile is approved or if we need a different photo.
          </p>
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">No Match This Week</h2>
          <p className="text-gray-700">
            We couldn't find a compatible match for you this week.
            We'll keep looking for next Monday!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Your Weekly Match</h1>
        <p className="text-gray-600">
          Respond by Friday 11:59pm
        </p>
      </div>

      <MatchCard
        match={matchData.match}
        matchUser={matchData.matchUser}
        isReversed={matchData.isReversed}
      />
    </div>
  );
}
