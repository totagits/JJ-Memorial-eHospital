import React from 'react';
import { useTranslation } from '../../services/i18n';
import { ShieldCheck, HeartPulse, Video, Calendar, ArrowRight, Clock, Award, Users } from 'lucide-react';

interface HeroProps {
  onBookAppointment: () => void;
  onGoTelehealth: () => void;
  onExploreFacilities: () => void;
  onGoTriage: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onBookAppointment,
  onGoTelehealth,
  onExploreFacilities,
  onGoTriage,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-hospital-navy to-slate-900 text-white">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Liberia Ministry of Health Licensed Tertiary Care</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Modern Medicine, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400">
                Compassionate Care
              </span>{' '}
              for Liberia.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              J & J Memorial integrates leading clinical specialists, 24/7 digital emergency triage, 
              temperature-monitored blood banking, and seamless patient access from Monrovia to the counties.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onBookAppointment}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/30 transition transform hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4 stroke-[2.5]" />
                <span>{t('bookAppointment')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onGoTelehealth}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition"
              >
                <Video className="w-4 h-4 text-teal-400" />
                <span>{t('telehealth')}</span>
              </button>

              <button
                onClick={onExploreFacilities}
                className="inline-flex items-center space-x-2 px-4 py-3.5 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition"
              >
                <span>Find Closest Branch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trust Metrics Pill Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-white">24 / 7</div>
                  <div className="text-xs text-slate-400">Emergency & ICU</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-white">45+</div>
                  <div className="text-xs text-slate-400">Medical Specialists</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-white">100%</div>
                  <div className="text-xs text-slate-400">Cold-Chain Bank</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-white">99.2%</div>
                  <div className="text-xs text-slate-400">Patient Satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Rapid Triage & Emergency Status Widget */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    OPD & Triage Active Live
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Monrovia Campus</span>
              </div>

              <div className="space-y-4 pt-4">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-400">Average Triage Wait Time</span>
                    <div className="text-xl font-extrabold text-white">6 Minutes</div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Low Wait
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-400">Emergency Red Resuscitation Bay</span>
                    <div className="text-xl font-extrabold text-amber-300">Ready 24/7</div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Staffed
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-400">Blood Bank Universal (O-) Status</span>
                    <div className="text-xl font-extrabold text-white">In Stock (Cold Store A2)</div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Verified
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onGoTriage}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md"
                  >
                    View Live Triage Status & Waiting Times
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
