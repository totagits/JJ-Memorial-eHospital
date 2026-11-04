import React, { useState } from 'react';
import { 
  Activity, 
  Users, 
  Bed, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Zap, 
  ArrowUpRight,
  TrendingUp,
  Download,
  Calendar,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { getDatabaseState } from '../../services/storageService';
import { LRD_PER_USD } from '../../data/seedData';

export const ExecutiveCommandCenter: React.FC = () => {
  const db = getDatabaseState();
  const [selectedMonth, setSelectedMonth] = useState('November 2026');
  const [showHmisReport, setShowHmisReport] = useState(false);

  // Real calculations from persisted database state
  const totalPatients = db.patients.length;
  const activeQueueCount = db.queue.filter(q => q.status === 'WAITING' || q.status === 'IN_SERVICE').length;
  const totalBeds = db.beds.length;
  const occupiedBeds = db.beds.filter(b => b.status === 'OCCUPIED').length;
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  
  const pendingLabsCount = db.labOrders.filter(l => l.status !== 'RELEASED' && l.status !== 'CANCELLED').length;
  const criticalLabsCount = db.labOrders.filter(l => l.results?.isCritical).length;

  const totalCollectedUSD = db.receipts.reduce((sum, r) => sum + r.amountUSD, 0);
  const totalCollectedLRD = db.receipts.reduce((sum, r) => sum + (r.amountLRD || r.amountUSD * LRD_PER_USD), 0);

  const lowStockItems = db.inventory.filter(i => i.currentStock <= i.reorderLevel);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-extrabold text-base tracking-tight">Executive Clinical & Operations Command Center</span>
            <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-mono">
              REAL-TIME CENSUS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            J & J Memorial e-Hospital · Hospital Performance, Occupancy, Quality & Revenue Telemetry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowHmisReport(!showHmisReport)}
            className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>{showHmisReport ? 'Hide HMIS Report' : 'Liberian MOH HMIS Report'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Master Patient Index</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalPatients}</div>
            <div className="text-[11px] text-teal-700 font-medium flex items-center gap-1 mt-1">
              <span>{activeQueueCount} patients currently in queue</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Inpatient Bed Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{bedOccupancyRate}%</div>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <span>{occupiedBeds} occupied / {totalBeds} total operational beds</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cash Collections (Reconciled)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-700">${totalCollectedUSD.toFixed(2)}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              LRD {totalCollectedLRD.toLocaleString()} (Rate: 195 LRD/USD)
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Clinical Safety & Stock Risk</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{lowStockItems.length} Low Stock</div>
            <div className="text-[11px] text-rose-700 font-medium mt-1">
              {criticalLabsCount > 0 ? `${criticalLabsCount} critical lab panic alert pending` : 'All critical lab alerts addressed'}
            </div>
          </div>
        </div>
      </div>

      {/* Liberian MOH HMIS Report Section (Expandable) */}
      {showHmisReport && (
        <div className="bg-white rounded-2xl border-2 border-teal-700/80 p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Ministry of Health (MOH) Liberia — HMIS Monthly Return Form
                </h3>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  SYNTHETIC DEMO EXPORT
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Facility: J & J Memorial e-Hospital · Montserrado County · Health District: Commonwealth
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Printable HMIS Form</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">1. Outpatient Morbidity</span>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Suspected Malaria Cases:</span>
                  <span className="font-bold">14</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Confirmed Malaria (RDT/Smear +):</span>
                  <span className="font-bold text-rose-700">9</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Essential Hypertension Visits:</span>
                  <span className="font-bold">18</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Type 2 Diabetes Mellitus:</span>
                  <span className="font-bold">11</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">2. Maternal & Inpatient</span>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Antenatal Care (ANC 1st Contact):</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Total Inpatient Admissions:</span>
                  <span className="font-bold">5</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Average Bed Turnover Interval:</span>
                  <span className="font-bold">1.4 days</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Hospital Mortality:</span>
                  <span className="font-bold text-emerald-700">0 cases</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">3. Diagnostics & Stock</span>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Laboratory Accessions Tested:</span>
                  <span className="font-bold">32</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>First-line ACT (Coartem) Stockouts:</span>
                  <span className="font-bold text-emerald-700">0 days (Full Stock)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Generator Backup Runtime:</span>
                  <span className="font-bold">100% Uptime</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>DHIS2 Interop Format:</span>
                  <span className="font-bold font-mono">DHIS2-XML-Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Departmental Queue Monitor */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700" />
              Live Departmental Queue Status
            </h3>
            <span className="text-xs text-slate-500">{activeQueueCount} in service/waiting</span>
          </div>

          <div className="space-y-2.5">
            {db.queue.map(q => (
              <div key={q.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-900 bg-teal-100/70 px-1.5 py-0.5 rounded">
                      {q.tokenNumber}
                    </span>
                    <span className="font-bold text-slate-900">{q.patientName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({q.patientMrn})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Department: <span className="font-semibold text-slate-700">{q.department}</span>
                    {q.assignedPractitionerName && ` · Practitioner: ${q.assignedPractitionerName}`}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    q.status === 'IN_SERVICE' ? 'bg-emerald-100 text-emerald-800' :
                    q.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {q.status}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">Est. wait: {q.estimatedWaitMinutes}m</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure & Facility Telemetry */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Facility Electrical & Physical Infrastructure
            </h3>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Optimal
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">500 kVA Cummins Heavy-Duty Prime Generator</span>
                <span className="text-slate-500 text-[11px]">Primary Grid Backup · Fuel Tank: 88% Capacity (1,450L Diesel)</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                STANDBY ONLINE
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">80 kW Hybrid Solar & Inverter Bank</span>
                <span className="text-slate-500 text-[11px]">Powering Laboratory, EMR Server & ICU Life Support</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                ACTIVE 48.2 kWh
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">Local Clinical EMR Database Sync</span>
                <span className="text-slate-500 text-[11px]">PostgreSQL Transaction Outbox · Zero Loss Buffer</span>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded font-mono">
                CONNECTED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
