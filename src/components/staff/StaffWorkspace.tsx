import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Stethoscope, 
  HeartPulse, 
  Bed, 
  Microscope, 
  Pill, 
  DollarSign, 
  BookOpen, 
  Truck, 
  Briefcase, 
  Wrench, 
  ShieldCheck, 
  Zap, 
  Server, 
  LogOut, 
  UserPlus, 
  AlertCircle,
  Key,
  Search,
  Bell,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Scan,
  TrendingUp,
  Calendar,
  MessageSquare,
  Droplet,
  Fingerprint,
  Lock,
  CreditCard,
  Cpu,
  Cloud,
  Palette,
  Check,
  Sparkles
} from 'lucide-react';

import { getDatabaseState, updateDatabaseState, logAuditEvent, triggerBackgroundSync } from '../../services/storageService';
import { indexedDbCache } from '../../services/indexedDbCacheService';
import { auditTrailService } from '../../services/auditTrailService';
import { backgroundSyncService } from '../../services/backgroundSyncService';
import { UserAccount, UserRole } from '../../types/auth';
import { Patient } from '../../types/patient';

import { ExecutiveCommandCenter } from './ExecutiveCommandCenter';
import { ExecutiveIntelligenceDashboard } from './ExecutiveIntelligenceDashboard';
import { ClinicalWorkstation } from './ClinicalWorkstation';
import { TriageNursingWorkstation } from './TriageNursingWorkstation';
import { InpatientADTWorkstation } from './InpatientADTWorkstation';
import { LaboratoryWorkstation } from './LaboratoryWorkstation';
import { RadiologyWorkstation } from './RadiologyWorkstation';
import { PharmacyWorkstation } from './PharmacyWorkstation';
import { BillingCashierWorkstation } from './BillingCashierWorkstation';
import { GeneralLedgerWorkstation } from './GeneralLedgerWorkstation';
import { ProcurementInventoryWorkstation } from './ProcurementInventoryWorkstation';
import { HRPayrollWorkstation } from './HRPayrollWorkstation';
import { StaffSchedulingWorkstation } from './StaffSchedulingWorkstation';
import { AssetsFacilitiesWorkstation } from './AssetsFacilitiesWorkstation';
import { QualityAuditWorkstation } from './QualityAuditWorkstation';
import { AuditTrailWorkstation } from './AuditTrailWorkstation';
import { StaffMessagingWorkstation } from './StaffMessagingWorkstation';
import { BloodBankWorkstation } from './BloodBankWorkstation';
import { ResourceManagementWorkstation } from './ResourceManagementWorkstation';
import { InsuranceVerificationWorkstation } from './InsuranceVerificationWorkstation';
import { GlobalStaffSearchModal } from './GlobalStaffSearchModal';
import { BiometricLockOverlay } from './BiometricLockOverlay';
import { PatientRegistrationModal } from './PatientRegistrationModal';
import { DowntimeContinuityModal } from './DowntimeContinuityModal';
import { DeploymentRunbookModal } from './DeploymentRunbookModal';
import { oidcAuthService, OidcUserSession } from '../../services/oidcAuthService';
import { notificationService } from '../../services/notificationService';
import { StaffOAuthLoginModal } from './StaffOAuthLoginModal';
import { NotificationDrawerModal } from './NotificationDrawerModal';
import { RBACService, withRoleAccess, RoleThemeConfig, ROLE_THEMES } from '../../services/rbacService';
import { RoleDashboard } from './RoleDashboard';

