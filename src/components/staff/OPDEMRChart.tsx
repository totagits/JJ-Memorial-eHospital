import React, { useState } from 'react';
import {
  Stethoscope,
  ChevronDown,
  AlertTriangle,
  Thermometer,
  Activity,
  Heart,
  Wind,
  FlaskConical,
  ClipboardList,
  CheckCircle2,
  Pill,
  Save,
  Printer,
} from 'lucide-react';

// ─── Synthetic Patient & Clinical Data ──────────────────────────────────────

const PATIENT = {
  name: 'Blessing Kpadeh',
  mrn: 'JJM-2026-00104',
  dob: '1992-06-14',
  age: 34,
  gender: 'F' as const,
  bloodGroup: 'O+',
  allergies: [{ substance: 'Penicillin', severity: 'severe' as const }],
};

const TRIAGE = {
  timestamp: '09:12',
  nurse: 'Samuel Flomo, RN',
  urgency: 'YELLOW_VERY_URGENT' as const,
  vitals: {
    temp: 38.6,
    bp: '118/76',
    pulse: 98,
    spo2: 98,
  },
  alert: 'High Fever (38.6°C) — Stat Malaria evaluation ordered',
};

const LAB_TESTS = [
  'Malaria RDT & Thick Smear',
  'Full Blood Count (FBC)',
  'Liver Function Tests (LFT)',
  'Renal Function Tests (RFT)',
  'Urinalysis',
  'Blood Culture & Sensitivity',
  'CRP / ESR',
];

const ICD11_OPTIONS = [
  { code: '1F40.0', label: '1F40.0 — P. falciparum Malaria', title: 'Plasmodium falciparum malaria without complications' },
  { code: '1F40.1', label: '1F40.1 — P. vivax Malaria', title: 'Plasmodium vivax malaria' },
  { code: 'BA80', label: 'BA80 — Essential (Primary) Hypertension', title: 'Essential (primary) hypertension' },
  { code: 'MG22.2', label: 'MG22.2 — Acute Febrile Illness, NOS', title: 'Acute febrile illness, unspecified' },
  { code: 'CA22.0', label: 'CA22.0 — Type 2 Diabetes Mellitus', title: 'Type 2 diabetes mellitus' },
];

const MEDICATIONS = [
  'Artemether/Lumefantrine 80/480mg tab — 4 tabs BD × 3 days',
  'Paracetamol 1g PO TDS prn fever',
  'Oral Rehydration Salts (ORS) sachets',
  'Ferrous Sulfate 200mg OD × 30 days',
  'Metronidazole 400mg TDS × 5 days',
];

const URGENCY_COLORS: Record<string, string> = {
  YELLOW_VERY_URGENT: 'bg-amber-100 text-amber-700 border border-amber-300',
  RED_IMMEDIATE: 'bg-rose-100 text-rose-700 border border-rose-300',
  GREEN_ROUTINE: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
};

// ─── Component ───────────────────────────────────────────────────────────────

