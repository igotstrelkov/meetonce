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
import { COUNTIES, GENDERS } from "@/lib/constants";
import { useState } from "react";
import StepWrapper from "./StepWrapper";

interface ProfileStepProps {
  data: {
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    location: string;
    jobTitle: string;
  };
  updateData: (data: any) => void;
  onNext: () => void;
}

export default function ProfileStep({
  data,
  updateData,
  onNext,
}: ProfileStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.firstName || data.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!data.lastName || data.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!data.age || data.age < 18 || data.age > 100) {
      newErrors.age = "Age must be between 18 and 100";
    }

    if (!data.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!data.location) {
      newErrors.location = "Location is required";
    }

    if (!data.jobTitle || data.jobTitle.length < 2) {
      newErrors.jobTitle = "Job title is required";
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
      title="About you"
      description="Let's start with the basics"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="mb-2 block">
              First Name *
            </Label>
            <Input
              id="firstName"
              value={data.firstName}
              onChange={(e) => updateData({ firstName: e.target.value })}
              placeholder="Jane"
              className="w-full"
            />
            {errors.firstName && (
              <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName" className="mb-2 block">
              Last Name *
            </Label>
            <Input
              id="lastName"
              value={data.lastName}
              onChange={(e) => updateData({ lastName: e.target.value })}
              placeholder="Murphy"
              className="w-full"
            />
            {errors.lastName && (
              <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age" className="mb-2 block">
              Age *
            </Label>
            <Input
              id="age"
              type="number"
              value={data.age || ""}
              onChange={(e) => {
                const parsed = parseInt(e.target.value);
                updateData({ age: isNaN(parsed) ? 0 : parsed });
              }}
              placeholder="25"
              className="w-full"
            />
            {errors.age && (
              <p className="text-sm text-red-500 mt-1">{errors.age}</p>
            )}
          </div>
          <div>
            <Label htmlFor="gender" className="mb-2 block">
              Gender *
            </Label>
            <Select
              value={data.gender}
              onValueChange={(value) => updateData({ gender: value })}
            >
              <SelectTrigger className="w-full">
                {data.gender ? <SelectValue /> : <span className="text-muted-foreground">Select gender</span>}
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((gender) => (
                  <SelectItem key={gender.value} value={gender.label}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="location" className="mb-2 block">
            County *
          </Label>
          <Select
            value={data.location}
            onValueChange={(value) => updateData({ location: value })}
          >
            <SelectTrigger className="w-full">
              {data.location ? <SelectValue /> : <span className="text-muted-foreground">Select county</span>}
            </SelectTrigger>
            <SelectContent>
              {COUNTIES.map((county) => (
                <SelectItem key={county.value} value={county.label}>
                  {county.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.location && (
            <p className="text-sm text-red-500 mt-1">{errors.location}</p>
          )}
        </div>

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
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleNext} size="lg" className="flex-2 max-w-[66%]">
          Continue →
        </Button>
      </div>
    </StepWrapper>
  );
}
