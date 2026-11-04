import React from 'react';
import { useTranslation } from '../../services/i18n';
import { SupportedLanguage } from '../../types';
import { Activity, Shield, User, Globe, Phone, Search, Lock } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSearch: () => void;
  onBookAppointment: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSearch,
  onBookAppointment,
}) => {
  const { language, setLanguage, t } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm no-print">
      {/* Top emergency and notification ticker */}
      <div className="bg-hospital-navy text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-600 text-white animate-pulse">
              24/7 EMERGENCY
            </span>
            <span className="font-medium flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-teal-400" />
              Hotline: <strong className="text-amber-300">+231 88 091 1911</strong>
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-300">Tubman Blvd, Oldest Congo Town, Monrovia</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Switcher (#1) */}
            <div className="flex items-center space-x-1.5 bg-hospital-navy-light px-2.5 py-0.5 rounded border border-slate-700">
              <Globe className="w-3.5 h-3.5 text-teal-300" />
              <select
                aria-label="Select Language"
                value={language}
                onChange={handleLanguageChange}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="bg-slate-800 text-white">English (US/UK)</option>
                <option value="kol" className="bg-slate-800 text-white">Liberian Kolokwa</option>
                <option value="kpe" className="bg-slate-800 text-white">Kpelle (Kɔlɔ)</option>
                <option value="bas" className="bg-slate-800 text-white">Bassa (Bɔ̀ɖɔ̀)</option>
              </select>
            </div>

            {/* Global search shortcut hint */}
            <button
              onClick={onOpenSearch}
              title="Global Search (Ctrl+K)"
              className="hidden lg:flex items-center space-x-1 text-slate-300 hover:text-white text-xs bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 transition"
            >
              <Search className="w-3 h-3 text-teal-400" />
              <span>Search EMR</span>
              <kbd className="ml-1 px-1 bg-slate-700 text-[10px] rounded text-slate-300">Ctrl+K</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Hospital Logo & Brand */}
          <div
            onClick={() => setCurrentTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-hospital-navy tracking-tight">
                  J & J MEMORIAL
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  e-Hospital
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-700">
            <button
              onClick={() => setCurrentTab('home')}
              className={`transition hover:text-teal-600 ${currentTab === 'home' ? 'text-teal-600 font-bold' : ''}`}
            >
              {t('home')}
            </button>
            <button
              onClick={() => setCurrentTab('directory')}
              className={`transition hover:text-teal-600 ${currentTab === 'directory' ? 'text-teal-600 font-bold' : ''}`}
            >
              {t('findDoctor')}
            </button>
            <button
              onClick={() => setCurrentTab('facilities')}
              className={`transition hover:text-teal-600 ${currentTab === 'facilities' ? 'text-teal-600 font-bold' : ''}`}
            >
              {t('facilityLocator')}
            </button>
            <button
              onClick={() => setCurrentTab('news')}
              className={`transition hover:text-teal-600 ${currentTab === 'news' ? 'text-teal-600 font-bold' : ''}`}
            >
              {t('hospitalNews')}
            </button>
            <button
              onClick={() => setCurrentTab('faq')}
              className={`transition hover:text-teal-600 ${currentTab === 'faq' ? 'text-teal-600 font-bold' : ''}`}
            >
              {t('faq')}
            </button>
          </nav>

          {/* Right Action Portals */}
          <div className="flex items-center space-x-2.5">
            {/* Quick appointment CTA */}
            <button
              onClick={onBookAppointment}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition shadow-sm"
            >
              <span>{t('bookAppointment')}</span>
            </button>

            {/* Patient Portal Link */}
            <button
              onClick={() => setCurrentTab('patient-portal')}
              className={`inline-flex items-center space-x-1 px-3.5 py-2 text-xs font-bold rounded-lg transition shadow-sm ${
                currentTab === 'patient-portal'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5 text-teal-500" />
              <span>{t('patientPortal')}</span>
            </button>

            {/* Staff Workspace Link */}
            <button
              onClick={() => setCurrentTab('staff-workspace')}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition shadow-sm ${
                currentTab === 'staff-workspace'
                  ? 'bg-hospital-navy text-white ring-2 ring-teal-500'
                  : 'bg-hospital-navy text-white hover:bg-hospital-navy-light'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>{t('staffWorkspace')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
