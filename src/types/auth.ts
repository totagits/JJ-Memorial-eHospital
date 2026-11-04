/**
 * Enterprise Security & Access Control Types
 * Role-Based Access Control (RBAC) + Attribute-Based Policies
 */

export type UserRole =
  | 'executive_ceo'
  | 'medical_director'
  | 'physician'
  | 'head_nurse'
  | 'nurse_triage'
  | 'front_desk_registration'
  | 'lab_scientist'
  | 'radiologist_technologist'
  | 'pharmacist'
  | 'cashier_billing'
  | 'finance_accountant'
  | 'procurement_stores'
  | 'hr_payroll'
  | 'biomedical_facilities'
  | 'quality_auditor'
  | 'it_security_admin'
  | 'patient';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  phone: string;
  avatarUrl?: string;
  requiresMfa?: boolean;
  mfaVerified?: boolean;
  status: 'active' | 'suspended' | 'pending_verification';
  createdAt: string;
}

export interface BreakGlassSession {
  id: string;
  userId: string;
  userName: string;
  patientId: string;
  patientMrn: string;
  justification: string;
  startTime: string;
  durationMinutes: number;
  approvedBy?: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE_ATTEMPT' | 'SIGN' | 'DISPENSE' | 'RELEASE_RESULT' | 'COLLECT_PAYMENT' | 'REFUND' | 'BREAK_GLASS' | 'DOWNTIME_SYNC' | 'CONFIG_CHANGE' | 'EXPORT';
  module: 'PATIENT_INDEX' | 'OPD' | 'TRIAGE' | 'INPATIENT' | 'LAB' | 'RADIOLOGY' | 'PHARMACY' | 'BILLING' | 'GL' | 'PROCUREMENT' | 'INVENTORY' | 'HR' | 'ASSETS' | 'SECURITY';
  patientId?: string;
  patientMrn?: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
}
