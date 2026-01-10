"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import DimensionalScores from "./DimensionalScores";

type MatchCardProps = {
  match: any;
  matchUser: any;
  isReversed: boolean;
  currentUserId: Id<"users">;
};

export default function MatchCard({
  match,
  matchUser,
  isReversed,
  currentUserId,
}: MatchCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  console.log("LOL");

  return (
    <div className="space-y-6">
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold mb-1">
                {matchUser?.name}, {matchUser?.age}
              </CardTitle>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{matchUser?.location}</span>
              </div>
            </div>
            {/* <Heart className="w-6 h-6 text-primary" /> */}
          </div>
        </CardHeader>
      </Card>

      {/* Compatibility Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <div className="text-sm font-medium text-muted-foreground">
                Compatibility Score
              </div>
            </div>
            <div className="text-5xl font-bold text-primary">
              {match.compatibilityScore}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why We Matched You */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Why We Matched You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {match.explanation}
          </p>
        </CardContent>
      </Card>

      {/* Dimensional Scores */}
      {match.dimensionScores && (
        <DimensionalScores
          dimensionScores={match.dimensionScores}
          redFlags={match.redFlags}
        />
      )}

      {/* About Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-xl">About {matchUser?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {matchUser?.bio}
          </p>
        </CardContent>
      </Card> */}

      {/* Looking For Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-xl">Looking For</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {matchUser?.lookingFor}
          </p>
        </CardContent>
      </Card> */}

      {/* Interests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {matchUser?.interests.map((interest: string) => (
              <Badge key={interest} variant="outline">
                {interest}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Buttons or Status - Moved to Dashboard Page */}
    </div>
  );
}
