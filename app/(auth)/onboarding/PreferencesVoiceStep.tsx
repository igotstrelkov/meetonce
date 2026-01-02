"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import StepWrapper from "./StepWrapper";
import AudioWaveform from "@/components/voice/AudioWaveform";
import Vapi from "@vapi-ai/web";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface PreferencesVoiceStepProps {
  data: {
    lookingFor: string;
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
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptComplete, setTranscriptComplete] = useState(false);

  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef<string>("");

  const generateLookingFor = useAction(api.voiceProcessing.generateLookingForFromTranscript);

  useEffect(() => {
    // Initialize Vapi client
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey || publicKey === "your_vapi_public_key_here") {
      setError("Vapi API key not configured. Please add NEXT_PUBLIC_VAPI_PUBLIC_KEY to .env.local");
      return;
    }

    vapiRef.current = new Vapi(publicKey);

    // Set up event listeners
    vapiRef.current.on("call-start", () => {
      console.log("Call started");
      setIsConnected(true);
      setError(null);
    });

    vapiRef.current.on("call-end", () => {
      console.log("Call ended");
      setIsConnected(false);
      setIsSpeaking(false);
      handleCallEnd();
    });

    vapiRef.current.on("speech-start", () => {
      console.log("Assistant speaking");
      setIsSpeaking(true);
    });

    vapiRef.current.on("speech-end", () => {
      console.log("Assistant stopped speaking");
      setIsSpeaking(false);
    });

    vapiRef.current.on("volume-level", (volume: number) => {
      setVolumeLevel(volume);
    });

    vapiRef.current.on("message", (message: any) => {
      console.log("Message received:", message);

      // Capture transcript
      if (message.type === "transcript" && message.transcriptType === "final") {
        const speaker = message.role === "user" ? "User" : "Assistant";
        const text = message.transcript;
        transcriptRef.current += `${speaker}: ${text}\n`;
      }
    });

    vapiRef.current.on("error", (error: any) => {
      console.error("Vapi error:", error);
      setError(error.message || "An error occurred during the call");
      setIsConnected(false);
    });

    return () => {
      // Cleanup
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const startCall = async () => {
    if (!vapiRef.current) return;

    try {
      setError(null);
      transcriptRef.current = "";

      await vapiRef.current.start({
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a warm, empathetic dating profile interviewer. Your goal is to help the user articulate what they're looking for in a partner through natural conversation.

Ask about:
- The qualities and values they want in a partner
- Personality traits that are important to them
- Lifestyle compatibility factors (communication style, activities, goals)
- What kind of relationship they're seeking
- Deal-breakers and must-haves
- What makes them feel connected to someone
- Their ideal dynamic in a relationship

Guidelines:
- Keep the conversation natural and flowing
- Ask follow-up questions to get specific, meaningful answers
- Help them go beyond surface-level traits ("kind", "funny") to deeper values
- Encourage honesty about what truly matters to them
- The conversation should last 2-4 minutes
- When you feel you have enough rich information, thank them and naturally end the conversation

Start by warmly explaining that you'll have a brief conversation to help them describe their ideal partner.`,
            },
          ],
        },
        voice: {
          provider: "11labs",
          voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice - warm and friendly
        },
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en",
        },
        firstMessage: "Now let's talk about what you're looking for in a partner. I'll ask you some questions to help you articulate what matters most to you. Ready?",
        endCallMessage: "Perfect! I have everything I need. Thank you for sharing what you're looking for.",
        maxDurationSeconds: 600, // 10 minutes max
      });
    } catch (err: any) {
      console.error("Error starting call:", err);
      setError(err.message || "Failed to start call");
    }
  };

  const stopCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  const handleCallEnd = async () => {
    if (!transcriptRef.current.trim()) {
      setError("No conversation was recorded. Please try again.");
      return;
    }

    setIsProcessing(true);

    try {
      // Generate optimized "looking for" description from transcript
      const generatedLookingFor = await generateLookingFor({ transcript: transcriptRef.current });

      // Update form data with generated description
      updateData({ lookingFor: generatedLookingFor });

      setTranscriptComplete(true);
      setError(null);
    } catch (err: any) {
      console.error("Error processing transcript:", err);
      setError("Failed to process your conversation. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (!data.lookingFor) {
      setError("Please complete the voice interview before continuing.");
      return;
    }
    onNext();
  };

  return (
    <StepWrapper
      title="What are you looking for?"
      description="Tell us about your ideal partner through a natural conversation"
    >
      <div className="space-y-6">
        {/* Audio Waveform */}
        <AudioWaveform
          volumeLevel={volumeLevel}
          isSpeaking={isSpeaking}
          isConnected={isConnected}
        />

        {/* Status Messages */}
        <div className="text-center">
          {!isConnected && !transcriptComplete && !isProcessing && (
            <p className="text-sm text-gray-600">
              Click "Start Interview" to begin your voice conversation
            </p>
          )}
          {isConnected && (
            <p className="text-sm text-pink-600 font-medium">
              {isSpeaking ? "AI is speaking..." : "Listening..."}
            </p>
          )}
          {isProcessing && (
            <p className="text-sm text-purple-600 font-medium">
              Processing your conversation and creating your preferences...
            </p>
          )}
          {transcriptComplete && (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">
                ✓ Voice interview complete!
              </p>
              <p className="text-xs text-gray-500">
                Your preferences have been captured and optimized for matching
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Call Controls */}
        {!transcriptComplete && (
          <div className="flex justify-center gap-4">
            {!isConnected ? (
              <Button
                onClick={startCall}
                disabled={isProcessing}
                className="px-8"
                size="lg"
              >
                Start Interview
              </Button>
            ) : (
              <Button
                onClick={stopCall}
                variant="destructive"
                className="px-8"
                size="lg"
              >
                End Interview
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button onClick={onBack} variant="outline" disabled={isConnected || isProcessing}>
          ← Back
        </Button>
        <Button
          onClick={handleNext}
          size="lg"
          disabled={!transcriptComplete || isProcessing}
        >
          Continue →
        </Button>
      </div>
    </StepWrapper>
  );
}
