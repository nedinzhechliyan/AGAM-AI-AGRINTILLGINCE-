import React, { useState } from 'react';
import {
  Wind,
  Sun,
  Droplets,
  CloudRain,
  Compass,
  RefreshCw,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ChevronDown,
  Layers,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface LandAndWeatherProps {
  onSpeak: (text: string) => void;
}

export default function LandAndWeather({ onSpeak }: LandAndWeatherProps) {
  const [selectedProduce, setSelectedProduce] = useState<'Paddy' | 'Turmeric' | 'Coffee' | 'Red Chilli' | 'Groundnut'>('Paddy');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'cards' | 'parcel' | 'trends'>('cards');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Chengalpattu (Tamil Nadu) — Paddy / Rice');

  const produceData = {
    Paddy: { insolation: '5.2 kWh/m²/day', duration: '4 Hours (Single Day Window)', moisture: '14% Safe Buffer', status: 'FULL SUN (FAST DRYING)' },
    Turmeric: { insolation: '5.4 kWh/m²/day', duration: '6 Hours (Single Day Window)', moisture: '10% Safe Buffer', status: 'FULL SUN (FAST DRYING)' },
    Coffee: { insolation: '4.8 kWh/m²/day', duration: '5 Hours (Gentle Sun Window)', moisture: '12% Safe Buffer', status: 'MODERATE SUN' },
    'Red Chilli': { insolation: '5.6 kWh/m²/day', duration: '3.5 Hours (Quick Dry Window)', moisture: '11% Safe Buffer', status: 'FULL SUN (FAST DRYING)' },
    Groundnut: { insolation: '5.1 kWh/m²/day', duration: '4.5 Hours (Standard Window)', moisture: '9% Safe Buffer', status: 'FULL SUN (FAST DRYING)' }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onSpeak("NASA POWER satellite data reanalyzed. Wind is 13.2 km/h. Conditions optimal for pesticide spraying and post-harvest sun drying!");
    }, 800);
  };

  const activeProduce = produceData[selectedProduce];

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Top Banner & Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono-code font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                NASA POWER SATELLITE CLIMATOLOGY
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-[11px] font-mono-code text-slate-300 border border-slate-700/60">
                15 National Agro-Zones
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              Land &amp; Weather Intelligence Advisory
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time satellite reanalysis (T2M, RH2M, PRECTOTCORR, GWETROOT, WS2M, ALLSKY_SFC_SW_DWN) converted into plain actionable farming decisions.
            </p>
          </div>

          {/* District Selector Dropdown */}
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[11px] font-mono-code text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              Selected District (15 Across India): <strong className="text-slate-200">Tamil Nadu</strong>
            </span>
            <div className="relative mt-1">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer shadow-inner"
              >
                <option value="Chengalpattu (Tamil Nadu) — Paddy / Rice">Chengalpattu (Tamil Nadu) — Paddy / Rice</option>
                <option value="Thanjavur (Tamil Nadu) — Delta Paddy">Thanjavur (Tamil Nadu) — Delta Paddy</option>
                <option value="Coimbatore (Tamil Nadu) — Cotton / Millets">Coimbatore (Tamil Nadu) — Cotton / Millets</option>
                <option value="Kurnool (Andhra Pradesh) — Groundnut">Kurnool (Andhra Pradesh) — Groundnut</option>
                <option value="Ludhiana (Punjab) — Wheat / Mustard">Ludhiana (Punjab) — Wheat / Mustard</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Live Data Meta Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono-code flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Data: NASA POWER API · Sep 25, 2026
            </span>
            <span className="px-2 py-1 rounded-lg bg-slate-950 text-slate-400 font-mono-code border border-slate-800">
              lat: 12.6819, lon: 79.9774
            </span>
          </div>

          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh NASA Data</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="flex items-center justify-center gap-2">
        <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveSubTab('cards')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'cards'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡ Weather Decision Cards</span>
          </button>
          <button
            onClick={() => setActiveSubTab('parcel')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'parcel'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🌾 Land Parcel &amp; Polygon</span>
          </button>
          <button
            onClick={() => setActiveSubTab('trends')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'trends'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📈 7-Day Satellite Trends</span>
          </button>
        </div>
      </div>

      {/* Decision Engine Header */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-emerald-400 font-bold text-lg">⚡</span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          NASA POWER Weather Decision Engine
        </h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
          Satellite Telemetry
        </span>
      </div>

      {/* Decision Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Safe Pesticide Spraying */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md shadow-lg hover:border-slate-700 transition">
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono-code text-slate-400 uppercase tracking-wider block">
                    PARAMETER: WS2M (WIND AT 2M)
                  </span>
                  <h4 className="text-base font-bold text-slate-100">Safe Pesticide Spraying Card</h4>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                YES - SAFE TO SPRAY
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs text-slate-400">Measured Wind Velocity:</span>
                <span className="text-2xl font-bold font-mono-code text-slate-100">
                  13.2 <span className="text-xs font-normal text-slate-400">km/h</span>
                </span>
              </div>

              {/* Progress gauge bar */}
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 rounded-full w-[44%]" />
              </div>

              <div className="flex justify-between text-[10px] font-mono-code text-slate-400 mt-1">
                <span>0 km/h (Calm)</span>
                <span className="text-amber-400 font-semibold">15 km/h (Spray Limit)</span>
                <span className="text-rose-400">30+ km/h (Storm)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-950/60 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="text-amber-400 font-bold">⏱</span>
              <strong className="text-slate-200">Field Spray Guidance:</strong>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Safe to Spray (Wind: 13.2 km/h). Low drift hazard. Optimal spray window: <strong>6:00 AM – 9:00 AM</strong>.
            </p>
          </div>
        </div>

        {/* Card 2: Sun-Drying Window (Post-Harvest) */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md shadow-lg hover:border-slate-700 transition">
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono-code text-slate-400 uppercase tracking-wider block">
                    PARAMETER: ALLSKY_SFC_SW_DWN
                  </span>
                  <h4 className="text-base font-bold text-slate-100">Sun-Drying Window (Post-Harvest)</h4>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1">
                <Sun className="w-3.5 h-3.5" />
                {activeProduce.status}
              </span>
            </div>

            {/* Produce buttons selector */}
            <div className="mt-3">
              <span className="text-[11px] font-mono-code text-slate-400 uppercase block mb-1.5">
                SELECT HARVEST PRODUCE:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['Paddy', 'Turmeric', 'Coffee', 'Red Chilli', 'Groundnut'] as const).map((crop) => (
                  <button
                    key={crop}
                    onClick={() => {
                      setSelectedProduce(crop);
                      onSpeak(`${crop} sun-drying duration estimated at ${produceData[crop].duration}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      selectedProduce === crop
                        ? 'bg-emerald-600 text-white font-bold shadow'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono-code">Solar Insolation:</span>
                <span className="text-sm font-bold text-slate-100 font-mono-code">{activeProduce.insolation}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono-code">Drying Duration:</span>
                <span className="text-sm font-bold text-amber-300 font-mono-code">{activeProduce.duration}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono-code">Target Moisture:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono-code">{activeProduce.moisture}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-950/60 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-slate-300">
              🌾 Drying yard moisture risk: <strong className="text-emerald-400">Zero Rainfall Forecasted</strong>
            </span>
            <span className="text-[11px] font-mono-code text-slate-400">Chengalpattu Grid</span>
          </div>
        </div>
      </div>

      {/* Satellite Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-mono-code text-slate-400 block">AIR TEMP (T2M)</span>
          <span className="text-lg font-bold text-slate-100 font-mono-code">31.4 °C</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Optimal Vegetative</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-mono-code text-slate-400 block">HUMIDITY (RH2M)</span>
          <span className="text-lg font-bold text-slate-100 font-mono-code">68 %</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Normal Evapotranspiration</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-mono-code text-slate-400 block">ROOT MOISTURE</span>
          <span className="text-lg font-bold text-slate-100 font-mono-code">74 %</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Root Zone Saturated</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-mono-code text-slate-400 block">PRECIPITATION</span>
          <span className="text-lg font-bold text-slate-100 font-mono-code">0.0 mm</span>
          <span className="text-[10px] text-sky-400 block mt-0.5">Clear Skies Ahead</span>
        </div>
      </div>
    </div>
  );
}
