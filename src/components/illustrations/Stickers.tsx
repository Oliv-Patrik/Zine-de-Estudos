import React from 'react';

interface StickerProps {
  text: string;
  variant?: 'teal' | 'slate' | 'graphite' | 'ice' | 'white';
  rotation?: number; // degrees, e.g. -4, 3, -6
  className?: string;
  icon?: React.ReactNode;
}

export const StickerTag: React.FC<StickerProps> = ({
  text,
  variant = 'teal',
  rotation = -3,
  className = '',
  icon,
}) => {
  const variantStyles = {
    teal: 'bg-[#0E7490] text-white border border-[#155E75]/40 shadow-sm',
    slate: 'bg-[#2A3441] text-[#E2E8F0] border border-[#3E4D5D] shadow-sm',
    graphite: 'bg-[#161B22] text-[#F1F5F9] border border-[#30363D] shadow-sm',
    ice: 'bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] shadow-sm',
    white: 'bg-white text-[#121518] border border-[#E2E8F0] shadow-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider font-display select-none transition-transform duration-200 hover:scale-105 ${variantStyles[variant]} ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {icon}
      <span>{text}</span>
    </span>
  );
};

export const StarburstStar: React.FC<{
  size?: number;
  color?: string;
  className?: string;
  rotation?: number;
}> = ({ size = 24, color = '#0E7490', className = '', rotation = 0 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <path
        d="M 16 0 L 19 11 L 30 11 L 21 18 L 24 29 L 16 22 L 8 29 L 11 18 L 2 11 L 13 11 Z"
        fill={color}
      />
    </svg>
  );
};

export const SparkleDecal: React.FC<{
  size?: number;
  color?: string;
  className?: string;
}> = ({ size = 20, color = '#38BDF8', className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M 12 0 C 12 7, 17 12, 24 12 C 17 12, 12 17, 12 24 C 12 17, 7 12, 0 12 C 7 12, 12 7, 12 0 Z"
        fill={color}
      />
    </svg>
  );
};
