import { Button } from "@/components/ui/button";
import { Phone, RotateCcw } from "lucide-react";
import type { VoiceState } from "./VoiceStateIndicator";

interface VoiceControlsProps {
  state: VoiceState;
  onStart: () => void;
  onRetry: () => void;
  disabled?: boolean;
  canProceed?: boolean;
}

export function VoiceControls({ state, onStart, onRetry, disabled, canProceed }: VoiceControlsProps) {
  if (state === "complete" || canProceed) {
    return (
      <div className="flex justify-center">
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Redo Interview
        </Button>
      </div>
    );
  }
  
  if (state === "idle") {
    return (
      <div className="flex justify-center">
        <Button
          onClick={onStart}
          size="lg"
          disabled={disabled}
          className="gap-2"
        >
          <Phone className="w-4 h-4" />
          Start Interview
        </Button>
      </div>
    );
  }

  // if (state === "recording" || state === "processing") {
  //   return (
  //     <div className="flex justify-center">
  //       <Button
  //         onClick={onRetry}
  //         variant="outline"
  //         size="lg"
  //         className="gap-2"
  //       >
  //         <RotateCcw className="w-4 h-4" />
  //         Start Over
  //       </Button>
  //     </div>
  //   );
  // }

  if (state === "error") {
    return (
      <div className="flex justify-center gap-3">
        <Button
          onClick={onRetry}
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return null;
}
