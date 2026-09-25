export interface DistrictSchema {
  name: string;
  soilMoisture: number; // %
  rainForecast: number; // mm
  crop: string;
  advisoryHistory: {
    timestamp: string;
    riskLevel: 'low' | 'medium' | 'high';
    irrigationNeeded: boolean;
  }[];
}

export interface StateAgriculturalSchema {
  state: string;
  stateCode: string;
  region: string;
  capital: string;
  districts: DistrictSchema[];
}

export const STATE_AGRI_DATA: StateAgriculturalSchema[] = [
  {
    state: "TamilNadu",
    stateCode: "TN",
    region: "Southern Agro-Ecological Zone",
    capital: "Chennai",
    districts: [
      {
        name: "Chengalpattu",
        soilMoisture: 28,
        rainForecast: 3,
        crop: "Paddy",
        advisoryHistory: [
          { timestamp: "2026-09-23 06:00", riskLevel: "high", irrigationNeeded: true },
          { timestamp: "2026-09-22 18:00", riskLevel: "high", irrigationNeeded: true }
        ],
      },
      {
        name: "Thanjavur",
        soilMoisture: 45,
        rainForecast: 12,
        crop: "Sugarcane",
        advisoryHistory: [
          { timestamp: "2026-09-23 06:00", riskLevel: "low", irrigationNeeded: false }
        ],
      },
    ],
  },
  {
    state: "Karnataka",
    stateCode: "KA",
    region: "Deccan Plateau Semi-Arid Zone",
    capital: "Bengaluru",
    districts: [
      {
        name: "Mandya",
        soilMoisture: 32,
        rainForecast: 8,
        crop: "Sugarcane",
        advisoryHistory: [
          { timestamp: "2026-09-23 06:00", riskLevel: "medium", irrigationNeeded: true }
        ],
      },
      {
        name: "Dharwad",
        soilMoisture: 24,
        rainForecast: 2,
        crop: "Groundnut",
        advisoryHistory: [
          { timestamp: "2026-09-23 06:00", riskLevel: "high", irrigationNeeded: true },
          { timestamp: "2026-09-22 12:00", riskLevel: "high", irrigationNeeded: true }
        ],
      },
    ],
  },
];
