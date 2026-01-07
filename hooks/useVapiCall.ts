import type { VoiceState } from "@/components/voice/VoiceStateIndicator";
import Vapi from "@vapi-ai/web";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseVapiCallProps {
  assistantId: string;
  onTranscriptComplete: (transcript: string) => void;
}

export function useVapiCall({
  assistantId,
  onTranscriptComplete,
}: UseVapiCallProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");

  const vapiRef = useRef<Vapi | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef("");
  const onTranscriptCompleteRef = useRef(onTranscriptComplete);

  // Keep the ref updated
  useEffect(() => {
    onTranscriptCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  // Initialize Vapi client
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      console.error("VAPI_PUBLIC_KEY not found in environment variables");
      setError("Voice service configuration error");
      return;
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log("🔍 Device detection:", { isIOS, isSafari, userAgent: navigator.userAgent });

    vapiRef.current = new Vapi(publicKey);

    // Set up event listeners
    const vapi = vapiRef.current;

    vapi.on("call-start", () => {
      console.log("Call started");
      setState("recording");
      setError(null);
      setDuration(0);
      setTranscript("");
      transcriptRef.current = "";

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    });

    vapi.on("call-end", () => {
      console.log("Call ended");
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      // Extract final transcript
      const finalTranscript = transcriptRef.current.trim();
      if (finalTranscript) {
        onTranscriptCompleteRef.current(finalTranscript);
        setState("complete");
      } else {
        setError("No speech detected. Please try again.");
        setState("error");
      }
    });

    vapi.on("message", (message: any) => {
      console.log("Message received:", message);

      // Collect transcript from messages
      if (message.type === "transcript" && message.transcript) {
        transcriptRef.current += " " + message.transcript;
        setTranscript(transcriptRef.current.trim());
      }
    });

    vapi.on("error", (error: any) => {
      console.error("Vapi error:", error);
      setError(error.message || "Voice service error occurred");
      setState("error");
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    });

    // Cleanup on unmount
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const startCall = useCallback(async () => {
    console.log("🎤 startCall triggered");

    if (!vapiRef.current) {
      console.error("❌ Vapi client not initialized");
      setError("Voice service not initialized");
      setState("error");
      return;
    }

    // Check microphone permissions (especially important for iOS)
    try {
      console.log("🔍 Checking microphone permissions...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Clean up test stream
      console.log("✅ Microphone access granted");
    } catch (permErr: any) {
      console.error("❌ Microphone permission denied:", permErr);
      setError("Microphone access denied. Please allow microphone access in your browser settings.");
      setState("error");
      return;
    }

    try {
      console.log("🔄 Starting Vapi call with assistantId:", assistantId);
      setState("connecting"); // Show connecting state while Vapi initializes
      setError(null);
      await vapiRef.current.start(assistantId);
      console.log("✅ Vapi call started successfully");
      // Note: State will be set to "recording" by the "call-start" event
    } catch (err: any) {
      console.error("❌ Failed to start call:", err);
      console.error("❌ Error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack
      });

      // iOS-specific error messages
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS && err.message?.includes("secure")) {
        setError("Voice calls require HTTPS on iPhone. Please use a secure connection.");
      } else if (err.message?.includes("permission")) {
        setError("Microphone access denied. Check iPhone Settings → Safari → Microphone");
      } else {
        setError(err.message || "Failed to connect to voice service");
      }
      setState("error");
    }
  }, [assistantId]);

  const stopCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    setState("idle");
    setDuration(0);
    setTranscript("");
    transcriptRef.current = "";
  }, []);

  const retry = useCallback(() => {
    stopCall();
    setError(null);
    startCall();
  }, [stopCall, startCall]);

  return {
    state,
    duration,
    error,
    transcript,
    startCall,
    stopCall,
    retry,
    setState,
  };
}
