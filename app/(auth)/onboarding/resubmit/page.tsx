"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DocumentStep from "../DocumentStep";
import PhotoStep from "../PhotoStep";

export default function ResubmitPage() {
  const router = useRouter();
  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );
  const updateUserPhotos = useMutation(api.users.updateUserPhotos);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    photo: null as File | null,
    verificationDoc: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if user is not rejected
    if (currentUser && currentUser.accountStatus !== "rejected") {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  if (currentUser === undefined) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    router.push("/onboarding");
    return null;
  }

  if (currentUser.accountStatus !== "rejected") {
    return null;
  }

  const updateData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.photo || !formData.verificationDoc) {
      console.error("Missing photo or verification document");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload photo to Convex storage
      const photoUploadUrl = await updateUserPhotos({
        type: "photo",
      });
      const photoUploadResult = await fetch(photoUploadUrl, {
        method: "POST",
        headers: { "Content-Type": formData.photo.type },
        body: formData.photo,
      });
      const { storageId: photoStorageId } = await photoUploadResult.json();

      // Upload verification document to Convex storage
      const docUploadUrl = await updateUserPhotos({
        type: "document",
      });
      const docUploadResult = await fetch(docUploadUrl, {
        method: "POST",
        headers: { "Content-Type": formData.verificationDoc.type },
        body: formData.verificationDoc,
      });
      const { storageId: docStorageId } = await docUploadResult.json();

      // Update user record with new photo and document
      await updateUserPhotos({
        type: "update",
        photoStorageId,
        verificationDocStorageId: docStorageId,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to resubmit:", error);
      setIsSubmitting(false);
      throw error;
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 2
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / 2) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Rejection Reason */}
        {currentUser.accountRejectionReason && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-1">
              Previous Feedback
            </h3>
            <p className="text-sm text-yellow-800">
              {currentUser.accountRejectionReason}
            </p>
          </div>
        )}

        {/* Steps */}
        <div>
          {currentStep === 1 && (
            <PhotoStep
              data={formData}
              updateData={updateData}
              onBack={() => router.push("/dashboard")}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <DocumentStep
              data={formData}
              updateData={updateData}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
