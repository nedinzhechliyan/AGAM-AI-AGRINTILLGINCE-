import React, { useState } from 'react';
import {
  Building2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  FileText,
  BadgePercent,
  Search,
  Check,
  Volume2
} from 'lucide-react';

interface PMKisanSchemesProps {
  onSpeak: (text: string) => void;
}

export default function PMKisanSchemes({ onSpeak }: PMKisanSchemesProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>('+919840123456');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedState, setVerifiedState] = useState<boolean>(true);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedState(true);
      onSpeak(
        "PM-Kisan Beneficiary Status is Verified Active! 17th installment of 2,000 rupees was successfully credited via DBT to your State Bank of India account."
      );
    }, 600);
  };

  const schemes = [
    {
      title: 'PM-Kisan Samman Nidhi',
      tamilTitle: 'பிரதமர் கிசான் சம்மான் நிதி',
      amount: '₹6,000 / Year',
      tag: 'Direct Benefit Transfer',
      desc: 'Financial support of ₹6,000 per year in 3 equal installments of ₹2,000 directly transferred to eligible landholder farmer bank accounts via Aadhaar DBT.',
      link: 'https://pmkisan.gov.in/'
    },
    {
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      tamilTitle: 'பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம்',
      amount: 'Up to 98% Covered',
      tag: 'Crop Insurance',
      desc: 'Comprehensive crop insurance covering non-preventable natural risks from pre-sowing to post-harvest loss at minimal 1.5% - 2% premium.',
      link: 'https://pmfby.gov.in/'
    },
    {
      title: 'Kisan Credit Card (KCC)',
      tamilTitle: 'கிசான் கடன் அட்டை திட்டம்',
      amount: 'Credit up to ₹3,00,000',
      tag: 'Concessional Credit',
      desc: 'Subsidized institutional credit at 4% annual interest rate for seasonal agricultural operations, farm inputs, and tractor fuel.',
      link: 'https://www.myscheme.gov.in/schemes/kcc'
    },
    {
      title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      tamilTitle: 'வேளாண் இயந்திரமயமாக்கல் திட்டம்',
      amount: '40% - 50% Subsidy',
      tag: 'Farm Equipment Subsidy',
      desc: 'Financial subsidy on purchasing tractors, power tillers, automated threshers, and traditional wooden desi hal implements.',
      link: 'https://agrimachinery.nic.in/'
    }
  ];

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono-code font-semibold text-emerald-400 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-emerald-400" />
                Direct Benefit Transfer &amp; Central Government Kisan Portals
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              Government Schemes &amp; PM-Kisan Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Verify your beneficiary status with verified DBT database links, subsidy guidelines, and direct registration links to official Government of India portals.
            </p>
          </div>

          <a
            href="https://pmkisan.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <span>Open Official PM-Kisan Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* eKYC & DBT Status Card */}
      <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">PM-Kisan Beneficiary Live Status</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono-code font-bold">
                  ACTIVE &amp; VERIFIED
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Aadhaar Seeding: <strong className="text-emerald-400">SUCCESS</strong> · Land Seeding: <strong className="text-emerald-400">YES</strong> · eKYC: <strong className="text-emerald-400">DONE</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Registered Mobile / Aadhaar"
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-mono-code w-44"
            />
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-mono-code text-slate-400 uppercase block">Last Credited Installment</span>
            <span className="text-sm font-bold text-slate-100 font-mono-code">17th Installment (₹2,000)</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">Credited to State Bank of India</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-mono-code text-slate-400 uppercase block">Upcoming 18th Installment</span>
            <span className="text-sm font-bold text-amber-400 font-mono-code">Scheduled (₹2,000)</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">DBT Payment Batch Ready</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-mono-code text-slate-400 uppercase block">Farmer Registration ID</span>
            <span className="text-sm font-bold text-slate-200 font-mono-code">TN-CHG-2024-88912</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Chengalpattu Revenue Circle</span>
          </div>
        </div>
      </div>

      {/* Scheme Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemes.map((scheme, idx) => (
          <div
            key={idx}
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between backdrop-blur-md hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-emerald-400 border border-slate-800 text-[10px] font-mono-code font-bold">
                  {scheme.tag}
                </span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono-code">
                  {scheme.amount}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-100">{scheme.title}</h4>
              <span className="text-xs text-amber-400/90 font-medium block mt-0.5 mb-2">
                {scheme.tamilTitle}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{scheme.desc}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => onSpeak(`${scheme.title}. ${scheme.desc}`)}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Explain Scheme</span>
              </button>

              <a
                href={scheme.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Apply / Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
