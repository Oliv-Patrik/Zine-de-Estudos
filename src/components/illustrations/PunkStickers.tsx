import React from 'react';

export const MaskingTapeStrip: React.FC<{
  className?: string;
  rotation?: number;
  width?: string;
}> = ({ className = '', rotation = -4, width = 'w-24' }) => {
  return (
    <div
      className={`h-4.5 bg-[#F5EBCB]/85 border-l-2 border-r-2 border-dashed border-[#D7C8A5] shadow-xs select-none pointer-events-none ${width} ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    />
  );
};

export const SafetyPinDecal: React.FC<{
  size?: number;
  className?: string;
  rotation?: number;
}> = ({ size = 28, className = '', rotation = 0 }) => {
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
        d="M 6 12 L 26 12 C 29 12, 29 20, 26 20 L 12 20 C 6 20, 6 14, 10 12"
        stroke="#E4E4E7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="22" y="10" width="8" height="6" rx="1.5" fill="#A1A1AA" stroke="#000000" strokeWidth="1" />
      <circle cx="8" cy="16" r="3" stroke="#000000" strokeWidth="1.5" fill="#D4D4D8" />
    </svg>
  );
};

export const BandAidDecal: React.FC<{
  size?: number;
  className?: string;
  rotation?: number;
}> = ({ size = 32, className = '', rotation = 12 }) => {
  return (
    <svg
      width={size}
      height={size * 0.4}
      viewBox="0 0 40 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="38" height="14" rx="4" fill="#D7C8A5" stroke="#000000" strokeWidth="1.5" />
      <rect x="12" y="2" width="16" height="12" fill="#F5EBCB" stroke="#000000" strokeWidth="1" />
      <line x1="20" y1="5" x2="20" y2="11" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      <line x1="17" y1="8" x2="23" y2="8" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export const FlameBadge: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 20, className = '' }) => {
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
        d="M 12 2 C 12 6, 17 8, 17 14 C 17 18.5, 14 22, 12 22 C 10 22, 7 18.5, 7 14 C 7 10, 10 7, 12 2 Z"
        fill="#DC2626"
        stroke="#000000"
        strokeWidth="1.5"
      />
      <path
        d="M 12 7 C 12 10, 15 12, 15 15.5 C 15 18, 13.5 20, 12 20 C 10.5 20, 9 18, 9 15.5 C 9 13, 11 11, 12 7 Z"
        fill="#F59E0B"
      />
      <circle cx="12" cy="17" r="2.5" fill="#FEF08A" />
    </svg>
  );
};

export const PunkSticker: React.FC<{
  text: string;
  variant?: 'red' | 'black' | 'yellow' | 'white';
  rotation?: number;
  className?: string;
  icon?: React.ReactNode;
}> = ({ text, variant = 'red', rotation = -3, className = '', icon }) => {
  const variantStyles = {
    red: 'bg-[#DC2626] text-white border-2 border-black shadow-[3px_3px_0px_#000000]',
    black: 'bg-[#000000] text-[#F5F2EB] border-2 border-[#DC2626] shadow-[3px_3px_0px_#DC2626]',
    yellow: 'bg-[#F59E0B] text-black border-2 border-black shadow-[3px_3px_0px_#000000]',
    white: 'bg-[#FFFFFF] text-black border-2 border-black shadow-[3px_3px_0px_#000000]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider font-stencil select-none transition-transform duration-100 hover:scale-105 ${variantStyles[variant]} ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {icon}
      <span>{text}</span>
    </span>
  );
};

export const RansomWord: React.FC<{
  word: string;
  className?: string;
}> = ({ word, className = '' }) => {
  const letters = word.split('');
  const colors = [
    { bg: 'bg-black', text: 'text-white' },
    { bg: 'bg-[#DC2626]', text: 'text-white' },
    { bg: 'bg-[#F5EBCB]', text: 'text-black' },
    { bg: 'bg-[#D97706]', text: 'text-black' },
    { bg: 'bg-black', text: 'text-[#DC2626]' },
  ];
  const rotations = [-4, 3, -2, 5, -3, 2, -5, 4];

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {letters.map((char, idx) => {
        const color = colors[idx % colors.length];
        const rot = rotations[idx % rotations.length];

        return (
          <span
            key={idx}
            className={`inline-block px-1.5 py-0.5 font-stencil font-black text-2xl sm:text-3xl border border-black shadow-[2px_2px_0px_#000000] ${color.bg} ${color.text}`}
            style={{ transform: `rotate(${rot}deg)` }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};
