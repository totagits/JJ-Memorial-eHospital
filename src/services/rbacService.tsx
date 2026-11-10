import React from 'react';
import { ShieldAlert, KeyRound, AlertTriangle, UserCheck, Lock } from 'lucide-react';
import { UserAccount, UserRole } from '../types/auth';

/**
 * Enterprise Canonical Roles
 * Tailored for clinical and administrative segregation of duties (SoD)
 */
export type PrimaryRole = 
  | 'LIS'          // Medical Laboratory Scientist / Pathology / Blood Bank
  | 'Billing'      // Cashier, Patient Accounts, Revenue Cycle, Finance
  | 'Clinician'    // Attending Physician, Outpatient OPD, Doctors, Specialists
  | 'Nurse'        // Triage, Inpatient Wards, Nursing Care
  | 'Pharmacy'     // Lead Clinical Pharmacist, Formulary, Dispense
  | 'Admin'        // IT Security Admin, System Admin
  | 'Management'   // Executive CEO, Medical Director, Quality Auditor, Hospital Leadership
  | 'Radiology';   // Medical Imaging, PACS Technologist

export type AccessLevel = 'NONE' | 'READ' | 'WRITE' | 'ADMIN';

// Role mapping matrix: maps all detailed system roles to canonical primary roles
export const PRIMARY_ROLE_MAP: Record<UserRole | string, PrimaryRole> = {
  // 1. Diagnostic Laboratory (LIS)
  lab_scientist: 'LIS',
  LIS: 'LIS',
  Laboratory: 'LIS',

  // 2. Billing & Accounts (Finance / Cashier)
  cashier_billing: 'Billing',
  finance_accountant: 'Billing',
  front_desk_registration: 'Billing',
  hr_payroll: 'Billing',
  Billing: 'Billing',
  Finance: 'Billing',

  // 3. Clinician (Doctors / Outpatient EMR)
  physician: 'Clinician',
  Clinician: 'Clinician',
  Doctor: 'Clinician',

  // 4. Nursing Care
  head_nurse: 'Nurse',
  nurse_triage: 'Nurse',
  Nurse: 'Nurse',

  // 5. Pharmacy & Formulary
  pharmacist: 'Pharmacy',
  procurement_stores: 'Pharmacy',
  Pharmacy: 'Pharmacy',

  // 6. Medical Imaging & Radiology
  radiologist_technologist: 'Radiology',
  Radiology: 'Radiology',

  // 7. Executive Management & Clinical Governance
  executive_ceo: 'Management',
  medical_director: 'Management',
  quality_auditor: 'Management',
  Management: 'Management',
  management: 'Management',
  hospital_management: 'Management',

  // 8. Administration & IT Security
  it_security_admin: 'Admin',
  biomedical_facilities: 'Admin',
  Admin: 'Admin',
  admin: 'Admin',
  Administrator: 'Admin',

  // Fallback
  patient: 'Nurse',
};

/**
 * Module Access Matrix per Primary Role
 * Strictly defines access levels for all 20 clinical, financial, and operations modules.
 * Ensures complete Segregation of Duties (SoD) and Administrator/Management compliance access.
 */
