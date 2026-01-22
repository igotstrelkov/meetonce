"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { REJECTION_CATEGORIES } from "@/lib/constants";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useState } from "react";

type ReviewStep = "decision" | "rating";

export default function UserReviewPage() {
  const pendingUsers = useQuery(api.admin.getPendingUsers);
  const waitlistUser = useMutation(api.admin.waitlistUser);
  const rejectUser = useMutation(api.admin.rejectUser);

  const [step, setStep] = useState<ReviewStep>("decision");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleWaitlistDecision = () => {
    setStep("rating");
  };

  const handleWaitlist = async (rating: number) => {
    if (!currentUser) return;

    await waitlistUser({
      userId: currentUser._id,
      rating: rating,
    });

    // Reset for next photo
    setStep("decision");
    setSelectedRating(null);
  };

  const handleReject = async () => {
    if (!currentUser) return;

    await rejectUser({
      userId: currentUser._id,
      rejectionReason: rejectionReason || "Please resubmit a clearer photo",
    });

    // Reset for next photo
    setRejectionReason("");
    setShowRejectModal(false);
    setStep("decision");
  };

  // 1. Loading State
  if (pendingUsers === undefined) {
    return <LoadingSpinner />;
  }

  // 2. Render State
  const currentUser = pendingUsers[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">User Review</h2>
          <p className="text-gray-600">
            {pendingUsers?.length || 0} users remaining
          </p>
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">No Pending Users</h2>
            <p className="text-gray-600">All users have been reviewed</p>
          </div>
        </div>
      ) : (
        <>
          <div>
            {/* Display both selfie and verification document */}
            <div className="flex gap-6 justify-center mb-6">
              {/* Selfie */}
              <div className="flex-1 max-w-md">
                <h3 className="text-sm font-semibold mb-2 text-center">
                  Profile Photo
                </h3>
                {currentUser.photoUrl ? (
                  <Image
                    src={currentUser.photoUrl}
                    alt="User photo"
                    className="w-full h-96 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">No photo uploaded</p>
                  </div>
                )}
              </div>

              {/* Verification Document */}
              <div className="flex-1 max-w-md">
                <h3 className="text-sm font-semibold mb-2 text-center">
                  Verification Document
                </h3>
                {currentUser.verificationDocUrl ? (
                  <Image
                    src={currentUser.verificationDocUrl}
                    alt="Verification document"
                    className="w-full h-96 object-contain rounded-lg bg-gray-50"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">No document uploaded</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold">
                {currentUser.firstName} {currentUser.lastName},{" "}
                {currentUser.age}, {currentUser.gender}, Co{" "}
                {currentUser.location}, {currentUser.jobTitle}
              </h3>
              <p className="text-gray-600">{currentUser.location}</p>
              <p className="text-sm text-gray-500 mt-2">
                Resubmissions: {currentUser.accountResubmissionCount}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About Them</h3>
              <p className="text-gray-700 leading-relaxed">
                {currentUser?.bio}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Looking For</h3>
              <p className="text-gray-700 leading-relaxed">
                {currentUser?.lookingFor}
              </p>
            </div>

            {/* Step 1: Decision (Waitlist or Reject) */}
            {step === "decision" && (
              <div className="p-4">
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleWaitlistDecision}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
                  >
                    ✓ Add to waitlist
                  </Button>
                  <Button
                    onClick={() => setShowRejectModal(true)}
                    size="lg"
                    variant="destructive"
                    className="text-lg px-8 py-6"
                  >
                    ✗ Reject
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Rating (Only if Waitlisted) */}
            {step === "rating" && (
              <div>
                <h3 className="text-xl font-bold mb-4">
                  Step 2: Rate Attractiveness (1-10)
                </h3>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleWaitlist(num)}
                      className={`w-14 h-14 rounded-lg text-lg font-bold transition-all ${
                        selectedRating === num
                          ? "bg-primary text-white scale-110"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Rejection Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a reason and optionally provide guidance:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {REJECTION_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setRejectionReason(category.label)}
                  className={`p-3 rounded-lg text-sm font-medium text-left transition-all ${
                    rejectionReason === category.label
                      ? "bg-red-100 border-2 border-red-500"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Add optional guidance for the user..."
              className="min-h-[100px]"
            />

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
