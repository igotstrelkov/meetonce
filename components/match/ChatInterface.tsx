"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

interface ChatInterfaceProps {
  matchId: Id<"weeklyMatches">;
  matchUser: {
    _id: Id<"users">;
    name: string;
    photoUrl: string | null;
  };
  currentUserId: Id<"users">;
  isExpired: boolean;
  venueName: string;
}

export function ChatInterface({
  matchId,
  matchUser,
  currentUserId,
  isExpired,
  venueName,
}: ChatInterfaceProps) {
  const messages = useQuery(api.chat.getMessages, { matchId }) ?? [];
  const unreadCount = useQuery(api.chat.getUnreadCount, { matchId }) ?? 0;

  const sendMessage = useMutation(api.chat.sendMessage);
  const markAsRead = useMutation(api.chat.markMessagesAsRead);

  useEffect(() => {
    if (unreadCount > 0) {
      markAsRead({ matchId });
    }
  }, [unreadCount, matchId, markAsRead]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      await sendMessage({ matchId, content });
    },
    [sendMessage, matchId],
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 80px)" }}>
      <ChatHeader
        name={matchUser.name}
        photoUrl={matchUser.photoUrl}
        venueName={venueName}
        isExpired={isExpired}
      />

      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} currentUserId={currentUserId} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} isExpired={isExpired} />
    </div>
  );
}
