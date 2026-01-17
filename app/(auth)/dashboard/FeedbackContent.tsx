"use client";

import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  Calendar,
  CheckCircle,
  MapPin,
  Star,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function FeedbackContent({
  match,
  matchUser,
}: {
  match: Doc<"weeklyMatches">;
  matchUser: Doc<"users"> & { photoUrl: string | null };
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const outcome = useQuery(api.feedback.getDateOutcome, {
    matchId: match._id,
  });

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Profile Photo with Loading State */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Image
                src={matchUser.photoUrl || "/avatar.png"}
                alt={matchUser.name}
                width={500}
                height={500}
                className={`w-full aspect-square object-cover rounded-2xl shadow-lg transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-bold">
                {matchUser.name.split(" ")[0]}, {matchUser.age}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{matchUser.jobTitle}</span>
              </div>
            </div>
            {outcome !== null && (
              <>
                {/* Date Status */}
                <div className="flex flex-wrap gap-2">
                  {outcome?.dateHappened === "yes" && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Date Completed
                    </div>
                  )}
                  {outcome?.dateHappened === "cancelled_by_them" && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      They Cancelled
                    </div>
                  )}
                  {outcome?.dateHappened === "cancelled_by_me" && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      You Cancelled
                    </div>
                  )}
                  {outcome?.dateHappened === "rescheduled" && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      <Calendar className="w-4 h-4" />
                      Rescheduled
                    </div>
                  )}
                </div>

                {/* Rating and Second Date Interest */}
                {outcome?.dateHappened === "yes" && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      {outcome?.overallRating && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Overall Rating
                          </p>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < outcome?.overallRating!
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {outcome?.wouldMeetAgain && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Second Date?
                          </p>
                          <div className="flex items-center gap-2">
                            {outcome?.wouldMeetAgain === "yes" && (
                              <span className="flex items-center gap-1 text-green-700 font-medium">
                                <ThumbsUp className="w-4 h-4" />
                                Yes
                              </span>
                            )}
                            {outcome?.wouldMeetAgain === "maybe" && (
                              <span className="text-yellow-700 font-medium">
                                Maybe
                              </span>
                            )}
                            {outcome?.wouldMeetAgain === "no" && (
                              <span className="flex items-center gap-1 text-red-700 font-medium">
                                <ThumbsDown className="w-4 h-4" />
                                No
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Week of */}
                      {outcome?.weekOf && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Week of:</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="capitalize text-gray-700">
                              {outcome?.weekOf}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Venue Rating */}
                      {outcome?.venueRating && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Venue Rating:
                          </p>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            <span className="capitalize text-gray-700">
                              {outcome?.venueRating}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* What Went Well */}
                      {outcome?.wentWell && outcome?.wentWell.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            What went well:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {outcome?.wentWell.map((item, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded-md"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* What Went Poorly */}
                      {outcome?.wentPoorly &&
                        outcome?.wentPoorly.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Areas to improve:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {outcome?.wentPoorly.map((item, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-red-50 text-red-700 text-sm rounded-md"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Additional Thoughts */}
                    {outcome?.additionalThoughts && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Additional thoughts:
                        </p>
                        <p className="text-gray-800">
                          {outcome?.additionalThoughts}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
