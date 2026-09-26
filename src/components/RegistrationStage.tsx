/**
 * RegistrationStage — VISION Stage 1: Form LEFT, Mascot RIGHT.
 * The cow welcomes the farmer in rotating Tamil/Hindi/English greetings,
 * watches the form with eye tracking, then confirms the saved land with
 * the 3D globe. No crop selection here (deliberate vision rule) — crop
 * intelligence comes from Lane 1 satellite recommendations instead.
 */
import React, { useEffect, useState } from 'react';
import {
  Sprout, MapPin, Ruler, Home, ArrowRight, ShieldCheck, Loader2, Mic, Sparkles, Volume2,
} from 'lucide-react';
import { saveFarmerProfileFull, FarmerLandProfile } from '../services/firebase';
import { resolveDistrict, ResolvedDistrict } from '../services/districtResolver';
import { LandGlobe3D } from './LandGlobe3D';
import { MascotStage } from './MascotStage';
import { soundkit } from '../services/soundkit';
import { MASCOT_DIALOGUES, GREETING_WORDS, DialogueLang } from '../data/mascotDialogues';
import { LanguageCode } from '../data/languages';
import { Emotion } from '../types';

interface RegistrationStageProps {
  userPhone: string;
  currentLanguage: LanguageCode;
  onComplete: (profile: FarmerLandProfile) => void;
  // Mascot control surface (owned by App)
  onSpeak: (text: string, emotion?: Emotion) => void;
  mascotRef: React.RefObject<HTMLDivElement | null>;
  mascotEmotion: Emotion;
  isSpeaking: boolean;
  isBlinking: boolean;
  mascotZoom: 'full' | 'passport';
  ploughEquipped: boolean;
  currentDialogue: string;
  leftPupilOffset: { x: number; y: number };
  rightPupilOffset: { x: number; y: number };
  onCowClick: () => void;
}