export const MODULE_ACCESS_MATRIX: Record<string, Record<PrimaryRole, AccessLevel>> = {
  // 1. Diagnostic Laboratory (LIS)
  lab: {
    LIS: 'ADMIN',
    Clinician: 'WRITE',
    Nurse: 'READ',
    Admin: 'ADMIN',
    Management: 'READ',
    Pharmacy: 'READ',
    Radiology: 'READ',
    Billing: 'NONE', // Billing staff have NO access to Laboratory LIS
  },

  // 2. Blood Bank & Transfusions
  blood_bank: {
    LIS: 'ADMIN',
    Clinician: 'WRITE',
    Nurse: 'WRITE',
    Admin: 'ADMIN',
    Management: 'READ',
    Pharmacy: 'READ',
    Radiology: 'NONE',
    Billing: 'NONE',
  },

  // 3. Patient Billing & Invoicing (Strictly Segregated to Finance / Cashier)
  billing: {
    Billing: 'ADMIN',
    Admin: 'ADMIN',
    Management: 'READ',
    LIS: 'NONE',       // Laboratory Scientist has ZERO access to Billing
    Clinician: 'NONE', // Clinicians have ZERO access to Billing invoices
    Nurse: 'NONE',     // Nurses have ZERO access to Billing invoices
    Radiology: 'NONE',
    Pharmacy: 'NONE',  // Pharmacy staff have ZERO access to Billing invoices
  },

  // 4. General Ledger (GL) & Financial Accounts
  gl: {
    Billing: 'ADMIN',
    Admin: 'ADMIN',
    Management: 'READ',
    LIS: 'NONE',       // Laboratory Scientist has ZERO access to General Ledger
    Clinician: 'NONE',
    Nurse: 'NONE',
    Pharmacy: 'NONE',
    Radiology: 'NONE',
  },

  // 5. Insurance Verification & Payer Gateway
  insurance: {
    Billing: 'ADMIN',
    Admin: 'ADMIN',
    Management: 'READ',
    Clinician: 'READ',
    Nurse: 'READ',
    Pharmacy: 'READ',
    LIS: 'NONE',
    Radiology: 'NONE',
  },

  // 6. HR, Staff & Payroll
  hr: {
    Billing: 'ADMIN',
    Admin: 'ADMIN',
    Management: 'ADMIN',
    LIS: 'NONE',
    Clinician: 'NONE',
    Nurse: 'NONE',
    Pharmacy: 'NONE',
    Radiology: 'NONE',
  },

  // 7. Outpatient (OPD) & Clinical EMR Charts (Doctors & Clinicians)
  opd: {
    Clinician: 'ADMIN',
    Nurse: 'WRITE',
    Admin: 'ADMIN',
    Management: 'READ',
    Billing: 'NONE',   // Billing / Finance has ZERO access to Clinical Charts
    Pharmacy: 'NONE',  // Pharmacy has ZERO access to Clinical Consults
    LIS: 'NONE',       // Laboratory Scientist has ZERO access to OPD clinical encounters
    Radiology: 'NONE',
  },

  // 8. Triage & Acute Nursing Assessment
  triage: {
    Nurse: 'ADMIN',
    Clinician: 'ADMIN',
    Admin: 'ADMIN',
    Management: 'READ',
    Billing: 'NONE',   // Billing / Finance has ZERO access to Triage Vitals
    Pharmacy: 'NONE',
    LIS: 'NONE',
    Radiology: 'NONE',
  },

  // 9. Inpatient Wards & Beds (ADT)
  inpatient: {
    Nurse: 'ADMIN',
    Clinician: 'WRITE',
    Admin: 'ADMIN',
    Management: 'READ',
    Billing: 'NONE',   // Billing / Finance has ZERO access to Inpatient Wards & Charts
    Pharmacy: 'READ',
    LIS: 'NONE',
    Radiology: 'NONE',
  },

  // 10. Radiology & Medical Imaging (PACS)
  radiology: {
    Radiology: 'ADMIN',
    Clinician: 'WRITE',
    Nurse: 'READ',
    Admin: 'ADMIN',
    Management: 'READ',
    LIS: 'READ',
    Billing: 'NONE',
    Pharmacy: 'NONE',
  },

  // 11. Pharmacy Formulary & Drug Dispense
  pharmacy: {
    Pharmacy: 'ADMIN',
    Clinician: 'WRITE',
    Nurse: 'READ',
    Admin: 'ADMIN',
    Management: 'READ',
    Billing: 'READ',
    LIS: 'NONE',
    Radiology: 'NONE',
  },

  // 12. Central Procurement & Stores
  procurement: {
    Pharmacy: 'ADMIN',
    Billing: 'WRITE',
    Admin: 'ADMIN',
    Management: 'READ',
    LIS: 'READ',
    Radiology: 'READ',
    Clinician: 'READ',
    Nurse: 'READ',
  },

  // 13. Biomedical Resources & Equipment
  resources: {
    Admin: 'ADMIN',
    Management: 'READ',
    Clinician: 'WRITE',
    Nurse: 'WRITE',
    Radiology: 'WRITE',
    LIS: 'READ',
    Pharmacy: 'READ',
    Billing: 'READ',
  },

  // 14. Staff Shift Scheduling & Rosters
  scheduling: {
    Nurse: 'ADMIN',
    Clinician: 'WRITE',
    Admin: 'ADMIN',
    Management: 'ADMIN',
    Billing: 'READ',
    Pharmacy: 'READ',
    LIS: 'READ',
    Radiology: 'READ',
  },

  // 15. Biomedical Engineering & Facilities
  assets: {
    Admin: 'ADMIN',
    Management: 'READ',
    Pharmacy: 'WRITE',
    Clinician: 'READ',
    Nurse: 'READ',
    LIS: 'READ',
    Radiology: 'READ',
    Billing: 'READ',
  },

  // 16. Quality & Safety Incident Management
  quality: {
    Admin: 'ADMIN',
    Management: 'ADMIN',
    LIS: 'WRITE',
    Clinician: 'WRITE',
    Nurse: 'WRITE',
    Pharmacy: 'WRITE',
    Billing: 'WRITE',
    Radiology: 'WRITE',
  },

  // 17. Immutable Audit Trail & Regulatory Surveillance (Administrator & Management)
  audit_trail: {
    Admin: 'ADMIN',
    Management: 'ADMIN', // Executive Management has full audit & compliance review clearance
    Billing: 'NONE',   // Explicitly blocked: Administrators & Management only
    Clinician: 'NONE', // Explicitly blocked: Administrators & Management only
    LIS: 'NONE',       // Explicitly blocked: Administrators & Management only
    Nurse: 'NONE',     // Explicitly blocked: Administrators & Management only
    Pharmacy: 'NONE',  // Explicitly blocked: Administrators & Management only
    Radiology: 'NONE', // Explicitly blocked: Administrators & Management only
  },

  // 18. Executive Intelligence (BI)
  executive_bi: {
    Admin: 'ADMIN',
    Management: 'ADMIN',
    Billing: 'WRITE',
    Clinician: 'READ',
    LIS: 'NONE',
    Nurse: 'NONE',
    Pharmacy: 'NONE',
    Radiology: 'NONE',
  },

  // 19. Facility Command Center & Telemetry
  command_center: {
    Admin: 'ADMIN',
    Management: 'ADMIN',
    Clinician: 'READ',
    Nurse: 'READ',
    Billing: 'READ',
    Pharmacy: 'READ',
    LIS: 'READ',
    Radiology: 'READ',
  },

  // 20. Intra-Departmental Staff Messaging
  messages: {
    LIS: 'ADMIN',
    Billing: 'ADMIN',
    Clinician: 'ADMIN',
    Nurse: 'ADMIN',
    Pharmacy: 'ADMIN',
    Admin: 'ADMIN',
    Management: 'ADMIN',
    Radiology: 'ADMIN',
  },
};

