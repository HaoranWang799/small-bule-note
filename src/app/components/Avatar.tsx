interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-11 h-11",
  lg: "w-20 h-20",
};

const textSizeMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-2xl",
};

const colors = [
  "bg-[#07C160]",
  "bg-[#1989fa]",
  "bg-[#ee0a24]",
  "bg-[#ff976a]",
  "bg-[#7232dd]",
  "bg-[#f2826a]",
  "bg-[#2db7f5]",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, size = "md", online }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`${sizeMap[size]} ${getColor(name)} rounded-lg flex items-center justify-center text-white ${textSizeMap[size]}`}
      >
        {initial}
      </div>
      {online !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            online ? "bg-[#2ECC71]" : "bg-[#BDC3C7]"
          }`}
        />
      )}
    </div>
  );
}
