"use client";

import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useVapiCall } from "@/hooks/useVapiCall";
import { useAction } from "convex/react";
import { useState } from "react";
import { LoadingSpinner } from "../LoadingSpinner";
import { VoiceControls } from "./VoiceControls";
import { VoiceStateIndicator } from "./VoiceStateIndicator";
import { VoiceWaveform } from "./VoiceWaveform";

interface VoiceInterviewCardProps {
  // title: string;
  // description: string;
  type: "bio" | "preferences";
  onComplete: (transcript: string, processedText: string) => void;
  assistantId?: string;
  canProceed?: boolean;
}

export function VoiceInterviewCard({
  // title,
  // description,
  type,
  onComplete,
  assistantId: providedAssistantId,
  canProceed,
}: VoiceInterviewCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRetried, setHasRetried] = useState(false);

  // Get assistant ID from environment variables or prop
  const assistantId =
    providedAssistantId ||
    (type === "bio"
      ? process.env.NEXT_PUBLIC_VAPI_BIO_ASSISTANT_ID
      : process.env.NEXT_PUBLIC_VAPI_PREFERENCES_ASSISTANT_ID);

  const processTranscript = useAction(api.voice.processTranscript);

  const handleTranscriptComplete = async (transcript: string) => {
    if (!transcript || transcript.trim().length === 0) {
      return;
    }

    try {
      setIsProcessing(true);
      const processedText = await processTranscript({ transcript, type });
      setHasRetried(false); // Reset retry flag on successful completion
      onComplete(transcript, processedText);
    } catch (error: any) {
      console.error("Failed to process transcript:", error);
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
    retry();
  };

  const currentState = isProcessing ? "processing" : state;
  const isWaveformActive =
    currentState === "recording" || currentState === "processing";

  // Override canProceed if user has explicitly clicked retry
  const effectiveCanProceed = hasRetried ? false : canProceed;

  if (!assistantId) {
    return (
      <Card className="p-8">
        <div className="space-y-6 h-[268px] items-center justify-center text-center">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="space-y-6 h-[268px]">
        {!assistantId ? (
          <LoadingSpinner />
        ) : (
          <>
            <VoiceWaveform isActive={isWaveformActive} />

            <VoiceStateIndicator
              state={currentState}
              error={error || undefined}
              canProceed={effectiveCanProceed}
            />

            <VoiceControls
              state={currentState}
              onStart={startCall}
              onRetry={handleRetry}
              disabled={!assistantId || isProcessing}
              canProceed={effectiveCanProceed}
            />
          </>
        )}
      </div>
    </Card>
  );
}
