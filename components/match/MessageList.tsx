"use client";

import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">
            No messages yet
          </p>
          <p className="text-xs text-muted-foreground">
            Say hi to get things started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-0.5">
      {messages.map((message, index) => {
        const isMe = message.senderId === currentUserId;
        const showDate =
          index === 0 ||
          !isSameDay(messages[index - 1].sentAt, message.sentAt);
        const isFirstInGroup =
          index === 0 || messages[index - 1].senderId !== message.senderId;
        const isLastInGroup =
          index === messages.length - 1 ||
          messages[index + 1].senderId !== message.senderId;

        return (
          <div key={message._id}>
            {/* Date separator */}
            {showDate && (
              <div className="flex items-center justify-center my-4">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {formatDate(message.sentAt)}
                </span>
              </div>
            )}

            {/* Row: avatar + bubble */}
            <div
              className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} ${
                isFirstInGroup ? "mt-3" : "mt-0.5"
              }`}
            >
              {/* Partner avatar — left side, only on last in group */}
              {!isMe && (
                <div className="w-7 h-7 shrink-0">
                  {isLastInGroup && (
                    <PartnerAvatar
                      photoUrl={message.senderPhotoUrl}
                      name={message.senderName}
                    />
                  )}
                </div>
              )}

              {/* Bubble */}
              <div className={`max-w-[72%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`px-3.5 py-2.5 ${
                    isMe
                      ? "bg-foreground text-background rounded-2xl rounded-tr-sm"
                      : "bg-muted text-foreground rounded-2xl rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>
                </div>

                {/* Timestamp + read receipt — only on last in group */}
                {isLastInGroup && (
                  <div
                    className={`flex items-center gap-1 mt-1 px-0.5 ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(message.sentAt)}
                    </span>
                    {isMe && (
                      message.readAt ? (
                        <CheckCheck className="w-3 h-3 text-primary" />
                      ) : (
                        <Check className="w-3 h-3 text-muted-foreground" />
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}

function PartnerAvatar({
  photoUrl,
  name,
}: {
  photoUrl: string | null;
  name: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <div className="relative w-7 h-7">
      <Image
        src={photoUrl || "/avatar.png"}
        alt={name}
        fill
        className={`object-cover rounded-full transition-opacity duration-200 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date.getTime(), today.getTime())) return "Today";
  if (isSameDay(date.getTime(), yesterday.getTime())) return "Yesterday";
  return format(date, "MMM d, yyyy");
}

function formatTime(timestamp: number): string {
  return format(new Date(timestamp), "h:mm a");
}

function isSameDay(t1: number, t2: number): boolean {
  const a = new Date(t1);
  const b = new Date(t2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
