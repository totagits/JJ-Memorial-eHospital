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
  isDarkSidebar: boolean;
  isFinancialLayout: boolean;
  isDataDense: boolean;
  tableDensity: 'compact' | 'ultra-dense' | 'comfortable' | 'high-contrast';
  fontSize: 'compact' | 'standard' | 'large';
  // Structural layout spacing & border geometry
  mainContainerPadding: string;
  layoutGap: string;
  sidebarWidth: string;
  sidebarPadding: string;
  navSpacing: string;
  navItemPadding: string;
  cardRadius: string;
  borderWidth: string;
  dividerClass: string;
  // Color palette tokens
  workspaceBg: string;
  headerBg: string;
  headerBorder: string;
  headerBadge: string;
  sidebarBg: string;
  sidebarBorder: string;
  sidebarCardBg: string;
  sidebarSectionLabel: string;
  navActiveClass: string;
  navInactiveClass: string;
  navActiveIconClass: string;
  navInactiveIconClass: string;
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
    name: 'High-Contrast Lab (Microscopy Bench)',
    tagline: 'Pure black canvas, double-weight amber borders & high-legibility dark bench spacing',
    badge: 'HIGH-CONTRAST LAB',
    isHighContrast: true,
    isDarkSidebar: true,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'high-contrast',
    fontSize: 'standard',
    mainContainerPadding: 'px-5 py-7',
    layoutGap: 'gap-7',
    sidebarWidth: 'md:w-72',
    sidebarPadding: 'p-4',
    navSpacing: 'space-y-2',
    navItemPadding: 'px-3.5 py-2.5',
    cardRadius: 'rounded-md',
    borderWidth: 'border-2',
    dividerClass: 'border-amber-500/40',
    workspaceBg: 'bg-black text-amber-100',
    headerBg: 'bg-black text-amber-300 border-b-2 border-amber-400',
    headerBorder: 'border-amber-400',
    headerBadge: 'bg-amber-950 text-amber-300 border-2 border-amber-400 font-mono font-black',
    sidebarBg: 'bg-zinc-950 border-2 border-amber-400/80 text-amber-100',
    sidebarBorder: 'border-amber-400/80',
    sidebarCardBg: 'bg-zinc-950 text-amber-100',
    sidebarSectionLabel: 'text-amber-300',
    navActiveClass: 'bg-amber-400 text-black font-black border-2 border-amber-200 shadow-sm',
    navInactiveClass: 'text-amber-100 hover:bg-zinc-900 hover:text-cyan-300 border border-transparent hover:border-amber-500/40',
    navActiveIconClass: 'text-black',
    navInactiveIconClass: 'text-cyan-400',
    mainBg: 'bg-black',
    cardBg: 'bg-zinc-950 border-2 border-amber-400/70 text-amber-100 shadow-lg',
    cardBorder: 'border-amber-400/80',
    textPrimary: 'text-white',
    textSecondary: 'text-amber-200',
    accentColor: 'text-cyan-300',
    accentBadge: 'bg-cyan-950 text-cyan-200 border border-cyan-400 font-mono font-bold',
    accentButton: 'bg-amber-400 hover:bg-amber-300 text-black font-black shadow-md',
    ribbonText: '🔬 HIGH-CONTRAST LAB BENCH — Pure obsidian surface, 2px amber borders & generous dark-bench spacing.',
    ribbonType: 'LAB_CONTRAST',
  },

  // 2. Billing & Accounts — Condensed Financial Ledger & Cashier Layout
  Billing: {
    id: 'billing-financial',
    primaryRole: 'Billing',
    name: 'Condensed Financial Ledger (Billing & Cashier)',
    tagline: 'Ultra-compact spacing, sharp 1px emerald ledger frames & tight high-throughput rows',
    badge: 'FINANCIAL CONDENSED',
    isHighContrast: false,
    isDarkSidebar: false,
    isFinancialLayout: true,
    isDataDense: true,
    tableDensity: 'ultra-dense',
    fontSize: 'compact',
    mainContainerPadding: 'px-3 py-3.5',
    layoutGap: 'gap-3.5',
    sidebarWidth: 'md:w-56',
    sidebarPadding: 'p-2',
    navSpacing: 'space-y-0.5',
    navItemPadding: 'px-2.5 py-1.5',
    cardRadius: 'rounded-sm',
    borderWidth: 'border',
    dividerClass: 'border-emerald-200',
    workspaceBg: 'bg-emerald-50/70 text-slate-900',
    headerBg: 'bg-emerald-950 text-emerald-100 border-b border-emerald-700',
    headerBorder: 'border-emerald-700',
    headerBadge: 'bg-emerald-900 text-emerald-200 border border-emerald-500 font-mono font-bold',
    sidebarBg: 'bg-white border border-emerald-400 text-slate-900',
    sidebarBorder: 'border-emerald-400',
    sidebarCardBg: 'bg-emerald-50/60 text-slate-900',
    sidebarSectionLabel: 'text-emerald-900',
    navActiveClass: 'bg-emerald-800 text-white font-bold border-l-4 border-emerald-400 shadow-xs',
    navInactiveClass: 'text-slate-700 hover:bg-emerald-100/70 hover:text-emerald-950',
    navActiveIconClass: 'text-emerald-200',
    navInactiveIconClass: 'text-emerald-700',
    mainBg: 'bg-emerald-50/40',
    cardBg: 'bg-white border border-emerald-300 text-slate-900 shadow-xs',
    cardBorder: 'border-emerald-400',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-emerald-900',
    accentColor: 'text-emerald-700',
    accentBadge: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold',
    accentButton: 'bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs',
    ribbonText: '💵 CONDENSED FINANCIAL LEDGER — Ultra-dense sidebar & tight ledger borders. Dual currency pegged at $1 USD : 195 LRD.',
    ribbonType: 'FINANCIAL_RECON',
  },

  // 3. Hospital Management & Clinical Governance — Executive Oversight
  Management: {
    id: 'management-oversight',
    primaryRole: 'Management',
    name: 'Executive Governance & Oversight',
    tagline: 'Structured indigo-slate borders, balanced command spacing & Audit Vault priority',
    badge: 'MANAGEMENT OVERSIGHT',
    isHighContrast: false,
    isDarkSidebar: false,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'comfortable',
    fontSize: 'standard',
    mainContainerPadding: 'px-5 py-6',
    layoutGap: 'gap-6',
    sidebarWidth: 'md:w-68',
    sidebarPadding: 'p-3.5',
    navSpacing: 'space-y-1.5',
    navItemPadding: 'px-3 py-2',
    cardRadius: 'rounded-xl',
    borderWidth: 'border-2',
    dividerClass: 'border-indigo-200',
    workspaceBg: 'bg-indigo-50/40 text-slate-900',
    headerBg: 'bg-indigo-950 text-indigo-100 border-b-2 border-indigo-700',
    headerBorder: 'border-indigo-700',
    headerBadge: 'bg-indigo-900 text-indigo-200 border border-indigo-500 font-mono font-bold',
    sidebarBg: 'bg-white border-2 border-indigo-300 text-slate-900',
    sidebarBorder: 'border-indigo-300',
    sidebarCardBg: 'bg-indigo-50/50 text-slate-800',
    sidebarSectionLabel: 'text-indigo-950',
    navActiveClass: 'bg-indigo-800 text-white font-bold shadow-xs',
    navInactiveClass: 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-950',
    navActiveIconClass: 'text-indigo-200',
    navInactiveIconClass: 'text-indigo-700',
    mainBg: 'bg-indigo-50/30',
    cardBg: 'bg-white border-2 border-indigo-200 text-slate-900 shadow-xs',
    cardBorder: 'border-indigo-300',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-indigo-950',
    accentColor: 'text-indigo-700',
    accentBadge: 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-mono font-bold',
    accentButton: 'bg-indigo-700 hover:bg-indigo-800 text-white font-bold shadow-xs',
    ribbonText: '🏛️ MANAGEMENT & GOVERNANCE VIEW — Executive oversight borders & Level 3 Audit Vault clearance active.',
    ribbonType: 'MANAGEMENT_OVERSIGHT',
  },

  // 4. Administrator & IT Security — Regulatory Surveillance Vault
  Admin: {
    id: 'admin-executive',
    primaryRole: 'Admin',
    name: 'Security Vault (IT Admin Dark Console)',
    tagline: 'Deep obsidian-indigo sidebar, Level 3 security framing & tamper-evident telemetry',
    badge: 'ADMIN SECURITY VAULT',
    isHighContrast: false,
    isDarkSidebar: true,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'compact',
    fontSize: 'standard',
    mainContainerPadding: 'px-5 py-6',
    layoutGap: 'gap-6',
    sidebarWidth: 'md:w-72',
    sidebarPadding: 'p-3.5',
    navSpacing: 'space-y-1.5',
    navItemPadding: 'px-3 py-2',
    cardRadius: 'rounded-xl',
    borderWidth: 'border-2',
    dividerClass: 'border-indigo-500/35',
    workspaceBg: 'bg-slate-200/80 text-slate-900',
    headerBg: 'bg-slate-950 text-white border-b-2 border-indigo-500',
    headerBorder: 'border-indigo-500',
    headerBadge: 'bg-indigo-950 text-indigo-300 border border-indigo-500 font-mono font-bold',
    sidebarBg: 'bg-slate-950 border-2 border-indigo-500/70 text-slate-100',
    sidebarBorder: 'border-indigo-500/70',
    sidebarCardBg: 'bg-slate-900 text-slate-100',
    sidebarSectionLabel: 'text-indigo-300',
    navActiveClass: 'bg-indigo-600 text-white font-bold border border-indigo-400 shadow-xs',
    navInactiveClass: 'text-slate-300 hover:bg-slate-900 hover:text-white',
    navActiveIconClass: 'text-white',
    navInactiveIconClass: 'text-indigo-400',
    mainBg: 'bg-slate-200/60',
    cardBg: 'bg-white border border-slate-300 text-slate-900 shadow-xs',
    cardBorder: 'border-indigo-500/60',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    accentColor: 'text-indigo-600',
    accentBadge: 'bg-indigo-950 text-indigo-200 border border-indigo-600 font-mono font-bold',
    accentButton: 'bg-indigo-700 hover:bg-indigo-800 text-white font-semibold shadow-xs',
    ribbonText: '🛡️ ADMIN SECURITY VAULT — Dark obsidian surveillance sidebar, SHA-256 HMAC verification & Break-Glass monitoring.',
    ribbonType: 'ADMIN_AUDIT',
  },

  // 5. Clinician — Clinical Daylight Mode
  Clinician: {
    id: 'clinical-daylight',
    primaryRole: 'Clinician',
    name: 'Clinical Daylight (Evidence-Based EMR)',
    tagline: 'Clean teal & hospital slate framing calibrated for acute consults & ICD-11 charting',
    badge: 'CLINICAL DAYLIGHT',
    isHighContrast: false,
    isDarkSidebar: false,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'comfortable',
    fontSize: 'standard',
    mainContainerPadding: 'px-4 py-6',
    layoutGap: 'gap-6',
    sidebarWidth: 'md:w-64',
    sidebarPadding: 'p-3',
    navSpacing: 'space-y-1',
    navItemPadding: 'px-3 py-2',
    cardRadius: 'rounded-xl',
    borderWidth: 'border',
    dividerClass: 'border-teal-200',
    workspaceBg: 'bg-slate-100 text-slate-900',
    headerBg: 'bg-slate-900 text-white border-b-2 border-teal-600',
    headerBorder: 'border-teal-600',
    headerBadge: 'bg-teal-950 text-teal-300 border border-teal-700 font-mono font-bold',
    sidebarBg: 'bg-white border border-teal-200 text-slate-900',
    sidebarBorder: 'border-teal-200',
    sidebarCardBg: 'bg-white text-slate-800',
    sidebarSectionLabel: 'text-teal-900',
    navActiveClass: 'bg-teal-800 text-white font-semibold shadow-xs',
    navInactiveClass: 'text-slate-700 hover:bg-teal-50/70 hover:text-teal-950',
    navActiveIconClass: 'text-teal-200',
    navInactiveIconClass: 'text-teal-700',
    mainBg: 'bg-slate-100',
    cardBg: 'bg-white border border-slate-200 text-slate-900 shadow-xs',
    cardBorder: 'border-teal-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    accentColor: 'text-teal-700',
    accentBadge: 'bg-teal-50 text-teal-800 border border-teal-200 font-mono font-bold',
    accentButton: 'bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs',
    ribbonText: '🩺 CLINICAL DAYLIGHT EMR — Balanced clinical spacing & teal acuity framing for acute outpatient encounters.',
    ribbonType: 'CLINICAL_QUEUE',
  },

  // 6. Nursing Care — Triage Calm
  Nurse: {
    id: 'nursing-calm',
    primaryRole: 'Nurse',
    name: 'Triage Calm & Ward Station',
    tagline: 'Soft sky-blue workspace, rounded ward cards & clear acuity separation',
    badge: 'NURSING TRIAGE CALM',
    isHighContrast: false,
    isDarkSidebar: false,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'comfortable',
    fontSize: 'standard',
    mainContainerPadding: 'px-4 py-6',
    layoutGap: 'gap-6',
    sidebarWidth: 'md:w-64',
    sidebarPadding: 'p-3.5',
    navSpacing: 'space-y-1.5',
    navItemPadding: 'px-3 py-2',
    cardRadius: 'rounded-2xl',
    borderWidth: 'border-2',
    dividerClass: 'border-sky-200',
    workspaceBg: 'bg-sky-50/80 text-slate-900',
    headerBg: 'bg-sky-950 text-sky-100 border-b-2 border-sky-500',
    headerBorder: 'border-sky-500',
    headerBadge: 'bg-sky-900 text-sky-200 border border-sky-500 font-mono font-bold',
    sidebarBg: 'bg-white border-2 border-sky-300 text-slate-900',
    sidebarBorder: 'border-sky-300',
    sidebarCardBg: 'bg-sky-50/70 text-slate-800',
    sidebarSectionLabel: 'text-sky-900',
    navActiveClass: 'bg-sky-700 text-white font-semibold shadow-xs',
    navInactiveClass: 'text-slate-700 hover:bg-sky-100/70 hover:text-sky-950',
    navActiveIconClass: 'text-sky-100',
    navInactiveIconClass: 'text-sky-700',
    mainBg: 'bg-sky-50/60',
    cardBg: 'bg-white border border-sky-200 text-slate-900 shadow-xs',
    cardBorder: 'border-sky-300',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    accentColor: 'text-sky-700',
    accentBadge: 'bg-sky-100 text-sky-800 border border-sky-300 font-mono font-bold',
    accentButton: 'bg-sky-700 hover:bg-sky-800 text-white font-semibold shadow-xs',
    ribbonText: '🫀 TRIAGE CALM & ADT NURSING — Rounded sky-slate ward framing for vitals and bed turnover.',
    ribbonType: 'CLINICAL_QUEUE',
  },

  // 7. Pharmacy & Therapeutics — Clinical Amber
  Pharmacy: {
    id: 'pharmacy-amber',
    primaryRole: 'Pharmacy',
    name: 'Clinical Amber (Formulary & Safety)',
    tagline: 'Warm amber workspace, 2px amber safety borders & high-visibility dispensing cards',
    badge: 'CLINICAL AMBER',
    isHighContrast: false,
    isDarkSidebar: false,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'comfortable',
    fontSize: 'standard',
    mainContainerPadding: 'px-5 py-6',
    layoutGap: 'gap-6',
    sidebarWidth: 'md:w-68',
    sidebarPadding: 'p-3.5',
    navSpacing: 'space-y-1.5',
    navItemPadding: 'px-3 py-2.5',
    cardRadius: 'rounded-2xl',
    borderWidth: 'border-2',
    dividerClass: 'border-amber-300',
    workspaceBg: 'bg-amber-50/80 text-amber-950',
    headerBg: 'bg-amber-950 text-amber-100 border-b-2 border-amber-500',
    headerBorder: 'border-amber-500',
    headerBadge: 'bg-amber-900 text-amber-200 border border-amber-400 font-mono font-bold',
    sidebarBg: 'bg-amber-100/60 border-2 border-amber-400 text-amber-950',
    sidebarBorder: 'border-amber-400',
    sidebarCardBg: 'bg-amber-50 text-amber-950',
    sidebarSectionLabel: 'text-amber-900',
    navActiveClass: 'bg-amber-700 text-white font-bold border border-amber-800 shadow-xs',
    navInactiveClass: 'text-amber-950 hover:bg-amber-200/70 hover:text-amber-950',
    navActiveIconClass: 'text-amber-200',
    navInactiveIconClass: 'text-amber-700',
    mainBg: 'bg-amber-50/60',
    cardBg: 'bg-white border-2 border-amber-300 text-slate-900 shadow-xs',
    cardBorder: 'border-amber-400',
    textPrimary: 'text-amber-950',
    textSecondary: 'text-amber-900',
    accentColor: 'text-amber-700',
    accentBadge: 'bg-amber-100 text-amber-900 border border-amber-400 font-mono font-bold',
    accentButton: 'bg-amber-700 hover:bg-amber-800 text-white font-semibold shadow-xs',
    ribbonText: '💊 CLINICAL AMBER MODE — Warm safety-amber borders, relaxed card spacing & FEFO interaction alerts.',
    ribbonType: 'CLINICAL_QUEUE',
  },

  // 8. Radiology & Medical Imaging
  Radiology: {
    id: 'radiology-dark',
    primaryRole: 'Radiology',
    name: 'PACS Imaging & Diagnostic Darkroom',
    tagline: 'DICOM grayscale darkroom palette with crisp cyan borders for low-glare reading',
    badge: 'PACS DARKROOM',
    isHighContrast: true,
    isDarkSidebar: true,
    isFinancialLayout: false,
    isDataDense: false,
    tableDensity: 'high-contrast',
    fontSize: 'standard',
    mainContainerPadding: 'px-5 py-6',
    layoutGap: 'gap-6',
    sidebarWidth: 'md:w-68',
    sidebarPadding: 'p-3.5',
    navSpacing: 'space-y-1.5',
    navItemPadding: 'px-3 py-2.5',
    cardRadius: 'rounded-lg',
    borderWidth: 'border',
    dividerClass: 'border-zinc-700',
    workspaceBg: 'bg-zinc-950 text-zinc-100',
    headerBg: 'bg-black text-sky-300 border-b border-sky-700',
    headerBorder: 'border-sky-700',
    headerBadge: 'bg-sky-950 text-sky-300 border border-sky-600 font-mono font-bold',
    sidebarBg: 'bg-zinc-900 border border-sky-700/60 text-zinc-100',
    sidebarBorder: 'border-sky-700/60',
    sidebarCardBg: 'bg-zinc-900 text-zinc-100',
    sidebarSectionLabel: 'text-sky-300',
    navActiveClass: 'bg-sky-600 text-white font-bold shadow-xs',
    navInactiveClass: 'text-zinc-300 hover:bg-zinc-800 hover:text-white',
    navActiveIconClass: 'text-white',
    navInactiveIconClass: 'text-sky-400',
    mainBg: 'bg-zinc-950',
    cardBg: 'bg-zinc-900 border border-zinc-700 text-zinc-100 shadow-md',
    cardBorder: 'border-sky-700/60',
    textPrimary: 'text-white',
    textSecondary: 'text-zinc-300',
    accentColor: 'text-sky-400',
    accentBadge: 'bg-sky-950 text-sky-300 border border-sky-700 font-mono font-bold',
    accentButton: 'bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-sm',
    ribbonText: '🩻 PACS DARKROOM REVIEW — Low-glare DICOM grayscale surfaces & cyan border framing.',
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