export const OPDEMRChart: React.FC = () => {
  // Form state
  const [chiefComplaint, setChiefComplaint] = useState(
    'Acute fever, severe headache, and chills for 3 days'
  );
  const [hpi, setHpi] = useState(
    'Patient states fever began on Sunday evening with rigors and profuse sweating. Mild nausea, no vomiting. Denies cough or dysuria.'
  );
  const [examFindings, setExamFindings] = useState(
    'Temp 38.6°C, alert, moderate pallor, no scleral icterus. Chest clear bilaterally. Abdomen soft, non-tender, no organomegaly.'
  );
  const [selectedDiagnosisCode, setSelectedDiagnosisCode] = useState('1F40.0');
  const [selectedLabTest, setSelectedLabTest] = useState(LAB_TESTS[0]);
  const [selectedMedication, setSelectedMedication] = useState(MEDICATIONS[0]);
  const [labOrderSubmitted, setLabOrderSubmitted] = useState(false);
  const [rxSubmitted, setRxSubmitted] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [activePatientDropdown, setActivePatientDropdown] = useState(false);

  const diagnosis = ICD11_OPTIONS.find((d) => d.code === selectedDiagnosisCode)!;

  const handleLabOrder = () => {
    setLabOrderSubmitted(true);
    setTimeout(() => setLabOrderSubmitted(false), 3000);
  };

  const handleRxSubmit = () => {
    setRxSubmitted(true);
    setTimeout(() => setRxSubmitted(false), 3000);
  };

  const handleSaveNote = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Content Header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-tight">
              Outpatient Consultation &amp; EMR Chart
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Longitudinal History, Vitals Trends, ICD-11 Coding &amp; Provider Sign-Off
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1 flex-shrink-0">
          <span className="text-[11px] text-slate-400">
            Attending: <span className="font-semibold text-slate-600">Dr. Evelyn Sirleaf-Gbotoe</span>
          </span>
          <div className="relative">
            <button
              onClick={() => setActivePatientDropdown((p) => !p)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold border border-slate-700 hover:bg-slate-800 transition"
            >
              <span>
                Active Patient: <span className="text-teal-300">{PATIENT.name}</span> — {PATIENT.mrn}{' '}
                <span className="text-slate-400">(DOB: {PATIENT.dob})</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activePatientDropdown && (
              <div className="absolute right-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-xl w-72 py-2">
                <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Active OPD Queue
                </p>
                {[
                  { name: 'Blessing Kpadeh', mrn: 'JJM-2026-00104', dob: '1992-06-14' },
                  { name: 'Emmanuel Kollie', mrn: 'JJM-2026-00098', dob: '1985-03-22' },
                  { name: 'Fatumata Kamara', mrn: 'JJM-2026-00112', dob: '2001-11-05' },
                ].map((p) => (
                  <button
                    key={p.mrn}
                    onClick={() => setActivePatientDropdown(false)}
                    className="w-full text-left px-4 py-2 hover:bg-teal-50 text-xs"
                  >
                    <span className="font-semibold text-slate-800">{p.name}</span>{' '}
                    <span className="text-slate-500">— {p.mrn} (DOB: {p.dob})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Patient Identity Banner ───────────────────────────────────────── */}
      <div className="bg-[#0d1117] px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="font-bold text-teal-400 text-sm">{PATIENT.name}</span>
        <span className="text-slate-400">PRN: <span className="text-slate-200 font-mono">{PATIENT.mrn}</span></span>
        <span className="text-slate-400">Age: <span className="text-slate-200">{PATIENT.age} ({PATIENT.gender})</span></span>
        <span className="text-slate-400">Blood: <span className="text-slate-200 font-semibold">{PATIENT.bloodGroup}</span></span>
        <span className="flex items-center gap-1 text-rose-400 font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          Allergies: {PATIENT.allergies.map((a) => `${a.substance} (${a.severity})`).join(', ')}
        </span>
      </div>

      {/* ── Two-Column Grid ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* ── LEFT: Vitals & Lab Order ──────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Vitals Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Latest Triage Observations &amp; Vitals</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${URGENCY_COLORS[TRIAGE.urgency]}`}>
                  {TRIAGE.urgency.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="px-5 py-4 space-y-4">
                <p className="text-xs text-slate-500">
                  Recorded: <span className="font-semibold text-slate-700">{TRIAGE.timestamp}</span> by{' '}
                  <span className="font-semibold text-slate-700">{TRIAGE.nurse}</span>
                </p>

                {/* Vitals 2×2 Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <VitalTile icon={<Thermometer className="w-4 h-4 text-orange-500" />} label="Temperature" value="38.6°C" alert />
                  <VitalTile icon={<Heart className="w-4 h-4 text-rose-500" />} label="BP" value="118/76 mmHg" />
                  <VitalTile icon={<Activity className="w-4 h-4 text-purple-500" />} label="Pulse" value="98 bpm" />
                  <VitalTile icon={<Wind className="w-4 h-4 text-teal-500" />} label="SpO₂" value="98%" />
                </div>

                {/* Alert box */}
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 font-semibold">Alert: {TRIAGE.alert}</p>
                </div>

                {/* Lab Order */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-500" />
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Order Laboratory Investigation</h4>
                  </div>
                  <select
                    value={selectedLabTest}
                    onChange={(e) => setSelectedLabTest(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    {LAB_TESTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleLabOrder}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                      labOrderSubmitted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    {labOrderSubmitted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Lab Order Sent to LIS
                      </>
                    ) : (
                      <>
                        <FlaskConical className="w-4 h-4" /> + Submit Lab Order to LIS
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Prescription Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-sm">Prescribe Outpatient Medication</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                <select
                  value={selectedMedication}
                  onChange={(e) => setSelectedMedication(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  {MEDICATIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Dosage / Route
                    </label>
                    <input
                      type="text"
                      defaultValue="As directed"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      defaultValue="3 days"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>
                <button
                  onClick={handleRxSubmit}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                    rxSubmitted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {rxSubmitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Prescription Sent to Pharmacy
                    </>
                  ) : (
                    <>
                      <Pill className="w-4 h-4" /> + Submit Rx to Pharmacy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Clinical Assessment ────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-sm">Clinical Assessment &amp; Notes</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                ICD-11 WHO Terminology Standard
              </span>
            </div>

            <div className="px-5 py-5 space-y-5 flex-1 overflow-y-auto">
              {/* Chief Complaint */}
              <FormGroup label="Chief Complaint *">
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </FormGroup>

              {/* HPI */}
              <FormGroup label="History of Present Illness (HPI)">
                <textarea
                  rows={4}
                  value={hpi}
                  onChange={(e) => setHpi(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
              </FormGroup>

              {/* Physical Examination */}
              <FormGroup label="Physical Examination Findings">
                <textarea
                  rows={4}
                  value={examFindings}
                  onChange={(e) => setExamFindings(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
              </FormGroup>

              {/* Diagnosis */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Primary Diagnosis (ICD-11 / ICD-10)
                  </label>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Diagnosis Title
                  </label>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedDiagnosisCode}
                    onChange={(e) => setSelectedDiagnosisCode(e.target.value)}
                    className="flex-shrink-0 w-56 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    {ICD11_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>{opt.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    readOnly
                    value={diagnosis.title}
                    className="flex-1 min-w-0 px-3 py-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-medium focus:outline-none cursor-default truncate"
                  />
                </div>
              </div>

              {/* Plan / Additional Notes */}
              <FormGroup label="Clinical Plan & Provider Notes">
                <textarea
                  rows={3}
                  defaultValue="Commence Artemether/Lumefantrine stat. Repeat malaria smear if RDT equivocal. Review in 48 hours or earlier if condition worsens. Patient counselled on hydration and medication compliance."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
              </FormGroup>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-3">
                <button
                  onClick={handleSaveNote}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                    noteSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {noteSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Note Signed &amp; Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Sign &amp; Save Clinical Note
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                >
                  <Printer className="w-4 h-4" /> Print Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

interface VitalTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  alert?: boolean;
}

const VitalTile: React.FC<VitalTileProps> = ({ icon, label, value, alert }) => (
  <div className={`rounded-xl border px-4 py-3 flex flex-col gap-1 ${alert ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
    </div>
    <span className={`text-lg font-black leading-tight ${alert ? 'text-orange-600' : 'text-slate-800'}`}>{value}</span>
  </div>
);

interface FormGroupProps {
  label: string;
  children: React.ReactNode;
}

const FormGroup: React.FC<FormGroupProps> = ({ label, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    {children}
  </div>
);
