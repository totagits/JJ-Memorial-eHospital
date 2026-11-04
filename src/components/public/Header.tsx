import React, { useState } from 'react';
import { Lock, User, Cross } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSearch: () => void;
  onBookAppointment: () => void;
}

const NAV_ITEMS = [
  { label: 'Home', tab: 'home' },
  { label: 'About J & J', tab: 'about' },
  { label: 'Services & Specialties', tab: 'services' },
  { label: 'Find a Doctor', tab: 'directory' },
  { label: 'Patient Portal', tab: 'patient-portal' },
  { label: 'Health Guides', tab: 'news' },
  { label: 'Contact & Directions', tab: 'facilities' },
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSearch,
  onBookAppointment,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 no-print">
      {/* ── Tier 1: Emergency ticker strip ── */}
      <div className="bg-[#111827] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-y-1 gap-x-4">
          {/* Left cluster */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-semibold text-rose-400">
              🔴 EMERGENCY 24/7:{' '}
              <span className="text-white font-bold">+231 (0) 770-JJ-MEM</span>
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              📍 VOA East Community, Monrovia
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-300 flex items-center gap-1">
              ⚡ Grid &amp; 500kVA Power Backup{' '}
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
              <span className="text-green-400 font-semibold"> Active</span>
            </span>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-x-4">
            <button
              onClick={() => setCurrentTab('patient-portal')}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition"
            >
              <User className="w-3 h-3 text-teal-400" />
              <span>Patient Portal Sign-In</span>
            </button>
            <button
              onClick={() => setCurrentTab('staff-workspace')}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition"
            >
              <Lock className="w-3 h-3 text-teal-400" />
              <span>Staff Login (/staff)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tier 2: Main navigation bar ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            {/* Brand / Logo */}
            <button
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-3 shrink-0 group"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow group-hover:bg-teal-500 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M11 2v7H4v2h7v7h2v-7h7v-2h-7V2h-2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-extrabold text-base text-slate-900 leading-tight">
                  J &amp; J Memorial{' '}
                  <span className="text-teal-600">e-Hospital</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight">
                  Connected Care, Intelligent Operations
                </div>
              </div>
            </button>

            {/* Centre nav (desktop) */}
            <nav className="hidden lg:flex items-center gap-5 text-[13px] font-semibold text-slate-700 flex-1 justify-center">
              {NAV_ITEMS.map(({ label, tab }) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`relative pb-0.5 transition hover:text-teal-600 whitespace-nowrap
                    ${
                      currentTab === tab
                        ? 'text-teal-600 after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-teal-500 after:rounded-full'
                        : ''
                    }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Right: Book Appointment CTA */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onBookAppointment}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold transition shadow-sm"
              >
                Book Appointment
              </button>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {mobileOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pb-4 space-y-1">
            {NAV_ITEMS.map(({ label, tab }) => (
              <button
                key={tab}
                onClick={() => {
                  setCurrentTab(tab);
                  setMobileOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition
                  ${
                    currentTab === tab
                      ? 'bg-teal-50 text-teal-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => {
                onBookAppointment();
                setMobileOpen(false);
              }}
              className="w-full mt-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold transition"
            >
              Book Appointment
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
