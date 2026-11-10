import React, { useState, useEffect } from 'react';
import { PublicHeader } from './components/public/PublicHeader';
import { PublicFooter } from './components/public/PublicFooter';
import { HomePage } from './components/public/HomePage';
import { AboutPage } from './components/public/AboutPage';
import { ServicesPage } from './components/public/ServicesPage';
import { DoctorsPage } from './components/public/DoctorsPage';
import { StaffDirectoryPage } from './components/public/StaffDirectoryPage';
import { PatientPortalView } from './components/public/PatientPortalView';
import { HealthResourcesPage } from './components/public/HealthResourcesPage';
import { ContactPage } from './components/public/ContactPage';
import { AppointmentBookingModal } from './components/public/AppointmentBookingModal';
import { StaffWorkspace } from './components/staff/StaffWorkspace';
import { subscribeDatabase, getDatabaseState } from './services/storageService';
import { I18nProvider } from './services/i18nService';
import { useRBAC } from './hooks/useRBAC';

export default function App() {
  const [viewMode, setViewMode] = useState<'public' | 'staff'>('public');
  const [publicTab, setPublicTab] = useState<string>('home');
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedClinicianId, setSelectedClinicianId] = useState<string | undefined>(undefined);
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
  const { currentUser, switchUser } = useRBAC();

  const handleOpenAppointmentModal = (clinicianId?: string, department?: string) => {
    setSelectedClinicianId(clinicianId);
    setSelectedDepartment(department);
    setIsAppointmentModalOpen(true);
  };

  // Synchronize state with persistent database changes
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = subscribeDatabase(() => {
      setTick(t => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // Global keyboard shortcuts (Alt+S to toggle staff workspace, Alt+P for portal)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setViewMode(v => (v === 'public' ? 'staff' : 'public'));
      } else if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setViewMode('public');
        setPublicTab('portal');
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Check URL query or hash for direct navigation to staff or portal
  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#staff') {
      setViewMode('staff');
    } else if (hash === '#portal') {
      setViewMode('public');
      setPublicTab('portal');
    }
  }, []);

  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 selection:bg-teal-500/20 selection:text-teal-900">
        {viewMode === 'staff' ? (
          <StaffWorkspace
            currentUser={currentUser}
            onUserChange={switchUser}
            onBackToPublicSite={() => setViewMode('public')}
          />
        ) : (
        <>
          <PublicHeader
            currentTab={publicTab}
            onNavigate={tab => {
              setPublicTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAppointmentModal={() => setIsAppointmentModalOpen(true)}
            onSwitchToStaff={() => setViewMode('staff')}
          />

          <main className="flex-1">
            {publicTab === 'home' && (
              <HomePage
                onNavigate={tab => {
                  setPublicTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAppointmentModal={() => handleOpenAppointmentModal()}
                onSwitchToStaff={() => setViewMode('staff')}
              />
            )}
            {publicTab === 'about' && <AboutPage />}
            {publicTab === 'services' && (
              <ServicesPage onOpenAppointmentModal={() => handleOpenAppointmentModal()} />
            )}
            {(publicTab === 'doctors' || publicTab === 'staff-directory') && (
              <StaffDirectoryPage onOpenAppointmentModal={handleOpenAppointmentModal} />
            )}
            {publicTab === 'portal' && (
              <PatientPortalView onOpenAppointmentModal={() => handleOpenAppointmentModal()} />
            )}
            {publicTab === 'health' && <HealthResourcesPage />}
            {publicTab === 'contact' && <ContactPage />}
          </main>

          <PublicFooter
            onNavigate={tab => {
              setPublicTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSwitchToStaff={() => setViewMode('staff')}
          />

          {/* Patient Online Appointment Booking Flow */}
          <AppointmentBookingModal
            isOpen={isAppointmentModalOpen}
            onClose={() => {
              setIsAppointmentModalOpen(false);
              setSelectedClinicianId(undefined);
              setSelectedDepartment(undefined);
            }}
            initialClinicianId={selectedClinicianId}
            initialDepartment={selectedDepartment}
            onSuccess={apt => {
              // Successfully booked
            }}
          />
        </>
      )}
    </div>
  </I18nProvider>
  );
}
