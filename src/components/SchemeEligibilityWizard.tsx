/**
 * SchemeEligibilityWizard — Lane 2's "check what fits ME" flow.
 *
 * STEP 1: The mascot ASKS the farmer his details (state, land, category,
 *         tenure, irrigation, crop) — prefilled from his saved profile.
 * STEP 2: The rules engine (data/eligibility.ts) matches state-wise schemes.
 * STEP 3: VERDICT-FIRST cards: green "YOU ARE ELIGIBLE" / amber "NEEDS DOCUMENTS"
 *         / red "NOT THIS SCHEME", each with the WHY in his language.
 */
import React, { useMemo, useState } from 'react';
import { ClipboardList, CheckCircle2, AlertTriangle, XCircle, ExternalLink, Loader2, RotateCcw } from 'lucide-react';
import {
  FarmerDetails, FarmerCategory, LandTenure, matchSchemes, summarizeMatches, SchemeMatch, PrimaryLang,
} from '../data/eligibility';
import { FarmerLandProfile } from '../services/firebase';
import { Emotion } from '../types';

interface SchemeEligibilityWizardProps {
  profile: FarmerLandProfile | null;
  currentLanguage: 'en' | 'ta' | 'hi' | 'te' | 'kn' | 'mr';
  onSpeak: (text: string, emotion?: Emotion) => void;
  onCheckComplete?: (eligibleCount: number, totalChecked: number) => void;
}

const T = {
  title: { en: 'Do I Qualify?', ta: 'எனக்கு தகுதி உண்டா?', hi: 'क्या मैं योग्य हूँ?' },
  subtitle: {
    en: 'Tell me your details first — then I check every scheme against YOUR situation.',
    ta: 'முதலில் உங்கள் விவரங்களை சொல்லுங்கள் — பிறகு உங்கள் நிலைக்கு ஏற்ற திட்டங்களை சரிபார்க்கிறேன்.',
    hi: 'पहले अपनी जानकारी बताइए — फिर मैं हर योजना आपकी स्थिति से मिलाऊँगा।',
  },
  state: { en: 'Your State', ta: 'உங்கள் மாநிலம்', hi: 'आपका राज्य' },
  acres: { en: 'Land Size (acres)', ta: 'நில அளவு (ஏக்கர்)', hi: 'भूमि आकार (एकड़)' },
  category: { en: 'Farmer Category', ta: 'விவசாய வகை', hi: 'किसान श्रेणी' },
  catSmall: { en: 'Small (2.5–5 ac)', ta: 'சிறு (2.5–5 ஏ)', hi: 'लघु (2.5–5 ए)' },
  catMarginal: { en: 'Marginal (under 2.5 ac)', ta: 'எல்லை (2.5 ஏக்கருக்கு கீழ்)', hi: 'सीमांत (2.5 एकड़ से कम)' },
  catOther: { en: 'Other / Medium', ta: 'மற்றவை / நடுத்தரம்', hi: 'अन्य / मध्यम' },
  tenure: { en: 'Land Status', ta: 'நில நிலை', hi: 'भूमि स्थिति' },
  tenOwner: { en: 'Owner', ta: 'உரிமையாளர்', hi: 'स्वामी' },
  tenTenant: { en: 'Tenant / Cultivator', ta: 'குத்தகைதாரர்', hi: 'काश्तकार' },
  tenShared: { en: 'Shared / Family', ta: 'பங்கு / குடும்பம்', hi: 'साझा / परिवार' },
  irrigation: { en: 'Irrigation on your land?', ta: 'உங்கள் நிலத்தில் பாசனம்?', hi: 'आपकी भूमि पर सिंचाई?' },
  yes: { en: 'Yes', ta: 'ஆம்', hi: 'हाँ' },
  no: { en: 'No', ta: 'இல்லை', hi: 'नहीं' },
  crop: { en: 'Main Crop', ta: 'முதன்மை பயிர்', hi: 'मुख्य फसल' },
  checkBtn: { en: 'Check My Schemes', ta: 'என் திட்டங்களை சரிபார்', hi: 'मेरी योजनाएँ जाँचें' },
  againBtn: { en: 'Change Details', ta: 'விவரங்களை மாற்று', hi: 'जानकारी बदलें' },
  eligible: { en: 'YOU ARE ELIGIBLE', ta: 'உங்களுக்கு தகுதி உண்டு', hi: 'आप योग्य हैं' },
  maybe: { en: 'NEEDS DOCUMENTS', ta: 'சான்றுகள் தேவை', hi: 'दस्तावेज़ चाहिए' },
  notEligible: { en: 'NOT THIS SCHEME', ta: 'இந்த திட்டம் இல்லை', hi: 'यह योजना नहीं' },
} as const;

const tr = (key: keyof typeof T, lang: PrimaryLang) => T[key][lang];