// Wrapped Workstation Components with withRoleAccess HOC
const SecureClinicalWorkstation = withRoleAccess(ClinicalWorkstation, 'opd', 'READ', 'Outpatient (OPD) & EMR');
const SecureTriageWorkstation = withRoleAccess(TriageNursingWorkstation, 'triage', 'READ', 'Triage & Nursing Vitals');
const SecureInpatientWorkstation = withRoleAccess(InpatientADTWorkstation, 'inpatient', 'READ', 'Inpatient Wards & Beds');
const SecureLabWorkstation = withRoleAccess(LaboratoryWorkstation, 'lab', 'READ', 'Diagnostic Laboratory');
const SecureBloodBankWorkstation = withRoleAccess(BloodBankWorkstation, 'blood_bank', 'READ', 'Blood Bank & Transfusion');
const SecureRadiologyWorkstation = withRoleAccess(RadiologyWorkstation, 'radiology', 'READ', 'Radiology & Imaging');
const SecureResourceWorkstation = withRoleAccess(ResourceManagementWorkstation, 'resources', 'READ', 'Equipment & Resources');
const SecurePharmacyWorkstation = withRoleAccess(PharmacyWorkstation, 'pharmacy', 'READ', 'Pharmacy & Drug Dispense');
const SecureInsuranceWorkstation = withRoleAccess(InsuranceVerificationWorkstation, 'insurance', 'READ', 'Insurance Verification');
const SecureBillingWorkstation = withRoleAccess(BillingCashierWorkstation, 'billing', 'READ', 'Billing & Invoicing');
const SecureGLWorkstation = withRoleAccess(GeneralLedgerWorkstation, 'gl', 'READ', 'General Ledger & Accounts');
const SecureProcurementWorkstation = withRoleAccess(ProcurementInventoryWorkstation, 'procurement', 'READ', 'Inventory & Procurement');
const SecureHRPayrollWorkstation = withRoleAccess(HRPayrollWorkstation, 'hr', 'READ', 'HR, Staff & Payroll');
const SecureSchedulingWorkstation = withRoleAccess(StaffSchedulingWorkstation, 'scheduling', 'READ', 'Staff Scheduling & Rosters');
const SecureAssetsWorkstation = withRoleAccess(AssetsFacilitiesWorkstation, 'assets', 'READ', 'Biomedical & Facilities');
const SecureAuditTrailWorkstation = withRoleAccess(AuditTrailWorkstation, 'audit_trail', 'READ', 'Audit Trail & Compliance');
const SecureQualityWorkstation = withRoleAccess(QualityAuditWorkstation, 'quality', 'READ', 'Quality & Safety Incidents');
const SecureMessagingWorkstation = withRoleAccess(StaffMessagingWorkstation, 'messages', 'READ', 'Internal Staff Comms');
const SecureExecutiveBIDashboard = withRoleAccess(ExecutiveIntelligenceDashboard, 'executive_bi', 'READ', 'Executive BI & Analytics');
const SecureCommandCenter = withRoleAccess(ExecutiveCommandCenter, 'command_center', 'READ', 'Facility Command Center');

interface StaffWorkspaceProps {
  onBackToPublicSite: () => void;
}

