"use client";

import { FeedbackContent } from "@/app/(auth)/dashboard/FeedbackContent";
import { FeedbackForm } from "@/app/(auth)/dashboard/FeedbackForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  Calendar,
  Check,
  ChevronRight,
  CircleQuestionMark,
  MapPin,
} from "lucide-react";
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
      // <Card className="p-8 text-center">
      //   <p className="text-gray-600 text-lg font-bold">No Past Dates</p>
      //   <p className="text-sm text-gray-500 mt-2">
      //     Leave anonymous feedback to help us find you better dates.
      //   </p>
      // </Card>
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
        <div className="group relative p-4 transition-all hover:bg-gray-50 rounded-2xl cursor-pointer">
          <div className="flex gap-4">
            {/* Match User Photo */}
            <div className="shrink-0 relative w-[100px]">
              <Image
                src={matchUser?.photoUrl || "/avatar.png"}
                alt={matchUser?.name || "Match Photo"}
                width={100}
                height={100}
                className={`w-full aspect-square object-cover rounded-2xl transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <div className="bg-white/90 backdrop-blur-[2px] shadow-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-green-700">
                  {match.compatibilityScore}%
                </div>
              </div>
            </div>

            {/* Match Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold truncate pr-2">
                  {matchUser.name.split(" ")[0]}, {matchUser.age}
                </h3>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {feedbackProvided ? (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    <Check className="w-3 h-3" />
                    Feedback Sent
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                    <CircleQuestionMark className="w-3 h-3" />
                    Feedback Needed
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">Week of {match.weekOf}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{match.suggestedVenue.name}</span>
                </div>
              </div>
            </div>

            {/* Chevron */}
            <div className="flex items-center justify-center text-gray-300">
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
          <Separator className="absolute bottom-0 left-4 right-4 group-last:hidden" />
        </div>
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
