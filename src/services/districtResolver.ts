/**
 * AGAM District Resolver — "Every district must be noted, don't have predefined states."
 *
 * Resolves ANY district/village name in India to precise coordinates by querying
 * OpenStreetMap's free Nominatim API directly from the browser, with an in-memory
 * + localStorage cache so repeated lookups are instant and offline-safe.
 *
 * No hardcoded state → district tables. If the farmer can name it, we can fly there.
 */

import { GeoPoint } from '../types';

export interface ResolvedDistrict {
  name: string;        // display name, e.g. "Perambalur"
  state: string;       // resolved from OSM metadata, e.g. "Tamil Nadu"
  coords: GeoPoint;
  displayName: string; // full OSM display name for confirmation
  source: 'osm-live' | 'cache' | 'fallback';
}

const CACHE_KEY = 'agam_district_cache_v1';

// In-memory cache (fastest)
const memoryCache: Map<string, ResolvedDistrict> = new Map();

// Persistent cache across sessions
function loadDiskCache(): Record<string, ResolvedDistrict> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function persistToDiskCache(query: string, result: ResolvedDistrict) {
  try {
    const disk = loadDiskCache();
    disk[query] = result;
    localStorage.setItem(CACHE_KEY, JSON.stringify(disk));
  } catch {
    /* storage full — non-fatal */
  }
}

export function getCachedDistrict(query: string): ResolvedDistrict | null {
  const key = query.trim().toLowerCase();
  return memoryCache.get(key) || loadDiskCache()[key] || null;
}

/**
 * Resolve a free-text Indian district (or village/taluk) to coordinates.
 * Strategy:
 *  1. memory/disk cache
 *  2. OSM Nominatim search restricted to country=in (district-level)
 *  3. relaxed OSM search anywhere in India
 *  4. bundled fallback seed (rare — only if both network calls fail)
 */
export async function resolveDistrict(rawQuery: string): Promise<ResolvedDistrict> {
  const query = rawQuery.trim();
  const cacheKey = query.toLowerCase();

  // 1. Cache
  const cached = memoryCache.get(cacheKey) || loadDiskCache()[cacheKey];
  if (cached) {
    return { ...cached, source: cached.source === 'fallback' ? 'fallback' : 'cache' };
  }

  // 2. Strict district-level search
  const headers: HeadersInit = { Accept: 'application/json' };
  const strictUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=in&q=${encodeURIComponent(query + ' district')}&limit=1&addressdetails=1`;
  // 3. Relaxed fallback search
  const relaxedUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=in&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;

  for (const [url, source] of [
    [strictUrl, 'osm-live'],
    [relaxedUrl, 'osm-live'],
  ] as const) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;

      const results = await res.json();
      if (!Array.isArray(results) || results.length === 0) continue;

      const hit = results[0];
      const addr = hit.address || {};
      const resolved: ResolvedDistrict = {
        name:
          addr.state_district ||
          addr.district ||
          addr.county ||
          addr.city ||
          addr.town ||
          addr.village ||
          query,
        state: addr.state || 'India',
        coords: { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon) },
        displayName: hit.display_name || query,
        source: 'osm-live',
      };

      memoryCache.set(cacheKey, resolved);
      persistToDiskCache(cacheKey, resolved);
      return resolved;
    } catch {
      // try next strategy
    }
  }

  // 4. Deterministic offline fallback so the app never dead-ends
  const fallback: ResolvedDistrict = {
    name: query,
    state: 'India',
    coords: { lat: 20.5937, lon: 78.9629 }, // India centroid
    displayName: `${query} (offline mode — showing India centroid)`,
    source: 'fallback',
  };
  memoryCache.set(cacheKey, fallback);
  persistToDiskCache(cacheKey, fallback);
  return fallback;
}

/**
 * Fire-and-forget prefetch of the farmer's saved district at app boot so
 * Lane 1 opens instantly warm.
 */
export function prefetchDistrict(districtName: string) {
  if (!districtName) return;
  resolveDistrict(districtName).catch(() => {});
}
