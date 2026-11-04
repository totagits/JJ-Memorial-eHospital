import React from 'react';
import { Phone, Mail, MapPin, Shield, Clock, Heart, Award, CheckCircle } from 'lucide-react';

interface PublicFooterProps {
  onNavigate: (tab: string) => void;
  onSwitchToStaff: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate, onSwitchToStaff }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Brand & Mission */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-extrabold text-white text-xl tracking-tight">J & J Memorial</span>
            <span className="text-xs font-semibold text-teal-300 bg-teal-950 border border-teal-800 px-2 py-0.5 rounded">
              e-Hospital
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            Connected Care, Intelligent Operations. Providing dignified, technologically advanced, and clinically validated healthcare to individuals and families across Liberia.
          </p>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Liberian MOH HMIS Framework Aligned</span>
          </div>
        </div>

        {/* Quick Patient Links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">Patient Care</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <button onClick={() => onNavigate('services')} className="hover:text-teal-300 transition-colors">
                Outpatient & Specialist Clinics
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('doctors')} className="hover:text-teal-300 transition-colors">
                Find Attending Physicians
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('portal')} className="hover:text-teal-300 transition-colors">
                Secure Patient Portal Login
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('health')} className="hover:text-teal-300 transition-colors">
                Public Health Resources
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-teal-300 transition-colors">
                Clinical Safety & Governance
              </button>
            </li>
          </ul>
        </div>

        {/* Emergency & Hours */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">Hospital Hours & Access</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-white font-medium">Emergency & Inpatient:</span> 24 Hours / 7 Days
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-white font-medium">Outpatient Consultations:</span> Mon – Sat: 8:00 AM – 5:00 PM
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-white font-medium">Diagnostic Lab & Pharmacy:</span> 24 Hours
              </div>
            </li>
          </ul>
        </div>

        {/* Physical Address & Staff Entry */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">Location & Contacts</h4>
          <div className="space-y-2 text-sm text-slate-400">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <span>VOA East Community, Monrovia, Montserrado County, Liberia</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-rose-300 font-semibold">+231 (0) 770-JJ-MEM</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>contact@jjmemorial.totag.network</span>
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              onClick={onSwitchToStaff}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded text-xs border border-slate-800 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>Authorized Staff Workspace (/staff)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legal & TOTAG Infrastructure Attribution */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-900 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          © 2026 J & J Memorial e-Hospital. All rights reserved. Technology partner: <span className="text-slate-400 font-semibold">TOTAG IT Services / TOTAG GROUP OF COMPANIES LTD</span>.
        </div>
        <div className="flex items-center gap-4">
          <span>Staging: jjmemorial-staging.totag.network</span>
          <span>·</span>
          <span>Dual USD/LRD Financial Engine</span>
          <span>·</span>
          <span>Zero Real PHI in Non-Production</span>
        </div>
      </div>
    </footer>
  );
};
