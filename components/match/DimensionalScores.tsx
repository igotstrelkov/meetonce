"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Heart,
  Home,
  MessageSquare,
  Sparkles,
  Target,
} from "lucide-react";

interface DimensionScores {
  values: number;
  lifestyle: number;
  interests: number;
  communication: number;
  relationshipVision: number;
}

interface DimensionalScoresProps {
  dimensionScores: DimensionScores;
  redFlags?: string[];
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
  redFlags,
}: DimensionalScoresProps) {
  if (!dimensionScores) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Compatibility Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>

      {redFlags && redFlags.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <AlertDescription>
            <div className="font-medium text-muted-foreground mb-2">
              Things to Consider:
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {redFlags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
