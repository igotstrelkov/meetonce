"use client";

import { LandingPage } from "@/components/LandingPage";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    // If authenticated with Clerk, redirect to dashboard
    if (user) {
      router.push("/dashboard");
      return;
    }
  }, [user]);

  return <LandingPage />;
}
