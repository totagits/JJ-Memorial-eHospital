import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { History, FileText, Calendar, User, Stethoscope, ChevronRight, Download, Activity, CheckCircle2 } from 'lucide-react';

interface PatientMedicalHistoryProps {
  patientId: string;
}

interface VisitHistoryItem {
  id: string;
  date: string;
  type: 'Outpatient Consultation' | 'Emergency Triage' | 'Diagnostic Imaging' | 'Laboratory Investigation';
  department: string;
  clinician: string;
  diagnosis: string;
  treatmentNotes: string;
  prescriptions: string[];
  vitalsSnapshot: string;
}

const HISTORY_LOG: VisitHistoryItem[] = [
  {
    id: 'vis-1',
    date: 'November 03, 2026',
    type: 'Outpatient Consultation',
    department: 'Internal Medicine',
    clinician: 'Dr. Emmanuel Tamba, MD',
    diagnosis: 'Acute Uncomplicated Falciparum Malaria & Tension Headache',
    treatmentNotes: 'Patient presented with 2-day history of rigors, intermittent fever, and frontal headache. Blood smear confirmed Plasmodium falciparum. Prescribed Artemether/Lumefantrine and Paracetamol. Recommended strict hydration.',
    prescriptions: ['Artemether / Lumefantrine (Coartem) 20/120mg (24 tabs)', 'Paracetamol 500mg (20 tabs)'],
    vitalsSnapshot: 'BP 121/77 mmHg, Pulse 71 bpm, Temp 36.6C, SPO2 99%',
  },
  {
    id: 'vis-2',
    date: 'November 02, 2026',
    type: 'Diagnostic Imaging',
    department: 'Radiology',
    clinician: 'Dr. Sekou Massaquoi, MD',
    diagnosis: 'Normal Upright Chest Radiograph',
    treatmentNotes: 'PA chest view acquired for persistent cough clearance. Lungs clear, no active pulmonary infiltration or cardiac enlargement.',
    prescriptions: [],
    vitalsSnapshot: 'BP 126/81 mmHg, Pulse 76 bpm, Temp 36.8C',
  },
  {
    id: 'vis-3',
    date: 'August 18, 2026',
    type: 'Outpatient Consultation',
    department: 'Cardiovascular Wellness',
    clinician: 'Dr. Emmanuel Tamba, MD',
    diagnosis: 'Primary Stage 1 Essential Hypertension (Well Controlled)',
    treatmentNotes: 'Routine blood pressure monitoring visit. Advised low-sodium DASH diet. Home blood pressure log reviewed.',
    prescriptions: ['Amlodipine Besylate 5mg daily'],
    vitalsSnapshot: 'BP 128/82 mmHg, Pulse 72 bpm, Weight 69.1 kg',
  },
  {
    id: 'vis-4',
    date: 'February 10, 2026',
    type: 'Emergency Triage',
    department: 'Emergency & Triage',
    clinician: 'Dr. Fatumata Fofana, MD',
    diagnosis: 'Acute Gastrointestinal Enteritis with Mild Dehydration',
    treatmentNotes: 'Administered 1 Liter IV Ringer Lactate and oral rehydration salts. Symptoms resolved, discharged with dietary counseling.',
    prescriptions: ['Oral Rehydration Salts (ORS) 4 sachets', 'Zinc Sulfate 20mg'],
    vitalsSnapshot: 'BP 115/70 mmHg, Pulse 88 bpm, SPO2 98%',
  },
];

export const PatientMedicalHistory: React.FC<PatientMedicalHistoryProps> = ({ patientId }) => {
  const [selectedVisit, setSelectedVisit] = useState<VisitHistoryItem | null>(HISTORY_LOG[0]);
  const [filterYear, setFilterYear] = useState<string>('All');

  const filtered = filterYear === 'All'
    ? HISTORY_LOG
    : HISTORY_LOG.filter((h) => h.date.includes(filterYear));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            <span>Longitudinal Electronic Health Chart</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Patient Medical History
          </h2>
          <p className="text-xs text-slate-500">
            Chronological timeline of past hospital encounters, diagnoses, clinical treatments, and prescribed therapies.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-semibold">Filter Year:</span>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All Encounters</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Grid: Timeline List on Left, Selected Encounter Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Timeline (Col 5) */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Encounter Timeline ({filtered.length})
          </h4>

          <div className="space-y-3">
            {filtered.map((item) => {
              const isSelected = selectedVisit?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedVisit(item)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-500 ring-1 ring-teal-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-teal-700">{item.date}</span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {item.department}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm">
                    {item.diagnosis}
                  </h5>

                  <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                    <span>{item.clinician}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Encounter Detail Card (Col 7) */}
        <div className="lg:col-span-7">
          {selectedVisit ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
                    {selectedVisit.type}
                  </span>
                  <h3 className="text-xl font-extrabold text-hospital-navy mt-1.5">
                    {selectedVisit.diagnosis}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedVisit.date} &bull; {selectedVisit.department}
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Summary</span>
                </button>
              </div>

              {/* Attending Provider & Vitals snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Attending Physician
                  </span>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>{selectedVisit.clinician}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Encounter Vitals Snapshot
                  </span>
                  <div className="font-medium text-slate-800 flex items-center gap-1.5 font-mono text-[11px]">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>{selectedVisit.vitalsSnapshot}</span>
                  </div>
                </div>
              </div>

              {/* Treatment Notes */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Clinical Examination & Findings
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  {selectedVisit.treatmentNotes}
                </p>
              </div>

              {/* Prescriptions issued */}
              {selectedVisit.prescriptions.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Prescribed Medications & Dispense
                  </h5>
                  <div className="space-y-1.5">
                    {selectedVisit.prescriptions.map((rx, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="font-semibold">{rx}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed rounded-2xl text-slate-400 text-xs">
              Select an encounter from the timeline to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
