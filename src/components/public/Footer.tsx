import React from 'react';
import { useTranslation } from '../../services/i18n';
import { Activity, MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  onOpenSearch: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, onOpenSearch }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-hospital-navy text-slate-300 pt-16 pb-12 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Hospital Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">
                  J & J MEMORIAL
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800 ml-2">
                  e-Hospital
                </span>
                <p className="text-xs text-slate-400 mt-0.5">{t('tagline')}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Committed to clinical excellence, patient-centered dignity, and operational transparency across the Republic of Liberia. Operating 24/7 emergency, surgical, maternal, laboratory, and pharmacy services.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Tubman Blvd, Oldest Congo Town, Monrovia, Liberia</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>24/7 Hotline: +231 88 091 1911 / +231 77 900 1122</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>care@jjmemorial.totag.network</span>
              </div>
            </div>
          </div>

          {/* Col 3: Patient Care Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Patient Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('patient-portal')} className="hover:text-white transition">
                  Patient Portal Login
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('directory')} className="hover:text-white transition">
                  Find a Doctor
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('facilities')} className="hover:text-white transition">
                  Branch Locations & Hours
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('patient-portal')} className="hover:text-white transition">
                  Digital Consent Forms
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('patient-portal')} className="hover:text-white transition">
                  Log Daily Vitals (Recharts)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Clinical & ERP Operations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Hospital Operations
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('staff-workspace')} className="hover:text-white transition">
                  Staff Workspace Login
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('staff-workspace')} className="hover:text-white transition">
                  OPD Triage Station
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('staff-workspace')} className="hover:text-white transition">
                  Blood Bank Cold-Chain
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('staff-workspace')} className="hover:text-white transition">
                  Pharmacy Dispensary & QR
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('staff-workspace')} className="hover:text-white transition">
                  Radiology Medical Viewer
                </button>
              </li>
              <li>
                <button onClick={onOpenSearch} className="hover:text-white transition">
                  Global EMR Search (Ctrl+K)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Accreditations & Quality */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Governance & Quality
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Licensed by the Ministry of Health, Republic of Liberia. Operating under WHO digital health standards and strict patient privacy regulations.
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Technology Partner</span>
              <div className="text-xs font-bold text-white">TOTAG GROUP OF COMPANIES LTD</div>
              <span className="text-[10px] text-teal-400">totag.network</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} J & J Memorial Health Center. All rights reserved. Staging Build.
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <span>Built with precision for healthcare resilience in Liberia</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
