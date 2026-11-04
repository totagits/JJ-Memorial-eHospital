import React, { useState, useEffect } from 'react';
import { offlineSyncService, SyncState } from '../../services/offlineSync';
import { biometricAuthService } from '../../services/biometrics';
import { UserRole } from '../../types';
import { GlobalSearchBar } from './GlobalSearchBar';
import { BiometricLockOverlay } from './BiometricLockOverlay';
import { TriageQueue } from './TriageQueue';
import { BloodBankModule } from './BloodBankModule';
import { PharmacyDashboard } from './PharmacyDashboard';
import { LaboratoryResultsModule } from './LaboratoryResultsModule';
import { RadiologyModule } from './RadiologyModule';
import { BillingInvoicingModule } from './BillingInvoicingModule';
import { InsuranceVerificationModule } from './InsuranceVerificationModule';
import { ExecutiveIntelligence } from './ExecutiveIntelligence';
import { PayrollAnalytics } from './PayrollAnalytics';
import { ResourceManagement } from './ResourceManagement';
import { StaffScheduling } from './StaffScheduling';
import { HospitalDigitalSignage } from './HospitalDigitalSignage';
import { ActivityFeed } from './ActivityFeed';
import { InternalMessaging } from './InternalMessaging';
import { PerformanceMonitoringPanel } from './PerformanceMonitoringPanel';
import {
  HeartPulse,
  Droplets,
  Pill,
  FlaskConical,
  Scan,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Calculator,
  Layers,
  Calendar,
  Tv,
  Radio,
  MessageSquare,
  Gauge,
  Lock,
  Search,
  Wifi,
  WifiOff,
  RefreshCw,
  User,
  Sliders
} from 'lucide-react';

