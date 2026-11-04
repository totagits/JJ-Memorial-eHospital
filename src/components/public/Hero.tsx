import React from 'react';
import { ArrowRight } from 'lucide-react';

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
  return (
    <section className="bg-[#0d1117] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">

          {/* ── Left column (60%) ── */}
          <div className="lg:col-span-3 space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/50 text-green-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Full-Service e-Hospital &amp; Advanced Clinical Center · Monrovia
            </div>

            {/* H1 */}
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
              <span className="text-white">Connected Care,</span>
              <br />
              <span className="text-teal-400">Intelligent Operations.</span>
            </h1>

            {/* Body */}
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
              J &amp; J Memorial combines certified medical specialists with modern digital health
              records, diagnostic precision, 24/7 power resilience, and seamless patient care from
              outpatient consultation to recovery.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={onBookAppointment}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition shadow-lg shadow-teal-900/40"
              >
                Book Doctor Appointment
              </button>

              <button
                onClick={onGoTelehealth}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-600 hover:border-slate-400 text-white font-semibold text-sm transition"
              >
                Patient Portal Login
              </button>

              <button
                onClick={onExploreFacilities}
                className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-semibold text-sm transition"
              >
                Find a Doctor <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-info row */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 pt-2">
              <span>📞 24/7 Acute Triage: <span className="text-slate-300 font-medium">+231 (0) 770-JJ-MEM</span></span>
              <span>⚡ Uninterrupted Power: <span className="text-slate-300 font-medium">500kVA Cummins + Solar Grid</span></span>
            </div>
          </div>

          {/* ── Right column (40%): Operational Status card ── */}
          <div className="lg:col-span-2">
            <div className="bg-[#1f2937] rounded-2xl p-5 border border-slate-700/60 shadow-2xl space-y-4">
              {/* Card header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-700">
                <div>
                  <div className="text-white font-bold text-sm">Hospital Operational Status</div>
                  <div className="text-slate-400 text-xs mt-0.5">Live Clinical &amp; Facility Monitoring</div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/40 text-green-400 text-[11px] font-semibold shrink-0 ml-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  All Services Active
                </span>
              </div>

              {/* 2×2 grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Outpatient */}
                <div className="bg-[#111827] rounded-xl p-3.5 space-y-1">
                  <div className="text-slate-400 text-[11px] font-medium">Outpatient Clinics</div>
                  <div className="text-white font-bold text-base">Open</div>
                  <div className="text-slate-500 text-[11px]">Average wait &lt; 15 mins</div>
                </div>

                {/* Emergency */}
                <div className="bg-[#111827] rounded-xl p-3.5 space-y-1">
                  <div className="text-slate-400 text-[11px] font-medium">Emergency Department</div>
                  <div className="text-teal-400 font-bold text-base">24/7 Active</div>
                  <div className="text-slate-500 text-[11px]">Triage nurses on station</div>
                </div>

                {/* Lab */}
                <div className="bg-[#111827] rounded-xl p-3.5 space-y-1">
                  <div className="text-slate-400 text-[11px] font-medium">Diagnostic Laboratory</div>
                  <div className="text-white font-bold text-base">Full Panels</div>
                  <div className="text-slate-500 text-[11px]">Automated 5-part hematology</div>
                </div>

                {/* Pharmacy */}
                <div className="bg-[#111827] rounded-xl p-3.5 space-y-1">
                  <div className="text-slate-400 text-[11px] font-medium">Pharmacy Dispensary</div>
                  <div className="text-white font-bold text-base">FEFO Stocked</div>
                  <div className="text-slate-500 text-[11px]">Quality verified drugs</div>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={onGoTriage}
                className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-sm transition"
              >
                Request Consultation Slot
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
