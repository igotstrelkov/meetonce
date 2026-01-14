"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface ChatHeaderProps {
  matchUserName: string;
  expiresAt: number;
  unreadCount: number;
}

export function ChatHeader({
  matchUserName,
  expiresAt,
  unreadCount,
}: ChatHeaderProps) {
  const router = useRouter();

  // Check if chat is expired
  const isExpired = useMemo(() => Date.now() > expiresAt, [expiresAt]);

  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <div className="flex items-center gap-3">
        <ChevronLeft size={35} onClick={() => router.push("/dashboard")} />
        <div>
          <h3 className="font-semibold text-gray-900">
            {matchUserName.split(" ")[0]}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>
              {isExpired
                ? "Chat Has Expired"
                : "Chat is active until Friday at 11:59 PM"}
            </span>
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
