"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MatchDetailsModal from "./MatchDetailsModal";
import { Id } from "@/convex/_generated/dataModel";

export default function MatchesAdminPage() {
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [selectedMatch, setSelectedMatch] = useState<Id<"weeklyMatches"> | null>(
    null
  );

  const weeks = useQuery(api.admin.getWeeksWithMatches);
  const stats = useQuery(api.admin.getMatchStats);
  const matches = useQuery(api.admin.getAllMatches, {
    weekOf: selectedWeek === "all" ? undefined : selectedWeek,
    limit: 100,
  });

  if (!matches || !stats || !weeks) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-500">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">All Matches</h2>
        <p className="text-gray-600">
          View all weekly matches and their outcomes
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Matches</div>
          <div className="text-2xl font-bold">{stats.totalMatches}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Mutual Matches</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.mutualMatches}
          </div>
          <div className="text-xs text-gray-500">{stats.mutualMatchRate}% rate</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Dates Completed</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.datesCompleted}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Both Passed</div>
          <div className="text-2xl font-bold text-gray-600">
            {stats.bothPassedCount}
          </div>
        </Card>
      </div>

      {/* Week Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by week:</label>
        <Select value={selectedWeek} onValueChange={(value) => value && setSelectedWeek(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Weeks</SelectItem>
            {weeks.map((week) => (
              <SelectItem key={week} value={week}>
                Week of {new Date(week).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {matches.map((match) => (
          <Card
            key={match._id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedMatch(match._id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">
                    {match.userName} ↔ {match.matchUserName}
                  </h3>
                  <Badge variant={match.mutualMatch ? "default" : "secondary"}>
                    {match.mutualMatch ? "Mutual Match! 🎉" : "In Progress"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Week of {new Date(match.weekOf).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Compatibility: {match.compatibilityScore}%</span>
                </div>

                <div className="mt-3 flex items-center gap-6">
                  <ResponseBadge
                    label={match.userName || "User"}
                    response={match.userResponse}
                  />
                  <ResponseBadge
                    label={match.matchUserName || "Match"}
                    response={match.matchResponse}
                  />
                </div>
              </div>

              <div className="text-right text-sm text-gray-500">
                <div>Sent: {new Date(match.sentAt).toLocaleDateString()}</div>
                <div>
                  Expires: {new Date(match.expiresAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {matches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No matches found for this week
          </div>
        )}
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <MatchDetailsModal
          matchId={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}

function ResponseBadge({
  label,
  response,
}: {
  label: string;
  response: string;
}) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    interested: "bg-green-100 text-green-800",
    passed: "bg-gray-100 text-gray-800",
  };

  const icons = {
    pending: "⏳",
    interested: "❤️",
    passed: "👋",
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-600">{label}:</span>
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[response as keyof typeof colors]
        }`}
      >
        {icons[response as keyof typeof icons]} {response}
      </span>
    </div>
  );
}
