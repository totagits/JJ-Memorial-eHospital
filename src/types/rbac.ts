import { UserRole } from './auth';

export interface RoleScopeConfig {
  role: UserRole;
  title: string;
  department: string;
  scopeDescription: string;
  category: 'CLINICAL' | 'NURSING' | 'DIAGNOSTIC' | 'PHARMACY' | 'FINANCE_ADMIN' | 'OPERATIONS_SECURITY';
  primaryWorkstation: string;
  authorizedModules: string[];
  decisionMetricsTitle: string;
}

export const ROLE_SCOPE_DEFINITIONS: Record<UserRole, RoleScopeConfig> = {
  physician: {
    role: 'physician',
    title: 'Attending Physician (OPD & Acute)',
    department: 'Outpatient Clinic & Emergency Triage',
    scopeDescription: 'Clinical evaluation, diagnosis, prescription, lab/imaging requisitions, and outpatient case management.',
    category: 'CLINICAL',
    primaryWorkstation: 'opd',
    authorizedModules: ['opd', 'triage', 'lab', 'blood_bank', 'radiology', 'resources', 'messages'],
    decisionMetricsTitle: 'Clinical Acuity & Diagnostic Decision Engine',
  },
  medical_director: {
    role: 'medical_director',
    title: 'Medical Director',
    department: 'Clinical Governance & Internal Medicine',
    scopeDescription: 'Full clinical oversight, morbidity governance, emergency break-glass authority, and clinical protocol compliance.',
    category: 'CLINICAL',
    primaryWorkstation: 'executive_bi',
    authorizedModules: ['executive_bi', 'command_center', 'opd', 'triage', 'inpatient', 'lab', 'blood_bank', 'radiology', 'resources', 'pharmacy', 'scheduling', 'quality', 'audit_trail', 'messages'],
    decisionMetricsTitle: 'Clinical Governance & Morbidity Intelligence',
  },
  head_nurse: {
    role: 'head_nurse',
    title: 'Head of Nursing & Inpatient Services',
    department: 'Nursing Administration & Inpatient Wards',
    scopeDescription: 'Inpatient ward management, bed allocation, shift roster supervision, and patient care acuity tracking.',
    category: 'NURSING',
    primaryWorkstation: 'inpatient',
    authorizedModules: ['inpatient', 'triage', 'opd', 'blood_bank', 'resources', 'scheduling', 'quality', 'messages'],
    decisionMetricsTitle: 'Nursing Workload & Inpatient Bed Acuity Monitor',
  },
  nurse_triage: {
    role: 'nurse_triage',
    title: 'Triage & Acute Assessment Nurse',
    department: 'Emergency & Outpatient Triage',
    scopeDescription: 'Rapid vital signs acquisition, South African Triage Scale (SATS) acuity rating, and emergency queue prioritization.',
    category: 'NURSING',
    primaryWorkstation: 'triage',
    authorizedModules: ['triage', 'opd', 'inpatient', 'blood_bank', 'messages'],
    decisionMetricsTitle: 'Triage Acuity & OPD Flow Decision Tool',
  },
  front_desk_registration: {
    role: 'front_desk_registration',
    title: 'Front Desk & Patient Intake Officer',
    department: 'Patient Access & Admissions',
    scopeDescription: 'Master Patient Index (MPI) registration, demographic verification, and insurance eligibility lookup.',
    category: 'FINANCE_ADMIN',
    primaryWorkstation: 'opd',
    authorizedModules: ['opd', 'insurance', 'resources', 'messages'],
    decisionMetricsTitle: 'Front Desk Intake & Queue Velocity Engine',
  },
  lab_scientist: {
    role: 'lab_scientist',
    title: 'Medical Laboratory Scientist (LIS)',
    department: 'Laboratory Medicine & Pathology',
    scopeDescription: 'Diagnostic test execution, critical panic values verification, specimen management, and cold-chain blood banking.',
    category: 'DIAGNOSTIC',
    primaryWorkstation: 'lab',
    authorizedModules: ['lab', 'blood_bank', 'quality', 'messages'],
    decisionMetricsTitle: 'Laboratory Turnaround & Critical Value Dispatcher',
  },
  radiologist_technologist: {
    role: 'radiologist_technologist',
    title: 'Radiologist / Medical Imaging Technologist',
    department: 'Radiology & Medical Imaging (PACS)',
    scopeDescription: 'X-Ray, Ultrasound, CT acquisitions, diagnostic image review, and radiation equipment safety.',
    category: 'DIAGNOSTIC',
    primaryWorkstation: 'radiology',
    authorizedModules: ['radiology', 'resources', 'quality', 'messages'],
    decisionMetricsTitle: 'Radiology PACS Throughput & Dose Monitoring',
  },
  pharmacist: {
    role: 'pharmacist',
    title: 'Lead Clinical Pharmacist',
    department: 'Pharmacy & Therapeutics',
    scopeDescription: 'Prescription dispensing verification, drug-drug interaction screening, batch tracking, and central stores requisitions.',
    category: 'PHARMACY',
    primaryWorkstation: 'pharmacy',
    authorizedModules: ['pharmacy', 'procurement', 'messages'],
    decisionMetricsTitle: 'Pharmacovigilance & Dispense Velocity Analytics',
  },
  cashier_billing: {
    role: 'cashier_billing',
    title: 'Cashier & Patient Billing Officer',
    department: 'Patient Accounts & Revenue Cycle',
    scopeDescription: 'Point-of-sale receipting, insurance copay collection, dual-currency cash handling (USD/LRD), and shift reconciliation.',
    category: 'FINANCE_ADMIN',
    primaryWorkstation: 'billing',
    authorizedModules: ['billing', 'insurance', 'messages'],
    decisionMetricsTitle: 'Cashier Shift Reconciliation & Revenue Velocity',
  },
  finance_accountant: {
    role: 'finance_accountant',
    title: 'Chief Accountant & Financial Controller',
    department: 'Finance & General Ledger',
    scopeDescription: 'Double-entry general ledger, bank reconciliations, dual-currency reporting, and procurement invoice matching.',
    category: 'FINANCE_ADMIN',
    primaryWorkstation: 'gl',
    authorizedModules: ['gl', 'billing', 'insurance', 'procurement', 'hr', 'executive_bi', 'messages'],
    decisionMetricsTitle: 'Financial Solvency & Dual-Currency Variance Engine',
  },
  procurement_stores: {
    role: 'procurement_stores',
    title: 'Procurement & Central Stores Manager',
    department: 'Supply Chain & Central Stores',
    scopeDescription: 'Purchase orders, stock minimum thresholds, supplier lead-time management, and goods receipt notes (GRN).',
    category: 'OPERATIONS_SECURITY',
    primaryWorkstation: 'procurement',
    authorizedModules: ['procurement', 'pharmacy', 'assets', 'messages'],
    decisionMetricsTitle: 'Supply Chain Lead-Time & Stockout Risk Matrix',
  },
  hr_payroll: {
    role: 'hr_payroll',
    title: 'HR & Workforce Payroll Officer',
    department: 'Human Resources & Credentialing',
    scopeDescription: 'Staff licensing compliance (LMDC/LBNM), monthly payroll, shift attendance, and statutory tax withholdings (LRA/NASSCORP).',
    category: 'FINANCE_ADMIN',
    primaryWorkstation: 'hr',
    authorizedModules: ['hr', 'scheduling', 'audit_trail', 'messages'],
    decisionMetricsTitle: 'Workforce Utilization & Shift Roster Compliance',
  },
  biomedical_facilities: {
    role: 'biomedical_facilities',
    title: 'Biomedical Engineer & Facilities Lead',
    department: 'Biomedical Engineering & Power Infrastructure',
    scopeDescription: '500kVA generator runtime, 80kW hybrid solar array, medical gas manifold, and equipment preventive maintenance (PPM).',
    category: 'OPERATIONS_SECURITY',
    primaryWorkstation: 'assets',
    authorizedModules: ['assets', 'resources', 'quality', 'messages'],
    decisionMetricsTitle: 'Critical Infrastructure & Power Grid Analytics',
  },
  quality_auditor: {
    role: 'quality_auditor',
    title: 'Quality, Safety & Clinical Risk Auditor',
    department: 'Clinical Quality & Compliance',
    scopeDescription: 'Incident review, root-cause analysis, MOH HMIS reporting audits, and break-glass surveillance.',
    category: 'OPERATIONS_SECURITY',
    primaryWorkstation: 'quality',
    authorizedModules: ['quality', 'audit_trail', 'command_center', 'executive_bi', 'messages'],
    decisionMetricsTitle: 'Clinical Safety & Regulatory Audit Scorecard',
  },
  it_security_admin: {
    role: 'it_security_admin',
    title: 'IT & Systems Security Administrator',
    department: 'Health Informatics & Security Operations',
    scopeDescription: 'Full system RBAC administration, zero-trust terminal security, immutable audit logs, and offline sync continuity.',
    category: 'OPERATIONS_SECURITY',
    primaryWorkstation: 'audit_trail',
    authorizedModules: ['audit_trail', 'command_center', 'executive_bi', 'opd', 'triage', 'inpatient', 'lab', 'blood_bank', 'radiology', 'resources', 'pharmacy', 'insurance', 'billing', 'gl', 'procurement', 'hr', 'scheduling', 'assets', 'quality', 'messages'],
    decisionMetricsTitle: 'Zero-Trust Terminal & Infrastructure Monitor',
  },
  executive_ceo: {
    role: 'executive_ceo',
    title: 'Chief Executive Officer (CEO)',
    department: 'Executive Leadership & Board of Governors',
    scopeDescription: 'Overall hospital strategic operations, financial viability, clinical outcomes, and Ministry of Health compliance.',
    category: 'FINANCE_ADMIN',
    primaryWorkstation: 'executive_bi',
    authorizedModules: ['executive_bi', 'command_center', 'billing', 'gl', 'hr', 'procurement', 'quality', 'audit_trail', 'scheduling', 'messages'],
    decisionMetricsTitle: 'Executive Operational & Hospital Margin Intelligence',
  },
  patient: {
    role: 'patient',
    title: 'Patient & Family Access',
    department: 'Public & Patient Community',
    scopeDescription: 'Patient self-service portal, vitals tracking, appointment bookings, and personal records.',
    category: 'CLINICAL',
    primaryWorkstation: 'portal',
    authorizedModules: [],
    decisionMetricsTitle: 'Patient Health Summary',
  },
};

/**
 * Check if a given user role is authorized to access a specific module
 */
export function isRoleAuthorizedForModule(role: UserRole, moduleId: string): boolean {
  const config = ROLE_SCOPE_DEFINITIONS[role];
  if (!config) return false;
  // it_security_admin and medical_director have universal read access
  if (role === 'it_security_admin') return true;
  return config.authorizedModules.includes(moduleId);
}

/**
 * Get human-readable scope definition for a role
 */
export function getRoleScopeConfig(role: UserRole): RoleScopeConfig {
  return ROLE_SCOPE_DEFINITIONS[role] || ROLE_SCOPE_DEFINITIONS.physician;
}
