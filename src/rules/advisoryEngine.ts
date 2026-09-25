import { AdvisoryRisk, DailyTelemetryPoint, SevenDayTrendAnalysis, RuleExplainability } from '../types';

/**
 * AGAM Deterministic Agro-Advisory Rule Engine
 * Evaluates field irrigation need and crop water stress risk based on soil moisture percentage and forecasted precipitation.
 *
 * Rules:
 * 1. If soilMoisture < 30 and rainForecast < 5mm:
 *    irrigationNeeded = true, riskLevel = "high"
 * 2. If soilMoisture is 30-50 and rainForecast < 10mm:
 *    irrigationNeeded = true, riskLevel = "medium"
 * 3. Otherwise:
 *    irrigationNeeded = false, riskLevel = "low"
 *
 * @param soilMoisture Soil moisture percentage (0 - 100%)
 * @param rainForecast Expected rainfall in millimeters (mm)
 * @returns AdvisoryRisk object { irrigationNeeded, riskLevel, reason }
 */
export function evaluateIrrigationRisk(
  soilMoisture: number,
  rainForecast: number
): AdvisoryRisk {
  // Rule 1: Critical deficit
  if (soilMoisture < 30 && rainForecast < 5) {
    return {
      irrigationNeeded: true,
      riskLevel: 'high',
      reason: `Critical moisture deficit: Soil moisture is at ${soilMoisture}% (below critical 30% threshold) and predicted rainfall is only ${rainForecast}mm (< 5mm). High risk of crop wilting. Immediate irrigation is urgently required.`,
    };
  }

  // Rule 2: Moderate stress
  if (soilMoisture >= 30 && soilMoisture <= 50 && rainForecast < 10) {
    return {
      irrigationNeeded: true,
      riskLevel: 'medium',
      reason: `Moderate water stress: Soil moisture is at ${soilMoisture}% (within vulnerable 30-50% range) and expected rain is only ${rainForecast}mm (< 10mm). Controlled irrigation recommended within 24-48 hours to sustain growth.`,
    };
  }

  // Rule 3: Low risk / Sufficient moisture buffer
  return {
    irrigationNeeded: false,
    riskLevel: 'low',
    reason: `Optimal moisture condition: Soil moisture is sufficient (${soilMoisture}%) or forecasted precipitation (${rainForecast}mm) provides adequate moisture buffer. No immediate irrigation required.`,
  };
}

/**
 * Generates deterministic plain-terms explainability for why the recommendation was made.
 * Provably tied to the exact rule engine thresholds, eliminating AI hallucination.
 */
export function generateDeterministicExplanation(
  soilMoisture: number,
  rainForecast: number,
  risk: AdvisoryRisk
): RuleExplainability {
  if (risk.riskLevel === 'high') {
    const moistureDeficit = Math.max(0, 30 - soilMoisture);
    const rainDeficit = Math.max(0, 5 - rainForecast);
    return {
      explanationText: `Soil moisture is ${soilMoisture}%, below the 30% safe threshold. Rainfall forecast is ${rainForecast}mm, below the 5mm minimum needed. Based on these two factors, irrigation is marked urgent.`,
      soilMoisture,
      moistureThreshold: 30,
      moistureDeficit,
      rainForecast,
      rainThreshold: 5,
      rainDeficit,
      urgencyLabel: 'Marked Urgent (Immediate Action)',
    };
  }

  if (risk.riskLevel === 'medium') {
    const rainDeficit = Math.max(0, 10 - rainForecast);
    return {
      explanationText: `Soil moisture is ${soilMoisture}%, within the vulnerable 30-50% threshold. Rainfall forecast is ${rainForecast}mm, below the 10mm minimum needed. Based on these two factors, scheduled irrigation is advised within 24-48 hours.`,
      soilMoisture,
      moistureThreshold: 50,
      moistureDeficit: 0,
      rainForecast,
      rainThreshold: 10,
      rainDeficit,
      urgencyLabel: 'Scheduled (Within 24-48 Hours)',
    };
  }

  // Low risk
  let explanationText = '';
  if (soilMoisture >= 50 && rainForecast >= 10) {
    explanationText = `Soil moisture is ${soilMoisture}%, above the 50% safe threshold. Rainfall forecast is ${rainForecast}mm, exceeding the 10mm minimum buffer. Based on these two factors, field moisture is optimal and no irrigation is needed.`;
  } else if (soilMoisture >= 50) {
    explanationText = `Soil moisture is ${soilMoisture}%, above the 50% safe threshold. Rainfall forecast is ${rainForecast}mm. Based on existing root-zone moisture reserves, no irrigation is needed at this time.`;
  } else {
    explanationText = `Soil moisture is ${soilMoisture}%, and expected rainfall is ${rainForecast}mm (meeting or exceeding precipitation buffer). Based on incoming natural rainfall, soil recharge will occur without supplemental irrigation.`;
  }

  return {
    explanationText,
    soilMoisture,
    moistureThreshold: 30,
    moistureDeficit: 0,
    rainForecast,
    rainThreshold: 5,
    rainDeficit: 0,
    urgencyLabel: 'Adequate Moisture (No Irrigation Needed)',
  };
}

