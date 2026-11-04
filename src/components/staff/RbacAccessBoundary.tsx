import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { UserAccount, UserRole } from '../../types/auth';
import { getRoleScopeConfig, ROLE_SCOPE_DEFINITIONS } from '../../types/rbac';

interface RbacAccessBoundaryProps {
  currentUser: UserAccount;
  targetModuleId: string;
  targetModuleName: string;
  onTriggerBreakGlass: () => void;
  onSwitchToAuthorizedRole: (role: UserRole) => void;
}

export const RbacAccessBoundary: React.FC<RbacAccessBoundaryProps> = ({
  currentUser,
  targetModuleId,
  targetModuleName,
  onTriggerBreakGlass,
  onSwitchToAuthorizedRole,
}) => {
  const currentScope = getRoleScopeConfig(currentUser.role);

  // Find roles that ARE authorized for this target module
  const authorizedRoles = Object.values(ROLE_SCOPE_DEFINITIONS).filter(cfg =>
    cfg.role !== 'patient' && cfg.authorizedModules.includes(targetModuleId)
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
        {/* Warning Banner */}
        <div className="bg-rose-900 text-white p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-800 border border-rose-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-7 h-7 text-rose-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                RBAC POLICY BOUNDARY
              </span>
              <span className="text-xs text-rose-200 font-mono">CODE: SEC-RBAC-403</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              Restricted Scope of Work: {targetModuleName}
            </h2>
            <p className="text-xs text-rose-200 mt-1 max-w-2xl leading-relaxed">
              Under J & J Memorial Clinical Governance & Privacy Guidelines, access to this workstation is segregated to roles with active operational responsibility for this department.
            </p>
          </div>
        </div>

        {/* Current Identity & Scope Card */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Your Active Staff Identity
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.fullName.split(' ')[1]?.[0] || 'U'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{currentUser.fullName}</h4>
                  <p className="text-xs font-semibold text-teal-800">{currentScope.title}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.department}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Authorized Scope:</span> {currentScope.scopeDescription}
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Segregation of Duties Compliance
              </span>
              <p className="text-xs text-amber-900 leading-relaxed">
                Segregation of Duties (SoD) prevents conflicting duties between clinical diagnosis, drug dispensing, cash receipting, and accounting reconciliation to ensure patient safety and financial integrity.
              </p>
              <div className="text-xs text-amber-800 font-medium flex items-center gap-1.5 pt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Actions in unauthorized modules are restricted from non-break-glass sessions.</span>
              </div>
            </div>
          </div>

          {/* Authorized Roles for This Workstation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Personnel Authorized for {targetModuleName}:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {authorizedRoles.slice(0, 4).map(roleCfg => (
                <button
                  key={roleCfg.role}
                  onClick={() => onSwitchToAuthorizedRole(roleCfg.role)}
                  className="bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl p-3 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-teal-700" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                        {roleCfg.title}
                      </p>
                      <p className="text-[10px] text-slate-500">{roleCfg.department}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Switch Role &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Break-Glass Action */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Emergency override:</span> Clinicians in acute emergencies may break glass to access records immediately.
            </div>

            <button
              onClick={onTriggerBreakGlass}
              className="w-full sm:w-auto bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <KeyRound className="w-4 h-4 text-rose-200" />
              <span>Trigger Emergency Break-Glass Override</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
