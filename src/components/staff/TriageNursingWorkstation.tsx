import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, User, Clock, Heart, Plus } from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { UserAccount } from '../../types/auth';
import { VitalSignObservation } from '../../types/clinical';

interface TriageNursingWorkstationProps {
  currentUser: UserAccount;
}

export const TriageNursingWorkstation: React.FC<TriageNursingWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PAT-004'); // Tamba Koiyan or other
  const [temp, setTemp] = useState('38.2');
  const [pulse, setPulse] = useState('110');
  const [respRate, setRespRate] = useState('22');
  const [sysBp, setSysBp] = useState('110');
  const [diaBp, setDiaBp] = useState('70');
  const [spo2, setSpo2] = useState('96');
  const [weightKg, setWeightKg] = useState('18');
  const [heightCm, setHeightCm] = useState('105');
  const [acuity, setAcuity] = useState<'RED_IMMEDIATE' | 'YELLOW_VERY_URGENT' | 'GREEN_STANDARD' | 'BLUE_NON_URGENT'>('YELLOW_VERY_URGENT');
  const [nursingNotes, setNursingNotes] = useState('Pediatric patient with sickle cell trait presenting with pain in extremities and moderate fever.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const patient = db.patients.find(p => p.id === selectedPatientId) || db.patients[0];

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();

    const t = parseFloat(temp) || 37.0;
    const sys = parseInt(sysBp) || 120;
    const dia = parseInt(diaBp) || 80;
    const hr = parseInt(pulse) || 80;
    const sp = parseInt(spo2) || 98;

    const alerts: string[] = [];
    if (t >= 38.5) alerts.push(`High Fever (${t}°C)`);
    if (sys >= 160 || dia >= 100) alerts.push(`Hypertensive Urgency (${sys}/${dia} mmHg)`);
    if (sp < 94) alerts.push(`Hypoxia Risk (SpO2 ${sp}%)`);
    if (hr > 120) alerts.push(`Tachycardia (${hr} bpm)`);

    const newObservation: VitalSignObservation = {
      id: `VIT-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      encounterId: `ENC-${Date.now().toString().slice(-4)}`,
      recordedAt: new Date().toISOString(),
      recordedBy: currentUser.fullName,
      temperatureC: t,
      heartRateBpm: hr,
      respiratoryRateBpm: parseInt(respRate) || 18,
      systolicBpMmHg: sys,
      diastolicBpMmHg: dia,
      oxygenSaturationPercent: sp,
      weightKg: parseFloat(weightKg) || undefined,
      heightCm: parseFloat(heightCm) || undefined,
      triageAcuity: acuity,
      nursingNotes,
      alerts,
    };

    updateDatabaseState(draft => {
      draft.vitals.unshift(newObservation);
      // Promote queue priority if Red or Yellow
      const q = draft.queue.find(item => item.patientId === patient.id);
      if (q) {
        if (acuity === 'RED_IMMEDIATE') q.priority = 'EMERGENCY';
        else if (acuity === 'YELLOW_VERY_URGENT') q.priority = 'URGENT';
      }
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'TRIAGE',
      patientId: patient.id,
      patientMrn: patient.mrn,
      details: `Captured triage vitals for ${patient.firstName} ${patient.lastName}: Temp ${t}C, BP ${sys}/${dia}, SpO2 ${sp}%, Acuity ${acuity}.`,
      ipAddress: 'Triage Nurse Desk',
      status: 'SUCCESS',
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 text-base">Triage & Acute Nursing Workstation</h2>
          <p className="text-xs text-slate-500">Standardized South African / WHO Triage Acuity Assessment & Physiological Vitals Stream</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Select Patient in Triage:</span>
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            className="text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            {db.patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} — {p.mrn}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Triage Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-700" />
              <h3 className="font-bold text-slate-900 text-sm">Record Physiological Vitals</h3>
            </div>
            {savedSuccess && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Vitals Saved & Enqueued!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveVitals} className="space-y-4">
            {/* Acuity Level Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Triage Acuity Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setAcuity('RED_IMMEDIATE')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                    acuity === 'RED_IMMEDIATE'
                      ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  RED (Immediate)
                </button>
                <button
                  type="button"
                  onClick={() => setAcuity('YELLOW_VERY_URGENT')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                    acuity === 'YELLOW_VERY_URGENT'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  YELLOW (Very Urgent)
                </button>
                <button
                  type="button"
                  onClick={() => setAcuity('GREEN_STANDARD')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                    acuity === 'GREEN_STANDARD'
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  GREEN (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setAcuity('BLUE_NON_URGENT')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                    acuity === 'BLUE_NON_URGENT'
                      ? 'bg-slate-700 text-white border-slate-800 shadow-xs'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  BLUE (Non-Urgent)
                </button>
              </div>
            </div>

            {/* Vital Signs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temperature (°C) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={temp}
                  onChange={e => setTemp(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pulse / Heart Rate (bpm)</label>
                <input
                  type="number"
                  required
                  value={pulse}
                  onChange={e => setPulse(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Oxygen Saturation SpO2 (%)</label>
                <input
                  type="number"
                  required
                  value={spo2}
                  onChange={e => setSpo2(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blood Pressure Systolic</label>
                <input
                  type="number"
                  value={sysBp}
                  onChange={e => setSysBp(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blood Pressure Diastolic</label>
                <input
                  type="number"
                  value={diaBp}
                  onChange={e => setDiaBp(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Respiratory Rate (breaths/min)</label>
                <input
                  type="number"
                  value={respRate}
                  onChange={e => setRespRate(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Triage Nurse Clinical Notes</label>
              <textarea
                rows={3}
                value={nursingNotes}
                onChange={e => setNursingNotes(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs px-6 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Save Vitals & Route to OPD Clinic</span>
              </button>
            </div>
          </form>
        </div>

        {/* Triage Queue List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-xs">Patients Awaiting Triage & Vitals</h3>
          <div className="space-y-2">
            {db.queue.map(q => (
              <div
                key={q.id}
                onClick={() => setSelectedPatientId(q.patientId)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  q.patientId === selectedPatientId
                    ? 'bg-teal-50 border-teal-300'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">{q.patientName}</span>
                  <span className="font-mono text-[10px] text-teal-800 font-bold">{q.tokenNumber}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>MRN: {q.patientMrn}</span>
                  <span className="font-semibold text-slate-700">{q.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
