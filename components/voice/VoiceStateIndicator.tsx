import { AlertCircle, CheckCircle2, Loader2, Mic } from "lucide-react";

export type VoiceState =
  | "idle"
  | "connecting"
  | "recording"
  | "processing"
  | "complete"
  | "error"
  | "validation_failed";

interface VoiceStateIndicatorProps {
  state: VoiceState;
  error?: string;
  validationError?: string;
  canProceed?: boolean;
}

export function VoiceStateIndicator({
  state,
  error,
  validationError,
  canProceed,
}: VoiceStateIndicatorProps) {
  if (state === "validation_failed") {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-amber-600">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">More details needed</span>
        </div>
        <p className="text-sm text-amber-700 mt-1">
          {validationError || "Please provide more information"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Try again with more specific details
        </p>
      </div>
    );
  }

  if (state === "complete" || canProceed) {
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

  if (state === "idle") {
    return (
      <div className="text-center text-gray-600">
        <p className="text-sm">Ready to start the interview?</p>
      </div>
    );
  }

  if (state === "connecting") {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">Connecting...</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">Starting the interview</p>
      </div>
    );
  }

  // Interview in progress

  if (state === "recording") {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-red-500">
          <Mic className="w-5 h-5 animate-pulse" />
          <span className="font-medium">In progress...</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">Please speak clearly</p>
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
        <p className="text-sm text-gray-600 mt-1">
          This will just take a moment
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-red-600">
          <span className="font-medium">Error</span>
        </div>
        <p className="text-sm text-red-600 mt-1">
          {error || "Something went wrong"}
        </p>
      </div>
    );
  }

  return null;
}