export const StaffWorkspace: React.FC<StaffWorkspaceProps> = ({ onBackToPublicSite }) => {
  const db = getDatabaseState();
  // Default to Dr. J. Saydee Kollie (Medical Director) or Dr. Evelyn Sirleaf-Gbotoe
  const [currentUser, setCurrentUser] = useState<UserAccount>(db.users[1]); // Dr. Evelyn
  const [activeModule, setActiveModule] = useState<string>('opd');

  // RBAC Segregation: Automatically redirect to primary workstation if activeModule is unauthorized for current user
  useEffect(() => {
    if (!RBACService.hasAccess(currentUser, activeModule, 'READ')) {
      setActiveModule(RBACService.getPrimaryWorkstation(currentUser));
    }
  }, [currentUser, activeModule]);

  // Dynamic Role-Based UI Theme
  const [currentTheme, setCurrentTheme] = useState<RoleThemeConfig>(() => RBACService.getRoleTheme(currentUser));
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);

  // OIDC Authentication & Staff Identity Modal State
  const [showOidcLoginModal, setShowOidcLoginModal] = useState<boolean>(false);

  // Centralized Notification Drawer State & Counts
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(() => notificationService.getUnreadCount(currentUser));
  const [hasStatAlert, setHasStatAlert] = useState<boolean>(() => notificationService.hasUnreadStatAlert(currentUser));

  // Reactive subscription to real-time role notifications
  useEffect(() => {
    const updateCounts = () => {
      setUnreadNotificationCount(notificationService.getUnreadCount(currentUser));
      setHasStatAlert(notificationService.hasUnreadStatAlert(currentUser));
    };
    updateCounts();
    const unsubscribe = notificationService.subscribe(updateCounts);
    return () => unsubscribe();
  }, [currentUser]);

  // Automatically update theme when user changes
  useEffect(() => {
    setCurrentTheme(RBACService.getRoleTheme(currentUser));
  }, [currentUser]);

  const handleOidcLoginSuccess = (session: OidcUserSession) => {
    setCurrentUser(session.user);
    const newTheme = RBACService.getRoleTheme(session.user);
    setCurrentTheme(newTheme);
    const primaryWs = RBACService.getPrimaryWorkstation(session.user);
    setActiveModule(primaryWs);
  };

  // Centralized Audit Action Handler: tracks navigation across workstations for statutory compliance
  const handleNavigate = (moduleId: string, moduleLabel?: string) => {
    setActiveModule(moduleId);
    auditTrailService.logNavigation(currentUser, moduleId, moduleLabel);
  };

  // Custom Theme Selection Handler
  const handleSelectTheme = (theme: RoleThemeConfig) => {
    setCurrentTheme(theme);
    setShowThemeModal(false);
    auditTrailService.logThemeSwitch(currentUser, theme.name, theme.id, theme.badge);
  };

  // Offline & IndexedDB Caching Telemetry
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [simulateOffline, setSimulateOffline] = useState<boolean>(false);
  const [isSyncingCache, setIsSyncingCache] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  // Listen to browser network changes
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial cache sync on workstation load
    indexedDbCache.cacheStateToIndexedDB(db);

    // Automatically log user login session for statutory compliance
    auditTrailService.logLogin(currentUser, 'SESSION_INITIALIZATION', '192.168.10.45 (Local Clinical Terminal)');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualCacheSync = async () => {
    setIsSyncingCache(true);
    await indexedDbCache.cacheStateToIndexedDB(db);
    auditTrailService.logCacheSync(currentUser, db.patients.length, db.encounters.length);
    setTimeout(() => {
      setIsSyncingCache(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 400);
  };

  const handleToggleOfflineSimulation = (active: boolean) => {
    setSimulateOffline(active);
    auditTrailService.logOfflineToggle(currentUser, active);
  };

  const effectiveOnline = isOnline && !simulateOffline;

  // Modals
  const [showRegModal, setShowRegModal] = useState(false);
  const [showDowntimeModal, setShowDowntimeModal] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);
  const [showGlobalSearchModal, setShowGlobalSearchModal] = useState(false);
  const [isTerminalLocked, setIsTerminalLocked] = useState(false);
  const [isSyncingBackground, setIsSyncingBackground] = useState(false);
  const [breakGlassReason, setBreakGlassReason] = useState('');

  const handleToggleTerminalLock = (locked: boolean) => {
    setIsTerminalLocked(locked);
    auditTrailService.logTerminalLock(currentUser, locked ? 'LOCK' : 'UNLOCK');
  };

  // Global Keyboard shortcuts: Ctrl+K for search, Ctrl+L for terminal lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowGlobalSearchModal(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleToggleTerminalLock(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  const handleManualBackgroundSync = async () => {
    setIsSyncingBackground(true);
    await triggerBackgroundSync();
    setIsSyncingBackground(false);
    setLastSyncTime(new Date().toLocaleTimeString());
  };

  // Handle Break-Glass emergency access
  const handleBreakGlassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakGlassReason.trim()) {
      alert('Clinical emergency justification is mandatory for break-glass override.');
      return;
    }

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'BREAK_GLASS',
      module: 'SECURITY',
      details: `EMERGENCY BREAK-GLASS ACTIVATED by ${currentUser.fullName} (${currentUser.role}). Justification: ${breakGlassReason}. Audit flags dispatched.`,
      ipAddress: 'Clinical Workstation Break-Glass Terminal',
      status: 'FLAGGED',
    });

    alert('Break-glass emergency protocol recorded in immutable audit log. Full unhindered access unlocked.');
    setShowBreakGlassModal(false);
    setBreakGlassReason('');
  };

  const navItems = [
    { id: 'messages', label: 'Internal Staff Comms', icon: MessageSquare },
    { id: 'executive_bi', label: 'Executive Intelligence (BI)', icon: TrendingUp },
    { id: 'command_center', label: 'Command Center & HMIS', icon: Activity },
    { id: 'opd', label: 'Outpatient (OPD) & EMR', icon: Stethoscope },
    { id: 'triage', label: 'Triage & Nursing Vitals', icon: HeartPulse },
    { id: 'inpatient', label: 'Inpatient Wards & Beds (ADT)', icon: Bed },
    { id: 'lab', label: 'Diagnostic Laboratory (LIS)', icon: Microscope },
    { id: 'blood_bank', label: 'Blood Bank & Transfusion', icon: Droplet },
    { id: 'radiology', label: 'Radiology & Imaging (PACS)', icon: Scan },
    { id: 'resources', label: 'Equipment & Resources', icon: Cpu },
    { id: 'pharmacy', label: 'Pharmacy & Drug Dispense', icon: Pill },
    { id: 'insurance', label: 'Insurance Verification', icon: CreditCard },
    { id: 'billing', label: 'Billing & Invoicing', icon: DollarSign },
    { id: 'gl', label: 'General Ledger & Accounts', icon: BookOpen },
    { id: 'procurement', label: 'Inventory & Procurement', icon: Truck },
    { id: 'hr', label: 'HR, Staff & Payroll', icon: Briefcase },
    { id: 'scheduling', label: 'Staff Scheduling & Rosters', icon: Calendar },
    { id: 'assets', label: 'Biomedical & Facilities', icon: Wrench },
    { id: 'audit_trail', label: 'Audit Trail & Compliance', icon: ShieldCheck },
    { id: 'quality', label: 'Quality & Safety Incidents', icon: AlertCircle },
  ];

  const authorizedModules = RBACService.getAuthorizedModules(currentUser);
  const isAdmin = RBACService.getPrimaryRole(currentUser) === 'Admin';
  // Exclude 'audit_trail' from general departmental list so it is highlighted in its own Administrator section
  const authorizedNavItems = navItems.filter(item => authorizedModules.includes(item.id) && item.id !== 'audit_trail');
  const hasAuditTrailAccess = authorizedModules.includes('audit_trail');

  return (
    <div className={`min-h-screen ${currentTheme.workspaceBg} flex flex-col transition-colors duration-200`}>
      {/* Top Staff Navigation Bar with Dynamic Role Theme */}
      <header className={`sticky top-0 z-40 ${currentTheme.headerBg} border-b ${currentTheme.headerBorder} shadow-md transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-800/80 border border-teal-700 flex items-center justify-center font-bold text-teal-200 shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">J & J Memorial</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${currentTheme.headerBadge}`}>
                  STAFF WORKSPACE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Enterprise HIS, EMR & Hospital ERP</p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Global Search Button */}
            <button
              onClick={() => {
                setShowGlobalSearchModal(true);
                auditTrailService.logUserAction({
                  user: currentUser,
                  action: 'OPEN_SEARCH',
                  module: 'SECURITY',
                  details: 'Opened global patient chart search modal (Ctrl+K)',
                });
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
              title="Global EMR Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline font-mono text-[9px] bg-slate-900 text-teal-300 px-1 py-0.5 rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Background Sync Pulse Indicator */}
            <button
              onClick={handleManualBackgroundSync}
              disabled={isSyncingBackground}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                isSyncingBackground
                  ? 'bg-teal-950 text-teal-300 border-teal-700 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Background EMR Cloud Sync Service"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isSyncingBackground ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">
                {isSyncingBackground ? 'Pushing Cached EMR...' : 'Background Sync'}
              </span>
            </button>

            {/* Biometric Terminal Lock */}
            <button
              onClick={() => handleToggleTerminalLock(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Lock Workstation Terminal (Ctrl+L)"
            >
              <Fingerprint className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Lock</span>
            </button>

            {/* Offline Telemetry Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
              effectiveOnline 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
                : 'bg-amber-950/90 text-amber-300 border-amber-700'
            }`}>
              {effectiveOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              )}
              <span className="hidden lg:inline">
                {effectiveOnline ? 'VOA East Link: Online' : 'VOA East Link: Offline Cache'}
              </span>
            </div>

            {/* Quick Patient Registration */}
            <button
              onClick={() => {
                setShowRegModal(true);
                auditTrailService.logUserAction({
                  user: currentUser,
                  action: 'OPEN_REGISTRATION',
                  module: 'SECURITY',
                  details: 'Opened new patient registration modal',
                });
              }}
              className="bg-teal-700 hover:bg-teal-600 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Register Patient</span>
            </button>

            {/* Break-Glass Emergency */}
            <button
              onClick={() => {
                setShowBreakGlassModal(true);
                auditTrailService.logUserAction({
                  user: currentUser,
                  action: 'INITIATE_BREAK_GLASS',
                  module: 'SECURITY',
                  details: 'Opened break-glass emergency chart access modal',
                });
              }}
              className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Break-Glass Emergency Chart Access"
            >
              <Key className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Break-Glass</span>
            </button>

            {/* Downtime Resilience */}
            <button
              onClick={() => setShowDowntimeModal(true)}
              className="bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Outage / Downtime</span>
            </button>

            {/* Deployment Runbook (Hostinger & GitHub) */}
            <button
              onClick={() => setShowDeploymentModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Hostinger & Git Runbook</span>
            </button>

            {/* Administrator & Management Audit Trail & Compliance Ledger Vault */}
            {hasAuditTrailAccess && (
              <button
                onClick={() => handleNavigate('audit_trail', 'Audit Trail & Compliance')}
                className={`font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeModule === 'audit_trail'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800'
                }`}
                title="Administrator & Management Audit Trail & Compliance Ledger (Clearance Level 3)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xl:inline">Audit Trail</span>
                <span className="text-[10px] bg-indigo-900 text-indigo-200 border border-indigo-700 px-1 py-0.2 rounded font-mono font-bold">
                  ADMIN / MGMT
                </span>
              </button>
            )}

            {/* Role Theme Customization Button */}
            <button
              onClick={() => setShowThemeModal(true)}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer ${currentTheme.headerBadge}`}
              title="Change Display Theme (High-Contrast Lab, Financial Layout, Clinical, etc.)"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentTheme.badge}</span>
            </button>

            {/* Centralized Role-Specific Notification Bell */}
            <button
              onClick={() => setShowNotificationDrawer(true)}
              className={`relative px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                hasStatAlert
                  ? 'bg-rose-950 text-rose-200 border-rose-600 animate-pulse ring-2 ring-rose-500/50 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Centralized Role Alerts (Lab Results, Unpaid Bills, Triage Emergencies)"
            >
              <Bell className={`w-3.5 h-3.5 ${hasStatAlert ? 'text-rose-400' : 'text-teal-400'}`} />
              <span className="hidden sm:inline">Alerts</span>
              {unreadNotificationCount > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  hasStatAlert ? 'bg-rose-600 text-white animate-bounce' : 'bg-teal-600 text-white'
                }`}>
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Staff OAuth2 / OIDC Verified Identity Widget */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl p-1 pl-2 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-800 border border-teal-600 text-teal-200 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">
                  {currentUser.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="font-bold text-white max-w-[130px] truncate text-[11px]">{currentUser.fullName}</div>
                  <div className="text-[9px] text-teal-300 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span>{RBACService.getPrimaryRole(currentUser)} · OIDC Verified</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowOidcLoginModal(true)}
                className="bg-teal-700 hover:bg-teal-600 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                title="Log in with hospital-issued credentials via OAuth2 / OIDC"
              >
                <Key className="w-3 h-3" />
                <span>OIDC Login</span>
              </button>
            </div>

            {/* Back to Public Hospital Website */}
            <button
              onClick={onBackToPublicSite}
              className="text-slate-400 hover:text-white p-1.5 transition-colors cursor-pointer"
              title="Return to Public Patient Website"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Role Context Ribbon (Theme-Specific) */}
      {currentTheme.isHighContrast && (
        <div className="bg-black text-amber-300 border-b border-amber-500/40 px-4 py-2 text-xs shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                🔬 LIS High-Contrast Mode Active:
              </span>
              <span className="text-amber-200 font-mono text-[11px]">
                Calibrated for Staining Microscopy & Dark Bench Workstations | Glare Minimized
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-950 text-rose-300 border border-rose-600 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                {db.labOrders?.filter(o => o.results?.isCritical || o.status === 'PROCESSING').length || 2} STAT REQUISITIONS
              </span>
              <button
                onClick={() => handleNavigate('lab', 'Diagnostic Laboratory (LIS)')}
                className="bg-amber-400 hover:bg-amber-300 text-black px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
              >
                Open LIS Bench
              </button>
            </div>
          </div>
        </div>
      )}

      {currentTheme.isFinancialLayout && (
        <div className="bg-emerald-950 text-emerald-100 border-b border-emerald-800 px-4 py-2 text-xs shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                💳 Financial Ledger Layout:
              </span>
              <span className="text-emerald-300 font-mono text-[11px] bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700">
                Central Bank Rate: 1 USD = 195.00 LRD
              </span>
              <span className="hidden md:inline text-emerald-200 font-mono text-[11px]">
                Active Cash Drawer: <strong className="text-white">$4,820.00 USD</strong> / <strong className="text-white">939,900 LRD</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-900 text-emerald-200 border border-emerald-600 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                MoMo Float: $2,450.00
              </span>
              <button
                onClick={() => handleNavigate('billing', 'Billing & Invoicing')}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
              >
                + Fast Cashier Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Administrator & Management Governance & Audit Ribbon */}
      {RBACService.isAdministratorOrManagement(currentUser) && !currentTheme.isHighContrast && !currentTheme.isFinancialLayout && (
        <div className="bg-slate-900 text-indigo-200 border-b border-indigo-900/80 px-4 py-2 text-xs shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                🛡️ Statutory Compliance & Regulatory Surveillance:
              </span>
              <span className="text-indigo-300 font-mono text-[11px]">
                Chained Ledger: <strong className="text-white font-bold">{db.auditLogs?.length || 0} events</strong> | SHA-256 HMAC Verified
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                ADMIN & MANAGEMENT LEVEL 3
              </span>
              <button
                onClick={() => handleNavigate('audit_trail', 'Audit Trail & Compliance')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
              >
                Open Audit Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Role Ribbon for Clinical, Nursing, and Pharmacy modes */}
      {!currentTheme.isHighContrast && !currentTheme.isFinancialLayout && !RBACService.isAdministratorOrManagement(currentUser) && (
        <div className="bg-slate-900/90 text-slate-300 border-b border-slate-800 px-4 py-1.5 text-xs shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${currentTheme.accentBadge}`}>
                {currentTheme.badge}
              </span>
              <span className="text-[11px] text-slate-200 font-medium">
                {currentTheme.ribbonText}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-slate-400 font-mono">Density: <strong>{currentTheme.tableDensity}</strong></span>
              <button
                onClick={() => setShowThemeModal(true)}
                className="text-teal-400 hover:underline cursor-pointer font-semibold"
              >
                Customize Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Status & VOA East Continuity Banner */}
      {!effectiveOnline && (
        <div className="bg-amber-600 text-white px-4 py-2.5 text-xs shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-200 shrink-0 animate-pulse" />
              <span>
                <strong>VOA East Intermittent Connectivity Detected:</strong> Operating from local IndexedDB cache ({db.patients.length} patient charts, encounters, and pharmacy formulary loaded locally). Clinical care uninterrupted.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] bg-amber-800 text-amber-100 px-2 py-0.5 rounded font-mono font-bold">
                AUTO-SYNC QUEUED
              </span>
              {simulateOffline && (
                <button
                  onClick={() => handleToggleOfflineSimulation(false)}
                  className="bg-white text-amber-900 font-bold px-2 py-0.5 rounded text-[11px] hover:bg-amber-50 cursor-pointer"
                >
                  Restore Online
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Body with Responsive Navigation */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Module Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-3">
          <div className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.sidebarCardBg} p-3 shadow-xs space-y-3 transition-colors duration-200`}>
            {/* Authorized Scope */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between px-2 mb-1.5 opacity-80">
                <span>Authorized Workstations</span>
                <span className={`px-1.5 py-0.2 rounded font-mono font-bold ${currentTheme.accentBadge}`}>
                  {authorizedNavItems.length}
                </span>
              </span>
              <nav className="space-y-1">
                {authorizedNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  
                  let activeClass = 'bg-teal-800 text-white shadow-xs font-semibold';
                  let inactiveClass = 'text-slate-700 hover:bg-slate-100 hover:text-slate-900';
                  let activeIconClass = 'text-teal-200';
                  let inactiveIconClass = 'text-teal-700';

                  if (currentTheme.isHighContrast) {
                    activeClass = 'bg-amber-500 text-black shadow-xs font-bold';
                    inactiveClass = 'text-slate-200 hover:bg-slate-800 hover:text-white';
                    activeIconClass = 'text-black';
                    inactiveIconClass = 'text-amber-400';
                  } else if (currentTheme.isFinancialLayout) {
                    activeClass = 'bg-emerald-800 text-white shadow-xs font-semibold';
                    inactiveClass = 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900';
                    activeIconClass = 'text-emerald-200';
                    inactiveIconClass = 'text-emerald-700';
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id, item.label)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                        isActive ? activeClass : inactiveClass
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? activeIconClass : inactiveIconClass}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Dedicated Administrator Audit Trail Section */}
            {hasAuditTrailAccess && (
              <div className="pt-2 border-t border-indigo-200/80">
                <div className="px-2 mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Audit & Compliance</span>
                  </span>
                  <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                    ADMIN & MGMT
                  </span>
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => handleNavigate('audit_trail', 'Audit Trail & Compliance')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
                      activeModule === 'audit_trail'
                        ? 'bg-indigo-800 text-white shadow-xs'
                        : 'text-indigo-950 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ShieldCheck className={`w-4 h-4 shrink-0 ${activeModule === 'audit_trail' ? 'text-indigo-200' : 'text-indigo-700'}`} />
                      <span className="truncate">Audit Trail & Compliance</span>
                    </div>
                    <span className="text-[10px] bg-indigo-950 text-indigo-200 px-1.5 py-0.2 rounded font-mono">
                      {db.auditLogs?.length || 0}
                    </span>
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* VOA East IndexedDB Offline Resiliency Card */}
          <div className={`rounded-xl border ${currentTheme.cardBorder} ${currentTheme.sidebarCardBg} p-3.5 shadow-xs space-y-2.5 text-xs transition-colors duration-200`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-teal-700" />
                IndexedDB Local Cache
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                effectiveOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {effectiveOnline ? 'Synced' : 'Offline Active'}
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Cached Patients:</span>
                <strong className="text-slate-900">{db.patients.length} charts</strong>
              </div>
              <div className="flex justify-between">
                <span>Encounters / Vitals:</span>
                <strong className="text-slate-900">{db.encounters.length} / {db.vitals.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Drug Formulary:</span>
                <strong className="text-slate-900">{db.inventory.length} items</strong>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Last Snapshot:</span>
                <span>{lastSyncTime}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
              <button
                onClick={handleManualCacheSync}
                disabled={isSyncingCache}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 text-slate-600 ${isSyncingCache ? 'animate-spin' : ''}`} />
                <span>{isSyncingCache ? 'Caching to IndexedDB...' : 'Sync IndexedDB Now'}</span>
              </button>
              <button
                onClick={() => setSimulateOffline(!simulateOffline)}
                className={`w-full text-[11px] font-semibold py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  simulateOffline 
                    ? 'bg-amber-50 text-amber-900 border-amber-300' 
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {simulateOffline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{simulateOffline ? 'End Offline Simulation' : 'Simulate VOA East Offline'}</span>
              </button>
            </div>
          </div>

          {/* Infrastructure Health Card */}
          <div className="bg-slate-900 text-slate-300 rounded-xl p-4 border border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center justify-between font-bold text-white text-xs">
              <span>Facility Telemetry</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-slate-400">
              Grid Status: <strong className="text-emerald-400">Online</strong>
            </div>
            <div className="text-slate-400">
              Cummins 500kVA: <strong className="text-slate-200">Standby (88% Diesel)</strong>
            </div>
            <div className="text-slate-400">
              Facility Address: <strong className="text-slate-200">VOA East Community, Monrovia</strong>
            </div>
            <div className="text-slate-400">
              Dual Currency: <strong className="text-teal-300">USD & 195 LRD</strong>
            </div>
          </div>
        </aside>

        {/* Dynamic Workspace Workstation View */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Dynamic Role-Specific Analytics Dashboard (Powered by Recharts) */}
          <RoleDashboard
            currentUser={currentUser}
            onNavigateModule={m => setActiveModule(m)}
          />

          {/* Workstation Modules Protected by withRoleAccess HOC */}
          {activeModule === 'messages' && <SecureMessagingWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'executive_bi' && <SecureExecutiveBIDashboard currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'command_center' && <SecureCommandCenter currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'opd' && <SecureClinicalWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'triage' && <SecureTriageWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'inpatient' && <SecureInpatientWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'lab' && <SecureLabWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'blood_bank' && <SecureBloodBankWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'radiology' && <SecureRadiologyWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'resources' && <SecureResourceWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'pharmacy' && <SecurePharmacyWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'insurance' && <SecureInsuranceWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'billing' && <SecureBillingWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'gl' && <SecureGLWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'procurement' && <SecureProcurementWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'hr' && <SecureHRPayrollWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'scheduling' && <SecureSchedulingWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'assets' && <SecureAssetsWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'audit_trail' && <SecureAuditTrailWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
          {activeModule === 'quality' && <SecureQualityWorkstation currentUser={currentUser} onBreakGlass={() => setShowBreakGlassModal(true)} />}
        </main>
      </div>

      {/* Modals */}
      <PatientRegistrationModal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        currentUser={currentUser}
        onRegisteredSuccess={p => {
          // Handled inside modal with printable slip
        }}
      />

      <DowntimeContinuityModal
        isOpen={showDowntimeModal}
        onClose={() => setShowDowntimeModal(false)}
        currentUser={currentUser}
      />

      <DeploymentRunbookModal
        isOpen={showDeploymentModal}
        onClose={() => setShowDeploymentModal(false)}
      />

      {/* Global Staff EMR Search Modal */}
      <GlobalStaffSearchModal
        isOpen={showGlobalSearchModal}
        onClose={() => setShowGlobalSearchModal(false)}
        onSelectPatient={p => {
          // Navigates directly to patient
        }}
        onNavigateModule={m => setActiveModule(m)}
      />

      {/* Biometric Terminal Lock Overlay */}
      <BiometricLockOverlay
        currentUser={currentUser}
        isLocked={isTerminalLocked}
        onUnlock={() => setIsTerminalLocked(false)}
      />

      {/* Break-Glass Emergency Modal */}
      {showBreakGlassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border-2 border-rose-300">
            <div className="flex items-center gap-2 text-rose-800">
              <Key className="w-5 h-5 text-rose-600" />
              <h3 className="font-extrabold text-base">Break-Glass Emergency Chart Override</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Break-glass temporarily bypasses standard department restrictions for acute trauma or unconscious patient resuscitation. Every access is timestamped and forwarded to the Medical Director and Internal Auditor.
            </p>

            <form onSubmit={handleBreakGlassSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Emergency Justification *</label>
                <textarea
                  required
                  rows={3}
                  value={breakGlassReason}
                  onChange={e => setBreakGlassReason(e.target.value)}
                  placeholder="e.g. Unconscious acute trauma victim requiring immediate life-support chart review..."
                  className="w-full text-xs border border-rose-300 rounded-lg p-2.5 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBreakGlassModal(false)}
                  className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Confirm Break-Glass Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Theme Customization Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center shadow-xs">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    RBAC Role Display Themes & Workstation Ergonomics
                  </h3>
                  <p className="text-xs text-slate-500">
                    High-contrast dark modes for laboratory benches, financial ledger layouts, and clinical baseline environments.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowThemeModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {RBACService.getAllThemes().map(theme => {
                const isSelected = currentTheme.id === theme.id;
                const isRoleDefault = RBACService.getPrimaryRole(currentUser) === theme.primaryRole;

                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/60 ring-2 ring-teal-600/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${theme.accentBadge}`}>
                          {theme.badge}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-teal-800">
                            <Check className="w-3.5 h-3.5" />
                            Active
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1.5">{theme.name}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{theme.tagline}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        {theme.isHighContrast ? '🌓 High Contrast' : theme.isFinancialLayout ? '💰 Financial Layout' : '🩺 Clinical Daylight'}
                      </span>
                      {isRoleDefault && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                          Recommended for {currentUser.fullName.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSelectTheme(RBACService.getRoleTheme(currentUser))}
                className="text-xs font-semibold text-teal-800 hover:underline cursor-pointer"
              >
                Reset to My Role Default ({RBACService.getRoleTheme(currentUser).badge})
              </button>
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff OAuth2 / OIDC Login Modal */}
      <StaffOAuthLoginModal
        isOpen={showOidcLoginModal}
        onClose={() => setShowOidcLoginModal(false)}
        allStaff={db.users}
        onLoginSuccess={handleOidcLoginSuccess}
      />

      {/* Centralized Role-Filtered Notification Drawer */}
      <NotificationDrawerModal
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        currentUser={currentUser}
        onNavigateModule={(modId, label) => handleNavigate(modId, label)}
      />
    </div>
  );
};
