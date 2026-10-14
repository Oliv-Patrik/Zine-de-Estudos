import React from 'react';

interface MascotProps {
  className?: string;
  theme?: 'dark' | 'light';
}

export const HeroDeskMascot: React.FC<MascotProps> = ({ className = 'w-full h-auto', theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <svg
      viewBox="0 0 460 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Risograph grain filter */}
        <filter id="heroRisoGrain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.15  0 0 0 0 0.2  0 0 0 0.15 0" />
          <feComposite in2="SourceGraphic" in="glitch" operator="in" />
        </filter>

        <linearGradient id="mugGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#2D3A48' : '#D1DCE7'} />
          <stop offset="100%" stopColor={isDark ? '#1A232D' : '#BAC8D7'} />
        </linearGradient>

        <linearGradient id="book1Grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A7A96" />
          <stop offset="100%" stopColor="#35586E" />
        </linearGradient>

        <linearGradient id="book2Grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4E7A74" />
          <stop offset="100%" stopColor="#365752" />
        </linearGradient>

        <linearGradient id="book3Grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6B6D8F" />
          <stop offset="100%" stopColor="#4F516C" />
        </linearGradient>

        <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#E2E8F0' : '#475569'} />
          <stop offset="100%" stopColor={isDark ? '#94A3B8' : '#1E293B'} />
        </linearGradient>
      </defs>

      {/* Background Arch & Nocturnal Horizon */}
      <path
        d="M 60 330 C 60 170, 160 50, 290 50 C 370 50, 420 110, 420 230 L 420 330 Z"
        fill={isDark ? '#161E26' : '#E8EFF5'}
        opacity="0.85"
      />

      {/* Subtle Moon in the horizon */}
      <circle cx="340" cy="110" r="42" fill="url(#moonGrad)" opacity="0.65" />
      <circle cx="355" cy="100" r="38" fill={isDark ? '#161E26' : '#E8EFF5'} />

      {/* Cold geometric 8-point stars */}
      <path
        d="M 120 100 L 124 116 L 140 120 L 124 124 L 120 140 L 116 124 L 100 120 L 116 116 Z"
        fill={isDark ? '#94A3B8' : '#64748B'}
        opacity="0.75"
      />
      <path
        d="M 230 65 L 232 75 L 242 77 L 232 79 L 230 89 L 228 79 L 218 77 L 228 75 Z"
        fill="#0E7490"
        opacity="0.85"
      />
      <path
        d="M 390 190 L 393 200 L 403 203 L 393 206 L 390 216 L 387 206 L 377 203 L 387 200 Z"
        fill={isDark ? '#CBD5E1' : '#475569'}
        opacity="0.6"
      />

      {/* Desk Base Surface */}
      <rect
        x="30"
        y="325"
        width="400"
        height="12"
        rx="6"
        fill={isDark ? '#25303D' : '#CBD7E3'}
      />
      <line
        x1="20"
        y1="337"
        x2="440"
        y2="337"
        stroke={isDark ? '#1C2530' : '#BAC8D7'}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Stack of Hardbound Study Notebooks */}
      {/* Book 1 (Bottom, Slate Blue) */}
      <g id="book-bottom">
        <rect x="70" y="285" width="220" height="38" rx="4" fill="url(#book1Grad)" />
        <rect x="280" y="289" width="8" height="30" rx="2" fill="#E2E8F0" />
        <rect x="74" y="291" width="12" height="26" rx="2" fill="#2E4E63" />
        {/* Bookmark ribbon sticking out */}
        <path d="M 230 323 L 230 348 L 237 342 L 244 348 L 244 323 Z" fill="#0E7490" />
        {/* Spine lines */}
        <line x1="94" y1="293" x2="94" y2="315" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="98" y1="293" x2="98" y2="315" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
      </g>

      {/* Book 2 (Middle, Muted Sage) */}
      <g id="book-middle">
        <rect x="85" y="247" width="195" height="36" rx="4" fill="url(#book2Grad)" />
        <rect x="270" y="251" width="8" height="28" rx="2" fill="#E2E8F0" />
        <rect x="89" y="252" width="10" height="26" rx="2" fill="#2A4540" />
        <line x1="108" y1="254" x2="108" y2="274" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
      </g>

      {/* Book 3 (Top, Cold Lavender) */}
      <g id="book-top">
        <rect x="95" y="210" width="175" height="35" rx="4" fill="url(#book3Grad)" />
        <rect x="260" y="214" width="8" height="27" rx="2" fill="#E2E8F0" />
        <rect x="99" y="215" width="10" height="25" rx="2" fill="#3D3E53" />
        <line x1="116" y1="217" x2="116" y2="237" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
      </g>

      {/* Ceramic Coffee Mug with Rising Geometric Steam */}
      <g id="mug" transform="translate(305, 235)">
        {/* Steam spirals */}
        <path
          d="M 22 -15 C 18 -30, 26 -40, 20 -55"
          stroke={isDark ? '#94A3B8' : '#64748B'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="4 4"
          opacity="0.8"
        />
        <path
          d="M 36 -10 C 42 -26, 32 -38, 38 -50"
          stroke="#0E7490"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="4 4"
          opacity="0.85"
        />

        {/* Mug Body */}
        <path
          d="M 10 15 L 12 75 C 12 85, 48 85, 48 75 L 50 15 Z"
          fill="url(#mugGradient)"
          stroke={isDark ? '#3E4D5D' : '#94A3B8'}
          strokeWidth="2"
        />
        {/* Mug Handle */}
        <path
          d="M 50 30 C 66 30, 66 60, 50 60"
          stroke={isDark ? '#3E4D5D' : '#94A3B8'}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Mug Rim */}
        <ellipse
          cx="30"
          cy="15"
          rx="20"
          ry="6"
          fill={isDark ? '#1E2630' : '#BAC7D5'}
          stroke={isDark ? '#3E4D5D' : '#94A3B8'}
          strokeWidth="1.5"
        />
        {/* Coffee Liquid */}
        <ellipse cx="30" cy="16" rx="16" ry="4" fill="#0E7490" opacity="0.8" />
      </g>

      {/* Drafting Pencil and Open Folio Details */}
      <g id="pencil" transform="translate(180, 160) rotate(32)">
        {/* Hexagonal wood shaft */}
        <rect x="0" y="0" width="8" height="80" rx="1" fill="#4A7A96" />
        <rect x="3" y="0" width="2" height="80" fill="#36586E" />
        {/* Metal ferrule & eraser */}
        <rect x="0" y="80" width="8" height="12" fill={isDark ? '#94A3B8' : '#64748B'} />
        <rect x="0" y="92" width="8" height="10" rx="2" fill="#E2E8F0" />
        {/* Sharpened cone & graphite tip */}
        <polygon points="0,0 8,0 4,-16" fill="#D1DCE7" />
        <polygon points="2.5,-10 5.5,-10 4,-16" fill="#121518" />
      </g>

      {/* Tiny decorative stamp label */}
      <g transform="translate(120, 182) rotate(-6)">
        <rect
          x="0"
          y="0"
          width="82"
          height="22"
          rx="11"
          fill="#0E7490"
        />
        <text
          x="41"
          y="15"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="10"
          fontWeight="800"
          letterSpacing="1"
          fontFamily="Bricolage Grotesque, sans-serif"
        >
          CADERNO
        </text>
      </g>
    </svg>
  );
};
