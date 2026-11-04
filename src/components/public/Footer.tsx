import React from 'react';
import { Lock } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  onOpenSearch: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, onOpenSearch }) => {
  return (
    <footer className="bg-[#0d1117] text-slate-300 no-print">
      {/* Main columns */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-slate-800">

          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-lg text-white">J &amp; J Memorial</span>
              <span className="text-xs font-bold text-teal-400 bg-teal-900/60 border border-teal-700 px-2 py-0.5 rounded">
                e-Hospital
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Connected Care, Intelligent Operations. Providing dignified, technologically advanced,
              and clinically validated healthcare to individuals and families across Liberia.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-semibold">
              <span>✓</span>
              <span>Liberian MOH HMIS Framework Aligned</span>
            </div>
          </div>

          {/* Column 2: Patient Care */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-teal-400">
              Patient Care
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Outpatient & Specialist Clinics', tab: 'home' },
                { label: 'Find Attending Physicians', tab: 'directory' },
                { label: 'Secure Patient Portal Login', tab: 'patient-portal' },
                { label: 'Public Health Resources', tab: 'news' },
                { label: 'Clinical Safety & Governance', tab: 'home' },
              ].map(({ label, tab }) => (
                <li key={label}>
                  <button
                    onClick={() => setCurrentTab(tab)}
                    className="text-slate-400 hover:text-white transition text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Hours */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-teal-400">
              Hospital Hours &amp; Access
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="space-y-0.5">
                <div className="text-slate-500 text-xs">🕐 Emergency &amp; Inpatient</div>
                <div className="text-white font-semibold">24 Hours / 7 Days</div>
              </li>
              <li className="space-y-0.5">
                <div className="text-slate-500 text-xs">🕐 Outpatient Consultations</div>
                <div className="text-white font-semibold">Mon – Sat: 8:00 AM – 5:00 PM</div>
              </li>
              <li className="space-y-0.5">
                <div className="text-slate-500 text-xs">🕐 Diagnostic Lab &amp; Pharmacy</div>
                <div className="text-white font-semibold">24 Hours</div>
              </li>
            </ul>
          </div>

          {/* Column 4: Location & Contacts */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-teal-400">
              Location &amp; Contacts
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="text-slate-400 leading-relaxed">
                📍 VOA East Community, Monrovia, Montserrado County, Liberia
              </li>
              <li>
                <a
                  href="tel:+231770JJMEM"
                  className="text-teal-400 font-semibold hover:text-teal-300 transition"
                >
                  📞 +231 (0) 770-JJ-MEM
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@jjmemorial.totag.network"
                  className="text-slate-400 hover:text-white transition break-all"
                >
                  ✉ contact@jjmemorial.totag.network
                </a>
              </li>
            </ul>
            <button
              onClick={() => setCurrentTab('staff-workspace')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition w-full"
            >
              <Lock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              Authorized Staff Workspace (/staff)
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
          <div className="leading-relaxed">
            © 2026 J &amp; J Memorial e-Hospital. All rights reserved. Technology partner:{' '}
            <span className="text-slate-500">TOTAG IT Services / TOTAG GROUP OF COMPANIES LTD.</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'Staging: jjmemorial-staging.totag.network',
              'Dual USD/LRD Financial Engine',
              'Zero Real PHI in Non-Production',
            ].map((pill) => (
              <span
                key={pill}
                className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-medium"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
