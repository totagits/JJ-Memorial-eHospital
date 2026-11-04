import React from 'react';
import { Monitor, Server, Activity, Wifi, Database } from 'lucide-react';

export const CommandCenterHMIS: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
        <Monitor className="w-5 h-5 text-teal-600" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">Command Center &amp; HMIS</h2>
        <p className="text-xs text-slate-500">Hospital Management Information System — Live Census &amp; KPI Dashboard</p>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Patients In-House', value: '84', color: 'text-teal-600' },
        { label: 'OPD Today', value: '217', color: 'text-blue-600' },
        { label: 'Bed Occupancy', value: '76%', color: 'text-amber-600' },
        { label: 'ED Waiting', value: '12', color: 'text-rose-600' },
      ].map((kpi) => (
        <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
          <div className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">{kpi.label}</div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
      <Server className="w-8 h-8 text-teal-500 flex-shrink-0" />
      <div>
        <p className="font-bold text-slate-800">HIS Integration Layer — Operational</p>
        <p className="text-xs text-slate-500 mt-0.5">HL7 FHIR R4 endpoints active · Last heartbeat: 12s ago · ADT, ORM, ORU feeds nominal</p>
      </div>
      <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
        <Activity className="w-3.5 h-3.5" /> All Systems Online
      </span>
    </div>
  </div>
);

export const InpatientADT: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
        <Database className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">Inpatient Wards &amp; Beds (ADT)</h2>
        <p className="text-xs text-slate-500">Admission, Discharge &amp; Transfer — Live Bed Board</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { ward: 'General Medicine Ward A', total: 24, occupied: 19, available: 5 },
        { ward: 'Maternity & Labour Ward', total: 16, occupied: 12, available: 4 },
        { ward: 'Paediatric Ward', total: 20, occupied: 14, available: 6 },
        { ward: 'Surgical Ward B', total: 18, occupied: 16, available: 2 },
        { ward: 'Private Rooms (VIP)', total: 8, occupied: 5, available: 3 },
        { ward: 'ICU / HDU', total: 6, occupied: 6, available: 0 },
      ].map((ward) => (
        <div key={ward.ward} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-800">{ward.ward}</h4>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ward.available === 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {ward.available === 0 ? 'Full' : `${ward.available} Free`}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${ward.available === 0 ? 'bg-rose-500' : 'bg-teal-500'}`}
              style={{ width: `${(ward.occupied / ward.total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
            <span>{ward.occupied} Occupied</span>
            <span>{ward.total} Total Beds</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const GeneralLedger: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
        <span className="text-emerald-600 font-black text-lg">$</span>
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">General Ledger &amp; Accounts</h2>
        <p className="text-xs text-slate-500">Chart of Accounts · Journal Entries · Trial Balance · P&amp;L Statement</p>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[
        { label: 'Total Revenue (MTD)', value: '$142,860', change: '+8.4%', up: true },
        { label: 'Operating Expenses', value: '$97,340', change: '+3.1%', up: false },
        { label: 'Net Income (MTD)', value: '$45,520', change: '+14.2%', up: true },
        { label: 'Accounts Receivable', value: '$28,900', change: '', up: true },
        { label: 'Accounts Payable', value: '$11,450', change: '', up: false },
        { label: 'Cash on Hand', value: '$63,200', change: '', up: true },
      ].map((item) => (
        <div key={item.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-500 font-medium">{item.label}</p>
          <p className="text-xl font-black text-slate-800 mt-1">{item.value}</p>
          {item.change && (
            <p className={`text-[11px] font-bold mt-0.5 ${item.up ? 'text-emerald-600' : 'text-rose-600'}`}>
              {item.up ? '▲' : '▼'} {item.change} vs last month
            </p>
          )}
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h4 className="font-bold text-slate-800 mb-3 text-sm">Recent Journal Entries</h4>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-100">
            <th className="pb-2 font-bold">Date</th>
            <th className="pb-2 font-bold">Description</th>
            <th className="pb-2 font-bold text-right">Debit</th>
            <th className="pb-2 font-bold text-right">Credit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {[
            { date: '04 Nov', desc: 'OPD Revenue - Cash Receipts', debit: '', credit: '$3,240' },
            { date: '04 Nov', desc: 'Pharmacy Stock Purchase - Artesunate', debit: '$860', credit: '' },
            { date: '03 Nov', desc: 'Staff Payroll - November Advance', debit: '$14,500', credit: '' },
            { date: '03 Nov', desc: 'NHIS Reimbursement Received', debit: '', credit: '$6,100' },
          ].map((row, i) => (
            <tr key={i}>
              <td className="py-2 text-slate-500">{row.date}</td>
              <td className="py-2 text-slate-700">{row.desc}</td>
              <td className="py-2 text-right text-rose-600 font-mono">{row.debit}</td>
              <td className="py-2 text-right text-emerald-600 font-mono">{row.credit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const InventoryProcurement: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
        <span className="text-orange-600 font-black text-lg">📦</span>
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">Inventory &amp; Procurement</h2>
        <p className="text-xs text-slate-500">Medical Supplies, Equipment &amp; Purchase Orders — Stock Tracking</p>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Total SKUs', value: '1,284', color: 'text-slate-700' },
        { label: 'Low Stock Alerts', value: '23', color: 'text-amber-600' },
        { label: 'Expiring ≤30 Days', value: '11', color: 'text-rose-600' },
        { label: 'Open POs', value: '7', color: 'text-teal-600' },
      ].map((kpi) => (
        <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
          <div className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">{kpi.label}</div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h4 className="font-bold text-slate-800 mb-3 text-sm">Critical Low-Stock Items</h4>
      <div className="space-y-2">
        {[
          { name: 'Artemether/Lumefantrine 80/480mg (tab)', stock: 42, min: 200, unit: 'tabs' },
          { name: 'IV Ringers Lactate 1L bags', stock: 18, min: 100, unit: 'bags' },
          { name: 'Surgical Gloves — Size M (box)', stock: 5, min: 50, unit: 'boxes' },
          { name: 'Disposable Syringes 5mL', stock: 230, min: 500, unit: 'pcs' },
          { name: 'Oxygen Cylinder (D-size)', stock: 2, min: 10, unit: 'cylinders' },
        ].map((item) => (
          <div key={item.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div>
              <p className="text-xs font-semibold text-slate-700">{item.name}</p>
              <p className="text-[10px] text-slate-400">Min threshold: {item.min} {item.unit}</p>
            </div>
            <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
              {item.stock} left
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const BiomedicalFacilities: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center">
        <Wifi className="w-5 h-5 text-cyan-600" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">Biomedical &amp; Facilities</h2>
        <p className="text-xs text-slate-500">Equipment Maintenance, PPM Schedules &amp; Facility Work Orders</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { equipment: 'Siemens CT Scanner (CT-01)', status: 'Operational', nextPPM: '2026-11-20', age: '2 yrs' },
        { equipment: 'GE Ultrasound — Venue Go (US-02)', status: 'Operational', nextPPM: '2026-12-01', age: '1 yr' },
        { equipment: 'Philips Defibrillator (DF-01)', status: 'Under Repair', nextPPM: '2026-11-15', age: '4 yrs' },
        { equipment: 'Autoclave Sterilizer (ST-03)', status: 'Operational', nextPPM: '2026-11-10', age: '3 yrs' },
        { equipment: 'Generator — Perkins 100KVA (GEN-01)', status: 'Standby', nextPPM: '2026-11-25', age: '5 yrs' },
        { equipment: 'Blood Gas Analyser (BGA-01)', status: 'Operational', nextPPM: '2026-12-05', age: '1 yr' },
      ].map((eq) => (
        <div key={eq.equipment} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">{eq.equipment}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Age: {eq.age} · Next PPM: {eq.nextPPM}</p>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              eq.status === 'Operational' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : eq.status === 'Under Repair' ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {eq.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const AuditTrailCompliance: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
        <span className="text-slate-600 font-black">🔍</span>
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">Audit Trail &amp; Compliance</h2>
        <p className="text-xs text-slate-500">HIPAA / ISO-27799 Immutable Activity Log — All System Actions</p>
      </div>
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Recent Audit Events</span>
        <span className="text-[11px] text-slate-400 font-mono">System Clock: UTC+0</span>
      </div>
      <div className="divide-y divide-slate-50">
        {[
          { time: '09:14:32', user: 'Dr. Sirleaf-Gbotoe', action: 'CLINICAL_NOTE_SIGNED', resource: 'Patient JJM-2026-00104', level: 'INFO' },
          { time: '09:12:01', user: 'Samuel Flomo, RN', action: 'TRIAGE_VITALS_RECORDED', resource: 'Patient JJM-2026-00104', level: 'INFO' },
          { time: '09:10:44', user: 'Beatrice Flomo', action: 'INVOICE_GENERATED', resource: 'INV-2026-0882', level: 'INFO' },
          { time: '09:08:17', user: 'Pharm. Sheriff', action: 'RX_DISPENSED', resource: 'RX-2026-0391', level: 'INFO' },
          { time: '09:04:55', user: 'Admin System', action: 'BREAK_GLASS_INVOKED', resource: 'Patient JJM-2026-00099', level: 'WARN' },
          { time: '08:59:03', user: 'Dr. Massaquoi', action: 'RADIOLOGY_REPORT_SIGNED', resource: 'SCAN-2026-0210', level: 'INFO' },
          { time: '08:45:22', user: 'Admin System', action: 'FAILED_LOGIN_ATTEMPT', resource: 'Terminal OPD-BAY-03', level: 'ALERT' },
        ].map((ev, i) => (
          <div key={i} className="px-5 py-2.5 flex items-center gap-4 text-xs hover:bg-slate-50 transition">
            <span className="font-mono text-slate-400 w-16 flex-shrink-0">{ev.time}</span>
            <span className={`w-12 text-center font-bold rounded px-1 py-0.5 text-[10px] flex-shrink-0 ${
              ev.level === 'ALERT' ? 'bg-rose-100 text-rose-700'
              : ev.level === 'WARN' ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-600'
            }`}>
              {ev.level}
            </span>
            <span className="font-semibold text-slate-700 w-36 flex-shrink-0 truncate">{ev.user}</span>
            <span className="font-mono text-teal-700 w-44 flex-shrink-0 truncate">{ev.action}</span>
            <span className="text-slate-500 truncate">{ev.resource}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const QualitySafetyIncidents: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
        <span className="text-rose-600 font-black">⚠</span>
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">Quality &amp; Safety Incidents</h2>
        <p className="text-xs text-slate-500">Adverse Events, Near-Misses &amp; Root Cause Analysis — JCI / WHO Safety Standards</p>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Open Incidents', value: '4', color: 'text-rose-600' },
        { label: 'Under Investigation', value: '2', color: 'text-amber-600' },
        { label: 'Closed (30d)', value: '17', color: 'text-emerald-600' },
        { label: 'Near Misses (7d)', value: '3', color: 'text-blue-600' },
      ].map((kpi) => (
        <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
          <div className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">{kpi.label}</div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h4 className="font-bold text-slate-800 mb-3 text-sm">Active Incident Reports</h4>
      <div className="space-y-3">
        {[
          { id: 'INC-2026-041', title: 'Medication Administration Error — Wrong Dose', severity: 'High', dept: 'Paediatrics', date: '03 Nov 2026', status: 'Under Investigation' },
          { id: 'INC-2026-040', title: 'Patient Fall — Unwitnessed in Ward A Bed 7', severity: 'Medium', dept: 'General Medicine', date: '02 Nov 2026', status: 'Open' },
          { id: 'INC-2026-039', title: 'Near-Miss: Allergy Flag Override Without Documentation', severity: 'High', dept: 'OPD Pharmacy', date: '01 Nov 2026', status: 'Under Investigation' },
          { id: 'INC-2026-038', title: 'Equipment Failure — Defibrillator DF-01 Mid-Use', severity: 'Critical', dept: 'Emergency Dept.', date: '30 Oct 2026', status: 'Open' },
        ].map((inc) => (
          <div key={inc.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400">{inc.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  inc.severity === 'Critical' ? 'bg-rose-100 text-rose-700 border-rose-200'
                  : inc.severity === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200'
                  : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {inc.severity}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 mt-1">{inc.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{inc.dept} · {inc.date}</p>
            </div>
            <span className={`text-[11px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
              inc.status === 'Under Investigation' ? 'bg-amber-100 text-amber-700'
              : 'bg-rose-100 text-rose-700'
            }`}>
              {inc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
