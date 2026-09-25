/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  Copy,
  X,
  Check,
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Sprout,
  Shield,
  ChevronDown,
  CloudSun,
  Scan,
  Building2,
  Globe2,
  ExternalLink,
  Layers
} from 'lucide-react';

import LandAndWeather from './components/LandAndWeather.tsx';
import CropDoctor from './components/CropDoctor.tsx';
import PMKisanSchemes from './components/PMKisanSchemes.tsx';
import FarmlandPolygon from './components/FarmlandPolygon.tsx';

declare global {
  interface Window {
    CharacterMascot?: {
      lookAt: (x: number, y: number) => void;
      speak: (text?: string) => void;
      stopSpeak: () => void;
      blink: () => void;
      setEmotion: (name: 'neutral' | 'happy' | 'surprised' | 'thinking') => void;
      getEmotion: () => string;
      togglePlough: (force?: boolean) => void;
      setTool: (toolName: string, isEquipped: boolean) => void;
      isPloughEquipped: () => boolean;
      moo: () => void;
      setPage: (page: 'full' | 'passport') => void;
      getPage: () => 'full' | 'passport';
      toggleMic: (force?: boolean) => void;
      emotions: string[];
    };
    setEmotion?: (name: 'neutral' | 'happy' | 'surprised' | 'thinking') => void;
  }
}

type Emotion = 'neutral' | 'happy' | 'surprised' | 'thinking';
type MascotZoomMode = 'full' | 'passport';
type NavTab = 'mascot' | 'weather' | 'cropDoctor' | 'schemes' | 'polygon';

const PHRASES = [
  "Desi hal on my shoulder, ready to cultivate victory!",
  "Welcome to AGAM! Voice-first farming intelligence at your service!",
  "Jai Kisan! Strength and tradition together!",
  "My eyes are always tracking your moves!",
  "Let's win this match with champion energy!"
];

const VOICE_COMMANDS = [
  { label: 'Say Hello', prompt: 'Hello friend! Ready to cultivate greatness today with AGAM!', emotion: 'happy' as Emotion },
  { label: 'Farm Wisdom', prompt: 'A sturdy wooden hal and fertile soil can feed an entire nation!', emotion: 'thinking' as Emotion },
  { label: 'Surprise Me', prompt: 'Woah! Did you see how sharp my plough turns!', emotion: 'surprised' as Emotion },
  { label: 'Cow Moo', prompt: 'MOOOOO! 🐮 Always proud to be your champion farming mascot!', emotion: 'happy' as Emotion }
];

// Rich, authentic cow "MOOO" synthesizer using Web Audio API
const playCowMooSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const t = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const subOsc = ctx.createOscillator();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    subOsc.type = 'sine';

    osc1.frequency.setValueAtTime(130, t);
    osc1.frequency.linearRampToValueAtTime(152, t + 0.28);
    osc1.frequency.exponentialRampToValueAtTime(122, t + 1.05);
    osc1.frequency.exponentialRampToValueAtTime(94, t + 1.75);

    osc2.frequency.setValueAtTime(131, t);
    osc2.frequency.linearRampToValueAtTime(153, t + 0.28);
    osc2.frequency.exponentialRampToValueAtTime(123, t + 1.05);
    osc2.frequency.exponentialRampToValueAtTime(95, t + 1.75);

    subOsc.frequency.setValueAtTime(65, t);
    subOsc.frequency.linearRampToValueAtTime(76, t + 0.28);
    subOsc.frequency.exponentialRampToValueAtTime(61, t + 1.05);
    subOsc.frequency.exponentialRampToValueAtTime(47, t + 1.75);

    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(390, t);
    bpf.frequency.linearRampToValueAtTime(540, t + 0.35);
    bpf.frequency.exponentialRampToValueAtTime(330, t + 1.5);
    bpf.Q.setValueAtTime(4.2, t);

    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(700, t);
    lpf.frequency.linearRampToValueAtTime(900, t + 0.35);
    lpf.frequency.exponentialRampToValueAtTime(520, t + 1.6);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(5.2, t);
    lfoGain.gain.setValueAtTime(3.0, t);
    lfo.connect(osc1.frequency);
    lfo.connect(osc2.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.9, t + 0.2);
    gain.gain.setValueAtTime(0.85, t + 0.85);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

    osc1.connect(bpf);
    osc2.connect(bpf);
    subOsc.connect(lpf);
    bpf.connect(lpf);
    lpf.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(t);
    osc1.start(t);
    osc2.start(t);
    subOsc.start(t);

    lfo.stop(t + 1.85);
    osc1.stop(t + 1.85);
    osc2.stop(t + 1.85);
    subOsc.stop(t + 1.85);
  } catch (err) {
    console.warn("Cow moo audio playback error:", err);
  }
};

