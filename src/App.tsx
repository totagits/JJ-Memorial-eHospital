import React, { useState } from 'react';
import { I18nProvider } from './services/i18n';
import { useGlobalKeyboardShortcuts } from './services/keyboardShortcuts';
import { biometricAuthService } from './services/biometrics';
import { Header } from './components/public/Header';
import { Hero } from './components/public/Hero';
import { PatientTestimonials } from './components/public/PatientTestimonials';
import { FacilityLocator } from './components/public/FacilityLocator';
import { HospitalNews } from './components/public/HospitalNews';
import { StaffDirectory } from './components/public/StaffDirectory';
import { Partnerships } from './components/public/Partnerships';
import { FAQ } from './components/public/FAQ';
import { Footer } from './components/public/Footer';
import { ServicesSpecialties } from './components/public/ServicesSpecialties';
import { EnterpriseDifference } from './components/public/EnterpriseDifference';
import { CTABanner } from './components/public/CTABanner';
import { PublicAppointmentModal } from './components/public/PublicAppointmentModal';
import { PatientPortal } from './components/patient/PatientPortal';
import { StaffWorkspace } from './components/staff/StaffWorkspace';
import { GlobalSearchBar } from './components/staff/GlobalSearchBar';
import { Command, Keyboard, X } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<
    'home' | 'directory' | 'facilities' | 'news' | 'faq' | 'patient-portal' | 'staff-workspace'
  >('home');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isHelpShortcutsOpen, setIsHelpShortcutsOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState('');
  const [selectedSpecialtyForBooking, setSelectedSpecialtyForBooking] = useState('');

  // Global Keyboard Shortcuts (#21)
  useGlobalKeyboardShortcuts({
    onOpenSearch: () => setIsSearchOpen(true),
    onGoStaff: () => setCurrentTab('staff-workspace'),
    onGoPatient: () => setCurrentTab('patient-portal'),
    onGoHome: () => setCurrentTab('home'),
    onLockTerminal: () => biometricAuthService.lock(),
    onToggleHelp: () => setIsHelpShortcutsOpen((prev) => !prev),
    onEscape: () => {
      setIsSearchOpen(false);
      setIsAppointmentOpen(false);
      setIsHelpShortcutsOpen(false);
    },
  });

  const handleOpenBooking = (doctor: string = '', specialty: string = '') => {
    setSelectedDoctorForBooking(doctor);
    setSelectedSpecialtyForBooking(specialty);
    setIsAppointmentOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* If in Staff Workspace or Patient Portal, render their dedicated shells */}
      {currentTab === 'staff-workspace' ? (
        <StaffWorkspace
          onGoHome={() => setCurrentTab('home')}
          onGoPatient={() => setCurrentTab('patient-portal')}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
        />
      ) : currentTab === 'patient-portal' ? (
        <PatientPortal
          onGoHome={() => setCurrentTab('home')}
          onGoStaff={() => setCurrentTab('staff-workspace')}
        />
      ) : (
        /* Public Hospital Website */
        <div className="flex-1 flex flex-col">
          <Header
            currentTab={currentTab}
            setCurrentTab={(tab) => setCurrentTab(tab as any)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onBookAppointment={() => handleOpenBooking()}
          />

          <main className="flex-1">
            {currentTab === 'home' && (
              <>
                <Hero
                  onBookAppointment={() => handleOpenBooking()}
                  onGoTelehealth={() => setCurrentTab('patient-portal')}
                  onExploreFacilities={() => setCurrentTab('facilities')}
                  onGoTriage={() => setCurrentTab('staff-workspace')}
                />
                <ServicesSpecialties />
                <EnterpriseDifference />
                <PatientTestimonials
                  onLeaveFeedback={() => setCurrentTab('patient-portal')}
                />
                <FacilityLocator />
                <HospitalNews />
                <StaffDirectory
                  onBookWithDoctor={(doc, spec) => handleOpenBooking(doc, spec)}
                />
                <Partnerships />
                <FAQ />
                <CTABanner
                  onBookAppointment={() => handleOpenBooking()}
                  onGoPatientPortal={() => setCurrentTab('patient-portal')}
                />
              </>
            )}

            {currentTab === 'directory' && (
              <StaffDirectory
                onBookWithDoctor={(doc, spec) => handleOpenBooking(doc, spec)}
              />
            )}

            {currentTab === 'facilities' && <FacilityLocator />}

            {currentTab === 'news' && <HospitalNews />}

            {currentTab === 'faq' && <FAQ />}
          </main>

          <Footer
            setCurrentTab={(tab) => setCurrentTab(tab as any)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        </div>
      )}

      {/* Appointment Modal */}
      <PublicAppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        preselectedDoctor={selectedDoctorForBooking}
        preselectedSpecialty={selectedSpecialtyForBooking}
      />

      {/* Global EMR Search Modal (#8, #21) */}
      <GlobalSearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPatient={(p) => {
          setCurrentTab('staff-workspace');
          alert(`Selected Patient: ${p.name} (${p.mrn}). Opening EMR Chart.`);
        }}
      />

      {/* Keyboard Shortcuts Help Modal (#21) */}
      {isHelpShortcutsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setIsHelpShortcutsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <Keyboard className="w-5 h-5 text-teal-600" />
              <h3 className="font-extrabold text-hospital-navy text-base">
                Global Keyboard Shortcuts
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Quick Patient Search (EMR)</span>
                <kbd className="px-2 py-0.5 font-mono bg-white border border-slate-300 rounded font-bold">
                  Ctrl + K
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Toggle Staff Workspace</span>
                <kbd className="px-2 py-0.5 font-mono bg-white border border-slate-300 rounded font-bold">
                  Ctrl + Shift + S
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Toggle Patient Portal</span>
                <kbd className="px-2 py-0.5 font-mono bg-white border border-slate-300 rounded font-bold">
                  Ctrl + Shift + P
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Return to Public Home</span>
                <kbd className="px-2 py-0.5 font-mono bg-white border border-slate-300 rounded font-bold">
                  Ctrl + Shift + H
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Lock Terminal (Biometrics)</span>
                <kbd className="px-2 py-0.5 font-mono bg-white border border-slate-300 rounded font-bold">
                  Ctrl + Shift + L
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Close Modal / Esc</span>
                <kbd className="px-2 py-0.5 font-mono bg-white border border-slate-300 rounded font-bold">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
