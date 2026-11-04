import React, { useState } from 'react';
import { Bed, Users, CheckCircle2, AlertTriangle, ArrowRightLeft, UserPlus, LogOut, Clock } from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { UserAccount } from '../../types/auth';

interface InpatientADTWorkstationProps {
  currentUser: UserAccount;
}

export const InpatientADTWorkstation: React.FC<InpatientADTWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);

  // Admission modal state
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [admitPatientId, setAdmitPatientId] = useState<string>(db.patients[0]?.id || '');
  const [admitReason, setAdmitReason] = useState('Severe complicated malaria requiring IV artesunate and intensive monitoring');
  const [targetBedId, setTargetBedId] = useState<string>(db.beds.find(b => b.status === 'AVAILABLE')?.id || '');

  const filteredBeds = selectedWard === 'ALL' ? db.beds : db.beds.filter(b => b.wardName === selectedWard);

  const handleBedStatusToggle = (bedId: string, newStatus: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING_MAINTENANCE' | 'ISOLATION') => {
    updateDatabaseState(draft => {
      const b = draft.beds.find(bed => bed.id === bedId);
      if (b) {
        b.status = newStatus;
        if (newStatus === 'AVAILABLE' || newStatus === 'CLEANING_MAINTENANCE') {
          b.currentPatientId = undefined;
          b.currentPatientName = undefined;
          b.currentPatientMrn = undefined;
        }
      }
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'UPDATE',
      module: 'INPATIENT',
      resourceId: bedId,
      details: `Bed ${bedId} status updated to ${newStatus} by ${currentUser.fullName}.`,
      ipAddress: 'Inpatient Nursing Station',
      status: 'SUCCESS',
    });
  };

  const handleAdmitPatient = () => {
    const patient = db.patients.find(p => p.id === admitPatientId);
    const bed = db.beds.find(b => b.id === targetBedId);

    if (!patient || !bed) {
      alert('Please select both a patient and an available bed.');
      return;
    }

    const admId = `ADM-${Date.now().toString().slice(-4)}`;

    updateDatabaseState(draft => {
      // 1. Update bed state
      const targetBed = draft.beds.find(b => b.id === bed.id);
      if (targetBed) {
        targetBed.status = 'OCCUPIED';
        targetBed.currentPatientId = patient.id;
        targetBed.currentPatientName = `${patient.firstName} ${patient.lastName}`;
        targetBed.currentPatientMrn = patient.mrn;
        targetBed.admissionDate = new Date().toISOString();
        targetBed.attendingDoctor = currentUser.fullName;
      }

      // 2. Add admission record
      draft.admissions.unshift({
        id: admId,
        patientId: patient.id,
        patientMrn: patient.mrn,
        patientName: `${patient.firstName} ${patient.lastName}`,
        bedId: bed.id,
        bedNumber: bed.bedNumber,
        wardName: bed.wardName,
        admittingDoctor: currentUser.fullName,
        admissionReason: admitReason,
        admissionDate: new Date().toISOString(),
        status: 'ACTIVE',
      });
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'INPATIENT',
      patientId: patient.id,
      patientMrn: patient.mrn,
      resourceId: admId,
      details: `Admitted ${patient.firstName} ${patient.lastName} to ${bed.wardName} (${bed.bedNumber}) for ${admitReason}.`,
      ipAddress: 'Inpatient Nursing Station',
      status: 'SUCCESS',
    });

    setShowAdmitModal(false);
    alert(`Patient ${patient.firstName} ${patient.lastName} admitted to Bed ${bed.bedNumber}.`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 text-base">Inpatient Wards & Bed Board (ADT)</h2>
          <p className="text-xs text-slate-500">Admit, Transfer, Discharge (ADT) Management, Room Turnover & Infection Control</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdmitModal(true)}
            className="bg-indigo-800 hover:bg-indigo-900 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Admit Patient to Bed</span>
          </button>
        </div>
      </div>

      {/* Ward Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {['ALL', 'Male Medical Ward', 'Female Medical Ward', 'Pediatric Ward', 'Maternity Ward', 'Intensive Care Unit'].map(ward => (
          <button
            key={ward}
            onClick={() => setSelectedWard(ward)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedWard === ward
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {ward}
          </button>
        ))}
      </div>

      {/* Bed Board Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBeds.map(bed => (
          <div
            key={bed.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 transition-all ${
              bed.status === 'OCCUPIED' ? 'border-amber-300' :
              bed.status === 'CLEANING_MAINTENANCE' ? 'border-indigo-300 bg-indigo-50/20' :
              bed.status === 'ISOLATION' ? 'border-purple-300 bg-purple-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono font-bold text-sm text-slate-900 block">{bed.bedNumber}</span>
                <span className="text-[11px] text-slate-500">{bed.wardName} · {bed.roomNumber}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                bed.status === 'OCCUPIED' ? 'bg-amber-100 text-amber-800' :
                bed.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                bed.status === 'CLEANING_MAINTENANCE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {bed.status}
              </span>
            </div>

            {bed.status === 'OCCUPIED' ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Current Patient:</span>
                  <span className="font-bold text-slate-900 text-sm">{bed.currentPatientName}</span>
                  <span className="font-mono text-teal-800 text-[11px] block">MRN: {bed.currentPatientMrn}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Admitted: {bed.admissionDate?.split('T')[0]} · Attending: {bed.attendingDoctor}
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleBedStatusToggle(bed.id, 'CLEANING_MAINTENANCE')}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs py-1.5 rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Discharge / Send to Cleaning</span>
                  </button>
                </div>
              </div>
            ) : bed.status === 'CLEANING_MAINTENANCE' ? (
              <div className="space-y-3 text-xs">
                <p className="text-indigo-900 leading-relaxed text-[11px]">
                  Bed being disinfected and linens sanitized by infection control housekeeping team.
                </p>
                <button
                  onClick={() => handleBedStatusToggle(bed.id, 'AVAILABLE')}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs py-1.5 rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Cleaning Complete (Available)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs py-2">
                <p className="text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Clean & Ready for Inpatient Admission
                </p>
                <button
                  onClick={() => {
                    setTargetBedId(bed.id);
                    setShowAdmitModal(true);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-1.5 rounded transition-colors cursor-pointer"
                >
                  Assign Admission
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Admit Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Inpatient Admission Order</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient to Admit</label>
                <select
                  value={admitPatientId}
                  onChange={e => setAdmitPatientId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden"
                >
                  {db.patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Ward & Bed</label>
                <select
                  value={targetBedId}
                  onChange={e => setTargetBedId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden"
                >
                  {db.beds.filter(b => b.status === 'AVAILABLE').map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} — {b.wardName} ({b.roomNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Indication for Admission</label>
                <textarea
                  rows={3}
                  value={admitReason}
                  onChange={e => setAdmitReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
              <button
                onClick={() => setShowAdmitModal(false)}
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleAdmitPatient}
                className="bg-indigo-800 hover:bg-indigo-900 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Confirm Admission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
