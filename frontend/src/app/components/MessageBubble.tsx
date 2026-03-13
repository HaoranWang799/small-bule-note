import { memo } from 'react';

interface MessageBubbleProps {
  text: string;
  isMine: boolean;
  timestamp: string;
}

export const MessageBubble = memo(function MessageBubble({
  text,
  isMine,
  timestamp,
}: MessageBubbleProps) {
  const timeString = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex w-full mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl relative shadow-sm break-words ${
          isMine
            ? 'bg-[#07C160] text-white rounded-tr-sm'
            : 'bg-[#FFFFFF] text-[#1F1F1F] rounded-tl-sm border border-[#F0F0F0]'
        }`}
      >
        <p className="text-[16px] leading-relaxed whitespace-pre-wrap">{text}</p>
        <span
          className={`text-[11px] block text-right mt-1 ${
            isMine ? 'text-white/80' : 'text-[#8A8A8A]'
          }`}
        >
          {timeString}
        </span>
      </div>
    </div>
  );
});
