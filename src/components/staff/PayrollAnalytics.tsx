import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Users, DollarSign, Calculator, Download, CheckCircle2, ShieldCheck, PieChart as PieIcon } from 'lucide-react';

interface EmployeeSalaryRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  baseSalaryUSD: number;
  nasscorpEmployeeUSD: number; // 3%
  incomeTaxUSD: number; // Liberian PIT brackets
  netSalaryUSD: number;
}

const EMPLOYEES: EmployeeSalaryRecord[] = [
  {
    id: 'emp-1',
    name: 'Dr. Emmanuel Tamba, MD',
    role: 'Consultant Internist',
    department: 'Internal Medicine',
    baseSalaryUSD: 3800,
    nasscorpEmployeeUSD: 114,
    incomeTaxUSD: 456,
    netSalaryUSD: 3230,
  },
  {
    id: 'emp-2',
    name: 'Dr. Christian Nyenpan, FACS',
    role: 'Chief Surgical Consultant',
    department: 'Surgery',
    baseSalaryUSD: 4200,
    nasscorpEmployeeUSD: 126,
    incomeTaxUSD: 546,
    netSalaryUSD: 3528,
  },
  {
    id: 'emp-3',
    name: 'Dr. Fatumata Fofana, MD',
    role: 'Head of Emergency',
    department: 'Emergency & Triage',
    baseSalaryUSD: 3400,
    nasscorpEmployeeUSD: 102,
    incomeTaxUSD: 390,
    netSalaryUSD: 2908,
  },
  {
    id: 'emp-4',
    name: 'Nurse Sarah Kiatamba, RN',
    role: 'Triage Nurse Supervisor',
    department: 'Nursing & Triage',
    baseSalaryUSD: 1250,
    nasscorpEmployeeUSD: 37.5,
    incomeTaxUSD: 112.5,
    netSalaryUSD: 1100,
  },
  {
    id: 'emp-5',
    name: 'Pharm. Varney Sheriff, RPh',
    role: 'Chief Pharmacist',
    department: 'Pharmacy',
    baseSalaryUSD: 1600,
    nasscorpEmployeeUSD: 48,
    incomeTaxUSD: 160,
    netSalaryUSD: 1392,
  },
  {
    id: 'emp-6',
    name: 'Sando Coleman',
    role: 'Senior Lab Technologist',
    department: 'Laboratory',
    baseSalaryUSD: 1300,
    nasscorpEmployeeUSD: 39,
    incomeTaxUSD: 117,
    netSalaryUSD: 1144,
  },
];

const DEPARTMENT_PAYROLL = [
  { department: 'Physicians & Surgeons', totalGross: 11400, count: 3, color: '#0d9488' },
  { department: 'Nursing & Triage', totalGross: 4800, count: 4, color: '#06b6d4' },
  { department: 'Pharmacy & Stock', totalGross: 2900, count: 2, color: '#3b82f6' },
  { department: 'Laboratory Diagnostics', totalGross: 2450, count: 2, color: '#8b5cf6' },
  { department: 'Administration & Finance', totalGross: 3100, count: 3, color: '#f59e0b' },
];

export const PayrollAnalytics: React.FC = () => {
  const [payPeriod, setPayPeriod] = useState('October 2026 (Monthly)');

  const totalGross = EMPLOYEES.reduce((acc, e) => acc + e.baseSalaryUSD, 0);
  const totalNasscorp = EMPLOYEES.reduce((acc, e) => acc + e.nasscorpEmployeeUSD, 0);
  const totalTax = EMPLOYEES.reduce((acc, e) => acc + e.incomeTaxUSD, 0);
  const totalNet = EMPLOYEES.reduce((acc, e) => acc + e.netSalaryUSD, 0);

  const DEDUCTIONS_CHART = [
    { name: 'Net Take-Home Pay', value: totalNet, color: '#0d9488' },
    { name: 'Liberian Income Tax (PIT)', value: totalTax, color: '#f43f5e' },
    { name: 'NASSCORP Employee (3%)', value: totalNasscorp, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>Hospital ERP & Human Capital Management</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Payroll Analytics & Statutory Deductions
          </h2>
          <p className="text-xs text-slate-500">
            Automated salary calculations, Liberian NASSCORP contributions, income tax (PIT) withholdings, and departmental wage distributions.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Payroll Register</span>
        </button>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Gross Payroll</span>
          <div className="text-2xl font-black text-hospital-navy">
            ${totalGross.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] font-bold text-slate-500">{EMPLOYEES.length} Core Staff Sample</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Net Disbursed</span>
          <div className="text-2xl font-black text-teal-700">
            ${totalNet.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-600">Disbursed via Direct Bank / Mobile Money</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">NASSCORP Withholding (3%)</span>
          <div className="text-2xl font-black text-amber-600">
            ${totalNasscorp.toFixed(2)} <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500">National Pension Contribution</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Liberian PIT Income Tax</span>
          <div className="text-2xl font-black text-rose-600">
            ${totalTax.toFixed(2)} <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500">Liberia Revenue Authority (LRA)</div>
        </div>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Department Wage Distribution (Col 7) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-hospital-navy text-sm">
            Departmental Gross Salary Distribution (USD)
          </h4>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_PAYROLL} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1d3a',
                    color: '#ffffff',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${val.toLocaleString()} USD`, 'Gross Payroll']}
                />
                <Bar dataKey="totalGross" radius={[6, 6, 0, 0]}>
                  {DEPARTMENT_PAYROLL.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deductions Pie Chart (Col 5) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-hospital-navy text-sm">
            Net Wages vs Statutory Deductions
          </h4>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEDUCTIONS_CHART}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {DEDUCTIONS_CHART.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)} USD`, '']}
                  contentStyle={{
                    backgroundColor: '#0b1d3a',
                    color: '#ffffff',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Employee Payroll Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-hospital-navy text-sm">
            Staff Payroll Register (Pay Period: {payPeriod})
          </h4>
          <span className="text-xs text-slate-400 font-mono">Confidential HR Record</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Name & Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Base Gross</th>
                <th className="py-3 px-4 text-right">NASSCORP (3%)</th>
                <th className="py-3 px-4 text-right">PIT Tax</th>
                <th className="py-3 px-4 text-right font-black">Net Pay (USD)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {EMPLOYEES.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-sans font-bold text-slate-900">
                    {emp.name} <span className="block text-[11px] font-normal text-slate-400">{emp.role}</span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600">
                    {emp.department}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ${emp.baseSalaryUSD.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-600 font-semibold">
                    -${emp.nasscorpEmployeeUSD.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-600 font-semibold">
                    -${emp.incomeTaxUSD.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-teal-700 text-sm">
                    ${emp.netSalaryUSD.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Approved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
