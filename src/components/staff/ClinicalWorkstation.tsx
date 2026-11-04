import React, { useState } from 'react';
import { 
  Stethoscope, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Lock, 
  Pill, 
  FlaskConical, 
  Calendar,
  User,
  ShieldCheck,
  Scan,
  Eye,
  RotateCw,
  Sliders,
  ZoomIn,
  X
} from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { UserAccount } from '../../types/auth';
import { Patient } from '../../types/patient';
import { ClinicalEncounter, LabOrder, Prescription, RadiologyStudy } from '../../types/clinical';

interface ClinicalWorkstationProps {
  currentUser: UserAccount;
}

export const ClinicalWorkstation: React.FC<ClinicalWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PAT-001');

  const patient = db.patients.find(p => p.id === selectedPatientId) || db.patients[0];
  const patientVitals = db.vitals.filter(v => v.patientId === patient.id);
  const patientEncounters = db.encounters.filter(e => e.patientId === patient.id);
  const patientLabs = db.labOrders.filter(l => l.patientId === patient.id);
  const patientPrescriptions = db.prescriptions.filter(p => p.patientId === patient.id);
  const patientRadiology = (db.radiologyStudies || []).filter(r => r.patientId === patient.id);

  // Clinician Medical Image Previewer State
  const [previewStudy, setPreviewStudy] = useState<RadiologyStudy | null>(null);
  const [imgZoom, setImgZoom] = useState(1);
  const [imgInvert, setImgInvert] = useState(false);
  const [imgRotate, setImgRotate] = useState(0);

  // Form states for new consultation
  const [chiefComplaint, setChiefComplaint] = useState('Acute fever, severe headache, and chills for 3 days');
  const [hpi, setHpi] = useState('Patient states fever began on Sunday evening with rigors and profuse sweating. Mild nausea, no vomiting. Denies cough or dysuria.');
  const [physicalExam, setPhysicalExam] = useState('Temp 38.6C, alert, moderate pallor, no scleral icterus. Chest clear bilaterally. Abdomen soft, non-tender, no organomegaly.');
  const [selectedDiagnosisCode, setSelectedDiagnosisCode] = useState('1F40.0');
  const [diagnosisTitle, setDiagnosisTitle] = useState('Plasmodium falciparum malaria without complications (ICD-11 1F40.0)');
  const [treatmentPlan, setTreatmentPlan] = useState('1. Stat Malaria RDT & FBC. 2. Prescribed oral Artemether/Lumefantrine 80/480mg. 3. Paracetamol 1g PO TDS.');
  
  // Ordering lab
  const [orderLabTest, setOrderLabTest] = useState('Malaria Rapid Diagnostic Test (Pf-HRP2) & Thick Smear');
  // Prescribing drug
  const [prescribeDrug, setPrescribeDrug] = useState('Coartem (Artemether 80mg / Lumefantrine 480mg)');
  const [prescribeDosage, setPrescribeDosage] = useState('4 tablets BD for 3 days');
  const [allergyWarning, setAllergyWarning] = useState<string | null>(null);

  const [signedEncounter, setSignedEncounter] = useState<ClinicalEncounter | null>(patientEncounters[0] || null);

  const handlePrescribeDrugChange = (drugName: string) => {
    setPrescribeDrug(drugName);
    // Check allergy contraindications
    if (drugName.toLowerCase().includes('amoxicillin') || drugName.toLowerCase().includes('penicillin')) {
      const hasPenicillinAllergy = patient.allergies.some(a => a.substance.toLowerCase().includes('penicillin'));
      if (hasPenicillinAllergy) {
        setAllergyWarning(`CRITICAL CONTRAINDICATION: Patient has documented severe allergy to Penicillin! Prescription blocked.`);
        return;
      }
    }
    setAllergyWarning(null);
  };

  const handleOrderLab = () => {
    const accessionNo = `LAB-2026-${String(db.labOrders.length + 390).padStart(5, '0')}`;
    const newLab: LabOrder = {
      id: `LAB-${Date.now()}`,
      accessionNumber: accessionNo,
      patientId: patient.id,
      patientMrn: patient.mrn,
      patientName: `${patient.firstName} ${patient.lastName}`,
      orderingPhysicianName: currentUser.fullName,
      testName: orderLabTest,
      category: orderLabTest.includes('Malaria') ? 'PARASITOLOGY' : 'HEMATOLOGY',
      sampleType: 'WHOLE_BLOOD',
      specimenCollected: false,
      status: 'ORDERED',
      releasedToPatientPortal: false,
      orderedAt: new Date().toISOString(),
    };

    updateDatabaseState(draft => {
      draft.labOrders.unshift(newLab);
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'LAB',
      patientId: patient.id,
      patientMrn: patient.mrn,
      details: `Physician ordered lab test ${orderLabTest} (${accessionNo}) for ${patient.firstName} ${patient.lastName}.`,
      ipAddress: 'Physician Workstation #2',
      status: 'SUCCESS',
    });
  };

  const handlePrescribe = () => {
    if (allergyWarning) {
      alert('Cannot prescribe contraindicated medication due to documented patient allergy!');
      return;
    }

    const newRx: Prescription = {
      id: `RX-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      patientMrn: patient.mrn,
      patientName: `${patient.firstName} ${patient.lastName}`,
      prescribingDoctor: `${currentUser.fullName} (${currentUser.licenseNumber || 'LMDC-MD'})`,
      medicationName: prescribeDrug,
      genericName: prescribeDrug.split('(')[0].trim(),
      dosage: prescribeDosage,
      frequency: 'As indicated on clinical chart',
      durationDays: 3,
      totalQuantity: 24,
      instructions: 'Take as directed with food or water.',
      status: 'VERIFIED',
      createdAt: new Date().toISOString(),
    };

    updateDatabaseState(draft => {
      draft.prescriptions.unshift(newRx);
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'PHARMACY',
      patientId: patient.id,
      patientMrn: patient.mrn,
      details: `Prescription issued for ${prescribeDrug} to ${patient.firstName} ${patient.lastName}.`,
      ipAddress: 'Physician Workstation #2',
      status: 'SUCCESS',
    });
  };

  const handleSignEncounter = () => {
    const encId = `ENC-${Date.now().toString().slice(-4)}`;
    const newEnc: ClinicalEncounter = {
      id: encId,
      patientId: patient.id,
      patientMrn: patient.mrn,
      patientName: `${patient.firstName} ${patient.lastName}`,
      type: 'OPD',
      status: 'SIGNED_OFF',
      attendingPhysicianId: currentUser.id,
      attendingPhysicianName: currentUser.fullName,
      chiefComplaint,
      historyOfPresentIllness: hpi,
      physicalExamination: physicalExam,
      diagnoses: [
        {
          code: selectedDiagnosisCode,
          title: diagnosisTitle,
          type: 'PRIMARY',
          system: 'ICD-11',
        }
      ],
      treatmentPlan,
      signedAt: new Date().toISOString(),
      signedBy: `${currentUser.fullName} (${currentUser.licenseNumber || 'LMDC-MD'})`,
      createdAt: new Date().toISOString(),
    };

    updateDatabaseState(draft => {
      draft.encounters.unshift(newEnc);
      // Update queue item to COMPLETED if active
      const q = draft.queue.find(item => item.patientId === patient.id && item.department === 'OPD_CONSULT');
      if (q) q.status = 'COMPLETED';
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'SIGN',
      module: 'OPD',
      patientId: patient.id,
      patientMrn: patient.mrn,
      details: `Digitally signed Clinical Encounter ${encId} with diagnosis ${diagnosisTitle}.`,
      ipAddress: 'Physician Workstation #2',
      status: 'SUCCESS',
    });

    setSignedEncounter(newEnc);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Patient Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-lg">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 text-base">Outpatient Consultation & EMR Chart</h2>
              <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                Attending: {currentUser.fullName}
              </span>
            </div>
            <p className="text-xs text-slate-500">Longitudinal History, Vitals Trends, ICD-11 Coding & Provider Sign-Off</p>
          </div>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Active Patient:</span>
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            className="text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            {db.patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} — {p.mrn} (DOB: {p.dateOfBirth})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Clinical Summary Strip */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm text-teal-300">{patient.firstName} {patient.lastName}</span>
          <span className="font-mono text-slate-400">MRN: {patient.mrn}</span>
          <span>·</span>
          <span>Age: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} ({patient.gender})</span>
          <span>·</span>
          <span>Blood: <strong className="text-rose-400">{patient.bloodGroup || 'N/A'}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">Allergies:</span>
          {patient.allergies.length > 0 ? (
            patient.allergies.map((a, i) => (
              <span key={i} className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-semibold text-[11px] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                {a.substance} ({a.severity})
              </span>
            ))
          ) : (
            <span className="text-slate-400 italic">No Known Drug Allergies</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Triage Vitals & Clinical History (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Latest Vitals */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" />
              Latest Triage Observations & Vitals
            </h3>

            {patientVitals.length > 0 ? (
              <div className="space-y-2 text-xs">
                {patientVitals.map(v => (
                  <div key={v.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Recorded: {v.recordedAt.split('T')[1].slice(0, 5)} by {v.recordedBy}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        v.triageAcuity === 'YELLOW_VERY_URGENT' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {v.triageAcuity}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div><span className="text-slate-500">Temp:</span> <strong className="text-slate-900">{v.temperatureC}°C</strong></div>
                      <div><span className="text-slate-500">BP:</span> <strong className="text-slate-900">{v.systolicBpMmHg}/{v.diastolicBpMmHg}</strong></div>
                      <div><span className="text-slate-500">Pulse:</span> <strong className="text-slate-900">{v.heartRateBpm} bpm</strong></div>
                      <div><span className="text-slate-500">SpO2:</span> <strong className="text-slate-900">{v.oxygenSaturationPercent}%</strong></div>
                    </div>

                    {v.alerts.length > 0 && (
                      <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-200 font-medium">
                        Alert: {v.alerts.join('; ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No triage observations recorded today.</p>
            )}
          </div>

          {/* Quick Orders & Diagnostic Requests */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-700" />
              Order Laboratory Investigation
            </h3>

            <div className="space-y-3">
              <select
                value={orderLabTest}
                onChange={e => setOrderLabTest(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden"
              >
                <option value="Malaria Rapid Diagnostic Test (Pf-HRP2) & Thick Smear">Malaria RDT & Thick Smear</option>
                <option value="Full Blood Count (FBC) with Automated Differential">Full Blood Count (5-part)</option>
                <option value="Fasting Blood Glucose & Serum Electrolytes">Fasting Blood Glucose & Electrolytes</option>
                <option value="Widal Slide Agglutination (Typhoid Test)">Widal Slide Agglutination (Typhoid)</option>
                <option value="Routine Urinalysis & Microscopy">Routine Urinalysis & Microscopy</option>
              </select>

              <button
                onClick={handleOrderLab}
                className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-medium text-xs py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Lab Order to LIS</span>
              </button>
            </div>
          </div>

          {/* Patient Attached Medical Imaging & X-Rays */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Scan className="w-4 h-4 text-teal-700" />
                Medical Imaging & X-Rays ({patientRadiology.length})
              </h3>
              <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded">
                PACS Integrated
              </span>
            </div>

            {patientRadiology.length > 0 ? (
              <div className="space-y-2.5">
                {patientRadiology.map(rad => {
                  const firstImg = rad.images?.[0];
                  return (
                    <div key={rad.id} className="p-3 bg-slate-900 text-white rounded-xl space-y-2 text-xs border border-slate-800">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <strong className="block text-slate-100">{rad.studyDescription}</strong>
                          <span className="text-[10px] text-teal-400 font-mono">{rad.accessionNumber} · {rad.modality}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold font-mono ${
                          rad.status === 'RELEASED' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                        }`}>
                          {rad.status}
                        </span>
                      </div>

                      {firstImg && (
                        <div 
                          onClick={() => {
                            setPreviewStudy(rad);
                            setImgZoom(1);
                            setImgInvert(false);
                            setImgRotate(0);
                          }}
                          className="relative h-28 bg-black rounded-lg overflow-hidden border border-slate-800 cursor-pointer group flex items-center justify-center"
                        >
                          <img src={firstImg.url} alt={firstImg.caption} className="h-full object-contain group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-semibold text-white">
                            <Eye className="w-4 h-4 text-teal-400" />
                            <span>Preview X-Ray</span>
                          </div>
                        </div>
                      )}

                      {rad.impression && (
                        <div className="text-[11px] text-slate-300 bg-slate-800/80 p-2 rounded border border-slate-700/80">
                          <strong className="text-teal-300 block text-[10px] uppercase">Impression:</strong>
                          <p className="line-clamp-2">{rad.impression}</p>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setPreviewStudy(rad);
                          setImgZoom(1);
                          setImgInvert(false);
                          setImgRotate(0);
                        }}
                        className="w-full bg-teal-800 hover:bg-teal-700 text-white font-semibold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect {rad.images.length} Scans in Viewer</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No imaging studies attached to this patient record.</p>
            )}
          </div>
        </div>

        {/* Right Column: Physician Encounter Form & Treatment Plan (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Clinical Assessment & Notes</h3>
              <span className="text-xs text-slate-400">ICD-11 WHO Terminology Standard</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Complaint *</label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">History of Present Illness (HPI)</label>
              <textarea
                rows={3}
                value={hpi}
                onChange={e => setHpi(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Examination Findings</label>
              <textarea
                rows={2}
                value={physicalExam}
                onChange={e => setPhysicalExam(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
              />
            </div>

            {/* ICD-11 Diagnostic Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Diagnosis (ICD-11 / ICD-10)</label>
                <select
                  value={selectedDiagnosisCode}
                  onChange={e => {
                    setSelectedDiagnosisCode(e.target.value);
                    if (e.target.value === '1F40.0') setDiagnosisTitle('Plasmodium falciparum malaria without complications (ICD-11 1F40.0)');
                    else if (e.target.value === 'BA00') setDiagnosisTitle('Essential hypertension (ICD-11 BA00)');
                    else if (e.target.value === '5A11') setDiagnosisTitle('Type 2 diabetes mellitus (ICD-11 5A11)');
                    else setDiagnosisTitle('Acute Bronchitis (ICD-11 CA20)');
                  }}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden bg-white"
                >
                  <option value="1F40.0">1F40.0 — P. falciparum Malaria</option>
                  <option value="BA00">BA00 — Essential Hypertension</option>
                  <option value="5A11">5A11 — Type 2 Diabetes Mellitus</option>
                  <option value="CA20">CA20 — Acute Bronchitis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis Title</label>
                <input
                  type="text"
                  readOnly
                  value={diagnosisTitle}
                  className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-lg p-2.5"
                />
              </div>
            </div>

            {/* In-Encounter Medication Prescribing */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-700" />
                  Prescribe Outpatient Medication
                </span>
                <span className="text-[11px] text-slate-500">Allergy Safety Intercept Enabled</span>
              </div>

              {allergyWarning && (
                <div className="bg-rose-100 border border-rose-300 text-rose-900 text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span className="font-semibold">{allergyWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <select
                    value={prescribeDrug}
                    onChange={e => handlePrescribeDrugChange(e.target.value)}
                    className="w-full text-xs border border-slate-300 bg-white rounded-lg p-2 focus:outline-hidden"
                  >
                    <option value="Coartem (Artemether 80mg / Lumefantrine 480mg)">Coartem 80/480mg (ACT)</option>
                    <option value="Paracetamol 500mg Tablets BP">Paracetamol 500mg</option>
                    <option value="Amoxicillin 500mg Capsules (Penicillin derivative)">Amoxicillin 500mg (Penicillin)</option>
                    <option value="Amlodipine 5mg Tablets">Amlodipine 5mg</option>
                    <option value="Metformin 500mg Tablets">Metformin 500mg</option>
                  </select>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handlePrescribe}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    + Add to Prescription
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Plan & Follow-up Instructions</label>
              <textarea
                rows={2}
                value={treatmentPlan}
                onChange={e => setTreatmentPlan(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
              />
            </div>

            {/* Provider Digital Sign-Off */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span>Signer: </span>
                <strong className="text-slate-900">{currentUser.fullName}</strong>
                <span className="font-mono text-teal-800 ml-1">({currentUser.licenseNumber || 'LMDC-MD'})</span>
              </div>

              <button
                type="button"
                onClick={handleSignEncounter}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Digitally Sign & Lock Encounter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clinician Medical Image Previewer Modal (In-EMR PACS Viewer) */}
      {previewStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-slate-800 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-teal-400" />
                <div>
                  <h4 className="font-extrabold text-sm">{previewStudy.studyDescription}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {previewStudy.accessionNumber} · {previewStudy.patientName} ({previewStudy.patientMrn}) · {previewStudy.modality}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewStudy(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewer Controls */}
            <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImgZoom(z => Math.min(z + 0.25, 3))}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setImgRotate(r => (r + 90) % 360)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
                  title="Rotate 90"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setImgInvert(i => !i)}
                  className={`p-1 rounded cursor-pointer ${imgInvert ? 'bg-teal-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                  title="Invert Grayscale / Negative"
                >
                  <Sliders className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setImgZoom(1); setImgInvert(false); setImgRotate(0); }}
                  className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                Exposure: 110kVp · SID 180cm · Est. Dose: {previewStudy.radiationDoseMgy || '0.12'} mGy
              </div>
            </div>

            {/* Imaging Canvas */}
            <div className="flex-1 min-h-[340px] max-h-[420px] bg-black rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-800 select-none">
              {previewStudy.images?.[0] ? (
                <img
                  src={previewStudy.images[0].url}
                  alt={previewStudy.images[0].caption}
                  style={{
                    transform: `rotate(${imgRotate}deg) scale(${imgZoom})`,
                    filter: `invert(${imgInvert ? 1 : 0})`,
                    transition: 'transform 0.15s ease-out'
                  }}
                  className="max-h-[380px] object-contain drop-shadow-2xl"
                />
              ) : (
                <p className="text-slate-500 text-xs">No scan preview available.</p>
              )}
            </div>

            {/* Report Impression */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                Radiologist Diagnostic Impression:
              </span>
              <p className="text-slate-200 leading-relaxed font-sans">
                {previewStudy.impression || 'Awaiting radiologist interpretation.'}
              </p>
              <div className="text-[10px] text-slate-400 pt-1">
                Signed by: <strong className="text-slate-300">{previewStudy.radiologistName || 'Lead Radiologist'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
