"use client";

import { Button } from "@/components/ui/button";
import { INTERESTS } from "@/lib/constants";
import { useState } from "react";
import StepWrapper from "./StepWrapper";

interface InterestsStepProps {
  data: {
    interests: string[];
  };
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function InterestsStep({
  data,
  updateData,
  onNext,
  onBack,
}: InterestsStepProps) {
  const [error, setError] = useState("");

  const toggleInterest = (interest: string) => {
    const newInterests = data.interests.includes(interest)
      ? data.interests.filter((i) => i !== interest)
      : [...data.interests, interest];

    updateData({ interests: newInterests });
  };

  const validate = () => {
    if (data.interests.length < 3) {
      setError("Please select at least 3 interests");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <StepWrapper
      title="What are you into?"
      description={`Select at least 3 interests (${data.interests.length} selected)`}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {INTERESTS.map((interest) => {
          const isSelected = data.interests.includes(interest);
          return (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {interest}
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          ← Back
        </Button>
        <Button onClick={handleNext} size="lg">
          Continue →
        </Button>
      </div>
    </StepWrapper>
  );
}
