"use client";

import { Progress } from "@/components/ui/progress";
import { Heart, Home, MessageSquare, Sparkles, Target } from "lucide-react";

interface DimensionScores {
  values: number;
  lifestyle: number;
  interests: number;
  communication: number;
  relationshipVision: number;
}

interface DimensionalScoresProps {
  dimensionScores: DimensionScores;
}

const DIMENSIONS = [
  {
    key: "values" as keyof DimensionScores,
    label: "Shared Values",
    max: 25,
    icon: Heart,
    description: "Core values & life philosophy alignment",
  },
  {
    key: "lifestyle" as keyof DimensionScores,
    label: "Lifestyle Match",
    max: 25,
    icon: Home,
    description: "Daily routines & social preferences",
  },
  {
    key: "interests" as keyof DimensionScores,
    label: "Shared Interests",
    max: 20,
    icon: Sparkles,
    description: "Hobbies & connection points",
  },
  {
    key: "communication" as keyof DimensionScores,
    label: "Communication Style",
    max: 20,
    icon: MessageSquare,
    description: "Emotional expression & conflict resolution",
  },
  {
    key: "relationshipVision" as keyof DimensionScores,
    label: "Relationship Goals",
    max: 10,
    icon: Target,
    description: "Future timeline & vision alignment",
  },
];

export default function DimensionalScores({
  dimensionScores,
}: DimensionalScoresProps) {
  if (!dimensionScores) return null;

  return (
    <div className="space-y-4">
      {DIMENSIONS.map((dimension) => {
        const score = dimensionScores[dimension.key];
        const percentage = (score / dimension.max) * 100;
        const Icon = dimension.icon;

        return (
          <div key={dimension.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{dimension.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {score}/{dimension.max}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {dimension.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
