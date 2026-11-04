import React, { useState } from 'react';
import { Users, Award, Calendar, DollarSign, CheckCircle2, AlertTriangle, FileText, Clock } from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { UserAccount } from '../../types/auth';
import { LRD_PER_USD } from '../../data/seedData';

interface HRPayrollWorkstationProps {
  currentUser: UserAccount;
}

export const HRPayrollWorkstation: React.FC<HRPayrollWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [activeTab, setActiveTab] = useState<'employees' | 'payroll' | 'roster'>('employees');

  const totalPayrollUSD = db.employees.reduce((sum, e) => sum + e.monthlySalaryUSD, 0);
  const totalPayrollLRD = db.employees.reduce((sum, e) => sum + e.monthlySalaryLRD, 0);

  const handleRunPayroll = () => {
    const period = 'November 2026';
    const grossUSD = totalPayrollUSD;
    const taxUSD = Math.round(grossUSD * 0.12);
    const netUSD = grossUSD - taxUSD;
    const voucherNumber = `JV-2026-${String(db.journals.length + 193).padStart(5, '0')}`;

    updateDatabaseState(draft => {
      draft.payrollRuns.unshift({
        id: `PAY-${Date.now()}`,
        periodName: period,
        runDate: new Date().toISOString().split('T')[0],
        totalGrossUSD: grossUSD,
        totalGrossLRD: grossUSD * LRD_PER_USD,
        totalTaxDeductionsUSD: taxUSD,
        totalNetPayUSD: netUSD,
        employeeCount: draft.employees.length,
        status: 'POSTED_TO_GL',
        approvedBy: currentUser.fullName,
        postedJournalVoucher: voucherNumber,
      });

      // Post Journal voucher to GL automatically
      draft.journals.unshift({
        id: `JV-${Date.now()}`,
        voucherNumber,
        date: new Date().toISOString().split('T')[0],
        description: `Hospital Clinical & Operational Payroll Disbursement for ${period}`,
        referenceType: 'PAYROLL_DISBURSEMENT',
        referenceId: `PAY-${Date.now()}`,
        entries: [
          {
            id: `ENT-${Date.now()}-EXP`,
            accountNumber: '5010',
            accountName: 'Clinical Salaries & Wages Expense',
            type: 'EXPENSE',
            debitUSD: grossUSD,
            creditUSD: 0,
            debitLRD: grossUSD * LRD_PER_USD,
            creditLRD: 0,
          },
          {
            id: `ENT-${Date.now()}-BANK`,
            accountNumber: '1010',
            accountName: 'Cash on Hand / Commercial Bank Payroll Vault',
            type: 'ASSET',
            debitUSD: 0,
            creditUSD: grossUSD,
            debitLRD: 0,
            creditLRD: grossUSD * LRD_PER_USD,
          }
        ],
        totalDebitUSD: grossUSD,
        totalCreditUSD: grossUSD,
        isBalanced: true,
        postedBy: currentUser.fullName,
        createdAt: new Date().toISOString(),
      });
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'HR',
      resourceId: voucherNumber,
      details: `Processed and approved hospital monthly payroll (${period}): Gross USD $${grossUSD} posted to General Ledger ${voucherNumber}.`,
      ipAddress: 'HR & Payroll Station',
      status: 'SUCCESS',
    });

    alert(`Payroll for ${period} successfully calculated and posted to General Ledger (${voucherNumber})!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 text-base">Human Resources & Workforce Payroll</h2>
          <p className="text-xs text-slate-500">Practitioner Licensure Verification, Duty Rostering, Statutory Deductions & GL Posting</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunPayroll}
            className="bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Process Monthly Payroll Run</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 transition-colors ${
            activeTab === 'employees'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Staff Directory & Credentials ({db.employees.length})
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 transition-colors ${
            activeTab === 'payroll'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Payroll Runs & Slips
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 transition-colors ${
            activeTab === 'roster'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Duty Rosters & Shifts
        </button>
      </div>

      {activeTab === 'employees' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Medical Faculty & Administrative Staff</h3>
            <span className="text-xs text-slate-500">License Verification Alerts Active</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Staff ID & Full Name</th>
                <th className="p-2.5">Designation & Department</th>
                <th className="p-2.5">Medical License Number</th>
                <th className="p-2.5">License Expiry</th>
                <th className="p-2.5">Shift Duty</th>
                <th className="p-2.5 text-right">Base Salary (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.employees.map(emp => (
                <tr key={emp.id} className={emp.isLicenseExpiringSoon ? 'bg-amber-50/50' : ''}>
                  <td className="p-2.5 font-medium text-slate-900">
                    <span className="font-mono text-teal-800 font-bold mr-2">{emp.staffId}</span>
                    {emp.fullName}
                  </td>
                  <td className="p-2.5 text-slate-600">
                    <div>{emp.role}</div>
                    <div className="text-[10px] text-slate-400">{emp.department}</div>
                  </td>
                  <td className="p-2.5 font-mono text-slate-800 font-semibold">{emp.licenseNumber}</td>
                  <td className="p-2.5">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                      emp.isLicenseExpiringSoon ? 'bg-amber-100 text-amber-900 flex items-center gap-1 w-fit' : 'text-slate-700'
                    }`}>
                      {emp.isLicenseExpiringSoon && <AlertTriangle className="w-3 h-3 text-amber-700" />}
                      {emp.licenseExpiry}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">
                      {emp.shiftSchedule}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                    ${emp.monthlySalaryUSD.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="space-y-4">
          {db.payrollRuns.map(pr => (
            <div key={pr.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">{pr.periodName} Payroll Run</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      {pr.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    GL Voucher: <span className="font-mono text-teal-800 font-semibold">{pr.postedJournalVoucher}</span> · Approved by: {pr.approvedBy}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-mono font-bold text-slate-900 text-base">USD ${pr.totalGrossUSD.toFixed(2)}</div>
                  <div className="text-slate-500 text-[11px] font-mono">LRD {pr.totalGrossLRD.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-500 block">Total Gross Wages:</span>
                  <span className="font-bold text-slate-900">${pr.totalGrossUSD.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Statutory Tax Withholding:</span>
                  <span className="font-bold text-rose-700">${pr.totalTaxDeductionsUSD.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Net Bank Disbursement:</span>
                  <span className="font-bold text-emerald-700">${pr.totalNetPayUSD.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'roster' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">24/7 Clinical & Shift Coverage Roster</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-teal-900 block">Morning Shift (08:00 - 16:00)</span>
              <ul className="space-y-1 text-slate-600">
                <li>• Dr. Evelyn Sirleaf-Gbotoe (OPD)</li>
                <li>• Sister Comfort Weah, RN (Inpatient)</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-indigo-900 block">Afternoon Shift (16:00 - 24:00)</span>
              <ul className="space-y-1 text-slate-600">
                <li>• Samuel Flomo, RN (Triage/Acute)</li>
                <li>• Duty Lab Tech (LIS Access)</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-purple-900 block">Night Shift (00:00 - 08:00)</span>
              <ul className="space-y-1 text-slate-600">
                <li>• Night Inpatient Nursing Cadre</li>
                <li>• Emergency Resuscitation Nurse</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-rose-900 block">Physician On-Call</span>
              <ul className="space-y-1 text-slate-600">
                <li>• Dr. J. Saydee Kollie, MD (Internal Med)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
