/**
 * Lane 1 — Land & Satellite Intelligence.
 * The mascot docks RIGHT while this lane owns the screen: live NASA POWER
 * telemetry for ANY district the farmer asks (via OSM resolver), the 3D globe
 * of the active district, and deterministic regenerative crop recommendations
 * scored against the live telemetry.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Satellite, Droplets, CloudRain, Thermometer, Wind, Sun, Search, Loader2,
  Sprout, RefreshCw, AlertTriangle, Leaf, Star,
} from 'lucide-react';
import { LandGlobe3D } from './LandGlobe3D';
import { resolveDistrict, ResolvedDistrict } from '../services/districtResolver';
import { fetchNasaPowerByCoords, NasaPowerExtractedData } from '../services/nasaPowerService';
import { scoreCropAgainstTelemetry, REGENERATIVE_CROPS } from '../data/regenerativeCrops';
import { FarmerLandProfile } from '../services/firebase';
import { evaluateIrrigationRisk } from '../rules/advisoryEngine';
import { soundkit } from '../services/soundkit';
import { MASCOT_DIALOGUES, DialogueLang } from '../data/mascotDialogues';
import { LanguageCode } from '../data/languages';
import { Emotion, RegenerativeRecommendation } from '../types';

interface Lane1SatelliteProps {
  profile: FarmerLandProfile | null;
  currentLanguage: LanguageCode;
  onSpeak: (text: string, emotion?: Emotion) => void;
  focusDistrictName?: string | null; // voice-jump target district
}

export function Lane1Satellite({ profile, currentLanguage, onSpeak, focusDistrictName }: Lane1SatelliteProps) {
  const dlg = MASCOT_DIALOGUES[(currentLanguage === 'ta' ? 'ta' : currentLanguage === 'hi' ? 'hi' : 'en') as DialogueLang];
  const [activeDistrict, setActiveDistrict] = useState<ResolvedDistrict | null>(null);
  const [telemetry, setTelemetry] = useState<NasaPowerExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const requestedOnce = useRef(false);

  const dialogueLang: DialogueLang = currentLanguage === 'ta' ? 'ta' : currentLanguage === 'hi' ? 'hi' : 'en';

  const loadDistrict = useCallback(
    async (district: ResolvedDistrict) => {
      setActiveDistrict(district);
      setIsLoading(true);
      setError(null);
      soundkit.play('tabChange');
      try {
        const data = await fetchNasaPowerByCoords(district.name, district.coords.lat, district.coords.lon, profile?.landSizeAcres ?? 2.5);
        setTelemetry(data);
        // Publish live telemetry so voice/RAG answers cite real satellite numbers
        const irrigationRisk = evaluateIrrigationRisk(data.soilMoisture, data.rainForecast);
        (window as any).AgamTelemetry = {
          districtName: district.name,
          stateName: district.state,
          soilMoisture: data.soilMoisture,
          rainForecast: data.rainForecast,
          tempC: data.tempC,
          tempMinC: data.tempMinC,
          tempMaxC: data.tempMaxC,
          humidity: data.humidity,
          windSpeedKmh: data.windSpeedKmh,
          solarRadiation: data.solarRadiation,
          irrigationNeeded: irrigationRisk.irrigationNeeded,
          riskLevel: irrigationRisk.riskLevel,
          isLive: data.isLive,
        };
        soundkit.play('notification');
        onSpeak(data.isLive ? dlg.liveDataReady(district.name) : dlg.error, 'thinking');
      } catch {
        setError('Satellite fetch failed. Try again.');
        soundkit.play('error');
      } finally {
        setIsLoading(false);
      }
    },
    [dlg, onSpeak, profile?.landSizeAcres]
  );

  // Auto-load the farmer's saved district on first mount
  useEffect(() => {
    if (requestedOnce.current) return;
    requestedOnce.current = true;
    const initial = profile?.districtName || 'Chengalpattu';
    resolveDistrict(initial).then(loadDistrict);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Voice jump: when the mascot hears "show me <district>", fly the globe there
  useEffect(() => {
    if (!focusDistrictName) return;
    if (focusDistrictName === activeDistrict?.name) return;
    let cancelled = false;
    resolveDistrict(focusDistrictName).then((r) => {
      if (!cancelled) loadDistrict(r);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusDistrictName]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const r = await resolveDistrict(searchQuery);
    setSearchQuery('');
    loadDistrict(r);
  };

  // Deterministic regenerative recommendations from live telemetry
  const recommendations: RegenerativeRecommendation[] = useMemo(() => {
    if (!telemetry) return [];
    return REGENERATIVE_CROPS.map((c) =>
      scoreCropAgainstTelemetry(c, {
        soilMoisture: telemetry.soilMoisture,
        tempC: telemetry.tempC,
        rainForecast: telemetry.rainForecast,
        windSpeedKmh: telemetry.windSpeedKmh,
        solarRadiation: telemetry.solarRadiation,
      })
    ).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }, [telemetry]);

  const bestCrop = recommendations[0];

  // Speak the top recommendation once telemetry lands
  const spokenRef = useRef<string | null>(null);
  useEffect(() => {
    if (bestCrop && telemetry?.isLive && activeDistrict) {
      const key = `${activeDistrict.name}:${bestCrop.cropId}`;
      if (spokenRef.current !== key) {
        spokenRef.current = key;
        onSpeak(dlg.bestCrop(bestCrop.cropName, bestCrop.suitabilityScore), 'happy');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bestCrop?.cropId, telemetry?.isLive]);

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Search-any-district bar */}
      <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto flex gap-2">
        <div className="flex-1 relative">
          <Satellite className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              currentLanguage === 'ta'
                ? 'எந்த மாவட்டமும் கேளுங்கள் — உதா: Thanjavur'
                : currentLanguage === 'hi'
                ? 'कोई भी ज़िला पूछिए — जैसे: Thanjavur'
                : 'Ask for ANY district — e.g. Thanjavur, Ludhiana, Guntur...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !searchQuery.trim()}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Fetch NASA
        </button>
      </form>

      {error && (
        <div className="max-w-3xl mx-auto w-full p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {isLoading && !telemetry && (
        <div className="max-w-3xl mx-auto w-full py-16 flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs font-mono-code">Contacting NASA POWER satellites for {activeDistrict?.name}...</span>
        </div>
      )}

      {telemetry && activeDistrict && (
        <div className="w-full flex flex-col gap-4">
          {/* Globe + live telemetry grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <LandGlobe3D
                lat={activeDistrict.coords.lat}
                lon={activeDistrict.coords.lon}
                districtName={activeDistrict.name}
                stateName={activeDistrict.state}
                village={profile?.village}
                acres={profile?.landSizeAcres}
                height={340}
              />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Satellite className="w-3.5 h-3.5" /> Live NASA POWER
                </span>
                <button
                  onClick={() => loadDistrict(activeDistrict)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-300 transition cursor-pointer"
                  title="Refresh telemetry"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full w-fit ${telemetry.isLive ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'}`}>
                {telemetry.isLive ? `LIVE · observed ${telemetry.observationDate}` : 'BASELINE ORBIT (satellite link busy)'}
              </span>

              <TelemetryCard icon={<Droplets className="w-4 h-4" />} label="Root-zone Soil Moisture" value={`${telemetry.soilMoisture}%`} sub={`GWETROOT raw ${telemetry.gwetrootRaw.toFixed(2)}`} color="text-sky-300" />
              <TelemetryCard icon={<CloudRain className="w-4 h-4" />} label="Rainfall" value={`${telemetry.rainForecast} mm/day`} sub={telemetry.rainForecast >= 2 ? 'Wet spell — reduce irrigation' : 'Dry spell — plan irrigation'} color="text-blue-300" />
              <TelemetryCard icon={<Thermometer className="w-4 h-4" />} label="Temperature" value={`${telemetry.tempC}°C`} sub={`min ${telemetry.tempMinC}° / max ${telemetry.tempMaxC}°`} color="text-orange-300" />
              <TelemetryCard icon={<Wind className="w-4 h-4" />} label="Wind Speed" value={`${telemetry.windSpeedKmh} km/h`} sub={telemetry.windSpeedKmh <= 15 ? 'Safe spray window' : 'Too windy to spray'} color="text-teal-300" />
              <TelemetryCard icon={<Sun className="w-4 h-4" />} label="Solar Radiation" value={`${telemetry.solarRadiation} kWh/m²`} sub={telemetry.solarRadiation >= 5 ? 'Full sun — fast drying' : 'Cloudy — slow drying'} color="text-yellow-300" />
              <TelemetryCard icon={<Droplets className="w-4 h-4" />} label="Humidity" value={`${telemetry.humidity}%`} sub="Relative humidity RH2M" color="text-cyan-300" />
            </div>
          </div>

          {/* Regenerative crop recommendations */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-400" />
                {currentLanguage === 'ta' ? 'புனர்வளர் பயிர் பரிந்துரைகள்' : currentLanguage === 'hi' ? 'पुनर्योजी फसल सिफ़ारिशें' : 'Regenerative Crop Recommendations'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                scored against LIVE telemetry · zero hallucination
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.slice(0, 4).map((r, i) => (
                <button
                  key={r.cropId}
                  onClick={() => onSpeak(`${r.cropName}: ${r.reason} Role: ${r.regenerativeRole}.`, 'thinking')}
                  className={`text-left p-3.5 rounded-xl border transition cursor-pointer group ${
                    i === 0
                      ? 'bg-emerald-950/50 border-emerald-500/50 hover:border-emerald-400'
                      : 'bg-slate-950/60 border-slate-800 hover:border-emerald-700/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {i === 0 && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                        <span className="text-sm font-extrabold text-slate-100 truncate">{r.cropName}</span>
                      </div>
                      <span className="text-[11px] text-emerald-300/90 font-semibold">{r.localName}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={`text-lg font-black leading-none ${r.suitabilityScore >= 75 ? 'text-emerald-400' : r.suitabilityScore >= 55 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {r.suitabilityScore}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">/100 FIT</div>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none">{r.reason}</p>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 text-[10px] font-semibold border border-sky-900/60">
                      💧 {r.waterNeedMmPerDay}mm/day
                    </span>
                    {r.companionCrop && (
                      <span className="px-1.5 py-0.5 rounded bg-violet-950/60 text-violet-300 text-[10px] font-semibold border border-violet-900/60">
                        🌱 +{r.companionCrop}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {bestCrop && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-start gap-2">
                <Sprout className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  <strong>Mascot pick for {activeDistrict.name}:</strong> {bestCrop.cropName} ({bestCrop.localName}) — {bestCrop.regenerativeRole}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TelemetryCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 hover:border-emerald-700/50 transition">
      <div className={`w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">{label}</span>
          <span className={`text-sm font-black ${color}`}>{value}</span>
        </div>
        <span className="text-[10px] text-slate-500 truncate block">{sub}</span>
      </div>
    </div>
  );
}
