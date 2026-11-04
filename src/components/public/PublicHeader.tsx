import React from 'react';
import { Phone, Shield, Calendar, User, Clock, MapPin, Activity, Stethoscope, Globe } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../services/i18nService';

interface PublicHeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAppointmentModal: () => void;
  onSwitchToStaff: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenAppointmentModal,
  onSwitchToStaff,
}) => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Clinical & Emergency Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold tracking-wide">
              <Phone className="w-3.5 h-3.5 animate-pulse" />
              {t('emergency.hotline', 'EMERGENCY 24/7: +231 (0) 770-JJ-MEM')}
            </span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              VOA East Community, Monrovia
            </span>
            <span className="hidden md:inline text-slate-500">·</span>
            <span className="hidden md:flex items-center gap-1.5 text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              {t('emergency.power', 'Grid & 500kVA Power Backup Active')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Liberian Multilingual Switcher */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px]">
              <Globe className="w-3 h-3 text-teal-400" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-hidden cursor-pointer font-medium"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onNavigate('portal')}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-teal-400" />
              {t('nav.portal', 'Patient Portal')}
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={onSwitchToStaff}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
              title="Secure Staff & Clinical Workspace"
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Staff Login (/staff)
            </button>
          </div>
        </div>
      </div>

      {/* Main Hospital Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-800 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-900 transition-colors">
            <Stethoscope className="w-6 h-6 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">J & J Memorial</span>
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                e-Hospital
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">Connected Care, Intelligent Operations</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors hover:text-teal-800 py-1 ${
              currentTab === 'home' ? 'text-teal-800 border-b-2 border-teal-700 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`transition-colors hover:text-teal-800 py-1 ${
              currentTab === 'about' ? 'text-teal-800 border-b-2 border-teal-700 font-semibold' : ''
            }`}
          >
            About J & J
          </button>
          <button
            onClick={() => onNavigate('services')}
            className={`transition-colors hover:text-teal-800 py-1 ${
              currentTab === 'services' ? 'text-teal-800 border-b-2 border-teal-700 font-semibold' : ''
            }`}
          >
            Services & Specialties
          </button>
          <button
            onClick={() => onNavigate('staff-directory')}
            className={`transition-colors hover:text-teal-800 py-1 ${
              currentTab === 'staff-directory' || currentTab === 'doctors' ? 'text-teal-800 border-b-2 border-teal-700 font-semibold' : ''
            }`}
          >
            Staff Directory
          </button>
          <button
            onClick={() => onNavigate('portal')}
            className={`transition-colors hover:text-teal-800 py-1 ${
              currentTab === 'portal' ? 'text-teal-800 border-b-2 border-teal-700 font-semibold' : ''
            }`}
          >
            Patient Portal
          </button>
          <button
            onClick={() => onNavigate('health')}
            className={`transition-colors hover:text-teal-800 py-1 ${
              currentTab === 'health' ? 'text-teal-800 border-b-2 border-teal-700 font-semibold' : ''
            }`}
          >
            Health Guides
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className={`transition-colors hover:text-teal-800 py-1 ${
              currentTab === 'contact' ? 'text-teal-800 border-b-2 border-teal-700 font-semibold' : ''
            }`}
          >
            Contact & Directions
          </button>
        </nav>

        {/* Appointment CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAppointmentModal}
            className="inline-flex items-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs md:text-sm px-4 py-2.5 rounded-lg shadow-xs transition-colors"
          >
            <Calendar className="w-4 h-4 text-teal-200" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    </header>
  );
};
