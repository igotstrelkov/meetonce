"use client";

import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useVapiCall } from "@/hooks/useVapiCall";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";
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
  const [assistantId, setAssistantId] = useState<string | null>(
    providedAssistantId || null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const getBioAssistant = useAction(api.voice.getBioAssistant);
  const getPreferencesAssistant = useAction(api.voice.getPreferencesAssistant);
  const processTranscript = useAction(api.voice.processTranscript);
  const [hasRetried, setHasRetried] = useState(false);

  // Load assistant ID on mount if not provided
  useEffect(() => {
    if (!assistantId) {
      const loadAssistant = async () => {
        try {
          const id =
            type === "bio"
              ? await getBioAssistant()
              : await getPreferencesAssistant();
          setAssistantId(id);
        } catch (error) {
          console.error("Failed to load assistant:", error);
        }
      };
      loadAssistant();
    }
  }, [assistantId, type, getBioAssistant, getPreferencesAssistant]);

  const handleTranscriptComplete = async (transcript: string) => {
    console.log(
      "🔍 handleTranscriptComplete called with transcript:",
      transcript
    );

    if (!transcript || transcript.trim().length === 0) {
      console.warn("⚠️ Empty transcript, skipping processing");
      return;
    }

    try {
      setIsProcessing(true);
      console.log("🔄 Processing transcript...");
      const processedText = await processTranscript({ transcript, type });
      console.log("✅ Transcript processed successfully:", processedText);
      setHasRetried(false); // Reset retry flag on successful completion
      onComplete(transcript, processedText);
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
    retry();
  };

  const currentState = isProcessing ? "processing" : state;
  const isWaveformActive =
    currentState === "connecting" ||
    currentState === "recording" ||
    currentState === "processing";

  // Override canProceed if user has explicitly clicked retry
  const effectiveCanProceed = hasRetried ? false : canProceed;

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
