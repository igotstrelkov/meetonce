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
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";

interface MatchDrawerProps {
  match: any;
  matchUser: any;
}

export const MatchDrawer = ({ match, matchUser }: MatchDrawerProps) => {
  return (
    <Drawer>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="text-4xl">😉</div>
            <h3 className="text-2xl font-bold">Your Weekly Match</h3>
            <p className="text-muted-foreground">Expires Friday at 11:59 PM</p>
          </div>

          <Separator />
          <DrawerTrigger asChild>
            <Button size="lg" className="w-full gap-2">
              <User className="w-5 h-5" />
              View Match
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
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-md mx-auto space-y-6">
            <MatchCard match={match} matchUser={matchUser} />
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
