import { memo } from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = memo(function Avatar({ name, size = 'md' }: AvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  // Deterministic color based on name length/chars
  const colorIndex = name ? name.charCodeAt(0) % 5 : 0;
  const colors = [
    'bg-[#53A1F4]',
    'bg-[#E57373]',
    'bg-[#81C784]',
    'bg-[#FFB74D]',
    'bg-[#BA68C8]',
  ];

  const sizeClasses = {
    sm: 'w-10 h-10 text-[16px]',
    md: 'w-12 h-12 text-[20px]',
    lg: 'w-[4.5rem] h-[4.5rem] text-[28px]', // ~72px
  };

  return (
    <div
      className={`rounded-[14px] flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0 ${
        colors[colorIndex]
      } ${sizeClasses[size]}`}
    >
      {initial}
    </div>
  );
});
