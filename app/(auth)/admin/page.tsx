"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";

export default function AdminOverviewPage() {
  const metrics = useQuery(api.admin.getPlatformMetrics);
  const waitlistedUsers = useQuery(api.admin.getWaitlistedUsers);
  const approveUser = useMutation(api.admin.approveUser);

  if (!metrics)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );

  const handleApprove = async (userId: Id<"users">) => {
    await approveUser({ userId });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Platform Overview</h2>
        <p className="text-gray-600">Real-time platform metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Approved Users"
          value={metrics.approvedUsers}
          subtitle={`${metrics.femaleUsers} women : ${metrics.maleUsers} men`}
        />

        <MetricCard
          title="Waitlisted Users"
          value={metrics.waitlistedUsers}
          subtitle="Awaiting activation"
          highlight={metrics.waitlistedUsers > 0}
        />

        <MetricCard
          title="Pending Users"
          value={metrics.pendingUsers}
          subtitle="Awaiting review"
          urgent={metrics.pendingUsers > 50}
        />

        {/* <MetricCard
          title="Male Users"
          value={metrics.maleUsers}
          subtitle="All male users"
        />

        <MetricCard
          title="Female Users"
          value={metrics.femaleUsers}
          subtitle="All female users"
        /> */}
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Women : Men</h3>
          <div className="flex items-end space-x-2">
            <div className="text-4xl font-bold text-primary">
              {metrics.femaleUsers} : {metrics.maleUsers}
            </div>
            <div className="text-gray-600 mb-1">women to men ratio</div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Approval Rate</h3>
          <div className="flex items-end space-x-2">
            <div className="text-4xl font-bold text-primary">
              {metrics.approvalRate}%
            </div>
            <div className="text-gray-600 mb-1">of users approved</div>
          </div>
        </Card>
      </div> */}

      {/* Waitlisted Users Section */}
      {waitlistedUsers && waitlistedUsers.length > 0 && (
        <>
          <h3 className="text-xl font-bold mb-4">
            Waitlisted Users ({waitlistedUsers.length})
          </h3>
          <div className="space-y-4">
            {waitlistedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {user.photoUrl ? (
                    <Image
                      src={user.photoUrl}
                      alt={user.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                      width={120}
                      height={120}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {user.firstName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">
                      {user.firstName} {user.lastName}, {user.age}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      {user.jobTitle} · {user.gender} · Co {user.location}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleApprove(user._id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
  urgent = false,
  highlight = false,
}: {
  title: string;
  value: number;
  subtitle?: string;
  urgent?: boolean;
  highlight?: boolean;
}) {
  return (
    <Card className={`p-4 ${highlight ? "border-amber-300 bg-amber-50" : ""}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <p className="text-sm text-gray-500">{subtitle}</p>
      {urgent && (
        <p className="text-sm text-red-600 mt-2 font-semibold">
          Needs attention
        </p>
      )}
    </Card>
  );
}
