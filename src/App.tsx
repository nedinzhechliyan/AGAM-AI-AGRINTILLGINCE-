/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AGAM — Voice-First AI Agriculture Management Platform
 *
 * FLOW (user vision): Opening splash → Language selection (en/ta/hi) →
 * Firebase Phone Auth + reCAPTCHA → Mascot introduction + Land Registration
 * (mascot RIGHT with "Vanakkam / Namaste / Hello Farmer" greetings, form LEFT) →
 * 4-LANE DASHBOARD where the mascot is the main interface:
 *   Lane 1: Land & Satellite (3D globe + live NASA for ANY district + regenerative crops)
 *   Lane 2: Schemes/Policy     Lane 3: Crop Health      Lane 4: Farm History
 * When answering, the mascot docks RIGHT with compact passport framing while
 * the lane content owns the screen.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mic, MicOff, MessageSquare, Sprout, ChevronDown, CloudSun, Scan, Landmark, History, Shield, LogOut, Volume2,
} from 'lucide-react';

import { OpeningSplashScreen } from './components/OpeningSplashScreen.tsx';
import { LanguageGreetingSplash } from './components/LanguageGreetingSplash.tsx';
import { PhoneLoginScreen } from './components/PhoneLoginScreen.tsx';
import { RegistrationStage } from './components/RegistrationStage.tsx';
import { MascotStage } from './components/MascotStage.tsx';
import { VoiceCapsule, toDialogueLang } from './components/VoiceCapsule.tsx';
import { Lane1Satellite } from './components/Lane1Satellite.tsx';
import { Lane4History } from './components/Lane4History.tsx';
import CropDoctor from './components/CropDoctor.tsx';
import PMKisanSchemes from './components/PMKisanSchemes.tsx';
import SchemeEligibilityWizard from './components/SchemeEligibilityWizard.tsx';

import { FarmerLandProfile, getFarmerProfile } from './services/firebase';
import { resolveDistrict, prefetchDistrict } from './services/districtResolver';
import { logFarmerActivity } from './services/activityLog';
import { soundkit } from './services/soundkit';
import { MASCOT_DIALOGUES } from './data/mascotDialogues';
import { LANGUAGES, LanguageCode } from './data/languages';
import { Emotion, MascotZoomMode } from './types';

type AppPhase = 'opening' | 'language' | 'auth' | 'registration' | 'dashboard';
type LaneTab = 'lane1' | 'lane2' | 'lane3' | 'lane4';

const PHRASES = [
  'Desi hal on my shoulder, ready to cultivate victory!',
  'Welcome to AGAM! Voice-first farming intelligence at your service!',
  'Jai Kisan! Strength and tradition together!',
  'My eyes are always tracking your moves!',
  "Let's win this match with champion energy!",
];

// Rich, authentic cow "MOOO" synthesizer using Web Audio API (preserved verbatim)
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
    console.warn('Cow moo audio playback error:', err);
  }
};

