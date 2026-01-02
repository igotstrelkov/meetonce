"use client";

import { Button } from "@/components/ui/button";
import { VoiceInterviewCard } from "@/components/voice/VoiceInterviewCard";
import StepWrapper from "./StepWrapper";
import { useState } from "react";

interface PreferencesVoiceStepProps {
  data: {
    lookingFor: string;
    preferencesTranscript: string;
    preferencesVoiceCompleted: boolean;
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

  const handleComplete = (transcript: string, processedText: string) => {
    updateData({
      lookingFor: processedText,
      preferencesTranscript: transcript,
      preferencesVoiceCompleted: true,
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
      title="What you're looking for"
      description="Share what matters most to you in a partner"
    >
      <div className="space-y-6">
        <VoiceInterviewCard
          title="Your Ideal Match"
          description="Describe the qualities and values you're seeking"
          type="preferences"
          onComplete={handleComplete}
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
