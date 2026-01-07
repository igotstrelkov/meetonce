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
