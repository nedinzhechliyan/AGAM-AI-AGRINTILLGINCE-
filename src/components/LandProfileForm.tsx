import React, { useState, useMemo } from 'react';
import { 
  Sprout, 
  MapPin, 
  Ruler, 
  Wheat, 
  ArrowRight, 
  ShieldCheck, 
  Building2,
  Sparkles,
  Loader2,
  Globe,
  Home
} from 'lucide-react';
import { MOCK_DISTRICTS } from '../data/mockDistricts';
import { saveFarmerProfileFull, FarmerLandProfile } from '../services/firebase';
import { LanguageCode, LANGUAGES } from '../data/languages';
import { InteractiveLandGlobe } from './InteractiveLandGlobe';
import { soundkit } from '../services/soundkit';

interface LandProfileFormProps {
  userPhone: string;
  currentLanguage: LanguageCode;
  initialProfile?: FarmerLandProfile | null;
  onComplete: (profile: FarmerLandProfile) => void;
  onSkip?: () => void;
}

const PRIMARY_CROPS = [
  { id: 'paddy', name: 'Paddy / Rice (நெல் / चावल)' },
  { id: 'sugarcane', name: 'Sugarcane (கரும்பு / गन्ना)' },
  { id: 'cotton', name: 'Cotton (பருத்தி / कपास)' },
  { id: 'maize', name: 'Maize / Corn (மக்காச்சோளம் / मक्का)' },
  { id: 'wheat', name: 'Wheat (கோதுமை / गेहूं)' },
  { id: 'groundnut', name: 'Groundnut / Peanut (வேர்க்கடலை / मूंगफली)' },
  { id: 'tomato', name: 'Tomato (தக்காளி / टमाटर)' },
  { id: 'chilli', name: 'Chilli / Peppers (மிளகாய் / मिर्च)' },
  { id: 'turmeric', name: 'Turmeric (மஞ்சள் / हल्दी)' },
  { id: 'banana', name: 'Banana (வாழை / केला)' },
  { id: 'coffee', name: 'Coffee Beans (காபி / कॉफ़ी)' },
  { id: 'pulses', name: 'Pulses / Dal (பயறு வகைகள் / दालें)' },
  { id: 'other', name: 'Other Crop (மற்றவை / अन्य)' },
];

