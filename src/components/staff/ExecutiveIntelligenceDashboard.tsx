import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieIcon, 
  BarChart3, 
  Activity, 
  Calendar, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  CreditCard, 
  Fuel, 
  ShieldCheck, 
  Users, 
  Bed, 
  Clock,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { getDatabaseState } from '../../services/storageService';
import { LRD_PER_USD } from '../../data/seedData';

// Chart Data Structures
const MONTHLY_REVENUE_CYCLE_DATA = [
  { month: 'Jun 2026', grossBilledUSD: 62400, cashCollectedUSD: 54200, operationalCostUSD: 41800, receivablesUSD: 8200 },
  { month: 'Jul 2026', grossBilledUSD: 68100, cashCollectedUSD: 61000, operationalCostUSD: 43200, receivablesUSD: 7100 },
  { month: 'Aug 2026', grossBilledUSD: 74500, cashCollectedUSD: 66800, operationalCostUSD: 46100, receivablesUSD: 7700 },
  { month: 'Sep 2026', grossBilledUSD: 81200, cashCollectedUSD: 72900, operationalCostUSD: 48500, receivablesUSD: 8300 },
  { month: 'Oct 2026', grossBilledUSD: 89400, cashCollectedUSD: 81300, operationalCostUSD: 51200, receivablesUSD: 8100 },
  { month: 'Nov 2026', grossBilledUSD: 98600, cashCollectedUSD: 90400, operationalCostUSD: 54600, receivablesUSD: 8200 },
];

const DEPARTMENT_BILLING_TRENDS = [
  { department: 'Outpatient (OPD)', Q2: 24500, Q3: 29800, Q4: 34200 },
  { department: 'Inpatient Wards', Q2: 31200, Q3: 36400, Q4: 42100 },
  { department: 'Diagnostic Lab', Q2: 18400, Q3: 21500, Q4: 26300 },
  { department: 'Radiology / PACS', Q2: 14200, Q3: 17800, Q4: 22400 },
  { department: 'Pharmacy Formulary', Q2: 28600, Q3: 33100, Q4: 38900 },
  { department: 'Surgical & Emergency', Q2: 16500, Q3: 20400, Q4: 25800 },
];

const OPERATIONAL_COST_BREAKDOWN = [
  { name: 'Clinical Staff & Payroll', value: 46, color: '#0d9488' }, // Teal
  { name: 'Pharmaceuticals & Consumables', value: 24, color: '#3b82f6' }, // Blue
  { name: 'Cummins Generator Fuel (Diesel)', value: 12, color: '#f59e0b' }, // Amber
  { name: 'Biomedical Equipment Maint.', value: 9, color: '#8b5cf6' }, // Purple
  { name: 'Facility & Operations Overhead', value: 9, color: '#64748b' }, // Slate
];

const RECEIVABLES_AGING_DATA = [
  { bracket: '0-30 Days (Current)', amountUSD: 24500, percentage: 61, color: '#10b981' },
  { bracket: '31-60 Days', amountUSD: 8900, percentage: 22, color: '#3b82f6' },
  { bracket: '61-90 Days', amountUSD: 4600, percentage: 11, color: '#f59e0b' },
  { bracket: '90+ Days (At Risk)', amountUSD: 2400, percentage: 6, color: '#ef4444' },
];

