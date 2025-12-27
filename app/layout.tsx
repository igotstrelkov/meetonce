
import ConvexClientProvider from '@/components/ConvexClientProvider';
import { NavBar } from '@/components/NavBar';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeetOnce | Tell me your type, I set up the date",
  description: "Revolutionizing online dating by replacing endless swiping with one exceptional, AI-curated match delivered weekly. The platform operates on a simple principle: quality over quantity. Users describe themselves and their ideal partner in natural language, and our AI finds their best possible match, explains why they're compatible, and helps them schedule their first date. One match. One week. That's it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
