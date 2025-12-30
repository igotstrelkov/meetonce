"use client";

import { Button } from "@/components/ui/button";
import { PASS_REASONS } from "@/lib/constants";
import { useState } from "react";

export default function PassFeedbackForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: {
  onSubmit: (reason?: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <h3 className="font-semibold">Help us understand (optional)</h3>
      <p className="text-sm text-gray-600">
        This helps us make better matches in the future
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {PASS_REASONS.map((reason) => (
          <button
            key={reason.value}
            onClick={() => setSelectedReason(reason.value)}
            disabled={isSubmitting}
            className={`p-3 rounded-lg text-sm font-medium text-left transition-all ${
              selectedReason === reason.value
                ? "bg-gray-800 text-white"
                : "bg-white hover:bg-gray-100 border border-gray-200"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {reason.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onSubmit(selectedReason || undefined)}
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
        <Button onClick={onCancel} variant="ghost" disabled={isSubmitting}>
          Skip
        </Button>
      </div>
    </div>
  );
}
