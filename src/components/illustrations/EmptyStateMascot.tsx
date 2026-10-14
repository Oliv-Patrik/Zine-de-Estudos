import React from 'react';

export const EmptyStateMascot: React.FC<{ className?: string; theme?: 'dark' | 'light' }> = ({
  className = 'w-48 h-auto',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <svg
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Torn Flyer pasted on wall with jagged bottom */}
      <path
        d="M 40 30 L 240 25 L 245 160 L 220 150 L 190 165 L 160 152 L 120 168 L 80 150 L 35 165 Z"
        fill={isDark ? '#181C22' : '#FFFFFF'}
        stroke="#000000"
        strokeWidth="3.5"
      />

      {/* Tape on top corners */}
      <polygon points="30,15 80,18 76,34 26,31" fill="#F5EBCB" opacity="0.9" stroke="#000000" strokeWidth="1.5" />
      <polygon points="200,12 250,16 246,32 196,28" fill="#F5EBCB" opacity="0.9" stroke="#000000" strokeWidth="1.5" />

      {/* Red cross stamp */}
      <line x1="60" y1="55" x2="100" y2="95" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
      <line x1="100" y1="55" x2="60" y2="95" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />

      {/* Stencil text: EM BRANCO */}
      <text
        x="170"
        y="75"
        textAnchor="middle"
        fontFamily="Bebas Neue, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill={isDark ? '#F5F2EB' : '#000000'}
        letterSpacing="2"
      >
        EM BRANCO
      </text>

      {/* Marker text: VAI DEIXAR? */}
      <text
        x="170"
        y="110"
        textAnchor="middle"
        fontFamily="Permanent Marker, cursive"
        fontSize="18"
        fill="#DC2626"
      >
        VAI DEIXAR?
      </text>

      {/* Safety Pin pinned to paper */}
      <g transform="translate(190, 120) rotate(-25)">
        <path d="M 5 8 L 45 8 C 52 8, 52 18, 45 18 L 15 18 C 5 18, 5 10, 10 8" stroke="#D4D4D8" strokeWidth="2.5" fill="none" />
        <rect x="40" y="5" width="12" height="8" rx="2" fill="#A1A1AA" stroke="#000000" strokeWidth="1" />
      </g>
    </svg>
  );
};
