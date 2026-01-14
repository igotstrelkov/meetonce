"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function AdminOverviewPage() {
  const metrics = useQuery(api.admin.getPlatformMetrics);

  console.log(metrics);

  if (!metrics) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Platform Overview</h2>
        <p className="text-gray-600">Real-time platform metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Approved Users"
          value={metrics.approvedUsers}
          subtitle="Ready to match"
        />

        <MetricCard
          title="Pending Users"
          value={metrics.pendingPhotos}
          subtitle="Awaiting review"
          urgent={metrics.pendingPhotos > 50}
        />

        <MetricCard
          title="Male Users"
          value={metrics.maleUsers}
          subtitle="All male users"
        />

        <MetricCard
          title="Female Users"
          value={metrics.femaleUsers}
          subtitle="All female users"
        />
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Approval Rate</h3>
        <div className="flex items-end space-x-2">
          <div className="text-4xl font-bold text-primary">
            {metrics.approvalRate}%
          </div>
          <div className="text-gray-600 mb-1">of users approved</div>
        </div>
      </Card>
    </div>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
  urgent = false,
}: {
  title: string;
  value: number;
  subtitle?: string;
  urgent?: boolean;
}) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <p className="text-sm text-gray-500">{subtitle}</p>
      {urgent && (
        <p className="text-sm text-red-600 mt-2 font-semibold">
          ⚠️ Needs attention
        </p>
      )}
    </Card>
  );
}
