import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Sprout, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Globe,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { LANGUAGES, LanguageCode } from '../data/languages';
import { auth, saveFarmerProfile } from '../services/firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';

interface PhoneLoginScreenProps {
  currentLanguage: LanguageCode;
  onBackToSplash: () => void;
  onLoginSuccess: (phoneNumber: string) => void;
}

export interface FirebaseErrorDetails {
  code: string;
  message: string;
  name?: string;
  hostname?: string;
  origin?: string;
  stack?: string;
  raw?: any;
}

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

// Utility to serialize full error object including non-enumerable properties
function extractFullErrorObject(err: any): Record<string, any> {
  if (!err) return { error: 'Unknown empty error' };
  if (typeof err !== 'object') return { error: String(err) };
  
  const serialized: Record<string, any> = {
    code: err.code || 'NO_ERROR_CODE',
    message: err.message || String(err),
    name: err.name || 'Error',
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
  };

  if (err.customData) {
    serialized.customData = err.customData;
  }
  if (err.stack) {
    serialized.stack = err.stack;
  }

  // Pick any additional keys on the error object
  try {
    const propertyNames = Object.getOwnPropertyNames(err);
    for (const prop of propertyNames) {
      if (!(prop in serialized)) {
        serialized[prop] = err[prop];
      }
    }
  } catch (_) {}

  return serialized;
}

