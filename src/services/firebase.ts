import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  arrayUnion
} from 'firebase/firestore';

// Explicit Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBdcwpMPBY5E-Pb9SDK-rJ7oyN6BbYKBTU",
  authDomain: "agam-cf63d.firebaseapp.com",
  projectId: "agam-cf63d",
  storageBucket: "agam-cf63d.firebasestorage.app",
  messagingSenderId: "654797572243",
  appId: "1:654797572243:web:a24ab76fd08c9577ee2566"
};

// Initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface DiseaseRecord {
  id?: string;
  diseaseLabel: string;
  remedy: string;
  crop?: string;
  timestamp: string;
  imageUrl?: string;
}

export interface SchemeRecord {
  schemeId: string;
  schemeName: string;
  status: 'Active / Verified' | 'Pending Verification' | 'Eligible (Action Required)' | 'Disbursed';
  lastDisbursement?: string;
  referenceId?: string;
  portalUrl: string;
  amountAnnual?: string;
}

export interface FarmerLandProfile {
  farmerId: string;
  phoneNumber: string;
  state: string;
  districtId: string;
  districtName: string;
  village: string;
  primaryCrop: string;
  landSizeAcres: number;
  preferredLanguage?: string;
  polygonCoordinates?: { lat: number; lng: number }[];
  historicalDiseases?: DiseaseRecord[];
  schemeHistory?: SchemeRecord[];
  createdAt?: string;
  updatedAt?: string;
  lastScan?: DiseaseRecord;
}

/**
 * Saves or updates a farmer profile in Firestore under `farmer_profile` collection
 */
export async function saveFarmerProfileFull(farmerId: string, profile: Partial<FarmerLandProfile>) {
  const timestamp = new Date().toISOString();
  const payload: FarmerLandProfile = {
    farmerId,
    phoneNumber: profile.phoneNumber || farmerId,
    state: profile.state || 'Tamil Nadu',
    districtId: profile.districtId || 'chengalpattu',
    districtName: profile.districtName || 'Chengalpattu',
    village: profile.village || 'Kovalam Village',
    primaryCrop: profile.primaryCrop || 'Paddy / Rice',
    landSizeAcres: Number(profile.landSizeAcres) || 2.5,
    preferredLanguage: profile.preferredLanguage || 'ta',
    historicalDiseases: profile.historicalDiseases || [],
    schemeHistory: profile.schemeHistory || [
      {
        schemeId: 'pm-kisan',
        schemeName: 'PM-Kisan Samman Nidhi',
        status: 'Active / Verified',
        lastDisbursement: '₹2,000 (17th Installment credited to Aadhaar Bank A/C)',
        referenceId: `PMK-IN-${farmerId.slice(-4) || '8832'}`,
        portalUrl: 'https://pmkisan.gov.in',
        amountAnnual: '₹6,000 / year'
      },
      {
        schemeId: 'pmfby',
        schemeName: 'Pradhan Mantri Fasal Bima Yojana (Crop Insurance)',
        status: 'Active / Verified',
        lastDisbursement: 'Kharif Season Covered',
        referenceId: `PMFBY-${farmerId.slice(-4) || '9921'}`,
        portalUrl: 'https://pmfby.gov.in',
        amountAnnual: '100% Weather Shield'
      }
    ],
    updatedAt: timestamp,
    createdAt: profile.createdAt || timestamp,
  };

  try {
    const profileRef = doc(db, 'farmer_profile', farmerId);
    await setDoc(profileRef, payload, { merge: true });
    // Also store locally for instant offline/speed retrieval
    localStorage.setItem(`agam_farmer_profile_${farmerId}`, JSON.stringify(payload));
    return payload;
  } catch (err) {
    console.warn('Firestore write notice (caching locally):', err);
    localStorage.setItem(`agam_farmer_profile_${farmerId}`, JSON.stringify(payload));
    return payload;
  }
}

/**
 * Retrieves a farmer's profile from Firestore or local cache
 */
