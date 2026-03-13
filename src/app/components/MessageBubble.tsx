import { Check, CheckCheck } from "lucide-react";
import type { Message } from "../store";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-lg ${
          isMine
            ? "bg-[#95EC69] text-[#111] rounded-tr-sm"
            : "bg-white text-[#111] rounded-tl-sm"
        }`}
      >
        <p className="text-[15px] break-words">{message.content}</p>
        <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
          <span className="text-[11px] text-[#999]">{message.timestamp}</span>
          {isMine && (
            <span className="text-[11px]">
              {message.status === "read" ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#07C160]" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#999]" />
              ) : (
                <Check className="w-3.5 h-3.5 text-[#999]" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
