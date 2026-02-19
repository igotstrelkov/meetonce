"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useEffect, useRef } from "react";

/**
 * Silently requests push notification permission on first app open.
 * - Skips if browser doesn't support push (non-PWA, old browser)
 * - Skips if the user has already subscribed
 * - Skips if permission was previously denied (respects user decision)
 * - Fires once after a 1.5s delay so the page has settled before the prompt appears
 * Renders nothing.
 */
export function AutoSubscribeNotifications() {
  const { isSupported, isSubscribed, subscribe } = usePushNotifications();
  const hasFired = useRef(false);

  useEffect(() => {
    // Wait until subscription status has loaded from Convex (not undefined)
    if (isSubscribed === undefined) return;
    // Already subscribed — nothing to do
    if (isSubscribed) return;
    // Browser doesn't support push
    if (!isSupported) return;
    // User previously denied — don't prompt again
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "denied"
    )
      return;
    // Guard against double-firing in strict mode
    if (hasFired.current) return;
    hasFired.current = true;

    const timer = setTimeout(() => {
      subscribe();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, subscribe]);

  return null;
}
