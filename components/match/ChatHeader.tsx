"use client";

import { ChevronLeft } from "lucide-react";
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
        <ChevronLeft size={35} onClick={() => router.back()} />
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
