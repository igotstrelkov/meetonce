"use client";

import { api } from "@/convex/_generated/api";
import { COUNTRIES, GENDERS } from "@/lib/constants";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BioStep from "./BioStep";
import InterestsStep from "./InterestsStep";
import PhotoStep from "./PhotoStep";
import ProfileStep from "./ProfileStep";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const createUser = useAction(api.users.createUser);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: 0,
    gender: GENDERS[0].label as string,
    location: COUNTRIES[0].label as string,
    bio: "",
    lookingFor: "",
    interests: [] as string[],
    photo: null as File | null,
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
        // Get upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload the file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": formData.photo.type },
          body: formData.photo,
        });

        const { storageId } = await result.json();
        photoStorageId = storageId;
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
        photoStorageId,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Create Your Profile</h1>
          <div className="text-sm text-gray-600">
            Step {currentStep} of 4
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(currentStep / 4) * 100}%` }}
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
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
