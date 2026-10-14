import React from 'react';

interface ArtProps {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * Pilha de livros com spikes e fita adesiva amarrada
 */
export const SpikedBooksMascot: React.FC<ArtProps> = ({ className = 'w-44 h-auto', theme = 'dark' }) => {
  const isDark = theme === 'dark';
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Bottom Book (Heavy black tome with silver studs) */}
      <g transform="translate(20, 130)">
        <rect x="0" y="0" width="200" height="42" rx="3" fill={isDark ? '#15181D' : '#000000'} stroke="#000000" strokeWidth="4" />
        <rect x="15" y="8" width="170" height="26" fill="#F5F2EB" stroke="#000000" strokeWidth="2" />
        {/* Book pages lines */}
        <line x1="25" y1="16" x2="175" y2="16" stroke="#000000" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="25" y1="24" x2="175" y2="24" stroke="#000000" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Spikes along bottom edge */}
        {[0, 1, 2, 3].map((i) => (
          <polygon
            key={i}
            points={`${35 + i * 40},42 ${45 + i * 40},54 ${55 + i * 40},42`}
            fill="#D4D4D8"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        ))}
      </g>

      {/* Middle Book (Vermelho-tinta screenprint cover) */}
      <g transform="translate(32, 85) rotate(-3)">
        <rect x="0" y="0" width="180" height="38" rx="3" fill="#DC2626" stroke="#000000" strokeWidth="4" />
        <rect x="18" y="7" width="148" height="24" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        {/* Spine stamp */}
        <text x="30" y="24" fontFamily="Bebas Neue, sans-serif" fontSize="16" fill="#000000" fontWeight="bold">
          TEORIA & PRÁTICA
        </text>
        {/* Studs */}
        <polygon points="150,7 156,-2 162,7" fill="#D4D4D8" stroke="#000000" strokeWidth="2" />
        <polygon points="125,7 131,-2 137,7" fill="#D4D4D8" stroke="#000000" strokeWidth="2" />
      </g>

      {/* Top Book (Open xerox zine with spiral & tape) */}
      <g transform="translate(45, 40) rotate(2)">
        <rect x="0" y="0" width="150" height="35" rx="3" fill={isDark ? '#F5F2EB' : '#FFFFFF'} stroke="#000000" strokeWidth="3.5" />
        <rect x="10" y="6" width="130" height="23" fill={isDark ? '#15181D' : '#F5EBCB'} stroke="#000000" strokeWidth="1.5" />
        <text x="25" y="22" fontFamily="Permanent Marker, cursive" fontSize="13" fill="#DC2626">
          ZINE #01
        </text>
        {/* Masking tape across top book */}
        <polygon points="40,-8 90,-5 85,12 35,9" fill="#F5EBCB" opacity="0.9" stroke="#000000" strokeWidth="1" />
      </g>

      {/* Skull / Crossbones stamp on top book */}
      <circle cx="160" cy="55" r="8" fill="#000000" stroke="#000000" strokeWidth="1" />
      <circle cx="158" cy="53" r="1.5" fill="#FFFFFF" />
      <circle cx="162" cy="53" r="1.5" fill="#FFFFFF" />
      <polygon points="156,66 164,66 160,61" fill="#DC2626" />
    </svg>
  );
};

/**
 * Fones de ouvido circumaurais pesados e disco de vinil / mixtape punk
 */
export const VinylHeadphonesMascot: React.FC<ArtProps> = ({ className = 'w-44 h-auto', theme = 'dark' }) => {
  const isDark = theme === 'dark';
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Vinyl Record (12-inch LP with ink grooves) */}
      <g transform="translate(30, 20)">
        {/* Outer Vinyl Disc */}
        <circle cx="90" cy="90" r="85" fill="#000000" stroke="#000000" strokeWidth="4" />
        {/* Sound Grooves */}
        <circle cx="90" cy="90" r="75" stroke={isDark ? '#2E343D' : '#333333'} strokeWidth="1.5" fill="none" />
        <circle cx="90" cy="90" r="65" stroke={isDark ? '#2E343D' : '#333333'} strokeWidth="1.5" fill="none" />
        <circle cx="90" cy="90" r="55" stroke={isDark ? '#2E343D' : '#333333'} strokeWidth="1.5" fill="none" />
        <circle cx="90" cy="90" r="45" stroke={isDark ? '#2E343D' : '#333333'} strokeWidth="1.5" fill="none" />

        {/* Center Label (Vermelho-tinta Silk Screen) */}
        <circle cx="90" cy="90" r="32" fill="#DC2626" stroke="#000000" strokeWidth="3" />
        {/* Center Spindle Hole */}
        <circle cx="90" cy="90" r="6" fill={isDark ? '#0B0C0E' : '#F3EFE6'} stroke="#000000" strokeWidth="2" />
        <text x="90" y="78" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="10" fill="#FFFFFF" letterSpacing="1">
          45 RPM
        </text>
        <text x="90" y="108" textAnchor="middle" fontFamily="Permanent Marker, cursive" fontSize="9" fill="#000000">
          DIY
        </text>
      </g>

      {/* Punk Over-Ear Headphones (Thick headband with spikes & earcups) */}
      <g transform="translate(15, 10)">
        {/* Headband arch */}
        <path
          d="M 35 110 C 35 30, 175 30, 175 110"
          stroke="#000000"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 40 105 C 40 38, 170 38, 170 105"
          stroke="#DC2626"
          strokeWidth="4"
          fill="none"
        />
        {/* Spikes on Headband */}
        {[0, 1, 2, 3].map((i) => {
          const angles = [-40, -15, 15, 40];
          const rad = (angles[i] * Math.PI) / 180;
          const cx = 105 + 72 * Math.sin(rad);
          const cy = 60 - 45 * Math.cos(rad);
          return (
            <polygon
              key={i}
              points={`${cx - 5},${cy} ${cx},${cy - 12} ${cx + 5},${cy}`}
              fill="#D4D4D8"
              stroke="#000000"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Left Earcup */}
        <g transform="translate(18, 90)">
          <rect x="0" y="0" width="30" height="48" rx="8" fill="#15181D" stroke="#000000" strokeWidth="4" />
          <rect x="5" y="8" width="8" height="32" rx="4" fill="#DC2626" />
        </g>

        {/* Right Earcup */}
        <g transform="translate(162, 90)">
          <rect x="0" y="0" width="30" height="48" rx="8" fill="#15181D" stroke="#000000" strokeWidth="4" />
          <rect x="17" y="8" width="8" height="32" rx="4" fill="#DC2626" />
        </g>

        {/* Headphone coiled cord */}
        <path
          d="M 33 138 C 30 160, 45 175, 60 165 C 75 155, 90 175, 105 165 C 120 155, 135 175, 145 160"
          stroke="#000000"
          strokeWidth="3.5"
          fill="none"
        />
      </g>
    </svg>
  );
};
