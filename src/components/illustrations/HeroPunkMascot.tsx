import React from 'react';

interface MascotProps {
  className?: string;
  theme?: 'dark' | 'light';
}

export const HeroPunkMascot: React.FC<MascotProps> = ({ className = 'w-full h-auto', theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <svg
      viewBox="0 0 500 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Halftone / retícula screenprint pattern */}
        <pattern id="halftoneScreen" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill={isDark ? '#DC2626' : '#991B1B'} opacity="0.35" />
        </pattern>

        {/* Photocopy xerox noise texture */}
        <filter id="punkXeroxNoise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.8  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0.25 0" />
          <feComposite in2="SourceGraphic" in="glitch" operator="in" />
        </filter>
      </defs>

      {/* Background Poster Backing (Torn & Pasted Flyer with rough edges) */}
      <path
        d="M 40 380 L 35 70 L 60 45 L 430 40 L 465 65 L 460 385 L 440 405 L 60 400 Z"
        fill={isDark ? '#15181D' : '#FFFFFF'}
        stroke={isDark ? '#2E343D' : '#000000'}
        strokeWidth="4"
        strokeLinejoin="bevel"
      />
      {/* Halftone accent patch on background */}
      <rect x="290" y="55" width="155" height="150" fill="url(#halftoneScreen)" />

      {/* Top Masking Tape Strips holding the flyer */}
      <polygon points="50,30 110,25 105,52 45,57" fill="#F5EBCB" opacity="0.85" stroke="#D7C8A5" strokeWidth="1" />
      <polygon points="380,25 440,32 435,58 375,51" fill="#F5EBCB" opacity="0.85" stroke="#D7C8A5" strokeWidth="1" />

      {/* Heavy Spiral Hardbound Study Notebook (Pasted in perspective) */}
      <g id="spiral-notebook" transform="translate(65, 80)">
        {/* Notebook Cover Back */}
        <rect x="25" y="20" width="230" height="270" rx="4" fill="#000000" />
        {/* Notebook Cover Front (Torn red screenprint paper) */}
        <rect x="20" y="15" width="230" height="270" rx="4" fill="#DC2626" stroke="#000000" strokeWidth="4" />

        {/* Masking tape on notebook */}
        <polygon points="120,5 190,12 185,32 115,25" fill="#F5EBCB" opacity="0.9" stroke="#000000" strokeWidth="1.5" />

        {/* Paper Sheet on Notebook with Grid/Ruled print */}
        <rect x="45" y="45" width="185" height="215" fill={isDark ? '#F5F2EB' : '#FFFFFF'} stroke="#000000" strokeWidth="3" />
        {/* Ruled lines */}
        <line x1="55" y1="80" x2="215" y2="80" stroke="#000000" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="55" y1="110" x2="215" y2="110" stroke="#000000" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="55" y1="140" x2="215" y2="140" stroke="#000000" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="55" y1="170" x2="215" y2="170" stroke="#000000" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="55" y1="200" x2="215" y2="200" stroke="#000000" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="55" y1="230" x2="215" y2="230" stroke="#000000" strokeWidth="2" strokeDasharray="4 4" />

        {/* Spikes / Studs on the Notebook corner */}
        {[0, 1, 2].map((i) => (
          <polygon
            key={i}
            points={`${50 + i * 28},15 ${60 + i * 28},0 ${70 + i * 28},15`}
            fill="#D4D4D8"
            stroke="#000000"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        ))}

        {/* Metal Wire Spiral Rings down the left spine */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <g key={i} transform={`translate(10, ${28 + i * 28})`}>
            <ellipse cx="14" cy="8" rx="14" ry="7" fill="none" stroke="#000000" strokeWidth="4" />
            <ellipse cx="14" cy="8" rx="14" ry="7" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        ))}

        {/* Scribbles & Marker Tag inside the notebook */}
        <text
          x="135"
          y="118"
          textAnchor="middle"
          fontFamily="Bebas Neue, sans-serif"
          fontSize="36"
          fontWeight="bold"
          fill="#000000"
          letterSpacing="2"
        >
          ZINE
        </text>
        <text
          x="135"
          y="160"
          textAnchor="middle"
          fontFamily="Permanent Marker, cursive"
          fontSize="24"
          fill="#DC2626"
        >
          DE ESTUDOS
        </text>

        {/* Hand-drawn scribble star */}
        <path
          d="M 125 180 L 130 195 L 145 198 L 132 205 L 136 220 L 124 210 L 112 220 L 116 205 L 103 198 L 118 195 Z"
          fill="#DC2626"
          stroke="#000000"
          strokeWidth="2"
        />
      </g>

      {/* Tattooed Rock Horn Hand holding a sharpened Pencil */}
      <g id="rock-hand-pencil" transform="translate(245, 120)">
        {/* Leather Spiked Wristband */}
        <rect x="75" y="200" width="90" height="42" rx="4" fill="#000000" stroke="#000000" strokeWidth="3" />
        {/* Metallic pyramid studs on wristband */}
        {[0, 1, 2].map((i) => (
          <polygon
            key={i}
            points={`${88 + i * 28},210 ${100 + i * 28},200 ${112 + i * 28},210 ${100 + i * 28},220`}
            fill="#F4F4F5"
            stroke="#000000"
            strokeWidth="2"
          />
        ))}

        {/* Forearm & Palm */}
        <path
          d="M 85 200 L 90 140 C 90 120, 105 105, 120 105 C 130 105, 140 115, 145 130 L 155 200 Z"
          fill="#F5F2EB"
          stroke="#000000"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Index Finger (Extended Upwards) */}
        <path
          d="M 92 120 L 92 35 C 92 20, 108 20, 108 35 L 108 115"
          fill="#F5F2EB"
          stroke="#000000"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Pinky Finger (Extended Upwards) */}
        <path
          d="M 148 135 L 152 45 C 152 30, 168 30, 168 45 L 164 145"
          fill="#F5F2EB"
          stroke="#000000"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Middle & Ring Fingers (Folded into palm) */}
        <rect x="110" y="80" width="20" height="45" rx="10" fill="#F5F2EB" stroke="#000000" strokeWidth="5" />
        <rect x="130" y="85" width="20" height="45" rx="10" fill="#F5F2EB" stroke="#000000" strokeWidth="5" />

        {/* Thumb clamping the pencil across folded fingers */}
        <path
          d="M 85 135 C 80 125, 95 100, 120 100 L 140 105"
          fill="#F5F2EB"
          stroke="#000000"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Tattoo details on forearm/hand */}
        <path d="M 105 160 L 120 175 L 135 160" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
        <polygon points="120,180 125,190 115,190" fill="#DC2626" stroke="#000000" strokeWidth="2" />

        {/* Sharpened Yellow/Red Punk Pencil gripped in the hand */}
        <g transform="translate(60, 50) rotate(-22)">
          {/* Pencil Shaft */}
          <rect x="0" y="0" width="16" height="135" fill="#D97706" stroke="#000000" strokeWidth="4" />
          <line x1="8" y1="0" x2="8" y2="135" stroke="#B45309" strokeWidth="2" />
          {/* Metal Ferrule & Red Eraser */}
          <rect x="0" y="135" width="16" height="15" fill="#D4D4D8" stroke="#000000" strokeWidth="3" />
          <rect x="0" y="150" width="16" height="14" rx="2" fill="#DC2626" stroke="#000000" strokeWidth="3" />
          {/* Sharpened Wood Cone & Graphite Lead Tip */}
          <polygon points="0,0 16,0 8,-28" fill="#F5EBCB" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="4,-14 12,-14 8,-28" fill="#000000" stroke="#000000" strokeWidth="1" />
        </g>
      </g>

      {/* Safety Pin Decal on bottom left */}
      <g transform="translate(75, 340) rotate(-15)">
        <path
          d="M 10 15 L 75 15 C 85 15, 85 35, 75 35 L 25 35 C 10 35, 10 20, 20 15"
          stroke="#D4D4D8"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="65" y="10" width="22" height="16" rx="4" fill="#A1A1AA" stroke="#000000" strokeWidth="2" />
        <circle cx="15" cy="25" r="7" stroke="#000000" strokeWidth="3" fill="#D4D4D8" />
      </g>

      {/* Punk Band-aid Decal on bottom right */}
      <g transform="translate(330, 345) rotate(12)">
        <rect x="0" y="0" width="85" height="28" rx="8" fill="#D7C8A5" stroke="#000000" strokeWidth="3" />
        <rect x="25" y="3" width="35" height="22" fill="#F5EBCB" stroke="#000000" strokeWidth="1.5" />
        {/* Band-aid perforation dots */}
        <circle cx="12" cy="14" r="1.5" fill="#A3906B" />
        <circle cx="18" cy="14" r="1.5" fill="#A3906B" />
        <circle cx="67" cy="14" r="1.5" fill="#A3906B" />
        <circle cx="73" cy="14" r="1.5" fill="#A3906B" />
        {/* Red star on pad */}
        <path d="M 42 7 L 44 12 L 49 13 L 45 16 L 46 21 L 42 18 L 38 21 L 39 16 L 35 13 L 40 12 Z" fill="#DC2626" />
      </g>

      {/* Electric Bolt & Spray Dots */}
      <polygon points="415,130 435,130 422,150 445,150 410,185 420,160 405,160" fill="#DC2626" stroke="#000000" strokeWidth="3" />
      <circle cx="435" cy="205" r="3" fill="#DC2626" />
      <circle cx="445" cy="215" r="2" fill="#DC2626" />
      <circle cx="425" cy="225" r="4" fill="#000000" />
    </svg>
  );
};
