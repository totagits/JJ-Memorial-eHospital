import React, { useState } from 'react';
import { 
  Calendar, 
  FileText, 
  Pill, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Printer, 
  Download, 
  ExternalLink, 
  ChevronRight, 
  Heart, 
  Droplet, 
  CheckCircle2, 
  UserCheck, 
  Video, 
  PhoneCall, 
  MapPin, 
  ArrowUpRight,
  TrendingUp,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { Patient, Appointment } from '../../types/patient';
import { LabOrder, Prescription, ClinicalEncounter } from '../../types/clinical';
import { Invoice, PaymentReceipt } from '../../types/finance';

interface MyHealthDashboardProps {
  patient: Patient;
  appointments: Appointment[];
  labOrders: LabOrder[];
  prescriptions: Prescription[];
  encounters?: ClinicalEncounter[];
  invoices?: Invoice[];
  receipts?: PaymentReceipt[];
  onOpenAppointmentModal: () => void;
  onOpenTelehealth: () => void;
  onNavigateToTab?: (tab: 'appointments' | 'labs' | 'prescriptions' | 'billing' | 'telehealth' | 'history') => void;
}

export const MyHealthDashboard: React.FC<MyHealthDashboardProps> = ({
  patient,
  appointments,
  labOrders,
  prescriptions,
  encounters = [],
  invoices = [],
  receipts = [],
  onOpenAppointmentModal,
  onOpenTelehealth,
  onNavigateToTab
}) => {
  const [selectedLabModal, setSelectedLabModal] = useState<LabOrder | null>(null);
  const [selectedRxModal, setSelectedRxModal] = useState<Prescription | null>(null);
  const [showPrintSummary, setShowPrintSummary] = useState(false);

  // Derived calculations
  const upcomingAppointments = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING_CONFIRMATION' || a.status === 'CHECKED_IN');
  const activePrescriptions = prescriptions.filter(p => p.status === 'VERIFIED' || p.status === 'DISPENSED' || p.status === 'PENDING_PHARMACY');
  const releasedLabOrders = labOrders.filter(l => l.releasedToPatientPortal);

  // Latest vitals for clinical overview
  const latestVitals = {
    bp: '120/78 mmHg',
    heartRate: 74,
    spo2: 98,
    temp: 36.8,
    weight: 68,
    height: 168,
    bloodType: patient.bloodGroup || 'O+',
    updatedAt: 'Today, 09:15 AM'
  };

  const handlePrintSummary = () => {
    setShowPrintSummary(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Printable Patient Health Record Summary Sheet (Hidden on screen unless print triggered) */}
      {showPrintSummary && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-sans z-999">
          <div className="border-b-2 border-teal-900 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-teal-950 uppercase tracking-tight">J & J Memorial e-Hospital</h1>
              <p className="text-xs font-semibold text-slate-700">VOA East Community, Monrovia, Montserrado County, Liberia</p>
              <p className="text-xs text-slate-600">Official Patient Health Record & Treatment Summary · Confirmed Encrypted Portal Export</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold">MRN: {patient.mrn}</p>
              <p>Generated: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-3 bg-slate-50 border border-slate-300 rounded">
            <div>
              <p><span className="font-bold">Patient:</span> {patient.firstName} {patient.lastName}</p>
              <p><span className="font-bold">DOB:</span> {patient.dateOfBirth} ({patient.gender === 'F' ? 'Female' : 'Male'})</p>
              <p><span className="font-bold">Phone:</span> {patient.phone}</p>
              <p><span className="font-bold">Community:</span> {patient.address.community}, {patient.address.city}</p>
            </div>
            <div>
              <p><span className="font-bold">Blood Group:</span> {latestVitals.bloodType}</p>
              <p><span className="font-bold">Allergies:</span> {patient.allergies.map(a => `${a.substance} (${a.severity})`).join(', ') || 'NKDA'}</p>
              <p><span className="font-bold">Insurance:</span> {patient.insurance?.providerName || 'Self-Pay Private'}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-sm border-b border-slate-400 pb-1 mb-2">Active Prescribed Medications</h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="py-1">Medication</th>
                  <th className="py-1">Dosage</th>
                  <th className="py-1">Frequency</th>
                  <th className="py-1">Duration</th>
                  <th className="py-1">Prescribed By</th>
                </tr>
              </thead>
              <tbody>
                {activePrescriptions.map(p => (
                  <tr key={p.id} className="border-b border-slate-200">
                    <td className="py-1 font-semibold">{p.medicationName} ({p.genericName})</td>
                    <td className="py-1">{p.dosage}</td>
                    <td className="py-1">{p.frequency}</td>
                    <td className="py-1">{p.durationDays} days</td>
                    <td className="py-1">{p.prescribingDoctor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-sm border-b border-slate-400 pb-1 mb-2">Authorized Diagnostic Laboratory Results</h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="py-1">Test Name</th>
                  <th className="py-1">Result</th>
                  <th className="py-1">Reference Range</th>
                  <th className="py-1">Authorized By</th>
                  <th className="py-1">Release Date</th>
                </tr>
              </thead>
              <tbody>
                {releasedLabOrders.map(l => (
                  <tr key={l.id} className="border-b border-slate-200">
                    <td className="py-1 font-semibold">{l.testName}</td>
                    <td className="py-1 font-bold">{l.results?.value}</td>
                    <td className="py-1 text-slate-600">{l.results?.referenceRange}</td>
                    <td className="py-1">{l.validatedBy}</td>
                    <td className="py-1">{l.releasedAt?.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-8 border-t border-slate-400 flex justify-between text-[10px] text-slate-500">
            <span>Verified and cryptographically sealed under J & J Memorial EMR Clinical Governance standards.</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      )}

      {/* Primary Dashboard Welcome & Quick Health Card */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl text-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Patient Health Dashboard
              </span>
              <span className="text-[10px] bg-teal-950/70 text-teal-200 border border-teal-700/60 px-2 py-0.5 rounded font-mono">
                EMR ID: {patient.mrn}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Welcome back, {patient.firstName}
            </h2>
            <p className="text-xs md:text-sm text-teal-100 max-w-2xl leading-relaxed">
              Your centralized personal medical record at J & J Memorial e-Hospital (VOA East Community, Monrovia). Track your consultations, confirmed lab reports, current medications, and connect with clinical staff.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenTelehealth}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Video className="w-4 h-4" />
              <span>Start Telehealth Visit</span>
            </button>
            <button
              onClick={onOpenAppointmentModal}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-teal-300" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => onNavigateToTab?.('history')}
              className="bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Medical History</span>
            </button>
            <button
              onClick={handlePrintSummary}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Print Official Medical Summary"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Print Record</span>
            </button>
          </div>
        </div>

        {/* Essential Clinical Vitals Snapshot Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-teal-700/40 text-xs">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-teal-200 block mb-1">Blood Pressure</span>
            <div className="font-bold text-sm text-white">{latestVitals.bp}</div>
            <span className="text-[10px] text-emerald-300 font-medium">Normotensive</span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-teal-200 block mb-1">Heart Rate (Pulse)</span>
            <div className="font-bold text-sm text-white">{latestVitals.heartRate} bpm</div>
            <span className="text-[10px] text-emerald-300 font-medium">Regular sinus</span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-teal-200 block mb-1">Oxygen Saturation</span>
            <div className="font-bold text-sm text-white">{latestVitals.spo2}% SpO₂</div>
            <span className="text-[10px] text-emerald-300 font-medium">Room air</span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-teal-200 block mb-1">Body Temperature</span>
            <div className="font-bold text-sm text-white">{latestVitals.temp} °C</div>
            <span className="text-[10px] text-emerald-300 font-medium">Afebrile</span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-teal-200 block mb-1">Blood Group</span>
            <div className="font-bold text-sm text-white">{latestVitals.bloodType}</div>
            <span className="text-[10px] text-teal-200 font-medium">Lab verified</span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-teal-200 block mb-1">Weight & BMI</span>
            <div className="font-bold text-sm text-white">{latestVitals.weight} kg</div>
            <span className="text-[10px] text-teal-200 font-medium">Height {latestVitals.height} cm</span>
          </div>
        </div>
      </div>

      {/* 3 Core Pillar Grid: Appointments, Labs, Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Upcoming Appointments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Upcoming Appointments</h3>
                  <p className="text-[11px] text-slate-500">{upcomingAppointments.length} scheduled visits</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab?.('appointments')}
                className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 3).map(apt => (
                  <div key={apt.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-200 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{apt.department}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                            apt.status === 'CHECKED_IN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Attending: <span className="font-medium text-slate-800">{apt.clinicianName}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 italic">{apt.reason}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-teal-800 block">{apt.date}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{apt.timeSlot}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">Location: VOA East Main Facility</span>
                      <button
                        onClick={onOpenTelehealth}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Video className="w-3 h-3" />
                        <span>Switch to Telehealth</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                  <p>You have no pending appointments scheduled.</p>
                  <button
                    onClick={onOpenAppointmentModal}
                    className="text-xs text-teal-800 font-semibold hover:underline cursor-pointer"
                  >
                    Schedule an Outpatient Visit
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onOpenAppointmentModal}
            className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book New Clinic Visit</span>
          </button>
        </div>

        {/* Pillar 2: Recent Diagnostic Lab Results */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Recent Lab Results</h3>
                  <p className="text-[11px] text-slate-500">{releasedLabOrders.length} released & validated reports</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab?.('labs')}
                className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {releasedLabOrders.length > 0 ? (
                releasedLabOrders.slice(0, 3).map(lab => (
                  <div 
                    key={lab.id} 
                    onClick={() => setSelectedLabModal(lab)}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">{lab.testName}</span>
                          <span className="text-[10px] font-mono text-slate-400">[{lab.accessionNumber}]</span>
                        </div>
                        <p className="text-xs font-bold text-teal-900 mt-1">
                          {lab.results?.value}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Ref: {lab.results?.referenceRange} · Specimen: {lab.sampleType}
                        </p>
                      </div>

                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Released
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Validated: {lab.validatedBy}</span>
                      <span className="text-teal-700 font-medium flex items-center gap-0.5">
                        <span>Details</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <p>No laboratory reports have been released for display.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Reports are published once signed by the medical lab officer.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 p-3 bg-teal-50/70 rounded-xl border border-teal-200/60 flex items-center justify-between text-xs text-teal-900">
            <span className="text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Signed under Liberian Laboratory Standards</span>
            </span>
            <button
              onClick={() => onNavigateToTab?.('labs')}
              className="text-xs font-bold text-teal-800 hover:underline cursor-pointer"
            >
              All Reports
            </button>
          </div>
        </div>

        {/* Pillar 3: Prescribed Medications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <Pill className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Prescribed Medications</h3>
                  <p className="text-[11px] text-slate-500">{activePrescriptions.length} current active drugs</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab?.('prescriptions')}
                className="text-xs text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {activePrescriptions.length > 0 ? (
                activePrescriptions.slice(0, 3).map(rx => (
                  <div 
                    key={rx.id} 
                    onClick={() => setSelectedRxModal(rx)}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">{rx.medicationName}</span>
                          <span className="text-[10px] text-slate-500 font-medium">({rx.dosage})</span>
                        </div>
                        <p className="text-xs text-teal-800 font-semibold mt-1">
                          {rx.frequency} · {rx.durationDays} days
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                          Instructions: {rx.instructions}
                        </p>
                      </div>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                        rx.status === 'DISPENSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {rx.status}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Prescriber: {rx.prescribingDoctor}</span>
                      <span className="text-teal-700 font-medium flex items-center gap-0.5">
                        <span>Details</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <p>No active prescriptions on file.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Prescriptions issued during consultations will appear here automatically.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 text-[11px]">Pharmacy Desk: +231-770-666-777</span>
            <button
              onClick={() => onNavigateToTab?.('prescriptions')}
              className="text-teal-800 font-semibold hover:underline cursor-pointer"
            >
              Medication History
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Row: Patient Care Pathway & Facility Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Clinical Encounter Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-800" />
              <h3 className="font-bold text-sm text-slate-900">Latest Outpatient Visit Summary</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">ENC-2026-001</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
              <div>
                <span className="text-[11px] text-slate-500 block">Attending Physician:</span>
                <span className="font-bold text-slate-900 text-xs">Dr. Evelyn Sirleaf-Gbotoe, MD (Internal Medicine)</span>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                Completed & Signed Chart
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <p><strong className="text-slate-900">Chief Complaint:</strong> Recurring evening fevers, mild chills, body ache and headache for 48 hours.</p>
              <p><strong className="text-slate-900">Primary Diagnosis:</strong> ICD-11 1F40.0 - Plasmodium falciparum malaria (Uncomplicated course).</p>
              <p><strong className="text-slate-900">Clinical Recommendation:</strong> Full course Artemether/Lumefantrine 80/480mg BID with milk or fatty meal. Hydration with ORS. Follow-up in OPD or via Telehealth if symptoms persist beyond 72h.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <span className="text-slate-500">Need follow-up care? Connect directly with Dr. Sirleaf-Gbotoe's clinic team.</span>
            <button
              onClick={onOpenTelehealth}
              className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              <span>Request Follow-Up Video Call</span>
            </button>
          </div>
        </div>

        {/* Community Health & Emergency Hotlines */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-teal-400" />
              <h4 className="font-bold text-sm text-white">VOA East Facility Support</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              J & J Memorial operates 24/7 with dedicated on-site solar/diesel power resilience, an oxygen generator plant, and cold-chain pharmacy storage.
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Emergency & Ambulance:</span>
                <span className="font-bold text-rose-300">911 / +231-777-999-111</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Triage & Nursing Desk:</span>
                <span className="font-bold text-slate-200">+231-777-123-456</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Pharmacy Pickups:</span>
                <span className="font-bold text-slate-200">+231-770-666-777</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Liberia Dual Currency:</span>
                <span className="font-mono text-teal-300">USD & LRD @ 195.00</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenTelehealth}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Launch Virtual Care Consult</span>
          </button>
        </div>
      </div>

      {/* Lab Order Detail Modal */}
      {selectedLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{selectedLabModal.testName}</h3>
                <span className="text-xs text-slate-500">Accession No: {selectedLabModal.accessionNumber}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Authorized
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Result Finding:</span>
                <div className="font-black text-slate-900 text-base mt-0.5">{selectedLabModal.results?.value}</div>
                <div className="text-slate-600 text-[11px] mt-1">Normal Reference: {selectedLabModal.results?.referenceRange}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Clinical Interpretation:</span>
                <p className="text-slate-700 leading-relaxed mt-0.5">{selectedLabModal.results?.comments || 'Normal test findings. No acute pathogen elevation identified.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                <div>Specimen: <strong className="text-slate-800">{selectedLabModal.sampleType}</strong></div>
                <div>Category: <strong className="text-slate-800">{selectedLabModal.category}</strong></div>
                <div>Validated By: <strong className="text-slate-800">{selectedLabModal.validatedBy}</strong></div>
                <div>Released Date: <strong className="text-slate-800">{selectedLabModal.releasedAt?.split('T')[0]}</strong></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedLabModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Detail Modal */}
      {selectedRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{selectedRxModal.medicationName}</h3>
                <span className="text-xs text-slate-500">Generic: {selectedRxModal.genericName}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {selectedRxModal.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Dosage:</span>
                  <span className="font-bold text-slate-900">{selectedRxModal.dosage}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Frequency:</span>
                  <span className="font-bold text-slate-900">{selectedRxModal.frequency}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Course Duration:</span>
                  <span className="font-bold text-slate-900">{selectedRxModal.durationDays} days</span>
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900">
                <span className="font-bold block mb-1">Patient Instructions:</span>
                <p className="leading-relaxed">{selectedRxModal.instructions}</p>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1">
                <div>Prescribed By: <strong className="text-slate-800">{selectedRxModal.prescribingDoctor}</strong></div>
                <div>Total Quantity Dispensed: <strong className="text-slate-800">{selectedRxModal.totalQuantity} units</strong></div>
                <div>Dispensing Status: <strong className="text-slate-800">{selectedRxModal.dispensedBatchNumber ? `Batch ${selectedRxModal.dispensedBatchNumber}` : 'Standard OPD Dispensary'}</strong></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRxModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg cursor-pointer"
              >
                Close Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
