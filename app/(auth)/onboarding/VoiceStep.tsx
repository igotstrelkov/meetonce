"use client";

import { Button } from "@/components/ui/button";
import { VoiceInterviewCard } from "@/components/voice/VoiceInterviewCard";
import { useState } from "react";
import StepWrapper from "./StepWrapper";

interface VoiceStepProps {
  data: {
    bio: string;
    lookingFor: string;
    bioTranscript: string;
    voiceCompleted: boolean;
    interests: string[];
  };
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function VoiceStep({
  data,
  updateData,
  onNext,
  onBack,
}: VoiceStepProps) {
  const [canProceed, setCanProceed] = useState(data.voiceCompleted);

  const handleComplete = (
    transcript: string,
    result:
      | { success: true; bio: string; interests: string[] }
      | { success: true; preferences: string; interests: string[] }
      | { success: true; bio: string; preferences: string; interests: string[] }
  ) => {
    const combined = result as {
      success: true;
      bio: string;
      preferences: string;
      interests: string[];
    };

    updateData({
      bio: combined.bio,
      lookingFor: combined.preferences,
      bioTranscript: transcript,
      voiceCompleted: true,
      interests: (combined.interests || []).slice(0, 15),
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
      title="Voice Interview"
      description="Tell us about yourself and what you're looking for"
    >
      <div className="space-y-6">
        <VoiceInterviewCard
          type="combined"
          assistantId={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID}
          onComplete={handleComplete}
          canProceed={canProceed}
        />

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" size="lg" className="flex-1">
            ← Back
          </Button>
          <Button onClick={handleNext} size="lg" className="flex-2" disabled={!canProceed}>
            Continue →
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}
