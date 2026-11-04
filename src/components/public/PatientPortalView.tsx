import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Pill, 
  Receipt, 
  ShieldCheck, 
  User, 
  Clock, 
  AlertTriangle, 
  Download, 
  Printer, 
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Video,
  Scan,
  Eye,
  History,
  HeartPulse,
  Scale,
  FileSignature,
  HeartHandshake,
  FolderDown,
  CalendarDays
} from 'lucide-react';
import { getDatabaseState } from '../../services/storageService';
import { Patient } from '../../types/patient';
import { TelehealthView } from '../patient/TelehealthView';
import { MyHealthDashboard } from '../patient/MyHealthDashboard';
import { PatientMedicalHistory } from '../patient/PatientMedicalHistory';
import { PatientNotificationBell } from '../patient/PatientNotificationBell';
import { DigitalConsentView } from '../patient/DigitalConsentView';
import { PatientVitalsTracker } from '../patient/PatientVitalsTracker';
import { PatientFeedbackSection } from '../patient/PatientFeedbackSection';
import { DownloadableFormsLibrary } from '../patient/DownloadableFormsLibrary';
import { CareCalendarView } from '../patient/CareCalendarView';

interface PatientPortalViewProps {
  onOpenAppointmentModal: () => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({ onOpenAppointmentModal }) => {
  const db = getDatabaseState();
  // Default to sample patient Blessing Kpadeh (PAT-001) or allow switching
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PAT-001');
  const [activeTab, setActiveTab] = useState<'my_health' | 'history' | 'overview' | 'appointments' | 'labs' | 'prescriptions' | 'billing' | 'telehealth' | 'vitals' | 'calendar' | 'consent' | 'feedback' | 'forms'>('my_health');

  const currentPatient = db.patients.find(p => p.id === selectedPatientId) || db.patients[0];

  const patientAppointments = db.appointments.filter(a => a.patientId === currentPatient.id || a.patientName === `${currentPatient.firstName} ${currentPatient.lastName}`);
  // Patient clinical encounters, vitals, admissions, and diagnostic orders
  const patientEncounters = db.encounters.filter(e => e.patientId === currentPatient.id || e.patientMrn === currentPatient.mrn);
  const patientVitals = db.vitals.filter(v => v.patientId === currentPatient.id);
  const patientAdmissions = (db.admissions || []).filter(a => a.patientId === currentPatient.id || a.patientMrn === currentPatient.mrn);
  // Only show lab reports that have been formally released by the laboratory/clinician!
  const patientLabOrders = db.labOrders.filter(l => l.patientId === currentPatient.id && l.releasedToPatientPortal);
  const patientRadiologyOrders = (db.radiologyStudies || []).filter(r => r.patientId === currentPatient.id && r.releasedToPatientPortal);
  const patientPrescriptions = db.prescriptions.filter(p => p.patientId === currentPatient.id);
  const patientInvoices = db.invoices.filter(i => i.patientId === currentPatient.id);
  const patientReceipts = db.receipts.filter(r => r.patientId === currentPatient.id);
  const patientTelehealthSessions = (db.telehealthSessions || []).filter(s => s.patientId === currentPatient.id || s.patientMrn === currentPatient.mrn);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Portal Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                {currentPatient.firstName[0]}{currentPatient.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-extrabold text-slate-900">
                    {currentPatient.firstName} {currentPatient.middleName || ''} {currentPatient.lastName}
                  </h1>
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    MRN: {currentPatient.mrn}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                  <span>DOB: {currentPatient.dateOfBirth} ({new Date().getFullYear() - new Date(currentPatient.dateOfBirth).getFullYear()} yrs)</span>
                  <span>·</span>
                  <span>Gender: {currentPatient.gender === 'F' ? 'Female' : 'Male'}</span>
                  <span>·</span>
                  <span>Phone: {currentPatient.phone}</span>
                  <span>·</span>
                  <span>Community: {currentPatient.address.community}, {currentPatient.address.city}</span>
                </div>
              </div>
            </div>

            {/* Patient Selector Switcher and Notifications Bell */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-500">Patient:</label>
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 font-medium text-slate-800 focus:outline-hidden"
              >
                {db.patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.mrn})
                  </option>
                ))}
              </select>

              {/* Patient Notification Bell with badge */}
              <PatientNotificationBell
                notifications={db.patientNotifications || []}
                patientId={currentPatient.id}
                onNavigateToTab={tab => setActiveTab(tab as any)}
              />

              <button
                onClick={onOpenAppointmentModal}
                className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Book Visit
              </button>
            </div>
          </div>

          {/* Quick Health Flags Banner */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Documented Allergies:</span>
              {currentPatient.allergies.length > 0 ? (
                currentPatient.allergies.map((alg, idx) => (
                  <span key={idx} className="bg-rose-50 text-rose-800 border border-rose-200 font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    {alg.substance} ({alg.severity})
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic">No known drug allergies (NKDA)</span>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-500 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Identity Verified via Liberian National Registry</span>
              {currentPatient.insurance && (
                <span className="font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  Payer: {currentPatient.insurance.providerName} ({currentPatient.insurance.coveragePercent}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 space-x-6 text-sm font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('my_health')}
            className={`pb-3 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'my_health'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <span>My Health Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-teal-700" />
            <span>Medical History & Visits ({patientEncounters.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'appointments'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Appointments ({patientAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`pb-3 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'labs'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Diagnostic Reports ({patientLabOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-3 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'prescriptions'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Prescriptions ({patientPrescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-3 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'billing'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Invoices & Receipts ({patientInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('telehealth')}
            className={`pb-3 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'telehealth'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4 text-teal-600" />
            <span>Virtual Care & Telehealth ({patientTelehealthSessions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`pb-3 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'vitals'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-teal-600" />
            <span>Vitals Tracker</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-3 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-teal-600" />
            <span>Care Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`pb-3 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'consent'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileSignature className="w-4 h-4 text-teal-600" />
            <span>Digital Consent ({db.digitalConsents?.filter(c => c.patientId === currentPatient.id).length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`pb-3 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'feedback'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-teal-600" />
            <span>Patient Feedback</span>
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`pb-3 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'forms'
                ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderDown className="w-4 h-4 text-teal-600" />
            <span>Forms Library</span>
          </button>
        </div>

        {/* Tab 1: Dedicated Secure 'My Health' Dashboard */}
        {activeTab === 'my_health' && (
          <MyHealthDashboard
            patient={currentPatient}
            appointments={patientAppointments}
            labOrders={patientLabOrders}
            prescriptions={patientPrescriptions}
            encounters={patientEncounters}
            invoices={patientInvoices}
            receipts={patientReceipts}
            onOpenAppointmentModal={onOpenAppointmentModal}
            onOpenTelehealth={() => setActiveTab('telehealth')}
            onNavigateToTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* Tab 1B: Longitudinal Patient Medical History & Encounters */}
        {activeTab === 'history' && (
          <PatientMedicalHistory
            patient={currentPatient}
            encounters={patientEncounters}
            vitals={patientVitals}
            labOrders={patientLabOrders}
            prescriptions={patientPrescriptions}
            admissions={patientAdmissions}
            radiologyStudies={patientRadiologyOrders}
            telehealthSessions={patientTelehealthSessions}
            onOpenAppointmentModal={onOpenAppointmentModal}
          />
        )}

        {/* Tab 2: Appointments */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-base">Your Scheduled Appointments</h3>
              <button
                onClick={onOpenAppointmentModal}
                className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                + Book New Appointment
              </button>
            </div>

            {patientAppointments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {patientAppointments.map(apt => (
                  <div key={apt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-sm">{apt.department}</span>
                        <span className="font-mono text-xs text-slate-500">[{apt.id}]</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          apt.status === 'CHECKED_IN' ? 'bg-amber-100 text-amber-800' :
                          apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Physician: <span className="font-medium text-slate-900">{apt.clinicianName}</span>
                      </p>
                      <p className="text-xs text-slate-500">Reason: {apt.reason}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-teal-800">{apt.date}</div>
                      <div className="text-xs text-slate-500">{apt.timeSlot}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-8 text-center">No upcoming appointments recorded.</p>
            )}
          </div>
        )}

        {/* Tab 3: Lab Reports */}
        {activeTab === 'labs' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-2">Released Diagnostic Laboratory Results</h3>
            <p className="text-xs text-slate-500 mb-6">
              Only reports reviewed and authorized by an attending medical laboratory scientist or physician are published here.
            </p>

            {patientLabOrders.length > 0 ? (
              <div className="space-y-4">
                {patientLabOrders.map(lab => (
                  <div key={lab.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{lab.testName}</h4>
                          <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {lab.accessionNumber}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">Category: {lab.category} · Specimen: {lab.sampleType}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                        Released: {lab.releasedAt?.split('T')[0]}
                      </span>
                    </div>

                    <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                        <span className="text-slate-500 block text-[11px] font-medium mb-1">Result Observation:</span>
                        <p className="text-slate-900 font-bold text-sm">{lab.results?.value}</p>
                        <p className="text-slate-500 text-[11px] mt-1">Normal Reference Range: {lab.results?.referenceRange}</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                        <span className="text-slate-500 block text-[11px] font-medium mb-1">Clinical Interpretation:</span>
                        <p className="text-slate-700 leading-relaxed">{lab.results?.comments || 'Normal findings. No immediate critical action required.'}</p>
                        <p className="text-slate-500 text-[11px] mt-1 font-medium">Authorized by: {lab.validatedBy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No pathology lab reports currently released for this account.
              </div>
            )}

            {/* Released Medical Imaging & X-Rays */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Scan className="w-5 h-5 text-teal-700" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  Authorized Diagnostic Radiology & X-Ray Reports ({patientRadiologyOrders.length})
                </h4>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Hospital imaging scans verified and released by Dr. Varney Kromah (Radiology & Diagnostic Imaging).
              </p>

              {patientRadiologyOrders.length > 0 ? (
                <div className="space-y-4">
                  {patientRadiologyOrders.map(rad => (
                    <div key={rad.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-900 text-sm">{rad.studyDescription}</h5>
                            <span className="text-[11px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                              {rad.accessionNumber}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Modality: {rad.modality} · Region: {rad.bodyPart} · Radiologist: {rad.radiologistName || 'Lead Radiologist'}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                          Verified: {rad.releasedAt?.split('T')[0]}
                        </span>
                      </div>

                      {/* Attached Image Preview */}
                      {rad.images?.[0] && (
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 text-white p-3 rounded-xl border border-slate-800">
                          <img 
                            src={rad.images[0].url} 
                            alt={rad.images[0].caption} 
                            className="h-28 max-w-[140px] object-contain rounded bg-black"
                          />
                          <div className="text-xs space-y-1">
                            <span className="text-teal-400 font-mono text-[11px] block">{rad.images[0].viewType} View Attached</span>
                            <strong className="text-slate-100">{rad.images[0].caption}</strong>
                            <p className="text-slate-400 text-[11px]">
                              PACS Archive Direct View · Dose: {rad.radiationDoseMgy ? `${rad.radiationDoseMgy} mGy` : 'Standard Diagnostic'}
                            </p>
                          </div>
                        </div>
                      )}

                      {rad.impression && (
                        <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                          <strong className="text-teal-900 text-[11px] block uppercase font-bold mb-1">
                            Radiologist Diagnostic Impression:
                          </strong>
                          <p className="text-slate-800 leading-relaxed font-sans">{rad.impression}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No imaging reports released to your portal account.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Prescriptions */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-4">Medication & Prescription History</h3>
            
            {patientPrescriptions.length > 0 ? (
              <div className="space-y-4">
                {patientPrescriptions.map(rx => (
                  <div key={rx.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{rx.medicationName}</h4>
                          <span className="text-xs text-slate-500">({rx.genericName})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Prescribed by: <span className="font-medium text-slate-900">{rx.prescribingDoctor}</span>
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                        rx.status === 'DISPENSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {rx.status}
                      </span>
                    </div>

                    <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">Dosage:</span>
                        <span className="font-semibold text-slate-900">{rx.dosage}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Frequency & Duration:</span>
                        <span className="font-semibold text-slate-900">{rx.frequency} ({rx.durationDays} days)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Total Quantity:</span>
                        <span className="font-semibold text-slate-900">{rx.totalQuantity} units</span>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-teal-50/60 rounded-lg border border-teal-200/50 text-xs text-teal-900">
                      <span className="font-semibold">Instructions for Patient: </span>
                      {rx.instructions}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No active or historical prescriptions on file.
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Invoices & Receipts */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-2">Hospital Billing Invoices & Receipts</h3>
            <p className="text-xs text-slate-500 mb-6">
              Itemized charges and verified official cashier receipts in Dual Currency (USD & LRD).
            </p>

            {patientInvoices.length > 0 ? (
              <div className="space-y-6">
                {patientInvoices.map(inv => (
                  <div key={inv.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">Invoice {inv.invoiceNumber}</h4>
                          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                            {inv.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">Date: {inv.date} · Cashier: {inv.createdBy}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-slate-900 block">
                          USD ${inv.totalUSD.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-500">
                          (LRD {inv.totalLRD.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="pt-3">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-100">
                            <th className="py-2">Service Description</th>
                            <th className="py-2">Category</th>
                            <th className="py-2 text-center">Qty</th>
                            <th className="py-2 text-right">Price (USD)</th>
                            <th className="py-2 text-right">Total (USD)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {inv.items.map(item => (
                            <tr key={item.id}>
                              <td className="py-2 font-medium text-slate-800">{item.description}</td>
                              <td className="py-2 text-slate-500">{item.category}</td>
                              <td className="py-2 text-center text-slate-700">{item.quantity}</td>
                              <td className="py-2 text-right text-slate-700">${item.unitPriceUSD.toFixed(2)}</td>
                              <td className="py-2 text-right font-semibold text-slate-900">${item.totalUSD.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Official Receipt Link */}
                    {patientReceipts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">
                          Official Cashier Receipt: <span className="font-mono text-teal-800 font-bold">{patientReceipts[0].receiptNumber}</span>
                        </span>
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" />
                          Payment Reconciled & Audited
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No billing statements generated.
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Telehealth Virtual Care */}
        {activeTab === 'telehealth' && (
          <TelehealthView currentPatient={currentPatient} />
        )}

        {/* Tab 7: Patient Vitals Tracker */}
        {activeTab === 'vitals' && (
          <PatientVitalsTracker
            patient={currentPatient}
            vitalsLogs={db.patientVitalsLogs || []}
          />
        )}

        {/* Tab 8: Care & Medication Calendar */}
        {activeTab === 'calendar' && (
          <CareCalendarView
            patient={currentPatient}
            appointments={patientAppointments}
            prescriptions={patientPrescriptions}
            onOpenAppointmentModal={onOpenAppointmentModal}
          />
        )}

        {/* Tab 9: Digital Consent Forms */}
        {activeTab === 'consent' && (
          <DigitalConsentView
            patient={currentPatient}
            consents={db.digitalConsents || []}
          />
        )}

        {/* Tab 10: Patient Feedback & Ratings */}
        {activeTab === 'feedback' && (
          <PatientFeedbackSection
            patient={currentPatient}
            feedbacks={db.patientFeedbacks || []}
          />
        )}

        {/* Tab 11: Downloadable Hospital Forms */}
        {activeTab === 'forms' && (
          <DownloadableFormsLibrary
            patient={currentPatient}
          />
        )}
      </div>
    </div>
  );
};
