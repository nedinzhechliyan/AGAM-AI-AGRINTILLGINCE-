import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Droplets, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Sparkles, 
  Sliders, 
  RotateCcw, 
  Calendar, 
  Thermometer, 
  Info,
  RefreshCw,
  Satellite,
  Radio,
  Clock,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Compass,
  Activity,
  Layers,
  Wind,
  Sun
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { MOCK_DISTRICTS } from '../data/mockDistricts';
import { 
  evaluateIrrigationRisk, 
  generateDeterministicExplanation, 
  analyzeSevenDayMoistureTrend 
} from '../rules/advisoryEngine';
import { DistrictData, AdvisoryRisk, DailyTelemetryPoint } from '../types';
import { fetchNasaPowerData, NasaPowerExtractedData, DISTRICT_COORDINATES } from '../services/nasaPowerService';
import { logAdvisoryToFirestore, FarmerLandProfile } from '../services/firebase';
import { WeatherIntelligenceCards } from './WeatherIntelligenceCards';
import { InteractiveLandGlobe } from './InteractiveLandGlobe';
import { soundkit } from '../services/soundkit';

interface AdvisoryTabProps {
  farmerProfile?: FarmerLandProfile | null;
}

export function AdvisoryTab({ farmerProfile }: AdvisoryTabProps) {
  const initialDistrictId = farmerProfile?.districtId || 'chengalpattu';
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDistrictId);
  const [customMode, setCustomMode] = useState<boolean>(false);
  
  // Search and dropdown state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active view toggle (Decisions vs Interactive Land Parcel vs 7-Day Chart)
  const [subView, setSubView] = useState<'decisions' | 'parcel' | 'trends'>('decisions');

  // Explainability toggle state
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(true);

  // Current district metadata
  const currentDistrict: DistrictData = useMemo(() => {
    return MOCK_DISTRICTS.find(d => d.id === selectedDistrictId) || MOCK_DISTRICTS[0];
  }, [selectedDistrictId]);

  const coords = DISTRICT_COORDINATES[selectedDistrictId] || {
    id: currentDistrict.id,
    name: currentDistrict.name,
    state: currentDistrict.state,
    lat: currentDistrict.latitude,
    lon: currentDistrict.longitude,
  };

  const registeredAcres = farmerProfile?.landSizeAcres || 2.5;
  const primaryCrop = farmerProfile?.primaryCrop || currentDistrict.currentCrop;

  // NASA POWER Live Data State
  const [nasaData, setNasaData] = useState<NasaPowerExtractedData | null>(null);
  const [isLoadingNasa, setIsLoadingNasa] = useState<boolean>(false);
  const [nasaError, setNasaError] = useState<string | null>(null);
  
  // Custom simulation values for interactive testing
  const [customMoisture, setCustomMoisture] = useState<number>(currentDistrict.soilMoisture);
  const [customRain, setCustomRain] = useState<number>(currentDistrict.rainForecast);

  // AI Advisory State (Powered by Groq LPUs & Gemini)
  const [geminiAdvisory, setGeminiAdvisory] = useState<string>('');
  const [advisoryEngine, setAdvisoryEngine] = useState<string>('Groq LPU (Llama 3.3 70B)');
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState<boolean>(false);

  // Today's formatted date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Base values from NASA or fallback
  const baseMoisture = nasaData ? nasaData.soilMoisture : currentDistrict.soilMoisture;
  const baseRain = nasaData ? nasaData.rainForecast : currentDistrict.rainForecast;
  const baseTemp = nasaData ? nasaData.tempC : currentDistrict.tempC;
  const baseHumidity = nasaData ? nasaData.humidity : currentDistrict.humidity;

  // Active inputs
  const activeMoisture = customMode ? customMoisture : baseMoisture;
  const activeRain = customMode ? customRain : baseRain;

  // Deterministic rule engine evaluation
  const computedRisk: AdvisoryRisk = evaluateIrrigationRisk(activeMoisture, activeRain);

  // Deterministic explainability object
  const explainability = generateDeterministicExplanation(activeMoisture, activeRain, computedRisk);

  // 7-Day Telemetry Series
  const telemetryHistory: DailyTelemetryPoint[] = useMemo(() => {
    if (nasaData && nasaData.history && nasaData.history.length > 0) {
      return nasaData.history;
    }
    return currentDistrict.sevenDayHistory || [];
  }, [nasaData, currentDistrict]);

  // 7-day trend analysis
  const trendAnalysis = useMemo(() => {
    return analyzeSevenDayMoistureTrend(telemetryHistory);
  }, [telemetryHistory]);

  // Available unique states
  const availableStates = useMemo(() => {
    const states = Array.from(new Set(MOCK_DISTRICTS.map(d => d.state)));
    return ['ALL', ...states];
  }, []);

  // Filtered districts for search
  const filteredDistricts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return MOCK_DISTRICTS.filter(d => {
      const matchesState = selectedStateFilter === 'ALL' || d.state === selectedStateFilter;
      const matchesSearch = 
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.currentCrop.toLowerCase().includes(q) ||
        d.zone.toLowerCase().includes(q) ||
        (d.tamilName && d.tamilName.toLowerCase().includes(q));
      return matchesState && matchesSearch;
    });
  }, [searchQuery, selectedStateFilter]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Live NASA POWER data
  const loadNasaData = useCallback(async (districtId: string) => {
    setIsLoadingNasa(true);
    setNasaError(null);
    try {
      const data = await fetchNasaPowerData(districtId, registeredAcres);
      setNasaData(data);
      if (!data.isLive) {
        setNasaError(data.errorMessage || 'Live orbit link busy, showing calibrated baseline');
      } else {
        setCustomMoisture(data.soilMoisture);
        setCustomRain(data.rainForecast);
      }
    } catch (err: any) {
      console.error('Error in NASA fetch:', err);
      setNasaError('Live data unavailable, showing last cached values');
    } finally {
      setIsLoadingNasa(false);
    }
  }, [registeredAcres]);

  useEffect(() => {
    loadNasaData(selectedDistrictId);
    setCustomMode(false);
  }, [selectedDistrictId, loadNasaData]);

  // Request Groq / Gemini advisory
  const fetchGroqAdvisory = useCallback(async () => {
    setIsLoadingAdvisory(true);
    try {
      const res = await fetch('/api/groq-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          districtName: currentDistrict.name,
          state: currentDistrict.state,
          crop: primaryCrop,
          soilMoisture: activeMoisture,
          rainForecast: activeRain,
          tempC: baseTemp,
          humidity: baseHumidity,
          riskLevel: computedRisk.riskLevel,
          irrigationNeeded: computedRisk.irrigationNeeded,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch AI advisory');
      const json = await res.json();
      setGeminiAdvisory(json.advisory || '');
      if (json.engine) {
        setAdvisoryEngine(json.engine);
      }
    } catch (e: any) {
      console.warn('AI advisory fetch failed:', e);
      setAdvisoryEngine('Local Agronomic Rules');
      setGeminiAdvisory(
        `Field Agronomy Notice for ${primaryCrop} (${currentDistrict.name}, ${currentDistrict.state}): Soil moisture is at ${activeMoisture}% with ${activeRain}mm rainfall. ${
          computedRisk.irrigationNeeded ? 'Proceed with light drip irrigation during early morning hours.' : 'Hold irrigation to conserve groundwater.'
        }`
      );
    } finally {
      setIsLoadingAdvisory(false);
    }
  }, [
    currentDistrict.name,
    currentDistrict.state,
    primaryCrop,
    activeMoisture,
    activeRain,
    baseTemp,
    baseHumidity,
    computedRisk.riskLevel,
    computedRisk.irrigationNeeded,
  ]);

  useEffect(() => {
    if (nasaData) {
      fetchGroqAdvisory();
      const phone = localStorage.getItem('agam_user_phone') || farmerProfile?.phoneNumber || 'anonymous_farmer';
      logAdvisoryToFirestore(phone, {
        districtId: currentDistrict.id,
        districtName: currentDistrict.name,
        crop: primaryCrop,
        soilMoisture: activeMoisture,
        rainForecast: activeRain,
        riskLevel: computedRisk.riskLevel,
        irrigationNeeded: computedRisk.irrigationNeeded,
      });
    }
  }, [nasaData?.rawDateKey, selectedDistrictId, customMode]);

  const handleDistrictSelect = (district: DistrictData) => {
    soundkit.play('buttonTap');
    setSelectedDistrictId(district.id);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const resetToDistrictDefaults = () => {
    soundkit.play('buttonTap');
    setCustomMoisture(baseMoisture);
    setCustomRain(baseRain);
    setCustomMode(false);
  };

  // Color config based on riskLevel
  const riskStyles = {
    high: {
      badge: 'bg-rose-100 text-rose-900 border-2 border-rose-500',
      bannerBg: 'bg-rose-50/80 border-rose-300',
      text: 'text-rose-700',
      icon: AlertTriangle,
      label: 'HIGH RISK (CRITICAL DEFICIT)',
    },
    medium: {
      badge: 'bg-amber-100 text-amber-950 border-2 border-amber-500',
      bannerBg: 'bg-amber-50/80 border-amber-300',
      text: 'text-amber-800',
      icon: AlertCircle,
      label: 'MEDIUM RISK (SCHEDULE IRRIGATION)',
    },
    low: {
      badge: 'bg-emerald-100 text-emerald-950 border-2 border-emerald-500',
      bannerBg: 'bg-emerald-50/80 border-emerald-300',
      text: 'text-emerald-700',
      icon: CheckCircle2,
      label: 'LOW RISK (OPTIMAL MOISTURE)',
    },
  }[computedRisk.riskLevel];

  const RiskIcon = riskStyles.icon;

  return (
    <div className="space-y-6">
      
      {/* Top Header: Live Satellite Agro-Climatology + Searchable District Dropdown */}
      <div className="bg-white rounded-2xl border-2 border-[#e6ccb2] p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-emerald-900 uppercase flex items-center gap-1.5 bg-[#d8f3dc] px-2.5 py-0.5 rounded-full border border-[#b7e4c7]">
                <Satellite className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                NASA POWER Satellite Climatology
              </span>
              <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-bold border border-stone-200">
                15 National Agro-Zones
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-1.5">
              Land & Weather Intelligence Advisory
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Real-time satellite reanalysis (T2M, RH2M, PRECTOTCORR, GWETROOT, WS2M, ALLSKY_SFC_SW_DWN) converted into plain actionable farming decisions.
            </p>
          </div>

          {/* District Dropdown Selector */}
          <div className="relative w-full lg:w-96" ref={dropdownRef}>
            <label className="text-xs font-bold text-stone-700 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-700" />
                Selected District ({MOCK_DISTRICTS.length} Across India):
              </span>
              <span className="text-[11px] text-stone-500 font-bold">
                {currentDistrict.state}
              </span>
            </label>

            <div 
              onClick={() => {
                soundkit.play('buttonTap');
                setIsDropdownOpen(true);
              }}
              className="relative w-full bg-stone-50 hover:bg-stone-100 border-2 border-[#d5bdaf] rounded-xl shadow-xs transition-all cursor-pointer focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 focus-within:bg-white"
            >
              <div className="flex items-center px-3.5 py-2.5 gap-2">
                <Search className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={isDropdownOpen ? searchQuery : `${currentDistrict.name} (${currentDistrict.state}) — ${primaryCrop}`}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsDropdownOpen(true);
                    setSearchQuery('');
                  }}
                  placeholder="Search district, state, or crop..."
                  className="w-full bg-transparent text-sm font-bold text-stone-900 placeholder-stone-400 focus:outline-none cursor-text"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="p-1 hover:bg-stone-200 rounded text-stone-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="text-stone-400 pl-1">
                  {isDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border-2 border-[#d5bdaf] rounded-2xl shadow-2xl overflow-hidden max-h-96 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2 border-b border-stone-100 bg-stone-50 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-stone-500 font-bold pl-1 shrink-0">State:</span>
                  {availableStates.map(state => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => {
                        soundkit.play('buttonTap');
                        setSelectedStateFilter(state);
                      }}
                      className={`px-2 py-0.5 rounded-full font-bold shrink-0 cursor-pointer transition-colors ${
                        selectedStateFilter === state
                          ? 'bg-[#1b4332] text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>

                <div className="overflow-y-auto divide-y divide-stone-100">
                  {filteredDistricts.map((district) => {
                    const isSelected = district.id === selectedDistrictId;
                    return (
                      <div
                        key={district.id}
                        onClick={() => handleDistrictSelect(district)}
                        className={`p-3 text-left transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected ? 'bg-[#d8f3dc]/60 hover:bg-[#d8f3dc]' : 'hover:bg-stone-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-stone-900">{district.name}</span>
                            {district.tamilName && (
                              <span className="text-xs text-stone-400 font-serif">({district.tamilName})</span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                              {district.state}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                            <span className="text-emerald-800 font-semibold">{district.currentCrop}</span>
                            <span>·</span>
                            <span className="truncate text-stone-400">{district.zone}</span>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-emerald-800 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Satellite Status Bar */}
        <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold shadow-2xs">
              <Radio className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              <span>Live Data: NASA POWER API</span>
              <span className="text-emerald-700/60">·</span>
              <span className="text-emerald-900 font-black">{todayFormatted}</span>
            </div>

            <span className="font-mono text-[11px] bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md border border-stone-200">
              lat: {coords.lat.toFixed(4)}, lon: {coords.lon.toFixed(4)}
            </span>
          </div>

          <button
            onClick={() => {
              soundkit.play('buttonTap');
              loadNasaData(selectedDistrictId);
            }}
            disabled={isLoadingNasa}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isLoadingNasa ? 'animate-spin' : ''}`} />
            <span>{isLoadingNasa ? 'Syncing Satellite...' : 'Refresh NASA Data'}</span>
          </button>
        </div>
      </div>

      {/* Sub-view Navigation Pills (Decisions vs Interactive Parcel vs Historical Trends) */}
      <div className="flex items-center gap-2 bg-[#f5ebe0] p-1.5 rounded-2xl border-2 border-[#d5bdaf] max-w-lg mx-auto justify-center">
        {[
          { id: 'decisions', label: '⚡ Weather Decision Cards' },
          { id: 'parcel', label: '🌾 Land Parcel & Polygon' },
          { id: 'trends', label: '📈 7-Day Satellite Trends' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundkit.play('tabChange');
              setSubView(tab.id as any);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
              subView === tab.id
                ? 'bg-[#1b4332] text-white shadow-md'
                : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUBVIEW 1: NASA WEATHER INTELLIGENCE DECISION CARDS */}
      {subView === 'decisions' && (
        <div className="space-y-6">
          {nasaData?.decisions && (
            <WeatherIntelligenceCards
              metrics={nasaData.decisions}
              landSizeAcres={registeredAcres}
              primaryCrop={primaryCrop}
              isLive={nasaData.isLive}
            />
          )}

          {/* AI Precision Agronomy Advisory Box (Groq LPU + Gemini Dual Engine) */}
          <div className="bg-white rounded-2xl border-2 border-[#e6ccb2] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1b4332] text-[#d8f3dc] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#52b788]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">
                    Groq LPU Agronomic Intelligence Advisory
                  </h3>
                  <span className="text-[10px] text-stone-500 font-mono">Engine: {advisoryEngine}</span>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ICAR Field Grounded
              </span>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-[#faf7f2] border border-[#e6ccb2] text-stone-800 text-xs sm:text-sm leading-relaxed font-semibold">
              {isLoadingAdvisory ? (
                <div className="flex items-center gap-2 text-stone-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                  <span>Synthesizing satellite telemetry on Groq LPU...</span>
                </div>
              ) : (
                <p>{geminiAdvisory || 'Generating advisory based on real-time NASA satellite telemetry...'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: INTERACTIVE LAND PARCEL & POLYGON */}
      {subView === 'parcel' && (
        <div className="space-y-4">
          <InteractiveLandGlobe
            state={currentDistrict.state}
            districtName={currentDistrict.name}
            village={farmerProfile?.village || 'Farmland Plot #108'}
            acres={registeredAcres}
            cropName={primaryCrop}
            lat={coords.lat}
            lon={coords.lon}
            interactive={true}
          />
        </div>
      )}

      {/* SUBVIEW 3: 7-DAY SATELLITE TRENDS & DETERMINISTIC EXPLAINABILITY */}
      {subView === 'trends' && (
        <div className="space-y-6">
          
          {/* Rule Evaluation Banner */}
          <div className={`rounded-2xl p-5 border-2 ${riskStyles.bannerBg} shadow-sm`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <RiskIcon className={`w-8 h-8 ${riskStyles.text}`} />
                <div>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${riskStyles.badge}`}>
                    {riskStyles.label}
                  </span>
                  <h3 className="text-base font-black text-stone-900 mt-1">
                    {computedRisk.irrigationNeeded ? 'Immediate Supplemental Drip Irrigation Required' : 'Field Moisture Buffers Adequate'}
                  </h3>
                </div>
              </div>

              <span className="text-xs font-mono text-stone-500">
                Moisture: {activeMoisture}% · Rain: {activeRain}mm
              </span>
            </div>

            <p className="text-xs text-stone-700 mt-3 font-medium bg-white/70 p-3 rounded-xl border border-stone-200">
              {explainability.explanationText}
            </p>
          </div>

          {/* 7-Day Chart */}
          <div className="bg-white rounded-2xl border-2 border-[#e6ccb2] p-5 shadow-sm">
            <h3 className="text-sm font-black text-stone-900 mb-4">
              7-Day Soil Moisture & Rainfall Trajectory (NASA POWER)
            </h3>

            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="formattedDate" stroke="#6b7280" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#10b981" fontSize={11} domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #e6ccb2' }} />
                  <Legend />
                  <ReferenceLine yAxisId="left" y={30} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical (30%)', fill: '#ef4444', fontSize: 10 }} />
                  <Line yAxisId="left" type="monotone" dataKey="soilMoisture" name="Soil Moisture (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="rainForecast" name="Rainfall (mm)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
