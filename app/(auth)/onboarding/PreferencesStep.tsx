"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { GENDERS } from "@/lib/constants";
import { useState } from "react";

interface PreferencesStepProps {
  data: {
    jobTitle: string;
    interestedIn: string;
    minAge: number;
    maxAge: number;
  };
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PreferencesStep({
  data,
  updateData,
  onNext,
  onBack,
}: PreferencesStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.jobTitle || data.jobTitle.length < 2) {
      newErrors.jobTitle = "Job title is required";
    }

    if (!data.interestedIn) {
      newErrors.interestedIn = "Please select who you are interested in";
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your preferences</h2>
        <p className="text-gray-600">Tell us what you're looking for</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="jobTitle" className="mb-2 block">
            Job Title *
          </Label>
          <Input
            id="jobTitle"
            value={data.jobTitle}
            onChange={(e) => updateData({ jobTitle: e.target.value })}
            placeholder="e.g., Software Engineer, Teacher, Designer"
            className="w-full"
          />
          {errors.jobTitle && (
            <p className="text-sm text-red-500 mt-1">{errors.jobTitle}</p>
          )}
        </div>

        <div>
          <Label htmlFor="interestedIn" className="mb-2 block">
            Interested In *
          </Label>
          <Select
            value={data.interestedIn}
            onValueChange={(value) => updateData({ interestedIn: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((gender) => (
                <SelectItem key={gender.value} value={gender.label}>
                  {gender.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.interestedIn && (
            <p className="text-sm text-red-500 mt-1">{errors.interestedIn}</p>
          )}
        </div>

        <div>
          <Label className="mb-2 block">
            Age Range ({data.minAge || 18} - {data.maxAge || 50})
          </Label>
          <Slider
            value={[data.minAge || 18, data.maxAge || 50]}
            min={18}
            max={50}
            step={1}
            onValueChange={(value) => {
              const [min, max] = value as number[];
              updateData({ minAge: min, maxAge: max });
            }}
            className="py-4"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" size="lg" className="flex-1">
          ← Back
        </Button>
        <Button onClick={handleNext} size="lg" className="flex-[2]">
          Continue →
        </Button>
      </div>
    </div>
  );
}