export function RegistrationStage({
  userPhone,
  currentLanguage,
  onComplete,
  onSpeak,
  mascotRef,
  mascotEmotion,
  isSpeaking,
  isBlinking,
  mascotZoom,
  ploughEquipped,
  currentDialogue,
  leftPupilOffset,
  rightPupilOffset,
  onCowClick,
}: RegistrationStageProps) {
  const dlg = MASCOT_DIALOGUES[(currentLanguage === 'ta' ? 'ta' : currentLanguage === 'hi' ? 'hi' : 'en') as DialogueLang];

  const [farmerName, setFarmerName] = useState('');
  const [districtQuery, setDistrictQuery] = useState('');
  const [resolved, setResolved] = useState<ResolvedDistrict | null>(null);
  const [village, setVillage] = useState('');
  const [landSizeAcres, setLandSizeAcres] = useState('2.5');
  const [isResolving, setIsResolving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [greetingIdx, setGreetingIdx] = useState(0);

  // Rotating multilingual greeting words next to the mascot
  useEffect(() => {
    const t = setInterval(() => setGreetingIdx((i) => (i + 1) % GREETING_WORDS.en.length), 1800);
    return () => clearInterval(t);
  }, []);

  // Mascot welcomes on mount
  useEffect(() => {
    const t = setTimeout(() => onSpeak(dlg.welcomeRegister, 'happy'), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResolveDistrict = async () => {
    if (!districtQuery.trim()) return;
    setIsResolving(true);
    setResolveError(null);
    setResolved(null);
    try {
      const r = await resolveDistrict(districtQuery);
      setResolved(r);
      soundkit.play('notification');
      onSpeak(
        currentLanguage === 'ta'
          ? `${r.name}, ${r.state} கண்டுபிடித்தேன்! அட்சரேகை ${r.coords.lat.toFixed(2)}`
          : currentLanguage === 'hi'
          ? `${r.name}, ${r.state} मिल गया! अक्षांश ${r.coords.lat.toFixed(2)}`
          : `Found ${r.name}, ${r.state} at ${r.coords.lat.toFixed(2)}°N!`,
        'happy'
      );
    } catch {
      setResolveError('Could not locate that district. Check spelling?');
      soundkit.play('error');
    } finally {
      setIsResolving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolved) {
      setResolveError('Find your district first — type it and press Locate.');
      return;
    }
    const acres = parseFloat(landSizeAcres);
    if (isNaN(acres) || acres <= 0) return;

    setIsSaving(true);
    try {
      const saved = await saveFarmerProfileFull(userPhone || 'anonymous_farmer', {
        farmerId: userPhone || 'anonymous_farmer',
        phoneNumber: userPhone || 'anonymous_farmer',
        state: resolved.state,
        districtId: resolved.name.toLowerCase().replace(/\s+/g, '-'),
        districtName: resolved.name,
        village: village.trim() || resolved.name,
        landSizeAcres: acres,
        primaryCrop: 'To be advised by satellite', // vision rule: no crop choice at registration
        preferredLanguage: currentLanguage,
      });
      soundkit.play('complete');
      onSpeak(dlg.landSaved(farmerName.trim() || 'farmer', resolved.name), 'happy');
      onComplete(saved);
    } catch {
      soundkit.play('error');
      setIsSaving(false);
    }
  };

  const greetingWords = GREETING_WORDS[currentLanguage === 'ta' ? 'ta' : currentLanguage === 'hi' ? 'hi' : 'en'];

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* LEFT — Registration form */}
      <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-100 tracking-tight">Tell me about your land</h2>
            <p className="text-[11px] text-slate-400">Any district in India — I'll fetch its live NASA satellite data.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {currentLanguage === 'ta' ? 'உங்கள் பெயர்' : currentLanguage === 'hi' ? 'आपका नाम' : 'Your Name'}
            </label>
            <input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              placeholder={currentLanguage === 'ta' ? 'உதா: முருகன்' : currentLanguage === 'hi' ? 'जैसे: मुरुगन' : 'e.g. Murugan'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* District (free text — no predefined lists) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {currentLanguage === 'ta' ? 'மாவட்டம் / கிராமம்' : currentLanguage === 'hi' ? 'ज़िला / गाँव' : 'District / Village (any in India)'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={districtQuery}
                onChange={(e) => setDistrictQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleResolveDistrict();
                  }
                }}
                placeholder={currentLanguage === 'ta' ? 'உதா: Perambalur' : currentLanguage === 'hi' ? 'जैसे: Nashik' : 'e.g. Perambalur, Nashik, Guntur...'}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleResolveDistrict}
                disabled={isResolving || !districtQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                {isResolving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                Locate
              </button>
            </div>
            {resolveError && <p className="text-[11px] text-rose-400 mt-1">{resolveError}</p>}
            {resolved && (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>{resolved.name}</strong>, {resolved.state} — {resolved.coords.lat.toFixed(4)}°N, {resolved.coords.lon.toFixed(4)}°E
                  {resolved.source === 'osm-live' && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 font-mono">OSM LIVE</span>}
                </span>
              </div>
            )}
          </div>

          {/* Village */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Home className="w-3 h-3 text-emerald-400" />
              {currentLanguage === 'ta' ? 'கிராமம் / பகுதி' : currentLanguage === 'hi' ? 'गाँव / क्षेत्र' : 'Village / Locality'}
            </label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder={currentLanguage === 'ta' ? 'உதா: கோவளம்' : currentLanguage === 'hi' ? 'जैसे: कोवलम' : 'e.g. Kovalam'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Acres with quick pills */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Ruler className="w-3 h-3 text-emerald-400" />
              {currentLanguage === 'ta' ? 'நில அளவு (ஏக்கர்)' : currentLanguage === 'hi' ? 'भूमि आकार (एकड़)' : 'Land Size (Acres)'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={landSizeAcres}
                onChange={(e) => setLandSizeAcres(e.target.value)}
                className="w-28 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {['1', '2.5', '5', '10'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { soundkit.play('buttonTap'); setLandSizeAcres(p); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                    landSizeAcres === p
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {p} ac
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving || !resolved}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Save Field &amp; Continue
              </>
            )}
          </button>
        </form>
      </div>

      {/* RIGHT — Mascot greets with rotating words + globe appears after resolve */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <div className="relative">
          {/* Floating greeting words */}
          <div className="absolute top-2 left-0 right-0 z-20 flex justify-center pointer-events-none">
            <div key={greetingIdx} className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-bold animate-in fade-in zoom-in duration-300">
              {greetingWords[greetingIdx]}
            </div>
          </div>
          <MascotStage
            ref={mascotRef}
            emotion={mascotEmotion}
            isSpeaking={isSpeaking}
            isBlinking={isBlinking}
            mascotZoom={mascotZoom}
            ploughEquipped={ploughEquipped}
            dock="center"
            currentDialogue={currentDialogue}
            leftPupilOffset={leftPupilOffset}
            rightPupilOffset={rightPupilOffset}
            onCowClick={onCowClick}
          />
          <div className="flex justify-center -mt-2">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono-code">
              <Mic className="w-3 h-3 text-amber-400" /> {dlg.micPrompt}
            </span>
          </div>
        </div>

        {resolved && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <LandGlobe3D
              lat={resolved.coords.lat}
              lon={resolved.coords.lon}
              districtName={resolved.name}
              stateName={resolved.state}
              village={village}
              acres={parseFloat(landSizeAcres) || undefined}
              height={260}
              showAttributeBar={false}
            />
            <button
              onClick={() => onSpeak(dlg.lane1Intro(resolved.name), 'thinking')}
              className="mt-2 w-full py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-emerald-300 text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Hear what the satellite says about {resolved.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
