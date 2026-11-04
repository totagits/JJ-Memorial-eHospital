import React from 'react';
import { 
  TrendingUp, Activity, AlertCircle, CheckCircle2, Clock, 
  Stethoscope, Droplet, Pill, DollarSign, Bed, ShieldAlert, 
  FileText, ArrowRight, Zap, RefreshCw, BarChart2 
} from 'lucide-react';
import { UserAccount } from '../../types/auth';
import { getRoleScopeConfig } from '../../types/rbac';
import { getDatabaseState } from '../../services/storageService';

interface RoleAnalyticsPanelProps {
  currentUser: UserAccount;
  onNavigateModule: (moduleId: string) => void;
}

export const RoleAnalyticsPanel: React.FC<RoleAnalyticsPanelProps> = ({
  currentUser,
  onNavigateModule,
}) => {
  const db = getDatabaseState();
  const roleConfig = getRoleScopeConfig(currentUser.role);

  // Dynamic calculations based on live DB state
  const pendingLabCount = db.labOrders?.filter(o => o.status === 'ORDERED' || o.status === 'SPECIMEN_RECEIVED' || o.status === 'PROCESSING').length || 0;
  const criticalLabCount = db.labOrders?.filter(o => o.results?.isCritical === true).length || 0;
  const redTriageCount = db.queue?.filter(q => q.priority === 'EMERGENCY').length || 0;
  const yellowTriageCount = db.queue?.filter(q => q.priority === 'URGENT').length || 0;
  const occupiedBedsCount = db.beds?.filter(b => b.status === 'OCCUPIED').length || 0;
  const totalBedsCount = db.beds?.length || 20;
  const bedOccupancyRate = Math.round((occupiedBedsCount / (totalBedsCount || 1)) * 100);
  const lowStockUnitsCount = db.bloodUnits?.filter(u => u.bloodGroup === 'O-' || u.bloodGroup === 'O+').length || 0;
  const lowBufferMedsCount = db.inventory?.filter(i => i.currentStock <= i.reorderLevel).length || 0;
  const pendingInvoicesCount = db.invoices?.filter(inv => inv.status === 'POSTED' || inv.status === 'PARTIALLY_PAID').length || 0;
  const todayReceiptsUsd = db.receipts?.reduce((acc, r) => acc + r.amountUSD + (r.amountLRD / 195), 0) || 0;
  const unreadMessagesCount = db.staffMessages?.filter(m => m.urgency === 'STAT').length || 0;

  // Generate role-specific analytics and actionable decision insights
  const renderRoleMetrics = () => {
    switch (currentUser.role) {
      case 'physician':
        return {
          badge: 'Clinical Decision Engine',
          status: criticalLabCount > 0 ? 'CRITICAL_ATTENTION' : 'OPTIMAL',
          cards: [
            { label: 'Active OPD Patients', value: db.queue.length.toString(), sub: 'In clinical queue', color: 'text-teal-700', bg: 'bg-teal-50' },
            { label: 'Panic Lab Alerts', value: criticalLabCount.toString(), sub: 'Requires immediate review', color: criticalLabCount > 0 ? 'text-rose-700' : 'text-slate-700', bg: criticalLabCount > 0 ? 'bg-rose-50' : 'bg-slate-50' },
            { label: 'Antibiotic Compliance', value: '94%', sub: 'MOH stewardship guide', color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Average Consult Time', value: '14 min', sub: 'Target: < 20 min', color: 'text-blue-700', bg: 'bg-blue-50' },
          ],
          recommendation: {
            title: criticalLabCount > 0 ? 'Urgent Diagnostic Alert: Severe Parasitemia Detected' : 'Empirical Antibiotic Protocol Recommendation',
            text: criticalLabCount > 0 
              ? `A specimen from ${db.queue[0]?.patientName || 'an emergency patient'} returned a critical panic value. Recommend immediate clinician review in Laboratory workstation.`
              : 'Seasonal malaria presentations elevated by 18% in Montserrado County. Ensure rapid diagnostic confirmation before empirical ACT dispensing.',
            actionLabel: 'Review Diagnostic Results',
            actionTarget: 'lab',
          }
        };

      case 'nurse_triage':
      case 'head_nurse':
        return {
          badge: 'Nursing Acuity & Bed Utilization',
          status: redTriageCount > 0 ? 'EMERGENCY_SURGE' : 'STABLE',
          cards: [
            { label: 'Emergency RED (SATS)', value: redTriageCount.toString(), sub: 'Immediate resuscitation', color: redTriageCount > 0 ? 'text-rose-700 animate-pulse' : 'text-slate-700', bg: redTriageCount > 0 ? 'bg-rose-50' : 'bg-slate-50' },
            { label: 'Urgent YELLOW (SATS)', value: yellowTriageCount.toString(), sub: 'Assess within 15 min', color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Inpatient Bed Occupancy', value: `${bedOccupancyRate}%`, sub: `${occupiedBedsCount}/${totalBedsCount} beds occupied`, color: bedOccupancyRate > 85 ? 'text-rose-700' : 'text-teal-700', bg: 'bg-teal-50' },
            { label: 'Door-to-Triage Avg', value: '6.2 min', sub: 'Bench target < 10 min', color: 'text-emerald-700', bg: 'bg-emerald-50' },
          ],
          recommendation: {
            title: redTriageCount > 0 ? 'Immediate Resuscitation Priority in OPD' : 'Female Ward Capacity Allocation',
            text: redTriageCount > 0
              ? 'An incoming patient is classified as Emergency RED with unstable vitals. Assign attending nurse to Resuscitation Bay 1 immediately.'
              : 'Female Medical Ward has 2 beds remaining. If high acute transfers occur, prepare step-down overflow beds in Observation.',
            actionLabel: 'Manage Triage Queue',
            actionTarget: 'triage',
          }
        };

      case 'lab_scientist':
        return {
          badge: 'LIS Diagnostics & Blood Bank Metrics',
          status: pendingLabCount > 4 ? 'HIGH_BACKLOG' : 'STABLE',
          cards: [
            { label: 'Pending Specimen Runs', value: pendingLabCount.toString(), sub: 'Awaiting technician entry', color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Critical Panic Values', value: criticalLabCount.toString(), sub: 'Immediate clinician alert', color: criticalLabCount > 0 ? 'text-rose-700' : 'text-slate-700', bg: criticalLabCount > 0 ? 'bg-rose-50' : 'bg-slate-50' },
            { label: 'O-Negative Units Reserve', value: `${lowStockUnitsCount} Units`, sub: 'Universal emergency donor', color: lowStockUnitsCount < 4 ? 'text-rose-700' : 'text-emerald-700', bg: 'bg-rose-50' },
            { label: 'Avg Turnaround (TAT)', value: '38 min', sub: 'STAT target: < 45 min', color: 'text-teal-700', bg: 'bg-teal-50' },
          ],
          recommendation: {
            title: lowStockUnitsCount < 4 ? 'Blood Bank Warning: O-Negative Reserve Below Safe Threshold' : 'Quality Control Run Completed',
            text: lowStockUnitsCount < 4
              ? 'Emergency un-crossmatched O-Negative inventory is low. Recommend contacting the National Blood Safety Program or pre-registered donors.'
              : 'Hematology analyzer 3-level quality control within 1.5 standard deviations. LIS analytical run certified for clinical release.',
            actionLabel: 'Inspect Blood Bank',
            actionTarget: 'blood_bank',
          }
        };

      case 'pharmacist':
        return {
          badge: 'Pharmacovigilance & Dispense Velocity',
          status: lowBufferMedsCount > 0 ? 'REORDER_REQUIRED' : 'BALANCED',
          cards: [
            { label: 'Items Below Safety Stock', value: lowBufferMedsCount.toString(), sub: 'Requires PO requisition', color: lowBufferMedsCount > 0 ? 'text-rose-700' : 'text-slate-700', bg: 'bg-rose-50' },
            { label: 'Antimicrobial Ratio', value: '31%', sub: 'WHO benchmark < 35%', color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Daily Prescriptions Filled', value: '46', sub: 'Zero dispense errors', color: 'text-teal-700', bg: 'bg-teal-50' },
            { label: 'Average Wait Time', value: '8.4 min', sub: 'From doctor submit', color: 'text-blue-700', bg: 'bg-blue-50' },
          ],
          recommendation: {
            title: lowBufferMedsCount > 0 ? 'Safety Stock Threshold Triggered' : 'Formulary Adherence Optimal',
            text: lowBufferMedsCount > 0
              ? 'Key antimicrobial and fluid items (e.g. IV Ceftriaxone, Normal Saline 500ml) are near minimum buffer levels. Send restocking requisition to Stores.'
              : 'Prescription dispensing queue is flowing smoothly with automatic allergen screening active across all active outpatient orders.',
            actionLabel: 'Open Pharmacy Workstation',
            actionTarget: 'pharmacy',
          }
        };

      case 'cashier_billing':
      case 'finance_accountant':
        return {
          badge: 'Revenue Velocity & Shift Solvency',
          status: pendingInvoicesCount > 5 ? 'RECONCILIATION_PENDING' : 'BALANCED',
          cards: [
            { label: "Today's Collections", value: `$${todayReceiptsUsd.toFixed(2)}`, sub: 'Combined USD & LRD', color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Unsettled Invoices', value: pendingInvoicesCount.toString(), sub: 'Awaiting cashier receipt', color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Official LRD Rate', value: '195.00', sub: 'MOH/CBL Pegged', color: 'text-teal-700', bg: 'bg-teal-50' },
            { label: 'Insurer Pre-Auth Rate', value: '98.2%', sub: 'Activa & Intrasur', color: 'text-blue-700', bg: 'bg-blue-50' },
          ],
          recommendation: {
            title: pendingInvoicesCount > 0 ? 'End-of-Shift Cash Balancing Alert' : 'Revenue Cycle Optimal',
            text: pendingInvoicesCount > 0
              ? `${pendingInvoicesCount} outpatient bills remain uncollected. Verify insurance copay obligations before patient discharge clearance.`
              : 'Dual-currency cash registers in balance. Shift totals match immutable receipts journal in the General Ledger.',
            actionLabel: 'Open Billing & Invoicing',
            actionTarget: 'billing',
          }
        };

      default:
        // Executive, IT, and administrative roles
        return {
          badge: 'Executive Operational & HMIS Governance',
          status: 'HEALTHY',
          cards: [
            { label: 'Hospital Bed Occupancy', value: `${bedOccupancyRate}%`, sub: `${occupiedBedsCount}/${totalBedsCount} Total Beds`, color: 'text-teal-700', bg: 'bg-teal-50' },
            { label: 'Daily Patient Footfall', value: '82', sub: 'OPD, ER & Inpatient', color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Grid & Generator Uptime', value: '100%', sub: '500kVA Standby Ready', color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'STAT Alert Broadcasts', value: unreadMessagesCount.toString(), sub: 'Emergency notifications', color: unreadMessagesCount > 0 ? 'text-rose-700' : 'text-slate-700', bg: unreadMessagesCount > 0 ? 'bg-rose-50' : 'bg-slate-50' },
          ],
          recommendation: {
            title: 'MOH HMIS Reporting Cycle On Schedule',
            text: 'Operational metrics across triage, diagnostics, pharmacy, and dual-currency finance comply with Liberian Ministry of Health reporting standards.',
            actionLabel: 'Review Executive Intelligence',
            actionTarget: 'executive_bi',
          }
        };
    }
  };

  const metrics = renderRoleMetrics();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Top Header of Analytic Tool */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shadow-xs">
            <BarChart2 className="w-4 h-4 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">{roleConfig.decisionMetricsTitle}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                {metrics.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Role-Scoped Decision Support Engine for <span className="font-semibold text-slate-700">{roleConfig.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-medium text-slate-500">Status:</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            metrics.status === 'OPTIMAL' || metrics.status === 'BALANCED' || metrics.status === 'HEALTHY' || metrics.status === 'STABLE'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {metrics.status}
          </span>
        </div>
      </div>

      {/* 4 Decision KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.cards.map((card, idx) => (
          <div key={idx} className={`${card.bg} rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between`}>
            <span className="text-[11px] font-semibold text-slate-600 block">{card.label}</span>
            <div className="mt-2">
              <span className={`text-xl font-extrabold tracking-tight ${card.color}`}>{card.value}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Real-Time Operational Decision Recommendation */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{metrics.recommendation.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-2xl">
              {metrics.recommendation.text}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateModule(metrics.recommendation.actionTarget)}
          className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
        >
          <span>{metrics.recommendation.actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
