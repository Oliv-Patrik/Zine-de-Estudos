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
      <rect
        x="30"
        y="40"
        width="220"
        height="125"
        rx="8"
        fill={isDark ? '#1C242C' : '#FFFFFF'}
        stroke={isDark ? '#2D3A47' : '#D1DCE7'}
        strokeWidth="2"
      />
      {/* Book spine middle fold */}
      <line
        x1="140"
        y1="40"
        x2="140"
        y2="165"
        stroke={isDark ? '#2D3A47' : '#D1DCE7'}
        strokeWidth="2"
        strokeDasharray="4 4"
      />

      {/* Ruled lines on left page */}
      <line x1="50" y1="65" x2="120" y2="65" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="85" x2="110" y2="85" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="105" x2="125" y2="105" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="125" x2="95" y2="125" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="2" strokeLinecap="round" />

      {/* Grid pattern on right page */}
      <rect x="155" y="60" width="75" height="75" rx="4" fill={isDark ? '#161E26' : '#F1F5F9'} />
      <line x1="173" y1="60" x2="173" y2="135" stroke={isDark ? '#253240' : '#E2E8F0'} strokeWidth="1" />
      <line x1="192" y1="60" x2="192" y2="135" stroke={isDark ? '#253240' : '#E2E8F0'} strokeWidth="1" />
      <line x1="211" y1="60" x2="211" y2="135" stroke={isDark ? '#253240' : '#E2E8F0'} strokeWidth="1" />
      <line x1="155" y1="78" x2="230" y2="78" stroke={isDark ? '#253240' : '#E2E8F0'} strokeWidth="1" />
      <line x1="155" y1="97" x2="230" y2="97" stroke={isDark ? '#253240' : '#E2E8F0'} strokeWidth="1" />
      <line x1="155" y1="116" x2="230" y2="116" stroke={isDark ? '#253240' : '#E2E8F0'} strokeWidth="1" />

      {/* Diagonal geometric pencil pointing down */}
      <g transform="translate(195, 30) rotate(42)">
        <rect x="0" y="0" width="6" height="60" rx="1" fill="#0E7490" />
        <polygon points="0,0 6,0 3,-12" fill="#E2E8F0" />
        <polygon points="2,-8 4,-8 3,-12" fill="#121518" />
      </g>

      {/* Cold geometric stars */}
      <path
        d="M 35 30 L 37 38 L 45 40 L 37 42 L 35 50 L 33 42 L 25 40 L 33 38 Z"
        fill="#4A7A96"
      />
      <path
        d="M 255 145 L 257 151 L 263 153 L 257 155 L 255 161 L 253 155 L 247 153 L 253 151 Z"
        fill="#0E7490"
      />
    </svg>
  );
};
