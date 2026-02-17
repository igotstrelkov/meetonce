"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useAction } from "convex/react";
import { Bell, BellOff } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function NavBar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const sendFeedback = useAction(api.emails.sendUserFeedback);
  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    subscribe: pushSubscribe,
    unsubscribe: pushUnsubscribe,
  } = usePushNotifications();

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await sendFeedback({
        feedback: feedback.trim(),
        userEmail: user?.primaryEmailAddress?.emailAddress,
      });
      setFeedback("");
      setOpen(false);
    } catch (err) {
      setError("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header
      className={`flex items-center justify-between px-6 py-4 ${
        isLanding
          ? "absolute top-0 left-0 right-0 z-50 bg-transparent"
          : "bg-background/80 backdrop-blur-md border-b border-border/40 mb-5"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`text-xl font-bold ${isLanding ? "text-white" : ""}`}>
          MeetOnce
        </span>
      </div>
      <nav className="flex items-center gap-6">
        <SignedOut>
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <button
              className={`text-sm font-medium transition-colors ${
                isLanding
                  ? "text-white/70 hover:text-white"
                  : "hover:text-primary"
              }`}
            >
              Log In
            </button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button
              variant={isLanding ? "secondary" : "default"}
              className="rounded-full px-6"
            >
              Sign Up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Feedback
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send Feedback</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !feedback.trim()}
                  className="w-full"
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {pushSupported && (
            <button
              onClick={() =>
                pushSubscribed ? pushUnsubscribe() : pushSubscribe()
              }
              disabled={pushLoading}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title={
                pushSubscribed
                  ? "Disable push notifications"
                  : "Enable push notifications"
              }
            >
              {pushSubscribed ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </button>
          )}
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}
