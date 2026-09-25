import React, { useState } from 'react';
import { 
  Wind, 
  Sun, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  Waves, 
  Sparkles,
  Info,
  Layers,
  Flame,
  Snowflake,
  Coffee,
  Wheat,
  Activity
} from 'lucide-react';
import { WeatherDecisionMetrics } from '../types';
import { soundkit } from '../services/soundkit';

interface WeatherIntelligenceCardsProps {
  metrics: WeatherDecisionMetrics;
  landSizeAcres: number;
  primaryCrop?: string;
  isLive?: boolean;
}

const DRYING_PRODUCE_PRESETS = [
  { id: 'paddy', name: 'Paddy / Rice (நெல்)', fullSunHours: 4, modSunHours: 7, idealMoisture: '14%' },
  { id: 'turmeric', name: 'Turmeric (மஞ்சள்)', fullSunHours: 12, modSunHours: 24, idealMoisture: '10%' },
  { id: 'coffee', name: 'Coffee Beans (காபி)', fullSunHours: 8, modSunHours: 16, idealMoisture: '11%' },
  { id: 'chilli', name: 'Red Chilli (மிளகாய்)', fullSunHours: 6, modSunHours: 12, idealMoisture: '10%' },
  { id: 'groundnut', name: 'Groundnut (வேர்க்கடலை)', fullSunHours: 5, modSunHours: 9, idealMoisture: '8%' },
];

