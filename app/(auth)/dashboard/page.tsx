"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PastMatches } from "./PastMatches";
import { ThisWeek } from "./ThisWeek";

export default function DashboardPage() {
  const router = useRouter();

  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    // If still loading, wait
    if (currentUser === undefined) return;

    // If user doesn't exist in Convex, redirect to onboarding
    if (currentUser === null) {
      router.push("/onboarding");
      return;
    }
  }, [currentUser, router]);

  if (currentUser === undefined) {
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

  return (
    <Tabs defaultValue="this-week" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="this-week">This Week</TabsTrigger>
        <TabsTrigger value="past-matches">Past Dates</TabsTrigger>
      </TabsList>

      <TabsContent value="this-week">
        <ThisWeek />
      </TabsContent>

      <TabsContent value="past-matches">
        <PastMatches />
      </TabsContent>
    </Tabs>
  );
}
