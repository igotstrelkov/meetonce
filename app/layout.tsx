import ConvexClientProvider from "@/components/ConvexClientProvider";
import { NavBar } from "@/components/NavBar";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "MeetOnce | We Find Them. You Date Them.",
  description:
    "The first curated dating app made specifically for Dublin singles. 1 quality match per week. Real dates, not endless swiping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mb-8`}
      >
        <ClerkProvider afterSignOutUrl="/">
          <ConvexClientProvider>
            <NavBar />
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
