"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation } from "convex/react";
import { Clock, Mic, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PhotoStep from "./PhotoStep";
import PreferencesStep from "./PreferencesStep";
import ProfileStep from "./ProfileStep";
import VoiceStep from "./VoiceStep";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const createUser = useAction(api.users.createUserProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const STORAGE_KEY = "meetonce_onboarding_progress";

  const totalSteps = 4;
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const step = parsed.step ?? 0;
        return Math.min(Math.max(step, 0), totalSteps);
      }
    } catch {}
    return 0;
  });
  type FormData = {
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    location: string;
    jobTitle: string;
    interestedIn: string;
    minAge: number;
    maxAge: number;
    bio: string;
    lookingFor: string;
    bioTranscript: string;
    voiceCompleted: boolean;
    interests: string[];
    photo: File | null;
  };

  const [formData, setFormData] = useState<FormData>(() => {
    const defaults: FormData = {
      firstName: "",
      lastName: "",
      age: 0,
      gender: "",
      location: "",
      jobTitle: "",
      interestedIn: "",
      minAge: 21,
      maxAge: 35,
      bio: "",
      lookingFor: "",
      bioTranscript: "",
      voiceCompleted: false,
      interests: [] as string[],
      photo: null as File | null,
    };
    if (typeof window === "undefined") return defaults;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed.formData };
      }
    } catch {}
    return defaults;
  });

  // Persist progress to localStorage on every change
  useEffect(() => {
    const { photo, ...serializable } = formData;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step: currentStep, formData: serializable }),
    );
  }, [formData, currentStep]);

  const updateFormData = useCallback((data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => setCurrentStep((prev) => prev + 1), []);
  const prevStep = useCallback(() => setCurrentStep((prev) => prev - 1), []);

  const handleSubmit = useCallback(async () => {
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

      // Create user profile
      await createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age,
        gender: formData.gender,
        location: formData.location,
        jobTitle: formData.jobTitle,
        bio: formData.bio,
        lookingFor: formData.lookingFor,
        interests: formData.interests,
        interestedIn: formData.interestedIn,
        minAge: formData.minAge,
        maxAge: formData.maxAge,
        photoStorageId,
      });

      localStorage.removeItem(STORAGE_KEY);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  }, [user, formData, generateUploadUrl, createUser, router, STORAGE_KEY]);

  // Step 0 = welcome/voice heads-up (not counted in progress)
  // Steps 1–4 = actual onboarding steps (Profile, Preferences, Voice Interview, Photo)
  if (currentStep === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mic className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Before we start</h1>
          <p className="text-muted-foreground max-w-sm">
            This onboarding includes a short voice interview so we can get
            to know the real you.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-3 text-left">
          <div className="flex items-start gap-3 text-sm">
            <Volume2 className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">
              We&apos;ll ask about <span className="text-foreground font-medium">you</span> and{" "}
              <span className="text-foreground font-medium">what you&apos;re looking for</span>
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">
              About <span className="text-foreground font-medium">3-5 minutes</span> — find a quiet spot
            </span>
          </div>
        </div>

        <Button onClick={nextStep} className="w-full max-w-xs h-12 text-base">
          I&apos;m ready, let&apos;s go
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 px-4">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h1 className="text-3xl font-bold">Create Your Profile</h1>
          <div className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div>
        {currentStep === 1 && (
          <ProfileStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
          />
        )}

        {currentStep === 2 && (
          <PreferencesStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 3 && (
          <VoiceStep
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
