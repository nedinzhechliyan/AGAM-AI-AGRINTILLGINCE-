import React from 'react';

interface FarmerLineArtProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FarmerLineArtIllustration({ className = '', size = 'md' }: FarmerLineArtProps) {
  const dimensionClass = {
    sm: 'w-48 h-36',
    md: 'w-72 h-52 sm:w-80 sm:h-56',
    lg: 'w-88 h-64 sm:w-96 sm:h-72',
  }[size];

  return (
    <div className={`relative flex items-center justify-center ${dimensionClass} ${className}`}>
      <svg
        viewBox="0 0 400 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          {/* Earthy morning sun gradient */}
          <radialGradient id="sunGlow" cx="200" cy="110" r="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#fed7aa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#faf7f2" stopOpacity="0" />
          </radialGradient>

          {/* Terracotta Soil Horizon */}
          <linearGradient id="soilHorizon" x1="0" y1="200" x2="400" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5ebe0" />
            <stop offset="100%" stopColor="#e6ccb2" />
          </linearGradient>
        </defs>

        {/* Ambient Warm Sun Glow */}
        <circle cx="200" cy="110" r="75" fill="url(#sunGlow)" />
        <circle cx="200" cy="110" r="32" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" fill="#fef3c7" fillOpacity="0.6" />

        {/* Distant Hills / Agro Landscape Contours */}
        <path
          d="M0 170 Q90 140 190 165 T400 155 L400 280 L0 280 Z"
          fill="url(#soilHorizon)"
          opacity="0.6"
        />
        <path
          d="M0 170 Q90 140 190 165 T400 155"
          stroke="#92400e"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />

        {/* Terraced Furrow Lines (Soil Contours) */}
        <path
          d="M10 205 Q120 185 240 200 T400 190"
          stroke="#78350f"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
        <path
          d="M0 235 Q140 215 270 230 T400 220"
          stroke="#78350f"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        <path
          d="M0 265 Q160 245 290 260 T400 250"
          stroke="#2d6a4f"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />

        {/* Wheat / Paddy Crops - Left Cluster */}
        <g stroke="#2d6a4f" strokeWidth="1.75" strokeLinecap="round">
          {/* Stalk 1 */}
          <path d="M45 245 Q40 200 48 165" />
          <ellipse cx="46" cy="162" rx="3" ry="6" fill="#52b788" stroke="#1b4332" strokeWidth="1.2" transform="rotate(-15 46 162)" />
          <ellipse cx="43" cy="174" rx="2.5" ry="5.5" fill="#52b788" stroke="#1b4332" strokeWidth="1.2" transform="rotate(20 43 174)" />
          <ellipse cx="48" cy="186" rx="2.5" ry="5.5" fill="#52b788" stroke="#1b4332" strokeWidth="1.2" transform="rotate(-20 48 186)" />

          {/* Stalk 2 */}
          <path d="M65 250 Q68 205 60 170" />
          <ellipse cx="58" cy="167" rx="3" ry="6" fill="#b45309" stroke="#78350f" strokeWidth="1.2" transform="rotate(10 58 167)" />
          <ellipse cx="64" cy="179" rx="2.5" ry="5.5" fill="#d97706" stroke="#78350f" strokeWidth="1.2" transform="rotate(-25 64 179)" />
          <ellipse cx="60" cy="191" rx="2.5" ry="5.5" fill="#d97706" stroke="#78350f" strokeWidth="1.2" transform="rotate(25 60 191)" />

          {/* Stalk 3 */}
          <path d="M85 260 Q82 225 88 190" />
          <ellipse cx="88" cy="187" rx="2.5" ry="5" fill="#52b788" stroke="#1b4332" strokeWidth="1.2" transform="rotate(15 88 187)" />
          <ellipse cx="84" cy="199" rx="2.5" ry="5" fill="#52b788" stroke="#1b4332" strokeWidth="1.2" transform="rotate(-15 84 199)" />
        </g>

        {/* Minimalist Farmer Silhouette & Line Art (Center Right) */}
        <g id="farmerFigure" transform="translate(180, 50)">
          {/* Farmer's Traditional Broad Straw / Palm Leaf Hat */}
          <path
            d="M 50 78 Q 75 52 100 78 Z"
            fill="#fef3c7"
            stroke="#b45309"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 42 78 C 65 72 85 72 108 78"
            stroke="#78350f"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Head & Neck */}
          <circle cx="75" cy="88" r="9" fill="#f5ebe0" stroke="#78350f" strokeWidth="1.75" />

          {/* Torso & Traditional Kurta / Cotton Shirt */}
          <path
            d="M 66 97 L 60 148 L 90 148 L 84 97 Z"
            fill="#fdfbf7"
            stroke="#1b4332"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Chest fold detail */}
          <path d="M 75 98 L 75 120" stroke="#2d6a4f" strokeWidth="1.5" strokeLinecap="round" />

          {/* Dhoti / Trousers */}
          <path
            d="M 60 148 L 57 195 L 72 195 L 75 160 L 78 195 L 93 195 L 90 148 Z"
            fill="#faf7f2"
            stroke="#78350f"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />

          {/* Farmer's Right Arm holding bamboo walking/measuring staff */}
          <path
            d="M 84 105 Q 98 120 104 135"
            stroke="#78350f"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Bamboo Field Staff */}
          <line
            x1="104"
            y1="82"
            x2="104"
            y2="202"
            stroke="#b45309"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
          {/* Bamboo joints */}
          <circle cx="104" cy="110" r="1.5" fill="#78350f" />
          <circle cx="104" cy="140" r="1.5" fill="#78350f" />
          <circle cx="104" cy="170" r="1.5" fill="#78350f" />

          {/* Farmer's Left Arm resting peacefully */}
          <path
            d="M 66 105 Q 54 122 58 138"
            stroke="#78350f"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Wheat / Paddy Crops - Right Cluster */}
        <g stroke="#2d6a4f" strokeWidth="1.75" strokeLinecap="round">
          {/* Stalk 4 */}
          <path d="M315 255 Q310 215 320 175" />
          <ellipse cx="318" cy="172" rx="3" ry="6" fill="#b45309" stroke="#78350f" strokeWidth="1.2" transform="rotate(-15 318 172)" />
          <ellipse cx="314" cy="184" rx="2.5" ry="5.5" fill="#d97706" stroke="#78350f" strokeWidth="1.2" transform="rotate(20 314 184)" />
          <ellipse cx="319" cy="196" rx="2.5" ry="5.5" fill="#d97706" stroke="#78350f" strokeWidth="1.2" transform="rotate(-20 319 196)" />

          {/* Stalk 5 */}
          <path d="M340 260 Q346 220 338 180" />
          <ellipse cx="336" cy="177" rx="3" ry="6" fill="#52b788" stroke="#1b4332" strokeWidth="1.2" transform="rotate(15 336 177)" />
          <ellipse cx="342" cy="189" rx="2.5" ry="5.5" fill="#52b788" stroke="#1b4332" strokeWidth="1.2" transform="rotate(-20 342 189)" />

          {/* Stalk 6 */}
          <path d="M365 265 Q360 230 368 195" />
          <ellipse cx="367" cy="192" rx="2.5" ry="5" fill="#b45309" stroke="#78350f" strokeWidth="1.2" transform="rotate(-15 367 192)" />
        </g>

        {/* Gentle Morning Birds over the Horizon */}
        <path d="M90 90 Q96 84 102 90 Q108 84 114 90" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M125 105 Q130 100 135 105 Q140 100 145 105" stroke="#78350f" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
}
