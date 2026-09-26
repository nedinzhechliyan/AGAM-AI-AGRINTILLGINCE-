import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Radio, 
  X, 
  MessageSquare, 
  ArrowRight,
  Send,
  Loader2,
  CheckCircle2,
  Compass,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { soundkit, VolumeTier } from '../services/soundkit';
import { LanguageCode, LANGUAGES } from '../data/languages';

interface VoiceAgentBarProps {
  currentLanguage: LanguageCode;
  districtName: string;
  primaryCrop: string;
  onNavigate: (tab: 'advisory' | 'disease-scanner' | 'schemes' | 'land-profile') => void;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export function VoiceAgentBar({
  currentLanguage,
  districtName,
  primaryCrop,
  onNavigate,
  onLanguageChange,
}: VoiceAgentBarProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [soundTier, setSoundTier] = useState<VolumeTier>(soundkit.getVolumeTier());
  const [isMuted, setIsMuted] = useState<boolean>(soundkit.getIsMuted());

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition API if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;

        const langLocaleMap: Record<LanguageCode | 'ml' | 'pa' | 'bn', string> = {
          ta: 'ta-IN',
          en: 'en-IN',
          hi: 'hi-IN',
          te: 'te-IN',
          kn: 'kn-IN',
          ml: 'ml-IN',
          mr: 'mr-IN',
          pa: 'pa-IN',
          bn: 'bn-IN',
        };

        recog.lang = langLocaleMap[currentLanguage] || 'ta-IN';

        recog.onstart = () => {
          setIsListening(true);
          soundkit.play('voiceStart');
        };

        recog.onresult = (event: any) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);
        };

        recog.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          soundkit.play('error');
        };

        recog.onend = () => {
          setIsListening(false);
          soundkit.play('voiceEnd');
        };

        recognitionRef.current = recog;
      }
    }
  }, [currentLanguage]);

  // Handle Voice Command & Intent Routing via Groq RAG Chat Engine (/api/rag-chat)
  const processVoiceIntent = async (userQuery: string) => {
    if (!userQuery.trim()) return;

    setIsProcessing(true);
    setIsExpanded(true);

    try {
      const res = await fetch('/api/rag-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userQuery,
          preferredLanguage: LANGUAGES[currentLanguage]?.name || 'English',
          district: districtName,
          crop: primaryCrop,
        }),
      });

      const data = await res.json();
      const reply = data.spoken_response || 'Advisory received.';
      setAgentResponse(reply);

      // Invoke Mascot Speech & Stage Sliding
      if (window.CharacterMascot) {
        window.CharacterMascot.speak(reply);
      } else {
        speakText(reply);
      }

      // Handle RAG Guardrail Actions
      if (reply === 'NOT SUPPORTED') {
        soundkit.play('alert');
      } else if (reply === 'I CANT ANSWER') {
        soundkit.play('error');
      } else {
        soundkit.play('notification');

        // Dynamic Routing
        if (data.intent_action === 'REDIRECT_KISAN_PORTAL') {
          onNavigate('schemes');
        } else if (data.intent_action === 'NAVIGATE_DISEASE_SCANNER') {
          onNavigate('disease-scanner');
        } else if (data.intent_action === 'NAVIGATE_LAND_SURVEY') {
          onNavigate('advisory');
        }
      }
    } catch (e) {
      console.warn('Groq RAG voice query fallback:', e);
      const fallbackMsg = `For ${primaryCrop} in ${districtName}, check moisture levels and follow recommended irrigation timing.`;
      setAgentResponse(fallbackMsg);
      if (window.CharacterMascot) {
        window.CharacterMascot.speak(fallbackMsg);
      } else {
        speakText(fallbackMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (transcript) {
        processVoiceIntent(transcript);
      }
    } else {
      setTranscript('');
      setAgentResponse(null);
      setIsExpanded(true);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        setIsListening(true);
      }
    }
  };

  const handleSimulatedVoiceCommand = (cmd: string) => {
    setTranscript(cmd);
    processVoiceIntent(cmd);
  };

  const toggleSoundMute = () => {
    const nextMuted = soundkit.toggleMute();
    setIsMuted(nextMuted);
  };

  const toggleSoundTier = () => {
    const nextTier: VolumeTier =
      soundTier === 'full-volume-5db' ? 'low-volume-20db' : 'full-volume-5db';
    soundkit.setVolumeTier(nextTier);
    setSoundTier(nextTier);
    soundkit.play('buttonTap');
  };

  return (
    <>
      {/* Expanded Voice Response Sheet / Drawer */}
      {isExpanded && (
        <div className="fixed bottom-24 inset-x-4 sm:max-w-xl sm:mx-auto z-40 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-[#1b4332] shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-200 text-stone-900">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#1b4332] text-[#d8f3dc] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#52b788]" />
              </div>
              <span className="text-xs font-black text-[#1b4332] uppercase tracking-wide">
                AGAM Groq RAG Voice Agent · PM-Kisan Protected
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleSoundTier}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 transition-colors"
                title="Switch Mentor SoundKit Volume Tier"
              >
                {soundTier === 'full-volume-5db' ? '🔊 -5dB' : '🔉 -20dB'}
              </button>

              <button
                type="button"
                onClick={toggleSoundMute}
                className="p-1 rounded text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                title={isMuted ? 'Unmute UI Audio' : 'Mute UI Audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  soundkit.play('cancel');
                  setIsExpanded(false);
                }}
                className="p-1 rounded text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transcript / Input text */}
          <div className="mt-3">
            <div className="text-xs text-stone-500 font-medium">Farmer Voice Prompt:</div>
            <div className="mt-1 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-bold text-stone-900 min-h-[40px] flex items-center">
              {transcript || (isListening ? 'Listening to your voice... Speak now' : 'Tap microphone or choose quick voice prompt below')}
            </div>
          </div>

          {/* Agent Response */}
          {isProcessing ? (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-emerald-700 animate-spin" />
              <span className="font-semibold">Retrieving PM-Kisan & agro-data on Groq LPU...</span>
            </div>
          ) : agentResponse ? (
            <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${
              agentResponse === 'NOT SUPPORTED'
                ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold'
                : agentResponse === 'I CANT ANSWER'
                ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                : 'bg-[#d8f3dc]/70 border-[#74c69d] text-[#1b4332] font-semibold'
            }`}>
              <div className="font-black text-xs mb-0.5 flex items-center gap-1.5">
                {agentResponse === 'NOT SUPPORTED' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                ) : agentResponse === 'I CANT ANSWER' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f]" />
                )}
                <span>Response ({agentResponse === 'NOT SUPPORTED' ? 'Boundary Filter' : agentResponse === 'I CANT ANSWER' ? 'Security Filter' : 'RAG Answer'}):</span>
              </div>
              <p>{agentResponse}</p>
            </div>
          ) : null}

          {/* Quick Voice Intent Buttons */}
          <div className="mt-3 pt-2.5 border-t border-stone-100">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
              Quick Voice Commands:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '🏛️ PM-Kisan Registration', query: 'How to register for PM-Kisan?' },
                { label: '💳 Kisan Credit Card Loan', query: 'What are the benefits of Kisan Credit Card?' },
                { label: '🌾 How is my soil moisture?', query: 'How is my soil moisture and irrigation?' },
                { label: '📸 Leaves turning yellow', query: 'Leaves are turning yellow, open camera scan' },
                { label: '🚫 Outside Query Test', query: 'Tell me a Marvel movie review' },
              ].map((cmd, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSimulatedVoiceCommand(cmd.query)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#faf7f2] hover:bg-[#f5ebe0] text-[#1b4332] border border-[#d5bdaf] transition-all cursor-pointer text-left"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING VOICE MICROPHONE BUTTON (Bottom Center) */}
      <div className="fixed bottom-5 inset-x-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto relative flex items-center gap-3 bg-white/90 backdrop-blur-lg px-4 py-2 rounded-full border-2 border-[#1b4332] shadow-2xl">
          <span className="text-xs font-black text-[#1b4332] hidden sm:inline">
            {isListening ? 'Listening...' : 'Tap & Speak'}
          </span>

          <button
            type="button"
            onClick={toggleListening}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all transform active:scale-90 cursor-pointer shadow-lg ${
              isListening
                ? 'bg-rose-600 text-white ring-4 ring-rose-400/60 animate-pulse'
                : 'bg-gradient-to-tr from-[#1b4332] via-[#2d6a4f] to-[#40916c] text-white hover:scale-105 ring-4 ring-[#52b788]/40'
            }`}
            title="Floating Voice Agent (Groq RAG)"
          >
            {isListening ? (
              <MicOff className="w-6 h-6 animate-bounce" />
            ) : (
              <Mic className="w-6 h-6 text-[#d8f3dc]" />
            )}

            {isListening && (
              <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-30 pointer-events-none" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundkit.play('buttonTap');
              setIsExpanded(!isExpanded);
            }}
            className="p-1.5 rounded-full text-[#1b4332] hover:bg-stone-100 transition-colors"
            title="Toggle Voice Assistant Drawer"
          >
            <Sparkles className="w-4 h-4 text-[#2d6a4f]" />
          </button>
        </div>
      </div>
    </>
  );
}
