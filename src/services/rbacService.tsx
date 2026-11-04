import React from 'react';
import { ShieldAlert, KeyRound, AlertTriangle, UserCheck, Lock } from 'lucide-react';
import { UserAccount, UserRole } from '../types/auth';

export type PrimaryRole = 'Admin' | 'Doctor' | 'Nurse' | 'Finance' | 'Pharmacy';

export type AccessLevel = 'NONE' | 'READ' | 'WRITE' | 'ADMIN';

// Role mapping matrix: maps all detailed roles to the 5 standard enterprise roles
export const PRIMARY_ROLE_MAP: Record<UserRole | string, PrimaryRole> = {
  // Admin group
  executive_ceo: 'Admin',
  it_security_admin: 'Admin',
  medical_director: 'Admin',
  quality_auditor: 'Admin',
  biomedical_facilities: 'Admin',
  Admin: 'Admin',

  // Doctor group
  physician: 'Doctor',
  Doctor: 'Doctor',

  // Nurse group
  head_nurse: 'Nurse',
  nurse_triage: 'Nurse',
  Nurse: 'Nurse',

  // Finance group
  cashier_billing: 'Finance',
  finance_accountant: 'Finance',
  front_desk_registration: 'Finance',
  hr_payroll: 'Finance',
  Finance: 'Finance',

  // Pharmacy group
  pharmacist: 'Pharmacy',
  procurement_stores: 'Pharmacy',
  Pharmacy: 'Pharmacy',

  // Fallback
  patient: 'Nurse',
};

// Access Level Matrix per Primary Role for each Staff Workspace module
export const MODULE_ACCESS_MATRIX: Record<string, Record<PrimaryRole, AccessLevel>> = {
  // Outpatient (OPD) & Clinical EMR
  opd: {
    Doctor: 'ADMIN',
    Nurse: 'WRITE',
    Admin: 'ADMIN',
    Finance: 'READ',
    Pharmacy: 'READ',
  },
  // Triage & Acute Nursing
  triage: {
    Nurse: 'ADMIN',
    Doctor: 'ADMIN',
    Admin: 'ADMIN',
    Finance: 'READ',
    Pharmacy: 'READ',
  },
  // Inpatient Wards & Beds (ADT)
  inpatient: {
    Nurse: 'ADMIN',
    Doctor: 'WRITE',
    Admin: 'ADMIN',
    Finance: 'READ',
    Pharmacy: 'READ',
  },
  // Diagnostic Laboratory (LIS)
  lab: {
    Doctor: 'WRITE',
    Nurse: 'READ',
    Admin: 'ADMIN',
    Pharmacy: 'READ',
    Finance: 'NONE',
  },
  // Blood Bank & Transfusions
  blood_bank: {
    Doctor: 'WRITE',
    Nurse: 'WRITE',
    Admin: 'ADMIN',
    Pharmacy: 'READ',
    Finance: 'NONE',
  },
  // Radiology & Imaging (PACS)
  radiology: {
    Doctor: 'WRITE',
    Nurse: 'READ',
    Admin: 'ADMIN',
    Pharmacy: 'NONE',
    Finance: 'NONE',
  },
  // Biomedical Resources & Equipment
  resources: {
    Doctor: 'WRITE',
    Nurse: 'WRITE',
    Admin: 'ADMIN',
    Pharmacy: 'READ',
    Finance: 'READ',
  },
  // Pharmacy & Drug Dispense
  pharmacy: {
    Pharmacy: 'ADMIN',
    Doctor: 'WRITE',
    Nurse: 'READ',
    Admin: 'ADMIN',
    Finance: 'READ',
  },
  // Insurance Verification & Payer Gateway
  insurance: {
    Finance: 'ADMIN',
    Admin: 'ADMIN',
    Doctor: 'READ',
    Nurse: 'READ',
    Pharmacy: 'READ',
  },
  // Patient Billing & Invoicing
  billing: {
    Finance: 'ADMIN',
    Admin: 'ADMIN',
    Doctor: 'NONE',
    Nurse: 'NONE',
    Pharmacy: 'READ',
  },
  // General Ledger (GL) & Financial Reporting
  gl: {
    Finance: 'ADMIN',
    Admin: 'ADMIN',
    Doctor: 'NONE',
    Nurse: 'NONE',
    Pharmacy: 'NONE',
  },
  // Central Procurement & Stores
  procurement: {
    Pharmacy: 'ADMIN',
    Finance: 'WRITE',
    Admin: 'ADMIN',
    Doctor: 'READ',
    Nurse: 'READ',
  },
  // HR, Staff & Payroll
  hr: {
    Finance: 'ADMIN',
    Admin: 'ADMIN',
    Doctor: 'NONE',
    Nurse: 'NONE',
    Pharmacy: 'NONE',
  },
  // Staff Shift Scheduling
  scheduling: {
    Nurse: 'ADMIN',
    Doctor: 'WRITE',
    Admin: 'ADMIN',
    Finance: 'READ',
    Pharmacy: 'READ',
  },
  // Biomedical Engineering & Facilities
  assets: {
    Admin: 'ADMIN',
    Doctor: 'READ',
    Nurse: 'READ',
    Pharmacy: 'WRITE',
    Finance: 'READ',
  },
  // Quality & Safety Incident Management
  quality: {
    Admin: 'ADMIN',
    Doctor: 'WRITE',
    Nurse: 'WRITE',
    Pharmacy: 'WRITE',
    Finance: 'WRITE',
  },
  // Immutable Audit Trail
  audit_trail: {
    Admin: 'ADMIN',
    Finance: 'READ',
    Doctor: 'READ',
    Nurse: 'NONE',
    Pharmacy: 'NONE',
  },
  // Executive Intelligence (BI)
  executive_bi: {
    Admin: 'ADMIN',
    Finance: 'WRITE',
    Doctor: 'READ',
    Nurse: 'NONE',
    Pharmacy: 'NONE',
  },
  // Command Center & HMIS
  command_center: {
    Admin: 'ADMIN',
    Doctor: 'READ',
    Nurse: 'READ',
    Finance: 'READ',
    Pharmacy: 'READ',
  },
  // Internal Staff Messaging
  messages: {
    Admin: 'ADMIN',
    Doctor: 'ADMIN',
    Nurse: 'ADMIN',
    Finance: 'ADMIN',
    Pharmacy: 'ADMIN',
  },
};

