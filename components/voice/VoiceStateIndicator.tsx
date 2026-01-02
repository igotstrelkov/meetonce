import { Loader2, Mic, CheckCircle2 } from "lucide-react";

export type VoiceState = "idle" | "recording" | "processing" | "complete" | "error";

interface VoiceStateIndicatorProps {
  state: VoiceState;
  duration?: number;
  error?: string;
}

export function VoiceStateIndicator({ state, duration, error }: VoiceStateIndicatorProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (state === "idle") {
    return (
      <div className="text-center text-gray-600">
        <p className="text-sm">Ready to start your voice interview</p>
      </div>
    );
  }

  if (state === "recording") {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-red-500">
          <Mic className="w-5 h-5 animate-pulse" />
          <span className="font-medium">
            Recording... {duration !== undefined && formatDuration(duration)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">Speak naturally with the AI interviewer</p>
      </div>
    );
  }

  if (state === "processing") {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">Processing your interview...</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">This will just take a moment</p>
      </div>
    );
  }

  if (state === "complete") {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Interview complete!</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">Ready to continue</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-red-600">
          <span className="font-medium">Error</span>
        </div>
        <p className="text-sm text-red-600 mt-1">{error || "Something went wrong"}</p>
      </div>
    );
  }

  return null;
}
