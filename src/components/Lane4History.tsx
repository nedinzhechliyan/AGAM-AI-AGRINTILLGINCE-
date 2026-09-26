/**
 * Lane 4 — "My Farm History": everything the farmer did with AGAM.
 * Voice queries, advisories, disease scans, scheme views, land edits —
 * persisted in localStorage + Firestore, newest first.
 */
import React, { useEffect, useState } from 'react';
import {
  History, Mic, Scan, Landmark, MapPin, RefreshCw, Sparkles, MessageCircle, ClipboardList, Leaf,
} from 'lucide-react';
import { FarmerLandProfile } from '../services/firebase';
import { fetchFarmerActivities } from '../services/activityLog';
import { FarmerActivity } from '../types';
import { soundkit } from '../services/soundkit';

interface Lane4HistoryProps {
  farmerId: string;
  profile: FarmerLandProfile | null;
  refreshKey: number; // bump to re-fetch when new activities land
}

const ACTIVITY_STYLE: Record<FarmerActivity['type'], { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  profile_created: { icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-amber-300', bg: 'bg-amber-950/50 border-amber-500/40', label: 'Farm Registered' },
  profile_updated: { icon: <MapPin className="w-3.5 h-3.5" />, color: 'text-sky-300', bg: 'bg-sky-950/50 border-sky-500/40', label: 'Land Updated' },
  voice_query: { icon: <Mic className="w-3.5 h-3.5" />, color: 'text-violet-300', bg: 'bg-violet-950/50 border-violet-500/40', label: 'Voice Query' },
  advisory: { icon: <ClipboardList className="w-3.5 h-3.5" />, color: 'text-emerald-300', bg: 'bg-emerald-950/50 border-emerald-500/40', label: 'Advisory Given' },
  disease_scan: { icon: <Scan className="w-3.5 h-3.5" />, color: 'text-rose-300', bg: 'bg-rose-950/50 border-rose-500/40', label: 'Disease Scan' },
  scheme_view: { icon: <Landmark className="w-3.5 h-3.5" />, color: 'text-orange-300', bg: 'bg-orange-950/50 border-orange-500/40', label: 'Scheme Explored' },
  land_selected: { icon: <Leaf className="w-3.5 h-3.5" />, color: 'text-teal-300', bg: 'bg-teal-950/50 border-teal-500/40', label: 'District Fetched' },
};

export function Lane4History({ farmerId, profile, refreshKey }: Lane4HistoryProps) {
  const [activities, setActivities] = useState<FarmerActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchFarmerActivities(farmerId).then((list) => {
      if (mounted) {
        setActivities(list);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [farmerId, refreshKey]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            My Farm History
          </h2>
          <button
            onClick={() => { soundkit.play('buttonTap'); setIsLoading(true); fetchFarmerActivities(farmerId).then((l) => { setActivities(l); setIsLoading(false); }); }}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:text-emerald-300 transition cursor-pointer"
            title="Refresh timeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          {profile
            ? `${profile.districtName} · ${profile.landSizeAcres} acres — every step AGAM walked with you.`
            : 'Every step AGAM walked with you.'}
        </p>

        {isLoading ? (
          <div className="py-10 flex justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-2 text-slate-500">
            <MessageCircle className="w-8 h-8" />
            <span className="text-xs font-mono-code">No history yet — talk to the mascot or fetch a district!</span>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline spine */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-800 rounded-full" />
            <div className="space-y-3">
              {activities.map((a) => {
                const style = ACTIVITY_STYLE[a.type] || ACTIVITY_STYLE.advisory;
                const when = new Date(a.createdAt);
                const whenStr = isNaN(when.getTime())
                  ? ''
                  : when.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={a.id} className="relative flex items-start gap-3 pl-0">
                    <div className={`z-10 w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[11px] font-black uppercase tracking-wider ${style.color}`}>{style.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{whenStr}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">{a.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{a.detail}</p>
                      {a.districtName && (
                        <span className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-emerald-300 font-semibold">
                          <MapPin className="w-2.5 h-2.5" /> {a.districtName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
