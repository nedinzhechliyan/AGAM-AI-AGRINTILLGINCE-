/**
 * VoiceCapsule — the floating mic capsule that travels to every lane.
 * Speech recognition + transcript display + quick voice command pills.
 * The mascot answers through it, so the farmer NEVER needs to read menus.
 */
import React from 'react';
import { Mic, MicOff, MessageSquare } from 'lucide-react';
import { LanguageCode } from '../data/languages';
import { MASCOT_DIALOGUES, DialogueLang } from '../data/mascotDialogues';

interface VoiceCapsuleProps {
  isListening: boolean;
  isSpeaking: boolean;
  voiceTranscript: string;
  currentLanguage: LanguageCode;
  onMicClick: () => void;
  quickCommands?: Array<{ label: string; onClick: () => void }>;
}

export function toDialogueLang(lang: LanguageCode): DialogueLang {
  return lang === 'ta' ? 'ta' : lang === 'hi' ? 'hi' : 'en';
}

export function VoiceCapsule({
  isListening,
  isSpeaking,
  voiceTranscript,
  currentLanguage,
  onMicClick,
  quickCommands = [],
}: VoiceCapsuleProps) {
  const dlg = MASCOT_DIALOGUES[toDialogueLang(currentLanguage)];

  return (
    <div className="w-full max-w-xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full h-16 sm:h-20 rounded-[28px] sm:rounded-[36px] bg-gradient-to-r from-slate-200 via-purple-100 to-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.65),0_0_28px_rgba(168,85,247,0.22)] border border-white/60 backdrop-blur-md flex items-center justify-between px-5 sm:px-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/45 to-transparent pointer-events-none" />

        {(isListening || isSpeaking) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-purple-500/20 animate-ping" />
            <div className="w-16 h-16 rounded-full bg-indigo-500/30 animate-pulse" />
          </div>
        )}

        {/* Left equalizer bars */}
        <div className="flex items-center gap-1 sm:gap-1.5 h-6 z-10 w-16 sm:w-20">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isListening || isSpeaking
                  ? `bg-purple-600 animate-[soundwave_0.${4 + i}s_ease-in-out_infinite_${i * 0.1}s]`
                  : i % 2 === 0
                  ? 'bg-slate-400 h-2.5'
                  : 'bg-slate-400 h-4'
              }`}
            />
          ))}
        </div>

        {/* Center mic button */}
        <button
          onClick={onMicClick}
          title={isListening ? 'Listening... click to stop' : dlg.micPrompt}
          className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-90 ${
            isListening
              ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white scale-110 shadow-red-500/50 ring-4 ring-rose-400/50'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-100 hover:scale-105 shadow-slate-900/40 ring-2 ring-white/50'
          }`}
        >
          {isListening ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Right status badge */}
        <div className="z-10 w-16 sm:w-20 flex justify-end">
          {isListening ? (
            <span className="px-2.5 py-1 rounded-full bg-red-100/90 text-red-700 text-[10px] sm:text-[11px] font-bold animate-pulse font-mono-code">
              {currentLanguage === 'ta' ? 'கேட்கிறேன்' : currentLanguage === 'hi' ? 'सुन रहा हूँ' : 'Listening'}
            </span>
          ) : isSpeaking ? (
            <span className="px-2.5 py-1 rounded-full bg-purple-100/90 text-purple-700 text-[10px] sm:text-[11px] font-bold font-mono-code">
              {currentLanguage === 'ta' ? 'பேசுகிறேன்' : currentLanguage === 'hi' ? 'बोल रहा हूँ' : 'Speaking'}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-slate-900/10 text-slate-700 text-[10px] sm:text-[11px] font-semibold font-mono-code">
              AGAM AI
            </span>
          )}
        </div>
      </div>

      {/* Transcript / hint line */}
      <div className="mt-2.5 flex items-center gap-2 text-xs font-mono-code text-center">
        {isListening ? (
          <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            {dlg.micPrompt}
          </span>
        ) : voiceTranscript ? (
          <span className="text-slate-300 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            {voiceTranscript}
          </span>
        ) : (
          <span className="text-slate-400">{dlg.micPrompt}</span>
        )}
      </div>

      {/* Quick command pills */}
      {quickCommands.length > 0 && (
        <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
          {quickCommands.map((cmd) => (
            <button
              key={cmd.label}
              onClick={cmd.onClick}
              className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-medium text-slate-300 hover:text-amber-300 transition active:scale-95 cursor-pointer shadow-sm"
            >
              💬 {cmd.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
