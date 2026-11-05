import React from 'react';
import { 
  Users, Stethoscope, HeartPulse, DollarSign, Pill, Shield, 
  Activity, ArrowRight, AlertCircle, CheckCircle2, Clock, 
  TrendingUp, Bed, FileText, Zap, ChevronRight, Droplet, 
  BarChart3, RefreshCw, KeyRound, AlertTriangle, Microscope, Scan,
  CreditCard, ShieldCheck, PieChart as PieIcon, LineChart as LineIcon
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
import { UserAccount } from '../../types/auth';
import { RBACService, PrimaryRole } from '../../services/rbacService';
import { getDatabaseState } from '../../services/storageService';

interface RoleDashboardProps {
  currentUser: UserAccount;
  onNavigateModule: (moduleId: string) => void;
}

// Chart Color Palette for clean clinical UI
const PALETTE = {
  teal: '#0d9488',
  tealDark: '#115e59',
  tealLight: '#99f6e4',
  sky: '#0284c7',
  skyLight: '#bae6fd',
  rose: '#e11d48',
  roseLight: '#fecdd3',
  amber: '#d97706',
  amberLight: '#fde68a',
  emerald: '#059669',
  slate: '#475569',
};

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  currentUser,
  onNavigateModule,
}) => {
  const db = getDatabaseState();
  const primaryRole: PrimaryRole = RBACService.getPrimaryRole(currentUser);

  // -------------------------------------------------------------
  // Diagnostic Laboratory (LIS) Dataset
  // -------------------------------------------------------------
  const labTurnaroundData = [
    { panel: 'Malaria RDT', actualTAT: 18, benchmarkTAT: 30 },
    { panel: 'Blood Film / Parasitemia', actualTAT: 24, benchmarkTAT: 45 },
    { panel: 'Complete Blood Count (CBC)', actualTAT: 28, benchmarkTAT: 40 },
    { panel: 'Blood Glucose & Chem', actualTAT: 32, benchmarkTAT: 45 },
    { panel: 'Widal Typhoid Screen', actualTAT: 38, benchmarkTAT: 45 },
    { panel: 'Urinalysis Micro', actualTAT: 16, benchmarkTAT: 30 },
  ];

  const labWeeklyVolumeData = [
    { day: 'Mon', specimens: 42, positiveMalaria: 14, criticalPanic: 2 },
    { day: 'Tue', specimens: 48, positiveMalaria: 16, criticalPanic: 1 },
    { day: 'Wed', specimens: 56, positiveMalaria: 21, criticalPanic: 3 },
    { day: 'Thu', specimens: 51, positiveMalaria: 18, criticalPanic: 1 },
    { day: 'Fri', specimens: 62, positiveMalaria: 24, criticalPanic: 4 },
    { day: 'Sat', specimens: 38, positiveMalaria: 11, criticalPanic: 0 },
    { day: 'Sun', specimens: 31, positiveMalaria: 9, criticalPanic: 1 },
  ];

  const bloodBankStockData = [
    { name: 'O-Negative (Universal)', units: 4, safeMinimum: 6, fill: '#e11d48' },
    { name: 'O-Positive', units: 8, safeMinimum: 6, fill: '#0d9488' },
    { name: 'A-Positive', units: 5, safeMinimum: 4, fill: '#0284c7' },
    { name: 'B-Positive', units: 3, safeMinimum: 4, fill: '#d97706' },
    { name: 'AB-Positive', units: 2, safeMinimum: 2, fill: '#64748b' },
  ];

  // -------------------------------------------------------------
  // Billing & Financial Dataset
  // -------------------------------------------------------------
  const billingCollectionTrend = [
    { date: 'Oct 28', grossBilledUSD: 3100, cashCollectedUSD: 2750, momoCollectedUSD: 850 },
    { date: 'Oct 29', grossBilledUSD: 3450, cashCollectedUSD: 3100, momoCollectedUSD: 920 },
    { date: 'Oct 30', grossBilledUSD: 3800, cashCollectedUSD: 3350, momoCollectedUSD: 1100 },
    { date: 'Oct 31', grossBilledUSD: 4100, cashCollectedUSD: 3680, momoCollectedUSD: 1250 },
    { date: 'Nov 01', grossBilledUSD: 4600, cashCollectedUSD: 4120, momoCollectedUSD: 1400 },
    { date: 'Nov 02', grossBilledUSD: 3950, cashCollectedUSD: 3500, momoCollectedUSD: 980 },
    { date: 'Nov 03', grossBilledUSD: 4400, cashCollectedUSD: 3980, momoCollectedUSD: 1320 },
  ];

  const accountsReceivableAging = [
    { bracket: 'Current (0-30d)', amountUSD: 4250, count: 28 },
    { bracket: '31-60 Days', amountUSD: 2400, count: 14 },
    { bracket: '61-90 Days', amountUSD: 1150, count: 7 },
    { bracket: '90+ Days (Overdue)', amountUSD: 680, count: 4 },
  ];

  const payerMixData = [
    { name: 'Self-Pay (Cash / MoMo)', value: 58, color: '#0d9488' },
    { name: 'Activa Liberia Insurance', value: 24, color: '#0284c7' },
    { name: 'Intrasur Healthcare Payer', value: 12, color: '#d97706' },
    { name: 'AGI Corporate Health', value: 6, color: '#64748b' },
  ];

  // -------------------------------------------------------------
  // Clinician & Doctor Dataset
  // -------------------------------------------------------------
  const topDiagnosesICD11 = [
    { code: '1F40', title: 'Severe Plasmodium Falciparum Malaria', cases: 38 },
    { code: 'BA00', title: 'Essential Severe Hypertension', cases: 24 },
    { code: '5A11', title: 'Type 2 Diabetes Mellitus with Dysregulation', cases: 19 },
    { code: 'CA42', title: 'Acute Bronchitis & Lower Respiratory', cases: 15 },
    { code: '1A07', title: 'Typhoid & Paratyphoid Fevers', cases: 12 },
  ];

  const patientTriageAcuity = [
    { name: 'Emergency (RED)', value: 3, color: '#e11d48' },
    { name: 'Urgent (YELLOW)', value: 8, color: '#d97706' },
    { name: 'Routine (GREEN)', value: 22, color: '#059669' },
  ];

  // -------------------------------------------------------------
  // Live State Calculations
  // -------------------------------------------------------------
  const pendingLabsCount = db.labOrders?.filter(o => o.status !== 'RELEASED' && o.status !== 'CANCELLED').length || 0;
  const criticalPanicCount = db.labOrders?.filter(o => o.results?.isCritical === true).length || 0;
  const outstandingInvoices = db.invoices?.filter(i => i.status === 'POSTED' || i.status === 'PARTIALLY_PAID') || [];
  const outstandingBalanceUsd = outstandingInvoices.reduce((sum, i) => sum + i.balanceUSD, 0);
  const totalReceiptsUsd = db.receipts?.reduce((sum, r) => sum + r.amountUSD + (r.amountLRD / 195), 0) || 0;
  const occupiedBeds = db.beds?.filter(b => b.status === 'OCCUPIED').length || 0;
  const totalBeds = db.beds?.length || 20;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-900 text-teal-200 flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            {primaryRole === 'LIS' ? <Microscope className="w-6 h-6 text-teal-300" /> :
             primaryRole === 'Billing' ? <DollarSign className="w-6 h-6 text-teal-300" /> :
             primaryRole === 'Clinician' ? <Stethoscope className="w-6 h-6 text-teal-300" /> :
             primaryRole === 'Nurse' ? <HeartPulse className="w-6 h-6 text-teal-300" /> :
             primaryRole === 'Pharmacy' ? <Pill className="w-6 h-6 text-teal-300" /> :
             <Shield className="w-6 h-6 text-teal-300" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">{currentUser.fullName}</h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                {primaryRole} Workstation & Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.department} &bull; Statutory Role: <span className="font-mono text-slate-700 font-semibold">{currentUser.role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">RBAC Security Scope:</span>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Segregation of Duties Enforced
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. LABORATORY SCIENTIST (LIS) ANALYTICS DASHBOARD              */}
      {/* ============================================================== */}
      {primaryRole === 'LIS' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-amber-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Specimen Runs</span>
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl font-extrabold text-amber-950">{pendingLabsCount} Requisitions</div>
              <p className="text-[11px] text-amber-700 mt-1">Awaiting technician test release</p>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Critical Panic Alerts</span>
                <AlertTriangle className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-extrabold text-rose-950">
                {criticalPanicCount} Immediate
              </div>
              <p className="text-[11px] text-rose-700 mt-1">Requires STAT physician call</p>
            </div>

            <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-red-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">O-Negative Cold Chain</span>
                <Droplet className="w-4 h-4 text-red-700" />
              </div>
              <div className="text-2xl font-extrabold text-red-950">4 Units Available</div>
              <p className="text-[11px] text-red-700 mt-1">Universal emergency resuscitation</p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Average Turnaround (TAT)</span>
                <TrendingUp className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">28.4 min</div>
              <p className="text-[11px] text-teal-700 mt-1">Target: &lt; 45 minutes for STAT</p>
            </div>
          </div>

          {/* Recharts Analytic Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Turnaround Time by Panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Diagnostic Turnaround Time (TAT) by Test Panel
                  </h4>
                  <p className="text-[11px] text-slate-500">Minutes from specimen receipt to electronic sign-off</p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                  TAT BENCHMARK
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={labTurnaroundData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" unit="m" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="panel" type="category" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip formatter={(value: any) => [`${value} min`, 'Duration']} />
                    <Bar dataKey="actualTAT" fill="#0d9488" name="Actual TAT" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="benchmarkTAT" fill="#e2e8f0" name="Target Ceiling" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Weekly Specimen Volume & Positivity */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    7-Day Specimen Volume & Malaria Positivity Trend
                  </h4>
                  <p className="text-[11px] text-slate-500">Daily LIS throughput across outpatient & trauma bays</p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded">
                  EPIDEMIOLOGY
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={labWeeklyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorSpecimens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorMalaria" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="specimens" stroke="#0284c7" fillOpacity={1} fill="url(#colorSpecimens)" name="Total Specimens" />
                    <Area type="monotone" dataKey="positiveMalaria" stroke="#e11d48" fillOpacity={1} fill="url(#colorMalaria)" name="Positive Malaria" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Laboratory Information System (LIS) Decision Protocol</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Critical panic findings trigger automated SMS and encrypted EMR dispatch to the Attending Physician.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigateModule('blood_bank')}
                className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Droplet className="w-3.5 h-3.5" />
                <span>Blood Bank Units</span>
              </button>
              <button
                onClick={() => onNavigateModule('lab')}
                className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Microscope className="w-3.5 h-3.5" />
                <span>Open Diagnostic LIS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. BILLING & FINANCIAL ANALYTICS DASHBOARD                      */}
      {/* ============================================================== */}
      {primaryRole === 'Billing' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Revenue Cycle Total</span>
                <DollarSign className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">${totalReceiptsUsd.toFixed(2)}</div>
              <p className="text-[11px] text-emerald-700 mt-1">Receipted cash & mobile money (USD equiv.)</p>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Outstanding Receivables</span>
                <AlertCircle className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-extrabold text-rose-950">${outstandingBalanceUsd.toFixed(2)}</div>
              <p className="text-[11px] text-rose-700 mt-1">{outstandingInvoices.length} unsettled invoices</p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Liberian Dollar Inflow</span>
                <TrendingUp className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">{(totalReceiptsUsd * 195).toLocaleString()} LRD</div>
              <p className="text-[11px] text-teal-700 mt-1">Central Bank Rate: 195.00 LRD/USD</p>
            </div>

            <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-sky-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Payer Claim Clearance</span>
                <CreditCard className="w-4 h-4 text-sky-700" />
              </div>
              <div className="text-2xl font-extrabold text-sky-950">98.2%</div>
              <p className="text-[11px] text-sky-700 mt-1">Activa & Intrasur clean claim rate</p>
            </div>
          </div>

          {/* Recharts Analytic Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Revenue Collection Flow */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    7-Day Gross Billed vs Cash & MoMo Collected (USD)
                  </h4>
                  <p className="text-[11px] text-slate-500">Daily cashier register settlements at VOA East</p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                  CASH FLOW
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={billingCollectionTrend} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="$" />
                    <Tooltip formatter={(value: any) => [`$${value}`, 'Amount']} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="grossBilledUSD" stroke="#64748b" fill="#f1f5f9" name="Gross Billed" />
                    <Area type="monotone" dataKey="cashCollectedUSD" stroke="#0d9488" fill="#99f6e4" name="Cash Collected" />
                    <Area type="monotone" dataKey="momoCollectedUSD" stroke="#0284c7" fill="#bae6fd" name="Mobile Money" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Accounts Receivable Aging & Payer Mix */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Payer Mix & Receivables Aging Breakdown
                  </h4>
                  <p className="text-[11px] text-slate-500">Self-Pay vs Institutional Insurers</p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded">
                  PORTFOLIO
                </span>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={payerMixData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }: { name?: string; percent?: number }) => `${(name ?? '').split(' ')[0]} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {payerMixData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}% of Volume`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Patient Accounts & Shift Reconciliation</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Segregation of duties: Cashiers cannot modify clinical encounter diagnoses or laboratory results.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('billing')}
              className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Launch Billing Workstation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CLINICIAN (DOCTOR / OPD) ANALYTICS DASHBOARD                */}
      {/* ============================================================== */}
      {primaryRole === 'Clinician' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Outpatient Queue</span>
                <Users className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">{db.queue.length} Patients</div>
              <p className="text-[11px] text-teal-700 mt-1">Awaiting clinical consultation</p>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Emergency STAT Cases</span>
                <HeartPulse className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-extrabold text-rose-950">
                {db.queue.filter(q => q.priority === 'EMERGENCY').length} Acute
              </div>
              <p className="text-[11px] text-rose-700 mt-1">Triage SATS Red category</p>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-blue-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Clinical Encounters</span>
                <FileText className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl font-extrabold text-blue-950">{db.encounters.length} Logged</div>
              <p className="text-[11px] text-blue-700 mt-1">Coded with ICD-11 diagnosis</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Antibiotic Stewardship</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">94.8%</div>
              <p className="text-[11px] text-emerald-700 mt-1">MoH first-line ACT compliance</p>
            </div>
          </div>

          {/* Top Diagnoses Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Top Clinical Diagnoses by ICD-11 Classification
                </h4>
                <p className="text-[11px] text-slate-500">Epidemiological disease surveillance in VOA East community</p>
              </div>
              <button
                onClick={() => onNavigateModule('opd')}
                className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open OPD EMR</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDiagnosesICD11} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="title" type="category" tick={{ fontSize: 10 }} width={160} />
                  <Tooltip formatter={(value: any) => [`${value} Patients`, 'Incidence']} />
                  <Bar dataKey="cases" fill="#0d9488" name="Active Cases" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. NURSE ROLE ANALYTICS DASHBOARD                              */}
      {/* ============================================================== */}
      {primaryRole === 'Nurse' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Emergency (RED)</span>
                <HeartPulse className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-extrabold text-rose-950">
                {db.queue.filter(q => q.priority === 'EMERGENCY').length} Acute
              </div>
              <p className="text-[11px] text-rose-700 mt-1">Immediate resuscitation bay</p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-amber-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Urgent (YELLOW)</span>
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl font-extrabold text-amber-950">
                {db.queue.filter(q => q.priority === 'URGENT').length} Patients
              </div>
              <p className="text-[11px] text-amber-700 mt-1">Reassess within 15 minutes</p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Bed Occupancy</span>
                <Bed className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">
                {Math.round((occupiedBeds / (totalBeds || 1)) * 100)}%
              </div>
              <p className="text-[11px] text-teal-700 mt-1">{occupiedBeds} of {totalBeds} Inpatient beds</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Routine (GREEN)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">
                {db.queue.filter(q => q.priority === 'ROUTINE').length} Patients
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">Standard clinical queue</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Ward Acuity & Triage Protocol</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Hourly vitals logging active across Female Ward Bed 01 and Pediatric Bay 02.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('triage')}
              className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <span>Launch Triage & Vitals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. PHARMACY & FORMULARY ANALYTICS DASHBOARD                    */}
      {/* ============================================================== */}
      {primaryRole === 'Pharmacy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Low Stock Alerts</span>
                <AlertTriangle className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-extrabold text-rose-950">
                {db.inventory?.filter(i => i.currentStock <= i.reorderLevel).length || 0} Items
              </div>
              <p className="text-[11px] text-rose-700 mt-1">At or below reorder threshold</p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Dispense</span>
                <Pill className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">
                {db.prescriptions?.filter(p => p.status === 'PENDING_PHARMACY' || p.status === 'VERIFIED').length || 0} Orders
              </div>
              <p className="text-[11px] text-teal-700 mt-1">Awaiting clinical verification</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Antimicrobial Ratio</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">31.2%</div>
              <p className="text-[11px] text-emerald-700 mt-1">WHO stewardship benchmark (&lt;35%)</p>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-blue-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Central Stock Count</span>
                <Activity className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl font-extrabold text-blue-950">{db.inventory.length} Stocked</div>
              <p className="text-[11px] text-blue-700 mt-1">Essential medicines in store</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Pharmacy Formulary Control</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Segregation of duties: Pharmacists review prescription indications without access to General Ledger journal entries.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('pharmacy')}
              className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Open Pharmacy Dispensary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. ADMIN & GOVERNANCE ANALYTICS DASHBOARD                      */}
      {/* ============================================================== */}
      {primaryRole === 'Admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 text-white rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Active Staff</span>
                <Shield className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">
                {db.users?.filter(u => u.status === 'active').length || 0} Accounts
              </div>
              <p className="text-[11px] text-slate-400 mt-1">RBAC enforced across all terminals</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Facility Power</span>
                <Zap className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">100% Uptime</div>
              <p className="text-[11px] text-emerald-700 mt-1">Grid + 500kVA Cummins generator</p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Audit Security Log</span>
                <ShieldCheck className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">
                {db.auditLogs?.length || 0} Records
              </div>
              <p className="text-[11px] text-teal-700 mt-1">SHA-256 chained immutable ledger</p>
            </div>

            <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-sky-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Clinical Bed Occupancy</span>
                <Bed className="w-4 h-4 text-sky-700" />
              </div>
              <div className="text-2xl font-extrabold text-sky-950">
                {Math.round((occupiedBeds / (totalBeds || 1)) * 100)}%
              </div>
              <p className="text-[11px] text-sky-700 mt-1">{occupiedBeds} of {totalBeds} beds occupied</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Hospital Command Center & Governance</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Executive intelligence overview across clinical outcomes, revenue cycle, and inventory procurement.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('executive_bi')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
              <span>Launch Executive BI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
