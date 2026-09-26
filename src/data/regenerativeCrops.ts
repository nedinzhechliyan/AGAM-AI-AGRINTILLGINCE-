/**
 * Regenerative Crop Agronomy Database (Lane 1 recommendations)
 *
 * Each candidate carries its regenerative role and ideal satellite telemetry
 * windows. The matching engine in Lane1Satellite.tsx scores these against LIVE
 * NASA POWER values — deterministic, explainable, zero hallucination.
 */

import { RegenerativeRecommendation } from '../types';

export interface CropCandidate {
  cropId: string;
  cropName: string;
  localName: string;
  waterNeedMmPerDay: number;      // crop coefficient-based daily ET need
  idealSoilMoisture: [min: number, max: number]; // % GWETROOT-derived
  idealTempC: [min: number, max: number];
  maxSafeWindKmh: number;
  regenerativeRole: string;
  companionCrop: string;
  baseScore: number;              // inherent suitability for Indian smallholdings
}

export const REGENERATIVE_CROPS: CropCandidate[] = [
  {
    cropId: 'paddy',
    cropName: 'Paddy / Rice',
    localName: 'நெல் / धान',
    waterNeedMmPerDay: 6.5,
    idealSoilMoisture: [55, 95],
    idealTempC: [20, 37],
    maxSafeWindKmh: 20,
    regenerativeRole: 'System of Rice Intensification (SRI) builds soil biology with alternate wetting & drying',
    companionCrop: 'Pulses on bunds',
    baseScore: 78,
  },
  {
    cropId: 'pulses-green-gram',
    cropName: 'Green Gram (Mung)',
    localName: 'பச்சை பயறு / मूंग',
    waterNeedMmPerDay: 3.0,
    idealSoilMoisture: [25, 60],
    idealTempC: [25, 38],
    maxSafeWindKmh: 25,
    regenerativeRole: 'Nitrogen-fixing legume — free 40-60 kg N/ha for the next cash crop',
    companionCrop: 'Pearl millet border rows',
    baseScore: 82,
  },
  {
    cropId: 'millets-pearl',
    cropName: 'Pearl Millet (Bajra)',
    localName: 'கம்பு / बाजरा',
    waterNeedMmPerDay: 2.5,
    idealSoilMoisture: [15, 50],
    idealTempC: [25, 42],
    maxSafeWindKmh: 30,
    regenerativeRole: 'Deep-rooted climate-resilient grain; breaks hardpan and mines subsoil nutrients',
    companionCrop: 'Cowpea intercrop',
    baseScore: 80,
  },
  {
    cropId: 'cotton-regen',
    cropName: 'Cotton (Regenerative)',
    localName: 'பருத்தி / कपास',
    waterNeedMmPerDay: 5.0,
    idealSoilMoisture: [40, 75],
    idealTempC: [21, 40],
    maxSafeWindKmh: 18,
    regenerativeRole: 'Cover-cropped cotton with living mulch suppresses weeds and rebuilds organic carbon',
    companionCrop: 'Marigold trap rows',
    baseScore: 70,
  },
  {
    cropId: 'groundnut',
    cropName: 'Groundnut',
    localName: 'வேர்க்கடலை / मूंगफली',
    waterNeedMmPerDay: 4.0,
    idealSoilMoisture: [30, 65],
    idealTempC: [22, 36],
    maxSafeWindKmh: 22,
    regenerativeRole: 'Legume that fixes nitrogen AND loosens soil with pegging roots',
    companionCrop: 'Castor border trap crop',
    baseScore: 76,
  },
  {
    cropId: 'sunhemp-cover',
    cropName: 'Sunhemp (Green Manure)',
    localName: 'சணப்பு / सन-hemp',
    waterNeedMmPerDay: 2.2,
    idealSoilMoisture: [20, 60],
    idealTempC: [22, 40],
    maxSafeWindKmh: 28,
    regenerativeRole: '45-day biomass bomb — incorporates 8-10 t/ha green matter into soil',
    companionCrop: 'Follows with paddy or maize',
    baseScore: 74,
  },
  {
    cropId: 'maize',
    cropName: 'Maize',
    localName: 'மக்காச்சோளம் / मक्का',
    waterNeedMmPerDay: 4.5,
    idealSoilMoisture: [35, 70],
    idealTempC: [21, 35],
    maxSafeWindKmh: 20,
    regenerativeRole: 'Perfect nitrogen-scavenger after a legume cycle; high biomass residue for mulch',
    companionCrop: 'Pole beans intercrop',
    baseScore: 72,
  },
  {
    cropId: 'sesame',
    cropName: 'Sesame (Ellu)',
    localName: 'எள் / तिल',
    waterNeedMmPerDay: 2.0,
    idealSoilMoisture: [15, 45],
    idealTempC: [25, 40],
    maxSafeWindKmh: 26,
    regenerativeRole: 'Phosphate-minorizer; thrives on residual moisture with zero irrigation',
    companionCrop: 'Green gram relay',
    baseScore: 68,
  },
];