export default function App() {
  // ============================== FLOW PHASE ==============================
  const [phase, setPhase] = useState<AppPhase>('opening');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [farmerPhone, setFarmerPhone] = useState<string>('');
  const [profile, setProfile] = useState<FarmerLandProfile | null>(null);
  const [activeLane, setActiveLane] = useState<LaneTab>('lane1');
  const [focusDistrictName, setFocusDistrictName] = useState<string | null>(null);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ============================ MASCOT STATE ==============================
  const [mascotZoom, setMascotZoom] = useState<MascotZoomMode>('full');
  const [emotion, setEmotionState] = useState<Emotion>('neutral');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentDialogue, setCurrentDialogue] = useState<string>(PHRASES[0]);
  const [ploughEquipped, setPloughEquipped] = useState<boolean>(true);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [leftPupilOffset, setLeftPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rightPupilOffset, setRightPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // =========================== VOICE STATE ===============================
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  // Farmer-friendly YES/NO verdict from the mascot (irrigation/spray/eligibility etc.)
  const [verdict, setVerdict] = useState<'YES' | 'NO' | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const mascotActorRef = useRef<HTMLDivElement>(null);
  const phraseIdxRef = useRef<number>(0);
  const emotionRef = useRef<Emotion>(emotion);
  emotionRef.current = emotion;
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  isSpeakingRef.current = isSpeaking;
  const mascotZoomRef = useRef<MascotZoomMode>(mascotZoom);
  mascotZoomRef.current = mascotZoom;
  const laneIntroSpokenRef = useRef<LaneTab | null>(null);

  const dlg = MASCOT_DIALOGUES[toDialogueLang(currentLanguage)];

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 2500);
  }, []);

  // ========================= MASCOT CORE LOGIC ===========================
  const performBlink = useCallback(() => {
    if (emotionRef.current === 'happy') return;
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 150);
  }, []);

  const trackTarget = useCallback((clientX: number, clientY: number) => {
    if (emotionRef.current === 'happy') return;

    if (emotionRef.current === 'thinking') {
      setLeftPupilOffset({ x: 4.5, y: -5.5 });
      setRightPupilOffset({ x: 4.5, y: -5.5 });
      return;
    }

    const MAX_PUPIL_DISPLACEMENT = 7.5;

    const leftEyeEl = document.getElementById('leftEyeGroup');
    if (leftEyeEl) {
      const box = leftEyeEl.getBoundingClientRect();
      const dx = clientX - (box.left + box.width / 2);
      const dy = clientY - (box.top + box.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const clamp = Math.min(MAX_PUPIL_DISPLACEMENT, dist / 22);
      setLeftPupilOffset({
        x: Number((Math.cos(Math.atan2(dy, dx)) * clamp).toFixed(2)),
        y: Number((Math.sin(Math.atan2(dy, dx)) * clamp).toFixed(2)),
      });
    }
    const rightEyeEl = document.getElementById('rightEyeGroup');
    if (rightEyeEl) {
      const box = rightEyeEl.getBoundingClientRect();
      const dx = clientX - (box.left + box.width / 2);
      const dy = clientY - (box.top + box.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const clamp = Math.min(MAX_PUPIL_DISPLACEMENT, dist / 22);
      setRightPupilOffset({
        x: Number((Math.cos(Math.atan2(dy, dx)) * clamp).toFixed(2)),
        y: Number((Math.sin(Math.atan2(dy, dx)) * clamp).toFixed(2)),
      });
    }
  }, []);

  const stopVoice = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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
      if (customEmotion) setEmotionState(customEmotion);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(phrase);
        utter.pitch = 1.25;
        utter.rate = 1.05;
        utter.lang = currentLanguage === 'ta' ? 'ta-IN' : currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
      } else {
        setTimeout(() => setIsSpeaking(false), 2600);
      }
    },
    [stopVoice, currentLanguage]
  );

  const setEmotion = useCallback((newEmotion: Emotion) => {
    setEmotionState(newEmotion);
    if (newEmotion === 'thinking') {
      setLeftPupilOffset({ x: 4.5, y: -5.5 });
      setRightPupilOffset({ x: 4.5, y: -5.5 });
    }
  }, []);

  const togglePlough = useCallback((forceState?: boolean) => {
    setPloughEquipped((prev) => (typeof forceState === 'boolean' ? forceState : !prev));
  }, []);

  const cheerBounce = useCallback(() => {
    const el = mascotActorRef.current || document.getElementById('mascotActor');
    if (!el) return;
    el.animate(
      [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-26px) scale(1.05) rotate(-3deg)' },
        { transform: 'translateY(0) scale(0.96)' },
        { transform: 'translateY(-14px) scale(1.02) rotate(3deg)' },
        { transform: 'translateY(0) scale(1)' },
      ],
      { duration: 650, easing: 'ease-out' }
    );
  }, []);

  const enterPassportMode = useCallback(() => {
    playCowMooSound();
    setCurrentDialogue('MOOOOOOO! 🐮');
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 1800);
    cheerBounce();
    setMascotZoom('passport');
    showToast('Zoomed into Passport Size! Moo! 🐮');
  }, [cheerBounce, showToast]);

  const exitPassportMode = useCallback(() => {
    setMascotZoom('full');
    showToast('Expanded back to Full Body!');
  }, [showToast]);

  const handleCowClick = useCallback(() => {
    if (mascotZoomRef.current === 'full') {
      enterPassportMode();
    } else {
      playCowMooSound();
      setCurrentDialogue('MOOOOOOO! 🐮');
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 1800);
      cheerBounce();
      showToast('MOOOOO! 🐮');
    }
  }, [enterPassportMode, cheerBounce, showToast]);

  // ===================== GROQ RAG INTENT ROUTING =========================
  const dispatchGroqRagQuery = useCallback(
    async (queryText: string) => {
      setVoiceTranscript(`"${queryText}"`);
      setVerdict(null);
      setIsListening(false);
      setEmotion('thinking');
      setCurrentDialogue(dlg.thinking);

      try {
        const res = await fetch('/api/rag-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: queryText,
            preferredLanguage: LANGUAGES[currentLanguage].name,
            district: profile?.districtName || 'Chengalpattu',
            crop: profile?.primaryCrop || 'Paddy / Rice',
            // Live satellite numbers so yes/no answers cite real stats
            telemetry: (window as any).AgamTelemetry || undefined,
          }),
        });

        const data = await res.json();
        const spoken = data.spoken_response || data.response || '';
        const intent = data.intent_action || 'NONE';
        // Verdict-first UX: if the model gave a YES/NO, the mascot's spoken
        // answer STARTS with the verdict word in the farmer's language, then
        // the reason (stats) — and the capsule shows a YES/NO banner.
        let spokenWithVerdict = spoken || dlg.error;
        if (data.verdict === 'YES' || data.verdict === 'NO') {
          setVerdict(data.verdict);
          const verdictWord =
            currentLanguage === 'ta'
              ? data.verdict === 'YES' ? 'ஆம்' : 'இல்லை'
              : currentLanguage === 'hi'
              ? data.verdict === 'YES' ? 'हाँ' : 'नहीं'
              : data.verdict === 'YES' ? 'Yes' : 'No';
          // Prepend ONLY if the model didn't already open with the verdict word
          if (!spokenWithVerdict.toLowerCase().startsWith(verdictWord.toLowerCase())) {
            spokenWithVerdict = `${verdictWord}. ${spokenWithVerdict}`;
          }
        }

        if (spoken === 'NOT SUPPORTED') {
          triggerVoice(dlg.notSupported, 'thinking');
          showToast('⚠️ Out of Scope: Non-agricultural query.');
          return;
        }
        if (spoken === 'I CANT ANSWER') {
          triggerVoice(dlg.security, 'surprised');
          showToast('🔒 Security Guardrail: System prompt protected.');
          return;
        }

        triggerVoice(spokenWithVerdict, intent === 'REDIRECT_KISAN_PORTAL' ? 'happy' : intent === 'NAVIGATE_DISEASE_SCANNER' ? 'surprised' : 'thinking');

        // Voice-driven eligibility check: "am I eligible for PM-Kisan?"
        if (/eligib|qualify|தகுதி|योग्य|पात्र/i.test(queryText) && intent === 'REDIRECT_KISAN_PORTAL') {
          setWizardOpen(true);
        }

        // Voice-driven district jump: "show me Thanjavur soil data"
        if (data.district_name) {
          setFocusDistrictName(data.district_name);
        }

        if (intent === 'REDIRECT_KISAN_PORTAL') {
          setActiveLane('lane2');
          logFarmerActivity(farmerPhone || 'anonymous', {
            type: 'scheme_view',
            title: 'Voice query → Schemes lane',
            detail: spoken,
            districtName: profile?.districtName,
            language: currentLanguage,
          }).then(() => setActivityRefreshKey((k) => k + 1));
        } else if (intent === 'NAVIGATE_DISEASE_SCANNER') {
          setActiveLane('lane3');
        } else if (intent === 'NAVIGATE_LAND_SURVEY') {
          setActiveLane('lane1');
          logFarmerActivity(farmerPhone || 'anonymous', {
            type: 'land_selected',
            title: `Voice query → ${data.district_name || profile?.districtName || 'district'} satellite fetch`,
            detail: spoken,
            districtName: data.district_name || profile?.districtName,
            language: currentLanguage,
          }).then(() => setActivityRefreshKey((k) => k + 1));
        } else {
          logFarmerActivity(farmerPhone || 'anonymous', {
            type: 'voice_query',
            title: queryText,
            detail: spoken,
            districtName: profile?.districtName,
            language: currentLanguage,
          }).then(() => setActivityRefreshKey((k) => k + 1));
        }
      } catch (err) {
        console.warn('Groq RAG API Error:', err);
        triggerVoice(dlg.error, 'happy');
      }
    },
    [currentLanguage, profile, farmerPhone, dlg, showToast, triggerVoice, setEmotion]
  );

  // Capsule Microphone: Speech Recognition → Groq RAG
  const handleMicClick = useCallback(() => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    setVoiceTranscript('');
    soundkit.play('voiceStart');

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new (SpeechRecognition as any)();
        recognition.lang = currentLanguage === 'ta' ? 'ta-IN' : currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          dispatchGroqRagQuery(text);
        };
        recognition.onerror = () => {
          setIsListening(false);
          soundkit.play('error');
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
        return;
      } catch (e) {
        console.warn('Speech recognition fallback:', e);
      }
    }

    // No Web Speech support: type-free fallback demo prompts
    setTimeout(() => {
      const defaultPrompts = [
        'What is the status of my PM Kisan 17th installment?',
        'Is it safe to spray pesticide on my paddy field this morning?',
        'My paddy crop leaves have brown spots and blight symptoms.',
      ];
      dispatchGroqRagQuery(defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)]);
    }, 900);
  }, [dispatchGroqRagQuery, isListening, currentLanguage]);

  // ==================== window.CharacterMascot API =======================
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
      isPloughEquipped: () => ploughEquipped,
      moo: () => playCowMooSound(),
      setPage: (page: MascotZoomMode) => (page === 'passport' ? enterPassportMode() : exitPassportMode()),
      getPage: () => mascotZoomRef.current,
      toggleMic: (force?: boolean) => {
        if (typeof force === 'boolean' ? !force : isListening) setIsListening(false);
        else handleMicClick();
      },
      emotions: ['neutral', 'happy', 'surprised', 'thinking'],
    };
    window.setEmotion = (name: Emotion) => setEmotion(name);
    return () => {
      delete window.CharacterMascot;
      delete window.setEmotion;
    };
  }, [trackTarget, triggerVoice, stopVoice, performBlink, setEmotion, togglePlough, enterPassportMode, exitPassportMode, handleMicClick, isListening, ploughEquipped]);

  // Random blink timer
  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    const scheduleNextBlink = () => {
      blinkTimer = setTimeout(() => {
        performBlink();
        scheduleNextBlink();
      }, Math.random() * 3200 + 2000);
    };
    scheduleNextBlink();
    return () => clearTimeout(blinkTimer);
  }, [performBlink]);

  // Pointer tracking for eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => trackTarget(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) trackTarget(e.touches[0].clientX, e.touches[0].clientY);
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

  // ======================== FLOW TRANSITIONS =============================
  const handleAuthSuccess = useCallback(
    async (phone: string) => {
      setFarmerPhone(phone);
      soundkit.play('success');
      const existing = await getFarmerProfile(phone);
      if (existing && existing.districtId) {
        setProfile(existing);
        prefetchDistrict(existing.districtName);
        setPhase('dashboard');
        triggerVoice(
          currentLanguage === 'ta'
            ? `மீண்டும் வருக! ${existing.districtName} உங்கள் நிலம் தயார்.`
            : currentLanguage === 'hi'
            ? `वापसी पर स्वागत! ${existing.districtName} आपका खेत तैयार है।`
            : `Welcome back! Your land in ${existing.districtName} is ready.`,
          'happy'
        );
      } else {
        setPhase('registration');
      }
    },
    [currentLanguage, triggerVoice]
  );

  const handleRegistrationComplete = useCallback(
    (saved: FarmerLandProfile) => {
      setProfile(saved);
      prefetchDistrict(saved.districtName);
      setPhase('dashboard');
      setActiveLane('lane1');
      laneIntroSpokenRef.current = null; // let the dashboard greet
      logFarmerActivity(saved.farmerId || farmerPhone, {
        type: 'profile_created',
        title: `Farm registered in ${saved.districtName}`,
        detail: `${saved.landSizeAcres} acres · ${saved.village} · ${saved.state}`,
        districtName: saved.districtName,
        language: currentLanguage,
      }).then(() => setActivityRefreshKey((k) => k + 1));
      showToast(`🌍 ${saved.districtName} marked green on the globe!`);
    },
    [farmerPhone, currentLanguage, showToast]
  );

  // Lane switching with mascot narration + Lane 4 logging
  const switchLane = useCallback(
    (lane: LaneTab) => {
      if (lane === activeLane) return;
      soundkit.play('tabChange');
      setActiveLane(lane);
      setMascotZoom('full');
      setVerdict(null); // verdicts belong to the question that produced them
      if (lane === 'lane2') {
        logFarmerActivity(farmerPhone || 'anonymous', {
          type: 'scheme_view',
          title: 'Explored government schemes',
          detail: 'Schemes & policy lane opened',
          districtName: profile?.districtName,
          language: currentLanguage,
        }).then(() => setActivityRefreshKey((k) => k + 1));
      }
    },
    [activeLane, farmerPhone, profile, currentLanguage]
  );

  // Mascot greets each lane once (the lane intro IS the navigation announcer)
  useEffect(() => {
    if (phase !== 'dashboard') return;
    if (laneIntroSpokenRef.current === activeLane) return;
    laneIntroSpokenRef.current = activeLane;
    const t = setTimeout(() => {
      if (activeLane === 'lane1') triggerVoice(dlg.lane1Intro(profile?.districtName || 'your district'), 'happy');
      else if (activeLane === 'lane2') triggerVoice(dlg.lane2Intro, 'happy');
      else if (activeLane === 'lane3') triggerVoice(dlg.lane3Intro, 'surprised');
      else triggerVoice(dlg.lane4Intro, 'neutral');
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLane, phase]);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('agam_user_phone');
    localStorage.removeItem('agam_user_authenticated');
    setFarmerPhone('');
    setProfile(null);
    setVerdict(null);
    setWizardOpen(false);
    setPhase('language');
    showToast('Signed out — vanakkam!');
  }, [showToast]);

  const quickCommands = useMemo(
    () => [
      {
        label: 'Irrigate today?',
        onClick: () => dispatchGroqRagQuery('Should I irrigate my field today?'),
      },
      {
        label: 'PM-Kisan Status',
        onClick: () => dispatchGroqRagQuery('What is the status of my PM Kisan 17th installment?'),
      },
      {
        label: 'Spray Advisory',
        onClick: () => dispatchGroqRagQuery('Is it safe to spray pesticide on my paddy field this morning?'),
      },
      {
        label: 'Am I eligible for schemes?',
        onClick: () => setWizardOpen(true),
      },
      { label: '🐮 Moo', onClick: () => { playCowMooSound(); triggerVoice('MOOOOO! 🐮 Always proud to be your champion farming mascot!', 'happy'); } },
    ],
    [dispatchGroqRagQuery, triggerVoice]
  );

  // ============================== RENDER =================================
  const mascotProps = {
    emotion,
    isSpeaking,
    isBlinking,
    mascotZoom,
    ploughEquipped,
    currentDialogue,
    leftPupilOffset,
    rightPupilOffset,
    onCowClick: handleCowClick,
  };

  return (
    <div className={`min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden font-sans emotion-${emotion} ${isSpeaking ? 'talking' : ''}`}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[140px] bg-amber-500/10" />
        <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full blur-[130px] bg-red-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* ================= PHASE 1: OPENING SPLASH ================= */}
      {phase === 'opening' && <OpeningSplashScreen onComplete={() => setPhase('language')} />}

      {/* ================= PHASE 2: LANGUAGE SELECT ================ */}
      {phase === 'language' && (
        <LanguageGreetingSplash
          currentLanguage={currentLanguage}
          onSelectLanguage={(lang) => {
            setCurrentLanguage(lang);
            soundkit.play('buttonTap');
          }}
          onGetStarted={() => {
            soundkit.play('success');
            setPhase('auth');
          }}
        />
      )}

      {/* ================= PHASE 3: FIREBASE PHONE AUTH ============ */}
      {phase === 'auth' && (
        <PhoneLoginScreen
          currentLanguage={currentLanguage}
          onBackToSplash={() => setPhase('language')}
          onLoginSuccess={handleAuthSuccess}
        />
      )}

      {/* ================= PHASE 4: MASCOT REGISTRATION ============ */}
      {phase === 'registration' && (
        <>
          <RegistrationStage
            userPhone={farmerPhone}
            currentLanguage={currentLanguage}
            onComplete={handleRegistrationComplete}
            onSpeak={(text, emo) => triggerVoice(text, emo)}
            mascotRef={mascotActorRef}
            mascotEmotion={emotion}
            isSpeaking={isSpeaking}
            isBlinking={isBlinking}
            mascotZoom={mascotZoom}
            ploughEquipped={ploughEquipped}
            currentDialogue={currentDialogue}
            leftPupilOffset={leftPupilOffset}
            rightPupilOffset={rightPupilOffset}
            onCowClick={handleCowClick}
          />
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-[11px] text-slate-300 font-mono-code">
            <Shield className="w-3 h-3 text-emerald-400" />
            {farmerPhone} · Firebase Verified
          </div>
        </>
      )}

      {/* ================= PHASE 5: 4-LANE DASHBOARD =============== */}
      {phase === 'dashboard' && (
        <>
          {/* Header */}
          <header className="w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-3 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-wider font-mono-code uppercase">AGAM</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono-code font-bold text-emerald-300">
                    VOICE FIRST
                  </span>
                </div>
                <span className="text-xs text-slate-400 block -mt-0.5">
                  {profile ? `${profile.districtName} · ${profile.landSizeAcres} ac` : farmerPhone}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={currentLanguage}
                  onChange={(e) => {
                    const lang = e.target.value as LanguageCode;
                    setCurrentLanguage(lang);
                    soundkit.play('buttonTap');
                    showToast(`🌐 ${LANGUAGES[lang].name}`);
                  }}
                  className="bg-slate-900 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 pr-7 appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="en">🌐 English</option>
                  <option value="ta">🌐 தமிழ் (Tamil)</option>
                  <option value="hi">🌐 हिंदी (Hindi)</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                onClick={handleSignOut}
                title={farmerPhone}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono-code flex items-center gap-1.5 transition cursor-pointer"
              >
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">{farmerPhone}</span>
                <LogOut className="w-3 h-3 text-rose-400" />
              </button>
            </div>
          </header>

          {/* Main: lane rail + lane content + docked mascot */}
          <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 flex-1 flex gap-4 relative z-20">
            {/* Lane rail */}
            <nav className="flex lg:flex-col gap-2 lg:gap-2.5 lg:w-44 shrink-0 h-fit lg:sticky lg:top-20 self-start overflow-x-auto lg:overflow-visible py-1">
              {(
                [
                  { id: 'lane1' as LaneTab, icon: <CloudSun className="w-4 h-4" />, label: 'Land & Satellite', sub: 'NASA · Globe' },
                  { id: 'lane2' as LaneTab, icon: <Landmark className="w-4 h-4" />, label: 'Schemes', sub: 'PM-Kisan' },
                  { id: 'lane3' as LaneTab, icon: <Scan className="w-4 h-4" />, label: 'Crop Health', sub: 'AI Scanner' },
                  { id: 'lane4' as LaneTab, icon: <History className="w-4 h-4" />, label: 'My History', sub: 'Farm Story' },
                ]
              ).map((lane) => (
                <button
                  key={lane.id}
                  onClick={() => switchLane(lane.id)}
                  className={`px-3 py-2.5 rounded-xl text-left flex items-center gap-2.5 transition cursor-pointer shrink-0 border ${
                    activeLane === lane.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={activeLane === lane.id ? 'text-white' : 'text-emerald-400'}>{lane.icon}</span>
                  <span className="hidden lg:block">
                    <span className="block text-xs font-bold">{lane.label}</span>
                    <span className={`block text-[10px] font-mono-code ${activeLane === lane.id ? 'text-emerald-100' : 'text-slate-500'}`}>{lane.sub}</span>
                  </span>
                </button>
              ))}
            </nav>

            {/* Lane content (mascot docks right → content owns left screen) */}
            <section className="flex-1 min-w-0 flex flex-col items-center">
              {/* VERDICT-FIRST BANNER — farmer hears YES/NO first, sees it too */}
              {verdict && (
                <div
                  className={`w-full max-w-4xl mb-3 flex items-center gap-3 px-4 py-3 rounded-2xl border-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ${
                    verdict === 'YES'
                      ? 'bg-emerald-600/15 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-600/15 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <span
                    className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-lg font-black tracking-wide ${
                      verdict === 'YES' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {verdict === 'YES'
                      ? currentLanguage === 'ta' ? 'ஆம்' : currentLanguage === 'hi' ? 'हाँ' : 'YES'
                      : currentLanguage === 'ta' ? 'இல்லை' : currentLanguage === 'hi' ? 'नहीं' : 'NO'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold">
                      {verdict === 'YES'
                        ? currentLanguage === 'ta' ? 'ஆம், செய்யலாம்!' : currentLanguage === 'hi' ? 'हाँ, कर सकते हैं!' : 'Yes — go ahead!'
                        : currentLanguage === 'ta' ? 'இல்லை, இன்று வேண்டாம்.' : currentLanguage === 'hi' ? 'नहीं, आज नहीं।' : 'No — not today.'}
                    </p>
                    <p className="text-[11px] text-slate-300 font-mono-code truncate">{voiceTranscript}</p>
                  </div>
                </div>
              )}
              {activeLane === 'lane1' && (
                <Lane1Satellite profile={profile} currentLanguage={currentLanguage} onSpeak={triggerVoice} focusDistrictName={focusDistrictName} />
              )}
              {activeLane === 'lane2' && (
                <div className="w-full flex flex-col gap-4">
                  {wizardOpen ? (
                    <SchemeEligibilityWizard
                      profile={profile}
                      currentLanguage={currentLanguage}
                      onSpeak={triggerVoice}
                      onCheckComplete={(eligibleCount, totalChecked) => {
                        logFarmerActivity(farmerPhone || 'anonymous', {
                          type: 'scheme_view',
                          title: `Checked scheme eligibility: ${eligibleCount}/${totalChecked} fit`,
                          detail: 'Mascot asked land details, matched state-wise schemes',
                          districtName: profile?.districtName,
                          language: currentLanguage,
                        }).then(() => setActivityRefreshKey((k) => k + 1));
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => { soundkit.play('buttonTap'); setWizardOpen(true); }}
                      className="w-full max-w-4xl mx-auto px-4 py-3.5 rounded-2xl border-2 border-dashed border-emerald-500/50 bg-emerald-950/30 hover:bg-emerald-900/40 text-sm font-bold text-emerald-200 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      🎯 {currentLanguage === 'ta' ? 'எனக்கு எந்த திட்டம் பொருந்தும்? விவரங்களை கேளுங்கள்' : currentLanguage === 'hi' ? 'मुझे कौन सी योजना मिलेगी? मेरी जानकारी पूछें' : 'Which schemes fit ME? Ask my details first'}
                    </button>
                  )}
                  <PMKisanSchemes onSpeak={(text) => triggerVoice(text, 'happy')} />
                </div>
              )}
              {activeLane === 'lane3' && (
                <CropDoctor
                  onSpeak={(text) => triggerVoice(text, 'surprised')}
                  onScanComplete={(diseaseLabel, remedy) => {
                    logFarmerActivity(farmerPhone || 'anonymous', {
                      type: 'disease_scan',
                      title: `Scanned: ${diseaseLabel}`,
                      detail: remedy,
                      districtName: profile?.districtName,
                      language: currentLanguage,
                    }).then(() => setActivityRefreshKey((k) => k + 1));
                  }}
                />
              )}
              {activeLane === 'lane4' && <Lane4History farmerId={farmerPhone || 'anonymous'} profile={profile} refreshKey={activityRefreshKey} />}
            </section>

            {/* RIGHT DOCK — the mascot answers from here on every lane */}
            <aside className="hidden xl:flex w-72 shrink-0 flex-col items-center gap-3 sticky top-20 self-start">
              <MascotStage {...mascotProps} dock="right" compact />
              {verdict && (
                <div
                  className={`w-full px-3 py-2 rounded-xl border text-center text-sm font-black tracking-wide animate-in fade-in duration-300 ${
                    verdict === 'YES'
                      ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-600/20 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {verdict === 'YES'
                    ? currentLanguage === 'ta' ? 'ஆம் ✓' : currentLanguage === 'hi' ? 'हाँ ✓' : 'YES ✓'
                    : currentLanguage === 'ta' ? 'இல்லை ✗' : currentLanguage === 'hi' ? 'नहीं ✗' : 'NO ✗'}
                </div>
              )}
              <VoiceCapsule
                isListening={isListening}
                isSpeaking={isSpeaking}
                voiceTranscript={voiceTranscript}
                currentLanguage={currentLanguage}
                onMicClick={handleMicClick}
                quickCommands={quickCommands}
              />
              <button
                onClick={() => { soundkit.play('buttonTap'); mascotZoom === 'full' ? enterPassportMode() : exitPassportMode(); }}
                className="text-[11px] text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/40 px-3 py-1.5 rounded-full transition active:scale-95 cursor-pointer"
              >
                🐮 {mascotZoom === 'full' ? 'Passport Zoom' : 'Full Body'}
              </button>
            </aside>
          </main>

          {/* Mobile/tablet floating voice capsule */}
          <div className="xl:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[min(94vw,480px)]">
            <VoiceCapsule
              isListening={isListening}
              isSpeaking={isSpeaking}
              voiceTranscript={voiceTranscript}
              currentLanguage={currentLanguage}
              onMicClick={handleMicClick}
              quickCommands={[]}
            />
          </div>
        </>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-800 text-slate-100 text-xs font-medium rounded-lg shadow-xl border border-slate-700 z-50 flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
