import React, { useState, useEffect } from 'react';
import { Sprout, ArrowRight, Globe, Check, Sparkles } from 'lucide-react';
import { LANGUAGES, LANGUAGE_LIST, LanguageCode, LanguageOption } from '../data/languages';
import { FarmerLineArtIllustration } from './FarmerLineArtIllustration';

interface LanguageGreetingSplashProps {
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onGetStarted: () => void;
}

export function LanguageGreetingSplash({
  currentLanguage,
  onSelectLanguage,
  onGetStarted,
}: LanguageGreetingSplashProps) {
  // Index of the language currently displayed in the 2-second auto-cycler
  const [cyclingIndex, setCyclingIndex] = useState<number>(() => {
    const idx = LANGUAGE_LIST.findIndex((l) => l.code === currentLanguage);
    return idx >= 0 ? idx : 0;
  });

  const [fadeAnimation, setFadeAnimation] = useState<boolean>(true);

  // Auto-cycle through the 6 languages every 2 seconds (2000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger subtle exit fade
      setFadeAnimation(false);
      setTimeout(() => {
        setCyclingIndex((prev) => (prev + 1) % LANGUAGE_LIST.length);
        setFadeAnimation(true);
      }, 200);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const cyclingLang = LANGUAGE_LIST[cyclingIndex];
  const userLang = LANGUAGES[currentLanguage];

  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle organic soil/leaf background accents (warm earthy tones) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e6ccb2]/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d8f3dc]/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#1b4332] text-[#d8f3dc] flex items-center justify-center shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-[#1b4332] flex items-center gap-1.5">
              AGAM
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e9edc9] text-[#283618] border border-[#ccd5ae]">
                {userLang.roleTag}
              </span>
            </span>
            <span className="text-[11px] text-stone-500 block font-medium">
              AI-Guided Agriculture Management
            </span>
          </div>
        </div>

        {/* Selected language pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#d5bdaf] text-xs font-semibold text-[#78350f] shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-[#b45309]" />
          <span>{userLang.nativeName}</span>
        </div>
      </header>

      {/* Center Hero Card with Farmer Line-Art & Auto-cycling Greeting */}
      <main className="relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center text-center">
        {/* Visual Anchor: Clean Minimalist Line-Art Illustration (SVG, not stock photo or emoji) */}
        <div className="my-2">
          <FarmerLineArtIllustration size="md" />
        </div>

        {/* Auto-cycling Greeting across 6 Indic languages every 2 seconds */}
        <div className="mt-2 min-h-[96px] sm:min-h-[108px] flex flex-col items-center justify-center">
          <div
            className={`transition-all duration-300 transform ${
              fadeAnimation
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-98 translate-y-1'
            }`}
          >
            <h1 className="text-3xl sm:text-5xl font-black text-[#1b4332] tracking-tight">
              {cyclingLang.greeting}
            </h1>
            <p className="mt-2 text-xs sm:text-sm font-semibold text-[#b45309] tracking-wide uppercase">
              {cyclingLang.name} · {cyclingLang.scriptRegion}
            </p>
          </div>
        </div>

        {/* Sub-greeting & Mission Text */}
        <p className="text-stone-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed mt-1">
          {userLang.subGreeting} — providing NASA satellite precision irrigation advisories and AI crop disease diagnostics directly to Indian cultivators.
        </p>

        {/* Auto-cycling Language Progress Indicators */}
        <div className="flex items-center gap-1.5 my-4">
          {LANGUAGE_LIST.map((lang, idx) => (
            <button
              key={lang.code}
              onClick={() => {
                setCyclingIndex(idx);
                onSelectLanguage(lang.code);
              }}
              title={lang.nativeName}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                cyclingIndex === idx
                  ? 'w-7 bg-[#2d6a4f]'
                  : 'w-2 bg-[#d5bdaf] hover:bg-[#b45309]'
              }`}
            />
          ))}
        </div>

        {/* SCREEN 1 LANGUAGE SELECTOR: Button grid to pick preferred language for entire app */}
        <div className="w-full max-w-xl bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#d5bdaf]/80 shadow-xs mt-2">
          <div className="flex items-center justify-between mb-3 text-left">
            <span className="text-xs font-bold text-[#78350f] uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#b45309]" />
              {userLang.selectLanguage}:
            </span>
            <span className="text-[11px] text-stone-500 font-medium">
              6 Regional Languages
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGE_LIST.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-xs'
                      : 'bg-[#faf7f2] hover:bg-[#f5ebe0] text-stone-800 border-[#e6ccb2]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm tracking-wide">
                      {lang.nativeName}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-1 truncate ${
                      isSelected ? 'text-[#d8f3dc]' : 'text-stone-500'
                    }`}
                  >
                    {lang.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Call to Action: Get Started Button */}
        <div className="mt-6 w-full max-w-md">
          <button
            type="button"
            onClick={onGetStarted}
            className="w-full py-3.5 px-6 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] active:scale-[0.99] text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group border border-[#1b4332]"
          >
            <span>{userLang.getStartedBtn}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[11px] text-stone-500 mt-2 text-center">
            {userLang.tagline}
          </p>
        </div>
      </main>

      {/* Earthy Footer Contract */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 border-t border-[#e6ccb2]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1b4332]">AGAM Precision Agriculture</span>
          <span>·</span>
          <span>NASA POWER Satellite</span>
          <span>·</span>
          <span>Gemini Vision</span>
        </div>
        <div className="text-[11px] text-stone-400">
          Earth &amp; Agriculture Design Constitution · Tamil Nadu, India
        </div>
      </footer>
    </div>
  );
}
