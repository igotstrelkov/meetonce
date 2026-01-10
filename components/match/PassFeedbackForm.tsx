"use client";

import { Button } from "@/components/ui/button";
import { PASS_REASONS } from "@/lib/constants";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>Help us understand (optional)</CardTitle>
        <CardDescription>
          This helps us make better matches in the future
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PASS_REASONS.map((reason) => (
            <button
              key={reason.value}
              onClick={() => setSelectedReason(reason.value)}
              disabled={isSubmitting}
              className={`p-3 rounded-lg text-sm font-medium text-left transition-all ${
                selectedReason === reason.value
                  ? "border-2 border-primary bg-white"
                  : "bg-white hover:bg-gray-100 border border-gray-200"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {reason.label}
            </button>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onSubmit(selectedReason || undefined)}
          className="flex-1"
          disabled={isSubmitting || !selectedReason}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
        <Button onClick={onCancel} variant="ghost" disabled={isSubmitting}>
          Skip
        </Button>
      </CardFooter>
    </Card>
  );
}