const ACCESS_LEVEL_PRIORITY: Record<AccessLevel, number> = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  ADMIN: 3,
};

/**
 * RBACService manages user roles, permissions, and dynamic workstation visibility.
 */
export const RBACService = {
  /**
   * Resolve any user's role to one of the canonical primary roles:
   * 'LIS', 'Billing', 'Clinician', 'Nurse', 'Pharmacy', 'Admin', 'Radiology'
   */
  getPrimaryRole(userOrRole?: UserAccount | UserRole | string): PrimaryRole {
    if (!userOrRole) return 'Clinician';
    const roleString = typeof userOrRole === 'object' ? userOrRole.role : userOrRole;
    return PRIMARY_ROLE_MAP[roleString] || 'Clinician';
  },

  /**
   * Get the access level for a role on a specific module
   */
  getAccessLevel(userOrRole?: UserAccount | UserRole | string, moduleId: string = ''): AccessLevel {
    const primaryRole = this.getPrimaryRole(userOrRole);
    const moduleRules = MODULE_ACCESS_MATRIX[moduleId];
    if (!moduleRules) return 'READ';
    return moduleRules[primaryRole] || 'NONE';
  },

  /**
   * Check if user meets or exceeds the required access level
   */
  hasAccess(
    userOrRole?: UserAccount | UserRole | string,
    moduleId: string = '',
    requiredLevel: AccessLevel = 'READ'
  ): boolean {
    const userLevel = this.getAccessLevel(userOrRole, moduleId);
    return ACCESS_LEVEL_PRIORITY[userLevel] >= ACCESS_LEVEL_PRIORITY[requiredLevel];
  },

  /**
   * Check if user has write/record creation permission
   */
  canWrite(userOrRole?: UserAccount | UserRole | string, moduleId: string = ''): boolean {
    return this.hasAccess(userOrRole, moduleId, 'WRITE');
  },

  /**
   * Check if user has administrative/sign-off permission
   */
  canAdminister(userOrRole?: UserAccount | UserRole | string, moduleId: string = ''): boolean {
    return this.hasAccess(userOrRole, moduleId, 'ADMIN');
  },

  /**
   * Dynamic Sidebar Navigation Filter:
   * Returns ONLY the list of module IDs the user is authorized to see (accessLevel >= READ).
   * Unrelated modules are completely filtered out.
   */
  getAuthorizedModules(userOrRole?: UserAccount | UserRole | string): string[] {
    const primaryRole = this.getPrimaryRole(userOrRole);
    return Object.keys(MODULE_ACCESS_MATRIX).filter(moduleId => {
      const level = MODULE_ACCESS_MATRIX[moduleId]?.[primaryRole];
      return level && level !== 'NONE';
    });
  },

  /**
   * Get the default landing workstation for any user role
   */
  getPrimaryWorkstation(userOrRole?: UserAccount | UserRole | string): string {
    const primaryRole = this.getPrimaryRole(userOrRole);
    switch (primaryRole) {
      case 'LIS': return 'lab';
      case 'Billing': return 'billing';
      case 'Clinician': return 'opd';
      case 'Nurse': return 'triage';
      case 'Pharmacy': return 'pharmacy';
      case 'Radiology': return 'radiology';
      case 'Admin': return 'audit_trail';
      case 'Management': return 'audit_trail';
      default: return 'opd';
    }
  },

  /**
   * Returns true if user has Administrator or Management clearance to review compliance audit logs
   */
  isAdministratorOrManagement(userOrRole?: UserAccount | UserRole | string): boolean {
    const primaryRole = this.getPrimaryRole(userOrRole);
    return primaryRole === 'Admin' || primaryRole === 'Management';
  },

  /**
   * Get all authorized roles for a given module at a given level
   */
  getAuthorizedRolesForModule(moduleId: string, minLevel: AccessLevel = 'READ'): PrimaryRole[] {
    const moduleRules = MODULE_ACCESS_MATRIX[moduleId];
    if (!moduleRules) return ['Admin', 'Management', 'Clinician'];
    const minPriority = ACCESS_LEVEL_PRIORITY[minLevel];
    return (Object.keys(moduleRules) as PrimaryRole[]).filter(
      role => ACCESS_LEVEL_PRIORITY[moduleRules[role]] >= minPriority
    );
  },

  /**
   * Role-Based UI Theme Resolution:
   * Returns tailored theme configuration for the user's role (e.g., High-Contrast for Laboratory, Financial Layout for Billing)
   */
  getRoleTheme(userOrRole?: UserAccount | UserRole | string): RoleThemeConfig {
    const primaryRole = this.getPrimaryRole(userOrRole);
    return ROLE_THEMES[primaryRole] || ROLE_THEMES.Clinician;
  },

  /**
   * Retrieve theme by its unique theme identifier
   */
  getThemeById(themeId: RoleThemeId): RoleThemeConfig {
    const theme = Object.values(ROLE_THEMES).find(t => t.id === themeId);
    return theme || ROLE_THEMES.Clinician;
  },

  /**
   * List all available role themes
   */
  getAllThemes(): RoleThemeConfig[] {
    return Object.values(ROLE_THEMES);
  },
};

