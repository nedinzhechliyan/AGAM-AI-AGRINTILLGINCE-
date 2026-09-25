import { DistrictData, CropDiseaseSample, ArchitectureNode, DailyTelemetryPoint } from '../types';

// Helper to generate realistic 7-day trailing telemetry for cached fallbacks
function generate7DayHistory(baseMoisture: number, baseRain: number, trend: 'declining' | 'stable' | 'improving' | 'fluctuating'): DailyTelemetryPoint[] {
  const result: DailyTelemetryPoint[] = [];
  const today = new Date();
  
  // Create offsets for 7 days (day 0 to day 6, where day 6 is today)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    let moisture = baseMoisture;
    let rain = 0;
    
    if (trend === 'declining') {
      // Starts higher (e.g. +7% 6 days ago) and drops towards baseMoisture
      moisture = Math.round(baseMoisture + (i * 1.3));
      rain = i === 6 ? 2.5 : 0;
    } else if (trend === 'improving') {
      // Starts lower and increases
      moisture = Math.max(10, Math.round(baseMoisture - (i * 1.1)));
      rain = i <= 2 ? Math.round(baseRain * 0.8) : 0;
    } else if (trend === 'fluctuating') {
      moisture = Math.round(baseMoisture + Math.sin(i) * 3);
      rain = i % 3 === 0 ? baseRain : 0;
    } else {
      // Stable
      moisture = Math.round(baseMoisture + (i % 2 === 0 ? 1 : -1));
      rain = i === 3 ? baseRain : 0;
    }
    
    result.push({
      date: dateStr,
      formattedDate: formatted,
      soilMoisture: Math.min(100, Math.max(5, moisture)),
      rainForecast: Math.max(0, rain),
      tempC: Math.round(30 + Math.sin(i) * 2),
      humidity: Math.round(65 + Math.cos(i) * 5),
    });
  }
  return result;
}

