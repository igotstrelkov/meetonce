"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PastMatches } from "./PastMatches";
import { ThisWeek } from "./ThisWeek";

export default function DashboardPage() {
  return (
    <Tabs defaultValue="this-week" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="this-week">This Week</TabsTrigger>
        <TabsTrigger value="past-matches">Past Dates</TabsTrigger>
      </TabsList>

      <TabsContent value="this-week">
        <ThisWeek />
      </TabsContent>
      <TabsContent value="past-matches">
        <PastMatches />
      </TabsContent>
    </Tabs>
  );
}
