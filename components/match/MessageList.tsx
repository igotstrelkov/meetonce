"use client";

import { format } from "date-fns";
import { useEffect, useRef } from "react";

interface Message {
  _id: string;
  senderId: string;
  content: string;
  sentAt: number;
  readAt?: number;
  senderName: string;
  senderPhotoUrl: string | null;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm py-12">
        <div className="text-center">
          <p className="mb-2 text-lg font-bold">No messages yet</p>
          <p className="text-xs">Send a message to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto py-4 space-y-4">
      {/* Message list */}
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === currentUserId;
        const showDate =
          index === 0 || !isSameDay(messages[index - 1].sentAt, message.sentAt);

        return (
          <div key={message._id}>
            {/* Date separator */}
            {showDate && (
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatDate(message.sentAt)}
                </div>
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  isCurrentUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                <div
                  className={`text-xs text-gray-500 mt-1 px-1 ${
                    isCurrentUser ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(message.sentAt)}
                  {isCurrentUser && message.readAt && (
                    <span className="ml-1">• Read</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}

// Helper functions
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date.getTime(), today.getTime())) {
    return "Today";
  } else if (isSameDay(date.getTime(), yesterday.getTime())) {
    return "Yesterday";
  } else {
    return format(date, "MMM d, yyyy");
  }
}

function formatTime(timestamp: number): string {
  return format(new Date(timestamp), "h:mm a");
}

function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
