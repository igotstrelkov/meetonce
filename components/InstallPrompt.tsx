"use client";

import { Plus, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "meetonce-install-dismissed";

export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const dismissed = localStorage.getItem(DISMISSED_KEY);

    if (isIOS && !isStandalone && !dismissed) {
      setShow(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-1 inset-x-0 z-50 p-4 pb-[env(safe-area-inset-bottom,16px)]">
      <div className="relative mx-auto max-w-md rounded-2xl border bg-card p-4 shadow-lg">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="pr-6 text-sm font-medium">Install MeetOnce</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap <Share className="inline h-4 w-4 -translate-y-px text-primary" />{" "}
          Share, then{" "}
          <Plus className="inline h-4 w-4 -translate-y-px text-primary" />{" "}
          <span className="font-medium">Add to Home Screen</span>
        </p>
        {/* <Button variant="ghost" size="sm" className="mt-2" onClick={dismiss}>
          Don&apos;t show again
        </Button> */}
      </div>
    </div>
  );
}
