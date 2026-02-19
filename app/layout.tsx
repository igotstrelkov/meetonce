import { AutoSubscribeNotifications } from "@/components/AutoSubscribeNotifications";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NavBar } from "@/components/NavBar";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeetOnce | We banned ghosting.",
  description:
    "The first curated dating app made specifically for Dublin singles. 1 quality match per week. Real dates, not endless swiping.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MeetOnce",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <meta name="theme-color" content="#d4542c" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mb-8`}
      >
        <ClerkProvider afterSignOutUrl="/">
          <ConvexClientProvider>
            <NavBar />
            <ServiceWorkerRegistration />
            <InstallPrompt />
            <SignedIn>
              <AutoSubscribeNotifications />
            </SignedIn>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
