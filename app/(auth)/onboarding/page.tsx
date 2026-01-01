"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BioStep from "./BioStep";
import DocumentStep from "./DocumentStep";
import InterestsStep from "./InterestsStep";
import PhotoStep from "./PhotoStep";
import ProfileStep from "./ProfileStep";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const createUser = useAction(api.users.createUserProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: 0,
    gender: "",
    location: "Dublin",
    interestedIn: "",
    minAge: 18,
    maxAge: 50,
    bio: "",
    lookingFor: "",
    interests: [] as string[],
    photo: null as File | null,
    verificationDoc: null as File | null,
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      // Upload photo to Convex storage
      let photoStorageId = "";
      if (formData.photo) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": formData.photo.type },
          body: formData.photo,
        });
        const { storageId } = await result.json();
        photoStorageId = storageId;
      }

      // Upload verification document to Convex storage
      let verificationDocStorageId = "";
      if (formData.verificationDoc) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": formData.verificationDoc.type },
          body: formData.verificationDoc,
        });
        const { storageId } = await result.json();
        verificationDocStorageId = storageId;
      }

      // Create user profile
      await createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        location: formData.location,
        bio: formData.bio,
        lookingFor: formData.lookingFor,
        interests: formData.interests,
        interestedIn: formData.interestedIn,
        minAge: formData.minAge,
        maxAge: formData.maxAge,
        photoStorageId,
        verificationDocStorageId,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Create Your Profile</h1>
          <div className="text-sm text-gray-600">
            Step {currentStep} of 5
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      <div >
        {currentStep === 1 && (
          <ProfileStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
          />
        )}

        {currentStep === 2 && (
          <BioStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 3 && (
          <InterestsStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 4 && (
          <PhotoStep
            data={formData}
            updateData={updateFormData}
            onBack={prevStep}
            onNext={nextStep}
          />
        )}

        {currentStep === 5 && (
          <DocumentStep
            data={formData}
            updateData={updateFormData}
            onBack={prevStep}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
