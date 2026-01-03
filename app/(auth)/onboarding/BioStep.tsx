"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import StepWrapper from "./StepWrapper";

interface BioStepProps {
  data: {
    bio: string;
    lookingFor: string;
  };
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BioStep({
  data,
  updateData,
  onNext,
  onBack,
}: BioStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bioWordCount = data.bio.trim().split(/\s+/).filter(Boolean).length;
  const lookingForWordCount = data.lookingFor
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (bioWordCount < 50 || bioWordCount > 300) {
      newErrors.bio = "Bio must be between 50 and 300 words";
    }

    if (lookingForWordCount < 20 || lookingForWordCount > 100) {
      newErrors.lookingFor = "Looking for must be between 20 and 100 words";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <StepWrapper
      title="Tell us your story"
      description="Help us understand who you are and what you're looking for"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="bio" className="mb-2 block">
            About You *
          </Label>
          <Textarea
            id="bio"
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
            placeholder="Tell us about yourself, your passions, what makes you unique..."
            className="min-h-[200px] w-full"
          />
          <div className="flex justify-between items-center mt-1">
            <p
              className={`text-sm ${
                bioWordCount < 50 || bioWordCount > 300
                  ? "text-red-500"
                  : "text-gray-600"
              }`}
            >
              {bioWordCount} / 50-300 words
            </p>
          </div>
          {errors.bio && (
            <p className="text-sm text-red-500 mt-1">{errors.bio}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lookingFor" className="mb-2 block">
            What You're Looking For *
          </Label>
          <Textarea
            id="lookingFor"
            value={data.lookingFor}
            onChange={(e) => updateData({ lookingFor: e.target.value })}
            placeholder="Describe your ideal match and what kind of relationship you're seeking..."
            className="min-h-[150px] w-full"
          />
          <div className="flex justify-between items-center mt-1">
            <p
              className={`text-sm ${
                lookingForWordCount < 20 || lookingForWordCount > 100
                  ? "text-red-500"
                  : "text-gray-600"
              }`}
            >
              {lookingForWordCount} / 20-100 words
            </p>
          </div>
          {errors.lookingFor && (
            <p className="text-sm text-red-500 mt-1">{errors.lookingFor}</p>
          )}
        </div>
      </div>

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
