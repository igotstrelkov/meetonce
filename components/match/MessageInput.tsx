"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useState } from "react";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled: boolean;
  isExpired: boolean;
}

export function MessageInput({
  onSendMessage,
  disabled,
  isExpired,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSending || disabled || isExpired) {
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(content);
      setContent("");
    } catch (error) {
      console.error("Failed to send message:", error);
      // Error will be shown by parent component
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const charCount = content.length;
  const maxChars = 1000;
  const isOverLimit = charCount > maxChars;

  return (
    <form onSubmit={handleSubmit} className="border-t pt-4">
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isExpired ? "Chat has expired" : "Type a message..."}
          disabled={disabled || isExpired || isSending}
          className={`min-h-[80px] resize-none ${
            isOverLimit ? "border-primary" : ""
          }`}
        />

        <div className="flex items-center justify-between">
          <span
            className={`text-sm ${
              isOverLimit ? "text-primary font-semibold" : "text-gray-500"
            }`}
          >
            {charCount}/{maxChars}
          </span>

          <Button
            type="submit"
            disabled={
              !content.trim() ||
              isSending ||
              disabled ||
              isExpired ||
              isOverLimit
            }
            className="gap-2"
          >
            {isSending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
