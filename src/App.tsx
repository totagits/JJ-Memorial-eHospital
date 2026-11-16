import React, { lazy, Suspense, useState, useEffect } from 'react';
import { PublicHeader } from './components/public/PublicHeader';
import { PublicFooter } from './components/public/PublicFooter';
import { HomePage } from './components/public/HomePage';
import { AboutPage } from './components/public/AboutPage';
import { ServicesPage } from './components/public/ServicesPage';
import { DoctorsPage } from './components/public/DoctorsPage';
import { StaffDirectoryPage } from './components/public/StaffDirectoryPage';
import { HealthResourcesPage } from './components/public/HealthResourcesPage';
import { ContactPage } from './components/public/ContactPage';
import { StagingPatientPortal } from './components/public/StagingPatientPortal';
import { PatientRegistryPage } from './components/staff/PatientRegistryPage';
import { I18nProvider } from './services/i18nService';

const demoEnabled = import.meta.env.VITE_ENABLE_DEMO_WORKFLOWS === 'true';
const DemoStaffWorkspace = demoEnabled && lazy(() => import('./components/staff/DemoWorkspace'));
const DemoPatientPortal = demoEnabled && lazy(() => import('./components/public/PatientPortalView').then(
  module => ({ default: module.PatientPortalView }),
));
const AppointmentBooking = lazy(() => import('./components/public/AppointmentBookingModal').then(
  module => ({ default: module.AppointmentBookingModal }),
));

export default function App() {
  return /^\/staff\/registry\/?$/.test(window.location.pathname) ? <PatientRegistryPage /> : <HospitalApp />;
}

function HospitalApp() {
  const [viewMode, setViewMode] = useState<'public' | 'staff'>('public');
  const [publicTab, setPublicTab] = useState<string>(() => /^\/patient\/portal\/?$/.test(window.location.pathname) ? 'portal' : 'home');
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedClinicianId, setSelectedClinicianId] = useState<string | undefined>(undefined);
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);

  const openStaff = () => {
    if (demoEnabled) setViewMode('staff');
    else window.location.assign('/staff/registry');
  };

  const handleOpenAppointmentModal = (clinicianId?: string, department?: string) => {
    setSelectedClinicianId(clinicianId);
    setSelectedDepartment(department);
    setIsAppointmentModalOpen(true);
  };

  // Global keyboard shortcuts (Alt+S to toggle staff workspace, Alt+P for portal)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (demoEnabled) setViewMode(v => (v === 'public' ? 'staff' : 'public'));
        else openStaff();
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
      openStaff();
    } else if (hash === '#portal') {
      setViewMode('public');
      setPublicTab('portal');
    }
  }, []);

  return (
    <I18nProvider>
      <Suspense fallback={<p role="status" className="p-6">Loading workspace…</p>}>
      <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 selection:bg-teal-500/20 selection:text-teal-900">
        {viewMode === 'staff' && DemoStaffWorkspace ? (
          <DemoStaffWorkspace
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
            onOpenAppointmentModal={() => handleOpenAppointmentModal()}
            onSwitchToStaff={openStaff}
          />

          <main className="flex-1">
            {publicTab === 'home' && (
              <HomePage
                onNavigate={tab => {
                  setPublicTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAppointmentModal={() => handleOpenAppointmentModal()}
                onSwitchToStaff={openStaff}
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
              DemoPatientPortal ? <DemoPatientPortal onOpenAppointmentModal={() => handleOpenAppointmentModal()} /> : <StagingPatientPortal />
            )}
            {publicTab === 'health' && <HealthResourcesPage />}
            {publicTab === 'contact' && <ContactPage demoEnabled={demoEnabled} />}
          </main>

          <PublicFooter
            onNavigate={tab => {
              setPublicTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSwitchToStaff={openStaff}
          />

          {/* Patient Online Appointment Booking Flow */}
          {isAppointmentModalOpen && <AppointmentBooking
            isOpen={isAppointmentModalOpen}
            onClose={() => {
              setIsAppointmentModalOpen(false);
              setSelectedClinicianId(undefined);
              setSelectedDepartment(undefined);
            }}
            initialClinicianId={selectedClinicianId}
            initialDepartment={selectedDepartment}
          />}
        </>
      )}
    </div>
      </Suspense>
  </I18nProvider>
  );
}
