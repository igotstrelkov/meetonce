"use client";

import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useVapiCall } from "@/lib/hooks/useVapiCall";
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
  const [assistantId, setAssistantId] = useState<string | null>(providedAssistantId || null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getBioAssistant = useAction(api.voice.getBioAssistant);
  const getPreferencesAssistant = useAction(api.voice.getPreferencesAssistant);
  const processTranscript = useAction(api.voice.processTranscript);

  // Load assistant ID on mount if not provided
  useEffect(() => {
    if (!assistantId) {
      const loadAssistant = async () => {
        try {
          const id = type === "bio"
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
    if (!transcript || transcript.trim().length === 0) {
      return;
    }

    try {
      setIsProcessing(true);
      const processedText = await processTranscript({ transcript, type });
      onComplete(transcript, processedText);
    } catch (error: any) {
      console.error("Failed to process transcript:", error);
      // Error will be shown by the hook
    } finally {
      setIsProcessing(false);
    }
  };

  const { state, error, startCall, retry } = useVapiCall({
    assistantId: assistantId || "",
    onTranscriptComplete: handleTranscriptComplete,
  });

  const currentState = isProcessing ? "processing" : state;
  const isWaveformActive = currentState === "recording" || currentState === "processing";

  if (!assistantId) {
    return (
      <Card className="p-8 h-[268px]">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <LoadingSpinner/>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="space-y-6">
        {/* <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div> */}

        <VoiceWaveform isActive={isWaveformActive} />

        <VoiceStateIndicator
          state={currentState}
          error={error || undefined}
          canProceed={canProceed}
        />

        <VoiceControls
          state={currentState}
          onStart={startCall}
          onRetry={retry}
          disabled={!assistantId || isProcessing}
          canProceed={canProceed}
        />
      </div>
    </Card>
  );
}
