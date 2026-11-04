import React from 'react';
import { UserRole, UserAccount } from '../../types/auth';
import { Shield, ChevronDown, Check } from 'lucide-react';

interface RoleSwitcherProps {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onSelectUser: (user: UserAccount) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'medical_director': return 'Medical Director';
      case 'physician': return 'Attending Physician (OPD)';
      case 'head_nurse': return 'Head of Nursing / Inpatient';
      case 'nurse_triage': return 'Triage & Acute Nurse';
      case 'front_desk_registration': return 'Front Desk & Registration';
      case 'lab_scientist': return 'Laboratory Scientist (LIS)';
      case 'radiologist_technologist': return 'Radiologist / Imaging Lead';
      case 'pharmacist': return 'Lead Clinical Pharmacist';
      case 'cashier_billing': return 'Cashier & Patient Accounts';
      case 'finance_accountant': return 'Chief Accountant (GL/ERP)';
      case 'procurement_stores': return 'Procurement & Stores';
      case 'hr_payroll': return 'HR & Workforce Payroll';
      case 'biomedical_facilities': return 'Biomedical & Facilities Lead';
      case 'quality_auditor': return 'Quality & Internal Auditor';
      case 'it_security_admin': return 'IT & Systems Security';
      case 'executive_ceo': return 'Executive CEO / COO';
      default: return 'Healthcare Staff';
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 shadow-xs transition-colors cursor-pointer"
      >
        <Shield className="w-3.5 h-3.5 text-teal-400" />
        <span className="max-w-[140px] sm:max-w-[180px] truncate">{currentUser.fullName}</span>
        <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800/80 px-1.5 py-0.5 rounded font-mono">
          {getRoleDisplayName(currentUser.role)}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
            <div className="px-3 py-2 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Switch Role / Staff Identity
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Simulates real server-enforced RBAC & departmental workflows
              </p>
            </div>

            <div className="py-1">
              {allUsers.filter(u => u.role !== 'patient').map(user => {
                const isSelected = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-teal-50/60 font-semibold text-teal-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{user.fullName}</div>
                      <div className="text-[10px] text-slate-500">
                        {getRoleDisplayName(user.role)} · {user.department}
                      </div>
                      {user.licenseNumber && (
                        <div className="text-[9px] font-mono text-teal-700">Lic: {user.licenseNumber}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