export default function SchemeEligibilityWizard({ profile, currentLanguage, onSpeak, onCheckComplete }: SchemeEligibilityWizardProps) {
  const lang = (currentLanguage === 'ta' ? 'ta' : currentLanguage === 'hi' ? 'hi' : 'en') as PrimaryLang;
  const [details, setDetails] = useState<FarmerDetails>({
    state: profile?.state || 'Tamil Nadu',
    district: profile?.districtName || '',
    landSizeAcres: profile?.landSizeAcres || 2.5,
    category: (profile?.landSizeAcres || 2.5) < 2.5 ? 'marginal' : (profile?.landSizeAcres || 0) <= 5 ? 'small' : 'other',
    tenure: 'owner',
    hasIrrigation: true,
    crop: profile?.primaryCrop && profile.primaryCrop !== 'To be advised by satellite' ? profile.primaryCrop : 'Paddy',
  });
  const [matches, setMatches] = useState<SchemeMatch[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const verdictSpoken = useMemo(() => {
    if (!matches) return null;
    const top = matches.find((m) => m.verdict === 'eligible');
    const count = matches.filter((m) => m.verdict === 'eligible').length;
    if (lang === 'ta') {
      return count > 0
        ? `ஆம், தகுதி உண்டு! ${top?.nameTa} உங்களுக்கு நிச்சயம் பொருந்தும். மொத்தம் ${count} திட்டங்கள் உறுதியாக உள்ளன.`
        : 'சில திட்டங்களுக்கு கூடுதல் ஆவணங்கள் தேவை. உள்ளூர் வேளாண் அலுவலரை அணுகுங்கள்.';
    }
    if (lang === 'hi') {
      return count > 0
        ? `हाँ, आप योग्य हैं! ${top?.nameHi} आपके लिए निश्चित फिट है। कुल ${count} योजनाएँ पक्की हैं।`
        : 'कुछ योजनाओं के लिए अतिरिक्त दस्तावेज़ चाहिए। स्थानीय कृषि अधिकारी से मिलें।';
    }
    return count > 0
      ? `Yes — you qualify! ${top?.name} definitely fits you. ${count} schemes are a sure match.`
      : 'No instant match — a few schemes need extra documents. Meet your local agriculture officer.';
  }, [matches, lang]);

  const runCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      const result = matchSchemes(details);
      setMatches(result);
      setIsChecking(false);
      onSpeak(summarizeMatches(result, lang) + ' ' + (verdictSpoken || ''), 'happy');
      onCheckComplete?.(result.filter((m) => m.verdict === 'eligible').length, result.length);
    }, 700);
  };

  const verdictStyle = (v: SchemeMatch['verdict']) =>
    v === 'eligible'
      ? { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', icon: <CheckCircle2 className="w-4 h-4" />, label: tr('eligible', lang) }
      : v === 'maybe'
      ? { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40', icon: <AlertTriangle className="w-4 h-4" />, label: tr('maybe', lang) }
      : { badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40', icon: <XCircle className="w-4 h-4" />, label: tr('notEligible', lang) };

  return (
    <div className="rounded-2xl border-2 border-emerald-800/50 bg-slate-900/70 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
          <ClipboardList className="w-5 h-5 text-emerald-300" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-white">{tr('title', lang)}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{tr('subtitle', lang)}</p>
        </div>
      </div>

      {/* STEP 1 — mascot asks the farmer's details */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-300 uppercase tracking-wide">
          {tr('state', lang)}
          <input
            value={details.state}
            onChange={(e) => setDetails({ ...details, state: e.target.value })}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-medium normal-case focus:border-emerald-500 outline-none"
            placeholder="Tamil Nadu"
          />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-300 uppercase tracking-wide">
          {tr('acres', lang)}
          <input
            type="number"
            min={0.1}
            step={0.5}
            value={details.landSizeAcres}
            onChange={(e) => setDetails({ ...details, landSizeAcres: Number(e.target.value) || 0 })}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-medium focus:border-emerald-500 outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-300 uppercase tracking-wide">
          {tr('category', lang)}
          <select
            value={details.category}
            onChange={(e) => setDetails({ ...details, category: e.target.value as FarmerCategory })}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-medium focus:border-emerald-500 outline-none"
          >
            <option value="marginal">{tr('catMarginal', lang)}</option>
            <option value="small">{tr('catSmall', lang)}</option>
            <option value="other">{tr('catOther', lang)}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-300 uppercase tracking-wide">
          {tr('tenure', lang)}
          <select
            value={details.tenure}
            onChange={(e) => setDetails({ ...details, tenure: e.target.value as LandTenure })}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-medium focus:border-emerald-500 outline-none"
          >
            <option value="owner">{tr('tenOwner', lang)}</option>
            <option value="tenant">{tr('tenTenant', lang)}</option>
            <option value="shared">{tr('tenShared', lang)}</option>
          </select>
        </label>
        <div className="flex flex-col gap-1 text-[11px] font-bold text-slate-300 uppercase tracking-wide">
          {tr('irrigation', lang)}
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                onClick={() => setDetails({ ...details, hasIrrigation: v })}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-bold cursor-pointer transition ${
                  details.hasIrrigation === v
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {v ? tr('yes', lang) : tr('no', lang)}
              </button>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-300 uppercase tracking-wide">
          {tr('crop', lang)}
          <input
            value={details.crop}
            onChange={(e) => setDetails({ ...details, crop: e.target.value })}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-medium focus:border-emerald-500 outline-none"
            placeholder="Paddy"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={runCheck}
          disabled={isChecking}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-sm font-extrabold shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition disabled:opacity-60 cursor-pointer flex items-center gap-2"
        >
          {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
          {tr('checkBtn', lang)}
        </button>
        {matches && (
          <button
            onClick={() => setMatches(null)}
            className="px-3 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:border-slate-500 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> {tr('againBtn', lang)}
          </button>
        )}
      </div>

      {/* STEP 2/3 — VERDICT-FIRST results */}
      {matches && (
        <div className="mt-5 space-y-2.5">
          {matches.map((m) => {
            const vs = verdictStyle(m.verdict);
            const name = lang === 'ta' ? m.nameTa : lang === 'hi' ? m.nameHi : m.name;
            return (
              <div key={m.id} className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black tracking-wide ${vs.badge}`}>
                    {vs.icon} {vs.label}
                  </span>
                  <span className="text-sm font-bold text-white">{name}</span>
                </div>
                <p className="text-xs text-slate-300">{m.benefit[lang]}</p>
                <p className="text-[11px] text-slate-500 font-medium">{m.reason[lang]}</p>
                {m.verdict !== 'not-eligible' && (
                  <a
                    href={m.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    Apply / Portal <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
