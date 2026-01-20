"use client";

import { FeedbackContent } from "@/app/(auth)/dashboard/FeedbackContent";
import { FeedbackForm } from "@/app/(auth)/dashboard/FeedbackForm";
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
import { Calendar, Check, CircleQuestionMark, MapPin } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
          <Calendar className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold">No Past Dates</h2>
        <p className="text-gray-500 max-w-md">
          Leave anonymous feedback to help us find you better dates.
        </p>
      </div>
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const { match, matchUser, feedbackProvided } = pastMutualMatch;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Card className={`p-3 transition-all cursor-pointer hover:shadow-lg`}>
          <div className="flex gap-3">
            {/* Match User Photo */}
            <div className="shrink-0 relative w-[120px]">
              <Image
                src={matchUser?.photoUrl || "/avatar.png"}
                alt={matchUser?.name || "Match Photo"}
                width={120}
                height={120}
                className={`w-full aspect-square object-cover rounded-2xl shadow-lg transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Match Details */}
            <div className="flex-1">
              <div>
                <h3 className="text-xl font-bold">
                  {matchUser.name.split(" ")[0]}, {matchUser.age}
                </h3>
                <p className="text-sm text-gray-600">Week of {match.weekOf}</p>
              </div>

              {/* Venue Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{match.suggestedVenue.name}</span>
              </div>
              {/* Venue Info */}
              {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Saturday at 14:00</span>
              </div> */}
              {/* Week Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Saturday at 14:00</span>
              </div>

              {/* Feedback Status */}
              {feedbackProvided ? (
                // <p className="text-sm text-green-600 font-medium">
                //   Feedback provided
                // </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4" />
                  <span className="">Feedback provided</span>
                </div>
              ) : (
                // <p className="text-sm text-red-600 font-medium">
                //   Feedback required
                // </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CircleQuestionMark className="w-4 h-4" />
                  <span className="">Feedback required</span>
                </div>
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
            <FeedbackForm match={match} onComplete={() => setIsOpen(false)} />
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
