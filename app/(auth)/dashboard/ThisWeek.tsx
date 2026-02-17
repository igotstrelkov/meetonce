import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MatchCard } from "@/components/match/MatchCard";
import PassFeedbackForm from "@/components/match/PassFeedbackForm";
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
import { api } from "@/convex/_generated/api";
import { getDirectionsUrl } from "@/convex/lib/googlePlaces";
import { useMatchInteraction } from "@/hooks/useMatchInteraction";
import { useQuery } from "convex/react";
import {
  Calendar,
  Check,
  ChevronUp,
  ExternalLink,
  Info,
  MapPin,
  MessageCircle,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const ThisWeek = () => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  const matchData = useQuery(api.matches.getCurrentMatch);

  // Query unread count
  const unreadCount =
    useQuery(
      api.chat.getUnreadCount,
      matchData && matchData.match.mutualMatch
        ? { matchId: matchData.match._id }
        : "skip"
    ) || 0;

  const match = matchData?.match;
  const matchUser = matchData?.matchUser;
  const isReversed = matchData?.isReversed ?? false;
  const myResponse =
    matchData && match && isReversed
      ? match.matchResponse
      : match?.userResponse;
  const theirResponse =
    matchData && match && isReversed
      ? match.userResponse
      : match?.matchResponse;

  const {
    handleInterested,
    handlePass,
    handlePassComplete,
    isSubmitting,
    showPassFeedback,
    setShowPassFeedback,
  } = useMatchInteraction({
    matchId: match?._id,
    matchUserId: isReversed ? match?.userId : match?.matchUserId,
    isReversed,
    weekOf: match?.weekOf,
  });

  if (matchData === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (matchData === null || !match || !matchUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <Calendar className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">No Match This Week</h2>
        <p className="text-muted-foreground max-w-md">
          We're still looking for your perfect match. New matches are released
          every Monday morning!
        </p>
      </div>
    );
  }

  // Calculate generic date (e.g., Saturday at 2 PM)
  const scheduledText =
    match.dateScheduled && match.dateScheduledFor
      ? new Date(match.dateScheduledFor).toLocaleString("en-US", {
          weekday: "long",
          hour: "numeric",
          minute: "numeric",
        })
      : "Saturday from 14:00 to 14:30";

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col">
      {/* Drawer Context wrapping the whole hero section */}
      <Drawer>
        <div className="flex-1 flex flex-col md:flex-row rounded-lg transition-colors overflow-hidden border">
          {/* Main Hero Image Section */}
          <div className="relative w-full md:w-1/2 min-h-[400px] md:min-h-full">
            <Image
              src={matchUser.photoUrl || "/avatar.png"}
              alt={matchUser.firstName}
              fill
              className={`object-cover transition-opacity duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent md:bg-linear-to-l md:from-white/10 md:to-transparent" />

            {/* Mobile-only Info Overlay (bottom of image) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-semibold border border-white/30">
                  {match.compatibilityScore}% Compatibility
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-1">
                {matchUser.firstName}, {matchUser.age}
              </h1>
              <p className="text-white/90 font-medium">{matchUser.jobTitle}</p>
            </div>
          </div>

          {/* Details & Actions Section */}
          <div className="flex-1 p-6 md:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Desktop Header */}
              <div className="hidden md:block">
                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold mb-4">
                  {match.compatibilityScore}% Match
                </div>
                <h1 className="text-4xl font-bold mb-2">
                  {matchUser.firstName}, {matchUser.age}
                </h1>
                <p className="text-xl text-muted-foreground">{matchUser.jobTitle}</p>
              </div>

              {/* Match Details */}
              <div className="space-y-4">
                <div
                  className="flex items-start gap-4 p-4 bg-muted/50 rounded-2xl"
                  onClick={() =>
                    window.open(
                      getDirectionsUrl({
                        placeId: match.suggestedVenue.placeId,
                        address: match.suggestedVenue.address,
                      }),
                      "_blank"
                    )
                  }
                >
                  <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-semibold text-foreground">
                        Suggested Venue
                      </h3>
                      <ExternalLink className="h-3 w-3 ml-1 hover:text-muted-foreground" />
                    </div>

                    <p className="text-muted-foreground">{match.suggestedVenue.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-2xl">
                  <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">When</h3>
                    <p className="text-muted-foreground">{scheduledText}</p>
                  </div>
                </div>
              </div>

              {/* "View More" Trigger */}
              <DrawerTrigger asChild>
                <button className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-gray-900 font-medium text-sm transition-colors group">
                  <Info className="w-4 h-4" />
                  View full analysis
                  <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                </button>
              </DrawerTrigger>
            </div>

            {/* Action Area */}
            <div className="mt-8 pt-8 border-t border-border">
              {myResponse === "pending" ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handlePass}
                    variant="outline"
                    size="lg"
                    className="h-14 text-lg border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    disabled={isSubmitting}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Pass
                  </Button>
                  <Button
                    onClick={handleInterested}
                    size="lg"
                    className="h-14 text-lg bg-foreground hover:bg-foreground/90 text-background shadow-lg shadow-foreground/10"
                    disabled={isSubmitting}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Accept
                  </Button>
                </div>
              ) : myResponse === "interested" ? (
                <div className="bg-green-50 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-green-800 text-lg">
                    You're Interested!
                  </h3>
                  {match.mutualMatch ? (
                    <div className="space-y-4">
                      <p className="text-green-700">
                        It's a match! You both want to meet.
                      </p>
                      <Button
                        onClick={() => router.push(`/chat/${match._id}`)}
                        size="lg"
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Chat & Plan Date
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {unreadCount}
                          </span>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-green-700">
                      Waiting for {matchUser.firstName} to respond...
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-muted/50 rounded-2xl p-6 text-center">
                  <h3 className="font-bold text-foreground">Skipped</h3>
                  <p className="text-muted-foreground">
                    You passed on this match. Check back next Monday!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Feedback Form Overlay */}
        {showPassFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-background rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
              <PassFeedbackForm
                onSubmit={handlePassComplete}
                onCancel={() => setShowPassFeedback(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Drawer Content */}
        <DrawerContent className="h-[90vh]">
          <DrawerHeader className="hidden">
            <DrawerTitle>Match Details</DrawerTitle>
          </DrawerHeader>
          <MatchCard match={match} matchUser={matchUser} />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close Profile</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
