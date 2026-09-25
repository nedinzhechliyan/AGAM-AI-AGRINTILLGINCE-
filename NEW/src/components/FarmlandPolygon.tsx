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
              Land Parcel
            </button>
          </div>
        </div>

        {/* High-Tech Cadastral Canvas Area */}
        <div className="w-full h-[360px] sm:h-[420px] rounded-2xl bg-[#061811] border border-emerald-900/40 relative flex items-center justify-center overflow-hidden">
          {/* Radar Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#064e3b15_1px,transparent_1px),linear-gradient(to_bottom,#064e3b15_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#10b98122_1px,transparent_1px)] [background-size:20px_20px]" />

          {/* SVG Cadastral Polygon Map */}
          <svg className="w-full h-full relative z-10" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="parcelFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.12" />
              </linearGradient>
              <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Cadastral Land Boundary Polygon */}
            {/* Coordinates: P1(190, 110), P2(395, 125), P3(375, 290), P4(205, 275) */}
            <polygon
              points="190,110 395,125 375,290 205,275"
              fill="url(#parcelFillGrad)"
              stroke="#34d399"
              strokeWidth="2.5"
              filter="url(#glowGreen)"
            />

            {/* Diagonal Survey Traverses */}
            <line x1="190" y1="110" x2="375" y2="290" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <line x1="395" y1="125" x2="205" y2="275" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

            {/* Corner GPS Pin Points */}
            {/* P1 */}
            <g transform="translate(190, 110)">
              <circle cx="0" cy="0" r="8" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="3" fill="#ffffff" />
              <text x="-65" y="-12" fill="#e2e8f0" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
                P1 (12.6837°)
              </text>
            </g>

            {/* P2 */}
            <g transform="translate(395, 125)">
              <circle cx="0" cy="0" r="8" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="3" fill="#ffffff" />
              <text x="14" y="-10" fill="#e2e8f0" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
                P2 (12.6835°)
              </text>
            </g>

            {/* P3 */}
            <g transform="translate(375, 290)">
              <circle cx="0" cy="0" r="8" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="3" fill="#ffffff" />
              <text x="14" y="16" fill="#e2e8f0" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
                P3 (12.6804°)
              </text>
            </g>

            {/* P4 */}
            <g transform="translate(205, 275)">
              <circle cx="0" cy="0" r="8" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="3" fill="#ffffff" />
              <text x="-65" y="20" fill="#e2e8f0" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
                P4 (12.6808°)
              </text>
            </g>

            {/* Center Area Badge */}
            <g transform="translate(285, 200)">
              <rect x="-65" y="-22" width="130" height="44" rx="12" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" opacity="0.95" />
              <text x="0" y="-3" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="'Plus Jakarta Sans', sans-serif">
                1 ACRES
              </text>
              <text x="0" y="13" textAnchor="middle" fill="#34d399" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
                Paddy FIELD
              </text>
            </g>
          </svg>
        </div>

        {/* Farmland Metadata Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono-code text-slate-400 block">PARCEL SURVEY NO.</span>
            <span className="text-sm font-bold text-slate-100 font-mono-code">284/2A</span>
            <span className="text-[10px] text-emerald-400 block">Verified Revenue Dept.</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono-code text-slate-400 block">SOIL CLASSIFICATION</span>
            <span className="text-sm font-bold text-slate-100 font-mono-code">Clayey Loam</span>
            <span className="text-[10px] text-emerald-400 block">pH 6.8 · High Fertility</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono-code text-slate-400 block">IRRIGATION SOURCE</span>
            <span className="text-sm font-bold text-slate-100 font-mono-code">Borewell + Canal</span>
            <span className="text-[10px] text-emerald-400 block">Continuous Supply</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono-code text-slate-400 block">CADASTRAL PERIMETER</span>
            <span className="text-sm font-bold text-slate-100 font-mono-code">260 Meters</span>
            <span className="text-[10px] text-emerald-400 block">Fenced &amp; Georeferenced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
