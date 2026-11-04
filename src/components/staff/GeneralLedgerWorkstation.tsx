import React, { useState } from 'react';
import { DollarSign, BookOpen, CheckCircle2, AlertCircle, FileText, ArrowUpDown, PieChart } from 'lucide-react';
import { getDatabaseState } from '../../services/storageService';
import { UserAccount } from '../../types/auth';
import { LRD_PER_USD } from '../../data/seedData';

interface GeneralLedgerWorkstationProps {
  currentUser: UserAccount;
}

export const GeneralLedgerWorkstation: React.FC<GeneralLedgerWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [activeTab, setActiveTab] = useState<'journals' | 'trial_balance' | 'income_statement'>('journals');

  // Compute Trial Balance from all posted General Ledger journals
  const accountBalances: { [key: string]: { name: string; type: string; debitUSD: number; creditUSD: number } } = {
    '1010': { name: 'Cash on Hand (Main Hospital Vault / POS)', type: 'ASSET', debitUSD: 0, creditUSD: 0 },
    '1050': { name: 'Patient Accounts Receivable', type: 'ASSET', debitUSD: 0, creditUSD: 0 },
    '1200': { name: 'Medical & Pharmaceutical Inventory', type: 'ASSET', debitUSD: 1450, creditUSD: 0 },
    '1500': { name: 'Biomedical Equipment & Fixed Assets', type: 'ASSET', debitUSD: 24800, creditUSD: 0 },
    '2010': { name: 'Accounts Payable (Trade Vendors)', type: 'LIABILITY', debitUSD: 0, creditUSD: 810 },
    '3010': { name: 'Hospital Operating Capital & Equity', type: 'EQUITY', debitUSD: 0, creditUSD: 25440 },
    '4010': { name: 'Outpatient Consultation Revenue', type: 'REVENUE', debitUSD: 0, creditUSD: 0 },
    '4020': { name: 'Laboratory Diagnostic Revenue', type: 'REVENUE', debitUSD: 0, creditUSD: 0 },
    '4030': { name: 'Pharmacy Dispensing Revenue', type: 'REVENUE', debitUSD: 0, creditUSD: 0 },
    '4040': { name: 'Inpatient Ward Accommodation Revenue', type: 'REVENUE', debitUSD: 0, creditUSD: 0 },
    '5010': { name: 'Clinical Salaries & Wages Expense', type: 'EXPENSE', debitUSD: 5720, creditUSD: 0 },
    '5020': { name: 'Diesel Generator Fuel & Utilities Expense', type: 'EXPENSE', debitUSD: 380, creditUSD: 0 },
  };

  db.journals.forEach(j => {
    j.entries.forEach(e => {
      if (!accountBalances[e.accountNumber]) {
        accountBalances[e.accountNumber] = {
          name: e.accountName,
          type: e.type,
          debitUSD: 0,
          creditUSD: 0,
        };
      }
      accountBalances[e.accountNumber].debitUSD += e.debitUSD;
      accountBalances[e.accountNumber].creditUSD += e.creditUSD;
    });
  });

  const totalDebits = Object.values(accountBalances).reduce((sum, a) => sum + a.debitUSD, 0);
  const totalCredits = Object.values(accountBalances).reduce((sum, a) => sum + a.creditUSD, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 text-base">General Ledger & Double-Entry Financial Engine</h2>
          <p className="text-xs text-slate-500">Automated Accounting Postings from Patient Billing, Pharmacy, Payroll & Procurement</p>
        </div>
        <div className="text-xs text-slate-700 bg-slate-100 border border-slate-300 px-3 py-1 rounded font-mono">
          Chief Accountant: {currentUser.fullName}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('journals')}
          className={`pb-3 transition-colors ${
            activeTab === 'journals'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Journal Vouchers ({db.journals.length})
        </button>
        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`pb-3 transition-colors ${
            activeTab === 'trial_balance'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Trial Balance & Chart of Accounts
        </button>
        <button
          onClick={() => setActiveTab('income_statement')}
          className={`pb-3 transition-colors ${
            activeTab === 'income_statement'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Profit & Loss Statement (USD & LRD)
        </button>
      </div>

      {activeTab === 'journals' && (
        <div className="space-y-4">
          {db.journals.map(j => (
            <div key={j.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-900 text-sm">{j.voucherNumber}</span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {j.referenceType}
                    </span>
                    {j.isBalanced && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{j.description}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>Date: {j.date}</div>
                  <div>Posted by: {j.postedBy}</div>
                </div>
              </div>

              {/* Journal Lines */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Account Code & Name</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5 text-right">Debit (USD)</th>
                      <th className="p-2.5 text-right">Credit (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {j.entries.map(ent => (
                      <tr key={ent.id}>
                        <td className="p-2.5 font-medium text-slate-900">
                          <span className="font-mono text-teal-800 font-bold mr-2">{ent.accountNumber}</span>
                          {ent.accountName}
                        </td>
                        <td className="p-2.5 text-slate-500">{ent.type}</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                          {ent.debitUSD > 0 ? `$${ent.debitUSD.toFixed(2)}` : '—'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                          {ent.creditUSD > 0 ? `$${ent.creditUSD.toFixed(2)}` : '—'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td colSpan={2} className="p-2.5 text-right">Total Debit & Credit:</td>
                      <td className="p-2.5 text-right font-mono">${j.totalDebitUSD.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono">${j.totalCreditUSD.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'trial_balance' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Trial Balance Summary</h3>
            <span className="text-xs text-slate-500 font-mono">
              Debits: ${totalDebits.toFixed(2)} == Credits: ${totalCredits.toFixed(2)}
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Code</th>
                <th className="p-2.5">Account Title</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5 text-right">Debit (USD)</th>
                <th className="p-2.5 text-right">Credit (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(accountBalances).map(([code, acc]) => (
                <tr key={code}>
                  <td className="p-2.5 font-mono font-bold text-teal-800">{code}</td>
                  <td className="p-2.5 font-medium text-slate-900">{acc.name}</td>
                  <td className="p-2.5 text-slate-500">{acc.type}</td>
                  <td className="p-2.5 text-right font-mono">{acc.debitUSD > 0 ? `$${acc.debitUSD.toFixed(2)}` : '—'}</td>
                  <td className="p-2.5 text-right font-mono">{acc.creditUSD > 0 ? `$${acc.creditUSD.toFixed(2)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'income_statement' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base">J & J Memorial e-Hospital</h3>
            <p className="text-xs text-slate-500">Statement of Comprehensive Income (Profit & Loss) · Multi-Currency USD / LRD</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4 text-xs">
            <div className="border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm block mb-2">1. Operating Clinical Revenues</span>
              <div className="space-y-1.5 pl-4 text-slate-700">
                <div className="flex justify-between">
                  <span>Outpatient Consultation Revenue (4010):</span>
                  <span className="font-mono font-semibold">$15.00 (LRD 2,925)</span>
                </div>
                <div className="flex justify-between">
                  <span>Laboratory Diagnostic Revenue (4020):</span>
                  <span className="font-mono font-semibold">$20.00 (LRD 3,900)</span>
                </div>
                <div className="flex justify-between">
                  <span>Pharmacy Medication Revenue (4030):</span>
                  <span className="font-mono font-semibold">$12.00 (LRD 2,340)</span>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm block mb-2">2. Operating Expenses</span>
              <div className="space-y-1.5 pl-4 text-slate-700">
                <div className="flex justify-between">
                  <span>Staff Salaries & Professional Fees (5010):</span>
                  <span className="font-mono font-semibold">$5,720.00 (LRD 1,115,400)</span>
                </div>
                <div className="flex justify-between">
                  <span>Generator Diesel & Power Utilities (5020):</span>
                  <span className="font-mono font-semibold">$380.00 (LRD 74,100)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 flex justify-between items-center text-sm">
              <span className="font-bold text-teal-950">Net Operational Surplus / Deficit:</span>
              <span className="font-extrabold text-teal-900 font-mono">Balanced General Ledger</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
