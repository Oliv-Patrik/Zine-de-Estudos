import React from 'react';

export const FocusMascot: React.FC<{ className?: string; theme?: 'dark' | 'light' }> = ({
  className = 'w-48 h-auto',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <svg
      viewBox="0 0 260 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Cassette Tape Body (DIY punk mixtape) */}
      <rect x="25" y="30" width="210" height="135" rx="8" fill={isDark ? '#15181D' : '#FFFFFF'} stroke="#000000" strokeWidth="4" />
      {/* Tape Label Sticker (White torn label) */}
      <rect x="40" y="45" width="180" height="70" fill={isDark ? '#F5F2EB' : '#F5EBCB'} stroke="#000000" strokeWidth="2.5" />
      <polygon points="40,45 60,45 40,65" fill="#DC2626" />

      {/* Hand-written text on cassette */}
      <text
        x="130"
        y="68"
        textAnchor="middle"
        fontFamily="Permanent Marker, cursive"
        fontSize="16"
        fill="#000000"
      >
        FOCO PUNK #01
      </text>

      {/* Cassette Reels Window */}
      <rect x="65" y="80" width="130" height="30" rx="4" fill="#000000" />
      {/* Left Reel with sprockets */}
      <circle cx="95" cy="95" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
      <circle cx="95" cy="95" r="5" fill="#000000" />
      {/* Right Reel */}
      <circle cx="165" cy="95" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
      <circle cx="165" cy="95" r="5" fill="#000000" />
      <line x1="107" y1="95" x2="153" y2="95" stroke="#DC2626" strokeWidth="3" />

      {/* Cassette Screws */}
      <circle cx="34" cy="38" r="2.5" fill="#A1A1AA" />
      <circle cx="226" cy="38" r="2.5" fill="#A1A1AA" />
      <circle cx="34" cy="156" r="2.5" fill="#A1A1AA" />
      <circle cx="226" cy="156" r="2.5" fill="#A1A1AA" />

      {/* Masking tape on corner */}
      <polygon points="190,20 230,22 225,38 185,36" fill="#F5EBCB" opacity="0.9" stroke="#000000" strokeWidth="1" />

      {/* Lightning scribble */}
      <polygon points="20,135 35,135 25,150 40,150 15,180 23,160 12,160" fill="#DC2626" stroke="#000000" strokeWidth="2" />
    </svg>
  );
};
