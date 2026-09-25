import React, { useEffect, useState } from 'react';
import { Sprout, ChevronRight } from 'lucide-react';

interface OpeningSplashScreenProps {
  onComplete: () => void;
}

export function OpeningSplashScreen({ onComplete }: OpeningSplashScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Trigger smooth transition out
  const handleProceed = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  // Auto-transition timer (2.8 seconds total) with smooth progress bar
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2800;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        handleProceed();
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={handleProceed}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleProceed();
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between select-none cursor-pointer overflow-hidden transition-opacity duration-400 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#070d08',
      }}
    >
      {/* Embedded Scoped Keyframes for Ambient Light Streaks & Map Pulse */}
      <style>{`
        @keyframes lightBeamMove1 {
          0% { transform: translate(-30%, -30%) rotate(-35deg); opacity: 0.12; }
          50% { transform: translate(15%, 15%) rotate(-32deg); opacity: 0.22; }
          100% { transform: translate(-30%, -30%) rotate(-35deg); opacity: 0.12; }
        }
        @keyframes lightBeamMove2 {
          0% { transform: translate(30%, 20%) rotate(-45deg); opacity: 0.08; }
          50% { transform: translate(-10%, -15%) rotate(-42deg); opacity: 0.18; }
          100% { transform: translate(30%, 20%) rotate(-45deg); opacity: 0.08; }
        }
        @keyframes ambientGlowPulse {
          0%, 100% { opacity: 0.25; transform: scale(0.95); }
          50% { opacity: 0.45; transform: scale(1.08); }
        }
        @keyframes mapFloatAndGlow {
          0%, 100% {
            transform: translateY(0px) scale(1);
            filter: drop-shadow(0 0 16px rgba(52, 211, 153, 0.45)) drop-shadow(0 0 35px rgba(16, 185, 129, 0.25));
          }
          50% {
            transform: translateY(-4px) scale(1.018);
            filter: drop-shadow(0 0 26px rgba(52, 211, 153, 0.7)) drop-shadow(0 0 55px rgba(16, 185, 129, 0.4));
          }
        }
        @keyframes telemetryRadar {
          0% { r: 3; opacity: 1; stroke-width: 1.5; }
          100% { r: 16; opacity: 0; stroke-width: 0.5; }
        }
      `}</style>

      {/* BACKGROUND LAYER 1: Subtle moving green light streaks / diagonal beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Diagonal Light Beam 1 */}
        <div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
          style={{
            background:
              'linear-gradient(135deg, transparent 42%, rgba(52, 211, 153, 0.12) 48%, rgba(16, 185, 129, 0.2) 50%, rgba(5, 150, 105, 0.1) 52%, transparent 58%)',
            animation: 'lightBeamMove1 18s ease-in-out infinite',
            filter: 'blur(40px)',
          }}
        />

        {/* Counter Light Beam 2 */}
        <div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
          style={{
            background:
              'linear-gradient(125deg, transparent 40%, rgba(16, 185, 129, 0.08) 47%, rgba(110, 231, 183, 0.15) 50%, transparent 60%)',
            animation: 'lightBeamMove2 24s ease-in-out infinite',
            filter: 'blur(55px)',
          }}
        />

        {/* Center ambient radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.12) 40%, transparent 70%)',
            animation: 'ambientGlowPulse 6s ease-in-out infinite',
            filter: 'blur(30px)',
          }}
        />

        {/* Subtle high-tech agronomic grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(rgba(52, 211, 153, 0.8) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* TOP: Subtle Brand Pill */}
      <div className="relative z-10 pt-8 sm:pt-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/20 backdrop-blur-md shadow-lg shadow-emerald-950/40">
          <Sprout className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest text-emerald-300 uppercase">
            Pan-India Telemetry
          </span>
        </div>
      </div>

      {/* CENTERPIECE: SVG Map of India in Solid Teal/Green with Glowing Outline */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-lg my-auto">
        <div
          className="relative flex items-center justify-center"
          style={{
            animation: 'mapFloatAndGlow 5.5s ease-in-out infinite',
          }}
        >
          {/* India Map Outline SVG */}
          <svg
            viewBox="0 0 500 680"
            className="w-64 sm:w-80 md:w-88 h-auto max-h-[46vh] transition-all"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Solid Rich Emerald / Teal Gradient Fill */}
              <linearGradient id="indiaTealFill" x1="250" y1="40" x2="250" y2="670" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0b5e47" />
                <stop offset="45%" stopColor="#0d6d52" />
                <stop offset="85%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#04392b" />
              </linearGradient>

              {/* Glowing Outline Gradient */}
              <linearGradient id="glowingStroke" x1="0" y1="0" x2="500" y2="680" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>

              {/* Inner Mesh Grid Pattern for Agri-Telemetry Vibe */}
              <pattern id="telemetryGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(110, 231, 183, 0.08)" strokeWidth="0.75" />
              </pattern>
            </defs>

            {/* Solid Teal/Green Map Shape of India */}
            <path
              d="
                M 235 45
                C 248 38, 260 52, 265 72
                C 272 90, 284 105, 290 125
                C 285 145, 308 160, 328 172
                C 348 182, 362 178, 376 192
                C 382 202, 396 198, 412 194
                C 432 188, 458 202, 468 222
                C 478 242, 474 262, 464 278
                C 454 298, 444 318, 438 348
                C 434 368, 424 382, 414 378
                C 400 372, 390 348, 380 354
                C 370 358, 365 372, 360 382
                C 354 392, 344 408, 334 414
                C 318 434, 304 464, 288 498
                C 278 528, 264 568, 248 608
                C 242 628, 234 654, 230 664
                C 224 664, 218 648, 214 624
                C 204 594, 194 558, 184 518
                C 174 488, 164 458, 154 434
                C 144 418, 134 408, 118 414
                C 98 424, 78 408, 68 388
                C 58 368, 68 348, 92 344
                C 112 338, 108 318, 122 298
                C 132 278, 142 248, 158 218
                C 168 198, 182 168, 192 138
                C 202 112, 214 78, 224 58
                Z
              "
              fill="url(#indiaTealFill)"
              stroke="url(#glowingStroke)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Inner Agro-Telemetry Grid Fill */}
            <path
              d="
                M 235 45
                C 248 38, 260 52, 265 72
                C 272 90, 284 105, 290 125
                C 285 145, 308 160, 328 172
                C 348 182, 362 178, 376 192
                C 382 202, 396 198, 412 194
                C 432 188, 458 202, 468 222
                C 478 242, 474 262, 464 278
                C 454 298, 444 318, 438 348
                C 434 368, 424 382, 414 378
                C 400 372, 390 348, 380 354
                C 370 358, 365 372, 360 382
                C 354 392, 344 408, 334 414
                C 318 434, 304 464, 288 498
                C 278 528, 264 568, 248 608
                C 242 628, 234 654, 230 664
                C 224 664, 218 648, 214 624
                C 204 594, 194 558, 184 518
                C 174 488, 164 458, 154 434
                C 144 418, 134 408, 118 414
                C 98 424, 78 408, 68 388
                C 58 368, 68 348, 92 344
                C 112 338, 108 318, 122 298
                C 132 278, 142 248, 158 218
                C 168 198, 182 168, 192 138
                C 202 112, 214 78, 224 58
                Z
              "
              fill="url(#telemetryGrid)"
            />

            {/* Southern Peninsula Telemetry Pulse (Tamil Nadu / Deccan farmlands) */}
            <g transform="translate(236, 580)">
              <circle cx="0" cy="0" r="3.5" fill="#34d399" />
              <circle
                cx="0"
                cy="0"
                r="12"
                fill="none"
                stroke="#6ee7b7"
                style={{ animation: 'telemetryRadar 2.2s infinite ease-out' }}
              />
            </g>

            {/* Northern Agricultural Belt Telemetry Pulse (Gangetic / Punjab plains) */}
            <g transform="translate(240, 230)">
              <circle cx="0" cy="0" r="3.5" fill="#34d399" />
              <circle
                cx="0"
                cy="0"
                r="12"
                fill="none"
                stroke="#6ee7b7"
                style={{ animation: 'telemetryRadar 2.4s infinite ease-out 0.8s' }}
              />
            </g>

            {/* Western Agricultural Belt Pulse (Maharashtra / Gujarat) */}
            <g transform="translate(160, 390)">
              <circle cx="0" cy="0" r="3" fill="#34d399" />
              <circle
                cx="0"
                cy="0"
                r="10"
                fill="none"
                stroke="#6ee7b7"
                style={{ animation: 'telemetryRadar 2.6s infinite ease-out 1.2s' }}
              />
            </g>

            {/* Eastern Agricultural Belt Pulse (Bengal / Odisha) */}
            <g transform="translate(340, 370)">
              <circle cx="0" cy="0" r="3" fill="#34d399" />
              <circle
                cx="0"
                cy="0"
                r="10"
                fill="none"
                stroke="#6ee7b7"
                style={{ animation: 'telemetryRadar 2.5s infinite ease-out 0.4s' }}
              />
            </g>

            {/* Andaman & Nicobar Archipelago micro-markers */}
            <circle cx="430" cy="550" r="2.5" fill="#34d399" opacity="0.85" />
            <circle cx="434" cy="570" r="2" fill="#34d399" opacity="0.75" />
            <circle cx="438" cy="595" r="2" fill="#34d399" opacity="0.65" />

            {/* Lakshadweep micro-markers */}
            <circle cx="160" cy="610" r="2" fill="#34d399" opacity="0.8" />
            <circle cx="164" cy="628" r="1.8" fill="#34d399" opacity="0.7" />
          </svg>
        </div>

        {/* App Title & Tagline */}
        <div className="mt-6 sm:mt-8 text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest text-white drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
            AGAM
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-emerald-400/95 max-w-sm mx-auto">
            AI-Guided Agriculture Management
          </p>
          <p className="text-[11px] text-stone-400 font-mono tracking-wide">
            NASA Soil Moisture · Crop Diagnostics · Agro-Intelligence
          </p>
        </div>
      </div>

      {/* BOTTOM: Smooth Progress Indicator & Tap to Continue Prompt */}
      <div className="relative z-10 pb-8 sm:pb-10 w-full max-w-xs px-4 flex flex-col items-center gap-3">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-stone-900 rounded-full overflow-hidden border border-emerald-950">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Tap to continue prompt */}
        <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium hover:text-emerald-300 transition-colors">
          <span>Tap anywhere to continue</span>
          <ChevronRight className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
