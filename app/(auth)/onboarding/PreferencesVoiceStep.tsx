"use client";

import { Button } from "@/components/ui/button";
import { VoiceInterviewCard } from "@/components/voice/VoiceInterviewCard";
import { useState } from "react";
import StepWrapper from "./StepWrapper";

interface PreferencesVoiceStepProps {
  data: {
    lookingFor: string;
    preferencesTranscript: string;
    preferencesVoiceCompleted: boolean;
    interests: string[];
  };
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PreferencesVoiceStep({
  data,
  updateData,
  onNext,
  onBack,
}: PreferencesVoiceStepProps) {
  const [canProceed, setCanProceed] = useState(data.preferencesVoiceCompleted);

  const handleComplete = (
    transcript: string,
    result:
      | { success: true; bio: string; interests: string[] }
      | { success: true; preferences: string; interests: string[] }
  ) => {
    // Type assertion - we know this is preferences step
    const preferencesResult = result as {
      success: true;
      preferences: string;
      interests: string[];
    };

    // Merge interests from bio and preferences, removing duplicates
    const mergedInterests = Array.from(
      new Set([...(data.interests || []), ...preferencesResult.interests])
    );

    // Limit to 15 interests maximum (as per plan edge cases)
    const finalInterests = mergedInterests.slice(0, 15);

    updateData({
      lookingFor: preferencesResult.preferences,
      preferencesTranscript: transcript,
      preferencesVoiceCompleted: true,
      interests: finalInterests,
    });
    setCanProceed(true);
  };

  const handleNext = () => {
    if (canProceed) {
      onNext();
    }
  };

  return (
    <StepWrapper
      title="Your Ideal Match"
      description="Describe the qualities and values you're seeking"
    >
      <div className="space-y-6">
        <VoiceInterviewCard
          type="preferences"
          assistantId={process.env.NEXT_PUBLIC_VAPI_PREFERENCES_ASSISTANT_ID}
          onComplete={handleComplete}
          canProceed={canProceed}
        />

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline">
            ← Back
          </Button>
          <Button onClick={handleNext} size="lg" disabled={!canProceed}>
            Continue →
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}