export type RoleThemeId = 
  | 'lab-high-contrast' 
  | 'billing-financial' 
  | 'clinical-daylight' 
  | 'nursing-calm' 
  | 'admin-executive' 
  | 'management-oversight'
  | 'radiology-dark'
  | 'pharmacy-amber';

export interface RoleThemeConfig {
  id: RoleThemeId;
  primaryRole: PrimaryRole;
  name: string;
  tagline: string;
  badge: string;
  isHighContrast: boolean;
  isFinancialLayout: boolean;
  isDataDense: boolean;
  tableDensity: 'compact' | 'ultra-dense' | 'comfortable' | 'high-contrast';
  fontSize: 'compact' | 'standard' | 'large';
  workspaceBg: string;
  headerBg: string;
  headerBorder: string;
  headerBadge: string;
  sidebarBg: string;
  sidebarBorder: string;
  sidebarCardBg: string;
  mainBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
  accentBadge: string;
  accentButton: string;
  ribbonText: string;
  ribbonType?: 'LAB_CONTRAST' | 'FINANCIAL_RECON' | 'ADMIN_AUDIT' | 'MANAGEMENT_OVERSIGHT' | 'CLINICAL_QUEUE';
}

export const ROLE_THEMES: Record<PrimaryRole, RoleThemeConfig> = {
  // 1. Diagnostic Laboratory (LIS) — High-Contrast Dark Bench Mode
  LIS: {
    id: 'lab-high-contrast',
    primaryRole: 'LIS',
    name: 'Laboratory High-Contrast (Microscopy Bench)',
    tagline: 'Deep black & fluorescent amber/cyan calibrated for dark benches, Gram staining & panic values',
    badge: 'LIS HIGH-CONTRAST',
    isHighContrast: true,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'high-contrast',
    fontSize: 'standard',
    workspaceBg: 'bg-black text-amber-100',
    headerBg: 'bg-black text-amber-300 border-b-2 border-amber-500',
    headerBorder: 'border-amber-500',
    headerBadge: 'bg-amber-950 text-amber-300 border-2 border-amber-400 font-mono font-black',
    sidebarBg: 'bg-slate-950 border-r-2 border-amber-900/60',
    sidebarBorder: 'border-amber-900/60',
    sidebarCardBg: 'bg-black border border-amber-500/50 text-amber-200',
    mainBg: 'bg-black',
    cardBg: 'bg-slate-950 border-2 border-amber-500/60 text-amber-100 shadow-lg',
    cardBorder: 'border-amber-500/60',
    textPrimary: 'text-white',
    textSecondary: 'text-amber-200',
    accentColor: 'text-cyan-300',
    accentBadge: 'bg-cyan-950 text-cyan-200 border border-cyan-400 font-mono font-bold',
    accentButton: 'bg-amber-400 hover:bg-amber-300 text-black font-black shadow-md',
    ribbonText: '🔬 LIS HIGH-CONTRAST BENCH MODE — Fluorescent dark-room calibration for Gram stains, panic lab values, and specimen processing.',
    ribbonType: 'LAB_CONTRAST',
  },

  // 2. Billing & Accounts — Condensed Financial Ledger & Cashier Layout
  Billing: {
    id: 'billing-financial',
    primaryRole: 'Billing',
    name: 'Financial Ledger & Cashier (Condensed View)',
    tagline: 'Ultra-dense dual-currency ledger with tight tables and rapid invoice reconciliation',
    badge: 'FINANCIAL LEDGER (CONDENSED)',
    isHighContrast: false,
    isFinancialLayout: true,
    isDataDense: true,
    tableDensity: 'ultra-dense',
    fontSize: 'compact',
    workspaceBg: 'bg-emerald-950/10 text-slate-900',
    headerBg: 'bg-emerald-950 text-emerald-100 border-b border-emerald-800',
    headerBorder: 'border-emerald-800',
    headerBadge: 'bg-emerald-900 text-emerald-200 border border-emerald-600 font-mono font-bold',
    sidebarBg: 'bg-white border-r border-emerald-200',
    sidebarBorder: 'border-emerald-200',
    sidebarCardBg: 'bg-emerald-50/80 border border-emerald-300 text-slate-900',
    mainBg: 'bg-slate-50',
    cardBg: 'bg-white border border-emerald-300 text-slate-900 shadow-xs',
    cardBorder: 'border-emerald-300',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-emerald-900',
    accentColor: 'text-emerald-700',
    accentBadge: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold',
    accentButton: 'bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs',
    ribbonText: '💵 CONDENSED FINANCIAL LEDGER VIEW — High-density layout active. Dual currency pegged at $1 USD : 195 LRD. Rapid cashier reconciliation.',
    ribbonType: 'FINANCIAL_RECON',
  },

  // 3. Hospital Management & Clinical Governance — Executive Oversight
  Management: {
    id: 'management-oversight',
    primaryRole: 'Management',
    name: 'Hospital Management & Governance (Audit View)',
    tagline: 'Executive oversight, regulatory audit ledger access, clinical KPIs & resource telemetry',
    badge: 'MANAGEMENT OVERSIGHT',
    isHighContrast: false,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'comfortable',
    fontSize: 'standard',
    workspaceBg: 'bg-slate-100 text-slate-900',
    headerBg: 'bg-indigo-950 text-indigo-100 border-b border-indigo-800',
    headerBorder: 'border-indigo-800',
    headerBadge: 'bg-indigo-900 text-indigo-200 border border-indigo-700 font-mono font-bold',
    sidebarBg: 'bg-white border-r border-indigo-100',
    sidebarBorder: 'border-indigo-100',
    sidebarCardBg: 'bg-indigo-50/70 border border-indigo-200 text-slate-800',
    mainBg: 'bg-slate-100',
    cardBg: 'bg-white border border-indigo-200 text-slate-900 shadow-xs',
    cardBorder: 'border-indigo-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-indigo-950',
    accentColor: 'text-indigo-700',
    accentBadge: 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-mono font-bold',
    accentButton: 'bg-indigo-700 hover:bg-indigo-800 text-white font-bold shadow-xs',
    ribbonText: '🏛️ MANAGEMENT & GOVERNANCE VIEW — Executive oversight mode. Clearance granted for Central Audit Trail & Compliance Vault.',
    ribbonType: 'MANAGEMENT_OVERSIGHT',
  },

  // 4. Administrator & IT Security — Regulatory Surveillance Vault
  Admin: {
    id: 'admin-executive',
    primaryRole: 'Admin',
    name: 'IT Security Administrator & Regulatory Vault',
    tagline: 'Clearance Level 3 with immutable HMAC chained audit verification & system telemetry',
    badge: 'ADMIN AUDIT VAULT',
    isHighContrast: false,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'compact',
    fontSize: 'standard',
    workspaceBg: 'bg-slate-100 text-slate-900',
    headerBg: 'bg-slate-950 text-white border-b border-indigo-900/60',
    headerBorder: 'border-indigo-900/60',
    headerBadge: 'bg-indigo-950 text-indigo-300 border border-indigo-700 font-mono font-bold',
    sidebarBg: 'bg-white border-r border-slate-200',
    sidebarBorder: 'border-slate-200',
    sidebarCardBg: 'bg-slate-50 border border-slate-200 text-slate-800',
    mainBg: 'bg-slate-100',
    cardBg: 'bg-white border border-slate-200 text-slate-900 shadow-xs',
    cardBorder: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    accentColor: 'text-indigo-600',
    accentBadge: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    accentButton: 'bg-indigo-700 hover:bg-indigo-800 text-white font-semibold shadow-xs',
    ribbonText: '🛡️ SECURITY & COMPLIANCE VAULT — Clearance Level 3 active. Real-time SHA-256 HMAC chained ledger monitoring and break-glass surveillance unlocked.',
    ribbonType: 'ADMIN_AUDIT',
  },

  // 5. Clinician — Clinical Daylight Mode
  Clinician: {
    id: 'clinical-daylight',
    primaryRole: 'Clinician',
    name: 'Clinical Daylight (Evidence-Based EMR)',
    tagline: 'Teal & hospital slate typography calibrated for acute consults, triage & ICD-11 coding',
    badge: 'CLINICAL EMR',
    isHighContrast: false,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'comfortable',
    fontSize: 'standard',
    workspaceBg: 'bg-slate-100 text-slate-900',
    headerBg: 'bg-slate-900 text-white border-b border-slate-800',
    headerBorder: 'border-slate-800',
    headerBadge: 'bg-teal-950 text-teal-300 border border-teal-800 font-mono font-bold',
    sidebarBg: 'bg-white border-r border-slate-200',
    sidebarBorder: 'border-slate-200',
    sidebarCardBg: 'bg-white border border-slate-200 text-slate-800',
    mainBg: 'bg-slate-100',
    cardBg: 'bg-white border border-slate-200 text-slate-900 shadow-xs',
    cardBorder: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    accentColor: 'text-teal-700',
    accentBadge: 'bg-teal-50 text-teal-700 border border-teal-200',
    accentButton: 'bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs',
    ribbonText: '🩺 EVIDENCE-BASED CLINICAL DAYLIGHT — High-readability font rendering for clinical consultations and diagnostic precision.',
    ribbonType: 'CLINICAL_QUEUE',
  },

  // 6. Nursing Care — Triage Calm
  Nurse: {
    id: 'nursing-calm',
    primaryRole: 'Nurse',
    name: 'Triage Calm & Inpatient ADT',
    tagline: 'Cyan telemetry & acute bed status monitoring with high triage color recognition',
    badge: 'WARD NURSING',
    isHighContrast: false,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'comfortable',
    fontSize: 'standard',
    workspaceBg: 'bg-sky-50/30 text-slate-900',
    headerBg: 'bg-sky-950 text-sky-100 border-b border-sky-800',
    headerBorder: 'border-sky-800',
    headerBadge: 'bg-sky-900 text-sky-300 border border-sky-700 font-mono font-bold',
    sidebarBg: 'bg-white border-r border-sky-200',
    sidebarBorder: 'border-sky-200',
    sidebarCardBg: 'bg-sky-50/60 border border-sky-200 text-slate-800',
    mainBg: 'bg-slate-50',
    cardBg: 'bg-white border border-sky-200 text-slate-900 shadow-xs',
    cardBorder: 'border-sky-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    accentColor: 'text-sky-700',
    accentBadge: 'bg-sky-50 text-sky-700 border border-sky-200',
    accentButton: 'bg-sky-700 hover:bg-sky-800 text-white font-semibold shadow-xs',
    ribbonText: '🫀 NURSING STATION & TRIAGE CALM — Rapid bed turnover telemetry, acute acuity flags, and vitals monitoring.',
    ribbonType: 'CLINICAL_QUEUE',
  },

  // 7. Pharmacy & Therapeutics
  Pharmacy: {
    id: 'pharmacy-amber',
    primaryRole: 'Pharmacy',
    name: 'Formulary & Dispensary Safety',
    tagline: 'Amber alerts for stockout prevention, drug interaction screening & FEFO batch tracking',
    badge: 'PHARMACY DISPENSE',
    isHighContrast: false,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'comfortable',
    fontSize: 'standard',
    workspaceBg: 'bg-amber-50/20 text-slate-900',
    headerBg: 'bg-amber-950 text-amber-100 border-b border-amber-800',
    headerBorder: 'border-amber-800',
    headerBadge: 'bg-amber-900 text-amber-300 border border-amber-700 font-mono font-bold',
    sidebarBg: 'bg-white border-r border-amber-200',
    sidebarBorder: 'border-amber-200',
    sidebarCardBg: 'bg-amber-50/60 border border-amber-200 text-slate-800',
    mainBg: 'bg-slate-50',
    cardBg: 'bg-white border border-amber-200 text-slate-900 shadow-xs',
    cardBorder: 'border-amber-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-amber-900',
    accentColor: 'text-amber-700',
    accentBadge: 'bg-amber-100 text-amber-800 border border-amber-300',
    accentButton: 'bg-amber-700 hover:bg-amber-800 text-white font-semibold shadow-xs',
    ribbonText: '💊 PHARMACY FORMULARY & DISPENSING — High-visibility amber warnings, stockout velocity, and drug interaction safeguards.',
    ribbonType: 'CLINICAL_QUEUE',
  },

  // 8. Radiology & Medical Imaging
  Radiology: {
    id: 'radiology-dark',
    primaryRole: 'Radiology',
    name: 'PACS Imaging & Diagnostic Darkroom',
    tagline: 'DICOM grayscale calibrated, low-glare darkroom interface for digital radiography review',
    badge: 'PACS DARKROOM',
    isHighContrast: true,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'high-contrast',
    fontSize: 'standard',
    workspaceBg: 'bg-zinc-950 text-zinc-100',
    headerBg: 'bg-black text-sky-300 border-b border-sky-800',
    headerBorder: 'border-sky-800',
    headerBadge: 'bg-sky-950 text-sky-300 border border-sky-700 font-mono font-bold',
    sidebarBg: 'bg-zinc-900 border-r border-zinc-800',
    sidebarBorder: 'border-zinc-800',
    sidebarCardBg: 'bg-zinc-950 border border-zinc-800 text-zinc-200',
    mainBg: 'bg-zinc-950',
    cardBg: 'bg-zinc-900 border border-zinc-700 text-zinc-100 shadow-md',
    cardBorder: 'border-zinc-700',
    textPrimary: 'text-white',
    textSecondary: 'text-zinc-300',
    accentColor: 'text-sky-400',
    accentBadge: 'bg-sky-950 text-sky-300 border border-sky-700',
    accentButton: 'bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-sm',
    ribbonText: '🩻 PACS DARKROOM REVIEW — DICOM-calibrated darkroom palette for radiographic inspection.',
    ribbonType: 'LAB_CONTRAST',
  },
};

