import React, { useState } from 'react';
import { Microscope, CheckCircle2, AlertTriangle, ShieldCheck, Clock, User, FileText, Send } from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { UserAccount } from '../../types/auth';
import { LabOrder } from '../../types/clinical';

interface LaboratoryWorkstationProps {
  currentUser: UserAccount;
}

export const LaboratoryWorkstation: React.FC<LaboratoryWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [selectedLabId, setSelectedLabId] = useState<string>(db.labOrders[0]?.id || '');
  const [resultValue, setResultValue] = useState('');
  const [comments, setComments] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [releaseToPortal, setReleaseToPortal] = useState(true);

  const selectedLab = db.labOrders.find(l => l.id === selectedLabId) || db.labOrders[0];

  const handleUpdateResults = () => {
    if (!resultValue.trim()) {
      alert('Please enter the laboratory observation result value.');
      return;
    }

    updateDatabaseState(draft => {
      const target = draft.labOrders.find(l => l.id === selectedLab.id);
      if (target) {
        target.results = {
          value: resultValue,
          unit: target.results?.unit || 'standard',
          referenceRange: target.results?.referenceRange || 'Reference normal',
          isAbnormal,
          isCritical,
          comments: comments || 'Validated by Medical Laboratory Scientist.',
        };
        target.status = 'RELEASED';
        target.validatedBy = `${currentUser.fullName} (${currentUser.licenseNumber || 'LMBA-MLS'})`;
        target.releasedAt = new Date().toISOString();
        target.releasedToPatientPortal = releaseToPortal;
      }
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'RELEASE_RESULT',
      module: 'LAB',
      patientId: selectedLab.patientId,
      patientMrn: selectedLab.patientMrn,
      resourceId: selectedLab.accessionNumber,
      details: `Released laboratory test results for ${selectedLab.testName} (${selectedLab.accessionNumber}). Critical flag: ${isCritical}. Portal release: ${releaseToPortal}.`,
      ipAddress: 'Laboratory LIS Station #1',
      status: 'SUCCESS',
    });

    alert(`Results for ${selectedLab.accessionNumber} authorized and released!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 text-base">Diagnostic Laboratory Information System (LIS)</h2>
          <p className="text-xs text-slate-500">Specimen Accessioning, Result Validation, Critical Alert Flagging & Patient Portal Release</p>
        </div>
        <div className="text-xs text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded font-mono font-bold">
          LIS Lead: {currentUser.fullName}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orders Queue (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs">Accession Worklist ({db.labOrders.length})</h3>
            <span className="text-[11px] text-slate-500">Chain of Custody Active</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {db.labOrders.map(lab => (
              <div
                key={lab.id}
                onClick={() => {
                  setSelectedLabId(lab.id);
                  setResultValue(lab.results?.value || '');
                  setComments(lab.results?.comments || '');
                  setIsAbnormal(lab.results?.isAbnormal || false);
                  setIsCritical(lab.results?.isCritical || false);
                  setReleaseToPortal(lab.releasedToPatientPortal);
                }}
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  lab.id === selectedLab?.id
                    ? 'bg-cyan-50 border-cyan-400 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-teal-900 text-xs">{lab.accessionNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    lab.status === 'RELEASED' ? 'bg-emerald-100 text-emerald-800' :
                    lab.status === 'PENDING_VALIDATION' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {lab.status}
                  </span>
                </div>

                <div className="font-semibold text-slate-900 text-xs">{lab.testName}</div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>Patient: {lab.patientName}</span>
                  <span>{lab.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result Entry & Release Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          {selectedLab ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedLab.testName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Accession: <span className="font-mono font-bold text-teal-800">{selectedLab.accessionNumber}</span> · Specimen: {selectedLab.sampleType}
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">
                  Patient MRN: {selectedLab.patientMrn}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Result Observation Value *</label>
                <textarea
                  rows={3}
                  value={resultValue}
                  onChange={e => setResultValue(e.target.value)}
                  placeholder="Enter numerical values, units, or qualitative findings..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-cyan-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory Technologist Comments & Reference</label>
                <input
                  type="text"
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="e.g. Parasitemia quantified by Giemsa microscopy"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                />
              </div>

              {/* Safety & Panic Alert Flags */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">Clinical Panic Alert & Patient Portal Controls</span>
                <div className="flex flex-col sm:flex-row gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAbnormal}
                      onChange={e => setIsAbnormal(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span className="text-amber-800 font-semibold">Flag as Abnormal Finding</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCritical}
                      onChange={e => setIsCritical(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span className="text-rose-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      CRITICAL PANIC VALUE (Escalate Stat)
                    </span>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={releaseToPortal}
                      onChange={e => setReleaseToPortal(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <span className="text-slate-800 font-medium">
                      Release immediately to Patient Portal (Safe for patient self-viewing)
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Validating Scientist: <strong className="text-slate-900">{currentUser.fullName}</strong>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateResults}
                  className="bg-cyan-800 hover:bg-cyan-900 text-white font-medium text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Authorize & Release Results</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Select an accession from the worklist.</p>
          )}
        </div>
      </div>
    </div>
  );
};