export const MOCK_DISTRICTS: DistrictData[] = [
  // --- Tamil Nadu ---
  {
    id: 'chengalpattu',
    name: 'Chengalpattu',
    state: 'Tamil Nadu',
    tamilName: 'செங்கல்பட்டு',
    zone: 'North Eastern Agro-Climatic Zone',
    currentCrop: 'Paddy',
    soilMoisture: 22,
    rainForecast: 2,
    soilType: 'Red Sandy Loam / Coastal Clay',
    tempC: 34,
    humidity: 58,
    latitude: 12.6819,
    longitude: 79.9774,
    lastUpdated: '10 mins ago via Field IoT Gateway #TN-CPT-04',
    recommendedAction: 'Flood furrow or AWD alternate wet-dry irrigation recommended early morning.',
    sevenDayHistory: generate7DayHistory(22, 2, 'declining'),
  },
  {
    id: 'thanjavur',
    name: 'Thanjavur',
    state: 'Tamil Nadu',
    tamilName: 'தஞ்சாவூர்',
    zone: 'Cauvery Delta Agro-Climatic Zone',
    currentCrop: 'Paddy',
    soilMoisture: 38,
    rainForecast: 6,
    soilType: 'Alluvial & Coastal Delta Clay Loam',
    tempC: 32,
    humidity: 71,
    latitude: 10.7870,
    longitude: 79.1378,
    lastUpdated: '18 mins ago via Delta Soil Probe #TN-TNJ-12',
    recommendedAction: 'Maintain 2-3 cm shallow water level; check canal discharge schedule.',
    sevenDayHistory: generate7DayHistory(38, 6, 'stable'),
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    tamilName: 'கோயம்புத்தூர்',
    zone: 'Western Agro-Climatic Zone',
    currentCrop: 'Sugarcane',
    soilMoisture: 58,
    rainForecast: 24,
    soilType: 'Deep Black Cotton & Red Clay',
    tempC: 28,
    humidity: 82,
    latitude: 11.0168,
    longitude: 76.9558,
    lastUpdated: '5 mins ago via TNAU Weather Station #TN-CBE-01',
    recommendedAction: 'Conserve existing canal water. Ensure inter-row drainage channels are cleared.',
    sevenDayHistory: generate7DayHistory(58, 24, 'improving'),
  },
  {
    id: 'madurai',
    name: 'Madurai',
    state: 'Tamil Nadu',
    tamilName: 'மதுரை',
    zone: 'Southern Agro-Climatic Zone',
    currentCrop: 'Jasmine & Millets',
    soilMoisture: 26,
    rainForecast: 3,
    soilType: 'Red Sandy Clay Loam',
    tempC: 35,
    humidity: 60,
    latitude: 9.9252,
    longitude: 78.1198,
    lastUpdated: '12 mins ago via Vaigai Basin Sensor #TN-MDU-03',
    recommendedAction: 'Drip fertigation recommended during dawn hours to prevent flower bud desiccation.',
    sevenDayHistory: generate7DayHistory(26, 3, 'declining'),
  },

  // --- Punjab ---
  {
    id: 'ludhiana',
    name: 'Ludhiana',
    state: 'Punjab',
    zone: 'Central Plain Agro-Climatic Zone',
    currentCrop: 'Wheat',
    soilMoisture: 42,
    rainForecast: 4,
    soilType: 'Coarse Loamy to Fine Silty Alluvial',
    tempC: 26,
    humidity: 64,
    latitude: 30.9010,
    longitude: 75.8573,
    lastUpdated: '25 mins ago via PAU Agro-Met Observatory #PB-LDH-01',
    recommendedAction: 'Crown root initiation (CRI) stage: maintain optimal root zone moisture via border strip.',
    sevenDayHistory: generate7DayHistory(42, 4, 'stable'),
  },
  {
    id: 'amritsar',
    name: 'Amritsar',
    state: 'Punjab',
    zone: 'Western Plain Agro-Climatic Zone',
    currentCrop: 'Basmati Rice',
    soilMoisture: 49,
    rainForecast: 8,
    soilType: 'Fertile Floodplain Alluvial Loam',
    tempC: 28,
    humidity: 70,
    latitude: 31.6340,
    longitude: 74.8723,
    lastUpdated: '14 mins ago via Majha Canal Network #PB-ASR-02',
    recommendedAction: 'Intermittent flooding; allow field aeration for 2 days before next watering cycle.',
    sevenDayHistory: generate7DayHistory(49, 8, 'improving'),
  },

  // --- Maharashtra ---
  {
    id: 'nashik',
    name: 'Nashik',
    state: 'Maharashtra',
    zone: 'Western Maharashtra Plateau Zone',
    currentCrop: 'Grapes',
    soilMoisture: 24,
    rainForecast: 1,
    soilType: 'Black Basaltic Deccan Trap Clay Loam',
    tempC: 31,
    humidity: 52,
    latitude: 19.9975,
    longitude: 73.7898,
    lastUpdated: '20 mins ago via Godavari Valley Sensor #MH-NSK-05',
    recommendedAction: 'Precision drip pulse irrigation required; avoid canopy wetness to curb downy mildew.',
    sevenDayHistory: generate7DayHistory(24, 1, 'declining'),
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    zone: 'Scarcity & Western Transition Agro-Zone',
    currentCrop: 'Sugarcane',
    soilMoisture: 36,
    rainForecast: 7,
    soilType: 'Medium Deep Black Soils (Vertisols)',
    tempC: 30,
    humidity: 62,
    latitude: 18.5204,
    longitude: 73.8567,
    lastUpdated: '30 mins ago via MPKV Agronomy Sensor #MH-PUN-08',
    recommendedAction: 'Alternate furrow irrigation to optimize water conservation during grand growth phase.',
    sevenDayHistory: generate7DayHistory(36, 7, 'stable'),
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    state: 'Maharashtra',
    zone: 'Vidarbha Agro-Climatic Zone',
    currentCrop: 'Oranges',
    soilMoisture: 27,
    rainForecast: 2,
    soilType: 'Deep Black Cotton Clay (Regur)',
    tempC: 34,
    humidity: 48,
    latitude: 21.1458,
    longitude: 79.0882,
    lastUpdated: '8 mins ago via ICAR-CCRI Field Probe #MH-NGP-01',
    recommendedAction: 'Ring basin irrigation around tree drip-line; apply organic mulch to suppress evaporation.',
    sevenDayHistory: generate7DayHistory(27, 2, 'declining'),
  },

  // --- Andhra Pradesh ---
  {
    id: 'guntur',
    name: 'Guntur',
    state: 'Andhra Pradesh',
    zone: 'Krishna-Godavari Agro-Climatic Zone',
    currentCrop: 'Chilli',
    soilMoisture: 25,
    rainForecast: 3,
    soilType: 'Deep Black Cotton Clay & Red Loam',
    tempC: 34,
    humidity: 64,
    latitude: 16.3067,
    longitude: 80.4365,
    lastUpdated: '15 mins ago via Spices Board IoT Node #AP-GNT-03',
    recommendedAction: 'Drip fertigation with potassium nitrate; critical flowering stage requires uniform moisture.',
    sevenDayHistory: generate7DayHistory(25, 3, 'declining'),
  },
  {
    id: 'krishna',
    name: 'Krishna',
    state: 'Andhra Pradesh',
    zone: 'Coastal Andhra Alluvial Delta',
    currentCrop: 'Rice',
    soilMoisture: 46,
    rainForecast: 15,
    soilType: 'Rich Coastal Deltaic Alluvium',
    tempC: 32,
    humidity: 78,
    latitude: 16.1825,
    longitude: 81.1357,
    lastUpdated: '7 mins ago via Prakasam Barrage Feeder #AP-KRS-02',
    recommendedAction: 'Manage canal sluice gates; allow excess monsoon rainwater retention in bunded plots.',
    sevenDayHistory: generate7DayHistory(46, 15, 'improving'),
  },

  // --- Karnataka ---
  {
    id: 'mysuru',
    name: 'Mysuru',
    state: 'Karnataka',
    zone: 'Southern Dry Agro-Climatic Zone',
    currentCrop: 'Ragi (Finger Millet)',
    soilMoisture: 33,
    rainForecast: 6,
    soilType: 'Red Sandy Loam',
    tempC: 29,
    humidity: 68,
    latitude: 12.2958,
    longitude: 76.6394,
    lastUpdated: '22 mins ago via Cauvery Catchment Gauge #KA-MYS-04',
    recommendedAction: 'Protective furrow irrigation recommended if rain pauses for more than 4 days.',
    sevenDayHistory: generate7DayHistory(33, 6, 'stable'),
  },
  {
    id: 'belagavi',
    name: 'Belagavi',
    state: 'Karnataka',
    zone: 'Northern Transition Agro-Zone',
    currentCrop: 'Sugarcane',
    soilMoisture: 44,
    rainForecast: 11,
    soilType: 'Deep Black Cotton & Mixed Red-Black Clay',
    tempC: 28,
    humidity: 74,
    latitude: 15.8497,
    longitude: 74.4977,
    lastUpdated: '17 mins ago via Malaprabha Command Area #KA-BLG-07',
    recommendedAction: 'Trash mulching along cane ridges to preserve soil moisture; monitor soil salinity.',
    sevenDayHistory: generate7DayHistory(44, 11, 'improving'),
  },

  // --- West Bengal ---
  {
    id: 'bardhaman',
    name: 'Bardhaman',
    state: 'West Bengal',
    zone: 'Lower Gangetic Plain Agro-Zone',
    currentCrop: 'Rice',
    soilMoisture: 54,
    rainForecast: 18,
    soilType: 'Older & Newer Alluvial Silt Loam',
    tempC: 31,
    humidity: 82,
    latitude: 23.2324,
    longitude: 87.8615,
    lastUpdated: '9 mins ago via Damodar Valley Field Gateway #WB-BDN-01',
    recommendedAction: 'High moisture buffer; ensure field bund spillways are clear to drain stagnant standing water.',
    sevenDayHistory: generate7DayHistory(54, 18, 'improving'),
  },

  // --- Madhya Pradesh ---
  {
    id: 'indore',
    name: 'Indore',
    state: 'Madhya Pradesh',
    zone: 'Malwa Plateau Agro-Climatic Zone',
    currentCrop: 'Soybean',
    soilMoisture: 28,
    rainForecast: 3,
    soilType: 'Deep Medium Black Soil (Vertisol)',
    tempC: 31,
    humidity: 56,
    latitude: 22.7196,
    longitude: 75.8577,
    lastUpdated: '11 mins ago via ICAR-IISR Field Station #MP-IND-02',
    recommendedAction: 'Pod development stage: apply sprinkler irrigation to avoid seed shriveling under moisture stress.',
    sevenDayHistory: generate7DayHistory(28, 3, 'declining'),
  },
];