export async function getFarmerProfile(farmerId: string): Promise<FarmerLandProfile | null> {
  if (!farmerId) return null;

  // 1. Check local cache first
  const cached = localStorage.getItem(`agam_farmer_profile_${farmerId}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.districtId) return parsed;
    } catch (_) {}
  }

  // 2. Fetch from Firestore `farmer_profile` collection
  try {
    const profileRef = doc(db, 'farmer_profile', farmerId);
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      const data = snap.data() as FarmerLandProfile;
      localStorage.setItem(`agam_farmer_profile_${farmerId}`, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Error reading from Firestore farmer_profile:', err);
  }

  return null;
}

/**
 * Appends a diagnosed crop disease to the farmer's historical disease log
 */
export async function appendDiseaseScanToProfile(farmerId: string, scan: {
  diseaseLabel: string;
  remedy: string;
  crop?: string;
  imageUrl?: string;
}) {
  const timestamp = new Date().toISOString();
  const diseaseRecord: DiseaseRecord = {
    id: `scan_${Date.now()}`,
    diseaseLabel: scan.diseaseLabel,
    remedy: scan.remedy,
    crop: scan.crop || 'Crop Leaf',
    timestamp,
    imageUrl: scan.imageUrl,
  };

  // Update local storage
  const cached = localStorage.getItem(`agam_farmer_profile_${farmerId}`);
  if (cached) {
    try {
      const parsed: FarmerLandProfile = JSON.parse(cached);
      parsed.lastScan = diseaseRecord;
      parsed.historicalDiseases = [diseaseRecord, ...(parsed.historicalDiseases || [])];
      parsed.updatedAt = timestamp;
      localStorage.setItem(`agam_farmer_profile_${farmerId}`, JSON.stringify(parsed));
    } catch (_) {}
  }

  // Update Firestore
  try {
    const profileRef = doc(db, 'farmer_profile', farmerId);
    await setDoc(profileRef, {
      lastScan: diseaseRecord,
      historicalDiseases: arrayUnion(diseaseRecord),
      updatedAt: timestamp,
    }, { merge: true });

    // Also add to subcollection for deep querying
    const scansSubRef = collection(db, 'farmer_profile', farmerId, 'crop_scans');
    await addDoc(scansSubRef, diseaseRecord);
  } catch (err) {
    console.warn('Firestore scan log notice:', err);
  }
}

export async function logAdvisoryToFirestore(farmerId: string, advisory: {
  districtId: string;
  districtName: string;
  crop: string;
  soilMoisture: number;
  rainForecast: number;
  riskLevel: string;
  irrigationNeeded: boolean;
}) {
  try {
    const advisoriesRef = collection(db, 'farmer_profile', farmerId, 'advisories');
    await addDoc(advisoriesRef, {
      ...advisory,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to log advisory to Firestore:', err);
  }
}

export const saveFarmerProfile = (farmerId: string, data: any) =>
  saveFarmerProfileFull(farmerId, {
    phoneNumber: data.phoneNumber || farmerId,
    preferredLanguage: data.preferredLanguage,
    districtName: data.defaultDistrict,
  });

export const saveFarmerLandProfile = (farmerId: string, data: any) =>
  saveFarmerProfileFull(farmerId, {
    phoneNumber: farmerId,
    state: data.state,
    districtId: data.districtId,
    districtName: data.districtName,
    village: data.village || 'Farmland Zone',
    landSizeAcres: data.landSizeAcres,
    primaryCrop: data.primaryCrop,
    preferredLanguage: data.preferredLanguage,
  });

export const logDiseaseScanToFirestore = (farmerId: string, scan: any) =>
  appendDiseaseScanToProfile(farmerId, scan);

// ============================================================================
// LANE 4 — Farm History Activity Subcollection (`farmer_profile/{id}/activities`)
// ============================================================================
export async function addActivityDoc(farmerId: string, activity: {
  id: string;
  type: string;
  title: string;
  detail: string;
  districtName?: string;
  language?: string;
  createdAt: string;
  meta?: Record<string, unknown>;
}) {
  const actsRef = collection(db, 'farmer_profile', farmerId, 'activities');
  await addDoc(actsRef, activity);
}

export async function fetchActivityDocs(farmerId: string): Promise<
  Array<{
    id: string;
    type: string;
    title: string;
    detail: string;
    districtName?: string;
    language?: string;
    createdAt: string;
    meta?: Record<string, unknown>;
  }>
> {
  const actsRef = collection(db, 'farmer_profile', farmerId, 'activities');
  const q = query(actsRef, orderBy('createdAt', 'desc'), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
}

export default app;


