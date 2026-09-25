export type RiskLevel = 'low' | 'medium' | 'high';

export interface AdvisoryRisk {
  irrigationNeeded: boolean;
  riskLevel: RiskLevel;
  reason: string;
}

export interface DailyTelemetryPoint {
  date: string; // YYYYMMDD
  formattedDate: string; // "Sep 22"
  soilMoisture: number; // percentage (0-100)
  rainForecast: number; // mm
  tempC: number;
  tempMinC?: number;
  tempMaxC?: number;
  humidity: number;
  windSpeedKmh?: number; // WS2M * 3.6
  solarRadiation?: number; // ALLSKY_SFC_SW_DWN in kWh/m²/day
}

export interface SevenDayTrendAnalysis {
  avgFirst3: number;
  avgLast3: number;
  decline: number; // avgFirst3 - avgLast3
  isDeclining: boolean; // decline > 5
  daysToCritical: number | null; // calculated via linear extrapolation to <20%
  insightText: string;
  dailyRateOfDecline: number;
}

export interface RuleExplainability {
  explanationText: string;
  soilMoisture: number;
  moistureThreshold: number;
  moistureDeficit: number;
  rainForecast: number;
  rainThreshold: number;
  rainDeficit: number;
  urgencyLabel: string;
}

export interface DistrictData {
  id: string;
  name: string;
  state: string;
  tamilName?: string;
  zone: string;
  currentCrop: string;
  soilMoisture: number; // percentage %
  rainForecast: number; // rainfall in mm
  soilType: string;
  tempC: number;
  tempMinC?: number;
  tempMaxC?: number;
  humidity: number;
  windSpeedKmh?: number;
  solarRadiation?: number;
  lastUpdated: string;
  recommendedAction: string;
  latitude: number;
  longitude: number;
  sevenDayHistory?: DailyTelemetryPoint[];
}

export interface WeatherDecisionMetrics {
  windSpeedKmh: number;
  isSafeToSpray: boolean;
  sprayAdvice: string;
  solarRadiation: number; // kWh/m²/day
  dryingIndex: 'Full Sun (Fast Drying)' | 'Moderate Sun' | 'Cover Produce (Low Sun / Rain)';
  dryingHours: number;
  tempMinC: number;
  tempMaxC: number;
  temperatureAlert: string | null;
  alertType: 'frost' | 'heatwave' | 'normal';
  irrigationLitersPerAcre: number;
  totalIrrigationLiters: number;
}

export interface CropDiseaseSample {
  id: string;
  crop: string;
  diseaseName: string;
  tamilName: string;
  pathogen: string;
  severity: 'mild' | 'moderate' | 'severe';
  confidenceScore: number;
  symptoms: string[];
  remedyAction: string;
  culturalControl: string[];
  imageUrl: string;
}

export interface SchemeItem {
  id: string;
  name: string;
  tamilName: string;
  description: string;
  benefit: string;
  eligibility: string[];
  documentsNeeded: string[];
  officialPortalUrl: string;
  helpline: string;
  category: 'Direct Benefit Transfer' | 'Crop Insurance' | 'Irrigation Subsidy' | 'Soil Health';
}
