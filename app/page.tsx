"use client";

import { LandingPage } from "@/components/landing-page";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Page() {

return <>
        <AuthLoading>
          <div className="flex h-screen items-center justify-center">Loading...</div>
        </AuthLoading>
        <Authenticated>
         <Content />
        </Authenticated>
        <Unauthenticated>
          <LandingPage />
        </Unauthenticated>
      </>;
}

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser);
  return <div className="flex h-screen items-center justify-center">Authenticated content: {messages?.length}</div>;
}