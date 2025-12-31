"use client";

import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function AnalyticsPage() {
  const matchingMetrics = useQuery(api.admin.getMatchingAnalytics);
  const outcomeMetrics = useQuery(api.admin.getDateOutcomeMetrics);

  if (!matchingMetrics || !outcomeMetrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Analytics Deep Dive</h2>
        <p className="text-gray-600">
          Comprehensive metrics and success tracking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Performance */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Matching Performance</h3>
          <div className="space-y-4">
            <MetricRow
              label="This Week's Matches"
              value={matchingMetrics.totalMatches}
            />
            <MetricRow
              label="Response Rate"
              value={`${Math.round(matchingMetrics.responseRate)}%`}
            />
            <MetricRow
              label="Mutual Match Rate"
              value={`${Math.round(matchingMetrics.mutualMatchRate)}%`}
            />
          </div>
        </Card>

        {/* Date Outcomes */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Date Outcomes</h3>
          <div className="space-y-4">
            <MetricRow
              label="Dates Completed"
              value={outcomeMetrics.datesCompleted}
            />
            <MetricRow
              label="Avg Date Rating"
              value={`${outcomeMetrics.avgRating.toFixed(1)}★`}
            />
            <MetricRow
              label="Success Stories"
              value={outcomeMetrics.successStories}
            />
          </div>
        </Card>
      </div>

      {/* PRIMARY METRIC */}
      <Card className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">PRIMARY SUCCESS METRIC</h3>
        <div className="text-6xl font-bold text-primary my-4">
          {Math.round(outcomeMetrics.mutualInterestRate)}%
        </div>
        <p className="text-gray-700 text-lg">Mutual Interest Rate</p>
        <p className="text-sm text-gray-600 mt-2">
          (Both users want second date / Total dates completed)
        </p>
        {outcomeMetrics.mutualInterestRate >= 30 ? (
          <div className="mt-4 text-green-600 font-semibold">
            ✓ Above Target (30%)
          </div>
        ) : (
          <div className="mt-4 text-red-600 font-semibold">
            ⚠️ Below Target (30%)
          </div>
        )}
      </Card>
    </div>
  );
}

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}:</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}
