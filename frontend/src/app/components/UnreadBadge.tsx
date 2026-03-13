export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#ee0a24] text-white text-[11px] flex items-center justify-center">
      {count > 99 ? "99+" : count}
    </span>
  );
}
