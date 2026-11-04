import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { ActivityFeedItem } from '../../types';
import { Radio, Clock, User, HeartPulse, FlaskConical, Pill, Receipt, Scan, ShieldAlert } from 'lucide-react';

export const ActivityFeed: React.FC = () => {
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [filterType, setFilterType] = useState<string>('All');

  useEffect(() => {
    const update = () => {
      setFeed(dbStore.getActivityFeed());
    };
    update();
    return dbStore.subscribe(update);
  }, []);

  const types = ['All', 'Triage', 'Lab', 'Pharmacy', 'Registration', 'Billing', 'Radiology'];

  const filteredFeed = filterType === 'All'
    ? feed
    : feed.filter((item) => item.type === filterType);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <Radio className="w-5 h-5 text-teal-600" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div>
            <h3 className="font-extrabold text-hospital-navy text-base">
              Real-Time Hospital Activity Stream
            </h3>
            <p className="text-xs text-slate-500">
              Live updates across triage, registrations, lab releases, and dispensary events.
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                filterType === t
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Stream */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredFeed.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border transition flex items-start space-x-3 ${
              item.urgency === 'critical'
                ? 'bg-rose-50 border-rose-300'
                : item.urgency === 'urgent'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-slate-50/70 border-slate-200 hover:bg-white'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                item.type === 'Triage'
                  ? 'bg-rose-100 text-rose-700'
                  : item.type === 'Lab'
                  ? 'bg-purple-100 text-purple-700'
                  : item.type === 'Pharmacy'
                  ? 'bg-cyan-100 text-cyan-700'
                  : item.type === 'Billing'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {item.type === 'Triage' && <HeartPulse className="w-4 h-4" />}
              {item.type === 'Lab' && <FlaskConical className="w-4 h-4" />}
              {item.type === 'Pharmacy' && <Pill className="w-4 h-4" />}
              {item.type === 'Billing' && <Receipt className="w-4 h-4" />}
              {item.type === 'Registration' && <User className="w-4 h-4" />}
              {item.type === 'Radiology' && <Scan className="w-4 h-4" />}
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  {item.actor}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {item.timestamp}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-snug">
                {item.description}
              </p>

              {item.patientMrn && (
                <span className="inline-block mt-1 text-[10px] font-mono font-bold text-teal-800 bg-teal-100/60 px-1.5 py-0.2 rounded">
                  MRN: {item.patientMrn}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
