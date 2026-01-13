"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Doc } from "@/convex/_generated/dataModel";
import { AlertCircle, Calendar } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import DimensionalScores from "./DimensionalScores";

type MatchCardProps = {
  match: Doc<"weeklyMatches">;
  matchUser: Doc<"users"> & { photoUrl: string | null };
};

export const MatchCard = ({ match, matchUser }: MatchCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Profile Photo with Loading State */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-2xl aspect-square">
                <LoadingSpinner size="lg" centered={false} />
              </div>
            )}
            <img
              src={matchUser?.photoUrl || "/avatar.png"}
              alt={matchUser?.name}
              className={`w-full aspect-square object-cover rounded-2xl shadow-lg transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </div>
        </div>

        {/* Profile Header */}
        <div>
          <h3 className="text-lg font-bold">
            {matchUser.name}, {matchUser.age}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Week of {match.weekOf}</span>
          </div>
        </div>

        {/* Compatibility Score */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {/* <CheckCircle className="w-4 h-4" /> */}
            {match.compatibilityScore}% Compatibility
          </div>
        </div>

        <Separator />

        {/* Why We Matched You */}
        <div>
          <p className="font-medium text-black mb-2">Why We Matched You</p>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {match.explanation}
          </p>
        </div>

        {/* Dimensional Scores */}
        {match.dimensionScores && (
          <>
            <DimensionalScores dimensionScores={match.dimensionScores} />
          </>
        )}

        {match.redFlags && match.redFlags.length > 0 && (
          <>
            <Alert variant="destructive" className="border-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Things to Consider:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {match.redFlags.map((flag, index) => (
                    <li key={index}>{flag}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </div>
  );
};