export function PhoneLoginScreen({
  currentLanguage,
  onBackToSplash,
  onLoginSuccess,
}: PhoneLoginScreenProps) {
  const lang = LANGUAGES[currentLanguage];

  // Form State
  const [phoneNumber, setPhoneNumber] = useState<string>('9840123456');
  const [otp, setOtp] = useState<string>('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  
  // UI Status State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verifyingDelayed, setVerifyingDelayed] = useState<boolean>(false);
  const [errorDetails, setErrorDetails] = useState<FirebaseErrorDetails | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [isRecaptchaReady, setIsRecaptchaReady] = useState<boolean>(false);
  const [currentHostname, setCurrentHostname] = useState<string>('');
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Clean and format phone number for Indian standard (+91)
  const formatE164Phone = (num: string): string => {
    const digits = num.replace(/\D/g, '');
    const tenDigits = digits.slice(-10);
    return `+91${tenDigits}`;
  };

  // Robust function to create or reset RecaptchaVerifier freshly
  const setupRecaptcha = async (): Promise<RecaptchaVerifier | null> => {
    const hostname = window.location.hostname;
    try {
      console.log('[Firebase Auth] Setting up fresh RecaptchaVerifier on container...');
      
      // 1. Clear existing verifier if any
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (_) {}
        window.recaptchaVerifier = undefined;
      }

      // 2. Clean DOM container
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      } else {
        console.warn('[Firebase Auth] #recaptcha-container not in DOM yet.');
        return null;
      }

      // 3. Create fresh instance
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('[Firebase Auth] reCAPTCHA passed by Google service. Token exists:', !!response);
        },
        'expired-callback': () => {
          console.warn('[Firebase Auth] reCAPTCHA token expired.');
          if (isMountedRef.current) {
            setErrorDetails({
              code: 'auth/recaptcha-expired',
              message: 'Security token expired. Please click Send OTP again to refresh.',
              hostname,
              origin: window.location.origin,
            });
            setIsLoading(false);
          }
        },
      });

      // 4. Render verifier
      await verifier.render();
      console.log('[Firebase Auth] RecaptchaVerifier successfully rendered and ready.');
      if (isMountedRef.current) {
        recaptchaVerifierRef.current = verifier;
        window.recaptchaVerifier = verifier;
        setIsRecaptchaReady(true);
      }
      return verifier;
    } catch (err: any) {
      console.group('%c[Firebase Auth] Error setting up RecaptchaVerifier', 'color: #e11d48; font-weight: bold;');
      console.error('Full Error Object:', err);
      console.error('Error Code:', err?.code);
      console.error('Error Message:', err?.message);
      console.error('Current window.location.hostname:', hostname);
      console.error('Current window.location.origin:', window.location.origin);
      console.groupEnd();

      if (isMountedRef.current) {
        setIsRecaptchaReady(false);
        setErrorDetails({
          code: err?.code || 'recaptcha/render-failed',
          message: err?.message || 'Failed to initialize security verification widget.',
          name: err?.name,
          hostname,
          origin: window.location.origin,
          stack: err?.stack,
          raw: extractFullErrorObject(err),
        });
      }
      return null;
    }
  };

  // Lifecycle: Initialize on mount and log origin vs authorized domains
  useEffect(() => {
    isMountedRef.current = true;
    const hostname = window.location.hostname;
    const origin = window.location.origin;
    setCurrentHostname(hostname);

    console.group('%c[Firebase Auth Diagnostic] Origin & Authorized Domains Check', 'color: #1b4332; font-weight: bold; font-size: 13px;');
    console.info('Current window.location.hostname:', hostname);
    console.info('Current window.location.origin:', origin);
    console.info('Current window.location.href:', window.location.href);
    console.info('Firebase projectId:', auth.app.options.projectId);
    console.info('Firebase authDomain:', auth.app.options.authDomain);
    console.info('ℹ️ Check: Ensure "' + hostname + '" is added under Firebase Console -> Authentication -> Settings -> Authorized Domains');
    console.groupEnd();

    // Allow DOM to settle, then initialize verifier
    const timer = setTimeout(() => {
      setupRecaptcha();
    }, 150);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (_) {}
      }
      window.recaptchaVerifier = undefined;
    };
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Reset loading and verifier manually
  const handleReset = async () => {
    setIsLoading(false);
    setVerifyingDelayed(false);
    setErrorDetails(null);
    setSuccessNotice(null);
    await setupRecaptcha();
  };

  const handleCopyDomain = () => {
    if (navigator.clipboard && currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  // Step 1: Send OTP with detailed logging and full error capture
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setErrorDetails(null);
    setSuccessNotice(null);

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorDetails({
        code: 'app/invalid-phone-length',
        message: 'Please enter a valid 10-digit Indian mobile number.',
        hostname: currentHostname,
        origin: window.location.origin,
      });
      return;
    }

    const formattedPhone = formatE164Phone(phoneNumber);
    setIsLoading(true);

    console.group('%c[Firebase Auth] Initiating signInWithPhoneNumber', 'color: #2d6a4f; font-weight: bold;');
    console.log('Target Phone Number:', formattedPhone);
    console.log('window.location.hostname:', window.location.hostname);
    console.log('window.location.origin:', window.location.origin);
    console.log('Firebase Project ID:', auth.app.options.projectId);
    console.log('Firebase Auth Domain:', auth.app.options.authDomain);
    console.groupEnd();

    try {
      // Always ensure a valid active verifier
      let verifier = recaptchaVerifierRef.current;
      if (!verifier) {
        console.log('[Firebase Auth] Verifier not active, attempting fresh setup...');
        verifier = await setupRecaptcha();
      }

      if (!verifier) {
        throw new Error('Failed to prepare Google security verifier. Please check network connection or disable adblockers.');
      }

      // Race with a 12-second timeout so the UI never hangs forever
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          const timeoutErr: any = new Error(
            'Firebase request timed out after 12 seconds. Google Identity Toolkit was blocked or unreachable.'
          );
          timeoutErr.code = 'auth/network-request-failed';
          reject(timeoutErr);
        }, 12000);
      });

      const confirmationResult = await Promise.race([
        signInWithPhoneNumber(auth, formattedPhone, verifier),
        timeoutPromise
      ]);

      console.group('%c[Firebase Auth] signInWithPhoneNumber SUCCEEDED', 'color: #1b4332; font-weight: bold;');
      console.log('ConfirmationResult:', confirmationResult);
      console.log('Verification ID exists:', !!confirmationResult.verificationId);
      console.groupEnd();

      window.confirmationResult = confirmationResult;
      setStep('otp');
      setResendTimer(30);
      setSuccessNotice(`Verification code sent to ${formattedPhone}`);
    } catch (err: any) {
      // Capture and display full error object
      const fullErrorObj = extractFullErrorObject(err);

      console.group('%c[Firebase Auth] signInWithPhoneNumber FAILED', 'color: #e11d48; font-weight: bold; font-size: 13px;');
      console.error('Full Error Object:', err);
      console.error('Error Code (err.code):', err?.code);
      console.error('Error Message (err.message):', err?.message);
      console.error('Error Name (err.name):', err?.name);
      console.error('Error customData (err.customData):', err?.customData);
      console.error('Error stack:', err?.stack);
      console.error('Current window.location.hostname:', window.location.hostname);
      console.error('Current window.location.origin:', window.location.origin);
      console.error('Serialized Error Payload:', fullErrorObj);
      console.groupEnd();

      // If network block occurs specifically for the pre-registered demo number, still proceed to OTP input
      // so the farmer can enter 123456 and leverage the safe fallback
      if (formattedPhone === '+919840123456') {
        console.warn('[Firebase Auth] Proceeding to OTP step for demo credentials despite network notice');
        setStep('otp');
        setResendTimer(30);
        setSuccessNotice(`Enter test verification code (123456) for ${formattedPhone}`);
      } else {
        setupRecaptcha().catch((e) => console.warn('Post-error verifier reset issue:', e));

        setErrorDetails({
          code: err?.code || 'auth/network-request-failed',
          message: err?.message || 'Network request to Firebase Identity Toolkit failed.',
          name: err?.name,
          hostname: currentHostname,
          origin: window.location.origin,
          stack: err?.stack,
          raw: fullErrorObj,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP with detailed logging and full error capture
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorDetails(null);
    setVerifyingDelayed(false);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorDetails({
        code: 'app/invalid-otp-length',
        message: 'Please enter the complete 6-digit verification code.',
        hostname: currentHostname,
        origin: window.location.origin,
      });
      return;
    }

    const formattedPhone = formatE164Phone(phoneNumber);
    const isTestCredential = formattedPhone === '+919840123456' && cleanOtp === '123456';

    setIsLoading(true);

    console.group('%c[Firebase Auth] Initiating confirmationResult.confirm(otp)', 'color: #2d6a4f; font-weight: bold;');
    console.log('Target Phone Number:', formattedPhone);
    console.log('Entered OTP:', cleanOtp);
    console.log('window.location.hostname:', window.location.hostname);
    console.log('window.location.origin:', window.location.origin);
    console.log('Active ConfirmationResult exists:', !!window.confirmationResult);
    console.groupEnd();

    // Visible small loading message update after 3 seconds of waiting
    const delayedNoticeTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setVerifyingDelayed(true);
      }
    }, 3000);

    try {
      // 1. Start the real confirmationResult.confirm(otp) call as normal
      const confirmPromise = (async () => {
        if (!window.confirmationResult) {
          throw new Error('No active verification session. Please request a new OTP.');
        }
        return await window.confirmationResult.confirm(cleanOtp);
      })();

      // 2. Simultaneously start a 5-second timeout
      const timeoutPromise = new Promise<{ isTimeout: true }>((resolve) => {
        setTimeout(() => {
          resolve({ isTimeout: true });
        }, 5000);
      });

      // Race the real confirmation call with the 5-second timer
      const raceResult = await Promise.race([
        confirmPromise.then((userCred) => ({ isTimeout: false as const, userCredential: userCred })),
        timeoutPromise
      ]);

      clearTimeout(delayedNoticeTimer);

      if (!raceResult.isTimeout) {
        // 3. If confirm() resolves successfully before the timeout — proceed normally
        console.group('%c[Firebase Auth] confirmationResult.confirm SUCCEEDED', 'color: #1b4332; font-weight: bold;');
        console.log('Verified User UID:', raceResult.userCredential.user.uid);
        console.log('Verified User PhoneNumber:', raceResult.userCredential.user.phoneNumber);
        console.groupEnd();

        const user = raceResult.userCredential.user;
        const verifiedPhone = user.phoneNumber || formattedPhone;

        localStorage.setItem('agam_user_phone', verifiedPhone);
        localStorage.setItem('agam_user_authenticated', 'true');

        await saveFarmerProfile(user.uid || verifiedPhone, {
          phoneNumber: verifiedPhone,
          preferredLanguage: currentLanguage,
        });

        onLoginSuccess(verifiedPhone);
      } else {
        // 4. Timeout fired first
        console.warn('[Firebase Auth] confirmationResult.confirm exceeded 5s timeout.');
        if (isTestCredential) {
          console.info('Demo credential accepted via fallback due to network timeout');
          localStorage.setItem('agam_user_phone', formattedPhone);
          localStorage.setItem('agam_user_authenticated', 'true');

          await saveFarmerProfile(formattedPhone, {
            phoneNumber: formattedPhone,
            preferredLanguage: currentLanguage,
          });

          onLoginSuccess(formattedPhone);
        } else {
          setErrorDetails({
            code: 'auth/timeout',
            message: 'Verification is taking too long. Please check your connection and try again.',
            hostname: currentHostname,
            origin: window.location.origin,
            raw: {
              code: 'auth/timeout',
              message: 'Confirmation call exceeded 5000ms timeout.',
              hostname: currentHostname,
              origin: window.location.origin,
            },
          });
        }
      }
    } catch (err: any) {
      clearTimeout(delayedNoticeTimer);
      const fullErrorObj = extractFullErrorObject(err);

      console.group('%c[Firebase Auth] confirmationResult.confirm FAILED', 'color: #e11d48; font-weight: bold; font-size: 13px;');
      console.error('Full Error Object:', err);
      console.error('Error Code (err.code):', err?.code);
      console.error('Error Message (err.message):', err?.message);
      console.error('Error Name (err.name):', err?.name);
      console.error('Error customData (err.customData):', err?.customData);
      console.error('Error stack:', err?.stack);
      console.error('Current window.location.hostname:', window.location.hostname);
      console.error('Current window.location.origin:', window.location.origin);
      console.error('Serialized Error Payload:', fullErrorObj);
      console.groupEnd();

      // If network error occurred specifically for the test credential
      if (isTestCredential && (err?.code === 'auth/network-request-failed' || err?.message?.includes('network') || err?.message?.includes('session'))) {
        console.info('Demo credential accepted via fallback due to network timeout');
        localStorage.setItem('agam_user_phone', formattedPhone);
        localStorage.setItem('agam_user_authenticated', 'true');

        await saveFarmerProfile(formattedPhone, {
          phoneNumber: formattedPhone,
          preferredLanguage: currentLanguage,
        });

        onLoginSuccess(formattedPhone);
        return;
      }

      setErrorDetails({
        code: err?.code || 'auth/invalid-verification-code',
        message: err?.message || 'Invalid verification code. Please check and try again.',
        name: err?.name,
        hostname: currentHostname,
        origin: window.location.origin,
        stack: err?.stack,
        raw: fullErrorObj,
      });
    } finally {
      clearTimeout(delayedNoticeTimer);
      if (isMountedRef.current) {
        setIsLoading(false);
        setVerifyingDelayed(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background warm earthy shapes */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-[#e6ccb2]/30 rounded-full blur-3xl pointer-events-none -ml-16 -mt-16" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#d8f3dc]/40 rounded-full blur-3xl pointer-events-none -mr-16 -mb-16" />

      {/* Header with Back button */}
      <header className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToSplash}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#d5bdaf] text-xs font-semibold text-[#78350f] hover:bg-[#f5ebe0] transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Language</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1b4332] text-[#d8f3dc] flex items-center justify-center">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="font-black text-sm text-[#1b4332] tracking-tight">
            AGAM
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-md mx-auto w-full px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-[#d5bdaf] p-6 sm:p-8 shadow-sm">
          {/* Header Icon & Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#d8f3dc] text-[#1b4332] border border-[#b7e4c7] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              {step === 'phone' ? (
                <Phone className="w-7 h-7" />
              ) : (
                <KeyRound className="w-7 h-7 text-[#b45309]" />
              )}
            </div>
            <h1 className="text-2xl font-black text-[#1b4332] tracking-tight">
              {lang.loginTitle}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              {step === 'phone' 
                ? lang.loginSubtitle 
                : `Enter verification code sent to ${formatE164Phone(phoneNumber)}`}
            </p>
          </div>

          {/* Actionable Error Banner with Full Error Object Capture */}
          {errorDetails && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs shadow-2xs animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-rose-900 text-xs uppercase tracking-wide">
                      Firebase Auth Error
                    </span>
                    <span className="font-mono text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-200">
                      {errorDetails.code}
                    </span>
                  </div>

                  <p className="text-rose-900 font-semibold leading-relaxed">
                    {errorDetails.message}
                  </p>

                  {/* Origin & Authorized Domain Check Panel */}
                  <div className="p-2.5 bg-rose-100/60 border border-rose-200 rounded-lg text-[11px] space-y-1">
                    <div className="flex items-center justify-between font-bold text-rose-950">
                      <span>App Origin / Hostname:</span>
                      <button
                        type="button"
                        onClick={handleCopyDomain}
                        className="inline-flex items-center gap-1 text-[10px] text-[#2d6a4f] hover:underline cursor-pointer font-bold"
                      >
                        {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDomain ? 'Copied' : 'Copy Hostname'}</span>
                      </button>
                    </div>
                    <code className="block bg-white p-1.5 rounded font-mono text-[10px] text-stone-800 border border-rose-200 break-all select-all">
                      {currentHostname || window.location.hostname}
                    </code>
                    <p className="text-rose-800 text-[10px] leading-tight">
                      Must match <strong>Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized domains</strong>.
                    </p>
                  </div>

                  {/* Complete Raw Error Object Inspector */}
                  {errorDetails.raw && (
                    <details className="text-[11px] bg-white p-2.5 rounded-lg border border-rose-200" open>
                      <summary className="font-bold text-rose-950 cursor-pointer flex items-center justify-between hover:text-rose-800">
                        <span>Full Error Object:</span>
                        <span className="text-[10px] text-stone-500 font-normal">Expanded for debugging</span>
                      </summary>
                      <pre className="mt-1.5 p-2 bg-stone-900 text-emerald-400 rounded text-[10px] font-mono overflow-x-auto whitespace-pre-wrap max-h-48">
                        {JSON.stringify(errorDetails.raw, null, 2)}
                      </pre>
                    </details>
                  )}

                  {/* Reset Button inside error */}
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-200 hover:bg-rose-300 text-rose-900 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset &amp; Retry</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success / Status Notice */}
          {successNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">{successNotice}</span>
              </div>
            </div>
          )}

          {/* STEP 1: Phone Number Input Form */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {lang.phoneLabel}
                </label>
                <div className="relative flex rounded-xl border border-stone-300 focus-within:ring-2 focus-within:ring-[#2d6a4f] focus-within:border-[#2d6a4f] overflow-hidden bg-stone-50/50">
                  <span className="inline-flex items-center px-3.5 border-r border-stone-300 bg-stone-100 text-xs font-bold text-stone-700">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={lang.phonePlaceholder}
                    maxLength={14}
                    autoFocus
                    required
                    className="w-full px-3.5 py-3 text-sm font-semibold text-stone-900 placeholder-stone-400 bg-transparent focus:outline-none"
                  />
                </div>
                {/* Live demo text note */}
                <p className="text-xs text-stone-500 mt-2 font-medium">
                  For live demo: use +91 9840123456, OTP 123456
                </p>
              </div>

              {/* Dedicated container for Google RecaptchaVerifier */}
              <div className="my-1 flex flex-col items-center justify-center">
                <div 
                  id="recaptcha-container" 
                  className="min-h-[1px] w-full flex justify-center"
                />
                {!isRecaptchaReady && (
                  <span className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Initializing Google security verifier...
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <button
                  id="send-otp-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 border border-[#1b4332]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending SMS Code...</span>
                    </>
                  ) : (
                    <>
                      <span>{lang.sendOtpBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Cancel / Reset link if request is taking time */}
                {isLoading && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                    >
                      Taking too long? Click here to Cancel / Unlock
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    {lang.otpLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setErrorDetails(null);
                    }}
                    className="text-[11px] font-semibold text-[#b45309] hover:underline cursor-pointer"
                  >
                    {lang.changeNumber}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={lang.otpPlaceholder}
                    maxLength={6}
                    autoFocus
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-center tracking-[0.5em] font-mono font-bold text-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f] bg-stone-50/50"
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-stone-500">
                    Didn&apos;t receive code?
                  </span>
                  {resendTimer > 0 ? (
                    <span className="font-mono text-stone-400">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isLoading}
                      className="font-bold text-[#2d6a4f] hover:underline cursor-pointer"
                    >
                      {lang.resendOtp}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 border border-[#1b4332]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>{lang.verifyBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Visible small loading message update after 3 seconds of waiting */}
                {isLoading && verifyingDelayed && (
                  <p className="text-xs text-amber-700 text-center font-medium animate-in fade-in duration-200">
                    Still verifying, this may take a moment...
                  </p>
                )}

                {isLoading && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                    >
                      Cancel verification
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* Diagnostic Domain Info & Firebase Trust Marker */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col items-center gap-1.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2d6a4f]" />
              <span>Secured via Firebase Phone Authentication</span>
            </div>
            {currentHostname && (
              <div className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" />
                <span>Authorized Domain: {currentHostname}</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Earthy Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 text-center text-xs text-stone-500">
        AGAM Agriculture Management · Tamil Nadu &amp; Pan-India Telemetry
      </footer>
    </div>
  );
}
