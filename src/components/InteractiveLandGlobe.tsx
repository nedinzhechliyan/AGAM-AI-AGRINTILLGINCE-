import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, 
  MapPin, 
  Layers, 
  Maximize2, 
  Compass, 
  ShieldCheck, 
  Sparkles,
  Ruler,
  CheckCircle2
} from 'lucide-react';
import { soundkit } from '../services/soundkit';

interface InteractiveLandGlobeProps {
  state: string;
  districtName: string;
  village?: string;
  acres: number;
  cropName: string;
  lat?: number;
  lon?: number;
  interactive?: boolean;
}

export function InteractiveLandGlobe({
  state,
  districtName,
  village = 'Farmland Plot #108',
  acres,
  cropName,
  lat = 12.6819,
  lon = 79.9774,
  interactive = true,
}: InteractiveLandGlobeProps) {
  const [zoomLevel, setZoomLevel] = useState<'india' | 'state' | 'district' | 'parcel'>('parcel');
  const [activeCorner, setActiveCorner] = useState<number | null>(null);
  const [pulse, setPulse] = useState<boolean>(true);

  // Auto-pulse animation toggle
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Calculated physical measurements based on acres (1 acre = 4046.86 m² = 43,560 sq ft)
  const sqm = Math.round(acres * 4046.86);
  const sqft = Math.round(acres * 43560).toLocaleString();
  const perimeterMeters = Math.round(Math.sqrt(sqm) * 4);

  // Dynamic Polygon coordinates for the SVG visualization
  // Scale and generate organic farm plot polygon vertices based on land acres
  const polygonVertices = useMemo(() => {
    // Base coordinate box inside 400x280 SVG viewBox
    const cx = 200;
    const cy = 140;
    const scale = Math.min(1.4, Math.max(0.7, Math.sqrt(acres) * 0.45));

    // Polygon corner offsets
    const pts = [
      { id: 1, label: 'NW Boundary (Point A)', x: cx - 110 * scale, y: cy - 70 * scale, offsetLat: 0.0018, offsetLon: -0.0014 },
      { id: 2, label: 'NE Boundary (Point B)', x: cx + 120 * scale, y: cy - 60 * scale, offsetLat: 0.0016, offsetLon: 0.0021 },
      { id: 3, label: 'SE Boundary (Point C)', x: cx + 90 * scale, y: cy + 75 * scale, offsetLat: -0.0019, offsetLon: 0.0017 },
      { id: 4, label: 'SW Boundary (Point D)', x: cx - 100 * scale, y: cy + 65 * scale, offsetLat: -0.0015, offsetLon: -0.0018 },
    ];
    return pts;
  }, [acres]);

  const svgPolygonPoints = polygonVertices.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#0b2016] via-[#102a1e] to-[#081710] border-2 border-[#2d6a4f]/70 overflow-hidden shadow-xl text-white">
      {/* Top Header Controls */}
      <div className="p-3 sm:p-4 border-b border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2d6a4f]/80 text-[#d8f3dc] flex items-center justify-center ring-2 ring-emerald-400/30">
            <Globe className="w-4 h-4 text-emerald-300 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide text-emerald-300 uppercase">
                India Agro-Spatial Registry
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-700/50 font-mono">
                GPS LIVE
              </span>
            </div>
            <p className="text-[11px] text-stone-300 font-medium truncate">
              {village} · {districtName}, {state}
            </p>
          </div>
        </div>

        {/* View Depth Navigator (State -> District -> Village -> Parcel) */}
        {interactive && (
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-emerald-800/60 text-[11px] font-bold">
            {(['india', 'district', 'parcel'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  soundkit.play('buttonTap');
                  setZoomLevel(level);
                }}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer capitalize ${
                  zoomLevel === level
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {level === 'parcel' ? 'Land Parcel' : level}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Interactive Land / Polygon Canvas */}
      <div className="relative aspect-16/10 sm:aspect-16/9 w-full bg-[#07130c] flex items-center justify-center p-2 select-none overflow-hidden">
        
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#52b788 1px, transparent 1px), linear-gradient(to right, #1b4332 1px, transparent 1px), linear-gradient(to bottom, #1b4332 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* India Map Overview Mode */}
        {zoomLevel === 'india' && (
          <div className="relative z-10 text-center animate-in fade-in zoom-in-95 duration-200 p-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-950/80 border-2 border-emerald-500/60 shadow-[0_0_30px_#10b981] mb-2">
              <Compass className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-white">Focus: Republic of India</h3>
            <p className="text-xs text-emerald-300 mt-0.5">
              Region: {state} · {districtName} District
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-600/60 text-xs font-bold text-emerald-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lat.toFixed(4)}°N, {lon.toFixed(4)}°E</span>
            </div>
          </div>
        )}

        {/* District View Mode */}
        {zoomLevel === 'district' && (
          <div className="relative z-10 text-center animate-in fade-in zoom-in-95 duration-200 p-4">
            <div className="w-48 h-32 mx-auto rounded-xl border border-dashed border-emerald-500/50 bg-emerald-950/40 p-3 flex flex-col justify-between backdrop-blur-xs">
              <span className="text-[10px] text-emerald-300 font-mono text-left">District Agro-Climatic Zone</span>
              <div className="text-center">
                <span className="text-base font-black text-white">{districtName}</span>
                <span className="text-xs text-stone-300 block">{state}</span>
              </div>
              <div className="flex justify-between text-[10px] text-emerald-400 font-mono">
                <span>Lat: {lat.toFixed(2)}°N</span>
                <span>Lon: {lon.toFixed(2)}°E</span>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-2">
              Cultivated Crop Focus: <strong className="text-emerald-300">{cropName}</strong>
            </p>
          </div>
        )}

        {/* Parcel Mode with Motion Polygon SVG */}
        {zoomLevel === 'parcel' && (
          <div className="relative z-10 w-full h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            
            {/* SVG Polygon Representation */}
            <svg viewBox="0 0 400 280" className="w-full h-full max-h-[300px] overflow-visible">
              <defs>
                {/* Farmland Grid Soil Texture */}
                <pattern id="soilGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#2d6a4f" strokeWidth="0.8" opacity="0.4" />
                  <circle cx="8" cy="8" r="1" fill="#52b788" opacity="0.3" />
                </pattern>

                <linearGradient id="plotGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1b4332" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#2d6a4f" stopOpacity="0.6" />
                </linearGradient>

                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer Survey Grid Lines */}
              <rect x="20" y="20" width="360" height="240" fill="none" stroke="#1b4332" strokeDasharray="4 4" opacity="0.4" />

              {/* Main Land Parcel Polygon Fill */}
              <polygon
                points={svgPolygonPoints}
                fill="url(#plotGradient)"
                stroke="#52b788"
                strokeWidth="2.5"
                filter="url(#glow)"
                className="transition-all duration-700 cursor-pointer"
              />

              {/* Soil Pattern Overlay inside Polygon */}
              <polygon
                points={svgPolygonPoints}
                fill="url(#soilGrid)"
                opacity="0.75"
              />

              {/* Diagonal Drip Irrigation Furrows inside Polygon */}
              <line x1={polygonVertices[0].x + 20} y1={polygonVertices[0].y + 20} x2={polygonVertices[2].x - 20} y2={polygonVertices[2].y - 20} stroke="#74c69d" strokeWidth="1" strokeDasharray="6 3" opacity="0.6" />
              <line x1={polygonVertices[3].x + 20} y1={polygonVertices[3].y - 20} x2={polygonVertices[1].x - 20} y2={polygonVertices[1].y + 20} stroke="#74c69d" strokeWidth="1" strokeDasharray="6 3" opacity="0.6" />

              {/* Animated Laser Scanning Sweep Line */}
              <line
                x1={polygonVertices[0].x}
                y1={pulse ? polygonVertices[0].y : polygonVertices[3].y}
                x2={polygonVertices[1].x}
                y2={pulse ? polygonVertices[1].y : polygonVertices[2].y}
                stroke="#b7e4c7"
                strokeWidth="2"
                opacity="0.8"
                className="transition-all duration-2000 ease-in-out"
              />

              {/* Interactive Corner Boundary Vertices */}
              {polygonVertices.map((vertex, index) => {
                const isHovered = activeCorner === vertex.id;
                return (
                  <g 
                    key={vertex.id} 
                    className="cursor-pointer group"
                    onClick={() => {
                      soundkit.play('buttonTap');
                      setActiveCorner(vertex.id);
                    }}
                  >
                    {/* Pulsing ring on vertex */}
                    <circle
                      cx={vertex.x}
                      cy={vertex.y}
                      r={isHovered ? 12 : 7}
                      fill="#52b788"
                      fillOpacity={isHovered ? '0.4' : '0.2'}
                      stroke="#d8f3dc"
                      strokeWidth="1.5"
                      className="transition-all duration-300"
                    />
                    <circle
                      cx={vertex.x}
                      cy={vertex.y}
                      r={3.5}
                      fill="#ffffff"
                    />
                    {/* Vertex Tag Text */}
                    <text
                      x={vertex.x + (index % 2 === 0 ? -12 : 12)}
                      y={vertex.y + (index < 2 ? -12 : 16)}
                      fill="#d8f3dc"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor={index % 2 === 0 ? 'end' : 'start'}
                      className="drop-shadow"
                    >
                      P{vertex.id} ({(lat + vertex.offsetLat).toFixed(4)}°)
                    </text>
                  </g>
                );
              })}

              {/* Center Acreage Badge */}
              <g className="pointer-events-none">
                <rect
                  x="145"
                  y="120"
                  width="110"
                  height="40"
                  rx="8"
                  fill="#081c15"
                  fillOpacity="0.92"
                  stroke="#52b788"
                  strokeWidth="1.5"
                />
                <text x="200" y="136" textAnchor="middle" fill="#52b788" fontSize="10" fontWeight="900" fontFamily="sans-serif">
                  {acres} ACRES
                </text>
                <text x="200" y="151" textAnchor="middle" fill="#d8f3dc" fontSize="8" fontWeight="600" fontFamily="monospace">
                  {cropName.split(' ')[0]} FIELD
                </text>
              </g>
            </svg>

            {/* Corner Vertex Tooltip Overlay */}
            {activeCorner && (
              <div className="absolute top-2 left-2 z-20 bg-black/85 backdrop-blur-md p-2 rounded-lg border border-emerald-500/60 text-[11px] font-mono animate-in fade-in duration-100 shadow-lg">
                <span className="text-emerald-400 font-bold block">
                  {polygonVertices.find((v) => v.id === activeCorner)?.label}
                </span>
                <span className="text-stone-300">
                  GPS: {(lat + (polygonVertices.find((v) => v.id === activeCorner)?.offsetLat || 0)).toFixed(5)}°N, {(lon + (polygonVertices.find((v) => v.id === activeCorner)?.offsetLon || 0)).toFixed(5)}°E
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Telemetry & Surface Details */}
      <div className="p-3.5 bg-black/50 border-t border-emerald-900/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block">Registered Land</span>
          <span className="text-sm font-black text-white font-mono">{acres} Acres</span>
        </div>

        <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block">Total Area (m²)</span>
          <span className="text-sm font-black text-white font-mono">{sqm.toLocaleString()} m²</span>
        </div>

        <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block">Total Sq. Ft</span>
          <span className="text-sm font-black text-white font-mono">{sqft} sq ft</span>
        </div>

        <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block">Boundary Perimeter</span>
          <span className="text-sm font-black text-white font-mono">~{perimeterMeters} m</span>
        </div>
      </div>
    </div>
  );
}
