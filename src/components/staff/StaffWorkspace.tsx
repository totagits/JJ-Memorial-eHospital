import React, { useState, useEffect } from 'react';
import { offlineSyncService, SyncState } from '../../services/offlineSync';
import { biometricAuthService } from '../../services/biometrics';
import { UserRole } from '../../types';
import { GlobalSearchBar } from './GlobalSearchBar';
import { BiometricLockOverlay } from './BiometricLockOverlay';

// Existing module imports
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

// New OPD/EMR chart
import { OPDEMRChart } from './OPDEMRChart';

// New placeholder modules
import {
  CommandCenterHMIS,
  InpatientADT,
  GeneralLedger,
  InventoryProcurement,
  BiomedicalFacilities,
  AuditTrailCompliance,
  QualitySafetyIncidents,
} from './NewModulePlaceholders';

import {
  TrendingUp,
  Monitor,
  Stethoscope,
  HeartPulse,
  Building2,
  FlaskConical,
  ScanLine,
  Pill,
  Receipt,
  BookOpen,
  Package,
  Users,
  CalendarDays,
  Wrench,
  Search as SearchIcon,
  ShieldCheck,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Lock,
  LogOut,
  ChevronDown,
  Droplets,
  Scan,
  Calculator,
  Layers,
  Calendar,
  Tv,
  Radio,
  MessageSquare,
  Gauge,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ModuleKey =
  | 'executive'
  | 'command-center'
  | 'opd-emr'
  | 'triage'
  | 'inpatient-adt'
  | 'lab'
  | 'radiology'
  | 'pharmacy'
  | 'billing'
  | 'general-ledger'
  | 'inventory'
  | 'payroll'
  | 'scheduling'
  | 'biomedical'
  | 'audit'
  | 'quality'
  | 'blood-bank'
  | 'insurance'
  | 'resources'
  | 'signage'
  | 'activity'
  | 'messaging'
  | 'performance';

interface SidebarItem {
  key: ModuleKey;
  label: string;
  icon: React.ReactNode;
}

const SIDEBAR_MODULES: SidebarItem[] = [
  { key: 'executive',      label: 'Executive Intelligence (BI)',      icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'command-center', label: 'Command Center & HMIS',            icon: <Monitor className="w-4 h-4" /> },
  { key: 'opd-emr',        label: 'Outpatient (OPD) & EMR',           icon: <Stethoscope className="w-4 h-4" /> },
  { key: 'triage',         label: 'Triage & Nursing Vitals',          icon: <HeartPulse className="w-4 h-4" /> },
  { key: 'inpatient-adt',  label: 'Inpatient Wards & Beds (ADT)',     icon: <Building2 className="w-4 h-4" /> },
  { key: 'lab',            label: 'Diagnostic Laboratory (LIS)',       icon: <FlaskConical className="w-4 h-4" /> },
  { key: 'radiology',      label: 'Radiology & Imaging (PACS)',       icon: <ScanLine className="w-4 h-4" /> },
  { key: 'pharmacy',       label: 'Pharmacy & Drug Dispense',         icon: <Pill className="w-4 h-4" /> },
  { key: 'billing',        label: 'Billing & Invoicing',              icon: <Receipt className="w-4 h-4" /> },
  { key: 'general-ledger', label: 'General Ledger & Accounts',        icon: <BookOpen className="w-4 h-4" /> },
  { key: 'inventory',      label: 'Inventory & Procurement',          icon: <Package className="w-4 h-4" /> },
  { key: 'payroll',        label: 'HR, Staff & Payroll',              icon: <Users className="w-4 h-4" /> },
  { key: 'scheduling',     label: 'Staff Scheduling & Rosters',       icon: <CalendarDays className="w-4 h-4" /> },
  { key: 'biomedical',     label: 'Biomedical & Facilities',          icon: <Wrench className="w-4 h-4" /> },
  { key: 'audit',          label: 'Audit Trail & Compliance',         icon: <SearchIcon className="w-4 h-4" /> },
  { key: 'quality',        label: 'Quality & Safety Incidents',       icon: <AlertTriangle className="w-4 h-4" /> },
  // Legacy modules still accessible
  { key: 'blood-bank',     label: 'Blood Bank & Transfusions',        icon: <Droplets className="w-4 h-4" /> },
  { key: 'insurance',      label: 'Insurance Verification',           icon: <ShieldCheck className="w-4 h-4" /> },
  { key: 'resources',      label: 'Resource Conflict Mgmt',           icon: <Layers className="w-4 h-4" /> },
  { key: 'signage',        label: 'Hospital TV Signage',              icon: <Tv className="w-4 h-4" /> },
  { key: 'activity',       label: 'Activity Stream',                  icon: <Radio className="w-4 h-4" /> },
  { key: 'messaging',      label: 'Internal Clinical Chat',           icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'performance',    label: 'API Performance Monitor',          icon: <Gauge className="w-4 h-4" /> },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface StaffWorkspaceProps {
  onGoHome: () => void;
  onGoPatient: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const StaffWorkspace: React.FC<StaffWorkspaceProps> = ({
  onGoHome,
  onGoPatient,
  isSearchOpen,
  setIsSearchOpen,
}) => {
  const [syncState, setSyncState] = useState<SyncState>('online');
  const [syncQueueCount, setSyncQueueCount] = useState<number>(0);
  const [activeModule, setActiveModule] = useState<ModuleKey>('opd-emr');
  const [activeRole, setActiveRole] = useState<UserRole>('doctor');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const STAFF_NAME = 'Dr. Evelyn Sirleaf-Gbotoe, MD';
  const STAFF_ROLE_LABEL = 'Attending Physician (OPD)';

  // ── Offline Sync Subscription ──────────────────────────────────────────────
  useEffect(() => {
    return offlineSyncService.subscribe((state, count) => {
      setSyncState(state);
      setSyncQueueCount(count);
    });
  }, []);

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = () => setRoleDropdownOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleLockTerminal = () => biometricAuthService.lock(STAFF_NAME);
  const handleSimulateSync = () => offlineSyncService.processQueue();

  // ── Active module label for secondary bar ─────────────────────────────────
  const activeSidebarItem = SIDEBAR_MODULES.find((m) => m.key === activeModule);

  // ── Render active module content ──────────────────────────────────────────
  const renderModule = () => {
    switch (activeModule) {
      case 'executive':      return <ExecutiveIntelligence />;
      case 'command-center': return <CommandCenterHMIS />;
      case 'opd-emr':        return <OPDEMRChart />;
      case 'triage':         return <TriageQueue />;
      case 'inpatient-adt':  return <InpatientADT />;
      case 'lab':            return <LaboratoryResultsModule />;
      case 'radiology':      return <RadiologyModule />;
      case 'pharmacy':       return <PharmacyDashboard />;
      case 'billing':        return <BillingInvoicingModule />;
      case 'general-ledger': return <GeneralLedger />;
      case 'inventory':      return <InventoryProcurement />;
      case 'payroll':        return <PayrollAnalytics />;
      case 'scheduling':     return <StaffScheduling />;
      case 'biomedical':     return <BiomedicalFacilities />;
      case 'audit':          return <AuditTrailCompliance />;
      case 'quality':        return <QualitySafetyIncidents />;
      case 'blood-bank':     return <BloodBankModule />;
      case 'insurance':      return <InsuranceVerificationModule />;
      case 'resources':      return <ResourceManagement />;
      case 'signage':        return <HospitalDigitalSignage />;
      case 'activity':       return <ActivityFeed />;
      case 'messaging':      return <InternalMessaging />;
      case 'performance':    return <PerformanceMonitoringPanel />;
      default:               return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">

      {/* ════════════════════════════════════════════════════════════════════
          TOP HEADER BAR — dark navy bg-[#0d1117]
      ════════════════════════════════════════════════════════════════════ */}
      <header className="bg-[#0d1117] text-white px-5 py-3 border-b border-slate-800 shadow-lg sticky top-0 z-40 no-print">
        <div className="flex items-center justify-between gap-3 flex-wrap">

          {/* ── Left: Logo & Identity ──────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0 shadow">
              {/* Teal cross */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="2" width="4" height="20" rx="1" />
                <rect x="2" y="10" width="20" height="4" rx="1" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-extrabold text-white leading-tight tracking-tight">J &amp; J Memorial</div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Staff Workspace</div>
              <div className="text-[9px] text-slate-500 leading-none">Enterprise HIS, EMR &amp; Hospital ERP</div>
            </div>
          </div>

          {/* ── Center: 5 Action Buttons ───────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap justify-center">

            {/* VOA East Link */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs">
              <span className="text-slate-300">🔗</span>
              <span className="text-slate-300 font-medium">VOA East Link:</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Online
              </span>
            </div>

            {/* Register Patient */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-teal-600 rounded-lg text-xs text-white font-semibold hover:bg-teal-900/40 transition"
            >
              <span>➕</span> Register Patient (MRN)
            </button>

            {/* Break-Glass */}
            <button
              onClick={() => window.alert('⚠️ BREAK-GLASS INVOKED\n\nThis action is being logged and audited per HIPAA policy. Authorized emergency access to restricted patient records.\n\nAll access will be reviewed by the Compliance Officer within 24 hours.')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-rose-600 rounded-lg text-xs text-rose-400 font-semibold hover:bg-rose-950/40 transition"
            >
              <span>💔</span> Break-Glass
            </button>

            {/* Outage / Downtime */}
            <button
              onClick={() => window.alert('⚡ OUTAGE / DOWNTIME PROTOCOL ACTIVATED\n\nSwitching to paper-based downtime procedures. All clinical staff should follow the Downtime SOP in the red binder at the nursing station.\n\nIT has been notified. Estimated restoration: TBD.')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-amber-500 rounded-lg text-xs text-amber-400 font-semibold hover:bg-amber-950/40 transition"
            >
              <span>⚡</span> Outage / Downtime
            </button>

            {/* Hostinger & Git Runbook */}
            <button
              onClick={() => window.open('https://github.com', '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-slate-400 font-semibold hover:bg-slate-800 transition"
            >
              <span>📋</span> Hostinger &amp; Git Runbook
            </button>
          </div>

          {/* ── Right: Staff Info + Logout ─────────────────────────────── */}
          <div className="flex items-center gap-3 flex-shrink-0">

            {/* Sync indicator */}
            <button
              onClick={handleSimulateSync}
              title="Click to force background sync"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                syncState === 'syncing'
                  ? 'bg-amber-950/80 border-amber-600 text-amber-300 animate-pulse'
                  : syncState === 'offline'
                  ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                  : 'bg-slate-900/90 border-slate-700 text-emerald-400'
              }`}
            >
              {syncState === 'syncing' ? (
                <><RefreshCw className="w-3 h-3 animate-spin" /><span>Syncing ({syncQueueCount})</span></>
              ) : syncState === 'offline' ? (
                <><WifiOff className="w-3 h-3" /><span>Offline</span></>
              ) : (
                <><Wifi className="w-3 h-3" /><span>Online</span></>
              )}
            </button>

            {/* Staff badge + dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setRoleDropdownOpen((p) => !p)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg hover:bg-slate-800 transition"
              >
                <span className="text-sm">🩺</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight">{STAFF_NAME}</div>
                  <div className="text-[10px] text-teal-400 font-semibold">{STAFF_ROLE_LABEL}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl w-64 py-2 text-slate-700">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{STAFF_NAME}</p>
                    <p className="text-[11px] text-teal-600 font-semibold">{STAFF_ROLE_LABEL}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Workstation: OPD-BAY-01</p>
                  </div>
                  <div className="py-1">
                    <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Switch Context</p>
                    {(
                      [
                        { role: 'doctor' as UserRole, label: 'Physician / Clinician' },
                        { role: 'nurse' as UserRole, label: 'Triage & OPD Nurse' },
                        { role: 'pharmacist' as UserRole, label: 'Pharmacist' },
                        { role: 'lab_tech' as UserRole, label: 'Laboratory Technician' },
                        { role: 'radiologist' as UserRole, label: 'Radiologist' },
                        { role: 'cashier' as UserRole, label: 'Cashier & Billing' },
                        { role: 'executive' as UserRole, label: 'Chief Executive / Medical Dir' },
                      ] as { role: UserRole; label: string }[]
                    ).map(({ role, label }) => (
                      <button
                        key={role}
                        onClick={() => { setActiveRole(role); setRoleDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-teal-50 transition ${activeRole === role ? 'font-bold text-teal-700' : ''}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-2 pb-1">
                    <button
                      onClick={() => { handleLockTerminal(); setRoleDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition"
                    >
                      <Lock className="w-3.5 h-3.5" /> Lock Terminal
                    </button>
                    <button
                      onClick={() => { onGoHome(); setRoleDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out / Public Site
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Lock Terminal icon button */}
            <button
              onClick={handleLockTerminal}
              title="Lock Terminal (WebAuthn Biometric Security)"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-teal-400 hover:text-white border border-slate-700 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          SECONDARY BAR — slightly lighter dark
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#161b22] border-b border-slate-800 px-5 py-2 flex items-center justify-between no-print sticky top-[61px] z-30">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Lock className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-semibold">{STAFF_NAME}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{STAFF_ROLE_LABEL}</span>
          {activeSidebarItem && (
            <>
              <span className="text-slate-600 mx-1">/</span>
              <span className="text-teal-400 font-bold">{activeSidebarItem.label}</span>
            </>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exit to Public Site</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          BODY: Sidebar + Main Content
      ════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto sticky top-[101px] h-[calc(100vh-101px)]">
          <div className="px-4 pt-5 pb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 px-2">
              Clinical &amp; ERP Modules
            </p>
          </div>

          <nav className="flex-1 px-3 pb-3 space-y-0.5">
            {SIDEBAR_MODULES.map((item) => {
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveModule(item.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition group ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'}`}>
                    {item.icon}
                  </span>
                  <span className="leading-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ── Offline Sync Indicator ─────────────────────────────────── */}
          <div className="px-4 py-4 border-t border-slate-100">
            <button
              onClick={handleSimulateSync}
              title="IndexedDB Local Cache — Click to sync"
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold border transition ${
                syncState === 'syncing'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : syncState === 'offline'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {syncState === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  <span>Syncing… ({syncQueueCount} records)</span>
                </>
              ) : syncState === 'offline' ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Offline · {syncQueueCount} cached</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span>IndexedDB Local Cache · Synced</span>
                </>
              )}
            </button>
            <p className="text-[9px] text-slate-400 text-center mt-1.5">
              Click to force background sync
            </p>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderModule()}
        </main>
      </div>

      {/* ── Global Modals ─────────────────────────────────────────────────── */}
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
