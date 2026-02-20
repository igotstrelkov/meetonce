import { MatchCard } from "@/components/match/MatchCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Doc } from "@/convex/_generated/dataModel";
import { Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface MatchDrawerProps {
  match: Doc<"weeklyMatches">;
  matchUser: Doc<"users"> & { photoUrl: string | null };
}

export const MatchDrawer = ({ match, matchUser }: MatchDrawerProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <Drawer>
      <Card>
        {/* <div className="text-4xl">😉</div>
            <h3 className="text-2xl font-bold">Your Weekly Match</h3> */}
        <CardContent>
          <div className="flex gap-4 mb-4">
            {/* Match User Photo */}
            <div className="shrink-0 relative w-[120px]">
              <Image
                src={matchUser?.photoUrl || "/avatar.png"}
                alt={matchUser?.firstName || "Match Photo"}
                width={120}
                height={120}
                className={`w-full aspect-square object-cover rounded-2xl shadow-lg transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                <div className="backdrop-blur-[2px] shadow-sm rounded-full px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                  {match.compatibilityScore}% Compatibility
                </div>
              </div>
            </div>

            {/* Match Details */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-bold">
                  {matchUser.firstName}, {matchUser.age}
                </h3>
                <p className="text-sm text-gray-600">{matchUser.jobTitle}</p>
              </div>

              {/* Venue Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{match.suggestedVenue.name}</span>
              </div>
              {/* Venue Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Saturday at 2PM</span>
              </div>
            </div>
          </div>

          {/* <Separator className="my-4" /> */}
          <DrawerTrigger asChild>
            <Button variant="outline" size="lg" className="w-full gap-2">
              {/* <User className="w-5 h-5" /> */}
              View More
            </Button>
          </DrawerTrigger>
        </CardContent>
      </Card>

      <DrawerContent
        className="h-[90vh]"
        aria-description={undefined}
        aria-describedby={undefined}
      >
        <DrawerHeader className="hidden">
          <DrawerTitle>Match Details</DrawerTitle>
        </DrawerHeader>

        <MatchCard match={match} matchUser={matchUser} />

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
