import React, { useState } from 'react';
import { X, Zap, AlertTriangle, FileText, CheckCircle2, Printer, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent, generateNextMRN } from '../../services/storageService';
import { UserAccount } from '../../types/auth';

interface DowntimeContinuityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
}

export const DowntimeContinuityModal: React.FC<DowntimeContinuityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const db = getDatabaseState();
  const [activeTab, setActiveTab] = useState<'status' | 'buffer' | 'paper_packets'>('status');

  // Emergency offline intake state
  const [patientName, setPatientName] = useState('');
  const [complaint, setComplaint] = useState('');
  const [emergencyCat, setEmergencyCat] = useState<'TRIAGE_RED' | 'TRIAGE_YELLOW' | 'TRIAGE_GREEN'>('TRIAGE_YELLOW');
  const [medsGiven, setMedsGiven] = useState('');
  const [manualReceipt, setManualReceipt] = useState('');

  if (!isOpen) return null;

  const handleCaptureDowntimeRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Patient name is required.');
      return;
    }

    const dtId = `DT-EMR-${String(db.downtimeRecords.length + 105).padStart(4, '0')}`;
    const packetNo = `PKT-ER-2026-${String(db.downtimeRecords.length + 9).padStart(2, '0')}`;

    const newRecord = {
      id: `DT-REC-${Date.now()}`,
      temporaryDowntimeId: dtId,
      capturedAt: new Date().toISOString(),
      patientName: patientName.trim(),
      gender: 'M' as const,
      chiefComplaint: complaint || 'Emergency presentation during power/network downtime',
      emergencyCategory: emergencyCat,
      paperPacketNumber: packetNo,
      medicationsAdministeredManually: medsGiven || 'Stat pain relief & wound care',
      cashCollectedReceiptManualNo: manualReceipt || 'MAN-RCPT-PENDING',
      reconciliationStatus: 'PENDING_RECONCILIATION' as const,
    };

    updateDatabaseState(draft => {
      draft.downtimeRecords.unshift(newRecord);
      draft.downtimeState.bufferedRecordsCount = draft.downtimeRecords.length;
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'TRIAGE',
      resourceId: dtId,
      details: `Captured Offline Emergency Downtime Record ${dtId} (Paper Packet: ${packetNo}) for ${patientName}.`,
      ipAddress: 'Offline Emergency Cache Station',
      status: 'FLAGGED',
    });

    setPatientName('');
    setComplaint('');
    setMedsGiven('');
    setManualReceipt('');
    alert(`Emergency Downtime Record ${dtId} buffered! Assign Paper Packet ${packetNo} to patient.`);
  };

  const handleReconcileRecord = (recordId: string) => {
    const rec = db.downtimeRecords.find(r => r.id === recordId);
    if (!rec) return;

    const permanentMrn = generateNextMRN();

    updateDatabaseState(draft => {
      const target = draft.downtimeRecords.find(r => r.id === recordId);
      if (target) {
        target.reconciliationStatus = 'RECONCILED';
        target.reconciledPermanentMrn = permanentMrn;
        target.reconciledBy = currentUser.fullName;
      }

      // Add to permanent Master Patient Index with provenance flag
      draft.patients.push({
        id: `PAT-${Date.now().toString().slice(-4)}`,
        mrn: permanentMrn,
        firstName: rec.patientName.split(' ')[0] || rec.patientName,
        lastName: rec.patientName.split(' ').slice(1).join(' ') || 'Patient',
        dateOfBirth: '1985-01-01',
        gender: rec.gender,
        phone: rec.phoneContact || '+231-770-000-000',
        address: {
          community: 'Congo Town Emergency',
          city: 'Monrovia',
          county: 'Montserrado',
          country: 'Liberia',
        },
        allergies: [],
        emergencyContact: {
          fullName: 'Next of Kin',
          relationship: 'Family',
          phone: '+231-770-000-000',
        },
        downtimeOrigin: true,
        downtimeTemporaryId: rec.temporaryDowntimeId,
        registeredAt: rec.capturedAt,
        registeredBy: `${rec.reconciledBy || currentUser.fullName} (Post-Outage Reconciliation)`,
      });
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'DOWNTIME_SYNC',
      module: 'PATIENT_INDEX',
      resourceId: rec.temporaryDowntimeId,
      details: `Reconciled temporary emergency ID ${rec.temporaryDowntimeId} into permanent MRN ${permanentMrn}. Chart provenance preserved.`,
      ipAddress: 'Central Reconciliation Server',
      status: 'SUCCESS',
    });

    alert(`Reconciled ${rec.temporaryDowntimeId} to permanent MRN ${permanentMrn}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Offline Downtime & Electrical Resilience Center</h3>
              <p className="text-[11px] text-slate-400">Section J · Uninterrupted Care During Utility Outages & Post-Downtime Reconciliation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-3 space-x-6 text-xs font-semibold bg-slate-50">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'status'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Power Grid & Microgrid Telemetry
          </button>
          <button
            onClick={() => setActiveTab('buffer')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'buffer'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Emergency Offline Buffer ({db.downtimeRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('paper_packets')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'paper_packets'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Printable Downtime Paper Packets
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {activeTab === 'status' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Full Electrical Power Active</h4>
                    <p className="text-xs text-slate-600">LEC Grid Active + Cummins 500kVA Auto-Transfer Switch Ready</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded">
                  NO ACTIVE OUTAGE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block">Generator Micro-Grid Status:</span>
                  <p className="text-slate-600 leading-relaxed">
                    Cummins C500 D5e Prime Power. Tested weekly. Standby diesel supply maintains continuous facility power for 14 days without refueling.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block">Solar & Inverter Storage:</span>
                  <p className="text-slate-600 leading-relaxed">
                    80kW Hybrid Solar with 120kWh lithium battery bank dedicated to Operating Theater, ICU Ventilators, and Local EMR Server Rack.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'buffer' && (
            <div className="space-y-6">
              {/* Form to capture downtime record */}
              <form onSubmit={handleCaptureDowntimeRecord} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Emergency Offline Patient Intake (Generates Temporary DT-EMR-XXXX Identifier)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Patient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kpehe Kollie"
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Triage Acuity</label>
                    <select
                      value={emergencyCat}
                      onChange={e => setEmergencyCat(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden"
                    >
                      <option value="TRIAGE_RED">RED (Immediate Resuscitation)</option>
                      <option value="TRIAGE_YELLOW">YELLOW (Urgent Emergency)</option>
                      <option value="TRIAGE_GREEN">GREEN (Standard Outpatient)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Chief Presentation</label>
                    <input
                      type="text"
                      placeholder="e.g. Acute motorcycle trauma"
                      value={complaint}
                      onChange={e => setComplaint(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Manual Cash Receipt No</label>
                    <input
                      type="text"
                      placeholder="e.g. MAN-RCPT-8891 ($20)"
                      value={manualReceipt}
                      onChange={e => setManualReceipt(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-5 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Buffer Offline Record
                  </button>
                </div>
              </form>

              {/* List of buffered records */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 block">Downtime Buffer & Reconciliation Queue:</span>
                {db.downtimeRecords.map(rec => (
                  <div key={rec.id} className="p-4 bg-white rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {rec.temporaryDowntimeId}
                        </span>
                        <span className="font-bold text-slate-900">{rec.patientName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">({rec.paperPacketNumber})</span>
                      </div>
                      <p className="text-slate-600 mt-1">{rec.chiefComplaint}</p>
                      {rec.reconciledPermanentMrn && (
                        <p className="text-emerald-700 font-mono font-semibold mt-0.5">
                          Reconciled into Permanent MRN: {rec.reconciledPermanentMrn} (by {rec.reconciledBy})
                        </p>
                      )}
                    </div>

                    <div>
                      {rec.reconciliationStatus === 'PENDING_RECONCILIATION' ? (
                        <button
                          onClick={() => handleReconcileRecord(rec.id)}
                          className="bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs px-4 py-1.5 rounded transition-colors cursor-pointer"
                        >
                          Reconcile to Permanent MRN
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'paper_packets' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-sm block">Standard Contingency Paper Packets</span>
                <p className="text-slate-600 leading-relaxed">
                  During complete server or grid disruptions, clinical workstations switch to pre-printed standardized paper packets bearing matching temporary IDs to ensure uninterrupted clinical delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-900 block">Packet #1: Emergency Resuscitation & Triage</span>
                  <p className="text-slate-500 text-[11px]">Includes trauma flow-sheet, vital signs observation card, and manual medication administration record.</p>
                  <button onClick={() => window.print()} className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer">
                    <Printer className="w-3.5 h-3.5" /> Print Blank Packet
                  </button>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-900 block">Packet #2: Manual Laboratory & Pharmacy Slips</span>
                  <p className="text-slate-500 text-[11px]">Carbon-copy triplicate slips with pre-numbered temporary accession numbers and manual batch deduction logs.</p>
                  <button onClick={() => window.print()} className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer">
                    <Printer className="w-3.5 h-3.5" /> Print Blank Slips
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
