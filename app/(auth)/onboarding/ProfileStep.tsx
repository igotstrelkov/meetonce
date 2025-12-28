"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, GENDERS } from "@/lib/constants";
import { useState } from "react";

interface ProfileStepProps {
  data: {
    name: string;
    age: number;
    gender: string;
    location: string;
  };
  updateData: (data: any) => void;
  onNext: () => void;
}

export default function ProfileStep({ data, updateData, onNext }: ProfileStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.name || data.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!data.age || data.age < 18 || data.age > 100) {
      newErrors.age = "Age must be between 18 and 100";
    }

    if (!data.location) {
      newErrors.location = "Location is required";
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
        <h2 className="text-2xl font-bold mb-2">Let's start with the basics</h2>
        <p className="text-gray-600">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-2 block">Full Name *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="John Doe"
            className="w-full"
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="age" className="mb-2 block">Age *</Label>
          <Input
            id="age"
            type="number"
            value={data.age || ""}
            onChange={(e) => updateData({ age: parseInt(e.target.value) })}
            placeholder="25"
            className="w-full"
          />
          {errors.age && <p className="text-sm text-red-500 mt-1">{errors.age}</p>}
        </div>

        <div>
          <Label htmlFor="gender" className="mb-2 block">Gender *</Label>
          <Select
            value={data.gender}
            onValueChange={(value) => updateData({ gender: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((gender) => (
                <SelectItem key={gender.value} value={gender.label}>{gender.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location" className="mb-2 block">Location *</Label>
          <Select
            value={data.location}
            onValueChange={(value) => updateData({ location: value })}
          >
            <SelectTrigger className="w-full" >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.label}>{country.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} size="lg">
          Continue →
        </Button>
      </div>
    </div>
  );
}
