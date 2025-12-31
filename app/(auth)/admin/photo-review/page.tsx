"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { REJECTION_CATEGORIES } from "@/lib/constants";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

type ReviewStep = "decision" | "rating";

export default function PhotoReviewPage() {
  const pendingPhotos = useQuery(api.admin.getPendingPhotos);
  const approvePhoto = useMutation(api.admin.approvePhoto);
  const rejectPhoto = useMutation(api.admin.rejectPhoto);

  const [step, setStep] = useState<ReviewStep>("decision");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Keyboard shortcuts for decision step
  useEffect(() => {
    if (step !== "decision" || showRejectModal) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // A for approve
      if (e.key === "a" || e.key === "A") {
        handleApproveDecision();
      }

      // R for reject
      if (e.key === "r" || e.key === "R") {
        setShowRejectModal(true);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [step, showRejectModal]);

  // Keyboard shortcuts for rating step
  useEffect(() => {
    if (step !== "rating") return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Number keys 1-9, 0 for 10
      if (e.key >= "1" && e.key <= "9") {
        const rating = parseInt(e.key);
        setSelectedRating(rating);
        handleFinalApprove(rating);
      } else if (e.key === "0") {
        setSelectedRating(10);
        handleFinalApprove(10);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [step]);

  const handleApproveDecision = () => {
    setStep("rating");
  };

  const handleFinalApprove = async (rating: number) => {
    if (!currentPhoto) return;

    await approvePhoto({
      userId: currentPhoto._id,
      rating: rating,
    });

    // Reset for next photo
    setStep("decision");
    setSelectedRating(null);
  };

  const handleReject = async () => {
    if (!currentPhoto) return;

    await rejectPhoto({
      userId: currentPhoto._id,
      rejectionReason: rejectionReason || "Please resubmit a clearer photo",
    });

    // Reset for next photo
    setRejectionReason("");
    setShowRejectModal(false);
    setStep("decision");
  };

  // 1. Loading State
    if (pendingPhotos === undefined) {
    return <LoadingSpinner />;
  }

  // 2. Render State
  const currentPhoto = pendingPhotos[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Photo Review</h2>
          <p className="text-gray-600">
            {pendingPhotos?.length || 0} photos remaining
          </p>
        </div>
      </div>

      {pendingPhotos.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">No Pending Photos</h2>
            <p className="text-gray-600">All photos have been reviewed</p>
          </div>
        </div>
      ): (
      <>
      <div>
        <div className="flex justify-center mb-6">
          {currentPhoto.photoUrl ? (
            <img
              src={currentPhoto.photoUrl}
              alt="User photo"
              className="w-96 h-96 object-cover rounded-lg"
            />
          ) : (
            <div className="w-96 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No photo uploaded</p>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold">{currentPhoto.name}, {currentPhoto.age}</h3>
          <p className="text-gray-600">{currentPhoto.location}</p>
          <p className="text-sm text-gray-500 mt-2">
            Resubmissions: {currentPhoto.photoResubmissionCount}
          </p>
        </div>
        {/* Step 1: Decision (Approve or Reject) */}
      {step === "decision" && (
        <div className="p-4">
          {/* <h3 className="text-xl font-bold mb-4">
            Step 1: Approve or Reject?
          </h3> */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleApproveDecision}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
            >
              ✓ Approve (A)
            </Button>
            <Button
              onClick={() => setShowRejectModal(true)}
              size="lg"
              variant="destructive"
              className="text-lg px-8 py-6"
            >
              ✗ Reject (R)
            </Button>
          </div>
          <p className="text-sm text-gray-600 text-center mt-4">
            Keyboard: Press A to approve, R to reject
          </p>
        </div>
      )}

      {/* Step 2: Rating (Only if Approved) */}
      {step === "rating" && (
        <div>
          <h3 className="text-xl font-bold mb-4">
            Step 2: Rate Attractiveness (1-10)
          </h3>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => handleFinalApprove(num)}
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
          <p className="text-sm text-gray-600 text-center mt-4">
            Keyboard: Press 1-9 or 0 (for 10)
          </p>
        </div>
      )}
      </div>
</>)}

      
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
