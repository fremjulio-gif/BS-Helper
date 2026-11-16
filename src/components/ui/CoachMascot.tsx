'use client';

import React from 'react';

export type MascotMood = 'neutral' | 'pumped' | 'tilt' | 'proud';

interface CoachMascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
  animated?: boolean;
}

export function CoachMascot({
  mood = 'neutral',
  size = 56,
  className = '',
  animated = true,
}: CoachMascotProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 ${
        animated ? 'transition-transform duration-200 hover:scale-105' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_0_#070b16]"
      >
        {/* Antenna */}
        <path
          d="M50 20V8"
          stroke="#070B16"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {mood === 'pumped' && (
          <circle cx="50" cy="7" r="6" fill="#FFC700" stroke="#070B16" strokeWidth="3" />
        )}
        {mood === 'tilt' && (
          <circle cx="50" cy="7" r="6" fill="#EF4444" stroke="#070B16" strokeWidth="3" />
        )}
        {mood === 'proud' && (
          <path
            d="M50 2L52 6H56L53 8.5L54 12.5L50 10L46 12.5L47 8.5L44 6H48L50 2Z"
            fill="#FFC700"
            stroke="#070B16"
            strokeWidth="2"
          />
        )}
        {mood === 'neutral' && (
          <circle cx="50" cy="7" r="5" fill="#00D9FF" stroke="#070B16" strokeWidth="3" />
        )}

        {/* Ears / Bolts */}
        <rect x="10" y="44" width="8" height="16" rx="3" fill="#2A3568" stroke="#070B16" strokeWidth="3" />
        <rect x="82" y="44" width="8" height="16" rx="3" fill="#2A3568" stroke="#070B16" strokeWidth="3" />

        {/* Head Base */}
        <rect
          x="16"
          y="20"
          width="68"
          height="62"
          rx="18"
          fill="url(#bot_head_grad)"
          stroke="#070B16"
          strokeWidth="4"
        />

        {/* Head Top Highlight */}
        <path
          d="M26 25C32 23 68 23 74 25"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />

        {/* Screen / Visor */}
        <rect
          x="24"
          y="32"
          width="52"
          height="38"
          rx="12"
          fill="#0D132A"
          stroke="#070B16"
          strokeWidth="3.5"
        />

        {/* EYES & MOUTH BY MOOD */}
        {mood === 'neutral' && (
          <>
            {/* Friendly Cyan Eyes */}
            <circle cx="40" cy="48" r="5" fill="#00D9FF" />
            <circle cx="42" cy="46" r="1.5" fill="#FFFFFF" />
            <circle cx="60" cy="48" r="5" fill="#00D9FF" />
            <circle cx="62" cy="46" r="1.5" fill="#FFFFFF" />
            {/* Gentle Smile */}
            <path
              d="M44 58C47 61 53 61 56 58"
              stroke="#00D9FF"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        {mood === 'pumped' && (
          <>
            {/* Determined / Fiery Star Eyes */}
            <path
              d="M36 45L44 49M44 45L36 49"
              stroke="#FFC700"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M56 49L64 45M64 49L56 45"
              stroke="#FFC700"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Excited Grin */}
            <path
              d="M42 57Q50 64 58 57"
              stroke="#FFC700"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </>
        )}

        {mood === 'tilt' && (
          <>
            {/* Concerned Eyes / Sweat Drop */}
            <circle cx="39" cy="48" r="4.5" fill="#EF4444" />
            <circle cx="61" cy="48" r="4.5" fill="#EF4444" />
            <path
              d="M44 60C47 57 53 57 56 60"
              stroke="#EF4444"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Sweat Drop on visor */}
            <path
              d="M71 36C71 39 68 42 68 42C68 42 65 39 65 36C65 34.3 66.3 33 68 33C69.7 33 71 34.3 71 36Z"
              fill="#00D9FF"
            />
          </>
        )}

        {mood === 'proud' && (
          <>
            {/* Wink + Star Eye */}
            <path
              d="M35 48L39 44L43 48L39 52Z"
              fill="#FFC700"
            />
            <path
              d="M57 49C59 46 63 46 65 49"
              stroke="#FFC700"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Big Smile with gold tooth */}
            <path
              d="M42 56C44 62 56 62 58 56Z"
              fill="#FFC700"
              stroke="#070B16"
              strokeWidth="2"
            />
          </>
        )}

        {/* Cheeks blush */}
        <circle cx="30" cy="56" r="3" fill="#FF5E7E" fillOpacity="0.6" />
        <circle cx="70" cy="56" r="3" fill="#FF5E7E" fillOpacity="0.6" />

        {/* Gradients */}
        <defs>
          <linearGradient id="bot_head_grad" x1="50" y1="20" x2="50" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4859A3" />
            <stop offset="1" stopColor="#252E5E" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
