"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);

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

  // Loading state while checking user
  if (currentUser === undefined || currentUser === null) {
    return (
      <LoadingSpinner />
    );
  }

  // User is being redirected to onboarding
  // if (currentUser === null) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       Redirecting to onboarding...
  //     </div>
  //   );
  // }

  // User has completed onboarding
  return (
    <div className="flex flex-col h-screen items-center gap-4 px-4 px-4">
      <h1 className="text-3xl font-bold">Welcome back, {currentUser.name.split(" ")[0]}!</h1>
      <p className="text-gray-600">Your profile is {currentUser.photoStatus}</p>
      {currentUser.photoStatus === "pending" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md ">
          <p><strong>Your profile is being reviewed!</strong></p><p> We'll send you an email within 24 hours
            once your profile is approved. Then you'll start receiving your weekly matches.</p>
        </div>
      )}
      {currentUser.photoStatus === "approved" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
          <p><strong>Your profile is live!</strong></p>
          <p className="text-sm text-gray-700">
             You'll receive your first match on Monday morning at 9am.
          </p>
        </div>
      )}
      {currentUser.photoStatus === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p><strong>Photo needs updating.</strong></p><p> Please upload a new photo that meets our guidelines.</p>
        </div>
      )}
    </div>
  );
}
