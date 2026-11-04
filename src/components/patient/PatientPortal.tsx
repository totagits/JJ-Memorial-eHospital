import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { PatientVitalsTracker } from './PatientVitalsTracker';
import { DigitalConsent } from './DigitalConsent';
import { PatientCalendarView } from './PatientCalendarView';
import { MedicationScheduleReminders } from './MedicationScheduleReminders';
import { TelehealthModule } from './TelehealthModule';
import { PatientMedicalHistory } from './PatientMedicalHistory';
import { MedicalDocumentUploader } from './MedicalDocumentUploader';
import { DownloadableForms } from './DownloadableForms';
import { SecureLiveChat } from './SecureLiveChat';
import { PatientFeedback } from './PatientFeedback';
import { HelpOnboarding } from './HelpOnboarding';
import {
  User,
  HeartPulse,
  FileCheck,
  Calendar,
  Pill,
  Video,
  History,
  UploadCloud,
  FileText,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  Shield,
  Activity
} from 'lucide-react';

interface PatientPortalProps {
  onGoHome: () => void;
  onGoStaff: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ onGoHome, onGoStaff }) => {
  const patients = dbStore.getPatients();
  const currentPatient = patients[0] || {
    id: 'pat-1',
    mrn: 'JJM-2026-0042',
    name: 'Korto Kollie',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    phone: '+231 77 012 3456',
    county: 'Montserrado',
    insuranceProvider: 'NASSCORP Healthcare Plan',
  };

  const [activeTab, setActiveTab] = useState<
    'overview' | 'vitals' | 'consent' | 'calendar' | 'meds' | 'telehealth' | 'history' | 'uploader' | 'forms' | 'chat' | 'feedback'
  >('overview');

  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Patient Profile Header Banner */}
      <div className="bg-gradient-to-r from-hospital-navy via-slate-900 to-hospital-navy text-white px-4 sm:px-8 py-6 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border-2 border-teal-400 text-teal-300 flex items-center justify-center font-extrabold text-xl shadow-inner">
              {currentPatient.name.split(' ').map((n) => n[0]).join('')}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {currentPatient.name}
                </h1>
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-600/50">
                  MRN: {currentPatient.mrn}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-600/50">
                  Blood: {currentPatient.bloodGroup}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span>{currentPatient.phone}</span>
                <span>&bull;</span>
                <span>{currentPatient.insuranceProvider}</span>
                <span>&bull;</span>
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Allergies: {currentPatient.allergies.join(', ') || 'NKDA'}
                </span>
              </div>
            </div>
          </div>

          {/* Action pills & Tutorial button */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setShowTutorial(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-xs uppercase tracking-wider border border-teal-500/40 transition shadow-sm"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Interactive Tour</span>
            </button>

            <button
              onClick={onGoHome}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              Public Site
            </button>

            <button
              onClick={onGoStaff}
              className="px-3.5 py-2 rounded-xl bg-hospital-navy-light hover:bg-slate-700 text-teal-400 font-semibold text-xs border border-teal-600/40 transition"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'vitals'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>Vitals Tracker (Recharts)</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Month Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('consent')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'consent'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Digital Consent</span>
            </button>

            <button
              onClick={() => setActiveTab('meds')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'meds'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Medication Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('telehealth')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'telehealth'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Telehealth Video</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Medical History</span>
            </button>

            <button
              onClick={() => setActiveTab('uploader')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'uploader'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Doc Uploader</span>
            </button>

            <button
              onClick={() => setActiveTab('forms')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'forms'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Forms Library</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Live Staff Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'feedback'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Feedback</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveTab('vitals')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md cursor-pointer transition flex items-center space-x-4"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Log Daily Vitals</h4>
                  <p className="text-xs text-slate-500">Record BP & glucose with Recharts trends</p>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('consent')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md cursor-pointer transition flex items-center space-x-4"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Sign Digital Consents</h4>
                  <p className="text-xs text-slate-500">Cryptographic canvas legal signature</p>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('telehealth')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md cursor-pointer transition flex items-center space-x-4"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Virtual Consultations</h4>
                  <p className="text-xs text-slate-500">Book future slots & enter video rooms</p>
                </div>
              </div>
            </div>

            {/* Visual Calendar View (#11) */}
            <PatientCalendarView />

            {/* Vitals Tracker Snapshot (#7) */}
            <PatientVitalsTracker patientId={currentPatient.id} />
          </div>
        )}

        {activeTab === 'vitals' && (
          <PatientVitalsTracker patientId={currentPatient.id} />
        )}

        {activeTab === 'calendar' && (
          <PatientCalendarView />
        )}

        {activeTab === 'consent' && (
          <DigitalConsent
            patientId={currentPatient.id}
            patientName={currentPatient.name}
            mrn={currentPatient.mrn}
          />
        )}

        {activeTab === 'meds' && (
          <MedicationScheduleReminders />
        )}

        {activeTab === 'telehealth' && (
          <TelehealthModule />
        )}

        {activeTab === 'history' && (
          <PatientMedicalHistory patientId={currentPatient.id} />
        )}

        {activeTab === 'uploader' && (
          <MedicalDocumentUploader patientId={currentPatient.id} />
        )}

        {activeTab === 'forms' && (
          <DownloadableForms />
        )}

        {activeTab === 'chat' && (
          <SecureLiveChat
            patientId={currentPatient.id}
            patientName={currentPatient.name}
          />
        )}

        {activeTab === 'feedback' && (
          <PatientFeedback patientName={currentPatient.name} />
        )}
      </main>

      {/* Interactive Guided Tour Modal (#27) */}
      <HelpOnboarding
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onNavigateToTab={(tab: string) => setActiveTab(tab as any)}
      />
    </div>
  );
};
