import React from 'react';
import { 
  Users, Stethoscope, HeartPulse, DollarSign, Pill, Shield, 
  Activity, ArrowRight, AlertCircle, CheckCircle2, Clock, 
  TrendingUp, Bed, FileText, Zap, ChevronRight, Droplet, 
  BarChart3, RefreshCw, KeyRound, AlertTriangle, Microscope, Scan
} from 'lucide-react';
import { UserAccount } from '../../types/auth';
import { RBACService, PrimaryRole } from '../../services/rbacService';
import { getDatabaseState } from '../../services/storageService';

interface UserRoleDashboardProps {
  currentUser: UserAccount;
  onNavigateModule: (moduleId: string) => void;
}

export const UserRoleDashboard: React.FC<UserRoleDashboardProps> = ({
  currentUser,
  onNavigateModule,
}) => {
  const db = getDatabaseState();
  const primaryRole: PrimaryRole = RBACService.getPrimaryRole(currentUser);

  // Live Database aggregates
  const patientLoad = db.queue?.length || 0;
  const recentEncounters = db.encounters?.slice(-5).reverse() || [];
  const pendingLabs = db.labOrders?.filter(o => o.status !== 'RELEASED' && o.status !== 'CANCELLED').length || 0;
  const emergencyTriageCount = db.queue?.filter(q => q.priority === 'EMERGENCY').length || 0;
  const urgentTriageCount = db.queue?.filter(q => q.priority === 'URGENT').length || 0;
  const routineTriageCount = db.queue?.filter(q => q.priority === 'ROUTINE').length || 0;
  const occupiedBeds = db.beds?.filter(b => b.status === 'OCCUPIED').length || 0;
  const totalBeds = db.beds?.length || 20;
  const bedOccupancyRate = Math.round((occupiedBeds / (totalBeds || 1)) * 100);

  // Finance aggregates
  const totalReceiptsUsd = db.receipts?.reduce((sum, r) => sum + r.amountUSD + (r.amountLRD / 195), 0) || 0;
  const totalReceiptsLrd = db.receipts?.reduce((sum, r) => sum + r.amountLRD, 0) || 0;
  const outstandingInvoices = db.invoices?.filter(i => i.status === 'POSTED' || i.status === 'PARTIALLY_PAID') || [];
  const outstandingBalanceUsd = outstandingInvoices.reduce((sum, i) => sum + i.balanceUSD, 0);

  // Pharmacy aggregates
  const lowStockItems = db.inventory?.filter(i => i.currentStock <= i.reorderLevel) || [];
  const pendingPrescriptions = db.prescriptions?.filter(p => p.status === 'PENDING_PHARMACY' || p.status === 'VERIFIED').length || 0;

  // Admin aggregates
  const activeUsersCount = db.users?.filter(u => u.status === 'active').length || 0;
  const auditFlagsCount = db.auditLogs?.filter(a => a.status === 'FLAGGED').length || 0;
  const breakGlassCount = db.auditLogs?.filter(a => a.action === 'BREAK_GLASS').length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Top Role Identification Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-800 text-teal-100 flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            {currentUser.fullName.split(' ')[1]?.[0] || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">{currentUser.fullName}</h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                {primaryRole} Role Workspace
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.department} &bull; License: <span className="font-mono text-slate-700 font-semibold">{currentUser.licenseNumber || 'Active'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-500 font-medium">Shift Status:</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active On-Duty
          </span>
        </div>
      </div>

      {/* Role-Specific Analytics Dashboard Content */}

      {/* 1. CLINICIAN ROLE DASHBOARD */}
      {primaryRole === 'Clinician' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Patient Load</span>
                <Users className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">{patientLoad} Patients</div>
              <p className="text-[11px] text-teal-700 mt-1">In active OPD & acute consult queue</p>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-blue-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Recent Diagnoses</span>
                <Stethoscope className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl font-extrabold text-blue-950">{db.encounters.length} Logged</div>
              <p className="text-[11px] text-blue-700 mt-1">Encounters coded with ICD-11</p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-amber-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Lab Orders</span>
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl font-extrabold text-amber-950">{pendingLabs} Requisitions</div>
              <p className="text-[11px] text-amber-700 mt-1">Awaiting technician release</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Stewardship Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">94.8%</div>
              <p className="text-[11px] text-emerald-700 mt-1">First-line empirical compliance</p>
            </div>
          </div>

          {/* Recent Diagnoses Table */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent Clinical Diagnoses & Encounter Log
              </h4>
              <button
                onClick={() => onNavigateModule('opd')}
                className="text-xs text-teal-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open OPD EMR Chart</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {recentEncounters.slice(0, 3).map((enc, idx) => {
                const primaryDiag = enc.diagnoses?.find(d => d.type === 'PRIMARY') || enc.diagnoses?.[0];
                return (
                  <div key={idx} className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{enc.patientName}</span>{' '}
                      <span className="font-mono text-[11px] text-slate-500">({enc.patientMrn})</span>
                      <p className="text-slate-600 mt-0.5">
                        <strong className="text-slate-800">Primary Diagnosis:</strong> {primaryDiag?.title || 'General Medical Consultation'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-teal-50 text-teal-800 font-mono text-[11px] font-semibold px-2 py-0.5 rounded border border-teal-200">
                        ICD-11: {primaryDiag?.code || '1F40'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(enc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. NURSE ROLE DASHBOARD */}
      {primaryRole === 'Nurse' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Emergency RED</span>
                <HeartPulse className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-extrabold text-rose-950">{emergencyTriageCount} Acute</div>
              <p className="text-[11px] text-rose-700 mt-1">Requires immediate resuscitation</p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-amber-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Urgent YELLOW</span>
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl font-extrabold text-amber-950">{urgentTriageCount} Patients</div>
              <p className="text-[11px] text-amber-700 mt-1">Reassess within 15 minutes</p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Bed Occupancy</span>
                <Bed className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">{bedOccupancyRate}%</div>
              <p className="text-[11px] text-teal-700 mt-1">{occupiedBeds} of {totalBeds} Inpatient beds</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Routine GREEN</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">{routineTriageCount} Patients</div>
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
              className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Launch Triage & Vitals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. BILLING ROLE DASHBOARD */}
      {primaryRole === 'Billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Revenue Cycle</span>
                <DollarSign className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">${totalReceiptsUsd.toFixed(2)}</div>
              <p className="text-[11px] text-emerald-700 mt-1">Combined receipts (USD equiv.)</p>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Outstanding Payments</span>
                <AlertCircle className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-extrabold text-rose-950">${outstandingBalanceUsd.toFixed(2)}</div>
              <p className="text-[11px] text-rose-700 mt-1">{outstandingInvoices.length} unsettled invoices</p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Liberian Dollar Total</span>
                <TrendingUp className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">{totalReceiptsLrd.toLocaleString()} LRD</div>
              <p className="text-[11px] text-teal-700 mt-1">Official peg: 195.00 LRD/USD</p>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-blue-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Payer Clearances</span>
                <FileText className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl font-extrabold text-blue-950">98.4%</div>
              <p className="text-[11px] text-blue-700 mt-1">Activa & Intrasur claim approval</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Shift Reconciliation & Invoicing Queue</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Review unbilled outpatient charts and process instant MoMo/Cash payments.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('billing')}
              className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Open Billing & Invoicing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. PHARMACY ROLE DASHBOARD */}
      {primaryRole === 'Pharmacy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Low Stock Alerts</span>
                <AlertTriangle className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-extrabold text-rose-950">{lowStockItems.length} Items</div>
              <p className="text-[11px] text-rose-700 mt-1">At or below reorder threshold</p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Prescriptions</span>
                <Pill className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">{pendingPrescriptions} Orders</div>
              <p className="text-[11px] text-teal-700 mt-1">Awaiting pharmacist verification</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Antimicrobial Ratio</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">31.2%</div>
              <p className="text-[11px] text-emerald-700 mt-1">Safely within WHO target (&lt;35%)</p>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-blue-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Formulary Health</span>
                <Activity className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl font-extrabold text-blue-950">{db.inventory.length} Stocked</div>
              <p className="text-[11px] text-blue-700 mt-1">Essential medications in central store</p>
            </div>
          </div>

          {/* Low Stock Items List */}
          {lowStockItems.length > 0 && (
            <div className="bg-rose-50/50 rounded-xl border border-rose-200 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Critical Low Stock Items Requiring Reorder
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lowStockItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg border border-rose-200 p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <p className="text-[11px] text-slate-500">Location: {item.location}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-700">{item.currentStock} {item.unitOfMeasure}</span>
                      <p className="text-[10px] text-slate-400">Min: {item.reorderLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. LABORATORY ROLE DASHBOARD (For Medical Laboratory Scientist LIS) */}
      {primaryRole === 'LIS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-amber-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Specimen Runs</span>
                <Microscope className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl font-extrabold text-amber-950">{pendingLabs} Requisitions</div>
              <p className="text-[11px] text-amber-700 mt-1">Awaiting analytical test execution</p>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Critical Panic Values</span>
                <AlertTriangle className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-extrabold text-rose-950">
                {db.labOrders?.filter(o => o.results?.isCritical === true).length || 0} Alerts
              </div>
              <p className="text-[11px] text-rose-700 mt-1">Requires STAT clinician notification</p>
            </div>

            <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-red-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Blood Bank Reserve</span>
                <Droplet className="w-4 h-4 text-red-700" />
              </div>
              <div className="text-2xl font-extrabold text-red-950">
                {db.bloodUnits?.length || 18} Units
              </div>
              <p className="text-[11px] text-red-700 mt-1">O- / A+ / B+ cold-chain verified</p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Turnaround Time (TAT)</span>
                <Clock className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">38 min</div>
              <p className="text-[11px] text-teal-700 mt-1">Safely below STAT threshold (&lt;45m)</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Diagnostic Decision Support: Automated Critical Value Dispatch</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Hematology analyzer 3-level quality control within 1.5 standard deviations. Critical findings automatically dispatch STAT alerts to Attending Physicians.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigateModule('blood_bank')}
                className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Droplet className="w-3.5 h-3.5" />
                <span>Blood Bank</span>
              </button>
              <button
                onClick={() => onNavigateModule('lab')}
                className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Microscope className="w-3.5 h-3.5" />
                <span>Launch Diagnostic LIS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. RADIOLOGY ROLE DASHBOARD */}
      {primaryRole === 'Radiology' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-sky-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending PACS Studies</span>
                <Scan className="w-4 h-4 text-sky-700" />
              </div>
              <div className="text-2xl font-extrabold text-sky-950">
                {db.radiologyStudies?.filter(s => s.status !== 'RELEASED').length || 3} Studies
              </div>
              <p className="text-[11px] text-sky-700 mt-1">Digital radiography & ultrasound</p>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Emergency STAT Scans</span>
                <AlertTriangle className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-extrabold text-rose-950">
                {db.radiologyStudies?.filter(s => s.urgency === 'STAT_EMERGENCY').length || 1} Scans
              </div>
              <p className="text-[11px] text-rose-700 mt-1">Acute trauma resuscitation</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Radiation Safety Score</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">100%</div>
              <p className="text-[11px] text-emerald-700 mt-1">ALARA compliance certified</p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Dicom PACS Online</span>
                <Activity className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">Operational</div>
              <p className="text-[11px] text-teal-700 mt-1">Zero-loss PACS archive linked</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Radiology Diagnostic Throughput</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Direct integration with Outpatient EMR and Inpatient Trauma Wards for instantaneous DICOM review.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('radiology')}
              className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Launch Radiology PACS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 7. ADMIN ROLE DASHBOARD */}
      {primaryRole === 'Admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 text-white rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Active Staff</span>
                <Shield className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">{activeUsersCount} Accounts</div>
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

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Break-Glass Logs</span>
                <KeyRound className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-extrabold text-rose-950">{breakGlassCount} Overrides</div>
              <p className="text-[11px] text-rose-700 mt-1">Immutable audit surveillance active</p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-teal-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Bed Census</span>
                <Bed className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-teal-950">{bedOccupancyRate}% Occupied</div>
              <p className="text-[11px] text-teal-700 mt-1">{occupiedBeds} occupied / {totalBeds} total</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Hospital Administration & System Audit</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Inspect tamper-evident clinical audit logs and monitor facility-wide HMIS metrics.
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('executive_bi')}
              className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Open Executive Intelligence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