/**
 * withRoleAccess Higher-Order Component (HOC)
 * Wraps staff workstation modules to enforce RBAC permissions before rendering.
 */
export function withRoleAccess<P extends object = {}>(
  WrappedComponent: React.ComponentType<P>,
  moduleId: string,
  requiredLevel: AccessLevel = 'READ',
  moduleName?: string
): React.FC<P & { currentUser?: UserAccount; onBreakGlass?: () => void }> {
  const ComponentWithRoleAccess: React.FC<P & { currentUser?: UserAccount; onBreakGlass?: () => void }> = (props) => {
    const { currentUser, onBreakGlass, ...rest } = props;
    const hasPermission = RBACService.hasAccess(currentUser, moduleId, requiredLevel);

    if (!hasPermission) {
      const primaryRole = RBACService.getPrimaryRole(currentUser);
      const authorizedRoles = RBACService.getAuthorizedRolesForModule(moduleId, requiredLevel);
      const friendlyName = moduleName || moduleId.toUpperCase();

      return (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-sm space-y-6 max-w-4xl mx-auto my-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-900 text-rose-200 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-mono">
                  RBAC POLICY BOUNDARY ENFORCED ({requiredLevel})
                </span>
                <span className="text-xs font-mono text-slate-400">MODULE: {moduleId}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Access Restricted: {friendlyName}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Under J & J Memorial clinical governance and statutory Segregation of Duties (SoD), your active role (<strong className="text-slate-800">{primaryRole}</strong>) is strictly segregated from this workstation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Your Credentials & Access Level
              </span>
              <p><span className="font-semibold text-slate-700">Staff Member:</span> {currentUser?.fullName || 'Active User'}</p>
              <p><span className="font-semibold text-slate-700">Enterprise Role:</span> {primaryRole} ({currentUser?.role})</p>
              <p><span className="font-semibold text-slate-700">Access for {moduleId}:</span> <span className="font-mono text-rose-700 font-bold">{RBACService.getAccessLevel(currentUser, moduleId)}</span></p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Authorized Personnel
              </span>
              <p className="text-amber-900">
                Minimum access level required: <strong className="font-mono font-bold text-amber-950">{requiredLevel}</strong>
              </p>
              <p className="text-slate-600">
                Authorized roles for this workstation: <strong className="text-slate-800">{authorizedRoles.join(', ')}</strong>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Need emergency resuscitation access? Break-glass override is available for acute trauma cases.
            </p>
            {onBreakGlass && (
              <button
                onClick={onBreakGlass}
                className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Emergency Break-Glass</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return <WrappedComponent {...(rest as any)} currentUser={currentUser} />;
  };

  ComponentWithRoleAccess.displayName = `withRoleAccess(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return ComponentWithRoleAccess;
}
