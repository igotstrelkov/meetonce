"use client";

import { FeedbackContent } from "@/components/feedback/FeedbackContent";
import PostDateFeedbackForm from "@/components/feedback/PostDateFeedbackForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function PastMatches() {
  const pastMatches = useQuery(api.matches.getPastMatches, {});

  if (pastMatches === undefined) {
    return <LoadingSpinner />;
  }

  // Filter to only show mutual matches (dates that could have happened)
  const pastMutualMatches = pastMatches.filter(
    (item) => item.match.mutualMatch
  );

  if (pastMutualMatches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600">No dates to rate yet</p>
        <p className="text-sm text-gray-500 mt-2">
          When you have mutual matches, you can rate your dates here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pastMutualMatches.map((pastMutualMatch) => (
        <PastMatchItem
          key={pastMutualMatch.match._id}
          pastMutualMatch={pastMutualMatch}
        />
      ))}
    </div>
  );
}

interface PastMutualMatchProps {
  pastMutualMatch: {
    match: Doc<"weeklyMatches">;
    matchUser: Doc<"users"> & { photoUrl: string | null };
    feedbackProvided: boolean;
  };
}

function PastMatchItem({ pastMutualMatch }: PastMutualMatchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { match, matchUser, feedbackProvided } = pastMutualMatch;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Card className={`p-3 transition-all cursor-pointer hover:shadow-lg`}>
          <div className="flex gap-3">
            {/* Match User Photo */}
            <div className="shrink-0">
              {matchUser.photoUrl ? (
                <Image
                  src={matchUser.photoUrl}
                  alt={matchUser.name}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-[120px] h-[120px] bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
              )}
            </div>

            {/* Match Details */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-bold">{matchUser.name}</h3>
                <p className="text-sm text-gray-600">
                  {matchUser.age} • {matchUser.location}
                </p>
              </div>

              {/* Week Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Week of {match.weekOf}</span>
              </div>

              {/* Feedback Status */}
              {feedbackProvided ? (
                <p className="text-sm text-green-600 font-medium">
                  Feedback provided
                </p>
              ) : (
                <p className="text-sm text-red-600 font-medium">
                  Feedback required
                </p>
              )}
            </div>
          </div>
        </Card>
      </DrawerTrigger>
      <DrawerContent
        className="h-[90vh]"
        aria-description={undefined}
        aria-describedby={undefined}
      >
        <DrawerHeader className="hidden">
          <DrawerTitle>Match Details</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto">
          {feedbackProvided ? (
            <FeedbackContent match={match} matchUser={matchUser} />
          ) : (
            <PostDateFeedbackForm
              match={match}
              onComplete={() => setIsOpen(false)}
            />
          )}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
