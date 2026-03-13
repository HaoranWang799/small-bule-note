import { memo } from 'react';

interface UnreadBadgeProps {
  count: number;
}

export const UnreadBadge = memo(function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count === 0) return null;
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div className="bg-[#FF3B30] text-white text-[11px] font-bold px-[5px] min-w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 border-[#FFFFFF] shadow-sm">
      {displayCount}
    </div>
  );
});