const ACCESS_LEVEL_PRIORITY: Record<AccessLevel, number> = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  ADMIN: 3,
};

/**
 * RBACService manages user roles and provides access verification
 */
export const RBACService = {
  /**
   * Resolve any user's role to one of the 5 canonical primary roles
   */
  getPrimaryRole(userOrRole?: UserAccount | UserRole | string): PrimaryRole {
    if (!userOrRole) return 'Doctor';
    const roleString = typeof userOrRole === 'object' ? userOrRole.role : userOrRole;
    return PRIMARY_ROLE_MAP[roleString] || 'Doctor';
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
   * Convenience check for write permission
   */
  canWrite(userOrRole?: UserAccount | UserRole | string, moduleId: string = ''): boolean {
    return this.hasAccess(userOrRole, moduleId, 'WRITE');
  },

  /**
   * Convenience check for admin permission
   */
  canAdminister(userOrRole?: UserAccount | UserRole | string, moduleId: string = ''): boolean {
    return this.hasAccess(userOrRole, moduleId, 'ADMIN');
  },

  /**
   * Returns list of all modules where user has at least READ access
   */
  getAuthorizedModules(userOrRole?: UserAccount | UserRole | string): string[] {
    const primaryRole = this.getPrimaryRole(userOrRole);
    return Object.keys(MODULE_ACCESS_MATRIX).filter(modId => {
      const level = MODULE_ACCESS_MATRIX[modId]?.[primaryRole] || 'NONE';
      return level !== 'NONE';
    });
  },

  /**
   * Returns authorized roles for display on access denied cards
   */
  getAuthorizedRolesForModule(moduleId: string, minLevel: AccessLevel = 'READ'): PrimaryRole[] {
    const rules = MODULE_ACCESS_MATRIX[moduleId] || {};
    return (Object.keys(rules) as PrimaryRole[]).filter(role => {
      const level = rules[role] || 'NONE';
      return ACCESS_LEVEL_PRIORITY[level] >= ACCESS_LEVEL_PRIORITY[minLevel];
    });
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
                  RBAC PERMISSION DENIED ({requiredLevel})
                </span>
                <span className="text-xs font-mono text-slate-400">MODULE: {moduleId}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Access Restricted: {friendlyName}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Your active role (<strong className="text-slate-800">{primaryRole}</strong>) does not have the required{' '}
                <strong className="text-rose-700">{requiredLevel}</strong> access level for this clinical or financial resource under J & J Memorial Governance.
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
              <p><span className="font-semibold text-slate-700">Current Level for {moduleId}:</span> <span className="font-mono text-rose-700 font-bold">{RBACService.getAccessLevel(currentUser, moduleId)}</span></p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Required Authorization
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
              Need immediate emergency access? Break-glass override is available for urgent resuscitation.
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