/**
 * Computes deterministic 7-day soil moisture trend analysis.
 * Compares the first 3 days' average to the last 3 days' average.
 * If declining by > 5%, calculates days until reaching critical level (<20%)
 * using simple linear extrapolation based on daily rate of decline.
 */
export function analyzeSevenDayMoistureTrend(
  history: DailyTelemetryPoint[]
): SevenDayTrendAnalysis {
  if (!history || history.length < 3) {
    return {
      avgFirst3: 0,
      avgLast3: 0,
      decline: 0,
      isDeclining: false,
      daysToCritical: null,
      insightText: 'Insufficient historical telemetry points for 7-day trend analysis.',
      dailyRateOfDecline: 0,
    };
  }

  // History is ordered chronologically: index 0 is oldest (day 1), index N-1 is most recent (day 7)
  const first3 = history.slice(0, 3);
  const last3 = history.slice(-3);

  const sumFirst3 = first3.reduce((acc, p) => acc + p.soilMoisture, 0);
  const avgFirst3 = Math.round((sumFirst3 / first3.length) * 10) / 10;

  const sumLast3 = last3.reduce((acc, p) => acc + p.soilMoisture, 0);
  const avgLast3 = Math.round((sumLast3 / last3.length) * 10) / 10;

  // Decline: positive means moisture dropped from first 3 days to last 3 days
  const rawDecline = avgFirst3 - avgLast3;
  const decline = Math.round(rawDecline * 10) / 10;

  // The span between the mid-point of first 3 days (index 1) and mid-point of last 3 days (index N-2)
  const daysSpan = Math.max(1, (history.length - 1) - 2); // e.g. 7-1-2 = 4 days
  const rawDailyRate = decline / daysSpan;
  const dailyRateOfDecline = Math.round(Math.max(0, rawDailyRate) * 10) / 10;

  const isDeclining = decline > 5;

  let daysToCritical: number | null = null;
  let insightText = '';

  if (isDeclining) {
    // Current moisture level (latest day observation)
    const currentMoisture = history[history.length - 1].soilMoisture;
    const moistureAboveCritical = currentMoisture - 20;

    if (moistureAboveCritical <= 0) {
      daysToCritical = 1;
    } else {
      // Linear extrapolation: days = remaining buffer / daily rate of decline
      const rate = dailyRateOfDecline > 0.1 ? dailyRateOfDecline : 1.0;
      daysToCritical = Math.max(1, Math.round(moistureAboveCritical / rate));
    }

    insightText = `Soil moisture has been declining over the past week — expect it to reach critical levels (<20%) in approximately ${daysToCritical} days if the trend continues`;
  } else {
    insightText = 'Soil moisture is stable/improving — no immediate forecasted risk.';
  }

  return {
    avgFirst3,
    avgLast3,
    decline,
    isDeclining,
    daysToCritical,
    insightText,
    dailyRateOfDecline,
  };
}

/**
 * Diagnostic test harness for automated verification in UI and testing
 */
export const RULE_TEST_CASES = [
  {
    label: 'Critical Drought (Chengalpattu default)',
    soilMoisture: 22,
    rainForecast: 2,
    expectedRisk: 'high',
    expectedIrrigation: true,
  },
  {
    label: 'Moderate Stress (Thanjavur default)',
    soilMoisture: 38,
    rainForecast: 6,
    expectedRisk: 'medium',
    expectedIrrigation: true,
  },
  {
    label: 'Ample Rain & Moisture (Coimbatore default)',
    soilMoisture: 58,
    rainForecast: 22,
    expectedRisk: 'low',
    expectedIrrigation: false,
  },
  {
    label: 'Low moisture but heavy rain forecast',
    soilMoisture: 25,
    rainForecast: 18,
    expectedRisk: 'low',
    expectedIrrigation: false,
  },
  {
    label: 'Medium moisture with good rain',
    soilMoisture: 45,
    rainForecast: 15,
    expectedRisk: 'low',
    expectedIrrigation: false,
  },
];