export const ExecutiveIntelligenceDashboard: React.FC = () => {
  const db = getDatabaseState();
  const [currency, setCurrency] = useState<'USD' | 'LRD'>('USD');
  const [timeRange, setTimeRange] = useState<'6M' | 'YTD' | 'FY26'>('6M');

  const currencyMultiplier = currency === 'LRD' ? LRD_PER_USD : 1;
  const currencySymbol = currency === 'USD' ? '$' : 'LRD ';

  const formatCurrency = (valUSD: number) => {
    const val = valUSD * currencyMultiplier;
    if (currency === 'LRD') {
      return `LRD ${(val / 1000).toFixed(1)}k`;
    }
    return `$${val.toLocaleString()}`;
  };

  // Aggregated Totals
  const currentMonth = MONTHLY_REVENUE_CYCLE_DATA[MONTHLY_REVENUE_CYCLE_DATA.length - 1];
  const grossBilled = currentMonth.grossBilledUSD;
  const cashCollected = currentMonth.cashCollectedUSD;
  const operationalCosts = currentMonth.operationalCostUSD;
  const netOperatingMargin = grossBilled - operationalCosts;
  const ebitdaMarginPercent = Math.round((netOperatingMargin / grossBilled) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-extrabold text-base tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              Executive Intelligence & Revenue Cycle Analytics
            </span>
            <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-mono">
              FINANCIAL TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400">
            J & J Memorial e-Hospital · Hospital Revenue Cycles, Departmental Yields & Monthly Operating Expenditure
          </p>
        </div>

        {/* Currency & Range Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Toggle */}
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex text-xs font-semibold">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                currency === 'USD' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('LRD')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                currency === 'LRD' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              LRD (195.00)
            </button>
          </div>

          {/* Time Range */}
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex text-xs font-semibold">
            {(['6M', 'YTD', 'FY26'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  timeRange === range ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Executive Intelligence CSV summary exported.')}
            className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* Primary Financial KPI Cards (COMPREO ERP Aesthetic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Billed Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Gross Patient Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              $
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(grossBilled)}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+10.3% vs prior month (OPD surge)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Cash Collections */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Reconciled Cash Collections</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-700">
              {formatCurrency(cashCollected)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <span>91.7% Clean Collection Velocity</span>
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Operational Costs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Monthly Operating Cost (OPEX)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(operationalCosts)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <span>Includes 500kVA Diesel fuel & payroll</span>
            </div>
          </div>
        </div>

        {/* Card 4: Operating Net & EBITDA */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Net Operating Margin (EBITDA)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-indigo-700">
              {formatCurrency(netOperatingMargin)}
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 mt-1">
              <span>{ebitdaMarginPercent}% Operating EBITDA Margin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Hospital Revenue Cycle Trend (AreaChart) & Operating Cost Breakdown (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Revenue Cycle & Cash Trajectory (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-700" />
                Hospital Revenue Cycle & Operating Trajectory (6 Months)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Gross patient billing vs reconciled cash collections vs operational expenditures
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-600" />
                <span>Gross Billed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Collections</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span>OPEX Cost</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_REVENUE_CYCLE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={val => `$${val / 1000}k`} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="grossBilledUSD" name="Gross Billed" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBilled)" />
                <Area type="monotone" dataKey="cashCollectedUSD" name="Cash Collections" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCash)" />
                <Area type="monotone" dataKey="operationalCostUSD" name="Operational Cost" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Operational Cost Structure (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-700" />
              Monthly Operational Costs (OPEX)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Expenditure distribution across departments
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={OPERATIONAL_COST_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {OPERATIONAL_COST_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val}% of total OPEX`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 text-[11px]">
            {OPERATIONAL_COST_BREAKDOWN.map(item => (
              <div key={item.name} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[190px]">{item.name}</span>
                </div>
                <strong className="text-slate-900 font-mono">{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Department-Wise Billing Trends (BarChart) & Receivables Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 3: Department-Wise Billing Yields (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-700" />
                Department-Wise Billing Trends (Q2 vs Q3 vs Q4)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Yield comparisons across clinical, diagnostic, pharmacy, and imaging units
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-300" />
                <span>Q2</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-teal-400" />
                <span>Q3</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-teal-800" />
                <span>Q4 (Current)</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_BILLING_TRENDS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={val => `$${val / 1000}k`} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="Q2" name="Q2 Revenue" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Q3" name="Q3 Revenue" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Q4" name="Q4 Revenue" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Accounts Receivable Aging & Credit Quality (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              Patient Receivables Aging
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Outstanding balances across aging buckets
            </p>
          </div>

          <div className="space-y-3">
            {RECEIVABLES_AGING_DATA.map(item => (
              <div key={item.bracket} className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.bracket}</span>
                  <strong className="text-slate-900 font-mono">
                    {formatCurrency(item.amountUSD)}
                  </strong>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color 
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{item.percentage}% of outstanding AR</span>
                  <span>Low Delinquency</span>
                </div>
              </div>
            ))}
          </div>

          {/* VOA East Power & Energy Cost Safeguard Note */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-[11px] text-amber-950">
              <Fuel className="w-3.5 h-3.5 text-amber-700" />
              VOA East Energy Cost Optimization
            </span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Hybrid solar array covers 38% of daytime baseline clinical load, reducing Cummins 500kVA diesel consumption by 140 gallons/week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
