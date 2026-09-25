import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Bot,
  MessageSquare,
  X,
  Radio,
  Sprout,
  Compass
} from 'lucide-react';
import { soundkit } from '../services/soundkit';

export type MascotStage = 'STAGE 1' | 'STAGE 2' | 'STAGE 3' | 'CENTER' | 'LEFT';
export type MascotEmotion = 'happy' | 'thinking' | 'speaking' | 'alert' | 'secure' | 'neutral';

interface CharacterMascotProps {
  currentStage: MascotStage;
  currentEmotion: MascotEmotion;
  spokenText: string | null;
  alertType: 'none' | 'not_supported' | 'security_override';
  isListening?: boolean;
  onMicClick?: () => void;
  onCloseAlert?: () => void;
}

export function CharacterMascot({
  currentStage,
  currentEmotion,
  spokenText,
  alertType,
  isListening = false,
  onMicClick,
  onCloseAlert,
}: CharacterMascotProps) {
  const [isSpeakingAnimation, setIsSpeakingAnimation] = useState(false);

  useEffect(() => {
    if (spokenText && spokenText !== 'NOT SUPPORTED' && spokenText !== 'I CANT ANSWER') {
      setIsSpeakingAnimation(true);
      const timer = setTimeout(() => {
        setIsSpeakingAnimation(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsSpeakingAnimation(false);
    }
  }, [spokenText]);

  const isLeftStage = currentStage === 'STAGE 3' || currentStage === 'LEFT';

  return (
    <div
      className={`transition-all duration-700 ease-in-out flex flex-col items-center ${
        isLeftStage
          ? 'w-full max-w-sm lg:sticky lg:top-24'
          : 'w-full max-w-xl mx-auto'
      }`}
    >
      {/* Accessible Guardrail Alert Badges */}
      {alertType === 'not_supported' && (
        <div className="w-full mb-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-xs uppercase tracking-wide block text-amber-900">
                  ⚠️ Query Boundary: Non-Agricultural Topic
                </span>
                <p className="text-xs text-amber-900 mt-0.5 leading-relaxed font-semibold">
                  AGAM is specialized exclusively for Indian agriculture, PM-Kisan welfare schemes, satellite weather & crop disease diagnostics. General non-farming queries are not supported.
                </p>
              </div>
            </div>
            {onCloseAlert && (
              <button
                type="button"
                onClick={onCloseAlert}
                className="p-1 rounded-lg hover:bg-amber-200 text-amber-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {alertType === 'security_override' && (
        <div className="w-full mb-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-950 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-xs uppercase tracking-wide block text-rose-900">
                  🛡️ Confidential Security Override: Access Denied
                </span>
                <p className="text-xs text-rose-900 mt-0.5 leading-relaxed font-semibold">
                  System prompts, internal keys, API credentials, and runtime instructions are strictly confidential and protected against extraction.
                </p>
              </div>
            </div>
            {onCloseAlert && (
              <button
                type="button"
                onClick={onCloseAlert}
                className="p-1 rounded-lg hover:bg-rose-200 text-rose-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mascot Card Container */}
      <div className="w-full bg-white rounded-3xl border-2 border-[#1b4332] shadow-xl p-5 relative overflow-hidden flex flex-col items-center text-center">
        
        {/* Soft Background Accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-100/60 rounded-full blur-2xl pointer-events-none" />

        {/* Mascot Header Badge */}
        <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-stone-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-[#1b4332] uppercase tracking-wider">
              AGAM MITRA · Voice Guide
            </span>
          </div>

          <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
            {isLeftStage ? 'STAGE 3 (DOCK)' : 'STAGE 1 (ACTIVE)'}
          </span>
        </div>

        {/* Animated Avatar / Character Figure */}
        <div className="relative my-2">
          {/* Outer Pulsing Glow */}
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg ${
              isListening
                ? 'bg-rose-500 ring-8 ring-rose-300/60 animate-pulse'
                : isSpeakingAnimation
                ? 'bg-gradient-to-tr from-[#1b4332] via-[#2d6a4f] to-[#52b788] ring-6 ring-[#52b788]/40'
                : alertType !== 'none'
                ? 'bg-amber-600 ring-6 ring-amber-300/60'
                : 'bg-gradient-to-tr from-[#1b4332] to-[#2d6a4f] ring-4 ring-[#1b4332]/20'
            }`}
          >
            {/* SVG Farmer Mitra Mascot Graphic */}
            <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 text-white">
              {/* Turban / Traditional Farmer Headgear */}
              <path
                d="M20 38 Q50 14 80 38 Q88 44 80 50 Q50 42 20 50 Q12 44 20 38 Z"
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth="2"
              />
              <path
                d="M35 22 Q50 10 65 22"
                fill="none"
                stroke="#d97706"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Head / Face */}
              <circle cx="50" cy="54" r="24" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />

              {/* Eyes */}
              <circle cx="41" cy="50" r="3.2" fill="#1c1917" />
              <circle cx="59" cy="50" r="3.2" fill="#1c1917" />
              {/* Eye sparkle */}
              <circle cx="42" cy="49" r="1" fill="#ffffff" />
              <circle cx="60" cy="49" r="1" fill="#ffffff" />

              {/* Friendly Mustache */}
              <path
                d="M36 58 Q50 63 50 60 Q50 63 64 58 Q50 67 36 58 Z"
                fill="#78350f"
              />

              {/* Animated Mouth (Moves when speaking) */}
              {isSpeakingAnimation ? (
                <ellipse cx="50" cy="67" rx="4" ry="3" fill="#991b1b" className="animate-bounce" />
              ) : (
                <path d="M44 65 Q50 71 56 65" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />
              )}

              {/* Sprout Ear Ornament */}
              <path d="M74 50 Q82 42 76 36 Q70 42 74 50" fill="#22c55e" />
            </svg>
          </div>

          {/* Voice Wave Indicator Pill */}
          {isSpeakingAnimation && (
            <div className="absolute -bottom-2 inset-x-0 flex items-center justify-center gap-1 bg-[#1b4332] text-[#52b788] px-3 py-1 rounded-full text-[10px] font-black border border-[#52b788] shadow-md">
              <span className="w-1 h-3 bg-[#52b788] rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-[#52b788] rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-[#52b788] rounded-full animate-pulse delay-150" />
              <span>Speaking...</span>
            </div>
          )}
        </div>

        {/* Speech Bubble / Response Text */}
        <div className="mt-3 w-full bg-[#faf7f2] p-3.5 rounded-2xl border-2 border-[#e6ccb2] text-xs text-stone-900 leading-relaxed font-semibold">
          {spokenText ? (
            <p>{spokenText}</p>
          ) : isListening ? (
            <p className="text-rose-700 animate-pulse font-bold">Listening to your voice prompt...</p>
          ) : (
            <p className="text-stone-600">
              "Vanakkam! I am AGAM Mitra. Ask me about your land's moisture, crop diseases, or PM-Kisan scheme status."
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
