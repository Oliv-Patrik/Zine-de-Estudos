import React from 'react';

export const FocusMascot: React.FC<{ className?: string; theme?: 'dark' | 'light' }> = ({
  className = 'w-40 h-auto',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer subtle orbital ring */}
      <circle
        cx="120"
        cy="120"
        r="95"
        stroke={isDark ? '#263340' : '#D1DCE7'}
        strokeWidth="1.5"
        strokeDasharray="6 6"
      />

      {/* Hourglass top & bottom wooden blocks */}
      <rect x="75" y="45" width="90" height="8" rx="4" fill={isDark ? '#3E4D5D' : '#94A3B8'} />
      <rect x="75" y="187" width="90" height="8" rx="4" fill={isDark ? '#3E4D5D' : '#94A3B8'} />

      {/* Glass Hourglass body */}
      <path
        d="M 85 53 C 85 90, 110 115, 120 120 C 110 125, 85 150, 85 187 L 155 187 C 155 150, 130 125, 120 120 C 130 115, 155 90, 155 53 Z"
        fill={isDark ? '#161F28' : '#F1F5F9'}
        stroke={isDark ? '#4A5B6D' : '#94A3B8'}
        strokeWidth="2"
      />

      {/* Cold Teal Sand accumulating in bottom chamber */}
      <path
        d="M 92 187 C 92 165, 110 148, 120 142 C 130 148, 148 165, 148 187 Z"
        fill="#0E7490"
        opacity="0.85"
      />

      {/* Falling sand stream */}
      <line
        x1="120"
        y1="110"
        x2="120"
        y2="148"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeDasharray="2 3"
      />

      {/* Upper sand depleting */}
      <path
        d="M 98 75 C 98 86, 112 105, 120 112 C 128 105, 142 86, 142 75 Z"
        fill="#0E7490"
        opacity="0.6"
      />

      {/* Cold geometric stars around the hourglass */}
      <path
        d="M 45 75 L 48 83 L 56 86 L 48 89 L 45 97 L 42 89 L 34 86 L 42 83 Z"
        fill="#4A7A96"
      />
      <path
        d="M 195 155 L 197 161 L 203 163 L 197 165 L 195 171 L 193 165 L 187 163 L 193 161 Z"
        fill="#0E7490"
      />
    </svg>
  );
};
