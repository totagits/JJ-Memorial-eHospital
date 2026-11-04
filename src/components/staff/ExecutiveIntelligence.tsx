import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, DollarSign, Activity, Users, Bed, Building, ShieldCheck, ArrowUpRight } from 'lucide-react';

const REVENUE_COST_TREND = [
  { month: 'Jun', revenue: 78500, expenses: 54000, surplus: 24500 },
  { month: 'Jul', revenue: 84200, expenses: 56500, surplus: 27700 },
  { month: 'Aug', revenue: 89000, expenses: 59200, surplus: 29800 },
  { month: 'Sep', revenue: 95400, expenses: 61800, surplus: 33600 },
  { month: 'Oct', revenue: 104200, expenses: 64500, surplus: 39700 },
  { month: 'Nov (Proj)', revenue: 112000, expenses: 67000, surplus: 45000 },
];

const DEPARTMENT_BILLING = [
  { name: 'OPD Consultations', billing: 32000, color: '#0d9488' },
  { name: 'Pharmacy & Meds', billing: 28500, color: '#06b6d4' },
  { name: 'Diagnostic Lab', billing: 19800, color: '#3b82f6' },
  { name: 'Radiology / PACS', billing: 16400, color: '#8b5cf6' },
  { name: 'Inpatient Wards', billing: 22100, color: '#f59e0b' },
  { name: 'Surgical Suites', billing: 18200, color: '#ec4899' },
];

export const ExecutiveIntelligence: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Fiscal Year 2026');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Executive Business Intelligence & Financial Analytics</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Executive Intelligence Command Center
          </h2>
          <p className="text-xs text-slate-500">
            Real-time financial performance, revenue cycle metrics, department-wise billings, and operational margins.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="Fiscal Year 2026">Fiscal Year 2026 (YTD)</option>
            <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
            <option value="Q4 2026">Q4 2026 (Oct - Dec)</option>
          </select>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Monthly Revenue</span>
          <div className="text-2xl font-black text-hospital-navy">$104,200 <span className="text-xs font-normal text-slate-500">USD</span></div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" /> +9.2% from last month
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Net Operating Margin</span>
          <div className="text-2xl font-black text-teal-700">38.1%</div>
          <div className="text-[11px] font-bold text-slate-500">
            $39,700 Operational Surplus
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Inpatient Bed Occupancy</span>
          <div className="text-2xl font-black text-hospital-navy">78.4%</div>
          <div className="text-[11px] font-medium text-slate-500">
            47 of 60 Inpatient Beds Active
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Average Length of Stay (ALOS)</span>
          <div className="text-2xl font-black text-hospital-navy">3.2 <span className="text-xs font-normal text-slate-500">Days</span></div>
          <div className="text-[11px] font-bold text-emerald-600">
            Optimal clinical discharge turnaround
          </div>
        </div>
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Cycle AreaChart (Col 7) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-hospital-navy text-sm">
                Revenue Cycle vs. Operating Costs (USD)
              </h4>
              <span className="text-xs text-slate-400">6-Month Trend (Recharts)</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Balanced Ledger
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_COST_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1d3a',
                    color: '#ffffff',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${val.toLocaleString()} USD`, '']}
                />
                <Legend verticalAlign="top" height={36} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Collections"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Operational Costs"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Billing BarChart (Col 5) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-hospital-navy text-sm">
                Department-wise Billing Distribution
              </h4>
              <span className="text-xs text-slate-400">Monthly Contribution</span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_BILLING} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={110} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1d3a',
                    color: '#ffffff',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${val.toLocaleString()} USD`, 'Billed']}
                />
                <Bar dataKey="billing" radius={[0, 6, 6, 0]}>
                  {DEPARTMENT_BILLING.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
