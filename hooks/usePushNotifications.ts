"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const isSubscribed = useQuery(api.notifications.getMySubscriptionStatus);
  const saveSubscription = useMutation(api.notifications.saveSubscription);
  const removeSubscription = useMutation(api.notifications.removeSubscription);

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const subscribe = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      const vapidKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      );
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey.buffer as ArrayBuffer,
      });

      const json = subscription.toJSON();

      await saveSubscription({
        endpoint: subscription.endpoint,
        p256dh: json.keys!.p256dh!,
        auth: json.keys!.auth!,
      });
    } catch (err) {
      console.error("Failed to subscribe to push notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, saveSubscription]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await removeSubscription({ endpoint: subscription.endpoint });
      }
    } catch (err) {
      console.error("Failed to unsubscribe from push notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, removeSubscription]);

  return {
    isSupported,
    isSubscribed: isSubscribed ?? false,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