/**
 * Deterministic scoring of a crop candidate against live satellite telemetry.
 * Returns a filled RegenerativeRecommendation with a telemetry-grounded reason.
 */
export function scoreCropAgainstTelemetry(
  c: CropCandidate,
  telemetry: {
    soilMoisture: number;   // %
    tempC: number;
    rainForecast: number;   // mm/day
    windSpeedKmh: number;
    solarRadiation: number; // kWh/m²/day
  }
): RegenerativeRecommendation {
  let score = c.baseScore;

  // Soil moisture window match (±35 pts)
  const [mMin, mMax] = c.idealSoilMoisture;
  if (telemetry.soilMoisture >= mMin && telemetry.soilMoisture <= mMax) {
    score += 12;
  } else {
    const distance = telemetry.soilMoisture < mMin ? mMin - telemetry.soilMoisture : telemetry.soilMoisture - mMax;
    score -= Math.min(35, distance * 2.2);
  }

  // Temperature window match (±20 pts)
  const [tMin, tMax] = c.idealTempC;
  if (telemetry.tempC >= tMin && telemetry.tempC <= tMax) {
    score += 8;
  } else {
    const distance = telemetry.tempC < tMin ? tMin - telemetry.tempC : telemetry.tempC - tMax;
    score -= Math.min(20, distance * 2.5);
  }

  // Rain availability bonus
  if (telemetry.rainForecast > 0.5 && c.waterNeedMmPerDay <= 4) score += 6;
  if (telemetry.rainForecast < 0.2 && c.waterNeedMmPerDay >= 5.5) score -= 10;

  // Wind safety
  if (telemetry.windSpeedKmh > c.maxSafeWindKmh) score -= 8;

  // Solar match for C4 crops (millets, maize)
  if ((c.cropId.includes('millet') || c.cropId === 'maize') && telemetry.solarRadiation >= 5.5) score += 5;

  const finalScore = Math.round(Math.max(5, Math.min(99, score)));

  // Human-explainable reason tied to ACTUAL values
  const moistureVerdict =
    telemetry.soilMoisture >= mMin && telemetry.soilMoisture <= mMax
      ? `root-zone moisture ${telemetry.soilMoisture}% sits inside its ideal ${mMin}-${mMax}% band`
      : telemetry.soilMoisture < mMin
      ? `root-zone moisture ${telemetry.soilMoisture}% is drier than its ideal ${mMin}%+ — pre-irrigate or wait for rain`
      : `root-zone moisture ${telemetry.soilMoisture}% is wetter than its ${mMax}% ceiling — ensure drainage`;

  const rainVerdict =
    telemetry.rainForecast >= 2
      ? `with ${telemetry.rainForecast}mm/day forecast rain, irrigation demand drops sharply`
      : telemetry.rainForecast >= 0.2
      ? `light rain (${telemetry.rainForecast}mm/day) forecast supplements irrigation`
      : `no meaningful rain forecast — plan ${c.waterNeedMmPerDay}mm/day irrigation`;

  return {
    cropId: c.cropId,
    cropName: c.cropName,
    localName: c.localName,
    suitabilityScore: finalScore,
    regenerativeRole: c.regenerativeRole,
    reason: `Satellite fit: ${moistureVerdict}; ${rainVerdict}.`,
    waterNeedMmPerDay: c.waterNeedMmPerDay,
    companionCrop: c.companionCrop,
  };
}
