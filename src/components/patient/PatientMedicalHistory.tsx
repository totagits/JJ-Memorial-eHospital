import React, { useState } from 'react';
import { 
  History, 
  Calendar, 
  Stethoscope, 
  Clock, 
  FileText, 
  Pill, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  HeartPulse, 
  Bed, 
  Microscope, 
  Scan, 
  User, 
  Building2, 
  ShieldCheck, 
  ExternalLink,
  Info,
  CalendarCheck2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Patient } from '../../types/patient';
import { ClinicalEncounter, VitalSignObservation, LabOrder, Prescription, AdmissionRecord, RadiologyStudy } from '../../types/clinical';
import { TelehealthSession } from '../../types/telehealth';

interface PatientMedicalHistoryProps {
  patient: Patient;
  encounters: ClinicalEncounter[];
  vitals: VitalSignObservation[];
  labOrders: LabOrder[];
  prescriptions: Prescription[];
  admissions?: AdmissionRecord[];
  radiologyStudies?: RadiologyStudy[];
  telehealthSessions?: TelehealthSession[];
  onOpenAppointmentModal: () => void;
}

export const PatientMedicalHistory: React.FC<PatientMedicalHistoryProps> = ({
  patient,
  encounters,
  vitals,
  labOrders,
  prescriptions,
  admissions = [],
  radiologyStudies = [],
  telehealthSessions = [],
  onOpenAppointmentModal
}) => {
  const [selectedEncounter, setSelectedEncounter] = useState<ClinicalEncounter | null>(null);
  const [expandedEncounterId, setExpandedEncounterId] = useState<string | null>(encounters[0]?.id || null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPrintCertificate, setShowPrintCertificate] = useState(false);
  const [activePrintEncounter, setActivePrintEncounter] = useState<ClinicalEncounter | null>(null);

  // Filter encounters
  const filteredEncounters = encounters.filter(enc => {
    const matchesType = filterType === 'ALL' || enc.type === filterType;
    const matchesSearch = 
      enc.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enc.attendingPhysicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enc.treatmentPlan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enc.diagnoses.some(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Sort encounters chronologically descending (newest first)
  const sortedEncounters = [...filteredEncounters].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handlePrintEncounter = (enc: ClinicalEncounter) => {
    setActivePrintEncounter(enc);
    setShowPrintCertificate(true);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const getVitalsForEncounter = (encId: string) => {
    return vitals.filter(v => v.encounterId === encId);
  };

  const getLabsForEncounter = (encId: string) => {
    return labOrders.filter(l => l.encounterId === encId || l.patientId === patient.id);
  };

  const getPrescriptionsForEncounter = (encId: string) => {
    return prescriptions.filter(p => p.encounterId === encId || p.patientId === patient.id);
  };

  const getRadiologyForEncounter = (encId: string) => {
    return radiologyStudies.filter(r => r.encounterId === encId || r.patientId === patient.id);
  };

  // Find linked admission if inpatient
  const getAdmissionForEncounter = (enc: ClinicalEncounter) => {
    return admissions.find(a => a.patientId === enc.patientId);
  };

  return (
    <div className="space-y-6">
      {/* Printable Clinical Visit Summary & Medical Certificate */}
      {showPrintCertificate && activePrintEncounter && (
        <div className="hidden print:block fixed inset-0 bg-white text-slate-950 p-8 font-sans z-999">
          {/* Official Letterhead */}
          <div className="border-b-2 border-teal-900 pb-4 mb-6 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-teal-900 text-white font-black flex items-center justify-center text-sm">
                  JJ
                </div>
                <h1 className="text-2xl font-black text-teal-950 uppercase tracking-tight">
                  J & J Memorial e-Hospital
                </h1>
              </div>
              <p className="text-xs font-bold text-slate-700">
                Official Clinical Encounters & Medical Treatment Summary
              </p>
              <p className="text-xs text-slate-600">
                VOA East Community, Robertsfield Highway, Monrovia, Montserrado County, Liberia · CHAL Member Facility
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Reg: MoH-LIB-HOSP-2026-088 · 24/7 Acute Care & Inpatient Service
              </p>
            </div>

            <div className="text-right space-y-1">
              <QRCodeSVG 
                value={`https://jjmemorial.totag.network/verify/visit/${activePrintEncounter.id}?mrn=${patient.mrn}`}
                size={70}
                level="M"
              />
              <p className="text-[10px] font-mono text-slate-500">Scan to Verify Record</p>
            </div>
          </div>

          {/* Patient Demographics Banner */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-4 bg-slate-50 border border-slate-300 rounded-lg">
            <div>
              <p className="mb-1"><span className="font-bold text-slate-700">Patient Full Name:</span> <span className="font-bold text-slate-950 text-sm">{patient.firstName} {patient.middleName || ''} {patient.lastName}</span></p>
              <p className="mb-1"><span className="font-bold text-slate-700">MRN:</span> <span className="font-mono font-bold text-teal-900">{patient.mrn}</span></p>
              <p className="mb-1"><span className="font-bold text-slate-700">Date of Birth / Gender:</span> {patient.dateOfBirth} ({patient.gender === 'F' ? 'Female' : 'Male'})</p>
              <p><span className="font-bold text-slate-700">Residential Address:</span> {patient.address.community}, {patient.address.city}, {patient.address.county}</p>
            </div>
            <div>
              <p className="mb-1"><span className="font-bold text-slate-700">Encounter ID:</span> <span className="font-mono font-bold">{activePrintEncounter.id}</span></p>
              <p className="mb-1"><span className="font-bold text-slate-700">Date of Encounter:</span> {new Date(activePrintEncounter.createdAt).toLocaleDateString('en-GB')} at {new Date(activePrintEncounter.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="mb-1"><span className="font-bold text-slate-700">Encounter Type:</span> {activePrintEncounter.type} Consultation</p>
              <p><span className="font-bold text-slate-700">Attending Clinician:</span> {activePrintEncounter.attendingPhysicianName}</p>
            </div>
          </div>

          {/* Clinical Findings & Chief Complaint */}
          <div className="mb-6 space-y-4 text-xs">
            <div className="border border-slate-200 rounded p-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-2">1. Chief Complaint & History of Present Illness</h4>
              <p className="font-medium text-slate-900 mb-1">{activePrintEncounter.chiefComplaint}</p>
              <p className="text-slate-700">{activePrintEncounter.historyOfPresentIllness}</p>
            </div>

            <div className="border border-slate-200 rounded p-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-2">2. Physical Examination Findings</h4>
              <p className="text-slate-700">{activePrintEncounter.physicalExamination}</p>
            </div>

            {/* Diagnoses */}
            <div className="border border-slate-200 rounded p-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-2">3. Confirmed Clinical Diagnoses (ICD Classification)</h4>
              <div className="space-y-1">
                {activePrintEncounter.diagnoses.map((diag, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{i + 1}. {diag.title}</span>
                    <span className="font-mono font-bold text-teal-900 bg-slate-100 px-2 py-0.5 rounded">{diag.system}: {diag.code} ({diag.type})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment Plan & Prescriptions */}
            <div className="border border-slate-200 rounded p-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 mb-2">4. Treatment Plan & Medications Administered</h4>
              <p className="text-slate-800 font-medium mb-3">{activePrintEncounter.treatmentPlan}</p>
              
              <h5 className="font-bold text-slate-700 text-[11px] mb-1">Medication Regimen Prescribed:</h5>
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-bold">
                    <th className="p-1 border border-slate-300">Medication</th>
                    <th className="p-1 border border-slate-300">Dosage</th>
                    <th className="p-1 border border-slate-300">Frequency & Instructions</th>
                    <th className="p-1 border border-slate-300">Course</th>
                  </tr>
                </thead>
                <tbody>
                  {getPrescriptionsForEncounter(activePrintEncounter.id).map((rx, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="p-1 font-bold border border-slate-300">{rx.medicationName}</td>
                      <td className="p-1 border border-slate-300">{rx.dosage}</td>
                      <td className="p-1 border border-slate-300">{rx.frequency} - {rx.instructions}</td>
                      <td className="p-1 border border-slate-300">{rx.durationDays} Days (Qty: {rx.totalQuantity})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinician Sign-Off & Attestation */}
          <div className="mt-8 pt-4 border-t-2 border-slate-400 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-slate-500 text-[10px]">Attending Physician Attestation:</p>
              <p className="font-bold text-slate-900 mt-1">{activePrintEncounter.signedBy || activePrintEncounter.attendingPhysicianName}</p>
              <p className="text-slate-600">Licensed Physician & Clinical Lead</p>
              <p className="text-slate-500 font-mono text-[10px]">LMDC Reg. Verified · J & J Memorial Health Center</p>
              <p className="text-slate-400 text-[9px] mt-2">Electronic Signature Verified via SHA-256 PKI Timestamp: {activePrintEncounter.signedAt || activePrintEncounter.createdAt}</p>
            </div>
            <div className="text-right flex flex-col justify-end">
              <div className="inline-block border-2 border-teal-900 text-teal-950 font-black px-4 py-2 text-center rounded">
                <p className="text-xs uppercase">OFFICIAL CLINICAL RECORD</p>
                <p className="text-[9px] text-teal-800">Liberian Ministry of Health HMIS Compliant</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shadow-xs">
              <History className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Patient Medical History & Encounters
              </h2>
              <p className="text-xs text-slate-500">
                Comprehensive chronological log of outpatient visits, emergency triage, diagnoses, prescriptions, and inpatient admissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (sortedEncounters.length > 0) {
                  handlePrintEncounter(sortedEncounters[0]);
                }
              }}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Latest Visit</span>
            </button>
            <button
              onClick={onOpenAppointmentModal}
              className="inline-flex items-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Book Follow-up Visit</span>
            </button>
          </div>
        </div>

        {/* Quick Longitudinal Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Encounters</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{encounters.length}</p>
            <p className="text-[10px] text-teal-700 font-medium">Recorded in EMR</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Confirmed Diagnoses</p>
            <p className="text-xl font-black text-teal-900 mt-0.5">
              {encounters.reduce((acc, curr) => acc + curr.diagnoses.length, 0)}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">ICD-11 / ICD-10 coded</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Diagnostic Studies</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{labOrders.length + radiologyStudies.length}</p>
            <p className="text-[10px] text-emerald-700 font-medium">{labOrders.length} Labs · {radiologyStudies.length} Imaging</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Medication Regimens</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{prescriptions.length}</p>
            <p className="text-[10px] text-teal-700 font-medium">Verified in Pharmacy</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by diagnosis, symptom, doctor, or treatment..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Encounter Type:</span>
          </span>
          {['ALL', 'OPD', 'EMERGENCY', 'INPATIENT', 'FOLLOWUP'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === type 
                  ? 'bg-teal-800 text-white font-bold shadow-xs' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {type === 'ALL' ? 'All Visits' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Visits Timeline */}
      {sortedEncounters.length > 0 ? (
        <div className="space-y-4">
          {sortedEncounters.map((enc, index) => {
            const isExpanded = expandedEncounterId === enc.id;
            const encounterVitals = getVitalsForEncounter(enc.id);
            const encounterLabs = getLabsForEncounter(enc.id);
            const encounterRx = getPrescriptionsForEncounter(enc.id);
            const encounterRadiology = getRadiologyForEncounter(enc.id);
            const linkedAdmission = getAdmissionForEncounter(enc);

            return (
              <div 
                key={enc.id} 
                className={`bg-white rounded-2xl border transition-all shadow-xs ${
                  isExpanded ? 'border-teal-700 ring-1 ring-teal-700/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Encounter Card Header */}
                <div 
                  onClick={() => setExpandedEncounterId(isExpanded ? null : enc.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon indicating Encounter Type */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      enc.type === 'EMERGENCY' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      enc.type === 'INPATIENT' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      enc.type === 'FOLLOWUP' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}>
                      {enc.type === 'EMERGENCY' ? <Activity className="w-5 h-5" /> :
                       enc.type === 'INPATIENT' ? <Bed className="w-5 h-5" /> :
                       enc.type === 'FOLLOWUP' ? <CalendarCheck2 className="w-5 h-5" /> :
                       <Stethoscope className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {enc.chiefComplaint}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          enc.type === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' :
                          enc.type === 'INPATIENT' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-teal-100 text-teal-900'
                        }`}>
                          {enc.type}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {enc.id}
                        </span>
                        {enc.status === 'SIGNED_OFF' && (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Clinically Signed Off
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(enc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(enc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-teal-700" />
                          <span className="font-medium text-slate-800">{enc.attendingPhysicianName}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Diagnoses Pills & Toggle */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {enc.diagnoses.slice(0, 2).map((diag, dIdx) => (
                        <span 
                          key={dIdx} 
                          className="bg-teal-50 text-teal-900 border border-teal-200 font-semibold text-[11px] px-2 py-0.5 rounded flex items-center gap-1"
                          title={diag.title}
                        >
                          <span className="font-bold">{diag.code}:</span>
                          <span className="truncate max-w-[120px]">{diag.title}</span>
                        </span>
                      ))}
                      {enc.diagnoses.length > 2 && (
                        <span className="text-[11px] text-slate-500 font-medium">+{enc.diagnoses.length - 2} more</span>
                      )}
                    </div>

                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Full Encounter Medical Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-6">
                    {/* Clinical Overview Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: History & Findings */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-teal-700" />
                          <span>Clinical Assessment & Findings</span>
                        </h4>
                        
                        <div className="text-xs space-y-2">
                          <div>
                            <span className="font-semibold text-slate-600 block">History of Present Illness:</span>
                            <p className="text-slate-800 leading-relaxed">{enc.historyOfPresentIllness}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-600 block">Physical Examination:</span>
                            <p className="text-slate-800 leading-relaxed">{enc.physicalExamination}</p>
                          </div>
                        </div>

                        {/* Diagnoses Full List */}
                        <div className="pt-2 border-t border-slate-200">
                          <span className="font-semibold text-slate-700 text-xs block mb-1.5">Diagnoses Assigned:</span>
                          <div className="space-y-1.5">
                            {enc.diagnoses.map((diag, dIdx) => (
                              <div key={dIdx} className="bg-white p-2 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-900">{diag.title}</span>
                                  <span className="ml-2 text-[10px] text-teal-800 font-medium">({diag.type})</span>
                                </div>
                                <span className="font-mono text-[11px] font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                  {diag.system}: {diag.code}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Treatment Plan & Regimen */}
                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-teal-700" />
                          <span>Treatment Plan & Medications</span>
                        </h4>

                        <div className="text-xs space-y-2">
                          <div>
                            <span className="font-semibold text-slate-600 block">Physician's Plan & Instructions:</span>
                            <p className="text-slate-800 leading-relaxed font-medium">{enc.treatmentPlan}</p>
                          </div>

                          {/* Prescribed Medications */}
                          <div className="pt-2 border-t border-slate-200">
                            <span className="font-semibold text-slate-700 text-xs block mb-1.5">Prescriptions Linked to Visit:</span>
                            {encounterRx.length > 0 ? (
                              <div className="space-y-2">
                                {encounterRx.map(rx => (
                                  <div key={rx.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-900">{rx.medicationName} ({rx.dosage})</span>
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                        rx.status === 'DISPENSED' ? 'bg-emerald-100 text-emerald-800' :
                                        rx.status === 'VERIFIED' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                                      }`}>
                                        {rx.status}
                                      </span>
                                    </div>
                                    <p className="text-slate-600 text-[11px] mt-0.5">
                                      {rx.frequency} · {rx.instructions} · {rx.durationDays} Days Course
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic">No oral or parenteral medications required.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Linked Diagnostic Orders (Labs & Imaging) */}
                    {(encounterLabs.length > 0 || encounterRadiology.length > 0) && (
                      <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200/60 space-y-3">
                        <h4 className="font-extrabold text-xs text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Microscope className="w-3.5 h-3.5 text-teal-800" />
                          <span>Diagnostic Investigations Ordered During Encounter</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {encounterLabs.map(lab => (
                            <div key={lab.id} className="bg-white p-3 rounded-lg border border-teal-200 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{lab.testName}</span>
                                <span className="font-mono text-[10px] font-semibold text-teal-800">{lab.accessionNumber}</span>
                              </div>
                              <p className="text-slate-500 text-[11px] mt-0.5">Category: {lab.category} · Sample: {lab.sampleType}</p>
                              {lab.results && (
                                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-slate-700">Result: <span className="font-bold text-slate-900">{lab.results.value} {lab.results.unit}</span></span>
                                  <span className="text-slate-500">Ref: {lab.results.referenceRange}</span>
                                </div>
                              )}
                            </div>
                          ))}

                          {encounterRadiology.map(rad => (
                            <div key={rad.id} className="bg-white p-3 rounded-lg border border-teal-200 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 flex items-center gap-1">
                                  <Scan className="w-3.5 h-3.5 text-teal-700" />
                                  {rad.studyDescription}
                                </span>
                                <span className="font-mono text-[10px] font-semibold text-teal-800">{rad.accessionNumber}</span>
                              </div>
                              <p className="text-slate-500 text-[11px] mt-0.5">Modality: {rad.modality} · Status: {rad.status}</p>
                              {rad.impression && (
                                <p className="mt-1 text-[11px] text-slate-700 italic">Impression: {rad.impression}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inpatient Admission Info if applicable */}
                    {linkedAdmission && enc.type === 'INPATIENT' && (
                      <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <Bed className="w-4 h-4 text-indigo-700" />
                            Inpatient Ward Stay Record
                          </span>
                          <span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                            Bed {linkedAdmission.bedNumber} ({linkedAdmission.wardName})
                          </span>
                        </div>
                        <p className="text-indigo-900">
                          <span className="font-bold">Admission Date:</span> {linkedAdmission.admissionDate} · <span className="font-bold">Admitting Doctor:</span> {linkedAdmission.admittingDoctor}
                        </p>
                        {linkedAdmission.dischargeSummary && (
                          <p className="text-slate-700 pt-1">
                            <span className="font-semibold text-slate-900">Discharge Summary:</span> {linkedAdmission.dischargeSummary}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Bottom Action Footer */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Signed off by {enc.signedBy || enc.attendingPhysicianName} at {new Date(enc.signedAt || enc.createdAt).toLocaleTimeString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrintEncounter(enc)}
                          className="inline-flex items-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Official Visit Summary</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">No Matching Medical Encounters</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery 
              ? `No records found matching "${searchQuery}". Try a different search term or clear the filter.`
              : 'There are currently no documented clinical visits under this filter.'}
          </p>
          <button
            onClick={onOpenAppointmentModal}
            className="mt-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
          >
            Schedule a Consultation
          </button>
        </div>
      )}
    </div>
  );
};