export const MOCK_DISEASES: CropDiseaseSample[] = [
  {
    id: 'paddy-blast',
    crop: 'Paddy',
    diseaseName: 'Rice Blast (Magnaporthe oryzae)',
    tamilName: 'நெல் குலை நோய்',
    pathogen: 'Fungal (Pyricularia grisea)',
    severity: 'severe',
    confidenceScore: 94.8,
    symptoms: [
      'Spindle-shaped lesions on leaf blades with gray or white centers and brown margins',
      'Lesions coalesce causing complete leaf necrosis and drying',
      'Rotting of the panicle neck and grain discoloration in later stages',
    ],
    remedyAction: 'Immediate foliar spray of Tricyclazole 75% WP @ 0.6 g/L or Kasugamycin 3% SL @ 2.5 mL/L.',
    culturalControl: [
      'Avoid excessive nitrogenous fertilizer application in cloudy weather',
      'Burn or compost crop residues after harvest to kill overwintering spores',
      'Treat seeds with Pseudomonas fluorescens talc formulation @ 10 g/kg seed',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'groundnut-tikka',
    crop: 'Groundnut',
    diseaseName: 'Tikka Leaf Spot (Cercospora arachidicola)',
    tamilName: 'வேர்க்கடலை டிக்கா இலைப்புள்ளி',
    pathogen: 'Fungal (Mycosphaerella berkeleyi)',
    severity: 'moderate',
    confidenceScore: 91.2,
    symptoms: [
      'Circular to irregular dark brown spots with prominent yellow halo on upper surface',
      'Premature defoliation resulting in severe reduction in pod yield and oil content',
      'Concentric rings visible on lesions under humid conditions',
    ],
    remedyAction: 'Foliar application of Carbendazim 12% + Mancozeb 63% WP (Saaf) @ 2 g/L at 15-day intervals.',
    culturalControl: [
      'Maintain adequate spacing (30cm x 10cm) for adequate airflow between canopies',
      'Foliar spray of 5% Neem seed kernel extract (NSKE) at early onset',
      'Intercrop with pearl millet or sorghum to barrier airborne conidia',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sugarcane-red-rot',
    crop: 'Sugarcane',
    diseaseName: 'Red Rot (Colletotrichum falcatum)',
    tamilName: 'கரும்பு செவ்வழுகல் நோய்',
    pathogen: 'Fungal (Glomerella tucumanensis)',
    severity: 'severe',
    confidenceScore: 96.5,
    symptoms: [
      'Third and fourth leaves from top show yellowing and drying along midribs',
      'Internal stalk tissue shows red coloration interspersed with white transverse bands',
      'Characteristic alcohol/sour odor upon splitting cane longitudinally',
    ],
    remedyAction: 'Drenching the soil with Carbendazim 0.1% or root zone application of Trichoderma viride enriched farmyard manure.',
    culturalControl: [
      'Select disease-free certified setts from designated seed nurseries',
      'Sett treatment in hot water at 52°C for 30 minutes before planting',
      'Strict crop rotation with paddy or green manure crops; avoid ratoon cropping in infected fields',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
  },
];

export const ARCHITECTURE_PIPELINE: ArchitectureNode[] = [
  {
    id: 'node-iot-ingest',
    title: 'IoT & Telemetry Ingestion Layer',
    category: 'Ingestion',
    role: 'Captures in-situ capacitive soil moisture probes, ambient temperature, and TNAU AWS stations across Tamil Nadu blocks.',
    inputs: ['Capacitive moisture probe (analog 0-3.3V)', 'LoRaWAN / NB-IoT field telemetry gateway', 'IMD District rainfall forecast API'],
    outputs: ['Normalized JSON telemetry stream', 'Moving average moisture tensor', '24h precipitation matrix'],
    latency: '~120ms',
    samplePayload: {
      districtId: 'chengalpattu',
      sensorUid: 'TN-CPT-SOIL-04',
      telemetry: {
        soilMoisturePercent: 22.4,
        soilTempC: 28.1,
        electricalConductivity_uS: 412,
        batteryVolts: 3.82,
      },
      forecast: {
        rain24h_mm: 2.1,
        pop_probability: 25,
        wind_kmh: 14,
      },
      timestamp: '2026-09-23T20:50:00Z',
    },
  },
  {
    id: 'node-rule-engine',
    title: 'Deterministic Agro-Logic Engine',
    category: 'Logic',
    role: 'Executes evaluateIrrigationRisk() against strict threshold invariants with zero LLM hallucinations.',
    inputs: ['soilMoisture (%)', 'rainForecast (mm)', 'Crop stage coefficients (Kc)'],
    outputs: ['AdvisoryRisk { irrigationNeeded, riskLevel, reason }', 'Priority queue placement'],
    latency: '< 2ms (In-memory execution)',
    samplePayload: {
      ruleExecutionId: 'EXEC-7729-RULE',
      soilMoistureInput: 22,
      rainForecastInput: 2,
      rulesMatched: [
        'RULE_CRITICAL_DEFICIT (soilMoisture < 30 && rainForecast < 5)',
      ],
      output: {
        irrigationNeeded: true,
        riskLevel: 'high',
        reason: 'Critical moisture deficit: Soil moisture is at 22% (below critical 30% threshold)...',
      },
    },
  },
  {
    id: 'node-advisory-dispatch',
    title: 'Farmer Advisory & Edge Dispatch',
    category: 'Dispatch',
    role: 'Formats hyper-local SMS in Tamil/English, sends IVR voice broadcasts, and synchronizes with regional Agricultural Officers.',
    inputs: ['AdvisoryRisk object', 'Farmer mobile profile', 'Language preference (Tamil / English)'],
    outputs: ['Push alert', 'SMS text message', 'Block Panchayat advisory feed'],
    latency: '~450ms',
    samplePayload: {
      recipient: '+91 98401 XXXXX',
      language: 'ta-IN',
      dispatchChannel: 'SMS_GATEWAY_TRAI',
      messageContent: 'AGAM எச்சரிக்கை: செங்கல்பட்டு நெல் வயலில் மண் ஈரப்பதம் 22% மட்டுமே உள்ளது. உடனடி நீர்ப்பாசனம் செய்யவும்.',
      deliveryStatus: 'QUEUED_FOR_DISPATCH',
    },
  },
  {
    id: 'node-vision-scanner',
    title: 'Gemini Vision & Local Remedy Pipeline',
    category: 'Vision',
    role: 'Analyzes uploaded foliage photographs via Gemini Vision 3.8 Flash, yielding strictly 1 of 5 labels (Leaf Blight, Powdery Mildew, Rust, Bacterial Spot, Healthy), then looks up prescribed remedies from deterministic local JSON.',
    inputs: ['Foliage photo (Base64 JPEG/PNG)', 'Zero-shot prompt: "Respond with ONLY one of these exact labels..."'],
    outputs: ['Disease Label', 'Verified Local Remedy Prescriptions', 'Field spray guidance'],
    latency: '~450ms',
    samplePayload: {
      inferenceEngine: 'Gemini Vision (gemini-3.8-flash)',
      prompt: 'Identify the disease in this crop image. Respond with ONLY one of these exact labels: Leaf Blight, Powdery Mildew, Rust, Bacterial Spot, Healthy. No other text.',
      detectedLabel: 'Leaf Blight',
      remedySource: 'Hardcoded local JSON repository',
      prescribedRemedy: 'Remove affected leaves, apply copper-based fungicide, avoid overhead watering.',
    },
  },
];
