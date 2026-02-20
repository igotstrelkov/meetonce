"use client";

import { ArrowUp } from "lucide-react";
import { useRef, useState } from "react";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isExpired: boolean;
}

const MAX_CHARS = 1000;
const CHAR_WARNING_THRESHOLD = 800;

export function MessageInput({ onSendMessage, isExpired }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSend = content.trim().length > 0 && !isSending && !isOverLimit;

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    adjustHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const submit = async () => {
    if (!canSend) return;
    setIsSending(true);
    try {
      await onSendMessage(content.trim());
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch {
      // server error — leave content in place so user can retry
    } finally {
      setIsSending(false);
    }
  };

  if (isExpired) {
    return (
      <div className="border-t py-4 px-1 text-center">
        <p className="text-sm text-muted-foreground">This chat has ended.</p>
      </div>
    );
  }

  return (
    <div className="border-t py-3">
      <div className="flex items-end gap-2 bg-muted/50 rounded-2xl px-4 py-2.5">
        {/* Auto-resizing textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground leading-relaxed"
          style={{ height: "24px" }}
        />

        {/* Character warning */}
        {charCount >= CHAR_WARNING_THRESHOLD && (
          <span
            className={`text-xs shrink-0 tabular-nums ${
              isOverLimit
                ? "text-red-500 font-semibold"
                : "text-muted-foreground"
            }`}
          >
            {MAX_CHARS - charCount}
          </span>
        )}

        {/* Send button */}
        <button
          onClick={() => void submit()}
          disabled={!canSend}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            canSend
              ? "bg-foreground text-background hover:opacity-80"
              : "bg-muted-foreground/20 text-muted-foreground"
          }`}
          aria-label="Send message"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

      {/* <p className="text-[10px] text-muted-foreground text-center mt-2">
        Enter to send · Shift+Enter for new line
      </p> */}
    </div>
  );
}
