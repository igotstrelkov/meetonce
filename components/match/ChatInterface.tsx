"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { ChatExpiredBanner } from "./ChatExpiredBanner";
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
  expiresAt: number;
}

export function ChatInterface({
  matchId,
  matchUser,
  currentUserId,
  expiresAt,
}: ChatInterfaceProps) {
  // Query messages with real-time updates
  const messages = useQuery(api.chat.getMessages, { matchId }) || [];

  // Query unread count
  const unreadCount = useQuery(api.chat.getUnreadCount, { matchId }) || 0;

  // Mutations
  const sendMessage = useMutation(api.chat.sendMessage);
  const markAsRead = useMutation(api.chat.markMessagesAsRead);

  // Mark messages as read when viewing chat
  useEffect(() => {
    if (unreadCount > 0) {
      markAsRead({ matchId });
    }
  }, [unreadCount, matchId, markAsRead]);

  // Check if chat is expired
  const isExpired = Date.now() > expiresAt;

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage({ matchId, content });
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {/* Expired banner */}
      {isExpired && <ChatExpiredBanner matchId={matchId} />}

      {/* Chat card */}
      <>
        <div
          className="flex flex-col"
          style={{ height: "calc(100dvh - 120px)" }}
        >
          {/* Header */}
          <ChatHeader
            matchUserName={matchUser.name}
            matchUserPhotoUrl={matchUser.photoUrl}
            expiresAt={expiresAt}
            unreadCount={unreadCount}
          />

          {/* Message list */}
          <div className="flex-1 overflow-hidden py-4">
            <MessageList messages={messages} currentUserId={currentUserId} />
          </div>

          {/* Input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={false}
            isExpired={isExpired}
          />
        </div>
      </>
    </div>
  );
}