export function WeatherIntelligenceCards({
  metrics,
  landSizeAcres,
  primaryCrop = 'Paddy / Rice',
  isLive = true,
}: WeatherIntelligenceCardsProps) {
  const [selectedProduce, setSelectedProduce] = useState(DRYING_PRODUCE_PRESETS[0]);
  const [dripRateLph, setDripRateLph] = useState<number>(4); // Liters per hour per dripper

  // Calculate estimated drip running time in hours
  // Assuming 2,500 drippers per acre
  const totalDrippers = Math.round(landSizeAcres * 2500);
  const pumpCapacityLph = totalDrippers * dripRateLph;
  const dripRunHours = Math.round((metrics.totalIrrigationLiters / (pumpCapacityLph || 10000)) * 10) / 10;

  const currentProduceDryingTime = 
    metrics.dryingIndex === 'Full Sun (Fast Drying)'
      ? `${selectedProduce.fullSunHours} Hours (Single Day Window)`
      : metrics.dryingIndex === 'Moderate Sun'
      ? `${selectedProduce.modSunHours} Hours (2-Day Split Window)`
      : 'Unsafe for Sun Drying (Cover with Tarpaulin Immediately)';

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1b4332]" />
              <span>NASA POWER Weather Decision Engine</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d8f3dc] text-[#1b4332] font-bold border border-[#b7e4c7]">
              {isLive ? 'Satellite Telemetry' : 'Calibrated Orbit'}
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Real-time agro-meteorological decisions translated into 4 single-look action cards
          </p>
        </div>
      </div>

      {/* 4 Decision Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARD 1: SAFE PESTICIDE SPRAYING CARD (WS2M) */}
        <div className="bg-white rounded-2xl border-2 border-[#e6ccb2] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                  <Wind className="w-5 h-5 text-sky-700" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Parameter: WS2M (Wind at 2m)
                  </span>
                  <h3 className="text-sm font-black text-stone-900">
                    Safe Pesticide Spraying Card
                  </h3>
                </div>
              </div>

              {/* Single-Look Decision Badge */}
              {metrics.isSafeToSpray ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border-2 border-emerald-500 font-black text-xs shadow-xs animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>YES - SAFE TO SPRAY</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-900 border-2 border-rose-500 font-black text-xs shadow-xs animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>NO - HIGH WIND (POSTPONE)</span>
                </span>
              )}
            </div>

            {/* Wind Metric Meter */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 mt-3">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-bold text-stone-700">Measured Wind Velocity:</span>
                <span className="text-2xl font-black font-mono text-stone-900">
                  {metrics.windSpeedKmh.toFixed(1)}{' '}
                  <span className="text-xs font-bold text-stone-500">km/h</span>
                </span>
              </div>

              {/* Visual Threshold Bar */}
              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    metrics.isSafeToSpray ? 'bg-emerald-500' : 'bg-rose-600'
                  }`}
                  style={{ width: `${Math.min(100, (metrics.windSpeedKmh / 30) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-500 mt-1 font-mono">
                <span>0 km/h (Calm)</span>
                <span className="text-amber-700 font-bold">15 km/h (Spray Limit)</span>
                <span>30+ km/h (Storm)</span>
              </div>
            </div>

            {/* Practical Agronomic Advice */}
            <div className="mt-3 text-xs text-stone-700 leading-relaxed bg-[#faf7f2] p-3 rounded-xl border border-[#e6ccb2]">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold mb-1">
                <Clock className="w-3.5 h-3.5 text-[#2d6a4f]" />
                <span>Field Spray Guidance:</span>
              </div>
              <p>{metrics.sprayAdvice}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>Optimal Nozzle: Flat Fan (Low Drift)</span>
            <span className="text-[#2d6a4f] font-bold">ICAR Safety Standard</span>
          </div>
        </div>

        {/* CARD 2: GRAIN & SPICE SUN-DRYING WINDOW (ALLSKY_SFC_SW_DWN) */}
        <div className="bg-white rounded-2xl border-2 border-[#e6ccb2] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Parameter: ALLSKY_SFC_SW_DWN
                  </span>
                  <h3 className="text-sm font-black text-stone-900">
                    Sun-Drying Window (Post-Harvest)
                  </h3>
                </div>
              </div>

              {/* Drying Index Pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-xs shadow-xs ${
                  metrics.dryingIndex.includes('Full')
                    ? 'bg-amber-100 text-amber-950 border-2 border-amber-500'
                    : metrics.dryingIndex.includes('Moderate')
                    ? 'bg-blue-100 text-blue-950 border-2 border-blue-400'
                    : 'bg-rose-100 text-rose-950 border-2 border-rose-500'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-600" />
                <span>{metrics.dryingIndex.toUpperCase()}</span>
              </span>
            </div>

            {/* Produce Preset Selector */}
            <div className="mt-3">
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                Select Harvest Produce:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DRYING_PRODUCE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      soundkit.play('buttonTap');
                      setSelectedProduce(preset);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedProduce.id === preset.id
                        ? 'bg-[#1b4332] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {preset.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Solar Radiation & Time Requirement */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Solar Insolation:</span>
                <span className="font-mono font-bold text-stone-900">
                  {metrics.solarRadiation.toFixed(1)} kWh/m²/day
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Estimated Drying Duration:</span>
                <span className="font-bold text-[#1b4332]">{currentProduceDryingTime}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Target Storage Moisture:</span>
                <span className="font-bold text-emerald-700">{selectedProduce.idealMoisture} Safe Buffer</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>Produce: {selectedProduce.name}</span>
            <span className="text-[#b45309] font-bold">Prevents Aflatoxin Mold</span>
          </div>
        </div>

        {/* CARD 3: HEATWAVE & FROST EARLY WARNINGS (T2M_MIN / T2M_MAX) */}
        <div className="bg-white rounded-2xl border-2 border-[#e6ccb2] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-rose-700" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Parameters: T2M_MIN / T2M_MAX
                  </span>
                  <h3 className="text-sm font-black text-stone-900">
                    Thermal Shock & Frost Warning
                  </h3>
                </div>
              </div>

              {/* Alert Badge */}
              {metrics.alertType === 'frost' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-100 text-cyan-950 border-2 border-cyan-500 font-black text-xs shadow-xs animate-pulse">
                  <Snowflake className="w-4 h-4 text-cyan-700" />
                  <span>NIGHT FROST ALERT</span>
                </span>
              ) : metrics.alertType === 'heatwave' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-950 border-2 border-rose-500 font-black text-xs shadow-xs animate-pulse">
                  <Flame className="w-4 h-4 text-rose-700" />
                  <span>HEATWAVE STRESS</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-950 border-2 border-emerald-500 font-black text-xs shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>OPTIMAL THERMAL RANGE</span>
                </span>
              )}
            </div>

            {/* Min & Max Gauges */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200">
                <div className="flex items-center justify-between text-stone-600 text-xs">
                  <span className="font-bold flex items-center gap-1 text-cyan-900">
                    <Snowflake className="w-3.5 h-3.5 text-cyan-700" />
                    Night Low (T2M_MIN)
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono text-cyan-950">
                    {metrics.tempMinC.toFixed(1)}°C
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">Frost Threshold: &lt; 4°C</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center justify-between text-stone-600 text-xs">
                  <span className="font-bold flex items-center gap-1 text-amber-900">
                    <Flame className="w-3.5 h-3.5 text-amber-700" />
                    Day High (T2M_MAX)
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono text-amber-950">
                    {metrics.tempMaxC.toFixed(1)}°C
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">Heatwave: &gt; 40°C</span>
              </div>
            </div>

            {/* Warning Text & Counter-Measure */}
            <div className="mt-3 p-3 rounded-xl bg-[#faf7f2] border border-[#e6ccb2] text-xs text-stone-700 leading-relaxed">
              <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>Actionable Protective Protocol:</span>
              </div>
              <p>
                {metrics.temperatureAlert ||
                  `Temperatures are within favorable physiological range (${metrics.tempMinC.toFixed(0)}°C – ${metrics.tempMaxC.toFixed(0)}°C) for ${primaryCrop}. Maintain regular cultural practices.`}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>Thermal Diurnal Delta: {(metrics.tempMaxC - metrics.tempMinC).toFixed(1)}°C</span>
            <span className="text-[#2d6a4f] font-bold">NASA Daily Orbit</span>
          </div>
        </div>

        {/* CARD 4: PRECISION IRRIGATION CALCULATOR */}
        <div className="bg-white rounded-2xl border-2 border-[#e6ccb2] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Derived Drip Irrigation Engine
                  </span>
                  <h3 className="text-sm font-black text-stone-900">
                    Precision Water Calculator
                  </h3>
                </div>
              </div>

              {/* Acreage Tag */}
              <span className="px-2.5 py-1 rounded-lg bg-[#d8f3dc] text-[#1b4332] font-black text-xs border border-[#b7e4c7]">
                {landSizeAcres} Registered Acres
              </span>
            </div>

            {/* Calculated Recommendation Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] text-white shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-[#d8f3dc] font-bold block">
                Today's Prescribed Irrigation Volume:
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">
                  {metrics.irrigationLitersPerAcre.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-[#d8f3dc]">Liters / Acre Today</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#52b788]/30 flex items-center justify-between text-xs text-[#d8f3dc]">
                <span>Total Field Volume ({landSizeAcres} ac):</span>
                <span className="font-mono font-black text-white text-sm">
                  {metrics.totalIrrigationLiters.toLocaleString()} Liters
                </span>
              </div>
            </div>

            {/* Pump Running Time Estimation */}
            <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2d6a4f]" />
                <span className="font-bold text-stone-800">Drip Run Time:</span>
              </div>
              <div className="text-right">
                <span className="font-black text-stone-900 text-sm font-mono">
                  ~{dripRunHours} Hours
                </span>
                <span className="text-[10px] text-stone-500 block">@ 4 LPH Dripper Lines</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>Water Savings vs Flood Irrigation: <strong>~65%</strong></span>
            <span className="text-[#2d6a4f] font-bold">PMKSY Drip Guidelines</span>
          </div>
        </div>
      </div>
    </div>
  );
}
