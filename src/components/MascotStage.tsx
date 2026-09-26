/**
 * MascotStage — the farmer's cow companion, extracted verbatim from the
 * original App.tsx rig so ALL animations (idle breathing, turban sway, plough
 * sway, eye tracking, blinking, emotion mouths, passport zoom) survive intact.
 *
 * NEW CAPABILITY: `dock` prop implements the VISION lane animation —
 *   'center' → full stage (registration welcome / mascot-only lane)
 *   'left'   → slides to left panel (Stage-3 thinking pose)
 *   'right'  → slides compactly to the right while the lane content owns the screen
 */
import React, { forwardRef } from 'react';
import { Emotion, MascotZoomMode } from '../types';

export type MascotDock = 'center' | 'left' | 'right';

interface MascotStageProps {
  emotion: Emotion;
  isSpeaking: boolean;
  isBlinking: boolean;
  mascotZoom: MascotZoomMode;
  ploughEquipped: boolean;
  dock?: MascotDock;
  currentDialogue: string;
  leftPupilOffset: { x: number; y: number };
  rightPupilOffset: { x: number; y: number };
  onCowClick?: () => void;
  compact?: boolean; // lane-docked smaller footprint
}

export const MascotStage = forwardRef<HTMLDivElement, MascotStageProps>(function MascotStage(
  {
    emotion,
    isSpeaking,
    isBlinking,
    mascotZoom,
    ploughEquipped,
    dock = 'center',
    currentDialogue,
    leftPupilOffset,
    rightPupilOffset,
    onCowClick,
    compact = false,
  },
  ref
) {
  const docked = dock !== 'center';
  const scale = compact ? 0.62 : docked ? 0.8 : 1;

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-700 ${
        dock === 'right' ? 'justify-end' : dock === 'left' ? 'justify-start' : 'justify-center'
      }`}
      style={{ minHeight: compact ? 300 : docked ? 380 : 540 }}
    >
      {/* Speech Waveform Bubble */}
      <div
        className={`absolute top-1 z-30 bg-slate-900/95 border border-amber-500/50 px-4 py-2 rounded-2xl shadow-xl backdrop-blur transition-all duration-300 flex items-center gap-3 pointer-events-none max-w-[92%] ${
          isSpeaking ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'
        } ${dock === 'right' ? 'right-2' : dock === 'left' ? 'left-2' : 'left-1/2 -translate-x-1/2'}`}
      >
        <div className="flex items-center gap-1 h-5 shrink-0">
          <div className="w-1 bg-amber-400 rounded-full" style={{ animation: 'soundwave 0.5s ease-in-out infinite' }} />
          <div className="w-1 bg-amber-400 rounded-full" style={{ animation: 'soundwave 0.7s ease-in-out infinite 0.1s' }} />
          <div className="w-1 bg-amber-400 rounded-full" style={{ animation: 'soundwave 0.4s ease-in-out infinite 0.2s' }} />
          <div className="w-1 bg-amber-400 rounded-full" style={{ animation: 'soundwave 0.6s ease-in-out infinite 0.3s' }} />
        </div>
        <span className="text-xs font-semibold text-amber-200 line-clamp-2">"{currentDialogue}"</span>
      </div>

      <div
        ref={ref}
        onClick={onCowClick}
        title="Click cow to zoom into passport photo size & sound moo!"
        style={{
          width: compact ? 'min(70vw, 270px)' : mascotZoom === 'passport' ? 'min(86vw, 305px)' : 'min(92vw, 420px)',
          height: compact ? 270 : mascotZoom === 'passport' ? 385 : 520,
          borderRadius: mascotZoom === 'passport' ? 28 : 24,
          transition:
            'width 0.7s cubic-bezier(0.22, 1, 0.36, 1), height 0.7s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.7s ease, background-color 0.5s ease, border-color 0.5s ease, box-shadow 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: `scale(${scale})`,
        }}
        className={`relative select-none flex items-center justify-center cursor-pointer group overflow-hidden border ${
          mascotZoom === 'passport'
            ? 'border-slate-700/90 bg-slate-900/70 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/10'
            : 'border-slate-800/50 bg-slate-900/30 hover:border-amber-500/40 shadow-[0_12px_35px_rgba(0,0,0,0.5)]'
        }`}
      >
        <div
          id="mascotActor"
          style={{
            width: '440px',
            height: '560px',
            transform:
              mascotZoom === 'passport' ? 'scale(1.58) translateY(66px)' : 'scale(1) translateY(0px)',
            transformOrigin: '50% 20%',
            transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className={`character-body relative flex items-center justify-center shrink-0 ${
            emotion === 'happy' ? 'animate-happy' : emotion === 'surprised' ? 'animate-surprised' : 'animate-idle'
          }`}
        >
          <svg
            className="w-full h-full filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]"
            viewBox="0 0 460 580"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="turbanGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="60%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              <linearGradient id="kurtaGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
              <linearGradient id="woodBeamGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#a0522d" />
                <stop offset="35%" stopColor="#8b4513" />
                <stop offset="70%" stopColor="#6b3410" />
                <stop offset="100%" stopColor="#4a2207" />
              </linearGradient>
              <linearGradient id="woodShoeGrad" x1="0%" x2="100%" y1="0%" y2="50%">
                <stop offset="0%" stopColor="#9a4d26" />
                <stop offset="50%" stopColor="#7c3b12" />
                <stop offset="100%" stopColor="#552408" />
              </linearGradient>
              <linearGradient id="woodHandleGrad" x1="0%" x2="0%" y1="100%" y2="0%">
                <stop offset="0%" stopColor="#6b3410" />
                <stop offset="60%" stopColor="#8c471c" />
                <stop offset="100%" stopColor="#a8592c" />
              </linearGradient>
              <linearGradient id="ropeGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#e2ba78" />
                <stop offset="50%" stopColor="#b58742" />
                <stop offset="100%" stopColor="#6d4d1b" />
              </linearGradient>
              <filter height="120%" id="shadowBlur" width="120%" x="-10%" y="-10%">
                <feDropShadow dx="0" dy="4" floodOpacity="0.25" stdDeviation="4" />
              </filter>
              <filter height="140%" id="glowFilter" width="140%" x="-20%" y="-20%">
                <feGaussianBlur result="blur" stdDeviation="3" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Shadow on Ground */}
            <ellipse
              cx="200"
              cy="560"
              fill="#020617"
              rx="115"
              ry="14"
              className={`transition-opacity duration-500 ${
                mascotZoom === 'passport' ? 'opacity-0' : 'opacity-75'
              }`}
            />

            {/* Traditional Plough (Hal) */}
            {ploughEquipped && (
              <g id="halPloughGroup" className="animate-plough origin-[200px_240px] transition-all duration-300">
                <path d="M 125 240 L 442 268 L 440 286 L 123 258 Z" fill="url(#woodBeamGrad)" filter="url(#shadowBlur)" />
                <path d="M 128 244 L 438 271" stroke="#b56535" strokeLinecap="round" strokeWidth="2.5" />
                <path d="M 140 252 L 434 278" stroke="#4a2207" strokeLinecap="round" strokeWidth="1.5" />
                <path d="M 145 242 L 38 68 C 34 60 44 54 50 60 L 160 220 Z" fill="url(#woodHandleGrad)" filter="url(#shadowBlur)" />
                <path d="M 44 65 L 148 234" stroke="#c07848" strokeLinecap="round" strokeWidth="2" />
                <path
                  d="M 128 235 C 100 230 82 245 80 270 L 76 395 C 75 425 90 455 92 485 L 68 505 C 55 515 50 518 72 522 L 102 522 C 114 515 110 500 102 478 C 96 445 92 420 95 385 L 100 285 C 102 265 115 255 132 250 Z"
                  fill="url(#woodShoeGrad)"
                  filter="url(#shadowBlur)"
                />
                <polygon fill="#3e1b04" points="68,505 72,522 102,522 88,510" />
                <path d="M 108 228 L 152 232 L 144 272 L 100 268 Z" fill="#582607" stroke="#331402" strokeWidth="1.5" />
                <g className="joint-ropes">
                  <rect fill="url(#ropeGrad)" height="7" rx="3.5" stroke="#4a300d" strokeWidth="1" transform="rotate(-6 102 234)" width="48" x="102" y="234" />
                  <rect fill="url(#ropeGrad)" height="7" rx="3.5" stroke="#4a300d" strokeWidth="1" transform="rotate(-6 100 242)" width="50" x="100" y="242" />
                  <rect fill="url(#ropeGrad)" height="7" rx="3.5" stroke="#4a300d" strokeWidth="1" transform="rotate(-6 98 250)" width="52" x="98" y="250" />
                  <rect fill="url(#ropeGrad)" height="7" rx="3.5" stroke="#4a300d" strokeWidth="1" transform="rotate(-6 97 258)" width="50" x="97" y="258" />
                  <path d="M 144 266 Q 152 280 148 295" fill="none" stroke="#b58742" strokeLinecap="round" strokeWidth="3" />
                </g>
              </g>
            )}

            {/* Thinking Cloud */}
            {emotion === 'thinking' && (
              <g id="thoughtCloud" className="pointer-events-none">
                <circle cx="282" cy="115" fill="#38bdf8" opacity="0.8" r="5" />
                <circle cx="295" cy="94" fill="#38bdf8" opacity="0.9" r="8" />
                <g transform="translate(305, 30)">
                  <rect fill="#0f172a" filter="url(#glowFilter)" height="52" rx="20" stroke="#38bdf8" strokeWidth="2" width="82" x="0" y="0" />
                  <g transform="translate(41, 26)">
                    <circle
                      cx="0"
                      cy="0"
                      fill="none"
                      r="10"
                      stroke="#facc15"
                      strokeDasharray="3, 3"
                      strokeWidth="2.5"
                      style={{ animation: 'gear-spin 4s linear infinite', transformOrigin: '0 0' }}
                    />
                    <circle cx="0" cy="0" fill="#38bdf8" r="4" />
                    <path d="M -8 -13 L 8 -13" stroke="#94a3b8" strokeLinecap="round" strokeWidth="2" />
                    <text fill="#facc15" fontFamily="'JetBrains Mono', monospace" fontSize="11" fontWeight="bold" textAnchor="middle" x="0" y="4">
                      ?
                    </text>
                  </g>
                </g>
              </g>
            )}

            {/* Legs */}
            <g
              id="legs"
              className={`transition-opacity duration-500 ${
                mascotZoom === 'passport' ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <path d="M 160 380 L 150 515 Q 150 535 168 535 L 185 530 L 188 380 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M 160 440 Q 165 470 160 510" fill="none" stroke="#94a3b8" strokeLinecap="round" strokeWidth="2" />
              <path d="M 215 380 L 216 530 L 235 535 Q 252 535 252 515 L 242 380 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M 235 440 Q 238 470 236 510" fill="none" stroke="#94a3b8" strokeLinecap="round" strokeWidth="2" />
              <ellipse cx="165" cy="535" fill="#0f172a" rx="19" ry="8" />
              <ellipse cx="238" cy="535" fill="#0f172a" rx="19" ry="8" />
            </g>

            {/* Kurta / Torso */}
            <g id="torso">
              <path d="M 148 240 Q 130 330 135 385 Q 200 400 268 385 Q 272 330 254 240 Z" fill="url(#kurtaGrad)" filter="url(#shadowBlur)" />
              <path d="M 136 345 Q 200 358 266 345 L 268 368 Q 200 382 135 368 Z" fill="#ef4444" />
              <circle cx="248" cy="378" fill="#dc2626" r="8" />
              <path d="M 246 384 Q 242 415 248 425 Q 254 415 250 384" fill="#b91c1c" />
              <path d="M 252 384 Q 260 410 265 418" fill="none" stroke="#ef4444" strokeLinecap="round" strokeWidth="4" />
              <g transform="translate(182, 268) scale(0.85)">
                <polygon fill="#ef4444" opacity="0.9" points="20,0 35,24 5,24" />
                <polygon fill="#22c55e" opacity="0.9" points="12,10 28,30 2,30" />
                <rect fill="#0f172a" height="4" rx="2" width="30" x="5" y="28" />
                <rect fill="#78350f" height="2" rx="1" width="20" x="10" y="34" />
              </g>
            </g>

            {/* Arms */}
            <g id="arm-left">
              <path d="M 152 245 L 126 276 L 142 292 L 164 256 Z" fill="#eab308" />
              <path d="M 130 278 L 138 318 L 152 316 L 140 285 Z" fill="#facc15" />
              <circle cx="145" cy="318" fill="#0f172a" r="10" />
              <path d="M 139 315 Q 138 326 150 324" fill="#1e293b" />
            </g>
            <g id="arm-right">
              <path d="M 250 245 L 278 265 L 268 282 L 242 258 Z" fill="#eab308" />
              <path d="M 272 268 L 308 264 L 306 278 L 268 280 Z" fill="#facc15" />
              <ellipse cx="312" cy="270" fill="#0f172a" rx="11" ry="9" transform="rotate(10 312 270)" />
              <path d="M 305 262 Q 312 258 318 263 Q 320 274 312 278" fill="#1e293b" />
            </g>

            {/* Head Assembly */}
            <g id="head-group">
              <g id="leftEar">
                <path d="M 148 162 C 105 155 100 178 135 186 C 145 188 152 178 148 162 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                <path d="M 140 166 C 118 163 115 174 135 179" fill="#fecdd3" opacity="0.6" />
              </g>
              <g id="rightEar">
                <path d="M 254 162 C 298 155 302 178 268 186 C 258 188 250 178 254 162 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                <path d="M 262 166 C 284 163 286 174 266 179" fill="#fecdd3" opacity="0.6" />
              </g>
              <path d="M 152 140 Q 140 120 134 124 Q 138 142 152 146 Z" fill="#1e293b" />
              <path d="M 250 140 Q 262 120 268 124 Q 264 142 250 146 Z" fill="#1e293b" />
              <path d="M 150 152 C 150 115 252 115 252 152 C 258 190 250 245 201 248 C 152 245 144 190 150 152 Z" fill="#ffffff" filter="url(#shadowBlur)" />

              <g id="cheeksGroup">
                <ellipse className="cheek-blush transition-all duration-300" cx="152" cy="192" fill="#fb7185" opacity={emotion === 'happy' ? 0.9 : 0.25} rx="10" ry="6" />
                <ellipse className="cheek-blush transition-all duration-300" cx="248" cy="192" fill="#fb7185" opacity={emotion === 'happy' ? 0.9 : 0.25} rx="10" ry="6" />
              </g>

              <path d="M 166 205 C 166 186 236 186 236 205 C 238 238 164 238 166 205 Z" fill="#0f172a" />
              <ellipse cx="185" cy="216" fill="#334155" rx="4.5" ry="3" />
              <ellipse cx="217" cy="216" fill="#334155" rx="4.5" ry="3" />

              <g id="eyebrowsGroup">
                <path
                  d={
                    emotion === 'happy'
                      ? 'M 164 141 Q 175 137 186 141'
                      : emotion === 'surprised'
                      ? 'M 164 136 Q 175 130 186 137'
                      : emotion === 'thinking'
                      ? 'M 164 138 Q 175 133 186 140'
                      : 'M 164 146 Q 175 143 186 146'
                  }
                  fill="none"
                  stroke="#1e293b"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <path
                  d={
                    emotion === 'happy'
                      ? 'M 216 141 Q 227 137 238 141'
                      : emotion === 'surprised'
                      ? 'M 216 137 Q 227 130 238 136'
                      : emotion === 'thinking'
                      ? 'M 216 148 Q 227 149 238 143'
                      : 'M 216 146 Q 227 143 238 146'
                  }
                  fill="none"
                  stroke="#1e293b"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
              </g>

              <g className="mouth-shape origin-center transition-all duration-200">
                {emotion === 'neutral' && <path d="M 190 236 Q 201 240 212 236" fill="none" stroke="#f43f5e" strokeLinecap="round" strokeWidth="3" />}
                {emotion === 'happy' && <path d="M 187 233 Q 201 248 215 233 Z" fill="#e11d48" stroke="#be123c" strokeWidth="1.5" />}
                {emotion === 'surprised' && <ellipse cx="201" cy="237" fill="#e11d48" rx="6" ry="8" stroke="#881337" strokeWidth="1.5" />}
                {emotion === 'thinking' && <path d="M 192 237 Q 201 234 210 238" fill="none" stroke="#f43f5e" strokeLinecap="round" strokeWidth="3" />}
              </g>

              {/* Left Eye */}
              <g id="leftEyeGroup" transform="translate(162, 150)">
                <ellipse cx="14" cy="14" fill="#ffffff" rx="13" ry="11" stroke="#94a3b8" strokeWidth="1.5" />
                {emotion === 'happy' ? (
                  <path d="M 2 15 Q 14 3 26 15" fill="none" stroke="#090d16" strokeLinecap="round" strokeWidth="3.5" />
                ) : (
                  <>
                    <clipPath id="leftEyeClip">
                      <ellipse cx="14" cy="14" rx="12" ry="10" />
                    </clipPath>
                    <g clipPath="url(#leftEyeClip)">
                      <g className="pupil" style={{ transform: `translate(${leftPupilOffset.x}px, ${leftPupilOffset.y}px)` }}>
                        <circle cx="14" cy="14" fill="#090d16" r={emotion === 'surprised' ? 9.5 : 7.5} />
                        <circle cx="16" cy="12" fill="#ffffff" r="2.5" />
                        <circle cx="12" cy="16" fill="#ffffff" opacity="0.7" r="1.2" />
                      </g>
                      <rect
                        className="eye-lid"
                        fill="#f1f5f9"
                        height="28"
                        width="28"
                        x="0"
                        y="0"
                        style={{ transform: isBlinking ? 'translate(0, 0px)' : 'translate(0, -28px)' }}
                      />
                    </g>
                  </>
                )}
              </g>

              {/* Right Eye */}
              <g id="rightEyeGroup" transform="translate(226, 150)">
                <ellipse cx="14" cy="14" fill="#ffffff" rx="13" ry="11" stroke="#94a3b8" strokeWidth="1.5" />
                {emotion === 'happy' ? (
                  <path d="M 2 15 Q 14 3 26 15" fill="none" stroke="#090d16" strokeLinecap="round" strokeWidth="3.5" />
                ) : (
                  <>
                    <clipPath id="rightEyeClip">
                      <ellipse cx="14" cy="14" rx="12" ry="10" />
                    </clipPath>
                    <g clipPath="url(#rightEyeClip)">
                      <g className="pupil" style={{ transform: `translate(${rightPupilOffset.x}px, ${rightPupilOffset.y}px)` }}>
                        <circle cx="14" cy="14" fill="#090d16" r={emotion === 'surprised' ? 9.5 : 7.5} />
                        <circle cx="16" cy="12" fill="#ffffff" r="2.5" />
                        <circle cx="12" cy="16" fill="#ffffff" opacity="0.7" r="1.2" />
                      </g>
                      <rect
                        className="eye-lid"
                        fill="#f1f5f9"
                        height="28"
                        width="28"
                        x="0"
                        y="0"
                        style={{ transform: isBlinking ? 'translate(0, 0px)' : 'translate(0, -28px)' }}
                      />
                    </g>
                  </>
                )}
              </g>

              {/* Turban */}
              <g className="animate-turban">
                <path d="M 148 135 C 145 90 255 85 254 135 Z" fill="#dc2626" />
                <path
                  id="turbanCrest"
                  className="transition-transform duration-300"
                  d="M 195 85 C 190 35 220 30 225 78 C 215 85 205 85 195 85 Z"
                  fill="url(#turbanGrad)"
                  style={{ transform: emotion === 'surprised' ? 'translateY(-8px) scale(1.15)' : 'none' }}
                />
                <path d="M 205 45 Q 212 60 216 78" fill="none" stroke="#fca5a5" strokeWidth="1.5" />
                <path d="M 146 128 C 170 102 245 106 256 130 C 235 152 165 150 146 128 Z" fill="url(#turbanGrad)" />
                <path d="M 152 135 C 175 118 238 122 250 142" fill="none" opacity="0.6" stroke="#b91c1c" strokeWidth="2.5" />
                <ellipse cx="201" cy="120" fill="#ef4444" rx="9" ry="8" />
                <circle cx="201" cy="120" fill="#facc15" r="4" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
});
