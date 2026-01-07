"use client";

import { Button } from "@/components/ui/button";
import { VoiceInterviewCard } from "@/components/voice/VoiceInterviewCard";
import { useState } from "react";
import StepWrapper from "./StepWrapper";

interface BioVoiceStepProps {
  data: {
    bio: string;
    bioTranscript: string;
    bioVoiceCompleted: boolean;
  };
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BioVoiceStep({
  data,
  updateData,
  onNext,
  onBack,
}: BioVoiceStepProps) {
  const [canProceed, setCanProceed] = useState(data.bioVoiceCompleted);

  const handleComplete = (transcript: string, processedText: string) => {
    updateData({
      bio: processedText,
      bioTranscript: transcript,
      bioVoiceCompleted: true,
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
      title="About You"
      description="Tell us about yourself, your passions, what makes you unique"
    >
      <div className="space-y-6">
        <VoiceInterviewCard
          type="bio"
          assistantId={process.env.NEXT_PUBLIC_VAPI_BIO_ASSISTANT_ID}
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
