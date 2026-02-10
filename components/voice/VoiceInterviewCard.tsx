"use client";

import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useVapiCall } from "@/hooks/useVapiCall";
import { useAction } from "convex/react";
import { useState } from "react";
import { VoiceControls } from "./VoiceControls";
import { VoiceStateIndicator } from "./VoiceStateIndicator";
import { VoiceWaveform } from "./VoiceWaveform";

interface VoiceInterviewCardProps {
  type: "bio" | "preferences";
  onComplete: (
    transcript: string,
    result:
      | { success: true; bio: string; interests: string[] }
      | { success: true; preferences: string; interests: string[] }
  ) => void;
  assistantId?: string;
  canProceed?: boolean;
}

export function VoiceInterviewCard({
  type,
  onComplete,
  assistantId,
  canProceed,
}: VoiceInterviewCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const processTranscript = useAction(api.voice.processTranscript);
  const [hasRetried, setHasRetried] = useState(false);

  const handleTranscriptComplete = async (transcript: string) => {
    console.log(
      "🔍 handleTranscriptComplete called with transcript:",
      transcript
    );

    if (!transcript || transcript.trim().length === 0) {
      console.warn("⚠️ Empty transcript, skipping processing");
      setValidationError("No response was recorded. Please try again.");
      setState("validation_failed");
      return;
    }

    try {
      setIsProcessing(true);
      setValidationError(null);
      console.log("🔄 Processing transcript...");
      const result = await processTranscript({ transcript, type });
      console.log("✅ Transcript processed:", result);

      if (!result.success) {
        // Validation failed - show error and allow retry
        console.log("⚠️ Validation failed:", result.reason);
        setValidationError(result.reason);
        setState("validation_failed");
        return;
      }

      // Success - pass to parent
      setHasRetried(false);
      onComplete(transcript, result);
      console.log("✅ onComplete called - Continue button should enable");
    } catch (error: any) {
      console.error("❌ Failed to process transcript:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      // Error will be shown by the hook
    } finally {
      setIsProcessing(false);
    }
  };

  const { state, error, startCall, retry, setState } = useVapiCall({
    assistantId: assistantId || "",
    onTranscriptComplete: handleTranscriptComplete,
  });

  const handleRetry = () => {
    setHasRetried(true);
    setValidationError(null);
    retry();
  };

  const currentState = validationError ? "validation_failed" : isProcessing ? "processing" : state;
  const isWaveformActive =
    currentState === "connecting" ||
    currentState === "recording" ||
    currentState === "processing";

  // Override canProceed if user has explicitly clicked retry
  const effectiveCanProceed = hasRetried ? false : canProceed;

  if (!assistantId) {
    return (
      <Card className="p-8">
        <div className="space-y-6 h-[268px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Voice assistant not configured. Please check environment variables.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="space-y-6 h-[268px]">
        <VoiceWaveform isActive={isWaveformActive} />

        <VoiceStateIndicator
          state={currentState}
          error={error || undefined}
          validationError={validationError || undefined}
          canProceed={effectiveCanProceed}
        />

        <VoiceControls
          state={currentState}
          onStart={startCall}
          onRetry={handleRetry}
          disabled={isProcessing}
          canProceed={effectiveCanProceed}
        />
      </div>
    </Card>
  );
}
