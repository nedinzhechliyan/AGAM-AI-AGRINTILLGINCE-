import React, { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  Scan,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  FileImage,
  ArrowRight,
  ShieldCheck,
  X,
  SwitchCamera,
  History,
  Wheat,
  Activity,
  Calendar,
  Check,
  ShieldAlert,
  Droplets
} from 'lucide-react';
import {
  DISEASE_REMEDIES,
  DiseaseLabel,
  matchDiseaseLabel,
  SAMPLE_LEAF_IMAGES,
  SampleLeaf,
} from '../data/diseaseRemedies';
import { 
  appendDiseaseScanToProfile, 
  getFarmerProfile, 
  FarmerLandProfile, 
  DiseaseRecord 
} from '../services/firebase';
import { soundkit } from '../services/soundkit';

interface StructuredDiagnosis {
  disease_name: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  summary?: string;
  remedy?: string;
  safe_to_spray?: boolean;
  engine?: string;
}

interface DiseaseScannerTabProps {
  farmerProfile?: FarmerLandProfile | null;
  onProfileUpdated?: (updated: FarmerLandProfile) => void;
}

export function DiseaseScannerTab({ farmerProfile, onProfileUpdated }: DiseaseScannerTabProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectedLabel, setDetectedLabel] = useState<DiseaseLabel | null>(null);
  const [structuredData, setStructuredData] = useState<StructuredDiagnosis | null>(null);
  const [diagnosticEngine, setDiagnosticEngine] = useState<string>('Google Gemma 4 / Groq LPU');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Live Camera Viewfinder Modal State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Historical Scans List
  const [historyList, setHistoryList] = useState<DiseaseRecord[]>(
    farmerProfile?.historicalDiseases || []
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const farmerId = farmerProfile?.phoneNumber || localStorage.getItem('agam_user_phone') || 'anonymous_farmer';
  const cropName = farmerProfile?.primaryCrop || 'Crop Leaf';
  const districtName = farmerProfile?.districtName || 'Tamil Nadu';

  // Load history from profile on mount
  useEffect(() => {
    if (farmerProfile?.historicalDiseases) {
      setHistoryList(farmerProfile.historicalDiseases);
    }
  }, [farmerProfile]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Launch live camera or fallback to native camera input
  const startCamera = async (mode: 'environment' | 'user' = 'environment') => {
    soundkit.play('buttonTap');
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Live camera access error, falling back to native file camera:', err);
      stopCameraStream();
      cameraInputRef.current?.click();
    }
  };

  const toggleFacingMode = () => {
    soundkit.play('buttonTap');
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture still photo from live video feed
  const capturePhotoFromLiveFeed = () => {
    soundkit.play('buttonTap');
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 960;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Data = canvas.toDataURL('image/jpeg', 0.85);

    stopCameraStream();

    setFileName(`crop_scan_${Date.now()}.jpg`);
    setFileSize('Camera Snapshot');
    setImageMimeType('image/jpeg');
    setImagePreview(base64Data);

    analyzeWithAI(base64Data, 'image/jpeg');
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      soundkit.play('error');
      setErrorMessage('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    soundkit.play('buttonTap');
    setErrorMessage(null);
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      setImagePreview(base64Url);
      analyzeWithAI(base64Url, file.type);
    };
    reader.onerror = () => {
      soundkit.play('error');
      setErrorMessage('Failed to read file from local storage.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Select sample preset leaf
  const handleSelectSample = async (sample: SampleLeaf) => {
    soundkit.play('buttonTap');
    setErrorMessage(null);
    setFileName(sample.name);
    setFileSize('Sample Specimen');
    setImageMimeType('image/jpeg');

    try {
      setIsAnalyzing(true);
      setDetectedLabel(null);
      const response = await fetch(sample.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        setImagePreview(base64Url);
        analyzeWithAI(base64Url, blob.type || 'image/jpeg', sample.crop);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error(err);
      setImagePreview(sample.imageUrl);
      setIsAnalyzing(false);
      setDetectedLabel(sample.expectedLabel);
      setStructuredData({
        disease_name: sample.expectedLabel,
        severity: sample.expectedLabel === 'Healthy' ? 'LOW' : 'MEDIUM',
        summary: `Foliar analysis indicates symptoms matching ${sample.expectedLabel}.`,
        remedy: DISEASE_REMEDIES[sample.expectedLabel],
        safe_to_spray: true,
      });
    }
  };

  // Call server-side proxy route `/api/scan-disease`
  const analyzeWithAI = async (base64String: string, mime: string, cropNameParam?: string) => {
    setIsAnalyzing(true);
    setDetectedLabel(null);
    setStructuredData(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/scan-disease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64String,
          mimeType: mime || 'image/jpeg',
          cropType: cropNameParam || cropName,
          district: districtName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`);
      }

      const raw = data.label || data.data?.disease_name || '';
      const matched = matchDiseaseLabel(raw);
      setDetectedLabel(matched);
      setDiagnosticEngine(data.engine || 'Gemma 4 Vision');

      const parsed: StructuredDiagnosis = {
        disease_name: data.data?.disease_name || matched,
        severity: data.data?.severity || (matched === 'Healthy' ? 'LOW' : 'MEDIUM'),
        summary: data.data?.summary || `Symptoms identified as ${matched}.`,
        remedy: data.data?.remedy || DISEASE_REMEDIES[matched],
        safe_to_spray: data.data?.safe_to_spray ?? true,
        engine: data.engine,
      };

      setStructuredData(parsed);

      if (matched) {
        if (matched === 'Healthy') {
          soundkit.play('success');
        } else {
          soundkit.play('alert');
        }

        const newRecord: DiseaseRecord = {
          id: `scan_${Date.now()}`,
          diseaseLabel: matched,
          remedy: parsed.remedy || DISEASE_REMEDIES[matched],
          crop: cropNameParam || cropName,
          timestamp: new Date().toISOString(),
        };

        await appendDiseaseScanToProfile(farmerId, {
          diseaseLabel: matched,
          remedy: parsed.remedy || DISEASE_REMEDIES[matched],
          crop: cropNameParam || cropName,
        });

        setHistoryList((prev) => [newRecord, ...prev]);

        if (onProfileUpdated && farmerProfile) {
          onProfileUpdated({
            ...farmerProfile,
            lastScan: newRecord,
            historicalDiseases: [newRecord, ...(farmerProfile.historicalDiseases || [])],
          });
        }
      }
    } catch (err: any) {
      console.error('Vision diagnosis failed:', err);
      soundkit.play('error');
      setErrorMessage(
        err.message || 'Vision AI inference unavailable. Please check network connection.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    soundkit.play('buttonTap');
    stopCameraStream();
    setImagePreview(null);
    setDetectedLabel(null);
    setStructuredData(null);
    setErrorMessage(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const getBadgeTheme = (label: DiseaseLabel | null) => {
    if (!label) return { badge: 'bg-stone-100 text-stone-700', border: 'border-stone-200' };
    switch (label) {
      case 'Healthy':
        return {
          badge: 'bg-emerald-100 text-emerald-950 border-2 border-emerald-500',
          border: 'border-emerald-300',
          indicator: 'bg-emerald-600',
          cardBg: 'bg-emerald-50/50',
        };
      case 'Powdery Mildew':
        return {
          badge: 'bg-amber-100 text-amber-950 border-2 border-amber-500',
          border: 'border-amber-300',
          indicator: 'bg-amber-500',
          cardBg: 'bg-amber-50/50',
        };
      case 'Leaf Blight':
      case 'Rust':
      case 'Bacterial Spot':
        return {
          badge: 'bg-rose-100 text-rose-950 border-2 border-rose-500',
          border: 'border-rose-300',
          indicator: 'bg-rose-600',
          cardBg: 'bg-rose-50/50',
        };
      default:
        return {
          badge: 'bg-stone-100 text-stone-700 border border-stone-200',
          border: 'border-stone-200',
          indicator: 'bg-stone-400',
          cardBg: 'bg-stone-50/50',
        };
    }
  };

  const theme = getBadgeTheme(detectedLabel);

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* LIVE CAMERA VIEWFINDER MODAL */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-md flex items-center justify-between text-white py-2">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-sm font-bold">Crop Leaf Camera Viewfinder</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={stopCameraStream}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Camera"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-md aspect-3/4 sm:aspect-4/3 bg-black rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl flex items-center justify-center my-auto">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-white/70 rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <span className="text-[10px] text-white bg-black/60 px-2 py-0.5 rounded self-start backdrop-blur-xs font-bold">
                Center leaf lesion in box
              </span>
              <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 self-end" />
            </div>
          </div>

          <div className="w-full max-w-md flex flex-col items-center gap-3 pt-4">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  cameraInputRef.current?.click();
                }}
                className="text-xs text-stone-300 hover:text-white underline cursor-pointer"
              >
                Native Camera
              </button>

              <button
                type="button"
                onClick={capturePhotoFromLiveFeed}
                className="w-16 h-16 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer"
                title="Capture Photo"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              <button
                type="button"
                onClick={stopCameraStream}
                className="text-xs text-stone-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#1b4332] text-white rounded-2xl p-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2d6a4f] text-[#d8f3dc] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#52b788]" />
            <span>Google Gemma 4 / Gemini Vision & Groq LPU Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Crop Disease Scanner & Plant Pathologist
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 mt-1.5 leading-relaxed">
            Snap a field photo or upload an image to identify foliar pathogens. Pathologist results are automatically logged to your farmer profile database.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Camera & Upload Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-[#e6ccb2] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black text-stone-800 uppercase tracking-wider">
                1. Capture or Upload Crop Leaf
              </h2>
              {imagePreview && (
                <button
                  onClick={handleReset}
                  className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => startCamera('environment')}
                className="py-3 px-3 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4 text-[#52b788]" />
                <span>Active Camera</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundkit.play('buttonTap');
                  fileInputRef.current?.click();
                }}
                className="py-3 px-3 rounded-xl bg-[#f5ebe0] hover:bg-[#ebd5c1] text-[#78350f] border-2 border-[#d5bdaf] text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-[#b45309]" />
                <span>Upload Photo</span>
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                soundkit.play('buttonTap');
                fileInputRef.current?.click();
              }}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                isDragOver ? 'border-emerald-600 bg-emerald-50/50' : 'border-stone-300 hover:border-emerald-600 bg-stone-50/60'
              }`}
            >
              <UploadCloud className="w-7 h-7 text-emerald-700 mb-1" />
              <span className="text-xs font-black text-stone-800 block">
                Tap to select leaf photo or drop here
              </span>
              <p className="text-[10px] text-stone-500 mt-0.5">Supports high-res JPG, PNG, WebP</p>
            </div>

            {/* Presets */}
            <div className="mt-4 pt-3 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-2">
                Or test with sample specimen:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_LEAF_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    disabled={isAnalyzing}
                    className="p-1.5 rounded-lg border border-stone-200 hover:border-emerald-600 bg-stone-50 text-left transition-all cursor-pointer group"
                  >
                    <div className="aspect-video w-full rounded overflow-hidden mb-1 bg-stone-200">
                      <img
                        src={sample.imageUrl}
                        alt={sample.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-stone-800 block truncate">
                      {sample.expectedLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Historical Disease Log on Profile */}
          <div className="bg-white rounded-2xl border-2 border-[#e6ccb2] p-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#2d6a4f]" />
                <span className="text-xs font-black text-stone-900 uppercase">
                  Historical Crop Scans ({historyList.length})
                </span>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold">Logged to Profile</span>
            </div>

            <div className="mt-2.5 space-y-2 max-h-48 overflow-y-auto divide-y divide-stone-100">
              {historyList.length === 0 ? (
                <p className="text-xs text-stone-400 py-3 text-center">
                  No previous crop disease scans logged yet.
                </p>
              ) : (
                historyList.map((item, idx) => (
                  <div key={item.id || idx} className="pt-2 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900">{item.diseaseLabel}</span>
                      <span className="text-[10px] text-stone-500 block">
                        {item.crop} · {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.diseaseLabel === 'Healthy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.diseaseLabel === 'Healthy' ? 'Healthy' : 'Treated'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Diagnosis & Agronomic Remedies (7 cols) */}
        <div className="lg:col-span-7">
          {imagePreview ? (
            <div className="bg-white rounded-2xl border-2 border-[#e6ccb2] p-5 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-stone-500" />
                    <span className="text-xs font-bold text-stone-700 truncate max-w-xs">
                      {fileName || 'Captured Crop Leaf'}
                    </span>
                  </div>

                  {isAnalyzing ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Analyzing with AI...
                    </span>
                  ) : detectedLabel ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-900 font-black bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Saved to Database
                    </span>
                  ) : null}
                </div>

                {/* Preview Image */}
                <div className="relative mt-4 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 max-h-[280px] flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Analyzed leaf"
                    className="max-h-[280px] w-full object-contain"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-emerald-950/30 flex flex-col justify-between pointer-events-none">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_15px_#34d399]" />
                      <div className="p-2 bg-black/60 text-center text-white text-xs font-bold">
                        Running Neural Pathologist Inspection on Crop Lesions...
                      </div>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Structured Pathologist Diagnosis Result */}
                {structuredData && !isAnalyzing && (
                  <div className="mt-4 space-y-3">
                    <div className={`p-4 rounded-xl border-2 ${theme.border} ${theme.cardBg}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${theme.indicator}`} />
                          <div>
                            <h3 className="text-lg font-black text-stone-900">
                              {structuredData.disease_name}
                            </h3>
                            <span className="text-[10px] font-mono text-stone-500">
                              Inference Engine: {diagnosticEngine}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {structuredData.severity && (
                            <span
                              className={`text-xs font-black px-2.5 py-1 rounded-full ${
                                structuredData.severity === 'LOW'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                                  : structuredData.severity === 'HIGH'
                                  ? 'bg-rose-100 text-rose-900 border border-rose-400'
                                  : 'bg-amber-100 text-amber-950 border border-amber-400'
                              }`}
                            >
                              Severity: {structuredData.severity}
                            </span>
                          )}

                          <span className={`text-xs font-black px-3 py-1 rounded-full ${theme.badge}`}>
                            {detectedLabel === 'Healthy' ? 'No Disease Found' : 'Pathogen Identified'}
                          </span>
                        </div>
                      </div>

                      {/* Pathologist Summary */}
                      {structuredData.summary && (
                        <p className="mt-2 text-xs text-stone-700 font-medium">
                          {structuredData.summary}
                        </p>
                      )}
                    </div>

                    {/* Prescribed Remedy & Spray Safety */}
                    <div className="p-4 rounded-xl bg-[#faf7f2] border-2 border-[#e6ccb2] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-[#2d6a4f]" />
                          <span>Actionable Remedy Protocol:</span>
                        </div>

                        {structuredData.safe_to_spray !== undefined && (
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                              structuredData.safe_to_spray
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            <Droplets className="w-3 h-3" />
                            {structuredData.safe_to_spray ? 'Safe to Spray' : 'Withhold Spray'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-semibold">
                        {structuredData.remedy}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-medium">
                  {detectedLabel ? 'Appended to farmer profile history' : 'Ready for analysis'}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  New Scan
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-8 sm:p-12 text-center h-full flex flex-col items-center justify-center min-h-[340px]">
              <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-3 shadow-xs">
                <Scan className="w-7 h-7 text-[#2d6a4f]" />
              </div>
              <h3 className="text-sm font-black text-stone-800">No Leaf Scanned Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4 leading-relaxed">
                Take a direct photo using your camera or upload a field picture for an instant diagnosis.
              </p>
              <button
                type="button"
                onClick={() => startCamera('environment')}
                className="px-4 py-2.5 rounded-xl bg-[#1b4332] text-white text-xs font-bold hover:bg-[#2d6a4f] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4 text-[#52b788]" />
                <span>Open Camera Scanner</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
