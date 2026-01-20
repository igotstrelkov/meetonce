"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (currentUser === undefined || currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (currentUser.accountStatus === "rejected") {
    return (
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
    );
  }

  if (currentUser.accountStatus === "pending") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Profile Under Review</h2>
        <p className="text-gray-700">
          Your profile is being reviewed by our team. You'll receive an email
          within 24 hours when your profile is approved or if we need a
          different photo.
        </p>
      </div>
    );
  }

  if (currentUser.accountStatus === "waitlisted") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">You're on the Waitlist</h2>
        <p className="text-gray-700 mb-2">
          Great news! Your profile has been reviewed and approved.
        </p>
        <p className="text-gray-700">
          You're currently on our waitlist as we carefully manage our community.
          We'll notify you via email as soon as your account is fully activated
          and you can start receiving matches.
        </p>
      </div>
    );
  }

  return <div className="max-w-xl mx-auto space-y-8 px-4">{children}</div>;
}