export function LandProfileForm({
  userPhone,
  currentLanguage,
  initialProfile,
  onComplete,
  onSkip,
}: LandProfileFormProps) {
  // Extract unique states from the district list
  const availableStates = useMemo(() => {
    const states = Array.from(new Set(MOCK_DISTRICTS.map((d) => d.state)));
    return states.sort();
  }, []);

  const [farmerIdPhone, setFarmerIdPhone] = useState<string>(
    userPhone || initialProfile?.phoneNumber || '9876543210'
  );
  const [selectedState, setSelectedState] = useState<string>(
    initialProfile?.state || 'Tamil Nadu'
  );

  // Filter districts strictly by selected state
  const filteredDistricts = useMemo(() => {
    return MOCK_DISTRICTS.filter((d) => d.state === selectedState);
  }, [selectedState]);

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(
    initialProfile?.districtId || filteredDistricts[0]?.id || 'chengalpattu'
  );
  const [village, setVillage] = useState<string>(
    initialProfile?.village || 'Kovalam Farmland Zone'
  );
  const [landSizeAcres, setLandSizeAcres] = useState<string>(
    initialProfile?.landSizeAcres ? String(initialProfile.landSizeAcres) : '2.5'
  );
  const [primaryCrop, setPrimaryCrop] = useState<string>(
    initialProfile?.primaryCrop || 'Paddy / Rice (நெல் / चावल)'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When state changes, reset district to first available in that state
  const handleStateChange = (newState: string) => {
    soundkit.play('buttonTap');
    setSelectedState(newState);
    const districtsForNewState = MOCK_DISTRICTS.filter((d) => d.state === newState);
    if (districtsForNewState.length > 0) {
      setSelectedDistrictId(districtsForNewState[0].id);
    }
  };

  const matchedDistrict = useMemo(() => {
    return (
      MOCK_DISTRICTS.find((d) => d.id === selectedDistrictId) ||
      filteredDistricts[0] ||
      MOCK_DISTRICTS[0]
    );
  }, [selectedDistrictId, filteredDistricts]);

  const parsedAcres = parseFloat(landSizeAcres) || 2.5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    soundkit.play('buttonTap');

    const acres = parseFloat(landSizeAcres);
    if (isNaN(acres) || acres <= 0) {
      soundkit.play('error');
      setErrorMessage('Please enter a valid land size in acres (e.g., 2.5)');
      return;
    }

    setIsSubmitting(true);
    try {
      const profileData: Partial<FarmerLandProfile> = {
        farmerId: farmerIdPhone || userPhone || 'anonymous_farmer',
        phoneNumber: farmerIdPhone || userPhone || 'anonymous_farmer',
        state: selectedState,
        districtId: matchedDistrict.id,
        districtName: matchedDistrict.name,
        village: village.trim() || 'Farmland Zone',
        landSizeAcres: acres,
        primaryCrop: primaryCrop,
        preferredLanguage: currentLanguage,
      };

      const saved = await saveFarmerProfileFull(
        farmerIdPhone || userPhone || 'anonymous_farmer',
        profileData
      );

      soundkit.play('complete');
      onComplete(saved);
    } catch (err: any) {
      console.error('Error saving land profile:', err);
      soundkit.play('error');
      setErrorMessage('Failed to save profile. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSkip = () => {
    soundkit.play('buttonTap');
    const fallbackDistrict = MOCK_DISTRICTS[0];
    const defaultProfile: FarmerLandProfile = {
      farmerId: farmerIdPhone || userPhone || 'anonymous_farmer',
      phoneNumber: farmerIdPhone || userPhone || 'anonymous_farmer',
      state: fallbackDistrict.state,
      districtId: fallbackDistrict.id,
      districtName: fallbackDistrict.name,
      village: 'Kovalam Agricultural Zone',
      landSizeAcres: 2.5,
      primaryCrop: 'Paddy / Rice',
      preferredLanguage: currentLanguage,
    };
    saveFarmerProfileFull(farmerIdPhone || userPhone || 'anonymous_farmer', defaultProfile);
    if (onSkip) {
      onSkip();
    } else {
      onComplete(defaultProfile);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900 flex flex-col justify-center items-center px-3 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Onboarding Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1b4332] text-[#d8f3dc] shadow-md mb-2 ring-4 ring-[#1b4332]/10">
            <Sprout className="w-7 h-7 text-[#52b788]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1b4332] tracking-tight">
            AGAM Farmer Onboarding & Land Profile
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-md mx-auto">
            Configure your geographic farmland coordinates, interactive polygon geometry, and primary crop for satellite telemetry.
          </p>

          {farmerIdPhone && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[#d8f3dc] border border-[#b7e4c7] text-xs font-semibold text-[#1b4332]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2d6a4f]" />
              <span>Farmer ID / Phone: {farmerIdPhone}</span>
            </div>
          )}
        </div>

        {/* Main Grid: Form Inputs (Left) + Interactive Land Polygon (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: FORM INPUTS (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border-2 border-[#e6ccb2] shadow-sm p-5 sm:p-6">
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* 1. Farmer ID / Phone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  Farmer ID / Phone Number
                </label>
                <input
                  type="tel"
                  value={farmerIdPhone}
                  onChange={(e) => setFarmerIdPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] text-sm font-semibold text-stone-900"
                />
              </div>

              {/* 2. State Select */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  State / மாநிலம் / राज्य
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] text-sm font-semibold text-stone-900 cursor-pointer"
                >
                  {availableStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. District Select */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  District / மாவட்டம் ({filteredDistricts.length} Available)
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => {
                    soundkit.play('buttonTap');
                    setSelectedDistrictId(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] text-sm font-semibold text-stone-900 cursor-pointer"
                >
                  {filteredDistricts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.tamilName ? `(${d.tamilName})` : ''} · {d.zone}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. City / Village */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  City / Village / கிராமம்
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Kovalam Village, Survey Plot #108"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] text-sm font-semibold text-stone-900"
                />
              </div>

              {/* 5. Land Size in Acres */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  Land Size (Acres) / நிலப்பரப்பு (ஏக்கர்)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1000"
                    value={landSizeAcres}
                    onChange={(e) => setLandSizeAcres(e.target.value)}
                    placeholder="e.g. 2.5"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] text-sm font-semibold text-stone-900"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                    Acres
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-stone-500 font-medium">Quick Pick:</span>
                  {['1.0', '2.5', '5.0', '10.0'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        soundkit.play('buttonTap');
                        setLandSizeAcres(preset);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                        landSizeAcres === preset
                          ? 'bg-[#1b4332] text-white border-[#1b4332]'
                          : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {preset} ac
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Primary Crop */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Wheat className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  Primary Crop / முதன்மைப் பயிர்
                </label>
                <select
                  value={primaryCrop}
                  onChange={(e) => setPrimaryCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] text-sm font-semibold text-stone-900 cursor-pointer"
                >
                  {PRIMARY_CROPS.map((crop) => (
                    <option key={crop.id} value={crop.name}>
                      {crop.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#d8f3dc]" />
                      <span>Registering Land Profile in Database...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Land Profile & Enter AGAM</span>
                      <ArrowRight className="w-4 h-4 text-[#52b788]" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={handleQuickSkip}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors cursor-pointer"
              >
                Skip and use default farmland settings &rarr;
              </button>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE LAND GLOBE & MOTION POLYGON (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#2d6a4f]" />
                Interactive Land Parcel Preview
              </span>
              <span className="text-[11px] font-mono text-[#b45309] font-bold">
                {parsedAcres} Acres Model
              </span>
            </div>

            <InteractiveLandGlobe
              state={selectedState}
              districtName={matchedDistrict.name}
              village={village}
              acres={parsedAcres}
              cropName={primaryCrop}
              lat={matchedDistrict.latitude}
              lon={matchedDistrict.longitude}
              interactive={true}
            />

            <div className="p-3.5 rounded-xl bg-white border border-[#e6ccb2] text-xs text-stone-600">
              <span className="font-bold text-stone-900 block mb-1">
                Spatial Land Registry Integration:
              </span>
              <p className="text-[11px] text-stone-600 leading-normal">
                This polygon is automatically synced with NASA POWER grid coordinates and recorded into your <code className="font-mono text-emerald-800 font-bold">farmer_profile</code> schema for historical disease tracking and PM-Kisan verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
