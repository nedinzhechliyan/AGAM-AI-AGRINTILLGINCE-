import React, { useState } from 'react';
import {
  Globe,
  MapPin,
  Maximize2,
  Edit3,
  Layers,
  Compass,
  CheckCircle2,
  TrendingUp,
  Volume2
} from 'lucide-react';

interface FarmlandPolygonProps {
  onSpeak: (text: string) => void;
}

export default function FarmlandPolygon({ onSpeak }: FarmlandPolygonProps) {
  const [activeGeoLevel, setActiveGeoLevel] = useState<'india' | 'district' | 'parcel'>('parcel');

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Farmland Geometry &amp; Cadastral Polygon
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Spatial land records connected with satellite telemetry and government schemes.
          </p>
        </div>

        <button
          onClick={() =>
            onSpeak(
              "Land profile for Kovalam Farmland Zone, Chengalpattu. 1 acre cadastral polygon mapped with four GPS coordinates."
            )
          }
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs transition flex items-center gap-1.5 shadow border border-slate-700 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Edit Land Profile</span>
        </button>
      </div>

      {/* Cadastral Polygon Map Stage */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Registry Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100 tracking-wide font-mono-code uppercase">
                  INDIA AGRO-SPATIAL REGISTRY
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  GPS LIVE
                </span>
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Kovalam Farmland Zone · Chengalpattu, Tamil Nadu
              </span>
            </div>
          </div>

          {/* Level Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveGeoLevel('india')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeGeoLevel === 'india'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              India
            </button>
            <button
              onClick={() => setActiveGeoLevel('district')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeGeoLevel === 'district'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              District
            </button>
            <button
              onClick={() => setActiveGeoLevel('parcel')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeGeoLevel === 'parcel'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cadastral Parcel
            </button>
          </div>
        </div>

        {/* Interactive SVG Cadastral Display */}
        <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
          {/* Subtle Grid Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {/* SVG Map Graphics */}
          <svg className="w-full h-full" viewBox="0 0 600 400" fill="none">
            {/* Topographic Lines */}
            <path
              d="M 50 80 Q 200 40 350 90 T 550 60"
              stroke="#334155"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.5"
            />
            <path
              d="M 40 180 Q 180 150 380 200 T 560 170"
              stroke="#334155"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.5"
            />
            <path
              d="M 60 320 Q 220 280 400 330 T 540 300"
              stroke="#334155"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.5"
            />

            {/* Adjacent Survey Parcels */}
            <polygon
              points="80,100 240,110 220,240 70,220"
              fill="#1e293b"
              fillOpacity="0.3"
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <polygon
              points="420,120 540,130 520,270 410,250"
              fill="#1e293b"
              fillOpacity="0.3"
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Target 1-Acre Registered Farmland Cadastral Polygon */}
            <polygon
              points="230,120 430,135 415,290 205,265"
              fill="url(#farmGlow)"
              stroke="#10b981"
              strokeWidth="3"
              className="drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]"
            />

            {/* GPS Corner Markers */}
            <circle cx="230" cy="120" r="5" fill="#34d399" stroke="#064e3b" strokeWidth="2" />
            <circle cx="430" cy="135" r="5" fill="#34d399" stroke="#064e3b" strokeWidth="2" />
            <circle cx="415" cy="290" r="5" fill="#34d399" stroke="#064e3b" strokeWidth="2" />
            <circle cx="205" cy="265" r="5" fill="#34d399" stroke="#064e3b" strokeWidth="2" />

            {/* Internal Crop Contour & Center Label */}
            <path
              d="M 250 170 Q 320 160 395 180"
              stroke="#059669"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <path
              d="M 235 220 Q 310 210 385 230"
              stroke="#059669"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="farmGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating HUD Badge on Cadastral Parcel */}
          <div className="absolute top-6 left-6 bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-mono-code text-slate-400 uppercase block">Spatial Cadastre</span>
            <span className="text-xs font-bold text-slate-100 font-mono-code">
              Survey No: 142/2A · 1.00 Acre
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Boundaries Verified
            </span>
          </div>

          <div className="absolute bottom-6 right-6 bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-lg backdrop-blur-md text-right">
            <span className="text-[10px] font-mono-code text-slate-400 uppercase block">Elevation &amp; Slope</span>
            <span className="text-xs font-bold text-slate-100 font-mono-code">14m MSL · 1.2% Drainage</span>
            <span className="text-[11px] text-sky-400 font-mono-code block mt-0.5">12°40'54.8"N 79°58'38.6"E</span>
          </div>
        </div>
      </div>
    </div>
  );
}
