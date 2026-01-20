"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
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
        {/* <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            <Image
              src={matchUser?.photoUrl || "/avatar.png"}
              alt={matchUser?.name}
              width={500}
              height={500}
              className={`w-full aspect-square object-cover rounded-2xl shadow-lg transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div> */}

        {/* Profile Header */}
        <div className="flex-1 space-y-8">
          {/* <div>
            <h3 className="text-lg font-bold">
              {matchUser.name.split(" ")[0]}, {matchUser.age}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{matchUser.jobTitle}</span>
            </div>
          </div> */}

          {/* Compatibility Score */}
          {/* <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {match.compatibilityScore}% Compatibility
            </div>
          </div>

          <Separator /> */}

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
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">
                      Things to Consider
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                      {match.redFlags.map((flag, index) => (
                        <div key={index} className="leading-relaxed">
                          {flag}
                        </div>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