export default function App() {
  // Top Level AGAM Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('mascot');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  // Mascot & Animation State
  const [mascotZoom, setMascotZoom] = useState<MascotZoomMode>('full');
  const [showMic, setShowMic] = useState<boolean>(true);
  const [emotion, setEmotionState] = useState<Emotion>('neutral');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentDialogue, setCurrentDialogue] = useState<string>(PHRASES[0]);
  const [ploughEquipped, setPloughEquipped] = useState<boolean>(true);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [eyeOffsetStr, setEyeOffsetStr] = useState<string>('±0.0px');
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Voice Interaction State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  const stageRef = useRef<HTMLDivElement>(null);
  const mascotActorRef = useRef<HTMLDivElement>(null);
  const leftEyeGroupRef = useRef<SVGGElement>(null);
  const rightEyeGroupRef = useRef<SVGGElement>(null);
  const phraseIdxRef = useRef<number>(0);
  const emotionRef = useRef<Emotion>(emotion);
  emotionRef.current = emotion;
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  isSpeakingRef.current = isSpeaking;
  const ploughEquippedRef = useRef<boolean>(ploughEquipped);
  ploughEquippedRef.current = ploughEquipped;
  const mascotZoomRef = useRef<MascotZoomMode>(mascotZoom);
  mascotZoomRef.current = mascotZoom;

  // Eye pupil offsets for SVG transform
  const [leftPupilOffset, setLeftPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rightPupilOffset, setRightPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  }, []);

  const performBlink = useCallback(() => {
    if (emotionRef.current === 'happy') return;
    setIsBlinking(true);
    setTimeout(() => {
      setIsBlinking(false);
    }, 150);
  }, []);

  // Eye Tracking Math
  const trackTarget = useCallback((clientX: number, clientY: number) => {
    setCursorPos({ x: Math.round(clientX), y: Math.round(clientY) });

    if (emotionRef.current === 'happy') {
      return;
    }

    if (emotionRef.current === 'thinking') {
      setLeftPupilOffset({ x: 4.5, y: -5.5 });
      setRightPupilOffset({ x: 4.5, y: -5.5 });
      setEyeOffsetStr('+4.5px (Thinking)');
      return;
    }

    const MAX_PUPIL_DISPLACEMENT = 7.5;

    let lX = 0;
    let lY = 0;
    if (leftEyeGroupRef.current) {
      const leftBox = leftEyeGroupRef.current.getBoundingClientRect();
      const leftCenterX = leftBox.left + leftBox.width / 2;
      const leftCenterY = leftBox.top + leftBox.height / 2;

      const deltaLeftX = clientX - leftCenterX;
      const deltaLeftY = clientY - leftCenterY;
      const distLeft = Math.hypot(deltaLeftX, deltaLeftY) || 1;
      const angleLeft = Math.atan2(deltaLeftY, deltaLeftX);
      const clampLeft = Math.min(MAX_PUPIL_DISPLACEMENT, distLeft / 22);

      lX = Math.cos(angleLeft) * clampLeft;
      lY = Math.sin(angleLeft) * clampLeft;
      setLeftPupilOffset({ x: Number(lX.toFixed(2)), y: Number(lY.toFixed(2)) });
    }

    let rX = 0;
    let rY = 0;
    if (rightEyeGroupRef.current) {
      const rightBox = rightEyeGroupRef.current.getBoundingClientRect();
      const rightCenterX = rightBox.left + rightBox.width / 2;
      const rightCenterY = rightBox.top + rightBox.height / 2;

      const deltaRightX = clientX - rightCenterX;
      const deltaRightY = clientY - rightCenterY;
      const distRight = Math.hypot(deltaRightX, deltaRightY) || 1;
      const angleRight = Math.atan2(deltaRightY, deltaRightX);
      const clampRight = Math.min(MAX_PUPIL_DISPLACEMENT, distRight / 22);

      rX = Math.cos(angleRight) * clampRight;
      rY = Math.sin(angleRight) * clampRight;
      setRightPupilOffset({ x: Number(rX.toFixed(2)), y: Number(rY.toFixed(2)) });
    }

    setEyeOffsetStr(`${((lX + rX) / 2).toFixed(1)}px`);
  }, []);

  const stopVoice = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const triggerVoice = useCallback(
    (textOverride?: string, customEmotion?: Emotion) => {
      if (isSpeakingRef.current) {
        stopVoice();
        return;
      }

      const phrase = textOverride || PHRASES[phraseIdxRef.current % PHRASES.length];
      phraseIdxRef.current += 1;
      setCurrentDialogue(phrase);
      setIsSpeaking(true);

      if (customEmotion) {
        setEmotionState(customEmotion);
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(phrase);
        utter.pitch = 1.25;
        utter.rate = 1.05;
        utter.onend = () => {
          setIsSpeaking(false);
        };
        utter.onerror = () => {
          setIsSpeaking(false);
        };
        window.speechSynthesis.speak(utter);
      } else {
        setTimeout(() => {
          setIsSpeaking(false);
        }, 2600);
      }
    },
    [stopVoice]
  );

  const setEmotion = useCallback((newEmotion: Emotion) => {
    setEmotionState(newEmotion);
    if (newEmotion === 'thinking') {
      setLeftPupilOffset({ x: 4.5, y: -5.5 });
      setRightPupilOffset({ x: 4.5, y: -5.5 });
      setEyeOffsetStr('+4.5px (Thinking)');
    }
  }, []);

  const togglePlough = useCallback((forceState?: boolean) => {
    setPloughEquipped((prev) => (typeof forceState === 'boolean' ? forceState : !prev));
  }, []);

  const cheerBounce = useCallback(() => {
    if (!mascotActorRef.current) return;
    mascotActorRef.current.animate(
      [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-26px) scale(1.05) rotate(-3deg)' },
        { transform: 'translateY(0) scale(0.96)' },
        { transform: 'translateY(-14px) scale(1.02) rotate(3deg)' },
        { transform: 'translateY(0) scale(1)' }
      ],
      { duration: 650, easing: 'ease-out' }
    );
  }, []);

  // COW CLICK ACTION: Zoom to Passport size, Play MOO sound, then Mic appears!
  const enterPassportMode = useCallback(() => {
    playCowMooSound();
    setCurrentDialogue("MOOOOOOO! 🐮");
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
    }, 1800);
    cheerBounce();

    setMascotZoom('passport');
    setShowMic(false);
    showToast("Zoomed into Passport Size! Moo! 🐮");
    // THEN THE MIC APPEARS
    setTimeout(() => {
      setShowMic(true);
    }, 380);
  }, [cheerBounce, showToast]);

  const exitPassportMode = useCallback(() => {
    setMascotZoom('full');
    setShowMic(false);
    showToast("Expanded back to Full Body!");
  }, [showToast]);

  const handleCowClick = useCallback(() => {
    if (mascotZoomRef.current === 'full') {
      enterPassportMode();
    } else {
      // While in passport mode, clicking cow sounds moo and bounces!
      playCowMooSound();
      setCurrentDialogue("MOOOOOOO! 🐮");
      setIsSpeaking(true);
      setTimeout(() => {
        setIsSpeaking(false);
      }, 1800);
      cheerBounce();
      showToast("MOOOOO! 🐮");
    }
  }, [enterPassportMode, cheerBounce, showToast]);

  // Previous Capsule Microphone Click handler (Web Speech + Suggestions)
  const handleMicClick = useCallback(() => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setVoiceTranscript("Listening to you...");

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition = new (SpeechRecognition as any)();
        recognition.lang = selectedLanguage === 'தமிழ்' ? 'ta-IN' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setVoiceTranscript(`"${text}"`);
          setIsListening(false);
          setTimeout(() => {
            triggerVoice(`You said: ${text}! AGAM is at your service, champion!`, 'happy');
          }, 400);
        };

        recognition.onerror = () => {
          setIsListening(false);
          triggerVoice("MOOO! My ears caught your voice! Ready for action!", 'happy');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn("Speech recognition fallback:", e);
      }
    }

    // Context-sensitive interactive fallback
    setTimeout(() => {
      setIsListening(false);
      if (activeTab === 'weather') {
        const reply = "NASA POWER advisory: Wind is 13.2 km/h. Safe to spray pesticide between 6:00 AM and 9:00 AM!";
        setVoiceTranscript(`"${reply.substring(0, 48)}..."`);
        triggerVoice(reply, 'thinking');
      } else if (activeTab === 'cropDoctor') {
        const reply = "Crop Doctor active. Tap 'Active Camera' to diagnose foliar pathogens with Gemini Vision!";
        setVoiceTranscript(`"${reply.substring(0, 48)}..."`);
        triggerVoice(reply, 'surprised');
      } else if (activeTab === 'schemes') {
        const reply = "PM-Kisan status verified active! 17th installment of 2,000 rupees credited via DBT to your SBI account.";
        setVoiceTranscript(`"${reply.substring(0, 48)}..."`);
        triggerVoice(reply, 'happy');
      } else if (activeTab === 'polygon') {
        const reply = "Cadastral polygon registered: 1 acre paddy field in Kovalam, Chengalpattu with 4 GPS boundary points.";
        setVoiceTranscript(`"${reply.substring(0, 48)}..."`);
        triggerVoice(reply, 'thinking');
      } else {
        const randomCmd = VOICE_COMMANDS[Math.floor(Math.random() * VOICE_COMMANDS.length)];
        setVoiceTranscript(`"${randomCmd.label}"`);
        if (randomCmd.label === 'Cow Moo') {
          playCowMooSound();
        }
        triggerVoice(randomCmd.prompt, randomCmd.emotion);
      }
    }, 1300);
  }, [activeTab, isListening, selectedLanguage, triggerVoice]);

  // Global window.CharacterMascot for Antigravity API
  useEffect(() => {
    window.CharacterMascot = {
      lookAt: (x: number, y: number) => trackTarget(x, y),
      speak: (text?: string) => triggerVoice(text),
      stopSpeak: () => stopVoice(),
      blink: () => performBlink(),
      setEmotion: (name: Emotion) => setEmotion(name),
      getEmotion: () => emotionRef.current,
      togglePlough: (force?: boolean) => togglePlough(force),
      setTool: (toolName: string, isEquipped: boolean) => {
        if (toolName.toLowerCase() === 'plough' || toolName.toLowerCase() === 'hal') {
          togglePlough(isEquipped);
        }
      },
      isPloughEquipped: () => ploughEquippedRef.current,
      moo: () => playCowMooSound(),
      setPage: (page: MascotZoomMode) => {
        if (page === 'passport') {
          enterPassportMode();
        } else {
          exitPassportMode();
        }
      },
      getPage: () => mascotZoomRef.current,
      toggleMic: (force?: boolean) => setShowMic((prev) => (typeof force === 'boolean' ? force : !prev)),
      emotions: ['neutral', 'happy', 'surprised', 'thinking']
    };
    window.setEmotion = (name: Emotion) => setEmotion(name);

    return () => {
      delete window.CharacterMascot;
      delete window.setEmotion;
    };
  }, [trackTarget, triggerVoice, stopVoice, performBlink, setEmotion, togglePlough, enterPassportMode, exitPassportMode]);

  // Random blink timer
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const nextTime = Math.random() * 3200 + 2000;
      blinkTimer = setTimeout(() => {
        performBlink();
        scheduleNextBlink();
      }, nextTime);
    };
    scheduleNextBlink();

    return () => {
      clearTimeout(blinkTimer);
    };
  }, [performBlink]);

  // Pointer event listeners on window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      trackTarget(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        trackTarget(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
    };
  }, [trackTarget]);

  const copyApiSnippet = () => {
    const snippet = `// AGAM Voice-First Mascot & Farm Intelligence API
window.CharacterMascot = {
  lookAt: (x, y) => window.CharacterMascot.lookAt(x, y),
  speak: (text) => window.CharacterMascot.speak(text),
  stopSpeak: () => window.CharacterMascot.stopSpeak(),
  blink: () => window.CharacterMascot.blink(),
  setEmotion: (name) => window.CharacterMascot.setEmotion(name), // 'neutral' | 'happy' | 'surprised' | 'thinking'
  moo: () => window.CharacterMascot.moo(),
  setPage: (mode) => window.CharacterMascot.setPage(mode), // 'full' | 'passport' (crops to hip level)
  togglePlough: (bool) => window.CharacterMascot.togglePlough(bool)
};

// Example trigger:
window.CharacterMascot.setPage('passport');
window.CharacterMascot.moo();
window.CharacterMascot.speak("Cultivating prosperity with AGAM voice intelligence!");`;

    navigator.clipboard?.writeText(snippet);
    showToast("Copied AGAM API Snippet!");
    setShowCodeModal(false);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-between relative bg-slate-950 text-slate-100 overflow-x-hidden font-sans pb-24 emotion-${emotion} ${
        isSpeaking ? 'talking' : ''
      }`}
    >
      {/* Same Dark Ambient Space Glow Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[140px] pointer-events-none transition-colors duration-700 bg-amber-500/10" />
        <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none transition-colors duration-700 bg-red-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* TOP HEADER - AGAM APP BRANDING & TOP FEATURES */}
      <header className="w-full max-w-6xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 shadow-lg">
        {/* Brand: AGAM + VOICE FIRST badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-wider text-slate-100 font-mono-code uppercase">
                AGAM
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono-code font-bold text-emerald-300">
                VOICE FIRST
              </span>
            </div>
            <span className="text-xs text-slate-400 block -mt-0.5">Chengalpattu · 1 ac</span>
          </div>
        </div>

        {/* Central Navigation Tabs Matching Screenshots */}
        <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner flex-wrap">
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'weather'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CloudSun className="w-3.5 h-3.5 text-emerald-300" />
            <span>Land &amp; Weather</span>
          </button>

          <button
            onClick={() => setActiveTab('cropDoctor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'cropDoctor'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scan className="w-3.5 h-3.5 text-emerald-300" />
            <span>Crop Doctor</span>
          </button>

          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'schemes'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>PM-Kisan Schemes</span>
          </button>

          <button
            onClick={() => setActiveTab('polygon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'polygon'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Farmland Polygon</span>
          </button>

          <button
            onClick={() => setActiveTab('mascot')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'mascot'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                : 'text-amber-300 hover:text-amber-200 hover:bg-slate-800'
            }`}
          >
            <span>🐮</span>
            <span>Mascot Companion</span>
          </button>
        </nav>

        {/* Right Side: Language & Verified Phone Profile */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                showToast(`Language set to ${e.target.value}`);
              }}
              className="bg-slate-900 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 pr-7 appearance-none focus:outline-none cursor-pointer"
            >
              <option value="English">🌐 English</option>
              <option value="தமிழ்">🌐 தமிழ் (Tamil)</option>
              <option value="हिंदी">🌐 हिंदी (Hindi)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Verified Phone Pill */}
          <div className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono-code flex items-center gap-1.5 shadow-sm">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>+919840123456</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="w-full max-w-6xl px-4 py-4 flex-1 flex flex-col items-center justify-center relative z-20">
        {/* VIEW 1: LAND & WEATHER */}
        {activeTab === 'weather' && (
          <LandAndWeather onSpeak={(text) => triggerVoice(text, 'thinking')} />
        )}

        {/* VIEW 2: CROP DOCTOR */}
        {activeTab === 'cropDoctor' && (
          <CropDoctor onSpeak={(text) => triggerVoice(text, 'surprised')} />
        )}

        {/* VIEW 3: PM-KISAN SCHEMES */}
        {activeTab === 'schemes' && (
          <PMKisanSchemes onSpeak={(text) => triggerVoice(text, 'happy')} />
        )}

        {/* VIEW 4: FARMLAND POLYGON */}
        {activeTab === 'polygon' && (
          <FarmlandPolygon onSpeak={(text) => triggerVoice(text, 'thinking')} />
        )}

        {/* VIEW 5: MASCOT COMPANION (ORIGINAL INTERACTIVE STAGE & ANIMATIONS PRESERVED INTACT) */}
        {activeTab === 'mascot' && (
          <div className="w-full flex flex-col items-center justify-center">
            {/* Mascot Status Cue */}
            <div className="mb-2">
              <button
                onClick={mascotZoom === 'full' ? enterPassportMode : exitPassportMode}
                className="text-xs font-medium text-amber-200 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/40 px-4 py-1.5 rounded-full shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer group"
              >
                <span className="text-base group-hover:scale-125 transition-transform">🐮</span>
                <span>
                  {mascotZoom === 'full' ? (
                    <>
                      <strong>Click Cow</strong> → Zoom to Passport size (hip level) &amp; sound MOO!
                    </>
                  ) : (
                    <>
                      <strong>Passport Size Active</strong> → Click to Return to Full Body
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Passport Photo Frame Card Container */}
            <div
              ref={stageRef}
              onClick={handleCowClick}
              title="Click cow to zoom into passport photo size & sound moo!"
              style={{
                width: mascotZoom === 'passport' ? 'min(86vw, 305px)' : 'min(92vw, 420px)',
                height: mascotZoom === 'passport' ? '385px' : '520px',
                borderRadius: mascotZoom === 'passport' ? '28px' : '24px',
                transition:
                  'width 0.7s cubic-bezier(0.22, 1, 0.36, 1), height 0.7s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.7s ease, background-color 0.5s ease, border-color 0.5s ease, box-shadow 0.7s ease'
              }}
              className={`relative select-none flex items-center justify-center cursor-pointer group overflow-hidden border ${
                mascotZoom === 'passport'
                  ? 'border-slate-700/90 bg-slate-900/70 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/10'
                  : 'border-slate-800/50 bg-slate-900/30 hover:border-amber-500/40 shadow-[0_12px_35px_rgba(0,0,0,0.5)]'
              }`}
            >
              {/* Speech Waveform Bubble */}
              <div
                className={`absolute top-2 bg-slate-900/95 border border-amber-500/50 px-4 py-2 rounded-2xl shadow-xl backdrop-blur transition-all duration-300 flex items-center gap-3 z-30 pointer-events-none ${
                  isSpeaking ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'
                }`}
              >
                <div className="flex items-center gap-1 h-5">
                  <div className="w-1 bg-amber-400 rounded-full" style={{ animation: 'soundwave 0.5s ease-in-out infinite' }} />
                  <div className="w-1 bg-amber-400 rounded-full" style={{ animation: 'soundwave 0.7s ease-in-out infinite 0.1s' }} />
                  <div className="w-1 bg-amber-400 rounded-full" style={{ animation: 'soundwave 0.4s ease-in-out infinite 0.2s' }} />
                  <div className="w-1 bg-amber-400 rounded-full" style={{ animation: 'soundwave 0.6s ease-in-out infinite 0.3s' }} />
                </div>
                <span className="text-xs font-semibold text-amber-200">"{currentDialogue}"</span>
              </div>

              {/* Character Visual Assembly with Smooth Hardware-Accelerated Camera Zoom Transition */}
              <div
                ref={mascotActorRef}
                id="mascotActor"
                style={{
                  width: '440px',
                  height: '560px',
                  transform:
                    mascotZoom === 'passport'
                      ? 'scale(1.58) translateY(66px)'
                      : 'scale(1) translateY(0px)',
                  transformOrigin: '50% 20%',
                  transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
                className="character-body animate-idle relative flex items-center justify-center shrink-0"
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
                    <linearGradient id="kurtaGrad" x1="0%" x2="0%" y1="0%" y2="100%">
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
                    <g ref={leftEyeGroupRef} id="leftEyeGroup" transform="translate(162, 150)">
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
                    <g ref={rightEyeGroupRef} id="rightEyeGroup" transform="translate(226, 150)">
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

            {/* FLOATING MICROPHONE CAPSULE BAR (Directly beneath Passport Frame - Gemini_Generated_Image_sloi6dsloi6dsloi (1).png) */}
            {mascotZoom === 'passport' && showMic && (
              <div className="w-full max-w-xl mt-4 px-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* The Capsule Bar */}
                <div className="w-full h-16 sm:h-20 rounded-[28px] sm:rounded-[36px] bg-gradient-to-r from-slate-200 via-purple-100 to-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.65),0_0_28px_rgba(168,85,247,0.22)] border border-white/60 backdrop-blur-md flex items-center justify-between px-5 sm:px-8 relative overflow-hidden group">
                  {/* Subtle metallic sheen highlights */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/45 to-transparent pointer-events-none" />

                  {/* Soundwave radar ripple when listening or speaking */}
                  {(isListening || isSpeaking) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-24 h-24 rounded-full bg-purple-500/20 animate-ping" />
                      <div className="w-16 h-16 rounded-full bg-indigo-500/30 animate-pulse" />
                    </div>
                  )}

                  {/* Left Equalizer soundwave bars */}
                  <div className="flex items-center gap-1 sm:gap-1.5 h-6 z-10 w-16 sm:w-20">
                    <div
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isListening || isSpeaking
                          ? 'bg-purple-600 animate-[soundwave_0.4s_ease-in-out_infinite]'
                          : 'bg-slate-400 h-2.5'
                      }`}
                      style={{ height: isListening || isSpeaking ? undefined : '10px' }}
                    />
                    <div
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isListening || isSpeaking
                          ? 'bg-indigo-600 animate-[soundwave_0.6s_ease-in-out_infinite_0.1s]'
                          : 'bg-slate-400 h-4'
                      }`}
                      style={{ height: isListening || isSpeaking ? undefined : '16px' }}
                    />
                    <div
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isListening || isSpeaking
                          ? 'bg-purple-600 animate-[soundwave_0.5s_ease-in-out_infinite_0.2s]'
                          : 'bg-slate-400 h-3'
                      }`}
                      style={{ height: isListening || isSpeaking ? undefined : '12px' }}
                    />
                    <div
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isListening || isSpeaking
                          ? 'bg-indigo-600 animate-[soundwave_0.7s_ease-in-out_infinite_0.3s]'
                          : 'bg-slate-400 h-2'
                      }`}
                      style={{ height: isListening || isSpeaking ? undefined : '8px' }}
                    />
                  </div>

                  {/* Center Interactive Microphone Button */}
                  <button
                    onClick={handleMicClick}
                    title={isListening ? "Listening... Click to stop" : "Click to speak with Mascot"}
                    className={`relative z-10 w-12 h-12 sm:w-15 sm:h-15 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-90 ${
                      isListening
                        ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white scale-110 shadow-red-500/50 ring-4 ring-rose-400/50'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-100 hover:scale-105 shadow-slate-900/40 ring-2 ring-white/50'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-6 h-6 animate-pulse" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </button>

                  {/* Right Status Badge */}
                  <div className="z-10 w-16 sm:w-20 flex justify-end">
                    {isListening ? (
                      <span className="px-2.5 py-1 rounded-full bg-red-100/90 text-red-700 text-[10px] sm:text-[11px] font-bold animate-pulse font-mono-code">
                        Listening
                      </span>
                    ) : isSpeaking ? (
                      <span className="px-2.5 py-1 rounded-full bg-purple-100/90 text-purple-700 text-[10px] sm:text-[11px] font-bold font-mono-code">
                        Speaking
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/10 text-slate-700 text-[10px] sm:text-[11px] font-semibold font-mono-code">
                        Tap to Talk
                      </span>
                    )}
                  </div>
                </div>

                {/* Mic Transcript / Voice Feedback */}
                <div className="mt-2.5 flex items-center gap-2 text-xs font-mono-code">
                  {isListening ? (
                    <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      Listening... speak now into microphone!
                    </span>
                  ) : voiceTranscript ? (
                    <span className="text-slate-300 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      {voiceTranscript}
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Tap microphone to talk • Or select quick voice triggers below
                    </span>
                  )}
                </div>

                {/* Quick interactive voice suggestion pills */}
                <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
                  {VOICE_COMMANDS.map((cmd) => (
                    <button
                      key={cmd.label}
                      onClick={() => {
                        setVoiceTranscript(`"${cmd.label}"`);
                        if (cmd.label === 'Cow Moo') {
                          playCowMooSound();
                        }
                        triggerVoice(cmd.prompt, cmd.emotion);
                      }}
                      className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-medium text-slate-300 hover:text-amber-300 transition active:scale-95 cursor-pointer shadow-sm"
                    >
                      💬 {cmd.label}
                    </button>
                  ))}

                  <button
                    onClick={exitPassportMode}
                    className="px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-semibold text-amber-300 transition active:scale-95 cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <span>↩</span>
                    <span>Back to Full Body</span>
                  </button>
                </div>
              </div>
            )}

            {/* In Full Body Mode: Clean Prompt to Click Cow */}
            {mascotZoom === 'full' && (
              <div className="mt-4 flex flex-col items-center gap-1.5 animate-in fade-in duration-300">
                <button
                  onClick={enterPassportMode}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center gap-2 cursor-pointer group"
                >
                  <span className="text-base group-hover:scale-125 transition-transform">🐮</span>
                  <span>Click Cow → Passport Size (Hip Level) &amp; Sound MOO!</span>
                  <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded-full text-slate-900 font-mono-code font-bold">
                    🎙️ Mic Appears
                  </span>
                </button>
                <span className="text-[11px] text-slate-400 font-mono-code">
                  Or click directly on the cow mascot above
                </span>
              </div>
            )}

            {/* Mascot Emotion & Action Utility Toolbar (Compact and below the mic) */}
            <div className="w-full max-w-xl mt-5 flex items-center justify-between flex-wrap gap-2 p-2 rounded-xl bg-slate-900/70 border border-slate-800 shadow text-xs">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] text-slate-400 font-mono-code mr-1">Emotion:</span>
                {(['neutral', 'happy', 'surprised', 'thinking'] as const).map((emo) => (
                  <button
                    key={emo}
                    onClick={() => setEmotion(emo)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition cursor-pointer ${
                      emotion === emo
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    playCowMooSound();
                    cheerBounce();
                    showToast("MOOOOO! 🐮");
                  }}
                  className="px-2 py-0.5 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-[11px] font-medium text-red-200 transition cursor-pointer"
                >
                  🐮 Sound Moo
                </button>
                <button
                  onClick={() => togglePlough()}
                  className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-[11px] font-medium text-amber-300 border border-slate-700 transition cursor-pointer"
                >
                  🌾 {ploughEquipped ? 'Hal (On)' : 'Hal (Off)'}
                </button>
                <button
                  onClick={cheerBounce}
                  className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  🕺 Bounce
                </button>
                <button
                  onClick={() => setShowCodeModal(true)}
                  className="px-2 py-0.5 rounded bg-emerald-950/40 hover:bg-emerald-900/50 text-[11px] text-emerald-300 border border-emerald-700/40 transition cursor-pointer"
                >
                  ⚡ API
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Capsule Mic Bar on other AGAM feature tabs */}
        {activeTab !== 'mascot' && (
          <div className="w-full max-w-xl mt-6 px-4 flex flex-col items-center animate-in fade-in duration-300">
            <div className="w-full h-16 sm:h-20 rounded-[28px] sm:rounded-[36px] bg-gradient-to-r from-slate-200 via-purple-100 to-slate-200 shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(168,85,247,0.15)] border border-white/50 backdrop-blur-md flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

              {(isListening || isSpeaking) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-purple-500/20 animate-ping" />
                  <div className="w-14 h-14 rounded-full bg-indigo-500/30 animate-pulse" />
                </div>
              )}

              <button
                onClick={handleMicClick}
                title={isListening ? "Listening... Click to stop" : "Click to speak with AGAM Voice Assistant"}
                className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md active:scale-90 ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white scale-110 shadow-red-500/40 ring-4 ring-rose-400/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-100 hover:scale-105 shadow-slate-900/30'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6 animate-pulse" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="mt-2.5 text-xs font-mono-code text-center text-slate-300">
              {isListening ? (
                <span className="text-amber-400 animate-pulse">Listening... speak your farming query!</span>
              ) : voiceTranscript ? (
                <span className="flex items-center justify-center gap-1.5 text-slate-300">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  {voiceTranscript}
                </span>
              ) : (
                <span className="text-slate-400">Tap microphone for instant AGAM voice advisory</span>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Code Export Modal */}
      {showCodeModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCodeModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200"
        >
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  ⚡
                </div>
                <h3 className="font-bold text-sm text-slate-200 font-mono-code">
                  AGAM Voice &amp; Mascot API Spec
                </h3>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg px-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono-code text-xs text-slate-300 space-y-3 bg-slate-950/60">
              <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto leading-relaxed">
{`// AGAM Mascot & Farm Intelligence Controller
window.CharacterMascot.setPage('passport'); // Zooms into passport view (crops to hip level)
window.CharacterMascot.moo();               // Plays acoustic bovine moo sound
window.CharacterMascot.speak("Welcome to AGAM Voice Intelligence!");`}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-900">
              <button
                onClick={copyApiSnippet}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Copy API Snippet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-800 text-slate-100 text-xs font-medium rounded-lg shadow-xl border border-slate-700 transition-all duration-200 z-50 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
