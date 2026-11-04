import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, FileText, Search, CheckCircle2, Lock, Plus } from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { UserAccount } from '../../types/auth';

interface QualityAuditWorkstationProps {
  currentUser: UserAccount;
}

export const QualityAuditWorkstation: React.FC<QualityAuditWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [activeTab, setActiveTab] = useState<'incidents' | 'audit_trail'>('incidents');
  const [searchMrn, setSearchMrn] = useState('');

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentCategory, setIncidentCategory] = useState<'MEDICATION_SAFETY' | 'PATIENT_FALL' | 'DIAGNOSTIC_DELAY' | 'EQUIPMENT_MALFUNCTION' | 'INFECTION_CONTROL'>('MEDICATION_SAFETY');
  const [incidentSeverity, setIncidentSeverity] = useState<'NEAR_MISS' | 'MINOR' | 'MODERATE' | 'SENTINEL_EVENT'>('NEAR_MISS');
  const [incidentDesc, setIncidentDesc] = useState('');

  const filteredAuditLogs = searchMrn.trim()
    ? db.auditLogs.filter(l => l.patientMrn?.includes(searchMrn.trim()) || l.details.toLowerCase().includes(searchMrn.toLowerCase()))
    : db.auditLogs;

  const handleLogIncident = () => {
    if (!incidentDesc.trim()) {
      alert('Please enter incident details.');
      return;
    }

    const incNo = `INC-${new Date().getFullYear()}-${String(db.incidents.length + 20).padStart(5, '0')}`;

    updateDatabaseState(draft => {
      draft.incidents.unshift({
        id: `INC-${Date.now()}`,
        incidentNumber: incNo,
        dateOfOccurrence: new Date().toISOString().split('T')[0],
        location: 'Clinical Unit Station',
        severity: incidentSeverity,
        category: incidentCategory,
        description: incidentDesc,
        reportedBy: currentUser.fullName,
        confidential: true,
        status: 'LOGGED',
      });
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'SECURITY',
      resourceId: incNo,
      details: `Logged Quality & Safety Incident ${incNo} (${incidentCategory} / ${incidentSeverity}).`,
      ipAddress: 'Quality Workstation',
      status: 'FLAGGED',
    });

    setShowIncidentModal(false);
    setIncidentDesc('');
    alert(`Incident ${incNo} logged securely for Clinical Safety Committee investigation.`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 text-base">Quality Improvement, Patient Safety & Internal Audit</h2>
          <p className="text-xs text-slate-500">Adverse Event Reporting, CAPA Surveillance & Tamper-Evident Immutable Audit Log Ledger</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIncidentModal(true)}
            className="bg-rose-800 hover:bg-rose-900 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Patient Safety Incident</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('incidents')}
          className={`pb-3 transition-colors ${
            activeTab === 'incidents'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Safety Incidents & CAPA ({db.incidents.length})
        </button>
        <button
          onClick={() => setActiveTab('audit_trail')}
          className={`pb-3 transition-colors ${
            activeTab === 'audit_trail'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Tamper-Evident Audit Event Ledger ({db.auditLogs.length})
        </button>
      </div>

      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {db.incidents.map(inc => (
            <div key={inc.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-900 text-sm">{inc.incidentNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      inc.severity === 'NEAR_MISS' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {inc.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Date: {inc.dateOfOccurrence} · Reported by: {inc.reportedBy}</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                  {inc.status}
                </span>
              </div>

              <div className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                {inc.description}
              </div>

              {inc.correctiveActionPlan && (
                <div className="text-xs text-teal-950 bg-teal-50 p-3 rounded-lg border border-teal-200/60">
                  <span className="font-bold block mb-1">Corrective & Preventive Action (CAPA):</span>
                  {inc.correctiveActionPlan}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audit_trail' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-700" />
                Immutable System Security & Access Audit Log
              </h3>
              <p className="text-[11px] text-slate-500">Every write, sign, release, payment, and break-glass action is permanently preserved</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by MRN or action keyword..."
                value={searchMrn}
                onChange={e => setSearchMrn(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">User & Role</th>
                <th className="p-2.5">Action & Module</th>
                <th className="p-2.5">Patient MRN</th>
                <th className="p-2.5">Details & IP Context</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredAuditLogs.map(log => (
                <tr key={log.id}>
                  <td className="p-2.5 text-slate-500 whitespace-nowrap">{log.timestamp.replace('T', ' ').slice(0, 19)}</td>
                  <td className="p-2.5 font-sans">
                    <span className="font-bold text-slate-900 block">{log.userName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.userRole}</span>
                  </td>
                  <td className="p-2.5 font-sans">
                    <span className="font-bold text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded mr-1">{log.action}</span>
                    <span className="text-[10px] text-slate-500">{log.module}</span>
                  </td>
                  <td className="p-2.5 text-teal-800 font-bold">{log.patientMrn || '—'}</td>
                  <td className="p-2.5 font-sans text-slate-700 max-w-xs truncate" title={log.details}>
                    {log.details}
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.ipAddress}</div>
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Log Patient Safety Incident / Near-Miss</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={incidentCategory}
                  onChange={e => setIncidentCategory(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden"
                >
                  <option value="MEDICATION_SAFETY">Medication Safety / Contraindication Intercept</option>
                  <option value="PATIENT_FALL">Patient Fall / Physical Injury</option>
                  <option value="DIAGNOSTIC_DELAY">Diagnostic Delay / Specimen Mislabel</option>
                  <option value="EQUIPMENT_MALFUNCTION">Biomedical Equipment Malfunction</option>
                  <option value="INFECTION_CONTROL">Infection Prevention & Control Breach</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Severity Grading</label>
                <select
                  value={incidentSeverity}
                  onChange={e => setIncidentSeverity(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden"
                >
                  <option value="NEAR_MISS">Near-Miss (Caught before harm occurred)</option>
                  <option value="MINOR">Minor (No lasting clinical impact)</option>
                  <option value="MODERATE">Moderate (Required additional treatment)</option>
                  <option value="SENTINEL_EVENT">Sentinel Event (High priority safety investigation)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Incident Description & Circumstances</label>
                <textarea
                  rows={4}
                  value={incidentDesc}
                  onChange={e => setIncidentDesc(e.target.value)}
                  placeholder="Provide objective facts of the event..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
              <button
                onClick={() => setShowIncidentModal(false)}
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleLogIncident}
                className="bg-rose-800 hover:bg-rose-900 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                File Confidential Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
