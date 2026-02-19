"use client";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ChatHeaderProps {
  name: string;
  photoUrl: string | null;
  venueName: string;
  isExpired: boolean;
}

export function ChatHeader({
  name,
  photoUrl,
  venueName,
  isExpired,
}: ChatHeaderProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="flex items-center gap-3 pb-3 border-b">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors shrink-0"
        aria-label="Back to dashboard"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Avatar */}
      <div className="relative w-9 h-9 shrink-0">
        <Image
          src={photoUrl || "/avatar.png"}
          alt={name}
          fill
          className={`object-cover rounded-full transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Name + venue */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground leading-tight">{name}</p>
        <p
          className={`text-xs truncate flex items-center gap-1 ${
            isExpired ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          {isExpired ? (
            "Chat has ended"
          ) : (
            <>
              {/* <MapPin className="w-3 h-3 shrink-0" /> */}
              {venueName} at 14:00
            </>
          )}
        </p>
      </div>
    </div>
  );
}
