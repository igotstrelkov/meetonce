"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  matchUserName: string;
  matchUserPhotoUrl: string | null;
  expiresAt: number;
  unreadCount: number;
}

export function ChatHeader({
  matchUserName,
  matchUserPhotoUrl,
  expiresAt,
  unreadCount,
}: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        {matchUserPhotoUrl ? (
          <Image
            src={matchUserPhotoUrl}
            alt={matchUserName}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 text-lg font-medium">
              {matchUserName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{matchUserName}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>Expires Friday at 11:59 PM</span>
          </div>
        </div>
      </div>

      {unreadCount > 0 && (
        <div className="bg-orange-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {unreadCount} new
        </div>
      )}
    </div>
  );
}
