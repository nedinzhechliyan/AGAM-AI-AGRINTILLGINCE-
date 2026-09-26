/**
 * LandGlobe3D — the farmer's land on a real 3D globe (react-globe.gl + three.js)
 * with a pulsing GREEN marker on his saved plot, plus a 2D OpenStreetMap
 * embedded map toggle ("map must be usable" — always-render fallback).
 *
 * The globe auto-flies to the active district. Any lat/lon on Earth works —
 * the district resolver feeds it live coordinates.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { Globe as GlobeIcon, Map as MapIcon, MapPin, Ruler, Wheat, Crosshair } from 'lucide-react';
import { GeoPoint } from '../types';

interface LandGlobe3DProps {
  lat: number;
  lon: number;
  districtName: string;
  stateName?: string;
  village?: string;
  acres?: number;
  cropName?: string;
  height?: number;
  showAttributeBar?: boolean;
}

export function LandGlobe3D({
  lat,
  lon,
  districtName,
  stateName,
  village,
  acres,
  cropName,
  height = 360,
  showAttributeBar = true,
}: LandGlobe3DProps) {
  const [mode, setMode] = useState<'3d' | 'osm'>('3d');
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [globeWidth, setGlobeWidth] = useState(600);

  // Measure container so the globe fills it responsively
  useEffect(() => {
    if (!wrapRef.current) return;
    const measure = () => {
      if (wrapRef.current) setGlobeWidth(wrapRef.current.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Fly to the district + pulse the green land ring
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const t = setTimeout(() => {
      try {
        g.pointOfView({ lat, lng: lon, altitude: 1.35 }, 1200);
      } catch {
        /* non-fatal */
      }
    }, 350);
    return () => clearTimeout(t);
  }, [lat, lon]);

  const markerData = useMemo(() => [{ lat, lng: lon, name: districtName }], [lat, lon, districtName]);

  // Bounding box for the OSM embed (~6km box around the point)
  const osmSrc = useMemo(() => {
    const dLon = 0.05;
    const dLat = 0.03;
    const bbox = `${lon - dLon}%2C${lat - dLat}%2C${lon + dLon}%2C${lat + dLat}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  }, [lat, lon]);

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#0b2016] via-[#102a1e] to-[#081710] border-2 border-[#2d6a4f]/70 overflow-hidden shadow-xl text-white">
      {/* Header */}
      <div className="p-3 border-b border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#2d6a4f]/80 flex items-center justify-center ring-2 ring-emerald-400/30 shrink-0">
            <GlobeIcon className="w-4 h-4 text-emerald-300 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide text-emerald-300 uppercase truncate">
                {districtName} {stateName ? `· ${stateName}` : ''}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-700/50 font-mono">
                GPS LIVE
              </span>
            </div>
            <p className="text-[11px] text-stone-300 font-medium truncate">
              {village ? `${village} · ` : ''}
              {lat.toFixed(4)}°N, {lon.toFixed(4)}°E
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-emerald-800/60 text-[11px] font-bold">
          <button
            onClick={() => setMode('3d')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition ${
              mode === '3d' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:bg-emerald-900/60'
            }`}
          >
            <GlobeIcon className="w-3 h-3" /> 3D Globe
          </button>
          <button
            onClick={() => setMode('osm')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition ${
              mode === 'osm' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:bg-emerald-900/60'
            }`}
          >
            <MapIcon className="w-3 h-3" /> OSM Map
          </button>
        </div>
      </div>

      {/* Render surface */}
      <div ref={wrapRef} style={{ height }} className="relative bg-slate-950">
        {mode === '3d' ? (
          <Globe
            ref={globeRef}
            width={globeWidth}
            height={height}
            backgroundColor="rgba(0,0,0,0)"
            // Same-origin textures (public/globe) — avoids unpkg CORS failures on http://localhost
            globeImageUrl="/globe/earth-night.jpg"
            bumpImageUrl="/globe/earth-topology.png"
            showAtmosphere
            atmosphereColor="#34d399"
            atmosphereAltitude={0.18}
            // The farmer's land — a pulsing GREEN ring + column marker
            ringsData={markerData}
            ringColor={() => (t: number) => `rgba(52, 211, 153, ${1 - t})`}
            ringMaxRadius={4}
            ringPropagationSpeed={2}
            ringRepeatPeriod={900}
            pointsData={markerData}
            pointLat={(d: any) => d.lat}
            pointLng={(d: any) => d.lng}
            pointColor={() => '#34d399'}
            pointAltitude={0.06}
            pointRadius={0.45}
            pointsMerge={false}
            labelsData={markerData}
            labelLat={(d: any) => d.lat}
            labelLng={(d: any) => d.lng}
            labelText={(d: any) => `🟢 ${d.name}`}
            labelSize={1.6}
            labelColor={() => '#a7f3d0'}
            labelDotRadius={0.3}
            labelAltitude={0.02}
          />
        ) : (
          <iframe
            title={`OpenStreetMap — ${districtName}`}
            src={osmSrc}
            style={{ width: '100%', height: '100%', border: 0, filter: 'saturate(0.9) contrast(1.02)' }}
            loading="lazy"
          />
        )}

        {/* Green mark legend */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/70 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          Farmer's Land Mark
        </div>
      </div>

      {/* Attribute bar */}
      {showAttributeBar && (
        <div className="px-3 py-2.5 bg-black/40 border-t border-emerald-900/60 flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-stone-300 font-semibold">
            <MapPin className="w-3 h-3 text-emerald-400" /> {districtName}
          </span>
          {typeof acres === 'number' && (
            <span className="flex items-center gap-1 text-stone-300 font-semibold">
              <Ruler className="w-3 h-3 text-emerald-400" /> {acres} acres
            </span>
          )}
          {cropName && (
            <span className="flex items-center gap-1 text-stone-300 font-semibold">
              <Wheat className="w-3 h-3 text-emerald-400" /> {cropName}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-emerald-400/80 font-mono">
            <Crosshair className="w-3 h-3" /> {lat.toFixed(4)}, {lon.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