interface StaffWorkspaceProps {
  onGoHome: () => void;
  onGoPatient: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

export const StaffWorkspace: React.FC<StaffWorkspaceProps> = ({
  onGoHome,
  onGoPatient,
  isSearchOpen,
  setIsSearchOpen,
}) => {
  const [syncState, setSyncState] = useState<SyncState>('online');
  const [syncQueueCount, setSyncQueueCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<
    | 'triage'
    | 'blood-bank'
    | 'pharmacy'
    | 'lab'
    | 'radiology'
    | 'billing'
    | 'insurance'
    | 'executive'
    | 'payroll'
    | 'resources'
    | 'scheduling'
    | 'signage'
    | 'activity'
    | 'messaging'
    | 'performance'
  >('triage');

  const [activeRole, setActiveRole] = useState<UserRole>('doctor');
  const [activeStaffName, setActiveStaffName] = useState('Dr. Emmanuel Tamba, MD');

  useEffect(() => {
    return offlineSyncService.subscribe((state, count) => {
      setSyncState(state);
      setSyncQueueCount(count);
    });
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setActiveRole(role);
    if (role === 'doctor') setActiveStaffName('Dr. Emmanuel Tamba, MD');
    else if (role === 'nurse' || role === 'triage') setActiveStaffName('Nurse Sarah Kiatamba, RN');
    else if (role === 'pharmacist') setActiveStaffName('Pharm. Varney Sheriff, RPh');
    else if (role === 'lab_tech') setActiveStaffName('Sando Coleman, Lab Tech');
    else if (role === 'radiologist') setActiveStaffName('Dr. Sekou Massaquoi, MD');
    else if (role === 'cashier') setActiveStaffName('Beatrice Flomo, Cashier');
    else if (role === 'executive') setActiveStaffName('Dr. Christian Nyenpan (Chief of Staff)');
    else setActiveStaffName('Staff Administrator');
  };

  const handleLockTerminal = () => {
    biometricAuthService.lock(activeStaffName);
  };

  const handleSimulateSync = () => {
    offlineSyncService.processQueue();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Clinical Header Bar */}
      <header className="bg-hospital-navy text-white px-4 sm:px-6 py-3 border-b border-slate-800 shadow-md sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Terminal Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
              EMR
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  J & J MEMORIAL HIS / EMR
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950 px-1.5 py-0.2 rounded border border-teal-800">
                  Staging Node
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono block">
                Workstation: OPD-BAY-01 &bull; Active: {activeStaffName}
              </span>
            </div>
          </div>

          {/* Central Search Bar Trigger (#8) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 transition w-full sm:w-72 justify-between"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-teal-400" />
              <span>Search Patient / MRN...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-600">
              Ctrl+K
            </kbd>
          </button>

          {/* Right Status Controls */}
          <div className="flex items-center space-x-3">
            {/* Pulsing Sync / Connectivity Status Indicator (#6, #36) */}
            <div
              onClick={handleSimulateSync}
              title="Click to force background sync"
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer border transition ${
                syncState === 'syncing'
                  ? 'bg-amber-950/80 border-amber-600 text-amber-300 animate-sync-pulse'
                  : syncState === 'offline'
                  ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                  : 'bg-slate-900/90 border-slate-700 text-emerald-400'
              }`}
            >
              {syncState === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-[11px] font-bold">Syncing EMR ({syncQueueCount})</span>
                </>
              ) : syncState === 'offline' ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[11px] font-bold">Offline ({syncQueueCount} cached)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold">Online Synced</span>
                </>
              )}
            </div>

            {/* Role Switcher */}
            <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <select
                aria-label="Staff Role Selection"
                value={activeRole}
                onChange={handleRoleChange}
                className="bg-transparent text-white focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="doctor" className="bg-slate-900 text-white">Physician / Clinician</option>
                <option value="nurse" className="bg-slate-900 text-white">Triage & OPD Nurse</option>
                <option value="pharmacist" className="bg-slate-900 text-white">Pharmacist</option>
                <option value="lab_tech" className="bg-slate-900 text-white">Laboratory Tech</option>
                <option value="radiologist" className="bg-slate-900 text-white">Radiologist</option>
                <option value="cashier" className="bg-slate-900 text-white">Cashier & Billing</option>
                <option value="executive" className="bg-slate-900 text-white">Chief Executive / Medical Dir</option>
              </select>
            </div>

            {/* Lock Terminal Button (#20 Biometrics) */}
            <button
              onClick={handleLockTerminal}
              title="Lock Terminal (WebAuthn Biometric Security)"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-400 hover:text-white border border-slate-700 transition"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Public Site & Patient Portal links */}
            <button
              onClick={onGoHome}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white transition"
            >
              Public Site
            </button>
            <button
              onClick={onGoPatient}
              className="px-2.5 py-1 text-xs text-teal-400 hover:text-teal-300 transition"
            >
              Patient Portal
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Navigation Subheader */}
      <div className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar text-xs font-bold">
            <button
              onClick={() => setActiveTab('triage')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'triage'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              <span>Triage Queue</span>
            </button>

            <button
              onClick={() => setActiveTab('blood-bank')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'blood-bank'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-rose-500" />
              <span>Blood Bank</span>
            </button>

            <button
              onClick={() => setActiveTab('pharmacy')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'pharmacy'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-teal-500" />
              <span>Pharmacy & QR</span>
            </button>

            <button
              onClick={() => setActiveTab('lab')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'lab'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-500" />
              <span>Lab Results</span>
            </button>

            <button
              onClick={() => setActiveTab('radiology')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'radiology'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Scan className="w-3.5 h-3.5 text-cyan-500" />
              <span>Radiology Viewer</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'billing'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-500" />
              <span>Billing & Receipt Print</span>
            </button>

            <button
              onClick={() => setActiveTab('insurance')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'insurance'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span>Insurance Verification</span>
            </button>

            <button
              onClick={() => setActiveTab('executive')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'executive'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
              <span>Executive Intelligence</span>
            </button>

            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'payroll'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-500" />
              <span>Payroll Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Resource Conflict Mgmt</span>
            </button>

            <button
              onClick={() => setActiveTab('scheduling')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'scheduling'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-teal-500" />
              <span>Staff Shifts</span>
            </button>

            <button
              onClick={() => setActiveTab('signage')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'signage'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-slate-500" />
              <span>TV Signage</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-500" />
              <span>Activity Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('messaging')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'messaging'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-500" />
              <span>Internal Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'performance'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-purple-500" />
              <span>API APM</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'triage' && <TriageQueue />}
        {activeTab === 'blood-bank' && <BloodBankModule />}
        {activeTab === 'pharmacy' && <PharmacyDashboard />}
        {activeTab === 'lab' && <LaboratoryResultsModule />}
        {activeTab === 'radiology' && <RadiologyModule />}
        {activeTab === 'billing' && <BillingInvoicingModule />}
        {activeTab === 'insurance' && <InsuranceVerificationModule />}
        {activeTab === 'executive' && <ExecutiveIntelligence />}
        {activeTab === 'payroll' && <PayrollAnalytics />}
        {activeTab === 'resources' && <ResourceManagement />}
        {activeTab === 'scheduling' && <StaffScheduling />}
        {activeTab === 'signage' && <HospitalDigitalSignage />}
        {activeTab === 'activity' && <ActivityFeed />}
        {activeTab === 'messaging' && <InternalMessaging />}
        {activeTab === 'performance' && <PerformanceMonitoringPanel />}
      </main>

      {/* Global Modals */}
      <GlobalSearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPatient={(p) => {
          alert(`Loaded EMR Record for: ${p.name} (MRN: ${p.mrn})`);
        }}
      />

      <BiometricLockOverlay />
    </div>
  );
};
